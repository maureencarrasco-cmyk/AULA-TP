import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../static/app.js',import.meta.url),'utf8');
let reset;
const attributes={},mascot={dataset:{},closest:()=>({setAttribute:(key,value)=>attributes[key]=value})};
const events={};
const scope=vm.createContext({window:{},document:{querySelector:()=>mascot,addEventListener:(name,listener)=>events[name]=listener},
  clearTimeout:()=>{},setTimeout:fn=>{reset=fn;return 1;}});
vm.runInContext(source.slice(source.indexOf('let nubiEmotionTimer;'),source.indexOf('function toolsFabClamp')),scope);
for(const emotion of ['idle','wave','celebrate','sad','think','surprised']){
  scope.setNubiEmotion(emotion);
  assert.equal(mascot.dataset.emotion,emotion);
  assert.equal(attributes['data-emotion'],emotion);
}
reset();assert.equal(mascot.dataset.emotion,'idle');
scope.setNubiEmotion('invalid');assert.equal(mascot.dataset.emotion,'idle');
scope.bindNubiEmotions();
events['nubi-emotion']({detail:{emotion:'celebrate'}});
assert.equal(mascot.dataset.emotion,'celebrate');
assert.match(source,/data-action="tools-fab-toggle"[^>]*aria-expanded="false"/);
assert.doesNotMatch(source,/src="\/static\/agente-nubi-chat-luminoso/);
const css=fs.readFileSync(new URL('../static/support-tools.css',import.meta.url),'utf8');
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/\.reduce-motion \.tools-fab \.nubi-robot/);
console.log('Seis emociones, retorno a reposo, menu original y movimiento reducido verificados.');
