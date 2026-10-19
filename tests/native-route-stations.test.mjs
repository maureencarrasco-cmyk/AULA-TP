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
  assert.match(source,/markerGeometry=new T\.bdM\(2\.7,1\.92\)/);
  assert.match(source,/c\.fillText\(`Quiz \$\{index\+1\}`/);
  assert.match(source,/station\.quizQuestion\?\.object/);
  assert.match(source,/c\.drawImage\(image,/);
  assert.match(source,/cityQuizArtworkReady=true/);
  assert.match(source,/CylinderGeometry/);
  assert.match(source,/createStationArtwork\(ctx,station,index,token,imageUrl,sign,texture,canvas\)/);
  assert.match(source,/const usedImages=new Set\(\)/);
  assert.match(source,/!used\.has\(url\)/);
  assert.doesNotMatch(source,/fillText\('E',/);
  assert.doesNotMatch(source,/markerImageGeometry|quizImages/);
});

test('four quiz image stations use a straight, evenly-spaced layout',()=>{
  assert.match(source,/for\(const spacing of \[3\.15,3,2\.85\]/);
  assert.match(source,/cx\+\(index-1\.5\)\*spacing/);
  assert.match(source,/centerX\+\(index-1\.5\)\*2\.85/);
});
