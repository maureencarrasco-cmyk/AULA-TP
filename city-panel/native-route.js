/* Read-only navigation bridge: uses the existing world and its quiz progression. */
(() => {
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let context,root,geometry,material,panel,label,action,current=null,last=0,room=null,error='';
  const arrows=[];
  function progress(event){
    const data=event.detail;
    if(!data||!Array.isArray(data.questions)||!data.answers||typeof data.specialty!=='string')return;
    current=data;last=0;
  }
  addEventListener('aulatp:quiz-progress',progress);
  function dispose(){
    root?.removeFromParent();geometry?.dispose();material?.dispose();
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
    panel=document.createElement('section');panel.className='city-native-guide';panel.setAttribute('aria-live','polite');
    label=document.createElement('strong');action=document.createElement('button');action.type='button';action.textContent='Abrir quiz de mi módulo';
    action.addEventListener('click',()=>{
      const button=[...document.querySelectorAll('.city-viewport button')].find(item=>normalize(item.textContent).includes('desafio profesional'));
      if(button)button.click();
    });
    panel.append(label,action);document.querySelector('.city-viewport')?.append(panel);
    document.documentElement.classList.add('city-native-route-active');
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
      if(index<0){label.textContent='Quiz completado · revisa tu resultado';action.hidden=false;return;}
      const station=selectedStation(ctx.stations,index,data?.questions[index]);
      const [dx,dz]=station.totem||[station.x,station.z];
      const target={x:ctx.district.x+dx,z:ctx.district.z+dz};
      if(!Number.isFinite(target.x)||!Number.isFinite(target.z))return;
      const points=path(ctx,target);let arrowIndex=0,travel=0;
      for(let i=1;i<points.length;i++){
        travel+=Math.hypot(points[i].x-points[i-1].x,points[i].z-points[i-1].z);
        if(travel<.75||arrowIndex>=arrows.length)continue;travel=0;
        const arrow=arrows[arrowIndex++];arrow.position.set(points[i].x,ctx.floorY+.035,points[i].z);arrow.rotation.y=Math.atan2(points[i].x-points[i-1].x,points[i].z-points[i-1].z);arrow.visible=true;
      }
      label.textContent=`Quiz ${index+1} · ${station.name||station.title||station.label||'Puesto de trabajo'}`;
      action.hidden=Math.hypot(ctx.player.x-target.x,ctx.player.z-target.z)>2;
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
