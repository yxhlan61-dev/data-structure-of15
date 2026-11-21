import { esc, icon } from './dom.js';

const block = code => `<pre><code>${esc(code)}</code></pre>`;

export function codePage(chapter) {
    const { number, code } = chapter;
    return `<div class="title-row"><div><div class="eyebrow">第 ${number} 章 · ${chapter.title}</div><h1>重点代码整理</h1><p>${code.description}</p></div><a class="secondary" href="#lab/traversal">${icon('play')}查看遍历动画</a></div>
      <div class="learn-grid"><article class="panel article"><h2>${code.title}</h2>
      <p>本届考试涉及这一题型。以下写法假设输入为二叉链表，空孩子用 <code>NULL</code> 表示。每个函数成功返回 1，容量不足返回 0，此时可能已有部分输出。</p>
      <h3>公共结点与访问函数</h3>${block(code.declarations)}
      ${code.steps.map(step=>`<hr><section><h2>${step.title}</h2><p>${step.reasoning}</p>${block(step.code)}<div class="example"><strong>用动画默认树手推</strong><p>${step.trace}</p></div></section>`).join('')}
      <hr><details><summary>展开完整可编译的 C 程序</summary>${block([code.declarations,...code.steps.map(step=>step.code),code.driver].join('\n\n'))}</details></article>
      <aside class="learn-aside"><div class="panel note tinted"><h2>手写检查清单</h2><ul><li>栈保存结点指针，<code>top</code> 表示元素个数。</li><li>前序在入栈前访问，中序在出栈后访问。</li><li>后序先看栈顶，用 <code>last</code> 记录上次输出的指针。</li><li>层序先入左孩子，再入右孩子。</li></ul></div>
      <div class="panel note"><h2>复杂度与边界</h2><p>四种遍历时间均为 O(n)。按所需容量计，深度优先栈随树高增长，层序队列随最大层宽增长。示例用容量为 100 的数组处理考试小规模输入。</p><a class="secondary" href="#ch06-traversal">${icon('book')}复习遍历与重建</a></div></aside></div>`;
}
