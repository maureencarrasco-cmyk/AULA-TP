import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const app=read('static/app.js');
const s={esc:x=>String(x??''),workIco:x=>`<span class="work-ico"><svg data-icon="${x}"></svg></span>`,icon:x=>`<svg data-icon="${x}"></svg>`,
 names:['Contextualización','Aprendizajes esperados','Situación integradora','Evaluación final','Retroalimentación y cierre'],
 stationIcons:['flag','book','puzzle','check','chat'],
 auth:{user:{name:'Estudiante Demo',role:'student'}},action:()=>'<button>Salir</button>',BRAND_LOGO:'/static/brand.png',
 screenSparks:{courses:'Mensaje original'},sparkLeaf:()=>'<span aria-hidden="true"></span>',
 stationUnlocked:n=>n<=2};s.window=s;vm.createContext(s);
for(const file of ['course-artwork-catalog.js','course-artwork.js'])vm.runInContext(read('static/'+file),s);
s.stationHeaderArt=(n,c)=>s.stationArtworkPhoto(c,s.current,n).image;
s.stationHeaderAlt=()=>'';
vm.runInContext(app.slice(app.indexOf('function stationHeaderProgress('),app.indexOf('const heroStationTitles=')),s);
test('every course and module uses the shared design without changing the image, text or state',()=>{
 let count=0;
 for(const row of Object.values(s.AulaCourseArtworkData.courses))for(const module of row.modules){
  s.current={...module,course_id:row.id,completed:[true,false,false,false,false],state:{context:'Original'}};
  s.courses=[{id:row.id,title:row.title}];
  const before=JSON.stringify(s.current);
  for(let n=1;n<=5;n++){
   const opts={station:n,title:s.names[n-1],spark:'Mensaje original',purpose:'Consigna original',kicker:'Módulo original',breadcrumb:[{label:'Inicio',href:'#courses'}]};
   const html=s.aulaTPPageHero(opts),photo=s.stationArtworkPhoto(s.courses[0],s.current,n);
   assert.match(html,/is-station station-header-reference/);
   assert.ok(html.includes(photo.image));assert.ok(html.includes('Mensaje original'));assert.ok(html.includes('Consigna original'));
   assert.equal((html.match(/class="station-header-node /g)||[]).length,6);
   assert.equal((html.match(/aria-current="step"/g)||[]).length,1);
   assert.match(html,/1 de 5 estaciones/);
   assert.ok(html.includes('Misión laboral. En construcción'));
   assert.ok(!html.includes(`href="#module/${module.id}/3"`));
   assert.equal(JSON.stringify(s.current),before);count++;
  }
 }
 assert.equal(count,2255);
});
test('the responsive stylesheet is scoped exclusively to station headers and loads last',()=>{
 const css=read('static/station-header-reference.css'),html=read('static/index.html');
 assert.ok(!/station-body|learning-sequence|mcq-card|sequence-board/.test(css));
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(css,/focus-visible/);
 assert.ok(html.indexOf('/static/station-header-reference.css')>html.indexOf('/static/feedback-front.css'));
});
