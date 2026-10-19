const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),output=path.join(root,'tmp/city-performance-qa');
const base='https://www.aulatpchile.cl/ciudad_laboral_aulatp/';
const read=name=>fs.readFileSync(path.join(root,'city-panel',name));

(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:'msedge',args:['--enable-unsafe-swiftshader']});
 try{
  const report={artwork:{},runs:[]};
  for(const name of ['city-header-reference','panel-reference'])report.artwork[name]={before:read(`assets/${name}.png`).length,after:read(`assets/${name}.webp`).length};
  for(const optimized of process.argv.includes('--optimized-only')?[true]:[false,true]){
   const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[],failed=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('requestfailed',request=>failed.push({url:request.url(),reason:request.failure()?.errorText}));
   if(optimized){
    await page.route('**/panel-ui-v*/city-panel.js',route=>route.fulfill({contentType:'application/javascript',body:read('city-panel.js')}));
    await page.route('**/panel-ui-v*/city-panel.css',route=>route.fulfill({contentType:'text/css',body:read('city-panel.css')}));
    await page.route('**/panel-ui-v*/assets/*.webp',route=>route.fulfill({contentType:'image/webp',body:read('assets/'+new URL(route.request().url()).pathname.split('/').at(-1))}));
    await page.route('**/panel-ui-v*/assets/specialties/*.webp',route=>route.fulfill({contentType:'image/webp',body:read('assets/specialties/'+new URL(route.request().url()).pathname.split('/').at(-1))}));
   }
   await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
   try{await page.locator('.city-viewport canvas').waitFor({timeout:45000});}
   catch(error){
    console.error(JSON.stringify({optimized,errors,failed,canvas:await page.locator('canvas').count(),body:(await page.locator('body').innerText()).slice(0,1200)}));
    throw error;
   }
   await page.waitForTimeout(1500);
   const mode=optimized?'optimized':'baseline';
   await page.locator('.city-viewport canvas').screenshot({path:path.join(output,mode+'-scene.png')});
   await page.locator('.city-header').screenshot({path:path.join(output,mode+'-header.png')});
   const queries=await page.evaluate(async()=>{
    const query=document.querySelector,all=document.querySelectorAll;let searches=0;
    document.querySelector=function(selector){if(String(selector).includes('.city'))searches++;return query.call(this,selector);};
    document.querySelectorAll=function(selector){if(String(selector).includes('.city'))searches++;return all.call(this,selector);};
    const counter=document.createElement('span');counter.id='performance-hud';document.body.append(counter);
    try{
     await new Promise(resolve=>requestAnimationFrame(resolve));const before=searches;
     for(let i=0;i<50;i++){counter.textContent=String(i);await new Promise(resolve=>setTimeout(resolve,5));}
     return searches-before;
    }finally{document.querySelector=query;document.querySelectorAll=all;counter.remove();}
   });
   const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(item=>({url:item.name,encoded_bytes:item.encodedBodySize,duration_ms:Math.round(item.duration)})).sort((a,b)=>b.encoded_bytes-a.encoded_bytes));
   report.runs.push({mode,hud_rescan_queries:queries,errors,largest_resources:resources.slice(0,8)});
   fs.writeFileSync(path.join(output,'measurements.json'),JSON.stringify(report,null,2));
   if(optimized){
    const select=page.locator('.city-specialty-section .city-district-select select,.city-specialty-section select.city-district-select');
    const districts=await select.locator('option').evaluateAll(options=>options.map(option=>option.value));
    let specialties=0;
    for(const value of districts){
     await select.selectOption(value);
     await page.waitForFunction(()=>{const buttons=[...document.querySelectorAll('.city-specialties button')];return buttons.length>0&&buttons.every(button=>button.dataset.cityArt);});
     specialties+=await page.locator('.city-specialties button').count();
     await page.locator('.city-specialties').scrollIntoViewIfNeeded();
     for(const image of await page.locator('.city-specialty-photo').all())await image.scrollIntoViewIfNeeded();
     await page.waitForFunction(()=>[...document.querySelectorAll('.city-specialty-photo')].every(img=>img.complete&&img.naturalWidth>0));
     assert.equal(await page.locator('.city-specialties button:not([data-city-photo])').count(),0);
     if(await page.locator('[data-city-photo="aquaculture"]').count())await page.locator('.city-specialties').screenshot({path:path.join(output,'maritime-photos.png')});
    }
    report.specialties_verified=specialties;assert.equal(specialties,35);
    await page.locator('.city-viewport canvas').click({position:{x:80,y:180}});
    const before=await page.locator('.city-stage').getAttribute('data-player-z');
    await page.keyboard.down('ArrowUp');await page.waitForTimeout(350);await page.keyboard.up('ArrowUp');
    const after=await page.locator('.city-stage').getAttribute('data-player-z');assert.notEqual(before,after);
    await page.locator('.city-viewport canvas').screenshot({path:path.join(output,'optimized-moving-scene.png')});
    await page.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    await page.locator('.city-specialties').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,'mobile.png'),fullPage:true});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const baseline=report.runs.find(run=>run.mode==='baseline');
    if(baseline){const newErrors=errors.filter(error=>!baseline.errors.includes(error));assert.deepEqual(newErrors,[]);}
   }
   await context.close();
  }
  fs.writeFileSync(path.join(output,'measurements.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
