import { chapters } from '../chapters/course.js';
import { icon } from './dom.js';

export function moduleOverview(chapter,kind) {
    const lab=kind==='lab',title=lab?'算法可视化':'重点代码整理';
    const available=chapters.filter(c=>lab?c.demos.length:c.lessons?.length!==0);
    const reason=chapter.number==='05'?'本章以概念辨析、地址推算和手算自测为主。':'本章侧重基本概念与算法分析。';
    return `<div class="title-row"><div><div class="eyebrow">第 ${chapter.number} 章 · ${chapter.title}</div><h1>${title}</h1><p>${reason}本章不设置${title}内容。</p></div><a class="secondary" href="#chapter/${chapter.number}">${icon('book')}复习本章知识库</a></div>
      <section aria-labelledby="module-chapters"><div class="section-head"><div><h2 id="module-chapters">其他章节的${title}</h2><p>选择章节，继续使用已整理的${lab?'交互实验':'代码例题'}。</p></div><span class="meta">${available.length} 个章节</span></div>
      <div class="topic-grid">${available.map(c=>`<a class="topic-card" href="#chapter/${c.number}/${kind}"><div class="topic-top"><span class="topic-icon tone-blue">${icon(lab?'lab':'grid')}</span><span class="topic-num mono">第 ${c.number} 章</span></div><h3>${c.title}</h3><p>${lab?`${c.demos.length} 个交互实验`:`${c.lessons?.length??2} 个代码单元`}</p><span class="topic-bottom">进入${title}</span></a>`).join('')}</div></section>`;
}
