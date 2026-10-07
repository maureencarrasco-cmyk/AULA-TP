import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../static/app.js',import.meta.url),'utf8');
let reset,occasional,intervalMs;
const attributes={},mascot={dataset:{},closest:()=>({setAttribute:(key,value)=>attributes[key]=value})};
const events={};
const fab={matches:()=>false,querySelector:()=>mascot};
const document={hidden:false,activeElement:{matches:()=>false},documentElement:{classList:{contains:()=>false}},body:{classList:{contains:()=>false}},querySelector:selector=>selector==='.tools-fab'?fab:mascot,addEventListener:(name,listener)=>events[name]=listener};
const scope=vm.createContext({window:{},document,matchMedia:()=>({matches:false}),
  clearTimeout:()=>{},setTimeout:fn=>{reset=fn;return 1;},setInterval:(fn,ms)=>{occasional=fn;intervalMs=ms;return 1;}});
vm.runInContext(source.slice(source.indexOf('let nubiEmotionTimer;'),source.indexOf('function toolsFabClamp')),scope);
for(const emotion of ['idle','wave','celebrate','sad','think','surprised','turn']){
  scope.setNubiEmotion(emotion);
  assert.equal(mascot.dataset.emotion,emotion);
  assert.equal(attributes['data-emotion'],emotion);
}
reset();assert.equal(mascot.dataset.emotion,'idle');
scope.setNubiEmotion('invalid');assert.equal(mascot.dataset.emotion,'idle');
scope.bindNubiEmotions();
assert.equal(intervalMs,35000);
occasional();assert.ok(['turn','wave'].includes(mascot.dataset.emotion));
reset();document.activeElement.matches=()=>true;
occasional();assert.equal(mascot.dataset.emotion,'idle');
document.activeElement.matches=()=>false;document.hidden=true;
occasional();assert.equal(mascot.dataset.emotion,'idle');
events['nubi-emotion']({detail:{emotion:'celebrate'}});
assert.equal(mascot.dataset.emotion,'celebrate');
assert.match(source,/data-action="tools-fab-toggle"[^>]*aria-expanded="false"/);
assert.doesNotMatch(source,/src="\/static\/agente-nubi-chat-luminoso/);
const css=fs.readFileSync(new URL('../static/support-tools.css',import.meta.url),'utf8');
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/\.reduce-motion \.tools-fab \.nubi-robot/);
console.log('Siete estados, movimiento ocasional, pausa al escribir, retorno a reposo y menu original verificados.');
