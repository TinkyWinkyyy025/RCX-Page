const pw = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.RCX_QA_URL || 'http://127.0.0.1:8123';
const engine = process.env.RCX_QA_ENGINE || 'chromium';
const brands = JSON.parse(fs.readFileSync('brand-data.json','utf8'));
const routes=['/','/about-us/','/portfolio/','/join-us/','/contact-us/','/news/',...Object.keys(brands).map(s=>`/portfolio/${s}/`)];
const launch=()=>pw[engine].launch(engine==='chromium'?{channel:'chrome'}:{});
(async()=>{
 const browser=await launch(), context=await browser.newContext({reducedMotion:'no-preference'});
 await context.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
 const page=await context.newPage(),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height] of [[1280,900],[375,812],[844,390]]){
  await page.setViewportSize({width,height});
  for(const route of (process.env.RCX_QA_TIMING_ONLY ? [] : routes)){
   await page.goto(base+route,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   await page.waitForFunction(()=>document.querySelector('.rcx-text-reveal'));
   assert.equal(await page.locator('rcx-word,rcx-text').count(),0,'text markup should remain intact');
   assert.equal(await page.locator('.rcx-text-reveal .rcx-text-reveal').count(),0,'nested entrances should never compound');
   assert.equal(await page.locator('form .rcx-text-reveal,nav .rcx-text-reveal,dialog .rcx-text-reveal,details .rcx-text-reveal').count(),0);
   assert.ok(await page.locator('h1').first().evaluate(e=>Number(getComputedStyle(e).opacity)>=.6),`hero readable during its entrance: ${route} ${width}`);
   if(route.startsWith('/portfolio/')&&route!=='/portfolio/'){
    assert.deepEqual(await page.locator('.brand-story__copy > p').allTextContents(),brands[route.split('/')[2]].story);
    assert.ok(await page.locator('.brand-story__paragraph').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')),'long story should be readable without delayed paragraph reveals');
   }
   // A fast jump must not strand invisible content above the viewport.
   await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
   await page.waitForFunction(()=>[...document.querySelectorAll('[data-text-reveal="pending"]')].every(e=>e.getBoundingClientRect().bottom>=0),null,{timeout:2000});
   assert.ok(await page.locator('[data-text-reveal="pending"]').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().bottom>=0)),'hidden content left behind after fast scroll');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
   results.push({route,width,height});
  }
 }
 const samples=[];
 for(const [width,height]of[[1280,900],[375,812]]){
  const timing=await context.newPage();await timing.setViewportSize({width,height});await timing.goto(base);await timing.evaluate(()=>document.fonts.ready);await timing.waitForFunction(()=>document.querySelector('.brands-title')?.dataset.textReveal==='pending');
  const sample=await timing.evaluate(async()=>{
   const e=document.querySelector('.brands-title');const events=[];
   ['animationstart','animationend','animationcancel'].forEach(name=>e.addEventListener(name,event=>events.push({name,animation:event.animationName,time:performance.now()})));
   const read=()=>({opacity:Number(getComputedStyle(e).opacity),transform:getComputedStyle(e).transform,clip:getComputedStyle(e).clipPath,animation:getComputedStyle(e).animationDuration,transition:getComputedStyle(e).transition,state:e.dataset.textReveal,play:e.dataset.motionPlay,time:performance.now(),active:e.getAnimations().map(a=>({type:a.constructor.name,time:a.currentTime,state:a.playState,name:a.animationName}))});
   const before=read();scrollTo({top:scrollY+e.getBoundingClientRect().top-(innerHeight-100),behavior:'instant'});
   await new Promise(resolve=>{const tick=()=>e.dataset.textReveal==='visible'?resolve():requestAnimationFrame(tick);tick()});
   const frames=[];for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,60));frames.push(read())}
   await new Promise(r=>setTimeout(r,400));const after=read();
   scrollTo({top:0,behavior:'instant'});await new Promise(r=>setTimeout(r,50));scrollTo({top:e.getBoundingClientRect().top-(innerHeight-100),behavior:'instant'});await new Promise(r=>setTimeout(r,70));const revisit=read();return {before,frames,after,revisit,events};
  });
  assert.equal(sample.before.opacity,0);assert.ok(sample.frames.some(f=>f.opacity>.2&&f.opacity<1),'no actual intermediate fade');
  assert.ok(sample.frames.every((f,i,a)=>!i||f.opacity>=a[i-1].opacity),JSON.stringify({error:'opacity should increase smoothly',width,frames:sample.frames,events:sample.events}));
  assert.ok(sample.frames.every(f=>f.clip==='none'),'text must never be masked');
  assert.equal(sample.after.opacity,1);assert.equal(sample.after.transform,'none');assert.equal(sample.revisit.opacity,1);
  samples.push({width,...sample});
  await timing.close();
 }
 // Late resource load events must not reset the reader's scroll position.
 await page.goto(base+'?scroll-check=1');await page.evaluate(()=>document.fonts.ready);
 const scroll=await page.evaluate(()=>{scrollTo({top:900,behavior:'instant'});const before=scrollY;dispatchEvent(new Event('load'));return {before,after:scrollY}});assert.equal(scroll.before,scroll.after);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.querySelector('[data-text-reveal="pending"]'));
 assert.ok(await page.locator('.rcx-text-reveal').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1'&&getComputedStyle(e).animationName==='none')));
 const reduced=await browser.newContext({reducedMotion:'reduce'}),r=await reduced.newPage();await r.goto(base+'/portfolio/dancing-fish/');await r.evaluate(()=>document.fonts.ready);assert.equal(await r.locator('.rcx-text-reveal').count(),0);await reduced.close();
 const plain=await browser.newContext({javaScriptEnabled:false}),n=await plain.newPage();await n.goto(base+'/portfolio/dancing-fish/');assert.ok(await n.locator('.brand-story__copy').isVisible());await plain.close();
 // Keyboard access reveals pending cards immediately; native hover resumes after entrance.
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'/portfolio/');await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>document.querySelector('.brand-card.rcx-text-reveal'));
 const card=page.locator('.brand-card').last();await card.focus();await page.waitForTimeout(30);assert.equal(await card.evaluate(e=>getComputedStyle(e).opacity),'1');
 await page.emulateMedia({media:'print'});assert.ok(await page.locator('.rcx-text-reveal').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')));
 assert.deepEqual(errors,[]);
 fs.writeFileSync(`output/playwright/natural-motion-${engine}.json`,JSON.stringify({base,engine,checks:results.length,errors,samples,scroll},null,2));
 console.log(JSON.stringify({base,engine,pages:routes.length,checks:results.length,errors,durations:samples.map(s=>({width:s.width,duration:s.frames[0].animation})),scroll}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
