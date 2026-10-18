import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const source=read('static/student-progress.js');
const records=new Map();
const context=vm.createContext({
  window:{},document:{querySelector:()=>null},courses:[],moduleCache:new Map(),
  auth:{user:{id:7,role:'student',name:'Camila',username:'camila'}},
  localStorage:{getItem:key=>records.get(key)||null},
  esc:value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])),
  icon:name=>`<svg data-icon="${name}"></svg>`,shell:()=>{},bindHomeLogin:()=>{},
  specialtyKey:()=> 'climate',stationRouteArt:n=>`/static/themes/route/climate-${n}.webp?v=1`,
  isDemoStudent:()=>false,
});
vm.runInContext(source.replace(/\}\)\(\);\s*$/,`window.progressTest={pct,stations,evidence,moduleRoute,moduleView,overview,closing,practiceSummary,moduleTabs};})();`),context);
vm.runInContext(read('static/course-artwork-catalog.js'),context);
const ui=context.window.progressTest;
const module=(id=1,courseId=1)=>({id,course_id:courseId,course_title:'Refrigeracion y Climatizacion',specialty:'Refrigeracion',position:id,title:`Modulo real ${id}`,aes:[{label:'Planos',description:'Descripcion del aprendizaje real'},{label:'Medicion',description:'Otra descripcion'},{label:'Calculo'}],oa:[],state:{ae:{},cases:{}},completed:[false,false,false,false,false]});

test('overview retains actual modules, progress, station totals and next route',()=>{
  const items=Array.from({length:9},(_,i)=>module(i+1));
  items[0].completed[0]=true;items[0].state.context='Reflexion registrada';
  const html=ui.overview(items);
  assert.match(html,/<strong>2%<\/strong>/);
  assert.match(html,/0 de 9 m.dulos completados/);
  assert.equal((html.match(/data-progress-tab="\d+"/g)||[]).length,9);
  assert.match(html,/href="#module\/1\/2"/);
  assert.match(html,/>1\/9<\/b>/);
  assert.match(html,/>0\/162<\/b>/);
  assert.match(html,/climate-4\.webp/);
});

