import assert from 'node:assert/strict';
import { readFileSync,existsSync,mkdtempSync,writeFileSync,rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { allTopics } from '../src/chapters/course.js';
import { practiceTemplates,instantiate,gradeObjective,normalizeAnswer,huffmanModel,nextTable,linearHash,seeded } from '../src/questions/bank.js';
import { createExam,submitExam,examTotals,restoreExam,restoreQuestion,isObjective,pickQuestion } from '../src/questions/engine.js';
import { paper2022,originalPrograms } from '../src/questions/paper-2022.js';
assert.equal(paper2022.length,22);assert.equal(paper2022.reduce((n,q)=>n+q.points,0),100);
assert.deepEqual(paper2022.filter(q=>q.options).map(q=>q.answer.join('')),['AB','A','BD','D','ABC','B','AC','A']);
assert(paper2022.every(q=>q.stem&&q.answer&&q.solution&&allTopics.some(t=>t.id===q.topicId)));
const source=new URL('../复习范围和往年题/test2022A-数据结构.pdf',import.meta.url),publicPaper=new URL('../assets/exams/2022-paper.pdf',import.meta.url);
if(existsSync(source))assert.equal(createHash('sha256').update(readFileSync(source)).digest('hex'),createHash('sha256').update(readFileSync(publicPaper)).digest('hex'));
assert.equal(practiceTemplates.length,88);assert.equal(new Set(practiceTemplates.map(t=>t.id)).size,88);
for(const topic of allTopics)assert(practiceTemplates.some(t=>t.topicId===topic.id),'missing '+topic.id);
let instances=0;
for(const t of practiceTemplates){
    const variants=new Set();
    assert(allTopics.some(x=>x.id===t.topicId&&x.id.startsWith('ch'+t.chapter)));
    for(let seed=1;seed<=50;seed++){
        const q=instantiate(t.id,seed);instances++;variants.add(JSON.stringify([q.stem,q.options]));
        assert.deepEqual(q,instantiate(t.id,seed),'reproducible seed');assert.deepEqual(restoreQuestion({...q,solution:'<script>bad</script>'}),q);
        assert(q.stem&&q.solution&&q.title&&q.source&&q.difficulty);
        if(q.type==='single'||q.type==='multiple'){
            assert(q.options.length>=4&&q.options.length<=5);
            assert(q.answer.length>0);assert(q.options.every(o=>o.explanation));
            if(q.type==='single')assert.equal(q.answer.length,1);
            assert.equal(gradeObjective(q,q.answer).score,q.points);
            assert.equal(gradeObjective(q,[]).score,0);
            const bad=q.options.find(o=>!o.correct);assert.equal(gradeObjective(q,[bad.id,...q.answer]).score,0);
            if(q.type==='multiple'){const partial=gradeObjective(q,[q.answer[0]]);assert.equal(partial.score,Math.round(q.points/q.answer.length*100)/100);}
        }else if(q.type==='fill'){
            assert.equal(gradeObjective(q,q.answers.map(f=>f.accepted[0])).score,q.points);
            assert.equal(gradeObjective(q,[]).score,0);
        }else if(q.type==='programming')assert(q.framework&&q.hint);
    }
    if(t.parametric){assert(variants.size>1,t.id+' has no data variation');const a=pickQuestion(t.id),b=pickQuestion(t.id,a);assert.notDeepEqual([a.stem,a.options],[b.stem,b.options]);}
    else assert.equal(variants.size,1,t.id+' conceptual question changed');
}
assert.equal(normalizeAnswer('03.00','number'),'3');assert.equal(normalizeAnswer(' 1/2 ','number'),'0.5');assert.equal(normalizeAnswer('[1，2, −3]','sequence'),'1,2,-3');
const r=seeded(415);
function optimalCost(w){if(w.length<2)return 0;let min=Infinity;for(let i=0;i<w.length;i++)for(let j=i+1;j<w.length;j++){const sum=w[i]+w[j],rest=w.filter((_,k)=>k!==i&&k!==j);min=Math.min(min,sum+optimalCost([...rest,sum]));}return min;}
for(let n=0;n<100;n++){
    const weights=Array.from({length:4},()=>r(1,20)),h=huffmanModel(weights);assert.equal(h.cost,optimalCost(weights));assert.equal(Object.entries(h.codes).reduce((sum,[sym,c])=>sum+weights[sym.charCodeAt(0)-65]*c.length,0),h.cost);
    const codes=Object.values(h.codes);for(let i=0;i<codes.length;i++)for(let j=0;j<codes.length;j++)if(i!==j)assert(!codes[i].startsWith(codes[j]));
    const p=Array.from({length:r(1,15)},()=>String.fromCharCode(97+r(0,2))).join(''),table=nextTable(p);
    for(let j=1;j<p.length;j++){let expected=0;for(let k=1;k<j;k++)if(p.slice(0,k)===p.slice(j-k,j))expected=k;assert.equal(table[j],expected);}
    const ex=createExam(n,10000);assert.equal(ex.questions.length,22);assert.equal(ex.questions.reduce((s,i)=>s+i.points,0),100);
    assert.deepEqual(['single','multiple','fill','calculation','programming'].map(t=>ex.questions.filter(i=>i.question.type===t).length),[4,4,8,4,2]);
    assert.equal(ex.deadline-ex.startedAt,7200000);
    for(const item of ex.questions)if(isObjective(item.question))item.answer=item.question.answer||item.question.answers.map(f=>f.accepted[0]);
    submitExam(ex,20000);assert.deepEqual(examTotals(ex),{objective:50,subjective:0,pending:6,total:50});
    const original=JSON.stringify(ex);submitExam(ex,999999);assert.equal(JSON.stringify(ex),original,'idempotent submit');
    for(const item of ex.questions)if(!isObjective(item.question))item.result={score:item.points,max:item.points,self:true};
    assert.equal(examTotals(restoreExam(JSON.parse(JSON.stringify(ex)))).total,100);
}
assert.deepEqual(linearHash([7,34,55,25,64],10,9).positions,[7,8,1,9,2]);
assert.throws(()=>restoreExam({questions:[]}));
// 原题两道编程解答也编译并执行边界样例。
const temp=mkdtempSync(join(tmpdir(),'ds-original-code-'));
try{for(const [name,program,driver] of [
    ['dedup',originalPrograms.dedup,`int main(void){assert(remove_duplicate(NULL)==NULL);struct Node *a=malloc(sizeof *a),*b=malloc(sizeof *b),*c=malloc(sizeof *c);*a=(struct Node){3,c,b};*b=(struct Node){3,a,c};*c=(struct Node){4,b,a};assert(remove_duplicate(a)==a);assert(a->rlink==c&&c->llink==a&&c->rlink==a&&a->llink==c);free(a);free(c);return 0;}`],
    ['bst',originalPrograms.bst,`int main(void){int good[]={10,5,15,-1,7},bad[]={10,5,15,-1,12},orphan[]={-1,2};assert(judgeBST(good,5));assert(!judgeBST(bad,5));assert(!judgeBST(orphan,2));assert(judgeBST(NULL,0));return 0;}`]
]){const src=join(temp,name+'.c'),exe=join(temp,name+(process.platform==='win32'?'.exe':''));writeFileSync(src,'#include <stddef.h>\n#include <assert.h>\n'+program+'\n'+driver);const cc=spawnSync(process.env.CC||'gcc',['-std=c11',src,'-o',exe],{encoding:'utf8'});assert.equal(cc.status,0,cc.stderr);const run=spawnSync(exe,[],{encoding:'utf8',timeout:5000});assert.equal(run.status,0,run.stderr);}}finally{rmSync(temp,{recursive:true,force:true});}
console.log(JSON.stringify({originalQuestions:22,templates:practiceTemplates.length,generatedInstances:instances,examPapers:100,originalCPrograms:2,status:'passed'},null,2));
