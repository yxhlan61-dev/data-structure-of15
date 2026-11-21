import { chapters, allTopics, allDemos, chapterFor } from './chapters/course.js';
import { read, write } from './storage.js';
import { byId, icon } from './ui/dom.js';
import { chapterPage, renderShell, topicPage } from './ui/knowledge.js';
import { labIndex } from './ui/lab-index.js';
import { applyLab, closeLab, handleLabAction, openLab, setLabSpeed } from './ui/lab-player.js';
import { fillSearch, openSearch } from './ui/search.js';
import { codePage } from './ui/code-page.js';

let chapter=chapters.find(c=>c.number===read('chapter','06'))||chapters[5];
let route = { kind: 'chapter' };
let sidebarOpen = false;
let learned = read('learned', []);
learned = Array.isArray(learned) ? [...new Set(learned)].filter(id => allTopics.some(topic => topic.id === id)) : [];
let mistakes=read('mistakes',[]);
mistakes=Array.isArray(mistakes)?mistakes:[];
document.documentElement.dataset.theme = read('theme','light') === 'dark' ? 'dark' : 'light';

function routeOf() {
    const key=location.hash.slice(1);
    if(key==='mistakes') return {kind:'mistakes'};
    const ch=key.match(/^chapter\/(\d{2})(?:\/(lab|code))?$/);
    if(ch&&chapters.some(c=>c.number===ch[1])) { chapter=chapters.find(c=>c.number===ch[1]); return {kind:ch[2]||'chapter'}; }
    const codeRoute=key.match(/^code\/(\d{2})\/([a-z-]+)$/);
    if(codeRoute&&chapters.some(c=>c.number===codeRoute[1])) {chapter=chapters.find(c=>c.number===codeRoute[1]);return {kind:'code',id:codeRoute[2]};}
    if (key==='lab') return {kind:'lab'};
    if (key==='code') return {kind:'code'};
    if (key==='code/heap') {chapter=chapters[5];return {kind:'code',id:'heap'};}
    if(key.startsWith('lab/')&&allDemos.some(d=>d.id===key.slice(4))) {chapter=chapterFor(key.slice(4));return {kind:'demo',id:key.slice(4)};}
    if(allTopics.some(t=>t.id===key)) {chapter=chapterFor(key);return {kind:'topic',id:key};}
    return {kind:'chapter'};
}
function renderRoute({scroll=true}={}) {
    closeLab();
    if(byId('search-dialog').open) byId('search-dialog').close();
    route=routeOf();
    write('chapter',chapter.number);
    const {topics,demos:demoInfo}=chapter;
    document.title = route.kind==='topic' ? `${topics.find(t=>t.id===route.id).title} · 数据结构复习平台` :
        route.kind==='demo' ? `${demoInfo.find(d=>d.id===route.id).title} · 数据结构复习平台` :
        route.kind==='code' ? '重点代码整理 · 数据结构复习平台' : chapter.title + ' · 数据结构复习平台';
    renderShell(chapter, route, learned);
    setSidebar(false);
    switch (route.kind) {
        case 'mistakes': byId('main').innerHTML=`<div class="title-row"><div><div class="eyebrow">保存在此浏览器</div><h1>本地错题记录</h1><p>自测后收集薄弱主题；完成复习可逐项移除，不影响学习进度。</p></div></div><div class="topic-grid">${allTopics.filter(t=>mistakes.includes(t.id)).map(t=>`<article class="panel note"><h2><a href="#${t.id}">${t.title}</a></h2><p>${t.note}</p><button class="secondary" data-action="remove-mistake" data-topic="${t.id}">已掌握，移除记录</button></article>`).join('')||'<p>暂无记录。在知识页的易错点卡片中加入主题。</p>'}</div>`;break;
        case 'topic': byId('main').innerHTML=topicPage(chapter, route.id, learned); break;
        case 'lab': byId('main').innerHTML=labIndex(chapter); break;
        case 'demo': openLab(route.id, chapter); break;
        case 'code': byId('main').innerHTML=codePage(chapter, route.id); break;
        default: byId('main').innerHTML=chapterPage(chapter, learned);
    }
    if(scroll) window.scrollTo(0,0);
}
function setSidebar(open) {
    sidebarOpen=open;
    byId('sidebar').classList.toggle('open',open);
    document.querySelector('.mobile-cover').hidden=!open;
    document.querySelector('[data-action="menu"][aria-expanded]')?.setAttribute('aria-expanded',String(open));
}
function updateTheme() {
    const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
    document.documentElement.dataset.theme=theme;
    write('theme',theme);
    const btn=document.querySelector('[data-action="theme"]');
    btn.innerHTML=icon(theme==='dark'?'sun':'moon');
    btn.setAttribute('aria-label',theme==='dark'?'切换浅色主题':'切换深色主题');
    btn.title=theme==='dark'?'浅色主题':'深色主题';
}
function toggleLearn(id) {
    const btn=document.querySelector('[data-action="learn"]');
    learned=learned.includes(id)?learned.filter(x=>x!==id):[...learned,id];
    const saved=write('learned',learned);
    const done=learned.includes(id);
    btn.className=done?'secondary':'primary';
    btn.innerHTML=`${icon('check')}${done?'已复习':'标记为已复习'}`;
    btn.setAttribute('aria-pressed',String(done));
    renderShell(chapter, route, learned);
    if (!saved) document.querySelector('.rail-foot small').textContent='当前浏览器无法持久保存进度';
}

