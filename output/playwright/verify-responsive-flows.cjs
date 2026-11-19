const pw=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.RCX_QA_URL||'http://127.0.0.1:8123';
const engine=process.env.RCX_QA_ENGINE||'chromium';
const brands=JSON.parse(fs.readFileSync('brand-data.json','utf8'));
(async()=>{const b=await pw[engine].launch(engine==='chromium'?{channel:'chrome'}:{});const c=await b.newContext({reducedMotion:'reduce',hasTouch:true});await c.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));let checks=0;
for(const [width,height] of [[320,568],[390,844],[768,1024],[844,390],[900,600],[901,600],[1440,900]]){
 await p.setViewportSize({width,height});await p.goto(base+'/join-us/');await p.evaluate(()=>document.fonts.ready);
 const toggle=p.locator('.menu-toggle');
 if(await toggle.isVisible()){
  const target=await toggle.boundingBox();assert.ok(target.width>=44&&target.height>=44);
  await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');await p.locator('.portfolio-toggle').click();
  const last=p.locator('.site-nav > a').last();await last.scrollIntoViewIfNeeded();
  assert.ok(await last.evaluate(e=>{const r=e.getBoundingClientRect(),n=e.closest('.site-nav').getBoundingClientRect();return r.top>=n.top&&r.bottom<=n.bottom+1&&r.bottom<=innerHeight+1}),'menu last link reachable');
  await p.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-label'),'Open menu');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 }
 await p.locator('.job-card-header').first().click();await p.waitForTimeout(50);assert.ok(await p.locator('.job-card.open .job-card-body').evaluate(e=>e.scrollHeight<=e.clientHeight+1),'job content cropped');
 for(const path of ['/contact-us/','/join-us/']){
  await p.goto(base+path);const f=p.locator('.rcx-form');await f.locator('[type=submit]').click();assert.ok(await f.locator('[aria-invalid=true]').count());
  assert.ok(await f.locator('.rcx-field input,.rcx-field select,.rcx-field textarea').evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.height>=44&&parseFloat(getComputedStyle(e).fontSize)>=16})),`form field bounds ${path} ${width} ${engine}`);
 }
 checks++;
}
for(const [width,height]of[[320,568],[844,390]]){
 await p.setViewportSize({width,height});
 for(const slug of Object.keys(brands)){
  await p.goto(`${base}/portfolio/${slug}/`);const trigger=p.locator('[data-brand-photo]').first();await trigger.click();
  await p.waitForFunction(()=>document.querySelector('[data-brand-enlarged]').getAttribute('aria-busy')==='false');
  await p.locator('[data-brand-enlarged]').evaluate(e=>e.decode());
  const dialog=p.locator('.brand-lightbox');
  assert.ok(await dialog.evaluate(e=>{const r=e.getBoundingClientRect(),a=e.querySelector('[data-brand-close]').getBoundingClientRect(),n=e.querySelector('[data-brand-next]').getBoundingClientRect(),i=e.querySelector('[data-brand-enlarged]').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight+1&&e.scrollHeight<=e.clientHeight+1&&a.top>=r.top&&a.bottom<=r.bottom&&(e.querySelector('.brand-lightbox__controls').hidden||n.bottom<=r.bottom)&&i.height>50}),slug+' gallery bounds '+width+' '+engine);
  if(width===844&&slug==='paperkite-chicken-beer'){await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.screenshot({path:`output/playwright/responsive-gallery-${engine}-landscape.png`});}
  if(brands[slug].gallery.length>1){await p.keyboard.press('ArrowRight');await p.waitForFunction(()=>document.querySelector('[data-brand-enlarged]').getAttribute('aria-busy')==='false');assert.ok((await p.locator('[data-brand-counter]').textContent()).startsWith('2 /'));}
  await p.keyboard.press('Escape');assert.equal(await dialog.isVisible(),false);await p.waitForFunction(()=>document.body.style.overflow==='');checks++;
 }
}
await p.setViewportSize({width:390,height:844});await p.goto(base);await p.locator('.hero-footer').screenshot({path:`output/playwright/responsive-home-stats-${engine}.png`});
assert.ok(await p.locator('.hero-stat-label').evaluateAll(es=>es.every(e=>parseFloat(getComputedStyle(e).fontSize)>=12)));
assert.deepEqual(errors,[]);console.log(JSON.stringify({base,engine,checks,errors}));await b.close();})().catch(e=>{console.error(e);process.exit(1)});
