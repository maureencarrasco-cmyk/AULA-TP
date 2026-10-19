import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

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

test('existing question count is preserved and distributed sequentially across four stations',()=>{
  assert.match(source,/Math\.floor\(index\*stations\.length\/Math\.max\(1,total\)\)/);
  assert.match(source,/Math\.floor\(index\*4\/Math\.max\(1,questions\.length\)\)/);
  assert.match(source,/function selectedStation\(stations,index,total\)/);
  assert.match(source,/data\.questions\.map\(question=>\[question\.id,question\.object\]\)/);
  assert.doesNotMatch(source,/answers\[[^\]]+\]\s*=|correct\s*=/);
});

test('quiz markers use the shared illustrated artwork, specialty imagery and downward support',()=>{
  assert.match(source,/function specialtyPhotos\(name\)/);
  assert.match(source,/function drawQuizSpecialtyIcon\(c,name,cx,cy\)/);
  assert.match(source,/drawQuizSpecialtyIcon\(c,ctx\.specialty\.name,220,171\)/);
  assert.match(source,/function createStationArtwork\(/);
  assert.match(source,/markerGeometry=new T\.bdM\(3\.65,1\.04\)/);
  assert.match(source,/markerImageGeometry=new T\.bdM\(2\.05,1\.37\)/);
  assert.match(source,/markerHaloGeometry=new T\.bdM\(2\.8,2\.8\)/);
  assert.match(source,/markerBeamGeometry=new T\.bdM\(2\.12,2\.32\)/);
  assert.match(source,/c\.fillText\(`Quiz \$\{index\+1\}`/);
  assert.match(source,/station\.quizQuestion\?\.object/);
  assert.match(source,/photo\.drawImage\(image,/);
  assert.match(source,/c\.clearRect\(0,0,canvas\.width,canvas\.height\)/);
  assert.match(source,/cityQuizArtworkReady=true/);
  assert.match(source,/sign\.position\.set\(displayX,floorY\+2\.62,displayZ\)/);
  assert.match(source,/imageMesh\.position\.set\(displayX,floorY\+1\.22/);
  assert.match(source,/beamContext\.lineTo\(376,512\)/);
  assert.match(source,/CylinderGeometry/);
  assert.match(source,/createStationArtwork\(ctx,station,index,token,imageUrl,marker,canvas,displayX,displayZ,floorY,markerScale\)/);
  assert.match(source,/halo\.position\.set\(displayX,floorY,displayZ\)/);
  assert.match(source,/const usedImages=new Set\(\)/);
  assert.match(source,/!used\.has\(url\)/);
  assert.doesNotMatch(source,/fillText\('E',/);
});

test('four quiz image stations use a straight, evenly-spaced layout',()=>{
  assert.match(source,/for\(const spacing of \[3\.3,3\.15,3\]/);
  assert.match(source,/cx\+\(index-1\.5\)\*spacing/);
  assert.match(source,/centerX\+\(index-1\.5\)\*3/);
  assert.match(source,/const displayX=x,displayZ=z/);
  assert.doesNotMatch(source,/anchorCenterX\+\.9\+mobileShiftX/);
  assert.match(source,/markerScale=Math\.min\(\.9,Math\.max\(\.7,window\.innerWidth\/1500\)\)/);
});

test('each 3D quiz plate opens a closable blank window on the right',()=>{
  assert.match(source,/control\.addEventListener\('click',\(\)=>openQuizWindow\(index\+1\)\)/);
  assert.match(source,/panel\.className='city-quiz-empty-window'/);
  assert.match(source,/title\.textContent=`Quiz \$\{number\}`/);
  assert.match(source,/blank\.className='city-quiz-empty-window-body'/);
  assert.match(source,/close\.addEventListener\('click'/);
  assert.match(source,/new T\.Pq0\(sign\.position\.x,sign\.position\.y,sign\.position\.z\)\.project\(ctx\.camera\)/);
  assert.match(source,/quizControlLayer\?\.remove\(\)/);
  const hook=readFileSync(new URL('../city-panel/deploy_native_route.py',import.meta.url),'utf8');
  assert.match(hook,/camera:af,renderer:ac/);
  const styles=readFileSync(new URL('../city-panel/city-panel.css',import.meta.url),'utf8');
  assert.match(styles,/\.city-quiz-marker-control-layer/);
  assert.match(styles,/\.city-quiz-empty-window \{[^}]*right:18px/);
});

test('legacy phase furniture is hidden only around the old stage-sign anchors',()=>{
  assert.match(source,/function hideLegacyQuizFurniture\(ctx,hide\)/);
  assert.match(source,/stageAnchors\.some\(anchor=>Math\.abs\(anchor\.x-position\.x\)<2\.8&&Math\.abs\(anchor\.z-position\.z\)<4\.2/);
  assert.match(source,/l<\.16\|\|\(s>\.22&&h>\.22&&h<\.76\)/);
  assert.match(source,/hide\(node,'cityLegacyQuizFurniture'\)/);
  assert.match(source,/delete sign\.userData\.cityLegacyQuizFurniture/);
  const hook=readFileSync(new URL('../city-panel/deploy_native_route.py',import.meta.url),'utf8');
  assert.match(hook,/phaseStations:i6/);
});
