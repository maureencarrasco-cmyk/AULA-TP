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
    const buttonListeners = new Map();
    const button = {
      hidden: false, listenerCount: 0,
      addEventListener(key, callback) { buttonListeners.set(key, callback); this.listenerCount++; },
      click() { buttonListeners.get('click')(); },
    };
    const durationAttributes = new Map();
    const duration = { textContent: '', parentElement: { setAttribute: (key, value) => durationAttributes.set(key, value) } };
    const figure = { querySelector: selector => selector === '.tp-home-video-play' ? button : selector === '[data-tp-video-duration]' ? duration : null };
    return {
      controls: true, muted: false, playsInline: true, paused: true, hidden: false,
      duration: name === 'presentation' ? 10.005 : 39.984762, button, durationLabel: duration, durationAttributes,
      innerHTML: `<source src="${name}.mp4">`, pauseCount: 0, playListenerCount: 0,
      getAttribute: key => attributes.get(key) ?? null,
      setAttribute: (key, value) => attributes.set(key, value),
      removeAttribute: key => attributes.delete(key),
      closest: selector => selector === '.tp-home-video' ? figure : wrap,
      addEventListener(key, callback) {
        listeners.set(key, callback);
        if (key === 'play') this.playListenerCount++;
      },
      playEvent() { listeners.get('play')(); },
      emit(key) { listeners.get(key)(); },
      play() { this.paused = false; this.playEvent(); return Promise.resolve(); },
      pause() { this.paused = true; this.pauseCount++; this.emit('pause'); },
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
    videos.forEach(video => assert.equal(video.button.listenerCount, 1));
  });

  test(`${directory}: center play buttons use the original players and follow native pause and end state`, () => {
    const { document, videos } = fixture();
    vm.runInNewContext(read(`${directory}/aula-tp-coherence.js`), { document });
    const [first, second] = videos;
    assert.equal(first.button.hidden, false);
    first.button.click();
    assert.equal(first.paused, false);
    assert.equal(first.button.hidden, true);
    second.button.click();
    assert.equal(first.paused, true);
    assert.equal(first.button.hidden, false);
    assert.equal(second.button.hidden, true);
    second.ended = true;
    second.emit('ended');
    assert.equal(second.button.hidden, false);
    second.emit('error');
    assert.equal(second.button.hidden, true);
    assert.equal(second.controls, true);
  });

  test(`${directory}: durations come from metadata, including late loading and minute rollover`, () => {
    const { document, videos } = fixture();
    videos[0].duration = NaN;
    videos[0].durationLabel.textContent = '0:10';
    vm.runInNewContext(read(`${directory}/aula-tp-coherence.js`), { document });
    assert.equal(videos[0].durationLabel.textContent, '0:10');
    assert.equal(videos[1].durationLabel.textContent, '0:40');
    videos[0].duration = 59.9;
    videos[0].emit('loadedmetadata');
    assert.equal(videos[0].durationLabel.textContent, '1:00');
    assert.equal(videos[0].durationAttributes.get('aria-label'), 'Duraci\u00f3n del video: 1:00');
    videos[0].duration = 65;
    videos[0].emit('durationchange');
    assert.equal(videos[0].durationLabel.textContent, '1:05');
  });

  test(`${directory}: rejected playback keeps the play button usable and preserves a user's mute choice`, async () => {
    const { document, videos } = fixture();
    videos[0].muted = true;
    videos[0].play = () => Promise.reject(new Error('Playback denied'));
    vm.runInNewContext(read(`${directory}/aula-tp-coherence.js`), { document });
    videos[0].button.click();
    await Promise.resolve();
    assert.equal(videos[0].button.hidden, false);
    assert.equal(videos[0].muted, true);
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
    assert.equal((html.match(/class="tp-home-video-play" type="button"/g) || []).length, 2);
    assert.equal((html.match(/data-tp-video-duration/g) || []).length, 2);
  }
  for (const asset of ['aula-tp-presentacion.mp4', 'aula-tp-invitacion.mp4', 'aula-tp-presentacion-poster.jpg', 'aula-tp-invitacion-poster.jpg', 'hero-estudiante-recorte.png']) {
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
