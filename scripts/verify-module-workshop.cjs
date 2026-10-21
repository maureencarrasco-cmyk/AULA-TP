const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve('city-panel'),output=path.resolve('tmp/module-workshop-qa');
const live=process.env.CITY_WORKSHOP_LIVE==='1';
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const inventories=JSON.parse(fs.readFileSync('city_room_resources.json','utf8')),inventory=inventories['441'];
 const setup={...inventory,source:{url:inventory.url,pdf:inventory.pdf}};
 const browser=await chromium.launch({headless:true,channel:'msedge',args:['--enable-unsafe-swiftshader']});
 let activePage;
 try{
  const page=await browser.newPage({viewport:{width:1867,height:900}}),errors=[];
  activePage=page;
  page.on('pageerror',error=>errors.push(error.message));
  if(live){page.on('console',message=>{if(['error','warning'].includes(message.type()))console.error('BROWSER',message.type(),message.text());});page.on('requestfailed',request=>console.error('REQUEST_FAILED',request.url(),request.failure()?.errorText));page.on('response',response=>{if(/native-workshop|module-room-resources|city-room-setup/.test(response.url()))console.error('RESOURCE_RESPONSE',response.status(),response.url());});}
  const hook=`\n{const frame=AulaTPNativeRoute.frame;AulaTPNativeRoute.frame=ctx=>{window.__workshopContext=ctx;frame(ctx);};}`;
  const script=live?null:fs.readFileSync(path.join(root,'native-workshop.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'native-route.js'),'utf8')+hook;
  await page.route('**/panel-ui-v*/native-route.js',async route=>{if(live){const response=await route.fetch();await route.fulfill({response,body:await response.text()+hook});}else await route.fulfill({contentType:'application/javascript',body:script});});
  if(!live)await page.route('**/panel-ui-v*/city-panel.css',route=>route.fulfill({contentType:'text/css',body:fs.readFileSync(path.join(root,'city-panel.css'))}));
  if(!live)await page.route('**/assets/module-room-resources.json',route=>route.fulfill({json:inventories}));
  await page.route('**/api/modules/441/city-room-setup',route=>route.fulfill({json:{...setup,resources:[],status:'requires_source_review'}}));
  await page.route('**/api/modules/441/city-station-quiz*',route=>route.fulfill({json:{station:1,passed:false,question_number:1,total_questions:5,skill:'Representar',ae_title:'Inspección de elementos estructurales',question:{id:1,question:'Pregunta de prueba de interacción',options:['A','B','C','D'],criterion:'Criterio de prueba',ae:0}}}));
  await page.goto('https://www.aulatpchile.cl/ciudad_laboral_aulatp/',{waitUntil:'domcontentloaded',timeout:60000});
  const select=page.locator('.city-specialty-section .city-district-select select');
  await select.waitFor({timeout:60000});await page.waitForFunction(()=>!document.querySelector('.city-specialty-section select').disabled);
  await select.selectOption('mecanica');
  await page.locator('.city-specialties button').filter({hasText:'Mecánica de Mantenimiento de Aeronaves'}).click({force:true});
  await page.waitForFunction(()=>window.__workshopContext?.indoors,{},{timeout:60000});
  await page.evaluate(item=>dispatchEvent(new CustomEvent('aulatp:quiz-progress',{detail:{specialty:item.specialty,moduleId:441,moduleTitle:item.module_title,answers:{},questions:[]}})),setup);
  await page.waitForFunction(title=>AulaTPNativeRoute.status().moduleTitle===title,setup.module_title,{timeout:120000});
  assert.equal(await page.evaluate(()=>AulaTPNativeRoute.status().representedResources),setup.resources.length);
  const entryLayout=await page.evaluate(()=>{const rows=[];__workshopContext.scene.traverse(node=>{if(['tools','safety'].includes(node.userData.workshopFixture))rows.push({role:node.userData.workshopFixture,position:node.position.toArray()});});return rows;});
  await page.screenshot({path:path.join(output,'entry.png')});
  await page.evaluate(item=>dispatchEvent(new CustomEvent('aulatp:quiz-progress',{detail:{specialty:item.specialty,moduleId:442,moduleTitle:item.module_title,answers:{},questions:[]}})),inventories['442']);
  await page.waitForFunction(title=>AulaTPNativeRoute.status().moduleTitle===title,inventories['442'].module_title,{timeout:60000});
  assert.equal(await page.evaluate(()=>AulaTPNativeRoute.status().resources),inventories['442'].resources.length);
  await page.evaluate(setup=>dispatchEvent(new CustomEvent('aulatp:quiz-progress',{detail:{specialty:setup.specialty,moduleId:441,moduleTitle:setup.module_title,answers:{},questions:['easy','easy','medium','hard'].map((difficulty,i)=>({id:i+1,difficulty,object:['Estructuras','Inspección','Herramientas','Procedimientos'][i],prompt:'Prueba',options:['A','B','C','D']}))}})),setup);
  await page.waitForFunction(title=>AulaTPNativeRoute.status().moduleTitle===title,setup.module_title,{timeout:60000});
  await page.waitForTimeout(1000);
  await page.locator('.city-viewport canvas').first().click({position:{x:500,y:600},force:true});
  const before=await page.evaluate(()=>({x:__workshopContext.player.x,z:__workshopContext.player.z}));
  await page.keyboard.down('w');await page.waitForTimeout(1200);await page.keyboard.up('w');
  const moved=await page.evaluate(start=>Math.hypot(__workshopContext.player.x-start.x,__workshopContext.player.z-start.z),before);
  assert.ok(moved>.03,'Student can still walk');
  assert.equal(await page.locator('.city-quiz-marker-control').count(),4);
  await page.waitForFunction(()=>{let count=0;__workshopContext.scene.traverse(node=>{if(node.userData.cityQuizImageLoaded)count++;});return count===4;},{},{timeout:60000});
  const fixtures=await page.evaluate(()=>{const ctx=__workshopContext,result=[];ctx.scene.updateMatrixWorld(true);ctx.scene.traverse(node=>{if(node.userData.workshopFixture){const center=node.getWorldPosition(new ctx.three.Pq0()).project(ctx.camera);result.push({role:node.userData.workshopFixture,screen:center.toArray(),position:node.position.toArray()});}});return result;});
  for(const role of ['inspection','repair','safety','tools'])assert.ok(fixtures.some(item=>item.role===role),`Required ${role} furniture is present`);
  assert.ok(fixtures.filter(item=>['inspection','repair','safety','tools'].includes(item.role)).every(item=>Math.abs(item.screen[0])<1&&Math.abs(item.screen[1])<1),'All four main furniture groups are inside the initial camera view');
  for(const role of ['tools-wall','safety-wall'])assert.ok(fixtures.some(item=>item.role===role),`Side wall ${role} is equipped`);
  assert.deepEqual(fixtures.filter(item=>['tools','safety'].includes(item.role)).map(({role,position})=>({role,position})),entryLayout,'Module changes keep the room layout fixed');
  await page.screenshot({path:path.join(output,'desktop.png')});
  const viewport=page.locator('.city-viewport canvas').first(),bounds=await viewport.boundingBox(),pivot={x:bounds.x+bounds.width*.5,y:bounds.y+bounds.height*.7},angles=[];
  async function look(distance,name){await page.mouse.move(pivot.x,pivot.y);await page.mouse.down();await page.mouse.move(pivot.x+distance,pivot.y,{steps:12});await page.mouse.up();await page.waitForTimeout(350);angles.push(await page.evaluate(()=>__workshopContext.camera.getWorldDirection(new __workshopContext.three.Pq0()).toArray()));if(name)await page.screenshot({path:path.join(output,name+'.png')});}
  await look(-220,'left-wall');await look(440,'right-wall');await look(-220);
  await page.setViewportSize({width:1366,height:768});await page.waitForTimeout(500);await page.screenshot({path:path.join(output,'laptop.png')});
  const canvas=page.locator('.city-viewport canvas').first();
  const stats=await require('sharp')(await canvas.screenshot()).stats();
  assert.ok(stats.channels.some(channel=>channel.stdev>20),'3D canvas contains rendered pixels');
  const representatives=process.env.CITY_WORKSHOP_FAST==='1'?[]:Object.values(inventories);
  const lifecycle=await page.evaluate(rows=>{
    const ctx={...__workshopContext,colliders:__workshopContext.colliders.filter(c=>!c.cityModuleWorkshop)},start=ctx.colliders.length;
    for(const row of rows){const room=AulaTPModuleWorkshop.create(ctx,row,[]);if(!room.root.children.length)throw new Error('Empty workshop');
      const names=new Set();room.root.traverse(node=>{if(!node.isMesh&&!node.children.length)return;for(const item of node.userData.curriculumResources||[])names.add(item.name);});
      const specialized=new Set();room.root.traverse(node=>{if(node.userData.specializedEquipment&&node.children.length)specialized.add(node.userData.curriculumResource?.name);});
      for(const item of row.resources.filter(item=>item.model?.startsWith('catalog-')))if(!specialized.has(item.name))throw new Error('Missing concrete model '+item.model+' in '+row.module_title+': '+item.name);
      if(row.resources.some(item=>!names.has(item.name)))throw new Error('Unrepresented resource in '+row.module_title);
      if(room.displayedResources!==new Set(row.resources.map(item=>item.name)).size)throw new Error('Resource coverage differs from physical models');
      room.dispose();if(ctx.colliders.length!==start)throw new Error('Stale collision volume');}
    return rows.length;
  },representatives);
  assert.equal(lifecycle,representatives.length);
  await page.getByRole('button',{name:'Recursos del módulo',exact:true}).click();
  assert.equal(await page.locator('[data-curriculum-resource]').count(),setup.resources.length);
  const criteria=await page.evaluate(()=>{let coverage=[];__workshopContext.scene.traverse(node=>{if(node.userData.cityModuleWorkshop)coverage=node.userData.criterionCoverage||[];});return coverage;});
  assert.equal(criteria.length,9);assert.ok(criteria.every(item=>item.represented),'Every reviewed criterion has its equipment represented');
  const models=await page.evaluate(()=>{const models=[];__workshopContext.scene.traverse(node=>{if(node.userData.curriculumResource?.model&&node.children.length)models.push(node.userData.curriculumResource.model);});return models;});
  for(const item of inventory.resources.filter(item=>item.model))assert.ok(models.includes(item.model),'Missing specialized equipment '+item.model);
  await page.getByRole('button',{name:'Cerrar recursos'}).click();
  await page.locator('.city-quiz-marker-control').nth(1).click({force:true});
  await page.waitForFunction(()=>document.querySelectorAll('.city-quiz-choices input').length===4);
  await page.locator('.city-quiz-argument-label textarea').fill('Borrador de fundamentación conservado al consultar los recursos.');
  await page.getByRole('button',{name:'Recursos del módulo',exact:true}).click();
  assert.equal(await page.locator('.city-quiz-empty-window:visible').count(),1);
  await page.getByRole('button',{name:'Cerrar recursos'}).click();
  assert.match(await page.locator('.city-quiz-argument-label textarea').inputValue(),/Borrador de fundamentación/);
  await page.screenshot({path:path.join(output,'quiz.png')});
  await page.getByRole('button',{name:'Cerrar quiz',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>{let count=0;__workshopContext.scene.traverse(node=>{if(node.userData.cityQuizImageLoaded)count++;});return count===4;});
  await page.waitForTimeout(1000);await page.screenshot({path:path.join(output,'mobile.png')});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const controls=await page.locator('.city-quiz-marker-control').evaluateAll(buttons=>buttons.map(button=>{const r=button.getBoundingClientRect();return {hidden:button.hidden,x:r.x,y:r.y,w:r.width,h:r.height};}));
  assert.ok(controls.every(r=>!r.hidden&&r.x>=0&&r.x+r.w<=390&&r.y>=0&&r.y+r.h<=844),'All four mobile quiz buttons are in view');
  for(let a=0;a<controls.length;a++)for(let b=a+1;b<controls.length;b++){
    const p=controls[a],q=controls[b];assert.ok(p.x+p.w<=q.x||q.x+q.w<=p.x||p.y+p.h<=q.y||q.y+q.h<=p.y,'Quiz touch targets do not overlap');
  }
  assert.deepEqual(errors,[]);
  await page.setViewportSize({width:1366,height:768});
  const samples=[];
  for(const mid of [5,42,104,193,400]){
    const item=inventories[String(mid)];
    const base=item.specialty.split(',')[0],options=await select.locator('option').evaluateAll(options=>options.filter(o=>o.value&&!o.disabled).map(o=>o.value));
    let found=false;
    for(const option of options){await select.selectOption(option,{force:true});const button=page.locator('.city-specialties button').filter({hasText:base}).first();if(await button.count()){await button.dispatchEvent('click');found=true;break;}}
    assert.ok(found,'Specialty available in the real world: '+base);
    await page.waitForFunction(base=>{const clean=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\bde\b/g,'').replace(/\s+/g,' ').trim();return __workshopContext.indoors&&clean(__workshopContext.specialty.name).includes(clean(base));},base,{timeout:60000});
    await page.evaluate(({mid,item})=>dispatchEvent(new CustomEvent('aulatp:quiz-progress',{detail:{specialty:item.specialty,moduleId:mid,moduleTitle:item.module_title,answers:{},questions:[]}})),{mid,item});
    await page.waitForFunction(title=>AulaTPNativeRoute.status().moduleTitle===title,item.module_title,{timeout:60000});
    assert.equal(await page.evaluate(()=>AulaTPNativeRoute.status().representedResources),item.resources.length);
    assert.equal(await page.locator('.city-quiz-marker-control').count(),4);
    const equipmentState=await page.evaluate(title=>{const ctx=__workshopContext,found=[],roots=[];ctx.scene.updateMatrixWorld(true);ctx.scene.traverse(node=>{if(node.userData.cityModuleWorkshop&&node.userData.moduleTitle===title){roots.push({visible:node.visible,position:node.position.toArray(),fixtures:node.children.filter(n=>n.userData.workshopFixture).map(n=>({role:n.userData.workshopFixture,visible:n.visible,position:n.getWorldPosition(new ctx.three.Pq0()).toArray()}))});node.traverse(child=>{if(child.isMesh){let visible=true;for(let p=child;p;p=p.parent)if(!p.visible)visible=false;const p=child.getWorldPosition(new ctx.three.Pq0()).project(ctx.camera);if(visible&&Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z>-1&&p.z<1)found.push(child.id);}});}});return {count:found.length,roots,player:ctx.player.toArray(),floor:ctx.floorY};},item.module_title);
    console.log(JSON.stringify({sampleModule:mid,equipmentState}));
    const visibleEquipment=equipmentState.count;
    assert.ok(visibleEquipment>10,'Equipment meshes are actually visible in this specialty: '+base);
    await page.waitForTimeout(300);await page.screenshot({path:path.join(output,`equipment-module-${mid}.png`)});
    const samplePixels=await require('sharp')(await page.locator('.city-viewport canvas').first().screenshot()).stats();
    assert.ok(samplePixels.channels.some(channel=>channel.stdev>20),'Nonblank equipment scene '+mid);
    samples.push({module:mid,resources:item.resources.length});
  }
  assert.deepEqual(errors,[]);
  const toolbar=await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Mi progreso');return [b?.className,b?.parentElement?.className,b?.parentElement?.parentElement?.className];});
  const layout=await page.evaluate(()=>{const ctx=__workshopContext;return {player:{x:ctx.player.x,y:ctx.player.y,z:ctx.player.z},camera:ctx.camera.position.toArray(),floorY:ctx.floorY,room:ctx.room.position.toArray(),colliders:ctx.colliders.length};});
  console.log(JSON.stringify({live,resources:setup.resources.length,quizButtons:4,fixtures,angles,workshopLifecycles:lifecycle,samples,walkingDistance:moved,toolbar,layout,errors,screenshots:output}));
 }catch(error){if(activePage){await activePage.screenshot({path:path.join(output,'failure.png')});console.error(await activePage.evaluate(()=>({status:globalThis.AulaTPNativeRoute?.status(),specialty:globalThis.__workshopContext?.specialty?.name})));}throw error;}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
