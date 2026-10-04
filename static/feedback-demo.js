'use strict';
let feedbackDemoStudentIndex=0;
const feedbackDemoCache=new Map();
function feedbackDemoEnabled(){
  return typeof isDemoStudent==='function'&&isDemoStudent();
}
function feedbackDemoCohort(courseId,moduleId,aes){
  const key=JSON.stringify([courseId,moduleId,aes.map(a=>a.short_title||a.title)]);
  if(feedbackDemoCache.has(key))return feedbackDemoCache.get(key);
  let seed=(Number(courseId)*104729+Number(moduleId)*7919)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const clamp=v=>Math.max(0,Math.min(100,Math.round(v)));
  const mean=values=>Math.round(values.reduce((a,b)=>a+b,0)/Math.max(1,values.length));
  const students=Array.from({length:120},(_,index)=>{
    const base=32+random()*52;
    const learnings=aes.map((ae,i)=>{
      const initial=clamp(base-18+random()*25);
      const final=clamp(initial+4+random()*35-((index+i)%9===0?28:0));
      return {id:`AE${i+1}`,label:ae.short_title||ae.title||`Aprendizaje ${i+1}`,initial,final};
    });
    return {id:index+1,name:`Estudiante simulado ${String(index+1).padStart(3,'0')}`,learnings,initial:mean(learnings.map(a=>a.initial)),final:mean(learnings.map(a=>a.final))};
  });
  const sorted=students.map(s=>s.final).sort((a,b)=>a-b);
  const bounds=[[0,39],[40,49],[50,59],[60,69],[70,79],[80,89],[90,100]];
  const data={students,average:mean(sorted),median:(sorted[59]+sorted[60])/2,bands:bounds.map(([min,max])=>({label:`${min}–${max}%`,count:sorted.filter(v=>v>=min&&v<=max).length}))};
  feedbackDemoCache.set(key,data);
  return data;
}
function feedbackDemoData(){
  if(!feedbackDemoEnabled())return null;
  return feedbackDemoCohort(current.course_id,current.id,current.content.aes||[]);
}
function feedbackDemoSelected(){
  return feedbackDemoData()?.students[feedbackDemoStudentIndex]||null;
}
// Presentation-only results: never assign these objects to current.state.
function feedbackResultState(){
  const student=feedbackDemoSelected();
  if(!student)return current?.state||{};
  const questions=current.content.questions||[];
  const count=questions.length||25;
  const score=Math.round(student.final*count/100);
  const answers={};
  const corrections=questions.map((q,i)=>{
    const correct=i<score;
    const answer=Number(q.answer)||0;
    const choice=correct?answer:(answer+1)%Math.max(2,(q.options||[]).length);
    answers[i]=choice;
    return {...q,correct,choice,ae:q.ae||1,explanation:`Evidencia simulada: ${correct?'la alternativa coincide':'la alternativa no coincide'} con la clave del ejemplo. ${q.explanation||'Contrasta la alternativa con los datos y el criterio técnico del módulo.'}`};
  });
  const cases=Object.fromEntries((current.content.cases||[]).map((q,i)=>[i,{choice:q.answer,text:'Respuesta ficticia del perfil de demostración.'}]));
  const ae=Object.fromEntries(student.learnings.flatMap((a,i)=>Array.from({length:6},(_,j)=>[`${i}-${j}`,{}])));
  return {context:{},ae,cases,scene:{},exam:{score,max_score:count,answers,corrections,development_required:true,review:{score:Math.round(student.final/4),feedback:'Comentario simulado: conserva las decisiones respaldadas por evidencia y revisa los aprendizajes con menor logro.'},profile:{ae:Object.fromEntries(student.learnings.map(a=>[a.id,{n:count,percent:a.final}]))}}};
}
function feedbackDemoAchievementSummary(){
  const student=feedbackDemoSelected();
  if(!student)return null;
  return {initial:student.initial,final:student.final,rows:student.learnings.map((a,index)=>({...a,index,assessed:25}))};
}
function feedbackDemoEvolution(){
  if(!feedbackDemoEnabled())return null;
  const course=courses.find(c=>Number(c.id)===Number(current.course_id));
  const modules=(course?.modules||[]).slice().sort((a,b)=>Number(a.position)-Number(b.position));
  const points=key=>modules.map(m=>{
    const s=feedbackDemoCohort(current.course_id,m.id,current.content.aes||[]).students[feedbackDemoStudentIndex];
    return {label:`Módulo ${m.position}`,value:Math.round(s[key]/4)};
  });
  return {max:25,unit:'puntos simulados',xTitle:'Módulos',yTitle:'Puntaje simulado',series:[{label:'Inicial simulado',tone:'primary',points:points('initial')},{label:'Final simulado',tone:'secondary',points:points('final')}]};
}
function feedbackDemoPanel(){
  const data=feedbackDemoData();
  if(!data)return '';
  const student=feedbackDemoSelected();
  const strongest=[...student.learnings].sort((a,b)=>b.final-a.final)[0];
  const weakest=[...student.learnings].sort((a,b)=>a.final-b.final)[0];
  return `<section class="feedback-demo" aria-labelledby="feedback-demo-title"><header><small>DEMO · DATOS FICTICIOS</small><h2 id="feedback-demo-title">120 estudiantes simulados</h2><p>Resultados de ejemplo para este curso y módulo. No son tus calificaciones ni corresponden a personas reales.</p></header><label for="feedback-demo-student">Perfil que quieres explorar</label><select id="feedback-demo-student">${data.students.map((s,i)=>`<option value="${i}" ${i===feedbackDemoStudentIndex?'selected':''}>${s.name} · ${s.final}% de logro</option>`).join('')}</select><div class="feedback-demo-metrics"><span>Inicial <b>${student.initial}%</b></span><span>Final <b>${student.final}%</b></span><span>Progresión <b>${student.final-student.initial>0?'+':''}${student.final-student.initial} pp</b></span></div><div class="achievement-table-wrap"><table><caption>Resultados simulados por aprendizaje</caption><thead><tr><th>Aprendizaje</th><th>Inicial</th><th>Final</th><th>Por alcanzar</th></tr></thead><tbody>${student.learnings.map(a=>`<tr><th scope="row">${esc(a.id)} · ${esc(a.label)}</th><td>${a.initial}%</td><td>${a.final}%</td><td>${100-a.final} pp</td></tr>`).join('')}</tbody></table></div><p><b>Fortaleza del perfil:</b> ${esc(strongest?.label||'Sin aprendizaje disponible')} (${strongest?.final??0}%).</p><p><b>Próximo foco:</b> ${esc(weakest?.label||'Sin aprendizaje disponible')}. Revisar el criterio técnico, contrastar la evidencia y comprobar la decisión.</p><details ${tab==='analiza'||!tab?'open':''}><summary>Distribución de los 120 estudiantes</summary>${analizaDemoCohort(student.final)}</details><p class="feedback-demo-note">Las actividades de las pestañas siguen siendo interactivas. Estos perfiles no se guardan como evaluaciones, no desbloquean estaciones y no modifican tus evidencias.</p></section>`;
}
document.addEventListener('change',event=>{
  if(event.target.id!=='feedback-demo-student'||!feedbackDemoEnabled()||view.station!==5)return;
  const value=Number(event.target.value);
  if(!Number.isInteger(value)||value<0||value>=120)return;
  feedbackDemoStudentIndex=value;
  renderModule(5);
  document.getElementById('feedback-demo-student')?.focus();
});
