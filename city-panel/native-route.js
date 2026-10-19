/* Read-only navigation bridge: uses the existing world and its quiz progression. */
(() => {
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let context,root,geometry,material,panel,label,action,quizNav,current=null,last=0,room=null,error='',generation=0;
  let stationQuestionSignature='';
  const originalSigns=[];
  const arrows=[];
  const quizMarkers=[];
  const stageAnchors=[];
  let roomStations=[];
  let markerGeometry,markerImageGeometry,markerHaloGeometry,markerHaloTexture,markerHaloMaterial,markerBeamGeometry,markerBeamTexture,markerBeamMaterial,markerSparkGeometry,markerSparkTexture,markerSparkMaterial,markerCylinderGeometry,markerCylinderMaterial;
  const beams=[],sparkles=[],cylinders=[],quizImages=[];
  function progress(event){
    const data=event.detail;
    if(!data||!Array.isArray(data.questions)||!data.answers||typeof data.specialty!=='string')return;
    current=data;last=0;
    const signature=`${data.moduleId||''}:${JSON.stringify(data.questions.map(question=>[question.id,question.object]))}`;
    if(signature!==stationQuestionSignature&&root){dispose();room=null;}
    stationQuestionSignature=signature;
  }
  addEventListener('aulatp:quiz-progress',progress);
  function dispose(){
    generation++;root?.removeFromParent();geometry?.dispose();material?.dispose();
    markerGeometry?.dispose();markerHaloGeometry?.dispose();markerHaloTexture?.dispose();markerHaloMaterial?.dispose();
    markerBeamGeometry?.dispose();markerBeamTexture?.dispose();markerBeamMaterial?.dispose();beams.length=0;
    markerSparkGeometry?.dispose();markerSparkTexture?.dispose();markerSparkMaterial?.dispose();sparkles.length=0;
    markerImageGeometry?.dispose();markerCylinderGeometry?.dispose();markerCylinderMaterial?.dispose();cylinders.length=0;
    for(const item of quizImages){item.texture.dispose();item.material.dispose();}quizImages.length=0;
    for(const marker of quizMarkers){marker.texture.dispose();marker.material.dispose();}
    quizMarkers.length=0;markerGeometry=markerImageGeometry=markerHaloGeometry=markerHaloTexture=markerHaloMaterial=markerBeamGeometry=markerBeamTexture=markerBeamMaterial=markerSparkGeometry=markerSparkTexture=markerSparkMaterial=markerCylinderGeometry=markerCylinderMaterial=null;
    stageAnchors.length=0;
    roomStations=[];
    for(const [sign,visible,oldGeometry,oldMaterial,oldName] of originalSigns){sign.visible=visible;sign.geometry=oldGeometry;sign.material=oldMaterial;sign.name=oldName;delete sign.userData.cityLegacyQuizStationSign;delete sign.userData.cityLegacyQuizStageSign;delete sign.userData.cityQuizMarker;}
    originalSigns.length=0;
    root=geometry=material=null;arrows.length=0;panel?.remove();panel=label=action=quizNav=null;
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
    label=document.createElement('strong');
    quizNav=document.createElement('nav');quizNav.className='city-native-stations';quizNav.setAttribute('aria-label','Estaciones de quiz del módulo');
    for(let i=0;i<4;i++){
      const button=document.createElement('button');button.type='button';button.dataset.station=String(i);button.textContent=`Quiz ${i+1}`;
      button.addEventListener('click',()=>{
        const data=current&&normalize(current.specialty)===normalize(context?.specialty?.name)?current:null,index=data?next(data):0;
        const active=Math.min(3,Math.floor(index*4/Math.max(1,data?.questions.length||4)));
        if(index<0){label.textContent='Los cuatro quizzes están completados.';return;}
        if(i!==active){label.textContent=`Completa primero el Quiz ${active+1} para continuar.`;return;}
        openProfessionalQuiz();
      });
      quizNav.append(button);
    }
    action=document.createElement('button');action.type='button';action.textContent='Abrir quiz de mi módulo';
    action.addEventListener('click',openProfessionalQuiz);
    panel.append(label,quizNav,action);document.querySelector('.city-viewport')?.append(panel);
    panel.dataset.quizMarkerCount=String(quizMarkers.length);
    document.documentElement.classList.add('city-native-route-active');
  }
  function openProfessionalQuiz(){
    const button=[...document.querySelectorAll('.city-viewport button')].find(item=>normalize(item.textContent).includes('desafio profesional'));
    if(button&&!button.disabled)button.click();
  }
  function syncStationButtons(active,complete=false){
    if(!quizNav)return;
    quizNav.querySelectorAll('button[data-station]').forEach(button=>{
      const station=Number(button.dataset.station),isActive=station===active;
      button.setAttribute('aria-current',isActive?'step':'false');
      button.setAttribute('aria-disabled',complete||!isActive?'true':'false');
      button.classList.toggle('is-current',isActive);
      button.classList.toggle('is-complete',complete||station<active);
      button.classList.toggle('is-locked',!complete&&station>active);
      const title=roomStations[station]?.equipment||roomStations[station]?.name||'Estación de trabajo';
      button.textContent=`Quiz ${station+1}`;
      button.setAttribute('aria-label',`Quiz ${station+1}: ${title}`);
      button.title=`Quiz ${station+1}: ${title}`;
    });
  }
  function hideQuizPhaseSigns(ctx){
    const phases=['observar','planificar','verificar'];
    const T=ctx.three,stations=(ctx.phaseStations||[]).filter(station=>{
      const name=normalize(station.phase||station.name||station.title||station.label);
      return phases.some(phase=>name.includes(phase))&&Number.isFinite(station.x)&&Number.isFinite(station.z);
    });
    const position=new T.Pq0(),roomPosition=ctx.room.getWorldPosition(new T.Pq0());
    const hidden=new Set();
    const hide=node=>{
      if(hidden.has(node))return;
      hidden.add(node);originalSigns.push([node,node.visible,node.geometry,node.material,node.name]);node.visible=false;node.userData.cityLegacyQuizStageSign=true;
    };
    const candidates=[];
    ctx.scene.traverse(node=>{
      const size=node.geometry?.parameters;
      if(!node.userData?.luminousSign||!size)return;
      node.getWorldPosition(position);
      if(Math.abs(position.x-roomPosition.x)<9&&Math.abs(position.z-roomPosition.z)<11&&Math.abs(position.y-roomPosition.y)<3.5)candidates.push({node,x:position.x,y:position.y,z:position.z,width:size.width,height:size.height});
    });
    const selected=new Set();
    for(const station of stations){
      const references=[[station.x,station.z],[roomPosition.x+station.x,roomPosition.z+station.z],[ctx.district.x+station.x,ctx.district.z+station.z]];
      let nearest=null,distance=Infinity;
      for(const candidate of candidates)for(const [x,z] of references){
        const delta=Math.hypot(candidate.x-x,candidate.z-z);
        if(delta<distance){distance=delta;nearest=candidate;}
      }
      if(nearest&&distance<3.2)selected.add(nearest.node);
    }
    let signGroup=null,groupDistance=Infinity;
    for(const first of candidates){
      if(first.width<1.1||first.width>7||first.height<.15||first.height>2.2)continue;
      const group=candidates.filter(item=>item.width>=1.1&&item.width<=7&&item.height>=.15&&item.height<=2.2&&Math.abs(item.y-first.y)<.12&&Math.abs(item.z-first.z)<.12).sort((a,b)=>a.x-b.x);
      for(let start=0;start<=group.length-3;start++){
        const row=group.slice(start,start+3),gaps=[row[1].x-row[0].x,row[2].x-row[1].x];
        if(gaps.some(gap=>gap<1.2||gap>5.5))continue;
        const centerX=(row[0].x+row[2].x)/2,distance=Math.hypot(centerX-roomPosition.x,row[0].y-roomPosition.y,row[0].z-roomPosition.z);
        if(distance<groupDistance){groupDistance=distance;signGroup=row;}
      }
    }
    for(const item of signGroup||[])selected.add(item.node);
    for(const node of selected){node.getWorldPosition(position);stageAnchors.push({x:position.x,y:position.y,z:position.z});hide(node);}
    stageAnchors.sort((a,b)=>a.x-b.x);
  }
  function configureStations(ctx){
    const source=(ctx.stations||[]).slice(0,4);
    if(!source.length)return [];
    const questions=current&&normalize(current.specialty)===normalize(ctx.specialty.name)?current.questions:[];
    const questionGroups=Array.from({length:4},()=>[]);
    questions.forEach((question,index)=>questionGroups[Math.min(3,Math.floor(index*4/Math.max(1,questions.length)))].push(question));
    const learningObjects=[...new Set(questions.map(question=>String(question.object||'').trim()).filter(Boolean))];
    const result=source.map((station,index)=>({...station,quizQuestion:questionGroups[index]?.[0]||null}));
    const points=result.map(station=>station.totem||[station.x,station.z]);
    const blocked=(x,z)=>ctx.colliders.some(block=>
      ctx.floorY+.6>=(block.minY??-Infinity)&&ctx.floorY+.6<=(block.maxY??Infinity)&&
      Math.abs(x-(block.x-ctx.district.x))<(block.halfX??.5)+.35&&
      Math.abs(z-(block.z-ctx.district.z))<(block.halfZ??.5)+.35
    );
    const offsets=[[1.7,0],[-1.7,0],[0,1.7],[0,-1.7],[1.7,1.7],[-1.7,1.7],[1.7,-1.7],[-1.7,-1.7],[2.5,0],[-2.5,0],[0,2.5],[0,-2.5]];
    while(result.length<4){
      const slot=result.length,base=result[result.length-1],basePoint=base.totem||[base.x,base.z],
        origin=[Number(basePoint[0])||0,Number(basePoint[1])||0];
      const candidate=offsets.map(([dx,dz])=>[origin[0]+dx,origin[1]+dz]).find(([x,z])=>
        Math.abs(x)<=5.5&&Math.abs(z)<=4.8&&
        points.every(point=>Math.hypot(x-point[0],z-point[1])>=1.45)&&!blocked(x,z)
      );
      const [x,z]=candidate||[
        Math.max(-5.3,Math.min(5.3,origin[0]+(slot%2?1:-1)*1.7)),
        Math.max(-4.5,Math.min(4.5,origin[1]+(slot>1?1:-1)*1.7))
      ];
      const learningObject=learningObjects[slot],quizQuestion=questionGroups[slot]?.[0]||null;
      result.push({...base,name:learningObject||`Aplicación práctica ${slot+1}`,equipment:learningObject||`Aplicación práctica ${slot+1}`,totem:[x,z],quizQuestion,cityGeneratedStation:true});
      points.push([x,z]);
    }
    return result;
  }
  function specialtyPhoto(name){
    const value=normalize(name);
    const photos={
      administracion:'meeting',contabilidad:'accounting',agropecuaria:'crops',forestal:'forestry',
      'elaboracion industrial de alimentos':'food',gastronomia:'cooking',construccion:'construction',
      'instalaciones sanitarias':'plumbing','montaje industrial':'assembly','construcciones metalicas':'welding',
      electricidad:'electrical',electronica:'electronics','refrigeracion y climatizacion':'cooling',
      'dibujo tecnico':'drawing',grafica:'printing','mecanica automotriz':'tools','mecanica industrial':'machining',
      'mecanica de mantenimiento de aeronaves':'aircraft','explotacion minera':'mining','asistencia en geologia':'geology',
      'metalurgia extractiva':'metallurgy','quimica industrial':'laboratory','atencion de enfermeria':'nursing',
      'atencion de parvulos':'preschool',acuicultura:'aquaculture','operaciones portuarias':'port',pesqueria:'fishing',
      'tripulacion de naves mercantes y especiales':'ship','servicios de hoteleria':'hotel','servicios de turismo':'tourism',
      'muebles y terminaciones en madera':'furniture','vestuario y confeccion textil':'textile',
      'conectividad y redes':'network',programacion:'programming',telecomunicaciones:'telecom'
    };
    return photos[value]||'tools';
  }
  function stationImageUrl(ctx,station){
    const script=document.querySelector('script[src*="native-route.js"]'),base=new URL('./assets/specialties/',script?.src||location.href);
    const image=station.quizQuestion?.image;
    if(typeof image==='string'&&image.trim()){
      try{const candidate=new URL(image,location.href);if(candidate.origin===location.origin&&/^https?:$/.test(candidate.protocol))return candidate.href;}catch{}
    }
    return new URL(`${specialtyPhoto(ctx.specialty.name)}.webp`,base).href;
  }
  function createStationImage(ctx,station,displayX,displayZ,floorY,token){
    const image=new Image();image.decoding='async';image.src=stationImageUrl(ctx,station);
    image.onload=()=>{
      if(token!==generation||!root)return;
      const T=ctx.three,texture=new T.GOR(image);texture.colorSpace=T.er$;texture.anisotropy=4;
      const imageMaterial=new T.V9B({map:texture,transparent:false,depthTest:false,depthWrite:false,toneMapped:false,side:T.$EB});
      const imageMesh=new T.eaF(markerImageGeometry,imageMaterial);imageMesh.position.set(displayX,floorY+.43,displayZ);imageMesh.renderOrder=19;imageMesh.userData.cityQuizImage=true;root.add(imageMesh);
      quizImages.push({mesh:imageMesh,texture,material:imageMaterial});
    };
  }
  function createQuizMarkers(ctx){
    const T=ctx.three,stations=roomStations=configureStations(ctx);
    if(!stations.length)return;
    markerGeometry=new T.bdM(2.05,.62);
    markerImageGeometry=new T.bdM(1.18,.76);
    markerHaloGeometry=new T.bdM(2.25,2.25);
    const haloCanvas=document.createElement('canvas');haloCanvas.width=256;haloCanvas.height=256;
    const haloContext=haloCanvas.getContext('2d'),glow=haloContext.createRadialGradient(128,128,24,128,128,124);
    glow.addColorStop(0,'rgba(0,210,255,.72)');glow.addColorStop(.44,'rgba(0,174,255,.36)');glow.addColorStop(1,'rgba(0,174,255,0)');
    haloContext.fillStyle=glow;haloContext.fillRect(0,0,256,256);
    haloContext.save();haloContext.shadowColor='#17cfff';haloContext.shadowBlur=22;haloContext.strokeStyle='#34dcff';haloContext.lineWidth=10;
    haloContext.beginPath();haloContext.ellipse(128,128,101,76,0,0,Math.PI*2);haloContext.stroke();haloContext.shadowBlur=0;
    haloContext.strokeStyle='#e5fbff';haloContext.lineWidth=4;haloContext.beginPath();haloContext.ellipse(128,128,94,69,0,0,Math.PI*2);haloContext.stroke();haloContext.restore();
    markerHaloTexture=new T.GOR(haloCanvas);markerHaloTexture.colorSpace=T.er$;
    markerHaloMaterial=new T.V9B({map:markerHaloTexture,transparent:true,depthWrite:false,toneMapped:false,side:T.$EB});
    markerBeamGeometry=new T.bdM(.42,1.8);
    const beamCanvas=document.createElement('canvas');beamCanvas.width=128;beamCanvas.height=512;
    const beamContext=beamCanvas.getContext('2d'),beamWidth=beamContext.createLinearGradient(0,0,128,0);
    beamWidth.addColorStop(0,'rgba(0,214,255,0)');beamWidth.addColorStop(.36,'rgba(0,214,255,.22)');beamWidth.addColorStop(.5,'rgba(143,245,255,.62)');beamWidth.addColorStop(.64,'rgba(0,214,255,.22)');beamWidth.addColorStop(1,'rgba(0,214,255,0)');
    beamContext.fillStyle=beamWidth;beamContext.fillRect(0,0,128,512);beamContext.globalCompositeOperation='destination-in';
    const beamHeight=beamContext.createLinearGradient(0,0,0,512);beamHeight.addColorStop(0,'rgba(255,255,255,0)');beamHeight.addColorStop(.16,'rgba(255,255,255,.9)');beamHeight.addColorStop(.82,'rgba(255,255,255,.9)');beamHeight.addColorStop(1,'rgba(255,255,255,0)');
    beamContext.fillStyle=beamHeight;beamContext.fillRect(0,0,128,512);
    markerBeamTexture=new T.GOR(beamCanvas);markerBeamTexture.colorSpace=T.er$;
    markerBeamMaterial=new T.V9B({map:markerBeamTexture,transparent:true,opacity:.72,depthTest:false,depthWrite:false,toneMapped:false,side:T.$EB});
    markerSparkGeometry=new T.bdM(.12,.12);
    const sparkCanvas=document.createElement('canvas');sparkCanvas.width=64;sparkCanvas.height=64;
    const sparkContext=sparkCanvas.getContext('2d'),sparkGlow=sparkContext.createRadialGradient(32,32,2,32,32,30);
    sparkGlow.addColorStop(0,'rgba(255,255,255,.98)');sparkGlow.addColorStop(.2,'rgba(143,246,255,.9)');sparkGlow.addColorStop(.56,'rgba(0,193,255,.4)');sparkGlow.addColorStop(1,'rgba(0,193,255,0)');
    sparkContext.fillStyle=sparkGlow;sparkContext.fillRect(0,0,64,64);
    markerSparkTexture=new T.GOR(sparkCanvas);markerSparkTexture.colorSpace=T.er$;
    markerSparkMaterial=new T.V9B({map:markerSparkTexture,transparent:true,depthWrite:false,toneMapped:false,side:T.$EB});
    const Cylinder=Object.values(T).find(value=>typeof value==='function'&&value.name==='CylinderGeometry');
    markerCylinderGeometry=Cylinder?new Cylinder(.075,.075,.58,12):new T.iNn(.13,.58,.13);
    markerCylinderMaterial=new T.V9B({color:0x19c9eb,toneMapped:false,transparent:true,opacity:.86,depthWrite:false});
    const floorY=ctx.floorY+.035;
    const playerZ=ctx.player.z,anchorCenterZ=stageAnchors.length?stageAnchors.reduce((sum,anchor)=>sum+anchor.z,0)/stageAnchors.length:null;
    const anchorCenterX=stageAnchors.length?stageAnchors.reduce((sum,anchor)=>sum+anchor.x,0)/stageAnchors.length:null;
    const forward=anchorCenterZ===null?0:Math.sign(playerZ-anchorCenterZ)*5.9;
    const haloOffset=anchorCenterZ===null?0:Math.sign(playerZ-anchorCenterZ)*1.8;
    const mobileViewport=window.innerWidth<700,mobileShiftX=mobileViewport?-.45:0,token=generation;
    const markerScale=Math.min(1.45,Math.max(1,1200/window.innerWidth));
    stations.forEach((station,index)=>{
      const [dx,dz]=station.totem||[station.x,station.z],x=ctx.district.x+dx,z=ctx.district.z+dz;
      if(!Number.isFinite(x)||!Number.isFinite(z))return;
      const anchor=stageAnchors[index],displayX=anchor?anchorCenterX+.9+mobileShiftX+(anchor.x-anchorCenterX)*1.8:x+mobileShiftX,displayZ=anchor?anchor.z+forward:z;
      const halo=new T.eaF(markerHaloGeometry,markerHaloMaterial);halo.name=`Aula TP · halo Quiz ${index+1}`;
      halo.position.set(displayX,floorY,displayZ+haloOffset);halo.rotation.x=-Math.PI/2;root.add(halo);
      for(let sparkle=0;sparkle<6;sparkle++){
        const angle=sparkle*Math.PI/3,light=new T.eaF(markerSparkGeometry,markerSparkMaterial);
        light.position.set(displayX+Math.cos(angle)*1.04,floorY+.045,displayZ+haloOffset+Math.sin(angle)*.72);
        light.rotation.x=-Math.PI/2;light.renderOrder=2;root.add(light);sparkles.push(light);
      }
      const beam=new T.eaF(markerBeamGeometry,markerBeamMaterial);beam.name=`Aula TP · haz Quiz ${index+1}`;
      beam.position.set(displayX,floorY+.94,displayZ+haloOffset*.55);root.add(beam);beam.renderOrder=19;beams.push(beam);
      const cylinder=new T.eaF(markerCylinderGeometry,markerCylinderMaterial);cylinder.name=`Aula TP · soporte Quiz ${index+1}`;
      cylinder.position.set(displayX,floorY+.77,displayZ);root.add(cylinder);cylinders.push(cylinder);
      createStationImage(ctx,station,displayX,displayZ,floorY,token);
      const canvas=document.createElement('canvas');canvas.width=1050;canvas.height=320;
      const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);
      c.shadowColor='#00c9ff';c.shadowBlur=24;c.fillStyle='rgba(248,253,255,.9)';c.strokeStyle='#18c9ed';c.lineWidth=10;
      c.beginPath();c.roundRect(24,24,1002,272,62);c.fill();c.stroke();c.shadowBlur=0;
      c.textAlign='left';c.textBaseline='middle';c.fillStyle='#102d62';c.font='900 64px Arial';c.fillText(`Quiz ${index+1}`,76,112);
      c.fillStyle='#345477';c.font='600 40px Arial';
      const title=String(station.equipment||station.name||station.title||station.label||'Puesto de trabajo');
      c.fillText(title.length>38?`${title.slice(0,35)}...`:title,76,220,760);
      const texture=new T.GOR(canvas);texture.colorSpace=T.er$;texture.anisotropy=4;
      const signMaterial=new T.V9B({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,side:T.$EB});
      const sign=new T.eaF(markerGeometry,signMaterial);
      sign.position.set(displayX,ctx.floorY+(mobileViewport ? 1.14 : 1.38),displayZ);sign.scale.setScalar(markerScale);root.add(sign);
      sign.material=signMaterial;sign.name=`Aula TP · Quiz ${index+1} · ${title}`;sign.renderOrder=20;sign.userData.cityQuizMarker=index+1;
      quizMarkers.push({sign,texture,material:signMaterial});
    });
  }
  function next(data){return data.questions.findIndex(question=>!data.answers[question.id]?.correct);}
  function selectedStation(stations,index,total){
    const stationIndex=Math.min(stations.length-1,Math.floor(index*stations.length/Math.max(1,total)));
    return {station:stations[stationIndex],index:stationIndex};
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
      for(const marker of quizMarkers){const facing=Math.atan2(ctx.player.x-marker.sign.position.x,ctx.player.z-marker.sign.position.z);marker.sign.rotation.y=facing;}
      for(const beam of beams)beam.rotation.y=Math.atan2(ctx.player.x-beam.position.x,ctx.player.z-beam.position.z);
      for(const item of quizImages)item.mesh.rotation.y=Math.atan2(ctx.player.x-item.mesh.position.x,ctx.player.z-item.mesh.position.z);
      document.querySelectorAll('.city-viewport .city-door-action[data-city-quiz-station]').forEach(button=>button.removeAttribute('data-city-quiz-station'));
      const stationAction=[...document.querySelectorAll('.city-viewport .city-door-action')].find(button=>/^\s*\d+\s*[·.)-]/.test(button.textContent));
      stationAction?.setAttribute('data-city-quiz-station','true');
      const data=current&&normalize(current.specialty)===normalize(ctx.specialty.name)?current:null;
      const index=data?next(data):0;
      arrows.forEach(arrow=>arrow.visible=false);
      if(index<0){label.textContent='Quizzes completados · revisa tu resultado';action.hidden=true;syncStationButtons(-1,true);return;}
      const {station, index:stationIndex}=selectedStation(roomStations,index,data?.questions.length||roomStations.length);
      syncStationButtons(stationIndex);
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
      const title=station.equipment||station.name||station.title||station.label||'Puesto de trabajo';
      label.textContent=data&&data.questions.length>roomStations.length?`Estación ${stationIndex+1} · Quiz ${index+1}/${data.questions.length} · ${title}`:`Quiz ${stationIndex+1} · ${title}`;
      action.hidden=Math.hypot(ctx.player.x-approach.x,ctx.player.z-approach.z)>2;
      panel.dataset.quiz=String(index+1);panel.dataset.arrows=String(arrowIndex);
      if(!points.length&&action.hidden)label.textContent+=' · acércate al pasillo central';
    }catch(cause){
      // A navigation failure must never stop the original render loop.
      const message=String(cause.message||cause);if(error!==message){error=message;console.warn('Aula TP: guía de quizzes no disponible:',message);}
      if(root)root.visible=false;
    }
  }
  globalThis.AulaTPNativeRoute={frame,status:()=>({quizMarkers:quizMarkers.length,quiz:panel?.dataset.quiz||null,stations:roomStations.length,quizButtons:quizNav?.querySelectorAll('button').length||0})};
  addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
})();
