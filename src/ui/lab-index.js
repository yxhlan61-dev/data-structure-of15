import { forest, forestConfig } from '../demos/forest.js';
import { arrayGraph } from '../demos/shared.js';
import { sampleTree } from '../demos/traversal.js';
import { demoHref, icon } from './dom.js';
import { drawTree } from './tree.js';

function demoThumbnail(d) {
    if (d.id==='heap') return drawTree(arrayGraph([10,5,8,4,1]),{active:[0,2]},320);
    if (d.id==='huffman') return drawTree({nodes:[{id:0,label:8},{id:1,label:'A:3'},{id:2,label:'B:5'}],edges:[{from:0,to:1,slot:'left',label:'0'},{from:0,to:2,slot:'right',label:'1'}]},{active:[0]},300);
    if (d.id==='forest') return drawTree(forest(forestConfig.default).frames[0].graph,{active:['A','E']},320);
    return drawTree(arrayGraph(d.id==='rebuild'?['A','B','C']:sampleTree),{active:[0],visited:[1]},320);
}
export function labIndex(chapter) {
    const { number, title, demos: demoInfo } = chapter;
    return `<div class="title-row"><div><div class="eyebrow">第 ${number} 章 · ${title}</div><h1>算法可视化</h1><p>选择一个实验，用单步、回退和实时变量看清算法如何执行。</p></div></div>
      <div class="demo-grid">${demoInfo.map(d=>`<a class="demo-card" href="${demoHref(d.id)}"><div class="demo-art tone-${d.tone}">${demoThumbnail(d)}</div><h2>${d.title}</h2><p>${d.desc}</p><span class="topic-bottom">${icon('play')}打开实验</span></a>`).join('')}</div>`;
}
