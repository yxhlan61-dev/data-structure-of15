import { labs } from '../demos/index.js';
import { byId, demoHref, esc, icon } from './dom.js';
import { drawTree } from './tree.js';

let currentLab=null;
let timer=null;
let speed=1;
const demoInputs=new Map();
const selected=(a,b)=>a===b?' selected':'';

function renderFields(config,values) {
    return config.fields.map(([key,label,options])=>`<label>${label}${options?
        `<select name="${key}">${options.map(([v,t])=>`<option value="${v}"${selected(v,values[key])}>${esc(t)}</option>`).join('')}</select>`:
        `<input type="text" name="${key}" maxlength="220" value="${esc(values[key]||'')}" spellcheck="false" autocomplete="off">`}</label>`).join('');
}
export function openLab(id, chapter) {
    const { number, demos: demoInfo } = chapter;
    const lab=labs[id], config=lab.config, info=demoInfo.find(d=>d.id===id);
    const values=demoInputs.get(id)||config.default;
    currentLab={id,result:lab.run(values),step:0};
    byId('main').innerHTML=`<div class="title-row"><div><div class="eyebrow">第 ${number} 章 · 算法可视化</div><h1>${info.title}</h1><p>${info.desc}</p></div><a class="secondary" href="#${info.topicId}">${icon('book')}查看相关知识</a></div>
        <nav class="lab-tabs" aria-label="算法选择">${demoInfo.map(d=>`<a href="${demoHref(d.id)}" class="chip"${d.id===id?' aria-current="true"':''}>${d.title}</a>`).join('')}</nav>
        <div class="lab-grid">
          <section class="panel stage" aria-labelledby="stage-title">
            <div class="stage-head"><h2 id="stage-title">${config.stage}</h2><span class="mono" id="step-count"></span></div>
            <div class="stage-view" id="stage-view"></div>
            ${id==='traversal'?'<div class="stage-legend"><span><i></i>当前调用或已访问</span><span><i class="solid"></i>本步输出</span></div>':''}
            <div class="line-state"><div class="output-label" id="output-label"></div><div id="lab-output" class="status-chips" aria-labelledby="output-label"></div></div>
            <div class="step-strip"><p id="step-text" role="status"></p><div class="timeline" role="progressbar" aria-label="实验进度" aria-valuemin="0" id="timeline"><i></i></div>
              <div class="controls">
                <button class="primary" data-action="play" id="play-btn"></button>
                <button class="secondary" data-action="step-back" id="back-btn">上一步</button>
                <button class="secondary" data-action="step-next" id="next-btn">下一步</button>
                <button class="secondary" data-action="reset">${icon('reset')}重置</button>
                <select id="speed" aria-label="播放速度">${[0.5,1,1.5,2].map(n=>`<option value="${n}"${selected(n,speed)}>${n}×</option>`).join('')}</select>
              </div></div>
          </section>
          <div><section class="panel inspector"><div class="lab-inspect-head"><h2>伪代码与状态</h2></div><ol class="pseudo" id="algorithm-code"></ol>
            <div class="inspector-body"><h3 id="state-title"></h3><div id="state-items" class="status-chips"></div><p id="state-extra"></p></div></section>
          <section class="panel form-panel"><h2>${config.title}</h2><form id="lab-form" novalidate>
            ${renderFields(config,values)}<p class="form-help">${config.help}</p><p id="lab-error" class="form-error" role="alert" hidden></p>
            <div class="form-actions"><button class="primary" type="submit">应用输入</button>${(config.presets||[['载入示例',{}]]).map(([label],i)=>`<button class="secondary" type="button" data-action="preset" data-index="${i}">${label}</button>`).join('')}</div>
          </form></section></div>
        </div>`;
    updateFrame();
}
function tokens(items,fallback) {
    return items.length?items.map(x=>`<span class="token mono">${esc(x)}</span>`).join(''):`<span class="token">${fallback}</span>`;
}
function arrayMarkup(values,active) {
    return `<div class="array-view" aria-label="当前数组">${values.map((value,i)=>`<span class="mono ${active.includes(i)?'hot':''}">${esc(value)}<small>${i}</small></span>`).join('')}</div>`;
}
function updateFrame() {
    if (!currentLab) return;
    const {result,step}=currentLab;
    const frame=result.frames[step];
    const total=result.frames.length-1;
    byId('stage-view').innerHTML=frame.forestGraph?
        `<div class="paired-plots"><div><h3>原森林</h3>${drawTree(frame.graph,frame.primary,350)}</div><div><h3>二叉表示</h3>${drawTree(frame.forestGraph,frame.secondary,350)}</div></div>`:
        `${drawTree(frame.graph,frame,currentLab.id==='huffman'?650:550)}${frame.array?arrayMarkup(frame.array,frame.active):''}`;
    byId('step-count').textContent=`步骤 ${step} / ${total}`;
    byId('step-text').textContent=frame.explanation;
    const timeline=byId('timeline');
    timeline.setAttribute('aria-valuenow',String(step));
    timeline.setAttribute('aria-valuemax',String(total));
    timeline.firstElementChild.style.width=`${total?step/total*100:0}%`;
    byId('output-label').textContent=result.outputLabel;
    byId('lab-output').innerHTML=tokens(frame.output,'空');
    byId('state-title').textContent=frame.detailTitle;
    byId('state-items').innerHTML=tokens(frame.items,'空');
    byId('state-extra').textContent=frame.detail||'';
    byId('algorithm-code').innerHTML=result.code.map((line,i)=>`<li${i===frame.line?' class="hot" aria-current="step"':''}><span>${i+1}</span>${esc(line)}</li>`).join('');
    byId('back-btn').disabled=step===0;
    byId('next-btn').disabled=step===total;
    updatePlayButton();
}
function updatePlayButton() {
    const btn=byId('play-btn');
    if (!btn||!currentLab) return;
    const atEnd=currentLab.step===currentLab.result.frames.length-1;
    btn.innerHTML=timer?`${icon('pause')}暂停`:`${icon(atEnd?'reset':'play')}${atEnd?'重播':'播放'}`;
}
function pause() {
    if (timer!==null) { clearInterval(timer); timer=null; }
    updatePlayButton();
}
function moveStep(delta) {
    if(!currentLab) return;
    const last=currentLab.result.frames.length-1;
    currentLab.step=Math.min(last,Math.max(0,currentLab.step+delta));
    if(currentLab.step===last) pause();
    updateFrame();
}
function play() {
    if(!currentLab) return;
    if(timer!==null) { pause(); return; }
    if(currentLab.step===currentLab.result.frames.length-1) currentLab.step=0;
    timer=setInterval(()=>moveStep(1),690/speed);
    updateFrame();
}
export function applyLab(values) {
    if(!currentLab) return;
    pause();
    const {id}=currentLab;
    const error=byId('lab-error');
    try {
        const result=labs[id].run(values);
        demoInputs.set(id,values);
        currentLab={id,result,step:0};
        error.hidden=true;
        updateFrame();
    } catch (exception) {
        error.textContent=exception.message;
        error.hidden=false;
    }
}
function fillPreset(index) {
    const {id}=currentLab;
    const {config}=labs[id];
    const values={...config.default,...(config.presets?.[index]?.[1]||{})};
    const form=byId('lab-form');
    config.fields.forEach(([key])=>form.elements.namedItem(key).value=values[key]);
    applyLab(values);
}

export function closeLab() {
    pause();
    currentLab = null;
}

export function handleLabAction(action, index) {
    if (!currentLab) return;
    if (action === 'play') play();
    if (action === 'step-back') { pause(); moveStep(-1); }
    if (action === 'step-next') { pause(); moveStep(1); }
    if (action === 'reset') { pause(); currentLab.step = 0; updateFrame(); }
    if (action === 'preset') fillPreset(Number(index));
}

export function setLabSpeed(value) {
    speed = Number(value);
    if (timer !== null) { pause(); play(); }
}
