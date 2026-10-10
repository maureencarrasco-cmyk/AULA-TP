'use strict';
/* Encargos largos (45–90 min). Estaciones 2 y 3. Mismo molde visual que Actividades de oficio. */
const ENCARGO_TONES = ['lila', 'celeste', 'menta', 'indigo', 'arena', 'sage'];
const ENCARGO_TILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="2.5" width="8" height="3.5" rx="1"/><rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 11h6M9 15h6"/></svg>';
const BITACORA_TILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 3.5h11.5A1.5 1.5 0 0120 5v14.5A1.5 1.5 0 0118.5 21H7A2 2 0 015 19V5a1.5 1.5 0 011.5-1.5H7z"/><path d="M8 3.5v17.5"/><path d="M11.5 8H17M11.5 12H17M11.5 16h3.5"/></svg>';
function oficioIcon(kind){
  if(typeof workIco==='function') return workIco(kind);
  return typeof icon==='function'?icon(kind):ENCARGO_TILE;
}
function oficioSpecialtyIcon(){
  const list=typeof courses!=='undefined'?courses:[];
  const course=list.find(item=>item.id===current?.course_id)||{};
  const key=typeof specialtyKey==='function'?specialtyKey(course):'';
  if(/informatica|telecom|electronica/.test(key)) return 'monitor';
  if(/grafica|vestuario|muebles|construccion/.test(key)) return 'palette';
  if(/administracion|contabilidad|secretariado|logistica/.test(key)) return 'file';
  if(/enfermeria|parvulo|social/.test(key)) return 'person';
  if(/gastronomia|alimentacion|agro|acuicultura|pesqueria/.test(key)) return 'cube';
  return 'tool';
}
function encargoIcon(item){
  const text=`${item?.title||''} ${item?.product||''} ${item?.prompt||''}`.toLowerCase();
  if(isBitacora(item)||/registro|diario/.test(text)) return 'book';
  if(/plano|diseñ|croquis|prototipo/.test(text)) return 'edit';
  if(/inspecci|diagn[oó]st|an[aá]lis|revisi/.test(text)) return 'search';
  if(/procedimiento|secuencia|lista|plan/.test(text)) return 'list';
  if(/informe|ficha|reporte|document/.test(text)) return 'file';
  return oficioSpecialtyIcon();
}
function isBitacora(item){
  return /bit[aá]cora/i.test(`${item?.title||''} ${item?.product||''} ${item?.prompt||''} ${item?.kind||''}`);
}
function bitacoraWhen(item){
  return (String(item?.title||'').match(/(\d{1,2}:\d{2})/)||[])[1]||'';
}
function bitacoraDate(){
  try{return new Intl.DateTimeFormat('es-CL',{weekday:'long',day:'numeric',month:'long'}).format(new Date());}
  catch(_){return '';}
}
function parseBitacora(text){
  const t=String(text||'');
  const grab=label=>{
    const re=new RegExp(label+'\\s*:\\s*([\\s\\S]*?)(?=(?:Hoy vi|Consulté|Queda pendiente)\\s*:|$)','i');
    return ((t.match(re)||[])[1]||'').trim();
  };
  const vi=grab('Hoy vi');
  const consult=grab('Consulté');
  const pend=grab('Queda pendiente');
  if(vi||consult||pend) return {vi,consult,pend};
  return {vi:t.trim(),consult:'',pend:''};
}
function joinBitacora(root){
  const val=k=>(root.querySelector(`[data-bit="${k}"]`)?.value||'').trim();
  return `Hoy vi:\n${val('vi')}\n\nConsulté:\n${val('consult')}\n\nQueda pendiente:\n${val('pend')}`.trim();
}
function bitacoraLength(root){
  return ['vi','consult','pend'].reduce((n,k)=>n+((root.querySelector(`[data-bit="${k}"]`)?.value||'').trim().length),0);
}
function encargosItems(station, aeIndex){
  const items=(current?.content?.encargos?.items)||[];
  const st=Number(station);
  const ae=aeIndex==null||aeIndex===''?null:Number(aeIndex);
  return items.filter(e=>Number(e.station)===st&&(ae==null||Number(e.ae)===ae));
}
function encargosUi(host){
  window.__encargoUi=window.__encargoUi||{};
  const key=`${auth?.user?.id||'demo'}:${current?.course_id||''}:${current?.id||''}:${host.dataset.station}:${host.dataset.ae||''}`;
  host.dataset.uiKey=key;
  if(!window.__encargoUi[key]) window.__encargoUi[key]={expanded:false,openId:'',drafts:{}};
  return window.__encargoUi[key];
}
function encargosMarkup(station, aeIndex){
  const items=encargosItems(station, aeIndex);
  if(!items.length) return '';
  return `<section id="seccion-encargos" class="seccion-actividades-de-oficio seccion-encargos formative-pack" data-station="${station}" data-ae="${aeIndex||''}" aria-label="Actividades de oficio"></section>`;
}
function encargoContextPhoto(course,item){
  return encargoRealPhoto(item,course,current?.title||'');
}
function encargoBrief(item){
  const c=item.instruction||{};
  const product=item.product||'Evidencia del encargo';
  const action=/inconsistencias/i.test(product)?'Compara la información de los documentos e identifica los datos que no coinciden.':`Revisa la información disponible y prepara este producto: ${product}.`;
  const criteria=current?.content?.aes?.[Number(item.ae)-1];
  const criterionRows=Array.isArray(criteria?.criteria)?criteria.criteria:[];
  const criterionMarkup=criterionRows.length?`<ul>${criterionRows.map(row=>`<li>${esc(typeof row==='string'?row:row.text||row.description||row.title||'')}</li>`).join('')}</ul>`:'';
  const course=courses.find(course=>course.id===current?.course_id);
  const realPhoto=encargoContextPhoto(course,item);
  return `<section class="encargo-brief" aria-label="Comprende tu encargo">
    <h5 class="encargo-step-title"><span aria-hidden="true">2</span>Comprende tu encargo</h5>
    <figure class="encargo-real-photo"><img src="${esc(realPhoto.image)}" alt="${esc(realPhoto.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><figcaption>Fotografía de contexto, no evidencia del caso. <a href="${esc(realPhoto.source)}" target="_blank" rel="noopener noreferrer">${esc(realPhoto.author)}</a> · <a href="${esc(realPhoto.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(realPhoto.license)}</a>. Sin modificaciones.</figcaption></figure>
    <p><b>Situación</b><br>Recibes una tarea profesional de este módulo: ${esc(item.title)}. Debes preparar una entrega respaldada por información disponible, sin inventar los datos que faltan.</p>
    <div class="encargo-main-action"><span class="encargo-section-icon" aria-hidden="true">${oficioIcon('bulb')}</span><div><b>¿Qué debes hacer?</b><p>${esc(action)}</p></div></div>
    <p><b>¿Sobre qué trabajarás?</b><br>${esc(c.object||item.title)}</p>
    <details class="encargo-resources"><summary>Revisar recursos y criterios · AE ${esc(item.ae)}</summary><p>${esc(c.resource||'Consulta los recursos del módulo y los criterios del aprendizaje esperado asociado. Si no encuentras el documento necesario, registra qué falta y a quién lo solicitarías.')}</p>${item.document?`<pre>${esc(item.document)}</pre>`:''}${criteria?`<p>${esc(typeof criteria==='string'?criteria:criteria.title||criteria.text||'')}</p>`:''}<p>Esta ficha no añade documentos técnicos que no estén disponibles en el módulo.</p></details>
    ${criterionMarkup?`<details><summary>Criterios del aprendizaje esperado</summary>${criterionMarkup}</details>`:''}
    <p><b>¿Qué debes entregar?</b><br>${esc(product)}</p>
    <ol><li><b>Revisa:</b> abre los recursos y localiza un dato. Anota el documento, símbolo, medida o nota donde aparece.</li><li><b>Desarrolla:</b> prepara el producto solicitado y explica qué decisión tomas utilizando ese dato.</li><li><b>Comprueba y entrega:</b> señala lo que falta confirmar, indica a quién consultarías y pulsa «Registrar evidencia». En una bitácora, pulsa «Guardar esta hoja».</li></ol>
    <p><b>¿Cómo comenzar?</b><br>Primero lee esta ficha y abre «Revisar recursos y criterios». Después pulsa el paso 3 para ir al campo de respuesta. Puedes cambiar de encargo sin perder tu borrador durante esta sesión.</p>
    <p><b>¿Cuándo está terminado?</b><br>Cuando entregues el producto solicitado, cites su evidencia, señales los pendientes y registres tu respuesta con al menos 80 caracteres. Guardar la respuesta no confirma por sí solo que la decisión técnica sea correcta.</p>
    <details><summary>¿Necesitas orientación? · Agente Nubi</summary><p>Localiza un dato verificable. ¿Qué parte de tu producto respalda? Si falta información, ¿qué necesitas consultar antes de decidir? Puedes abrir Agente Nubi para revisar las herramientas de apoyo.</p></details>
  </section>`;
}
function encargoArtwork(item, course){
  return encargoContextPhoto(course,item).image;
}
function encargoCardHtml(item, index, openId, done){
  const saved=done[item.id];
  const status=saved?'completado':'pendiente';
  const tone=ENCARGO_TONES[index%ENCARGO_TONES.length];
  const open=String(openId)===String(item.id)?' is-open':'';
  const notebook=isBitacora(item);
  const taskIcon=encargoIcon(item);
  const course=courses.find(course=>course.id===current?.course_id);
  const photo=encargoArtwork(item,course);
  return `<button type="button" class="oficio-card is-${status}${open}${notebook?' is-bitacora':''}" aria-pressed="${Boolean(open)}" aria-controls="encargo-detail" data-encargo-id="${esc(item.id)}" data-tone="${tone}">
    ${photo?`<span class="encargo-card-photo"><img src="${esc(photo)}" alt="${esc(encargoContextPhoto(course,item).alt)}" loading="lazy" decoding="async"></span>`:`<span class="oficio-tile" aria-hidden="true">${oficioIcon(taskIcon)}</span>`}
    <span class="oficio-card-body">
      <span class="oficio-product-label">Encargo profesional</span>
      <b><span class="student-question-number" aria-label="Encargo ${index+1}">${index+1}</span>${esc(item.title)}</b>
      <span class="oficio-card-kicker">Producto: ${esc(item.product||'Evidencia escrita')}</span>
      <span class="oficio-card-kicker">AE ${item.ae}</span>
      <span class="oficio-card-meta">
        <span class="oficio-min">${oficioIcon('clock')} ${Number(item.minutes)||60} min</span>
        <span class="oficio-chip is-${status}">${saved?oficioIcon('check'):oficioIcon('arrow')} ${open?'Seleccionado':saved?'Entregado':'Abrir encargo'}</span>
      </span>
    </span>
  </button>`;
}
function paintEncargos(host){
  if(!host) return;
  const station=Number(host.dataset.station||2);
  const ae=host.dataset.ae||null;
  const items=encargosItems(station, ae);
  if(!items.length){host.hidden=true;host.innerHTML='';return;}
  const ui=encargosUi(host);
  const done=current?.state?.encargos||{};
  const doneN=items.filter(e=>done[e.id]).length;
  const minutes=items.reduce((n,e)=>n+(Number(e.minutes)||0),0);
  const hours=Math.round(minutes/6)/10;
  const mod=current?.position||'';
  const visible=6;
  const shown=ui.expanded?items:items.slice(0,visible);
  const hasOpen=!!ui.openId;
  const station2=station===2;
  const title=station2?'Actividades de oficio':'Encargos de oficio';
  const kicker='TÚ ACTÚAS · EL ESPACIO ENSEÑA';
  const aePill=ae?` · AE ${ae}`:'';
  const countPill=station2?`${items.length} encargos · este AE`:`${doneN}/${items.length} · ${hours} h aquí`;
  const lead=station2
    ? `Practica el oficio de este aprendizaje esperado. Elige un encargo, lee qué producto se pide y responde con un dato que esté en el plano, la leyenda, la ficha o las notas. Si el documento no lo trae, indica qué falta y a quién lo consultarías.`
    : `Cierra el oficio del módulo ${mod}. Elige un encargo, lee el producto pedido y responde con un dato del plano, la leyenda, la ficha o las notas. Si falta información, nómbrala y di a quién la consultarías.`;
  const stripNote=hasOpen
    ? 'Ahora estás en el paso 3: escribe tu evidencia. Usa un dato del plano, la leyenda, la ficha o las notas. Si no está, indica qué falta y a quién lo consultarías.'
    : (station2
      ? 'Sigue los tres pasos. Ahora estás en el 1: elige el encargo de este AE. Después lee el producto y escribe tu evidencia.'
      : 'Sigue los tres pasos: elige el encargo, lee el producto pedido y escribe tu evidencia con un dato del documento.');
  const draft=host.querySelector('[data-bit]')?joinBitacora(host):(host.querySelector('#encargo-texto')?.value||'');
  host.hidden=false;
  host.innerHTML=`
    <header class="oficio-head">
      <span class="oficio-plus" aria-hidden="true">${oficioIcon(oficioSpecialtyIcon())}</span>
      <div class="oficio-titles">
        <span class="oficio-kicker">${esc(kicker)}</span>
        <h4>${esc(title)}</h4>
      </div>
      <div class="oficio-pills">
        <span class="oficio-pill is-station">${oficioIcon('pin')} Estación ${station} de 5${aePill}</span>
        <span class="oficio-pill is-count">${oficioIcon('list')} ${esc(countPill)}</span>
      </div>
    </header>
    <div class="encargo-introduction"><h5>¿Qué es un encargo de oficio?</h5><p>Es una tarea breve similar a las que podrías recibir en un lugar de trabajo de tu especialidad. Aplicarás lo aprendido para revisar una situación, analizar información, tomar una decisión y entregar evidencia.</p><p><b>No tienes que resolver todos a la vez. Elige uno y sigue sus indicaciones.</b></p></div>
    <div class="oficio-do" role="group" aria-label="Qué debes hacer">
      <button type="button" class="oficio-do-btn is-video${hasOpen?'':' is-ahora'}" data-encargo-do="pick"><span class="oficio-do-n">1</span><span class="oficio-do-icon">${oficioIcon('target')}</span><small>Elige un encargo</small>${hasOpen?'':'<span class="oficio-ahora">Ahora</span>'}</button>
      <button type="button" class="oficio-do-btn is-paso" data-encargo-do="read"><span class="oficio-do-n">2</span><span class="oficio-do-icon">${oficioIcon('book')}</span><small>Revisa qué debes hacer</small></button>
      <button type="button" class="oficio-do-btn is-write" data-encargo-do="write"><span class="oficio-do-n">3</span><span class="oficio-do-icon">${oficioIcon('edit')}</span><small>Realiza y entrega tu evidencia</small></button>
    </div>
    <p class="oficio-do-note">Tu meta: aplicar lo aprendido en el módulo para resolver una tarea de tu especialidad.</p>
    <h5>1. Elige tu encargo</h5>
    <div class="oficio-grid">${shown.map((e,i)=>encargoCardHtml(e,i,ui.openId,done)).join('')}</div>
    ${items.length>visible?`<button type="button" class="oficio-more" data-encargo-more>${ui.expanded?'Ver menos':'Ver todas'}</button>`:''}
    <div id="encargo-detail" class="oficio-detail encargo-detail" hidden></div>`;
  if(ui.openId){
    const item=items.find(e=>String(e.id)===String(ui.openId));
    if(item) openEncargo(host,item,draft);
  }
}
function openEncargo(host, item, draftText){
  const detail=host.querySelector('.encargo-detail');
  if(!detail||!item) return;
  const ui=encargosUi(host);
  ui.drafts=ui.drafts||{};
  if(ui.openId&&detail.querySelector('#encargo-texto'))ui.drafts[ui.openId]=detail.querySelector('[data-bit]')?joinBitacora(detail):detail.querySelector('#encargo-texto').value;
  ui.openId=item.id;
  const saved=(current?.state?.encargos||{})[item.id];
  const locked=auth?.user?.role==='teacher'||current?.state?.closed;
  const draft=typeof draftText==='string'?draftText:(ui.drafts[item.id]??saved?.text??'');
  host.querySelectorAll('.oficio-card').forEach(c=>{c.classList.remove('is-open');c.setAttribute('aria-pressed',String(c.dataset.encargoId===String(item.id)));const chip=c.querySelector('.oficio-chip');if(chip)chip.innerHTML=c.dataset.encargoId===String(item.id)?`${oficioIcon('check')} Seleccionado`:c.classList.contains('is-completado')?`${oficioIcon('check')} Entregado`:`${oficioIcon('arrow')} Abrir encargo`;});
  host.querySelector(`[data-encargo-id="${CSS.escape(String(item.id))}"]`)?.classList.add('is-open');
  host.querySelectorAll('.oficio-do-btn').forEach(b=>b.classList.remove('is-ahora'));
  const writeBtn=host.querySelector('[data-encargo-do="read"]');
  if(writeBtn){
    writeBtn.classList.add('is-ahora');
    if(!writeBtn.querySelector('.oficio-ahora')) writeBtn.insertAdjacentHTML('afterbegin','<span class="oficio-ahora">Ahora</span>');
  }
  host.querySelector('[data-encargo-do="pick"] .oficio-ahora')?.remove();
  const note=host.querySelector('.oficio-do-note');
  if(note) note.textContent=isBitacora(item)
    ? 'Revisa primero tu encargo. Después registra lo que viste, consultaste y quedó pendiente.'
    : 'Revisa primero la situación, los recursos y el producto solicitado. Después registra tu evidencia.';
  detail.hidden=false;
  const position=encargosItems(Number(host.dataset.station||2),host.dataset.ae||null).findIndex(e=>String(e.id)===String(item.id))+1;
  const notebook=isBitacora(item);
  if(notebook){
    const parts=parseBitacora(draft);
    const who=esc(auth?.user?.name||'Estudiante');
    const when=bitacoraWhen(item);
    const day=bitacoraDate();
    detail.innerHTML=`<article class="formative-item oficio-task bitacora-notebook" data-encargo-id="${esc(item.id)}">
      <div class="bitacora-sheet">
        <header class="bitacora-head">
          <div>
            <span class="bitacora-kicker">Bitácora de oficio · tu cuaderno</span>
            <h5>Encargo ${position} · ${esc(item.title)}</h5>
            <p class="bitacora-who">${who} · ${esc(day||'Hoy')}${when?` · turno ${esc(when)}`:''} · AE ${item.ae}</p>
          </div>
          <button type="button" class="outline" data-encargo-close>Cerrar</button>
        </header>
        ${encargoBrief(item)}
        <h5>3. Ahora te toca a ti</h5>
        <p class="bitacora-intro">Esta hoja es tu cuaderno de taller. Anota el dato que viste, la consulta que harías y lo que todavía no puedes afirmar.</p>
        <label class="bitacora-field">Hoy vi<textarea class="bitacora-ruled" data-bit="vi" maxlength="4000" placeholder="Un dato del plano, la leyenda, la ficha o las notas.">${esc(parts.vi)}</textarea></label>
        <label class="bitacora-field">Consulté<textarea class="bitacora-ruled" data-bit="consult" maxlength="4000" placeholder="Qué pregunté, o a quién lo consultaría si el dato no aparece.">${esc(parts.consult)}</textarea></label>
        <label class="bitacora-field">Queda pendiente<textarea class="bitacora-ruled" data-bit="pend" maxlength="4000" placeholder="Lo que no firmarías todavía. El dato que falta.">${esc(parts.pend)}</textarea></label>
        <textarea id="encargo-texto" class="bitacora-join" hidden maxlength="10000" minlength="80" tabindex="-1" aria-hidden="true">${esc(draft)}</textarea>
        <p class="oficio-help encargo-meter" data-encargo-meter>0 / mínimo 80 caracteres</p>
        <div class="formative-check bitacora-actions">
          <button type="button" class="primary oficio-register" data-encargo-save ${locked?'disabled':''}>Guardar esta hoja</button>
          <p class="act-feedback" aria-live="polite"></p>
        </div>
      </div>
    </article>`;
  }else{
    detail.innerHTML=`<article class="formative-item oficio-task" data-encargo-id="${esc(item.id)}">
      <header class="oficio-task-head">
        <span class="oficio-task-symbol" aria-hidden="true">${oficioIcon(encargoIcon(item))}</span>
        <div class="oficio-task-title"><span class="oficio-respond-chip">Respondes aquí</span><h5>Encargo ${position} · ${esc(item.title)}</h5><p>AE ${item.ae} · ${Number(item.minutes)||60} minutos estimados</p></div>
        <img class="encargo-detail-art" src="${esc(encargoArtwork(item,courses.find(course=>course.id===current?.course_id)))}" alt="" aria-hidden="true">
        <button type="button" class="outline" data-encargo-close>${oficioIcon('arrow')} Cerrar</button>
      </header>
      ${encargoBrief(item)}
      <section class="encargo-response">
      <h5 class="encargo-step-title"><span aria-hidden="true">3</span>Ahora te toca a ti</h5>
      <label class="oficio-field">Escribe tu evidencia<textarea id="encargo-texto" maxlength="10000" minlength="80" placeholder="Entrega el producto solicitado. Cita dónde encontraste cada dato, explica tu decisión y señala lo que falta confirmar. Mínimo 80 caracteres.">${esc(draft)}</textarea></label>
      <p class="oficio-help encargo-meter" data-encargo-meter>0 / mínimo 80 caracteres</p>
      <div class="formative-check">
        <button type="button" class="primary oficio-register" data-encargo-save ${locked?'disabled':''}>Registrar evidencia</button>
        <p class="act-feedback" aria-live="polite"></p>
      </div>
      </section>
    </article>`;
  }
  const ta=detail.querySelector('#encargo-texto');
  const meter=detail.querySelector('[data-encargo-meter]');
  const tick=()=>{
    ui.drafts[item.id]=notebook?joinBitacora(detail):(ta?.value||'');
    const n=notebook?bitacoraLength(detail):(ta?.value||'').trim().length;
    if(meter){
      meter.textContent=`${n} / mínimo 80 caracteres`;
      meter.classList.toggle('is-ok', n>=80);
    }
  };
  if(notebook) detail.querySelectorAll('[data-bit]').forEach(el=>el.addEventListener('input', tick));
  ta?.addEventListener('input', tick);
  tick();
  detail.querySelector('[data-encargo-close]')?.addEventListener('click',()=>{
    ui.openId='';
    detail.hidden=true;
    detail.innerHTML='';
    paintEncargos(host);
  });
  detail.querySelector('[data-encargo-save]')?.addEventListener('click', async()=>{
    const text=notebook?(syncBitacora(detail),joinBitacora(detail)):(ta?.value||'').trim();
    const n=notebook?bitacoraLength(detail):text.length;
    const fb=detail.querySelector('.act-feedback');
    if(n<80){
      if(fb){fb.textContent=notebook?'La hoja pide al menos 80 caracteres entre lo que viste, consultaste y quedó pendiente.':'El producto pide al menos 80 caracteres con un dato de oficio.';fb.classList.add('is-err');}
      return;
    }
    const saveButton=detail.querySelector('[data-encargo-save]');
    if(saveButton.disabled)return;
    saveButton.disabled=true;saveButton.setAttribute('aria-busy','true');saveButton.textContent='Guardando…';
    try{
      await saveActivity({kind:'encargo',id:item.id,station:Number(host.dataset.station||item.station),ae:item.ae,text});
      paintEncargos(host);
      if(typeof refreshLearningChallenge==='function')refreshLearningChallenge(host.closest('.learning-sequence'));
      const again=host.querySelector('.encargo-detail .act-feedback');
      if(again){again.textContent=notebook?'Hoja guardada en tu bitácora. Sigue con el siguiente encargo o continúa la estación.':'Encargo registrado. Sigue con el siguiente o continúa la estación.';again.classList.remove('is-err');}
    }catch(err){
      if(fb){fb.textContent=err.message||'No se pudo guardar.';fb.classList.add('is-err');}
      toast(err.message);
    }finally{
      if(saveButton.isConnected){saveButton.disabled=Boolean(locked);saveButton.removeAttribute('aria-busy');saveButton.textContent=notebook?'Guardar esta hoja':'Registrar evidencia';}
    }
  });
  if(window.AulaAccess) window.AulaAccess.hydrate(detail);
  if(window.AulaNarration) window.AulaNarration.hydrate(detail);
  if(typeof decorateStudentActionCues==='function') decorateStudentActionCues(detail);
  detail.querySelector('.encargo-brief')?.scrollIntoView({block:'nearest'});
}
function bindEncargos(root){
  const host=(root||document).querySelector('#seccion-encargos');
  if(!host) return;
  paintEncargos(host);
  if(host.dataset.bound==='1') return;
  host.dataset.bound='1';
  const station=Number(host.dataset.station||2);
  const ae=host.dataset.ae||null;
  host.addEventListener('click',e=>{
    const more=e.target.closest('[data-encargo-more]');
    if(more&&host.contains(more)){
      const ui=encargosUi(host);
      ui.expanded=!ui.expanded;
      paintEncargos(host);
      return;
    }
    const doBtn=e.target.closest('[data-encargo-do]');
    if(doBtn&&host.contains(doBtn)){
      const act=doBtn.dataset.encargoDo;
      const items=encargosItems(station, ae);
      const ui=encargosUi(host);
      if(act==='pick'){
        host.querySelectorAll('.oficio-do-btn').forEach(b=>b.classList.toggle('is-ahora',b===doBtn));
        host.querySelector('.oficio-grid')?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
        return;
      }
      const currentItem=items.find(x=>String(x.id)===String(ui.openId))||items[0];
      if(!currentItem) return;
      if(String(ui.openId)!==String(currentItem.id)) openEncargo(host, currentItem);
      host.querySelectorAll('.oficio-do-btn').forEach(b=>{b.classList.toggle('is-ahora',b===doBtn);b.querySelector('.oficio-ahora')?.remove();});
      doBtn.insertAdjacentHTML('beforeend','<span class="oficio-ahora">Ahora</span>');
      const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
      if(act==='read') host.querySelector('.encargo-brief')?.scrollIntoView({block:'nearest',behavior:reduce});
      if(act==='write'){
        const ta=host.querySelector('[data-bit="vi"]')||host.querySelector('#encargo-texto');
        ta?.focus();
        ta?.scrollIntoView({block:'nearest',behavior:reduce});
      }
      return;
    }
    const btn=e.target.closest('[data-encargo-id]');
    if(!btn||!host.contains(btn)||btn.closest('.oficio-task')) return;
    const item=encargosItems(station, ae).find(x=>String(x.id)===String(btn.dataset.encargoId));
    if(item) openEncargo(host, item);
  });
}
