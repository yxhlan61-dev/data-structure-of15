import { esc, icon } from './dom.js';

const block = code => `<pre><code>${esc(code)}</code></pre>`;

function codeSections(code, exampleTitle) {
    return `${code.steps.map(step=>`<hr><section><h2>${step.title}</h2><p>${step.reasoning}</p>${block(step.code)}<div class="example"><strong>${exampleTitle}</strong><p>${step.trace}</p></div></section>`).join('')}
      <hr><details><summary>展开完整的 C 程序</summary>${block([code.declarations,...code.steps.map(step=>step.code),code.driver].join('\n\n'))}</details>`;
}

export function codePage(chapter, id) {
    if(chapter.lessons) {
        const lesson=chapter.lessons.find(x=>x.id===id)||chapter.lessons[0];
        return `<div class="title-row"><div><div class="eyebrow">第 ${chapter.number} 章 · ${chapter.title}</div><h1>重点代码整理</h1><p>${lesson.description}</p></div></div><nav class="lab-tabs" aria-label="代码例题">${chapter.lessons.map(x=>`<a class="chip" href="#code/${chapter.number}/${x.id}" ${x===lesson?'aria-current="page"':''}>${x.title}</a>`).join('')}</nav><div class="learn-grid"><article class="panel article"><h2>${lesson.title}</h2><h3>公共声明</h3>${block(lesson.declarations)}${codeSections(lesson,'边界与手推')}</article><aside class="learn-aside"><div class="panel note tinted"><h2>复杂度</h2><p>${lesson.complexity}</p></div><div class="panel note"><h2>手写检查清单</h2><ul><li>先写函数签名、下标和空值约定。</li><li>判空满与边界后再读写。</li><li>检查循环是否严格推进。</li><li>动态结构维护入口并释放内存。</li><li>写明前提、时间与辅助空间。</li></ul><a class="secondary" href="#chapter/${chapter.number}/lab">关联算法实验</a></div></aside></div>`;
    }
    return treeCodePage(chapter,id);
}
function treeCodePage(chapter, id) {
    const { number, code, heapCode } = chapter;
    const onHeap = id === 'heap';
    const lesson = onHeap ? heapCode : code;
    const header = `<div class="title-row"><div><div class="eyebrow">第 ${number} 章 · ${chapter.title}</div><h1>重点代码整理</h1><p>${lesson.description}</p></div><a class="secondary" href="${onHeap?'#lab/heap':'#lab/traversal'}">${icon('play')}${onHeap?'查看堆调整动画':'查看遍历动画'}</a></div>
      <nav class="lab-tabs" aria-label="代码例题"><a class="chip" href="#code"${onHeap?'':' aria-current="page"'}>${code.title}</a><a class="chip" href="#code/heap"${onHeap?' aria-current="page"':''}>${heapCode.title}</a></nav>`;
    if (onHeap) return `${header}
      <div class="learn-grid"><article class="panel article"><h2>${heapCode.title}</h2>
      <p>用从 0 开始的数组保存完全二叉树。根在下标 0，下标 <code>i</code> 的左、右孩子分别为 <code>2*i+1</code> 和 <code>2*i+2</code>。<code>n</code> 是有效元素个数，<code>capacity</code> 是底层数组容量。</p>
      <p>插入和删除都假设有效区间已经满足最大堆性质，允许重复值和负值。传入有效的计数指针和输出指针。建堆可以接收任意排列的数组。</p>
      <h3>公共声明与交换函数</h3>${block(heapCode.declarations)}
      ${codeSections(heapCode, '手推例子')}</article>
      <aside class="learn-aside"><div class="panel note tinted"><h2>手写检查清单</h2><ul><li>上滤先判断当前结点是否为根。</li><li>下滤先检查右孩子是否存在，再选较大的孩子。</li><li>删除前先保存堆顶，只有一个元素时直接变成空堆。</li><li>建堆从最后一个非叶结点开始，逐个下滤。</li></ul></div>
      <div class="panel note"><h2>复杂度</h2><p>插入和删除堆顶最坏 O(log n)，自底向上建堆 O(n)。这些迭代操作的辅助空间为 O(1)。</p><a class="secondary" href="#ch06-heap">${icon('book')}复习二叉堆</a></div></aside></div>`;
    return `${header}
      <div class="learn-grid"><article class="panel article"><h2>${code.title}</h2>
      <p>本届考试涉及这一题型。以下写法假设输入为二叉链表，空孩子用 <code>NULL</code> 表示。每个函数成功返回 1，容量不足返回 0，此时可能已有部分输出。</p>
      <h3>公共结点与访问函数</h3>${block(code.declarations)}
      ${codeSections(code, '用动画默认树手推')}</article>
      <aside class="learn-aside"><div class="panel note tinted"><h2>手写检查清单</h2><ul><li>栈保存结点指针，<code>top</code> 表示元素个数。</li><li>前序在入栈前访问，中序在出栈后访问。</li><li>后序先看栈顶，用 <code>last</code> 记录上次输出的指针。</li><li>层序先入左孩子，再入右孩子。</li></ul></div>
      <div class="panel note"><h2>复杂度与边界</h2><p>四种遍历时间均为 O(n)。按所需容量计，深度优先栈随树高增长，层序队列随最大层宽增长。示例用容量为 100 的数组处理考试小规模输入。</p><a class="secondary" href="#ch06-traversal">${icon('book')}复习遍历与重建</a></div></aside></div>`;
}
