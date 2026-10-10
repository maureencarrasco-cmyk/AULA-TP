import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../static/module-feedback.js',import.meta.url),'utf8');
const comment={text:'Comentario publicado para este modulo.',teacher_name:'Docente',updated_at:'2026-10-08T12:00:00Z'};

function scopeFor(role='student'){
  const scope=vm.createContext({auth:{user:{role}},current:{id:227,title:'Modulo original',state:{exam:null,closed:false,ae:{'0-0':'Saved evidence'}}},document:{addEventListener(){}},
    esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
    icon:name=>`<svg data-icon="${name}"></svg>`});
  vm.runInContext(source,scope);
  return scope;
}

test('Purple evidence button is functional, role aware and never reports demo reviews as real',()=>{
  for(const role of ['student','teacher']){
    const scope=scopeFor(role),before=JSON.stringify(scope.current);
    scope.feedbackResultState=()=>({exam:{review:{feedback:'Simulated, not published'}}});
    const html=scope.moduleFeedbackEvidence();
    assert.match(html,/type="button".*data-action="module-feedback" aria-haspopup="dialog"/);
    assert.match(html,/Retroalimentaci\u00f3n docente/);
    assert.ok(html.includes(role==='teacher'?'Publicar o editar':'Pendiente de publicaci\u00f3n'));
    assert.equal(JSON.stringify(scope.current),before);
    scope.current.module_feedback=comment;
    assert.ok(scope.moduleFeedbackEvidence().includes(role==='teacher'?'Publicar o editar':'Disponible para leer'));
  }
});

test('Students read safely escaped comments; only teachers get the publishing form',()=>{
  const scope=scopeFor(),payload={feedback:{...comment,text:'<img src=x onerror=attack()>\nAvances reales.'},individual_feedback:'Comentario privado propio.'};
  const student=scope.moduleFeedbackDialogMarkup(payload,false,'Modulo <original>');
  assert.match(student,/&lt;img src=x onerror=attack\(\)&gt;/);
  assert.match(student,/Tu revisi\u00f3n individual/);
  assert.match(student,/data-module-feedback-refresh/);
  assert.doesNotMatch(student,/<img src=x/);
  assert.doesNotMatch(student,/<form|<textarea/);
  const teacher=scope.moduleFeedbackDialogMarkup(payload,true,'Modulo');
  assert.match(teacher,/id="module-feedback-form"/);
  assert.match(teacher,/minlength="20" maxlength="10000" required/);
  assert.doesNotMatch(teacher,/Comentario privado propio/);
  assert.match(scope.moduleFeedbackDialogMarkup({feedback:null},false,'Modulo'),/a\u00fan no ha publicado/);
});

test('Publishing targets the opened module, updates the real comment and retains grades and evidence',async()=>{
  const scope=scopeFor('teacher'),before=JSON.stringify(scope.current.state),calls=[];
  let status={textContent:''},button={disabled:false,innerHTML:''};
  const form={dataset:{},querySelector:selector=>selector==='textarea'?{value:comment.text}:selector==='button[type="submit"]'?button:status};
  const dialog={open:false,classList:{add(){},remove(){}},setAttribute(){},addEventListener(){},showModal(){this.open=true;}};
  const content={innerHTML:'',querySelector:selector=>selector==='#module-feedback-form'?form:null};
  scope.document.getElementById=id=>id==='tool'?dialog:content;
  scope.document.querySelector=()=>null;
  scope.api=async(url,method='GET',body)=>{calls.push({url,method,body});return {module_id:227,feedback:method==='GET'?null:comment};};
  await scope.openModuleFeedback();
  assert.equal(dialog.open,true);
  assert.equal(calls[0].url,'/modules/227/feedback');
  await form.onsubmit({preventDefault(){}});
  assert.equal(calls[1].url,'/teacher/modules/227/feedback');
  assert.equal(calls[1].method,'PUT');
  assert.equal(calls[1].body.text,comment.text);
  assert.equal(scope.current.module_feedback.text,comment.text);
  assert.equal(JSON.stringify(scope.current.state),before);
  assert.equal(button.disabled,false);
  assert.match(status.textContent,/publicada/);
  scope.api=async()=>{throw Error('No se pudo guardar');};
  await form.onsubmit({preventDefault(){}});
  assert.equal(status.textContent,'No se pudo guardar');
  assert.equal(button.disabled,false);
  assert.equal(JSON.stringify(scope.current.state),before);
});
