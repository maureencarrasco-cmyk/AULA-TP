import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { gzipSync } from 'node:zlib';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const python = process.env.PYTHON || (existsSync(new URL('.venv/Scripts/python.exe', root)) ? fileURLToPath(new URL('.venv/Scripts/python.exe', root)) : 'python3');
const courses = JSON.parse(execFileSync(python, ['-c', `import sqlite3,json
c=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
c.row_factory=sqlite3.Row
courses=[]
for row in c.execute('SELECT id,title,specialty FROM courses ORDER BY id'):
    course=dict(row)
    course['modules']=[dict(m) for m in c.execute('SELECT id,title,position FROM modules WHERE course_id=? ORDER BY position,id',(row['id'],))]
    courses.append(course)
print(json.dumps(courses))`], { cwd: fileURLToPath(root), encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }));
const context = vm.createContext({});
context.window=context;
vm.runInContext(read('static/course-artwork-catalog.js'), context);
vm.runInContext(read('static/course-artwork.js'), context);
vm.runInContext(read('static/encargo-photo-selection.js'), context);
const subjects = JSON.parse(read('static/situation-photos/catalog.json'));
const additions=JSON.parse(read('static/situation-photos/reviewed-additions.json'));
for(const [topic,photos] of Object.entries(additions))subjects[topic].push(...photos);
const rejected=new Set(JSON.parse(read('scripts/situation-photo-review.json')).rejectedImages);
const banks = {
  1:['cooling','coolingtubes','pressure','thermometer','electrical','motor'],2:['electrical','multimeter','motor','electronics'],
  3:['nursing','bloodpressure','medication','firstaid','handwash'],4:['nursing','bloodpressure','medication','firstaid','handwash'],
  5:['cooking','food','buffet','cocktails','bakery'],6:['bakery','food','cooking','packaging'],7:['hotel','buffet','tourism','cocktails'],
  8:['accounting','office','meeting'],9:['food','packaging','plant','laboratory'],10:['textile','tools'],11:['plumbing','tools','pressure'],
  12:['assembly','welding','motor','tools'],13:['electronics','multimeter','network'],14:['drawing','plans','office','tools'],
  15:['printing','office'],16:['tourism','hotel','ship'],17:['forestry','silviculture','timber','fire'],18:['furniture','timber','tools'],
  19:['aquaculture','hatchery','diving'],20:['port','warehouse','ship'],21:['fishing','ship','aquaculture'],22:['ship','engine','port'],
  23:['welding','assembly','tools'],24:['car','enginecar','motor'],25:['aircraft','tools','engine'],26:['geology','rocks','mining','laboratory'],
  27:['mining','geology','rocks'],28:['metallurgy','plant','laboratory'],29:['preschool','firstaid','handwash'],
  30:['network','server','electronics'],31:['programming','server','network'],32:['telecom','network','server'],
  33:['warehouse','port','office','meeting'],34:['office','accounting','meeting'],35:['crops','irrigation','seedlings'],
  36:['cattle','dairy','crops'],37:['vineyard','wine','crops'],38:['construction','concrete','roof','tools'],
  39:['tiles','roof','furniture','construction'],40:['road','concrete','construction'],41:['laboratory','microscope','plant'],
  42:['plant','laboratory','packaging'],43:['machining','caliper','tools'],44:['molds','machining','caliper'],45:['motor','electrical','multimeter','tools']
};
const hashes = new Map();
const decorative=/post.?card|postkarte|carte.postale|coat.of.arms|caricature|politician|statue|oil.painting|watercolou?r|book.cover|advertisement|postage.stamp|comic|historical.print/i;
const topicRules={bakery:/bread|dough|pastry|baking|bakery|cake|knead|panader|croissant|oven|patisser/i,molds:/mould|mold|die.cast|tooling|casting|matri/i};
const photos = Object.fromEntries(Object.entries(subjects).map(([topic, records]) => [topic, records.flatMap(photo => {
  if (!/^\/static\/(encargo|situation)-photos\/[^/]+\.jpg$/.test(photo.image)) return [];
  if (!context.courseContextPhotoAllowed(photo)) return [];
  if(rejected.has(photo.image))return [];
  if (!photo.author || !photo.license || !photo.alt || !/^https:\/\/commons\.wikimedia\.org\//.test(photo.source)) return [];
  const description=[photo.title,photo.description,photo.source].join(' ');
  if(decorative.test(description)||topicRules[topic]&&!topicRules[topic].test(description))return [];
  if(topic==='molds'&&/fung|mildew|mouldy|moldy|bread|food/i.test(description))return [];
  const bytes = readFileSync(new URL(photo.image.slice(1), root));
  if (bytes[0] !== 255 || bytes[1] !== 216 || bytes.length < 1000) return [];
  const fingerprint = createHash('sha256').update(bytes).digest('hex');
  hashes.set(photo.image, fingerprint);
  return [{ image:photo.image, alt:photo.alt, source:photo.source, author:photo.author,
    license:photo.license, topic, fingerprint }];
})]));
const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const concepts = [
  [/higiene|limpieza|infeccion/,/wash|clean|hygien/],[/almacen|recepcion|bodega/,/warehouse|storage|loading/],
  [/pasteler|reposter|masas|pan/,/bak|bread|pastry|dough/],[/medicamento|farmacia/,/medicine|pharmac/],
  [/medicion|instrumento|verificacion/,/measure|meter|caliper/],[/soldadura/,/weld/],[/motor/,/engine|motor/],
  [/mantenc|mantenim/,/repair|maintenance/],[/riego/,/irrigation/],[/reproduccion vegetal/,/seedling|planting/],
  [/programacion|software/,/program|code|software/],[/laboratorio|analisis|muestra/,/laboratory|sample|research/],
  [/refriger|climatiz/,/air.condition|refriger|cooling/],[/contabil|tribut|remuner/,/account|calculat|office/]
];
const usedImages = new Set(), usedSources = new Set();
const related={warehouse:['packaging','port'],plans:['drawing','tools'],meeting:['office','accounting'],handwash:['nursing','firstaid'],firstaid:['nursing'],waste:['safety'],rocks:['geology','laboratory'],safety:['construction','firstaid'],bloodpressure:['nursing','medication'],medication:['nursing','laboratory']};
const requests = courses.flatMap(course => [{ course, cover:true, topic:context.encargoPhotoTopic({},course) },
  ...course.modules.map(module => ({ course, module, topic:context.encargoPhotoTopic({},course,module.title) }))]);
const reviewedImages={
  1:{'Reciclaje y almacenamiento de refrigerantes':'cooling-review-24f9e5750a07.jpg'},
  13:{'Mantencion y operacion de equipos de control electronico de potencia':'electronics-review-c97afbf04b16.jpg'},
  23:{'Trazado de partes y piezas en construcciones metalicas':'welding-review-c98af0758b09.jpg'},
  28:{'Tecnicas de hidrometalurgia':'metallurgy-review-c5ef8307b973.jpg'},
  37:{'Envasado y maquinaria vitivinicola':'wine-review-57892edb273a.jpg'},
  39:{'Interpretacion de planos de construccion':'plans-review-c6e155eb1f2e.jpg'}
};
const reviewedTopics={
  1:{'Reciclaje y almacenamiento de refrigerantes':'cooling'},
  11:{'Lectura de planos de instalaciones sanitarias':'plans'},
  29:{'Expresion literaria y teatral con parvulos':'preschool'},
  37:{'Envasado y maquinaria vitivinicola':'wine'},
  39:{'Control y mantenimiento de bodegas y panoles':'warehouse','Interpretacion de planos de construccion':'plans','Emprendimiento y empleabilidad':'meeting'},
  40:{'Seguridad vial':'road'}
};
for (const request of requests) {
  request.reviewed=Object.entries(reviewedImages[request.course.id]||{}).find(([title])=>normalize(title)===normalize(request.module?.title))?.[1];
  const override=Object.entries(reviewedTopics[request.course.id]||{}).find(([title])=>normalize(title)===normalize(request.module?.title))?.[1];
  if(override)request.topic=override;
  const bank = banks[request.course.id];
  if (!bank) throw new Error(`Missing artwork bank: ${request.course.title}`);
  const topics = [request.topic, ...(related[request.topic]||[]), ...bank];
  const text = normalize(request.module?.title || request.course.title);
  request.pool = [...new Set(topics)].flatMap(topic => (photos[topic] || []).map(photo => ({
    ...photo, score:(topic === request.topic ? 100 : (related[request.topic]||[]).includes(topic)?50:20 - bank.indexOf(topic)) + concepts.reduce((sum,[task,image]) => sum + (task.test(text) && image.test(normalize(photo.alt + ' ' + photo.source)) ? 5 : 0), 0)
  })));
}
// Allocate the narrowest subjects first so shared technical photographs remain available.
requests.sort((a,b) => a.pool.length - b.pool.length || Number(b.cover) - Number(a.cover) || a.course.id - b.course.id || (a.module?.position || 0) - (b.module?.position || 0));
// Preserve all unflagged assignments instead of reallocating the whole catalog.
for(const request of requests){
  const previous=request.cover?context.courseArtworkPhoto(request.course):context.moduleArtworkPhoto(request.course,request.module);
  if(previous&&context.courseContextPhotoAllowed(previous)&&(!request.reviewed||previous.image.endsWith('/'+request.reviewed))){
    request.retained=previous;
    usedImages.add(previous.fingerprint);usedSources.add(previous.source);
  }
}
const catalog = { version:'20261012-reviewed-artwork-v3', courses:{} };
for (const request of requests) {
  const reviewed=request.reviewed?Object.values(photos).flat().find(p=>p.image.endsWith('/'+request.reviewed)):null;
  if(!request.retained&&reviewed&&(usedImages.has(reviewed.fingerprint)||usedSources.has(reviewed.source)))throw new Error('Reviewed photograph already allocated');
  const photo = request.retained || reviewed || request.pool.filter(p => !usedImages.has(p.fingerprint) && !usedSources.has(p.source)).sort((a,b) => b.score-a.score || a.image.localeCompare(b.image))[0];
  if (!photo) throw new Error(`No distinct photograph available: ${request.course.title} / ${request.module?.title || 'cover'}`);
  usedImages.add(photo.fingerprint);
  usedSources.add(photo.source);
  const {score,...credit} = photo;
  const record = catalog.courses[request.course.id] ||= { id:request.course.id, title:request.course.title, cover:null, modules:[] };
  if (request.cover) record.cover = credit;
  else record.modules.push({id:request.module.id, title:request.module.title, position:request.module.position, photo:credit});
}
for (const course of Object.values(catalog.courses)) course.modules.sort((a,b) => a.position-b.position);
const json = JSON.stringify(catalog);
const script = `'use strict';\n// Generated by scripts/build_course_artwork.mjs; licensed sources retained.\nwindow.AulaCourseArtworkData=${json};\n`;
writeFileSync(new URL('static/course-artwork-catalog.js', root), script);
writeFileSync(new URL('static/course-artwork-catalog.js.gz', root), gzipSync(script, {level:9}));
console.log(JSON.stringify({ courses:courses.length, modules:requests.length-courses.length, distinctPhotos:usedImages.size, bytes:Buffer.byteLength(script), compressedBytes:gzipSync(script,{level:9}).length }));
