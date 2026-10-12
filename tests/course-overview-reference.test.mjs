import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const app=read('static/app.js');
test('all 45 course overviews preserve photographs, module destinations and progress',()=>{
 const s={esc:x=>String(x??''),icon:x=>`<svg data-icon="${x}"></svg>`,workIco:x=>`<span class="work-ico"><svg data-icon="${x}"></svg></span>`,
  auth:{user:{name:'Estudiante',role:'student'}},BRAND_LOGO:'/static/logo.png',stationIcons:[],names:[],current:null,
  screenSparks:{course:'Cada módulo abre una nueva posibilidad.'},sparkLeaf:()=>'',isClimateSpecialty:()=>false,
  currentModuleIndex:()=>0,stationMiniRoute:()=>'<ol></ol>',numberDisplay:String,
  document:{querySelector:()=>({querySelectorAll:()=>[]})}};
 s.window=s;vm.createContext(s);
 for(const file of ['course-artwork-catalog.js','course-artwork.js'])vm.runInContext(read('static/'+file),s);
 s.heroPhoto=c=>s.courseArtworkPhoto(c).image;
 s.moduleStopArt=(c,i)=>s.moduleArtworkPhoto(c,i).image;
 s.shell=html=>{s.html=html};
 vm.runInContext(app.slice(app.indexOf('function stationHeaderProgress('),app.indexOf('const heroStationTitles=')),s);
 vm.runInContext(app.slice(app.indexOf('function courseMap('),app.indexOf('const stationTools=')),s);
 for(const row of Object.values(s.AulaCourseArtworkData.courses)){
  const c={id:row.id,title:row.title,specialty:row.title,level:'3° y 4° medio',modules:row.modules.map((m,i)=>({...m,percent:i===0?20:0,completed:[false,false,false,false,false],published:true}))};
  s.courses=[c];const before=JSON.stringify(c);s.courseMap(c.id);
  assert.match(s.html,/course-overview-reference/);
  assert.ok(s.html.includes(s.courseArtworkPhoto(c).image));
  assert.ok(s.html.includes(c.title));
  assert.ok(s.html.includes(`${c.modules.length} módulos`));
  assert.ok(s.html.includes(`${Math.round(20/c.modules.length)}% de avance`));
  assert.match(s.html,/data-course-view="list"/);
  assert.equal((s.html.match(/class="journey-card"/g)||[]).length,c.modules.length);
  for(const m of c.modules)assert.ok(s.html.includes(`href="#module/${m.id}"`));
  assert.equal(JSON.stringify(c),before);
 }
});
test('course overview styles stay separate from stations and provide responsive list layout',()=>{
 const css=read('static/course-overview-reference.css');
 assert.ok(!/station-body|mcq-card|station-header-reference/.test(css));
 assert.match(css,/course-list-view \.journey-card/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(read('static/index.html'),/course-overview-reference.css/);
});
