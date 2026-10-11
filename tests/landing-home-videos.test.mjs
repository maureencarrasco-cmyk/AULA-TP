import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const file = path => new URL(`../${path}`, import.meta.url);
const read = path => readFileSync(file(path), 'utf8');
function fixture() {
  const wrap = { querySelectorAll: () => [], querySelector: () => null };
  const videos = ['presentation', 'mission'].map(name => {
    const attributes = new Map([['data-tp-home-video', name], ['poster', `${name}-poster.jpg`]]);
    const listeners = new Map();
    return {
      controls: true, muted: false, playsInline: true, paused: true, hidden: false,
      innerHTML: `<source src="${name}.mp4">`, pauseCount: 0, playListenerCount: 0,
      getAttribute: key => attributes.get(key) ?? null,
      setAttribute: (key, value) => attributes.set(key, value),
      removeAttribute: key => attributes.delete(key),
      closest: () => wrap,
      addEventListener(key, callback) {
        listeners.set(key, callback);
        if (key === 'play') this.playListenerCount++;
      },
      playEvent() { listeners.get('play')(); },
      pause() { this.paused = true; this.pauseCount++; },
    };
  });
  const document = {
    readyState: 'complete', querySelector: () => null,
    querySelectorAll: selector => ['video', '#inicio .tp-home-video video'].includes(selector) ? videos : [],
  };
  return { document, videos };
}

for (const directory of ['landing', 'static']) {
  test(`${directory}: preserves both sources, posters, native controls and audio`, () => {
    const { document, videos } = fixture();
    vm.runInNewContext(read(`${directory}/aula-tp-coherence.js`), { document });
    videos.forEach((video, index) => {
      const name = index ? 'mission' : 'presentation';
      assert.equal(video.getAttribute('poster'), `${name}-poster.jpg`);
      assert.equal(video.innerHTML, `<source src="${name}.mp4">`);
      assert.equal(video.getAttribute('preload'), 'metadata');
      assert.equal(video.controls, true);
      assert.equal(video.muted, false);
      assert.equal(video.playsInline, true);
      assert.equal(video.hidden, false);
    });
  });

  test(`${directory}: playing either video pauses only the other, with one listener after reinitialization`, () => {
    const { document, videos } = fixture();
    const context = { document };
    vm.runInNewContext(read(`${directory}/aula-tp-coherence.js`), context);
    vm.runInNewContext(read(`${directory}/aula-tp-coherence.js`), context);
    const [first, second] = videos;
    first.paused = second.paused = false;
    first.playEvent();
    assert.equal(first.paused, false);
    assert.equal(first.pauseCount, 0);
    assert.equal(second.paused, true);
    second.paused = false;
    second.playEvent();
    assert.equal(first.paused, true);
    assert.equal(second.paused, false);
    assert.equal(first.pauseCount, 1);
    assert.equal(second.pauseCount, 1);
    videos.forEach(video => assert.equal(video.playListenerCount, 1));
  });
}

test('preview and public snippet contain the same two ordered videos and matching assets', () => {
  for (const path of ['static/landing-home-preview.html', 'landing/portada-video.html']) {
    const html = read(path);
    assert.equal((html.match(/<video controls playsinline preload="metadata"/g) || []).length, 2);
    assert.ok(html.indexOf('aula-tp-presentacion.mp4') < html.indexOf('aula-tp-invitacion.mp4'));
    assert.match(html, /Conoce Aula TP Chile<\/h2>/);
    assert.match(html, /Misi&oacute;n Laboral en acci&oacute;n<\/h2>/);
    assert.doesNotMatch(html, /<video[^>]*\b(?:muted|autoplay)\b/);
    assert.match(html, /role="group" aria-label="Videos de Aula TP Chile"/);
  }
  for (const asset of ['aula-tp-presentacion.mp4', 'aula-tp-invitacion.mp4', 'aula-tp-presentacion-poster.jpg', 'aula-tp-invitacion-poster.jpg']) {
    const hash = path => createHash('sha256').update(readFileSync(file(path))).digest('hex');
    assert.equal(hash(`landing/${asset}`), hash(`static/landing-preview-assets/${asset}`));
  }
});

test('video styles match and the public integration includes the structured media column', () => {
  const css = read('landing/landing-home-videos.css');
  assert.equal(css, read('static/landing-home-videos.css'));
  assert.match(css, /aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(css, /min-width:\s*0/);
  assert.match(css, /flex-flow:\s*row nowrap/);
  assert.match(css, /\.tp-home-videos\s*\{[^}]*background:\s*transparent/s);
  assert.match(read('landing/INCLUIR-EN-INDEX.txt'), /landing-home-videos\.css/);
  assert.match(read('static/landing-home-preview.html'), /landing-home-videos\.css/);
});
