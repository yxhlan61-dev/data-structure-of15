import { config, trace, row, needs } from './course-shared.js';
import { common, parseGraph } from './graphs.js';

export const criticalPathConfig=config('AOE 网与关键路径', {...common,directed:'yes'},
    [['vertices','事件顶点（空格分隔）'],['edges','活动 起点:终点:工期，逗号分隔']],
    '顶点表示事件，弧表示活动。工期为非负整数，图必须无环；默认 A..H 八个事件、十项活动，H 为孤立事件。支持多源、多汇及多条关键路径。',
    [['多条关键路径',{vertices:'A B C D E F G H',edges:'A:B:3,A:C:3,B:D:2,C:D:2,D:E:4,D:F:2,E:G:1,F:G:3'}],
     ['零工期活动',{vertices:'A B C H',edges:'A:B:0,B:C:2,A:C:2'}],
     ['课件做饭示例',{vertices:'A B C',edges:'A:B:10,B:C:10,A:C:30'}]]);

export function criticalPath(data) {
    const g=parseGraph({...data,directed:'yes'}), {n,names,edges}=g;
    needs(edges.every(e=>e.weight>=0),'AOE 活动工期不能为负数。');
    const incoming=Array(n).fill(0),outgoing=Array(n).fill(0),level=Array(n).fill(0);
    for(const e of edges){incoming[e.v]++;outgoing[e.u]++;}
    const indeg=[...incoming],queue=names.flatMap((_,i)=>indeg[i]===0?[i]:[]),order=[];
    while(queue.length){const u=queue.shift();order.push(u);for(const e of edges.filter(e=>e.u===u)){level[e.v]=Math.max(level[e.v],level[u]+1);if(--indeg[e.v]===0)queue.push(e.v);}}
    needs(order.length===n,'AOE 网必须是有向无环图；当前图存在环，无法计算关键路径。');
    const t=trace(['按拓扑顺序推进 ET，取所有前驱到达时间的最大值',
        '总工期 T=max(所有汇点的 ET)，LT 初始为 T',
        '逆拓扑回推 LT，取所有后继约束的最小值',
        '活动 ES=ET[u]，LS=LT[v]−工期，机动时间=LS−ES',
        'ES=LS 的活动为关键活动，列出所有完整关键路径'],'工期与关键路径');
    const et=Array(n).fill(0),lt=Array(n).fill(null),activities=[],critical=new Set();
    const groups=new Map();for(const i of order){if(!groups.has(level[i]))groups.set(level[i],[]);groups.get(level[i]).push(i);}
    const maxLevel=Math.max(1,...level),coordinates=new Map();
    for(const [l,group] of groups)group.forEach((v,k)=>coordinates.set(v,[55+l*480/maxLevel,55+(k+1)*290/(group.length+1)]));
    const isolated=order.filter(v=>!incoming[v]&&!outgoing[v]);
    isolated.forEach((v,k)=>coordinates.set(v,[55+(k+1)*480/(isolated.length+1),365]));
    function mark(explanation,line,active=[],output=[]) {
        t.mark(explanation,[],output,line,{active,
            network:{directed:true,nodes:names.map((label,id)=>({id,label,x:coordinates.get(id)[0],y:coordinates.get(id)[1],detail:`ET ${et[id]} / LT ${lt[id]??'·'}`})),
                edges:edges.map((e,i)=>({from:e.u,to:e.v,label:`a${i}:${e.weight}`,selected:critical.has(i)}))},
            tables:[{title:'事件时间',heads:['事件',...names],rows:[['ET（最早）',...et],['LT（最晚）',...lt.map(x=>x??'·')]]},
                {title:'活动时间与机动时间',heads:['活动','弧','工期','ES','LS','机动','关键'],rows:edges.map((e,i)=>{const a=activities[i];return [`a${i}`,`${names[e.u]}→${names[e.v]}`,e.weight,a?.es??'·',a?.ls??'·',a?.slack??'·',a?(a.slack===0?'是':'否'):'·'];})}],
            detail:`拓扑序：${order.map(i=>names[i]).join(' → ')}。孤立事件不构成活动路径；多源/多汇按统一项目开始和完成时刻计算。`});
    }
    mark('先确认无环并求拓扑序，所有源事件 ET=0。',0);
    for(const u of order)for(let i=0;i<edges.length;i++) {
        const e=edges[i];if(e.u!==u)continue;
        const old=et[e.v],candidate=et[u]+e.weight;et[e.v]=Math.max(old,candidate);
        mark(`活动 a${i} ${names[u]}→${names[e.v]}：ET[${names[e.v]}]=max(${old},${et[u]}+${e.weight})=${et[e.v]}。`,0,[u,e.v]);
    }
    const duration=Math.max(...et);lt.fill(duration);
    mark(`总工期 T=${duration}；所有 LT 初始为 T，再按逆拓扑顺序施加约束。`,1,[],[`总工期 ${duration}`]);
    for(const u of [...order].reverse())for(let i=0;i<edges.length;i++) {
        const e=edges[i];if(e.u!==u)continue;
        const old=lt[u],candidate=lt[e.v]-e.weight;lt[u]=Math.min(old,candidate);
        mark(`活动 a${i}：LT[${names[u]}]=min(${old},${lt[e.v]}−${e.weight})=${lt[u]}。`,2,[u,e.v]);
    }
    edges.forEach((e,i)=>{
        const es=et[e.u],ls=lt[e.v]-e.weight,slack=ls-es;activities[i]={es,ls,slack};if(slack===0)critical.add(i);
        mark(`a${i}：ES=${es}，LS=${lt[e.v]}−${e.weight}=${ls}，机动时间=${slack}；${slack===0?'为关键活动':'可在机动时间内延后'}。`,3,[e.u,e.v]);
    });
    const paths=[];
    function walk(u,path){const next=edges.flatMap((e,i)=>e.u===u&&critical.has(i)?[e.v]:[]);if(!outgoing[u]){if(path.length>1&&et[u]===duration)paths.push(path.map(i=>names[i]).join(' → '));return;}for(const v of next)walk(v,[...path,v]);}
    for(let v=0;v<n;v++)if(!incoming[v]&&outgoing[v]&&et[v]===lt[v])walk(v,[v]);
    mark(`计算完成：总工期 ${duration}，${critical.size} 项关键活动，${paths.length} 条完整关键路径。${edges.length?'关键路径按活动工期之和的最长路径判定。':'图中没有活动。'}`,4,[],[`总工期 ${duration}`,...paths]);
    return {...t.finish(),duration,et,lt,activities,paths};
}
