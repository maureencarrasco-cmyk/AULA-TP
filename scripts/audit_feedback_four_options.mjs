import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const python='.venv/Scripts/python.exe';
const catalog=JSON.parse(execFileSync(python,['-c',`import json,sqlite3
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
out=[]
for mid,cid,title,raw in con.execute('select id,course_id,title,content from modules'):
 c=json.loads(raw)
 aes=[{k:a.get(k) for k in ['title','short_title','summary','purpose','description','criteria']} for a in c.get('aes',[])]
 cases=c.get('cases',[])
 last={k:cases[-1].get(k) for k in ['ae','criterion','title','site','context','image','alt','caption','media_role','requires_image','document']} if cases else {}
 out.append(dict(id=mid,course_id=cid,title=title,content=dict(aes=aes,cases=[last] if cases else [],questions=[],pass_percent=c.get('pass_percent',60))))
print(json.dumps(out))
`],{encoding:'utf8',maxBuffer:16*1024*1024}));
const scope=vm.createContext({
 auth:{user:{role:'student',id:'audit'}},document:{addEventListener(){}},courses:[],
 icon:name=>`<svg aria-hidden="true" data-icon="${name}"></svg>`,
 esc:v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 action:(name,label,cls='',attrs='')=>`<button data-action="${name}" ${attrs}>${label}</button>`,
 feedbackDemoSelected:()=>null,feedbackDemoEvolution:()=>null,
 moduleFeedbackEvidence:()=>'',achievementProgressTable:()=>''
});
scope.feedbackResultState=()=>scope.current.state;
vm.runInContext(fs.readFileSync('static/feedback-station.js','utf8'),scope);
const records=[];
for(const module of catalog){
 scope.current={...module,state:{ae:{},cases:{},closed:false,draft:{}}};
 const before=JSON.stringify(scope.current);
 for(const tab of ['analiza','comprende','conecta','transfiere','proyecta']){
  const html=scope.feedbackBody(tab);
  assert.equal(JSON.stringify(scope.current),before);
  records.push({moduleId:module.id,courseId:module.course_id,tab,html});
 }
}
const parser=`import json,sys
from html.parser import HTMLParser
class Groups(HTMLParser):
 def __init__(self):
  super().__init__();self.stack=[];self.groups={};self.serial=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.serial+=1
  if tag=='input' and a.get('type') in ('radio','checkbox'):
   label=next((n for n in reversed(self.stack) if n['tag']=='label'),None)
   if label:
    key=(label['parent'],a['type'],a.get('name','') if a['type']=='radio' else '')
    self.groups.setdefault(key,[]).append(a)
  if tag not in ('input','img','br','hr','meta','link','source','track'):
   self.stack.append(dict(tag=tag,id=self.serial,parent=self.stack[-1]['id'] if self.stack else 0))
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i]['tag']==tag:
    self.stack=self.stack[:i];break
out=[]
for row in json.load(sys.stdin):
 p=Groups();p.feed(row.pop('html'))
 row['fourGroups']=sum(len(v)==4 for v in p.groups.values())
 row['unchangedOtherGroups']=sum(len(v)!=4 for v in p.groups.values())
 row['groupSizes']=[len(v) for v in p.groups.values()]
 out.append(row)
print(json.dumps(out))`;
const rows=JSON.parse(execFileSync(python,['-c',parser],{input:JSON.stringify(records),encoding:'utf8',maxBuffer:16*1024*1024}));
const summary={courses:new Set(catalog.map(m=>m.course_id)).size,modules:catalog.length,renders:rows.length,
 fourGroups:rows.reduce((n,r)=>n+r.fourGroups,0),otherGroupsExcluded:rows.reduce((n,r)=>n+r.unchangedOtherGroups,0),
 byTab:Object.fromEntries(['analiza','comprende','conecta','transfiere','proyecta'].map(tab=>[tab,rows.filter(r=>r.tab===tab).reduce((n,r)=>n+r.fourGroups,0)])),
 moduleStateUnchanged:true};
assert.equal(summary.courses,45);assert.equal(summary.modules,451);
const path='reports/estacion6-cuatro-opciones-20261009';
fs.mkdirSync(path,{recursive:true});
fs.writeFileSync(`${path}/catalogo-verificado.json`,JSON.stringify({summary,rows},null,2));
console.log(JSON.stringify(summary));
