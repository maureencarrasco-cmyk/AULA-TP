const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const script=fs.readFileSync(path.join(__dirname,'../static/portal-docente.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../static/portal-docente-report-theme.css'),'utf8');
test('evaluation indicators use scoped records and comparable weeks, not mockup values',()=>{
  assert.ok(script.includes('const comparableWeeks = weeklyPoints(records)'));
  assert.ok(script.includes("reportMetric('Semanas con registros',comparableWeeks.length"));
  assert.ok(script.includes("reportMetric('Registros con evaluación de selección',scores.length"));
  assert.ok(script.includes('pd-chart-legend'));
  assert.ok(css.includes('@media (max-width:640px)'));
  assert.ok(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'));
});
