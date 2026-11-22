import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { chapters,allTopics,allDemos } from '../src/chapters/course.js';
import { labs } from '../src/demos/index.js';
import { drawTree } from '../src/ui/tree.js';
import { drawNetwork } from '../src/ui/network.js';
import { codePage } from '../src/ui/code-page.js';
const run=(id,overrides={})=>labs[id].run({...labs[id].config.default,...overrides});
const last=r=>r.frames.at(-1);
let cases=0;
function validate(id,r){assert(r.frames.length>0,id);for(const f of r.frames){assert.equal(typeof f.explanation,'string');assert(Array.isArray(f.output));if(f.graph)assert(!/undefined|NaN/.test(drawTree(f.graph,f)),id);if(f.network)assert(!/undefined|NaN/.test(drawNetwork(f.network,f.active)),id);}cases++;}
assert.equal(chapters.length,9);assert.equal(new Set(allTopics.map(t=>t.id)).size,allTopics.length);assert.equal(new Set(allDemos.map(t=>t.id)).size,allDemos.length);
for(const c of chapters){assert(c.topics.length);for(const t of c.topics){assert(t.body.length>350,t.id);for(const id of t.demos)assert(c.demos.some(d=>d.id===id),t.id);}for(const d of c.demos){assert(labs[d.id],d.id);assert(c.topics.some(t=>t.id===d.topicId));}assert(codePage(c).includes('重点代码整理'));}
for(const [id,l] of Object.entries(labs)){validate(id,run(id));for(const [,preset] of l.config.presets||[])validate(id,run(id,preset));}
assert.deepEqual(last(run('list',{nodes:'1,1,1,2',mode:'unique'})).output,[1,2]);
assert.deepEqual(last(run('list',{nodes:'',mode:'insert',position:'0',value:'7'})).output,[7]);
assert.deepEqual(last(run('list',{nodes:'1,2,3',mode:'reverse'})).output,[3,2,1]);
assert.deepEqual(last(run('queue',{capacity:'3',operations:'deq,enq:1,enq:2,enq:3,deq,enq:4'})).output,[2,3,4]);
assert.deepEqual(last(run('expression',{expression:'8-3-2'})).output,[3]);
assert.deepEqual(last(run('expression',{expression:'(0-7)/2'})).output,[-3]);
for(const expression of ['1/0','()','1 2','(1','1+','1**2','-2','2(3)'])assert.throws(()=>run('expression',{expression}));
assert.deepEqual(last(run('binary',{nodes:'1,2,2,2,4'})).output,[1]);
assert.deepEqual(last(run('binary',{nodes:'',value:'3'})).output,[-1]);
assert.throws(()=>run('binary',{nodes:'3,1'}));
assert.deepEqual(last(run('bst',{nodes:'10,5,15,#,12',mode:'validate'})).output,['false']);
assert.deepEqual(last(run('bst',{nodes:'#,1',mode:'validate'})).output,['false']);
assert.deepEqual(last(run('bst',{nodes:'2,1,3',mode:'delete',value:'2'})).output,[1,3]);
assert.deepEqual(last(run('dijkstra')).output,['距离 6','A → C → F → G']);
assert.deepEqual(last(run('dijkstra',{target:'H'})).output,['不可达']);
assert.throws(()=>run('dijkstra',{edges:'A:B:-1'}));
assert.throws(()=>run('graph-traversal',{edges:'A:B:1,B:A:2'}));
assert(last(run('topological',{edges:'A:B:1,B:A:1,B:C:1'})).explanation.includes('存在有向环'));
assert(last(run('mst')).explanation.includes('2 个分量'));
for(const mode of ['prim','kruskal'])assert(last(run('mst',{mode,vertices:'A B C',edges:'A:B:3,A:C:4,B:C:2'})).output.includes('总权重 5'));
assert.deepEqual(last(run('hash',{size:'5',prime:'5',operations:'1,6'})).output,[2]);
assert.equal(chapters[4].demos.length,0);assert.equal(chapters[4].lessons.length,0);
for(const id of ['complexity','polynomial','address','sparse','generalized'])assert(!labs[id]);
assert.deepEqual(last(run('queue',{capacity:'5',operations:'enq:1,enq:2,enq:3,enq:4,enq:5'})).output,[1,2,3,4,5]);
const single=run('queue',{capacity:'1',operations:'enq:1,enq:2,deq,deq,enq:3'});assert.deepEqual(last(single).output,[3]);validate('queue',single);
assert.deepEqual(last(single).rows[1].values,[0,0,1]);
assert.throws(()=>run('hash',{operations:'get:1'}));assert.throws(()=>run('hash',{operations:'del:1'}));assert.throws(()=>run('hash',{mode:'quadratic'}));
assert.deepEqual(last(run('hash',{size:'3',prime:'3',operations:'0,1,2,3'})).output,['表满']);
assert.equal(last(run('hash',{mode:'chain',operations:'1,10,1'})).rows[0].values[1],'1→10');
const critical=run('critical-path');assert.equal(critical.duration,12);
assert.deepEqual(critical.et,[0,3,2,1,8,5,12,0]);assert.deepEqual(critical.lt,[0,3,6,7,8,10,12,12]);
assert.deepEqual(critical.paths,['A → B → E → G']);assert.equal(critical.activities.filter(a=>a.slack===0).length,3);
for(const i of [2,3,5])assert(critical.et[i]<critical.lt[i]);
assert.deepEqual(critical.activities.map(a=>a.slack),[0,4,6,0,5,4,6,6,0,5]);
const cooking=run('critical-path',{vertices:'A B C',edges:'A:B:10,B:C:10,A:C:30'});
assert.equal(cooking.duration,30);assert.deepEqual(cooking.et,[0,10,30]);assert.deepEqual(cooking.lt,[0,20,30]);assert.deepEqual(cooking.activities.map(a=>a.slack),[10,10,0]);
assert.deepEqual(cooking.paths,['A → C']);
assert.equal(run('critical-path',{vertices:'A B C H',edges:'A:B:0,B:C:2,A:C:2'}).paths.length,2);
assert.equal(run('critical-path',{vertices:'A B C D',edges:'A:B:2,C:D:5'}).duration,5);
assert.deepEqual(run('critical-path',{vertices:'A H',edges:''}).paths,[]);
assert.throws(()=>run('critical-path',{edges:'A:B:1,B:A:1'}));assert.throws(()=>run('critical-path',{edges:'A:B:-1'}));
for(const id of ['graph-traversal','topological','dijkstra','mst','critical-path']) {const r=run(id);assert.equal(r.frames[0].network.nodes.length,8);assert(!r.frames[0].network.edges.some(e=>e.from===7||e.to===7));}
let seed=415;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
for(let trial=0;trial<100;trial++){
    // 用枚举所有源汇路径作为独立基准，验证随机 DAG 的工期与所有关键路径。
    const names=['A','B','C','D','E','F'],edges=[];
    for(let u=0;u<6;u++)for(let v=u+1;v<6;v++)if(rand(3)===0)edges.push({u,v,w:rand(6)});
    const routes=[];
    function enumerate(u,path,cost){const next=edges.filter(e=>e.u===u);if(!next.length){if(path.length>1)routes.push({path:path.map(i=>names[i]).join(' → '),cost});return;}for(const e of next)enumerate(e.v,[...path,e.v],cost+e.w);}
    for(let u=0;u<6;u++)if(!edges.some(e=>e.v===u))enumerate(u,[u],0);
    const expected=Math.max(0,...routes.map(r=>r.cost)),r=run('critical-path',{vertices:names.join(' '),edges:edges.map(e=>`${names[e.u]}:${names[e.v]}:${e.w}`).join(',')});
    assert.equal(r.duration,expected);assert.deepEqual([...r.paths].sort(),routes.filter(r=>r.cost===expected).map(r=>r.path).sort());assert(r.activities.every(a=>a.slack>=0));validate('critical-path',r);
}
for(let trial=0;trial<100;trial++){
    const a=Array.from({length:rand(13)},()=>rand(13)-6),nodes=a.join(','),sorted=[...a].sort((a,b)=>a-b).map(String);
    for(const mode of ['insertion','binary','shell','bubble','selection','quick','heap','merge']){const r=run('sorting',{nodes,mode});assert.deepEqual(last(r).output,sorted,`${mode}: ${nodes}`);validate('sorting',r);}
    for(const mode of ['counting','radix','bucket']){const nums=mode==='bucket'?a:a.map(Math.abs),r=run('distribution',{nodes:nums.join(','),mode});assert.deepEqual(last(r).output,[...nums].sort((a,b)=>a-b).map(String));validate('distribution',r);}
    const text=Array.from({length:rand(18)},()=>String.fromCharCode(97+rand(3))).join(''),pattern=Array.from({length:rand(7)},()=>String.fromCharCode(97+rand(3))).join('');
    for(const mode of ['bf','kmp'])assert.deepEqual(last(run('matching',{text,pattern,mode})).output,[text.indexOf(pattern)]);
    const unique=[...new Set(a)],value=unique[rand(unique.length)]??0,r=run('avl',{nodes,value:String(value),operation:'delete'});validate('avl',r);
    const g=last(r).graph,byId=new Map(g.nodes.map(x=>[x.id,x])),child=(id,slot)=>g.edges.find(e=>e.from===id&&e.slot===slot)?.to;
    function height(id,lo=-Infinity,hi=Infinity){if(id===undefined)return -1;const n=byId.get(id);assert(n.label>lo&&n.label<hi);const l=height(child(id,'left'),lo,n.label),rr=height(child(id,'right'),n.label,hi);assert(Math.abs(l-rr)<=1,'AVL balance');return 1+Math.max(l,rr);}
    for(const n of g.nodes)if(!g.edges.some(e=>e.to===n.id))height(n.id);
    assert.deepEqual(last(r).output,unique.filter(x=>x!==value).sort((a,b)=>a-b));
}
// 每个独立 C 程序均编译并运行其断言；没有编译器时明确失败，不跳过。
const temp=mkdtempSync(join(tmpdir(),'ds-review-check-'));let programs=0;
try{for(const c of chapters)for(const lesson of c.lessons||[c.code,c.heapCode]){
    const name=`${c.number}-${lesson.id||programs}`,source=join(temp,name+'.c'),exe=join(temp,name+(process.platform==='win32'?'.exe':''));
    writeFileSync(source,[lesson.declarations,...lesson.steps.map(s=>s.code),lesson.driver].join('\n\n'));
    const cc=spawnSync(process.env.CC||'gcc',['-std=c11','-O1',source,'-o',exe],{encoding:'utf8'});assert.equal(cc.status,0,`${name}: ${cc.stderr||cc.error}`);
    const result=spawnSync(exe,[],{encoding:'utf8',timeout:5000});assert.equal(result.status,0,`${name}: ${result.stderr||result.error}`);programs++;
}}finally{rmSync(temp,{recursive:true,force:true});}
console.log(JSON.stringify({chapters:chapters.length,topics:allTopics.length,labs:allDemos.length,traceCases:cases,compiledCPrograms:programs,status:'passed'},null,2));
