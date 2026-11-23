import assert from 'node:assert/strict';
import { practiceTemplates } from '../src/questions/bank.js';

// Independent module instances model two pre-opened tabs sharing one origin.
const [first,second]=practiceTemplates.filter(q=>q.type==='fill');
for(const mode of ['fallback','web-locks']){
    const disk=new Map();let deny=false;
    globalThis.localStorage={getItem:key=>disk.get(key)??null,setItem:(key,value)=>{
        if(deny&&['ds-review:question-attempts','ds-review:question-wrongs'].includes(key))throw Error('quota');
        disk.set(key,value);
    }};
    let queue=Promise.resolve(),lockCalls=0;
    Object.defineProperty(globalThis,'navigator',{configurable:true,value:mode==='web-locks'?{locks:{request(name,fn){
        assert.equal(name,'ds-review:practice-records');lockCalls++;
        const acquired=queue.then(fn);queue=acquired.catch(()=>{});return acquired;
    }}}:{}});
    globalThis.location={hash:'#practice/question'};
    globalThis.document={querySelector:()=>null,querySelectorAll:()=>[]};
    const a=await import(`../src/ui/practice.js?${mode}-a`),b=await import(`../src/ui/practice.js?${mode}-b`);
    const stored=key=>JSON.parse(disk.get('ds-review:'+key)??'[]');
    const current=()=>JSON.parse(disk.get('ds-review:practice-current'));
    const act=(tab,action,dataset={})=>tab.handlePracticeAction(action,{dataset},()=>{});
    function select(tab,id){act(tab,'quiz-select',{id});return current().question;}
    function answer(tab,value){
        tab.savePracticeInput({target:{closest:()=>({id:'practice-answer',elements:{namedItem:name=>({value:value[Number(name.split('-')[1])]??''})}})}});
        act(tab,'quiz-grade');
    }
    for(const action of ['theme','open-search','apply-lab'])assert.equal(act(a,action),false);
    const bad=['incorrect-test-answer'];
    const q=select(a,first.id);answer(a,bad);
    if(mode==='fallback')assert.equal(stored('question-attempts').length,1);
    select(b,second.id);answer(b,bad);await queue;
    assert.deepEqual(stored('question-attempts').map(e=>e.templateId),[first.id,second.id]);
    assert.deepEqual(stored('question-wrongs').map(e=>e.question.id),[first.id,second.id]);
    assert.equal(a.practiceStats().graded,2);
    act(b,'quiz-wrong-retry',{id:q.instanceId});
    answer(b,q.answers.map(f=>f.accepted[0]));await queue;
    assert.equal(stored('question-wrongs').find(e=>e.instanceId===q.instanceId).resolved,true);
    act(a,'quiz-master',{id:q.instanceId,resolved:'false'});
    act(a,'quiz-master',{id:q.instanceId,resolved:'false'});await queue;
    assert.equal(stored('question-wrongs').find(e=>e.instanceId===q.instanceId).resolved,false);
    act(a,'quiz-mark-wrong');act(a,'quiz-mark-wrong');await queue;
    assert.equal(stored('question-wrongs').filter(e=>e.instanceId===q.instanceId).length,1);
    act(a,'quiz-self',{value:'0.5'});act(a,'quiz-self',{value:'1'});await queue;
    const records=stored('question-attempts');
    assert.equal(records.length,3);
    assert.equal(new Set(records.map(x=>x.attemptId)).size,3);
    assert.equal(records.find(x=>x.attemptId===current().attemptId).correct,true);
    assert.equal(stored('question-wrongs').length,2);
    deny=true;const failed=select(a,second.id);answer(a,bad);await queue;
    assert.equal(stored('question-attempts').length,3);
    assert.equal(a.practiceStats().graded,4);
    deny=false;select(b,first.id);answer(b,bad);await queue;
    act(a,'quiz-mark-wrong');await queue;
    assert(stored('question-wrongs').some(w=>w.instanceId===failed.instanceId));
    assert.equal(a.practiceStats().graded,5);
    if(mode==='web-locks')assert(lockCalls>=9);
    console.log('Practice two-tab storage regression passed:',mode);
}
