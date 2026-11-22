import { practiceTemplates, instantiate, seeded, gradeObjective } from './bank.js';

export const isObjective=q=>['single','multiple','fill'].includes(q.type);
export function pickQuestion(id,previous=null) {
    let q;
    for(let i=0;i<40;i++) {
        const seed=globalThis.crypto?.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]:Math.floor(Math.random()*4294967296);
        q=instantiate(id,seed);
        if(!q.parametric||!previous||JSON.stringify([q.stem,q.options])!==JSON.stringify([previous.stem,previous.options]))break;
    }
    return q;
}
export function createExam(seed,now=Date.now(),minutes=120) {
    const r=seeded(seed),take=(type,n)=>{
        const pool=practiceTemplates.filter(t=>type==='choice'?['single','multiple'].includes(t.type):t.type===type);
        for(let i=pool.length-1;i>0;i--){const j=r(0,i);[pool[i],pool[j]]=[pool[j],pool[i]];}
        return pool.slice(0,n);
    };
    const chosen=[...take('single',4),...take('multiple',4),...take('fill',8),...take('calculation',4),...take('programming',2)];
    const points=[...Array(8).fill(3),2,2,4,6,2,2,4,4,5,5,7,8,10,15];
    return {id:`exam-${now}-${seed>>>0}`,seed:seed>>>0,startedAt:now,deadline:now+minutes*60000,submitted:false,index:0,
        questions:chosen.map((t,i)=>({question:instantiate(t.id,r(1,2147483647)),points:points[i],answer:isObjective(t)?[]:'',result:null,revealed:false}))};
}
export function submitExam(exam,now=Date.now()) {
    if(exam.submitted)return exam;
    exam.submitted=true;exam.finishedAt=now;
    for(const item of exam.questions)if(isObjective(item.question))item.result=gradeObjective(item.question,item.answer,item.points);
    return exam;
}
export function examTotals(exam) {
    let objective=0,subjective=0,pending=0;
    for(const item of exam.questions){if(isObjective(item.question))objective+=item.result?.score||0;else if(item.result)subjective+=item.result.score;else pending++;}
    return {objective:Math.round(objective*100)/100,subjective:Math.round(subjective*100)/100,pending,total:Math.round((objective+subjective)*100)/100};
}
// 从种子恢复可信题目，不把导入文件中的 HTML 当作页面内容。
export function restoreQuestion(q){if(!q||typeof q.id!=='string'||!Number.isInteger(q.seed)||q.seed<0||q.seed>4294967295)throw new Error('题目种子或编号无效。');return instantiate(q.id,q.seed);}
export function restoreExam(raw) {
    if(!raw||!Array.isArray(raw.questions)||raw.questions.length!==22||!Number.isFinite(raw.deadline)||!Number.isFinite(raw.startedAt)||typeof raw.submitted!=='boolean'||raw.deadline<raw.startedAt||raw.deadline-raw.startedAt>86400000)throw new Error('模拟考试数据格式无效。');
    const exam={...raw,index:Math.max(0,Math.min(21,Number(raw.index)||0)),questions:raw.questions.map((item,i)=>{
        const q=restoreQuestion(item.question);if(i<8?!['single','multiple'].includes(q.type):i<16?q.type!=='fill':i<20?q.type!=='calculation':q.type!=='programming')throw new Error('模拟卷题型结构无效。');const points=[...Array(8).fill(3),2,2,4,6,2,2,4,4,5,5,7,8,10,15][i];
        const answer=isObjective(q)?(Array.isArray(item.answer)?item.answer.map(String).slice(0,8):[]):String(item.answer||'').slice(0,20000);
        const result=raw.submitted?(isObjective(q)?gradeObjective(q,answer,points):item.result?{score:Math.max(0,Math.min(points,Number(item.result.score)||0)),max:points,correct:Number(item.result.score)===points,self:true}:null):null;
        return {question:q,points,answer,result,revealed:!!item.revealed};
    })};
    return exam;
}
