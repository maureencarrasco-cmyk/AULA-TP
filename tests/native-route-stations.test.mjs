import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../city-panel/native-route.js',import.meta.url),'utf8');

test('course mentions share their specialty room without dropping the selected module',()=>{
  const definition=source.match(/const specialtyFamily=value=>[^;]+;/)[0];
  const family=vm.runInNewContext(`${definition};specialtyFamily`,{normalize:value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()});
  assert.equal(family('Gastronomía, mención Cocina'),family('Gastronomía'));
  assert.equal(family('Química Industrial, mención Laboratorio Químico'),family('Química Industrial'));
  assert.notEqual(family('Electricidad'),family('Electrónica'));
});

test('asynchronous equipment and image loads repaint an idle renderer and ignore stale rooms',()=>{
  const helper=source.slice(source.indexOf('  function requestRedraw('),source.indexOf('  let quizControlLayer'));
  const scene={},camera={};let callback,calls=0;
  const context={generation:1,root:{parent:scene},redrawFrame:0,cancelAnimationFrame(){},requestAnimationFrame(fn){callback=fn;return 1;}};
  const redraw=vm.runInNewContext(`${helper};requestRedraw`,context);
  const ctx={scene,camera,map:false,renderer:{render(s,c){assert.equal(s,scene);assert.equal(c,camera);calls++;}}};
  redraw(ctx);assert.equal(calls,0);callback();assert.equal(calls,1);
  redraw(ctx);context.generation=2;callback();assert.equal(calls,1);
  ctx.map=true;redraw(ctx);callback();assert.equal(calls,1);
});

test('reused room objects get a fresh layout after moving to another specialty or floor',()=>{
  const workshop=readFileSync(new URL('../city-panel/native-workshop.js',import.meta.url),'utf8');
  const helper=workshop.slice(workshop.indexOf('  function captureLayout('),workshop.indexOf('  function chooseLocations('));
  class Vector{normalize(){return this;}}
  const capture=vm.runInNewContext(`${helper};captureLayout`,{roomLayouts:new WeakMap(),performance:{now:()=>0}});
  const ctx={room:{},specialty:{name:'Electricidad'},floorY:0,district:{x:0,z:0},player:{x:1,z:2},three:{Pq0:Vector},camera:{position:{x:1,z:5},getWorldDirection:v=>Object.assign(v,{x:0,y:0,z:-1})}};
  const first=capture(ctx);ctx.player.x=3;assert.equal(capture(ctx),first);
  ctx.floorY=5;ctx.specialty.name='Química Industrial';assert.equal(capture(ctx).x,3);assert.notEqual(capture(ctx),first);
});

test('room entry uses the first official module and explicit selections never borrow another inventory',()=>{
  const catalog=JSON.parse(readFileSync(new URL('../city_room_resources.json',import.meta.url),'utf8'));
  const helper=source.slice(source.indexOf('  function selectWorkshopInventory('),source.indexOf('  async function loadModuleWorkshop('));
  const select=vm.runInNewContext(`${helper};selectWorkshopInventory`,{normalize:value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()});
  const specialty=catalog['441'].specialty;
  assert.equal(select(catalog,{},specialty).module_id,441);
  assert.equal(select(catalog,{moduleId:441,moduleTitle:'Estructuras de aeronaves'},specialty).module_title,catalog['441'].module_title);
  assert.equal(select(catalog,{moduleId:442},specialty).module_id,442);
  assert.equal(select(catalog,{moduleId:99999,moduleTitle:'Desconocido'},specialty),null);
  assert.equal(select(catalog,{moduleId:42},'Gastronomía').module_id,42);
  assert.equal(select(catalog,{moduleId:5},'Gastronomía'),null);
  for(const [id,item] of Object.entries(catalog))assert.equal(select(catalog,{moduleId:Number(id)},item.specialty).module_title,item.module_title);
});

