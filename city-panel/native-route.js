/* Quiz stations, legacy fixture cleanup, and navigation for the existing world. */
(() => {
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let root,geometry,material,current=null,last=0,room=null,error='',generation=0;
  let stationQuestionSignature='';
  let quizControlLayer=null,quizWindow=null;
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
    current=data;last=0;
    const signature=`${data.moduleId||''}:${JSON.stringify(data.questions.map(question=>[question.id,question.object]))}`;
    if(signature!==stationQuestionSignature&&root){dispose();room=null;}
    stationQuestionSignature=signature;
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
    quizControlLayer?.remove();quizControlLayer=null;quizControls.length=0;quizWindow?.remove();quizWindow=null;
    stageAnchors.length=0;
    roomStations=[];
    for(const [sign,visible,oldGeometry,oldMaterial,oldName,flag] of originalSigns){sign.visible=visible;sign.geometry=oldGeometry;sign.material=oldMaterial;sign.name=oldName;delete sign.userData.cityLegacyQuizStationSign;delete sign.userData.cityLegacyQuizStageSign;delete sign.userData.cityLegacyQuizFurniture;delete sign.userData.cityQuizMarker;}
    originalSigns.length=0;
    root=geometry=material=null;arrows.length=0;
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
    document.documentElement.classList.add('city-native-route-active');
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
      hidden.add(node);originalSigns.push([node,node.visible,node.geometry,node.material,node.name,flag]);node.visible=false;node.userData[flag]=true;
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
    hideLegacyQuizFurniture(ctx,hide);
  }
  function hideLegacyQuizFurniture(ctx,hide){
    if(!stageAnchors.length)return;
    const position=new ctx.three.Pq0();
    ctx.scene.traverse(node=>{
      const size=node.geometry?.parameters;
      if(!node.isMesh||!size||node.userData?.luminousSign)return;
      const width=Number(size.width),height=Number(size.height),depth=Number(size.depth);
      if(!Number.isFinite(width)||!Number.isFinite(height)||!Number.isFinite(depth)||width<.25||height<.18||depth<.18||width>5||height>4||depth>5)return;
      node.getWorldPosition(position);
      if(position.y<ctx.floorY-.35||position.y>ctx.floorY+3.4)return;
      if(!stageAnchors.some(anchor=>Math.abs(anchor.x-position.x)<2.8&&Math.abs(anchor.z-position.z)<4.2&&anchor.y>position.y+.2&&anchor.y-position.y<4.2))return;
      const materials=Array.isArray(node.material)?node.material:[node.material];
      const belongsToFixture=materials.some(item=>{
        if(!item?.color?.getHSL)return false;
        const {h,s,l}=item.color.getHSL({});
        return l<.16||(s>.22&&h>.22&&h<.76);
      });
      if(belongsToFixture)hide(node,'cityLegacyQuizFurniture');
    });
  }
  function configureStations(ctx){
    const source=(ctx.stations||[]).slice(0,4);
    if(!source.length)return [];
    const questions=current&&normalize(current.specialty)===normalize(ctx.specialty.name)?current.questions:[];
    const questionGroups=Array.from({length:4},()=>[]);
    questions.forEach((question,index)=>questionGroups[Math.min(3,Math.floor(index*4/Math.max(1,questions.length)))].push(question));
    const learningObjects=[...new Set(questions.map(question=>String(question.object||'').trim()).filter(Boolean))];
    const result=source.map((station,index)=>({...station,quizQuestion:questionGroups[index]?.[0]||null}));
    while(result.length<4){
      const slot=result.length,base=result[result.length-1],learningObject=learningObjects[slot];
      result.push({...base,name:learningObject||`Aplicación práctica ${slot+1}`,equipment:learningObject||`Aplicación práctica ${slot+1}`,quizQuestion:questionGroups[slot]?.[0]||null,cityGeneratedStation:true});
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
        [cx+(index%2-.5)*2.65*rowX+(Math.floor(index/2)-.5)*2.4*direction.x,
          cz+(index%2-.5)*2.65*rowZ+(Math.floor(index/2)-.5)*2.4*direction.z]:
        [cx+(index-1.5)*spacing*rowX,cz+(index-1.5)*spacing*rowZ]);
      if(line.some(([x,z])=>Math.abs(x)>6.2||Math.abs(z)>5.7))continue;
      const collisions=line.reduce((count,[x,z])=>count+(blocked(x,z)?1:0),0);
      candidates.push({line,collisions,offset:Math.abs(shiftX)+Math.abs(shiftZ)});
      if(!collisions)return result.map((station,index)=>({...station,totem:line[index]}));
    }
    const best=candidates.sort((a,b)=>a.collisions-b.collisions||a.offset-b.offset)[0];
    return result.map((station,index)=>({...station,totem:best?.line[index]||[centerX+(index-1.5)*3,centerZ]}));
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
    const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button'),blank=document.createElement('div');
    title.textContent=`Quiz ${number}`;close.type='button';close.className='city-quiz-empty-window-close';close.setAttribute('aria-label','Cerrar quiz');close.textContent='×';close.addEventListener('click',()=>{panel.remove();if(quizWindow===panel)quizWindow=null;});
    blank.className='city-quiz-empty-window-body';blank.setAttribute('aria-label','Contenido del quiz');header.append(title,close);panel.append(header,blank);document.body.append(panel);quizWindow=panel;
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
      const data=current&&normalize(current.specialty)===normalize(ctx.specialty.name)?current:null;
      const index=data?next(data):0;
      arrows.forEach(arrow=>arrow.visible=false);
      if(index<0)return;
      const {station, index:stationIndex}=selectedStation(roomStations,index,data?.questions.length||roomStations.length);
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
    }catch(cause){
      // A navigation failure must never stop the original render loop.
      const message=String(cause.message||cause);if(error!==message){error=message;console.warn('Aula TP: guía de quizzes no disponible:',message);}
      if(root)root.visible=false;
    }
  }
  globalThis.AulaTPNativeRoute={frame,status:()=>({quizMarkers:quizMarkers.length,stations:roomStations.length})};
  addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
})();
