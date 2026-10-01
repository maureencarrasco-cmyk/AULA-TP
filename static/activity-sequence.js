'use strict';
(function(){
 const selectors={
  1:['.ctx-activity'],
  2:['.ae-challenge .act-card:not(.act-explore)','.ae-evidence'],
  3:['#case-form','#scene-form'],
  4:['.exam-intro','#exam-form'],
  5:['.az-instruction','.az-pattern','.c2-section','.p3-section','.pf-form','#close-form']
 };
 const activityIcon='<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h10a2 2 0 0 1 2 2v12H7a2 2 0 0 1-2-2V4Z" stroke="currentColor" stroke-width="1.8"/><path d="M8 8h6M8 11h4M14.5 16.5l4.8-4.8 1.5 1.5-4.8 4.8-2.3.8.8-2.3Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 let scheduled=false;
 function decorate(){
  scheduled=false;
  if(document.body.dataset.screen!=='module')return;
  const station=Number(document.body.dataset.station||0),root=document.querySelector('.station-body');
  if(!root||!selectors[station])return;
  const found=[];
  selectors[station].forEach(selector=>root.querySelectorAll(selector).forEach(el=>{
   if(!found.includes(el)&&!found.some(parent=>parent.contains(el)))found.push(el);
  }));
  found.forEach((el,index)=>{
   if(el.querySelector(':scope > .activity-order-badge'))return;
   const number=String(index+1).padStart(2,'0');
   el.classList.add('ordered-activity',`activity-tone-${index%5+1}`);
   el.insertAdjacentHTML('afterbegin',`<header class="activity-order-badge" aria-label="Actividad ${index+1}"><strong>${number}</strong><span>${activityIcon}</span><div><b>ACTIVIDAD ${number}</b><small>Aquí debes realizar una actividad</small></div></header>`);
  });
 }
 function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(decorate)}
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',schedule,{once:true}):schedule();
})();
