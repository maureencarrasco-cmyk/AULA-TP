import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

function mediaFixture({ hero = true, imageCount = 2 } = {}) {
  const removed = [];
  const images = Array.from({ length: imageCount }, (_, index) => ({
    remove() { removed.push(index); },
  }));
  const caption = { textContent: 'Explora la simulacion de Electricidad.' };
  const attributes = new Map([
    ['poster', '/static/headers/electricidad/e1.png?v=3'],
    ['data-off-specialty', '1'],
    ['aria-label', 'Presentacion audiovisual de Aula TP Chile'],
  ]);
  const listeners = new Map();
  const source = '/videos/aula-tp-presentacion.mp4';
  const video = {
    hidden: true, controls: true, muted: true, playsInline: true,
    innerHTML: `<source src="${source}" type="video/mp4">`,
    getAttribute(name) { return attributes.get(name) ?? null; },
    setAttribute(name, value) { attributes.set(name, value); },
    removeAttribute(name) { attributes.delete(name); },
    addEventListener(name, listener) { listeners.set(name, listener); },
    closest(selector) { return selector === '#inicio.hero .hero-media' ? (hero ? wrap : null) : wrap; },
  };
  const fallback = { hidden: true, addEventListener() {} };
  const wrap = {
    querySelectorAll(selector) { return selector === 'img[data-tp-poster]' ? images.filter((_, i) => !removed.includes(i)) : []; },
    querySelector(selector) { return selector === '[data-tp-caption]' ? caption : selector === 'img[data-tp-poster]' ? fallback : null; },
  };
  const document = {
    readyState: 'complete',
    querySelectorAll(selector) { return selector === 'video' ? [video] : []; },
    querySelector() { return null; },
    createElement() { throw new Error('The hero must not create another image.'); },
  };
  return { document, video, source, attributes, caption, removed, listeners, fallback };
}

for (const directory of ['landing', 'static']) {
  test(`${directory}: removes only the duplicate hero photo and retains the video`, () => {
    const fixture = mediaFixture();
    vm.runInNewContext(read(`${directory}/aula-tp-coherence.js`), { document: fixture.document });
    assert.deepEqual(fixture.removed, [0, 1]);
    assert.equal(fixture.video.hidden, false);
    assert.equal(fixture.attributes.has('poster'), false);
    assert.equal(fixture.attributes.has('data-off-specialty'), false);
    assert.equal(fixture.attributes.get('preload'), 'metadata');
    assert.equal(fixture.video.controls, true);
    assert.equal(fixture.video.muted, true);
    assert.equal(fixture.video.playsInline, true);
    assert.ok(fixture.video.innerHTML.includes(fixture.source));
    assert.equal(fixture.listeners.has('error'), false);
    assert.equal(fixture.caption.textContent, 'Conoce la propuesta de Aula TP Chile.');
  });

  test(`${directory}: initialization is safe without a photo and on repeated runs`, () => {
    const fixture = mediaFixture({ imageCount: 0 });
    const context = { document: fixture.document };
    vm.runInNewContext(read(`${directory}/aula-tp-coherence.js`), context);
    vm.runInNewContext(read(`${directory}/aula-tp-coherence.js`), context);
    assert.deepEqual(fixture.removed, []);
    assert.equal(fixture.video.hidden, false);
    assert.equal(fixture.attributes.has('poster'), false);
  });

  test(`${directory}: other videos retain their existing error fallback`, () => {
    const fixture = mediaFixture({ hero: false });
    vm.runInNewContext(read(`${directory}/aula-tp-coherence.js`), { document: fixture.document });
    assert.equal(fixture.attributes.get('poster'), '/static/headers/electricidad/e1.png?v=3');
    fixture.listeners.get('error')();
    assert.equal(fixture.video.hidden, true);
    assert.equal(fixture.fallback.hidden, false);
    assert.deepEqual(fixture.removed, []);
  });
}

test('landing and static patches remain synchronized', () => {
  const withoutHeading = source => source.split('\n').slice(2).join('\n');
  assert.equal(withoutHeading(read('landing/aula-tp-coherence.js')), withoutHeading(read('static/aula-tp-coherence.js')));
  assert.equal(read('landing/aula-tp-coherence.css').split('\n').slice(1).join('\n'), read('static/aula-tp-coherence.css').split('\n').slice(1).join('\n'));
});

test('the layout keeps the video and capabilities in normal flow', () => {
  const css = read('landing/aula-tp-coherence.css');
  assert.match(css, /img\[data-tp-poster\]\[hidden\]\s*\{\s*display:\s*none/);
  assert.match(css, /#inicio\.hero > \.hero-media\s*\{[^}]*align-self:\s*center/s);
  assert.match(css, /#inicio\.hero \.hero-media video\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(css, /#inicio\.hero \+ \.capabilities\s*\{[^}]*position:\s*static;[^}]*margin-top:\s*0;/s);
  assert.match(css, /#inicio\.hero \.hero-media figcaption\s*\{[^}]*flex-wrap:\s*wrap;/s);
  assert.match(css, /@media \(max-width: 480px\)\s*\{\s*#inicio\.hero \+ \.capabilities\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\)/s);
  assert.doesNotMatch(css, /margin-top:\s*-|translateY\(-/);
  assert.match(read('landing/INCLUIR-EN-INDEX.txt'), /css\?v=20261010-home-layout/);
  assert.match(read('landing/INCLUIR-EN-INDEX.txt'), /js\?v=20261010-home-demo/);
});
