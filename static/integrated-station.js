'use strict';
let integrationPage=0,integrationFilter='all',integrationActivity=false;
function integrationLabel(i){
 const q=current.content.cases[i]||{};
 return [q.title||`Situación ${i+1}`, q.lead||q.site||(integrationLevel(i)+' · Análisis y decisión')];
}
function integrationLevel(i){return ['Inicial','Intermedia','Avanzada'][Math.min(2,Math.floor(i/5))]}
function integrationCases(){return current.content.cases.map((c,i)=>({c,i})).filter(({i})=>integrationFilter==='all'||integrationLevel(i)===integrationFilter)}
function integrationUnlocked(i){return i===0||Boolean(current.state.cases[i-1])}
function photoV(src){return String(src||'').split('?')[0]+'?v=4'}
function integrationPhoto(i){
 const q=current.content.cases?.[i];
 if(q?.image)return photoV(q.image);
 const keys=['oficio-plano-leyenda','oficio-visor-21c','oficio-tramos','oficio-equipo-ctrl'];
 const pos=Math.max(1,Math.min(4,Number(current.position||1)));
 return typeof oficioPng==='function'?oficioPng(keys[pos-1]):photoV('/static/themes/oficio/'+keys[pos-1]+'.png');
}
function integrationPhotoAlt(i){
 const q=current.content.cases?.[i]||{};
 return q.alt||((q.title||'Situación')+'. '+(q.site||'Escenario profesional simulado.'));
}
function integratedPanel(){
 if(integrationActivity && tab!=='scene' && tab!=='encargos')return integrationActivityPanel();
 const scene=tab==='scene',encargosTab=tab==='encargos',entries=integrationCases(),pages=Math.max(1,Math.ceil(entries.length/5));
 integrationPage=Math.max(0,Math.min(integrationPage,pages-1));
 const visible=entries.slice(integrationPage*5,integrationPage*5+5);
 if(visible.length && !visible.some(({i})=>i===caseIndex)) caseIndex=visible.find(({i})=>integrationUnlocked(i))?.i ?? visible[0].i;
 const pack=current.content.encargos||{};
 const encargoN=pack.count||0;
 const activity=encargosTab?(typeof encargosMarkup==='function'?encargosMarkup(3):''):scene?scenePanel():`<div class="integration-select"><div>${workIco('search')}<div><h3>Selecciona una situación para comenzar</h3><p>Cada situación te presenta un contexto real de la especialidad. Lee el caso, analiza la información y toma decisiones.</p></div></div><label>Filtrar por dificultad<select id="integration-filter">${['all','Inicial','Intermedia','Avanzada'].map(x=>`<option value="${x}" ${integrationFilter===x?'selected':''}>${x==='all'?'Todas':x}</option>`).join('')}</select></label></div>
 <div class="integration-carousel" aria-label="Selector de situaciones">${action('case-page','‹','carousel-arrow','data-page="'+(integrationPage-1)+'" aria-label="Página anterior de situaciones" '+(integrationPage===0?'disabled':''))}<div class="integration-cards">${visible.map(({i})=>{const unlocked=integrationUnlocked(i),done=Boolean(current.state.cases[i]),label=integrationLabel(i);return `<button type="button" class="situation-card ${i===caseIndex?'selected':''}" data-action="case" data-index="${i}" ${unlocked?'':'disabled'} aria-pressed="${i===caseIndex}"><div class="situation-photo"><img src="${integrationPhoto(i)}" alt="${esc(integrationPhotoAlt(i))}" loading="lazy"><span>${i+1}</span></div><div class="situation-copy"><h4>${esc(label[0])}</h4><p>${esc(label[1])}</p><span class="situation-cta"${unlocked?' data-action="focus-case"':''}>${!unlocked?icon('lock')+' Bloqueada':done?'✓ Revisar':'Comenzar '+icon('arrow')}</span></div></button>`}).join('')}</div>${action('case-page','›','carousel-arrow','data-page="'+(integrationPage+1)+'" aria-label="Página siguiente de situaciones" '+(integrationPage>=pages-1?'disabled':''))}</div>
 <div class="integration-pages" aria-label="Páginas de situaciones">${Array.from({length:pages},(_,i)=>action('case-page','',i===integrationPage?'active':'',`data-page="${i}" aria-label="Página ${i+1} de situaciones" aria-pressed="${i===integrationPage}"`)).join('')}</div>`;
 return workZone(`${panelTitle(3,'Aplica lo aprendido en escenarios que requieren análisis, aplicación y toma de decisiones.',typeof cargaLabel==='function'?cargaLabel(3,'Carga ×5'):'Carga ×5')}
 ${workSeq([{ico:'flag',label:'Dónde estás',hint:'Estación 3 de 5'},{ico:'puzzle',label:'El desafío',hint:encargosTab?'Encargos de oficio':'Situación integradora'},{ico:'book',label:'Qué aplicar',hint:'AE 1 · AE 2 · AE 3'},{ico:'list',label:'La actividad',hint:encargosTab?(encargoN+' encargos'):scene?'Situación 3D':'15 situaciones'},{ico:'edit',label:'Tu acción',hint:encargosTab?'Entrega el producto':'Analiza y decide'}])}
 ${workCard('puzzle', 'Situación Integradora', `${workKicker('Este es el desafío principal que debes resolver')}<p>Aplica lo aprendido en escenarios que requieren análisis, aplicación y toma de decisiones.</p>`,'work-card-hero')}
 <div class="work-grid-3">
  ${workCard('target','Propósito de esta estación','<p>La Situación Integradora permite movilizar los aprendizajes desarrollados durante el módulo en escenarios que requieren análisis, aplicación y toma de decisiones, aumentando la contextualización y complejidad de la experiencia.</p>','work-card-purpose')}
  ${workCard('file','Información que necesitas','<p><b>15 situaciones integradoras</b></p><small>vinculadas con los Aprendizajes Esperados.</small><p><b>'+encargoN+' encargos de oficio</b></p><small>trabajo largo; no desbloquean el examen.</small>')}
  ${workCard('cube','Desafío final','<p><b>1 situación final en 3D</b></p><small>en la que deberás analizar, tomar decisiones y aplicar de manera integrada lo aprendido.</small>')}
 </div>
 <section class="work-card work-card-activity"><div class="work-activity-head">${workIco('edit')}<div><h3>Actividad que debes desarrollar</h3><p>${encargosTab?'Elige un encargo, trabaja 45 a 90 minutos y entrega el producto con un dato de oficio.':scene?'Explora el escenario, examina cada componente y justifica tu conclusión.':'Elige una situación, analiza el caso y toma una decisión justificada.'}</p></div></div>
 <div class="tabs integration-tabs">${action('tab',icon('file')+' Situaciones integradoras (1–15)',!scene&&!encargosTab?'active':'','data-tab="cases" aria-pressed="'+(!scene&&!encargosTab)+'"')}${action('tab',icon('cube')+' Situación final en 3D',scene?'active':'','data-tab="scene" aria-pressed="'+scene+'"')}${action('tab',icon('file')+' Encargos de oficio',encargosTab?'active':'','data-tab="encargos" aria-pressed="'+encargosTab+'"')}</div>
 ${activity}
 ${!scene&&!encargosTab&&typeof oficioLessonVideo==='function'?oficioLessonVideo(current.content):''}
 ${!encargosTab&&typeof formativePackMarkup==='function'?formativePackMarkup(current.content,3):''}
 </section>`,'work-zone-s3');
}
function integrationBottom(){return `<a class="outline" href="#module/${current.id}/2">← Estación anterior</a>${tab==='scene'||tab==='encargos'?action('station','Continuar a Evaluación final '+icon('arrow'),'primary',`data-n="4" ${!stationUnlocked(4)?'disabled':''}`):action('focus-case',`Continuar con Situación ${caseIndex+1} ${icon('arrow')}`,'primary',`${!integrationUnlocked(caseIndex)?'disabled':''}`)}`}
function bindIntegration(){
 const filter=document.getElementById('integration-filter');
 if(filter)filter.onchange=()=>{integrationFilter=filter.value;integrationPage=0;renderModule(3)};
 const bottom=document.querySelector('.bottom-nav');if(bottom)bottom.innerHTML=integrationBottom();
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b||b.disabled||view.station!==3)return;
 if(b.dataset.action==='case-page'){integrationPage=Number(b.dataset.page);renderModule(3)}
 if(b.dataset.action==='back-selector'){integrationActivity=false;renderModule(3)}
 if(b.dataset.action==='focus-case'){if(!integrationUnlocked(caseIndex))return;integrationActivity=true;renderModule(3);const f=document.getElementById('case-form');if(f){f.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});f.querySelector('input,textarea')?.focus({preventScroll:true})}}
});

function integrationActivityPanel(){
 const label=integrationLabel(caseIndex);
 return workZone(`${panelTitle(3,'Aplica lo aprendido en escenarios que requieren análisis, aplicación y toma de decisiones.',typeof cargaLabel==='function'?cargaLabel(3,'Carga ×5'):'Carga ×5')}
 ${workSeq([{ico:'flag',label:'Dónde estás',hint:'Estación 3 de 5'},{ico:'puzzle',label:'Situación',hint:(caseIndex+1)+' de 15'},{ico:'target',label:'Tu acción',hint:'Decide y justifica'}])}
 ${workCard('puzzle',esc(label[0]),`${workKicker('Situación '+ (caseIndex+1) +' de 15 · desafío a resolver')}<p>${esc(label[1])}</p>`,'work-card-hero')}
 <div class="integration-activity-heading">${action('back-selector','← Volver a las situaciones','outline')}<span class="badge">Situación ${caseIndex+1} de 15</span></div>
 ${caseForm()}`,'work-zone-s3 work-zone-activity');
}
function integrationHeader(){return stationHero(3)}
function integrationSidebar(){return ''}
