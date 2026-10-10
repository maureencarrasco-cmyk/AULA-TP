import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const source=fs.readFileSync(new URL('../static/visual-sim.js',import.meta.url),'utf8');
function harness() {
  const scope={window:{},current:{content:{}},esc:x=>String(x??''),
    workIco:kind=>`<span class="work-ico"><svg data-icon="${kind}"></svg></span>`};
  vm.runInNewContext(source,scope);
  return {api:scope.window.AulaVisual,scope};
}
test('the shared toolbar retains the same three native actions and accessible names',()=>{
  const {api}=harness(),html=api.figure('/static/example.jpg');
  assert.equal((html.match(/data-vis-z=/g)||[]).length,3);
  for(const [action,label] of [['in','Acercar'],['out','Alejar'],['reset','Restablecer zoom']]) {
    assert.match(html,new RegExp(`data-vis-z="${action}" aria-label="${label}"`));
  }
  assert.match(html,/vis-zoom-in/);assert.match(html,/vis-zoom-out/);assert.match(html,/vis-zoom-reset/);
  assert.match(html,/data-icon="refresh"/);assert.match(html,/vis-zoom-label">Restablecer/);
  assert.doesNotMatch(api.figure('/static/example.jpg',{zoom:false}),/data-vis-z=/);
});
function zoomFixture() {
  const clicks=[],frameClicks=[],target={style:{}};
  const bar={addEventListener:(type,fn)=>clicks.push(fn)};
  const frame={dataset:{},parentElement:{querySelector:()=>bar},querySelector:()=>target,
    addEventListener:(type,fn)=>frameClicks.push(fn),getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})};
  const root={querySelectorAll:()=>[frame]};
  const click=action=>clicks[0]({target:{closest:()=>({dataset:{visZ:action}})},preventDefault(){}});
  return {root,frame,target,click,clicks,frameClicks};
}
test('zoom, lower/upper bounds and reset still work and hydration is idempotent',()=>{
  const {api}=harness(),f=zoomFixture();api.bindZoom(f.root);api.bindZoom(f.root);
  assert.equal(f.clicks.length,1);
  f.click('in');assert.equal(f.target.style.transform,'scale(1.25)');
  f.frameClicks[0]({target:{closest:()=>null},clientX:20,clientY:80});
  assert.equal(f.target.style.transformOrigin,'20% 80%');
  f.click('out');assert.equal(f.target.style.transform,'scale(1)');
  for(let i=0;i<20;i++)f.click('out');assert.equal(f.target.style.transform,'scale(1)');
  for(let i=0;i<20;i++)f.click('in');assert.equal(f.target.style.transform,'scale(2.6)');
  f.click('reset');assert.equal(f.target.style.transform,'scale(1)');
  assert.equal(f.target.style.transformOrigin,'50% 50%');
});
test('separate image zoom controls stay independent of camera and official state',()=>{
  const {api,scope}=harness(),a=zoomFixture(),b=zoomFixture();
  const before=JSON.stringify(scope.current),camera=JSON.stringify(scope.window.sceneCam);
  api.bindZoom(a.root);api.bindZoom(b.root);a.click('in');
  assert.equal(b.target.style.transform,undefined);b.click('reset');
  assert.equal(a.target.style.transform,'scale(1.25)');
  assert.equal(JSON.stringify(scope.current),before);assert.equal(JSON.stringify(scope.window.sceneCam),camera);
});
test('all 45 courses and 451 modules use the shared image and hotspot toolbar without changing content',()=>{
  const modules=JSON.parse(execFileSync('.venv/Scripts/python.exe',['-c',
    `import sqlite3,json
c=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
modules=[]
for mid,cid,raw in c.execute('SELECT id,course_id,content FROM modules'):
    content=json.loads(raw)
    image=(content.get('scene') or {}).get('image') or (content.get('explore') or {}).get('image') or next((q.get('image') for q in content.get('questions',[]) if q.get('image')),None)
    modules.append(dict(id=mid,course_id=cid,content=dict(scene=dict(image=image))))
print(json.dumps(modules))`],
    {encoding:'utf8',maxBuffer:4*1024*1024}));
  assert.equal(modules.length,451);assert.equal(new Set(modules.map(x=>x.course_id)).size,45);
  const {api,scope}=harness();
  for(const module of modules) {
    scope.current=module;const before=JSON.stringify(module);
    const image=module.content.scene?.image||module.content.explore?.image||module.content.questions?.find(x=>x.image)?.image;
    assert.ok(image,`Module ${module.id} has an existing visual resource`);
    for(const html of [api.figure(image),api.hotspotScene({image},'<button class="act-spot">Evidencia</button>')]) {
      assert.equal((html.match(/data-vis-z=/g)||[]).length,3);
      assert.match(html,/vis-zoom-label">Restablecer/);
    }
    assert.equal(JSON.stringify(module),before);
  }
});
test('reference colors, focus, wrapping and accessibility are isolated to image zoom',()=>{
  const css=fs.readFileSync(new URL('../static/visual-zoom-reference.css',import.meta.url),'utf8');
  assert.match(css,/--zoom-ink:#087748/);assert.match(css,/--zoom-ink:#b52350/);assert.match(css,/--zoom-ink:#1046a3/);
  assert.match(css,/flex-wrap:wrap/);assert.match(css,/:focus-visible/);
  assert.match(css,/body.high-contrast/);assert.match(css,/data-access-text="xlarge"/);
  assert.match(css,/prefers-reduced-motion/);assert.doesNotMatch(css,/vis-cam|vis-frame|act-spot/);
  const index=fs.readFileSync(new URL('../static/index.html',import.meta.url),'utf8');
  assert.match(index,/visual-zoom-reference.css\?v=20261010-zoom-reference/);
});