test('every configured specialty room is normalized to four visible quiz stations',()=>{
  assert.match(source,/function configureStations\(ctx\)/);
  assert.match(source,/slice\(0,4\)/);
  assert.match(source,/while\(result\.length<4\)/);
  assert.match(source,/const T=ctx\.three,stations=roomStations=configureStations\(ctx\)/);
  assert.match(source,/stations:roomStations\.length/);
  assert.doesNotMatch(source,/city-native-guide|city-native-stations|quizNav/);
  const styles=readFileSync(new URL('../city-panel/city-panel.css',import.meta.url),'utf8');
  assert.doesNotMatch(styles,/city-native-guide|city-native-stations/);
  assert.doesNotMatch(styles,/city-door-action\[data-city-quiz-station="true"\] \{ display:none/);
  assert.match(source,/stationAction\?\.setAttribute\('data-city-quiz-station','true'\)/);
});

test('quiz rooms are fitted as module-specific workshops without filling the station approach',()=>{
  const workshop=readFileSync(new URL('../city-panel/native-workshop.js',import.meta.url),'utf8');
  assert.match(workshop,/function addToolboard\(rack,items\)/);
  assert.match(workshop,/function addPpeAndDocumentWall\(rack,items,wallOnly=false\)/);
  assert.match(workshop,/function buildServiceBench\(parent,primary,repair=false\)/);
  assert.match(workshop,/function buildStructuralSample\(parent\)/);
  assert.match(workshop,/function buildCompressor\(parent,x,z\)/);
  assert.match(workshop,/function buildTrolley\(parent\)/);
  assert.match(workshop,/items\.some\(item=>item\.category==='protection'\)/);
  assert.match(workshop,/setup\.resources\|\|\[\]/);
  assert.match(workshop,/Math\.hypot\(place\.x-ctx\.district\.x-sx,place\.z-ctx\.district\.z-sz\)<2\.6/);
  assert.match(workshop,/root\.userData\.fixtureCount=locations\.length\+occupied\.length/);
  assert.match(workshop,/player\.x\+rightX\*side\*4\.85\+forward\.x\*distance/);
  assert.match(workshop,/featuredModuleEquipment=true/);
  const routing=readFileSync(new URL('../city-panel/native-route.js',import.meta.url),'utf8');
  assert.match(routing,/assets\/module-room-resources\.json/);
  assert.match(routing,/const active=current\|\|\{moduleTitle:'',specialty:ctx\.specialty\?\.name\|\|''\}/);
  assert.match(routing,/if\(current\?\.moduleId\)\{if\(workshopKey!==String\(current\.moduleId\)/);
  assert.match(routing,/else if\(!workshop&&!workshopRequest&&performance\.now\(\)>=workshopRetryAt\)loadModuleWorkshop\(ctx\)/);
  assert.match(routing,/workshopKey=key/);
  assert.match(routing,/sign\.scale\.set\(baseScale\.x\*\(3\.2\/width\),baseScale\.y\*\(\.72\/height\)/);
});

test('perimeter workshops follow the camera and stay clear of quiz positions',()=>{
  const workshop=readFileSync(new URL('../city-panel/native-workshop.js',import.meta.url),'utf8');
  const start=workshop.indexOf('  function chooseLocations('),end=workshop.indexOf('  function create(',start);
  const choose=vm.runInNewContext(`${workshop.slice(start,end)};chooseLocations`,{Math});
  class Vector {constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}normalize(){const length=Math.hypot(this.x,this.y,this.z)||1;this.x/=length;this.y/=length;this.z/=length;return this;}}
  const ctx={three:{Pq0:Vector},camera:{getWorldDirection:vector=>{vector.x=0;vector.y=0;vector.z=-1;return vector;}},
    player:{x:0,z:0},district:{x:0,z:0},floorY:0,colliders:[]};
  const stations=[-4.5,-1.5,1.5,4.5].map(x=>({totem:[x,-8]}));
  const result=choose(ctx,stations);
  assert.equal(result.length,2);
  assert.ok(result.every(item=>Math.abs(Math.abs(item.x)-4.85)<.01));
  assert.ok(result.every(item=>stations.every(station=>Math.hypot(item.x-station.totem[0],item.z-station.totem[1])>1.15)));
});

test('replacing a composite aircraft fixture removes its combined blocker but preserves walls',()=>{
  class Vector {constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}}
  const fuselage={isMesh:true,userData:{},geometry:{parameters:{width:1,height:1,depth:1}},material:{color:{getHSL:()=>({h:.1,s:.05,l:.75})}},getWorldPosition:v=>Object.assign(v,{x:-3,y:1.1,z:-1.7}),getWorldScale:v=>Object.assign(v,{x:2.2,y:1,z:5.6})};
  const wing={...fuselage,getWorldPosition:v=>Object.assign(v,{x:-3,y:1.2,z:-1.7}),getWorldScale:v=>Object.assign(v,{x:6.1,y:.15,z:1.7})};
  const fixture={x:-3,z:-1.7,halfX:3,halfZ:2.8,minY:0,maxY:3.7},wall={x:-6,z:-1.7,halfX:.08,halfZ:6,minY:0,maxY:3.7};
  const removed=[],hidden=[],ctx={three:{Pq0:Vector},floorY:0,colliders:[fixture,wall],scene:{traverse:visit=>[fuselage,wing].forEach(visit)}};
  const fn=source.slice(source.indexOf('  function hideLegacyQuizFurniture('),source.indexOf('  function configureStations('));
  const cleanup=vm.runInNewContext(`${fn};hideLegacyQuizFurniture`,{Math,Number,stageAnchors:[{x:-3,y:3,z:-1.7}],originalFixtureColliders:removed});
  cleanup(ctx,node=>hidden.push(node));
  assert.equal(hidden.length,2);assert.deepEqual(ctx.colliders,[wall]);assert.equal(removed[0].collider,fixture);
});

test('each station selects unique questions at the requested difficulty levels',()=>{
  assert.match(source,/for\(const level of \['easy','easy','medium','hard'\]\)/);
  assert.match(source,/function questionLevel\(question\)/);
  assert.match(source,/function stationQuizOptions\(question\)/);
  assert.match(source,/const stationQuestions=selectStationQuizQuestions\(questions\)/);
  assert.match(source,/data\.questions\.map\(question=>\[question\.id,question\.object,question\.difficulty\]\)/);
  assert.doesNotMatch(source,/answers\[[^\]]+\]\s*=|correct\s*=/);
});

test('station question selection uses two easy, one medium and one hard question with four distinct choices',()=>{
  const helpers=source.slice(source.indexOf('  function questionLevel('),source.indexOf('  function specialtyPhotos('));
  const api=vm.runInNewContext(`${helpers};({selectStationQuizQuestions,stationQuizOptions,questionLevel})`,{normalize:value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()});
  const questions=[...Array.from({length:4},(_,i)=>({id:`q0${i+1}`,difficulty:'facil',prompt:'Pregunta',options:['A','B','C']})),...Array.from({length:5},(_,i)=>({id:`q0${i+5}`,difficulty:'media',prompt:'Pregunta',options:['A','B','C']})),{id:'q10',difficulty:'dificil',prompt:'Pregunta',options:['A','B','C']}];
  const selected=api.selectStationQuizQuestions(questions);
  assert.equal(JSON.stringify(selected.map(question=>question.id)),JSON.stringify(['q01','q02','q05','q10']));
  assert.equal(JSON.stringify(selected.map(api.questionLevel)),JSON.stringify(['easy','easy','medium','hard']));
  assert.ok(selected.every(question=>api.stationQuizOptions(question).length===4));
  assert.equal(new Set(api.stationQuizOptions(selected[0])).size,4);
});

test('quiz markers use the shared illustrated artwork, specialty imagery and downward support',()=>{
  assert.match(source,/function specialtyPhotos\(name\)/);
  assert.match(source,/function drawQuizSpecialtyIcon\(c,name,cx,cy,color=/);
  assert.match(source,/drawQuizSpecialtyIcon\(c,ctx\.specialty\.name,208,238,accent,index\)/);
  assert.match(source,/function createStationArtwork\(/);
  assert.match(source,/markerGeometry=new T\.bdM\(2\.72,3\.12\)/);
  assert.match(source,/markerHaloGeometry=new T\.bdM\(2\.8,2\.8\)/);
  assert.match(source,/markerBeamGeometry=new T\.bdM\(2\.1,2\.85\)/);
  assert.match(source,/c\.fillText\(`Quiz \$\{index\+1\}`/);
  assert.match(source,/station\.quizQuestion\?\.object/);
  assert.match(source,/c\.drawImage\(image,/);
  assert.match(source,/c\.clearRect\(0,0,canvas\.width,canvas\.height\)/);
  assert.match(source,/cityQuizArtworkReady=true/);
  assert.match(source,/sign\.position\.set\(displayX,floorY\+2\.02\+mobileHeight,displayZ\)/);
  assert.match(source,/beamContext\.lineTo\(376,512\)/);
  assert.match(source,/CylinderGeometry/);
  assert.match(source,/createStationArtwork\(ctx,station,index,token,imageUrl,marker,canvas,displayX,displayZ,floorY,markerScale\)/);
  assert.match(source,/halo\.position\.set\(displayX,floorY,displayZ\)/);
  assert.match(source,/const usedImages=new Set\(\)/);
  assert.match(source,/!used\.has\(url\)/);
  assert.doesNotMatch(source,/fillText\('E',/);
});

test('four quiz image stations use a straight, evenly-spaced layout',()=>{
  assert.match(source,/for\(const spacing of \[2\.55,2\.45,2\.35\]/);
  assert.match(source,/cx\+\(index-1\.5\)\*spacing/);
  assert.match(source,/centerX\+\(index-1\.5\)\*2\.55/);
  assert.match(source,/const displayX=x,displayZ=z/);
  assert.doesNotMatch(source,/anchorCenterX\+\.9\+mobileShiftX/);
  assert.match(source,/markerScale=window\.innerWidth<700\?\.46:Math\.min\(\.86,Math\.max\(\.68,window\.innerWidth\/1900\)\)/);
});

test('compact quiz stations have separated targets that cannot overlap vertically',()=>{
  assert.match(source,/index%2-\.5\)\*1\.8\*rowX/);
  const styles=readFileSync(new URL('../city-panel/city-panel.css',import.meta.url),'utf8');
  assert.match(styles,/\.city-quiz-marker-control \{ width:min\(32vw,160px\);height:min\(12vh,74px\); \}/);
});

test('four floor arrows stay around the student and each targets its matching quiz',()=>{
  assert.match(source,/for\(let i=0;i<4;i\+\+\)/);
  assert.match(source,/arrow\.userData\.cityQuizNumber=i\+1/);
  assert.match(source,/function updateQuizArrows\(ctx\)/);
  assert.match(source,/const player=ctx\.player,stations=roomStations\.slice\(0,4\)/);
  assert.match(source,/const forward=ctx\.camera\?\.getWorldDirection\?/);
  assert.match(source,/const fanAngle=\(index-1\.5\)\*\.6,fanX=/);
  assert.match(source,/arrow\.position\.set\(player\.x\+fanX\*2\.05,ctx\.floorY\+\.045,player\.z\+fanZ\*2\.05\)/);
  assert.match(source,/arrow\.rotation\.y=Math\.atan2\(-directionX,-directionZ\)/);
  assert.match(source,/dataset\.visibleQuizArrows=String\(arrows\.filter\(arrow=>arrow\.visible\)\.length\)/);
  assert.match(source,/updateQuizArrows\(ctx\)/);
  assert.doesNotMatch(source,/function path\(ctx,target\)|function selectedStation\(/);
});

test('each 3D quiz plate opens a server-graded four-choice form with retry feedback',()=>{
  assert.match(source,/control\.addEventListener\('click',\(\)=>openQuizWindow\(index\+1\)\)/);
  assert.match(source,/panel\.className='city-quiz-empty-window'/);
  assert.match(source,/title\.textContent=`Quiz \$\{number\}`/);
  assert.match(source,/body\.className='city-quiz-empty-window-body'/);
  assert.match(source,/radio\.required=true/);
  assert.match(source,/argument\.required=true;argument\.minLength=20/);
  assert.match(source,/city-station-quiz/);
  assert.match(source,/feedback\.textContent=`Aún no\./);
  assert.match(source,/renderQuestion\(result\.next_question,result\.ae_title,result\.next_skill,result\.question_number\)/);
  assert.match(source,/Pregunta \$\{questionNumber\} de 5/);
  assert.doesNotMatch(source,/localStorage\.setItem\(key,JSON\.stringify\(record\)\)/);
  assert.match(source,/current\?\.moduleId/);
  assert.match(source,/close\.addEventListener\('click'/);
  assert.match(source,/new T\.Pq0\(sign\.position\.x,sign\.position\.y,sign\.position\.z\)\.project\(ctx\.camera\)/);
  assert.match(source,/quizControlLayer\?\.remove\(\)/);
  assert.match(source,/function redesignSpecialtyPlaque\(/);
  assert.match(source,/AULA TP CHILE  \/  ESPACIO DE APRENDIZAJE/);
  const hook=readFileSync(new URL('../city-panel/deploy_native_route.py',import.meta.url),'utf8');
  assert.match(hook,/camera:af,renderer:ac/);
  assert.match(hook,/moduleTitle:w\.module,ae:w\.ae,aeTitle:w\.aeTitle/);
  assert.doesNotMatch(hook,/answer:q\.answer/);
  const styles=readFileSync(new URL('../city-panel/city-panel.css',import.meta.url),'utf8');
  assert.match(styles,/\.city-quiz-marker-control-layer/);
  assert.match(styles,/\.city-quiz-empty-window \{[^}]*right:18px/);
  assert.match(styles,/\.city-quiz-argument-label textarea/);
});

test('legacy quiz furniture includes large neutral counters near the old stage-sign anchors',()=>{
  assert.match(source,/function hideLegacyQuizFurniture\(ctx,hide\)/);
  assert.match(source,/node\.getWorldScale\?node\.getWorldScale\(new ctx\.three\.Pq0\(\)\):node\.scale/);
  assert.match(source,/stageAnchors\.some\(anchor=>Math\.abs\(anchor\.x-position\.x\)<4\.6&&Math\.abs\(anchor\.z-position\.z\)<5\.8/);
  assert.match(source,/const neutralWorkSurface=\(width>=1\.7&&height<=1\.4&&depth>=\.65\)\|\|\(width>=1\.7&&height>=\.7&&depth<=1\.15\)/);
  assert.match(source,/neutralWorkSurface&&s<\.22&&l>\.32/);
  assert.match(source,/return l<\.16\|\|\(s>\.22&&h>\.22&&h<\.76\)\|\|\(neutralWorkSurface&&s<\.22&&l>\.32\)/);
  assert.match(source,/hide\(node,'cityLegacyQuizFurniture'\)/);
  assert.match(source,/delete sign\.userData\.cityLegacyQuizFurniture/);
  const hook=readFileSync(new URL('../city-panel/deploy_native_route.py',import.meta.url),'utf8');
  assert.match(hook,/phaseStations:i6/);
});
