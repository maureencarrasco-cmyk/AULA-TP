const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('static/portal-docente.js','utf8').replace(/\r\n/g,'\n').split('\nnav();\nfunction showLoadError')[0];
function fixture() {
  const ctx = vm.createContext({URLSearchParams,location:{search:'',pathname:'/portal-docente'},window:{},document:{}});
  vm.runInContext(source,ctx);
  return ctx;
}
test('homonyms remain separate and enrolled students without progress are included',()=>{
  const ctx=fixture();
  vm.runInContext(`state.courses=[{id:1,modules:[]}];state.teacher={records:[],users:[{id:3,name:'Sin actividad'}],enrollments:[{user_id:3,course_id:1}]};`,ctx);
  assert.equal(vm.runInContext(`reportPeople([{user_id:1,name:'Ana'},{user_id:2,name:'Ana'}]).length`,ctx),3);
});
test('station state does not assume sequential progression',()=>{
  const ctx=fixture();
  assert.equal(vm.runInContext(`stations({percent:40,completed:[true,false,false,false,true]})`,ctx),2);
  assert.equal(vm.runInContext(`stationStates({percent:40})`,ctx),null);
});
test('course context includes modules after five and real records are never replaced by demo',()=>{
  const ctx=fixture();
  vm.runInContext(`state.courses=[{id:1,modules:[{id:9,position:9}]},{id:2,modules:[{id:12,position:12}]}];state.courseId='2';state.teacher={records:[{user_id:1}]};window.AulaCohort={build:()=>[{demo:true}]};applyCohort();`,ctx);
  assert.equal(vm.runInContext('fiveModules()[0].id',ctx),12);
  assert.equal(vm.runInContext('state.teacher.records[0].user_id',ctx),1);
});
test('navigation retains valid course and module context and explicit all-modules clears it',()=>{
  const ctx=fixture();
  vm.runInContext(`state.courses=[{id:2,modules:[{id:12,position:12}]}];state.courseId='2';state.moduleId='12';`,ctx);
  assert.equal(vm.runInContext(`portalLink('/portal-docente/estudiantes')`,ctx),'/portal-docente/estudiantes?course=2&module=12');
  assert.equal(vm.runInContext(`portalLink('/portal-docente/estudiantes',{module:''})`,ctx),'/portal-docente/estudiantes?course=2');
  vm.runInContext(`state.moduleId='999';`,ctx);
  assert.equal(vm.runInContext(`portalLink('/portal-docente/estudiantes')`,ctx),'/portal-docente/estudiantes?course=2');
});
test('evidence shows original practice and teacher feedback safely without changing scores',()=>{
  const ctx=fixture();
  vm.runInContext(`state.teacher={};`,ctx);
  const html=vm.runInContext(`personRow([{user_id:1,name:'Ana',position:2,percent:40,state:{oficio:{p:{text:'<script>prueba</script>'}},reflection:'Reflexión original',exam:{score:8,max_score:10,review:{score:19,feedback:'Devolución original'}}}}])`,ctx);
  assert.match(html,/19 \/ 25/);
  assert.match(html,/Devolución original/);
  assert.match(html,/Reflexión original/);
  assert.match(html,/&lt;script&gt;/);
  assert.doesNotMatch(html,/<script>/);
  const empty=vm.runInContext(`personRow([{name:'Sin actividad',unstarted:true,state:{},percent:0}])`,ctx);
  assert.match(empty,/Matriculado sin registro/);
  assert.doesNotMatch(empty,/undefined/);
});
test('students with the same name expose distinct identity keys',()=>{
  const ctx=fixture();
  const html=vm.runInContext(`peopleTable([[{user_id:1,name:'Ana',state:{}}],[{user_id:2,name:'Ana',state:{}}]])`,ctx);
  assert.match(html,/data-person-key="1"/);
  assert.match(html,/data-person-key="2"/);
  assert.match(html,/Identidad: 1/);
  assert.match(html,/Identidad: 2/);
});
test('unsaved form changes warn on leaving and are cleared when the user changes',()=>{
  const ctx=fixture();let warning;
  ctx.window.addEventListener=(name,handler)=>{if(name==='beforeunload')warning=handler;};
  const form={dataset:{teacherDocument:'plans'},values:{sequence:'Borrador'},elements:{namedItem:()=>null},querySelector:selector=>selector==='[name="module_id"]'?{value:'1'}:{textContent:''}};
  ctx.FormData=class {constructor(item){this.item=item;}[Symbol.iterator](){return Object.entries(this.item.values)[Symbol.iterator]();}};
  ctx.document.getElementById=id=>id==='pd-layout-module'?{}:null;
  ctx.document.querySelectorAll=selector=>selector==='[data-teacher-document]'?[form]:[];
  ctx.document.querySelector=()=>null;
  vm.runInContext(fs.readFileSync('static/portal-docente-layout.js','utf8'),ctx);
  vm.runInContext(`state.user={id:1};state.courses=[];window.PortalLayout.bind();`,ctx);
  form.oninput();let prevented=false;
  warning({preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  vm.runInContext(`state.user={id:2};window.PortalLayout.bind();`,ctx);
  prevented=false;warning({preventDefault(){prevented=true;}});
  assert.equal(prevented,false);
});
test('planning history displays every saved field and selects the highest version',()=>{
  const ctx=fixture();
  vm.runInContext(fs.readFileSync('static/portal-docente-layout.js','utf8'),ctx);
  vm.runInContext(`state.courses=[{id:1,title:'Refrigeración y Climatización',modules:[{id:1,position:1,title:'Planos',oa:[],aes:[]}]}];state.teacher={records:[],plans:[{module_id:1,version:1,payload:{sequence:'Anterior',resources:'Recurso anterior',adaptations:'Apoyo anterior'}},{module_id:1,version:2,payload:{sequence:'Vigente',resources:'Recurso vigente',adaptations:'Apoyo vigente'}}]};`,ctx);
  const before=vm.runInContext('JSON.stringify(state.teacher.plans)',ctx);
  const html=vm.runInContext(`window.PortalLayout.render('cursos')`,ctx);
  assert.match(html,/Versión 2 · Vigente/);
  assert.match(html,/Recurso anterior/);
  assert.match(html,/Apoyo anterior/);
  assert.match(html,/name="version" value="2"/);
  assert.equal(vm.runInContext('JSON.stringify(state.teacher.plans)',ctx),before);
});
test('curriculum matrix preserves pending original references instead of claiming validation',()=>{
  const ctx=fixture();ctx.location.search='?learning=alignment';
  vm.runInContext(fs.readFileSync('static/portal-docente-layout.js','utf8'),ctx);
  vm.runInContext(`state.courses=[{id:1,title:'Otra especialidad',modules:[{id:1,position:1,title:'Módulo',aes:[],oa:[],curricular_references:[{ae_code:'AE1',criterion:'Criterio original',activity:'Actividad original',source_status:'REQUIERE VALIDACION'}]}]}];state.teacher={records:[]};`,ctx);
  const html=vm.runInContext(`window.PortalLayout.render('oa-ae')`,ctx);
  assert.match(html,/Actividad original/);
  assert.match(html,/Criterio original/);
  assert.match(html,/REQUIERE VALIDACION/);
  assert.doesNotMatch(html,/NCh3241/);
});
test('course photos use declared context and never a foreign specialty fallback',()=>{
  const ctx=fixture();
  vm.runInContext(`state.courses=[{id:1,title:'Contabilidad',modules:[]}];`,ctx);
  assert.equal(vm.runInContext(`modulePhoto({position:1,resources:[]})`,ctx),null);
  const url=vm.runInContext(`modulePhoto({title:'Registros',position:1,resources:[{type:'Imagen',url:'/static/accounting.png',locations:['context.image']}]})[0]`,ctx);
  assert.equal(url,'/static/accounting.png');
});
