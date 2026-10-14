const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('station presentation keeps scoped values and original accompaniment categories',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../static/portal-docente.js'),'utf8');
  assert.ok(source.includes('const amount=station.value==null?null:'));
  assert.ok(source.includes('counts.ok+counts.watch+counts.support+counts.none'));
  assert.ok(source.includes("stations: stationProgressReport + stationDistributionReport + actions"));
  assert.ok(source.includes('no representa actividades individuales'));
});
