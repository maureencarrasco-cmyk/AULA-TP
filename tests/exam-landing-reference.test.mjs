import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

function assessmentScope(){
  const scope=vm.createContext({
    icons:{file:'file',edit:'edit',check:'check',cube:'cube'},
    tab:'questions',examStarted:false,questionIndex:0,examDraft:{answers:{},development:''},examReviewMarks:new Set(),
    current:{id:227,content:{evaluation_plan:{question_count:25,development_required:true,minutes:12},questions:Array.from({length:25},(_,i)=>({question:`Original question ${i+1}`,options:['A','B','C','D']})),development:'Original final case',rubric:[{name:'Original rubric'}]},state:{draft:{},exam:null}},
    icon:name=>`<svg class="icon" data-icon="${name}" aria-hidden="true"></svg>`,
    esc:value=>String(value??''),cargaLabel:()=> '12 min',
    action:(name,label,cls='',attrs='')=>`<button type="button" class="${cls}" data-action="${name}" ${attrs}>${label}</button>`,
    workZone:(html,extra)=>`<div class="work-zone ${extra}">${html}</div>`,
    workCard:(kind,title,body)=>`<article><h3>${title}</h3>${body}</article>`,
    mcqItemMarkup:(q,{index,selected})=>`<div data-original-question="${index}" data-selected="${selected??''}">${q.question}</div>`
  });
  vm.runInContext(fs.readFileSync(new URL('../static/exam-station.js',import.meta.url),'utf8'),scope);
  return scope;
}

test('Reference presentation keeps live counts, section actions and selection',()=>{
  const scope=assessmentScope(),before=JSON.stringify(scope.current);
  for(const selected of ['questions','development']){
    scope.tab=selected;
    const html=scope.examLanding();
    assert.match(html,/work-zone-s4 exam-landing-reference/);
    assert.match(html,/exam-closing-emblem/);
    assert.match(html,/class="exam-count-questions"><b>25<\/b>/);
    assert.match(html,/class="exam-count-development"><b>1<\/b>/);
    assert.match(html,/class="exam-count-total"><b>26<\/b>/);
    assert.equal((html.match(/data-action="exam-tab"/g)||[]).length,2);
    assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
    assert.match(html,new RegExp(`data-tab="${selected}"[^>]*aria-pressed="true"`));
    assert.equal((html.match(/class="exam-reference-tab-icon"/g)||[]).length,2);
    assert.equal((html.match(/class="exam-tab-current"/g)||[]).length,1);
    assert.equal((html.match(/data-action="start-exam"/g)||[]).length,1);
    assert.match(html,/La Pr\u00e1ctica libre y el Agente pedag\u00f3gico no forman parte de la calificaci\u00f3n/);
    assert.match(html,/Las respuestas se registran autom\u00e1ticamente/);
    assert.equal(JSON.stringify(scope.current),before);
  }
  scope.current.content.evaluation_plan={question_count:5,development_required:false};
  const short=scope.examLanding();
  assert.match(short,/class="exam-count-total"><b>5<\/b>/);
  assert.doesNotMatch(short,/exam-count-development|data-tab="development"/);
  assert.equal((short.match(/data-action="exam-tab"/g)||[]).length,1);
  assert.match(short,/5 preguntas de selecci\u00f3n m\u00faltiple para demostrar/);
});

test('Draft continuation and delivered assessment remain separate from the landing',()=>{
  const scope=assessmentScope();
  scope.current.state.draft={answers:{0:1},development:'Saved draft'};
  assert.match(scope.examPanel(),/Continuar borrador/);
  const before=JSON.stringify(scope.current);
  scope.current.state.exam={score:20,max_score:25};
  const delivered=scope.examPanel();
  assert.match(delivered,/20 \/ 25 puntos/);
  assert.match(delivered,/#module\/227\/5/);
  assert.doesNotMatch(delivered,/exam-landing-reference|data-action="start-exam"/);
  scope.current.state.exam=null;
  assert.equal(JSON.stringify(scope.current),before);
});

test('Redundant introductory strip is absent from every assessment view',()=>{
  const scope=assessmentScope();
  for(const state of ['landing','draft','active','delivered']){
    scope.examStarted=state==='active';
    scope.current.state.exam=state==='delivered'?{score:20,max_score:25}:null;
    scope.current.state.draft=state==='draft'?{answers:{0:1}}:{};
    assert.doesNotMatch(scope.examPanel(),/station-intro-meta|Demuestra que puedes integrar/);
  }
});

test('Question navigation, written evidence and submission requirements are unchanged',()=>{
  const scope=assessmentScope();
  scope.examStarted=true;
  let html=scope.examPanel();
  assert.match(html,/id="exam-form"/);
  assert.equal((html.match(/data-action="question"/g)||[]).length,27);
  assert.match(html,/data-original-question="1"/);
  assert.match(html,/data-action="submit-exam" disabled/);
  scope.questionIndex=24;
  html=scope.examForm();
  assert.match(html,/data-original-question="25"/);
  assert.match(html,/Ir al desarrollo/);
  scope.tab='development';
  html=scope.examForm();
  assert.match(html,/Original final case/);
  assert.match(html,/id="development" rows="8" minlength="80" maxlength="10000"/);
  assert.match(html,/Original rubric/);
  scope.examDraft={answers:Object.fromEntries(Array.from({length:25},(_,i)=>[i,0])),development:'x'.repeat(79)};
  assert.match(scope.examForm(),/data-action="submit-exam" disabled/);
  scope.examDraft.development+='x';
  assert.doesNotMatch(scope.examForm(),/data-action="submit-exam" disabled/);
  scope.examDraft.answers={0:1};
  assert.match(scope.examForm(),/data-action="submit-exam" disabled/);
  assert.ok(fs.existsSync(new URL('../static/themes/evaluation-trophy.png',import.meta.url)));
});
