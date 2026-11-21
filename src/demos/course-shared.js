import { needs, toItems } from './shared.js';
export { needs, toItems };
export function numbers(input,max=16) {
    const raw=toItems(String(input));
    needs(raw.length<=max&&raw.every(s=>/^[+-]?\d+$/.test(s)&&Math.abs(Number(s))<=999),`请输入至多 ${max} 个 −999..999 的整数；空输入代表空序列。`);
    return raw.map(Number);
}
export function integer(value,lo,hi,name) {
    needs(/^[+-]?\d+$/.test(String(value).trim()),`${name}必须为整数。`);
    const n=Number(value); needs(n>=lo&&n<=hi,`${name}须在 ${lo}..${hi} 之间。`); return n;
}
export function trace(code,outputLabel='当前结果') {
    const frames=[];
    return {frames,mark(explanation,rows=[],output=[],line=0,extra={}) {
        frames.push(structuredClone({explanation,rows,output,line,detailTitle:'本步变量',items:[],active:[],...extra}));
    },finish(){return {frames,code,outputLabel};}};
}
export function config(title,defaults,fields,help,presets=[]) {
    return {title,default:defaults,fields,help,presets:[['默认示例',{}],...presets],stage:'算法执行与状态'};
}
export const row=(label,values,active=[])=>({label,values,active});
export const graphOfList = (a,doubly=false) => ({nodes:[{id:'H',label:'head'},...a.map(x=>({id:x.id,label:x.value}))],edges:[{from:'H',to:a[0]?.id??'H',label:'next'},...a.map((x,i)=>({from:x.id,to:a[i+1]?.id??(doubly?'H':'NULL'),label:'next'})),...(doubly?[...a.map((x,i)=>({from:x.id,to:i?a[i-1].id:'H',label:'prev'})),{from:'H',to:a.at(-1)?.id??'H',label:'prev'}]:[])].filter(e=>e.to!=='NULL'),directed:true});
