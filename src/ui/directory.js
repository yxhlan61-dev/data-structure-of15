import { chapters } from '../chapters/course.js';
import { icon } from './dom.js';
import { practiceTemplates } from '../questions/bank.js';
import { practiceStats } from './practice.js';

export function directoryPage(module='knowledge',learned=[]) {
    const lab=module==='lab',code=module==='code';
    const title=lab?'算法可视化目录':code?'重点代码目录':'课程目录';
    const available=chapters.filter(c=>lab?c.demos.length:code?c.lessons?.length!==0:true);
    return `<div class="title-row"><div><div class="eyebrow">数据结构复习平台 · 全站总览</div><h1>${title}</h1><p>${lab?'按章节选择交互实验，用单步推演理解算法过程。':code?'按章节查阅常考代码、实现讲解与复杂度。':'从九个章节开始复习，也可直接进入算法实验或重点代码。学习进度会保存在此浏览器。'}</p></div></div>
      <section aria-label="学习内容总览" class="directory-summary">${[['knowledge','基础知识库','book',chapters.reduce((n,c)=>n+c.topics.length,0)+' 个知识主题'],['lab','算法可视化','lab',chapters.reduce((n,c)=>n+c.demos.length,0)+' 个交互实验'],['code','重点代码整理','grid',chapters.reduce((n,c)=>n+(c.lessons?.length??2),0)+' 个代码单元'],['papers','真题汇总','book','2022 原卷 · 22 题及解答'],['practice','模拟题库训练','grid',practiceTemplates.length+' 道题 · 概念与应用']].map(([kind,label,symbol,total])=>`<a class="panel note${module===kind?' tinted':''}" href="${kind==='papers'?'#papers':kind==='practice'?'#practice':'#directory'+(kind==='knowledge'?'':'/'+kind)}" ${module===kind?'aria-current="page"':''}>${icon(symbol)}<h2>${label}</h2><p>${total}</p></a>`).join('')}</section>
      <p class="quiz-home-stats">题库已评 ${practiceStats().graded} 次 · 全对率 ${practiceStats().rate}% · 待复习 ${practiceStats().pending} 个变式 <a href="#practice/history">查看答题记录</a></p><section aria-labelledby="directory-chapters"><div class="section-head"><div><h2 id="directory-chapters">${lab?'选择实验章节':code?'选择代码章节':'全部课程章节'}</h2><p>${lab||code?'点击卡片进入对应章节。':'每章均提供三个模块入口，便于快速找到需要的内容。'}</p></div><span class="meta">${available.length} 个章节</span></div>
      <div class="topic-grid">${available.map(c=>{
          const done=c.topics.filter(t=>learned.includes(t.id)).length;
          return `<article class="topic-card directory-card"><a class="directory-chapter" href="#chapter/${c.number}${lab?'/lab':code?'/code':''}"><div class="topic-top"><span class="topic-icon tone-blue">${icon(lab?'lab':code?'grid':'book')}</span><span class="topic-num mono">第 ${c.number} 章</span></div><h3>${c.title}</h3><p>${c.topics.length} 个主题 · ${c.demos.length} 个实验 · ${c.lessons?.length??2} 个代码单元</p><span class="meta">已复习 ${done} / ${c.topics.length}</span></a><nav class="directory-links" aria-label="${c.title}的学习模块"><a href="#chapter/${c.number}">知识库</a><a href="#chapter/${c.number}/lab">算法可视化</a><a href="#chapter/${c.number}/code">重点代码</a></nav></article>`;
      }).join('')}</div></section>`;
}
