import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as T from '../static/vendor/three/three.module.min.js';

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const source=read('static/nubi-3d.js');
const track=JSON.parse(read('static/nubi-reference-motion.json'));
const scope=vm.createContext({Math});
vm.runInContext(source.slice(0,source.indexOf('// One local renderer')),scope);

test('the full 304-frame reference sequence is retargeted in order at its original rate',()=>{
  assert.equal(track.fps,30);
  assert.equal(track.samples.length,304);
  assert.equal(track.duration,304/30);
  assert.equal(track.fields.length,11);
  for(let index=0;index<304;index++) {
    assert.ok(track.samples[index].every(Number.isFinite));
    const pose=scope.nubiReferenceMotion(index/30,'idle',track);
    for(const key of ['x','y','lean','leftWidth','leftHeight','rightWidth','rightHeight','stretchX','stretchY']) {
      const expected=track.samples[index][track.fields.indexOf(key)];
      assert.ok(Math.abs(pose[key]-expected)<1e-8,`${index}: ${key}`);
    }
    assert.equal(pose.eyeMode,'reference');
  }
  const first=scope.nubiReferenceMotion(0,'idle',track),repeat=scope.nubiReferenceMotion(track.duration,'speaking',track);
  assert.deepEqual(first,repeat);
  const half=scope.nubiReferenceMotion(.5/30,'idle',track);
  assert.ok(Math.abs(half.lean-(track.samples[0][2]+track.samples[1][2])/2)<1e-8);
});

test('retargeted geometry stays inside the fixed desktop and mobile canvas camera frame',()=>{
  const body=new T.Group(),surface={};
  const meshScope=vm.createContext({T,body,Math,surface});
  vm.runInContext(source.slice(source.indexOf('const lobes='),source.indexOf('const sphere=')),meshScope);
  const point=new T.Vector3();
  for(let index=0;index<304;index++) {
    const pose=scope.nubiReferenceMotion(index/30,'idle',track);
    const matrix=new T.Matrix4().compose(new T.Vector3(pose.x,pose.y,0),
      new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),pose.lean),new T.Vector3(1,1,1));
    for(let vertex=0;vertex<surface.rim.length;vertex++) {
      point.set(surface.base[vertex*3]*(1+(pose.stretchX-1)*surface.rim[vertex]),
        surface.base[vertex*3+1]*(1+(pose.stretchY-1)*surface.rim[vertex]),surface.base[vertex*3+2]).applyMatrix4(matrix);
      assert.ok(Math.abs(point.x)<1.9&&Math.abs(point.y)<1.9,`frame ${index} stays framed`);
    }
    assert.ok(Math.abs(pose.lookX)<.21&&Math.abs(pose.lookY)<.11);
  }
});

test('typing and course navigation do not pause the visible sequence; accessibility remains respected',()=>{
  assert.match(source,/const quiet=reduced\(\)/);
  assert.doesNotMatch(source,/focusin|document.activeElement|body\.scale\.|getUserMedia|pointermove/);
  assert.match(source,/document.hidden\|\|!visible/);
  assert.match(source,/let motionSeconds=0,referenceTrack=null/);
  assert.match(source,/nubi-reference-motion.json\?v=20261010-recorded-motion/);
  assert.match(source,/color:0xf2f6ff/);
  assert.match(source,/color:0x061343/);
  assert.match(read('static/index.html'),/nubi-3d.js\?v=20261010-high-definition/);
});
