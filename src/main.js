import { treesChapter as chapter } from './chapters/trees.js';
import { read, write } from './storage.js';
import { byId, icon } from './ui/dom.js';
import { chapterPage, renderShell, topicPage } from './ui/knowledge.js';
import { labIndex } from './ui/lab-index.js';
import { applyLab, closeLab, handleLabAction, openLab, setLabSpeed } from './ui/lab-player.js';
import { fillSearch, openSearch } from './ui/search.js';
import { codePage } from './ui/code-page.js';

const { topics, demos: demoInfo } = chapter;
let route = { kind: 'chapter' };
let sidebarOpen = false;
let learned = read('learned', []);
learned = Array.isArray(learned) ? [...new Set(learned)].filter(id => topics.some(topic => topic.id === id)) : [];
document.documentElement.dataset.theme = read('theme','light') === 'dark' ? 'dark' : 'light';

function routeOf() {
    const key=location.hash.slice(1);
    if (key==='lab') return {kind:'lab'};
    if (key==='code') return {kind:'code'};
    if(key.startsWith('lab/')&&demoInfo.some(d=>d.id===key.slice(4))) return {kind:'demo',id:key.slice(4)};
    if(topics.some(t=>t.id===key)) return {kind:'topic',id:key};
    return {kind:'chapter'};
}
function renderRoute({scroll=true}={}) {
    closeLab();
    route=routeOf();
    document.title = route.kind==='topic' ? `${topics.find(t=>t.id===route.id).title} · 数据结构复习平台` :
        route.kind==='demo' ? `${demoInfo.find(d=>d.id===route.id).title} · 数据结构复习平台` :
        route.kind==='code' ? '重点代码整理 · 数据结构复习平台' : chapter.title + ' · 数据结构复习平台';
    renderShell(chapter, route, learned);
    setSidebar(false);
    switch (route.kind) {
        case 'topic': byId('main').innerHTML=topicPage(chapter, route.id, learned); break;
        case 'lab': byId('main').innerHTML=labIndex(chapter); break;
        case 'demo': openLab(route.id, chapter); break;
        case 'code': byId('main').innerHTML=codePage(chapter); break;
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
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k') {
        event.preventDefault();
        openSearch(chapter);
    }
    if(event.key==='Escape'&&sidebarOpen) setSidebar(false);
});
document.addEventListener('change',event=>{
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
