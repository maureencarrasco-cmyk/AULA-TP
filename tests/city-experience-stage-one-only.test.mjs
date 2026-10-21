import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const html=readFileSync(new URL('../static/city-experience.html',import.meta.url),'utf8');
const script=readFileSync(new URL('../static/city-experience.js',import.meta.url),'utf8');

test('the right-side journey panel exposes only Stage 1 quizzes',()=>{
  const tabs=html.match(/<nav class="stage-tabs"[\s\S]*?<\/nav>/)?.[0]||'';
  assert.match(tabs,/data-stage="quiz"/);
  assert.doesNotMatch(tabs,/mission|Práctica profesional|Misiones profesionales/i);
  assert.match(html,/Tiempo activo · Etapa 1/);
  assert.match(html,/Duración mínima del quiz: 20 min/);
  assert.match(script,/activeStage='quiz';/);
  assert.match(script,/if\(stage!=='quiz'\)return;/);
  assert.doesNotMatch(script,/id="open-mission"|setStage\('mission'\)/);
  assert.match(script,/const done=savedCount\(\);\$\('#progress-bar'\)\.style\.width=`\$\{Math\.round\(done\/plan\.quiz\.length\*100\)\}%`/);
});
