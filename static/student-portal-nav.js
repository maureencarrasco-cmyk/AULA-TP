'use strict';
(function(){
 let scheduled=false;
 function repair(){
  scheduled=false;
  const sidebar=document.querySelector('.dash-sidebar');
  if(!sidebar)return;
  const oldHome=sidebar.querySelector('[data-action="home-login"]');
  if(oldHome){
   const home=document.createElement('a');
   home.href='#courses';
   home.className=location.hash==='#progress'?'':'is-active';
   home.innerHTML=oldHome.innerHTML;
   oldHome.replaceWith(home);
  }
  const progress=sidebar.querySelector('a[href="#progress"]');
  if(progress)progress.classList.toggle('is-active',location.hash==='#progress');
  const exit=sidebar.querySelector('.dash-exit');
  if(exit){exit.dataset.action='logout';exit.onclick=null}
 }
 function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(repair)}
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('hashchange',schedule);
 document.addEventListener('click',async event=>{
  const exit=event.target.closest('.dash-exit');
  if(!exit)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  exit.disabled=true;
  try{
   await api('/logout','POST',{});
   auth=await api('/session');
   current=null;
   history.replaceState(null,'',location.pathname+location.search);
   login();
  }catch(error){
   exit.disabled=false;
   if(typeof toast==='function')toast(error.message||'No fue posible cerrar la sesión.');
  }
 },true);
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',schedule,{once:true}):schedule();
})();
