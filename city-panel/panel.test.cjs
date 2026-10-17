const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'city-panel.js'),'utf8');

function fixture(disabled=false){
 let callback;
 let clicks=0;
 const original={disabled,querySelector(){return null;},click(){clicks++;}};
 const grid={tile:null,querySelector(){return this.tile;},append(node){this.tile=node;}};
 const panel={querySelector(selector){return selector==='.city-island-grid'?grid:original;}};
 const document={documentElement:{},querySelector(selector){return selector==='.city-walk-inspector'?panel:original;},createElement(){return {dataset:{},children:[],disabled:false,append(...items){this.children.push(...items);},addEventListener(event,action){this[event]=action;}};}};
 const context=vm.createContext({document,MutationObserver:class {constructor(action){callback=action;}observe(){}}});
 vm.runInContext(source,context);
 return {original,grid,sync:()=>callback(),clicks:()=>clicks};
}
test('does not modify the server-rendered control tree before hydration',()=>{
 const f=fixture(true);assert.equal(f.grid.tile,null);
 f.original.disabled=false;f.sync();assert.ok(f.grid.tile);
});
test('mining tile forwards to the original action and does not duplicate itself',()=>{
 const f=fixture();const first=f.grid.tile;f.sync();assert.equal(f.grid.tile,first);
 first.click();assert.equal(f.clicks(),1);
 f.original.disabled=true;f.sync();assert.equal(first.disabled,true);
 first.click();assert.equal(f.clicks(),1);
});
test('frontend adapter does not implement or replace game controls',()=>{
 for(const value of ['fetch(','localStorage','WebGLRenderer','location.href','keydown','innerHTML'])assert.ok(!source.includes(value));
 assert.ok(source.includes('action.click()'));
});
test('skin retains native dropdown, checkbox, collapsed sections and focus states',()=>{
 const css=fs.readFileSync(path.join(__dirname,'city-panel.css'),'utf8');
 assert.ok(css.includes('focus-visible'));
 assert.ok(css.includes('max-width:520px'));
 assert.ok(!/select\s*\{[^}]*display:\s*none/.test(css));
 assert.ok(!/input\s*\{[^}]*display:\s*none/.test(css));
 assert.ok(!css.includes('pointer-events:none'));
});
