const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve('city-panel'),output=path.resolve('tmp/module-workshop-qa');
const live=process.env.CITY_WORKSHOP_LIVE==='1';
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const inventories=JSON.parse(fs.readFileSync('city_room_resources.json','utf8')),inventory=inventories['441'];
 const setup={...inventory,source:{url:inventory.url,pdf:inventory.pdf}};
 const browser=await chromium.launch({headless:true,channel:'msedge',args:['--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1867,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const hook=`\n{const frame=AulaTPNativeRoute.frame;AulaTPNativeRoute.frame=ctx=>{window.__workshopContext=ctx;frame(ctx);};}`;
  const script=live?null:fs.readFileSync(path.join(root,'native-workshop.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'native-route.js'),'utf8')+hook;
  await page.route('**/panel-ui-v*/native-route.js',async route=>{if(live){const response=await route.fetch();await route.fulfill({response,body:await response.text()+hook});}else await route.fulfill({contentType:'application/javascript',body:script});});
  if(!live)await page.route('**/panel-ui-v*/city-panel.css',route=>route.fulfill({contentType:'text/css',body:fs.readFileSync(path.join(root,'city-panel.css'))}));
  await page.route('**/api/modules/441/city-room-setup',route=>route.fulfill({json:setup}));
  await page.route('**/api/modules/441/city-station-quiz*',route=>route.fulfill({json:{station:1,passed:false,question_number:1,total_questions:5,skill:'Representar',ae_title:'Inspección de elementos estructurales',question:{id:1,question:'Pregunta de prueba de interacción',options:['A','B','C','D'],criterion:'Criterio de prueba',ae:0}}}));
  await page.goto('https://www.aulatpchile.cl/ciudad_laboral_aulatp/',{waitUntil:'domcontentloaded',timeout:60000});
  const select=page.locator('.city-specialty-section .city-district-select select');
  await select.waitFor({timeout:60000});await page.waitForFunction(()=>!document.querySelector('.city-specialty-section select').disabled);
  await select.selectOption('mecanica');
  await page.locator('.city-specialties button').filter({hasText:'Mecánica de Mantenimiento de Aeronaves'}).click({force:true});
  await page.waitForFunction(()=>window.__workshopContext?.indoors,{},{timeout:60000});
  await page.evaluate(setup=>dispatchEvent(new CustomEvent('aulatp:quiz-progress',{detail:{specialty:setup.specialty,moduleId:441,moduleTitle:setup.module_title,answers:{},questions:['easy','easy','medium','hard'].map((difficulty,i)=>({id:i+1,difficulty,object:['Estructuras','Inspección','Herramientas','Procedimientos'][i],prompt:'Prueba',options:['A','B','C','D']}))}})),setup);
  await page.waitForFunction(()=>AulaTPNativeRoute.status().resources>0);
  const before=await page.evaluate(()=>({x:__workshopContext.player.x,z:__workshopContext.player.z}));
  await page.keyboard.down('w');await page.waitForTimeout(700);await page.keyboard.up('w');
  const moved=await page.evaluate(start=>Math.hypot(__workshopContext.player.x-start.x,__workshopContext.player.z-start.z),before);
  assert.ok(moved>.03,'Student can still walk');
  assert.equal(await page.locator('.city-quiz-marker-control').count(),4);
  await page.waitForFunction(()=>{let count=0;__workshopContext.scene.traverse(node=>{if(node.userData.cityQuizImageLoaded)count++;});return count===4;});
  const fixtures=await page.evaluate(()=>{const ctx=__workshopContext,result=[];ctx.scene.updateMatrixWorld(true);ctx.scene.traverse(node=>{if(node.userData.workshopFixture){const center=node.getWorldPosition(new ctx.three.Pq0()).project(ctx.camera);result.push({role:node.userData.workshopFixture,screen:center.toArray(),position:node.position.toArray()});}});return result;});
  assert.deepEqual(fixtures.map(item=>item.role).sort(),['inspection','repair','safety','tools']);
  assert.ok(fixtures.every(item=>Math.abs(item.screen[0])<1&&Math.abs(item.screen[1])<1),'All four furniture groups are inside the initial camera view');
  await page.screenshot({path:path.join(output,'desktop.png')});
  await page.setViewportSize({width:1366,height:768});await page.waitForTimeout(500);await page.screenshot({path:path.join(output,'laptop.png')});
  const canvas=page.locator('.city-viewport canvas').first();
  const stats=await require('sharp')(await canvas.screenshot()).stats();
  assert.ok(stats.channels.some(channel=>channel.stdev>20),'3D canvas contains rendered pixels');
  const representatives=Object.values(inventories).filter((item,index,all)=>all.findIndex(other=>other.specialty===item.specialty)===index);
  const lifecycle=await page.evaluate(rows=>{
    const ctx={...__workshopContext,colliders:__workshopContext.colliders.filter(c=>!c.cityModuleWorkshop)},start=ctx.colliders.length;
    for(const row of rows){const room=AulaTPModuleWorkshop.create(ctx,row,[]);if(!room.root.children.length)throw new Error('Empty workshop');room.dispose();if(ctx.colliders.length!==start)throw new Error('Stale collision volume');}
    return rows.length;
  },representatives);
  assert.equal(lifecycle,45);
  await page.getByRole('button',{name:'Recursos del módulo',exact:true}).click();
  assert.equal(await page.locator('.city-quiz-empty-window-body li').count(),setup.resources.length);
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
  const toolbar=await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Mi progreso');return [b?.className,b?.parentElement?.className,b?.parentElement?.parentElement?.className];});
  const layout=await page.evaluate(()=>{const ctx=__workshopContext;return {player:{x:ctx.player.x,y:ctx.player.y,z:ctx.player.z},camera:ctx.camera.position.toArray(),floorY:ctx.floorY,room:ctx.room.position.toArray(),colliders:ctx.colliders.length};});
  console.log(JSON.stringify({live,resources:setup.resources.length,quizButtons:4,fixtures,workshopLifecycles:lifecycle,walkingDistance:moved,toolbar,layout,errors,screenshots:output}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
