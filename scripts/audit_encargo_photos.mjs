import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const db=spawnSync(path.join(root,'.venv/Scripts/python.exe'),['-c',`import json,sqlite3
from pedagogy import enrich
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
con.row_factory=sqlite3.Row
result=[]
for row in con.execute('SELECT m.id,m.title,m.position,m.course_id,m.content,c.title AS course_title FROM modules m JOIN courses c ON c.id=m.course_id ORDER BY c.id,m.position'):
 data=dict(row); content=enrich(json.loads(data.pop('content')),row['position']); data['items']=(content.get('encargos') or {}).get('items',[]); result.append(data)
print(json.dumps(result,ensure_ascii=False))`],{cwd:root,encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'},maxBuffer:40*1024*1024});
if(db.status!==0)throw new Error(db.stderr);
const modules=JSON.parse(db.stdout);
const catalog=JSON.parse(readFileSync(path.join(root,'static/encargo-photos/catalog.json'),'utf8').replace(/^\uFEFF/,''));
const ctx=vm.createContext({});
vm.runInContext(readFileSync(path.join(root,'static/encargo-photo-selection.js'),'utf8'),ctx);
let missing=0;
const rows=modules.flatMap(module=>module.items.map(item=>{
 const topic=ctx.encargoPhotoTopic(item,{id:module.course_id},module.title);
 const photo=catalog[topic];
 const available=!!photo&&existsSync(path.join(root,'static/encargo-photos',photo.file));
 if(!available)missing++;
 return {courseId:module.course_id,course:module.course_title,moduleId:module.id,module:module.title,station:item.station,encargoId:item.id,title:item.title,topic,image:photo?.file||null,source:photo?.source||null,available};
}));
const report={courses:new Set(modules.map(m=>m.course_id)).size,modules:modules.length,encargos:rows.length,missing,subjects:new Set(rows.map(r=>r.topic)).size,rows};
const folder=path.join(root,'reports/encargos-fotos-20261008');mkdirSync(folder,{recursive:true});
writeFileSync(path.join(folder,'cobertura.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,rows:undefined},null,2));
if(missing)process.exitCode=1;
