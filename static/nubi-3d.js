'use strict';

function nubiReferenceMotion(seconds,emotion='idle'){
 const phase=((seconds%7.2)+7.2)%7.2;
 const eyeMode=emotion==='happy'?'happy':['listening','speaking'].includes(emotion)?'voice':phase>=4.65?'voice':phase>=4.15?'smile':'idle';
 const gaze=[[-.055,-.04],[-.065,.025],[.05,.035],[-.04,-.02],[.03,-.035],[.055,0],[0,0]];
 const times=[0,.8,1.5,2.3,3.1,3.8,4.15];
 let lookX=0,lookY=0;
 if(eyeMode==='idle'){
  let index=0;while(index<times.length-2&&phase>=times[index+1])index++;
  const blend=Math.min(1,Math.max(0,(phase-times[index])/.3)),ease=blend*blend*(3-2*blend);
  lookX=gaze[index][0]+(gaze[index+1][0]-gaze[index][0])*ease;
  lookY=gaze[index][1]+(gaze[index+1][1]-gaze[index][1])*ease;
 }
 return {eyeMode,lookX,lookY,lean:.09*Math.sin(seconds*Math.PI*2/5.8),waveA:.028*Math.sin(seconds*Math.PI*2/1.85),waveB:.012*Math.sin(seconds*Math.PI*2/1.65)};
}

