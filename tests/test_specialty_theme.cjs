const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
let art='';
const c=vm.createContext({
  document:{body:{dataset:{screen:'module'},style:{setProperty:(k,v)=>art=v}}},
  courses:[{id:1,specialty:'Refrigeración y climatización',modules:[{id:1}]},{id:2,specialty:'Administración',modules:[{id:9}]}],
  current:{course_id:1,position:1,content:{},state:{}},
  view:{name:'module',station:1},
  ae:0,
  step:0
});
vm.runInContext(fs.readFileSync('static/specialty-theme.js','utf8'),c);
const v='?v=3';
const plano=`/static/themes/oficio/oficio-plano-leyenda.png${v}`;
const visor=`/static/themes/oficio/oficio-visor-21c.png${v}`;
const tramos=`/static/themes/oficio/oficio-tramos.png${v}`;
const equipo=`/static/themes/oficio/oficio-equipo-ctrl.png${v}`;
const visor25=`/static/themes/oficio/oficio-visor-25.png${v}`;
for(const station of [1,2,3,4,5]) {c.view.station=station;c.applySpecialtyTheme();assert.ok(art.includes('oficio-plano-leyenda.png'));}
c.current.course_id=2;c.applySpecialtyTheme();assert.ok(art.includes('oficio-plano-leyenda.png'));
c.document.body.dataset.screen='editor';c.view.id='1';c.applySpecialtyTheme();assert.ok(art.includes('oficio-plano-leyenda.png'));
c.view.id='9';c.applySpecialtyTheme();assert.ok(art.includes('oficio-plano-leyenda.png'));
c.document.body.dataset.screen='course';c.view.id='1';c.applySpecialtyTheme();assert.ok(art.includes('oficio-plano-leyenda.png'));
c.document.body.dataset.screen='courses';c.applySpecialtyTheme();assert.ok(art.includes('oficio-plano-leyenda.png'));
assert.equal(c.specialtyCover(c.courses[1]),'/static/headers/administracion/e1.png?v=3');
assert.equal(c.heroPhoto(c.courses[0]),plano);
c.current.course_id=1;
for(const n of [1,2,3,4,5]) assert.equal(c.stationHeaderArt(n,c.courses[0]),plano);
c.current.position=3;
assert.equal(c.stationHeaderArt(1,c.courses[0]),tramos);
assert.equal(c.stationHeaderArt(4,c.courses[0]),tramos);
assert.match(c.stationHeaderAlt(3,c.courses[0]),/tramo|cubicaci[oó]n|cota/i);
c.current.position=2;
c.current.content={aes:[{experiences:[{image:visor,alt:'Visor AE'}]}]};
assert.equal(c.stationHeaderArt(2,c.courses[0]),visor);
c.current.position=4;
c.current.content={explore:{image:equipo,alt:'EQ-02'}};
assert.equal(c.stationHeaderArt(4,c.courses[0]),equipo);
c.current.position=1;
c.current.state={exam:{corrections:[{correct:false,image:'/static/themes/oficio/oficio-escala.png?v=2',alt:'Error escala'}]}};
assert.equal(c.stationHeaderArt(5,c.courses[0]),'/static/themes/oficio/oficio-escala.png?v=2');
c.current.position=2;
assert.equal(c.stationHeaderArt(5,c.courses[0]),visor25);
console.log('Specialty themes passed: hero follows module, AE crop, exam explore, feedback error frame.');
