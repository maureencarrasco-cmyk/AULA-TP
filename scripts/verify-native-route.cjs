const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const output=path.resolve('tmp/native-route-qa'),root=path.resolve('city-panel');
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:'msedge',args:['--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  if(!process.argv.includes('--published')){
   await page.addInitScript({path:path.join(root,'engine/vendor/astar.js')});
   await page.addInitScript({path:path.join(root,'native-route.js')});
   const data=fs.readFileSync('tmp/city-world-active.js','utf8');
   const replacement='globalThis.AulaTPNativeRoute?.frame({scene:as,player:iE,indoors:iC,map:ij,specialty:iT,district:iF,room:i4,stations:i7?.stations??i6,phaseStations:i6,colliders:i3,floorY:(i4?.position.y??0)+.12,three:o}),ac.render(as,af),r9()';
   await page.route('**/259.*.js',route=>route.fulfill({contentType:'application/javascript',body:data.replace('ac.render(as,af),r9()',replacement)}));
   const learning=fs.readFileSync('tmp/city-learning-inspect.js','utf8');
   const anchor='localStorage.setItem((0,f.Ai)(w),JSON.stringify({...N,updatedAt:new Date().toISOString()}))';
   await page.route('**/335.*.js',route=>route.fulfill({contentType:'application/javascript',body:learning.replace(anchor,anchor+",window.dispatchEvent(new CustomEvent('aulatp:quiz-progress',{detail:{specialty:w.specialty,moduleId:w.moduleId,ae:w.ae,questions:w.questions.map(q=>({id:q.id,object:q.object})),answers:N.answers}}))")}));
   await page.route('**/panel-ui-v*/city-panel.css',route=>route.fulfill({contentType:'text/css',body:fs.readFileSync(path.join(root,'city-panel.css'))}));
   await page.route('**/panel-ui-v*/native-route.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(root,'native-route.js'))}));
   await page.route('**/panel-ui-v*/assets/quiz-observe-stage.png',route=>route.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(root,'assets/quiz-observe-stage.png'))}));
  }
  await page.goto('https://www.aulatpchile.cl/ciudad_laboral_aulatp/',{waitUntil:'domcontentloaded',timeout:60000});
  const select=page.locator('.city-specialty-section .city-district-select select');
  await select.waitFor({timeout:60000});await page.waitForFunction(()=>!document.querySelector('.city-specialty-section select').disabled,{},{timeout:60000});
  await select.selectOption('mecanica');
  await page.locator('.city-specialties button').filter({hasText:'Mecánica de Mantenimiento de Aeronaves'}).click({force:true});
  await page.waitForFunction(()=>Number(document.querySelector('.city-native-guide')?.dataset.arrows)>0,{},{timeout:60000});
  assert.ok((await page.locator('.city-native-guide').innerText()).includes('Quiz 1'));
  assert.equal(await page.locator('.city-quiz-route-entry').isVisible(),false);
  assert.equal(await page.evaluate(()=>{const button=document.createElement('button');button.className='city-door-action';button.dataset.cityQuizStation='true';document.querySelector('.city-viewport').append(button);const display=getComputedStyle(button).display;button.remove();return display}),'none');
  await page.evaluate(()=>{const original=AulaTPNativeRoute.frame;AulaTPNativeRoute.frame=context=>{window.__cityRouteContext=context;original(context)}});
  await page.waitForFunction(()=>window.__cityRouteContext?.phaseStations?.some(station=>station.phase==='observar'),{},{timeout:60000});
  const phaseNames=await page.evaluate(()=>window.__cityRouteContext.phaseStations.map(station=>station.phase).filter(phase=>['observar','planificar','verificar'].includes(phase)).sort());
  assert.deepEqual(phaseNames,['observar','planificar','verificar']);
  await page.waitForFunction(()=>{let visible=false;window.__cityRouteContext.scene.traverse(object=>{if(object.userData.cityObserveBanner&&object.userData.cityObserveArtworkLoaded&&object.visible&&object.material?.name==='Aula TP · arte Observar')visible=true});return visible},{},{timeout:30000});
  assert.equal(await page.evaluate(()=>{let visible=false;window.__cityRouteContext.scene.traverse(object=>{if(object.userData.cityObserveBanner&&object.userData.cityObserveArtworkLoaded&&object.visible&&object.material?.name==='Aula TP · arte Observar')visible=true});return visible}),true);
  await page.waitForFunction(()=>{const found=new Set();window.__cityRouteContext.scene.traverse(object=>{if(object.userData.cityQuizArtworkLoaded&&object.visible&&object.material?.name?.startsWith('Aula TP · arte '))found.add(object.userData.cityQuizBanner)});return ['observar','planificar','verificar'].every(phase=>found.has(phase))},{},{timeout:30000});
  const keyHint=page.locator('.city-native-guide kbd');assert.equal(await keyHint.evaluate(element=>element.textContent),'E');assert.equal(await keyHint.isVisible(),true);assert.match(await keyHint.getAttribute('aria-label'),/Presiona E/);
  assert.notEqual(await keyHint.evaluate(element=>getComputedStyle(element).boxShadow),'none');
  const renderedPhases=await page.evaluate(()=>{const found=new Set();window.__cityRouteContext.scene.traverse(object=>{if(object.userData.cityQuizArtworkLoaded&&object.visible&&object.material?.name?.startsWith('Aula TP · arte '))found.add(object.userData.cityQuizBanner)});return [...found].sort()});
  assert.deepEqual(renderedPhases,['observar','planificar','verificar']);
  const quizArtwork=await page.evaluate(()=>{const dialog=document.createElement('dialog'),list=document.createElement('ol'),step=document.createElement('li');dialog.className='floor-station-dialog';list.className='floor-route-progress';step.innerHTML='<span>1</span>Observar';list.append(step);dialog.append(list);document.documentElement.classList.add('city-native-route-active');document.body.append(dialog);const image=getComputedStyle(step,'::before').backgroundImage;dialog.remove();return image});
  assert.match(quizArtwork,/quiz-observe-stage\.png/);
  const layout=await page.evaluate(()=>{const dialog=document.createElement('dialog');dialog.className='floor-station-dialog';dialog.innerHTML='<header><div><small>1 · OBSERVAR · PISO 3</small><h2>Mecánica de Mantenimiento de Aeronaves</h2></div><button aria-label="Cerrar">×</button></header><ol class="floor-route-progress"><li><span>1</span>Observar</li><li><span>2</span>Planificar</li><li><span>3</span>Verificar</li></ol><section aria-label="Actividad situada"><h3>Conjunto de aeronave</h3><p>Responde el quiz desde el hangar formativo.</p></section><footer>Progreso común <button>Guardar y continuar</button></footer>';document.body.append(dialog);dialog.showModal();const rect=dialog.getBoundingClientRect(),steps=[...dialog.querySelectorAll('.floor-route-progress li')].map(step=>{const style=getComputedStyle(step);return {background:style.backgroundImage,radius:style.borderRadius,shadow:style.boxShadow}});return {width:rect.width,height:rect.height,right:innerWidth-rect.right,expectedWidth:Math.min(868,innerWidth*.7-33.6),expectedHeight:Math.min(innerHeight*.94,1120),blur:getComputedStyle(dialog,'::backdrop').backdropFilter,steps}});
  assert.ok(Math.abs(layout.width-layout.expectedWidth)<1,JSON.stringify(layout));
  assert.ok(Math.abs(layout.height-layout.expectedHeight)<1,JSON.stringify(layout));
  assert.ok(Math.abs(layout.right-24)<1,JSON.stringify(layout));
  assert.equal(layout.blur,'none');
  assert.equal(layout.steps.length,3);
  for(const step of layout.steps.slice(1)){assert.match(step.background,/linear-gradient/);assert.notEqual(step.radius,'0px');assert.notEqual(step.shadow,'none');}
  await page.screenshot({path:path.join(output,'quiz-split-layout.png')});
  await page.locator('dialog.floor-station-dialog').evaluate(dialog=>dialog.close());
  await page.locator('dialog.floor-station-dialog').evaluate(dialog=>dialog.remove());
  await page.screenshot({path:path.join(output,'hangar-quiz1.png'),fullPage:true});
  const specialty=await page.locator('[data-specialty]').getAttribute('data-specialty');
  if(!process.argv.includes('--all')&&!process.argv.includes('--visual-only')){
   await page.evaluate(()=>addEventListener('aulatp:quiz-progress',event=>window.nativeQuizObserved=event.detail));
   await page.getByRole('button',{name:'Desafío profesional',exact:true}).click();
   try{await page.waitForFunction(()=>window.nativeQuizObserved?.questions?.length===10,{},{timeout:60000});}
   catch(error){console.error((await page.locator('body').innerText()).slice(-3000));throw error;}
   assert.equal(await page.evaluate(()=>window.nativeQuizObserved.specialty),specialty);
   for(let choice=0;choice<3;choice++){
    const before=await page.evaluate(()=>window.nativeQuizObserved.answers.q01?.attempts||0);
    await page.locator('.mechanic-options button').nth(choice).click();
    await page.getByRole('button',{name:'Responder',exact:true}).click();
    await page.waitForFunction(before=>(window.nativeQuizObserved.answers.q01?.attempts||0)>before,before);
    if(await page.evaluate(()=>Boolean(window.nativeQuizObserved.answers.q01?.correct)))break;
   }
   assert.equal(await page.evaluate(()=>Boolean(window.nativeQuizObserved.answers.q01?.correct)),true);
   await page.getByRole('button',{name:/^Cerrar/}).last().click();
   await page.waitForFunction(()=>document.querySelector('.city-native-guide')?.dataset.quiz==='2');
   assert.equal(await page.locator('.city-native-guide kbd').evaluate(element=>element.textContent),'E');
  }
  if(process.argv.includes('--all')){
   await page.evaluate(specialty=>dispatchEvent(new CustomEvent('aulatp:quiz-progress',{detail:{specialty,moduleId:'test',questions:[{id:'q01'},{id:'q02'},{id:'q03'}],answers:{q01:{correct:false}}}})),specialty);
   await page.waitForTimeout(350);assert.equal(await page.locator('.city-native-guide').getAttribute('data-quiz'),'1');
   await page.evaluate(specialty=>dispatchEvent(new CustomEvent('aulatp:quiz-progress',{detail:{specialty,moduleId:'test',questions:[{id:'q01'},{id:'q02'},{id:'q03'}],answers:{q01:{correct:true}}}})),specialty);
   await page.waitForFunction(()=>document.querySelector('.city-native-guide')?.dataset.quiz==='2');
   assert.equal(await page.locator('.city-native-guide kbd').evaluate(element=>element.textContent),'E');
   await page.screenshot({path:path.join(output,'hangar-quiz2.png'),fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
  await page.screenshot({path:path.join(output,'mobile.png'),fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(process.argv.includes('--all')){
   await page.setViewportSize({width:1280,height:900});
    const options=await select.locator('option').evaluateAll(items=>items.map(item=>item.value));let checked=0,artChecked=0,artNotApplicable=0;
   for(const district of options){
    await select.selectOption(district,{force:true});
    const names=await page.locator('.city-specialties button .city-specialty-copy strong').allTextContents();
    for(const name of names){
     await page.locator('.city-specialties button').filter({has:page.locator('strong',{hasText:name})}).first().evaluate(button=>button.click());
     await page.waitForFunction(name=>document.querySelector('[data-specialty]')?.dataset.specialty===name&&Boolean(document.querySelector('.city-native-guide')),name,{timeout:20000});
      await page.waitForFunction(name=>window.__cityRouteContext?.specialty?.name===name,name,{timeout:20000});
      assert.equal(await page.locator('.city-native-guide kbd').evaluate(element=>element.textContent),'E',name+' shows the E key prompt');
      const hasObserveStage=await page.evaluate(()=>window.__cityRouteContext.phaseStations?.some(station=>station.phase==='observar'));
      if(hasObserveStage){
       try{await page.waitForFunction(name=>{const context=window.__cityRouteContext;if(context?.specialty?.name!==name)return false;const loaded=new Set();context.scene.traverse(object=>{if(object.userData.cityQuizArtworkLoaded&&object.visible)loaded.add(object.userData.cityQuizBanner)});return ['observar','planificar','verificar'].every(phase=>loaded.has(phase))},name,{timeout:20000});artChecked++;}
       catch(error){console.error('Observe art missing for '+name,await page.evaluate(()=>{const c=window.__cityRouteContext;return {specialty:c?.specialty?.name,phases:c?.phaseStations?.map(s=>({phase:s.phase,x:s.x,z:s.z})),signs:(()=>{let n=0;c?.scene.traverse(o=>{if(o.userData.cityObserveBanner)n++});return n})()}}));throw error;}
      }else artNotApplicable++;
     await page.waitForTimeout(400);
     const guide=page.locator('.city-native-guide');
     assert.ok(Number(await guide.getAttribute('data-arrows'))>0||await guide.locator('button').isVisible(),name+' has no reachable guide');checked++;console.log(checked+': '+name);
    }
   }
    assert.equal(checked,35);assert.ok(artChecked>0);assert.equal(artChecked+artNotApplicable,35);console.log(JSON.stringify({specialtiesVerified:checked,observeArtworkVerified:artChecked,specialtiesWithoutPhaseSign:artNotApplicable}));
  }
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({originalHangar:true,floorArrows:true,allQuizStageArtwork:true,quizEKeyHint:true,largePromptRemoved:true,published:process.argv.includes('--published'),realQuizEvent:!process.argv.includes('--all'),nextQuiz:process.argv.includes('--visual-only')?null:true,wrongAnswerStays:process.argv.includes('--visual-only')?null:true,mobile:true,errors}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