document.addEventListener('click',event=>{
    const control=event.target.closest('[data-action]');
    if(control) {
        const action=control.dataset.action;
        if(action==='menu') setSidebar(!sidebarOpen);
        if(action==='theme') updateTheme();
        if(action==='search') openSearch(chapter);
        if(action==='close-search') byId('search-dialog').close();
        if(action==='learn'&&route.kind==='topic') toggleLearn(route.id);
        if(action==='mistake') {if(!mistakes.includes(control.dataset.topic))mistakes.push(control.dataset.topic);const saved=write('mistakes',mistakes);byId('mistake-status').textContent=saved?'已加入本地错题记录。':'当前浏览器无法持久保存，本次会话仍可查看。';}
        if(action==='remove-mistake') {mistakes=mistakes.filter(id=>id!==control.dataset.topic);write('mistakes',mistakes);renderRoute({scroll:false});}
        handleLabAction(action, control.dataset.index);
        return;
    }
    const anchor=event.target.closest('a');
    if(anchor?.closest('#search-results')) byId('search-dialog').close();
    if(anchor?.closest('#sidebar')) setSidebar(false);
    if(anchor?.classList.contains('skip')) {
        event.preventDefault();
        byId('main').focus();
    }
});
byId('search-input').addEventListener('input',()=>fillSearch(chapter));
byId('search-input').addEventListener('keydown',event=>{
    if(event.key!=='Enter') return;
    const first=byId('search-results').querySelector('a');
    if(first) first.click();
});
document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&byId('search-dialog').open) byId('search-dialog').close();
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k') {
        event.preventDefault();
        openSearch(chapter);
    }
    if(event.key==='Escape'&&sidebarOpen) setSidebar(false);
});
document.addEventListener('change',event=>{
    if(event.target.id==='chapter-select') location.hash=`chapter/${event.target.value}/${route.kind==='code'?'code':route.kind==='lab'||route.kind==='demo'?'lab':''}`.replace(/\/$/,'');
    if(event.target.id==='speed') setLabSpeed(event.target.value);
});
document.addEventListener('submit',event=>{
    if(event.target.id!=='lab-form') return;
    event.preventDefault();
    applyLab(Object.fromEntries(new FormData(event.target)));
});
window.addEventListener('hashchange',()=>{
    renderRoute();
    byId('main').focus({preventScroll:true});
});
renderRoute({scroll:false});
