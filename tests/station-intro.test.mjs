import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const routeCalls=[];
const scope=vm.createContext({
  courses:[{id:7,title:'Curso de prueba'}],
  current:{course_id:'7',state:{completed:[1],answers:{saved:'original'}}},
  esc:value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;'),
  workIco:icon=>`<span class="work-ico" data-icon="${icon}"></span>`,
  stationRouteArt:(station,course)=>{
    routeCalls.push({station,courseId:course?.id});
    return `/static/station-${station}.webp`;
  }
});
vm.runInContext(fs.readFileSync(new URL('../static/station-intro.js',import.meta.url),'utf8'),scope);
const before=JSON.stringify(scope.current);
for(const station of [1,2,3,5,6]){
  const html=scope.stationIntroBanner(station);
  assert.match(html,new RegExp(`data-intro-station="${station}"`));
  assert.match(html,new RegExp(`<span>ESTACIÓN ${station}</span><b>${station}</b>`));
  assert.equal((html.match(/<h2 /g)||[]).length,1);
  assert.equal((html.match(/<img /g)||[]).length,1);
  assert.match(html,/aria-labelledby="(?:context-title|station-intro-title-\d)"/);
}
assert.deepEqual(routeCalls,[2,3,4,5].map(station=>({station,courseId:7})));
assert.equal(scope.stationIntroBanner(4),'');
assert.equal(scope.stationIntroBanner(0),'');
assert.match(scope.stationIntroBanner(1),/src="\/static\/station-intro-students.png"/);
assert.match(scope.stationIntroBanner(1),/id="context-title"/);
assert.equal(JSON.stringify(scope.current),before);
assert.ok(fs.existsSync(new URL('../static/station-intro-students.png',import.meta.url)));
console.log('Encabezados 1, 2, 3, 5 y 6: numeracion publica, imagen, accesibilidad y estado conservado.');
