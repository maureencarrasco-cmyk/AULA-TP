import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const app=read('static/app.js');
const source=[
  app.slice(app.indexOf('function stationDisplayNumber('),app.indexOf('function brandImg(')),
  app.slice(app.indexOf('const names=['),app.indexOf('const stages=[')),
  app.slice(app.indexOf('const stationIcons=['),app.indexOf('function stationModel(')),
  app.slice(app.indexOf('function stationModel('),app.indexOf('function stationMiniRoute('))
].join('\n');
const scope=vm.createContext({
  auth:{user:{role:'student',username:'test-student'}},
  current:{state:{}},
  isDemoStudent:()=>false,
  esc:value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])),
  icon:name=>`<svg data-icon="${name}"></svg>`,
  workIco:name=>`<span data-icon="${name}"></span>`,
  stationRouteArt:number=>`/static/station-${number}.webp`
});
scope.window=scope;
vm.runInContext(read('static/course-artwork-catalog.js'),scope);
vm.runInContext(source,scope);

test('Estación 4 is available for all 451 modules across 45 courses',()=>{
  const courses=Object.values(scope.AulaCourseArtworkData.courses);
  assert.equal(courses.length,45);
  assert.equal(courses.reduce((sum,course)=>sum+course.modules.length,0),451);
  for(const course of courses)for(const module of course.modules){
    scope.current={id:module.id,course_id:course.id,state:{}};
    const html=scope.learningRoute({currentN:1,completed:[],moduleId:module.id,course});
    assert.equal((html.match(/class="lr-stop mission-laboral-stop is-available"/g)||[]).length,1,
      `${course.title} · ${module.title}`);
    assert.ok(html.includes(`href="/api/city-experience?course=${course.id}&module=${module.id}"`),
      `${course.title} · ${module.title} has no matching experience link`);
    assert.match(html,/aria-label="Estación 4 de 6\. Quiz y práctica profesional del módulo\. 45 minutos"/);
    assert.match(html,/15 min de quiz · 30 min de práctica profesional/);
  }
});
