import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';

const source=fs.readFileSync(new URL('../static/nubi-3d.js',import.meta.url),'utf8');
const resize=source.slice(source.indexOf(' function resize(){'),source.indexOf(' function draw(now){'));

test('Nubi has a supersampled buffer without changing its visible dimensions',()=>{
 for(const devicePixelRatio of [1,1.25,2,3,4,5]){
  for(const width of [106,132]){
   const calls=[];
   const scope=vm.createContext({devicePixelRatio,Math,host:{getBoundingClientRect:()=>({width,height:width})},renderer:{setPixelRatio:r=>calls.push(r),setSize:(...args)=>calls.push(args)}});
   vm.runInContext(resize+'resize();',scope);
   assert.equal(calls[0],Math.min(Math.max(devicePixelRatio,3),4));
   assert.deepEqual(calls[1],[width,width,false]);
  }
 }
 assert.match(source,/SphereGeometry\(1,64,40\)/);
 assert.match(source,/antialias:true/);
});
