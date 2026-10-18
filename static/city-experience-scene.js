import * as THREE from '/static/vendor/three/three.module.min.js';

const districts=[
  'Administración','Agropecuaria y Forestal','Alimentación','Construcción',
  'Electricidad y sistemas','Metalmecánica','Minería y procesos','Salud y atención',
  'Marítimo','Turismo','Madera y vestuario','Tecnologías digitales'
];
const palette=[0x4aa6ed,0x37b89c,0xf4a642,0xf27646,0x6579d9,0x12a99b,0x8494b0,0x28a8bb,0x527dad,0xe29351,0x8a70ca,0x3e9d86];

class CityExperienceScene {
  constructor(canvas,onArrival=()=>{}){
    this.canvas=canvas;this.onArrival=onArrival;this.keys=new Set();this.arrows=[];this.buildings=[];this.mode='aerial';this.arrived=false;this.destination=null;this.phase=0;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0xddeefa);this.scene.fog=new THREE.Fog(0xddeefa,95,190);
    this.camera=new THREE.PerspectiveCamera(42,1,.1,260);this.camera.position.set(0,92,112);this.camera.lookAt(0,0,0);
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));this.renderer.setClearColor(0xddeefa,1);
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x69859a,2.15));
    const sun=new THREE.DirectionalLight(0xffffff,2.8);sun.position.set(-35,60,28);this.scene.add(sun);
    this.makeTown();this.makeAvatar();this.makeRoute();this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);this.resize();
    this.onKeyDown=e=>this.keyDown(e);this.onKeyUp=e=>this.keyUp(e);window.addEventListener('keydown',this.onKeyDown);window.addEventListener('keyup',this.onKeyUp);window.addEventListener('blur',()=>this.keys.clear());
    this.clock=new THREE.Clock();this.animate();
  }
  material(color,roughness=.8,emissive=0x000000){return new THREE.MeshStandardMaterial({color,roughness,emissive,emissiveIntensity:.55});}
  box(parent,w,h,d,x,y,z,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=false;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  makeTown(){
    this.scene.add(new THREE.GridHelper(140,28,0xb3d0e2,0xc9dbea));
    this.box(this.scene,150,.35,130,0,-.34,0,this.material(0xc9e3d2));
    this.box(this.scene,150,.06,10,0,-.13,0,this.material(0x60788a));
    this.box(this.scene,10,.06,130,0,-.12,0,this.material(0x60788a));
    for(let i=-3;i<=3;i++){
      if(i!==0){this.box(this.scene,150,.07,1.2,0,-.08,i*17,this.material(0x899eaa));this.box(this.scene,1.2,.07,130,i*21,-.08,0,this.material(0x899eaa));}
    }
    for(let i=0;i<districts.length;i++){
      const col=i%4,row=Math.floor(i/4),x=(col-1.5)*28,z=(row-1)*31;
      const group=new THREE.Group();group.position.set(x,0,z);this.scene.add(group);
      this.box(group,15,.25,13,0,.05,0,this.material(0xb8d3df));
      const height=6+(i%4)*1.5,width=9+(i%3),depth=7+(i%2);
      const color=palette[i],walls=this.material(color),roof=this.material(0xf2f7fa),glass=this.material(0xb6dff1,.28,0x0d4163);
      this.box(group,width,height,depth,0,height/2+.18,0,walls);
      this.box(group,width+.5,.35,depth+.5,0,height+.35,0,roof);
      for(let level=0;level<Math.floor(height/2);level++){
        const yy=1.2+level*1.65;
        for(const side of [-1,1])this.box(group,1.35,.75,.12,side*(width/2+.07),yy,depth*.18,glass);
        this.box(group,.12,.75,1.05,-width*.2,yy,depth/2+.07,glass);this.box(group,.12,.75,1.05,width*.2,yy,depth/2+.07,glass);
      }
      this.box(group,1.6,2.6,.15,0,1.5,depth/2+.1,this.material(0x174c65));
      const ring=new THREE.Mesh(new THREE.RingGeometry(5.1,5.5,48),new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:.18,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(0,.12,0);group.add(ring);
      group.userData={district:districts[i],position:new THREE.Vector3(x,0,z),ring};this.buildings.push(group);
      this.addLabel(districts[i],x,z+8.2,color);
      for(let tree=0;tree<2;tree++){
        const tx=x+(tree?7.5:-7.5),tz=z+(tree?5:-5);
        this.box(this.scene,.28,1.1,.28,tx,.45,tz,this.material(0x8d704f));
        const crown=new THREE.Mesh(new THREE.SphereGeometry(.8,8,7),this.material(0x59a978));crown.position.set(tx,1.35,tz);this.scene.add(crown);
      }
    }
    this.scene.add(new THREE.AmbientLight(0xffffff,.35));
  }
  addLabel(text,x,z,color){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');
    ctx.fillStyle='#ffffff';ctx.globalAlpha=.94;ctx.beginPath();ctx.roundRect(6,8,500,78,22);ctx.fill();ctx.globalAlpha=1;
    ctx.strokeStyle='#d4e6f3';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=`#${color.toString(16).padStart(6,'0')}`;ctx.font='700 28px Segoe UI, Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,49,475);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));label.position.set(x,11,z);label.scale.set(15,2.8,1);this.scene.add(label);
  }
  makeAvatar(){
    this.avatar=new THREE.Group();this.scene.add(this.avatar);
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.52,.75,4,8),this.material(0x0d9a8b));body.position.y=1.05;this.avatar.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),this.material(0xf2c99e));head.position.y=1.9;this.avatar.add(head);
    const pack=this.box(this.avatar,.72,.35,.3,0,1.12,-.38,this.material(0x1670bd));
    this.avatar.visible=false;
  }
  makeRoute(){
    this.routeLine=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xffd531,transparent:true,opacity:.95}));this.routeLine.visible=false;this.routeLine.position.y=.24;this.scene.add(this.routeLine);
    for(let i=0;i<9;i++){const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(),1,0xffd21f,.55,.38);arrow.line.material.color.setHex(0xffee69);arrow.cone.material.color.setHex(0xffb814);arrow.line.material.emissive?.setHex(0xffc900);arrow.visible=false;this.scene.add(arrow);this.arrows.push(arrow);}
    const glow=new THREE.Mesh(new THREE.RingGeometry(.65,.9,32),new THREE.MeshBasicMaterial({color:0xffd21f,transparent:true,opacity:.9,side:THREE.DoubleSide}));glow.rotation.x=-Math.PI/2;glow.position.y=.18;glow.visible=false;this.scene.add(glow);this.targetGlow=glow;
    const badgeCanvas=document.createElement('canvas');badgeCanvas.width=384;badgeCanvas.height=112;this.badgeContext=badgeCanvas.getContext('2d');this.badgeTexture=new THREE.CanvasTexture(badgeCanvas);this.badgeTexture.colorSpace=THREE.SRGBColorSpace;
    this.targetBadge=new THREE.Sprite(new THREE.SpriteMaterial({map:this.badgeTexture,transparent:true,depthTest:false}));this.targetBadge.scale.set(5.3,1.55,1);this.targetBadge.visible=false;this.scene.add(this.targetBadge);this.setBadge('ACCESO');
  }
  setBadge(text){const ctx=this.badgeContext;if(!ctx)return;ctx.clearRect(0,0,384,112);ctx.fillStyle='#fffdf1';ctx.beginPath();ctx.roundRect(5,7,374,98,25);ctx.fill();ctx.strokeStyle='#ffc62e';ctx.lineWidth=6;ctx.stroke();ctx.fillStyle='#725400';ctx.font='800 32px Segoe UI, Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,192,58,340);this.badgeTexture.needsUpdate=true;}
  resize(){const rect=this.canvas.parentElement.getBoundingClientRect();if(rect.width<2||rect.height<2)return;this.renderer.setSize(rect.width,rect.height,false);this.camera.aspect=rect.width/rect.height;this.camera.updateProjectionMatrix();}
  async flyover(){this.mode='aerial';const from=new THREE.Vector3(0,88,110),to=new THREE.Vector3(-17,48,56);await this.moveCamera(from,to,new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0),1800);}
  async flyToDistrict(location,index){
    this.destination={location,index:Math.max(0,districts.indexOf(location.district))};const target=this.buildings[this.destination.index];
    if(!target)return;this.phase=0;this.arrived=false;
    this.buildings.forEach((building,i)=>{building.userData.ring.material.opacity=i===this.destination.index?0.58:0.08;building.userData.ring.material.color.setHex(i===this.destination.index?palette[i]:0x8fb0c4);});
    const {x,z}=target.userData.position;this.avatar.position.set(x,0,z+24);this.avatar.visible=true;
    this.sceneLabel('Descenso al distrito · '+location.district);
    this.mode='descent';await this.moveCamera(this.camera.position.clone(),new THREE.Vector3(x+2,10,z+37),this.cameraTarget||new THREE.Vector3(0,0,0),new THREE.Vector3(x,1,z+21),1650);
    this.mode='walk';this.setTarget();this.updateRoute();
  }
  async moveCamera(from,to,lookFrom,lookTo,duration){
    const start=performance.now();
    await new Promise(resolve=>{const step=now=>{const p=Math.min(1,(now-start)/duration),ease=p*p*(3-2*p);this.camera.position.lerpVectors(from,to,ease);const look=new THREE.Vector3().lerpVectors(lookFrom,lookTo,ease);this.camera.lookAt(look);this.cameraTarget=look;if(p<1)requestAnimationFrame(step);else resolve();};requestAnimationFrame(step);});
  }
  setMissionPhase(index){
    if(!this.destination)return;this.phase=index;const building=this.buildings[this.destination.index],base=building.userData.position;
    const offsets=[[0,7],[-5.5,7],[5.5,7],[0,10]];const [dx,dz]=offsets[Math.max(0,Math.min(3,index))];
    this.target.set(base.x+dx,.35,base.z+dz);this.arrived=this.distanceToTarget()<2.5;this.setBadge(`MISIÓN ${String(index+1).padStart(2,'0')}`);this.targetBadge.visible=true;this.targetBadge.position.set(this.target.x,4,this.target.z);this.updateRoute();
  }
  setQuizPoint(index){
    if(!this.destination)return;const building=this.buildings[this.destination.index],base=building.userData.position;
    const column=index%5,row=Math.floor(index/5);this.target.set(base.x+(column-2)*1.8,.35,base.z+6.5+row*2.6);
    this.setBadge(`PUNTO ${String(index+1).padStart(2,'0')}`);this.targetBadge.visible=true;this.targetBadge.position.set(this.target.x,3.8,this.target.z);
    this.arrived=this.distanceToTarget()<2.5;this.updateRoute();
  }
  async enterDistrict(location,index){await this.flyToDistrict(location,index);}
  setTarget(){
    if(!this.destination)return;const building=this.buildings[this.destination.index],base=building.userData.position;
    this.target=new THREE.Vector3(base.x,.35,base.z+5);this.targetGlow.visible=true;this.targetBadge.visible=true;this.targetBadge.position.set(this.target.x,3.8,this.target.z);this.setBadge('ACCESO');this.updateRoute();
  }
  distanceToTarget(){return this.target?Math.hypot(this.avatar.position.x-this.target.x,this.avatar.position.z-this.target.z):Infinity;}
  updateRoute(){
    if(!this.destination)return;this.setTargetGlow();
    const start=new THREE.Vector3(this.avatar.position.x,.24,this.avatar.position.z),end=new THREE.Vector3(this.target.x,.24,this.target.z);
    this.targetGlow.position.set(this.target.x,.18,this.target.z);
    this.routeLine.geometry.dispose();this.routeLine.geometry=new THREE.BufferGeometry().setFromPoints([start,end]);this.routeLine.visible=this.mode==='walk';
    const delta=end.clone().sub(start),length=delta.length(),direction=delta.normalize();
    for(let i=0;i<this.arrows.length;i++){
      const arrow=this.arrows[i],distance=Math.min(1.6+i*2.05,Math.max(.2,length-.2));arrow.position.set(start.x+direction.x*distance,.28,start.z+direction.z*distance);arrow.setDirection(direction);arrow.visible=this.mode==='walk'&&length>1.3;
    }
  }
  setTargetGlow(){if(this.target){this.targetGlow.position.set(this.target.x,.18,this.target.z);this.targetGlow.visible=true;}}
  sceneLabel(text){const label=document.getElementById('scene-label');if(label)label.textContent=text;}
  keyDown(event){if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;const key=event.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){event.preventDefault();this.keys.add(key);}}
  keyUp(event){this.keys.delete(event.key.toLowerCase());}
  move(name,active){const keys={forward:'w',back:'s',left:'a',right:'d'};if(active)this.keys.add(keys[name]);else this.keys.delete(keys[name]);}
  animate(){requestAnimationFrame(()=>this.animate());const delta=Math.min(this.clock.getDelta(),.05);if(this.mode==='walk')this.moveAvatar(delta);this.renderer.render(this.scene,this.camera);}
  moveAvatar(delta){
    let x=(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0);
    let z=(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0);
    if(x||z){const length=Math.hypot(x,z);x/=length;z/=length;this.avatar.position.x=THREE.MathUtils.clamp(this.avatar.position.x+x*delta*9,-68,68);this.avatar.position.z=THREE.MathUtils.clamp(this.avatar.position.z+z*delta*9,-58,62);this.avatar.rotation.y=Math.atan2(x,z);}
    this.updateRoute();const arrived=this.distanceToTarget()<2.5;
    if(arrived!==this.arrived){this.arrived=arrived;this.onArrival(arrived);}
    if(this.mode==='walk'){
      const targetCam=new THREE.Vector3(this.avatar.position.x+1,11,this.avatar.position.z+17);this.camera.position.lerp(targetCam,.06);const look=new THREE.Vector3(this.avatar.position.x,.8,this.avatar.position.z-4);this.camera.lookAt(look);this.cameraTarget=look;
    }
  }
  dispose(){this.resizeObserver.disconnect();window.removeEventListener('keydown',this.onKeyDown);window.removeEventListener('keyup',this.onKeyUp);this.renderer.dispose();}
}

window.cityExperienceSceneReady=CityExperienceScene;
window.dispatchEvent(new Event('city-scene-ready'));
