import { arrayGraph } from '../demos/shared.js';
import { sampleTree } from '../demos/traversal.js';
import { byId, demoHref, icon } from './dom.js';
import { drawTree } from './tree.js';
import { chapters } from '../chapters/course.js';

const treeRaw = ['A','B','C','D','E','F','G'];
const terminologyTree = {
    nodes: treeRaw.map(label=>({id:label, label})),
    edges: ['AB','AC','AD','BE','BF','CG'].map(([from,to])=>({from,to,slot:'general'})),
};

function heroArt() {
    const points = [[224,39],[142,103],[306,103],[86,176],[175,176],[272,176],[363,176]];
    return `<div class="hero-art"><svg class="plot" viewBox="0 0 448 229" role="img" aria-label="具有三层的七结点完美二叉树">
      <g fill="none" stroke="currentColor" stroke-width="1.6" opacity=".63">${points.slice(1).map(([x,y],i)=>{
          const [px,py] = points[Math.floor(i/2)];
          return `<path d="M${px} ${py} L${x} ${y}"/>`;
      }).join('')}</g>
      <g class="legend"><text x="39" y="43">L0</text><text x="39" y="107">L1</text><text x="39" y="180">L2</text></g>
      ${points.map(([x,y],i)=>`<g><circle class="node ${i===0?'root':''}" cx="${x}" cy="${y}" r="${i===0?21:18}"/><text class="letter ${i===0?'root-letter':''}" x="${x}" y="${y}">${treeRaw[i]}</text></g>`).join('')}
      <text class="legend" x="224" y="216" text-anchor="middle">完美二叉树 · 7 个结点</text>
    </svg></div>`;
}

export function renderShell(chapter, route, learned) {
    const { number, title, topics, demos: demoInfo } = chapter;
    const onLab = route.kind === 'lab' || route.kind === 'demo';
    const onCode = route.kind === 'code';
    const chapterLearned=learned.filter(id=>topics.some(t=>t.id===id));
    const section = onLab ? ['#lab', '算法可视化'] : onCode ? ['#code', '重点代码整理'] : ['#knowledge', '基础知识库'];
    const nav = (href, name, symbol, active) => `<a href="${href}" class="nav-link${active?' current':''}" ${active?'aria-current="page"':''}>${icon(symbol)}<span>${name}</span></a>`;
    byId('sidebar').innerHTML = `<a class="brand" href="#knowledge"><span class="brand-icon">${icon('tree')}</span><span><b>数据结构复习平台</b><small>期末复习工作台</small></span></a>
      <div class="side-label">学习空间</div><nav aria-label="学习空间">${nav('#knowledge','基础知识库','book',!onLab&&!onCode)}${nav('#lab','算法可视化','lab',onLab)}${nav('#code','重点代码整理','grid',onCode)}</nav>
      <div class="chapter-picker"><label for="chapter-select">课程章节</label><select id="chapter-select" aria-label="切换课程章节">${chapters.map(c=>`<option value="${c.number}"${c===chapter?' selected':''}>${c.number} · ${c.title}</option>`).join('')}</select><a href="#mistakes" class="side-topic">${icon('book')} 本地错题记录</a></div>
      <div class="side-chapter"><div class="chapter-heading"><span class="chapter-index">${number}</span>${title}</div>
      <nav class="topics" aria-label="本章知识点">${topics.map(t=>`<a class="side-topic${route.id===t.id?' current':''}" ${route.id===t.id?'aria-current="page"':''} href="#${t.id}">${t.short}${learned.includes(t.id)?icon('check','tick'):''}</a>`).join('')}</nav></div>
      <div class="rail-foot"><div class="rail-foot-line"><span>本章进度</span><span>${chapterLearned.length} / ${topics.length}</span></div><div class="progress-track" role="progressbar" aria-label="本章进度" aria-valuenow="${chapterLearned.length}" aria-valuemax="${topics.length}"><i style="width:${chapterLearned.length/topics.length*100}%"></i></div><small>学习进度保存在此浏览器</small></div>`;
    const breadcrumb = route.kind === 'topic' ? topics.find(t=>t.id===route.id).title :
        route.kind === 'demo' ? demoInfo.find(d=>d.id===route.id).title : title;
    byId('crumbs').innerHTML = `<button class="icon-btn menu-btn" data-action="menu" aria-label="打开章节导航" aria-controls="sidebar" aria-expanded="false">${icon('menu')}</button><a href="${section[0]}">${section[1]}</a>${icon('chev')}<strong>${breadcrumb}</strong>`;
    const dark = document.documentElement.dataset.theme==='dark';
    byId('bar-actions').innerHTML = `<button class="search-trigger" data-action="search" aria-label="搜索知识点与算法">${icon('search')}<span>搜索知识点</span><kbd>Ctrl K</kbd></button><button class="icon-btn" data-action="theme" aria-label="${dark?'切换浅色主题':'切换深色主题'}" title="${dark?'浅色主题':'深色主题'}">${icon(dark?'sun':'moon')}</button>`;
}

