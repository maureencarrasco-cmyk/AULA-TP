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
  assert.match(source,/function createStationArtwork\(/);
  assert.match(source,/markerGeometry=new T\.bdM\(2\.7,\.82\)/);
  assert.match(source,/markerImageGeometry=new T\.bdM\(1\.42,\.95\)/);
  assert.match(source,/markerHaloGeometry=new T\.bdM\(2\.8,2\.8\)/);
  assert.match(source,/markerBeamGeometry=new T\.bdM\(1\.82,1\.92\)/);
  assert.match(source,/c\.fillText\(`Quiz \$\{index\+1\}`/);
  assert.match(source,/station\.quizQuestion\?\.object/);
  assert.match(source,/photo\.drawImage\(image,/);
  assert.match(source,/c\.clearRect\(0,0,canvas\.width,canvas\.height\)/);
  assert.match(source,/cityQuizArtworkReady=true/);
  assert.match(source,/sign\.position\.set\(displayX,floorY\+2\.08,displayZ\)/);
  assert.match(source,/imageMesh\.position\.set\(displayX,floorY\+1\.02/);
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
  assert.match(source,/centerX\+\(index-1\.5\)\*2\.35/);
  assert.match(source,/lastAnchor\.x\+\(lastAnchor\.x-previousAnchor\.x\)\*extrapolation/);
  assert.match(source,/anchorCenterX\+\.9\+mobileShiftX\+\(anchor\.x-anchorCenterX\)\*1\.3/);
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
