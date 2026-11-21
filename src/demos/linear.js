import { config, trace, row, numbers, integer, needs, graphOfList } from './course-shared.js';

export const listConfig=config('链表实验',{nodes:'3,4,5,5,5,6',mode:'unique',position:'0',value:'2'},[['nodes','数据序列'],['mode','操作',[['unique','双向循环表有序去重'],['insert','单链表按下标插入'],['delete','单链表按下标删除'],['reverse','单链表反转']]],['position','0 基操作位置'],['value','插入值']],'至多 12 项。去重要求非降序；图的箭头是实际 next/prev 链接。',[['空表',{nodes:'',mode:'reverse'}],['首项插入',{nodes:'3,4',mode:'insert'}],['尾项删除',{nodes:'1,2',mode:'delete',position:'1'}]]);
export function list(d) {
    const a=numbers(d.nodes,12).map((value,i)=>({id:`N${i}`,value})),t=trace(['检查前置条件并定位','保存后继 / 临时指针','修改链接','继续扫描 / 返回']);
    const mark=(text,line=0,links=a)=>t.mark(text,[row('逻辑序列',a.map(x=>x.value))],a.map(x=>x.value),line,{network:graphOfList(links,d.mode==='unique')});mark('初始链表。');
    if(d.mode==='unique') {needs(a.every((x,i)=>!i||a[i-1].value<=x.value),'有序去重需要非降序序列。');for(let i=0;i+1<a.length;) {mark(`比较 ${a[i].id} 与后继 ${a[i+1].id}。`,1);if(a[i].value===a[i+1].value){const id=a[i+1].id;a.splice(i+1,1);mark(`摘下 ${id}，同时修复 next / prev；释放被删结点。`,2);}else i++;}}
    else if(d.mode==='insert') {const p=integer(d.position,0,a.length,'插入位置'),value=integer(d.value,-999,999,'插入值');needs(a.length<12,'已达显示容量 12。');mark(`定位前驱 ${p?a[p-1].id:'head'}，先保存原后继 ${a[p]?.id??'NULL'}。`,1);a.splice(p,0,{id:'NEW',value});mark('新结点先连旧后继，前驱再连新结点。',2);}
    else if(d.mode==='delete'){needs(a.length>0,'空表没有可删除的数据结点。');const p=integer(d.position,0,a.length-1,'删除位置');mark(`保存被删结点 ${a[p].id} 的后继。`,1);a.splice(p,1);mark('前驱越过被删结点连接后继，再释放结点。',2);}
    else {const old=[...a],rev=[];while(old.length){const x=old.shift();rev.unshift(x);const network={nodes:[{id:'H',label:'head'},...a.map(x=>({id:x.id,label:x.value}))],edges:[...rev.slice(0,-1).map((x,i)=>({from:x.id,to:rev[i+1].id,label:'next'})),...old.slice(0,-1).map((x,i)=>({from:x.id,to:old[i+1].id,label:'next'}))],directed:true};t.mark(`保存 next=${old[0]?.id??'NULL'}；${x.id}.next 改指 prev=${rev[1]?.id??'NULL'}。`,[row('已反转段',rev.map(x=>x.value)),row('待处理段',old.map(x=>x.value))],rev.map(x=>x.value),2,{network});}a.splice(0,a.length,...rev);}
    mark('操作完成，检查链接与逻辑序列。',3);return t.finish();
}
export const queueConfig=config('循环队列',{capacity:'5',operations:'enq:1,enq:2,enq:3,enq:4,enq:5,enq:6,deq,deq,enq:6,enq:7'},[['capacity','数组槽数（全部可用）'],['operations','操作：enq:值 / deq，逗号分隔']],'front 指队头，rear 指最后一个已入队元素；count 区分空满。容量 1..12，至多 40 次操作。空队列时 rear 仅保留为下一次入队的参考位置。',[['填满全部槽位',{operations:'enq:1,enq:2,enq:3,enq:4,enq:5'}],['清空后再出队',{operations:'enq:1,deq,deq'}],['单槽回绕',{capacity:'1',operations:'enq:1,enq:2,deq,enq:3'}]]);
export function queue(d) {
    const m=integer(d.capacity,1,12,'槽数'),ops=d.operations.split(/[,，]/).map(x=>x.trim()).filter(Boolean),a=Array(m).fill('·');
    const t=trace(['初始化 front=0、rear=m−1、count=0','count==m 时满；否则 rear=(rear+1)%m，写入，count++','count==0 时空；否则读取 front，front=(front+1)%m，count--']);
    needs(ops.length<=40,'最多 40 次操作。');let f=0,r=m-1,count=0;
    const mark=(s,l)=>t.mark(s,[row('物理槽位（高亮队头与队尾）',a,count?[f,r]:[]),row('front / rear / count',[f,r,count])],Array.from({length:count},(_,k)=>a[(f+k)%m]),l);
    mark('空队列：count=0。rear 初始为 m−1，首次入队先推进到槽 0。',0);
    for(const op of ops) {
        if(op==='deq') {
            if(count===0)mark('出队失败：count=0，队列为空，状态不变。',2);
            else {const x=a[f];a[f]='·';f=(f+1)%m;count--;mark(`出队 ${x}，front=${f}，count=${count}${count===0?'，队列已空':''}。`,2);}
        } else {
            needs(/^enq:[+-]?\d+$/.test(op),'操作须为 enq:整数 或 deq。');const x=integer(op.slice(4),-999,999,'入队值');
            if(count===m)mark(`入队 ${x} 失败：count=${m}，全部 ${m} 个槽位已占用。`,1);
            else {r=(r+1)%m;a[r]=x;count++;mark(`rear 先推进到 ${r}，在该槽写入 ${x}；rear 指向队尾，count=${count}。`,1);}
        }
    }
    return t.finish();
}

