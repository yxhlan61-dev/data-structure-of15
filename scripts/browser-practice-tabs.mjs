import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch(process.env.BROWSER_EXECUTABLE?
    {executablePath:process.env.BROWSER_EXECUTABLE,headless:true}:
    {channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
try {
    const context=await browser.newContext();
    const [a,b]=await Promise.all([context.newPage(),context.newPage()]);
    const errors=[];
    for(const page of [a,b])page.on('pageerror',error=>errors.push(error.message));
    const root=new URL('/#practice/catalog',process.env.TEST_URL||'http://127.0.0.1:8000/');
    await Promise.all([a.goto(root.href),b.goto(root.href)]);
    async function select(page,id){
        await page.locator(`[data-action="quiz-select"][data-id="${id}"]`).click();
        await page.waitForSelector('#practice-answer');
        await page.locator('#practice-answer input').first().fill('incorrect-test-answer');
    }
    const ids=['fill-loop','fill-complexity'];
    await Promise.all([select(a,ids[0]),select(b,ids[1])]);
    await Promise.all([a.locator('[data-action=quiz-grade]').click(),b.locator('[data-action=quiz-grade]').click()]);
    await a.waitForFunction(()=>['question-attempts','question-wrongs'].every(k=>JSON.parse(localStorage.getItem('ds-review:'+k)||'[]').length===2));
    const state=await b.evaluate(()=>['question-attempts','question-wrongs'].map(k=>JSON.parse(localStorage.getItem('ds-review:'+k))));
    for(const entries of state)assert.deepEqual(entries.map(x=>x.templateId??x.question.id).sort(),[...ids].sort());
    await b.goto(new URL('/#practice/wrong',root).href);
    await b.waitForSelector('[data-action=quiz-master]');
    await a.goto(root.href);
    await select(a,'fill-next');
    await a.locator('[data-action=quiz-grade]').click();
    await b.waitForFunction(()=>document.querySelectorAll('[data-action=quiz-master]').length===3);
    assert.deepEqual(errors,[]);
    console.log('Practice two-tab browser regression passed');
} finally {await browser.close();}
