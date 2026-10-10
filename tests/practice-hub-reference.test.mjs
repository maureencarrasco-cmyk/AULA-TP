import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const source = fs.readFileSync('static/practice-free.js', 'utf8');
const marker = 'window.AulaPractice = {open, close, stats};';
const catalog = JSON.parse(execFileSync('.venv/Scripts/python.exe', ['-c', `import sqlite3,json
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
fields=['question','title','context','options','answer','explanation','difficulty','skill','representation','format','ae']
out=[]
for mid,cid,pos,raw in con.execute('select id,course_id,position,content from modules'):
 c=json.loads(raw)
 content={k:[{f:item[f] for f in fields if f in item} for item in c.get(k,[])] for k in ['questions','cases','aes']}
 content['practice']=c.get('practice',{})
 out.append(dict(id=mid,course_id=cid,position=pos,content=content))
print(json.dumps(out))`], {encoding:'utf8', maxBuffer:64 * 1024 * 1024}));

function sandbox(document = {}) {
  const storage = new Map();
  const scope = vm.createContext({window:{}, document, view:{station:2}, courses:[], auth:{user:{id:'practice-test'}},
    localStorage:{getItem:key=>storage.get(key) ?? null, setItem:(key,value)=>storage.set(key,value)},
    esc:value=>String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]))});
  vm.runInContext(source.replace(marker, `window.testPractice = {hubHtml,playerHtml,buildActivities,levelActivities,practiceLevel,setPracticeLevel,loadPracticeLevel,supportHtml,openActivity,currentItem,checkChoice,pickIndex,variant,practiceLog,dockPracticeTools,restorePracticeTools,state:()=>state};`), scope);
  return {scope, api:scope.window.testPractice, storage};
}

test('shared launch and real difficulty banks cover all 45 courses without changing content or grades', () => {
  assert.equal(new Set(catalog.map(module=>module.course_id)).size, 45);
  assert.equal(catalog.length, 451);
  const {scope,api} = sandbox();
  let renders = 0;
  for (const module of catalog) {
    scope.current = {...module, state:{closed:false, completed:[false,false,false,false,false], grade:17, draft:'unchanged'}};
    const before = JSON.stringify(scope.current);
    const raw = api.buildActivities();
    assert.equal(raw.case.filter(activity=>activity.type==='case').length, module.content.cases.length);
    for (const level of [1,2,3,4]) {
      assert.ok(api.setPracticeLevel(level));
      const bank = api.levelActivities();
      assert.ok(bank.choice.length, `No choices: module ${module.id}, level ${level}`);
      assert.ok(bank.case.some(activity=>activity.type==='case'), `No cases: module ${module.id}, level ${level}`);
      for (const activity of [...bank.choice,...bank.case]) {
        for (const item of activity.bank) {
          if (activity.type==='lab') continue;
          const original = activity.type==='case' ? module.content.cases[Number(item.id.split('-')[1])] : module.content.questions[Number(item.id.split('-')[1])];
          assert.equal(item.difficulty, original.difficulty);
          assert.equal(item.answer, original.answer);
          assert.equal(item.explanation, original.explanation || original.options[original.answer]);
          assert.deepEqual(Array.from(item.options).slice(0, original.options.length), original.options);
          assert.equal(item.prompt, activity.type==='case' ? '¿Qué harías en esta situación profesional?' : original.question);
          assert.match(item.difficulty, level===1 ? /Inicial/ : level===2 ? /Intermedia/ : /Avanzada/);
        }
      }
      const html = api.hubHtml();
      assert.equal((html.match(/name="pf-level"/g) || []).length, 4);
      assert.equal((html.match(/ checked/g) || []).length, 1);
      assert.equal((html.match(/data-pf="mode"/g) || []).length, 3);
      assert.equal((html.match(/class="pf-launch-back"/g) || []).length, 1);
      assert.match(html, /data-pf="close" class="pf-launch-back">&larr; Atrás/);
      assert.ok(html.includes('Tu práctica libre'));
      assert.ok(html.includes(`value="${level}" checked`));
      assert.ok(!html.includes('data-pf="access"'));
      assert.equal(JSON.stringify(scope.current), before);
      renders++;
    }
  }
  const summary = {courses:45, modules:catalog.length, launchRenders:renders, fourLevelsSelectable:true, originalAnswersPreserved:true, moduleContentAndGradesUnchanged:true, expert:'Advanced bank with autonomous initial support'};
  fs.mkdirSync('reports/practica-libre-referencia-20261009', {recursive:true});
  fs.writeFileSync('reports/practica-libre-referencia-20261009/catalogo-verificado.json', JSON.stringify(summary,null,2));
  console.log(JSON.stringify(summary));
});

