'use strict';

function activateJourneyModules(root=document){
  root.querySelectorAll('a.journey-button[href^="#module/"]').forEach(link=>{
    link.href='/portal/cursos/'+link.getAttribute('href');
    link.onpointerdown=()=>window.location.assign(link.href);
  });
}

const courseAccessRoot=document.getElementById('app');
if(courseAccessRoot){
  activateJourneyModules(courseAccessRoot);
  new MutationObserver(()=>activateJourneyModules(courseAccessRoot)).observe(courseAccessRoot,{childList:true,subtree:true});
}
