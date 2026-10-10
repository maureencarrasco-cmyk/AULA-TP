import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../static/nubi-3d.js',import.meta.url),'utf8');
const scope=vm.createContext({Math});
vm.runInContext(source.slice(0,source.indexOf('// One local renderer')),scope);
const sample=scope.nubiReferenceMotion;
assert.equal(sample(1).eyeMode,'idle');
assert.equal(sample(4.3).eyeMode,'smile');
assert.equal(sample(5).eyeMode,'voice');
assert.equal(sample(1,'happy').eyeMode,'happy');
for(const emotion of ['listening','speaking'])assert.equal(sample(1,emotion).eyeMode,'voice');
assert.ok(sample(.1).lookX<0&&sample(1).lookX>0,'Eyes look around independently of the cursor');
for(let t=0;t<30;t+=.016){
 const a=sample(t),b=sample(t+.016);
 assert.ok(Math.abs(a.lean)<=.09);
 assert.ok(Math.abs(a.waveA)+Math.abs(a.waveB)<=.040001);
 assert.ok(Math.hypot(a.lookX,a.lookY)<.09);
 assert.ok(Math.abs(a.lean-b.lean)<.002);
 assert.ok(Math.abs(a.waveA-b.waveA)+Math.abs(a.waveB-b.waveB)<.003);
}
assert.match(source,/body.rotation.set\(0,0,/);
assert.match(source,/body.position.set\(quiet\?0:motion.x\|\|0,quiet\?0:motion.y\|\|0,0\)/);
assert.match(source,/surface.base\[i\*3\+2\]/);
assert.doesNotMatch(source,/body\.scale\.|getUserMedia|cursor|pointermove/);
console.log('Fallback contour, gaze and eye states verified; recorded motion preserves body scale and agent features.');
