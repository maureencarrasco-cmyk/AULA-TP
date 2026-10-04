import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scope=vm.createContext({
  window:{}, current:{id:1,course_id:1,content:{specialty_source:{pdf:'electricidad.pdf'}}},
  auth:{user:{id:7}},
  esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
  document:{readyState:'complete',body:{},addEventListener(){},querySelectorAll(){return [];}},
  MutationObserver:class{observe(){}},
});
vm.runInContext(fs.readFileSync(path.join(root,'static/visual-sim.js'),'utf8'),scope);
const visual=scope.window.AulaVisual;
const pending={image:null,unavailable_media:{image:{path:'static/headers/ausente/e4.png'}}};
assert.match(visual.mediaFor(pending),/pendiente de restauración/);
assert.doesNotMatch(visual.mediaFor(pending),/<img|poster|oficio-plano/);
assert.doesNotMatch(visual.mediaFor({type:'compare'}),/oficio-plano|oficio-escala/);
assert.match(visual.hotspotScene({image:'/static/example.png',alt:'Descripcion especifica'},''),/alt="Descripcion especifica"/);
assert.doesNotMatch(visual.hotspotScene(pending,'<button style="left:30%">Punto</button>'),/left:30%/);
assert.equal(visual.mediaFor({...pending,type:'hotspot'}),'');

vm.runInContext(fs.readFileSync(path.join(root,'static/media-fallback.js'),'utf8'),scope);
assert.equal(scope.window.AulaVisual.mediaFor({type:'reflect'}),'');
assert.doesNotMatch(scope.window.AulaVisual.mediaFor(pending),/video|poster/);

vm.runInContext(fs.readFileSync(path.join(root,'static/encargos.js'),'utf8'),scope);
const host={dataset:{station:'2',ae:'1'}};
const first=scope.encargosUi(host);
first.drafts.same='Borrador modulo 1';
scope.current.id=2;
const second=scope.encargosUi(host);
assert.equal(second.drafts.same,undefined);
scope.current.id=1;
assert.equal(scope.encargosUi(host).drafts.same,'Borrador modulo 1');
scope.auth.user.id=8;
assert.equal(scope.encargosUi(host).drafts.same,undefined);
vm.runInContext(fs.readFileSync(path.join(root,'static/integrated-station.js'),'utf8'),scope);
scope.current.content.cases=[{image:'/static/headers/acuicultura/e3.webp'},{image:'/static/headers/acuicultura/e3.webp'}];
assert.equal(scope.integrationPhoto(0),'/static/headers/acuicultura/e3.webp?v=4');
scope.current.content.cases=[pending];
assert.equal(scope.integrationPhoto(0),'');
assert.doesNotMatch(scope.integrationThumbnail(0),/<img|clinica|workshop/);
scope.current.content.cases=[{difficulty:'Avanzada'}, {difficulty:'Inicial'}];
assert.equal(scope.integrationLevel(0),'Avanzada');
assert.equal(scope.integrationLevel(1),'Inicial');
scope.current.content.cases=[{}];
assert.equal(scope.integrationLevel(0),'Sin clasificar');
console.log('17 comprobaciones: recursos, dificultad declarada y borradores aislados.');
