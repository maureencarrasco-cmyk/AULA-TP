import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
function runtime(photos){
 const context=vm.createContext({SITUATION_PHOTOS:photos});
 for(const file of ['encargo-photo-selection.js','situation-photo-selection.js'])vm.runInContext(readFileSync(new URL('../static/'+file,import.meta.url),'utf8'),context);
 return context;
}
const photos=Array.from({length:15},(_,i)=>({image:`/static/situation-photos/test-${i}.jpg`,source:`source-${i}`,fingerprint:`hash-${i}`,title:i===7?'Feeding fish at hatchery':'Fish hatchery '+i,alt:'Contexto de criadero'}));
const module={title:'Manejo de reproductores y larvas',content:{cases:Array.from({length:15},(_,i)=>({title:'Situacion '+(i+1),criterion:i===0?'Planifica la alimentacion de reproductores':'Acondiciona reproductores',answer:i%4,options:['A','B','C','D']}))}};
test('all 15 cases have distinct pictures across carousel pages without changing content',()=>{
 const context=runtime({hatchery:photos});const before=JSON.stringify(module);
 const chosen=context.situationPhotoSet(module,{id:19});
 assert.equal(chosen.length,15);assert.equal(new Set(chosen.map(p=>p.fingerprint)).size,15);
 assert.equal(chosen[0].title,'Feeding fish at hatchery');
 for(let i=0;i<15;i++)assert.equal(context.situationPhotoAt(module,{id:19},i).image,chosen[i].image);
 assert.equal(JSON.stringify(module),before);
});
test('duplicate files are excluded even when filenames or source URLs differ',()=>{
 const context=runtime({hatchery:[photos[0],{...photos[0],image:'other.jpg',source:'other'},...photos.slice(1)]});
 assert.equal(new Set(context.situationPhotoSet(module,{id:19}).map(p=>p.fingerprint)).size,15);
});
test('a shortage is explicit; unrelated course photographs are never inserted',()=>{
 const chosen=runtime({hatchery:[photos[0]],car:photos}).situationPhotoSet(module,{id:19});
 assert.equal(chosen.filter(Boolean).length,1);assert.equal(chosen[1],null);
});
