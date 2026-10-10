import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('the 451 real modules retain scene content and controls without the two closing notices',()=>{
  const rows=JSON.parse(execFileSync('.venv/Scripts/python.exe',['-c',
    "import sqlite3,json; c=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True); rows=[]\nfor r in c.execute('SELECT id,course_id,title,content FROM modules'):\n content=json.loads(r[3]); rows.append(dict(id=r[0],course_id=r[1],title=r[2],content=dict(scene=content['scene'],aes=[{k:v for k,v in a.items() if k in ('title','description')} for a in content['aes']])))\nprint(json.dumps(rows))"],
    {encoding:'utf8',maxBuffer:8*1024*1024}));
  assert.equal(rows.length,451);
  assert.equal(new Set(rows.map(row=>row.course_id)).size,45);
  const scope=vm.createContext({esc:escape,icon:kind=>`<svg data-icon="${kind}"></svg>`,
    window:{AulaVisual:{sceneStage:()=>'<div data-original-scene-stage></div>'}},
    courses:[...new Set(rows.map(row=>row.course_id))].map(id=>({id,title:`Especialidad ${id}`})),
    inspected:new Set(),auth:{user:{role:'student'}}});
  vm.runInContext(read('static/work-zone.js'),scope);
  vm.runInContext(read('static/course-tools.js'),scope);
  for(const row of rows)for(const [role,closed,caseCount] of [['student',false,0],['student',false,15],['student',true,15],['teacher',false,0]]) {
    scope.auth.user.role=role;
    scope.current={...row,state:{cases:Object.fromEntries(Array.from({length:caseCount},(_,i)=>[i,{text:'Evidencia original'}])),scene:{text:'Conclusion conservada'},closed}};
    const before=JSON.stringify(scope.current);
    const html=scope.enrichedScene();
    assert.doesNotMatch(html,/scene-closing-notes|scene-prerequisite|scene-spatial-note|Completa antes las 15|Representaci[o\u00f3]n espacial/);
    const title=escape(row.content.scene.title);
    if(/^Recorrido espacial interactivo(?:\s|$)/i.test(row.content.scene.title))assert.ok(!html.includes(`<h3>${title}</h3>`));
    else assert.ok(html.includes(`<h3>${title}</h3>`),'keep distinctive scene titles');
    assert.match(html,/data-original-scene-stage/);
    assert.equal((html.match(/data-action="inspect"/g)||[]).length,row.content.scene.parts.length);
    assert.match(html,/id="scene-form"/);
    assert.match(html,/id="scene-evidence-text" name="text" rows="7" minlength="20" maxlength="10000" required/);
    assert.match(html,/>Conclusion conservada<\/textarea>/);
    assert.match(html,/Guardar evidencia y completar estaci[o\u00f3]n 3/);
    assert.equal(/required readonly/.test(html),role==='teacher'||closed);
    assert.match(html,/scene-nubi-support/);
    assert.match(html,/Aprendizajes que movilizas/);
    assert.match(html,/Ruta de esta actividad/);
    assert.equal(JSON.stringify(scope.current),before);
  }
});

test('only the referenced small decorative puzzle icon is hidden across module sections; progression guards stay intact',()=>{
  const css=read('static/feedback-front.css');
  assert.match(css,/body\[data-screen="module"\] #app #main \.work-ico\[data-ico="puzzle"\]\{display:none!important\}/);
  assert.match(css,/\.lr-stage-icon\[aria-hidden="true"\]:has\(>\.work-ico\[data-ico="puzzle"\]\)\{display:none!important\}/);
  assert.match(css,/\.ped-route-item:has\(>\.work-ico\[data-ico="puzzle"\]\)\{align-self:stretch!important\}/);
  assert.doesNotMatch(css,/scene-closing-notes|scene-spatial-note|scene-prerequisite/);
  const api=read('app.py');
  assert.match(api,/if len\(s\['cases'\]\)!=15:return fail\(/);
  assert.match(read('static/app.js'),/kind:'scene',inspected:\[\.\.\.inspected\],text:d\.text/);
});