// One local renderer survives route changes; assistant behavior stays in app.js.
(() => {
 let host=null,renderer=null,scene,body,camera,eyes=[],frame=0,last=0,visible=true,turn=null;
 let motionSeconds=0;
 const surface={};
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const reduced=()=>media.matches||document.documentElement.classList.contains('reduce-motion')||document.body.classList.contains('reduce-motion');
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.target===host)visible=entry.isIntersecting;
  wake();
 });
 let loading=null;
 function sync(){
  const next=document.querySelector('.nubi-cloud.nubi-robot');
  if(next===host)return;
  if(host){observer.unobserve(host);host.removeAttribute('data-volume-ready');}
  host=next;turn=null;visible=true;
  if(!host)return;
  observer.observe(host);
  if(renderer){host.append(renderer.domElement);resize();draw(performance.now());wake();}
  else if(!loading)loading=import('/static/vendor/three/three.module.min.js').then(build).catch(()=>{
   // Keep the original frontal art usable when WebGL is unavailable.
   loading=null;
  });
 }
 function build(T){
  renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.domElement.className='nubi-volume';
  renderer.domElement.setAttribute('aria-hidden','true');
  renderer.domElement.addEventListener('webglcontextlost',event=>{
   event.preventDefault();cancelAnimationFrame(frame);frame=0;
   host?.removeAttribute('data-volume-ready');
  });
  renderer.domElement.addEventListener('webglcontextrestored',()=>{draw(performance.now());wake();});
  scene=new T.Scene();body=new T.Group();scene.add(body);
  camera=new T.OrthographicCamera(-1.9,1.9,1.9,-1.9,.1,20);
  camera.position.set(0,0,7);camera.lookAt(0,0,0);
  scene.add(new T.HemisphereLight(0xe6f8ff,0x3559bf,2));
  const key=new T.DirectionalLight(0xffffff,3);key.position.set(-3,5,4);scene.add(key);
  const fill=new T.DirectionalLight(0x75cfff,1.6);fill.position.set(3,0,-3);scene.add(fill);
  // Broad cloud scallops affect only the silhouette, not bumps across the skin.
  const lobes=[[0,-.1,1.26,.65],[-.38,.49,.72,.67],[.56,.32,.65,.59],[-.99,-.18,.55,.54],[1.01,-.18,.53,.52]];
  const cloud=new T.SphereGeometry(1,64,48),position=cloud.attributes.position;
  const colors=[],low=new T.Color('#0860ed'),high=new T.Color('#60caff');
  for(let i=0;i<position.count;i++){
   const direction=new T.Vector3().fromBufferAttribute(position,i).normalize();
   const angle=Math.atan2(direction.y,direction.x),dx=Math.cos(angle),dy=Math.sin(angle);
   const spread=Math.hypot(direction.x,direction.y);let radius=0;
   for(const [x,y,rx,ry] of lobes){
    const a=(dx/rx)**2+(dy/ry)**2,b=-2*(dx*x/rx**2+dy*y/ry**2),c=(x/rx)**2+(y/ry)**2-1;
    const discriminant=b*b-4*a*c;if(discriminant<0)continue;
    const r=(-b+Math.sqrt(discriminant))/(2*a);if(r<=0)continue;
    const blend=Math.max(.26-Math.abs(radius-r),0)/.26;
    radius=Math.max(radius,r)+blend*blend*.26*.25;
   }
   // The broad elliptical core takes over towards the front and back poles.
   const core=1/Math.sqrt((dx/1.26)**2+(dy/.8)**2),rim=spread**4;
   radius=core*(1-rim)+radius*rim;
   direction.set(dx*spread*radius,dy*spread*radius,direction.z*.84);
   position.setXYZ(i,direction.x,direction.y,direction.z);
   const color=low.clone().lerp(high,T.MathUtils.clamp((direction.y+.8)/1.9,0,1));
   colors.push(color.r,color.g,color.b);
  }
  cloud.setAttribute('color',new T.Float32BufferAttribute(colors,3));cloud.computeVertexNormals();
  body.add(new T.Mesh(cloud,new T.MeshPhysicalMaterial({vertexColors:true,roughness:.48,metalness:0,clearcoat:.18,clearcoatRoughness:.42})));
  surface.geometry=cloud;surface.base=position.array.slice();
  surface.cos3=new Float32Array(position.count);surface.sin5=new Float32Array(position.count);surface.rim=new Float32Array(position.count);
  for(let i=0;i<position.count;i++){
   const angle=Math.atan2(position.getY(i),position.getX(i));
   surface.cos3[i]=Math.cos(angle*3);surface.sin5[i]=Math.sin(angle*5);
   surface.rim[i]=Math.max(0,1-(position.getZ(i)/.84)**2)**2;
  }
  const sphere=new T.SphereGeometry(1,40,28);
  const face=new T.Mesh(sphere,new T.MeshPhysicalMaterial({color:0xf2f6ff,roughness:.32,clearcoat:.5}));
  face.scale.set(.87,.4,.21);face.position.set(0,-.07,.78);body.add(face);
  const eyeMaterial=new T.MeshPhysicalMaterial({color:0x061343,roughness:.2,clearcoat:1});
  for(const x of [-.29,.29]){
   const eye=new T.Mesh(sphere,eyeMaterial);eye.position.set(x,-.075,.99);eye.scale.set(.125,.18,.065);body.add(eye);
   const shine=new T.Mesh(sphere,new T.MeshBasicMaterial({color:0xffffff}));eye.add(shine);
   // Child coordinates compensate for the parent's eye dimensions.
   shine.scale.set(.28,.24,.18);shine.position.set(.28,.39,.84);
   eyes.push(eye);
  }
  if(host){host.append(renderer.domElement);resize();draw(performance.now());wake();}
 }
 function resize(){
  if(!host||!renderer)return;
  const size=host.getBoundingClientRect();
  renderer.setSize(Math.max(1,size.width),Math.max(1,size.height),false);
 }
 function draw(now){
  if(!renderer||!host)return;
  const quiet=reduced()||document.activeElement?.matches('input,textarea,[contenteditable="true"]')||host.closest('.is-dragging');
  if(quiet)turn=null;
  const elapsed=Math.min(Math.max(now-last||16,0),50);
  if(!quiet)motionSeconds+=elapsed/1000;
  const emotion=host.dataset.emotion||'idle',motion=nubiReferenceMotion(motionSeconds,emotion);
  let angle=0;
  if(turn){
   const progress=Math.min(1,(now-turn.start)/1400);
   angle=turn.direction*.075*Math.sin(Math.PI*progress);
   if(progress>=1)turn=null;
  }
  body.rotation.set(0,0,quiet?0:motion.lean+angle);
  body.position.y=0;
  const position=surface.geometry.attributes.position;
  for(let i=0;i<position.count;i++){
   const factor=quiet?1:1+surface.rim[i]*(motion.waveA*surface.cos3[i]+motion.waveB*surface.sin5[i]);
   position.setXYZ(i,surface.base[i*3]*factor,surface.base[i*3+1]*factor,surface.base[i*3+2]);
  }
  position.needsUpdate=true;surface.geometry.computeVertexNormals();
  const voice=parseFloat(host.style.getPropertyValue('--nubi-voice-height'))||23;
  const smoothing=quiet?1:1-Math.exp(-elapsed/45),gazeSmoothing=quiet?1:1-Math.exp(-elapsed/100);
  eyes.forEach((eye,i)=>{
   const mode=quiet?'idle':motion.eyeMode;
   const height=mode==='happy'?(i===0?.025:.095):mode==='smile'?.085:mode==='voice'?.23+Math.max(0,voice-20)*.006+.008*Math.sin(motionSeconds*18):.18;
   const width=mode==='voice'?.09:.125;
   eye.scale.x+=(width-eye.scale.x)*smoothing;
   eye.scale.y+=(height-eye.scale.y)*smoothing;
   eye.position.x+=((i===0?-.29:.29)+(quiet?0:motion.lookX)-eye.position.x)*gazeSmoothing;
   eye.position.y+=(-.075+(quiet?0:motion.lookY)-eye.position.y)*gazeSmoothing;
   eye.children[0].visible=mode!=='happy'&&mode!=='smile';
  });
  renderer.render(scene,camera);renderer.domElement.dataset.viewAngle=angle.toFixed(3);host.setAttribute('data-volume-ready','true');last=now;
 }
 function tick(now){
  frame=0;
  if(!host?.isConnected||document.hidden||!visible)return;
  if(turn||now-last>=32||reduced())draw(now);
  if(!reduced())frame=requestAnimationFrame(tick);
 }
 function wake(){
  if(renderer&&host?.isConnected&&!document.hidden&&visible&&!frame)frame=requestAnimationFrame(tick);
 }
 window.Nubi3D={
  turn(mascot,direction){if(mascot!==host||!renderer||reduced())return;turn={start:performance.now(),direction};wake();},
  cancel(){turn=null;if(renderer&&host)draw(performance.now());}
 };
 const mutation=new MutationObserver(sync);mutation.observe(document.body,{childList:true,subtree:true});
 const pause=()=>{turn=null;if(frame)cancelAnimationFrame(frame);frame=0;last=performance.now();if(!document.hidden)draw(last);wake();};
 media.addEventListener('change',pause);document.addEventListener('visibilitychange',pause);
 new MutationObserver(pause).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 new MutationObserver(pause).observe(document.body,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',()=>{resize();draw(performance.now());});
 document.addEventListener('focusin',()=>{if(document.activeElement?.matches('input,textarea,[contenteditable="true"]'))pause();});
 document.addEventListener('nubi-emotion',()=>{draw(performance.now());wake();});
 sync();
})();
