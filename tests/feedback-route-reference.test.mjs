import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const stages=[
  ['analiza','Analiza','\u00bfC\u00f3mo me fue?','activity-results-illustration.png'],
  ['comprende','Comprende','\u00bfQu\u00e9 significan mis resultados?','open-book-icon.png'],
  ['conecta','Conecta','\u00bfC\u00f3mo se relaciona lo aprendido?','situation-puzzle-icon.png'],
  ['transfiere','Transfiere','\u00bfC\u00f3mo lo utilizo en una situaci\u00f3n nueva?','activity-document-icon.png'],
  ['proyecta','Proyecta','\u00bfQu\u00e9 aprendizaje me llevo?','objective-target-icon.png']
];

function feedbackScope(){
  const scope=vm.createContext({
    tab:'analiza',auth:{user:{id:7,role:'student'}},
    current:{id:227,content:{aes:['Original AE']},state:{closed:false,draft:{text:'Saved answer'}}},
    document:{addEventListener(){}},
    icon:name=>`<svg class="icon" data-icon="${name}" aria-hidden="true"></svg>`,
    workZone:(html,extra)=>`<div class="work-zone ${extra}">${html}</div>`,
    activityNumberBadges:html=>html
  });
  vm.runInContext(fs.readFileSync(new URL('../static/feedback-station.js',import.meta.url),'utf8'),scope);
  scope.feedbackDemoPanel=()=>'<section data-original-demo></section>';
  for(const [fn,id] of [['analizaDash','analiza'],['fbComprendeBodyV3','comprende'],['conectaGuidedBody','conecta'],['transfiereGuidedBody','transfiere'],['proyectaGuidedBody','proyecta']]){
    scope[fn]=()=>`<form data-original-body="${id}"><textarea>Saved answer</textarea></form>`;
  }
  return scope;
}

test('Five reference cards preserve order, labels, navigation and one selected stage',()=>{
  const scope=feedbackScope(),before=JSON.stringify(scope.current);
  for(const [selected] of stages){
    const html=scope.analizaSteps(selected);
    const buttons=[...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)].map(match=>match[0]);
    assert.equal(buttons.length,5);
    assert.equal((html.match(/aria-current="step"/g)||[]).length,1);
    assert.equal((html.match(/class="az-step-connector"/g)||[]).length,4);
    assert.equal((html.match(/class="az-step-arrow"/g)||[]).length,5);
    assert.equal((html.match(/class="feedback-route-image"/g)||[]).length,5);
    assert.doesNotMatch(html,/class="az-step-ico"/);
    stages.forEach(([id,title,question,image],i)=>{
      assert.ok(buttons[i].includes(`data-action="tab" data-tab="${id}"`));
      assert.ok(buttons[i].includes(`aria-current="${id===selected?'step':'false'}"`));
      assert.ok(buttons[i].includes(`<span class="az-step-num">${i+1}</span>`));
      assert.ok(buttons[i].includes(`<b>${title}</b><small>${question}</small>`));
      assert.ok(buttons[i].includes(`src="/static/${image}" alt="" width="76" height="76"`));
      assert.ok(fs.existsSync(new URL(`../static/${image}`,import.meta.url)));
    });
    assert.equal(JSON.stringify(scope.current),before);
  }
  assert.match(scope.analizaTitle(),/26\u201336 min/);
  assert.match(scope.analizaTitle(),/aria-labelledby="feedback-route-title"/);
});

test('Reference presentation retains each original activity body, aliases and demo panel',()=>{
  const scope=feedbackScope(),before=JSON.stringify(scope.current);
  for(const [requested,expected] of [...stages.map(([id])=>[id,id]),['results','analiza'],['feedback','comprende'],['plan','proyecta'],['','analiza']]){
    scope.tab=requested;
    const html=scope.feedbackPanel();
    assert.match(html,/work-zone-s5 feedback-reference-zone/);
    assert.ok(html.includes(`data-tab="${expected}" aria-current="step"`));
    assert.ok(html.includes(`<div class="az-summary"><form data-original-body="${expected}"><textarea>Saved answer</textarea></form></div>`));
    assert.match(html,/<section data-original-demo><\/section>/);
    assert.equal(scope.tab,requested);
    assert.equal(JSON.stringify(scope.current),before);
  }
});

test('Saved reflections remain isolated by student, module and stage',()=>{
  const scope=feedbackScope();
  assert.equal(scope.s5DraftKey('analiza'),'aula-tp-s5-analiza:7:227');
  scope.current.id=228;
  assert.equal(scope.s5DraftKey('analiza'),'aula-tp-s5-analiza:7:228');
  scope.auth.user.id=8;
  assert.equal(scope.s5DraftKey('proyecta'),'aula-tp-s5-proyecta:8:228');
});
