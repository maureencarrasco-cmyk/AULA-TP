import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url));
const html=read('static/city-experience.html').toString();
const css=read('static/city-experience-entry.css').toString();
const script=read('static/city-experience.js').toString();

test('Station 4 banner replaces the old header and preserves its navigation actions',()=>{
  const image=read('static/city-experience-station4-banner.png');
  assert.deepEqual([...image.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  assert.match(html,/city-experience-entry\.css\?v=20261018-direct-city-entry-v2/);
  assert.match(css,/background-image:url\('\/static\/city-experience-station4-banner\.png'\)/);
  assert.doesNotMatch(html,/class="experience-header"/);
  assert.match(html,/id="city-welcome" aria-labelledby="welcome-title"/);
  assert.match(html,/class="return-link city-return-link" href="\/ciudad_laboral_aulatp\/"/);
  assert.match(css,/aspect-ratio:1707\/405/);
  assert.match(html,/id="enter-city" class="primary-button enter-city-button" href="https:\/\/www\.aulatpchile\.cl\/ciudad_laboral_aulatp\/" target="_blank" rel="noopener" aria-label="Abrir la Ciudad Laboral 3D existente en una nueva pestaña"/);
  assert.match(script,/enterCity\.addEventListener\('click',beginCityEntry\)/);
  assert.match(html,/class="city-live-entry"[\s\S]*?alt="Vista aérea general de la Ciudad Laboral y sus distritos"[\s\S]*?href="https:\/\/www\.aulatpchile\.cl\/ciudad_laboral_aulatp\/" target="_blank" rel="noopener"/);
  assert.doesNotMatch(html,/existing-city-frame|<iframe/);
  assert.match(script,/La Ciudad Laboral original se abrió en una pestaña nueva/);
  assert.doesNotMatch(html,/city-experience-scene\.js/);
  assert.doesNotMatch(script,/cityExperienceSceneReady|new window\.cityExperienceSceneReady/);
  assert.match(script,/welcome\.hidden=true;onboarding\.hidden=false;navigation\.hidden=false;setupPanel\.hidden=false/);
  assert.match(script,/startButton\.addEventListener\('click',openJourney\)/);
  assert.match(html,/id="city-onboarding"[\s\S]*?Desafío de conocimientos[\s\S]*?15 minutos[\s\S]*?Aprendizajes Esperados[\s\S]*?Práctica profesional[\s\S]*?30 minutos[\s\S]*?Tu recorrido en la/);
  assert.match(html,/Elige especialidad y piso[\s\S]*?Completa las dos etapas/);
  assert.match(script,/updateOnboardingContext\(preCourse,preModule\)/);
  assert.match(html,/route-guidance[\s\S]*?flechas amarillas luminosas[\s\S]*?cuestionarios y las misiones profesionales/);
  assert.match(css,/\.enter-city-button:focus-visible/);
  assert.match(css,/@media\(max-width:760px\).*?\.enter-city-button\{left:10%;top:63\.8%;width:75%/);
});
