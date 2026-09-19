'use strict';
/* Estación 5 · Analiza – temporary stub while full restore in progress */
function feedbackHeader(){return '';}
function feedbackStationRoute(){return typeof stationRoute==='function'?stationRoute(5):'';}
function feedbackSidebar(){return '';}
function feedbackPanel(){
 return (typeof workZone==='function'?workZone:'')(`<div class="az-head"><h2>Analiza · ¿Cómo me fue?</h2><p>Restaurando el panel Analiza… recarga con Ctrl+F5 en unos segundos.</p></div>`,'work-zone-s5');
}
function feedbackBottom(){
 const done=Boolean(current?.state?.closed);
 return `<a class="outline" href="#module/${current.id}/4">← Estación anterior</a>${typeof action==='function'?action('complete-module',done?'Módulo completado':'Completar módulo y cerrar','primary feedback-close',done?'disabled':''):''}`;
}
function bindFeedback(){const bottom=document.querySelector('.bottom-nav');if(bottom)bottom.innerHTML=feedbackBottom();}