test('Estación 4 opens its real module simulator and progress includes six stations',()=>{
  const m=module();m.completed[0]=true;m.state.context='Evidencia';
  const html=ui.moduleView(m);
  assert.equal(ui.pct(m),17);
  assert.equal((html.match(/data-portal-station="[1-5]"/g)||[]).length,5);
  assert.match(html,/6 estaciones habilitadas · Misión Laboral disponible/);
  assert.match(html,/sp-mission-card[\s\S]*?href="\/api\/city-experience\?course=1&amp;module=1"[\s\S]*?ENTRAR A MISIÓN/);
  assert.doesNotMatch(html,/EN CONSTRUCCIÓN|EN CONSTRUCCI.N/);
  assert.match(html,/href="#module\/1\/2"/);
  assert.doesNotMatch(html,/href="#module\/1\/[3-6]"/);
  assert.doesNotMatch(html,/#module\/1\/6/);
  assert.match(html,/Estaciones completadas<\/dt><dd>1 de 6/);
  assert.match(html,/Sin medici.n/);
  assert.doesNotMatch(html,/25%|0 de 9 actividades/);
  m.state.city_experience={quiz:{completed_at:'2026-10-17'},mission:{completed_at:'2026-10-17'}};
  assert.equal(ui.pct(m),33);
  assert.match(ui.moduleView(m),/Estaciones completadas<\/dt><dd>2 de 6/);
});

test('Estación 4 has the matching simulator link in all 451 modules across 45 courses',()=>{
  const courses=Object.values(context.window.AulaCourseArtworkData.courses);
  assert.equal(courses.length,45);
  assert.equal(courses.reduce((count,course)=>count+course.modules.length,0),451);
  for(const course of courses)for(const item of course.modules){
    const m=module(item.id,course.id);
    const html=ui.moduleRoute(m);
    assert.ok(html.includes(`href="/api/city-experience?course=${course.id}&amp;module=${item.id}"`),`${course.title} · ${item.title}`);
    assert.match(html,/aria-label="Estación 4 de 6\. Misión Laboral\. Disponible"/);
    const mission=html.match(/<article class="sp-station-card sp-mission-card"[\s\S]*?<\/article>/)?.[0]||'';
    assert.ok(mission);
    assert.match(mission,/<a href="\/api\/city-experience\?course=\d+&amp;module=\d+"/);
    assert.doesNotMatch(mission,/EN CONSTRUCCIÓN|<button[^>]*disabled/);
  }
});

test('a completed module preserves real scores, feedback, OA and station destinations',()=>{
  const m=module();m.completed.fill(true);
  m.state.city_experience={quiz:{completed_at:'2026-10-17'},mission:{completed_at:'2026-10-17'}};
  m.oa=[{code:'OA1',title:'Objetivo conservado'}];
  m.state={closed:true,reflection:'Mi reflexion',plan:'Mi plan',ae:{},cases:{},city_experience:{quiz:{completed_at:'2026-10-17'},mission:{completed_at:'2026-10-17'}},exam:{score:8,max_score:10,profile:{ae:{AE1:{percent:84}}},review:{feedback:'Comentario docente'}}};
  assert.equal(ui.pct(m),100);
  const html=ui.moduleView(m);
  assert.match(html,/>100%<\/b>/);
  assert.match(html,/>84%<\/strong>/);
  assert.match(html,/href="#module\/1\/4"/);
  assert.match(html,/href="#module\/1\/5"/);
  assert.doesNotMatch(html,/#module\/1\/6/);
  for(const text of ['Objetivo conservado','Mi reflexion','Mi plan','Comentario docente'])assert.ok(html.includes(text));
  assert.match(html,/80%/);
});

test('evidence and local practice keep their existing source and counts',()=>{
  const m=module();m.state.context='Contexto';m.state.ae={'0-1':'Respuesta'};
  m.state.oficio={x:{kind:'Medicion',station:2}};
  records.set('aula-tp-practice',JSON.stringify({'7-1':{items:{},log:[{activity_id:'a',content_area:'Planos',resolved:true},{activity_id:'a',content_area:'Planos',resolved:false}]}}));
  const list=ui.evidence(m);
  assert.equal(list.filter(item=>item.kind==='activities').length,3);
  assert.equal(list.filter(item=>item.kind==='practice').length,1);
  assert.equal(list.find(item=>item.kind==='practice').count,2);
  const html=ui.moduleView(m);
  assert.match(html,/data-evidence="activities"/);
  assert.match(html,/data-evidence="evaluations"/);
  assert.match(html,/data-evidence="practice"/);
  for(const mode of ['explore','challenge','investigate'])assert.match(html,new RegExp(`data-portal-practice="${mode}"`));
  assert.match(ui.practiceSummary([m]),/<b>2<\/b>/);
  assert.match(ui.practiceSummary([m]),/No registrado/);
  records.clear();
});

test('practice entry uses the existing engine, refreshes local totals and restores focus on close',async()=>{
  const handlers={},requests=[],m=module(),hist=new Map();
  let watched,chosen,focused,opens=0;
  const modal={isConnected:true,querySelector:selector=>({click:()=>{chosen=selector}})};
  const button={dataset:{portalPractice:'challenge',practiceModule:'1'},disabled:false,setAttribute:()=>{},removeAttribute:()=>{},addEventListener:(name,handler)=>{handlers.practice=handler}};
  const tab={dataset:{progressTab:'1'},addEventListener:(name,handler)=>{handlers.tab=handler}};
  const root={isConnected:true,innerHTML:'',classList:{add:()=>{},remove:()=>{}},querySelector:selector=>selector==='.sp-content'?{classList:{toggle:()=>{}}}:selector==='#sp-course'?{innerHTML:'',addEventListener:()=>{}}:selector.includes('data-portal-practice')?{focus:()=>{focused=true}}:null,querySelectorAll:selector=>selector==='[data-progress-tab]'?[tab]:selector==='[data-portal-practice]'?[button]:[]};
  const local=vm.createContext({
    window:{AulaPractice:{open:()=>{opens++}}},current:null,courses:[],auth:context.auth,
    document:{body:{},querySelector:selector=>selector==='#progress-content'?root:selector==='#practice-root'?modal:null},
    MutationObserver:class {constructor(callback){this.callback=callback;watched=this}observe(){this.observing=true}disconnect(){this.disconnected=true}},
    moduleCache:new Map(),api:async url=>{requests.push(url);return {id:1,content:{}}},
    localStorage:{getItem:key=>hist.get(key)||null},esc:context.esc,icon:context.icon,
    shell:()=>{},bindHomeLogin:()=>{},isDemoStudent:()=>false,toast:message=>assert.fail(message),
  });
  vm.runInContext(source,local);
  local.window.studentProgressPage([m]);handlers.tab();await handlers.practice();
  assert.deepEqual(requests,['/modules/1']);assert.equal(opens,1);
  assert.match(chosen,/data-mode="challenge"/);assert.equal(local.current.id,1);
  assert.equal(button.disabled,false);assert.equal(watched.observing,true);
  hist.set('aula-tp-practice',JSON.stringify({'7-1':{log:[{content_area:'Planos',resolved:true}]}}));
  modal.isConnected=false;watched.callback();
  assert.equal(watched.disconnected,true);assert.equal(focused,true);
  assert.match(root.innerHTML,/<b>1<\/b><span>intentos registrados/);
});

test('course and module text stay escaped and the styles/assets are scoped and lightweight',()=>{
  const m=module();m.title='<script>alert(1)</script>';m.course_title='<unsafe>';m.aes[0].description='<img onerror="bad">';
  const html=ui.moduleView(m)+ui.overview([m]);
  assert.doesNotMatch(html,/<script>|<img onerror/);
  assert.match(html,/&lt;script&gt;/);
  const css=read('static/student-progress-reference.css');
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(css,/:focus-visible/);
  assert.doesNotMatch(css,/font-size:[^;]*vw|animation:/);
  assert.ok(read('static/student-progress-icons.svg').length<15_000);
  const index=read('static/index.html');
  assert.match(index,/student-progress-reference\.css\?v=20261018-station4-live-v1/);
  assert.match(index,/student-progress\.js\?v=20261018-station4-live-v1/);
  assert.match(source,/moduleId!==selected/);
  assert.match(source,/window\.AulaPractice\.open\(\)/);
  assert.match(source,/observer\.disconnect\(\)/);
  assert.match(source,/focus\(\{preventScroll:true\}\)/);
  assert.match(css,/sp-content\.is-overview>\.sp-section \{align-self:stretch\}/);
  assert.match(css,/sp-module-bottom \.sp-section \{grid-column:auto;grid-row:auto\}/);
});
