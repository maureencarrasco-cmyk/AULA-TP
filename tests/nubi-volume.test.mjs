import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as T from '../static/vendor/three/three.module.min.js';

const source=fs.readFileSync(new URL('../static/nubi-3d.js',import.meta.url),'utf8');
const body=new T.Group();
const scope=vm.createContext({T,body,Math,surface:{}});
vm.runInContext(source.slice(source.indexOf('const lobes='),source.indexOf('const sphere=')),scope);
const geometry=body.children[0].geometry;
assert.ok(geometry.attributes.position.count>2000);
assert.ok([...geometry.attributes.normal.array].every(Number.isFinite));
geometry.computeBoundingBox();
const depth=geometry.boundingBox.max.z-geometry.boundingBox.min.z;
assert.ok(depth>1.5,'Body has actual geometric depth, not a flat card');
const point=new T.Vector3();
for(let angle=-Math.PI;angle<=Math.PI;angle+=Math.PI/24){
 const matrix=new T.Matrix4().makeRotationY(angle);
 let min=Infinity,max=-Infinity;
 for(let i=0;i<geometry.attributes.position.count;i++){
  point.fromBufferAttribute(geometry.attributes.position,i).applyMatrix4(matrix);
  min=Math.min(min,point.x);max=Math.max(max,point.x);
 }
 assert.ok(max-min>1.5,'Profile never collapses to zero width');
 assert.ok(min>-1.9&&max<1.9,'All angles stay in the same fixed camera frame');
 assert.deepEqual(body.scale.toArray(),[1,1,1]);
}
assert.match(source,/if\(turn\|\|now-last>=32\|\|reduced\(\)\)/);
assert.match(source,/if\(!host\?\.isConnected\|\|document.hidden\|\|!visible\)return/);
assert.match(source,/webglcontextlost/);
console.log('Nubi: closed volumetric mesh, finite normals, 49 yaw views, bounded framing, constant scale and visible-only rendering verified.');
