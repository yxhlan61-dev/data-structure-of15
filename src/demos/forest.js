import { fmt } from './shared.js';

export const forestConfig = {
    title:'设置转换方向',default:{direction:'encode',preset:'example'},
    fields:[['direction','转换方向',[['encode','森林转二叉树'],['decode','二叉树还原森林']]],['preset','示例',[['example','双树森林'],['wide','多兄弟与三棵树']]]],
    help:'左侧保留森林结构，右侧展示左孩子、右兄弟表示。',stage:'森林与二叉表示'
};
export function forest(data) {
    const parent=(id,children=[])=>({id,children});
    const roots=data.preset==='wide'?[parent('A',[parent('B'),parent('C'),parent('D',[parent('E')])]),parent('F'),parent('G')]:[parent('A',[parent('B'),parent('C',[parent('D')])]),parent('E',[parent('F')])];
    const nodes=[], original=[], converted=[], operations=[], pre=[], inside=[];
    function collect(level,isRoot=false) {
        level.forEach((node,i)=>{
            const {id,children}=node;
            nodes.push({id,label:id}); pre.push(id);
            if (children.length) {
                children.forEach(({id:to})=>original.push({from:id,to,slot:'general'}));
                const to=children[0].id;
                converted.push({from:id,to,slot:'left',label:'左'});
                operations.push({line:1,from:id,to,text:`${id} 的首个孩子 ${to}`});
            }
            if (i+1<level.length) {
                const to=level[i+1].id;
                converted.push({from:id,to,slot:'right',label:'右'});
                operations.push({line:isRoot?3:2,from:id,to,text:`${id} 与 ${to} 是${isRoot?'相邻树根':'相邻兄弟'}`});
            }
            collect(children);
            inside.push(id);
        });
    }
    collect(roots,true);
    const reverse=data.direction==='decode';
    const code=reverse?['读入左孩子、右兄弟表示','沿左指针取得首个孩子','沿右链收集其他孩子','沿根的右链拆成多棵树','输出还原后的森林']:
        ['读入有序森林','用左指针连接首个孩子','用右指针连接相邻兄弟','用右指针串联各棵树根','输出二叉表示和遍历顺序'];
    const binary={nodes,edges:converted}, source={nodes,edges:original};
    const frames=[], shown=[];
    function mark(line,explanation,active=[],output=[]) {
        const shownEdges=reverse?original.filter(e=>shown.includes(e.to)).map(e=>`${e.from}:${e.to}`):[];
        const primary=reverse?{shownEdges,active}:{active};
        const secondary=reverse?{active}:{shownEdges:[...shown],active};
        frames.push({graph:source,forestGraph:binary,primary,secondary,line,explanation,active,output,detailTitle:'当前关联结点',items:active});
    }
    mark(0,reverse?'从右侧二叉表示出发，在左侧还原森林。':'从左侧森林出发，在右侧建立左孩子、右兄弟指针。');
    operations.forEach(op=>{
        if (reverse) shown.push(op.to);
        else shown.push(`${op.from}:${op.to}`);
        mark(op.line,`${op.text}。${code[op.line]}。`,[op.from,op.to]);
    });
    mark(4,'转换完成。对照森林与二叉表示的遍历结果。',[],[`先序 ${fmt(pre)}`,`中序 ${fmt(inside)}`]);
    return {code,frames,outputLabel:'遍历对照'};
}
