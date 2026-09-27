'use strict';
(function () {
  const FIRST = ['Matías', 'Sofía', 'Benjamín', 'Isidora', 'Agustín', 'Florencia', 'Vicente', 'Josefa', 'Martín', 'Emilia', 'Tomás', 'Amanda', 'Lucas', 'Antonella', 'Diego', 'Constanza', 'Nicolás', 'Trinidad', 'Joaquín', 'Renata', 'Felipe', 'Maite', 'Cristóbal', 'Antonia', 'Ignacio', 'Javiera', 'Maximiliano', 'Catalina', 'Sebastián', 'Valentina'];
  const LAST = ['González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández', 'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela'];
  const MAX = { 1: 5, 2: 5, 3: 7, 4: 8, 5: 5 };

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

  function build(modules) {
    const rand = rng(20260927);
    const records = [];
    for (let i = 0; i < 200; i++) {
      const name = `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length)]}`;
      const email = `${slug(name)}.${i + 1}@demo.aulatp.cl`;
      const skill = clamp(0.28 + rand() * 0.62, 0.18, 0.97);
      const reach = 1 + Math.floor(rand() * rand() * 5);
      const trend = rand() < 0.5 ? 1 : rand() < 0.78 ? 0 : -1;
      for (let pos = 1; pos <= Math.max(1, reach); pos++) {
        const module = (modules || []).find(item => Number(item.position) === pos);
        if (!module) continue;
        const local = clamp(skill - (pos - 1) * 0.05 + (rand() - 0.5) * 0.1, 0.1, 0.99);
        let stations = 1;
        if (local >= 0.72) stations = rand() < 0.6 ? 5 : 4;
        else if (local >= 0.48) stations = rand() < 0.5 ? 3 : 2;
        const practiceCount = stations === 1 && local < 0.3 ? 1 + Math.floor(rand() * 3) : Math.max(1, Math.round(local * 12 + rand() * 4));
        const weeks = practiceCount >= 8 ? 12 : Math.max(2, Math.min(7, practiceCount));
        const series = [];
        for (let week = 1; week <= weeks; week++) {
          const drift = trend * (week - 1) * 2.4;
          const noise = (rand() - 0.5) * 12;
          series.push({ week, score: Math.round(clamp(local * 100 + drift + noise, 8, 100)) });
        }
        const max = MAX[pos];
        const exam = stations >= 4 ? { score: Math.max(0, Math.min(max, Math.round(local * max))), max_score: max, review: null } : null;
        const aes = module.aes || [];
        const ae = {};
        const aeMeta = {};
        const filled = stations >= 2 ? Math.min(aes.length, 1 + Math.floor(rand() * Math.max(aes.length, 1))) : (rand() < 0.25 ? 1 : 0);
        for (let index = 0; index < filled; index++) {
          ae[`${index}-0`] = 'Paso registrado en la cohorte de demostración.';
          aeMeta[`${index}-0`] = { attempts: 1 + Math.floor(rand() * 4) };
        }
        const code = (aes[0] && aes[0].code) || `M${pos}`;
        const oficio = {
          video: {
            kind: 'video',
            paso: code,
            text: `Práctica de demostración asociada a ${code}.`,
            graded: stations >= 4,
            station: Math.min(Math.max(stations, 1), 3),
            ae: code
          }
        };
        const encargos = {};
        const extra = Math.max(0, Math.min(3, practiceCount - 1));
        for (let k = 0; k < extra; k++) {
          const aeCode = aes[k % Math.max(aes.length, 1)] ? aes[k % aes.length].code : code;
          encargos['e' + k] = { title: `Encargo ${k + 1}`, station: 2, ae: aeCode, text: 'Entrega de demostración.', minutes: 20 };
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
          state: { ae, ae_meta: aeMeta, oficio, encargos, exam, closed: stations >= 5, context: true, series, trace: [{ kind: 'oficio', station: 1 }, { kind: 'context' }] }
        });
      }
    }
    return records;
  }

  window.AulaCohort = { build, size: 200 };
})();