test('levels remain selected during navigation and persist separately per user and module', () => {
  const {scope,api,storage} = sandbox();
  scope.current = {...catalog[0],state:{grade:0}};
  api.setPracticeLevel(2);
  const activity = api.levelActivities().choice[0];
  api.openActivity(activity.id);
  assert.equal(api.practiceLevel().id, 2);
  const item = api.currentItem(activity);
  const state = api.state();
  state.choice = item.answer;
  api.checkChoice(activity,item);
  assert.equal(api.state().lastOk, true);
  assert.equal(scope.current.state.grade, 0);
  assert.equal(api.practiceLog()[0].practice_level, 2);
  assert.equal(api.practiceLog()[0].snapshot.difficulty, item.difficulty);
  const lastIndex = api.state().itemIndex;
  if (activity.bank.length > 1) assert.notEqual(api.pickIndex(activity),lastIndex);
  assert.ok(!api.setPracticeLevel(0));
  assert.ok(!api.setPracticeLevel('99'));
  assert.equal(api.practiceLevel().id, 2);
  scope.current = catalog[1];
  api.loadPracticeLevel();
  assert.equal(api.practiceLevel().id, 1);
  scope.current = catalog[0];
  api.loadPracticeLevel();
  assert.equal(api.practiceLevel().id, 2);
  assert.deepEqual([...storage.keys()].sort(), ['aula-tp-practice','aula-tp-practice-levels']);
});

test('expert uses advanced source material with optional support and no new answer rules', () => {
  const {scope,api} = sandbox();
  scope.current = catalog[0];
  api.setPracticeLevel(3);
  const advanced = JSON.stringify(api.levelActivities());
  const support3 = api.supportHtml(api.levelActivities().choice[0]);
  assert.ok(support3.includes('pf-level-reminder'));
  api.setPracticeLevel(4);
  assert.equal(JSON.stringify(api.levelActivities()),advanced);
  const support4 = api.supportHtml(api.levelActivities().choice[0]);
  assert.ok(!support4.includes('pf-level-reminder'));
  assert.ok(support4.includes('<details'));
  assert.ok(!support4.includes(' open'));
  const cases = api.levelActivities().case.filter(activity=>activity.type==='case');
  api.openActivity(cases[0].id);
  api.variant();
  assert.notEqual(api.state().activityId,cases[0].id);
  assert.ok(cases.some(activity=>activity.id===api.state().activityId));
  assert.equal(api.practiceLevel().id,4);
});

test('Nubi docks without overwriting its saved location and restores it on exit', () => {
  const style = new Map([['left',['273px','important']],['top',['63px','important']]]);
  const tools = {style:{getPropertyValue:key=>style.get(key)?.[0] || '',getPropertyPriority:key=>style.get(key)?.[1] || '',setProperty:(key,value,priority)=>style.set(key,[value,priority]),removeProperty:key=>style.delete(key)}};
  const {api,storage} = sandbox({querySelector:()=>tools});
  api.dockPracticeTools();
  assert.equal(tools.style.getPropertyValue('right'),'16px');
  assert.equal(tools.style.getPropertyValue('left'),'auto');
  api.restorePracticeTools();
  assert.equal(tools.style.getPropertyValue('left'),'273px');
  assert.equal(tools.style.getPropertyValue('top'),'63px');
  assert.equal(tools.style.getPropertyValue('right'),'');
  assert.equal(storage.size,0);
  api.dockPracticeTools();
  tools.style.setProperty('left','100px','important');
  api.restorePracticeTools();
  assert.equal(tools.style.getPropertyValue('left'),'100px');
});

test('launch assets and responsive layout are local and isolated from ordinary station tabs', () => {
  const css = fs.readFileSync('static/practice-hub-reference.css','utf8');
  const asset = fs.readFileSync('static/practice-hub-icons.png');
  assert.equal(asset.readUInt32BE(16),2 * asset.readUInt32BE(20));
  assert.ok(css.includes('@media(max-width:1400px)'));
  assert.ok(css.includes('@media(max-width:1100px)'));
  assert.ok(css.includes('@media(max-width:640px)'));
  assert.ok(css.includes('body[data-access-text="xlarge"]'));
  assert.ok(css.includes('body.high-contrast'));
  assert.ok(css.includes('body.simple-visual'));
  assert.ok(fs.readFileSync('static/index.html','utf8').includes('practice-hub-reference.css?v=20261009-practice-back'));
  assert.ok(!/\bfetch\s*\(/.test(source));
});

test('resizing keeps an automatically docked Nubi in view instead of parsing auto as a coordinate', () => {
  const app = fs.readFileSync('static/app.js','utf8');
  const resize = app.slice(app.indexOf('function bindToolsFabResize(){'), app.indexOf('function mountToolsFab('));
  let callback, placed = 0;
  const fab = {style:{left:'auto',top:'auto'},classList:{contains:()=>false}};
  const scope = vm.createContext({window:{addEventListener:(event,listener)=>{callback=listener;}},document:{querySelector:()=>fab},toolsFabApplyPos:()=>{placed++;},toolsFabClamp:(x,y)=>({x,y})});
  vm.runInContext(resize+'\nbindToolsFabResize();',scope);
  callback();
  assert.equal(placed,0);
  fab.style.left='273px'; fab.style.top='63px';
  callback();
  assert.equal(placed,1);
});
