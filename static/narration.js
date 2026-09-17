'use strict';
/* Voz guía: español latino, tono educacional, cálido y grato. */
(function () {
  let cached = null;

  function scoreVoice(v) {
    const lang = String(v.lang || '').toLowerCase();
    const name = String(v.name || '').toLowerCase();
    const blob = lang + ' ' + name;
    let s = 0;
    if (!/es/.test(blob) && !/spanish|español/.test(name)) return -1000;
    if (/es-cl|es_cl|chile|chileno|catalina/.test(blob)) s += 200;
    if (/es-mx|es_mx|mexico|méxico|mexicano|sabina|dalia|paulina/.test(blob)) s += 40;
    if (/es-co|colombia|salome/.test(blob)) s += 35;
    if (/es-ar|argentina|elena/.test(blob)) s += 30;
    if (/es-us|es_us|estados unidos|united states/.test(blob)) s += 28;
    if (/es-pe|es-ve|es-uy|es-ec|es-gt|es-cr|latino/.test(blob)) s += 24;
    if (/natural|neural|online/.test(name)) s += 22;
    if (/female|mujer|girl/.test(name)) s += 10;
    if (/es-es|españa|spain|castilian|helena|laura/.test(blob) && !/mx|mexico|latino/.test(blob)) s -= 120;
    if (/en-|english/.test(blob) && !/es/.test(lang)) s -= 300;
    if (/^es/.test(lang)) s += 12;
    return s;
  }

  function pickVoice() {
    const all = (typeof speechSynthesis !== 'undefined' && speechSynthesis.getVoices()) || [];
    if (!all.length) return cached;
    const ranked = all.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a));
    const best = ranked[0] && scoreVoice(ranked[0]) > 0 ? ranked[0] : ranked.find(v => /^es/i.test(v.lang));
    cached = best || null;
    return cached;
  }

  function tutorLine(text) {
    let t = String(text || '').replace(/\s+/g, ' ').trim();
    if (!t) return '';
    t = t.replace(/^Paso\s+(\d+)\.\s*/i, 'Paso $1. ');
    if (!/mira con calma|fíjate|con calma/i.test(t)) {
      t = t.replace(/^(Paso \d+\.\s*)/i, '$1Fíjate, con calma. ');
    }
    return t;
  }

  function parseVtt(text) {
    const cues = [];
    if (!text) return cues;
    const blocks = String(text).replace(/\r/g, '').split(/\n\n+/);
    for (const block of blocks) {
      const lines = block.split('\n').filter(Boolean);
      const time = lines.find(l => l.includes('-->'));
      if (!time) continue;
      const m = time.match(/(\d+):(\d+)(?:\.(\d+))?\s*-->\s*(\d+):(\d+)(?:\.(\d+))?/);
      if (!m) continue;
      const toSec = (mm, ss, ms) => Number(mm) * 60 + Number(ss) + Number(ms || 0) / 1000;
      const start = toSec(m[1], m[2], m[3]);
      const end = toSec(m[4], m[5], m[6]);
      const payload = lines.filter(l => l !== time && !/^WEBVTT/i.test(l) && !/^\d+$/.test(l)).join(' ').trim();
      if (payload) cues.push({start, end, text: payload});
    }
    return cues;
  }

  async function loadCues(video) {
    const track = video.querySelector('track');
    const src = track?.getAttribute('src');
    if (!src) return [];
    try {
      const res = await fetch(src);
      if (!res.ok) return [];
      return parseVtt(await res.text());
    } catch {
      return [];
    }
  }

  function speak(text, voice) {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    const line = tutorLine(text);
    if (!line) return;
    const chosen = voice || pickVoice();
    const u = new SpeechSynthesisUtterance(line);
    u.lang = 'es-CL';
    u.rate = 0.9;
    u.pitch = 1.08;
    u.volume = 1;
    if (chosen) u.voice = chosen;
    speechSynthesis.speak(u);
  }

  function bindVideo(video) {
    if (!video || video.dataset.narrateBound) return;
    video.dataset.narrateBound = '1';
    const figure = video.closest('figure') || video.parentElement;
    let cues = [];
    let last = '';
    let voiceOn = true;
    const cueEl = figure?.querySelector('.vis-voice-cue');
    const btn = figure?.querySelector('[data-voice="toggle"]');
    const setBtn = () => {
      if (!btn) return;
      btn.textContent = voiceOn ? 'Voz de Chile: encendida' : 'Voz de Chile: silenciada';
      btn.setAttribute('aria-pressed', String(voiceOn));
    };
    setBtn();
    btn?.addEventListener('click', () => {
      voiceOn = !voiceOn;
      if (!voiceOn) speechSynthesis.cancel();
      setBtn();
      if (voiceOn && !video.paused) tick();
    });
    loadCues(video).then(list => { cues = list; });
    const tick = () => {
      if (!voiceOn || video.paused) return;
      const t = video.currentTime || 0;
      const cue = cues.find(c => t >= c.start && t < c.end);
      const text = cue?.text || '';
      if (cueEl) cueEl.textContent = text;
      if (text && text !== last) {
        last = text;
        speak(text, pickVoice());
      }
    };
    video.addEventListener('play', () => { last = ''; pickVoice(); tick(); });
    video.addEventListener('pause', () => speechSynthesis.cancel());
    video.addEventListener('seeked', () => { last = ''; tick(); });
    video.addEventListener('timeupdate', tick);
    video.addEventListener('ended', () => speechSynthesis.cancel());
  }

  function hydrate(root) {
    (root || document).querySelectorAll('video').forEach(bindVideo);
  }

  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.addEventListener('voiceschanged', () => { cached = null; pickVoice(); });
  }

  window.AulaNarration = {hydrate, speak, pickVoice};
})();
