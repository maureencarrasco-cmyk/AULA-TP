/* Quiz stations, legacy fixture cleanup, and navigation for the existing world. */
(() => {
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let root,geometry,material,current=null,last=0,room=null,error='',generation=0;
  let stationQuestionSignature='';
  let quizControlLayer=null,quizWindow=null,activeQuizNumber=null;
  const originalSigns=[];
  const arrows=[];
  const quizMarkers=[];
  const quizControls=[];
  const stageAnchors=[];
  let roomStations=[];
  let markerGeometry,markerImageGeometry,markerHaloGeometry,markerHaloTexture,markerHaloMaterial,markerBeamGeometry,markerBeamTexture,markerBeamMaterial,markerSparkGeometry,markerSparkTexture,markerSparkMaterial,markerCylinderGeometry,markerCylinderMaterial;
  const beams=[],sparkles=[],cylinders=[];
  function progress(event){
    const data=event.detail;
    if(!data||!Array.isArray(data.questions)||!data.answers||typeof data.specialty!=='string')return;
    const openNumber=activeQuizNumber;
    current=data;last=0;
    const signature=`${data.moduleId||''}:${data.ae||''}:${JSON.stringify(data.questions.map(question=>[question.id,question.object,question.difficulty]))}`;
    if(signature!==stationQuestionSignature&&root){dispose();room=null;}
    stationQuestionSignature=signature;
    if(openNumber)openQuizWindow(openNumber);
  }
  addEventListener('aulatp:quiz-progress',progress);
  function dispose(){
    generation++;root?.removeFromParent();geometry?.dispose();material?.dispose();
    markerGeometry?.dispose();markerImageGeometry?.dispose();markerHaloGeometry?.dispose();markerHaloTexture?.dispose();markerHaloMaterial?.dispose();
    markerBeamGeometry?.dispose();markerBeamTexture?.dispose();markerBeamMaterial?.dispose();beams.length=0;
    markerSparkGeometry?.dispose();markerSparkTexture?.dispose();markerSparkMaterial?.dispose();sparkles.length=0;
    markerCylinderGeometry?.dispose();markerCylinderMaterial?.dispose();cylinders.length=0;
    for(const marker of quizMarkers){marker.texture.dispose();marker.material.dispose();marker.imageTexture?.dispose();marker.imageMaterial?.dispose();}
    quizMarkers.length=0;markerGeometry=markerImageGeometry=markerHaloGeometry=markerHaloTexture=markerHaloMaterial=markerBeamGeometry=markerBeamTexture=markerBeamMaterial=markerSparkGeometry=markerSparkTexture=markerSparkMaterial=markerCylinderGeometry=markerCylinderMaterial=null;
    quizControlLayer?.remove();quizControlLayer=null;quizControls.length=0;quizWindow?.remove();quizWindow=null;activeQuizNumber=null;
    stageAnchors.length=0;
    roomStations=[];
    for(const saved of originalSigns){const {sign,visible,geometry,material,name,flag,position,rotation,scale,texture,newMaterial}=saved;sign.visible=visible;sign.geometry=geometry;sign.material=material;sign.name=name;sign.position.copy(position);sign.rotation.copy(rotation);sign.scale.copy(scale);texture?.dispose();if(newMaterial&&newMaterial!==material)newMaterial.dispose();delete sign.userData.cityLegacyQuizStationSign;delete sign.userData.cityLegacyQuizStageSign;delete sign.userData.cityLegacyQuizFurniture;delete sign.userData.cityQuizMarker;delete sign.userData.citySpecialtyPlaque;}
    originalSigns.length=0;
    root=geometry=material=null;arrows.length=0;
    document.querySelectorAll('.city-door-action[data-city-quiz-station]').forEach(button=>button.removeAttribute('data-city-quiz-station'));
    document.documentElement.classList.remove('city-native-route-active');
  }
  function create(ctx){
    const T=ctx.three;
    root=new T.YJl();root.name='Aula TP · flechas de quizzes';
    geometry=new T.iNn(.2,.045,.82);material=new T.V9B({color:0xffd400,toneMapped:false,depthWrite:false});
    for(let i=0;i<4;i++){
      const arrow=new T.YJl();
      for(const side of [-1,1]){const mesh=new T.eaF(geometry,material);mesh.position.set(side*.3,0,-.12);mesh.rotation.y=-side*.68;arrow.add(mesh);}
      arrow.userData.cityQuizNumber=i+1;
      arrow.visible=false;root.add(arrow);arrows.push(arrow);
    }
    ctx.scene.add(root);
    hideQuizPhaseSigns(ctx);
    createQuizMarkers(ctx);
    document.documentElement.classList.add('city-native-route-active');
    if(activeQuizNumber)openQuizWindow(activeQuizNumber);
  }
  function hideQuizPhaseSigns(ctx){
    const phases=['observar','planificar','verificar'];
    const T=ctx.three,stations=(ctx.phaseStations||[]).filter(station=>{
      const name=normalize(station.phase||station.name||station.title||station.label);
      return phases.some(phase=>name.includes(phase))&&Number.isFinite(station.x)&&Number.isFinite(station.z);
    });
    const position=new T.Pq0(),roomPosition=ctx.room.getWorldPosition(new T.Pq0());
    const hidden=new Set();
    const hide=(node,flag='cityLegacyQuizStageSign')=>{
      if(hidden.has(node))return;
      hidden.add(node);originalSigns.push({sign:node,visible:node.visible,geometry:node.geometry,material:node.material,name:node.name,flag,position:node.position.clone(),rotation:node.rotation.clone(),scale:node.scale.clone()});node.visible=false;node.userData[flag]=true;
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
    const specialtyPlaque=candidates.filter(item=>!selected.has(item.node)&&item.width>=3.2&&item.width<=10&&item.height>=.65&&item.height<=3)
      .sort((a,b)=>Math.hypot(a.x-roomPosition.x,a.y-roomPosition.y,a.z-roomPosition.z)-Math.hypot(b.x-roomPosition.x,b.y-roomPosition.y,b.z-roomPosition.z))[0];
    if(specialtyPlaque){const sign=specialtyPlaque.node,saved={sign,visible:sign.visible,geometry:sign.geometry,material:sign.material,name:sign.name,position:sign.position.clone(),rotation:sign.rotation.clone(),scale:sign.scale.clone()};originalSigns.push(saved);redesignSpecialtyPlaque(ctx,sign,roomPosition,saved);}
    hideLegacyQuizFurniture(ctx,hide);
  }
  function redesignSpecialtyPlaque(ctx,sign,roomPosition,saved){
    const T=ctx.three,forward=ctx.camera?.getWorldDirection?ctx.camera.getWorldDirection(new T.Pq0()):new T.Pq0(0,0,-1);
    forward.y=0;forward.normalize();const rightX=-forward.z,rightZ=forward.x;
    const worldPosition=new T.Pq0(roomPosition.x-rightX*4.8,sign.getWorldPosition(new T.Pq0()).y,roomPosition.z-rightZ*4.8);
    sign.parent?.updateMatrixWorld(true);sign.position.copy(sign.parent?sign.parent.worldToLocal(worldPosition):worldPosition);
    sign.rotation.y=Math.atan2(rightX,-rightZ);
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=320;
    const c=canvas.getContext('2d'),gradient=c.createLinearGradient(0,0,1200,320);gradient.addColorStop(0,'#092a3b');gradient.addColorStop(.62,'#104b57');gradient.addColorStop(1,'#086d70');
    c.fillStyle=gradient;c.fillRect(0,0,1200,320);c.strokeStyle='#65f0dc';c.lineWidth=12;c.strokeRect(17,17,1166,286);
    c.fillStyle='#20d1ad';c.fillRect(50,52,12,212);c.fillStyle='#8cebdd';c.font='700 28px Arial';c.fillText('AULA TP CHILE  /  ESPACIO DE APRENDIZAJE',94,83);
    const specialty=String(current?.specialty||ctx.specialty?.name||'Especialidad'),moduleTitle=String(current?.moduleTitle||ctx.district?.name||'Módulo formativo');
    c.fillStyle='#ffffff';let titleSize=59;c.font=`800 ${titleSize}px Arial`;while(c.measureText(specialty).width>1020&&titleSize>34){titleSize-=2;c.font=`800 ${titleSize}px Arial`;}c.fillText(specialty,94,164,1020);
    c.fillStyle='#ffd15c';c.font='700 36px Arial';c.fillText(`${moduleTitle}  ·  ESTACIONES DE APRENDIZAJE`,94,235,1020);
    const texture=new T.GOR(canvas);texture.colorSpace=T.er$;texture.anisotropy=4;
    saved.texture=texture;sign.material=new T.V9B({map:texture,toneMapped:false,side:T.$EB});saved.newMaterial=sign.material;
    sign.name='Aula TP · letrero de especialidad y módulo';sign.userData.citySpecialtyPlaque=true;
  }
  function hideLegacyQuizFurniture(ctx,hide){
    if(!stageAnchors.length)return;
    const position=new ctx.three.Pq0();
    ctx.scene.traverse(node=>{
      const size=node.geometry?.parameters;
      if(!node.isMesh||!size||node.userData?.luminousSign)return;
      const scale=node.getWorldScale?node.getWorldScale(new ctx.three.Pq0()):node.scale;
      const width=Math.abs(Number(size.width)*scale.x),height=Math.abs(Number(size.height)*scale.y),depth=Math.abs(Number(size.depth)*scale.z);
      if(!Number.isFinite(width)||!Number.isFinite(height)||!Number.isFinite(depth)||width<.08||height<.08||depth<.08||width>9||height>4||depth>7.5)return;
      node.getWorldPosition(position);
      if(position.y<ctx.floorY-.35||position.y>ctx.floorY+3.4)return;
      if(!stageAnchors.some(anchor=>Math.abs(anchor.x-position.x)<4.6&&Math.abs(anchor.z-position.z)<5.8&&anchor.y>position.y+.12&&anchor.y-position.y<4.6))return;
      const neutralWorkSurface=(width>=1.7&&height<=1.4&&depth>=.65)||(width>=1.7&&height>=.7&&depth<=1.15);
      const materials=Array.isArray(node.material)?node.material:[node.material];
      const belongsToFixture=materials.some(item=>{
        if(!item?.color?.getHSL)return false;
        const {h,s,l}=item.color.getHSL({});
        return l<.16||(s>.22&&h>.22&&h<.76)||(neutralWorkSurface&&s<.22&&l>.32);
      });
      if(belongsToFixture)hide(node,'cityLegacyQuizFurniture');
    });
  }
  function configureStations(ctx){
    const source=(ctx.stations||[]).slice(0,4);
    if(!source.length)return [];
    const questions=current&&normalize(current.specialty)===normalize(ctx.specialty.name)?current.questions:[];
    const stationQuestions=selectStationQuizQuestions(questions);
    const learningObjects=[...new Set(questions.map(question=>String(question.object||'').trim()).filter(Boolean))];
    const result=source.map((station,index)=>({...station,quizQuestion:stationQuestions[index]||null}));
    while(result.length<4){
      const slot=result.length,base=result[result.length-1],learningObject=learningObjects[slot];
      result.push({...base,name:learningObject||`Aplicación práctica ${slot+1}`,equipment:learningObject||`Aplicación práctica ${slot+1}`,quizQuestion:stationQuestions[slot]||null,cityGeneratedStation:true});
    }
    const points=result.map(station=>station.totem||[station.x,station.z]);
    const blocked=(x,z)=>ctx.colliders.some(block=>
      ctx.floorY+.6>=(block.minY??-Infinity)&&ctx.floorY+.6<=(block.maxY??Infinity)&&
      Math.abs(x-(block.x-ctx.district.x))<(block.halfX??.5)+.35&&
      Math.abs(z-(block.z-ctx.district.z))<(block.halfZ??.5)+.35
    );
    const centerX=points.reduce((sum,point)=>sum+(Number(point[0])||0),0)/points.length;
    const centerZ=points.reduce((sum,point)=>sum+(Number(point[1])||0),0)/points.length;
    const direction=new ctx.three.Pq0(0,0,-1);
    if(ctx.camera?.getWorldDirection)ctx.camera.getWorldDirection(direction);
    direction.y=0;direction.normalize();
    const eye=ctx.camera?.position||ctx.player?.position||ctx.player;
    const targetX=Number.isFinite(eye?.x)?eye.x+direction.x*9.5:ctx.district.x+centerX;
    const targetZ=Number.isFinite(eye?.z)?eye.z+direction.z*9.5:ctx.district.z+centerZ;
    const rowX=-direction.z,rowZ=direction.x;
    const compact=window.innerWidth<700;
    const candidates=[];
    for(const spacing of [3.1,2.95,2.8])for(const shiftX of [0,-.6,.6,-1.2,1.2])for(const shiftZ of [0,-1,1,-2,2]){
      const cx=targetX-ctx.district.x+rowX*shiftX+direction.x*shiftZ;
      const cz=targetZ-ctx.district.z+rowZ*shiftX+direction.z*shiftZ;
      const line=Array.from({length:4},(_,index)=>compact?
        [cx+(index%2-.5)*3.1*rowX+(Math.floor(index/2)-.5)*3.2*direction.x,
          cz+(index%2-.5)*3.1*rowZ+(Math.floor(index/2)-.5)*3.2*direction.z]:
        [cx+(index-1.5)*spacing*rowX,cz+(index-1.5)*spacing*rowZ]);
      if(line.some(([x,z])=>Math.abs(x)>6.2||Math.abs(z)>5.7))continue;
      const collisions=line.reduce((count,[x,z])=>count+(blocked(x,z)?1:0),0);
      candidates.push({line,collisions,offset:Math.abs(shiftX)+Math.abs(shiftZ)});
      if(!collisions)return result.map((station,index)=>({...station,totem:line[index]}));
    }
    const best=candidates.sort((a,b)=>a.collisions-b.collisions||a.offset-b.offset)[0];
    return result.map((station,index)=>({...station,totem:best?.line[index]||[centerX+(index-1.5)*3,centerZ]}));
  }
  function questionLevel(question){
    const value=normalize(question.difficulty||'');
    if(/facil|inicial|easy|basico/.test(value))return 'easy';
    if(/media|intermedia|medium/.test(value))return 'medium';
    if(/dificil|avanzada|hard/.test(value))return 'hard';
    return '';
  }
  function selectStationQuizQuestions(questions){
    const selected=[];
    for(const level of ['easy','easy','medium','hard']){
      const question=questions.find(item=>!selected.includes(item)&&questionLevel(item)===level&&String(item.prompt||'').trim()&&Array.isArray(item.options));
      if(!question)return [];
      selected.push(question);
    }
    return selected;
  }
  function stationQuizOptions(question){
    const options=[...new Set((Array.isArray(question.options)?question.options:[]).map(option=>String(option).trim()).filter(Boolean))].slice(0,4);
    const fallback='Elegir sin contrastar la evidencia con el criterio del aprendizaje esperado.';
    while(options.length<4){
      const candidate=options.includes(fallback)?`Omitir el registro y continuar sin verificar el criterio (${options.length+1}).`:fallback;
      options.push(candidate);
    }
    return options;
  }
  function specialtyPhotos(name){
    const value=normalize(name);
    const photos={
      administracion:['meeting','accounting','programming','network'],contabilidad:['accounting','meeting','programming','network'],
      agropecuaria:['crops','forestry','aquaculture','geology'],forestal:['forestry','furniture','crops','construction'],
      'elaboracion industrial de alimentos':['food','laboratory','cooking','crops'],gastronomia:['cooking','food','hotel','accounting'],
      construccion:['construction','welding','plumbing','drawing'],'instalaciones sanitarias':['plumbing','construction','cooling','welding'],
      'montaje industrial':['assembly','welding','machining','electrical'],'construcciones metalicas':['welding','machining','construction','drawing'],
      electricidad:['electrical','electronics','network','cooling'],electronica:['electronics','electrical','network','programming'],
      'refrigeracion y climatizacion':['cooling','electrical','plumbing','tools'],'dibujo tecnico':['drawing','construction','printing','machining'],
      grafica:['printing','drawing','programming','textile'],'mecanica automotriz':['tools','machining','aircraft','electronics'],
      'mecanica industrial':['machining','tools','welding','assembly'],'mecanica de mantenimiento de aeronaves':['aircraft','machining','electrical','tools'],
      'explotacion minera':['mining','geology','metallurgy','construction'],'asistencia en geologia':['geology','mining','crops','forestry'],
      'metalurgia extractiva':['metallurgy','welding','machining','laboratory'],'quimica industrial':['laboratory','metallurgy','food','electronics'],
      'atencion de enfermeria':['nursing','laboratory','preschool','hotel'],'atencion de parvulos':['preschool','nursing','hotel','meeting'],
      acuicultura:['aquaculture','fishing','food','laboratory'],'operaciones portuarias':['port','ship','construction','network'],
      pesqueria:['fishing','aquaculture','ship','food'],'tripulacion de naves mercantes y especiales':['ship','port','fishing','telecom'],
      'servicios de hoteleria':['hotel','cooking','tourism','meeting'],'servicios de turismo':['tourism','hotel','ship','programming'],
      'muebles y terminaciones en madera':['furniture','forestry','construction','drawing'],'vestuario y confeccion textil':['textile','printing','furniture','drawing'],
      'conectividad y redes':['network','telecom','programming','electronics'],programacion:['programming','network','telecom','electronics'],
      telecomunicaciones:['telecom','network','electrical','electronics']
    };
    return photos[value]||['tools','machining','construction','electronics'];
  }
  function stationImageUrl(ctx,station,index,used){
    const script=document.querySelector('script[src*="native-route.js"]'),base=new URL('./assets/specialties/',script?.src||location.href);
    const image=station.quizQuestion?.image;
    if(typeof image==='string'&&image.trim()){
      try{const candidate=new URL(image,location.href);if(candidate.origin===location.origin&&/^https?:$/.test(candidate.protocol)&&!used.has(candidate.href)){used.add(candidate.href);return candidate.href;}}catch{}
    }
    const object=normalize(station.quizQuestion?.object||station.equipment||station.name);
    const relevant=[];
    const hints=[
      [/motor|turbina|maquina|motor|mecaniz/,'machining'],[/tren|rueda|neumatico|fuselaje|ala|aeronave/,'aircraft'],
      [/cabina|circuito|sensor|electric|electron/,'electronics'],[/plano|diseno|croquis|diagrama/,'drawing'],
      [/soldadura|metal|estructura/,'welding'],[/cable|red|conectividad|telecom/,'network'],
      [/cultivo|bosque|suelo|riego/,'crops'],[/pesca|mar|nave|puerto/,'ship'],[/alimento|cocina|preparacion/,'food'],
      [/paciente|enfermer|salud/,'nursing'],[/madera|mueble/,'furniture'],[/hotel|turismo|recepcion/,'hotel']
    ];
    for(const [pattern,photo] of hints)if(pattern.test(object))relevant.push(photo);
    const preferred=[...relevant,...specialtyPhotos(ctx.specialty.name)];
    for(let offset=0;offset<preferred.length;offset++){
      const photo=preferred[(index+offset)%preferred.length],url=new URL(`${photo}.webp`,base).href;
      if(!used.has(url)){used.add(url);return url;}
    }
    return new URL(`${specialtyPhotos(ctx.specialty.name)[index%4]}.webp`,base).href;
  }
  function drawQuizSpecialtyIcon(c,name,cx,cy,color='#0865f5',index=0){
    const value=normalize(name),kind=/aeronave|avion/.test(value)?'aircraft':/nave|portuar|pesquer|acuicultura/.test(value)?'ship':/enfermer|salud|parvul/.test(value)?'health':/agro|forest|cultivo/.test(value)?'nature':/gastronomia|alimento|hotel|turismo/.test(value)?'food':/min|geolog|metalurg/.test(value)?'mining':/constru|mueble|madera|sanitaria|montaje/.test(value)?'build':/dibujo|grafica|vestuario|textil/.test(value)?'design':/administra|contabilidad/.test(value)?'business':/electric|electron|telecom|redes|program/.test(value)?'circuit':'gear';
    c.save();c.translate(cx,cy);c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.fillStyle=color;c.lineWidth=12;
    if(index===1){
      c.lineWidth=13;c.beginPath();c.arc(0,0,39,0,Math.PI*2);c.stroke();
      for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);c.fillRect(-8,-61,16,22);c.restore();}
      c.beginPath();c.arc(0,0,13,0,Math.PI*2);c.fill();
    }else if(index===2){
      c.lineWidth=19;c.beginPath();c.moveTo(-46,-48);c.lineTo(45,45);c.moveTo(44,-49);c.lineTo(-45,47);c.stroke();
      c.beginPath();c.arc(-51,-53,15,Math.PI,Math.PI*1.65);c.arc(-50,-53,15,Math.PI*1.35,Math.PI*2);c.stroke();
      c.beginPath();c.arc(51,-53,15,Math.PI,Math.PI*1.65);c.arc(50,-53,15,Math.PI*1.35,Math.PI*2);c.stroke();
      c.beginPath();c.moveTo(-55,53);c.lineTo(-38,36);c.moveTo(55,53);c.lineTo(38,36);c.stroke();
    }else if(index===3){
      c.lineWidth=8;c.beginPath();c.roundRect(-49,-59,98,118,10);c.stroke();
      for(const y of [-29,0,29]){c.strokeStyle=color;c.lineWidth=7;c.beginPath();c.moveTo(-25,y);c.lineTo(-16,y+8);c.lineTo(-3,y-9);c.stroke();c.beginPath();c.moveTo(8,y);c.lineTo(34,y);c.stroke();}
    }else if(kind==='aircraft'){
      c.beginPath();c.moveTo(-68,12);c.lineTo(-14,1);c.lineTo(-36,-46);c.quadraticCurveTo(-39,-56,-29,-51);c.lineTo(13,-3);c.lineTo(50,-12);c.quadraticCurveTo(70,-11,56,4);c.lineTo(16,18);c.lineTo(-20,53);c.quadraticCurveTo(-30,61,-31,48);c.lineTo(-28,28);c.lineTo(-67,31);c.closePath();c.fill();c.strokeStyle='#fff';c.lineWidth=7;c.beginPath();c.moveTo(-55,20);c.lineTo(52,-8);c.stroke();
    }else if(kind==='ship'){
      c.beginPath();c.moveTo(-65,17);c.lineTo(65,17);c.lineTo(42,47);c.lineTo(-40,47);c.closePath();c.fill();c.fillRect(-16,-38,42,48);c.fillRect(-43,-20,23,30);c.strokeStyle='#fff';c.lineWidth=7;c.beginPath();c.moveTo(-60,31);c.lineTo(55,31);c.stroke();
    }else if(kind==='health'){
      c.beginPath();c.roundRect(-24,-62,48,124,12);c.roundRect(-62,-24,124,48,12);c.fill();
    }else if(kind==='nature'){
      c.strokeStyle='#0865f5';c.lineWidth=11;c.beginPath();c.moveTo(0,56);c.bezierCurveTo(-2,12,5,-20,31,-52);c.stroke();
      for(const [x,y,flip] of [[-5,22,-1],[8,-8,1],[0,39,1]]){c.save();c.translate(x,y);c.scale(flip,1);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(33,-34,53,-20,37,2);c.bezierCurveTo(25,15,10,12,0,0);c.fill();c.restore();}
    }else if(kind==='food'){
      c.beginPath();c.arc(-31,-9,23,Math.PI*.95,Math.PI*1.9);c.arc(0,-29,29,Math.PI,Math.PI*2);c.arc(31,-9,23,Math.PI*1.1,Math.PI*2.05);c.lineTo(51,35);c.quadraticCurveTo(0,54,-51,35);c.closePath();c.fill();c.fillRect(-51,23,102,19);
    }else if(kind==='mining'){
      c.lineWidth=15;c.beginPath();c.moveTo(-32,50);c.lineTo(31,-37);c.moveTo(-51,-31);c.quadraticCurveTo(0,-65,52,-29);c.stroke();
    }else if(kind==='build'){
      c.lineWidth=18;c.beginPath();c.moveTo(-42,-45);c.lineTo(27,24);c.stroke();c.beginPath();c.moveTo(-59,-52);c.lineTo(-27,-67);c.lineTo(-1,-39);c.lineTo(-20,-20);c.closePath();c.fill();c.beginPath();c.moveTo(10,39);c.lineTo(51,0);c.lineTo(67,16);c.lineTo(27,57);c.closePath();c.fill();
    }else if(kind==='design'){
      c.beginPath();c.moveTo(-36,-51);c.lineTo(30,15);c.lineTo(-2,48);c.lineTo(-51,-30);c.closePath();c.fill();c.beginPath();c.moveTo(-51,-30);c.lineTo(-65,-54);c.lineTo(-36,-51);c.fill();c.strokeStyle='#fff';c.lineWidth=6;c.beginPath();c.moveTo(-27,-24);c.lineTo(7,13);c.stroke();
    }else if(kind==='business'){
      c.beginPath();c.roundRect(-58,-30,116,82,12);c.fill();c.strokeStyle='#0865f5';c.lineWidth=12;c.beginPath();c.moveTo(-18,-30);c.lineTo(-18,-48);c.lineTo(18,-48);c.lineTo(18,-30);c.stroke();c.strokeStyle='#fff';c.lineWidth=7;c.beginPath();c.moveTo(-56,0);c.lineTo(56,0);c.stroke();
    }else if(kind==='circuit'){
      c.lineWidth=11;c.beginPath();c.moveTo(-49,-39);c.lineTo(-5,-39);c.lineTo(-5,4);c.lineTo(43,4);c.lineTo(43,43);c.moveTo(-45,44);c.lineTo(-45,13);c.lineTo(-5,13);c.stroke();
      for(const [x,y] of [[-49,-39],[-45,44],[-5,-39],[43,43],[43,4]]){c.beginPath();c.arc(x,y,10,0,Math.PI*2);c.fill();}
    }else{
      c.lineWidth=14;c.beginPath();c.arc(0,0,34,0,Math.PI*2);c.stroke();
      for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);c.fillRect(-10,-62,20,20);c.restore();}
      c.beginPath();c.arc(0,0,12,0,Math.PI*2);c.fill();
    }
    c.restore();
  }
  function createStationArtwork(ctx,station,index,token,imageUrl,marker,canvas,displayX,displayZ,floorY,markerScale){
    const image=new Image();image.decoding='async';
    image.onload=()=>{
      if(token!==generation||!root)return;
      const c=canvas.getContext('2d');
      const rounded=(x,y,width,height,radius)=>{c.beginPath();c.roundRect(x,y,width,height,radius);};
      c.clearRect(0,0,canvas.width,canvas.height);
      const accents=['#0875f5','#f39a22','#10a991','#a148e8'],accent=accents[index%accents.length];
      c.save();c.shadowColor='#00cfff';c.shadowBlur=38;c.fillStyle='rgba(235,249,255,.98)';c.strokeStyle='#ffffff';c.lineWidth=24;
      rounded(28,28,1144,1344,110);c.fill();c.stroke();c.shadowBlur=0;c.strokeStyle='#08c7f2';c.lineWidth=15;rounded(44,44,1112,1312,92);c.stroke();c.restore();
      const header=c.createLinearGradient(0,48,0,430);header.addColorStop(0,'rgba(255,255,255,.99)');header.addColorStop(1,'rgba(214,242,255,.98)');
      c.save();c.fillStyle=header;rounded(62,62,1076,354,72);c.fill();c.restore();
      c.save();c.shadowColor=accent;c.shadowBlur=30;c.fillStyle=accent;c.globalAlpha=.2;c.beginPath();c.arc(208,238,142,0,Math.PI*2);c.fill();c.globalAlpha=1;c.strokeStyle='#ffffff';c.lineWidth=14;c.beginPath();c.arc(208,238,123,0,Math.PI*2);c.stroke();c.restore();
      drawQuizSpecialtyIcon(c,ctx.specialty.name,208,238,accent,index);
      c.textAlign='left';c.fillStyle='#1263ec';c.font='900 88px Arial';c.fillText(`Quiz ${index+1}`,382,191,710);
      const title=String(station.quizQuestion?.object||station.equipment||station.name||station.title||station.label||'Estación de trabajo');
      c.fillStyle='#102653';let titleSize=49;c.font=`800 ${titleSize}px Arial`;while(c.measureText(title).width>700&&titleSize>31){titleSize--;c.font=`800 ${titleSize}px Arial`;}c.fillText(title,388,278,700);
      c.save();c.fillStyle=accent;c.globalAlpha=.55;rounded(837,340,260,20,10);c.fill();c.globalAlpha=.22;rounded(837,372,188,14,7);c.fill();c.restore();
      c.save();c.beginPath();c.roundRect(64,440,1072,888,55);c.clip();
      const scale=Math.max(1072/image.width,888/image.height),imageWidth=image.width*scale,imageHeight=image.height*scale;
      c.drawImage(image,600-imageWidth/2,884-imageHeight/2,imageWidth,imageHeight);c.restore();
      c.save();c.shadowColor=accent;c.shadowBlur=28;c.strokeStyle='#ffffff';c.lineWidth=18;rounded(64,440,1072,888,55);c.stroke();c.shadowBlur=0;c.strokeStyle='#28d8ff';c.lineWidth=10;rounded(76,452,1048,864,44);c.stroke();c.restore();
      marker.texture.needsUpdate=true;marker.sign.userData.cityQuizArtworkReady=true;
    };
    image.src=imageUrl;
  }
  function createQuizMarkers(ctx){
    const T=ctx.three,stations=roomStations=configureStations(ctx);
    if(!stations.length)return;
    const viewport=ctx.renderer?.domElement?.closest('.city-viewport');
    if(viewport){
      quizControlLayer=document.createElement('div');quizControlLayer.className='city-quiz-marker-control-layer';quizControlLayer.setAttribute('aria-label','Estaciones de quiz');viewport.append(quizControlLayer);
    }
    markerGeometry=new T.bdM(2.72,3.12);
    markerHaloGeometry=new T.bdM(2.8,2.8);
    const haloCanvas=document.createElement('canvas');haloCanvas.width=256;haloCanvas.height=256;
    const haloContext=haloCanvas.getContext('2d'),glow=haloContext.createRadialGradient(128,128,24,128,128,124);
    glow.addColorStop(0,'rgba(0,210,255,.72)');glow.addColorStop(.44,'rgba(0,174,255,.36)');glow.addColorStop(1,'rgba(0,174,255,0)');
    haloContext.fillStyle=glow;haloContext.fillRect(0,0,256,256);
    haloContext.save();haloContext.shadowColor='#17cfff';haloContext.shadowBlur=28;haloContext.strokeStyle='#28d5ff';haloContext.lineWidth=15;
    haloContext.beginPath();haloContext.ellipse(128,128,108,82,0,0,Math.PI*2);haloContext.stroke();haloContext.shadowBlur=0;
    haloContext.strokeStyle='#f1fdff';haloContext.lineWidth=7;haloContext.beginPath();haloContext.ellipse(128,128,99,74,0,0,Math.PI*2);haloContext.stroke();
    haloContext.strokeStyle='#50e1ff';haloContext.lineWidth=4;haloContext.beginPath();haloContext.ellipse(128,128,84,61,0,0,Math.PI*2);haloContext.stroke();haloContext.restore();
    markerHaloTexture=new T.GOR(haloCanvas);markerHaloTexture.colorSpace=T.er$;
    markerHaloMaterial=new T.V9B({map:markerHaloTexture,transparent:true,depthWrite:false,toneMapped:false,side:T.$EB});
    markerBeamGeometry=new T.bdM(2.1,2.85);
    const beamCanvas=document.createElement('canvas');beamCanvas.width=384;beamCanvas.height=512;
    const beamContext=beamCanvas.getContext('2d'),beamGlow=beamContext.createLinearGradient(0,0,384,0);
    beamGlow.addColorStop(0,'rgba(0,193,255,0)');beamGlow.addColorStop(.5,'rgba(76,225,255,.8)');beamGlow.addColorStop(1,'rgba(0,193,255,0)');
    beamContext.fillStyle=beamGlow;beamContext.beginPath();beamContext.moveTo(112,0);beamContext.lineTo(272,0);beamContext.lineTo(376,512);beamContext.lineTo(8,512);beamContext.closePath();beamContext.fill();
    beamContext.globalCompositeOperation='destination-in';
    const beamHeight=beamContext.createLinearGradient(0,0,0,512);beamHeight.addColorStop(0,'rgba(255,255,255,.06)');beamHeight.addColorStop(.18,'rgba(255,255,255,.95)');beamHeight.addColorStop(.9,'rgba(255,255,255,.75)');beamHeight.addColorStop(1,'rgba(255,255,255,0)');
    beamContext.fillStyle=beamHeight;beamContext.fillRect(0,0,384,512);
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
    markerCylinderGeometry=Cylinder?new Cylinder(.075,.075,.86,12):new T.iNn(.13,.86,.13);
    markerCylinderMaterial=new T.V9B({color:0x19c9eb,toneMapped:false,transparent:true,opacity:.86,depthWrite:false});
    const floorY=ctx.floorY+.035;
    const token=generation;
    const markerScale=Math.min(.86,Math.max(.68,window.innerWidth/1900));
    const usedImages=new Set();
    stations.forEach((station,index)=>{
      const [dx,dz]=station.totem||[station.x,station.z],x=ctx.district.x+dx,z=ctx.district.z+dz;
      if(!Number.isFinite(x)||!Number.isFinite(z))return;
      const displayX=x,displayZ=z;
      const halo=new T.eaF(markerHaloGeometry,markerHaloMaterial);halo.name=`Aula TP · halo Quiz ${index+1}`;
      halo.position.set(displayX,floorY,displayZ);halo.rotation.x=-Math.PI/2;root.add(halo);
      for(let sparkle=0;sparkle<6;sparkle++){
        const angle=sparkle*Math.PI/3,light=new T.eaF(markerSparkGeometry,markerSparkMaterial);
        light.position.set(displayX+Math.cos(angle)*1.04,floorY+.045,displayZ+Math.sin(angle)*.72);
        light.rotation.x=-Math.PI/2;light.renderOrder=2;root.add(light);sparkles.push(light);
      }
      const beam=new T.eaF(markerBeamGeometry,markerBeamMaterial);beam.name=`Aula TP · haz Quiz ${index+1}`;
      beam.position.set(displayX,floorY+1.2,displayZ);root.add(beam);beam.renderOrder=19;beams.push(beam);
      const cylinder=new T.eaF(markerCylinderGeometry,markerCylinderMaterial);cylinder.name=`Aula TP · soporte Quiz ${index+1}`;
      cylinder.scale.y=1.6;cylinder.position.set(displayX,floorY+.64,displayZ);root.add(cylinder);cylinders.push(cylinder);
      const title=String(station.quizQuestion?.object||station.equipment||station.name||station.title||station.label||'Puesto de trabajo');
      const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1400;
      const texture=new T.GOR(canvas);texture.colorSpace=T.er$;texture.anisotropy=4;
      const signMaterial=new T.V9B({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,side:T.$EB});
      const sign=new T.eaF(markerGeometry,signMaterial);
      const mobileHeight=window.innerWidth<700?(Math.floor(index/2)-.5)*1.1:0;
      sign.position.set(displayX,floorY+2.02+mobileHeight,displayZ);sign.scale.setScalar(markerScale);root.add(sign);
      sign.material=signMaterial;sign.name=`Aula TP · Quiz ${index+1} · ${title}`;sign.renderOrder=20;sign.userData.cityQuizMarker=index+1;
      const marker={sign,texture,material:signMaterial};quizMarkers.push(marker);
      if(quizControlLayer){
        const control=document.createElement('button');control.type='button';control.className='city-quiz-marker-control';control.setAttribute('aria-label',`Abrir Quiz ${index+1}: ${title}`);control.dataset.quizNumber=String(index+1);
        control.addEventListener('click',()=>openQuizWindow(index+1));quizControlLayer.append(control);quizControls.push(control);
      }
      const imageUrl=stationImageUrl(ctx,station,index,usedImages);
      createStationArtwork(ctx,station,index,token,imageUrl,marker,canvas,displayX,displayZ,floorY,markerScale);
    });
  }
  function openQuizWindow(number){
    quizWindow?.remove();
    const panel=document.createElement('section');panel.className='city-quiz-empty-window';panel.setAttribute('role','dialog');panel.setAttribute('aria-label',`Quiz ${number}`);
    const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button'),body=document.createElement('div');
    title.textContent=`Quiz ${number}`;close.type='button';close.className='city-quiz-empty-window-close';close.setAttribute('aria-label','Cerrar quiz');close.textContent='×';close.addEventListener('click',()=>{panel.remove();if(quizWindow===panel){quizWindow=null;activeQuizNumber=null;}});
    body.className='city-quiz-empty-window-body';header.append(title,close);panel.append(header,body);
    const station=roomStations[number-1],question=station?.quizQuestion;
    if(!question){
      body.classList.add('city-quiz-unavailable');body.append(document.createTextNode('Abre el Desafío profesional de este módulo para cargar la pregunta y su aprendizaje esperado.'));
      const launch=document.createElement('button');launch.type='button';launch.className='city-quiz-submit';launch.textContent='Abrir Desafío profesional';
      launch.addEventListener('click',()=>[...document.querySelectorAll('.city-view-toolbar button')].find(button=>normalize(button.textContent).includes('desafio profesional'))?.click());body.append(launch);
    }else{
      const content=document.createElement('div'),level=document.createElement('p'),alignment=document.createElement('p'),prompt=document.createElement('h3'),criterion=document.createElement('p'),form=document.createElement('form'),choices=document.createElement('fieldset'),legend=document.createElement('legend'),argumentLabel=document.createElement('label'),argument=document.createElement('textarea'),submit=document.createElement('button'),status=document.createElement('p'),feedback=document.createElement('p');
      content.className='city-quiz-question';level.className='city-quiz-question-level';level.textContent='Pregunta 1 de 5';
      alignment.className='city-quiz-question-ae';prompt.textContent='Cargando pregunta…';criterion.className='city-quiz-question-criterion';
      form.className='city-quiz-response-form';choices.className='city-quiz-choices';legend.textContent='Selecciona una alternativa';choices.append(legend);
      argumentLabel.className='city-quiz-argument-label';argumentLabel.textContent='Argumenta tu respuesta';argument.name='argument';argument.required=true;argument.minLength=20;argument.placeholder='Explica qué evidencia del módulo respalda tu elección.';argumentLabel.append(argument);
      submit.type='submit';submit.className='city-quiz-submit';submit.textContent='Comprobar respuesta';status.className='city-quiz-save-status';status.setAttribute('aria-live','polite');feedback.className='city-quiz-feedback';feedback.setAttribute('aria-live','polite');feedback.hidden=true;
      form.append(choices,argumentLabel,submit,status,feedback);content.append(level,alignment,prompt,criterion,form);body.append(content);
      let activeQuestion=null,busy=false;
      const renderQuestion=(item,aeTitle='',skill='Representar',questionNumber=1)=>{
        activeQuestion=item;prompt.textContent=String(item.question||'Resuelve el desafío del módulo.');level.textContent=`Pregunta ${questionNumber} de 5`;
        alignment.textContent=`Habilidad: ${skill}${aeTitle?` · AE: ${aeTitle}`:` · Aprendizaje esperado ${Number(item.ae)+1}`}`;
        criterion.hidden=!item.criterion;criterion.textContent=item.criterion?`Criterio asociado: ${item.criterion}`:'';
        choices.replaceChildren(legend);
        (Array.isArray(item.options)?item.options:[]).slice(0,4).forEach((option,index)=>{
          const label=document.createElement('label'),radio=document.createElement('input'),copy=document.createElement('span');
          radio.type='radio';radio.name=`city-quiz-${number}-answer`;radio.value=String(index);radio.required=true;copy.textContent=String(option);label.append(radio,copy);choices.append(label);
        });
        argument.value='';submit.disabled=false;submit.textContent='Comprobar respuesta';
      };
      const api=`/api/modules/${encodeURIComponent(current?.moduleId||'')}/city-station-quiz`,topics=roomStations.map(item=>item.quizQuestion?.object||item.equipment||item.name||item.title||'');
      fetch(`${api}?station=${number}&topics=${encodeURIComponent(JSON.stringify(topics))}`,{credentials:'same-origin'}).then(async response=>{
        const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo cargar este quiz.');
        if(data.passed){alignment.textContent='Aprendizaje esperado demostrado';level.textContent='5 de 5 preguntas correctas';prompt.textContent='Este quiz ya está aprobado.';submit.disabled=true;return;}
        renderQuestion(data.question,data.ae_title,data.skill,data.question_number);status.textContent=data.attempts?`${data.correct_in_quiz||0} de 5 correctas`:'Primera pregunta';
      }).catch(error=>{prompt.textContent=error.message;submit.disabled=true;});
      form.addEventListener('submit',async event=>{
        event.preventDefault();if(busy||!activeQuestion)return;
        const choice=form.querySelector('input:checked'),reason=argument.value.trim();
        if(!choice||reason.length<20){status.textContent='Selecciona una alternativa y fundamenta tu respuesta con al menos 20 caracteres.';return;}
        busy=true;submit.disabled=true;status.textContent='Revisando respuesta…';feedback.hidden=true;
        try{
          const response=await fetch(api,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({station:number,question_id:activeQuestion.id,choice:Number(choice.value),argument:reason})});
          const result=await response.json();if(!response.ok)throw new Error(result.error||'No se pudo registrar la respuesta.');
          feedback.hidden=false;feedback.classList.toggle('is-correct',Boolean(result.correct));feedback.classList.toggle('is-incorrect',!result.correct);
          if(result.passed){feedback.textContent=`¡Quiz aprobado! ${result.feedback||result.explanation||''}`;status.textContent='5 de 5 correctas';level.textContent='5 de 5 preguntas correctas';alignment.textContent='Aprendizaje esperado demostrado';prompt.textContent='¡Muy bien! Puedes continuar con otra estación.';choices.querySelectorAll('input').forEach(input=>input.disabled=true);argument.disabled=true;submit.textContent='Aprobado';}
          else if(result.next_question){feedback.textContent=result.correct?`Correcto. ${result.feedback||''} Continúa con la pregunta ${result.question_number} de 5.`:`Aún no. ${result.feedback||result.explanation||'Revisa el criterio asociado.'} Prueba una pregunta nueva de ${result.next_skill}.`;status.textContent=`${result.correct_in_quiz||0} de 5 correctas`;renderQuestion(result.next_question,result.ae_title,result.next_skill,result.question_number);}
          else{feedback.textContent=`Aún no. ${result.feedback||result.explanation||''} No quedan preguntas inéditas en este aprendizaje; volveremos a presentarlo.`;status.textContent='Reintento disponible';}
        }catch(error){status.textContent=error.message;submit.disabled=false;}
        finally{busy=false;}
      });
    }
    document.body.append(panel);quizWindow=panel;activeQuizNumber=number;
  }
  function updateQuizControls(ctx){
    if(!quizControlLayer||!ctx.camera||!ctx.renderer)return;
    const viewport=quizControlLayer.parentElement,viewportRect=viewport.getBoundingClientRect(),canvasRect=ctx.renderer.domElement.getBoundingClientRect(),T=ctx.three;
    quizControls.forEach((control,index)=>{
      const sign=quizMarkers[index]?.sign;if(!sign)return;
      const point=new T.Pq0(sign.position.x,sign.position.y,sign.position.z).project(ctx.camera);
      const visible=root?.visible&&point.z>=-1&&point.z<=1&&point.x>=-1.15&&point.x<=1.15&&point.y>=-1.15&&point.y<=1.15;
      control.hidden=!visible;
      if(visible){control.style.left=`${canvasRect.left-viewportRect.left+(point.x+1)*canvasRect.width/2}px`;control.style.top=`${canvasRect.top-viewportRect.top+(1-point.y)*canvasRect.height/2}px`;}
    });
  }
  function updateQuizArrows(ctx){
    const player=ctx.player,stations=roomStations.slice(0,4);
    const forward=ctx.camera?.getWorldDirection?ctx.camera.getWorldDirection(new ctx.three.Pq0()):new ctx.three.Pq0(0,0,-1);
    forward.y=0;forward.normalize();
    const rightX=-forward.z,rightZ=forward.x;
    arrows.forEach((arrow,index)=>{
      const station=stations[index];
      if(!station){arrow.visible=false;return;}
      const [dx,dz]=station.totem||[station.x,station.z],targetX=ctx.district.x+dx,targetZ=ctx.district.z+dz;
      const deltaX=targetX-player.x,deltaZ=targetZ-player.z,distance=Math.hypot(deltaX,deltaZ);
      const directionX=distance>.001?deltaX/distance:Math.cos(index*Math.PI/2);
      const directionZ=distance>.001?deltaZ/distance:Math.sin(index*Math.PI/2);
      const fanAngle=(index-1.5)*.6,fanX=Math.cos(fanAngle)*forward.x+Math.sin(fanAngle)*rightX,fanZ=Math.cos(fanAngle)*forward.z+Math.sin(fanAngle)*rightZ;
      arrow.position.set(player.x+fanX*2.05,ctx.floorY+.045,player.z+fanZ*2.05);
      arrow.rotation.y=Math.atan2(-directionX,-directionZ);
      arrow.visible=true;
    });
    if(quizControlLayer)quizControlLayer.dataset.visibleQuizArrows=String(arrows.filter(arrow=>arrow.visible).length);
  }
  function frame(ctx){
    try{
      if(!ctx.indoors||!ctx.room||!ctx.stations.length){if(root)dispose();room=null;return;}
      if(room!==ctx.room){dispose();room=ctx.room;last=0;if(current&&normalize(current.specialty)!==normalize(ctx.specialty.name))current=null;}
      if(!root)create(ctx);
      if(ctx.map||Math.abs(ctx.player.y-ctx.floorY)>.65){root.visible=false;updateQuizControls(ctx);return;}
      root.visible=true;
      updateQuizControls(ctx);
      const now=performance.now();if(now-last<250)return;last=now;
      for(const marker of quizMarkers){const facing=Math.atan2(ctx.player.x-marker.sign.position.x,ctx.player.z-marker.sign.position.z);marker.sign.rotation.y=facing;if(marker.imageMesh)marker.imageMesh.rotation.y=facing;}
      for(const beam of beams)beam.rotation.y=Math.atan2(ctx.player.x-beam.position.x,ctx.player.z-beam.position.z);
      document.querySelectorAll('.city-viewport .city-door-action[data-city-quiz-station]').forEach(button=>button.removeAttribute('data-city-quiz-station'));
      const stationAction=[...document.querySelectorAll('.city-viewport .city-door-action')].find(button=>/^\s*\d+\s*[·.)-]/.test(button.textContent));
      stationAction?.setAttribute('data-city-quiz-station','true');
      updateQuizArrows(ctx);
    }catch(cause){
      // A navigation failure must never stop the original render loop.
      const message=String(cause.message||cause);if(error!==message){error=message;console.warn('Aula TP: guía de quizzes no disponible:',message);}
      if(root)root.visible=false;
    }
  }
  globalThis.AulaTPNativeRoute={frame,status:()=>({quizMarkers:quizMarkers.length,stations:roomStations.length,visibleQuizArrows:arrows.filter(arrow=>arrow.visible).length})};
  addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
})();
