/* Module-specific workshop fixtures stay on the perimeter; quiz routes remain open. */
(() => {
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const labels={tools:'Herramientas e instrumentos',protection:'Protección personal',documents:'Documentación técnica',digital:'Recursos digitales',materials:'Materiales e insumos',equipment:'Equipos de trabajo'};
  function chooseLocations(ctx,stations){
    const locations=[];
    const forward=ctx.camera?.getWorldDirection?ctx.camera.getWorldDirection(new ctx.three.Pq0()):new ctx.three.Pq0(0,0,-1);
    forward.y=0;forward.normalize();const rightX=-forward.z,rightZ=forward.x,player=ctx.player;
    for(const side of [-1,1]){
      const candidates=[1.5,3.2,-1.2,4.8].map(distance=>({
        x:player.x+rightX*side*5.6+forward.x*distance,
        z:player.z+rightZ*side*5.6+forward.z*distance,side,rightX,rightZ,forwardX:forward.x,forwardZ:forward.z
      }));
      const available=candidates.find(p=>stations.every(s=>{
        const [x,z]=s.totem||[s.x,s.z];
        return Math.hypot(p.x-ctx.district.x-x,p.z-ctx.district.z-z)>3.5;
      })&&Math.hypot(p.x-player.x,p.z-player.z)>3.5&&ctx.colliders.every(c=>
        ctx.floorY+1.5<(c.minY??-Infinity)||ctx.floorY>(c.maxY??Infinity)||
        Math.abs(c.x-p.x)>(c.halfX??.5)+2.25*Math.abs(p.rightX)+.45*Math.abs(p.forwardX)||
        Math.abs(c.z-p.z)>(c.halfZ??.5)+2.25*Math.abs(p.rightZ)+.45*Math.abs(p.forwardZ)
      ));
      if(available)locations.push(available);
    }
    return locations;
  }
  function create(ctx,setup,stations){
    const T=ctx.three,root=new T.YJl(),owned=new Set(),colliders=[],groups=new Map();
    root.name=`Aula TP · Recursos · ${setup.module_title}`;
    root.userData.moduleTitle=setup.module_title;
    const own=value=>(owned.add(value),value);
    const boxGeometry=own(new T.iNn(1,1,1)),planeGeometry=own(new T.bdM(1,1));
    const colors={blue:0x12639c,metal:0xb9c8cb,dark:0x183039,white:0xf4f7fa,teal:0x139a92,orange:0xf5ae38,red:0xb93631};
    const materials=Object.fromEntries(Object.entries(colors).map(([key,color])=>[key,own(new T.V9B({color}))]));
    const Cylinder=Object.values(T).find(value=>typeof value==='function'&&value.name==='CylinderGeometry');
    function box(parent,x,y,z,w,h,d,color='blue'){
      const mesh=new T.eaF(boxGeometry,materials[color]);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;
    }
    function cylinder(parent,x,y,z,radiusTop,radiusBottom,height,color='metal',segments=12){
      if(!Cylinder)return box(parent,x,y,z,radiusTop*2,height,radiusBottom*2,color);
      const mesh=new T.eaF(own(new Cylinder(radiusTop,radiusBottom,height,segments)),materials[color]);
      mesh.position.set(x,y,z);parent.add(mesh);return mesh;
    }
    function label(parent,text,x,y,z,w,h,bg='#103747'){
      const canvas=document.createElement('canvas');canvas.width=768;canvas.height=160;
      const c=canvas.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,768,160);c.fillStyle='#ffffff';
      let size=40;c.font=`700 ${size}px Arial`;while(c.measureText(text).width>720&&size>18){size--;c.font=`700 ${size}px Arial`;}
      const words=String(text).split(/\s+/),lines=[];let line='';
      for(const word of words){if(c.measureText(`${line} ${word}`).width>720&&line){lines.push(line);line=word;}else line+=`${line?' ':''}${word}`;}
      if(line)lines.push(line);
      lines.slice(0,4).forEach((value,index)=>c.fillText(value,24,Math.max(size+8,(160-lines.length*(size+4))/2+size)+index*(size+4),720));
      const texture=own(new T.GOR(canvas));texture.colorSpace=T.er$;
      const material=own(new T.V9B({map:texture,toneMapped:false,side:T.$EB}));
      const mesh=new T.eaF(planeGeometry,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,1);parent.add(mesh);return mesh;
    }
    function resource(parent,item,x,y,z){
      const unit=new T.YJl();unit.position.set(x,y,z);unit.userData.curriculumResource=item;unit.name=item.name;parent.add(unit);
      const name=normalize(item.name),kind=item.category;
      if(kind==='digital'){
        box(unit,0,.28,0,.62,.4,.08,'dark');box(unit,0,.28,.047,.54,.32,.02,'teal');box(unit,0,.04,0,.1,.14,.1,'metal');box(unit,0,-.04,.06,.65,.035,.3,'dark');
      }else if(kind==='documents'){
        for(let i=0;i<3;i++){box(unit,-.22+i*.19,.2,0,.15,.47,.3,i===1?'white':'blue');box(unit,-.22+i*.19,.31,.158,.1,.035,.01,'white');}
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
      box(rack,0,1.84,-.065,4.05,1.68,.07,'dark');
      box(rack,0,1.84,-.02,3.92,1.56,.025,'blue');
      const count=Math.min(10,items.length*2),columns=5;
      for(let i=0;i<count;i++){
        const x=(i%columns-2)*.68,y=2.3-Math.floor(i/columns)*.72;
        box(rack,x,y,.12,.055,.46,.055,i%3===0?'orange':'metal');
        const jaw=box(rack,x,y+.24,.12,.23,.065,.055,'metal');jaw.rotation.z=(i%2?-.22:.22);
        box(rack,x,y-.22,.12,.17,.1,.07,i%2?'teal':'dark');
      }
      for(const x of [-1.78,1.78])box(rack,x,1.84,.15,.035,1.35,.045,'teal');
      box(rack,0,.48,.51,3.9,.74,.64,'blue');
      for(let row=0;row<3;row++){
        const y=.75-row*.22;box(rack,0,y,.84,3.38,.035,.025,'dark');
        for(const x of [-1.28,-.42,.42,1.28]){box(rack,x,y+.04,.87,.12,.045,.045,'metal');box(rack,x,y-.035,.87,.25,.025,.045,'dark');}
      }
      box(rack,-1.92,.5,.48,.08,.86,.7,'dark');box(rack,1.92,.5,.48,.08,.86,.7,'dark');
      const itemsInView=items.slice(0,5);
      itemsInView.forEach((item,index)=>resource(rack,item,-1.62+index*.81,2.85,.2).scale.setScalar(.58));
    }
    function addPpeAndDocumentWall(rack,items){
      box(rack,0,1.84,-.065,4.05,1.68,.07,'dark');
      box(rack,0,1.84,-.02,3.92,1.56,.025,'teal');
      box(rack,0,2.6,.1,3.78,.06,.52,'metal');box(rack,0,1.95,.1,3.78,.06,.52,'metal');box(rack,0,1.3,.1,3.78,.06,.52,'metal');
      const protections=items.filter(item=>item.category==='protection').slice(0,4);
      protections.forEach((item,index)=>resource(rack,item,-1.38+index*.92,2.12,.23).scale.setScalar(.72));
      if(!protections.length){
        items.filter(item=>item.category==='equipment').slice(0,3)
          .forEach((item,index)=>resource(rack,item,-1.15+index*1.15,2.12,.23).scale.setScalar(.68));
      }
      const documents=items.filter(item=>item.category==='documents').slice(0,3);
      documents.forEach((item,index)=>resource(rack,item,-1.18+index*1.18,.84,.28).scale.setScalar(.78));
      const materialsInRoom=items.filter(item=>item.category==='materials').slice(0,3);
      materialsInRoom.forEach((item,index)=>resource(rack,item,-1.3+index*1.3,.53,.46).scale.setScalar(.68));
      box(rack,0,.34,.42,3.9,.68,.64,'dark');
      for(let i=0;i<4;i++){const x=-1.38+i*.92;box(rack,x,.43,.77,.77,.035,.025,'metal');box(rack,x,.28,.77,.16,.055,.045,'metal');}
    }
    function buildServiceBench(parent,primary){
      box(parent,0,.97,0,3.1,.12,1.46,'metal');
      for(const x of [-1.33,1.33])for(const z of [-.57,.57])box(parent,x,.46,z,.14,.94,.14,'blue');
      box(parent,-.66,.7,-.08,1.05,.46,1.08,'dark');
      for(let row=0;row<3;row++){
        const y=.83-row*.15;box(parent,-.66,y,.48,.82,.025,.025,'metal');box(parent,-.66,y-.035,.49,.12,.05,.04,'metal');
      }
      box(parent,.65,.93,-.03,.7,.18,.54,'teal');
      box(parent,.65,1.14,-.03,.48,.05,.42,'dark');
      box(parent,.65,1.34,-.03,.055,.36,.06,'orange');
      for(const x of [-.1,.18]){const benchVise=box(parent,x,1.13,.32,.09,.22,.09,'dark');benchVise.rotation.z=.15;}
      if(primary){
        const sample=resource(parent,primary,.28,1.32,-.3);sample.scale.setScalar(1.7);
        sample.userData.featuredModuleEquipment=true;
      }
      box(parent,-1.17,1.2,-.28,.12,.44,.12,'dark');box(parent,-1.17,1.43,-.28,.6,.045,.07,'metal');
    }
    for(const item of setup.resources||[]){const kind=item.category||'equipment';if(!groups.has(kind))groups.set(kind,[]);groups.get(kind).push(item);}
    const locations=chooseLocations(ctx,stations),entries=[...groups.entries()],displayed=[];
    const categoryTitles={tools:'HERRAMIENTAS',protection:'EPP',documents:'DOCUMENTACIÓN TÉCNICA',digital:'RECURSOS DIGITALES',materials:'MATERIALES',equipment:'EQUIPOS'};
    const headings=[...new Set((setup.resources||[]).map(item=>categoryTitles[item.category]||categoryTitles.equipment))];
    locations.forEach((location,index)=>{
      const rack=new T.YJl();rack.position.set(location.x,ctx.floorY,location.z);rack.rotation.y=Math.atan2(-location.side*location.rightX,-location.side*location.rightZ);root.add(rack);
      box(rack,0,1.55,-.18,4.5,2.9,.12,'blue');
      const items=(setup.resources||[]).map(item=>({...item,category:item.category||'equipment'}));
      label(rack,index===0?(headings.includes('HERRAMIENTAS')?'HERRAMIENTAS Y PUESTO DE TRABAJO':headings[0]||'PUESTO DE TRABAJO'):headings.slice(1).join(' · ')||headings[0]||'RECURSOS DEL MÓDULO',0,3.14,-.08,4.5,.44);
      // All resources remain available in the inventory; shelves show a bounded set at readable scale.
      if(index===0)addToolboard(rack,items.filter(item=>item.category==='tools'));
      else addPpeAndDocumentWall(rack,items);
      const assigned=entries.filter((_,i)=>i%locations.length===index).flatMap(([kind,resources])=>resources.map(item=>({...item,category:kind})));
      assigned.slice(0,8).forEach((item,i)=>{resource(rack,item,(i%4-1.5)*1.06,2.45-Math.floor(i/4)*.8,.15);displayed.push(item.name);});
      for(const y of [.4,1.2,2])box(rack,0,y,.12,4.5,.055,.85,'metal');
      box(rack,-2.18,1.55,.05,.09,2.9,.62,'dark');box(rack,2.18,1.55,.05,.09,2.9,.62,'dark');
      for(const y of [.76,1.13,1.5]){box(rack,2.24,y,.32,.1,.2,.54,'orange');box(rack,2.3,y,.32,.08,.08,.2,'metal');}
      label(rack,index===0?'BANCO DE MANTENIMIENTO':'INSPECCIÓN Y SEGURIDAD',0,.13,.58,4.1,.26,'#0a3850');
      const collider={x:location.x,z:location.z,halfX:2.25*Math.abs(location.rightX)+.45*Math.abs(location.forwardX),halfZ:2.25*Math.abs(location.rightZ)+.45*Math.abs(location.forwardZ),minY:ctx.floorY,maxY:ctx.floorY+3.4};
      ctx.colliders.push(collider);colliders.push(collider);
    });
    const primary=(setup.resources||[]).find(item=>!['documents','digital'].includes(item.category))||setup.resources?.[0];
    const facing=ctx.camera?.getWorldDirection?ctx.camera.getWorldDirection(new T.Pq0()):new T.Pq0(0,0,-1);
    facing.y=0;facing.normalize();const rightX=-facing.z,rightZ=facing.x;
    const candidates=[[-6.4,5.2],[6.4,5.2],[-6.4,-3.2],[6.4,-3.2]];
    const occupied=[];
    for(const [side,depth] of candidates){
      const place={x:ctx.player.x+rightX*side+facing.x*depth,z:ctx.player.z+rightZ*side+facing.z*depth};
      const nearQuiz=stations.some(s=>{const [sx,sz]=s.totem||[s.x,s.z];return Math.hypot(place.x-ctx.district.x-sx,place.z-ctx.district.z-sz)<3.25;});
      const halfX=1.55*Math.abs(rightX)+.73*Math.abs(facing.x),halfZ=1.55*Math.abs(rightZ)+.73*Math.abs(facing.z);
      const collides=ctx.colliders.some(c=>ctx.floorY+1>=(c.minY??-Infinity)&&ctx.floorY<=(c.maxY??Infinity)&&Math.abs(c.x-place.x)<(c.halfX??.5)+halfX&&Math.abs(c.z-place.z)<(c.halfZ??.5)+halfZ);
      if(nearQuiz||collides||occupied.some(p=>Math.abs(p.x-place.x)<3.8&&Math.abs(p.z-place.z)<2.5)||Math.hypot(place.x-ctx.player.x,place.z-ctx.player.z)<3.3)continue;
      const bench=new T.YJl();bench.position.set(place.x,ctx.floorY,place.z);bench.rotation.y=Math.atan2(-rightZ,rightX);root.add(bench);buildServiceBench(bench,primary);
      const collider={x:place.x,z:place.z,halfX,halfZ,minY:ctx.floorY,maxY:ctx.floorY+2.1};ctx.colliders.push(collider);colliders.push(collider);occupied.push(place);
      if(occupied.length===2)break;
    }
    root.userData.resourceCount=setup.resources.length;root.userData.displayedResources=displayed;root.userData.fixtureCount=locations.length+occupied.length;
    ctx.scene.add(root);
    return {root,resourceCount:setup.resources.length,displayedResources:displayed.length,
      dispose(){root.removeFromParent();for(const item of owned)item.dispose();for(const collider of colliders){const index=ctx.colliders.indexOf(collider);if(index>=0)ctx.colliders.splice(index,1);}}};
  }
  globalThis.AulaTPModuleWorkshop={create,chooseLocations,labels};
})();
