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
  assert.match(html,/city-experience-entry\.css\?v=20261018-city-station4-banner-v1/);
  assert.match(css,/background-image:url\('\/static\/city-experience-station4-banner\.png'\)/);
  assert.doesNotMatch(html,/class="experience-header"/);
  assert.match(html,/id="city-welcome" aria-labelledby="welcome-title"/);
  assert.match(html,/class="return-link city-return-link" href="\/ciudad_laboral_aulatp\/"/);
  assert.match(css,/aspect-ratio:1707\/405/);
  assert.match(html,/id="enter-city" class="primary-button enter-city-button" type="button" aria-label="Entrar a la Ciudad Laboral y comenzar el recorrido 3D"/);
  assert.match(script,/enterCity\.addEventListener\('click',beginCityEntry\)/);
  assert.match(script,/welcome\.hidden=true;navigation\.hidden=false;setupPanel\.hidden=false/);
  assert.match(css,/\.enter-city-button:focus-visible/);
  assert.match(css,/@media\(max-width:760px\).*?\.enter-city-button\{left:10%;top:63\.8%;width:75%/);
});
