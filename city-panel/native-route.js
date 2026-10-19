/* Read-only navigation bridge: uses the existing world and its quiz progression. */
(() => {
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let context,root,geometry,material,panel,label,action,current=null,last=0,room=null,error='';
  let keyHint;
  const originalSigns=[];
  const arrows=[];
  function progress(event){
    const data=event.detail;
    if(!data||!Array.isArray(data.questions)||!data.answers||typeof data.specialty!=='string')return;
    current=data;last=0;
  }
  addEventListener('aulatp:quiz-progress',progress);
  function dispose(){
    root?.removeFromParent();geometry?.dispose();material?.dispose();
    for(const [sign,visible] of originalSigns){sign.visible=visible;delete sign.userData.cityLegacyQuizStationSign;delete sign.userData.cityLegacyQuizStageSign;}
    originalSigns.length=0;
    root=geometry=material=null;arrows.length=0;panel?.remove();panel=label=action=null;
    document.querySelectorAll('.city-door-action[data-city-quiz-station]').forEach(button=>button.removeAttribute('data-city-quiz-station'));
    document.documentElement.classList.remove('city-native-route-active');
  }
  function create(ctx){
    const T=ctx.three;
    root=new T.YJl();root.name='Aula TP · flechas de quizzes';
    geometry=new T.iNn(.09,.025,.48);material=new T.V9B({color:0xffd400,toneMapped:false,depthWrite:false});
    for(let i=0;i<64;i++){
      const arrow=new T.YJl();
      for(const side of [-1,1]){const mesh=new T.eaF(geometry,material);mesh.position.set(side*.13,0,-.05);mesh.rotation.y=-side*.64;arrow.add(mesh);}
      arrow.visible=false;root.add(arrow);arrows.push(arrow);
    }
    ctx.scene.add(root);
    hideQuizPhaseSigns(ctx);
    panel=document.createElement('section');panel.className='city-native-guide';panel.setAttribute('aria-live','polite');
    label=document.createElement('strong');keyHint=document.createElement('kbd');keyHint.textContent='E';keyHint.setAttribute('aria-label','Presiona E para abrir el quiz');
    action=document.createElement('button');action.type='button';action.textContent='Abrir quiz de mi módulo';
    action.addEventListener('click',()=>{
      const button=[...document.querySelectorAll('.city-viewport button')].find(item=>normalize(item.textContent).includes('desafio profesional'));
      if(button)button.click();
    });
    panel.append(label,keyHint,action);document.querySelector('.city-viewport')?.append(panel);
    document.documentElement.classList.add('city-native-route-active');
  }
  function hideQuizPhaseSigns(ctx){
    const phases=['observar','planificar','verificar'];
    const T=ctx.three,stations=(ctx.phaseStations||[]).filter(station=>phases.includes(normalize(station.phase))&&Number.isFinite(station.x)&&Number.isFinite(station.z));
    const position=new T.Pq0(),roomPosition=ctx.room.getWorldPosition(new T.Pq0());
    const hidden=new Set();
    const hide=node=>{
      if(hidden.has(node))return;
      hidden.add(node);originalSigns.push([node,node.visible]);node.visible=false;node.userData.cityLegacyQuizStageSign=true;
    };
    const candidates=[];
    ctx.scene.traverse(node=>{
      const size=node.geometry?.parameters;
      if(!node.isMesh||!node.userData?.luminousSign||!size||size.width<1.8||size.width>2.5||size.height<.25||size.height>.45)return;
      node.getWorldPosition(position);
      if(Math.abs(position.x-roomPosition.x)<9&&Math.abs(position.z-roomPosition.z)<11&&Math.abs(position.y-roomPosition.y)<3.5)candidates.push({node,x:position.x,y:position.y,z:position.z,width:size.width});
    });
    let signGroup=null,groupDistance=Infinity;
    for(const first of candidates){
      const group=candidates.filter(item=>Math.abs(item.y-first.y)<.08&&Math.abs(item.z-first.z)<.08).sort((a,b)=>a.x-b.x);
      for(let start=0;start<=group.length-3;start++){
        const row=group.slice(start,start+3),gaps=[row[1].x-row[0].x,row[2].x-row[1].x];
        if(gaps.some(gap=>gap<2.1||gap>2.7))continue;
        const centerX=(row[0].x+row[2].x)/2,distance=Math.hypot(centerX-roomPosition.x,row[0].y-roomPosition.y,row[0].z-roomPosition.z);
        if(distance<groupDistance){groupDistance=distance;signGroup=row;}
      }
    }
    for(const item of signGroup||[])hide(item.node);
    ctx.scene.traverse(node=>{
      if(!node.isMesh||!node.userData?.luminousSign||node.geometry?.parameters?.width!==1.16)return;
      node.getWorldPosition(position);
      const station=stations.find(item=>Math.abs(position.x-(ctx.district.x+item.x))<.03&&Math.abs(position.y-(ctx.floorY+1.62))<.12&&Math.abs(position.z-(ctx.district.z+item.z))<.03);
      if(station)hide(node);
    });
  }
  function next(data){return data.questions.findIndex(question=>!data.answers[question.id]?.correct);}
  function selectedStation(stations,index,question){
    const object=normalize(question?.object);
    return stations.find(station=>object&&normalize(station.name||station.title||station.label)===object)||stations[index%stations.length];
  }
  function path(ctx,target){
    if(!globalThis.Graph||!globalThis.astar)return [];
    const step=.3,x0=ctx.district.x-6.9,z0=ctx.district.z-5.7,nx=44,nz=36,y=ctx.floorY+.6;
    const blocks=ctx.colliders.filter(item=>y>=(item.minY??-Infinity)&&y<=(item.maxY??Infinity));
    const weights=Array.from({length:nx},(_,x)=>Array.from({length:nz},(_,z)=>blocks.some(block=>Math.abs(x0+x*step-block.x)<block.halfX+.32&&Math.abs(z0+z*step-block.z)<block.halfZ+.32)?0:1));
    const graph=new Graph(weights,{diagonal:false});
    function nearest(point,radius){let best=null,distance=Infinity;
      for(let x=0;x<nx;x++)for(let z=0;z<nz;z++)if(weights[x][z]){const delta=Math.hypot(x0+x*step-point.x,z0+z*step-point.z);if(delta<distance&&delta<=radius){distance=delta;best=graph.grid[x][z];}}
      return best;
    }
    const start=nearest(ctx.player,1.3),end=nearest(target,1.7);
    if(!start||!end)return [];
    return astar.search(graph,start,end).map(node=>({x:x0+node.x*step,z:z0+node.y*step}));
  }
  function frame(ctx){
    try{
      context=ctx;
      if(!ctx.indoors||!ctx.room||!ctx.stations.length){if(root)dispose();room=null;return;}
      if(room!==ctx.room){dispose();room=ctx.room;last=0;if(current&&normalize(current.specialty)!==normalize(ctx.specialty.name))current=null;}
      if(!root)create(ctx);
      if(ctx.map||Math.abs(ctx.player.y-ctx.floorY)>.65){root.visible=false;panel.hidden=true;return;}
      root.visible=true;panel.hidden=false;
      const now=performance.now();if(now-last<250)return;last=now;
      document.querySelectorAll('.city-viewport .city-door-action[data-city-quiz-station]').forEach(button=>button.removeAttribute('data-city-quiz-station'));
      const stationAction=[...document.querySelectorAll('.city-viewport .city-door-action')].find(button=>/^\s*\d+\s*[·.)-]/.test(button.textContent));
      stationAction?.setAttribute('data-city-quiz-station','true');
      const data=current&&normalize(current.specialty)===normalize(ctx.specialty.name)?current:null;
      const index=data?next(data):0;
      arrows.forEach(arrow=>arrow.visible=false);
      if(index<0){label.textContent='Quiz completado · revisa tu resultado';action.hidden=false;keyHint.hidden=true;return;}
      const station=selectedStation(ctx.stations,index,data?.questions[index]);
      const [dx,dz]=station.totem||[station.x,station.z];
      const target={x:ctx.district.x+dx,z:ctx.district.z+dz};
      if(!Number.isFinite(target.x)||!Number.isFinite(target.z))return;
      const approach={x:target.x,z:target.z+.65};
      const points=path(ctx,approach);let arrowIndex=0,travel=0;
      for(let i=1;i<points.length;i++){
        travel+=Math.hypot(points[i].x-points[i-1].x,points[i].z-points[i-1].z);
        if(travel<.75||arrowIndex>=arrows.length)continue;travel=0;
        const arrow=arrows[arrowIndex++];arrow.position.set(points[i].x,ctx.floorY+.035,points[i].z);arrow.rotation.y=Math.atan2(-(points[i].x-points[i-1].x),-(points[i].z-points[i-1].z));arrow.visible=true;
      }
      label.textContent=`Quiz ${index+1} · ${station.equipment||station.name||station.title||station.label||'Puesto de trabajo'}`;
      action.hidden=Math.hypot(ctx.player.x-approach.x,ctx.player.z-approach.z)>2;
      panel.dataset.quiz=String(index+1);panel.dataset.arrows=String(arrowIndex);
      if(!points.length&&action.hidden)label.textContent+=' · acércate al pasillo central';
    }catch(cause){
      // A navigation failure must never stop the original render loop.
      const message=String(cause.message||cause);if(error!==message){error=message;console.warn('Aula TP: guía de quizzes no disponible:',message);}
      if(root)root.visible=false;
    }
  }
  globalThis.AulaTPNativeRoute={frame};
  addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
})();
