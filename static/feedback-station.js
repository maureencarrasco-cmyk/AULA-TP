'use strict';
/* Estación 5 · Analiza – ¿Cómo me fue? (mockup attachment 2) */
const ANALIZA_V = '32';
const ANALIZA_IMG = (name) => `/static/themes/${name}?v=${ANALIZA_V}`;

function feedbackHeader(){ return ''; }
function feedbackStationRoute(){ return stationRoute(5); }
function feedbackSidebar(){ return ''; }

function fbPass(){ return Number(current?.content?.pass_percent)||60; }
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
  const e=current?.state?.exam;
  if(e&&typeof e.score==='number')return Math.round((e.score/Number(e.max_score||25))*100);
  const c=fbCaseScore();
  return c?c.percent:null;
}
function fbFinalPct(){
  const e=current?.state?.exam,rev=e?.review;
  if(!e)return null;
  const selection=Math.round((e.score/Number(e.max_score||25))*100);
  if(!e.development_required)return selection;
  if(!rev)return null;
  return Math.round((selection+(rev.score/25)*100)/2);
}
function fbEvidenceCounts(){
  const s=current?.state||{};
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
  const profile=current?.state?.exam?.profile?.ae||{};
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
      {label:'Retroalimentaciones consultadas',value:current?.state?.exam?.review?'1':'0',tone:'green'}
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
  return `<nav class="az-steps az-steps-v2" aria-label="Pasos de la estaci\u00f3n 5">${steps.map(s=>{
    const on=active===s.id;
    const badge=s.id==='analiza'?`<span class="az-step-badge">ESTACI\u00d3N 5</span>`:'';
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

function analizaDash(){
  const d=analizaSnapshot();
  const oaBars=d.oa.map(o=>`<li class="az-oa tone-${o.tone}">
    <span class="az-oa-id">${esc(o.id)}</span>
    <span class="az-oa-track"><i style="width:${o.pct==null?0:Math.max(0,Math.min(100,o.pct))}%"></i></span>
    <b>${fbPctLabel(o.pct)}</b>
  </li>`).join('');
  const aeBars=d.ae.map(a=>`<li class="az-ae tone-${a.tone}${a.warn?' is-warn':''}">
    <span>${esc(a.id)}</span>
    <span class="az-ae-track"><i style="width:${a.pct==null?0:a.pct}%"></i></span>
    <b>${fbPctLabel(a.pct)}</b>${a.warn?'<em>!</em>':''}
  </li>`).join('');
  const evolution=d.evolution||{max:25,unit:'puntos',series:[]};
  const allLabels=[...new Set(evolution.series.flatMap(s=>s.points.map(p=>p.label)))];
  const W=360,H=190,padL=54,padR=16,padT=22,padB=48;
  const plotW=W-padL-padR, plotH=H-padT-padB;
  const evoY=[0,5,10,15,20,25].map(v=>{
    const y=padT+plotH-(v/evolution.max)*plotH;
    return `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>`
      +`<text class="az-evo-y" x="${padL-8}" y="${y+4}" text-anchor="end">${v}</text>`;
  }).join('');
  const xFor=(label)=>{
    const i=Math.max(0,allLabels.indexOf(label));
    return padL+(allLabels.length<=1?plotW/2:(i/(allLabels.length-1))*plotW);
  };
  const yFor=(value)=>padT+plotH-(Number(value)/evolution.max)*plotH;
  const evoSeries=evolution.series.map(s=>{
    const valid=s.points.filter(p=>Number.isFinite(p.value));
    const line=valid.map((p,i)=>`${i?'L':'M'}${xFor(p.label).toFixed(1)},${yFor(p.value).toFixed(1)}`).join(' ');
    const dots=valid.map(p=>`<circle class="tone-${s.tone}" cx="${xFor(p.label)}" cy="${yFor(p.value)}" r="5"/>`
      +`<text x="${xFor(p.label)}" y="${yFor(p.value)-10}" text-anchor="middle">${p.value}</text>`).join('');
    return `<path class="az-evo-line tone-${s.tone}" d="${line}" fill="none"/>${dots}`;
  }).join('');
  const evoLabels=allLabels.map(label=>`<text class="az-evo-lab" x="${xFor(label)}" y="${H-27}" text-anchor="middle">${esc(label)}</text>`).join('');
  const evoLegend=evolution.series.length>1?`<div class="az-evo-legend">${evolution.series.map(s=>`<span class="tone-${s.tone}"><i></i>${esc(s.label)}</span>`).join('')}</div>`:'';
  const primary=evolution.series[0]?.points.filter(p=>Number.isFinite(p.value))||[];
  const delta=primary.length>1?primary[primary.length-1].value-primary[0].value:null;
  const evoSummary=delta==null
    ?'Completa una evaluación para comenzar a visualizar tu evolución.'
    :delta===0
      ?`Tu puntaje se mantuvo estable en ${primary[0].value} ${evolution.unit}.`
      :`Tu puntaje ${delta>0?'aumentó':'disminuyó'} ${Math.abs(delta)} ${evolution.unit} entre ${primary[0].label} y ${primary[primary.length-1].label}.`;
  const compare=d.compare.map(c=>`<li class="tone-${c.tone}"><i></i><span>${esc(c.label)}</span><b>${esc(c.value)}</b></li>`).join('');
  const overTxt=d.over==null?'':('Tu resultado está '+Math.abs(d.over)+' puntos porcentuales '+(d.over>=0?'sobre':'bajo')+' el umbral esperado ('+d.pass+'%).');
  const logrPct=Math.round((d.evid.logradas/Math.max(1,d.evid.total))*100);

  return `<div class="az-board">
    ${analizaFilters(d)}
    <section class="az-instruction"><span>${icon('search')}</span><div><h2>Observa, compara e identifica</h2><p>Observa tus resultados por AE, tu evolución y tus evidencias. Identifica una fortaleza y un aspecto que necesites seguir trabajando.</p></div></section>
    <div class="az-grid">
      <section class="az-card az-module">
        <h3>${esc(d.moduleLabel)}</h3>
        <div class="az-module-body">
          ${analizaDonut(d.modulePct,'Logro del módulo','#14B8A6')}
          <div class="az-module-copy">
            <p>${d.modulePct==null?'Aún no hay una evaluación entregada. Completa la estación 4 para visualizar tu logro.':`Has alcanzado un <b>${d.modulePct}%</b> de logro considerando las evidencias evaluadas en este módulo.`}</p>
            <div class="az-tip">${icon('bulb')}<span>${esc(overTxt||'Cuando haya más evidencias puntadas, aquí verás tu logro frente al umbral.')}</span></div>
          </div>
        </div>
      </section>

      <section class="az-card az-oa-card">
        <h3>Logro por OA</h3>
        <p class="az-chart-purpose">Compara el nivel alcanzado en cada objetivo para reconocer dónde avanzaste más y dónde necesitas apoyo.</p>
        <div class="az-oa-chart">
          <ul class="az-oa-list">${oaBars}</ul>
          <div class="az-threshold" style="--mark:${d.pass}"><span>Umbral esperado ${d.pass}%</span></div>
        </div>
      </section>

      <aside class="az-card az-opp">
        <h3>Tu oportunidad de mejora</h3>
        <div class="az-opp-badge"><span class="az-warn">⚠</span><b>${esc(d.weak.id)} · ${fbPctLabel(d.weak.pct)}</b></div>
        <p>Es el objetivo con menor logro dentro del módulo.</p>
        <p class="az-opp-delta">Diferencia respecto del umbral: <b>${d.weak.delta==null?'—':((d.weak.delta>=0?'+':'')+d.weak.delta+' pp')}</b></p>
        <button type="button" class="az-opp-btn" data-action="az-ae">Ver AE asociados →</button>
        <div class="az-ae-block">
          <h4>AE del ${esc(d.weak.id)}</h4>
          <ul class="az-ae-list">${aeBars}</ul>
        </div>
      </aside>

      <section class="az-card az-evid">
        <h3>Estado de mis evidencias</h3>
        <p class="az-chart-purpose">Observa cuántas evidencias están logradas, en desarrollo o pendientes para identificar tu nivel de avance.</p>
        <div class="az-evid-body">
          ${analizaEvidDonut(d.evid)}
          <ul class="az-evid-legend">
            <li><i class="g"></i>Logradas <b>${logrPct}%</b> <em>${d.evid.logradas}</em></li>
            <li><i class="y"></i>En desarrollo <b>${Math.round((d.evid.desarrollo/Math.max(1,d.evid.total))*100)}%</b> <em>${d.evid.desarrollo}</em></li>
            <li><i class="z"></i>Pendientes <b>${Math.round((d.evid.pendientes/Math.max(1,d.evid.total))*100)}%</b> <em>${d.evid.pendientes}</em></li>
          </ul>
        </div>
        <p class="az-foot-note">${icon('file')} ${d.evid.logradas} de cada ${d.evid.total} evidencias registradas alcanzan el criterio esperado.</p>
      </section>

      <section class="az-card az-evo">
        <h3>Evolución del puntaje en evaluación</h3>
        <p class="az-evo-subtitle">Compara tus mediciones para reconocer si tu desempeño avanzó, se mantuvo o disminuyó · máximo ${evolution.max} puntos.</p>
        ${evolution.series.length?`<svg class="az-evo-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución del puntaje obtenido por módulo">${evoY}<line class="az-evo-axis" x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT+plotH}"/><line class="az-evo-axis" x1="${padL}" y1="${padT+plotH}" x2="${W-padR}" y2="${padT+plotH}"/>${evoSeries}${evoLabels}<text class="az-evo-axis-title az-evo-axis-y" transform="translate(13 ${padT+plotH/2}) rotate(-90)" text-anchor="middle">${esc(evolution.yTitle)} (${esc(evolution.unit)})</text><text class="az-evo-axis-title" x="${padL+plotW/2}" y="${H-7}" text-anchor="middle">${esc(evolution.xTitle)}</text></svg>${evoLegend}`:'<div class="az-evo-empty">Aún no hay puntajes comparables registrados.</div>'}
        ${evolution.demo?'<p class="az-demo-hint">Datos de ejemplo. Los puntajes reales aparecerán al completar evaluaciones.</p>':''}
        <p class="az-foot-ok">${icon('arrow')} ${esc(evoSummary)}</p>
      </section>

      <section class="az-card az-compare">
        <h3>Comparación de variables</h3>
        <ul class="az-compare-list">${compare}</ul>
        <div class="az-tip">${icon('bulb')}<span>Observa ambos grupos de datos. ¿Qué relación encuentras entre tu actividad y tu logro?</span></div>
      </section>
    </div>

    <section class="az-pattern" aria-label="Encuentra un patrón">
      <div class="az-pattern-head">
        <div class="az-pattern-lead">
          <span class="az-pattern-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#1D4ED8" stroke-width="2.2"/><path d="m20 20-3.6-3.6" stroke="#1D4ED8" stroke-width="2.2" stroke-linecap="round"/><path d="M8.5 11h5M11 8.5v5" stroke="#3B82F6" stroke-width="2" stroke-linecap="round"/></svg>
          </span>
          <div>
            <h3>¿Qué patrón observas en tus resultados?</h3>
            <p>Puedes comparar tus resultados por AE, revisar dónde avanzaste más o identificar dónde tuviste mayor dificultad.</p>
          </div>
        </div>
        <aside class="az-pattern-tip">
          <span class="az-tip-bulb" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4" stroke="#D97706" stroke-width="2" stroke-linecap="round"/><path d="M12 3a6 6 0 0 0-3.5 10.7c.7.6 1.1 1.4 1.2 2.3h4.6c.1-.9.5-1.7 1.2-2.3A6 6 0 0 0 12 3Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="1.2"/><path d="M12 2v1M4.5 7.5l.8.5M19.5 7.5l-.8.5" stroke="#FCD34D" stroke-width="1.6" stroke-linecap="round"/></svg>
          </span>
          <p class="az-tip-hand">Los datos son una pista, no una sentencia. ¡Tú decides qué hacer con ellos!</p>
        </aside>
        <button type="button" class="s5-hint-button" data-s5-hint="analiza" aria-expanded="false">${icon('bulb')} Necesito una pista</button>
      </div>
      <div class="s5-hint-panel" data-s5-hint-panel="analiza" hidden>Compara primero tu resultado más alto con el más bajo. Luego revisa qué evidencia o actividad podría explicar esa diferencia.</div>
      <ol class="az-pattern-qs">
        <li class="az-pq tone-oa">
          <header class="az-pq-head">
            <span class="az-qnum" aria-hidden="true">1</span>
            <span class="az-pq-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M4 19V9M10 19V5M16 19v-6M22 19H2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4 9h.01M10 5h.01M16 13h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></span>
            <p class="az-pq-q">¿Qué patrón observas al comparar tus resultados?</p>
          </header>
          <label class="az-pq-label" for="az-pq-1"><span class="az-pq-n">Respuesta 1</span></label>
          <textarea id="az-pq-1" class="az-pq-answer" data-az-pq="1" rows="3" maxlength="600" placeholder="Escribe aquí tu análisis…"></textarea>
        </li>
        <li class="az-pq tone-fase">
          <header class="az-pq-head">
            <span class="az-qnum" aria-hidden="true">2</span>
            <span class="az-pq-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3 4.5 7v5c0 5 3.2 8.4 7.5 9.5C16.3 20.4 19.5 17 19.5 12V7L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 8v5M12 16.5h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></span>
            <p class="az-pq-q">¿Qué fase presenta la mayor dificultad?</p>
          </header>
          <label class="az-pq-label" for="az-pq-2"><span class="az-pq-n">Respuesta 2</span></label>
          <textarea id="az-pq-2" class="az-pq-answer" data-az-pq="2" rows="3" maxlength="600" placeholder="Escribe aquí tu análisis…"></textarea>
        </li>
        <li class="az-pq tone-rel">
          <header class="az-pq-head">
            <span class="az-qnum" aria-hidden="true">3</span>
            <span class="az-pq-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="7" cy="8" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="8" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="17" r="2.5" stroke="currentColor" stroke-width="2"/><path d="M9.2 9.5 10.8 15M14.8 9.5 13.2 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>
            <p class="az-pq-q">¿Cómo se relacionan tus intentos, retroalimentaciones y logro?</p>
          </header>
          <label class="az-pq-label" for="az-pq-3"><span class="az-pq-n">Respuesta 3</span></label>
          <textarea id="az-pq-3" class="az-pq-answer" data-az-pq="3" rows="3" maxlength="600" placeholder="Escribe aquí tu análisis…"></textarea>
        </li>
      </ol>
    </section>
    <footer class="s5-next-step"><b>OBSERVA → COMPARA → IDENTIFICA</b><span>Ahora que reconociste cómo fue tu desempeño, interpreta qué significan esos resultados.</span></footer>
    ${d.demo?'<p class="az-demo-hint">Vista de ejemplo con el diseño de Analiza. Tus cifras reales aparecerán cuando haya evidencias puntadas.</p>':''}
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
    <ul class="fb-rows">${list}</ul></section>`;
}
function fbComprendeBody(){
  const e=current?.state?.exam,rev=e?.review;
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
        ${incorrect.length?incorrect.map(c=>`<details><summary>Pregunta ${c.index} · Por reforzar</summary><p><b>Pregunta:</b> ${esc(c.question)}</p><p><b>Explicación:</b> ${esc(c.explanation)}</p></details>`).join(''):'<div class="s5c-empty">No hay preguntas incorrectas registradas o la evaluación aún no ha sido entregada.</div>'}
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

function fbComprendeBodyV2(){
  const exam=current?.state?.exam;
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
    </section>

    <section class="c2-section c2-connect">
      <header class="c2-section-title"><span>3</span><em>INTERPRETA</em><div><h3>Interpreta tus evidencias</h3><p>Relaciona cada evidencia con el concepto o criterio que demuestra y reconoce qué significa para tu aprendizaje.</p></div></header>
      <div class="c2-meaning-chain"><article><b>Evidencia</b><p>${esc(evidenceRows[0]?.question||'Actividad destacada del módulo')}</p></article>${icon('arrow')}<article><b>Concepto o criterio</b><p>${esc(concepts[0])}</p></article>${icon('arrow')}<article><b>Qué significa para mi aprendizaje</b><p>Esta evidencia muestra qué comprendes y qué razonamiento necesitas seguir fortaleciendo.</p></article></div>
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
  if(t==='conecta')return pedagogicalTabBody('conecta');
  if(t==='transfiere')return pedagogicalTabBody('transfiere');
  if(t==='proyecta'||t==='plan')return proyectaFinalBody();
  if(t==='comprende'||t==='feedback')return fbComprendeBodyV2();
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
  return workZone(`${analizaTitle()}${analizaSteps(viewTab)}${typeof instructionContract==='function'?instructionContract({instruction:instructions[viewTab]}):''}<div class="az-summary">${feedbackBody(viewTab)}</div>`,'work-zone-s5');
}

function feedbackBottom(){
  const done=Boolean(current.state.closed);
  const t=tab||'analiza';
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
  box.querySelectorAll('.az-pq-answer').forEach(el=>{
    const k=el.getAttribute('data-az-pq');
    if(saved[k])el.value=saved[k];
    el.addEventListener('input',()=>{
      const m=azPatternLoad();
      m[k]=el.value;
      azPatternSave(m);
    });
  });
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
