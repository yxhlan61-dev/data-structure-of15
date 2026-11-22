import { byId, demoHref } from './dom.js';
import { chapters, allTopics, allDemos } from '../chapters/course.js';
import { paper2022 } from '../questions/paper-2022.js';
import { practiceTemplates } from '../questions/bank.js';

function searchResults(chapter, q) {
    const s=q.trim().toLocaleLowerCase();
    const entries=[
        ...paper2022.map(q=>({href:`#papers/2022/${q.id}`,title:`2022 真题 · ${q.title}`,desc:q.stem.replace(/<[^>]*>/g,' ').slice(0,120),group:'真题汇总'})),
        ...practiceTemplates.map(t=>({href:`#practice/topic/${t.topicId}`,title:t.title,desc:t.source,group:'模拟题库训练'})),
        ...allTopics.map(t=>({href:`#${t.id}`,title:t.title,desc:t.blurb,group:'知识库',terms:t.body.replace(/<[^>]*>/g,' ')})),
        ...allDemos.map(d=>({href:demoHref(d.id),title:d.title,desc:d.desc,group:'算法可视化'})),
        ...chapters.flatMap(c=>(c.lessons||[{...c.code,id:'tree'},{...c.heapCode,id:'heap'}]).map(x=>({href:`#code/${c.number}/${x.id}`,title:x.title,desc:x.description,group:'重点代码整理',terms:x.steps.map(s=>s.title+' '+s.reasoning).join(' ')})))
    ];
    return entries.filter(t=>`${t.title} ${t.desc} ${t.group} ${t.terms||''}`.toLocaleLowerCase().includes(s));
}
export function fillSearch(chapter) {
    const entries=searchResults(chapter, byId('search-input').value);
    byId('search-results').innerHTML=entries.length?entries.map(t=>`<a href="${t.href}"><strong>${t.title}</strong><small>${t.group} · ${t.desc}</small></a>`).join(''):'<p>没有找到匹配的知识点或算法。</p>';
}
export function openSearch(chapter) {
    const dialog=byId('search-dialog');
    if(!dialog.open) dialog.showModal();
    byId('search-input').value='';
    fillSearch(chapter);
    byId('search-input').focus();
}
