'use strict';
/* Voz oficial Aula TP. Un perfil. Un ID. La misma persona en todo el campus. */
(function () {
  const STORE = 'aula-tp-voice-master-v1';
  const PROFILE = {
    id: 'aula-tp-voice-master',
    name: 'Voz oficial Aula TP',
    lang: 'es-CL',
    rate: 0.88,
    pitch: 1.02,
    volume: 0.92,
    rule: 'Una persona experta que te acompaña a resolver una situación profesional.'
  };
  const INTENT = {
    mission: {rate: 0.86, pitch: 1.03},
    instruction: {rate: 0.88, pitch: 1.02},
    hint: {rate: 0.87, pitch: 1.03},
    error: {rate: 0.85, pitch: 1.0},
    success: {rate: 0.89, pitch: 1.04},
    feedback: {rate: 0.86, pitch: 1.01}
  };

  let cached = null;
  let queue = [];

  function loadLock() {
    try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch { return null; }
  }
  function saveLock(voice) {
    if (!voice) return;
    const rec = {voiceURI: voice.voiceURI, name: voice.name, lang: voice.lang, lockedAt: new Date().toISOString()};
    try { localStorage.setItem(STORE, JSON.stringify(rec)); } catch { /* ignore quota */ }
  }

  function scoreVoice(v) {
    const lang = String(v.lang || '').toLowerCase();
    const name = String(v.name || '').toLowerCase();
    const blob = lang + ' ' + name;
    let s = 0;
    if (!/es/.test(blob) && !/spanish|español/.test(name)) return -1000;
    if (/child|niñ|kid|junior/.test(name)) s -= 400;
    if (/es-cl|es_cl|chile|chileno|catalina/.test(blob)) s += 240;
    if (/es-mx|es_mx|mexico|méxico|mexicano|sabina|dalia|paulina/.test(blob)) s += 48;
    if (/es-co|colombia|salome/.test(blob)) s += 40;
    if (/es-ar|argentina|elena/.test(blob)) s += 32;
    if (/es-us|es_us/.test(blob)) s += 30;
    if (/es-pe|es-ve|es-uy|es-ec|es-gt|es-cr|latino/.test(blob)) s += 26;
    if (/natural|neural|online|premium/.test(name)) s += 24;
    if (/female|mujer|woman|sabina|dalia|paulina|catalina|salome|elena/.test(name)) s += 80;
    if (/raul|jorge|pablo|diego|male|hombre|man/.test(name) && !/female|mujer|sabina|dalia|paulina|catalina/.test(name)) s -= 50;
    if (/es-es|españa|spain|castilian|helena|laura/.test(blob) && !/mx|mexico|latino|cl/.test(blob)) s -= 140;
    if (/en-|english/.test(blob) && !/es/.test(lang)) s -= 300;
    if (/^es/.test(lang)) s += 12;
    return s;
  }

  function voices() {
    return (typeof speechSynthesis !== 'undefined' && speechSynthesis.getVoices()) || [];
  }

  function pickVoice() {
    const all = voices();
    if (!all.length) return cached;
    const ranked = all.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a));
    const best = ranked[0] && scoreVoice(ranked[0]) > 0 ? ranked[0] : ranked.find(v => /^es/i.test(v.lang));
    const lock = loadLock();
    if (lock && lock.voiceURI) {
      const kept = all.find(v => v.voiceURI === lock.voiceURI) || all.find(v => v.name === lock.name && /^es/i.test(v.lang));
      if (kept && best && scoreVoice(best) >= scoreVoice(kept) + 20) {
        cached = best;
        saveLock(best);
        return best;
      }
      if (kept) {
        cached = kept;
        return kept;
      }
    }
    cached = best || null;
    if (cached) saveLock(cached);
    return cached;
  }

  function lockVoice(voice) {
    cached = voice || pickVoice();
    if (cached) saveLock(cached);
    return cached;
  }

  function shapeLine(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function sentences(text) {
    const line = shapeLine(text);
    if (!line) return [];
    const parts = line.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
    return parts.length ? parts : [line];
  }

  function applyTo(utt, intent, rateScale) {
    const chosen = pickVoice();
    const mood = INTENT[intent] || INTENT.instruction;
    const scale = Number(rateScale);
    utt.lang = PROFILE.lang;
    utt.rate = Math.max(0.78, Math.min(1.02, mood.rate * (Number.isFinite(scale) && scale > 0 ? scale : 1)));
    utt.pitch = mood.pitch;
    utt.volume = PROFILE.volume;
    if (chosen) utt.voice = chosen;
    return utt;
  }

  function speakNext() {
    if (typeof speechSynthesis === 'undefined') return;
    const item = queue[0];
    if (!item) return;
    const u = new SpeechSynthesisUtterance(item.text);
    applyTo(u, item.intent);
    u.onend = () => {
      queue.shift();
      if (queue.length) setTimeout(speakNext, 220);
    };
    u.onerror = () => {
      queue.shift();
      if (queue.length) speakNext();
    };
    speechSynthesis.speak(u);
  }

  function speak(text, opts) {
    if (typeof speechSynthesis === 'undefined') return;
    const options = opts && typeof opts === 'object' && !opts.voiceURI ? opts : {intent: 'instruction'};
    const intent = options.intent || 'instruction';
    const parts = sentences(text);
    if (!parts.length) return;
    speechSynthesis.cancel();
    queue = parts.map(t => ({text: t, intent}));
    speakNext();
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
      btn.textContent = voiceOn ? 'Voz Aula TP: encendida' : 'Voz Aula TP: silenciada';
      btn.setAttribute('aria-pressed', String(voiceOn));
    };
    setBtn();
    btn?.addEventListener('click', () => {
      voiceOn = !voiceOn;
      if (!voiceOn) {
        speechSynthesis.cancel();
        queue = [];
      }
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
        speak(text, {intent: 'instruction'});
      }
    };
    video.addEventListener('play', () => { last = ''; pickVoice(); tick(); });
    video.addEventListener('pause', () => { speechSynthesis.cancel(); queue = []; });
    video.addEventListener('seeked', () => { last = ''; tick(); });
    video.addEventListener('timeupdate', tick);
    video.addEventListener('ended', () => { speechSynthesis.cancel(); queue = []; });
  }

  function hydrate(root) {
    (root || document).querySelectorAll('video').forEach(bindVideo);
  }

  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.addEventListener('voiceschanged', () => {
      const lock = loadLock();
      cached = null;
      pickVoice();
      if (lock && lock.voiceURI && cached && cached.voiceURI !== lock.voiceURI) {
        const again = voices().find(v => v.voiceURI === lock.voiceURI);
        if (again) cached = again;
      }
    });
  }

  window.AulaNarration = {
    hydrate,
    speak,
    pickVoice,
    lockVoice,
    applyTo,
    profile: PROFILE,
    storeKey: STORE
  };
})();
