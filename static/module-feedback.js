'use strict';

function moduleFeedbackEvidence(){
  const teacher=auth?.user?.role==='teacher';
  const available=Boolean(current?.module_feedback?.text||current?.state?.exam?.review?.feedback);
  const status=teacher?'Publicar o editar':available?'Disponible para leer':'Pendiente de publicaci\u00f3n';
  return `<li class="az-feedback-evidence"><button type="button" class="az-teacher-feedback" data-action="module-feedback" aria-haspopup="dialog"><img src="/static/evaluation-clipboard-icon.png" alt="" width="48" height="48" aria-hidden="true"><span class="module-feedback-copy"><b>Retroalimentaci\u00f3n docente</b><small class="module-feedback-status">${status}</small></span><span class="module-feedback-open" aria-hidden="true">${icon(teacher?'edit':'arrow')}</span></button></li>`;
}

function moduleFeedbackMeta(feedback){
  if(!feedback)return '';
  const date=new Date(feedback.updated_at);
  const updated=Number.isFinite(date.getTime())?date.toLocaleString('es-CL',{dateStyle:'short',timeStyle:'short'}):'';
  return `<p class="module-feedback-meta">${esc(feedback.teacher_name||'Docente')}${updated?' \u00b7 '+esc(updated):''}</p>`;
}

function moduleFeedbackDialogMarkup(payload,teacher,title){
  const feedback=payload.feedback;
  const published=feedback?.text||'';
  const content=teacher
    ?`<form id="module-feedback-form"><label for="module-feedback-text">Retroalimentaci\u00f3n para los estudiantes del m\u00f3dulo</label><textarea id="module-feedback-text" name="text" rows="8" minlength="20" maxlength="10000" required>${esc(published)}</textarea><div class="module-feedback-publish"><button type="submit" class="primary">${icon('check')} ${published?'Actualizar':'Publicar'} retroalimentaci\u00f3n</button><p class="module-feedback-save-status" role="status" aria-live="polite"></p></div></form>`
    :`<section class="module-feedback-reading" aria-label="Retroalimentaci\u00f3n del m\u00f3dulo">${published?`${moduleFeedbackMeta(feedback)}<p class="module-feedback-text">${esc(published)}</p>`:'<p class="module-feedback-empty">El docente a\u00fan no ha publicado retroalimentaci\u00f3n para este m\u00f3dulo.</p>'}</section>${payload.individual_feedback?`<section class="module-feedback-personal"><h3>Tu revisi\u00f3n individual</h3><p class="module-feedback-text">${esc(payload.individual_feedback)}</p></section>`:''}<button type="button" class="outline module-feedback-refresh" data-module-feedback-refresh>${icon('refresh')} Actualizar</button>`;
  return `<section class="module-feedback-dialog"><header><span aria-hidden="true">${icon('file')}</span><div><h2 id="module-feedback-title">Retroalimentaci\u00f3n del m\u00f3dulo</h2><p>${esc(title)}</p></div></header>${teacher?moduleFeedbackMeta(feedback):''}${content}</section>`;
}

function updateModuleFeedbackEvidence(){
  const status=document.querySelector('.az-teacher-feedback .module-feedback-status');
  if(status)status.textContent=auth?.user?.role==='teacher'?'Publicar o editar':current?.module_feedback?.text||current?.state?.exam?.review?.feedback?'Disponible para leer':'Pendiente de publicaci\u00f3n';
}

async function openModuleFeedback(){
  const moduleId=current?.id;
  if(!moduleId)throw Error('Abre un m\u00f3dulo para consultar su retroalimentaci\u00f3n.');
  const dialog=document.getElementById('tool'),content=document.getElementById('tool-content');
  if(!dialog||!content)return;
  const payload=await api(`/modules/${moduleId}/feedback`);
  if(current?.id!==moduleId)return;
  current.module_feedback=payload.feedback;
  const teacher=auth?.user?.role==='teacher';
  content.innerHTML=moduleFeedbackDialogMarkup(payload,teacher,current.title);
  dialog.classList.add('is-module-feedback');
  dialog.setAttribute('aria-labelledby','module-feedback-title');
  if(!dialog.open)dialog.showModal();
  updateModuleFeedbackEvidence();
  dialog.addEventListener('close',()=>{
    dialog.classList.remove('is-module-feedback');
    if(dialog.getAttribute('aria-labelledby')==='module-feedback-title')dialog.removeAttribute('aria-labelledby');
  },{once:true});
  const refresh=content.querySelector('[data-module-feedback-refresh]');
  if(refresh)refresh.onclick=async()=>{
    refresh.disabled=true;
    try{await openModuleFeedback();}catch(err){toast(err.message);refresh.disabled=false;}
  };
  const form=content.querySelector('#module-feedback-form');
  if(!form)return;
  form.onsubmit=async event=>{
    event.preventDefault();
    if(form.dataset.saving==='true')return;
    const button=form.querySelector('button[type="submit"]'),status=form.querySelector('[role="status"]');
    const text=form.querySelector('textarea').value.trim();
    if(text.length<20||text.length>10000){status.textContent='Escribe entre 20 y 10.000 caracteres.';return;}
    form.dataset.saving='true';button.disabled=true;status.textContent='Publicando\u2026';
    try{
      const result=await api(`/teacher/modules/${moduleId}/feedback`,'PUT',{text});
      if(current?.id===moduleId){current.module_feedback=result.feedback;updateModuleFeedbackEvidence();}
      status.textContent='Retroalimentaci\u00f3n publicada.';
      button.innerHTML=`${icon('check')} Actualizar retroalimentaci\u00f3n`;
    }catch(err){status.textContent=err.message;}
    finally{form.dataset.saving='false';button.disabled=false;}
  };
}

document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-action="module-feedback"]');
  if(!button||button.disabled)return;
  button.disabled=true;
  try{await openModuleFeedback();}catch(err){toast(err.message);}
  finally{button.disabled=false;}
});
