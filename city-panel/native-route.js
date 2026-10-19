/* Read-only navigation bridge: uses the existing world and its quiz progression. */
(() => {
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let context,root,geometry,material,panel,label,action,current=null,last=0,room=null,error='';
  let keyHint;
  const originalSigns=[];
  const arrows=[];
  const quizMarkers=[];
  let markerGeometry,markerHaloGeometry,markerHaloTexture,markerHaloMaterial;
  function progress(event){
    const data=event.detail;
    if(!data||!Array.isArray(data.questions)||!data.answers||typeof data.specialty!=='string')return;
    current=data;last=0;
  }
  addEventListener('aulatp:quiz-progress',progress);
  function dispose(){
    root?.removeFromParent();geometry?.dispose();material?.dispose();
    markerGeometry?.dispose();markerHaloGeometry?.dispose();markerHaloTexture?.dispose();markerHaloMaterial?.dispose();
    for(const marker of quizMarkers){marker.texture.dispose();marker.material.dispose();}
    quizMarkers.length=0;markerGeometry=markerHaloGeometry=markerHaloTexture=markerHaloMaterial=null;
    for(const [sign,visible,oldGeometry,oldMaterial,oldName] of originalSigns){sign.visible=visible;sign.geometry=oldGeometry;sign.material=oldMaterial;sign.name=oldName;delete sign.userData.cityLegacyQuizStationSign;delete sign.userData.cityLegacyQuizStageSign;delete sign.userData.cityQuizMarker;}
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
    createQuizMarkers(ctx);
    panel=document.createElement('section');panel.className='city-native-guide';panel.setAttribute('aria-live','polite');
    label=document.createElement('strong');keyHint=document.createElement('kbd');keyHint.textContent='E';keyHint.setAttribute('aria-label','Presiona E para abrir el quiz');
    action=document.createElement('button');action.type='button';action.textContent='Abrir quiz de mi módulo';
    action.addEventListener('click',()=>{
      const button=[...document.querySelectorAll('.city-viewport button')].find(item=>normalize(item.textContent).includes('desafio profesional'));
      if(button)button.click();
    });
    panel.append(label,keyHint,action);document.querySelector('.city-viewport')?.append(panel);
    panel.dataset.quizMarkerCount=String(quizMarkers.length);
    document.documentElement.classList.add('city-native-route-active');
  }
  function hideQuizPhaseSigns(ctx){
    const phases=['observar','planificar','verificar'];
    const T=ctx.three,stations=(ctx.phaseStations||[]).filter(station=>phases.includes(normalize(station.phase))&&Number.isFinite(station.x)&&Number.isFinite(station.z));
    const position=new T.Pq0(),roomPosition=ctx.room.getWorldPosition(new T.Pq0());
    const hidden=new Set();
    const hide=node=>{
      if(hidden.has(node))return;
      hidden.add(node);originalSigns.push([node,node.visible,node.geometry,node.material,node.name]);node.visible=false;node.userData.cityLegacyQuizStageSign=true;
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
  }
  function createQuizMarkers(ctx){
    const T=ctx.three,stations=ctx.stations||[];
    if(!stations.length)return;
    markerGeometry=new T.bdM(2.25,.68);
    markerHaloGeometry=new T.bdM(1.28,1.28);
    const haloCanvas=document.createElement('canvas');haloCanvas.width=256;haloCanvas.height=256;
    const haloContext=haloCanvas.getContext('2d'),glow=haloContext.createRadialGradient(128,128,24,128,128,124);
    glow.addColorStop(0,'rgba(0,210,255,.72)');glow.addColorStop(.44,'rgba(0,174,255,.36)');glow.addColorStop(1,'rgba(0,174,255,0)');
    haloContext.fillStyle=glow;haloContext.fillRect(0,0,256,256);
    markerHaloTexture=new T.GOR(haloCanvas);markerHaloTexture.colorSpace=T.er$;
    markerHaloMaterial=new T.V9B({map:markerHaloTexture,transparent:true,depthWrite:false,toneMapped:false,side:T.$EB});
    const floorY=ctx.floorY+.035;
    const phaseStations=ctx.phaseStations||[],legacySigns=new Map(),worldPosition=new T.Pq0();
    ctx.scene.traverse(node=>{
      if(!node.isMesh||!node.userData?.luminousSign||node.geometry?.parameters?.width!==1.16)return;
      node.getWorldPosition(worldPosition);
      const index=phaseStations.findIndex(item=>Math.abs(worldPosition.x-(ctx.district.x+item.x))<.03&&Math.abs(worldPosition.y-(ctx.floorY+1.62))<.12&&Math.abs(worldPosition.z-(ctx.district.z+item.z))<.03);
      if(index>=0)legacySigns.set(index,node);
    });
    stations.forEach((station,index)=>{
      const [dx,dz]=station.totem||[station.x,station.z],x=ctx.district.x+dx,z=ctx.district.z+dz;
      if(!Number.isFinite(x)||!Number.isFinite(z))return;
      const halo=new T.eaF(markerHaloGeometry,markerHaloMaterial);halo.name=`Aula TP · halo Quiz ${index+1}`;
      halo.position.set(x,floorY,z);halo.rotation.x=-Math.PI/2;root.add(halo);
      const canvas=document.createElement('canvas');canvas.width=1050;canvas.height=320;
      const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);
      c.shadowColor='#00c9ff';c.shadowBlur=24;c.fillStyle='#ffffff';c.strokeStyle='#18c9ed';c.lineWidth=10;
      c.beginPath();c.roundRect(24,24,1002,272,62);c.fill();c.stroke();c.shadowBlur=0;
      c.fillStyle='#eaf8ff';c.beginPath();c.arc(106,160,68,0,Math.PI*2);c.fill();
      c.fillStyle='#075dd8';c.font='900 64px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(index+1),106,160);
      c.textAlign='left';c.fillStyle='#102d62';c.font='900 50px Arial';c.fillText(`Quiz ${index+1}`,202,127);
      c.fillStyle='#345477';c.font='600 31px Arial';
      const title=String(station.equipment||station.name||station.title||station.label||'Puesto de trabajo');
      c.fillText(title.length>34?`${title.slice(0,31)}...`:title,202,208,650);
      c.fillStyle='#e9f8ff';c.beginPath();c.roundRect(876,72,112,176,28);c.fill();
      c.strokeStyle='#37c9ee';c.lineWidth=8;c.stroke();c.fillStyle='#0086a5';c.font='900 82px Arial';c.textAlign='center';c.fillText('E',932,164);
      const texture=new T.GOR(canvas);texture.colorSpace=T.er$;texture.anisotropy=4;
      const signMaterial=new T.V9B({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,side:T.$EB});
      let sign=legacySigns.get(index);
      if(sign){
        if(!originalSigns.some(([old])=>old===sign))originalSigns.push([sign,sign.visible,sign.geometry,sign.material,sign.name]);
        delete sign.userData.cityLegacyQuizStageSign;sign.geometry=markerGeometry;sign.visible=true;
      }else{
        sign=new T.eaF(markerGeometry,signMaterial);sign.position.set(x,ctx.floorY+1.65,z);root.add(sign);
      }
      sign.material=signMaterial;sign.name=`Aula TP · Quiz ${index+1} · ${title}`;sign.renderOrder=20;sign.userData.cityQuizMarker=index+1;
      quizMarkers.push({sign,x,z,texture,material:signMaterial});
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
      for(const marker of quizMarkers)marker.sign.rotation.y=Math.atan2(ctx.player.x-marker.x,ctx.player.z-marker.z);
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
  globalThis.AulaTPNativeRoute={frame,status:()=>({quizMarkers:quizMarkers.length,quiz:panel?.dataset.quiz||null})};
  addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
})();
