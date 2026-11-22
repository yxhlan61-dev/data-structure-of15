// 可使用已安装的 Playwright，或通过 PLAYWRIGHT_MODULE 指向其包目录。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto(process.env.TEST_URL||'http://127.0.0.1:8000');
    const catalog=await page.evaluate(async()=>{
        const {chapters}=await import('/src/chapters/course.js');
        return chapters.map(c=>({number:c.number,topics:c.topics.map(t=>t.id),demos:c.demos.map(d=>d.id),codes:(c.lessons||[{id:'tree'},{id:'heap'}]).map(x=>x.id)}));
    });
    let routes=0;
    const go=async hash=>{await page.evaluate(h=>location.hash=h,hash);await page.waitForFunction(h=>location.hash.slice(1)===h&&document.querySelector('h1')?.textContent.length>0,hash);await page.waitForTimeout(25);};
    for(const c of catalog){
        for(const hash of ['chapter/'+c.number,...c.topics,...c.codes.map(x=>'code/'+c.number+'/'+x),'chapter/'+c.number+'/lab']){
            await go(hash);assert.equal(await page.locator('#chapter-select').inputValue(),c.number,hash);assert((await page.locator('h1').textContent()).length);routes++;
        }
        for(const id of c.demos){
            await go('lab/'+id);await page.waitForSelector('#step-count');
            assert.equal(await page.locator('#speed').inputValue(),'0.5');
            assert.equal(await page.locator('#speed option[value="4"]').count(),1);
            const before=await page.locator('#stage-view').innerHTML();
            await page.locator('[data-action=step-next]').click();await page.locator('[data-action=step-back]').click();
            assert.equal(await page.locator('#stage-view').innerHTML(),before,id+' back');
            await page.locator('[data-action=play]').click();await page.locator('[data-action=play]').click();
            await page.locator('[data-action=reset]').click();assert((await page.locator('#step-count').textContent()).startsWith('步骤 0 /'));routes++;
        }
    }
    await go('chapter/05');
    assert.equal(await page.locator('#sidebar a[href="#lab"],#sidebar a[href="#code"]').count(),0);
    assert.equal(await page.locator('#main a[href*="/lab"],#main a[href*="/code"]').count(),0);
    await go('code/05/address');assert.equal(await page.locator('h1').textContent(),'数组与广义表');
    for(const id of ['complexity','polynomial','address','sparse','generalized']){await go('lab/'+id);assert.equal(await page.locator('#lab-form').count(),0);}
    await go('lab/matching');assert((await page.locator('[name=mode]').textContent()).includes('BF（暴力匹配）'));
    assert((await page.locator('[name=mode]').textContent()).includes('KMP（模式匹配'));
    await go('lab/queue');for(let i=0;i<5;i++)await page.locator('[data-action=step-next]').click();
    assert.deepEqual(await page.locator('#lab-output .token').allTextContents(),['1','2','3','4','5']);
    assert(!(await page.locator('#step-text').textContent()).includes('失败'));
    await go('lab/hash');assert.equal(await page.locator('[name=mode] option').count(),2);
    assert(!/get|del/.test(await page.locator('[name=operations]').inputValue()));
    await page.locator('[name=operations]').fill('get:1');await page.locator('#lab-form button[type=submit]').click();assert(await page.locator('#lab-error').isVisible());
    await go('lab/critical-path');assert.equal(await page.locator('.trace-table').count(),2);
    assert.equal(await page.locator('.trace-table').nth(1).locator('tbody tr').count(),10);
    while(!await page.locator('[data-action=step-next]').isDisabled())await page.locator('[data-action=step-next]').click();
    assert.equal(await page.locator('#lab-output .token').count(),2);
    assert((await page.locator('#lab-output').textContent()).includes('总工期 12'));
    if(process.env.SCREENSHOT_DIR)await page.screenshot({path:process.env.SCREENSHOT_DIR+'/ds-critical-path-desktop.png',fullPage:true});
    await page.locator('#speed').selectOption('4');assert.equal(await page.locator('#speed').inputValue(),'4');
    await go('ch02-doubly');await page.locator('[data-action=learn]').click();await page.locator('[data-action=mistake]').click();await page.reload();
    assert.equal(await page.locator('[data-action=learn]').getAttribute('aria-pressed'),'true');
    await go('ch07-dijkstra');await page.locator('[data-action=learn]').click();await page.reload();
    assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('ds-review:learned')).includes('ch02-doubly')));
    await go('mistakes');assert((await page.locator('#main').textContent()).includes('双向循环链表'));
    await page.locator('[data-action=search]').click();await page.locator('#search-input').fill('KMP');assert((await page.locator('#search-results').textContent()).includes('KMP'));
    await page.keyboard.press('Escape');assert.equal(await page.locator('#search-dialog').isVisible(),false);
    await page.locator('#chapter-select').selectOption('04');await page.waitForTimeout(50);assert.equal(await page.locator('h1').textContent(),'串');
    await go('lab/matching');await page.locator('[name=pattern]').fill('');await page.locator('#lab-form button[type=submit]').click();assert.equal(await page.locator('#lab-error').isVisible(),false);
    if(process.env.SCREENSHOT_DIR)await page.screenshot({path:process.env.SCREENSHOT_DIR+'/ds-kmp-desktop.png',fullPage:true});
    await go('lab/dijkstra');await page.locator('[name=edges]').fill('A:B:-1');await page.locator('#lab-form button[type=submit]').click();assert(await page.locator('#lab-error').isVisible());
    await page.locator('[data-action=theme]').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.setViewportSize({width:390,height:844});await go('ch09-basics');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
    if(process.env.SCREENSHOT_DIR)await page.screenshot({path:process.env.SCREENSHOT_DIR+'/ds-mobile-knowledge.png',fullPage:true});
    await page.locator('[data-action=menu][aria-expanded]').click();await page.locator('#chapter-select').selectOption('08');await page.waitForTimeout(50);assert.equal(await page.locator('h1').textContent(),'查找');
    await go('lab/avl');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile lab overflow');
    if(process.env.SCREENSHOT_DIR)await page.screenshot({path:process.env.SCREENSHOT_DIR+'/ds-mobile-avl.png',fullPage:true});
    await go('mistakes');await page.locator('[data-action=remove-mistake]').click();await page.reload();assert(!(await page.locator('#main').textContent()).includes('双向循环链表'));
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({routes,errors,localStorage:'passed',search:'passed',player:'passed',mobile:'passed',theme:'passed'}));
} finally {await browser.close();}
