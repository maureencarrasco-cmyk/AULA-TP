'use strict';
(function () {
  const FIRST = ['Matías', 'Sofía', 'Benjamín', 'Isidora', 'Agustín', 'Florencia', 'Vicente', 'Josefa', 'Martín', 'Emilia', 'Tomás', 'Amanda', 'Lucas', 'Antonella', 'Diego', 'Constanza', 'Nicolás', 'Trinidad', 'Joaquín', 'Renata', 'Felipe', 'Maite', 'Cristóbal', 'Antonia', 'Ignacio', 'Javiera', 'Maximiliano', 'Catalina', 'Sebastián', 'Valentina'];
  const LAST = ['González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández', 'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela'];
  const MAX = { 1: 5, 2: 5, 3: 7, 4: 8, 5: 5 };
  const COUNTS = [
    ['none', 18],
    ['support-early', 32],
    ['support-low-lo', 16],
    ['support-low-hi', 16],
    ['watch-stations', 28],
    ['watch-score', 30],
    ['ok-solid', 24],
    ['ok-high', 36]
  ];

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function slug(name) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
  }
  function archetypeAt(index) {
    let cursor = 0;
    for (let i = 0; i < COUNTS.length; i++) {
      cursor += COUNTS[i][1];
      if (index < cursor) return COUNTS[i][0];
    }
    return 'ok-high';
  }
  function reachFor(kind, index) {
    if (kind === 'none') return 1;
    if (kind === 'support-early') return index % 2 ? 2 : 1;
    if (kind === 'support-low-lo') return 2;
    if (kind === 'support-low-hi') return 4;
    if (kind === 'watch-stations') return index % 2 ? 3 : 2;
    if (kind === 'watch-score') return index % 2 ? 5 : 3;
    if (kind === 'ok-solid') return 4;
    return 5;
  }
  function stationsFor(kind, rand) {
    if (kind === 'none') return 0;
    if (kind === 'support-early') return 1;
    if (kind === 'watch-stations') return rand() < 0.5 ? 2 : 3;
    if (kind === 'ok-high' || kind === 'support-low-hi') return 5;
    return rand() < 0.45 ? 4 : 5;
  }
  function examFor(kind, max, rand) {
    const band = kind === 'support-low-hi' || kind === 'support-low-lo' ? [35, 54]
      : kind === 'watch-score' ? [62, 78]
      : kind === 'ok-solid' ? [82, 92]
      : kind === 'ok-high' ? [88, 100]
      : null;
    if (!band) return null;
    const target = band[0] + rand() * (band[1] - band[0]);
    const options = [];
    for (let score = 0; score <= max; score++) {
      const percent = score / max * 100;
      const inSignal = (kind.indexOf('support-low') === 0 && percent < 60)
        || (kind === 'watch-score' && percent >= 60 && percent < 80)
        || (kind.indexOf('ok') === 0 && percent >= 80);
      if (inSignal) options.push({ score, percent });
    }
    const inside = options.filter(item => item.percent >= band[0] && item.percent <= band[1]);
    const pool = inside.length ? inside : options;
    pool.sort((a, b) => Math.abs(a.percent - target) - Math.abs(b.percent - target));
    return { score: pool[0].score, max_score: max, review: null };
  }
  function practiceTotal(kind, index) {
    if (kind === 'none') return 0;
    if (kind === 'support-early') return 1;
    if (kind === 'ok-solid' || kind === 'support-low-lo') return 3;
    if (kind === 'watch-score') return index % 2 ? 4 : 12;
    if (kind === 'watch-stations') return 6;
    if (kind === 'support-low-hi') return 14;
    return 16;
  }
  function trendFor(kind, index) {
    if (kind === 'ok-high' || (kind === 'watch-score' && index % 2 === 0)) return 1;
    if (kind === 'support-low-hi' || kind === 'support-low-lo') return -1;
    return 0;
  }

  function build(modules) {
    const rand = rng(20260927);
    const records = [];
    for (let i = 0; i < 200; i++) {
      const kind = archetypeAt(i);
      const name = `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length)]}`;
      const email = `${slug(name)}.${i + 1}@demo.aulatp.cl`;
      const reach = reachFor(kind, i);
      const stations = stationsFor(kind, rand);
      const totalPractice = practiceTotal(kind, i);
      const trend = trendFor(kind, i);
      const longSeries = kind === 'ok-high' || kind === 'ok-solid' || kind === 'watch-score' || kind === 'support-low-hi' || kind === 'support-low-lo';
      const weeks = kind === 'none' ? 0 : longSeries ? 12 : 4;
      let remaining = totalPractice;
      for (let pos = 1; pos <= reach; pos++) {
        const module = (modules || []).find(item => Number(item.position) === pos);
        if (!module) continue;
        const left = reach - pos + 1;
        const practiceCount = pos === reach ? remaining : Math.floor(remaining / left);
        remaining -= practiceCount;
        const series = [];
        const driftStep = trend > 0 ? 3.1 : trend < 0 ? -1.8 : 0;
        const base = kind === 'ok-high' ? 62 : kind === 'support-low-hi' ? 42 : 52;
        for (let week = 1; week <= weeks; week++) {
          const noise = (rand() - 0.5) * (trend === 0 ? 6 : 10);
          series.push({ week, score: Math.round(clamp(base + driftStep * (week - 1) + noise, 8, 100)) });
        }
        const exam = examFor(kind, MAX[pos], rand);
        const aes = module.aes || [];
        const ae = {};
        const aeMeta = {};
        if (kind !== 'none') {
          aes.forEach((item, index) => {
            const last = aes.length > 1 && index === aes.length - 1;
            const fill = kind === 'support-early'
              ? index === 0 && i % 3 === 0
              : kind === 'watch-stations'
                ? index === 0
                : kind === 'ok-high' || !last;
            if (!fill) return;
            ae[`${index}-0`] = 'Paso registrado en la cohorte de demostración.';
            aeMeta[`${index}-0`] = { attempts: 1 + Math.floor(rand() * 3) };
          });
        }
        const code = (aes[0] && aes[0].code) || `M${pos}`;
        const oficio = practiceCount > 0 ? {
          video: {
            kind: 'video',
            paso: code,
            text: `Práctica de demostración asociada a ${code}.`,
            graded: kind === 'ok-high' || kind === 'ok-solid' || kind === 'watch-score',
            station: Math.min(Math.max(stations, 1), 3),
            ae: code
          }
        } : {};
        const encargos = {};
        const extra = Math.max(0, Math.min(3, practiceCount - (practiceCount > 0 ? 1 : 0)));
        for (let k = 0; k < extra; k++) {
          const aeCode = aes[k % Math.max(aes.length, 1)] ? aes[k % aes.length].code : code;
          encargos['e' + k] = { title: `Encargo ${k + 1}`, station: Math.max(stations, 1), ae: aeCode, text: 'Entrega de demostración.', minutes: 20 };
        }
        records.push({
          name,
          email,
          demo: true,
          practiceCount,
          title: module.title,
          position: pos,
          module_id: module.id,
          percent: stations * 20,
          state: {
            ae,
            ae_meta: aeMeta,
            oficio,
            encargos,
            exam,
            closed: stations >= 5,
            context: stations > 0,
            series,
            trace: stations > 0 ? [{ kind: 'context' }, { kind: 'oficio', station: 1 }] : []
          }
        });
      }
    }
    return records;
  }

  window.AulaCohort = { build, size: 200 };
})();
