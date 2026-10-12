import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const s={esc:String};s.window=s;vm.createContext(s);
for(const file of ['course-artwork-catalog.js','course-artwork.js','encargo-photo-catalog.js','encargo-photo-selection.js','situation-photo-catalog.js','situation-photo-selection.js','activity-engine.js'])vm.runInContext(read('static/'+file),s);
const records=s.AulaCourseArtworkData.courses;
const productionIds=[1,2,3,4,5,6,7,33,8,35,9,10,38,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,43,26,27,28,41,29,30,31,32,34,36,37,39,40,42,44,45];
test('all 45 production course IDs resolve the same subjects as the canonical titles',()=>{
 for(const [index,id] of productionIds.entries()){
  const row=records[id],course={id:index+1,title:row.title};
  for(const title of ['',...row.modules.map(m=>m.title)]){
   const item={title, instruction:{object:title}};
   const before=JSON.stringify({item,course});
   assert.equal(s.encargoPhotoTopic(item,course,title),s.encargoPhotoTopic(item,{...course,id},title),row.title+'/'+title);
   assert.equal(JSON.stringify({item,course}),before);
  }
 }
});
test('an overlapping module ID cannot override a different title in production',()=>{
 const row=records[4],target=row.modules.find(m=>m.title==='Emprendimiento y empleabilidad');
 assert.ok(target);
 const source=row.modules.find(m=>m.id===36);
 assert.ok(source&&source.title!==target.title);
 const actual={id:36,position:target.position,title:target.title};
 assert.equal(s.moduleArtworkPhoto({id:4,title:row.title},actual).image,target.photo.image);
});
test('reviewed exclusions cannot reappear in module artwork or context selectors',()=>{
 for(const row of Object.values(records)){
  assert.ok(s.courseContextPhotoAllowed(row.cover));
  const course={id:row.id,title:row.title};
  for(const module of row.modules){
   assert.ok(s.courseContextPhotoAllowed(module.photo));
   const item={title:module.title,instruction:{object:module.title}};
   assert.ok(s.courseContextPhotoAllowed(s.encargoRealPhoto(item,course,module.title)));
   const m={...module,content:{cases:Array.from({length:15},(_,i)=>({title:module.title,criterion:module.title,question:'Original '+i,answer:i%4}))}};
   const before=JSON.stringify(m);
   const photos=s.situationPhotoSet(m,course);
   assert.equal(photos.length,15);
   assert.ok(photos.every(p=>p&&s.courseContextPhotoAllowed(p)),module.title);
   assert.equal(new Set(photos.map(p=>p.fingerprint)).size,15,module.title);
   assert.equal(JSON.stringify(m),before);
  }
 }
});
test('development case changes only the context photograph, not the original case',()=>{
 const row=records[6],module=row.modules[0],pack={context:'Contexto original',role:'Rol original',objective:'Objetivo original',development:'Caso original',evidence:['Dato original']};
 s.courses=[{id:6,title:row.title}];s.current={...module,course_id:6,content:{development:'Caso original'}};
 const before=JSON.stringify({pack,current:s.current});
 const html=s.developmentPackMarkup(pack);
 assert.ok(html.includes(module.photo.image));
 assert.ok(html.includes('Dato original'));
 assert.ok(!html.includes('/static/headers/general/e3.png'));
 assert.equal(JSON.stringify({pack,current:s.current}),before);
});
test('each module has five different station headers without touching content or state',()=>{
 for(const row of Object.values(records))for(const m of row.modules){
  const module={...m,content:{cases:Array.from({length:15},()=>({title:m.title,criterion:m.title})),encargos:{items:[{title:m.title,station:2}]}},state:{context:'Evidencia original',exam:{answer:2}}};
  const course={id:row.id,title:row.title},before=JSON.stringify(module);
  const photos=s.stationArtworkPhotos(course,module);
  assert.equal(photos.length,5);
  assert.equal(new Set(photos.map(p=>p.fingerprint||p.image)).size,5,m.title);
  assert.equal(photos[0].image,m.photo.image);
  assert.equal(JSON.stringify(module),before);
 }
});
