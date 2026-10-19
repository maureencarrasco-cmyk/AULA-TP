/* Presentation alias only: navigation is still handled by the original control. */
(() => {
  const photoBase=new URL('./assets/specialties/',document.currentScript?.src||'https://www.aulatpchile.cl/ciudad_laboral_aulatp/panel-ui-v1/city-panel.js');
  const engineUrl=new URL('../../engine/index.html',photoBase);
  function syncQuizRouteLink(){
    const moduleId=params.get('cityModuleId');
    const viewport=document.querySelector('.city-viewport');
    const room=document.querySelector('.city-room-summary,.city-open-pilot');
    if(!viewport)return;
    let link=viewport.querySelector('.city-quiz-route-entry');
    if(!room){link?.remove();return;}
    if(link)return;
    link=document.createElement('a');link.className='city-quiz-route-entry';
    const hasModule=/^\d+$/.test(moduleId||'');
    const url=hasModule?new URL(engineUrl):new URL('/api/city-experience',engineUrl);
    if(hasModule)url.search=params.toString();
    const photo=document.querySelector('.city-specialties [aria-pressed="true"]')?.dataset?.cityPhoto;
    if(photo)url.searchParams.set('cityPhoto',photo);
    link.href=url.href;link.textContent=hasModule?'Recorrido 3D de quizzes →':'Elegir módulo para el recorrido de quizzes →';viewport.append(link);
  }
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
  function syncGuideButton() {
    const card=document.querySelector('.city-walk-inspector .city-mission-card');
    if(!card||card.querySelector('[data-city-guide-start]'))return;
    const button=document.createElement('button');
    button.type='button';button.dataset.cityGuideStart='';button.className='city-guide-action';button.textContent='Guiarme a mi distrito';
    button.addEventListener('click',()=>{
      const select=document.querySelector('.city-specialty-section select.city-district-select,.city-specialty-section .city-district-select select');
      const label=select?.selectedOptions?.[0]?.textContent?.trim()||'';
      const district=normalize(label);
      if(!districts[district])return;
      clearRoute();route={district,label,area:''};startRoute(true);
    });
    card.append(button);
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
  function specialtyArt(name){
    const value=normalize(name);
    if(/administr|contab/.test(value))return 'office';
    if(/agropec|forest/.test(value))return 'agro';
    if(/alimento|gastronom/.test(value))return 'food';
    if(/constru|instalacion|montaje|metalica/.test(value))return 'construction';
    if(/electric|electron|refrigeracion|climatizacion/.test(value))return 'electric';
    if(/dibujo|grafica|diseno|textil|vestuario/.test(value))return 'design';
    if(/mecanica|aeronave/.test(value))return 'mechanical';
    if(/minera|geologia|metalurgia|quimica/.test(value))return 'mining';
    if(/enfermeria|parvul/.test(value))return 'care';
    if(/acuicultura|portuaria|pesqueria|tripulacion|naves/.test(value))return 'maritime';
    if(/hoteleria|turismo/.test(value))return 'tourism';
    if(/muebles|madera|carpinteria/.test(value))return 'craft';
    if(/conectividad|redes|programacion|telecomunic/.test(value))return 'digital';
    return 'general';
  }
  const specialtyPhotos=Object.fromEntries([
    ['administracion','meeting'],['contabilidad','accounting'],['agropecuaria','crops'],['forestal','forestry'],
    ['elaboracion industrial de alimentos','food'],['gastronomia','cooking'],['construccion','construction'],
    ['instalaciones sanitarias','plumbing'],['montaje industrial','assembly'],['construcciones metalicas','welding'],
    ['electricidad','electrical'],['electronica','electronics'],['refrigeracion y climatizacion','cooling'],
    ['dibujo tecnico','drawing'],['grafica','printing'],['mecanica automotriz','tools'],['mecanica industrial','machining'],
    ['mecanica de mantenimiento de aeronaves','aircraft'],['explotacion minera','mining'],['asistencia en geologia','geology'],
    ['metalurgia extractiva','metallurgy'],['quimica industrial','laboratory'],['atencion de enfermeria','nursing'],
    ['atencion de parvulos','preschool'],['acuicultura','aquaculture'],['operaciones portuarias','port'],['pesqueria','fishing'],
    ['tripulacion de naves mercantes y especiales','ship'],['servicios de hoteleria','hotel'],['servicios de turismo','tourism'],
    ['muebles y terminaciones en madera','furniture'],['vestuario y confeccion textil','textile'],
    ['conectividad y redes','network'],['programacion','programming'],['telecomunicaciones','telecom']
  ]);
  function syncSpecialtyCards(){
    document.querySelectorAll('.city-specialties button').forEach(button=>{
      const title=button.querySelector('.city-specialty-copy strong')?.textContent||'';
      const art=specialtyArt(title);
      if(button.dataset.cityArt!==art)button.dataset.cityArt=art;
      const photo=specialtyPhotos[normalize(title)];
      if(!photo)return;
      let img=button.querySelector('.city-specialty-photo');
      if(!img){
        img=document.createElement('img');img.className='city-specialty-photo';img.alt='';
        img.loading='lazy';img.decoding='async';img.width=640;img.height=384;button.append(img);
      }
      if(button.dataset.cityPhoto!==photo){img.src=new URL(photo+'.webp',photoBase).href;button.dataset.cityPhoto=photo;}
    });
    const section=document.querySelector('.city-specialty-section');
    if(section&&!section.querySelector('.city-photo-credits')){
      const link=document.createElement('a');link.className='city-photo-credits';link.href=new URL('credits.html',photoBase).href;
      link.target='_blank';link.rel='noopener';link.textContent='Fuentes de las fotografías';section.append(link);
    }
  }
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
  let route=null,routeTimer=0,routeSvg=null,routeStatus=null,syncFrame=0;
  let roomGuide=null,roomGuideActive=false,quizClock=null,quizClockLoading='';
  const params=new URLSearchParams(globalThis.location?.search||'');
  const queryRoute=params.get('cityRoute');
  let routeNeedsOpen=Boolean(queryRoute);
  if(queryRoute&&districts[normalize(queryRoute)])route={district:normalize(queryRoute),label:queryRoute,area:params.get('cityArea')||''};

  function pointFromTransform(element){
    const match=element?.style.transform.match(/translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/);
    if(!match)return null;
    return {x:Number(match[1]),y:Number(match[2])};
  }
  function clearRoute(){
    route=null;clearInterval(routeTimer);routeTimer=0;routeSvg?.remove();routeSvg=null;routeStatus?.remove();routeStatus=null;
  }
  async function flushQuizClock(clock=quizClock){
    if(!clock?.pending||clock.saving)return clock?.saving;
    const seconds=Math.min(60,clock.pending,Math.max(0,1200-clock.activeSeconds));
    if(!seconds){clearInterval(clock.timer);return;}
    clock.pending-=seconds;
    clock.saving=(async()=>{
      try{
        const response=await fetch(`/api/modules/${encodeURIComponent(clock.moduleId)}/city-experience`,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':clock.csrf},body:JSON.stringify({operation:'heartbeat',stage:'quiz',seconds})});
        const data=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(data.error||'No se pudo guardar el tiempo del quiz.');
        clock.activeSeconds=Number(data.state?.quiz?.active_seconds)||clock.activeSeconds+seconds;
      }catch(_error){clock.pending+=seconds;}
      finally{clock.saving=null;if(clock.activeSeconds>=1200)clearInterval(clock.timer);}
    })();
    return clock.saving;
  }
  async function startQuizClock(moduleId){
    if(!/^\d+$/.test(String(moduleId||''))||quizClock?.moduleId===String(moduleId)||quizClockLoading===String(moduleId))return;
    quizClockLoading=String(moduleId);
    try{
      const sessionResponse=await fetch('/api/session',{credentials:'same-origin'}),session=await sessionResponse.json();
      if(!roomGuideActive||session.user?.role!=='student'||!session.csrf)return;
      const response=await fetch(`/api/modules/${encodeURIComponent(moduleId)}/city-experience`,{credentials:'same-origin'}),data=await response.json();
      if(!roomGuideActive||!response.ok)return;
      const clock={moduleId:String(moduleId),csrf:session.csrf,activeSeconds:Number(data.state?.quiz?.active_seconds)||0,pending:0,timer:0,saving:null};
      if(clock.activeSeconds>=1200)return;
      quizClock=clock;
      clock.timer=setInterval(()=>{
        if(document.visibilityState!=='visible'||!roomGuideActive||clock.activeSeconds+clock.pending>=1200)return;
        clock.pending++;
        if(clock.pending>=30||clock.activeSeconds+clock.pending>=1200)flushQuizClock(clock);
      },1000);
    }catch(_error){}finally{quizClockLoading='';}
  }
  function stopQuizClock(){
    if(!quizClock)return;
    const clock=quizClock;quizClock=null;clearInterval(clock.timer);flushQuizClock(clock);
  }
  function startRoute(openMap=false){
    const map=document.querySelector('.city-map-overlay');
    if(!map||!route){clearInterval(routeTimer);routeTimer=0;return;}
    if(routeSvg&&routeSvg.parentNode!==map){routeSvg.remove();routeStatus?.remove();routeSvg=null;routeStatus=null;}
    if(document.hidden||map.hidden){
      clearInterval(routeTimer);routeTimer=0;
      if(openMap&&!document.hidden){
        const mapButton=[...document.querySelectorAll('.city-toolbar-actions button')].find(button=>normalize(button.textContent).includes('mapa de la ciudad'));
        mapButton?.click();
      }
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
    const setAttribute=(element,key,value)=>{if(element.getAttribute(key)!==value)element.setAttribute(key,value);};
    setAttribute(routeSvg,'viewBox',`0 0 ${Math.max(1,bounds.width)} ${Math.max(1,bounds.height)}`);
    setAttribute(routeSvg,'width',String(bounds.width));setAttribute(routeSvg,'height',String(bounds.height));
    setAttribute(routeSvg.querySelector('.city-guide-route-line'),'d',`M ${from.x} ${from.y} L ${to.x} ${to.y}`);
    const stage=document.querySelector('.city-stage');
    const playerX=Number(stage?.dataset.playerX),playerZ=Number(stage?.dataset.playerZ);
    const [targetX,targetZ]=districts[route.district];
    const arrived=Number.isFinite(playerX)&&Number.isFinite(playerZ)&&Math.hypot(playerX-targetX,playerZ-targetZ)<8;
    const titleText=`Ruta amarilla · ${marker.querySelector('span')?.textContent||route.label}`;
    const areaText=`${route.area?`Premio: ${route.area} · `:''}${arrived?'Llegaste al distrito':'Sigue la ruta en el mapa 3D'}`;
    const titleNode=routeStatus.querySelector('.city-guide-route-title'),areaNode=routeStatus.querySelector('.city-guide-route-area');
    if(titleNode.textContent!==titleText)titleNode.textContent=titleText;
    if(areaNode.textContent!==areaText)areaNode.textContent=areaText;
    if(!routeTimer)routeTimer=setInterval(startRoute,200);
  }
  function syncRoomGuide(){
    const workspace=document.querySelector('.city-walk-workspace');
    const roomButton=workspace?.querySelector('.city-open-pilot');
    const active=Boolean(roomButton&&!roomButton.hidden&&getComputedStyle(roomButton).display!=='none');
    if(!active){roomGuide?.remove();roomGuide=null;if(roomGuideActive)stopQuizClock();roomGuideActive=false;return;}
    if(roomGuideActive)return;
    roomGuideActive=true;
    const params=new URLSearchParams(globalThis.location?.search||''),courseId=params.get('cityCourseId'),moduleId=params.get('cityModuleId');
    if(moduleId)startQuizClock(moduleId);
    const course=params.get('cityCourse')||'tu especialidad',module=params.get('cityModule')||'tu módulo';
    const guide=document.createElement('section');guide.className='city-quiz-guide';guide.setAttribute('role','dialog');guide.setAttribute('aria-labelledby','city-quiz-guide-title');
    const kicker=document.createElement('p');kicker.className='city-quiz-guide-kicker';kicker.textContent='Recorrido de aprendizaje';
    const title=document.createElement('h2');title.id='city-quiz-guide-title';title.textContent='¡Comencemos!';
    const copy=document.createElement('p');copy.textContent=`En ${course}, recorre el espacio laboral y resuelve en orden los 10 quizzes de ${module}. Cada respuesta habilita el siguiente desafío.`;
    const structure=document.createElement('p');structure.className='city-quiz-guide-structure';structure.textContent='Etapa 1 · 20 min · 4 fáciles · 5 intermedios · 1 avanzado';
    const context=document.createElement('p');context.className='city-quiz-guide-context';context.textContent=`Especialidad: ${course} · Módulo: ${module}`;
    const skills=document.createElement('ul');skills.className='city-quiz-guide-skills';
    for(const label of ['Modelar','Argumentar','Representar']){const item=document.createElement('li');item.textContent=label;skills.append(item);}
    const actions=document.createElement('div');actions.className='city-quiz-guide-actions';
    if(courseId&&moduleId){
      const link=document.createElement('a');link.href=`/api/city-experience?course=${encodeURIComponent(courseId)}&module=${encodeURIComponent(moduleId)}`;link.target='_blank';link.rel='noopener';link.textContent='Abrir quizzes del módulo';actions.append(link);
    }
    const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent='Entendido';dismiss.addEventListener('click',()=>{guide.remove();roomGuide=null;});actions.append(dismiss);
    guide.append(kicker,title,copy,structure,context,skills,actions);workspace.querySelector('.city-viewport')?.append(guide);roomGuide=guide;
  }
  function syncPanel() {
    if(!document.querySelector('.city-viewport canvas'))return;
    syncMiningTile();syncLearningLink();syncGuideButton();syncConstructionDistrict();syncSpecialtyCards();
    syncRoomGuide();
    syncQuizRouteLink();
    if(route&&document.querySelector('.city-map-overlay')){startRoute(routeNeedsOpen);routeNeedsOpen=false;}
  }
  function relevantMutation(record){
    const target=record.target;
    if(record.type==='attributes')return Boolean(target.matches?.('.city-approach,.city-open-pilot,.city-map-overlay'));
    if(target.closest?.('.city-specialties'))return true;
    const selectors='.city-walk-inspector,.city-walk-workspace,.city-specialties,.city-map-overlay,.city-open-pilot,.city-room-summary,.city-island-card,.city-mission-card,.city-specialty-section,canvas';
    return [...record.addedNodes,...record.removedNodes].some(node=>node.nodeType===1&&(node.matches(selectors)||node.querySelector(selectors)));
  }
  function schedulePanelSync(records){
    // HUD text and loading progress change frequently but do not change panel controls.
    if(document.hidden||records?.length&&!records.some(relevantMutation))return;
    if(typeof requestAnimationFrame!=='function'){syncPanel();return;}
    if(!syncFrame)syncFrame=requestAnimationFrame(()=>{syncFrame=0;syncPanel();});
  }
  const guideObserver=new MutationObserver(schedulePanelSync);
  guideObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','hidden']});
  document.addEventListener?.('visibilitychange',()=>{
    if(document.hidden){flushQuizClock();clearInterval(routeTimer);routeTimer=0;}
    else{schedulePanelSync();if(roomGuideActive){const id=new URLSearchParams(globalThis.location?.search||'').get('cityModuleId');if(id)startQuizClock(id);}}
  });
  globalThis.addEventListener?.('pagehide',()=>flushQuizClock());
  syncPanel();
})();
