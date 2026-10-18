/* Presentation alias only: navigation is still handled by the original control. */
(() => {
  function syncMiningTile() {
    const panel=document.querySelector('.city-walk-inspector');
    const grid=panel?.querySelector('.city-island-grid');
    const original=panel?.querySelector('.city-island-card > .city-approach');
    if(!grid||!original)return;
    let tile=grid.querySelector('[data-city-panel-mining]');
    // Wait for the original application to hydrate and enable its controls.
    if(!tile&&!original.disabled) {
      tile=document.createElement('button');
      tile.type='button';
      tile.dataset.cityPanelMining='';
      const icon=original.querySelector('svg');
      if(icon)tile.append(icon.cloneNode(true));
      const copy=document.createElement('span');
      const title=document.createElement('strong');title.textContent='ISLA MINERA';
      const detail=document.createElement('small');detail.textContent='Operaciones mineras y equipos';
      copy.append(title,detail);tile.append(copy);
      tile.addEventListener('click',()=>{
        const action=document.querySelector('.city-walk-inspector .city-island-card > .city-approach');
        if(action&&!action.disabled)action.click();
      });
      grid.append(tile);
    }
    if(tile&&tile.disabled!==original.disabled)tile.disabled=original.disabled;
  }
  function syncLearningLink() {
    const card=document.querySelector('.city-walk-inspector .city-mission-card');
    if(!card||card.querySelector('[data-city-learning-experience]'))return;
    const link=document.createElement('a');
    link.dataset.cityLearningExperience='';
    link.href='/api/city-experience';
    link.target='_blank';
    link.rel='noopener';
    link.textContent='Estación 4 · Quiz + Práctica profesional';
    card.append(link);
  }
  function syncConstructionDistrict() {
    const cards=[...document.querySelectorAll('.city-island-card')];
    const card=cards.find(item=>item.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleUpperCase().includes('CONSTRUCCION'));
    const action=card?.querySelector('.city-approach');
    if(!action||action.dataset.cityDistrictNavigation)return;
    action.dataset.cityDistrictNavigation='construction';
    action.addEventListener('click',()=>setTimeout(()=>{
      const section=document.querySelector('.city-specialty-section');
      const select=section?.querySelector('.city-district-select');
      if(!section||!select)return;
      const option=[...select.options].find(item=>item.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase()==='construccion');
      if(!option)return;
      section.open=true;select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));
      section.scrollIntoView({behavior:'smooth',block:'center'});
    },0));
  }
  const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim();
  const districts={
    'administracion':[-36,-26],
    'agropecuaria y forestal':[-12,-26],
    'alimentacion':[12,-26],
    'construccion':[36,-26],
    'electricidad y sistemas':[-36,0],
    'metalmecanica':[-12,0],
    'mineria y procesos':[12,0],
    'salud y atencion':[36,0],
    'maritimo':[-36,26],
    'turismo':[-12,26],
    'madera y vestuario':[12,26],
    'tecnologias digitales':[36,26]
  };
  let route=null,routeTimer=0,routeSvg=null,routeStatus=null;
  const params=new URLSearchParams(globalThis.location?.search||'');
  const queryRoute=params.get('cityRoute');
  if(queryRoute&&districts[normalize(queryRoute)])route={district:normalize(queryRoute),label:queryRoute,area:params.get('cityArea')||''};

  function pointFromTransform(element){
    const match=element?.style.transform.match(/translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/);
    if(!match)return null;
    return {x:Number(match[1]),y:Number(match[2])};
  }
  function clearRoute(){
    route=null;clearInterval(routeTimer);routeTimer=0;routeSvg?.remove();routeSvg=null;routeStatus?.remove();routeStatus=null;
  }
  function startRoute(){
    const map=document.querySelector('.city-map-overlay');
    if(!map||!route)return;
    if(map.hidden){
      const mapButton=[...document.querySelectorAll('.city-toolbar-actions button')].find(button=>normalize(button.textContent).includes('mapa de la ciudad'));
      mapButton?.click();
      return;
    }
    const marker=[...map.querySelectorAll('.city-map-marker-district')].find(button=>normalize(button.querySelector('span')?.textContent)===route.district);
    const player=map.querySelector('.city-map-you');
    if(!marker||!player)return;
    if(!routeSvg){
      routeSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      routeSvg.classList.add('city-guide-route');
      routeSvg.setAttribute('aria-hidden','true');
      const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
      const arrow=document.createElementNS('http://www.w3.org/2000/svg','marker');
      arrow.id='city-guide-arrow';arrow.setAttribute('viewBox','0 0 12 12');arrow.setAttribute('refX','10');arrow.setAttribute('refY','6');arrow.setAttribute('markerWidth','9');arrow.setAttribute('markerHeight','9');arrow.setAttribute('orient','auto-start-reverse');
      const head=document.createElementNS('http://www.w3.org/2000/svg','path');head.setAttribute('d','M 1 1 L 11 6 L 1 11 z');head.setAttribute('fill','#ffd52a');arrow.append(head);defs.append(arrow);
      const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.classList.add('city-guide-route-line');line.setAttribute('marker-end','url(#city-guide-arrow)');routeSvg.append(defs,line);map.prepend(routeSvg);
      routeStatus=document.createElement('div');routeStatus.className='city-guide-route-status';routeStatus.setAttribute('role','status');routeStatus.setAttribute('aria-live','polite');
      const title=document.createElement('strong');title.className='city-guide-route-title';
      const area=document.createElement('small');area.className='city-guide-route-area';
      const close=document.createElement('button');close.type='button';close.setAttribute('aria-label','Cerrar guía de ruta');close.textContent='×';close.addEventListener('click',clearRoute);
      routeStatus.append(title,area,close);map.append(routeStatus);
    }
    const bounds=map.getBoundingClientRect(),from=pointFromTransform(player),to=pointFromTransform(marker);
    if(!from||!to)return;
    routeSvg.setAttribute('viewBox',`0 0 ${Math.max(1,bounds.width)} ${Math.max(1,bounds.height)}`);
    routeSvg.setAttribute('width',String(bounds.width));routeSvg.setAttribute('height',String(bounds.height));
    routeSvg.querySelector('.city-guide-route-line').setAttribute('d',`M ${from.x} ${from.y} L ${to.x} ${to.y}`);
    const stage=document.querySelector('.city-stage');
    const playerX=Number(stage?.dataset.playerX),playerZ=Number(stage?.dataset.playerZ);
    const [targetX,targetZ]=districts[route.district];
    const arrived=Number.isFinite(playerX)&&Number.isFinite(playerZ)&&Math.hypot(playerX-targetX,playerZ-targetZ)<8;
    routeStatus.querySelector('.city-guide-route-title').textContent=`Ruta amarilla · ${marker.querySelector('span')?.textContent||route.label}`;
    routeStatus.querySelector('.city-guide-route-area').textContent=`${route.area?`Premio: ${route.area} · `:''}${arrived?'Llegaste al distrito':'Sigue la ruta en el mapa 3D'}`;
    if(!routeTimer)routeTimer=setInterval(startRoute,120);
  }
  function syncPanel() {
    syncMiningTile();syncLearningLink();syncConstructionDistrict();
    if(route)startRoute();
  }
  if(route){
    const originalMap=document.querySelector('.city-map-overlay');
    if(originalMap?.hidden){
      const mapButton=[...document.querySelectorAll('.city-toolbar-actions button')].find(button=>normalize(button.textContent).includes('mapa de la ciudad'));
      mapButton?.click();
    }
  }
  const guideObserver=new MutationObserver(syncPanel);
  guideObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','hidden']});
  syncPanel();
})();
