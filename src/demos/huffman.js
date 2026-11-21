import { needs, toItems } from './shared.js';

export const huffmanExampleWeights = 'A:28, B:10, C:11, D:7, E:4';

export const huffmanConfig = {
    title:'设置符号与频数',default:{weights:huffmanExampleWeights},
    fields:[['weights','符号:频数']],
    help:'用逗号或空格分隔，例如 A:5, B:3。允许 1–7 个互异符号，频数为 1–9999。',
    presets:[['2022 A 卷频数',{}]],
    stage:'候选树与合并'
};
export function huffman(data) {
    const tokens=toItems(data.weights), leaves=tokens.map(item=>{
        const pair=item.split(/[:：]/u), weight=Number(pair[1]);
        needs(pair.length===2&&[...pair[0]].length>=1&&[...pair[0]].length<=3&&/^\d+$/.test(pair[1])&&weight>=1&&weight<=9999,'使用“符号:频数”，符号最多 3 个字符，频数为 1–9999。');
        return {symbol:pair[0],weight};
    });
    needs(leaves.length>=1&&leaves.length<=7&&new Set(leaves.map(x=>x.symbol)).size===leaves.length,'请输入 1–7 个互异符号。');
    let nextId=0, total=0;
    const q=leaves.map(leaf=>({...leaf,id:nextId++}));
    const frames=[], graph={nodes:q.map(node=>({id:node.id,label:`${node.symbol}:${node.weight}`})),edges:[]};
    const code=['按权重准备所有叶子','取出候选中最轻的两棵树','将两棵树合成新根，权重相加','把新树加入候选集合','沿左 0、右 1 生成码字'];
    const sort=()=>q.sort((a,b)=>a.weight-b.weight||a.id-b.id);
    sort();
    function mark(line,explanation,active=[],output=[]) {
        frames.push({graph:{nodes:[...graph.nodes],edges:[...graph.edges]},line,explanation,active,output,detailTitle:'候选根权重（升序）',items:q.map(n=>n.weight),detail:`已合并的权重和：${total}`});
    }
    mark(0,'给每个符号建立一个叶结点，按权重排列候选树。');
    while(q.length>1) {
        const l=q.shift(),r=q.shift(),weight=l.weight+r.weight;
        mark(1,`取出最轻的两棵树，权重分别为 ${l.weight} 和 ${r.weight}。`,[l.id,r.id]);
        const root={id:nextId++,weight,l,r};
        total+=weight;
        graph.nodes.push({id:root.id,label:weight});
        graph.edges.push({from:root.id,to:l.id,slot:'left',label:'0'},{from:root.id,to:r.id,slot:'right',label:'1'});
        mark(2,`新根权重为 ${l.weight} + ${r.weight} = ${weight}，左边记 0，右边记 1。`,[root.id]);
        q.push(root); sort();
        mark(3,`将权重 ${weight} 的新树放回候选集合。`,[root.id]);
    }
    const codes=new Map();
    function visit(node,path) {
        if (!node.l) { codes.set(node.symbol,path||'0'); return; }
        visit(node.l,`${path}0`);
        visit(node.r,`${path}1`);
    }
    visit(q[0],'');
    const bits=leaves.reduce((sum,n)=>sum+n.weight*codes.get(n.symbol).length,0);
    mark(4,leaves.length===1?`单符号码字约定为 0，有效码流为 ${bits} bit，树的 WPL 为 0。`:`构造完成。WPL = ${total}，有效码流为 ${bits} bit。`,[],leaves.map(n=>`${n.symbol} → ${codes.get(n.symbol)}`));
    return {code,frames,outputLabel:'前缀编码'};
}
