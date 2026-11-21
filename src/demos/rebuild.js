import { fmt, needs, toItems } from './shared.js';

export const rebuildConfig = {
    title:'输入遍历序列',default:{mode:'pre',order:'A B D E C F',inorder:'D B E A C F'},
    fields:[['mode','已知序列',[['pre','前序 + 中序'],['post','后序 + 中序']]],['order','前序或后序'],['inorder','中序']],
    help:'序列用空格或逗号分隔。两个序列应含相同的互异结点，最多 12 个。',
    presets:[['前序示例',{}],['后序示例',{mode:'post',order:'D E B F C A'}]],
    stage:'逐步重建'
};
export function rebuild(data) {
    const seq=toItems(data.order), mid=toItems(data.inorder);
    needs(seq.length>0&&seq.length<=12&&seq.every(x=>[...x].length<=4),'请输入 1–12 个结点，每个结点名最多 4 个字符。');
    needs(seq.length===mid.length&&new Set(seq).size===seq.length&&new Set(mid).size===mid.length&&mid.every(x=>seq.includes(x)),'两个序列必须包含相同的互异结点。');
    const post=data.mode==='post', graph={nodes:[],edges:[]}, frames=[];
    const code=[`取${post?'后序末项':'前序首项'}为根`,'在中序定位根','按左右长度分配序列','递归建立左子树','递归建立右子树','返回已建好的树'];
    function mark(line,explanation,active=[],items=[]) {
        const copy={nodes:[...graph.nodes],edges:[...graph.edges]};
        frames.push({graph:copy,line,explanation,active,detailTitle:'当前中序区间',items,output:copy.nodes.map(n=>n.label)});
    }
    mark(null,'两个序列准备完毕。先确定整棵树的根。',[],mid);
    function add(part,range,parent,slot) {
        if (!part.length) return;
        const id=post?part.at(-1):part[0];
        const cut=range.indexOf(id);
        needs(cut>=0,'两个输入序列无法还原出同一棵二叉树，请检查顺序。');
        const left=range.slice(0,cut), right=range.slice(cut+1);
        const children=post?part.slice(0,-1):part.slice(1);
        graph.nodes.push({id,label:id});
        if(parent!==null) graph.edges.push({from:parent,to:id,slot});
        mark(0,`${post?'后序最后':'前序最先'}的 ${id} 是当前子树的根。`,[id],range);
        mark(1,`在中序区间找到 ${id}。它的位置是当前区间的第 ${cut+1} 项。`,[id],range);
        mark(2,`左区间：${fmt(left)}。右区间：${fmt(right)}。`,[id],range);
        if (left.length) mark(3,`继续建立 ${id} 的左子树。`,[id],left);
        add(children.slice(0,cut),left,id,'left');
        if (right.length) mark(4,`继续建立 ${id} 的右子树。`,[id],right);
        add(children.slice(cut),right,id,'right');
    }
    add(seq,mid,null,null);
    mark(5,`树已重建，根结点为 ${graph.nodes[0].label}。`,[],mid);
    return {code,frames,outputLabel:'已建立的结点'};
}
