import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const result=spawnSync(path.join(root,'.venv/Scripts/python.exe'),['-c',`import json,sqlite3
from pedagogy import enrich
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
con.row_factory=sqlite3.Row
rows=[]
for r in con.execute('SELECT m.id,m.title,m.position,m.course_id,m.content,c.title AS course_title FROM modules m JOIN courses c ON c.id=m.course_id ORDER BY c.id,m.position'):
 d=dict(r); d['content']=enrich(json.loads(d['content']),r['position']); d['content']={'cases':d['content'].get('cases',[])}; rows.append(d)
print(json.dumps(rows,ensure_ascii=False))`],{cwd:root,encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'},maxBuffer:64*1024*1024});
if(result.status!==0)throw new Error(result.stderr);
const modules=JSON.parse(result.stdout);
const context=vm.createContext({});
for(const file of ['encargo-photo-selection.js','situation-photo-catalog.js','situation-photo-selection.js'])vm.runInContext(readFileSync(path.join(root,'static',file),'utf8'),context);
const shortages={};
const rows=modules.map(module=>{
 const before=JSON.stringify(module);
 const photos=context.situationPhotoSet(module,{id:module.course_id});
 if(JSON.stringify(module)!==before)throw new Error('Case content mutated');
 const missing=photos.map((photo,i)=>{
  if(photo&&existsSync(path.join(root,photo.image.replace(/^\//,''))))return null;
  const item=module.content.cases[i];
  const subject=context.encargoPhotoTopic({title:item.criterion||item.title,instruction:{object:item.context}},{id:module.course_id},module.title);
  shortages[subject]=(shortages[subject]||0)+1;
  return i+1;
 }).filter(Boolean);
 const sources=photos.filter(Boolean).map(photo=>photo.fingerprint||photo.source);
 const urls=photos.filter(Boolean).map(photo=>photo.source);
 const duplicateCount=Math.max(sources.length-new Set(sources).size,urls.length-new Set(urls).size);
 return {course:module.course_title,courseId:module.course_id,module:module.title,moduleId:module.id,count:photos.length,missing,duplicateCount,photos};
});
const summary={courses:new Set(rows.map(r=>r.courseId)).size,modules:rows.length,situations:rows.reduce((n,r)=>n+r.count,0),missing:rows.reduce((n,r)=>n+r.missing.length,0),duplicates:rows.reduce((n,r)=>n+r.duplicateCount,0),shortages};
const folder=path.join(root,'reports/situaciones-fotos-20261008');mkdirSync(folder,{recursive:true});
writeFileSync(path.join(folder,'cobertura.json'),JSON.stringify({...summary,rows},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if(summary.missing||summary.duplicates)process.exitCode=1;
