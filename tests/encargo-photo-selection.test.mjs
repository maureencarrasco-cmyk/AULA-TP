import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const context=vm.createContext({});
vm.runInContext(readFileSync(new URL('../static/encargo-photo-selection.js',import.meta.url),'utf8'),context);
const pick=(course,title,module='')=>context.encargoPhotoTopic({title},{id:course},module);
test('photos follow the actual work, not the generic evidence product',()=>{
  assert.equal(pick(19,'Encargo de oficio 2','Manejo de reproductores, desove y crías de larvas'),'hatchery');
  assert.equal(pick(19,'Trabajos subacuáticos'),'diving');
  assert.equal(pick(3,'Administración de medicamentos'),'medication');
  assert.equal(pick(35,'Manejo de técnicas de riego'),'irrigation');
  assert.equal(pick(37,'Elaboración de vinos'),'wine');
  assert.equal(pick(44,'Fabricación de matrices'),'molds');
  assert.equal(pick(43,'Soldadura'),'welding');
  assert.equal(pick(31,'Diseño de bases de datos relacionales'),'programming');
  assert.equal(pick(1,'Dossier sala: planta y leyenda'),'plans');
  assert.equal(pick(8,'Emprendimiento y empleabilidad'),'meeting');
});
test('all 45 courses have an explicit photographic subject',()=>{
  for(let id=1;id<=45;id++)assert.notEqual(pick(id,'Encargo profesional'),'meeting',`course ${id}`);
});
test('catalog records sources, reusable licenses, and local photographic files',()=>{
  const catalog=JSON.parse(readFileSync(new URL('../static/encargo-photos/catalog.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
  const code=readFileSync(new URL('../static/encargo-photo-selection.js',import.meta.url),'utf8');
  const keys=[...new Set([...code.matchAll(/'([a-z]+)'/g)].map(m=>m[1]).filter(k=>!['use','meeting'].includes(k)))];
  keys.push('meeting');
  for(const key of keys){
    const photo=catalog[key];assert.ok(photo,`missing ${key}`);
    assert.match(photo.source,/https:\/\/commons.wikimedia.org\/wiki\/File/);
    assert.match(photo.license,/CC0|Public domain|CC BY|CC-BY/);
    assert.ok(existsSync(new URL(`../static/encargo-photos/${photo.file}`,import.meta.url)),key);
  }
});
