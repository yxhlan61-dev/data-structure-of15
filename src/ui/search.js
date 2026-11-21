import { byId, demoHref } from './dom.js';

function searchResults(chapter, q) {
    const { topics, demos: demoInfo, code, heapCode } = chapter;
    const s=q.trim().toLocaleLowerCase();
    const entries=[
        ...topics.map(t=>({href:`#${t.id}`,title:t.title,desc:t.blurb,group:'知识库',terms:t.body.replace(/<[^>]*>/g,' ')})),
        ...demoInfo.map(d=>({href:demoHref(d.id),title:d.title,desc:d.desc,group:'算法可视化'})),
        {href:'#code',title:code.title,desc:code.description,group:'重点代码整理'},
        {href:'#code/heap',title:heapCode.title,desc:heapCode.description,group:'重点代码整理',terms:heapCode.steps.map(step=>step.title).join(' ')}
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
