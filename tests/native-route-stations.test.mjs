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
  assert.match(source,/for\(let i=0;i<4;i\+\+\)/);
  assert.match(source,/className='city-native-stations'/);
  assert.match(source,/button\.addEventListener\('click'/);
  assert.match(source,/button\.setAttribute\('aria-disabled',complete\|\|!isActive\?'true':'false'\)/);
  assert.doesNotMatch(source,/button\.disabled=complete\|\|!isActive/);
  assert.match(source,/Completa primero el Quiz/);
  const styles=readFileSync(new URL('../city-panel/city-panel.css',import.meta.url),'utf8');
  assert.match(styles,/city-native-route-active \.city-native-guide \{ position:absolute;top:82px/);
  assert.match(styles,/city-native-route-active \.city-native-stations \{ display:grid;grid-template-columns:repeat\(2/);
});

test('existing question count is preserved and distributed sequentially across four stations',()=>{
  assert.match(source,/Math\.floor\(index\*stations\.length\/Math\.max\(1,total\)\)/);
  assert.match(source,/Quiz \$\{index\+1\}\/\$\{data\.questions\.length\}/);
  assert.match(source,/data\.questions\.map\(question=>\[question\.id,question\.object\]\)/);
  assert.doesNotMatch(source,/answers\[[^\]]+\]\s*=|correct\s*=/);
});

test('quiz markers have specialty imagery and a downward support without an E prompt',()=>{
  assert.match(source,/function specialtyPhotos\(name\)/);
  assert.match(source,/function createStationImage\(/);
  assert.match(source,/CylinderGeometry/);
  assert.match(source,/createStationImage\(ctx,station,displayX,displayZ,floorY,token,imageUrl\)/);
  assert.match(source,/const usedImages=new Set\(\)/);
  assert.match(source,/!used\.has\(url\)/);
  assert.doesNotMatch(source,/fillText\('E',/);
});

test('four quiz image stations use a straight, evenly-spaced layout',()=>{
  assert.match(source,/for\(const spacing of \[3\.15,3,2\.85\]/);
  assert.match(source,/cx\+\(index-1\.5\)\*spacing/);
  assert.match(source,/centerX\+\(index-1\.5\)\*2\.85/);
});
