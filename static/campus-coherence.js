/* Coherencia de menús y catálogo · 2026-09-25 */
'use strict';
function catalogQuery(){
  try{
    const url=new URL(location.href);
    const q=(url.searchParams.get('q')||url.searchParams.get('especialidad')||'').trim();
    if(q) sessionStorage.setItem('aulaCatalogQ', q);
    return (q||sessionStorage.getItem('aulaCatalogQ')||'').trim();
  }catch(e){return '';}
}
function clearCatalogQuery(){
  try{
    sessionStorage.removeItem('aulaCatalogQ');
    const url=new URL(location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('especialidad');
    history.replaceState({},'',url.pathname+url.hash);
  }catch(e){}
}
function moduleYearBand(course, module, index){
  const pos=Number(module?.position||index+1);
  const title=String(module?.title||'');
  if(/emprendimiento y empleabilidad/i.test(title)) return '4° medio';
  const key=typeof specialtyKey==='function'?specialtyKey(course):'';
  if(key==='climate' || key==='electricidad') return pos<=4?'3° medio':'4° medio';
  if(key==='enfermeria' || key==='gastronomia' || key==='hoteleria') return pos<=6?'3° medio':'4° medio';
  return pos<=4?'3° medio':'4° medio';
}
function yearSplit(course){
  const mods=course.modules||[];
  const third=mods.filter((m,i)=>moduleYearBand(course,m,i)==='3° medio').length;
  const fourth=mods.filter((m,i)=>moduleYearBand(course,m,i)==='4° medio').length;
  return {third,fourth,total:mods.length};
}
function courseMatchesQuery(course, q){
  if(!q) return true;
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const n=fold(q);
  const blob=fold(`${course.title||''} ${course.specialty||''} ${course.level||''}`);
  return n.split(/\s+/).every(tok=>!tok||blob.includes(tok));
}
function moduleCountLabel(course){
  const split=yearSplit(course);
  if(split.third && split.fourth) return `${split.third} mód. 3° · ${split.fourth} mód. 4° · 5 estaciones`;
  if(split.fourth && !split.third) return `${split.fourth} módulos de 4° · 5 estaciones`;
  return `${split.total} módulos de 3° · 5 estaciones`;
}
function applyCatalogCoherence(){
  const q=catalogQuery();
  document.querySelectorAll('.dash-course-card').forEach(card=>{
    const title=card.querySelector('h3')?.textContent||'';
    const course=(typeof courses!=='undefined'?courses:[]).find(c=>c.title===title);
    if(!course) return;
    if(!courseMatchesQuery(course,q)){
      card.remove();
      return;
    }
    card.dataset.specialty=course.title;
    card.dataset.status=course.modules?.some(m=>m.published)?'published':'soon';
    const p=card.querySelector('.dash-course-body p');
    if(p && course.modules?.some(m=>m.published)) p.textContent=moduleCountLabel(course);
    const badge=card.querySelector('.dash-course-photo span');
    const split=yearSplit(course);
    if(badge) badge.textContent=split.third&&split.fourth?'3° y 4° medio':(split.fourth?'4° medio':'3° medio');
  });
  const header=document.querySelector('.dash-courses header');
  if(header && q && !header.querySelector('.catalog-filter-bar')){
    const visible=document.querySelectorAll('.dash-course-card').length;
    const bar=document.createElement('p');
    bar.className='catalog-filter-bar';
    bar.setAttribute('role','status');
    bar.innerHTML='Filtro del catálogo: <strong></strong> · <span></span> <button type="button" class="catalog-filter-clear" data-clear-catalog-filter>Ver todas</button>';
    bar.querySelector('strong').textContent=q;
    bar.querySelector('span').textContent=visible+' resultado'+(visible===1?'':'s');
    header.querySelector('h2')?.insertAdjacentElement('afterend', bar);
    bar.querySelector('[data-clear-catalog-filter]').onclick=()=>{clearCatalogQuery(); if(typeof courseList==='function') courseList();};
  }
  const screen=document.body.dataset.screen;
  if(screen==='courses'||screen==='login'){
    document.querySelectorAll('.floating-back-button,.tools-fab,.tools-fab-backdrop,.tools-fab-layer').forEach(el=>el.remove());
  }
  document.querySelectorAll('.journey-stop').forEach((stop,i)=>{
    const course=(typeof courses!=='undefined'&&typeof current!=='undefined')?courses.find(c=>c.id===current?.course_id):null;
    if(!course) return;
    const eyebrow=stop.querySelector('.eyebrow');
    if(eyebrow && !/3°|4°/.test(eyebrow.textContent||'')){
      eyebrow.textContent=moduleYearBand(course, course.modules?.[i], i)+' · '+eyebrow.textContent;
    }
  });
  if(window.AulaMenu) window.AulaMenu.apply();
}
const _courseList = courseList;
courseList = function(){
  _courseList();
  applyCatalogCoherence();
};
const _shell = shell;
shell = function(body,title,sub){
  _shell(body,title,sub);
  applyCatalogCoherence();
};
if(document.readyState!=='loading') applyCatalogCoherence();
else document.addEventListener('DOMContentLoaded', applyCatalogCoherence);
