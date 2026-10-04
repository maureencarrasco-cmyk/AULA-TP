'use strict';
/* Estación 5 · Analiza – ¿Cómo me fue? (mockup attachment 2) */
const ANALIZA_V = '32';
const ANALIZA_IMG = (name) => `/static/themes/${name}?v=${ANALIZA_V}`;

function feedbackHeader(){ return ''; }
function feedbackStationRoute(){ return stationRoute(5); }
function feedbackSidebar(){ return ''; }

function fbPass(){ return Number(current?.content?.pass_percent)||60; }
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-heat-range]');
  if(!button)return;
  const note=document.getElementById(button.getAttribute('aria-controls'));
  if(!note)return;
  const open=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',String(open));
  note.hidden=!open;
});
function fbPctLabel(pct){ return pct==null?'—':`${pct}%`; }
function fbCaseScore(){
  const cases=current?.content?.cases||[];
  const saved=current?.state?.cases||{};
  let n=0,ok=0;
  cases.forEach((q,i)=>{
    const row=saved[i];
    if(row==null||row.choice===undefined||row.choice==='')return;
    n++;
    if(Number(row.choice)===Number(q.answer))ok++;
  });
  if(!n)return null;
  return {ok,n,percent:Math.round((ok/n)*100)};
}
function fbProfileAvg(map){
  const vals=Object.values(map||{}).filter(v=>v&&v.n);
  if(!vals.length)return null;
  return Math.round(vals.reduce((a,v)=>a+Number(v.percent||0),0)/vals.length);
}
function fbAutoPct(){
  const demo=feedbackDemoSelected();
  if(demo)return demo.final;
  const e=feedbackResultState().exam;
  if(e&&typeof e.score==='number')return Math.round((e.score/Number(e.max_score||25))*100);
  const c=fbCaseScore();
  return c?c.percent:null;
}
function fbFinalPct(){
  const demo=feedbackDemoSelected();
  if(demo)return demo.final;
  const e=feedbackResultState().exam,rev=e?.review;
  if(!e)return null;
  const selection=Math.round((e.score/Number(e.max_score||25))*100);
  if(!e.development_required)return selection;
  if(!rev)return null;
  return Math.round((selection+(rev.score/25)*100)/2);
}
function fbEvidenceCounts(){
  const s=feedbackResultState();
  const aes=(current?.content?.aes||[]).length||3;
  const slots=[];
  slots.push(s.context?'sent':'todo');
  for(let i=0;i<aes;i++){
    const done=Object.keys(s.ae||{}).filter(k=>k.startsWith(i+'-')).length;
    slots.push(done>0?'sent':'todo');
  }
  const caseN=Object.keys(s.cases||{}).length;
  slots.push(caseN>0?'scored':'todo');
  slots.push(s.scene?'sent':'todo');
  slots.push(s.exam?'scored':'todo');
  slots.push(s.exam?(s.exam.review?'scored':'review'):'todo');
  slots.push(s.closed?'sent':'todo');
  const scored=slots.filter(x=>x==='scored').length;
  const review=slots.filter(x=>x==='review').length;
  const sent=slots.filter(x=>x==='sent').length;
  const todo=slots.filter(x=>x==='todo').length;
  const first=scored+sent;
  return {review,todo,first,scored,sent,total:slots.length};
}
function fbAeRows(){
  const demo=feedbackDemoSelected();
  if(demo)return demo.learnings.map(a=>({id:a.id,label:`${a.id} · ${a.label}`,pct:a.final}));
  const profile=feedbackResultState().exam?.profile?.ae||{};
  const aes=current?.content?.aes||[];
  const keys=Object.keys(profile);
  if(!keys.length){
    return aes.map((a,i)=>({id:`AE${i+1}`,label:`AE ${i+1}`,pct:null}));
  }
  return keys.map(k=>{
    const i=Math.max(0,Number(String(k).replace(/\D/g,''))-1);
    const a=aes[i];
    const short=a?(a.short_title||a.title):k;
    return {id:k,label:`${k} · ${short}`,pct:profile[k].n?profile[k].percent:null};
  });
}

function fbEvolution(){
  const demo=feedbackDemoEvolution();
  if(demo)return demo;
  const course=(courses||[]).find(c=>Number(c.id)===Number(current?.course_id));
  const modules=(course?.modules||[]).slice().sort((a,b)=>Number(a.position)-Number(b.position));
  const points=(key)=>modules.map(m=>({
    label:`Módulo ${m.position}`,
    value:m.evaluation_scores?.[key] == null ? null : Number(m.evaluation_scores[key])
  }));
  const selection=points('selection');
  const development=points('development');
  const hasSelection=selection.some(p=>Number.isFinite(p.value));
  const hasDevelopment=development.some(p=>Number.isFinite(p.value));
  return {
    max:25,
    unit:'puntos',
    xTitle:'Módulos',
    yTitle:'Puntaje obtenido',
    series:[
      ...(hasSelection?[{label:'Selección múltiple',tone:'primary',points:selection}]:[]),
      ...(hasDevelopment?[{label:'Desarrollo',tone:'secondary',points:development}]:[])
    ]
  };
}

function analizaSnapshot(){
  const pass=fbPass();
  const auto=fbAutoPct();
  const final=fbFinalPct();
  const live=final!=null?final:auto;
  const ev=fbEvidenceCounts();
  const aeLive=fbAeRows().filter(r=>r.pct!=null);
  const modulePct=live!=null?live:null;
  const oaFromAe=aeLive.length?aeLive.map((r,i)=>({
    id:r.id,pct:r.pct,
    tone:r.pct>=pass?'green':(r.pct>=40?'amber':'red')
  })):[
    {id:'OA 1',pct:null,tone:'void'},
    {id:'OA 2',pct:null,tone:'void'},
    {id:'OA 3',pct:null,tone:'void'},
    {id:'OA 4',pct:null,tone:'void'}
  ];
  const ranked=[...oaFromAe].filter(x=>x.pct!=null).sort((a,b)=>a.pct-b.pct);
  const weak=ranked[0]||{id:'—',pct:null,delta:null};
  const totalEv=Math.max(1,ev.total||10);
  const logradas=ev.scored||ev.first||0;
  return {
    demo:false,
    moduleLabel:`Módulo ${current?.position||''} · ${current?.title||'Módulo actual'}`,
    modulePct,
    pass,
    over:modulePct!=null?modulePct-pass:null,
    oa:oaFromAe,
    weak:{id:weak.id,pct:weak.pct,delta:weak.pct!=null?weak.pct-pass:null},
    ae:fbAeRows().slice(0,3).map(r=>({id:r.id,pct:r.pct,tone:r.pct==null?'void':(r.pct>=pass?'green':(r.pct>=40?'amber':'red')),warn:r.pct!=null&&r.pct<pass})),
    evid:{total:totalEv,logradas,desarrollo:ev.review||0,pendientes:ev.todo||0},
    evolution:fbEvolution(),
    compare:[
      {label:'Logro del módulo',value:fbPctLabel(modulePct),tone:'violet'},
      {label:'Evidencias logradas',value:`${logradas} / ${totalEv}`,tone:'amber'},
      {label:'Intentos realizados',value:String(Object.keys(current?.state?.cases||{}).length||'—'),tone:'blue'},
      {label:'Retroalimentaciones consultadas',value:feedbackResultState().exam?.review?'1':'0',tone:'green'}
    ],
    filters:{mod:`Módulo ${current?.position||''}`,oa:'Todos los OA',ae:'Todos los AE'}
  };
}

function analizaDonut(pct,label,color){
  const has=pct!=null&&Number.isFinite(Number(pct));
  const p=has?Math.max(0,Math.min(100,Number(pct))):0;
  const r=42,c=2*Math.PI*r,dash=(p/100)*c;
  return `<div class="az-donut" style="--az-c:${color}">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle class="az-donut-track" cx="50" cy="50" r="${r}"/>
      <circle class="az-donut-fill" cx="50" cy="50" r="${r}"
        stroke-dasharray="${dash} ${c}" transform="rotate(-90 50 50)"/>
    </svg>
    <div class="az-donut-label"><b>${has?p+'%':'—'}</b><small>${esc(label)}</small></div>
  </div>`;
}

function analizaEvidDonut(ev){
  const t=Math.max(1,ev.total);
  const parts=[
    {n:ev.logradas,c:'#22C55E'},
    {n:ev.desarrollo,c:'#F59E0B'},
    {n:ev.pendientes,c:'#CBD5E1'}
  ];
  const r=38,cLen=2*Math.PI*r;
  let offset=0;
  const arcs=parts.map(p=>{
    const len=(p.n/t)*cLen;
    const el=`<circle cx="50" cy="50" r="${r}" fill="none" stroke="${p.c}" stroke-width="12"
      stroke-dasharray="${len} ${cLen}" stroke-dashoffset="${-offset}" transform="rotate(-90 50 50)"/>`;
    offset+=len;
    return el;
  }).join('');
  return `<div class="az-donut az-donut-multi">
    <svg viewBox="0 0 100 100" aria-hidden="true">${arcs}</svg>
    <div class="az-donut-label"><b>${ev.total}</b><small>evidencias</small></div>
  </div>`;
}

function analizaTitle(){
  return `<div class="az-steps-top"><span class="az-time az-time-float">${icon('clock')} 26–36 min</span></div>`;
}

