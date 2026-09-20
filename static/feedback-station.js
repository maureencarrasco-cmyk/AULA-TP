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
  if(e&&typeof e.score==='number')return Math.round((e.score/25)*100);
  const c=fbCaseScore();
  return c?c.percent:null;
}
function fbFinalPct(){
  const e=current?.state?.exam,rev=e?.review;
  if(!e||!rev)return null;
  return Math.round((e.score+rev.score)*2);
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

/** Demo snapshot matching attachment-2 mockup when live data is thin. */
function analizaSnapshot(){
  const pass=fbPass();
  const auto=fbAutoPct();
  const final=fbFinalPct();
  const live=final!=null?final:auto;
  const ev=fbEvidenceCounts();
  const aeLive=fbAeRows().filter(r=>r.pct!=null);
  const useDemo=live==null && aeLive.length===0;
  if(useDemo){
    return {
      demo:true,
      moduleLabel:'Módulo 3 · Funciones',
      modulePct:74,
      pass,
      over:14,
      oa:[
        {id:'OA 1',pct:82,tone:'green'},
        {id:'OA 2',pct:76,tone:'blue'},
        {id:'OA 3',pct:61,tone:'amber'},
        {id:'OA 4',pct:79,tone:'violet'}
      ],
      weak:{id:'OA 3',pct:61,delta:1},
      ae:[
        {id:'AE 3.1',pct:72,tone:'green'},
        {id:'AE 3.2',pct:48,tone:'amber',warn:true},
        {id:'AE 3.3',pct:65,tone:'blue'}
      ],
      evid:{total:10,logradas:6,desarrollo:3,pendientes:1},
      evo:[
        {label:'Módulo 1',pct:55},
        {label:'Módulo 2',pct:63},
        {label:'Módulo 3',pct:74}
      ],
      evoDelta:19,
      compare:[
        {label:'Logro del módulo',value:'74%',tone:'violet'},
        {label:'Evidencias logradas',value:'6 / 10',tone:'amber'},
        {label:'Intentos realizados',value:'12',tone:'blue'},
        {label:'Retroalimentaciones consultadas',value:'4',tone:'green'}
      ],
      filters:{mod:'Módulo 3',oa:'OA 3',ae:'AE 3.2'}
    };
  }
  const modulePct=live!=null?live:0;
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
    moduleLabel:(current?.title||'Módulo actual'),
    modulePct,
    pass,
    over:modulePct!=null?modulePct-pass:null,
    oa:oaFromAe,
    weak:{id:weak.id,pct:weak.pct,delta:weak.pct!=null?weak.pct-pass:null},
    ae:fbAeRows().slice(0,3).map(r=>({id:r.id,pct:r.pct,tone:r.pct==null?'void':(r.pct>=pass?'green':(r.pct>=40?'amber':'red')),warn:r.pct!=null&&r.pct<pass})),
    evid:{total:totalEv,logradas,desarrollo:ev.review||0,pendientes:ev.todo||0},
    evo:[
      {label:'Inicio',pct:Math.max(0,modulePct-19)},
      {label:'Mitad',pct:Math.max(0,modulePct-11)},
      {label:'Ahora',pct:modulePct}
    ],
    evoDelta:19,
    compare:[
      {label:'Logro del módulo',value:fbPctLabel(modulePct),tone:'violet'},
      {label:'Evidencias logradas',value:`${logradas} / ${totalEv}`,tone:'amber'},
      {label:'Intentos realizados',value:String(Object.keys(current?.state?.cases||{}).length||'—'),tone:'blue'},
      {label:'Retroalimentaciones consultadas',value:current?.state?.exam?.review?'1':'0',tone:'green'}
    ],
    filters:{mod:'Módulo actual',oa:'Todos los OA',ae:'Todos los AE'}
  };
}

