const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'city-panel.js'),'utf8');

function fixture(disabled=false,specialtyNames=[]){
 let callback;
 let clicks=0;
 const original={disabled,querySelector(){return null;},children:[],append(node){this.children.push(node);},click(){clicks++;}};
 const grid={tile:null,querySelector(){return this.tile;},append(node){this.tile=node;}};
 const specialtyButtons=specialtyNames.map(name=>({dataset:{},querySelector(selector){return selector==='.city-specialty-copy strong'?{textContent:name}:null;}}));
 const panel={querySelector(selector){return selector==='.city-island-grid'?grid:original;}};
 const document={documentElement:{},querySelector(selector){return selector==='.city-walk-inspector'?panel:original;},querySelectorAll(selector){return selector==='.city-specialties button'?specialtyButtons:[];},createElement(){return {dataset:{},children:[],disabled:false,append(...items){this.children.push(...items);},addEventListener(event,action){this[event]=action;}};}};
 const context=vm.createContext({document,URLSearchParams,MutationObserver:class {constructor(action){callback=action;}observe(){}}});
 vm.runInContext(source,context);
 return {original,grid,specialtyButtons,sync:()=>callback(),clicks:()=>clicks};
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
test('frontend adapter preserves game controls and only syncs the module quiz clock',()=>{
 for(const value of ['localStorage','WebGLRenderer','location.href','keydown','innerHTML'])assert.ok(!source.includes(value));
 assert.ok(source.includes("fetch('/api/session'"));
 assert.ok(source.includes("stage:'quiz',seconds"));
 assert.ok(source.includes('action.click()'));
 assert.ok(source.includes('Estación 4 · Quiz + Práctica profesional'));
 assert.ok(!source.includes('90 min'));
 assert.ok(source.includes("querySelector('.city-specialty-section')"));
});
test('skin retains native dropdown, checkbox, collapsed sections and focus states',()=>{
 const css=fs.readFileSync(path.join(__dirname,'city-panel.css'),'utf8');
 assert.ok(css.includes('focus-visible'));
 assert.ok(css.includes('max-width:520px'));
 assert.ok(!/select\s*\{[^}]*display:\s*none/.test(css));
 assert.ok(!/input\s*\{[^}]*display:\s*none/.test(css));
 assert.ok(css.includes('.city-quiz-guide { position:absolute;'));
 assert.ok(css.includes('pointer-events:auto'));
});

test('learning section adapts its header and specialty cards to panel width',()=>{
 const css=fs.readFileSync(path.join(__dirname,'city-panel.css'),'utf8');
 assert.ok(css.includes('container-type:inline-size'));
 assert.ok(css.includes('@container(min-width:500px)'));
 assert.ok(css.includes('@container(max-width:380px)'));
 assert.ok(css.includes('.city-specialty-section>.city-approach { width:100%'));
 assert.ok(!css.includes('.city-specialty-section:not(:has(select option[value="mecanica"]:checked)) .city-specialties button::before'));
 for(const kind of ['office','agro','food','construction','electric','design','mechanical','mining','care','maritime','tourism','craft','digital','general'])assert.ok(css.includes(`button[data-city-art="${kind}"]`));
 for(const term of ['function specialtyArt','function syncSpecialtyCards','button.dataset.cityArt=art','acuicultura|portuaria|pesqueria|tripulacion|naves'])assert.ok(source.includes(term));
});

test('all 35 specialties receive visual identity from their own profession',()=>{
 const names=['Administración','Contabilidad','Agropecuaria','Forestal','Elaboración Industrial de Alimentos','Gastronomía','Construcción','Instalaciones Sanitarias','Montaje Industrial','Construcciones Metálicas','Electricidad','Electrónica','Refrigeración y Climatización','Dibujo Técnico','Gráfica','Mecánica Automotriz','Mecánica Industrial','Mecánica de Mantenimiento de Aeronaves','Explotación Minera','Asistencia en Geología','Metalurgia Extractiva','Química Industrial','Atención de Enfermería','Atención de Párvulos','Acuicultura','Operaciones Portuarias','Pesquería','Tripulación de Naves Mercantes y Especiales','Servicios de Hotelería','Servicios de Turismo','Muebles y Terminaciones en Madera','Vestuario y Confección Textil','Conectividad y Redes','Programación','Telecomunicaciones'];
 const expected=['office','office','agro','agro','food','food','construction','construction','construction','construction','electric','electric','electric','design','design','mechanical','mechanical','mechanical','mining','mining','mining','mining','care','care','maritime','maritime','maritime','maritime','tourism','tourism','craft','design','digital','digital','digital'];
 const f=fixture(false,names);
 assert.deepEqual(f.specialtyButtons.map(button=>button.dataset.cityArt),expected);
});

test('entering an interior expands the panorama and hides the room action dock',()=>{
 const css=fs.readFileSync(path.join(__dirname,'city-panel.css'),'utf8');
 assert.ok(css.includes('.city-walk-workspace:has(.city-open-pilot) { grid-template-columns:minmax(0,1fr); }'));
 assert.ok(css.includes('.city-walk-workspace:has(.city-open-pilot)>.city-walk-inspector { position:absolute;inset:0;'));
 assert.ok(css.includes('.city-walk-workspace:has(.city-open-pilot) .city-room-summary { display:none!important; }'));
 assert.ok(css.includes('.city-walk-workspace:has(.city-open-pilot) .city-open-workshop { display:none!important; }'));
 for(const button of ['.city-open-pilot','.city-open-workshop','.city-open-learning'])assert.ok(css.includes(button));
 assert.ok(css.includes('0 0 24px #ff8b27a6'));
});

test('specialty entry shows a dismissible quiz guide and hides the city header',()=>{
 const css=fs.readFileSync(path.join(__dirname,'city-panel.css'),'utf8');
 assert.ok(css.includes('.city-page:has(.city-open-pilot) .city-header { display:none!important; }'));
 assert.ok(css.includes('.city-quiz-guide { position:absolute;'));
 assert.ok(source.includes('function syncRoomGuide()'));
 assert.ok(source.includes("dismiss.addEventListener('click'"));
 assert.ok(source.includes("dismiss.textContent='Entendido'"));
 assert.ok(source.includes('4 fáciles · 5 intermedios · 1 avanzado'));
 assert.ok(source.includes("for(const label of ['Modelar','Argumentar','Representar'])"));
 assert.ok(source.includes("/api/city-experience?course=${encodeURIComponent(courseId)}&module=${encodeURIComponent(moduleId)}"));
 assert.ok(source.includes("stage:'quiz',seconds"));
 assert.ok(source.includes('clock.activeSeconds>=1200'));
});

test('city header keeps live copy and original return link with responsive artwork',()=>{
 const css=fs.readFileSync(path.join(__dirname,'city-panel.css'),'utf8');
 assert.ok(css.includes('city-header-reference.png'));
 assert.ok(css.includes('.city-header .city-back:focus-visible'));
 assert.ok(css.includes('@media(max-width:700px)'));
 assert.ok(!/city-header[^{}]*\{[^}]*opacity:\s*0/.test(css));
});
