/* Module resources occupy the room perimeter; the central quiz approach stays clear. */
(() => {
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const labels={tools:'Herramientas e instrumentos',protection:'Protección personal',documents:'Documentación técnica',digital:'Recursos digitales',materials:'Materiales e insumos',equipment:'Equipos de trabajo'};
  function chooseLocations(ctx,stations){
    const center=ctx.room.getWorldPosition(new ctx.three.Pq0()),locations=[];
    for(const side of [-1,1]){
      const candidates=[-2.5,2.5,0].map(z=>({x:center.x+side*6.9,z:center.z+z,side}));
      const available=candidates.find(p=>stations.every(s=>{
        const [x,z]=s.totem||[s.x,s.z];
        return Math.abs(p.x-ctx.district.x-x)>1.65||Math.abs(p.z-ctx.district.z-z)>3.1;
      })&&Math.hypot(p.x-ctx.player.x,p.z-ctx.player.z)>2.7);
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
    const colors={blue:0x12639c,metal:0xb9c8cb,dark:0x183039,white:0xf4f7fa,teal:0x139a92,orange:0xf5ae38};
    const materials=Object.fromEntries(Object.entries(colors).map(([key,color])=>[key,own(new T.V9B({color}))]));
    function box(parent,x,y,z,w,h,d,color='blue'){
      const mesh=new T.eaF(boxGeometry,materials[color]);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;
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
      }else if(/aeronave|recubrimiento|ala|estructur/.test(name)){
        const panel=box(unit,0,.23,0,.78,.07,.45,'metal');panel.rotation.z=.15;
        for(let i=0;i<5;i++)for(const z of [-.17,.17])box(unit,-.3+i*.15,.28,z,.025,.025,.025,'dark');
        box(unit,-.27,.08,0,.055,.28,.33,'blue');box(unit,.27,.08,0,.055,.28,.33,'blue');
      }else if(kind==='materials'){
        box(unit,0,.015,0,.78,.05,.39,'metal');
        for(let i=0;i<3;i++){box(unit,-.24+i*.24,.17,0,.16,.27,.18,i%2?'white':'teal');box(unit,-.24+i*.24,.325,0,.1,.04,.12,'dark');}
      }else{
        box(unit,0,.12,0,.68,.22,.4,'blue');box(unit,0,.27,0,.58,.07,.36,'metal');box(unit,.2,.39,0,.13,.22,.15,'dark');box(unit,-.19,.25,.21,.11,.09,.03,'orange');
      }
      label(unit,item.name,0,-.17,.29,.94,.23,'#214c60');
      return unit;
    }
    for(const item of setup.resources||[]){const kind=item.category||'equipment';if(!groups.has(kind))groups.set(kind,[]);groups.get(kind).push(item);}
    const locations=chooseLocations(ctx,stations),entries=[...groups.entries()],displayed=[];
    locations.forEach((location,index)=>{
      const rack=new T.YJl();rack.position.set(location.x,ctx.floorY,location.z);rack.rotation.y=location.side<0?Math.PI/2:-Math.PI/2;root.add(rack);
      box(rack,0,1.55,-.18,4.5,2.9,.12,'blue');
      const assigned=entries.filter((_,i)=>i%locations.length===index);
      label(rack,index===0?setup.module_title:'Recursos del módulo',0,3.14,-.08,4.5,.44);
      const items=assigned.flatMap(([kind,resources])=>resources.map(item=>({...item,category:kind})));
      // All resources remain available in the inventory; shelves show a bounded set at readable scale.
      items.slice(0,12).forEach((item,i)=>{resource(rack,item,(i%4-1.5)*1.06,2.45-Math.floor(i/4)*.8,.15);displayed.push(item.name);});
      for(const y of [.4,1.2,2])box(rack,0,y,.12,4.5,.055,.85,'metal');
      box(rack,-2.18,1.55,.05,.09,2.9,.62,'dark');box(rack,2.18,1.55,.05,.09,2.9,.62,'dark');
      const collider={x:location.x,z:location.z,halfX:.7,halfZ:2.35,minY:ctx.floorY,maxY:ctx.floorY+3.4};
      ctx.colliders.push(collider);colliders.push(collider);
    });
    const primary=(setup.resources||[]).find(item=>/aeronave|recubrimiento|ala|estructur/.test(normalize(item.name)))
      ||(setup.resources||[]).find(item=>item.category==='tools')||(setup.resources||[]).find(item=>item.category==='digital');
    if(primary){
      const center=ctx.room.getWorldPosition(new T.Pq0());
      const candidates=[[-4.4,3.2],[4.4,3.2],[-4.4,-3.2],[4.4,-3.2]];
      const place=candidates.map(([x,z])=>({x:center.x+x,z:center.z+z})).find(p=>
        stations.every(s=>{const [x,z]=s.totem||[s.x,s.z];return Math.hypot(p.x-ctx.district.x-x,p.z-ctx.district.z-z)>3;})&&
        ctx.colliders.every(c=>ctx.floorY+1<(c.minY??-Infinity)||ctx.floorY>(c.maxY??Infinity)||Math.abs(c.x-p.x)>(c.halfX??.5)+1.5||Math.abs(c.z-p.z)>(c.halfZ??.5)+1)&&
        Math.hypot(p.x-ctx.player.x,p.z-ctx.player.z)>3);
      if(place){
        const bench=new T.YJl();bench.position.set(place.x,ctx.floorY,place.z);root.add(bench);
        box(bench,0,.95,0,2.7,.1,1.45,'metal');
        for(const x of [-1.15,1.15])for(const z of [-.55,.55])box(bench,x,.47,z,.12,.94,.12,'blue');
        resource(bench,primary,0,1.17,0).scale.setScalar(2.3);
        const collider={x:place.x,z:place.z,halfX:1.45,halfZ:.85,minY:ctx.floorY,maxY:ctx.floorY+2};ctx.colliders.push(collider);colliders.push(collider);
      }
    }
    root.userData.resourceCount=setup.resources.length;root.userData.displayedResources=displayed;
    ctx.scene.add(root);
    return {root,resourceCount:setup.resources.length,displayedResources:displayed.length,
      dispose(){root.removeFromParent();for(const item of owned)item.dispose();for(const collider of colliders){const index=ctx.colliders.indexOf(collider);if(index>=0)ctx.colliders.splice(index,1);}}};
  }
  globalThis.AulaTPModuleWorkshop={create,chooseLocations,labels};
})();