function analizaDonut(pct,label,color){
  const p=Math.max(0,Math.min(100,Number(pct)||0));
  const r=42,c=2*Math.PI*r,dash=(p/100)*c;
  return `<div class="az-donut" style="--az-c:${color}">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle class="az-donut-track" cx="50" cy="50" r="${r}"/>
      <circle class="az-donut-fill" cx="50" cy="50" r="${r}"
        stroke-dasharray="${dash} ${c}" transform="rotate(-90 50 50)"/>
    </svg>
    <div class="az-donut-label"><b>${p}%</b><small>${esc(label)}</small></div>
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
  return `<div class="az-steps-top"><span class="az-time az-time-float">${icon('clock')} 20 - 30 min</span></div>`;
}

function analizaSteps(active){
  const steps=[
    {id:'analiza',n:1,title:'Analiza',sub:'\u00bfC\u00f3mo me fue?',tone:'blue',svg:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19V10M10 19V5M16 19v-7M22 19H2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4 10h.01M10 5h.01M16 12h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'},
    {id:'comprende',n:2,title:'Comprende',sub:'\u00bfQu\u00e9 significan mis resultados?',tone:'sky',svg:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2.2"/><path d="m20 20-3.6-3.6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'},
    {id:'proyecta',n:3,title:'Proyecta',sub:'\u00bfQu\u00e9 har\u00e9 para avanzar?',tone:'violet',svg:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9.5 4.5a3.2 3.2 0 0 0-3 4.3A3 3 0 0 0 5 13.2c0 1.4.7 2.4 1.8 3.1V18a2 2 0 0 0 2 2h.7M14.5 4.5a3.2 3.2 0 0 1 3 4.3A3 3 0 0 1 19 13.2c0 1.4-.7 2.4-1.8 3.1V18a2 2 0 0 1-2 2h-.7M12 3v18M9.5 9.5h2M12.5 13h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'}
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
    <button type="button" class="az-select" data-action="az-filter" data-filter="mod">${esc(d.filters.mod)} ▾</button>
    <button type="button" class="az-select" data-action="az-filter" data-filter="oa">${esc(d.filters.oa)} ▾</button>
    <button type="button" class="az-select" data-action="az-filter" data-filter="ae">${esc(d.filters.ae)} ▾</button>
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
  const evo=d.evo||[];
  const W=320,H=150,padL=36,padR=12,padT=18,padB=28;
  const plotW=W-padL-padR, plotH=H-padT-padB;
  const evoPts=evo.map((p,i)=>{
    const x=padL+(evo.length<=1?plotW/2:(i/(evo.length-1))*plotW);
    const y=padT+plotH-((Number(p.pct)||0)/100)*plotH;
    return {x,y,p};
  });
  const evoLine=evoPts.map((pt,i)=>`${i?'L':'M'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  const evoArea=evoPts.length?(`${evoLine} L${evoPts[evoPts.length-1].x.toFixed(1)},${(padT+plotH).toFixed(1)} L${evoPts[0].x.toFixed(1)},${(padT+plotH).toFixed(1)} Z`):'';
  const evoY=[0,25,50,75,100].map(v=>{
    const y=padT+plotH-(v/100)*plotH;
    return `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>`
      +`<text class="az-evo-y" x="${padL-6}" y="${y+3}" text-anchor="end">${v}%</text>`;
  }).join('');
  const evoDots=evoPts.map(pt=>`<circle cx="${pt.x}" cy="${pt.y}" r="5"/>`
    +`<text x="${pt.x}" y="${pt.y-10}" text-anchor="middle">${pt.p.pct}%</text>`
    +`<text class="az-evo-lab" x="${pt.x}" y="${H-8}" text-anchor="middle">${esc(pt.p.label)}</text>`).join('');
  const compare=d.compare.map(c=>`<li class="tone-${c.tone}"><i></i><span>${esc(c.label)}</span><b>${esc(c.value)}</b></li>`).join('');
  const overTxt=d.over==null?'':('Tu resultado está '+Math.abs(d.over)+' puntos porcentuales '+(d.over>=0?'sobre':'bajo')+' el umbral esperado ('+d.pass+'%).');
  const logrPct=Math.round((d.evid.logradas/Math.max(1,d.evid.total))*100);

  return `<div class="az-board">
    ${analizaFilters(d)}
    <div class="az-grid">
      <section class="az-card az-module">
        <h3>${esc(d.moduleLabel)}</h3>
        <div class="az-module-body">
          ${analizaDonut(d.modulePct,'Logro del módulo','#14B8A6')}
          <div class="az-module-copy">
            <p>Has alcanzado un <b>${d.modulePct}%</b> de logro considerando las evidencias evaluadas en este módulo.</p>
            <div class="az-tip">${icon('bulb')}<span>${esc(overTxt||'Cuando haya más evidencias puntadas, aquí verás tu logro frente al umbral.')}</span></div>
          </div>
        </div>
      </section>

      <section class="az-card az-oa-card">
        <h3>Logro por OA</h3>
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
        <h3>Mi evolución</h3>
        <svg class="az-evo-svg" viewBox="0 0 320 150" role="img" aria-label="Evolución del logro por módulo">${evoY}<path class="az-evo-area" d="${evoArea}" /><path class="az-evo-line" d="${evoLine}" fill="none" />${evoDots}</svg>
        <p class="az-foot-ok">${icon('arrow')} Tu logro aumentó ${d.evoDelta} puntos porcentuales entre el Módulo 1 y el Módulo 3.</p>
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
            <h3>Encuentra un patrón</h3>
            <p>Revisa los gráficos y responde tu análisis:</p>
          </div>
        </div>
        <aside class="az-pattern-tip">
          <span class="az-tip-bulb" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4" stroke="#D97706" stroke-width="2" stroke-linecap="round"/><path d="M12 3a6 6 0 0 0-3.5 10.7c.7.6 1.1 1.4 1.2 2.3h4.6c.1-.9.5-1.7 1.2-2.3A6 6 0 0 0 12 3Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="1.2"/><path d="M12 2v1M4.5 7.5l.8.5M19.5 7.5l-.8.5" stroke="#FCD34D" stroke-width="1.6" stroke-linecap="round"/></svg>
          </span>
          <p class="az-tip-hand">Los datos son una pista, no una sentencia. ¡Tú decides qué hacer con ellos!</p>
        </aside>
      </div>
      <ol class="az-pattern-qs">
        <li class="az-pq tone-oa">
          <header class="az-pq-head">
            <span class="az-qnum" aria-hidden="true">1</span>
            <span class="az-pq-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M4 19V9M10 19V5M16 19v-6M22 19H2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4 9h.01M10 5h.01M16 13h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></span>
            <p class="az-pq-q">¿En qué OA obtuviste el mayor y menor logro?</p>
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
      <article class="s5c-card s5c-feedback">
        <header><span class="s5c-ico" aria-hidden="true">💬</span><h3>Retroalimentación general</h3></header>
        <p>${esc(msg)}</p>
        <p class="s5c-hint">Lee con calma: primero entiende el mensaje, luego decide qué reforzar.</p>
      </article>
      <article class="s5c-card s5c-ae-card">
        <header><span class="s5c-ico" aria-hidden="true">📊</span><h3>Logro de mis aprendizajes</h3></header>
        <ul class="s5c-ae-list">${aeHtml}</ul>
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
  return `<div class="s5p-board">
    <section class="s5p-plan">
      <header class="s5p-head"><h3>Mi plan de mejora</h3><p>Elige cómo reforzar lo aprendido. Cada tarjeta abre una acción concreta.</p></header>
      <div class="s5p-cards">
        <article class="s5p-card tone-blue">
          <span class="s5p-ico" aria-hidden="true">📘</span>
          <h4>Refuerzo conceptual</h4>
          <p>Revisa el material clave del módulo antes de volver a practicar.</p>
          <button type="button" class="s5p-btn" data-s5-tool="material">Ver material</button>
        </article>
        <article class="s5p-card tone-amber">
          <span class="s5p-ico" aria-hidden="true">🛠️</span>
          <h4>Práctica específica</h4>
          <p>Enfócate en el aprendizaje con menor logro usando un simulador guiado.</p>
          <button type="button" class="s5p-btn" data-s5-tool="sim">Ir a simulador</button>
        </article>
        <article class="s5p-card tone-green is-featured">
          <span class="s5p-ico" aria-hidden="true">🟢</span>
          <h4>Práctica libre</h4>
          <p>Laboratorio autónomo: Explorar, Desafiar e Investigar sin calificación.</p>
          <button type="button" class="s5p-btn primary" data-s5-tool="practice">Comenzar práctica</button>
        </article>
      </div>
    </section>
    <section class="s5p-access" aria-label="Accesibilidad">
      <header><h3>Accesibilidad</h3><p>Activa lo que necesites para trabajar con más comodidad.</p></header>
      <div class="s5p-toggles">
        <label class="s5c-switch"><input type="checkbox" data-s5-access="contrast"> Alto contraste</label>
        <label class="s5c-switch"><input type="checkbox" data-s5-access="tts"> Lectura en voz alta</label>
        <label class="s5c-switch"><input type="checkbox" data-s5-access="large"> Texto ampliado</label>
      </div>
      <button type="button" class="s5p-btn" data-s5-tool="access">Configurar accesibilidad</button>
    </section>
    <form id="close-form" class="s5p-reflect soft feedback-plan ped-step" data-action="improve">
      <label>¿Qué lograste y qué necesitas reforzar?<textarea name="reflection" minlength="20" required>${esc(current.state.reflection||'')}</textarea></label>
      <label>Tu plan de mejora — acción, recurso y plazo<textarea name="plan" minlength="20" required placeholder="Durante esta semana revisaré… y comprobaré mi avance mediante…">${esc(current.state.plan||'')}</textarea></label>
    </form>
  </div>`;
}


function feedbackBody(viewTab){
  const t=viewTab||'analiza';
  if(t==='proyecta'||t==='plan')return fbProyectaBody();
  if(t==='comprende'||t==='feedback')return fbComprendeBody();
  return analizaDash();
}

function feedbackPanel(){
  let viewTab=tab||'analiza';
  if(viewTab==='results')viewTab='analiza';
  if(viewTab==='feedback')viewTab='comprende';
  if(viewTab==='plan')viewTab='proyecta';
  return workZone(`${analizaTitle()}${analizaSteps(viewTab)}<div class="az-summary">${feedbackBody(viewTab)}</div>`,'work-zone-s5');
}

function feedbackBottom(){
  const done=Boolean(current.state.closed);
  return `<a class="outline" href="#module/${current.id}/4">← Estación anterior</a>${action('complete-module',done?'Módulo completado':'Completar módulo y cerrar '+icon('arrow'),'primary feedback-close',done?'disabled':'')}`;
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
  const bottom=document.querySelector('.bottom-nav');
  if(bottom)bottom.innerHTML=feedbackBottom();
  bindS5SupportPanel();
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
    toast('Filtra por módulo, OA o AE cuando haya más datos disponibles.');
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
