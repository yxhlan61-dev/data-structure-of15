import { arrayGraph, needs, toItems } from './shared.js';

export const sampleTree = ['A','B','C','D','E',null,'F'];

const orders = {pre:'前序',in:'中序',post:'后序',level:'层序'};
export const traversalConfig = {
    title:'自定义二叉树', default:{nodes:sampleTree.map(x=>x??'#').join(', '),order:'in'},
    fields:[['nodes','层序数组'],['order','遍历方式',Object.entries(orders)]],
    help:'按数组下标输入，逗号分隔。空位填 #，例如 A, B, C, D, E, #, F。最多 31 个槽、15 个结点。',
    stage:'遍历过程'
};
export function traversal(data) {
    const values=toItems(data.nodes).map(s=>s==='#'?null:s);
    needs(values.length>0&&values.length<=31,'请输入 1–31 个槽位。');
    const graph=arrayGraph(values);
    needs(graph.nodes.length<=15 && graph.nodes.every(n=>[...n.label].length<=4),'最多支持 15 个结点，每个结点名最多 4 个字符。');
    needs(graph.edges.every(e=>values[e.from]!==null),'非空结点不能挂在空双亲下，请保留正确的数组槽位。');
    const order=Object.hasOwn(orders,data.order)?data.order:'in';
    const code=order==='level'
        ? ['根结点入队','当队列非空','    队首出队并访问','    非空左孩子入队','    非空右孩子入队','返回遍历序列']
        : ['遍历(结点)','    若为空，直接返回',...(order==='pre'?['    访问根','    遍历左子树','    遍历右子树']:order==='in'?['    遍历左子树','    访问根','    遍历右子树']:['    遍历左子树','    遍历右子树','    访问根']),'    返回上一级'];
    const output=[], visited=[], frames=[], stack=[], queue=[];
    const names=list=>list.map(i=>values[i]);
    function mark(line,explanation,active=[],now) {
        frames.push({graph,line,explanation,active,now,visited:[...visited],output:[...output],detailTitle:order==='level'?'队列（队首在左）':'调用栈（栈顶在右）',items:names(order==='level'?queue:stack)});
    }
    const present=id=>values[id]!==null&&values[id]!==undefined;
    mark(null,`准备执行${orders[order]}遍历。先观察树的结构。`);
    function visit(id,line) {
        output.push(values[id]);
        visited.push(id);
        mark(line,`访问 ${values[id]}，将其写入遍历序列。`,[id],id);
    }
    if (order==='level' && present(0)) {
        queue.push(0); mark(0,`根结点 ${values[0]} 入队。`,[0]);
        while (queue.length) {
            const id=queue.shift();
            visit(id,2);
            for (const [i,side] of [[1,'左'],[2,'右']]) {
                const child=2*id+i;
                if (!present(child)) continue;
                queue.push(child);
                mark(2+i,`${values[child]} 是 ${values[id]} 的${side}孩子，加入队尾。`,[id,child]);
            }
        }
    } else if (order!=='level') {
        const visitLine={pre:2,in:3,post:4}[order];
        const leftLine=order==='pre'?3:2;
        const rightLine=order==='post'?3:4;
        function dfs(id) {
            if (!present(id)) {
                mark(1,'遇到空子树，直接返回。',stack.slice(-1));
                return;
            }
            stack.push(id);
            mark(0,`进入 ${values[id]} 的调用。这一步保留当前栈帧。`,[id]);
            if (order==='pre') visit(id,visitLine);
            mark(leftLine,`从 ${values[id]} 向左递归。`,[id]);
            dfs(id*2+1);
            if (order==='in') visit(id,visitLine);
            mark(rightLine,`从 ${values[id]} 向右递归。`,[id]);
            dfs(id*2+2);
            if (order==='post') visit(id,visitLine);
            stack.pop();
            mark(5,`处理完 ${values[id]}，弹出它的栈帧。`,stack.slice(-1));
        }
        dfs(0);
    }
    mark(5,`遍历完成，共访问 ${output.length} 个结点。`);
    return {code,frames,outputLabel:'访问序列'};
}
