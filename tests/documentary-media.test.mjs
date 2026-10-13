import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = name => fs.readFileSync(new URL('../static/' + name, import.meta.url), 'utf8');
const scope = vm.createContext({window: {}, URL, current: {content: {}}, document: {
  readyState: 'loading', addEventListener() {}, querySelectorAll() {return [];}
}, esc: String});
vm.runInContext(source('visual-sim.js'), scope);
scope.AulaVisual = scope.window.AulaVisual;
vm.runInContext(source('activity-engine.js'), scope);
vm.runInContext(source('course-tools.js'), scope);

test('missing environment never falls back to another specialty', () => {
  assert.equal(scope.window.AulaVisual.envSrc(), '');
  const html = scope.window.AulaVisual.sceneStage({parts: [{id: 'original', label: 'Original'}]});
  assert.ok(!html.includes('oficio-plano-leyenda'));
  assert.ok(html.includes('data-part="original"'));
});

test('UE-01 remains inspectable without an invented spatial position', () => {
  const exp = {image: '/static/themes/oficio/oficio-plano-leyenda.png?v=3', type: 'hotspot',
    spots: [{id: 'ue', label: 'UE-01', x: 18, y: 28}, {id: 'ui', label: 'UI-01', x: 62, y: 46}]};
  const before = JSON.stringify(exp);
  const html = scope.hotspotMap(exp, [], {skipStem: true});
  assert.ok(!html.includes('left:18%;top:28%'));
  assert.ok(html.includes('left:62%;top:46%'));
  assert.ok(html.includes('UE-01 · Revisar referencia'));
  assert.equal(JSON.stringify(exp), before);
});

test('contextual videos keep original source, track and caption', () => {
  const exp = {video: '/static/media/general-secuencia.mp4', vtt: '/static/media/general-secuencia.vtt', caption: 'Original'};
  const before = JSON.stringify(exp);
  const html = scope.window.AulaVisual.videoFigure(exp);
  assert.ok(html.includes('Apoyo contextual'));
  assert.ok(html.includes(exp.video) && html.includes(exp.vtt) && html.includes('Original'));
  assert.equal(JSON.stringify(exp), before);
});

test('revised documentary video and subtitles bypass the previous cache together', () => {
  const exp = {video: '/static/media/m3-secuencia.mp4', vtt: '/static/media/m3-secuencia.vtt'};
  const original = JSON.stringify(exp);
  const html = scope.window.AulaVisual.videoFigure(exp);
  assert.ok(html.includes('m3-secuencia.mp4?rev=20261012-documentary-video-v2'));
  assert.ok(html.includes('m3-secuencia.vtt?rev=20261012-documentary-video-v2'));
  assert.equal(JSON.stringify(exp), original);
});

test('missing scenes never fabricate equipment, values or a completion form', () => {
  scope.current = {content: {}};
  assert.equal(scope.currentScene(), null);
  const html = scope.enrichedScene();
  assert.ok(html.includes('escenario original no está disponible'));
  assert.ok(!html.includes('UI-01') && !html.includes('22°') && !html.includes('scene-form'));
  assert.doesNotThrow(() => scope.inspectPart('not-original'));
});

test('original scenes and parts remain unchanged and inspectable', () => {
  const scene = {title: 'Original', prompt: 'Original instruction', parts: [{id: 'a', label: 'Original', value: '25', detail: 'Original detail'}]};
  scope.current = {content: {scene}};
  const original = JSON.stringify(scene);
  assert.equal(scope.currentScene(), scene);
  assert.equal(JSON.stringify(scene), original);
});

test('incomplete comparisons do not insert unrelated HVAC images', () => {
  scope.current = {position: 2, content: {}};
  const exp = {representation: 'comparison', image: '/static/original.png', caption: 'Original'};
  const original = JSON.stringify(exp);
  const html = scope.window.AulaVisual.mediaFor(exp);
  assert.ok(html.includes(exp.image));
  assert.ok(html.includes('segunda imagen original'));
  assert.ok(!html.includes('oficio-'));
  assert.equal(JSON.stringify(exp), original);
});

test('complete comparisons retain both original resources and captions', () => {
  const exp = {representation: 'comparison', image: '/static/a.png', imageB: '/static/b.png', caption: 'Original A', captionB: 'Original B'};
  const original = JSON.stringify(exp);
  const html = scope.window.AulaVisual.mediaFor(exp);
  assert.ok(html.includes(exp.image) && html.includes(exp.imageB));
  assert.ok(html.includes('Original A') && html.includes('Original B'));
  assert.ok(!html.includes('media-missing'));
  assert.equal(JSON.stringify(exp), original);
});

test('a contextual video cannot hide the original activity image', () => {
  const exp = {video: '/static/media/general-secuencia.mp4', image: '/static/original-evidence.png', type: 'order', alt: 'Original evidence'};
  const original = JSON.stringify(exp);
  const html = scope.window.AulaVisual.mediaFor(exp);
  assert.ok(html.includes(exp.video) && html.includes(exp.image));
  assert.ok(html.includes('Original evidence'));
  assert.equal(JSON.stringify(exp), original);
  assert.ok(!scope.window.AulaVisual.mediaFor({...exp, type: 'hotspot'}).includes(exp.image), 'hotspot keeps its image in the original interactive map');
});

test('a missing image cannot suppress an independently available original video', () => {
  const exp = {video: '/static/media/general-secuencia.mp4', type: 'order', image: null,
    unavailable_media: {image: {path: 'static/missing.png'}}};
  const original = JSON.stringify(exp);
  const html = scope.window.AulaVisual.mediaFor(exp);
  assert.ok(html.includes('<video ') && html.includes(exp.video));
  assert.ok(html.includes('resource-unavailable'));
  assert.ok(!html.includes('<img '));
  assert.equal(JSON.stringify(exp), original);
});
