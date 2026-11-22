import { chapters, allTopics, allDemos, chapterFor } from './chapters/course.js';
import { read, write } from './storage.js';
import { byId, icon } from './ui/dom.js';
import { chapterPage, renderShell, topicPage } from './ui/knowledge.js';
import { labIndex } from './ui/lab-index.js';
import { applyLab, closeLab, handleLabAction, openLab, setLabSpeed } from './ui/lab-player.js';
import { fillSearch, openSearch } from './ui/search.js';
import { codePage } from './ui/code-page.js';
import { directoryPage } from './ui/directory.js';
import { papersPage } from './ui/papers.js';
import { practicePage,handlePracticeAction,savePracticeInput,stopPracticeTimer,activatePracticeTimer,questionWrongSection,restorePracticePosition,resumePracticeRoute } from './ui/practice.js';

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
    if(key==='papers')return {kind:'papers'};
    if(key==='papers/2022'||key.startsWith('papers/2022/'))return {kind:'papers',id:key.split('/')[2]||'2022'};
    if(key==='practice')return resumePracticeRoute();
    if(key==='practice/catalog')return {kind:'practice',catalog:true};
    if(/^practice\/return\/[a-z0-9-]+$/.test(key))return {kind:'practice',returnId:key.split('/')[2]};
    if(key.startsWith('practice/topic/'))return {kind:'practice',topicId:key.slice(15)};
    if(/^practice\/(question|exam|wrong|history|data)$/.test(key))return {kind:'practice',view:key.split('/')[1]};
    if(!key||key==='directory')return {kind:'directory',module:'knowledge'};
    if(key==='directory/lab'||key==='directory/code')return {kind:'directory',module:key.slice(10)};
    const removed={complexity:'01',polynomial:'02',address:'05',sparse:'05',generalized:'05'};
    if(key.startsWith('lab/')&&removed[key.slice(4)]) {chapter=chapters.find(c=>c.number===removed[key.slice(4)]);return {kind:'chapter'};}
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
    if(key==='knowledge')return {kind:'chapter'};
    return {kind:'directory',module:'knowledge'};
}
function renderRoute({scroll=true}={}) {
    closeLab();
    stopPracticeTimer();
    if(byId('search-dialog').open) byId('search-dialog').close();
    const previousRoute=route;
    route=routeOf();
    if(route.kind==='practice'&&!route.view&&!route.topicId&&!route.catalog&&previousRoute.kind==='practice'&&previousRoute.view==='question')route.returnId='current';
    if(!['directory','papers','practice'].includes(route.kind))write('chapter',chapter.number);
    const {topics,demos:demoInfo}=chapter;
    document.title = route.kind==='papers'?'真题汇总 · 数据结构复习平台':route.kind==='practice'?'模拟题库训练 · 数据结构复习平台':route.kind==='directory' ? '课程目录 · 数据结构复习平台' : route.kind==='topic' ? `${topics.find(t=>t.id===route.id).title} · 数据结构复习平台` :
        route.kind==='demo' ? `${demoInfo.find(d=>d.id===route.id).title} · 数据结构复习平台` :
        route.kind==='code' ? '重点代码整理 · 数据结构复习平台' : chapter.title + ' · 数据结构复习平台';
    renderShell(chapter, route, learned);
    setSidebar(false);
    switch (route.kind) {
        case 'papers':byId('main').innerHTML=papersPage(route.id);break;
        case 'practice':byId('main').innerHTML=practicePage(route);break;
        case 'directory': byId('main').innerHTML=directoryPage(route.module,learned);break;
        case 'mistakes': byId('main').innerHTML=`<div class="title-row"><div><div class="eyebrow">保存在此浏览器</div><h1>本地错题记录</h1><p>知识点收藏与题目错题分别保留，掌握后可移出待复习。</p></div></div><h2>知识点易错收藏</h2><div class="topic-grid">${allTopics.filter(t=>mistakes.includes(t.id)).map(t=>`<article class="panel note"><h2><a href="#${t.id}">${t.title}</a></h2><p>${t.note}</p><button class="secondary" data-action="remove-mistake" data-topic="${t.id}">已掌握，移除记录</button></article>`).join('')||'<p>暂无知识点收藏。在知识页的易错点卡片中加入主题。</p>'}</div>${questionWrongSection()}`;break;
        case 'topic': byId('main').innerHTML=topicPage(chapter, route.id, learned); break;
        case 'lab': byId('main').innerHTML=labIndex(chapter); break;
        case 'demo': openLab(route.id, chapter); break;
        case 'code': byId('main').innerHTML=codePage(chapter, route.id); break;
        default: byId('main').innerHTML=chapterPage(chapter, learned);
    }
    if(!restorePracticePosition(route)&&scroll) window.scrollTo(0,0);
    activatePracticeTimer(()=>renderRoute({scroll:false}));
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
        if(handlePracticeAction(action,control,()=>renderRoute({scroll:false})))return;
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
    if(event.target.id==='chapter-select') {
        const module=route.kind==='directory'?route.module:route.kind==='code'?'code':route.kind==='lab'||route.kind==='demo'?'lab':'knowledge';
        location.hash=event.target.value==='directory'?`directory${module==='knowledge'?'':'/'+module}`:`chapter/${event.target.value}${module==='knowledge'?'':'/'+module}`;
    }
    if(event.target.id==='speed') setLabSpeed(event.target.value);
});
document.addEventListener('input',savePracticeInput);
document.addEventListener('change',savePracticeInput);
document.addEventListener('submit',event=>{
    if(['practice-answer','exam-answer','quiz-filters','quiz-wrong-filters'].includes(event.target.id)){event.preventDefault();return;}
    if(event.target.id!=='lab-form') return;
    event.preventDefault();
    applyLab(Object.fromEntries(new FormData(event.target)));
});
window.addEventListener('hashchange',()=>{
    renderRoute();
    byId('main').focus({preventScroll:true});
});
renderRoute({scroll:false});
