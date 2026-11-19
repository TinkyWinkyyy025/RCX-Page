const playwright=require('playwright');
const fs=require('node:fs');
const base=process.env.RCX_QA_URL||'http://127.0.0.1:8123';
const brands=JSON.parse(fs.readFileSync('brand-data.json','utf8'));
const routes=['/','/about-us/','/portfolio/','/join-us/','/contact-us/','/news/',...Object.keys(brands).map(s=>`/portfolio/${s}/`)];
const widths=(process.env.RCX_QA_WIDTHS||'320,360,390,430,600,640,768,900,901,1024,1280,1440,1920,2560').split(',').map(Number);
const engine=process.env.RCX_QA_ENGINE||'chromium';
(async()=>{
 const browser=await playwright[engine].launch(engine==='chromium'?{channel:'chrome'}:{});
 const results=[],errors=[];
 const context=await browser.newContext({reducedMotion:'reduce'});
 await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
 const queue=routes.flatMap(path=>widths.map(width=>({path,width})));
 await Promise.all(Array.from({length:4},async()=>{
  const page=await context.newPage();page.on('pageerror',e=>errors.push({url:page.url(),message:e.message}));
  while(queue.length){const {path,width}=queue.shift();await page.setViewportSize({width,height:900});await page.goto(base+path,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   const result=await page.evaluate(()=>{
    const bad=[],tiny=[];
    const selector='main h1,main h2,main h3,main p,main button,main input,main select,main textarea,main address,main dt,main dd,.hero-stat-num,.hero-stat-label';
    for(const e of document.querySelectorAll(selector)){
     const rect=e.getBoundingClientRect();if(!rect.width||!rect.height||e.closest('.brands-carousel-wrapper,dialog:not([open])'))continue;
     const style=getComputedStyle(e);if(style.visibility==='hidden')continue;
     const name=e.tagName+'.'+[...e.classList].join('.');
     if(rect.left < -2||rect.right>innerWidth+2)bad.push({name,kind:'outside viewport',left:Math.round(rect.left),right:Math.round(rect.right),text:e.textContent.trim().slice(0,70)});
     if(e.clientWidth&&e.scrollWidth>e.clientWidth+2&&style.whiteSpace!=='nowrap')bad.push({name,kind:'inner overflow',scroll:e.scrollWidth,client:e.clientWidth,text:e.textContent.trim().slice(0,70)});
     if(!e.matches('input,textarea,select')){
      const range=document.createRange();range.selectNodeContents(e);
      if([...range.getClientRects()].some(r=>r.width>0&&(r.left < -2||r.right>innerWidth+2)))bad.push({name,kind:'text outside viewport',text:e.textContent.trim().slice(0,70)});
     }
     if(e.textContent.trim()&&parseFloat(style.fontSize)<11)tiny.push({name,size:style.fontSize,text:e.textContent.trim().slice(0,50)});
    }
    return {docWidth:document.documentElement.scrollWidth,viewport:innerWidth,bad,tiny};
   });
   results.push({path,width,...result});
   if(width===320&&['/','/about-us/','/portfolio/','/contact-us/','/portfolio/paperkite-chicken-beer/'].includes(path))await page.screenshot({path:`output/playwright/responsive-${engine}-${path.replaceAll('/','_')||'home'}-320.png`,fullPage:true});
  }await page.close();
 }));
 const report={base,engine,checks:results.length,errors,results};const target=new URL(base).hostname==='127.0.0.1'?'':'-live';fs.writeFileSync(`output/playwright/responsive-audit-${engine}${target}.json`,JSON.stringify(report,null,2));
 const failing=results.filter(r=>r.docWidth>r.width+1||r.bad.length);
 console.log(JSON.stringify({checks:results.length,errors,failures:failing.map(r=>({path:r.path,width:r.width,docWidth:r.docWidth,bad:r.bad})),tinyExamples:results.filter(r=>r.width===320&&r.tiny.length).slice(0,6).map(r=>({path:r.path,tiny:r.tiny}))},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
