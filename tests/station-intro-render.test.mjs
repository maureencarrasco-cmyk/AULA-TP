import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const noop=()=>{};
let rendered='';
const scope=vm.createContext({
  view:{name:'module'},ae:0,step:0,
  current:{id:227,course_id:19,content:{curriculum:{label:'Programa curricular conservado',url:'https://example.org/programa',status:'Alcance original de la simulacion'},aes:Array.from({length:5},(_,i)=>({description:`Contenido oficial ${i+1}`}))},state:{closed:false,ae:{'0-3':'Respuesta conservada'},ae_meta:{}}},
  courses:[{id:19,title:'Acuicultura'}],auth:{user:{role:'student'}},names:['Contextualizacion','Aprendizajes esperados','Situacion integradora','Evaluacion final','Retroalimentacion y cierre'],
  esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;'),
  icon:name=>`<svg class="icon" data-icon="${name}"></svg>`,
  workIco:name=>`<span class="work-ico" data-icon="${name}"></span>`,
  stationRouteArt:station=>`/static/station-${station}.webp`,
  localDrafts:{restoreExam:noop},courseResume:{save:noop},document:{querySelector:()=>null},setTimeout:noop,
  shell:html=>{rendered=html;},contextPanel:()=>'<div data-original-panel="1"></div>',
  integratedPanel:()=>'<div data-original-panel="3"></div>',examPanel:()=>'<div data-original-panel="5"></div>',feedbackPanel:()=>'<div data-original-panel="6"></div>',
  examSidebar:()=>'',feedbackSidebar:()=>'',stationHero:()=>'',avanceStrip:()=>'',
  stationRoute:()=>'<button disabled data-mission-station="4">En construccion</button>',examStationRoute:()=>'',feedbackStationRoute:()=>'',
  stationInstructionBanner:()=>{throw Error('Removed instruction strip must not render');},specialtyResourceButton:()=>'',
  bindModuleForms:noop,decorateAeOverview:noop,decorateStationActivities:noop,decorateStudentActionCues:noop,refineStationExperience:noop,stationUnlocked:()=>true
});
for(const file of ['station-intro','learning-sequence'])vm.runInContext(fs.readFileSync(new URL(`../static/${file}.js`,import.meta.url),'utf8'),scope);
scope.aePanel=()=>scope.learningAeSelectorMarkup(scope.current.content.aes);
const app=fs.readFileSync(new URL('../static/app.js',import.meta.url),'utf8');
const sourcePanel=app.slice(app.indexOf('function curriculumSourcePanel(){'),app.indexOf('function specialtyResourceButton(){'));
assert.ok(sourcePanel.startsWith('function curriculumSourcePanel(){'));
vm.runInContext(sourcePanel,scope);
const render=app.slice(app.indexOf('function renderModule(n){'),app.indexOf('function updateExamReady()'));
assert.ok(render.startsWith('function renderModule(n){'));
vm.runInContext(render,scope);
const before=JSON.stringify(scope.current);
for(const [internal,publicNumber] of [[1,1],[2,2],[3,3],[4,5],[5,6]]){
  scope.renderModule(internal);
  assert.equal((rendered.match(/data-intro-station="/g)||[]).length,1);
  assert.match(rendered,new RegExp(`data-intro-station="${publicNumber}"`));
  assert.doesNotMatch(rendered,/data-intro-station="4"/);
  assert.doesNotMatch(rendered,/station-instruction-banner|INSTRUCCIONES DE LA ESTACI/);
  assert.equal((rendered.match(/<details class="source-strip">/g)||[]).length,1);
  assert.ok(rendered.includes(`${scope.curriculumSourcePanel()}<section class="panel station-body s${internal}"><header class="station-intro-banner`));
  assert.match(rendered,/Programa curricular conservado/);
  assert.match(rendered,/Alcance original de la simulacion/);
  assert.match(rendered,/href="https:\/\/example.org\/programa"/);
  assert.equal(JSON.stringify(scope.current),before);
  if(internal===2){
    const text='Ahora comenzar\u00e1s a desarrollar el aprendizaje esperado';
    assert.equal(rendered.split(text).length-1,1);
    assert.equal((rendered.match(/data-action="ae"/g)||[]).length,5);
    assert.ok(rendered.indexOf('data-intro-station="2"')<rendered.indexOf('class="ae-selector"'));
    assert.match(rendered,/disabled data-mission-station="4"/);
  }
}
console.log('Render real: respaldo curricular seguido inmediatamente por la presentacion en todas las estaciones habilitadas; contenido y estado conservados.');
