import { arrayGraph, needs, toItems } from './shared.js';

export const heapConfig = {
    title:'设置堆实验', default:{nodes:'4, 10, 3, 5, 1, 8',type:'max',operation:'build',value:'12'},
    fields:[['nodes','原始数组'],['type','堆类型',[['max','最大堆'],['min','最小堆']]],['operation','操作',[['build','自底向上建堆'],['insert','在初始堆中插入'],['pop','删除初始堆的堆顶']]],['value','插入值（仅插入时使用）']],
    help:'建堆可输入任意整数数组。插入或删除时，原始数组须已满足所选堆序。最多 12 个整数。',
    presets:[['建堆示例',{}],['插入示例',{nodes:'10, 5, 8, 4, 1, 3',operation:'insert'}],['删除示例',{nodes:'10, 5, 8, 4, 1, 3',operation:'pop'}]],
    stage:'堆的树形与数组'
};
export function heap(data) {
    const raw=toItems(data.nodes), a=raw.map(Number), min=data.type==='min';
    needs(raw.length>0&&raw.length<=12&&raw.every((s,i)=>/^[+-]?\d+$/.test(s)&&Math.abs(a[i])<=999),'请输入 1–12 个 −999 到 999 之间的整数。');
    const better=(x,y)=>min?x<y:x>y;
    const type=min?'最小堆':'最大堆';
    const action=data.operation;
    const frames=[];
    const code=['初始化数组','定位待调整结点','    比较父子，选出交换目标','    交换并继续调整','返回满足堆序的数组'];
    function mark(line,explanation,active=[]) {
        frames.push({graph:arrayGraph(a),line,explanation,active,array:[...a],output:[...a],detailTitle:'当前下标',items:active});
    }
    mark(null, `原始数组将按${type}规则调整。`);
    function down(root) {
        while (root*2+1<a.length) {
            const l=root*2+1, r=l+1, child=r<a.length&&better(a[r],a[l])?r:l;
            mark(2,`比较父结点 ${a[root]} 和候选孩子 ${a[child]}。`,[root,child]);
            if (!better(a[child],a[root])) break;
            [a[root],a[child]]=[a[child],a[root]];
            mark(3,`交换数组下标 ${root} 与 ${child}，继续检查下方。`,[root,child]);
            root=child;
        }
    }
    if (action==='build') {
        for (let i=Math.floor(a.length/2)-1;i>=0;i--) {
            mark(1,`从下标 ${i} 开始下滤。`,[i]);
            down(i);
        }
    } else {
        needs(a.every((v,i)=>i===0||!better(v,a[Math.floor((i-1)/2)])),`插入和删除须从一个有效${type}开始。可点选示例。`);
        if (action==='insert') {
            const value=Number(data.value);
            needs(/^[+-]?\d+$/.test(data.value.trim())&&Math.abs(value)<=999&&a.length<12,'请输入合法插入值，并为新结点留出位置。');
            a.push(value);
            let i=a.length-1;
            mark(1,`将 ${value} 写入数组末尾。`,[i]);
            while (i>0) {
                const par=Math.floor((i-1)/2);
                mark(2,`比较 ${a[i]} 与双亲 ${a[par]}。`,[i,par]);
                if (!better(a[i],a[par])) break;
                [a[i],a[par]]=[a[par],a[i]];
                mark(3,`交换下标 ${i} 和 ${par}，继续向上。`,[i,par]);
                i=par;
            }
        } else {
            const top=a[0],last=a.pop();
            if (a.length) a[0]=last;
            mark(1,a.length?`删除堆顶 ${top}，把末元素 ${last} 补到根。`:`删除唯一结点 ${top}，堆已空。`,a.length?[0]:[]);
            down(0);
        }
    }
    mark(4,`调整完成。${a.length?`当前堆顶为 ${a[0]}。`:'当前是空堆。'}`);
    return {code,frames,outputLabel:'堆数组'};
}
