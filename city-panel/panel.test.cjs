const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'city-panel.js'),'utf8');

function fixture(disabled=false,specialtyNames=[],options={}){
 let callback;
 let clicks=0,queries=0,ready=options.ready!==false;
 const frames=[];
 const original={disabled,querySelector(selector){return selector==='.city-quiz-route-entry'?this.children.find(node=>node.className==='city-quiz-route-entry')||null:null;},children:[],append(node){this.children.push(node);},click(){clicks++;}};
 const grid={tile:null,querySelector(){return this.tile;},append(node){this.tile=node;}};
 const specialtyButtons=specialtyNames.map(name=>({dataset:{},children:[],append(node){this.children.push(node);},querySelector(selector){return selector==='.city-specialty-copy strong'?{textContent:name}:this.children.find(node=>'.'+node.className===selector)||null;}}));
 const panel={querySelector(selector){return selector==='.city-island-grid'?grid:original;}};
 const document={documentElement:{},querySelector(selector){queries++;if(selector==='.city-viewport canvas')return ready?{}:null;return selector==='.city-walk-inspector'?panel:original;},querySelectorAll(selector){queries++;return selector==='.city-specialties button'?specialtyButtons:[];},createElement(){return {dataset:{},children:[],disabled:false,append(...items){this.children.push(...items);},addEventListener(event,action){this[event]=action;}};}};
 const context=vm.createContext({document,URL,URLSearchParams,location:{search:options.search||''},MutationObserver:class {constructor(action){callback=action;}observe(){}}});
 if(options.frames)context.requestAnimationFrame=action=>{frames.push(action);return frames.length;};
 vm.runInContext(source,context);
 return {original,grid,specialtyButtons,sync:()=>callback(),clicks:()=>clicks,mutate:records=>callback(records),
  queries:()=>queries,frames,setReady:value=>{ready=value;},flush:()=>{frames.splice(0).forEach(action=>action());},document};
}

test('waits for the scene effect before adding controls to hydrated React markup',()=>{
 const f=fixture(false,[],{ready:false});assert.equal(f.grid.tile,null);
 f.setReady(true);f.sync();assert.ok(f.grid.tile);
});

test('the room links to its own editable quiz engine and preserves module context',()=>{
 const f=fixture(false,[],{search:'?cityModuleId=451&cityCourseId=45'});
 const link=f.original.children.find(node=>node.className==='city-quiz-route-entry');
 assert.ok(link);const url=new URL(link.href);
 assert.equal(url.pathname,'/ciudad_laboral_aulatp/panel-ui-v1/engine/index.html');
 assert.equal(url.searchParams.get('cityModuleId'),'451');assert.equal(url.searchParams.get('cityCourseId'),'45');
 f.sync();assert.equal(f.original.children.filter(node=>node.className==='city-quiz-route-entry').length,1);
 const free=fixture();assert.equal(new URL(free.original.children.find(node=>node.className==='city-quiz-route-entry').href).pathname,'/api/city-experience');
});

test('HUD text mutations do not rescan panel controls',()=>{
 const f=fixture();const before=f.queries();
 for(let i=0;i<500;i++)f.mutate([{type:'childList',target:{closest:()=>null},addedNodes:[{nodeType:3}],removedNodes:[]}]);
 assert.equal(f.queries(),before);
});

test('batches structural changes and resumes synchronization after backgrounding',()=>{
 const f=fixture(false,[],{frames:true});const before=f.queries();
 const record={type:'childList',target:{closest:()=>null},addedNodes:[{nodeType:1,matches:()=>true}],removedNodes:[]};
 for(let i=0;i<100;i++)f.mutate([record]);
 assert.equal(f.frames.length,1);assert.equal(f.queries(),before);
 f.flush();assert.ok(f.queries()>before);
 f.document.hidden=true;f.mutate([record]);assert.equal(f.frames.length,0);
 f.document.hidden=false;f.sync();assert.equal(f.frames.length,1);f.flush();
});

test('delivery artwork keeps the originals and reduces decorative downloads',()=>{
 let before=0,after=0;
 for(const name of ['city-header-reference','panel-reference']){
  const original=fs.readFileSync(path.join(__dirname,'assets',name+'.png'));
  const optimized=fs.readFileSync(path.join(__dirname,'assets',name+'.webp'));
  assert.equal(optimized.toString('ascii',0,4),'RIFF');assert.equal(optimized.toString('ascii',8,12),'WEBP');
  before+=original.length;after+=optimized.length;
 }
 assert.ok(after<before*.2);
});
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
test('specialty entry hides the header for every course without depending on room buttons',()=>{
 const css=fs.readFileSync(path.join(__dirname,'city-panel.css'),'utf8');
 assert.ok(css.includes('.city-page:has(.city-room-summary) .city-header { display:none!important; }'));
 assert.ok(!css.includes('.city-page .city-header { display:none!important;'));
 assert.ok(!source.includes("querySelector('.city-header')?.remove"));
});

test('removes only the missions tab control from the quiz board',()=>{
 const f=fixture();
 const tab={textContent:'2 Misiones profesionales Completa la etapa 1',removed:false,remove(){this.removed=true;}};
 const quizTab={textContent:'1 Desafío de conocimientos',removed:false,remove(){this.removed=true;}};
 f.document.querySelectorAll=selector=>selector==='button,[role="tab"]'?[tab,quizTab]:[];
 f.sync();
 assert.equal(tab.removed,true);
 assert.equal(quizTab.removed,false);
 assert.ok(source.includes("removeMissionsTabFromQuizBoard();"));
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
 assert.equal(new Set(f.specialtyButtons.map(button=>button.dataset.cityPhoto)).size,35);
 for(const button of f.specialtyButtons){
  const img=button.querySelector('.city-specialty-photo');assert.equal(img.loading,'lazy');assert.equal(img.alt,'');
  assert.ok(fs.existsSync(path.join(__dirname,'assets','specialties',button.dataset.cityPhoto+'.webp')));
 }
 f.sync();assert.ok(f.specialtyButtons.every(button=>button.children.length===1));
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
 assert.ok(css.includes('city-header-reference.webp'));
 assert.ok(css.includes('.city-header .city-back:focus-visible'));
 assert.ok(css.includes('@media(max-width:700px)'));
 assert.ok(!/city-header[^{}]*\{[^}]*opacity:\s*0/.test(css));
});
