import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const css=read('static/learning-presentation-effects.css');

test('the shared integration cue and bulb receive their own blue and yellow light',()=>{
  assert.match(css,/\.integration-header-goal \{/);
  assert.match(css,/box-shadow:0 0 0 2px #c6edff,0 0 22px #3aaeff55/);
  assert.match(css,/\.integration-header-goal > \.icon/);
  assert.match(css,/background:#fff3a5/);
  assert.match(css,/box-shadow:0 0 14px #ffd229a0/);
  assert.doesNotMatch(css,/data-action|aria-pressed|data-tab|pointer-events/);
});

test('only the trophy artwork floats and motion or simple-visual preferences can stop it',()=>{
  assert.match(css,/\.exam-closing-trophy > img\[src\*="evaluation-trophy.png"\]/);
  assert.match(css,/\.exam-assessment-photo > img\[src\*="evaluation-trophy.png"\]/);
  assert.match(css,/@keyframes learning-trophy-float/);
  assert.match(css,/translate:0 -8px/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/reduce-motion,.simple-visual/);
  assert.match(css,/animation:none!important;translate:none!important/);
});

test('the replacement banner retains the exact instructions, draft notice and original response fields',()=>{
  const source=read('static/feedback-station.js');
  assert.match(source,/<header class="az-response-intro-reference">/);
  assert.match(source,/<h4>Ahora te toca a ti\.<\/h4>/);
  assert.match(source,/En cada respuesta menciona al menos un resultado o evidencia que apoye tu conclusi\u00f3n\. Si a\u00fan no tienes resultados, explica qu\u00e9 falta para poder analizar\./);
  assert.match(source,/Tus respuestas se conservan como borrador en este navegador\./);
  assert.match(source,/data-az-pq="\$\{i\+1\}" rows="5" maxlength="600"/);
  assert.match(css,/grid-template-columns:130px minmax\(0,1fr\)/);
  assert.match(css,/@media\(max-width:650px\)/);
  assert.match(css,/grid-template-columns:1fr;gap:14px;padding:16px/);
  assert.doesNotMatch(css,/textarea|input|fieldset/);
  assert.match(read('static/index.html'),/learning-presentation-effects.css\?v=20261010-reference-effects/);
});