export function chapterPage(chapter, learned) {
    const { number, title, intro, topics } = chapter;
    return `<section class="hero" aria-labelledby="chapter-title">
      <div class="hero-copy"><div class="eyebrow">第 ${number} 章 · 基础知识库</div><h1 id="chapter-title">${title}</h1><p>${intro}</p>
      <div class="actions"><a class="primary" href="#${topics[0].id}">${icon('book')}开始复习</a>${chapter.demos.length?`<a class="secondary" href="#lab">${icon('lab')}打开算法可视化</a>`:''}</div></div>${number==='06'?heroArt():`<div class="hero-art chapter-art"><strong>${number}</strong><span>${topics.length} 个知识主题${chapter.demos.length?` · ${chapter.demos.length} 个交互实验`:""}</span></div>`}
      </section><section aria-labelledby="topics-title"><div class="section-head"><div><h2 id="topics-title">本章知识点</h2><p>按课程顺序浏览，也可直接进入需要复习的主题。</p></div><span class="meta">${topics.length} 个主题</span></div>
      <div class="topic-grid">${topics.map((t,i)=>`<a class="topic-card" href="#${t.id}"><div class="topic-top"><span class="topic-icon tone-${t.tone}">${icon(t.icon)}</span><span class="topic-num mono">${learned.includes(t.id)?'已复习':`${Number(number)}.${i+1}`}</span></div><h3>${t.title}</h3><p>${t.blurb}</p><span class="topic-bottom">${icon('book')}查看知识点</span></a>`).join('')}</div>
      </section>${chapter.demos.length?`<section class="feature" aria-label="算法实验入口"><span class="topic-icon tone-amber">${icon('play')}</span><div><h3>${chapter.demos[0].title}</h3><p>${chapter.demos[0].desc}</p></div><a class="secondary" href="${demoHref(chapter.demos[0].id)}">开始实验</a></section>`:''}<section class="panel note"><h2>资料与范围</h2><p>知识点按本章课程课件、《数据结构复习范围》和 2022 A 卷整理。第 5 章仅考概念，AVL 不考编程；线索二叉树、B 树、多源最短路径不在原复习范围；AOE 网与关键路径按新增需求作为扩展复习内容。自测由自己核对答案，可将薄弱主题加入本地错题记录。</p></section>`;
}

export function topicPage(chapter, id, learned) {
    const { number, topics, demos: demoInfo } = chapter;
    const i = topics.findIndex(t=>t.id===id);
    const topic=topics[i];
    const done=learned.includes(id);
    return `<div class="title-row"><div><div class="eyebrow">第 ${number} 章 · ${topic.short}</div><h1>${topic.title}</h1><p>${topic.lead}</p></div><button class="${done?'secondary':'primary'}" data-action="learn" aria-pressed="${done}">${icon('check')}${done?'已复习':'标记为已复习'}</button></div>
      <div class="learn-grid"><article class="panel article">${topic.body}</article><aside class="learn-aside">
      ${id==='ch06-basics'?`<div class="panel note"><h2>术语示意树</h2>${drawTree(terminologyTree)}<p>根 A 有三个孩子。沿 A → C → G 走两条边到达叶结点 G。</p></div>`:number==='06'&&i<3?`<div class="panel note"><h2>结构示意</h2>${drawTree(arrayGraph(sampleTree))}<p>示例树的 C 没有左孩子，有右孩子 F。</p></div>`:''}
      <div class="panel note tinted"><h2>易错点</h2><p>${topic.note}</p><button class="secondary" data-action="mistake" data-topic="${id}">加入本地错题记录</button><p id="mistake-status" role="status"></p></div>${topic.demos.length||chapter.lessons?.length!==0?`<div class="panel note"><h2>相关学习内容</h2>${topic.demos.map(id=>`<a class="secondary" href="${demoHref(id)}">${icon('play')}${demoInfo.find(d=>d.id===id).title}</a>`).join('')}${chapter.lessons?.length===0?'':`<a class="secondary" href="#chapter/${number}/code">本章重点代码</a>`}</div>`:''}</aside></div>
      <nav class="pager" aria-label="章节切换">${i>0?`<a class="secondary" href="#${topics[i-1].id}">上一节 · ${topics[i-1].short}</a>`:'<a class="secondary" href="#knowledge">章节总览</a>'}${i<topics.length-1?`<a class="secondary" href="#${topics[i+1].id}">下一节 · ${topics[i+1].short}</a>`:chapter.demos.length?'<a class="secondary" href="#lab">进入算法可视化</a>':'<a class="secondary" href="#knowledge">返回章节总览</a>'}</nav>`;
}
