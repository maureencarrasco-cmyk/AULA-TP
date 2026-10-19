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
});

test('existing question count is preserved and distributed sequentially across four stations',()=>{
  assert.match(source,/Math\.floor\(index\*stations\.length\/Math\.max\(1,total\)\)/);
  assert.match(source,/Quiz \$\{index\+1\}\/\$\{data\.questions\.length\}/);
  assert.match(source,/data\.questions\.map\(question=>\[question\.id,question\.object\]\)/);
  assert.doesNotMatch(source,/answers\[[^\]]+\]\s*=|correct\s*=/);
});

test('quiz markers have specialty imagery and a downward support without an E prompt',()=>{
  assert.match(source,/function specialtyPhoto\(name\)/);
  assert.match(source,/function createStationImage\(/);
  assert.match(source,/CylinderGeometry/);
  assert.match(source,/createStationImage\(ctx,station,displayX,displayZ,floorY,token\)/);
  assert.doesNotMatch(source,/fillText\('E',/);
});
