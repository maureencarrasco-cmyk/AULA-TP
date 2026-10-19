const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const output=path.resolve('tmp/city-route-qa');
const base=process.env.CITY_ROUTE_URL||'http://127.0.0.1:8108/ciudad_laboral_aulatp/panel-ui-v1/engine/index.html';

(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:'msedge',args:['--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const questions=Array.from({length:10},(_,i)=>({question:`Caso de prueba del módulo ${i+1}`,options:['Procedimiento A','Procedimiento B','Procedimiento C','Procedimiento D']}));
  let state={quiz:{answers:{},active_seconds:0}},failNext=false,posts=0;
  await page.route('**/api/session',route=>route.fulfill({json:{user:{role:'student'},csrf:'test-csrf'}}));
  await page.route('**/api/modules/1/city-experience',async route=>{
   const request=route.request();
   if(request.method()==='POST'){
    const body=request.postDataJSON();assert.equal(request.headers()['x-csrf-token'],'test-csrf');
    if(body.operation==='quiz-answer'){
     posts++;
     if(failNext){failNext=false;return route.fulfill({status:503,json:{error:'Conexión interrumpida. Intenta nuevamente.'}});}
     assert.equal(body.index,Object.keys(state.quiz.answers).length);
     state.quiz.answers[String(body.index)]={correct:body.choice===0,choice_feedback:'Fundamentación pedagógica de prueba.',correct_answer:'Procedimiento A'};
    }else if(body.operation==='heartbeat')state.quiz.active_seconds+=body.seconds;
   }
   return route.fulfill({json:{course_title:'Especialidad de prueba',plan:{module:{title:'Módulo de prueba'},quiz:questions,timing:{quiz:20}},state}});
  });
  await page.goto(base+'?cityModuleId=1&cityCourseId=1&cityPhoto=aircraft',{waitUntil:'networkidle'});
  await page.locator('canvas').waitFor();await page.waitForFunction(()=>document.querySelector('#scene').dataset.targetQuiz==='1');
  assert.equal(await page.locator('#interact').isVisible(),false);
  await page.screenshot({path:path.join(output,'desktop.png')});
  async function move(key,predicate){await page.keyboard.down(key);try{await page.waitForFunction(predicate,{},{timeout:20000});}finally{await page.keyboard.up(key);}}
  await move('ArrowUp',()=>Number(document.querySelector('#scene').dataset.playerZ)>=7.7);
  await move('ArrowRight',()=>Number(document.querySelector('#scene').dataset.playerYaw)<=-1.52);
  await move('ArrowUp',()=>Number(document.querySelector('#scene').dataset.playerX)<=-3);
  await page.locator('#interact').click();await page.getByLabel('Procedimiento B',{exact:true}).check();
  failNext=true;await page.locator('#save-answer').click();await page.getByText('Conexión interrumpida. Intenta nuevamente.').waitFor();
  assert.equal(await page.locator('#scene').getAttribute('data-target-quiz'),'1');assert.equal(Object.keys(state.quiz.answers).length,0);
  await page.locator('#save-answer').click();await page.locator('#continue').waitFor();
  await page.screenshot({path:path.join(output,'feedback.png')});
  await page.locator('#continue').click();await page.waitForFunction(()=>document.querySelector('#scene').dataset.targetQuiz==='2');assert.equal(posts,2);
  await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('#scene').dataset.targetQuiz==='2');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
  await page.screenshot({path:path.join(output,'mobile.png')});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.ok((await page.locator('#return').getAttribute('href')).includes('/ciudad_laboral_aulatp/?'));
  assert.deepEqual(errors,[]);console.log(JSON.stringify({rendered:true,movement:true,failedSaveBlocked:true,wrongAnswerFeedback:true,nextQuiz:2,resume:true,mobile:true,errors}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
