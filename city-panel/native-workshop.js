/* Module-specific workshop fixtures stay on the perimeter; quiz routes remain open. */
(() => {
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const labels={tools:'Herramientas e instrumentos',protection:'Protección personal',documents:'Documentación técnica',digital:'Recursos digitales',materials:'Materiales e insumos',equipment:'Equipos de trabajo'};
  const roomLayouts=new WeakMap();
  function captureLayout(ctx){
    const key=ctx.room||ctx.scene;let layout=roomLayouts.get(key);
    if(!layout){const forward=ctx.camera.getWorldDirection(new ctx.three.Pq0());forward.y=0;forward.normalize();layout={x:ctx.player.x,z:ctx.player.z,forwardX:forward.x,forwardZ:forward.z,eye:{x:ctx.camera.position.x,z:ctx.camera.position.z},createdAt:performance.now()};roomLayouts.set(key,layout);}
    return layout;
  }
  function chooseLocations(ctx,stations){
    if(ctx.workshopLayout?.wallLocations)return ctx.workshopLayout.wallLocations;
    const locations=[];
    const forward=ctx.camera?.getWorldDirection?ctx.camera.getWorldDirection(new ctx.three.Pq0()):new ctx.three.Pq0(0,0,-1);
    if(ctx.workshopLayout){forward.x=ctx.workshopLayout.forwardX;forward.z=ctx.workshopLayout.forwardZ;}
    forward.y=0;forward.normalize();const rightX=-forward.z,rightZ=forward.x,player=ctx.workshopLayout||ctx.player,eye=ctx.workshopLayout?.eye||ctx.camera?.position||player;
    for(const side of [-1,1]){
      const candidates=[6.8,6.1,7.5,5.4].map(distance=>{
        const x=player.x+rightX*side*4.85+forward.x*distance,z=player.z+rightZ*side*4.85+forward.z*distance;
        const yaw=Math.atan2(eye.x-x,eye.z-z);
        return {x,z,side,rightX,rightZ,forwardX:forward.x,forwardZ:forward.z,yaw,halfX:1.85*Math.abs(Math.cos(yaw))+.55*Math.abs(Math.sin(yaw)),halfZ:1.85*Math.abs(Math.sin(yaw))+.55*Math.abs(Math.cos(yaw))};
      });
      const available=candidates.find(p=>stations.every(s=>{
        const [x,z]=s.totem||[s.x,s.z];
        return Math.hypot(p.x-ctx.district.x-x,p.z-ctx.district.z-z)>1.15;
      })&&Math.hypot(p.x-player.x,p.z-player.z)>3.5&&ctx.colliders.every(c=>
        ctx.floorY+1.5<(c.minY??-Infinity)||ctx.floorY>(c.maxY??Infinity)||
        Math.abs(c.x-p.x)>(c.halfX??.5)+p.halfX||
        Math.abs(c.z-p.z)>(c.halfZ??.5)+p.halfZ
      ));
      if(available)locations.push(available);
    }
    if(ctx.workshopLayout)ctx.workshopLayout.wallLocations=locations;
    return locations;
  }
  function create(ctx,setup,stations){
    ctx={...ctx,workshopLayout:captureLayout(ctx)};
    const T=ctx.three,root=new T.YJl(),owned=new Set(),colliders=[];
    root.name=`Aula TP · Recursos · ${setup.module_title}`;
    root.userData.moduleTitle=setup.module_title;
    root.userData.moduleId=setup.module_id;
    root.userData.cityModuleWorkshop=true;
    const replacedColliders=(ctx.legacyFixtureColliders||[]).filter(c=>c.halfX<.75&&c.halfZ<.75&&c.maxY<ctx.floorY+1.7),replacedMeshes=[],origin=ctx.workshopLayout;let lastDiscovery=-Infinity;
    function refresh(){
      for(const mesh of replacedMeshes)mesh.visible=false;
      const now=performance.now();if(now-lastDiscovery<500)return;lastDiscovery=now;
      const discovered=ctx.colliders.filter(c=>!c.cityModuleWorkshop&&c.minY<=ctx.floorY&&c.maxY>ctx.floorY&&c.maxY<ctx.floorY+1.7&&c.halfX<.75&&c.halfZ<.75&&Math.hypot(c.x-origin.x,c.z-origin.z)<4.7);
      for(const collider of discovered)if(!replacedColliders.includes(collider))replacedColliders.push(collider);
      const position=new T.Pq0(),scale=new T.Pq0();
      const globalScan=now-origin.createdAt<5000||now-(origin.lastGlobalDiscovery??-Infinity)>5000;if(globalScan)origin.lastGlobalDiscovery=now;
      (globalScan?ctx.scene:ctx.room?.traverse?ctx.room:ctx.scene).traverse(node=>{
        if(!node.isMesh||!node.visible)return;
        for(let parent=node;parent;parent=parent.parent)if(parent.userData.cityModuleWorkshop||parent.name==='Aula TP · flechas de quizzes')return;
        node.getWorldPosition(position);if(position.y<ctx.floorY-.2||position.y>ctx.floorY+3.3||Math.hypot(position.x-origin.x,position.z-origin.z)>8||Math.hypot(position.x-ctx.player.x,position.z-ctx.player.z)<.8)return;
        const size=node.geometry?.parameters;node.getWorldScale(scale);
        const atFloor=Math.abs(position.y-ctx.floorY)<.2;
        const dimensions=atFloor&&T.NRn?new T.NRn().setFromObject(node).getSize(new T.Pq0()):null;
        const oldPlatform=dimensions&&dimensions.x>=1&&dimensions.x<=4.5&&dimensions.z>=.5&&dimensions.z<=4.5&&dimensions.y<.08;
        const equipmentPart=!(size?.width*scale.x>2.5||size?.depth*scale.z>2.5)&&replacedColliders.some(c=>Math.abs(position.x-c.x)<c.halfX+.65&&Math.abs(position.z-c.z)<c.halfZ+.65);
        const color=node.material?.color?.getHSL?.({}),width=size?.width*scale.x,height=size?.height*scale.y,depth=size?.depth*scale.z;
        const emptyShelf=color&&color.h<.16&&color.s>.2&&width>=.6&&width<=4.5&&height<=1.3&&depth>=.08&&depth<=1.5;
        const localX=(position.x-origin.x)*(-origin.forwardZ)+(position.z-origin.z)*origin.forwardX,localDepth=(position.x-origin.x)*origin.forwardX+(position.z-origin.z)*origin.forwardZ;
        const wallSize=localX< -5&&localDepth>-.5&&localDepth<6&&T.NRn?new T.NRn().setFromObject(node).getSize(new T.Pq0()):null;
        const wallShelf=wallSize&&wallSize.y<.18&&Math.max(wallSize.x,wallSize.z)>=.7&&Math.max(wallSize.x,wallSize.z)<=4.5&&Math.min(wallSize.x,wallSize.z)>=.12;
        const lowLever=position.y<ctx.floorY+.6&&width>=.3&&width<=.7&&height<.12&&depth<=.18;
        if(emptyShelf){for(const collider of ctx.colliders)if(!collider.cityModuleWorkshop&&collider.minY<=ctx.floorY&&collider.maxY>ctx.floorY&&collider.halfX<1&&collider.halfZ<1&&Math.abs(collider.x-position.x)<width/2+.25&&Math.abs(collider.z-position.z)<depth/2+.25&&!discovered.includes(collider)){discovered.push(collider);if(!replacedColliders.includes(collider))replacedColliders.push(collider);}}
        if(oldPlatform||equipmentPart||emptyShelf||wallShelf||lowLever){if(!replacedMeshes.includes(node))replacedMeshes.push(node);node.visible=false;}
      });
      for(const collider of discovered){const index=ctx.colliders.indexOf(collider);if(index>=0)ctx.colliders.splice(index,1);}
    }
    refresh();
    const own=value=>(owned.add(value),value);
    const represented=new Set();
    function bindResource(node,item){
      if(!item)return node;
      node.userData.curriculumResources=[...(node.userData.curriculumResources||[]),item];represented.add(item.name);return node;
    }
    function bindMatching(node,pattern){for(const item of setup.resources||[])if(pattern.test(normalize(item.name)))bindResource(node,item);return node;}
    const boxGeometry=own(new T.iNn(1,1,1)),planeGeometry=own(new T.bdM(1,1));
    const colors={blue:0x075b9f,metal:0xbac6d0,dark:0x15222b,white:0xf4f7fa,teal:0x139a92,orange:0xf5be27,red:0xbe302c,wood:0xc89b60,rubber:0x192027,anodized:0xb6ba6e};
    const Shaded=T._4j||T.V9B;
    const materials=Object.fromEntries(Object.entries(colors).map(([key,color])=>[key,own(new Shaded({color,...(Shaded!==T.V9B?{metalness:key==='metal'?.55:.1,roughness:key==='metal'?.38:.65}: {})}))]));
    materials.metal.side=T.$EB;
    materials.anodized.side=T.$EB;
    const primitiveCache=new Map();
    function surface(vertices,indices){
      const geometry=planeGeometry.clone(),Attribute=planeGeometry.getAttribute('position').constructor;
      geometry.setAttribute('position',new Attribute(new Float32Array(vertices),3));geometry.deleteAttribute('uv');geometry.deleteAttribute('normal');
      geometry.setIndex(indices);geometry.computeVertexNormals();return own(geometry);
    }
    function roundGeometry(ratio=1){
      const key=`cylinder:${ratio}`;if(primitiveCache.has(key))return primitiveCache.get(key);
      const vertices=[],indices=[],steps=24;
      for(let i=0;i<=steps;i++){const angle=i/steps*Math.PI*2;vertices.push(Math.cos(angle),-.5,Math.sin(angle),Math.cos(angle)*ratio,.5,Math.sin(angle)*ratio);}
      for(let i=0;i<steps;i++){const n=i*2;indices.push(n,n+1,n+2,n+2,n+1,n+3);}
      for(const [height,radius,flip] of [[-.5,1,false],[.5,ratio,true]]){
        const center=vertices.length/3;vertices.push(0,height,0);
        for(let i=0;i<=steps;i++){const angle=i/steps*Math.PI*2;vertices.push(Math.cos(angle)*radius,height,Math.sin(angle)*radius);if(i){const a=center+i,b=a+1;indices.push(center,flip?b:a,flip?a:b);}}
      }
      const geometry=surface(vertices,indices);primitiveCache.set(key,geometry);return geometry;
    }
    function ring(parent,x,y,z,radius,thickness,color='metal'){
      const key=`ring:${thickness/radius}`;let geometry=primitiveCache.get(key);
      if(!geometry){const vertices=[],indices=[],tube=thickness/radius;
        for(let i=0;i<=32;i++)for(let j=0;j<=6;j++){const a=i/32*Math.PI*2,b=j/6*Math.PI*2,r=1+Math.cos(b)*tube;vertices.push(Math.cos(a)*r,Math.sin(a)*r,Math.sin(b)*tube);}
        for(let i=0;i<32;i++)for(let j=0;j<6;j++){const n=i*7+j;indices.push(n,n+7,n+1,n+1,n+7,n+8);}geometry=surface(vertices,indices);primitiveCache.set(key,geometry);
      }
      const mesh=new T.eaF(geometry,materials[color]);mesh.position.set(x,y,z);mesh.scale.setScalar(radius);parent.add(mesh);return mesh;
    }
    function box(parent,x,y,z,w,h,d,color='blue'){
      const mesh=new T.eaF(boxGeometry,materials[color]);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=w>.25&&h>.15;mesh.receiveShadow=true;parent.add(mesh);return mesh;
    }
    function cylinder(parent,x,y,z,radiusTop,radiusBottom,height,color='metal',segments=12){
      const mesh=new T.eaF(roundGeometry(radiusTop/radiusBottom),materials[color]);
      mesh.position.set(x,y,z);mesh.scale.set(radiusBottom,height,radiusBottom);mesh.castShadow=radiusBottom>.1;mesh.receiveShadow=true;parent.add(mesh);return mesh;
    }
    function rod(parent,a,b,radius=.025,color='metal'){
      const direction=new T.Pq0(b[0]-a[0],b[1]-a[1],b[2]-a[2]),length=direction.length();
      const mesh=cylinder(parent,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,radius,radius,length,color);
      mesh.quaternion.setFromUnitVectors(new T.Pq0(0,1,0),direction.normalize());return mesh;
    }
    function tool(parent,x,y,z,type=0,scale=1){
      const group=new T.YJl();group.position.set(x,y,z);group.scale.setScalar(scale);parent.add(group);
      if(type===0){
        box(group,0,0,0,.055,.52,.035,'metal');ring(group,0,-.27,0,.073,.018);
        for(const side of [-1,1]){rod(group,[0,.22,0],[side*.075,.27,0],.025);rod(group,[side*.075,.27,0],[side*.065,.36,0],.025);}
      }else if(type===1){
        cylinder(group,0,-.12,0,.043,.043,.27,'red');rod(group,[0,0,0],[0,.35,0],.015);box(group,0,.37,0,.045,.04,.01,'metal');
      }else if(type===2){
        for(const side of [-1,1]){rod(group,[side*.11,-.3,0],[0,.05,0],.035,'orange');rod(group,[0,.05,0],[side*.075,.25,0],.025);}
        const pin=cylinder(group,0,.05,.015,.04,.04,.06,'dark');pin.rotation.x=Math.PI/2;
      }else{
        box(group,0,0,0,.03,.55,.035,'metal');box(group,.1,.15,0,.24,.045,.045,'metal');box(group,.08,-.05,0,.2,.04,.05,'dark');
      }return group;
    }
    function vise(parent,x,y,z){
      const group=new T.YJl();group.position.set(x,y,z);parent.add(group);
      cylinder(group,0,.06,0,.18,.21,.12,'blue');box(group,0,.18,0,.32,.2,.28,'blue');
      for(const side of [-1,1]){box(group,0,.31,side*.14,.4,.13,.095,'blue');box(group,0,.39,side*.14,.42,.035,.09,'metal');}
      rod(group,[0,.18,-.05],[0,.18,.38],.033);rod(group,[-.17,.18,.39],[.17,.18,.39],.018);return group;
    }
    function wheel(parent,x,y,z){const tire=cylinder(parent,x,y,z,.11,.11,.08,'rubber');tire.rotation.x=Math.PI/2;const hub=cylinder(parent,x,y,z+.045,.048,.048,.015,'metal');hub.rotation.x=Math.PI/2;}
    function magnifier(parent,x,y,z){
      const group=new T.YJl();group.position.set(x,y,z);parent.add(group);
      ring(group,0,0,0,.15,.023,'dark');rod(group,[.1,-.1,0],[.35,-.35,0],.03,'dark');
      const lensMaterial=own(new Shaded({color:0xa6d9eb,transparent:true,opacity:.28,side:T.$EB}));
      const lens=new T.eaF(roundGeometry(),lensMaterial);lens.rotation.x=Math.PI/2;lens.scale.set(.13,.006,.13);group.add(lens);return group;
    }
    function book(parent,x,y,z,title,open=false){
      const group=new T.YJl();group.position.set(x,y,z);parent.add(group);
      box(group,0,0,0,open?.92:.45,.055,.64,'blue');
      if(!open){box(group,0,.04,0,.41,.055,.6,'white');box(group,0,.075,0,.45,.02,.64,'blue');label(group,title,0,.09,.08,.4,.18,'#174e7c').rotation.x=-Math.PI/2;return group;}
      const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=700;const c=canvas.getContext('2d');c.fillStyle='#f6f6f2';c.fillRect(0,0,1024,700);
      c.fillStyle='#123455';c.font='bold 36px Arial';c.fillText('SRM',42,65);c.font='22px Arial';c.fillText('Structural Repair Manual',42,103);
      c.strokeStyle='#74828d';c.lineWidth=2;
      for(let i=0;i<14;i++){const yy=160+i*30;c.beginPath();c.moveTo(42,yy);c.lineTo(420-(i%3)*30,yy);c.stroke();}
      c.strokeStyle='#17384f';c.lineWidth=3;c.beginPath();c.moveTo(570,440);c.lineTo(640,190);c.lineTo(935,280);c.lineTo(900,475);c.closePath();c.stroke();
      for(let i=0;i<6;i++){c.beginPath();c.moveTo(600+i*51,340-i*8);c.lineTo(640+i*50,210+i*15);c.stroke();}
      c.font='22px Arial';c.fillText('Inspección estructural',585,565);c.fillStyle='#c7c9c6';c.fillRect(506,0,12,700);
      const texture=own(new T.GOR(canvas));texture.colorSpace=T.er$;const paper=new T.eaF(own(new T.bdM(.88,.61)),own(new T.V9B({map:texture,side:T.$EB,toneMapped:false})));paper.rotation.x=-Math.PI/2;paper.position.y=.04;group.add(paper);return group;
    }
    function documentStand(parent,x,z,title){
      const group=new T.YJl();group.position.set(x,0,z);parent.add(group);box(group,0,.04,0,.6,.08,.44,'dark');rod(group,[0,.08,0],[0,1.25,0],.035);
      const board=new T.YJl();board.position.set(0,1.36,0);board.rotation.x=-.35;group.add(board);
      if(/SRM/.test(title)){board.rotation.x=-.6;book(board,0,0,.04,title,true).rotation.x=Math.PI/2;}
      else{box(board,0,0,0,.84,.62,.045,'dark');box(board,0,0,.03,.76,.54,.015,'white');label(board,title,0,.18,.043,.7,.11,'#123a59');
        for(let i=0;i<7;i++)box(board,-.02,.08-i*.04,.047,.57-(i%3)*.09,.007,.005,'metal');}
      return group;
    }
    function label(parent,text,x,y,z,w,h,bg='#103747'){
      const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.max(48,Math.round(1024*h/w));
      const c=canvas.getContext('2d'),padding=32,available=canvas.width-padding*2;
      c.fillStyle=bg;c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle='#ffffff';
      let size=Math.min(72,Math.round(canvas.height*.58)),lines=[];
      do{
        c.font=`700 ${size}px Arial`;lines=[];let line='';
        for(const word of String(text).split(/\s+/)){const next=`${line}${line?' ':''}${word}`;if(c.measureText(next).width>available&&line){lines.push(line);line=word;}else line=next;}
        if(line)lines.push(line);
        if(lines.length*size*1.12<=canvas.height-16)break;size-=2;
      }while(size>12);
      const lineHeight=size*1.12,top=(canvas.height-lines.length*lineHeight)/2;c.textBaseline='middle';
      lines.forEach((value,index)=>c.fillText(value,padding,top+(index+.5)*lineHeight,available));
      const texture=own(new T.GOR(canvas));texture.colorSpace=T.er$;
      const material=own(new T.V9B({map:texture,toneMapped:false,side:T.$EB}));
      const mesh=new T.eaF(planeGeometry,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,1);parent.add(mesh);return mesh;
    }
    function resource(parent,item,x,y,z){
      const unit=new T.YJl();unit.position.set(x,y,z);unit.userData.curriculumResource=item;unit.name=item.name;parent.add(unit);
      bindResource(unit,item);
      const name=normalize(item.name),kind=item.category;
      if(/lupa|espejo/.test(name)){
        const glass=magnifier(unit,-.1,.22,.07);glass.scale.setScalar(1.5);
      }else if(/compresor/.test(name)){
        const machine=buildCompressor(unit,0,0);machine.scale.setScalar(.48);
      }else if(/pano|toalla|tela.*limpieza/.test(name)){
        for(let i=0;i<4;i++)box(unit,0,.04+i*.05,0,.68,.045,.42,i%2?'blue':'teal');
      }else if(/bandeja|desecho/.test(name)){
        box(unit,0,.05,0,.76,.035,.45,'metal');for(const x of [-.37,.37])box(unit,x,.13,0,.025,.16,.45,'metal');for(const z of [-.21,.21])box(unit,0,.13,z,.74,.16,.025,'metal');
      }else if(kind==='digital'){
        box(unit,0,.28,0,.62,.4,.08,'dark');box(unit,0,.28,.047,.54,.32,.02,'teal');box(unit,0,.04,0,.1,.14,.1,'metal');box(unit,0,-.04,.06,.65,.035,.3,'dark');
      }else if(kind==='documents'){
        const document=book(unit,0,.04,0,/diccionario/.test(name)?'Diccionario':'Manual',/structural|srm/.test(name));document.scale.setScalar(.9);
      }else if(kind==='tools'){
        box(unit,0,0,0,.72,.1,.38,'dark');
        for(let i=0;i<4;i++){const x=-.25+i*.17;box(unit,x,.24,0,.035,.39,.04,'metal');box(unit,x,.07,0,.075,.16,.08,i%2?'orange':'teal');box(unit,x,.45,0,.11,.055,.04,'metal');}
      }else if(kind==='protection'){
        if(/casco/.test(name)){
          box(unit,0,.22,0,.54,.22,.28,'orange');box(unit,0,.09,.035,.68,.035,.38,'orange');
        }else if(/guante/.test(name)){
          for(const x of [-.19,.19]){box(unit,x,.15,0,.23,.23,.1,'orange');for(let i=0;i<4;i++)box(unit,x-.08+i*.055,.33,0,.04,.18,.08,'orange');}
        }else{
          box(unit,0,.18,0,.62,.32,.35,'teal');box(unit,0,.34,0,.68,.04,.39,'white');
        }
      }else if(/turbina|motor|compresor|rodamiento|engranaje|rotor/.test(name)){
        const axis=cylinder(unit,-.08,.28,0,.4,.4,.82,'metal',20);axis.rotation.z=Math.PI/2;
        for(const x of [-.49,.34]){const ring=cylinder(unit,x,.28,0,.47,.47,.11,'dark',24);ring.rotation.z=Math.PI/2;}
        const hub=cylinder(unit,-.55,.28,0,.22,.22,.14,'white',16);hub.rotation.z=Math.PI/2;
        for(let i=0;i<8;i++){const angle=i*Math.PI/4,blade=box(unit,-.56+Math.cos(angle)*.19,.28+Math.sin(angle)*.19,0,.24,.045,.045,'blue');blade.rotation.z=angle;}
        box(unit,.55,.27,0,.13,.62,.5,'dark');
      }else if(/aeronave|recubrimiento|ala|estructur|fuselaje/.test(name)){
        const panel=box(unit,0,.23,0,.78,.07,.45,'metal');panel.rotation.z=.15;
        for(let i=0;i<5;i++)for(const z of [-.17,.17])box(unit,-.3+i*.15,.28,z,.025,.025,.025,'dark');
        box(unit,-.27,.08,0,.055,.28,.33,'blue');box(unit,.27,.08,0,.055,.28,.33,'blue');
      }else if(/cable|circuit|electr|tablero|sensor/.test(name)){
        box(unit,0,.2,0,.76,.42,.12,'dark');box(unit,0,.2,.07,.65,.3,.025,'teal');
        for(let i=0;i<4;i++){box(unit,-.24+i*.16,.2,.095,.06,.13,.025,i%2?'orange':'red');box(unit,-.24+i*.16,.2,.115,.025,.28,.018,'white');}
      }else if(/plano|manual|registro|ficha|document|informe|procedimiento/.test(name)){
        box(unit,0,.14,0,.7,.48,.08,'white');box(unit,0,.14,.045,.59,.37,.015,'blue');
        for(let i=0;i<4;i++)box(unit,-.16,.28-i*.08,.06,.32,.018,.012,'white');
      }else if(kind==='materials'){
        box(unit,0,.015,0,.78,.05,.39,'metal');
        for(let i=0;i<3;i++){box(unit,-.24+i*.24,.17,0,.16,.27,.18,i%2?'white':'teal');box(unit,-.24+i*.24,.325,0,.1,.04,.12,'dark');}
      }else{
        box(unit,0,.12,0,.68,.22,.4,'blue');box(unit,0,.27,0,.58,.07,.36,'metal');box(unit,.2,.39,0,.13,.22,.15,'dark');box(unit,-.19,.25,.21,.11,.09,.03,'orange');
      }
      label(unit,item.name,0,-.17,.29,.94,.23,'#214c60');
      return unit;
    }
    function addToolboard(rack,items){
      rack.name='Panel de herramientas y banco con cajoneras';rack.userData.workshopFixture='tools';
      box(rack,0,2,-.16,3.7,1.55,.09,'dark');box(rack,0,2,-.1,3.58,1.44,.025,'blue');
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d');
      c.fillStyle='#075391';c.fillRect(0,0,512,256);c.fillStyle='#032d52';
      for(let x=8;x<512;x+=14)for(let y=8;y<256;y+=14){c.beginPath();c.arc(x,y,1.8,0,Math.PI*2);c.fill();}
      const texture=own(new T.GOR(canvas));texture.colorSpace=T.er$;
      const perforation=new T.eaF(planeGeometry,own(new T.V9B({map:texture})));perforation.position.set(0,2,-.08);perforation.scale.set(3.55,1.41,1);rack.add(perforation);
      const mechanical=/mecan|aeronave|metal|electric|constru|industrial|mineria/.test(normalize(setup.specialty));
      if(items.length&&mechanical){
        for(let i=0;i<9;i++)tool(rack,-1.55+i*.19,2.22,.02,0,.69+i*.018);
        for(let i=0;i<6;i++)tool(rack,.3+i*.21,2.23,.02,1,.77);
        for(let i=0;i<4;i++)tool(rack,.1+i*.48,1.6,.02,i%2?3:2,.72);
        for(let i=0;i<7;i++)tool(rack,-1.5+i*.21,1.58,.11,1,.7);
        for(const item of items)if(!/lupa|espejo/.test(normalize(item.name)))bindResource(rack,item);
      }else items.slice(0,4).forEach((item,i)=>resource(rack,item,-1.32+i*.88,1.85,.12).scale.setScalar(.7));
      box(rack,0,1.03,.25,3.8,.12,1.02,'wood');box(rack,0,.5,.24,3.62,.94,.9,'blue');
      for(let col=0;col<3;col++)for(let row=0;row<4;row++){
        const x=(col-1)*1.14,y=.84-row*.19;box(rack,x,y,.704,1.06,.17,.028,'blue');box(rack,x,y-.092,.727,1.1,.015,.015,'dark');rod(rack,[x-.24,y,.75],[x+.24,y,.75],.018);
      }
      for(const x of [-1.66,1.66])box(rack,x,.09,.24,.12,.18,.86,'dark');
      vise(rack,-1.18,1.1,.48);
      box(rack,.35,1.14,.16,.65,.21,.3,'red');box(rack,.35,1.27,.16,.27,.035,.09,'dark');
      for(const x of [.86,1.14,1.42])box(rack,x,1.18,.12,.18,.2,.29,'metal');
      label(rack,'Herramientas',0,3,-.09,3.7,.36,'#064477');
      return rack;
    }
    function addPpeAndDocumentWall(rack,items,wallOnly=false){
      rack.name='Estantería de EPP, materiales y equipo';rack.userData.workshopFixture='safety';
      if(wallOnly){box(rack,0,2.64,-.16,3.7,.94,.08,'blue');box(rack,0,2.3,.08,3.7,.07,.6,'metal');}
      else{for(const x of [-1.7,1.7])box(rack,x,1.4,-.12,.07,2.8,.08,'blue');for(const y of [.25,.88,1.5,2.3])box(rack,0,y,.08,3.5,.07,.68,'metal');}
      label(rack,items.some(item=>item.category==='protection')?'EPP · Protección personal':'Recursos del módulo',0,3,-.09,3.7,.36,'#064477');
      const industrial=/mecan|aeronave|metal|electric|constru|industrial|mineria/.test(normalize(setup.specialty));
      if(industrial&&items.some(item=>item.category==='protection')){
        const lens=own(new Shaded({color:0x9cd8ef,transparent:true,opacity:.4}));
        for(const x of [-1.27,-.87]){ring(rack,x,2.58,.17,.16,.027,'dark');const glass=box(rack,x,2.58,.18,.24,.17,.025,'white');glass.material=lens;}
        rod(rack,[-1.1,2.57,.16],[-.64,2.6,.12],.018,'dark');
        const headset=ring(rack,0,2.64,.09,.22,.035,'dark');headset.scale.y*=1.15;
        for(const x of [-.21,.21]){const cushion=cylinder(rack,x,2.52,.14,.13,.13,.09,'rubber');cushion.rotation.x=Math.PI/2;const cup=cylinder(rack,x,2.52,.2,.115,.1,.08,'orange');cup.rotation.x=Math.PI/2;}
        for(const x of [.85,1.26]){box(rack,x,2.44,.1,.22,.2,.09,'orange');for(let j=0;j<4;j++)rod(rack,[x-.075+j*.05,2.5,.1],[x-.08+j*.055,2.69-(j===0?.025:0),.1],.025,'orange');rod(rack,[x+.1,2.44,.1],[x+.18,2.54,.1],.035,'orange');}
        for(const item of items.filter(item=>item.category==='protection'))if(/proteccion personal|epp|guante|antiparra|auditiv/.test(normalize(item.name)))bindResource(rack,item);
      }else items.filter(item=>item.category==='protection').slice(0,3).forEach((item,i)=>resource(rack,item,-1.1+i*1.1,2.4,.12).scale.setScalar(.65));
      if(wallOnly){rack.userData.workshopFixture='safety-wall';return rack;}
      const materialsInRoom=items.filter(item=>item.category==='materials');
      const inspection=items.some(item=>/dye|penetrant/.test(normalize(item.name)));
      if(inspection){
        for(let i=0;i<3;i++){const x=-1.1+i*1.1;cylinder(rack,x,1.78,.08,.13,.13,.48,'white');cylinder(rack,x,2.05,.08,.11,.11,.06,i===1?'red':i===2?'blue':'teal');label(rack,['Limpiador','Penetrante','Revelador'][i],x,1.76,.22,.8,.16,'#164866');}
        bindMatching(rack,/dye|penetrant/);
      }else items.filter(item=>item.category==='equipment').slice(0,3).forEach((item,i)=>resource(rack,item,-1.1+i*1.1,1.67,.09).scale.setScalar(.64));
      for(let i=0;i<3;i++)box(rack,-1.15,1.01+i*.055,.12,.82,.05,.45,'blue');
      for(const x of [.02,.64,1.26]){cylinder(rack,x,1.1,.09,.17,.17,.34,'metal');ring(rack,x,1.29,.09,.15,.02).rotation.x=Math.PI/2;}
      box(rack,.3,.47,.12,1.6,.4,.5,'orange');label(rack,'Desechos · manejo seguro',.3,.48,.38,1.5,.21,'#655214');
      materialsInRoom.slice(0,2).forEach((item,i)=>{const unit=resource(rack,item,-1.2+i*2.4,.37,.08);unit.scale.setScalar(.45);});
      return rack;
    }
    function buildTrolley(parent){
      const cart=new T.YJl();cart.position.set(1.48,0,.75);cart.rotation.y=-.25;parent.add(cart);
      box(cart,0,.57,0,.94,.85,.66,'blue');box(cart,0,1.02,0,1,.06,.72,'metal');box(cart,0,1.07,0,.87,.035,.58,'dark');
      for(let i=0;i<4;i++){const y=.86-i*.18;box(cart,0,y,.35,.82,.15,.055,'blue');rod(cart,[-.26,y,.4],[.26,y,.4],.018);}
      for(const x of [-.35,.35])for(const z of [-.26,.26])wheel(cart,x,.12,z);
      for(let i=0;i<4;i++){const wrench=tool(cart,-.3+i*.19,1.1,0,i%2,.45);wrench.rotation.x=-Math.PI/2;}
      box(cart,0,.84,.58,.85,.06,.46,'metal');box(cart,0,.88,.58,.78,.025,.39,'dark');
      for(let i=0;i<4;i++){const wrench=tool(cart,-.28+i*.18,.92,.6,i%2,.4);wrench.rotation.x=-Math.PI/2;}
      rod(cart,[.5,.87,-.24],[.5,1.14,-.24],.025);rod(cart,[.5,1.14,-.24],[.5,1.14,.24],.025);
      bindMatching(cart,/caja.*herramient/);return cart;
    }
    function buildCompressor(parent,x,z){
      const unit=new T.YJl();unit.position.set(x,0,z);parent.add(unit);unit.name='Compresor de aire y manguera';
      const tank=cylinder(unit,0,.55,0,.3,.3,1.05,'blue');tank.rotation.z=Math.PI/2;
      for(const px of [-.47,.47]){const rim=ring(unit,px,.55,0,.29,.025);rim.rotation.y=Math.PI/2;wheel(unit,px,.16,.22);}
      box(unit,0,.94,0,.38,.3,.34,'dark');for(let i=0;i<5;i++)box(unit,-.15+i*.075,1.12,0,.025,.12,.37,'metal');
      rod(unit,[-.4,.7,-.22],[-.55,1.17,-.22],.025,'blue');rod(unit,[-.55,1.17,-.22],[-.55,1.17,.22],.025,'blue');
      label(unit,'AIRE COMPRIMIDO',0,.55,.31,.8,.18,'#075493');
      for(let i=0;i<4;i++)ring(unit,.75,1,.01+i*.05,.34,.025,'blue');
      rod(unit,[.75,.67,.17],[.45,.05,.55],.018,'dark');
      bindMatching(unit,/compresor/);return unit;
    }
    function buildStructuralSample(parent){
      parent.name='Puesto de inspección estructural';parent.userData.workshopFixture='inspection';
      for(const x of [-1.12,1.12]){
        for(const z of [-.56,.56]){box(parent,x,.5,z,.12,.9,.12,'blue');wheel(parent,x,.1,z);}
        box(parent,x,.94,0,.16,.12,1.5,'orange');box(parent,x,.18,0,.12,.1,1.5,'blue');
        for(const z of [-.62,.62])box(parent,x,1.1,z,.19,.29,.16,'orange');
      }
      const vertices=[],indices=[],nx=18,nz=10,height=z=>1.28+.3*(1-(z/.7)**2);
      for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const z=(j/nz-.5)*1.4;vertices.push((i/nx-.5)*2.8,height(z),z);}
      for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;indices.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}
      const skin=new T.eaF(surface(vertices,indices),materials.metal);skin.userData.featuredModuleEquipment=true;parent.add(skin);
      const ribVertices=[],ribIndices=[];
      for(let j=0;j<24;j++)for(let i=0;i<96;i++){
        const z=-.7+i*1.4/96,z2=z+1.4/96,y=1.03+j*.0215,y2=y+.0215;
        if(y2>height((z+z2)/2)-.035||[-.45,0,.45].some(center=>Math.hypot((z+z2)/2-center,(y+y2)/2-1.2)<.085))continue;
        const a=ribVertices.length/3;ribVertices.push(0,y,z,0,y2,z,0,y,z2,0,y2,z2);ribIndices.push(a,a+1,a+2,a+2,a+1,a+3);
      }
      const ribGeometry=surface(ribVertices,ribIndices);
      for(const x of [-1.35,-.7,0,.7,1.35]){const rib=new T.eaF(ribGeometry,materials.anodized);rib.position.x=x;parent.add(rib);}
      for(const z of [-.58,-.18,.24,.6])for(let i=0;i<15;i++){const x=-1.3+i*.185;cylinder(parent,x,height(z)+.008,z,.013,.018,.012,'metal');}
      const crack=[[-.48,-.38],[-.4,-.25],[-.46,-.12],[-.35,.04],[-.39,.16]];
      for(let i=1;i<crack.length;i++){const a=crack[i-1],b=crack[i];rod(parent,[a[0],height(a[1])+.02,a[1]],[b[0],height(b[1])+.02,b[1]],.009,'red');}
      const glass=magnifier(parent,.7,1.61,.16);glass.rotation.x=-Math.PI/2;bindMatching(glass,/lupa/);
      rod(parent,[-1.25,1,-.6],[-1.25,1.97,-.6],.027,'dark');rod(parent,[-1.25,1.97,-.6],[-.65,2.05,-.6],.027,'dark');
      const lamp=cylinder(parent,-.65,2,-.6,.15,.1,.12,'dark');lamp.rotation.z=.15;
      label(parent,'Inspección estructural',0,.61,.77,2.3,.32,'#064477');
      bindMatching(parent,/aeronave.*recubrimiento|estructuras.*alas/);return parent;
    }
    function buildServiceBench(parent,primary,repair=false){
      parent.name=repair?'Mesa de reparación y remachado':'Banco de trabajo del módulo';parent.userData.workshopFixture=repair?'repair':'workbench';
      box(parent,0,.99,0,2.8,.1,1.35,'metal');
      for(const x of [-1.22,1.22])for(const z of [-.52,.52]){box(parent,x,.52,z,.1,.94,.1,'blue');wheel(parent,x,.1,z);}
      box(parent,0,.29,0,2.55,.09,1.02,'blue');box(parent,-.8,.65,-.03,.8,.57,1.05,'dark');
      for(let row=0;row<3;row++){const y=.85-row*.16;box(parent,-.8,y,.51,.75,.14,.025,'blue');rod(parent,[-1,y,.55],[-.6,y,.55],.018);}
      if(repair){
        for(const x of [-.9,-.33]){const plate=box(parent,x,1.06,0,.52,.035,.78,'metal');plate.rotation.y=.12;}
        for(let i=0;i<6;i++)for(const z of [-.25,.05,.3]){const x=-1.08+i*.24;cylinder(parent,x,1.11,z,.018,.021,.08,'orange');}
        box(parent,.7,1.08,-.23,.7,.08,.36,'dark');
        for(let i=0;i<10;i++)cylinder(parent,.43+(i%5)*.12,1.14,-.32+Math.floor(i/5)*.13,.02,.023,.055,'metal');
        const drill=new T.YJl();drill.position.set(.65,1.18,.32);drill.rotation.z=-.6;parent.add(drill);
        box(drill,0,0,0,.3,.18,.14,'blue');box(drill,.07,-.18,0,.12,.3,.14,'dark');rod(drill,[-.14,0,0],[-.48,0,0],.028);box(drill,.21,0,0,.12,.14,.17,'dark');
        for(let i=0;i<10;i++)rod(parent,[1.18+Math.sin(i*.65)*.1,1.12-i*.08,.25],[1.18+Math.sin((i+1)*.65)*.1,1.04-i*.08,.25],.018,'blue');
        bindMatching(documentStand(parent,-.75,-.8,'SRM · Manual de reparación'),/manual.*structural|structural.*manual/);
        bindMatching(documentStand(parent,.65,-.8,'Registro de inspección'),/pauta|registro/);
        const riveter=new T.YJl();riveter.position.set(1.02,1.15,-.28);parent.add(riveter);
        rod(riveter,[-.14,.1,0],[.17,.1,0],.065);rod(riveter,[.1,.1,0],[.1,-.15,0],.05,'blue');rod(riveter,[-.14,.1,0],[-.3,.1,0],.025);
        for(let i=0;i<4;i++){const plier=tool(parent,-1+i*.28,1.08,.52,i%2?0:2,.3);plier.rotation.x=-Math.PI/2;}
        bindMatching(parent,/herramientas.*equipos|maquinaria/);
      }else if(primary){const sample=resource(parent,primary,0,1.1,-.1);sample.scale.setScalar(1.5);sample.userData.featuredModuleEquipment=true;vise(parent,1,1.05,.2);}
      label(parent,repair?'Reparación y remachado':'Puesto de trabajo',0,.52,.72,2.5,.31,'#064477');
      return parent;
    }
    const locations=chooseLocations(ctx,stations);
    locations.forEach((location,index)=>{
      const rack=new T.YJl();rack.position.set(location.x,ctx.floorY,location.z);rack.rotation.y=location.yaw;root.add(rack);
      const items=(setup.resources||[]).map(item=>({...item,category:item.category||'equipment'}));
      if(location.side<0){addToolboard(rack,items.filter(item=>item.category==='tools'));if(items.some(item=>item.category==='tools'))buildTrolley(rack);}
      else{addPpeAndDocumentWall(rack,items);if(items.some(item=>/compresor/.test(normalize(item.name))))buildCompressor(rack,1.05,.9);}
      const collider={x:location.x,z:location.z,halfX:location.halfX,halfZ:location.halfZ,minY:ctx.floorY,maxY:ctx.floorY+3.4,cityModuleWorkshop:true};
      ctx.colliders.push(collider);colliders.push(collider);
    });
    const primary=(setup.resources||[]).find(item=>item.category==='equipment')||(setup.resources||[]).find(item=>!['documents','digital'].includes(item.category))||setup.resources?.[0];
    const structural=/aeronave/.test(normalize(setup.specialty))&&(setup.resources||[]).some(item=>/aeronave.*recubrimiento|estructuras.*alas/.test(normalize(item.name)));
    const facing=new T.Pq0(ctx.workshopLayout.forwardX,0,ctx.workshopLayout.forwardZ);
    facing.y=0;facing.normalize();const rightX=-facing.z,rightZ=facing.x;
    const candidates=[[-3.4,1],[3.4,1],[-3.65,.1],[3.65,.1],[-3.9,-.6],[3.9,-.6]];
    const occupied=[];
    for(const [side,depth] of candidates){
      const place={x:origin.x+rightX*side+facing.x*depth,z:origin.z+rightZ*side+facing.z*depth};
      const nearQuiz=stations.some(s=>{const [sx,sz]=s.totem||[s.x,s.z];return Math.hypot(place.x-ctx.district.x-sx,place.z-ctx.district.z-sz)<2.6;});
      const halfX=1.48*Math.abs(rightX)+.85*Math.abs(facing.x),halfZ=1.48*Math.abs(rightZ)+.85*Math.abs(facing.z);
      const collides=ctx.colliders.some(c=>ctx.floorY+1>=(c.minY??-Infinity)&&ctx.floorY<=(c.maxY??Infinity)&&Math.abs(c.x-place.x)<(c.halfX??.5)+halfX&&Math.abs(c.z-place.z)<(c.halfZ??.5)+halfZ);
      if(nearQuiz||collides||occupied.some(p=>p.side===Math.sign(side))||Math.hypot(place.x-origin.x,place.z-origin.z)<3.3)continue;
      const bench=new T.YJl();bench.position.set(place.x,ctx.floorY,place.z);bench.rotation.y=Math.atan2(-rightZ,rightX);root.add(bench);
      if(structural&&side<0)buildStructuralSample(bench);else buildServiceBench(bench,primary,structural&&side>0);
      place.side=Math.sign(side);
      const collider={x:place.x,z:place.z,halfX,halfZ,minY:ctx.floorY,maxY:ctx.floorY+2.1,cityModuleWorkshop:true};ctx.colliders.push(collider);colliders.push(collider);occupied.push(place);
      if(occupied.length===2)break;
    }
    let wallCount=0;
    const tools=(setup.resources||[]).filter(item=>item.category==='tools'),protections=(setup.resources||[]).filter(item=>item.category==='protection');
    const industrial=/mecan|aeronave|metal|electric|constru|industrial|mineria/.test(normalize(setup.specialty));
    if(industrial&&tools.length){
      const wall=new T.YJl();wall.position.set(origin.x-rightX*6.55+facing.x*2.5,ctx.floorY,origin.z-rightZ*6.55+facing.z*2.5);wall.rotation.y=Math.atan2(rightX,rightZ);root.add(wall);
      addToolboard(wall,tools);wall.userData.workshopFixture='tools-wall';wall.name='Banco y herramientas de la pared izquierda';
      const collider={x:wall.position.x+rightX*.4,z:wall.position.z+rightZ*.4,halfX:.55*Math.abs(rightX)+1.95*Math.abs(facing.x),halfZ:.55*Math.abs(rightZ)+1.95*Math.abs(facing.z),minY:ctx.floorY,maxY:ctx.floorY+3.3,cityModuleWorkshop:true};ctx.colliders.push(collider);colliders.push(collider);wallCount++;
    }
    if(protections.length){
      const wall=new T.YJl();wall.position.set(origin.x+rightX*6.65+facing.x*2.5,ctx.floorY,origin.z+rightZ*6.65+facing.z*2.5);wall.rotation.y=Math.atan2(-rightX,-rightZ);root.add(wall);
      addPpeAndDocumentWall(wall,setup.resources||[],true);wall.name='EPP de la pared derecha';wallCount++;
    }
    const remaining=(setup.resources||[]).filter(item=>!represented.has(item.name));
    let storageCount=0;
    for(let start=0;start<remaining.length;start+=15){
      const index=start/15,side=index%2?1:-1,backWall=index<2,depth=backWall?8:-.8,lateral=backWall?side*1.15:side*6.05;
      const rack=new T.YJl();rack.name='Estantería de recursos del módulo';rack.userData.workshopFixture='storage';
      rack.position.set(origin.x+rightX*lateral+facing.x*depth,ctx.floorY,origin.z+rightZ*lateral+facing.z*depth);rack.rotation.y=backWall?Math.atan2(-facing.x,-facing.z):Math.atan2(-side*rightX,-side*rightZ);root.add(rack);
      const batch=remaining.slice(start,start+15),rows=Math.ceil(batch.length/3),height=.56+rows*.5;
      for(const x of [-1.05,1.05])box(rack,x,height/2,-.12,.07,height,.08,'blue');
      for(let row=0;row<rows;row++)box(rack,0,.3+row*.5,.06,2.16,.05,.65,'metal');
      label(rack,batch.every(item=>item.category==='documents')?'Biblioteca técnica':'Recursos del módulo',0,height-.04,-.08,2.18,.28,'#064477');
      batch.forEach((item,i)=>{const unit=resource(rack,item,(i%3-1)*.67,.44+Math.floor(i/3)*.5,.08);unit.scale.setScalar(.55);});
      const halfX=backWall?1.12*Math.abs(rightX)+.4*Math.abs(facing.x):.4*Math.abs(rightX)+1.12*Math.abs(facing.x),halfZ=backWall?1.12*Math.abs(rightZ)+.4*Math.abs(facing.z):.4*Math.abs(rightZ)+1.12*Math.abs(facing.z);
      const collider={x:rack.position.x,z:rack.position.z,halfX,halfZ,minY:ctx.floorY,maxY:ctx.floorY+height,cityModuleWorkshop:true};ctx.colliders.push(collider);colliders.push(collider);storageCount++;
    }
    root.userData.resourceCount=setup.resources.length;root.userData.displayedResources=[...represented];root.userData.fixtureCount=locations.length+occupied.length+wallCount+storageCount;
    root.userData.resourceCoverage=(setup.resources||[]).map(item=>({name:item.name,category:item.category,represented:represented.has(item.name),references:item.references}));
    const moduleSign=label(root,`Módulo${setup.module_number?' '+setup.module_number:''} · ${structural?'Estructuras de aeronaves':setup.module_title}`,origin.x+facing.x*8.5,ctx.floorY+3.5,origin.z+facing.z*8.5,7.1,.65,'#123d54');moduleSign.rotation.y=Math.atan2(-facing.x,-facing.z);moduleSign.name='Nombre del módulo';
    ctx.scene.add(root);
    return {root,refresh,resourceCount:setup.resources.length,displayedResources:represented.size,
      dispose(){root.removeFromParent();for(const item of owned)item.dispose();for(const collider of colliders){const index=ctx.colliders.indexOf(collider);if(index>=0)ctx.colliders.splice(index,1);}for(const collider of replacedColliders)if(!ctx.colliders.includes(collider))ctx.colliders.push(collider);for(const mesh of replacedMeshes)mesh.visible=true;}};
  }
  globalThis.AulaTPModuleWorkshop={create,chooseLocations,captureLayout,labels};
})();
