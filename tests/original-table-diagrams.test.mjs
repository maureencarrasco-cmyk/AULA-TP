import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

function fixture(){
  const scope=vm.createContext({window:{AulaVisual:{figure:(src,opts)=>({src,...opts})}},
    courses:[{id:6,title:'Curso original'}],current:{course_id:6,title:'Modulo original'},ae:0,step:4});
  vm.runInContext(fs.readFileSync(new URL('../static/original-table-diagrams.js',import.meta.url),'utf8'),scope);
  const table=[['Punto','Valor','Unidad'],['A','20,0','\u00b0C'],['B','25','\u2014']];
  scope.window.AulaOriginalDiagrams.setCatalog({records:[{course:'Curso original',module:'Modulo original',table,locations:[{aeIndex:0,experienceIndex:4}]}]});
  return {scope,api:scope.window.AulaOriginalDiagrams,table};
}

test('diagrams copy original values and missing units without deriving answers',()=>{
  const {api,table}=fixture();
  const exp={phase:'Verificar',table,options:['Original A','Original B'],answer:1};
  const before=JSON.stringify(exp),figure=api.figure(exp);
  const svg=decodeURIComponent(figure.src.split(',').slice(1).join(','));
  for(const text of ['20,0','25','\u00b0C','\u2014'])assert.ok(svg.includes(text));
  assert.doesNotMatch(svg,/Original A|Original B|answer=|correct|scale=/);
  assert.match(figure.caption,/sin escala/);
  assert.equal(JSON.stringify(exp),before);
});

test('restoration is limited to the original module, AE and activity',()=>{
  const {api,scope}=fixture();
  assert.ok(api.figure({phase:'Verificar'}).src);
  scope.step=3;
  assert.equal(api.figure({phase:'Aplicar'}),'');
  scope.step=4;scope.ae=1;
  assert.equal(api.figure({phase:'Verificar'}),'');
  scope.ae=0;scope.current.title='Otro modulo';
  assert.equal(api.figure({phase:'Verificar'}),'');
  scope.current.title='Modulo original';scope.ae=1;
  const {table}=fixture();
  assert.equal(api.figure({phase:'Verificar',table}),'');
});

test('unverified tables, evaluation items and malformed cells never create a diagram',()=>{
  const {api,table}=fixture();
  assert.equal(api.figure({phase:'Verificar',table:[['Dato','Valor'],['B','Inventado']]}),'');
  assert.equal(api.figure({type:'choice',table,answer:0}),'');
  assert.equal(api.svg([['Dato','Valor'],['x']]),'');
  assert.equal(api.svg([['Dato','Valor'],['x',{nested:'not supported'}]]),'');
  assert.equal(api.svg([['Dato','Valor'],['x','a'.repeat(100)]]),'');
});

test('SVG escapes source text instead of executing markup',()=>{
  const {api}=fixture();
  const svg=api.svg([['Dato','Valor'],['x','<script>alert(1)</script>']]);
  assert.match(svg,/&lt;script&gt;/);
  assert.doesNotMatch(svg,/<script>/);
});

test('the source catalog covers all 45 courses and 451 modules without assessment keys',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('../static/original-table-catalog.json',import.meta.url),'utf8'));
  assert.match(data.sourceSha256,/^[a-f0-9]{64}$/);
  assert.equal(new Set(data.records.map(row=>row.course)).size,45);
  assert.equal(new Set(data.records.flatMap(row=>row.locations.map(loc=>loc.moduleId))).size,451);
  assert.equal(data.records.reduce((n,row)=>n+row.locations.length,0),649);
  for(const record of data.records){
    assert.deepEqual(Object.keys(record).sort(),['course','locations','module','table']);
    assert.ok(Array.isArray(record.table));
  }
});
