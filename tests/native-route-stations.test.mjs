import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../city-panel/native-route.js',import.meta.url),'utf8');

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
  assert.match(source,/for\(const spacing of \[3\.1,2\.95,2\.8\]/);
  assert.match(source,/cx\+\(index-1\.5\)\*spacing/);
  assert.match(source,/centerX\+\(index-1\.5\)\*3/);
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