function analizaSteps(active){
  const steps=[
    {id:'analiza',n:1,title:'Analiza',sub:'\u00bfC\u00f3mo me fue?',tone:'blue',svg:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19V10M10 19V5M16 19v-7M22 19H2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4 10h.01M10 5h.01M16 12h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'},
    {id:'comprende',n:2,title:'Comprende',sub:'\u00bfQu\u00e9 significan mis resultados?',tone:'violet',svg:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2.2"/><path d="m20 20-3.6-3.6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'},
    {id:'conecta',n:3,title:'Conecta',sub:'\u00bfC\u00f3mo se relaciona lo aprendido?',tone:'purple',svg:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="5" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="5" cy="18" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="19" cy="18" r="2.5" stroke="currentColor" stroke-width="2"/><path d="m10.8 7.2-4.6 8.6M13.2 7.2l4.6 8.6M7.5 18h9" stroke="currentColor" stroke-width="2"/></svg>'},
    {id:'transfiere',n:4,title:'Transfiere',sub:'\u00bfC\u00f3mo lo utilizo en una situaci\u00f3n nueva?',tone:'green',svg:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2"/></svg>'},
    {id:'proyecta',n:5,title:'Proyecta',sub:'\u00bfQu\u00e9 aprendizaje me llevo?',tone:'orange',svg:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 20V4m0 1h10l-2 3 2 3H5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'}
  ];
  return `<nav class="az-steps az-steps-v2" aria-label="Pasos de la estaci\u00f3n 6">${steps.map(s=>{
    const on=active===s.id;
    const badge=s.id==='analiza'?`<span class="az-step-badge">ESTACI\u00d3N 6</span>`:'';
    return `<button type="button" class="az-step tone-${s.tone}${on?' is-active':''}" data-action="tab" data-tab="${s.id}"><span class="az-step-num">${s.n}</span><span class="az-step-ico" aria-hidden="true">${s.svg}</span><span class="az-step-rule" aria-hidden="true"></span><span class="az-step-copy">${badge}<b>${s.title}</b><small>${s.sub}</small></span></button>`;
  }).join('')}</nav>`;
}

function analizaFilters(d){
  return `<div class="az-filters">
    <span class="az-filters-label">Analizar resultados por:</span>
    <button type="button" class="az-select" data-action="az-filter" data-filter="mod" aria-pressed="false">${esc(d.filters.mod)} ▾</button>
    <button type="button" class="az-select" data-action="az-filter" data-filter="oa" aria-pressed="false">${esc(d.filters.oa)} ▾</button>
    <button type="button" class="az-select" data-action="az-filter" data-filter="ae" aria-pressed="false">${esc(d.filters.ae)} ▾</button>
  </div>`;
}

function analizaDemoCohort(studentPct){
  const data=feedbackDemoData();
  if(!data)return '';
  const bands=data.bands;
  const total=bands.reduce((sum,b)=>sum+b.count,0),max=Math.max(...bands.map(b=>b.count));
  const W=720,H=238,left=58,right=24,top=34,bottom=54,plotW=W-left-right,plotH=H-top-bottom;
  const step=plotW/bands.length,barW=Math.min(58,step*.62);
  const axisMax=Math.max(10,Math.ceil(max/10)*10);
  const grid=Array.from({length:6},(_,i)=>axisMax*i/5).map(v=>{const y=top+plotH-(v/axisMax)*plotH;return `<line x1="${left}" y1="${y}" x2="${W-right}" y2="${y}"/><text x="${left-10}" y="${y+4}" text-anchor="end">${v}</text>`}).join('');
  const bars=bands.map((b,i)=>{const h=(b.count/axisMax)*plotH,x=left+i*step+(step-barW)/2,y=top+plotH-h;return `<g><rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="7"/><text class="az-cohort-value" x="${x+barW/2}" y="${y-8}" text-anchor="middle">${b.count}</text><text class="az-cohort-band" x="${x+barW/2}" y="${H-29}" text-anchor="middle">${b.label}</text></g>`}).join('');
  const hasStudent=studentPct!=null&&Number.isFinite(Number(studentPct));
  const markerX=hasStudent?left+(Math.max(0,Math.min(100,Number(studentPct)))/100)*plotW:null;
  const marker=hasStudent?`<g class="az-cohort-marker"><line x1="${markerX}" y1="${top-5}" x2="${markerX}" y2="${top+plotH}"/><rect x="${Math.max(left,Math.min(W-right-82,markerX-41))}" y="4" width="82" height="23" rx="11"/><text x="${Math.max(left+41,Math.min(W-right-41,markerX))}" y="20" text-anchor="middle">Perfil · ${studentPct}%</text></g>`:'';
  return `<section class="az-card az-cohort" aria-labelledby="az-cohort-title"><header><div><span class="az-cohort-kicker">DATOS SIMULADOS PARA EXPLORAR</span><h3 id="az-cohort-title">Resultados de una cohorte de demostración</h3><p>Compara la distribución de logro de <b>${total} estudiantes de ejemplo</b>. No corresponde a calificaciones reales.</p></div><div class="az-cohort-stats"><span><b>120</b> estudiantes</span><span><b>${data.average}%</b> promedio</span><span><b>${data.median}%</b> mediana</span></div></header><svg class="az-cohort-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Distribución de 120 estudiantes de ejemplo por rango de logro">${grid}<line class="az-cohort-axis" x1="${left}" y1="${top+plotH}" x2="${W-right}" y2="${top+plotH}"/>${bars}${marker}<text class="az-cohort-axis-title" x="${left+plotW/2}" y="${H-5}" text-anchor="middle">Porcentaje de logro</text><text class="az-cohort-axis-title" x="14" y="${top+plotH/2}" text-anchor="middle" transform="rotate(-90 14 ${top+plotH/2})">Cantidad de estudiantes</text></svg><footer>${icon('info')} <span>Úsalo para aprender a interpretar resultados grupales; los perfiles son ficticios y no se utilizan para calificar.</span></footer></section>`;
}

function analizaDash(){
  const s=feedbackResultState(),rows=fbAeRows(),final=fbFinalPct(),auto=fbAutoPct();
  const pct=final!=null?final:auto;
  const pending=Boolean(s.exam?.development_required&&!s.exam?.review);
  const aes=current?.content?.aes||[];
  const required=1+aes.length*6+15+1+1;
  const recorded=(s.context?1:0)+Object.keys(s.ae||{}).length+Object.keys(s.cases||{}).length+(s.scene?1:0)+(s.exam?1:0);
  const level=pct==null?'Sin resultado':pct>=fbPass()?'Umbral alcanzado':'Por fortalecer';
  const evolution=fbEvolution();
  const enough=evolution.series.some(series=>series.points.filter(p=>Number.isFinite(p.value)).length>=2);
  const questions=[
    ['Mi fortaleza','¿Cuál es tu principal fortaleza según tus resultados?','Identifica el aprendizaje con mejores resultados y cita un dato o evidencia.'],
    ['Lo que necesito fortalecer','¿Qué aprendizaje presenta tu mayor dificultad?','Señala qué necesitas fortalecer y utiliza un resultado como evidencia.'],
    ['Relación entre mis acciones y resultados','¿Qué relación observas entre tus acciones y tus resultados?','Relaciona las evidencias y retroalimentaciones disponibles con tus resultados. Si no hay datos suficientes, indícalo.']
  ];
  return `<div class="az-board az-guided">
    <header class="az-guided-intro"><small>1. ANALIZA · ¿CÓMO ME FUE?</small><h2>Analiza tus resultados</h2><p>Revisa tus evidencias y sigue los pasos en orden. Primero observa tus resultados, luego identifica información importante y finalmente responde utilizando tus propios datos.</p><ol class="az-mini-route"><li>1. Observa</li><li>2. Identifica</li><li>3. Analiza y responde</li><li>4. Verifica</li></ol></header>
    <section class="az-observe"><h3>1. Observa — ¿Cómo me fue?</h3><p>Revisa tu nivel de logro, tus aprendizajes y tus evidencias. En este paso solo observa; todavía no necesitas escribir.</p>
    <h4>1.1 Mi resultado general</h4><dl class="az-personal-metrics"><div><dt>${pending?'Resultado automático provisional':'Logro general'}</dt><dd>${fbPctLabel(pct)}</dd></div><div><dt>Nivel de referencia</dt><dd>${esc(level)}</dd></div><div><dt>Evidencias registradas</dt><dd>${recorded} / ${required}</dd></div><div><dt>Evidencias pendientes</dt><dd>${Math.max(0,required-recorded)}</dd></div></dl>
    <p>Las evidencias registradas indican participación, no logro técnico. ${pending?'El resultado final está pendiente de revisión docente.':''}</p>
    <h4>1.2 Mis aprendizajes</h4>
    ${typeof achievementProgressTable==='function'?achievementProgressTable():''}
    ${fbAeChart()}
    <p>Los porcentajes por AE corresponden a los aciertos evaluados. No se atribuye un porcentaje por OA sin una medición específica.</p>
    <h4>1.3 Mis evidencias</h4><ul><li>Situaciones registradas: ${Object.keys(s.cases||{}).length} de 15.</li><li>Evaluación final: ${s.exam?`${s.exam.score} / ${s.exam.max_score||25} puntos en selección múltiple`:'Pendiente de entrega'}.</li><li>Retroalimentación docente: ${s.exam?.review?'Disponible en Comprende':'Sin revisión registrada'}.</li></ul><p>No hay un historial completo de intentos ni un registro de consultas de retroalimentación; no se muestran cifras estimadas.</p>
    ${enough?`<details><summary>Resultados de evaluaciones por módulo</summary><ul>${evolution.series.map(series=>`<li><b>${esc(series.label)}</b><ul>${series.points.filter(p=>Number.isFinite(p.value)).map(p=>`<li>${esc(p.label)}: ${p.value} puntos</li>`).join('')}</ul></li>`).join('')}</ul></details>`:'<p>Aún no hay suficientes resultados para mostrar tu evolución. Completa nuevas evaluaciones para visualizar tu progreso.</p>'}
    </section>
    <section class="az-identify"><h3>2. Identifica — Qué muestran mis resultados</h3><p>Busca una fortaleza, una dificultad y una relación entre tus acciones y resultados. Estas orientaciones no requieren una respuesta escrita todavía.</p><dl><div><dt>2.1 Fortaleza</dt><dd>Localiza tu resultado más alto y su evidencia.</dd></div><div><dt>2.2 Dificultad</dt><dd>Reconoce el aprendizaje con menor logro o sin evidencia suficiente.</dd></div><div><dt>2.3 Relación</dt><dd>Revisa si tus actividades y retroalimentaciones ayudan a interpretar los resultados.</dd></div></dl></section>
    <section class="az-pattern az-response"><h3>3. Analiza y responde — Qué puedo concluir</h3><p>Ahora te toca a ti. En cada respuesta menciona al menos un resultado o evidencia que apoye tu conclusión. Si aún no tienes resultados, explica qué falta para poder analizar.</p><p class="az-draft-note">Tus respuestas se conservan como borrador en este navegador.</p>
    ${questions.map(([title,question,hint],i)=>`<div class="az-written-question"><h4>3.${i+1} ${title}</h4><label for="az-pq-${i+1}"><img class="az-question-pencil" src="/static/student-write-pencil-blue.png?v=20261004-pencil-blue" alt="" aria-hidden="true">${question}</label><p id="az-help-${i+1}">${hint}</p><textarea id="az-pq-${i+1}" class="az-pq-answer" data-az-pq="${i+1}" rows="5" maxlength="600" aria-describedby="az-help-${i+1}" placeholder="Escribe tu respuesta aquí..."></textarea></div>`).join('')}
    </section>
    <section class="az-verify"><h3>4. Verifica — Antes de continuar</h3><p>Revisa tus respuestas. Esta comprobación no es una nueva evaluación.</p>${['Identifiqué una fortaleza.','Identifiqué un aprendizaje que necesito fortalecer.','Utilicé resultados o evidencias para justificar mis respuestas.','Respondí todas las preguntas.'].map((text,i)=>`<label><input type="checkbox" data-az-verify="${i}"> ${text}</label>`).join('')}<p data-az-ready role="status">Completa las tres respuestas y revisa la lista para continuar.</p>${action('tab','Continuar a Comprende '+icon('arrow'),'primary az-continue','data-tab="comprende" disabled')}<p>En el siguiente paso profundizarás en lo que significan tus resultados.</p></section>
  </div>`;
}

function fbRubricLevel(p){
  if(p===undefined||p===null)return 'sinrevisar';
  if(Number(p)>=5)return 'logrado';
  if(Number(p)>=3)return 'parcial';
  return 'nologrado';
}
function fbAeChart(){
  const pass=fbPass();
  const rows=fbAeRows();
  const has=rows.some(r=>r.pct!=null);
  const list=rows.map(r=>`<li class="fb-row ${r.pct==null?'is-void':(r.pct>=pass?'is-ok':(r.pct>=40?'is-mid':'is-low'))}">
    <span class="fb-row-name">${esc(r.label)}</span>
    <span class="fb-row-track">${r.pct==null?'':`<i style="width:${r.pct}%"></i>`}</span>
    <b>${fbPctLabel(r.pct)}</b>
  </li>`).join('');
  return `<section class="fb-card"><h3>Aprendizajes esperados</h3>
    <p class="fb-note">${has?'Porcentaje de aciertos en la evaluación, por AE.':'Cuando entregues la evaluación, aquí verás el logro por cada aprendizaje esperado.'}</p>
    <div class="fb-heat-legend" role="group" aria-label="Rangos del semáforo de logro">
      <button type="button" class="heat-low" data-heat-range aria-expanded="false" aria-controls="heat-low-note">Rojo · p &lt; ${Math.min(40,pass)}%</button>
      <button type="button" class="heat-mid" data-heat-range aria-expanded="false" aria-controls="heat-mid-note">Amarillo · ${Math.min(40,pass)}% ≤ p &lt; ${pass}%</button>
      <button type="button" class="heat-ok" data-heat-range aria-expanded="false" aria-controls="heat-ok-note">Verde · p ≥ ${pass}%</button>
    </div>
    <div class="fb-heat-explanations"><p id="heat-low-note" hidden><b>p = porcentaje de logro.</b> Menos de ${Math.min(40,pass)}%: revisa los aprendizajes y practica con apoyo.</p><p id="heat-mid-note" hidden><b>p = porcentaje de logro.</b> Desde ${Math.min(40,pass)}% inclusive hasta menos de ${pass}%: estás consolidando el aprendizaje.</p><p id="heat-ok-note" hidden><b>p = porcentaje de logro.</b> ${pass}% o más: alcanzaste el umbral de referencia del curso.</p></div>
    <ul class="fb-rows">${list}</ul></section>`;
}
function fbComprendeBody(){
  const e=feedbackResultState().exam,rev=e?.review;
  const msg=rev?.feedback||'Aún no hay comentario del docente. Cuando revise tu desarrollo, verás aquí su orientación para seguir mejorando.';
  const rows=fbAeRows();
  const pass=fbPass();
  const selection=e?.score;
  const development=rev?.score;
  const incorrect=(e?.corrections||[]).map((c,i)=>({...c,index:i+1})).filter(c=>!c.correct).slice(0,3);
  const ranked=rows.filter(r=>r.pct!=null).sort((a,b)=>a.pct-b.pct);
  const priority=ranked[0]?.label||'el aprendizaje que te resultó más difícil';
  const aeHtml=rows.map((r,i)=>{
    const pct=r.pct==null?null:Math.max(0,Math.min(100,Number(r.pct)));
    const tone=pct==null?'void':(pct>=pass?'ok':(pct>=40?'mid':'low'));
    const w=pct==null?0:pct;
    const label=r.label||('AE '+(i+1));
    return `<li class="s5c-ae is-${tone}">
      <div class="s5c-ae-top"><b>${esc(label)}</b><span>${pct==null?'—':pct+'%'}</span></div>
      <div class="s5c-ae-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct==null?0:pct}" aria-label="${esc(label)}"><i style="width:${w}%"></i></div>
    </li>`;
  }).join('')||'<li class="s5c-ae is-void"><div class="s5c-ae-top"><b>Sin datos aún</b><span>—</span></div><div class="s5c-ae-track"><i style="width:0"></i></div></li>';

  return `<div class="s5c-board">
    <section class="s5c-main">
      <div class="s5c-score-strip" aria-label="Puntajes de la evaluación">
        <article><span>Selección múltiple</span><b>${selection==null?'—':selection} <small>/ 25 puntos</small></b></article>
        <article><span>Desarrollo</span><b>${development==null?'Pendiente':development+' '}<small>${development==null?'de revisión':'/ 25 puntos'}</small></b></article>
        <article><span>Prioridad de revisión</span><b>${esc(priority)}</b></article>
      </div>
      <article class="s5c-card s5c-feedback">
        <header><span class="s5c-ico" aria-hidden="true">💬</span><h3>Retroalimentación general</h3></header>
        <p>${esc(msg)}</p>
        <p class="s5c-hint">Lee con calma: primero entiende el mensaje, luego decide qué reforzar.</p>
      </article>
      <article class="s5c-card s5c-ae-card">
        <header><span class="s5c-ico" aria-hidden="true">📊</span><h3>Logro de mis aprendizajes</h3></header>
        <ul class="s5c-ae-list">${aeHtml}</ul>
      </article>
      <article class="s5c-card s5c-interpret">
        <header><span class="s5c-ico" aria-hidden="true">↗</span><div><h3>Interpreta tus resultados</h3><p>Convierte la información en una decisión de aprendizaje.</p></div></header>
        <div class="s5c-interpret-grid">
          <label><b>1. Dato que observo</b><small>Escribe un puntaje, resultado o evidencia concreta.</small><textarea data-s5-note="dato" rows="3" maxlength="500" placeholder="Ej.: Obtuve 16 de 25 puntos y fallé en…"></textarea></label>
          <label><b>2. Qué significa</b><small>Explica la causa posible con tus propias palabras.</small><textarea data-s5-note="significado" rows="3" maxlength="500" placeholder="Esto indica que necesito comprender mejor…"></textarea></label>
          <label><b>3. Decisión que tomo</b><small>Define qué revisarás antes del próximo intento.</small><textarea data-s5-note="decision" rows="3" maxlength="500" placeholder="Antes de continuar voy a…"></textarea></label>
        </div>
        <p class="s5c-save-note">Tus respuestas se guardan automáticamente en este navegador.</p>
      </article>
      <article class="s5c-card s5c-review-list">
        <header><span class="s5c-ico" aria-hidden="true">✓</span><div><h3>Preguntas prioritarias para revisar</h3><p>Abre cada explicación y detecta la idea que debes corregir.</p></div></header>
        ${incorrect.length?incorrect.map(c=>`<details><summary>Pregunta ${c.index} · Por reforzar</summary><p><b>Pregunta:</b> ${esc(c.question)}</p><p><b>AE ${Number(c.ae)+1} · ${esc(c.skill||'Habilidad técnica')}</b>${c.difficulty?' · '+esc(c.difficulty):''}</p><p><b>Por qué revisar:</b> ${esc(c.option_feedback||c.explanation)}</p><p><b>Próximo paso:</b> vuelve al AE indicado, identifica la evidencia decisiva y resuelve una práctica semejante.</p></details>`).join(''):'<div class="s5c-empty">No hay preguntas incorrectas registradas o la evaluación aún no ha sido entregada.</div>'}
      </article>
    </section>
    <aside class="s5c-agent" aria-label="Agente pedagógico">
      <div class="s5c-agent-tabs" role="tablist">
        <button type="button" class="is-on" role="tab" aria-selected="true" data-s5-panel="agent">Agente</button>
        <button type="button" role="tab" aria-selected="false" data-s5-panel="practice">Práctica libre</button>
        <button type="button" role="tab" aria-selected="false" data-s5-panel="access">Accesibilidad</button>
      </div>
      <div class="s5c-agent-panels">
        <div class="s5c-panel is-on" data-s5-pane="agent" role="tabpanel">
          <div class="s5c-agent-hero">
            <img src="/static/s5-agent-hero.png" alt="Agente pedagógico" width="160" height="160" decoding="async">
            <div class="s5c-bubble">¡Buen avance! Revisemos juntos qué significan tus resultados y dónde puedes crecer.</div>
          </div>
          <div class="s5c-tip">${typeof recuerdaMarkup==='function'?recuerdaMarkup('Los AE muestran qué tanto dominas cada aprendizaje. ¿En cuál crees que necesitas más apoyo?','s5-agent-tip'):'<p><b>Recuerda</b> Los AE muestran tu dominio por aprendizaje.</p>'}</div>
          <button type="button" class="s5c-cta" data-s5-tool="agent">Abrir Agente pedagógico</button>
        </div>
        <div class="s5c-panel" data-s5-pane="practice" role="tabpanel" hidden>
          <div class="s5c-mini">
            <span class="s5c-badge">🟢 Laboratorio</span>
            <h3>Práctica libre</h3>
            <p>Explora · Desafía · Investiga. Entra sin nota y elige cómo aprender.</p>
            <ul class="s5c-modes">
              <li><b>Explorar</b> observa causa–efecto</li>
              <li><b>Desafiar</b> cumple una misión</li>
              <li><b>Investigar</b> formula hipótesis</li>
            </ul>
            <button type="button" class="s5c-cta s5c-cta-green" data-s5-tool="practice">Comenzar práctica</button>
          </div>
        </div>
        <div class="s5c-panel" data-s5-pane="access" role="tabpanel" hidden>
          <div class="s5c-mini">
            <h3>Accesibilidad</h3>
            <p>Ajusta contraste, tamaño de texto y lectura en voz alta para esta estación.</p>
            <div class="s5c-toggles">
              <label class="s5c-switch"><input type="checkbox" data-s5-access="contrast"> Alto contraste</label>
              <label class="s5c-switch"><input type="checkbox" data-s5-access="tts"> Lectura en voz alta</label>
              <label class="s5c-switch"><input type="checkbox" data-s5-access="large"> Texto ampliado</label>
            </div>
            <button type="button" class="s5c-cta s5c-cta-violet" data-s5-tool="access">Abrir panel de accesibilidad</button>
          </div>
        </div>
      </div>
    </aside>
  </div>`;
}

function fbProyectaBody(){
  const rows=fbAeRows().filter(r=>r.pct!=null).sort((a,b)=>a.pct-b.pct);
  const priority=rows[0]?.label||'Aprendizaje por definir';
  const closed=Boolean(current?.state?.closed);
  return `<div class="s5p-board">
    <section class="s5p-intro">
      <div><span class="s5p-kicker">PASO 3 · PROYECTA</span><h3>Convierte tu análisis en una acción verificable</h3><p>Tu plan debe indicar qué mejorarás, cómo lo harás, cuándo lo revisarás y qué evidencia demostrará el avance.</p></div>
      <aside><span>Prioridad sugerida</span><b>${esc(priority)}</b></aside>
    </section>
    <section class="s5p-plan">
      <header class="s5p-head"><h3>1. Elige una estrategia</h3><p>Selecciona la alternativa que mejor responde a tu prioridad.</p></header>
      <div class="s5p-cards">
        <label class="s5p-card tone-blue">
          <input type="radio" name="s5-strategy" value="revisar el material clave y elaborar un resumen técnico" data-s5-strategy>
          <span class="s5p-ico" aria-hidden="true">📘</span>
          <h4>Refuerzo conceptual</h4>
          <p>Revisa el material clave del módulo antes de volver a practicar.</p>
          <span class="s5p-choice">Elegir esta estrategia</span>
        </label>
        <label class="s5p-card tone-amber">
          <input type="radio" name="s5-strategy" value="resolver una práctica guiada y corregir los pasos que presenten dificultad" data-s5-strategy>
          <span class="s5p-ico" aria-hidden="true">🛠️</span>
          <h4>Práctica guiada</h4>
          <p>Trabaja paso a paso el aprendizaje con menor resultado.</p>
          <span class="s5p-choice">Elegir esta estrategia</span>
        </label>
        <label class="s5p-card tone-green is-featured">
          <input type="radio" name="s5-strategy" value="realizar una práctica libre, comparar resultados y registrar los ajustes realizados" data-s5-strategy>
          <span class="s5p-ico" aria-hidden="true">🟢</span>
          <h4>Práctica autónoma</h4>
          <p>Explora, desafía e investiga sin calificación antes de comprobar tu avance.</p>
          <span class="s5p-choice">Elegir esta estrategia</span>
        </label>
      </div>
    </section>
    <section class="s5p-builder">
      <header class="s5p-head"><h3>2. Construye tu meta de mejora</h3><p>Completa los componentes. El LMS redactará una propuesta que podrás revisar antes de cerrar.</p></header>
      <div class="s5p-builder-grid">
        <label><span>Qué mejoraré</span><input data-s5-plan="goal" maxlength="180" value="${esc(priority)}" placeholder="Aprendizaje o habilidad prioritaria"></label>
        <label><span>Recurso o apoyo</span><input data-s5-plan="resource" maxlength="180" placeholder="Material, práctica, compañero o docente"></label>
        <label><span>Plazo</span><input data-s5-plan="deadline" maxlength="120" placeholder="Ej.: antes del viernes"></label>
        <label><span>Cómo comprobaré el avance</span><input data-s5-plan="evidence" maxlength="180" placeholder="Resultado, evidencia o nuevo intento"></label>
      </div>
      <button type="button" class="s5p-compose" data-s5-compose>Construir mi plan</button>
    </section>
    <form id="close-form" class="s5p-reflect feedback-plan ped-step" data-action="improve">
      <header class="s5p-head"><h3>3. Revisa y compromete tu plan</h3><p>La reflexión y el plan se guardarán como evidencia final del módulo.</p></header>
      <div class="s5p-final-grid">
        <label>¿Qué lograste y qué necesitas reforzar?<textarea name="reflection" minlength="20" required placeholder="Reconozco que logré… y todavía necesito reforzar…">${esc(current.state.reflection||'')}</textarea></label>
        <label>Mi plan de mejora<textarea name="plan" minlength="20" required placeholder="Selecciona una estrategia y completa la meta para construir tu plan.">${esc(current.state.plan||'')}</textarea></label>
      </div>
      <div class="s5p-form-foot"><p>Antes de cerrar, comprueba que tu plan incluya acción, recurso, plazo y evidencia.</p><button type="submit" class="primary" ${closed||auth.user.role==='teacher'?'disabled':''}>${closed?'Módulo completado':'Guardar plan y cerrar módulo'} ${icon('flag')}</button></div>
    </form>
    <section class="s5p-support" aria-label="Apoyos para completar el plan">
      <button type="button" data-s5-tool="material">${icon('book')} Revisar material</button>
      <button type="button" data-s5-tool="practice">${icon('tool')} Abrir práctica libre</button>
      <button type="button" data-s5-tool="agent">${icon('chat')} Consultar al agente</button>
      <button type="button" data-s5-tool="access">${accessGlyph()} Ajustar accesibilidad</button>
    </section>
  </div>`;
}

function fbComprendeBodyV3(){
  const exam=feedbackResultState().exam;
  const rows=fbAeRows().filter(row=>row.pct!=null);
  const corrections=(exam?.corrections||[]).map((row,index)=>({...row,index}));
  const groups=[['Lo que ya dominas',rows.filter(row=>row.pct>=fbPass()),'Aciertos que conviene mantener y verificar en nuevas situaciones.'],['Lo que estás consolidando',rows.filter(row=>row.pct>=40&&row.pct<fbPass()),'Revisa qué decisiones cumplen el criterio y cuáles necesitan ajustes.'],['Tu principal desafío',rows.filter(row=>row.pct<40),'Contrasta tu respuesta con la explicación antes de concluir.']];
  const questions=[['comprende-interpretacion','¿Qué comprendiste al revisar esta evidencia?','Explica qué hiciste correctamente o qué necesitabas realizar de otra manera.','Escribe aquí qué comprendiste...'],['comprende-reflexion','¿Qué evidencia demuestra lo que acabas de explicar?','Cita un resultado, dato, decisión o criterio presente en la evidencia.','Menciona una evidencia concreta...'],['comprende-fortalecer','¿Qué aspecto de este aprendizaje necesitas fortalecer?','Explica qué necesitas seguir trabajando a partir de la evidencia revisada.','Explica qué necesitas fortalecer...']];
  return `<div class="az-guided cg-board"><header class="az-guided-intro"><small>2. COMPRENDE</small><h2>¿Qué significan mis resultados?</h2><p>Revisa las evidencias que explican tus fortalezas y dificultades. Identifica qué ocurrió y explica con tus palabras qué significa para tu aprendizaje.</p><ol class="az-mini-route"><li>1. Revisa</li><li>2. Comprende</li><li>3. Explica</li><li>4. Verifica</li></ol><details><summary>Antes de comenzar</summary><p><b>Objetivo:</b> comprender tus resultados y reconocer qué mantener o fortalecer.</p><p><b>Vas a revisar:</b> resultados, retroalimentaciones y evidencias.</p><p><b>Vas a realizar:</b> revisar, comprender, explicar y verificar.</p><p><b>Al finalizar:</b> explicarás qué aprendiste, qué evidencia lo demuestra y qué necesitas fortalecer.</p></details></header>
  <section class="az-observe"><h3>1. Revisa — Qué muestran mis resultados</h3><p>Revisa tus aprendizajes y abre una evidencia para comprender de dónde proviene el resultado. Todavía no necesitas escribir.</p><div class="cg-results">${groups.map(([title,matches,meaning],i)=>`<article class="cg-result cg-tone-${i}"><h4>1.${i+1} ${title}</h4>${matches.length?`<ul>${matches.map(row=>`<li><b>${esc(row.id)} · ${row.pct}%</b><details><summary>Aprendizaje asociado</summary>${esc(row.label)}</details></li>`).join('')}</ul><p>${meaning}</p><button type="button" class="outline" data-cg-review>Revisar evidencia</button>`:'<p>No hay resultados registrados en este rango. No se atribuye dominio ni dificultad sin evidencia.</p>'}</article>`).join('')}</div><p>Los rangos son referencias de aciertos, no una certificación de dominio técnico.</p>${exam?.review?.feedback?`<details><summary>Retroalimentación docente</summary><p>${esc(exam.review.feedback)}</p></details>`:'<p>No hay comentario docente disponible todavía.</p>'}</section>
  <section class="az-identify" id="cg-evidence"><h3>2. Comprende — Revisa una evidencia</h3><p>Selecciona una evidencia. Revisa qué respondiste, qué ocurrió y qué criterio respalda la explicación.</p>${corrections.length?`<label for="cg-select">Evidencia que revisarás</label><select id="cg-select" data-cg-select><option value="">Selecciona una evidencia</option>${corrections.map(row=>`<option value="${row.index}">Pregunta ${row.index+1} · ${row.correct?'Acierto para comprender':'Prioridad de revisión'} · ${esc(row.ae||'AE por identificar')}</option>`).join('')}</select><div data-cg-detail aria-live="polite"></div>`:'<p>No hay evidencias evaluadas disponibles. Entrega la evaluación de la estación 4 para revisar tus respuestas; no se presentan ejemplos como si fueran tus resultados.</p>'}
  <form data-cg-practice><h4>2.5 Comprueba si comprendiste</h4><fieldset><legend>Selecciona la acción que mejor te ayudaría a mejorar esta evidencia.</legend>${['Repetir la misma respuesta sin revisar la evidencia.','Comparar los datos con el criterio técnico y comprobar la decisión.','Cambiar la respuesta solo porque fue incorrecta.','Decidir por intuición sin comprobar los datos.'].map((text,i)=>`<label><input type="radio" name="cg-practice" value="${i}" disabled> ${'ABCD'[i]}. ${text}</label>`).join('')}</fieldset><button type="submit" class="outline" disabled>Comprobar respuesta</button><p role="status" data-cg-practice-status>Primero selecciona y revisa una evidencia.</p></form></section>
  <section class="az-response"><h3>3. Explica — Qué comprendiste</h3><p>Ahora te toca a ti. Utiliza la evidencia revisada para responder con tus propias palabras.</p><p class="az-draft-note" data-cg-save>Tus respuestas se conservan como borrador en este navegador.</p>${questions.map(([key,question,hint,placeholder],i)=>`<div class="az-written-question"><label for="cg-answer-${i}"><img class="az-question-pencil" src="/static/student-write-pencil-blue.png?v=20261004-pencil-blue" alt="" aria-hidden="true">3.${i+1} ${question}</label><p id="cg-help-${i}">${hint}</p><textarea id="cg-answer-${i}" class="az-pq-answer" data-s5-note="${key}" rows="5" maxlength="700" aria-describedby="cg-help-${i}" placeholder="${placeholder}"></textarea></div>`).join('')}</section>
  <section class="az-verify"><h3>4. Verifica — Comprendí mis resultados</h3><p>Revisa tus respuestas antes de continuar. Esta comprobación no agrega una calificación.</p>${['Expliqué qué comprendí.','Utilicé una evidencia para justificar mi explicación.','Reconocí qué aspecto necesito fortalecer.','Respondí todas las preguntas.'].map(text=>`<label><input type="checkbox" data-cg-verify> ${text}</label>`).join('')}<p role="status" data-cg-ready>Revisa una evidencia, comprueba tu comprensión y completa las tres respuestas.</p>${action('tab','← Volver a Analiza','outline','data-tab="analiza"')}${action('tab','Continuar a Conecta '+icon('arrow'),'primary','data-tab="conecta" data-cg-continue disabled')}<p>En el siguiente paso relacionarás lo aprendido.</p></section></div>`;
}
function fbComprendeBodyV2(){
  const exam=feedbackResultState().exam;
  const rows=fbAeRows().map((r,i)=>({...r,index:i}));
  const scored=rows.filter(r=>r.pct!=null).sort((a,b)=>b.pct-a.pct);
  const strength=scored[0]||rows[0]||{id:'AE 1',label:'Aprendizaje principal',pct:null,index:0};
  const challenge=scored[scored.length-1]||rows[2]||rows[0]||{id:'AE 3',label:'Aprendizaje por reforzar',pct:null,index:2};
  const consolidating=scored.find(r=>r.id!==strength.id&&r.id!==challenge.id)||rows[1]||strength;
  const aeContent=current?.content?.aes||[];
  const short=r=>aeContent[r.index]?.short_title||aeContent[r.index]?.title||r.label;
  const expTitle=r=>aeContent[r.index]?.experiences?.[0]?.title||'aplicar este aprendizaje en una situación técnica';
  const card=(kind,r,title,subtitle,copy,evidence,cta)=>`<article class="c2-result c2-${kind}">
    <header><span class="c2-result-icon">${icon(kind==='strength'?'check':kind==='progress'?'chart':'flag')}</span><div><h3>${esc(title)}</h3><span>${esc(subtitle)}</span></div></header>
    <p>${copy}</p>
    <div class="c2-evidence"><span>${icon('file')}<b>Se evidencia en:</b> ${esc(evidence)}</span><span>${icon('grid')}<b>AE asociado:</b> ${esc(r.id||'Por identificar')}</span></div>
    <button type="button" data-c2-scroll="evidence">${esc(cta)} ${icon('arrow')}</button>
  </article>`;
  const resultCards=[
    card('strength',strength,'Lo que ya dominas','Tu principal fortaleza',`Demostraste un buen dominio de ${esc(short(strength))}, especialmente cuando tuviste que ${esc(expTitle(strength))}.`,'Actividad 1 · Evidencia destacada','Ver evidencias'),
    card('progress',consolidating,'Lo que estás consolidando','Vas avanzando en…',`Comprendes ${esc(short(consolidating))}, pero todavía necesitas fortalecer su aplicación cuando cambia la situación o debes relacionarlo con otros conceptos.`,'Actividad 3 · Evidencia de proceso','Revisar actividad'),
    card('challenge',challenge,'Tu principal desafío','Aquí tienes una oportunidad para mejorar',`Tu mayor oportunidad de mejora aparece cuando necesitas ${esc(expTitle(challenge))} utilizando ${esc(short(challenge))} para tomar una decisión.`,'Situación integradora','Ver recomendaciones')
  ].join('');

  const incorrect=(exam?.corrections||[]).map((c,i)=>({...c,index:i+1})).filter(c=>!c.correct).slice(0,3);
  const fallbackImages=['/static/themes/oficio/oficio-plano-leyenda.png?v=3','/static/themes/oficio/oficio-visor-21c.png?v=3','/static/themes/oficio/oficio-tramos.png?v=3'];
  const evidenceRows=(incorrect.length?incorrect:[0,1,2].map((_,i)=>({
    index:i+1,
    question:`Evidencia asociada a ${short(rows[i]||challenge)}`,
    explanation:`Revisa el concepto, relaciónalo con los datos disponibles y verifica tu decisión antes de continuar.`,
    image:fallbackImages[i]
  })));
  const evidenceCards=evidenceRows.map((c,i)=>`<article class="c2-proof">
    <header><span>Evidencia ${String(c.index).padStart(2,'0')}</span><em>${i===0?'Prioridad alta':i===1?'En consolidación':'Refuerzo sugerido'}</em></header>
    <div class="c2-proof-body">
      <img src="${esc(c.image||fallbackImages[i%fallbackImages.length])}" alt="Referencia visual de la evidencia ${c.index}" loading="lazy">
      <ol>
        <li><b>Lo que hiciste</b><p>${esc(c.question||'Tomaste una decisión frente a la situación planteada.')}</p></li>
        <li><b>¿Qué ocurrió?</b><p>Tu respuesta consideró parte de la información, pero faltó relacionarla con el criterio técnico principal.</p></li>
        <li><b>Concepto clave</b><p>${esc(short(rows[i]||challenge))}</p></li>
        <li><b>¿Cómo mejorarlo?</b><p>${esc(c.explanation||'Identifica los datos, establece la relación y verifica el resultado.')}</p></li>
      </ol>
    </div>
    <button type="button" data-c2-proof="${c.index}">Ver evidencia completa ${icon('arrow')}</button>
  </article>`).join('');

  const concepts=[strength,consolidating,challenge].map(short);
  return `<div class="c2-board">
    <section class="c2-hero">
      <div class="c2-hero-title"><span class="c2-brain">${icon('search')}</span><div><h2>Comprende</h2><p>¿Qué significan mis resultados?</p></div></div>
      <p class="c2-hero-copy">A partir de los resultados que observaste, revisa tus evidencias para comprender qué muestran sobre tu aprendizaje.</p>
      <aside><span>${icon('bulb')}</span><p><b>Comprender tus resultados</b> te ayuda a aprender mejor: no se trata solo de una cifra, sino de reconocer qué sabes hacer y qué necesitas revisar.</p></aside>
      <img src="/static/estudiante-comprende.png?v=1" alt="Estudiante técnico reflexionando sobre sus resultados" width="330" height="220">
      <strong class="c2-hero-note">Aprender hoy,<br>para más opciones mañana</strong>
    </section>

    <section class="c2-section c2-results">
      <header class="c2-section-title"><span>1</span><em>INTERPRETA</em><div><h3>Lo que tus resultados nos muestran</h3><p>Aquí reconocemos tus fortalezas, lo que estás consolidando y tu principal desafío.</p></div></header>
      <div class="c2-result-grid">${resultCards}</div>
    </section>

    <section class="c2-section" id="c2-evidence">
      <header class="c2-section-title"><span>2</span><em>APRENDE</em><div><h3>Aprende de tus evidencias</h3><p>Tus errores también muestran cómo estás aprendiendo. Revisa solo las evidencias más relevantes.</p></div><aside>${icon('bulb')} Cada desafío es una oportunidad de aprender algo nuevo.</aside></header>
      <div class="c2-proof-grid">${evidenceCards}</div>
      <form class="c2-practice" data-practice-target data-c2-practice aria-labelledby="c2-practice-title">
        <header><span>${icon('tool')}</span><div><small>PRÁCTICA BREVE</small><h3 id="c2-practice-title">Comprueba cómo mejorarías tu respuesta</h3><p>Elige una estrategia y revisa de inmediato si te ayuda a corregir el razonamiento.</p></div></header>
        <fieldset><legend>Antes de volver a responder una evidencia por reforzar, ¿qué acción te ayuda más?</legend>
          <label><input type="radio" name="c2-practice-${current?.id||'module'}" value="repeat"><span>A</span><b>Repetir la misma respuesta sin revisar la evidencia.</b></label>
          <label><input type="radio" name="c2-practice-${current?.id||'module'}" value="check"><span>B</span><b>Comparar los datos con el criterio técnico y comprobar la decisión.</b></label>
          <label><input type="radio" name="c2-practice-${current?.id||'module'}" value="guess"><span>C</span><b>Cambiar la respuesta solo porque la anterior fue incorrecta.</b></label>
        </fieldset>
        <div class="c2-practice-actions"><button type="submit" class="primary" disabled>Comprobar respuesta ${icon('check')}</button><p role="status" aria-live="polite"></p></div>
      </form>
    </section>

    <section class="c2-section c2-connect">
      <header class="c2-section-title"><span>3</span><em>INTERPRETA</em><div><h3>Interpreta tus evidencias</h3><p>Relaciona cada evidencia con el concepto o criterio que demuestra y reconoce qué significa para tu aprendizaje.</p></div></header>
      <div class="c2-meaning-chain"><article><b>Evidencia</b><p>${esc(evidenceRows[0]?.question||'Actividad destacada del módulo')}</p></article>${icon('arrow')}<article><b>Concepto o criterio</b><p>${esc(concepts[0])}</p></article>${icon('arrow')}<article class="c2-meaning-response"><label for="c2-meaning-response"><b>Qué significa para mi aprendizaje</b><small>Escribe directamente en este recuadro.</small></label><textarea id="c2-meaning-response" data-s5-note="comprende-interpretacion" rows="4" maxlength="600" placeholder="Esta evidencia demuestra que comprendí… porque… Para seguir mejorando necesito…"></textarea><span><b data-c2-interpretation-count>0</b>/600 · Guardado automático</span></article></div>
    </section>

    <section class="c2-section c2-demonstrate">
      <header class="c2-section-title"><span>4</span><em>EXPLICA</em><div><h3>¿Qué muestran tus evidencias?</h3><p>Explica qué aprendiste y qué todavía necesitas fortalecer. Tu respuesta se guarda automáticamente.</p></div><button type="button" class="s5-hint-button" data-s5-hint="comprende" aria-expanded="false">${icon('bulb')} Necesito una pista</button></header>
      <div class="s5-hint-panel" data-s5-hint-panel="comprende" hidden>Elige una evidencia concreta: explica qué hiciste, qué resultado obtuviste y qué concepto necesitas revisar para mejorarlo.</div>
      <div class="c2-micro-grid c2-single-response"><label><span><b>✎ TU RESPUESTA</b><small>Menciona una evidencia y explica qué demuestra.</small></span><p>¿Qué muestran estas evidencias sobre lo que aprendiste y sobre lo que todavía necesitas fortalecer?</p><textarea data-s5-note="comprende-reflexion" rows="4" maxlength="700" placeholder="Menciona una evidencia concreta y explica qué muestra sobre tu aprendizaje…"></textarea></label></div>
    </section>

    <section class="c2-close">
      <div class="c2-close-message"><span>${icon('check')}</span><div><h3>REVISA → INTERPRETA → EXPLICA</h3><p>Ya comprendiste qué muestran tus evidencias. Ahora relaciona los aprendizajes principales.</p></div></div>
      <div class="c2-close-route"><article><span>${icon('check')}</span><b>Analiza</b></article><i></i><article class="active"><span>2</span><b>Comprende</b></article><i></i><article><span>3</span><b>Proyecta</b></article></div>
      <nav><button type="button" data-action="tab" data-tab="analiza">← Volver a Analiza</button><button type="button" class="primary" data-action="tab" data-tab="conecta">Continuar a Conecta ${icon('arrow')}</button></nav>
    </section>
  </div>`;
}

function fbProyectaBodyV2(mode='proyecta'){
  const aeContent=current?.content?.aes||[];
  const rows=fbAeRows().map((r,i)=>({...r,index:i}));
  const ranked=rows.filter(r=>r.pct!=null).sort((a,b)=>a.pct-b.pct);
  const priority=ranked[0]||rows[0]||{label:'Aprendizaje prioritario',index:0,pct:null};
  const level=priority.pct==null?'progress':priority.pct>=75?'high':priority.pct>=50?'progress':'support';
  const conceptSeeds=aeContent.slice(0,3).map((a,i)=>({
    id:`ae-${i+1}`,label:a.short_title||a.title||`Aprendizaje ${i+1}`,
    description:(a.purpose||a.summary||a.title||'Aprendizaje esencial del módulo').slice(0,120),
    icon:i===0?'search':i===1?'tool':'check',tone:i===0?'violet':i===1?'amber':'green',
    learned:`AE ${i+1} · actividades y situación integradora`,
    use:`resolver tareas relacionadas con ${(a.short_title||a.title||'el módulo').toLowerCase()}`
  }));
  const concepts=[
    ...conceptSeeds,
    {id:'interpretar',label:'Interpretar datos',description:'Distinguir información útil, condiciones y relaciones.',icon:'file',tone:'rose',learned:'Análisis de evidencias',use:'fundamentar una decisión técnica'},
    {id:'verificar',label:'Verificar criterios',description:'Comprobar el resultado antes de ejecutar o cerrar.',icon:'check',tone:'blue',learned:'Evaluación y retroalimentación',use:'detectar errores y confirmar resultados'}
  ].slice(0,5);
  const center=concepts[1]||concepts[0];
  const conceptTags=['CONTEXTO','CONCEPTO CLAVE','APLICA','ANALIZA','EVALÚA'];
  const conceptNodes=concepts.map((c,i)=>`<button type="button" class="p3-node tone-${c.tone}${c.id===center.id?' is-center':''}" data-p3-concept="${esc(c.id)}" data-p3-position="${i+1}" style="--p3-i:${i}">
    <span>${icon(c.icon)}</span><b>${esc(c.label)}</b><small>${esc(c.description)}</small><em>${conceptTags[i]}</em><i>Explorar</i>
  </button>`).join('');
  const conceptJson=esc(JSON.stringify(concepts));
  const course=(courses||[]).find(c=>Number(c.id)===Number(current?.course_id));
  const caseImage=typeof moduleStopArt==='function'?moduleStopArt(course,Math.max(0,(current?.position||1)-1)):'/static/themes/oficio/oficio-plano-leyenda.png?v=3';
  const situation=current?.content?.case_blurb||current?.content?.context||'En una instalación técnico-profesional, el equipo recibe información incompleta y debe decidir cómo continuar sin comprometer la seguridad ni la calidad del trabajo.';
  const challenge={
    high:{kicker:'Sigue avanzando',title:'Aumenta la complejidad',copy:'Demostraste dominio de los aprendizajes fundamentales. Tu próximo desafío es aplicarlos con más variables y menos apoyo.'},
    progress:{kicker:'Continúa fortaleciendo',title:'Consolida tu criterio',copy:`Estás avanzando correctamente. Practica especialmente ${priority.label}.`},
    support:{kicker:'Prioridad de aprendizaje',title:'Refuerza antes de avanzar',copy:`Te recomendamos reforzar ${priority.label}, especialmente su aplicación en una situación nueva.`}
  }[level];
  const closed=Boolean(current?.state?.closed);
  return `<div class="p3-board p3-view-${esc(mode)}" data-p3-concepts="${conceptJson}">
    <section class="p3-hero">
      <div class="p3-hero-copy"><div class="p3-hero-title"><span>${icon('flag')}</span><div><h2>Proyecta</h2><p>¿Cómo conecto y aplico lo aprendido?</p></div></div>
      <p>Integra los aprendizajes esenciales del módulo, explora sus conexiones y aplícalos frente a una situación técnico-profesional nueva.</p>
      <div class="p3-hero-flow" aria-label="Ruta de aprendizaje de Proyecta"><span>Conecta</span>${icon('arrow')}<span>Transfiere</span>${icon('arrow')}<span>Decide</span></div></div>
      <aside>${icon('bulb')}<span><b>Todo lo que aprendiste puede conectarse.</b> Selecciona un concepto para descubrir cómo se relaciona con los demás.</span></aside>
      <div class="p3-hero-visual"><img src="/static/estudiante-proyecta.png?v=1" alt="Estudiante técnica proyectando su próximo desafío" width="330" height="220"><strong class="p3-hero-note">Tus conocimientos<br>también construyen<br>tu futuro</strong></div>
    </section>

    <section class="p3-section p3-map-section">
      <header class="p3-title p3-map-head"><span>1</span><em>CONECTA</em><div><h3>Así se conecta lo que aprendiste</h3><p>Construye tu mapa de aprendizaje relacionando los conceptos principales del módulo.</p></div><div class="p3-map-progress"><div>${icon('bulb')}<span><small>Conceptos explorados</small><progress value="1" max="5"></progress></span><b data-p3-explored>1/5</b></div><div>${icon('link')}<span><small>Conexiones construidas</small><progress value="0" max="4"></progress></span><b data-p3-connected>0/4</b></div></div><img class="brand-logo p3-map-logo" src="/static/logo-aula-tp-oficial.png?v=2" alt="Aula TP Chile · Formación técnica con sentido"></header>
      <div class="p3-map-layout">
        <aside class="p3-map-guide"><span>${icon('bulb')}</span><div><h4>Tu misión</h4><p>Construye las conexiones principales de tu mapa de aprendizaje.</p><ol><li><b>1 · Explora</b><small>Selecciona un concepto.</small></li><li><b>2 · Relaciona</b><small>Selecciona otro concepto relacionado.</small></li><li><b>3 · Explica</b><small>Describe por qué se conectan.</small></li><li><b>4 · Contrasta</b><small>Compara con la relación técnica.</small></li></ol></div><strong>Explora, relaciona y construye tu criterio técnico.</strong></aside>
        <div class="p3-map" aria-label="Mapa visual interactivo de aprendizajes">
          ${conceptNodes}
          <div class="p3-links" aria-hidden="true"><span>¿Cómo se relaciona?<small>Selecciona la conexión</small></span><span>¿Cómo se relaciona?<small>Selecciona la conexión</small></span><span>¿Cómo se relaciona?<small>Selecciona la conexión</small></span><span>¿Cómo se relaciona?<small>Selecciona la conexión</small></span></div>
        </div>
        <aside class="p3-concept-panel" aria-live="polite">
          <span class="p3-panel-kicker">${icon('book')} Explora y conecta</span>
          <div class="p3-concept-feature"><span>${icon(center.icon)}</span><div><h3>${esc(center.label)}</h3><p>${esc(center.description)}</p></div></div>
          <dl><div><dt>¿Cómo se conecta?</dt><dd>Se relaciona con los demás conceptos porque permite tomar decisiones fundamentadas.</dd></div><div><dt>¿Dónde lo aprendiste?</dt><dd>${esc(center.learned)}</dd></div><div><dt>¿Dónde se utiliza?</dt><dd>En un contexto técnico-profesional puede utilizarse para ${esc(center.use)}.</dd></div></dl>
          <button type="button" data-p3-evidence>Ver evidencia relacionada ${icon('arrow')}</button>
        </aside>
      </div>
      <section class="p3-connection-builder" aria-label="Construye una conexión del mapa">
        <header><span>${icon('link')}</span><div><h4>Explica tu conexión</h4><p>Selecciona dos conceptos y explica qué aporta uno al otro.</p></div></header>
        <div class="p3-connection-controls">
          <select data-p3-connect-a><option value="">Concepto 1…</option>${concepts.map(c=>`<option value="${esc(c.id)}">${esc(c.label)}</option>`).join('')}</select>
          <span>${icon('arrow')}</span>
          <select data-p3-connect-b><option value="">Concepto 2…</option>${concepts.map(c=>`<option value="${esc(c.id)}">${esc(c.label)}</option>`).join('')}</select>
          <textarea data-p3-connect-reason rows="2" maxlength="400" placeholder="Se relacionan porque…"></textarea>
          <button type="button" data-p3-connect-save disabled>Contrastar mi conexión</button>
        </div>
        <div class="p3-connection-feedback" data-p3-connect-feedback hidden aria-live="polite"></div>
      </section>
      <div class="p3-thinking-route"><header>${icon('bulb')}<div><b>Ruta de pensamiento técnico</b><small>Sigue este proceso para construir tu aprendizaje.</small></div></header>${['Observa|Reconoce el contexto','Interpreta|Analiza la información','Relaciona|Conecta conceptos','Decide|Selecciona y planifica','Aplica|Ejecuta conocimientos','Verifica|Evalúa resultados'].map((item,i)=>{const [title,copy]=item.split('|');return `<article class="${i<2?'is-done':i===2?'is-current':''}"><span>${i+1}</span><div><b>${title}</b><small>${copy}</small></div></article>`}).join('')}<aside>${icon('flag')}<span><b>¡Tú puedes!</b><small>Cada conexión te acerca a resolver desafíos reales.</small></span></aside></div>
    </section>

    <section class="p3-section p3-transfer">
      <header class="p3-title p3-transfer-head"><span>2</span><em>TRANSFIERE</em><div><h3>Del mapa a una situación real</h3><p>Ahora utiliza las conexiones que construiste para analizar y resolver un nuevo desafío técnico.</p></div><strong>${icon('check')} Mapa construido <i>→</i> Ahora aplícalo</strong></header>
      <article class="p3-professional-case"><img src="${esc(caseImage)}" alt="Plano y documentación técnica del nuevo desafío"><div class="p3-case-copy"><span>${icon('file')} NUEVO DESAFÍO</span><h4>Revisión de un proyecto de climatización</h4><p>${esc(situation)}</p><b>Antes de ejecutar, interpreta la documentación, detecta posibles inconsistencias y decide con evidencia.</b></div><aside><header>${icon('search')}<h4>Tu misión</h4></header><ol><li><span>1</span>Analiza la información</li><li><span>2</span>Decide qué harías</li><li><span>3</span>Justifica tu decisión</li><li><span>4</span>Verifica tu propuesta</li></ol><strong>Usa las conexiones que construiste en tu mapa.</strong></aside></article>
      <div class="p3-resolution" data-p3-step="1">
        <nav class="p3-stepper" aria-label="Proceso de resolución">${['Identifica','Decide','Justifica','Verifica'].map((label,i)=>`<button type="button" data-p3-step-button="${i+1}" ${i?'disabled':''}><span>${i+1}</span><b>${label}</b><small>${i===0?'Paso activo':'Pendiente'}</small></button>`).join('')}</nav>
        <div class="p3-transfer-layout">
          <div class="p3-step-panels">
            <section class="p3-step-panel is-active" data-p3-step-panel="1"><header><span>${icon('search')}</span><div><small>Paso 1 de 4</small><h4>Identifica</h4></div></header><h5>¿Qué conceptos de tu mapa utilizarías para comenzar?</h5><p>Selecciona al menos dos conceptos que necesites para comprender la situación.</p><div class="p3-concept-picks">${concepts.map((c,i)=>`<label class="tone-${c.tone}"><input type="checkbox" value="${esc(c.label)}" data-p3-pick><span>${icon(c.icon)}<b>${esc(c.label)}</b><small>${esc(c.description)}</small></span></label>`).join('')}</div><button type="button" class="s5-hint-button" data-s5-hint="transfiere" aria-expanded="false">${icon('bulb')} Necesito una pista</button><div class="s5-hint-panel" data-s5-hint-panel="transfiere" hidden>Piensa qué información necesitas comprender antes de decidir: plano, dimensiones, especificaciones y criterios técnicos.</div><button type="button" class="p3-step-next" data-p3-next="2" disabled>Confirmar selección ${icon('arrow')}</button></section>
            <section class="p3-step-panel" data-p3-step-panel="2" hidden><header><span>${icon('tool')}</span><div><small>Paso 2 de 4</small><h4>Decide</h4></div></header><div class="p3-using"><b>Estás utilizando:</b><span data-p3-using>Selecciona conceptos en el paso anterior.</span></div><h5>¿Qué acción realizarías antes de ejecutar el proyecto?</h5><label>Mi decisión<textarea data-s5-note="proyecta-decide" rows="4" maxlength="700" placeholder="Escribe brevemente qué harías…"></textarea></label><fieldset><legend>¿Qué información sustenta tu decisión?</legend><div class="p3-evidence-picks">${['Plano','Especificaciones técnicas','Listado de equipos','Dimensiones del espacio','Criterios técnicos'].map((item,i)=>`<label><input type="checkbox" data-p3-evidence-pick value="${item}">${icon(['file','tool','grid','search','check'][i])}<span>${item}</span></label>`).join('')}</div></fieldset><button type="button" class="p3-step-next" data-p3-next="3" disabled>Guardar decisión y continuar ${icon('arrow')}</button></section>
            <section class="p3-step-panel" data-p3-step-panel="3" hidden><header><span>${icon('link')}</span><div><small>Paso 3 de 4</small><h4>Justifica</h4></div></header><blockquote><b>Tu decisión</b><span data-p3-decision-preview>Completa el paso anterior.</span></blockquote><h5>Construye una justificación técnica</h5><label>Mi decisión es adecuada porque…<textarea data-s5-note="proyecta-justifica" rows="3" maxlength="700" placeholder="Explica por qué tomarías esta decisión…"></textarea></label><label>Se relaciona principalmente con…<select data-p3-justify-concept><option value="">Selecciona un concepto del mapa</option>${concepts.map(c=>`<option>${esc(c.label)}</option>`).join('')}</select></label><label>La evidencia que la respalda es…<textarea data-s5-note="proyecta-evidencia" rows="2" maxlength="500" placeholder="Describe el dato o documento que respalda tu decisión…"></textarea></label><button type="button" class="p3-step-next" data-p3-next="4" disabled>Guardar justificación ${icon('arrow')}</button></section>
            <section class="p3-step-panel" data-p3-step-panel="4" hidden><header><span>${icon('check')}</span><div><small>Paso 4 de 4</small><h4>Verifica</h4></div></header><p class="p3-principle">Una decisión técnica no termina al ejecutarla: también debes comprobar que cumple los requerimientos establecidos.</p><h5>¿Qué revisarías para comprobar tu propuesta?</h5><div class="p3-verification-picks">${['Dimensiones','Especificaciones','Capacidad del equipo','Materiales','Criterios técnicos'].map((item,i)=>`<label><input type="checkbox" data-p3-verify-pick value="${item}">${icon(['search','file','chart','cube','check'][i])}<span>${item}</span></label>`).join('')}</div><label>¿Qué evidencia demostraría que tu decisión fue correcta?<textarea data-s5-note="proyecta-verifica" rows="3" maxlength="700" placeholder="Describe brevemente cómo comprobarías el resultado…"></textarea></label><button type="button" class="p3-step-next" data-p3-finish disabled>Finalizar razonamiento ${icon('check')}</button></section>
            <section class="p3-resolution-summary" data-p3-summary hidden><header>${icon('check')}<div><small>Desafío completado</small><h4>Así resolviste el desafío</h4></div></header><div><article><span>1</span><b>Identificaste</b><p data-p3-summary-concepts></p></article><article><span>2</span><b>Decidiste</b><p data-p3-summary-decision></p></article><article><span>3</span><b>Justificaste</b><p data-p3-summary-justify></p></article><article><span>4</span><b>Verificaste</b><p data-p3-summary-verify></p></article></div><blockquote>Interpretaste información → relacionaste conceptos → tomaste una decisión → la justificaste → verificaste el resultado.</blockquote></section>
          </div>
          <aside class="p3-transfer-aside"><section><header>${icon('link')}<div><h4>Tu mapa te acompaña</h4><p>Recuerda las conexiones que construiste.</p></div></header><div class="p3-mini-map"><b>${esc(concepts[0]?.label||'Planos')}</b><span>${icon('arrow')}</span><b>${esc(center?.label||'Especificaciones')}</b><span>${icon('arrow')}</span><b>${esc(concepts[2]?.label||'Materiales')}</b></div><button type="button" data-p3-action="map">Ver mi mapa completo ${icon('arrow')}</button></section><section><header>${icon('file')}<div><h4>Recursos de la situación</h4><p>Documentos para analizar el caso.</p></div></header><ul><li>${icon('file')} Plano de la sala</li><li>${icon('grid')} Leyenda de simbología</li><li>${icon('file')} Listado preliminar de equipos</li></ul></section><section class="p3-doubt">${icon('chat')}<div><h4>¿Tienes dudas?</h4><p>Consulta al Agente Pedagógico desde el panel de herramientas.</p></div></section></aside>
        </div>
      </div>
    </section>

    <section class="p3-section p3-advance tone-${level}">
      <header class="p3-title p3-advance-head"><span>${mode==='proyecta'?'1':'3'}</span><em>AVANZA</em><div><h3>Proyecta lo que aprendiste</h3><p>Ya conectaste tus aprendizajes y los utilizaste para resolver una situación nueva. Ahora reconoce qué demostraste y qué aprendizaje te llevas para futuras situaciones técnicas.</p></div><nav><span>${icon('check')}<b>1 · Conecta</b><small>Mapa construido</small></span>${icon('arrow')}<span>${icon('check')}<b>2 · Transfiere</b><small>Situación resuelta</small></span>${icon('arrow')}<span class="is-current"><b>3 · Avanza</b><small>Proyecta tu aprendizaje</small></span></nav></header>
      <div class="p3-advance-layout">
        <div class="p3-advance-main">
          <section class="p3-reasoning"><header>${icon('link')}<div><h4>Así utilizaste tu aprendizaje</h4><p>Este es el recorrido que realizaste para resolver el desafío.</p></div></header><div>${['Conectaste|Relacionaste conceptos de tu mapa.','Decidiste|Tomaste una decisión frente al caso.','Justificaste|Explicaste tu decisión con conceptos.','Verificaste|Definiste criterios para comprobarla.'].map((item,i)=>{const [title,copy]=item.split('|');return `<article><span>${icon(['link','tool','file','check'][i])}</span><b>${title}</b><p data-p3-reasoning="${i+1}">${copy}</p></article>${i<3?icon('arrow'):''}`}).join('')}</div></section>
          <div class="p3-learning-grid">
            <section class="p3-decision-map"><header>${icon('link')}<div><h4>Del mapa a tu decisión</h4><p>Así conectaste los conceptos con la situación que resolviste.</p></div></header><div class="p3-decision-flow"><article><b>Lo que aprendiste</b><div data-p3-advance-concepts><span>Completa Identifica para ver tus conceptos.</span></div></article>${icon('arrow')}<article><b>Tu decisión</b><blockquote data-p3-advance-decision>Completa Decide para recuperar tu respuesta.</blockquote></article>${icon('arrow')}<article><b>Tu evidencia técnica</b><blockquote data-p3-advance-evidence>Completa Justifica para recuperar tu evidencia.</blockquote></article></div></section>
            <div class="p3-achievement-column"><section class="p3-strength-card"><header>${icon('check')}<div><small>Tu fortaleza</small><h4>Interpretas información técnica para tomar decisiones.</h4></div></header><p>En la situación anterior relacionaste información del plano y las especificaciones antes de decidir qué hacer.</p><b>Se evidenció en: Identifica → Decide → Justifica</b></section><section class="p3-focus-card"><header>${icon('arrow')}<div><small>Tu próximo foco</small><h4>Fundamenta tus decisiones con evidencia técnica.</h4></div></header><p>Para fortalecer tu razonamiento, relaciona explícitamente tu decisión con un dato, una especificación o un criterio técnico.</p><div><blockquote><b>Lo que hiciste</b><span data-p3-focus-before>“Revisaría las especificaciones.”</span></blockquote>${icon('arrow')}<blockquote><b>Para fortalecerlo</b><span data-p3-focus-after>“Revisaría las especificaciones porque contienen los requerimientos técnicos para verificar el proyecto.”</span></blockquote></div></section></div>
          </div>
        </div>
        <aside class="p3-metacognition"><section><header>${icon('file')}<div><h4>2 · ¿Qué te llevas de este desafío?</h4><p>Completa tres reflexiones breves.</p></div></header><label><span>1</span>Para tomar una buena decisión técnica necesito considerar…<textarea data-s5-note="proyecta-reflexion-1" rows="2" maxlength="350" placeholder="Escribe tu respuesta aquí…"></textarea></label><label><span>2</span>Una evidencia que puede respaldar mi decisión es…<textarea data-s5-note="proyecta-reflexion-2" rows="2" maxlength="350" placeholder="Escribe tu respuesta aquí…"></textarea></label><label><span>3</span>En una situación futura recordaré que…<textarea data-s5-note="proyecta-reflexion-3" rows="2" maxlength="350" placeholder="Escribe tu respuesta aquí…"></textarea></label></section><section class="p3-commitment"><header>${icon('flag')}<div><h4>3 · Mi próximo foco</h4><p>Selecciona un compromiso para futuros desafíos.</p></div></header>${['Revisaré primero la información disponible.','Relacionaré más de un concepto antes de decidir.','Justificaré mis decisiones con datos o especificaciones.','Verificaré el resultado antes de finalizar.'].map((item,i)=>`<label><input type="radio" name="p3-focus" value="${item}" data-p3-focus> ${item}</label>`).join('')}<label><input type="radio" name="p3-focus" value="otro" data-p3-focus> Otro compromiso</label><input type="text" data-s5-note="proyecta-foco-otro" maxlength="180" placeholder="Escribe tu compromiso…"><button type="button" data-p3-save-focus disabled>Guardar mi foco y continuar ${icon('arrow')}</button></section></aside>
      </div>
      <footer class="p3-advance-route"><header>${icon('bulb')}<div><b>Ruta de pensamiento técnico</b><small>Completaste el recorrido de este desafío.</small></div></header>${['Observa','Interpreta','Relaciona','Decide','Aplica','Verifica'].map((item,i)=>`<span>${icon('check')}<b>${i+1}</b><small>${item}</small></span>`).join('')}<aside>${icon('flag')}<div><b>¡Excelente trabajo!</b><small>Conectaste, aplicaste y reflexionaste sobre cómo mejorar.</small></div></aside></footer>
    </section>

    <form id="close-form" class="p3-section p3-synthesis-v2">
      <header class="p3-title p3-synthesis-head"><span>${mode==='proyecta'?'2':'4'}</span><em>SINTETIZA</em><div><h3>Mi síntesis del módulo</h3><p>Integra en tus propias palabras lo que aprendiste, cómo se relaciona y dónde podrías utilizarlo.</p><small>${icon('bulb')} No buscamos una respuesta perfecta. Expresa con tus propias palabras qué aprendizaje te llevas.</small></div><nav><span>${icon('check')}<b>Conecté</b></span>${icon('arrow')}<span>${icon('check')}<b>Apliqué</b></span>${icon('arrow')}<span>${icon('check')}<b>Reflexioné</b></span>${icon('arrow')}<span class="is-current"><b>Sintetizo</b></span></nav></header>
      <div class="p3-synthesis-path">
        <section class="p3-synth-card p3-synth-learn"><header><span>${icon('book')}</span><i>1</i><div><h4>¿Qué aprendizaje consideras fundamental?</h4><p>Lo más importante que aprendí en este módulo fue…</p></div></header><textarea name="reflection" minlength="20" maxlength="500" required rows="6" placeholder="Escribe aquí, con tus propias palabras…">${esc(current.state.reflection||'')}</textarea><aside>${icon('bulb')} Puedes mencionar un concepto, procedimiento o decisión técnica que ahora comprendes mejor.</aside></section>
        <section class="p3-synth-card p3-synth-connect"><header><span>${icon('link')}</span><i>2</i><div><h4>¿Qué conceptos ahora puedes relacionar?</h4><p>Recupera una relación construida en tu mapa.</p></div></header><div class="p3-concept-relation"><select data-p3-synth-concept-a required><option value="">Selecciona un concepto…</option>${concepts.map(c=>`<option>${esc(c.label)}</option>`).join('')}</select><span>${icon('link')}</span><select data-p3-synth-concept-b required><option value="">Selecciona otro concepto…</option>${concepts.map(c=>`<option>${esc(c.label)}</option>`).join('')}</select></div><label>Se relacionan porque…<textarea name="plan" minlength="20" maxlength="500" required rows="4" placeholder="Explica aquí la conexión entre ambos conceptos…">${esc(current.state.plan||'')}</textarea></label><button type="button" data-p3-action="map">${icon('book')} Volver a revisar mi mapa</button></section>
        <section class="p3-synth-card p3-synth-apply"><header><span>${icon('tool')}</span><i>3</i><div><h4>¿Dónde podrías utilizar lo aprendido?</h4><p>Piensa en un contexto técnico o profesional.</p></div></header><fieldset><legend>Selecciona un contexto:</legend><div>${['Instalación','Mantención','Diagnóstico','Revisión técnica','Otro'].map((item,i)=>`<label><input type="radio" name="synth-context" value="${item}" ${i===0?'required':''}> ${item}</label>`).join('')}</div></fieldset><label>Podría aplicar lo aprendido cuando…<textarea data-s5-note="proyecta-aplica-contexto" minlength="15" required rows="3" maxlength="500" placeholder="Describe una situación técnica o profesional…"></textarea></label><label>Lo utilizaría para…<textarea data-s5-note="proyecta-aplica-accion" minlength="15" required rows="3" maxlength="500" placeholder="Explica brevemente qué harías…"></textarea></label></section>
      </div>
      <section class="p3-synth-idea"><header><span>${icon('flag')}</span><i>4</i><div><h4>Mi aprendizaje en una idea</h4><p>Si tuvieras que resumir este módulo en una frase…</p></div></header><label>Ahora sé que… <input type="text" data-s5-note="proyecta-idea-final" minlength="10" maxlength="150" required placeholder="Completa tu idea en un máximo de 150 caracteres"><small><b data-p3-idea-count>0</b>/150</small></label></section>
      <section class="p3-synthesis-summary"><header>${icon('file')}<div><h4>Así queda tu síntesis</h4><p>Este resumen se construye con tus propias respuestas.</p></div></header><div><article><span>${icon('book')}</span><b>Aprendí</b><p data-p3-synth-summary="learn">Lo más importante fue…</p></article>${icon('arrow')}<article><span>${icon('link')}</span><b>Conecté</b><p data-p3-synth-summary="connect">Relacioné…</p></article>${icon('arrow')}<article><span>${icon('tool')}</span><b>Apliqué</b><p data-p3-synth-summary="apply">Lo usaría en…</p></article>${icon('arrow')}<article><span>${icon('flag')}</span><b>Me llevo</b><p data-p3-synth-summary="idea">Ahora sé que…</p></article></div><button type="submit" ${closed||auth.user.role==='teacher'?'disabled':''}>${closed?'Síntesis guardada':'Guardar mi síntesis y finalizar'} ${icon('arrow')}</button></section>
    </form>

    <section class="p3-section p3-route-close">
      <header class="p3-title"><span>${mode==='proyecta'?'4':'5'}</span><em>CIERRA</em><div><h3>Cierre de mi recorrido</h3><p>Así avanzaste desde los datos hasta la transferencia.</p></div></header>
      <div class="p3-route"><article><span>${icon('check')}</span><b>Analicé</b><small>Reconocí mi desempeño.</small></article><i>${icon('arrow')}</i><article><span>${icon('check')}</span><b>Comprendí</b><small>Interpreté mis resultados.</small></article><i>${icon('arrow')}</i><article><span>${icon('check')}</span><b>Conecté</b><small>Relacioné aprendizajes.</small></article><i>${icon('arrow')}</i><article><span>${icon('check')}</span><b>Transferí</b><small>Resolví una situación nueva.</small></article><i>${icon('arrow')}</i><article class="is-current"><span>5</span><b>Proyecto</b><small>Reconozco qué me llevo.</small></article></div>
      <div class="p3-can"><b>Ahora puedo…</b><ul><li>Explicar conceptos fundamentales.</li><li>Relacionarlos entre sí.</li><li>Aplicarlos en una situación TP.</li><li>Justificar y verificar decisiones.</li></ul><aside>${icon('flag')}<span><b>¡Módulo completado!</b><small>Sigue aprendiendo, sigue creciendo.</small></span></aside></div>
      <nav><button type="button" data-action="tab" data-tab="transfiere">← Volver a Transfiere</button><button type="submit" form="close-form" class="primary" ${closed||auth.user.role==='teacher'?'disabled':''}>${closed?'Módulo completado':'Finalizar mi recorrido'} ${icon('arrow')}</button></nav>
    </section>
  </div>`;
}


function proyectaGuidedBody(){
  const learnings=conectaLearnings(),closed=Boolean(current?.state?.closed),readonly=closed||auth?.user?.role==='teacher';
  const contexts=['En una actividad de mi especialidad','En otro módulo','En una práctica o taller','En una situación laboral','En un proyecto','En otra situación'];
  const focuses=learnings.map(item=>item.label).concat(['Fundamentar mis decisiones con evidencia','Trabajar con mayor autonomía']);
  const answer=(n,question,hint,key,rows)=>`<div class="az-written-question"><h4 id="pg-question-${n}">${n}.2 ${question}</h4><p>${hint}</p><label for="pg-answer-${n}"><img class="az-question-pencil" src="/static/student-write-pencil-blue.png?v=20261004-pencil-blue" alt="" aria-hidden="true">Tu respuesta</label><textarea id="pg-answer-${n}" class="az-pq-answer" data-pg-answer="${key}" aria-labelledby="pg-question-${n}" rows="${rows}" minlength="20" maxlength="1500" placeholder="Escribe tu respuesta aquí..." ${readonly?'readonly':''}></textarea></div>`;
  return `<div class="az-guided pg-board"><header class="az-guided-intro"><small>5. PROYECTA</small><h2>¿Qué aprendizaje me llevo?</h2><p>Cierra tu recorrido. Reconoce el aprendizaje más importante, piensa dónde puedes utilizarlo y define una acción concreta para seguir avanzando.</p><ol class="az-mini-route">${['Sintetiza','Proyecta','Define tu foco','Cierra'].map((title,i)=>`<li>${i+1}. ${title}<small data-pg-status="${i}">Pendiente</small></li>`).join('')}</ol><details><summary>Antes de comenzar</summary><p><b>Objetivo:</b> reconocer qué aprendizaje te llevas y cómo seguir avanzando.</p><p><b>Vas a realizar:</b> sintetizar, proyectar, definir tu foco y cerrar.</p><p><b>Al finalizar:</b> tendrás una síntesis personal y una acción concreta de mejora. Tu reflexión no se califica como correcta o incorrecta.</p></details><details><summary>Ver mi recorrido</summary><ul data-pg-journey></ul></details></header>
  ${closed?'<p class="pg-closed" role="status">Recorrido finalizado. Tus respuestas están conservadas y no se pueden modificar.</p>':''}
  <form id="close-form"><section class="pg-stage" data-pg-stage="0"><h3>1. Sintetiza — El aprendizaje que te llevas</h3><p>Selecciona el aprendizaje que consideras más importante para ti.</p><fieldset ${readonly?'disabled':''}><legend>1.1 Selecciona un aprendizaje</legend><div class="pg-choices">${learnings.map(item=>`<label><input type="radio" name="pg-learning" value="${esc(item.label)}"> ${esc(item.label)}</label>`).join('')}</div></fieldset>${answer(1,'¿Por qué este aprendizaje es importante para ti?','Explica qué comprendiste o qué puedes hacer ahora gracias a este aprendizaje.','importance',5)}<p data-pg-missing="0" role="status"></p></section>
  <section class="pg-stage" data-pg-stage="1" hidden><h3>2. Proyecta — Dónde podrías utilizarlo</h3><p>Piensa en una situación futura y selecciona el contexto que corresponda.</p><fieldset ${readonly?'disabled':''}><legend>2.1 Selecciona un contexto</legend>${contexts.map(item=>`<label><input type="radio" name="pg-context" value="${esc(item)}"> ${esc(item)}</label>`).join('')}</fieldset>${answer(2,'¿Cómo utilizarías este aprendizaje en esa situación?','Describe brevemente qué harías utilizando lo que aprendiste.','application',5)}<details><summary>¿Necesitas una pista?</summary><p>Piensa en una tarea de tu especialidad donde este aprendizaje podría ser útil.</p></details><p data-pg-missing="1" role="status"></p></section>
  <section class="pg-stage" data-pg-stage="2" hidden><h3>3. Define tu foco — Qué quieres fortalecer</h3><p>Selecciona un foco prioritario y define una acción que puedas realizar.</p><fieldset ${readonly?'disabled':''}><legend>3.1 Selecciona un aspecto</legend>${focuses.map(item=>`<label><input type="radio" name="pg-focus" value="${esc(item)}"> ${esc(item)}</label>`).join('')}</fieldset>${answer(3,'¿Qué puedes hacer para seguir mejorando?','Escribe una acción concreta para fortalecer el aspecto seleccionado. Puedes indicar cómo comprobarás tu avance.','action',4)}<p data-pg-missing="2" role="status"></p></section>
  <section class="az-verify" data-pg-stage="3" hidden><h3>4. Cierra — Mi cierre de aprendizaje</h3><p>Revisa la síntesis construida con tus propias respuestas.</p><dl class="pg-summary">${[['learning','Me llevo'],['importance','Es importante para mí porque'],['context','Puedo utilizarlo en'],['application','Así podría utilizarlo'],['focus','Quiero seguir fortaleciendo'],['action','Mi próxima acción será']].map(([key,label])=>`<dt>${label}</dt><dd data-pg-summary="${key}"></dd>`).join('')}</dl><p role="status" data-pg-ready></p>${!closed?'<p>Al finalizar se guardan la reflexión y el plan de mejora en el módulo. El cierre requiere haber entregado la evaluación.</p>':''}</section>
  <textarea name="reflection" hidden></textarea><textarea name="plan" hidden></textarea>
  <p class="az-draft-note" data-pg-save>Las respuestas se conservan como borrador en este navegador.</p><details data-pg-legacy hidden><summary>Consultar reflexión y plan anteriores</summary><div data-pg-legacy-copy></div></details>
  <nav class="pg-close-nav">${action('tab','← Revisar mi recorrido','outline','data-tab="analiza"')}<button type="submit" class="primary" data-pg-finish disabled>${closed?'Recorrido finalizado':'Finalizar mi recorrido '+icon('arrow')}</button></nav></form></div>`;
}
function proyectaFinalBody(){
  const closed=Boolean(current?.state?.closed);
  const disabled=closed||auth.user.role==='teacher';
  const savedReflection=current?.state?.reflection||'';
  let analiza='Aún no has registrado una reflexión en Analiza.';
  try{const answers=azPatternLoad();analiza=Object.values(answers).find(value=>String(value).trim())||analiza}catch(e){}
  const readDraft=name=>{try{return localStorage.getItem(s5DraftKey(name))||''}catch(e){return ''}};
  let connections=[];try{connections=JSON.parse(localStorage.getItem(s5DraftKey('map-connections'))||'[]')||[]}catch(e){}
  const concepts=connections[0]?`${connections[0].a} ↔ ${connections[0].b}`:'Tu mapa de conceptos conserva las relaciones construidas.';
  const comprende=readDraft('comprende-reflexion')||readDraft('comprende-evidencia')||'Reconociste fortalezas y aspectos por consolidar a partir de tus evidencias.';
  const transfiere=readDraft('proyecta-decide')||readDraft('proyecta-justifica')||'Aplicaste conceptos técnicos para tomar y justificar una decisión.';
  const contexts=['Instalación','Mantención','Diagnóstico','Revisión técnica','Otra situación'];
  const focuses=['Interpretar toda la información antes de decidir.','Relacionar diferentes conceptos técnicos.','Fundamentar mis decisiones utilizando evidencia.','Aplicar criterios técnicos en situaciones nuevas.','Verificar los resultados antes de finalizar.','Otro.'];
  return `<div class="pf-board">
    <header class="pf-hero"><span class="pf-number">5</span><em>PROYECTA</em><div><h2>¿Qué aprendizaje me llevo?</h2><p>Integra lo aprendido, reconoce dónde puedes utilizarlo y define qué considerarás en futuros desafíos técnicos.</p></div><aside>${icon('flag')}<span>Lo que aprendiste durante este recorrido puede ayudarte a enfrentar nuevos desafíos técnicos.</span></aside></header>
    <section class="pf-journey"><header><b>Tu recorrido</b><p>Llegaste hasta aquí utilizando tus resultados, evidencias, conexiones y decisiones.</p></header><div>${['Analicé','Comprendí','Conecté','Transferí','Proyecto'].map((label,i)=>`<span class="${i===4?'is-current':'is-done'}">${i<4?icon('check'):`<i>5</i>`}<b>${i+1} · ${label}</b></span>${i<4?icon('arrow'):''}`).join('')}</div></section>
    <section class="pf-built"><header><span>${icon('book')}</span><div><h3>Lo que construiste durante tu recorrido</h3><p>Estas evidencias provienen de tu trabajo en las pestañas anteriores.</p></div></header><div><article class="tone-blue"><b>Analiza</b><small>Identificaste</small><p>${esc(analiza)}</p></article><article class="tone-violet"><b>Comprende</b><small>Reconociste</small><p>${esc(comprende)}</p></article><article class="tone-purple"><b>Conecta</b><small>Relacionaste</small><p>${esc(concepts)}</p></article><article class="tone-green"><b>Transfiere</b><small>Aplicaste</small><p>${esc(transfiere)}</p></article></div></section>
    <form id="close-form" class="pf-form">
      <section class="pf-activity pf-synthesize"><header><span>1</span><div><em>SINTETIZA</em><h3>¿Qué aprendizaje te llevas?</h3><p>Explica con tus propias palabras cuál fue uno de los aprendizajes más importantes que construiste durante el módulo.</p></div></header><div class="pf-answer"><b>✎ TU RESPUESTA</b><label>Lo más importante que comprendí fue...<textarea name="reflection" minlength="20" maxlength="500" required rows="5" placeholder="Escribe aquí tu síntesis...">${esc(savedReflection)}</textarea><small><span data-pf-count="reflection">${savedReflection.length}</span>/500</small></label></div><button type="button" class="pf-hint" data-pf-hint aria-expanded="false">${icon('bulb')} ¿Necesitas orientación?</button><div class="pf-hint-copy" data-pf-hint-copy hidden>Puedes considerar un concepto, procedimiento, relación o criterio técnico que ahora comprendas mejor.</div><aside><b>Para lograrlo</b><ul><li>Identifica un aprendizaje concreto.</li><li>Explícalo con tus propias palabras.</li><li>Incorpora una idea técnica trabajada en el módulo.</li></ul></aside></section>
      <section class="pf-activity pf-project"><header><span>2</span><div><em>PROYECTA</em><h3>¿Dónde podrías utilizar lo aprendido?</h3><p>Selecciona un contexto técnico-profesional y explica cómo utilizarías allí uno de tus aprendizajes.</p></div></header><fieldset><legend>Selecciona un contexto</legend><div class="pf-choice-grid">${contexts.map(item=>`<label><input type="radio" name="pf-context" value="${item}" required><span>${icon(item==='Instalación'?'tool':item==='Mantención'?'check':item==='Diagnóstico'?'search':item==='Revisión técnica'?'file':'flag')}<b>${item}</b><small>Seleccionar</small></span></label>`).join('')}</div></fieldset><div class="pf-answer"><b>✎ TU RESPUESTA</b><label>¿Cómo utilizarías lo aprendido en esta situación?<textarea data-pf-projection minlength="20" maxlength="500" required rows="4" placeholder="Explica qué conocimiento utilizarías, cómo y para qué te serviría."></textarea><small><span data-pf-count="projection">0</span>/500</small></label></div></section>
      <section class="pf-activity pf-focus"><header><span>3</span><div><em>MI PRÓXIMO FOCO</em><h3>¿Qué quiero seguir fortaleciendo?</h3><p>Selecciona un aspecto que orientarás en tus futuros desafíos técnicos.</p></div></header><fieldset><legend>Elige un foco personal</legend><div class="pf-focus-list">${focuses.map(item=>`<label><input type="radio" name="pf-focus" value="${item}" required><span>${icon('check')}<b>${item}</b></span></label>`).join('')}</div></fieldset><div class="pf-answer pf-answer-short"><b>✎ TU RESPUESTA</b><label>¿Por qué elegiste este foco?<textarea data-pf-focus-reason minlength="10" maxlength="300" required rows="3" placeholder="Explica brevemente por qué quieres fortalecerlo."></textarea><small><span data-pf-count="focus">0</span>/300</small></label></div></section>
      <textarea name="plan" data-pf-plan hidden required></textarea>
      <section class="pf-summary"><header>${icon('flag')}<div><h3>Así queda mi aprendizaje</h3><p>Tu síntesis se construye automáticamente con tus respuestas.</p></div></header><div><article><b>Aprendí</b><p data-pf-summary="learn">Completa tu síntesis.</p></article>${icon('arrow')}<article><b>Puedo utilizarlo en</b><p data-pf-summary="apply">Selecciona un contexto.</p></article>${icon('arrow')}<article><b>Mi próximo foco es</b><p data-pf-summary="focus">Selecciona tu próximo foco.</p></article></div></section>
      <footer class="pf-cognitive"><div>${['Observa','Interpreta','Relaciona','Decide','Aplica','Verifica','Reflexiona'].map((item,i)=>`<span class="${i===6?'is-current':'is-done'}">${i<6?icon('check'):`<i>7</i>`}<b>${item}</b></span>${i<6?icon('arrow'):''}`).join('')}</div></footer>
      <section class="pf-complete"><header>${icon('check')}<div><h3>Recorrido completado</h3><b>${esc(current?.title||'Módulo actual')}</b></div></header><p>Analizaste tus resultados, interpretaste tus evidencias, relacionaste tus aprendizajes y los utilizaste para resolver una situación nueva. Ahora también reconoces qué aprendizaje te llevas y qué quieres seguir fortaleciendo.</p><strong>APRENDÍ → CONECTÉ → APLIQUÉ → ME PROYECTO</strong><nav><button type="button" data-pf-review>← Revisar mis respuestas</button><button type="submit" class="primary" ${disabled?'disabled':''}>${closed?'Recorrido finalizado':'✓ Finalizar mi recorrido'}</button></nav></section>
    </form>
  </div>`;
}

function transferScenario(){
  const cases=current?.content?.cases||[];
  const source=cases[cases.length-1]||{};
  const aes=current?.content?.aes||[];
  const aeIndex=Math.max(0,Math.min(aes.length-1,Number(source.ae||1)-1));
  const ae=aes[aeIndex]||{};
  const criterion=source.criterion||ae.criteria?.[0];
  const technical=typeof criterion==='string'?criterion:criterion?.text||criterion?.description||criterion?.title||ae.title||'';
  return {title:source.title||current?.title||'Situación del módulo',site:source.site||'Contexto profesional del módulo',background:source.context||current?.content?.application||'',image:source.image||'',alt:source.alt||source.caption||'Recurso técnico del caso',document:source.document||'',criterion:technical,ae:aeIndex+1,
    change:'Después de la revisión inicial, el equipo recibe una actualización de los antecedentes sin confirmar si modifica las condiciones de trabajo. Debes decidir cómo continuar antes de aplicar tu propuesta.',
    decisions:[`Contrastar la actualización con el criterio del AE ${aeIndex+1} y registrar qué condiciones se mantienen.`,`Solicitar confirmación del antecedente actualizado antes de continuar con la tarea.`,`Mantener la propuesta inicial solo después de comprobar que la actualización no cambia sus condiciones.`,`Reformular la propuesta utilizando la actualización y revisar su coherencia con el criterio del AE ${aeIndex+1}.`]};
}
function transfiereGuidedBody(){
  const scenario=transferScenario(),learnings=conectaLearnings();
  const fields=[['proyecta-justifica','3.1 ¿Por qué elegiste esta decisión?','Fundamenta tu respuesta con un dato de la situación o del recurso y el criterio técnico.','Explica por qué tomaste esta decisión...'],['transfiere-aprendizajes','3.2 ¿Cómo te ayudaron estos aprendizajes a tomar tu decisión?','Explica cómo utilizaste uno o más aprendizajes para interpretar los antecedentes y decidir.','Describe cómo utilizaste lo aprendido...']];
  return `<div class="az-guided tf-board"><header class="az-guided-intro"><small>4. TRANSFIERE</small><h2>¿Cómo utilizo lo aprendido en una situación nueva?</h2><p>Revisa la situación profesional, selecciona información, toma una decisión y explica qué aprendizajes utilizaste para fundamentarla.</p><ol class="az-mini-route">${['Explora','Decide','Justifica','Verifica'].map((name,i)=>`<li>${i+1}. ${name} <small data-tf-state="${i}">Pendiente</small></li>`).join('')}</ol><details><summary>Antes de comenzar</summary><p><b>Objetivo:</b> aplicar aprendizajes a una situación modificada del módulo.</p><p><b>Vas a utilizar:</b> antecedentes, recurso técnico y criterios del aprendizaje esperado.</p><p><b>Vas a realizar:</b> explorar, decidir, justificar y verificar.</p><p><b>Al finalizar:</b> conservarás tu decisión, justificación y aprendizajes utilizados. Es una actividad formativa, no otra evaluación final.</p></details></header>
  <section class="az-observe"><h3>1. Explora — Comprende la situación</h3><h4>${esc(scenario.title)} · actualización de antecedentes</h4><p><b>Contexto:</b> ${esc(scenario.site)}</p><p>${esc(scenario.change)}</p><details><summary>Antecedentes de la situación — Necesario</summary><p>${esc(scenario.background)}</p>${scenario.document?`<pre>${esc(scenario.document)}</pre>`:''}</details><div class="tf-mission"><b>Tu misión</b><p>Determina si los antecedentes disponibles permiten mantener, ajustar o detener tu propuesta. Fundamenta la decisión con el criterio técnico y señala lo que aún necesita confirmación.</p></div>
  ${scenario.image?`<figure class="tf-resource"><figcaption>Recurso técnico de la situación — Necesario</figcaption><div class="tf-resource-scroll"><img src="${esc(scenario.image)}" alt="${esc(scenario.alt)}" data-tf-image></div><div class="tf-zoom"><button type="button" class="outline" data-tf-zoom="in" aria-label="Ampliar recurso">${icon('search')} Ampliar</button><button type="button" class="outline" data-tf-zoom="reset">Restablecer vista</button></div></figure>`:''}
  <details><summary>Criterio técnico · AE ${scenario.ae} — Necesario</summary><p>${esc(scenario.criterion||'No hay un criterio específico disponible. Consulta el aprendizaje esperado antes de afirmar que la decisión cumple sus requerimientos.')}</p></details><details><summary>Aprendizajes de Conecta — Opcional</summary><ul data-tf-connections></ul></details><details><summary>Ver pista — Opcional</summary><p>Compara lo que sabes con lo que no está confirmado. ¿Qué dato podría cambiar tu decisión? Revisa el criterio técnico antes de continuar.</p></details>
  <h4>1.1 Identifica la información que necesitas</h4><fieldset><legend>Selecciona los recursos necesarios para decidir</legend>${[['antecedentes','Antecedentes de la situación — Necesario'],...(scenario.image?[['recurso','Recurso técnico de la situación — Necesario']]:[]),['criterio',`Criterio técnico del AE ${scenario.ae} — Necesario`],['conexiones','Mis conexiones de aprendizajes — Opcional']].map(([value,label])=>`<label><input type="checkbox" data-tf-resource="${value}"> ${esc(label)}</label>`).join('')}</fieldset><p role="status" data-tf-explore>Revisa y selecciona los recursos necesarios. Los opcionales no bloquean el avance.</p></section>
  <section class="az-identify"><h3>2. Decide — Qué harías en esta situación</h3><fieldset data-tf-decisions disabled><legend>Selecciona tu decisión</legend>${scenario.decisions.map((text,i)=>`<label><input type="radio" name="tf-decision" value="${i}"> ${'ABCD'[i]}. ${esc(text)}</label>`).join('')}</fieldset><button type="button" class="outline" data-tf-confirm disabled>Confirmar decisión</button><p role="status" data-tf-decision-feedback>Primero completa la exploración.</p></section>
  <section class="az-response"><h3>3. Justifica — Fundamenta tu decisión</h3><p>Ahora te toca a ti. Explica tu decisión utilizando información de la situación y aprendizajes del módulo.</p><blockquote data-tf-preview>Confirma primero una decisión.</blockquote><div data-tf-writing hidden><fieldset><legend>Aprendizajes que utilizaste</legend>${learnings.map(a=>`<label><input type="checkbox" data-tf-learning="${esc(a.id)}"> ${esc(a.label)}</label>`).join('')}</fieldset>${fields.map(([key,question,hint,placeholder],i)=>`<div class="az-written-question"><h4 id="tf-question-${i}">${question}</h4><p>${hint}</p><label for="tf-answer-${i}"><img class="az-question-pencil" src="/static/student-write-pencil-blue.png?v=20261004-pencil-blue" alt="" aria-hidden="true">Tu respuesta</label><textarea id="tf-answer-${i}" class="az-pq-answer" aria-labelledby="tf-question-${i}" data-s5-note="${key}" rows="6" maxlength="1500" placeholder="${placeholder}"></textarea></div>`).join('')}<p class="az-draft-note">Tu trabajo se conserva como borrador en este navegador.</p><details><summary>Consultar respuestas de la versión anterior</summary><div data-tf-legacy></div></details></div></section>
  <section class="az-verify"><h3>4. Verifica — Revisa tu fundamento</h3><p>Comprueba la coherencia entre la decisión, los datos y los criterios. Puedes volver a decidir y corregir tu respuesta.</p>${['Comprendí la situación.','Revisé los recursos necesarios.','Tomé una decisión.','Utilicé información técnica.','Relacioné la decisión con aprendizajes del módulo.','Expliqué el razonamiento con mis palabras.'].map(text=>`<label><input type="checkbox" data-tf-verify> ${text}</label>`).join('')}<p role="status" data-tf-ready>Completa tu razonamiento antes de continuar.</p><p>Una decisión está fundamentada cuando usa información pertinente, considera el criterio técnico y explica sus límites. Completar estos pasos no certifica que la propuesta sea técnicamente correcta.</p>${action('tab','← Volver a Conecta','outline','data-tab="conecta"')}${action('tab','Continuar a Proyecta '+icon('arrow'),'primary','data-tab="proyecta" data-tf-continue disabled')}</section></div>`;
}
function conectaLearnings(){
  const aes=current?.content?.aes||[];
  const items=aes.slice(0,5).map((ae,i)=>({
    id:`ae-${i+1}`,label:ae.short_title||`Aprendizaje esperado ${i+1}`,
    description:ae.summary||ae.purpose||ae.description||ae.title||'',
    official:ae.title||'',criteria:ae.criteria||[],where:`AE ${i+1} · estación 2 y situaciones integradoras del módulo`
  }));
  if(items.length===2){
    const criterion=aes[0]?.criteria?.[0];
    const text=typeof criterion==='string'?criterion:criterion?.text||criterion?.description||criterion?.title;
    if(text)items.push({id:'criterio-ae-1',label:'Aplicar el criterio técnico del AE 1',description:text,official:text,criteria:[criterion],where:'AE 1 · criterio del aprendizaje esperado'});
  }
  return items;
}
function conectaGuidedBody(){
  const learnings=conectaLearnings();
  const options=learnings.map(a=>`<option value="${esc(a.id)}">${esc(a.label)}</option>`).join('');
  const relations=['Se complementan.','El primero permite realizar el segundo.','El primero permite comprobar el segundo.','El primero depende del segundo.','Juntos permiten tomar una decisión técnica.','Existe otra relación.'];
  const questions=[['conecta-explicacion','¿Por qué se relacionan estos dos aprendizajes?','Explica qué aporta uno al otro o por qué necesitas utilizar ambos relacionados.','Explica aquí cómo se relacionan...'],['conecta-utilidad','¿Para qué te sirve utilizar estos aprendizajes juntos?','Explica qué tarea, procedimiento o decisión del módulo puedes realizar mejor al utilizar ambos.','Escribe aquí para qué sirve esta conexión...']];
  return `<div class="az-guided cn-board"><header class="az-guided-intro"><small>3. CONECTA</small><h2>¿Cómo se relaciona lo aprendido?</h2><p>Revisa los aprendizajes principales del módulo, identifica cuáles se relacionan y explica con tus palabras por qué esa conexión es importante.</p><ol class="az-mini-route"><li>1. Reconoce</li><li>2. Relaciona</li><li>3. Explica</li><li>4. Verifica</li></ol><details><summary>Antes de comenzar</summary><p><b>Objetivo:</b> reconocer relaciones entre los aprendizajes del módulo.</p><p><b>Vas a revisar:</b> aprendizajes, procedimientos y criterios técnicos.</p><p><b>Vas a realizar:</b> reconocer, relacionar, explicar y verificar.</p><p><b>Al finalizar:</b> explicarás una conexión significativa entre dos aprendizajes.</p></details></header>
  <section class="az-observe"><h3>1. Reconoce — Aprendizajes principales</h3><p>Revisa qué significa cada aprendizaje antes de relacionarlo. Todavía no necesitas escribir.</p><h4>1.1 Aprendizajes del módulo</h4><div class="cn-learning-list">${learnings.map(a=>`<article><h4>${esc(a.label)}</h4><p>${esc(a.where)}</p><details><summary>Qué significa y criterios técnicos</summary><p>${esc(a.description)}</p>${a.official!==a.description?`<p>${esc(a.official)}</p>`:''}${Array.isArray(a.criteria)?`<ul>${a.criteria.map(c=>`<li>${esc(typeof c==='string'?c:c.text||c.description||c.title||'')}</li>`).join('')}</ul>`:''}</details></article>`).join('')}</div></section>
  <section class="az-identify"><h3>2. Relaciona — Construye tu mapa</h3><p>Selecciona dos aprendizajes diferentes y un tipo de relación. En las relaciones dirigidas, el orden de los aprendizajes importa.</p><h4>1.2 Mapa de aprendizajes</h4><div class="cn-map" role="group" aria-label="Aprendizajes del mapa">${learnings.map(a=>`<button type="button" class="outline" data-cn-node="${esc(a.id)}" aria-pressed="false">${esc(a.label)}</button>`).join('')}</div><p>Puedes seleccionar dos nodos del mapa o utilizar los menús.</p><div class="cn-selects"><label>2.1 Primer aprendizaje<select data-cn-a><option value="">Selecciona un aprendizaje</option>${options}</select></label><label>2.2 Segundo aprendizaje<select data-cn-b><option value="">Selecciona un aprendizaje</option>${options}</select></label></div><fieldset><legend>2.3 Cómo se relacionan</legend>${relations.map((text,i)=>`<label><input type="radio" name="cn-relation" value="${i}"> ${text}</label>`).join('')}</fieldset><button type="button" class="outline" data-cn-check>Comprobar relación</button><p role="status" data-cn-feedback>Selecciona dos aprendizajes y una relación.</p><div class="cn-connection" data-cn-map-result aria-live="polite"></div><details><summary>Mis conexiones anteriores</summary><ul data-cn-history></ul></details></section>
  <section class="az-response"><h3>3. Explica — Por qué se relacionan</h3><p>Ahora te toca a ti. Utiliza los aprendizajes seleccionados para explicar la conexión y su utilidad.</p><p data-cn-pair>Selecciona dos aprendizajes en el paso anterior.</p><p class="az-draft-note">Tus respuestas y conexiones se guardan en este navegador.</p>${questions.map(([key,question,hint,placeholder],i)=>`<div class="az-written-question"><h4 id="cn-question-${i}">3.${i+1} ${question}</h4><p>${hint}</p><label for="cn-answer-${i}"><img class="az-question-pencil" src="/static/student-write-pencil-blue.png?v=20261004-pencil-blue" alt="" aria-hidden="true">Tu respuesta</label><textarea id="cn-answer-${i}" aria-labelledby="cn-question-${i}" class="az-pq-answer" data-s5-note="${key}" rows="5" maxlength="1000" placeholder="${placeholder}"></textarea></div>`).join('')}</section>
  <section class="az-verify"><h3>4. Verifica — Una conexión con sentido</h3><p>Revisa la relación y tus explicaciones. Esta comprobación no certifica su corrección técnica.</p>${['Seleccioné dos aprendizajes relacionados.','Identifiqué cómo se relacionan.','Expliqué la conexión con mis palabras.','Expliqué para qué sirve utilizar ambos juntos.'].map(text=>`<label><input type="checkbox" data-cn-verify> ${text}</label>`).join('')}<p role="status" data-cn-ready>Completa la conexión, las dos respuestas y la verificación.</p>${action('tab','← Volver a Comprende','outline','data-tab="comprende"')}${action('tab','Continuar a Transfiere '+icon('arrow'),'primary','data-tab="transfiere" data-cn-continue disabled')}</section></div>`;
}
function pedagogicalTabBody(mode){
  let html=fbProyectaBodyV2(mode);
  if(mode==='conecta')html=html
    .replace('Construye tu mapa de aprendizaje relacionando los conceptos principales del módulo.','Construye un mapa relacionando los conceptos principales del módulo. En cada conexión, explica qué relación existe entre ellos.')
    .replace('<h4>Explica tu conexión</h4><p>Selecciona dos conceptos y explica qué aporta uno al otro.</p>','<h4>¿Por qué relacionaste estos dos conceptos?</h4><p>Explica qué aporta un concepto al otro o en qué situación necesitas utilizarlos juntos.</p>')
    .replace('Cada conexión te acerca a resolver desafíos reales.','Construiste relaciones entre tus aprendizajes. Ahora utiliza esas relaciones para enfrentar una situación nueva.');
  if(mode==='transfiere')html=html
    .replace('Ahora utiliza las conexiones que construiste para analizar y resolver un nuevo desafío técnico.','Analiza esta nueva situación utilizando lo aprendido durante el módulo. Identifica la información relevante, toma una decisión, justifícala y explica cómo comprobarías que es adecuada.')
    .replace('Cada conexión te acerca a resolver desafíos reales.','Utilizaste lo aprendido frente a una situación nueva. Ahora reconoce qué aprendizaje te llevas y dónde podría volver a servirte.');
  return html;
}

function feedbackBody(viewTab){
  const t=viewTab||'analiza';
  if(t==='conecta')return conectaGuidedBody();
  if(t==='transfiere')return transfiereGuidedBody();
  if(t==='proyecta'||t==='plan')return proyectaGuidedBody();
  if(t==='comprende'||t==='feedback')return fbComprendeBodyV3();
  return analizaDash();
}

function feedbackPanel(){
  let viewTab=tab||'analiza';
  if(viewTab==='results')viewTab='analiza';
  if(viewTab==='feedback')viewTab='comprende';
  if(viewTab==='plan')viewTab='proyecta';
  const instructions={
    analiza:{action:'Compara tus resultados e identifica una fortaleza y una necesidad.',object:'Tus resultados por AE y las evidencias registradas.',start:'Comienza por el logro general y contrástalo con el detalle por AE.',resource:'Resultados reales del módulo, evidencias y evolución.',response:'Una fortaleza y un aspecto por reforzar.',purpose:'Interpretar el desempeño sin confundir participación con calificación.',completion:'Terminas cuando nombras ambos aspectos usando un dato de la pantalla.'},
    comprende:{action:'Explica qué significan tus resultados y qué error necesitas corregir.',object:'La retroalimentación y tus respuestas evaluadas.',start:'Abre primero un ítem por reforzar y compara tu decisión con la explicación.',resource:'Correcciones automáticas y comentario docente cuando esté disponible.',response:'Una explicación del error y una acción de corrección.',purpose:'Comprender el razonamiento, no memorizar la alternativa.',completion:'Terminas cuando la acción propuesta puede comprobarse.'},
    conecta:{action:'Relaciona conceptos y explica cada conexión.',object:'Los conceptos técnicos trabajados en el módulo.',start:'Selecciona dos conceptos que necesites usar juntos en una tarea.',resource:'Mapa de conceptos y evidencias previas.',response:'Conexiones acompañadas de una explicación.',purpose:'Organizar lo aprendido para recuperarlo en nuevos contextos.',completion:'Terminas cuando cada conexión tiene una razón técnica.'},
    transfiere:{action:'Resuelve una situación nueva y justifica cómo verificarías tu decisión.',object:'El desafío técnico presentado.',start:'Identifica datos disponibles, criterio aplicable y dato pendiente.',resource:'Caso de transferencia y aprendizajes del módulo.',response:'Decisión, justificación y verificación.',purpose:'Transferir lo aprendido a un contexto diferente.',completion:'Terminas cuando la decisión usa evidencia y declara cómo comprobarla.'},
    proyecta:{action:'Sintetiza tu aprendizaje y define un próximo foco.',object:'Tu recorrido y las evidencias construidas.',start:'Recupera una fortaleza y un aspecto por reforzar de las etapas anteriores.',resource:'Síntesis del recorrido y respuestas guardadas.',response:'Aprendizaje principal, contexto de uso y foco personal.',purpose:'Cerrar el módulo con autonomía y una acción futura concreta.',completion:'Terminas cuando completas los tres productos y finalizas el recorrido.'}
  };
  const activeStage={
    analiza:{number:1,title:'Analiza',summary:'Estas son las características y orientaciones de la pestaña Analiza.',icon:'chart',tone:'blue'},
    comprende:{number:2,title:'Comprende',summary:'Estas son las características y orientaciones de la pestaña Comprende.',icon:'search',tone:'violet'},
    conecta:{number:3,title:'Conecta',summary:'Estas son las características y orientaciones de la pestaña Conecta.',icon:'link',tone:'purple'},
    transfiere:{number:4,title:'Transfiere',summary:'Estas son las características y orientaciones de la pestaña Transfiere.',icon:'tool',tone:'green'},
    proyecta:{number:5,title:'Proyecta',summary:'Estas son las características y orientaciones de la pestaña Proyecta.',icon:'flag',tone:'orange'}
  }[viewTab];
  const stageExplanation=`<section class="s5-tab-explanation tone-${activeStage.tone}" aria-labelledby="s5-tab-explanation-title"><div class="s5-tab-link">${icon('arrow')}<span><small>PESTAÑA ${activeStage.number} SELECCIONADA</small><b>${activeStage.title} → definición y actividad</b></span></div><header><span aria-hidden="true">${icon(activeStage.icon)}</span><div><small>CARACTERÍSTICAS DE LA PESTAÑA</small><h2 id="s5-tab-explanation-title">${activeStage.title}</h2><p>${activeStage.summary}</p></div></header>${typeof instructionContract==='function'?instructionContract({instruction:instructions[viewTab]}):''}</section>`;
  return workZone(`${analizaTitle()}${analizaSteps(viewTab)}${feedbackDemoPanel()}<div class="az-summary">${feedbackBody(viewTab)}</div>`,'work-zone-s5');
}

function feedbackBottom(){
  const done=Boolean(current.state.closed);
  const t=tab||'analiza';
  if(t==='analiza'||t==='results')return `<a class="outline" href="#module/${current.id}/4">← Estación anterior</a>`;
  if(t==='comprende'||t==='feedback')return '';
  if(t==='conecta')return '';
  if(t==='transfiere')return '';
  if(t==='proyecta'||t==='plan')return '';
  const route={analiza:['module','comprende','Continuar a Comprende'],comprende:['analiza','conecta','Continuar a Conecta'],conecta:['comprende','transfiere','Continuar a Transfiere'],transfiere:['conecta','proyecta','Continuar a Proyecta']}[t];
  if(route){
    const back=route[0]==='module'?`<a class="outline" href="#module/${current.id}/4">← Estación anterior</a>`:action('tab',`← Volver a ${route[0].charAt(0).toUpperCase()+route[0].slice(1)}`,'outline',`data-tab="${route[0]}"`);
    return `${back}${action('tab',`${route[2]} ${icon('arrow')}`,'primary',`data-tab="${route[1]}"`)}`;
  }
  return `${action('tab','← Volver a Transfiere','outline','data-tab="transfiere"')}${action('complete-module',done?'Módulo completado':'Finalizar mi recorrido '+icon('arrow'),'primary feedback-close',done?'disabled':'')}`;
}

/* az-pattern-answers-v45 */
function azPatternKey(){
  try{
    const mid=(typeof current!=='undefined'&&current&&current.id!=null)?current.id:'x';
    const uid=(typeof auth!=='undefined'&&auth&&auth.user&&auth.user.id)?auth.user.id:'anon';
    return `aula-tp-az-pattern:${uid}:${mid}`;
  }catch(e){return 'aula-tp-az-pattern:anon';}
}
function azPatternLoad(){
  try{return JSON.parse(localStorage.getItem(azPatternKey())||'{}')||{};}catch(e){return {};}
}
function azPatternSave(map){
  try{localStorage.setItem(azPatternKey(),JSON.stringify(map||{}));}catch(e){}
}
function bindAzPatternAnswers(){
  const box=document.querySelector('.az-pattern');
  if(!box)return;
  const saved=azPatternLoad();
  const board=document.querySelector('.az-guided');
  const checks=[...(board?.querySelectorAll('[data-az-verify]')||[])];
  const update=()=>{
    const answered=[...box.querySelectorAll('.az-pq-answer')].every(el=>el.value.trim().length>0);
    const ready=answered&&checks.every(el=>el.checked);
    const button=board?.querySelector('.az-continue');
    if(button)button.disabled=!ready;
    const status=board?.querySelector('[data-az-ready]');
    if(status)status.textContent=ready?'Revisión completa. Puedes continuar a Comprende.':'Completa las tres respuestas y revisa la lista para continuar.';
  };
  checks.forEach(el=>el.addEventListener('change',update));
  box.querySelectorAll('.az-pq-answer').forEach(el=>{
    const k=el.getAttribute('data-az-pq');
    if(saved[k])el.value=saved[k];
    el.addEventListener('input',()=>{
      const m=azPatternLoad();
      m[k]=el.value;
      azPatternSave(m);
      checks.forEach(check=>{check.checked=false;});
      update();
    });
  });
  update();
}

function bindFeedback(){
  bindAzPatternAnswers();
  bindS5Hints();
  bindS5ReflectionDrafts();
  bindS5PlanBuilder();
  bindComprendeV2();
  bindProyectaV2();
  bindProyectaFinal();
  const bottom=document.querySelector('.bottom-nav');
  if(bottom)bottom.innerHTML=feedbackBottom();
  bindS5SupportPanel();
  bindComprendeGuided();
  bindConectaGuided();
  bindTransfiereGuided();
  bindProyectaGuided();
}
function bindProyectaFinal(){
  const board=document.querySelector('.pf-board');
  if(!board)return;
  const reflection=board.querySelector('[name="reflection"]');
  const projection=board.querySelector('[data-pf-projection]');
  const focusReason=board.querySelector('[data-pf-focus-reason]');
  const plan=board.querySelector('[data-pf-plan]');
  const contexts=[...board.querySelectorAll('[name="pf-context"]')];
  const focuses=[...board.querySelectorAll('[name="pf-focus"]')];
  const load=(field,key)=>{try{const value=localStorage.getItem(s5DraftKey(key))||'';if(value)field.value=value}catch(e){}};
  load(projection,'proyecta-final-aplicacion');load(focusReason,'proyecta-final-foco-razon');
  try{const value=localStorage.getItem(s5DraftKey('proyecta-final-contexto'));const input=contexts.find(item=>item.value===value);if(input)input.checked=true}catch(e){}
  try{const value=localStorage.getItem(s5DraftKey('proyecta-final-foco'));const input=focuses.find(item=>item.value===value);if(input)input.checked=true}catch(e){}
  const update=()=>{
    const context=contexts.find(item=>item.checked)?.value||'';
    const focus=focuses.find(item=>item.checked)?.value||'';
    const values={learn:reflection?.value.trim()||'Completa tu síntesis.',apply:context?`${context}: ${projection?.value.trim()||'explica cómo lo utilizarías'}`:'Selecciona un contexto.',focus:focus||(focusReason?.value.trim()||'Selecciona tu próximo foco.')};
    Object.entries(values).forEach(([key,value])=>{const target=board.querySelector(`[data-pf-summary="${key}"]`);if(target)target.textContent=value});
    if(plan)plan.value=`Contexto: ${context}. Aplicación: ${projection?.value.trim()||''}. Próximo foco: ${focus}. Fundamentación: ${focusReason?.value.trim()||''}`;
    const counts={reflection:reflection?.value.length||0,projection:projection?.value.length||0,focus:focusReason?.value.length||0};
    Object.entries(counts).forEach(([key,value])=>{const target=board.querySelector(`[data-pf-count="${key}"]`);if(target)target.textContent=String(value)});
  };
  [reflection,projection,focusReason].forEach(field=>field?.addEventListener('input',()=>{try{if(field===projection)localStorage.setItem(s5DraftKey('proyecta-final-aplicacion'),field.value);if(field===focusReason)localStorage.setItem(s5DraftKey('proyecta-final-foco-razon'),field.value)}catch(e){}update()}));
  contexts.forEach(input=>input.addEventListener('change',()=>{try{localStorage.setItem(s5DraftKey('proyecta-final-contexto'),input.value)}catch(e){}update()}));
  focuses.forEach(input=>input.addEventListener('change',()=>{try{localStorage.setItem(s5DraftKey('proyecta-final-foco'),input.value)}catch(e){}update()}));
  board.querySelector('[data-pf-hint]')?.addEventListener('click',event=>{const copy=board.querySelector('[data-pf-hint-copy]'),open=event.currentTarget.getAttribute('aria-expanded')==='true';event.currentTarget.setAttribute('aria-expanded',String(!open));if(copy)copy.hidden=open});
  board.querySelector('[data-pf-review]')?.addEventListener('click',()=>board.querySelector('.pf-synthesize')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
  update();
}
function bindProyectaV2(){
  const board=document.querySelector('.p3-board');
  if(!board)return;
  let concepts=[];
  try{concepts=JSON.parse(board.dataset.p3Concepts||'[]')}catch(e){}
  const panel=board.querySelector('.p3-concept-panel');
  const explored=new Set();
  const renderConcept=id=>{
    const c=concepts.find(x=>x.id===id)||concepts[0];
    if(!c||!panel)return;
    board.querySelectorAll('[data-p3-concept]').forEach(btn=>btn.classList.toggle('is-selected',btn.dataset.p3Concept===c.id));
    explored.add(c.id);
    const exploredCount=board.querySelector('[data-p3-explored]');
    const connectedCount=board.querySelector('[data-p3-connected]');
    const exploredProgress=board.querySelector('.p3-map-progress>div:first-child progress');
    const connectedProgress=board.querySelector('.p3-map-progress>div:last-child progress');
    if(exploredCount)exploredCount.textContent=`${explored.size}/5`;
    if(connectedCount)connectedCount.textContent=`${Math.max(0,explored.size-1)}/4`;
    if(exploredProgress)exploredProgress.value=explored.size;
    if(connectedProgress)connectedProgress.value=Math.max(0,explored.size-1);
    panel.querySelector('h3').textContent=c.label;
    const featureCopy=panel.querySelector('.p3-concept-feature p');
    if(featureCopy)featureCopy.textContent=c.description;
    const dd=panel.querySelectorAll('dd');
    if(dd[0])dd[0].textContent=`Se relaciona con los demás conceptos porque permite integrar ${c.label.toLowerCase()} en una decisión fundamentada.`;
    if(dd[1])dd[1].textContent=c.learned;
    if(dd[2])dd[2].textContent=`En un contexto técnico-profesional puede utilizarse para ${c.use}.`;
  };
  const connectA=board.querySelector('[data-p3-connect-a]');
  const connectB=board.querySelector('[data-p3-connect-b]');
  const connectReason=board.querySelector('[data-p3-connect-reason]');
  const connectSave=board.querySelector('[data-p3-connect-save]');
  const connectFeedback=board.querySelector('[data-p3-connect-feedback]');
  const connectionKey=s5DraftKey('map-connections');
  let connections=[];
  try{connections=JSON.parse(localStorage.getItem(connectionKey)||'[]')||[]}catch(e){connections=[]}
  const refreshConnectionProgress=()=>{
    const count=Math.min(4,connections.length);
    const target=board.querySelector('[data-p3-connected]');
    const progress=board.querySelector('.p3-map-progress>div:last-child progress');
    if(target)target.textContent=`${count}/4`;
    if(progress)progress.value=count;
  };
  const validateConnection=()=>{
    if(connectSave)connectSave.disabled=!(connectA?.value&&connectB?.value&&connectA.value!==connectB.value&&(connectReason?.value.trim().length||0)>=20);
  };
  const chosenConcepts=[];
  board.querySelectorAll('[data-p3-concept]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.p3Concept;
    renderConcept(id);
    if(!chosenConcepts.includes(id))chosenConcepts.push(id);
    if(chosenConcepts.length>2)chosenConcepts.shift();
    if(connectA)connectA.value=chosenConcepts[0]||'';
    if(connectB)connectB.value=chosenConcepts[1]||'';
    validateConnection();
  }));
  [connectA,connectB].forEach(el=>el?.addEventListener('change',()=>{
    if(connectB?.value&&connectB.value===connectA?.value){connectB.value='';toast('Selecciona dos conceptos diferentes.');}
    validateConnection();
  }));
  connectReason?.addEventListener('input',validateConnection);
  connectSave?.addEventListener('click',()=>{
    const a=concepts.find(c=>c.id===connectA?.value),b=concepts.find(c=>c.id===connectB?.value);
    if(!a||!b)return;
    const item={a:a.id,b:b.id,reason:connectReason.value.trim(),at:Date.now()};
    const same=x=>(x.a===item.a&&x.b===item.b)||(x.a===item.b&&x.b===item.a);
    const existing=connections.findIndex(same);
    if(existing>=0)connections[existing]=item;else connections.push(item);
    connections=connections.slice(-4);
    try{localStorage.setItem(connectionKey,JSON.stringify(connections))}catch(e){}
    refreshConnectionProgress();
    if(connectFeedback){
      connectFeedback.hidden=false;
      connectFeedback.classList.add('is-success');
      connectFeedback.textContent=`Conexión lograda: relacionaste “${a.label}” con “${b.label}” y explicaste qué aporta uno al otro.`;
    }
    toast('Conexión guardada en tu mapa.');
  });
  refreshConnectionProgress();
  renderConcept(concepts[1]?.id||concepts[0]?.id);
  board.querySelector('[data-p3-evidence]')?.addEventListener('click',()=>{
    if(board.classList.contains('p3-view-conecta')){tab='transfiere';renderModule(5);return;}
    board.querySelector('.p3-transfer')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });
  const resolution=board.querySelector('.p3-resolution');
  const picked=()=>[...board.querySelectorAll('[data-p3-pick]:checked')];
  const setStepValidity=(step,valid)=>{
    const button=board.querySelector(`[data-p3-step-panel="${step}"] .p3-step-next`);
    if(button)button.disabled=!valid;
  };
  const showStep=step=>{
    if(!resolution)return;
    resolution.dataset.p3Step=String(step);
    board.querySelectorAll('[data-p3-step-panel]').forEach(panel=>{
      const active=Number(panel.dataset.p3StepPanel)===step;
      panel.hidden=!active;panel.classList.toggle('is-active',active);
    });
    board.querySelectorAll('[data-p3-step-button]').forEach(button=>{
      const n=Number(button.dataset.p3StepButton);
      button.classList.toggle('is-active',n===step);
      button.classList.toggle('is-done',n<step&&!button.disabled);
      const small=button.querySelector('small');
      if(small)small.textContent=n===step?'Paso activo':n<step&&!button.disabled?'Completado':'Pendiente';
    });
    const route=board.querySelectorAll('.p3-thinking-route article');
    const activeRoute=Math.min(5,step+2);
    route.forEach((item,i)=>{item.classList.toggle('is-done',i<activeRoute);item.classList.toggle('is-current',i===activeRoute);});
  };
  const unlockAndShow=step=>{
    const button=board.querySelector(`[data-p3-step-button="${step}"]`);
    if(button)button.disabled=false;
    showStep(step);
    board.querySelector('.p3-transfer')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  };
  board.querySelectorAll('[data-p3-step-button]').forEach(button=>button.addEventListener('click',()=>{if(!button.disabled)showStep(Number(button.dataset.p3StepButton))}));
  board.querySelectorAll('[data-p3-pick]').forEach(box=>box.addEventListener('change',()=>{
    const checked=picked();
    if(checked.length>3){box.checked=false;toast('Selecciona un máximo de tres conceptos para transferir a la situación.');}
    setStepValidity(1,picked().length>=2);
  }));
  board.querySelector('[data-p3-next="2"]')?.addEventListener('click',()=>{
    const labels=picked().map(input=>input.value);
    const using=board.querySelector('[data-p3-using]');
    if(using)using.textContent=labels.join(' + ');
    unlockAndShow(2);
  });
  const decision=board.querySelector('[data-s5-note="proyecta-decide"]');
  const evidencePicks=()=>[...board.querySelectorAll('[data-p3-evidence-pick]:checked')];
  const validateDecision=()=>setStepValidity(2,(decision?.value.trim().length||0)>=20&&evidencePicks().length>0);
  decision?.addEventListener('input',validateDecision);
  board.querySelectorAll('[data-p3-evidence-pick]').forEach(box=>box.addEventListener('change',validateDecision));
  board.querySelector('[data-p3-next="3"]')?.addEventListener('click',()=>{
    const preview=board.querySelector('[data-p3-decision-preview]');
    if(preview)preview.textContent=decision?.value.trim()||'';
    unlockAndShow(3);
  });
  const justify=board.querySelector('[data-s5-note="proyecta-justifica"]');
  const justifyConcept=board.querySelector('[data-p3-justify-concept]');
  const justifyEvidence=board.querySelector('[data-s5-note="proyecta-evidencia"]');
  const validateJustification=()=>setStepValidity(3,(justify?.value.trim().length||0)>=20&&Boolean(justifyConcept?.value)&&(justifyEvidence?.value.trim().length||0)>=10);
  [justify,justifyConcept,justifyEvidence].forEach(control=>control?.addEventListener(control.tagName==='SELECT'?'change':'input',validateJustification));
  board.querySelector('[data-p3-next="4"]')?.addEventListener('click',()=>unlockAndShow(4));
  const verify=board.querySelector('[data-s5-note="proyecta-verifica"]');
  const verifyPicks=()=>[...board.querySelectorAll('[data-p3-verify-pick]:checked')];
  const validateVerification=()=>setStepValidity(4,(verify?.value.trim().length||0)>=20&&verifyPicks().length>0);
  verify?.addEventListener('input',validateVerification);
  board.querySelectorAll('[data-p3-verify-pick]').forEach(box=>box.addEventListener('change',validateVerification));
  board.querySelector('[data-p3-finish]')?.addEventListener('click',()=>{
    board.querySelectorAll('[data-p3-step-panel]').forEach(panel=>panel.hidden=true);
    const summary=board.querySelector('[data-p3-summary]');
    if(summary)summary.hidden=false;
    const summaries={
      concepts:picked().map(input=>input.value).join(' + '),
      decision:decision?.value.trim()||'',
      justify:`${justifyConcept?.value||''}: ${justify?.value.trim()||''}`,
      verify:`${verifyPicks().map(input=>input.value).join(', ')}. ${verify?.value.trim()||''}`
    };
    Object.entries(summaries).forEach(([key,value])=>{const target=board.querySelector(`[data-p3-summary-${key}]`);if(target)target.textContent=value});
    const finalButton=board.querySelector('[data-p3-step-button="4"]');
    if(finalButton){finalButton.classList.remove('is-active');finalButton.classList.add('is-done');const small=finalButton.querySelector('small');if(small)small.textContent='Completado'}
    board.querySelectorAll('.p3-thinking-route article').forEach(item=>{item.classList.add('is-done');item.classList.remove('is-current')});
    refreshAdvance();
  });
  const refreshAdvance=()=>{
    const conceptLabels=picked().map(input=>input.value);
    const evidenceLabels=evidencePicks().map(input=>input.value);
    const verifyLabels=verifyPicks().map(input=>input.value);
    const decisionText=decision?.value.trim()||'';
    const justifyText=justify?.value.trim()||'';
    const evidenceText=justifyEvidence?.value.trim()||'';
    const reasoning=[
      conceptLabels.length?`Relacionaste ${conceptLabels.join(', ')}.`:'Relacionaste conceptos de tu mapa.',
      decisionText||'Tomaste una decisión frente al caso.',
      justifyText||'Explicaste tu decisión utilizando conceptos del módulo.',
      verifyLabels.length?`Revisaste ${verifyLabels.join(', ')}.`:'Definiste criterios para comprobar tu propuesta.'
    ];
    reasoning.forEach((text,i)=>{const target=board.querySelector(`[data-p3-reasoning="${i+1}"]`);if(target)target.textContent=text});
    const conceptTarget=board.querySelector('[data-p3-advance-concepts]');
    if(conceptTarget)conceptTarget.innerHTML=conceptLabels.length?conceptLabels.map(label=>`<span>${esc(label)}</span>`).join(''):'<span>Completa Identifica para ver tus conceptos.</span>';
    const decisionTarget=board.querySelector('[data-p3-advance-decision]');
    if(decisionTarget)decisionTarget.textContent=decisionText||'Completa Decide para recuperar tu respuesta.';
    const evidenceTarget=board.querySelector('[data-p3-advance-evidence]');
    if(evidenceTarget)evidenceTarget.textContent=evidenceText||justifyText||evidenceLabels.join(', ')||'Completa Justifica para recuperar tu evidencia.';
    const focusBefore=board.querySelector('[data-p3-focus-before]');
    if(focusBefore)focusBefore.textContent=decisionText?`“${decisionText}”`:'“Revisaría las especificaciones.”';
    const focusAfter=board.querySelector('[data-p3-focus-after]');
    if(focusAfter)focusAfter.textContent=decisionText&&evidenceText?`“${decisionText} porque ${evidenceText.charAt(0).toLowerCase()+evidenceText.slice(1)}”`:'“Revisaría las especificaciones porque contienen los requerimientos técnicos para verificar el proyecto.”';
  };
  [decision,justify,justifyEvidence,verify].forEach(control=>control?.addEventListener('input',refreshAdvance));
  board.querySelectorAll('[data-p3-pick],[data-p3-evidence-pick],[data-p3-verify-pick]').forEach(control=>control.addEventListener('change',refreshAdvance));
  const reflectionFields=[...board.querySelectorAll('[data-s5-note^="proyecta-reflexion-"]')];
  const focusOptions=[...board.querySelectorAll('[data-p3-focus]')];
  const customFocus=board.querySelector('[data-s5-note="proyecta-foco-otro"]');
  const saveFocus=board.querySelector('[data-p3-save-focus]');
  const validateFocus=()=>{
    const chosen=focusOptions.find(input=>input.checked);
    const reflectionReady=reflectionFields.every(field=>field.value.trim().length>=10);
    const focusReady=Boolean(chosen)&&(chosen?.value!=='otro'||(customFocus?.value.trim().length||0)>=8);
    if(saveFocus)saveFocus.disabled=!(reflectionReady&&focusReady);
  };
  reflectionFields.forEach(field=>field.addEventListener('input',validateFocus));
  focusOptions.forEach(input=>input.addEventListener('change',()=>{if(customFocus)customFocus.disabled=input.checked&&input.value!=='otro';validateFocus()}));
  customFocus?.addEventListener('input',validateFocus);
  saveFocus?.addEventListener('click',()=>{toast('Tu reflexión y próximo foco quedaron guardados.');board.querySelector('.p3-synthesis-v2')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})});
  const synthReflection=board.querySelector('#close-form [name="reflection"]');
  const synthPlan=board.querySelector('#close-form [name="plan"]');
  const synthConceptA=board.querySelector('[data-p3-synth-concept-a]');
  const synthConceptB=board.querySelector('[data-p3-synth-concept-b]');
  const synthContextFields=[...board.querySelectorAll('[name="synth-context"]')];
  const synthApplyContext=board.querySelector('[data-s5-note="proyecta-aplica-contexto"]');
  const synthApplyAction=board.querySelector('[data-s5-note="proyecta-aplica-accion"]');
  const synthIdea=board.querySelector('[data-s5-note="proyecta-idea-final"]');
  const updateSynthesis=()=>{
    const context=synthContextFields.find(input=>input.checked)?.value||'';
    const values={
      learn:synthReflection?.value.trim()||'Lo más importante fue…',
      connect:synthConceptA?.value&&synthConceptB?.value?`${synthConceptA.value} ↔ ${synthConceptB.value}`:(synthPlan?.value.trim()||'Relacioné…'),
      apply:context?`${context}: ${synthApplyContext?.value.trim()||'una situación técnica'}`:'Lo usaría en…',
      idea:synthIdea?.value.trim()?`Ahora sé que ${synthIdea.value.trim()}`:'Ahora sé que…'
    };
    Object.entries(values).forEach(([key,value])=>{const target=board.querySelector(`[data-p3-synth-summary="${key}"]`);if(target)target.textContent=value});
    const count=board.querySelector('[data-p3-idea-count]');if(count)count.textContent=String(synthIdea?.value.length||0);
  };
  [synthReflection,synthPlan,synthConceptA,synthConceptB,synthApplyContext,synthApplyAction,synthIdea].forEach(control=>control?.addEventListener(control.tagName==='SELECT'?'change':'input',updateSynthesis));
  synthContextFields.forEach(input=>input.addEventListener('change',updateSynthesis));
  synthConceptB?.addEventListener('change',()=>{if(synthConceptA?.value&&synthConceptB.value===synthConceptA.value){synthConceptB.value='';toast('Selecciona dos conceptos distintos para construir la relación.')}updateSynthesis()});
  updateSynthesis();
  refreshAdvance();
  validateFocus();
  showStep(1);
  board.querySelectorAll('[data-p3-action]').forEach(btn=>btn.addEventListener('click',()=>{
    const action=btn.dataset.p3Action;
    if(action==='map'&&!board.classList.contains('p3-view-conecta')){tab='conecta';renderModule(5);return;}
    if(action==='map')board.querySelector('.p3-map-section')?.scrollIntoView({behavior:'smooth',block:'start'});
    if(action==='evidence')board.querySelector('.p3-transfer')?.scrollIntoView({behavior:'smooth',block:'start'});
    if(action==='practice'&&typeof tool==='function')tool('practice');
  }));
}
function bindProyectaGuided(){
  const board=document.querySelector('.pg-board');if(!board)return;
  const form=board.querySelector('#close-form'),closed=Boolean(current.state.closed),readonly=closed||auth?.user?.role==='teacher';
  const key=s5DraftKey('proyecta-cierre-v2');
  let draft={};try{draft=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){}
  const reflection=current.state.reflection||'',plan=current.state.plan||'';
  const divider='\n\n';
    const headings=['Me llevo:','Es importante para mí porque:','Puedo utilizarlo en:','Así podría utilizarlo:','Quiero seguir fortaleciendo:','Mi próxima acción será:'];
    const take=(text,prefix)=>{const start=text.startsWith(prefix)?0:text.indexOf(divider+prefix);if(start<0)return '';const offset=start+(start===0?0:divider.length)+prefix.length;const ends=headings.filter(heading=>heading!==prefix).map(heading=>text.indexOf(divider+heading,offset)).filter(index=>index>=0);return text.slice(offset,ends.length?Math.min(...ends):undefined).trim();};
  const final={learning:take(reflection,'Me llevo:'),importance:take(reflection,'Es importante para mí porque:'),context:take(plan,'Puedo utilizarlo en:'),application:take(plan,'Así podría utilizarlo:'),focus:take(plan,'Quiero seguir fortaleciendo:'),action:take(plan,'Mi próxima acción será:')};
  if(final.learning)draft=closed?final:{...final,...draft};
  if(!draft.importance){try{draft.importance=reflection||localStorage.getItem(s5DraftKey('proyecta-final-importancia'))||'';}catch(_){}}
  if(!draft.application){try{draft.application=localStorage.getItem(s5DraftKey('proyecta-final-aplicacion'))||'';}catch(_){}}
  const inputs={importance:board.querySelector('[data-pg-answer="importance"]'),application:board.querySelector('[data-pg-answer="application"]'),action:board.querySelector('[data-pg-answer="action"]')};
  Object.entries(inputs).forEach(([name,input])=>input.value=draft[name]||'');
  const radios={learning:[...board.querySelectorAll('[name="pg-learning"]')],context:[...board.querySelectorAll('[name="pg-context"]')],focus:[...board.querySelectorAll('[name="pg-focus"]')]};
  Object.entries(radios).forEach(([name,list])=>{const input=list.find(item=>item.value===draft[name]);if(input)input.checked=true;});
  const values=()=>({learning:radios.learning.find(input=>input.checked)?.value||'',context:radios.context.find(input=>input.checked)?.value||'',focus:radios.focus.find(input=>input.checked)?.value||'',importance:inputs.importance.value.trim(),application:inputs.application.value.trim(),action:inputs.action.value.trim()});
  const update=()=>{
    const data=values(),done=[Boolean(data.learning&&data.importance.length>=20),Boolean(data.context&&data.application.length>=20),Boolean(data.focus&&data.action.length>=20)];
    const ready=done.every(Boolean),prefixes=['Sintetiza','Proyecta','Define tu foco'];
    board.querySelectorAll('[data-pg-stage]').forEach(section=>{const i=Number(section.dataset.pgStage);section.hidden=!closed&&i>0&&!done.slice(0,i).every(Boolean);});
    [...done,ready].forEach((complete,i)=>{board.querySelector(`[data-pg-status="${i}"]`).textContent=complete?'Completado':i===0||done.slice(0,i).every(Boolean)?'En curso':'Pendiente';});
    done.forEach((complete,i)=>{board.querySelector(`[data-pg-missing="${i}"]`).textContent=complete?`Paso ${i+1} completado.`:`Para completar ${prefixes[i]}: selecciona una opción y escribe al menos 20 caracteres en tu respuesta.`;});
    Object.entries(data).forEach(([name,value])=>{board.querySelector(`[data-pg-summary="${name}"]`).textContent=value||'Pendiente';});
    form.elements.reflection.value=`Me llevo: ${data.learning}${divider}Es importante para mí porque:\n${data.importance}`;
    form.elements.plan.value=`Puedo utilizarlo en: ${data.context}${divider}Así podría utilizarlo:\n${data.application}${divider}Quiero seguir fortaleciendo: ${data.focus}${divider}Mi próxima acción será:\n${data.action}`;
    board.querySelector('[data-pg-finish]').disabled=readonly||!ready||!current.state.exam;
    board.querySelector('[data-pg-ready]').textContent=closed?'Recorrido finalizado. Tu reflexión y plan están guardados.':ready?'Síntesis completa. Revisa tus respuestas antes de finalizar.':'Completa las tres actividades antes de finalizar.';
    if(!readonly)try{localStorage.setItem(key,JSON.stringify(data));}catch(_){board.querySelector('[data-pg-save]').textContent='No se pudo guardar el borrador en este navegador. El cierre final lo registra en el módulo.';}
  };
  Object.values(inputs).forEach(input=>input.addEventListener('input',update));Object.values(radios).flat().forEach(input=>input.addEventListener('change',update));
  const journey=[];
  let analiza=false,comprende=false,conecta=false,transfiere=false;
  try{
    analiza=Object.values(azPatternLoad()).filter(value=>String(value).trim()).length>=3;
    comprende=['comprende-interpretacion','comprende-reflexion','comprende-fortalecer'].every(name=>(localStorage.getItem(s5DraftKey(name))||'').trim());
    const connections=JSON.parse(localStorage.getItem(s5DraftKey('map-connections'))||'[]');conecta=Array.isArray(connections)&&connections.some(item=>item.reason&&item.utility);
    const transfer=JSON.parse(localStorage.getItem(s5DraftKey('transfiere-producto'))||'{}');transfiere=Boolean(transfer.confirmed&&transfer.justification&&transfer.application);
  }catch(_){}
  ['Analiza','Comprende','Conecta','Transfiere'].forEach((name,i)=>journey.push(`<li>${esc(name)} · ${[analiza,comprende,conecta,transfiere][i]?'Respuestas registradas en este navegador':'Sin evidencia completa disponible en este navegador'}</li>`));
  board.querySelector('[data-pg-journey]').innerHTML=journey.join('');
  if(reflection||plan){board.querySelector('[data-pg-legacy]').hidden=false;board.querySelector('[data-pg-legacy-copy]').innerHTML=`<p><b>Reflexión guardada</b></p><p class="pg-saved-text">${esc(reflection||'Sin registro')}</p><p><b>Plan guardado</b></p><p class="pg-saved-text">${esc(plan||'Sin registro')}</p>`;}
  update();
  // Keep the existing server-backed close handler; only guard incomplete UI submissions.
  form.addEventListener('submit',event=>{
    const data=values();if(readonly||!data.learning||!data.context||!data.focus||[data.importance,data.application,data.action].some(value=>value.length<20)||!current.state.exam){event.preventDefault();event.stopImmediatePropagation();toast('Completa las tres actividades y entrega la evaluación antes de finalizar.');}
  },true);
}
function bindTransfiereGuided(){
  const board=document.querySelector('.tf-board');if(!board)return;
  const scenario=transferScenario(),learnings=conectaLearnings(),key=s5DraftKey('transfiere-producto');
  const resources=[...board.querySelectorAll('[data-tf-resource]')],picks=[...board.querySelectorAll('[data-tf-learning]')];
  const answers=[...board.querySelectorAll('[data-s5-note]')],checks=[...board.querySelectorAll('[data-tf-verify]')];
  const necessary=resources.filter(el=>el.dataset.tfResource!=='conexiones');
  let confirmed=false;
  let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){}
  resources.forEach(el=>el.checked=(saved.resources||[]).includes(el.dataset.tfResource));
  picks.forEach(el=>el.checked=(saved.learnings||[]).includes(el.dataset.tfLearning));
  const radio=board.querySelector(`input[name="tf-decision"][value="${Number(saved.decision)}"]`);if(radio&&saved.decision!=null)radio.checked=true;
  const chosen=()=>board.querySelector('input[name="tf-decision"]:checked');
  const explored=()=>necessary.length>0&&necessary.every(el=>el.checked);
  const persist=()=>{
    const data={resources:resources.filter(el=>el.checked).map(el=>el.dataset.tfResource),decision:chosen()?.value??null,confirmed,decisionText:chosen()?scenario.decisions[Number(chosen().value)]:'',justification:answers[0]?.value||'',application:answers[1]?.value||'',learnings:picks.filter(el=>el.checked).map(el=>el.dataset.tfLearning)};
    try{localStorage.setItem(key,JSON.stringify(data));if(confirmed)localStorage.setItem(s5DraftKey('proyecta-decide'),data.decisionText);}catch(_){}
  };
  const update=()=>{
    const explore=explored();
    const justified=confirmed&&answers.every(el=>el.value.trim())&&picks.some(el=>el.checked);
    const ready=explore&&justified&&checks.every(el=>el.checked);
    board.querySelector('[data-tf-decisions]').disabled=!explore;
    board.querySelector('[data-tf-confirm]').disabled=!explore||!chosen();
    board.querySelector('[data-tf-writing]').hidden=!confirmed;
    board.querySelector('[data-tf-preview]').textContent=confirmed?scenario.decisions[Number(chosen().value)]:'Confirma primero una decisión.';
    board.querySelector('[data-tf-continue]').disabled=!ready;
    board.querySelector('[data-tf-explore]').textContent=explore?'Recursos necesarios seleccionados. Comprueba que puedes citar un dato y el criterio técnico.':'Revisa y selecciona los recursos necesarios; los opcionales no bloquean el avance.';
    board.querySelector('[data-tf-ready]').textContent=ready?'Transfiere completado. Tu decisión, fundamento y aprendizajes quedan guardados para continuar a Proyecta.':'Completa la decisión, las dos explicaciones, los aprendizajes utilizados y la verificación.';
    [explore,confirmed,justified,ready].forEach((done,i)=>{board.querySelector(`[data-tf-state="${i}"]`).textContent=done?'Completado':i===0||[explore,confirmed,justified][i-1]?'En curso':'Pendiente';});
  };
  const invalidate=()=>{checks.forEach(el=>el.checked=false);persist();update();};
  resources.forEach(el=>el.addEventListener('change',()=>{if(!explored())confirmed=false;invalidate();}));
  board.querySelectorAll('input[name="tf-decision"]').forEach(el=>el.addEventListener('change',()=>{confirmed=false;board.querySelector('[data-tf-decision-feedback]').textContent='Confirma la nueva decisión antes de justificar.';invalidate();}));
  board.querySelector('[data-tf-confirm]').addEventListener('click',()=>{
    if(!explored()||!chosen())return;confirmed=true;
    board.querySelector('[data-tf-decision-feedback]').textContent='Decisión registrada. Ahora explica qué dato y qué criterio la respaldan; puedes modificarla si encuentras información que la contradiga.';
    invalidate();
  });
  answers.forEach(el=>el.addEventListener('input',invalidate));picks.forEach(el=>el.addEventListener('change',invalidate));checks.forEach(el=>el.addEventListener('change',()=>{persist();update();}));
  let connections=[];try{connections=JSON.parse(localStorage.getItem(s5DraftKey('map-connections'))||'[]')||[];}catch(_){}
  const label=id=>learnings.find(item=>item.id===id)?.label||id;
  board.querySelector('[data-tf-connections]').innerHTML=Array.isArray(connections)&&connections.length?connections.map(c=>`<li>${esc(label(c.a))} ↔ ${esc(label(c.b))}<p>${esc(c.reason||'')}</p></li>`).join(''):'<li>No hay conexiones guardadas. Puedes consultar los aprendizajes del módulo; esto no bloquea el avance.</li>';
  const old=[['Decisión anterior','proyecta-decide'],['Dato o evidencia anterior','proyecta-evidencia'],['Verificación anterior','proyecta-verifica']];
  board.querySelector('[data-tf-legacy]').innerHTML=old.map(([title,name])=>{let value='';try{value=localStorage.getItem(s5DraftKey(name))||'';}catch(_){}return value?`<p><b>${title}</b><br>${esc(value)}</p>`:'';}).join('')||'<p>No hay otras respuestas anteriores.</p>';
  let zoom=1;const image=board.querySelector('[data-tf-image]');
  board.querySelectorAll('[data-tf-zoom]').forEach(button=>button.addEventListener('click',()=>{zoom=button.dataset.tfZoom==='reset'?1:Math.min(3,zoom+.5);if(image){image.style.width=`${zoom*100}%`;image.style.maxWidth='none';}}));
  confirmed=Boolean(saved.confirmed&&chosen()&&explored());
  update();
}
function bindConectaGuided(){
  const board=document.querySelector('.cn-board');
  if(!board)return;
  const learnings=conectaLearnings(),a=board.querySelector('[data-cn-a]'),b=board.querySelector('[data-cn-b]');
  const answers=[...board.querySelectorAll('[data-s5-note]')],checks=[...board.querySelectorAll('[data-cn-verify]')];
  const key=s5DraftKey('map-connections'),draftKey=s5DraftKey('conecta-seleccion');
  let connections=[];try{const saved=JSON.parse(localStorage.getItem(key)||'[]');connections=Array.isArray(saved)?saved:[];}catch(_){}
  const label=id=>learnings.find(item=>item.id===id)?.label||id;
  const showHistory=()=>{board.querySelector('[data-cn-history]').innerHTML=connections.length?connections.map(item=>`<li><b>${esc(label(item.a))} → ${esc(label(item.b))}</b><p>${esc(item.typeLabel||'Relación guardada anteriormente')}</p><p>${esc(item.reason||'')}</p>${item.utility?`<p>${esc(item.utility)}</p>`:''}</li>`).join(''):'<li>Aún no has guardado conexiones.</li>';};
  let checked=false;
  try{const draft=JSON.parse(localStorage.getItem(draftKey)||'null')||connections[connections.length-1];if(draft){if(learnings.some(item=>item.id===draft.a))a.value=draft.a;if(learnings.some(item=>item.id===draft.b))b.value=draft.b;const radio=board.querySelector(`input[name="cn-relation"][value="${Number(draft.type)}"]`);if(radio)radio.checked=true;if(!answers[0].value&&draft.reason)answers[0].value=draft.reason;}}catch(_){}
  const relation=()=>board.querySelector('input[name="cn-relation"]:checked');
  const typeLabel=()=>relation()?.closest('label')?.textContent.trim()||'';
  const persistSelection=()=>{try{localStorage.setItem(draftKey,JSON.stringify({a:a.value,b:b.value,type:relation()?.value,reason:answers[0].value}));}catch(_){}};
  const saveConnection=()=>{
    if(!checked||!answers.every(el=>el.value.trim()))return;
    const item={a:a.value,b:b.value,type:relation()?.value,typeLabel:typeLabel(),reason:answers[0].value.trim(),utility:answers[1].value.trim(),at:Date.now()};
    const index=connections.findIndex(row=>row.a===item.a&&row.b===item.b);
    if(index<0)connections.push(item);else connections[index]=item;
    try{localStorage.setItem(key,JSON.stringify(connections));}catch(_){}
    showHistory();
  };
  const update=()=>{
    const distinct=a.value&&b.value&&a.value!==b.value;
    const pair=distinct?`${label(a.value)} ↔ ${label(b.value)}`:'Selecciona dos aprendizajes diferentes.';
    board.querySelector('[data-cn-pair]').textContent=pair;
    board.querySelectorAll('[data-cn-node]').forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.cnNode===a.value||node.dataset.cnNode===b.value)));
    board.querySelector('[data-cn-map-result]').textContent=checked?`${label(a.value)} → ${typeLabel()} → ${label(b.value)}`:'';
    const ready=distinct&&checked&&answers.every(el=>el.value.trim())&&checks.every(el=>el.checked);
    board.querySelector('[data-cn-continue]').disabled=!ready;
    board.querySelector('[data-cn-ready]').textContent=ready?'Conecta completado. En Transfiere utilizarás lo aprendido en una situación nueva.':'Completa la conexión, las dos respuestas y la verificación.';
  };
  const reset=()=>{checked=false;checks.forEach(el=>el.checked=false);board.querySelector('[data-cn-feedback]').textContent='La selección cambió. Comprueba nuevamente la relación.';persistSelection();update();};
  [a,b].forEach(el=>el.addEventListener('change',reset));
  board.querySelectorAll('input[name="cn-relation"]').forEach(el=>el.addEventListener('change',reset));
  board.querySelectorAll('[data-cn-node]').forEach(node=>node.addEventListener('click',()=>{if(!a.value||b.value){a.value=node.dataset.cnNode;b.value='';}else b.value=node.dataset.cnNode;reset();}));
  board.querySelector('[data-cn-check]').addEventListener('click',()=>{
    const out=board.querySelector('[data-cn-feedback]');
    if(!a.value||!b.value||a.value===b.value||!relation()){checked=false;out.textContent='Revisa nuevamente: selecciona dos aprendizajes diferentes e identifica una relación.';update();return;}
    checked=true;
    out.textContent=`La conexión tiene dos aprendizajes diferentes y un tipo de relación. Contrasta “${label(a.value)}” y “${label(b.value)}” con sus criterios del paso 1: explica qué aporta uno al otro y qué tarea permite realizar. Esta comprobación revisa la estructura, no valida automáticamente su corrección técnica.`;
    persistSelection();saveConnection();update();
  });
  answers.forEach(el=>el.addEventListener('input',()=>{checks.forEach(check=>check.checked=false);persistSelection();saveConnection();update();}));
  checks.forEach(el=>el.addEventListener('change',()=>{saveConnection();update();}));
  showHistory();update();
}
function bindComprendeGuided(){
  const board=document.querySelector('.cg-board');
  if(!board)return;
  const select=board.querySelector('[data-cg-select]');
  board.querySelectorAll('[data-cg-review]').forEach(button=>button.addEventListener('click',()=>{
    board.querySelector('#cg-evidence')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    select?.focus({preventScroll:true});
  }));
  const practice=board.querySelector('[data-cg-practice]');
  const answers=[...board.querySelectorAll('[data-s5-note]')];
  const checks=[...board.querySelectorAll('[data-cg-verify]')];
  let understood=false;
  const update=()=>{
    const ready=Boolean(select?.value)&&understood&&answers.every(el=>el.value.trim())&&checks.every(el=>el.checked);
    board.querySelector('[data-cg-continue]').disabled=!ready;
    board.querySelector('[data-cg-ready]').textContent=ready?'Comprende completado. Ahora puedes relacionar lo aprendido en Conecta.':'Revisa una evidencia, comprueba tu comprensión, responde las tres preguntas y verifica tu trabajo.';
  };
  select?.addEventListener('change',()=>{
    understood=false;
    checks.forEach(el=>el.checked=false);
    practice.querySelectorAll('input').forEach(el=>{el.checked=false;el.disabled=!select.value;});
    practice.querySelector('button').disabled=true;
    practice.querySelector('[role="status"]').textContent='Selecciona una alternativa después de revisar la evidencia.';
    const index=Number(select.value),row=feedbackResultState().exam?.corrections?.[index];
    const detail=board.querySelector('[data-cg-detail]');
    if(select.value===''||!row){detail.innerHTML='';update();return;}
    const question=current.content.questions?.[index];
    const choice=feedbackResultState().exam?.answers?.[index];
    const selected=question?.options?.[choice];
    const ae=current.content.aes?.[Math.max(0,Number(String(row.ae||'').replace(/\D/g,''))-1)];
    detail.innerHTML=`<article class="cg-proof"><h4>Pregunta ${index+1}</h4><p>${esc(row.question)}</p>${row.image?`<img src="${esc(row.image)}" alt="${esc(row.alt||row.caption||'Recurso de la pregunta evaluada')}">`:''}<dl><dt>2.1 Qué hiciste</dt><dd>${esc(selected||'La alternativa elegida no está disponible en este registro.')}</dd><dt>2.2 Qué ocurrió</dt><dd>${row.correct?'Tu respuesta fue correcta.':'Tu respuesta necesita revisión.'} ${esc(row.option_feedback||row.explanation||'')}</dd><dt>2.3 Qué criterio estaba involucrado</dt><dd>${esc(ae?.short_title||ae?.title||row.ae||'Aprendizaje por identificar')}<p>${esc(row.explanation||'No hay explicación técnica registrada.')}</p></dd><dt>2.4 Cómo puedes mejorarlo</dt><dd>Compara los datos de la pregunta con esta explicación. Identifica qué parte respalda o contradice tu decisión antes de modificarla.</dd></dl></article>`;
    update();
  });
  practice.querySelectorAll('input').forEach(el=>el.addEventListener('change',()=>{
    understood=false;checks.forEach(check=>check.checked=false);
    practice.querySelector('button').disabled=false;update();
  }));
  practice.addEventListener('submit',event=>{
    event.preventDefault();
    understood=practice.querySelector('input:checked')?.value==='1';
    practice.querySelector('[role="status"]').textContent=understood?'Correcto. Comparar tu respuesta con el criterio técnico permite comprender qué debes mantener o modificar.':'Revisa nuevamente la evidencia y el criterio técnico. Luego vuelve a intentarlo; cambiar o repetir sin comprobar no explica el resultado.';
    update();
  });
  answers.forEach(el=>el.addEventListener('input',()=>{checks.forEach(check=>check.checked=false);update();}));
  checks.forEach(el=>el.addEventListener('change',update));
  update();
}
function bindComprendeV2(){
  const board=document.querySelector('.c2-board');
  if(!board)return;
  const updateConnection=()=>{
    const vals=[...board.querySelectorAll('[data-c2-rel]')].map(el=>el.value);
    const out=board.querySelector('.c2-connection-preview');
    if(out&&vals.length===3)out.textContent=`${vals[0]} permite ${vals[1]} para obtener ${vals[2]}.`;
  };
  board.querySelectorAll('[data-c2-rel]').forEach(el=>el.addEventListener('change',updateConnection));
  updateConnection();
  board.querySelectorAll('[data-c2-scroll="evidence"]').forEach(btn=>btn.addEventListener('click',()=>{
    board.querySelector('#c2-evidence')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }));
  board.querySelectorAll('[data-c2-proof]').forEach(btn=>btn.addEventListener('click',()=>{
    const n=btn.dataset.c2Proof;
    const card=btn.closest('.c2-proof');
    const dialog=document.getElementById('tool');
    const content=document.getElementById('tool-content');
    if(dialog&&content&&card){
      content.innerHTML=`<h2>Evidencia ${esc(n)}</h2><p>Revisa qué hiciste, qué muestra esta evidencia y cómo podrías mejorar.</p>${card.querySelector('.c2-proof-body')?.innerHTML||''}`;
      dialog.showModal();
    }else toast(`Evidencia ${n}: revisa la explicación y registra con tus palabras qué cambiarías.`);
  }));
  const practice=board.querySelector('[data-c2-practice]');
  if(practice){
    const submit=practice.querySelector('button[type="submit"]');
    const status=practice.querySelector('[role="status"]');
    practice.querySelectorAll('input[type="radio"]').forEach(input=>input.addEventListener('change',()=>{
      submit.disabled=false;
      practice.classList.remove('is-correct','is-incorrect');
      status.textContent='';
    }));
    practice.addEventListener('submit',event=>{
      event.preventDefault();
      const selected=practice.querySelector('input:checked');
      if(!selected)return;
      const correct=selected.value==='check';
      practice.classList.toggle('is-correct',correct);
      practice.classList.toggle('is-incorrect',!correct);
      status.innerHTML=correct?`${icon('check')} <b>Correcto.</b> Revisaste la evidencia, aplicaste el criterio y comprobaste tu decisión.`:`${icon('info')} <b>Vuelve a intentarlo.</b> Primero compara los datos con el criterio técnico; cambiar o repetir sin revisar no corrige el razonamiento.`;
      if(correct)try{localStorage.setItem(s5DraftKey('comprende-practice'),'complete')}catch(e){}
    });
  }
  const interpretation=board.querySelector('[data-s5-note="comprende-interpretacion"]');
  const interpretationCount=board.querySelector('[data-c2-interpretation-count]');
  if(interpretation&&interpretationCount){
    const updateCount=()=>interpretationCount.textContent=String(interpretation.value.length);
    interpretation.addEventListener('input',updateCount);
    updateCount();
  }
}
function bindS5Hints(){
  document.querySelectorAll('[data-s5-hint]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.s5Hint;
    const panel=document.querySelector(`[data-s5-hint-panel="${id}"]`);
    if(!panel)return;
    const open=panel.hidden;
    panel.hidden=!open;
    button.setAttribute('aria-expanded',open?'true':'false');
    button.classList.toggle('is-open',open);
    if(open)panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
  }));
}
function s5DraftKey(kind){
  const uid=auth?.user?.id||'anon',mid=current?.id||'x';
  return `aula-tp-s5-${kind}:${uid}:${mid}`;
}
function bindS5ReflectionDrafts(){
  document.querySelectorAll('[data-s5-note]').forEach(el=>{
    const key=s5DraftKey(el.dataset.s5Note);
    try{if(!el.value)el.value=localStorage.getItem(key)||''}catch(e){}
    el.addEventListener('input',()=>{try{localStorage.setItem(key,el.value)}catch(e){}});
  });
}
function bindS5PlanBuilder(){
  const btn=document.querySelector('[data-s5-compose]');
  if(!btn)return;
  const fields=[...document.querySelectorAll('[data-s5-plan]')];
  fields.forEach(el=>{
    const key=s5DraftKey('plan-'+el.dataset.s5Plan);
    try{if(!el.value)el.value=localStorage.getItem(key)||''}catch(e){}
    el.addEventListener('input',()=>{try{localStorage.setItem(key,el.value)}catch(e){}});
  });
  btn.addEventListener('click',()=>{
    const value=k=>document.querySelector(`[data-s5-plan="${k}"]`)?.value.trim()||'';
    const strategy=document.querySelector('[data-s5-strategy]:checked')?.value||'';
    const missing=[];
    if(!strategy)missing.push('una estrategia');
    if(!value('goal'))missing.push('qué mejorarás');
    if(!value('resource'))missing.push('el recurso');
    if(!value('deadline'))missing.push('el plazo');
    if(!value('evidence'))missing.push('la evidencia de avance');
    if(missing.length){toast('Completa '+missing.join(', ')+'.');return}
    const plan=`Me propongo mejorar ${value('goal')}. Para lograrlo voy a ${strategy}, utilizando ${value('resource')}. Lo realizaré ${value('deadline')} y comprobaré mi avance mediante ${value('evidence')}.`;
    const out=document.querySelector('#close-form textarea[name="plan"]');
    if(out){out.value=plan;out.focus();out.dispatchEvent(new Event('input',{bubbles:true}))}
    toast('Plan construido. Revísalo y ajústalo antes de cerrar el módulo.');
  });
}
function bindS5SupportPanel(){
  const root=document.querySelector('.s5c-agent, .s5p-board');
  if(!root||root.dataset.s5Bound)return;
  root.dataset.s5Bound='1';
  document.addEventListener('click', onS5SupportClick);
  document.addEventListener('change', onS5AccessChange);
  // sync toggles from body classes
  document.querySelectorAll('[data-s5-access]').forEach(inp=>{
    const k=inp.getAttribute('data-s5-access');
    if(k==='contrast')inp.checked=document.body.classList.contains('contrast')||document.body.classList.contains('high-contrast');
    if(k==='large')inp.checked=document.body.classList.contains('text-lg')||document.body.classList.contains('large-text');
    if(k==='tts')inp.checked=document.body.classList.contains('tts-on');
  });
}
function onS5SupportClick(e){
  const tab=e.target.closest('[data-s5-panel]');
  if(tab){
    const box=tab.closest('.s5c-agent');
    if(!box)return;
    const id=tab.getAttribute('data-s5-panel');
    box.querySelectorAll('[data-s5-panel]').forEach(b=>{
      const on=b===tab;
      b.classList.toggle('is-on',on);
      b.setAttribute('aria-selected',on?'true':'false');
    });
    box.querySelectorAll('[data-s5-pane]').forEach(p=>{
      const on=p.getAttribute('data-s5-pane')===id;
      p.classList.toggle('is-on',on);
      p.hidden=!on;
    });
    return;
  }
  const btn=e.target.closest('[data-s5-tool]');
  if(!btn||view.station!==5)return;
  const kind=btn.getAttribute('data-s5-tool');
  if(kind==='practice'&&typeof tool==='function'){tool('practice');return}
  if(kind==='agent'&&typeof tool==='function'){tool('agent');return}
  if(kind==='access'&&typeof tool==='function'){tool('access');return}
  if(kind==='material'){
    if(typeof toast==='function')toast('Abre el material del módulo desde Recursos o LINKS.');
    const link=document.querySelector('[data-action="links"], a[href*="#links"], .links-fab');
    if(link)link.click();
    return;
  }
  if(kind==='sim'){
    if(typeof toast==='function')toast('Te llevamos a una estación de práctica del módulo.');
    location.hash=`#module/${current.id}/2`;
  }
}
function onS5AccessChange(e){
  const inp=e.target.closest('[data-s5-access]');
  if(!inp)return;
  const k=inp.getAttribute('data-s5-access');
  const on=!!inp.checked;
  if(k==='contrast'){
    document.body.classList.toggle('high-contrast',on);
    document.body.classList.toggle('contrast',on);
  }
  if(k==='large'){
    document.body.classList.toggle('large-text',on);
    document.body.classList.toggle('text-lg',on);
  }
  if(k==='tts'){
    document.body.classList.toggle('tts-on',on);
    if(on&&'speechSynthesis' in window){
      const u=new SpeechSynthesisUtterance(document.querySelector('.s5c-board, .s5p-board')?.innerText?.slice(0,400)||'Accesibilidad activada');
      u.lang='es-CL'; speechSynthesis.cancel(); speechSynthesis.speak(u);
    }else if('speechSynthesis' in window){speechSynthesis.cancel()}
  }
  if(window.AulaAccess&&typeof window.AulaAccess.apply==='function')window.AulaAccess.apply();
  // keep sibling toggles in sync
  document.querySelectorAll(`[data-s5-access="${k}"]`).forEach(el=>{if(el!==inp)el.checked=on});
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');
  if(!b||b.disabled||view.station!==5)return;
  if(b.dataset.action==='az-filter'){
    const kind=b.dataset.filter;
    const already=b.getAttribute('aria-pressed')==='true';
    document.querySelectorAll('[data-action="az-filter"]').forEach(x=>x.setAttribute('aria-pressed','false'));
    document.querySelectorAll('.az-grid>.az-card').forEach(card=>card.hidden=false);
    if(!already&&kind!=='mod'){
      b.setAttribute('aria-pressed','true');
      const visible=kind==='oa'?['az-oa-card','az-evo','az-compare']:['az-opp','az-evid','az-module'];
      document.querySelectorAll('.az-grid>.az-card').forEach(card=>card.hidden=!visible.some(cls=>card.classList.contains(cls)));
      toast(kind==='oa'?'Mostrando resultados y evolución por OA.':'Mostrando evidencias y aprendizajes esperados asociados.');
    }else toast('Mostrando el resumen completo del módulo.');
    return;
  }
  if(b.dataset.action==='az-ae'){
    const el=document.querySelector('.az-ae-block');
    if(el)el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
    return;
  }
  if(b.dataset.action!=='complete-module')return;
  if(current.state.closed)return;
  const t=tab||'analiza';
  if(t!=='proyecta'&&t!=='plan'){
    tab='proyecta';
    renderModule(5);
    const f=document.getElementById('close-form');
    if(f)f.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    return;
  }
  const f=document.getElementById('close-form');
  if(!f)return;
  if(auth.user.role==='teacher'){toast('El cierre del módulo lo registra el estudiante desde su cuenta.');return;}
  f.requestSubmit();
});