export const expressionConfig=config('表达式输入',{expression:'8-(3-2)*2'},[['expression','非负整数与二元 + - * /、括号']],'不支持一元符号，可写 (0-3)；整数除法向 0 截断，拒绝除零和非法语法。',[['左结合',{expression:'8-3-2'}],['多位数与整数除法',{expression:'(12+5)/3'}]]);
export function expression(d){const s=d.expression;needs(s.length<=100&&s.trim(),'请输入 1..100 字符表达式。');const t=trace(['扫描一个数字并压入操作数栈','压入左括号 / 运算符','弹出右操作数 b 和左操作数 a，归约','结束时验证只剩一个值']),values=[],operators=[];let expect=true,i=0;const prec=c=>'+-'.includes(c)?1:'*/'.includes(c)?2:0,mark=(text,l)=>t.mark(text,[row('输入（下标为码元位置）',[...s],[i]),row('操作数栈（右为栈顶）',values),row('操作符栈（右为栈顶）',operators)],values,l),reduce=()=>{const op=operators.pop();needs(values.length>=2&&prec(op),'缺少操作数或括号不匹配。');const b=values.pop(),a=values.pop();needs(!(op==='/'&&b===0),'除数不能为 0。');const v=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:Math.trunc(a/b);needs(Number.isSafeInteger(v),'计算超出 JavaScript 安全整数范围。');values.push(v);mark(`先弹右 b=${b}，再弹左 a=${a}；${a} ${op} ${b} = ${v}。`,2);};mark('初始化两个空栈。',0);while(i<s.length){const c=s[i];if(/\s/.test(c)){i++;continue;}if(/\d/.test(c)){needs(expect,'两个操作数之间缺少运算符。');const m=s.slice(i).match(/^\d+/)[0],v=Number(m);needs(Number.isSafeInteger(v),'数字超出安全整数范围。');values.push(v);mark(`读取完整整数 ${v} 并入栈。`,0);i+=m.length;expect=false;continue;}if(c==='('){needs(expect,'左括号前缺少运算符。');operators.push(c);mark('左括号入栈。',1);}else if(c===')'){needs(!expect,'右括号前缺少操作数。');while(operators.length&&operators.at(-1)!=='(')reduce();needs(operators.at(-1)==='(','多余右括号。');operators.pop();mark('匹配并弹出左括号。',1);}else{needs(prec(c)&&!expect,'只支持非负整数和二元 + - * /；此处缺少操作数或字符非法。');while(operators.length&&operators.at(-1)!=='('&&prec(operators.at(-1))>=prec(c))reduce();operators.push(c);expect=true;mark(`运算符 ${c} 入栈。`,1);}i++;}needs(!expect,'表达式末尾缺少操作数。');while(operators.length){needs(operators.at(-1)!=='(','缺少右括号。');reduce();}needs(values.length===1,'表达式未归约为单一值。');mark('表达式求值完成。',3);return t.finish();}

export const pascalConfig=config('杨辉三角',{rows:'5'},[['rows','输出行数']],'1..12 行，第 0 行为 1。');
export function pascal(d){const n=integer(d.rows,1,12,'行数'),t=trace(['输出当前行','固定旧行长度，左右补零','出队当前值，与前一个值相加','新行替换旧行']),out=[];let q=[1];for(let r=0;r<n;r++){out.push(q.join(' '));t.mark(`输出第 ${r} 行。`,[row('旧行队列',q)],out,0);if(r===n-1)break;const next=[];let prev=0;for(let j=0;j<=q.length;j++){const cur=q[j]??0;next.push(prev+cur);t.mark(`旧项 ${j}：${prev}+${cur}=${prev+cur}，写入新行尾部。`,[row('尚未出队',q.slice(j+1)),row('新行队列',next)],out,2);prev=cur;}q=next;t.mark('新行生成完毕。',[row('新队列',q)],out,3);}return t.finish();}
