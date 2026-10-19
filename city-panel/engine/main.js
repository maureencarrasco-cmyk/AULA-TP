import * as THREE from './vendor/three.module.js';
import {nextQuiz, terminalPosition, routePoints, routeArrows} from './route.js';

const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search), moduleId = params.get('cityModuleId');
const original = new URL('../../', location.href);original.search = params.toString();
$('#return').href = original.href;
const campus = new URL('/api/city-experience', location.origin);
if(moduleId)campus.searchParams.set('module', moduleId);
if(params.get('cityCourseId'))campus.searchParams.set('course', params.get('cityCourseId'));
$('#recovery').href = campus.href;
let csrf='', plan, state, index=-1, saving=false, pending=0, timerBusy=false, heartbeatTimer;
let renderer, scene, camera, arrowGroup, targetRing, frame=0, last=0, lastRoute=0, yaw=0, pitch=-.12;
const player={x:0,z:1.5}, keys=new Set(), terminals=[], obstacles=[], materials=[], geometries=[], textures=[];
const collisionRay=new THREE.Raycaster();
const dialog=$('#question-dialog');

async function request(url, body) {
  const response=await fetch(url,{credentials:'same-origin',...(body?{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify(body)}:{})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||(response.status===401||response.status===403?'Inicia sesión como estudiante y abre tu módulo desde el campus.':'No se pudo guardar el avance.'));
  return data;
}
const api=()=>`/api/modules/${moduleId}/city-experience`;
function material(options){const result=new THREE.MeshStandardMaterial(options);materials.push(result);return result;}
function box(x,y,z,w,h,d,mat){const geometry=new THREE.BoxGeometry(w,h,d);geometries.push(geometry);const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
function sign(text,x,y,z,width=2.2){
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=320;
  const context=canvas.getContext('2d');context.fillStyle='#ffffff';context.fillRect(0,0,640,320);
  context.strokeStyle='#f2b817';context.lineWidth=20;context.strokeRect(10,10,620,300);
  context.fillStyle='#073d65';context.font='bold 96px Arial';context.textAlign='center';context.fillText(text,320,195);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
  const mat=material({map:texture,roughness:.7}),mesh=box(x,y,z,width,width/2,.08,mat);mesh.rotation.y=Math.PI;return mesh;
}
function buildScene(){
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setClearColor('#d6e7ef');renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Entorno 3D de quizzes');$('#scene').append(renderer.domElement);
  scene=new THREE.Scene();scene.background=new THREE.Color('#d6e7ef');scene.fog=new THREE.Fog('#d6e7ef',24,55);
  camera=new THREE.PerspectiveCamera(65,1,.1,65);
  scene.add(new THREE.HemisphereLight(0xffffff,0x778b8c,2.6));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(-4,14,5);scene.add(sun);
  const floor=material({color:0xc8d1d1,roughness:.95}),wall=material({color:0xe7eff1}),steel=material({color:0x728d97,metalness:.5,roughness:.45}),teal=material({color:0x156f83});
  const length=Math.max(34,Math.ceil(plan.quiz.length/2)*5+8);
  box(0,-.12,length/2,16,.24,length,floor);box(-8,2.5,length/2,.25,5,length,wall);box(8,2.5,length/2,.25,5,length,wall);box(0,2.5,length,16,5,.25,wall);
  for(let z=1;z<length;z+=2){box(-1.5,.012,z,.04,.015,1,teal);box(1.5,.012,z,.04,.015,1,teal);}
  const lamp=material({color:0xffffff,emissive:0xffffff,emissiveIntensity:.8});
  for(let z=5;z<length;z+=5){box(0,4.7,z,16,.16,.2,steel);box(0,4.55,z,3,.08,.35,lamp);}
  const photoId=/^[a-z-]+$/.test(params.get('cityPhoto')||'')?params.get('cityPhoto'):'tools';
  const photo=new THREE.TextureLoader().load('../assets/specialties/'+photoId+'.webp');photo.colorSpace=THREE.SRGBColorSpace;textures.push(photo);
  const photoMat=material({map:photo});const board=box(0,3.1,length-.3,9,4,.06,photoMat);board.rotation.y=Math.PI;
  plan.quiz.forEach((_,i)=>{const p=terminalPosition(i);obstacles.push(box(p.x,.65,p.z,.65,1.3,.65,steel));const screen=sign('QUIZ '+(i+1),p.x,1.7,p.z,1.3);terminals.push(screen);
    const side=p.x<0?-1:1;box(side*6,1,p.z,2.2,.12,1.5,steel);for(const dz of [-.55,.55])box(side*6,.5,p.z+dz,1.8,1,.06,teal);
  });
  const geometry=new THREE.ShapeGeometry(new THREE.Shape().moveTo(-.45,-.3).lineTo(0,.35).lineTo(.45,-.3).lineTo(.27,-.3).lineTo(0,.08).lineTo(-.27,-.3).closePath());geometries.push(geometry);
  const arrowMat=new THREE.MeshBasicMaterial({color:0xffdc22,side:THREE.DoubleSide,transparent:true,opacity:1,depthWrite:false});materials.push(arrowMat);
  arrowGroup=new THREE.Group();scene.add(arrowGroup);
  for(let i=0;i<100;i++){const mesh=new THREE.Mesh(geometry,arrowMat);mesh.rotation.x=Math.PI/2;mesh.visible=false;arrowGroup.add(mesh);}
  const ringGeometry=new THREE.RingGeometry(.72,.88,40);geometries.push(ringGeometry);
  const ringMaterial=new THREE.MeshBasicMaterial({color:0xffce12,side:THREE.DoubleSide});materials.push(ringMaterial);
  targetRing=new THREE.Mesh(ringGeometry,ringMaterial);targetRing.rotation.x=-Math.PI/2;scene.add(targetRing);
  new ResizeObserver(resize).observe($('#scene'));resize();
  renderer.domElement.addEventListener('pointerdown',event=>{renderer.domElement.focus();renderer.domElement.setPointerCapture(event.pointerId);drag={x:event.clientX,y:event.clientY};});
  renderer.domElement.addEventListener('pointermove',event=>{if(!drag||dialog.open)return;yaw-=(event.clientX-drag.x)*.004;pitch=THREE.MathUtils.clamp(pitch-(event.clientY-drag.y)*.003,-.6,.6);drag={x:event.clientX,y:event.clientY};});
  renderer.domElement.addEventListener('pointerup',()=>drag=null);renderer.domElement.addEventListener('pointercancel',()=>drag=null);
  frame=requestAnimationFrame(animate);
}
let drag=null;
function resize(){const {width,height}=$('#scene').getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}
function nearTarget(){return index>=0&&Math.hypot(player.x-terminalPosition(index).x,player.z-terminalPosition(index).z)<1.7;}
function updateRoute(){
  const points=index<0?[]:routeArrows(routePoints(player,terminalPosition(index)));
  arrowGroup.children.forEach((arrow,i)=>{const p=points[i];arrow.visible=Boolean(p);if(p){arrow.position.set(p.x,.045,p.z);arrow.rotation.set(Math.PI/2,0,-p.yaw);}});
  $('#scene').dataset.targetQuiz=index<0?'complete':String(index+1);
  targetRing.visible=index>=0;if(index>=0){const target=terminalPosition(index);targetRing.position.set(target.x,.035,target.z);}
  $('#interact').hidden=!nearTarget()||dialog.open;
}
function animate(time){
  frame=requestAnimationFrame(animate);const delta=Math.min((time-last)/1000,.05);last=time;
  if(document.hidden)return;
  if(!dialog.open){
    if(keys.has('left'))yaw+=delta*1.6;if(keys.has('right'))yaw-=delta*1.6;
    const distance=((keys.has('forward')?1:0)-(keys.has('back')?1:0))*delta*3.2;
    const direction=new THREE.Vector3(Math.sin(yaw)*Math.sign(distance),0,Math.cos(yaw)*Math.sign(distance));
    collisionRay.set(new THREE.Vector3(player.x,1,player.z),direction);collisionRay.far=Math.abs(distance)+.4;
    scene.updateMatrixWorld();
    if(distance&&!collisionRay.intersectObjects(obstacles,false).length){
      player.x=THREE.MathUtils.clamp(player.x+Math.sin(yaw)*distance,-4.7,4.7);
      player.z=THREE.MathUtils.clamp(player.z+Math.cos(yaw)*distance,1,Math.max(29,Math.ceil(plan.quiz.length/2)*5+2));
    }
  }
  camera.position.set(player.x,1.7,player.z);camera.lookAt(player.x+Math.sin(yaw),1.7+pitch,player.z+Math.cos(yaw));
  if(time-lastRoute>120){updateRoute();lastRoute=time;}
  arrowGroup.children.forEach(arrow=>{arrow.material.opacity=.8+Math.sin(time*.004)*.2;});
  renderer.render(scene,camera);
  $('#scene').dataset.playerX=player.x.toFixed(2);$('#scene').dataset.playerZ=player.z.toFixed(2);
  $('#scene').dataset.playerYaw=yaw.toFixed(3);
}
function syncProgress(){
  index=nextQuiz(plan.quiz,state.quiz?.answers);
  $('#target').textContent=index<0?'Recorrido completado':`Quiz ${index+1} de ${plan.quiz.length}`;
  $('#message').textContent=index<0?'Consulta tus resultados y los refuerzos pendientes antes de pasar a la práctica.':'Sigue las flechas amarillas hasta el terminal iluminado.';
  $('#recovery').hidden=index>=0;
  terminals.forEach((terminal,i)=>terminal.material.color.set(i===index?0xffffff:i<index?0x92d8c2:0x7a8b99));
  updateRoute();
}
function openQuestion(){
  if(!nearTarget()||saving)return;
  keys.clear();const question=plan.quiz[index];$('#question-number').textContent=`Quiz ${index+1} de ${plan.quiz.length}`;
  $('#question-title').textContent=question.question;$('#choices').replaceChildren();
  const legend=document.createElement('legend');legend.textContent='Selecciona una respuesta';$('#choices').append(legend);
  question.options.forEach((option,i)=>{const label=document.createElement('label'),input=document.createElement('input'),span=document.createElement('span');input.type='radio';input.name='choice';input.value=String(i);input.required=true;span.textContent=option;label.append(input,span);$('#choices').append(label);});
  $('#question-image').hidden=!question.image;if(question.image){$('#question-image').src=question.image;$('#question-image').alt=question.alt||'Recurso del módulo';}
  $('#feedback').textContent='';$('#save-answer').hidden=false;$('#continue').hidden=true;$('#choices').disabled=false;dialog.showModal();
}
$('#interact').addEventListener('click',openQuestion);
$('#close-question').addEventListener('click',()=>{if(!saving)dialog.close();});
$('#continue').addEventListener('click',()=>{dialog.close();syncProgress();});
dialog.addEventListener('cancel',event=>{if(saving)event.preventDefault();});
$('#answer-form').addEventListener('submit',async event=>{
  event.preventDefault();if(saving||index<0)return;
  saving=true;$('#save-answer').disabled=true;
  const answered=index;
  try{
    const data=await request(api(),{operation:'quiz-answer',index:answered,choice:Number(new FormData(event.currentTarget).get('choice'))});
    state=data.state;const feedback=state.quiz.answers[String(answered)];
    $('#feedback').textContent=[feedback.correct?'Respuesta correcta.':'Respuesta incorrecta. Queda registrada para el refuerzo.',feedback.choice_feedback||feedback.explanation,feedback.correct_answer?'Respuesta correcta: '+feedback.correct_answer:''].filter(Boolean).join('\n');
    $('#save-answer').hidden=true;$('#continue').hidden=false;$('#choices').disabled=true;
  }catch(error){$('#feedback').textContent=error.message;}
  finally{saving=false;$('#save-answer').disabled=false;}
});
dialog.addEventListener('close',()=>{keys.clear();if(plan)syncProgress();renderer?.domElement.focus();});
const keyMap={ArrowUp:'forward',w:'forward',W:'forward',ArrowDown:'back',s:'back',S:'back',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
addEventListener('keydown',event=>{if(dialog.open)return;if(keyMap[event.key]){event.preventDefault();keys.add(keyMap[event.key]);}if(event.key.toLowerCase()==='e')openQuestion();});
addEventListener('keyup',event=>keys.delete(keyMap[event.key]));addEventListener('blur',()=>keys.clear());
document.querySelectorAll('[data-move]').forEach(button=>{button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);keys.add(button.dataset.move);});for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,()=>keys.delete(button.dataset.move));});
async function heartbeat(){
  if(timerBusy||!pending||!state)return;timerBusy=true;const seconds=Math.min(pending,30);pending-=seconds;
  try{const data=await request(api(),{operation:'heartbeat',stage:'quiz',seconds});state.quiz.active_seconds=data.state.quiz.active_seconds;}
  catch(error){pending+=seconds;$('#message').textContent=error.message;}
  finally{timerBusy=false;}
}
document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden)heartbeat();});
addEventListener('pagehide',event=>{if(event.persisted)return;heartbeat();clearInterval(heartbeatTimer);cancelAnimationFrame(frame);renderer?.dispose();for(const item of [...geometries,...materials,...textures])item.dispose();});
try{
  if(!/^\d+$/.test(moduleId||''))throw new Error('Abre el recorrido desde tu módulo para cargar sus quizzes.');
  const session=await request('/api/session');if(session.user?.role!=='student'||!session.csrf)throw new Error('Inicia sesión como estudiante y selecciona tu módulo.');csrf=session.csrf;
  const data=await request(api());plan=data.plan;state=data.state;
  $('#specialty').textContent=data.course_title;$('#module').textContent=plan.module.title;
  buildScene();syncProgress();
  heartbeatTimer=setInterval(()=>{
    const elapsed=Number(state.quiz.active_seconds||0)+pending,limit=Number(plan.timing.quiz)*60;
    $('#clock').textContent=`Tiempo activo: ${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`;
    if(!document.hidden&&elapsed<limit)pending++;
    if(pending>=30||elapsed>=limit)heartbeat();
  },1000);
}catch(error){$('#target').textContent='Recorrido no disponible';$('#message').textContent=error.message;$('#recovery').hidden=false;$('#recovery').textContent='Abrir mi módulo';}
