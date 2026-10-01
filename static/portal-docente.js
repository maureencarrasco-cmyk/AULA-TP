'use strict';
const ICONS = {
  resumen: 'M3 10.5 10 4l7 6.5M5 9v7h10V9M8 16v-4h4v4',
  cursos: 'M3 6.5 10 4l7 2.5-7 2.5L3 6.5Zm2 3.5v3.5c2.7 2 7.3 2 10 0V10',
  estudiantes: 'M6.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 16c.3-3 2-4.5 4-4.5S10.2 13 10.5 16M9.5 16c.3-3 2-4.5 4-4.5s3.7 1.5 4 4.5',
  'oa-ae': 'M5 3.5h8l2.5 2.5v10.5H5V3.5Zm8 0V6h2.5M8 9h5M8 12h5M8 15h3',
  cumplimiento: 'M10 3.5 16 6v4.5c0 3.5-2.3 5.8-6 7-3.7-1.2-6-3.5-6-7V6l6-2.5Zm-2.5 6.5 1.7 1.7 3.5-3.5',
  reportes: 'M4 16V9h3v7H4Zm4.5 0V5h3v11h-3Zm4.5 0v-4h3v4h-3Z'
};
const TABS = [
  { id: 'resumen', path: '/portal-docente', label: 'Panel general', question: '¿Qué está ocurriendo actualmente en mi curso?' },
  { id: 'cursos', path: '/portal-docente/cursos', label: 'Cursos / Planificación', question: '¿Qué estamos trabajando y qué debería estar ocurriendo?' },
  { id: 'estudiantes', path: '/portal-docente/estudiantes', label: 'Estudiantes', question: '¿Cómo está cada estudiante y quién necesita mayor apoyo?' },
  { id: 'oa-ae', path: '/portal-docente/oa-ae', label: 'OA, AE y criterios de evaluación', question: '¿Qué aprendizajes se están desarrollando y cuáles requieren más atención?' },
  { id: 'cumplimiento', path: '/portal-docente/cumplimiento', label: 'Cumplimiento', question: '¿Cuánto del proceso formativo se ha realizado?' },
  { id: 'reportes', path: '/portal-docente/reportes', label: 'Reportes', question: '¿Qué información necesito consolidar o comunicar?' }
];
const PHOTOS = {
  1: ['/static/themes/route/climate-2.webp', 'Planos de instalación, escalímetro, casco y un equipo split de muestra en un taller de refrigeración.'],
  2: ['/static/themes/route/climate-1.webp', 'Taller de refrigeración con manifold, herramientas, casco y equipos split.'],
  3: ['/static/themes/route/climate-3.webp', 'Taller con tableros de tuberías de cobre, unidades de climatización y herramientas.'],
  4: ['/static/themes/route/climate-4.webp', 'Compresor, manifold y unidades de climatización en un banco de taller.'],
  5: ['/static/themes/oficio/oficio-equipo-ctrl.webp', 'Unidad exterior con placa de datos del refrigerante, termostato en modo frío y cinta que marca el espacio de acceso.']
};
const HEAD = {
  resumen: PHOTOS[2],
  cursos: PHOTOS[1],
  estudiantes: ['/static/themes/student-electricity-workshop.png', 'Estudiantes de enseñanza media trabajando juntos en un taller técnico.', '28% center'],
  'oa-ae': PHOTOS[4],
  cumplimiento: PHOTOS[5],
  reportes: PHOTOS[2]
};
const state = { courses: [], teacher: null, user: null, q: '' };

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function currentTab() {
  const path = location.pathname.replace(/\/$/, '') || '/portal-docente';
  return TABS.find(tab => tab.path === path) || TABS[0];
}
function query() { return state.q.trim().toLowerCase(); }
function fiveCourse() {
  return (state.courses || []).find(course => /refrigeraci[oó]n y climatizaci[oó]n/i.test(course.title || '')) || null;
}
function fiveModules() {
  const course = fiveCourse();
  return ((course && course.modules) || [])
    .filter(module => Number(module.position) >= 1 && Number(module.position) <= 5)
    .sort((a, b) => Number(a.position) - Number(b.position))
    .slice(0, 5);
}
function moduleById(id) {
  return fiveModules().find(module => String(module.id) === String(id)) || null;
}
function moduleMatches(module, q) {
  return `${module.position} ${module.title} ${(module.oa || []).join(' ')}`.toLowerCase().includes(q);
}
function recordMatches(record, q) {
  return `${record.name || ''} ${record.title || ''} ${record.position || ''}`.toLowerCase().includes(q);
}
function baseRecords() {
  const ids = new Set(fiveModules().map(module => String(module.id)));
  return ((state.teacher && state.teacher.records) || []).filter(record => ids.has(String(record.module_id)));
}
function scopedModules() {
  const q = query();
  const all = fiveModules();
  if (!q) return all;
  const matched = all.filter(module => moduleMatches(module, q));
  if (matched.length) return matched;
  const ids = new Set(scopedRecords().map(record => String(record.module_id)));
  return all.filter(module => ids.has(String(module.id)));
}
function scopedRecords() {
  const q = query();
  const all = fiveModules();
  const matched = q ? all.filter(module => moduleMatches(module, q)) : all;
  const pool = matched.length ? matched : all;
  const ids = new Set(pool.map(module => String(module.id)));
  return baseRecords().filter(record => ids.has(String(record.module_id)) && (!q || recordMatches(record, q) || matched.length));
}
function href(path) {
  const q = state.q.trim();
  return q ? `${path}?q=${encodeURIComponent(q)}` : path;
}
function nav() {
  const tab = currentTab();
  const links = TABS.map(item => `<a href="${href(item.path)}" class="${item.id === tab.id ? 'is-active' : ''}" ${item.id === tab.id ? 'aria-current="page"' : ''}><span class="pd-ico ${item.id}" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="${ICONS[item.id]}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>${esc(item.label)}</span></a>`).join('');
  document.getElementById('pd-nav').innerHTML = links;
  document.getElementById('pd-mobile').innerHTML = links;
}
function courseTitle() {
  const course = fiveCourse();
  return (course && course.title) || 'Refrigeración y Climatización';
}
function orientFacts() {
  const rows = scopedRecords();
  const mods = scopedModules();
  const facts = [
    ['Curso', courseTitle()],
    ['Alcance', 'Módulos 1 a 5'],
    ['Periodo', state.cohort ? '12 semanas de demostración' : 'Estado actual'],
    ['Estudiantes', state.cohort ? '200, cohorte de demostración' : 'Registros del campus'],
    ['Registros', `${rows.length} en ${mods.length} módulo${mods.length === 1 ? '' : 's'}`]
  ];
  return `<dl class="pd-facts">${facts.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
}
function orient(lead, extra) {
  const more = extra ? `<div class="pd-orient-extra">${extra}</div>` : '';
  return `<p class="pd-orient-lead">${lead}</p>${more}${orientFacts()}`;
}
function spotlight(lead, pairs, rest) {
  const facts = (pairs || []).length
    ? `<dl class="pd-facts">${pairs.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(String(value))}</dd></div>`).join('')}</dl>`
    : '';
  const more = rest ? `<div class="pd-orient-extra">${rest}</div>` : '';
  return `<p class="pd-orient-lead">${lead}</p>${facts}${more}`;
}
function frame(body) {
  const tab = currentTab();
  const photo = HEAD[tab.id] || PHOTOS[2];
  const pos = photo[2] ? ` style="object-position:${photo[2]}"` : '';
  return `<header class="pd-pagehead"><div class="pd-pagehead-copy"><p class="pd-kicker-page">${esc(tab.label)}</p><h1>${esc(tab.question)}</h1></div><div class="pd-pagehead-photo"><img src="${photo[0]}" alt="${esc(photo[1])}"${pos}></div></header><div class="pd-board">${body}</div>`;
}
function quad(index, tone, kicker, title, body, flags) {
  const options = flags || {};
  const lead = options.lead ? ' lead' : '';
  const wide = options.wide ? ' wide' : '';
  const n = String(index).padStart(2, '0');
  return `<section class="pd-quad q-${tone}${lead}${wide}" aria-label="${esc(title)}"><p class="pd-kicker"><span>${n}</span> ${esc(kicker)}</p><h2>${esc(title)}</h2><div class="pd-quad-body">${body}</div></section>`;
}
function stations(record) { return Math.round(Number(record.percent || 0) / 20); }
function logro(record) {
  const exam = (record.state || {}).exam;
  if (!exam || exam.score == null || exam.max_score == null) return null;
  const max = Number(exam.max_score);
  if (!max) return null;
  return Math.round(Number(exam.score) / max * 100);
}
function aeSteps(record) { return Object.keys(((record.state || {}).ae) || {}).length; }
function practiceEntries(record) {
  const saved = record.state || {};
  const items = [];
  Object.entries(saved.oficio || {}).forEach(([id, item]) => {
    if (!item || typeof item !== 'object') return;
    items.push({ kind: 'Oficio', id, paso: item.paso || '', station: item.station, text: item.text || '', graded: item.graded, ae: item.ae || '' });
  });
  Object.entries(saved.encargos || {}).forEach(([id, item]) => {
    if (!item || typeof item !== 'object') return;
    items.push({ kind: 'Encargo', id, paso: item.title || '', station: item.station, text: item.text || '', graded: null, ae: item.ae || '', minutes: item.minutes });
  });
  return items;
}
function practica(record) {
  if (record.practiceCount != null) return Number(record.practiceCount);
  return practiceEntries(record).length;
}
function attempts(record) {
  return Object.values((record.state || {}).ae_meta || {}).reduce((sum, item) => sum + Number((item && item.attempts) || 0), 0);
}
function traceLine(record) {
  const trace = (record.state || {}).trace;
  if (!Array.isArray(trace) || !trace.length) return '';
  return trace.map(event => `${event.kind || 'registro'}${event.station != null ? ` estación ${event.station}` : ''}`).join(' → ');
}
function practiceSummary(entries) {
  if (!entries.length) return 'Sin práctica registrada';
  return entries.map(item => {
    const paso = item.paso ? ` · ${item.paso}` : '';
    const station = item.station != null ? ` · estación ${item.station}` : '';
    const grade = item.graded === false ? ' · sin calificación' : item.graded === true ? ' · calificado' : '';
    const ae = item.ae ? ` · ${item.ae}` : '';
    return `${item.kind}${paso}${station}${grade}${ae}`;
  }).join('; ');
}
function signal(record) {
  const done = stations(record);
  const score = logro(record);
  if (done === 0 && aeSteps(record) === 0 && score == null) {
    return { level: 'none', label: 'Sin recorrido', reasons: ['No hay estaciones, pasos de AE ni evaluación de selección en este registro.'] };
  }
  const support = [];
  if (done > 0 && done < 2) support.push(`${done} de 5 estaciones del recorrido.`);
  if (score != null && score < 60) support.push(`Logro de la evaluación de selección: ${score} %.`);
  if (support.length && (done < 2 || (score != null && score < 60))) return { level: 'support', label: 'Requiere mayor apoyo', reasons: support };
  const watch = [];
  if (done >= 2 && done <= 3) watch.push(`${done} de 5 estaciones.`);
  if (score != null && score >= 60 && score < 80) watch.push(`Logro de selección ${score} %. Conviene observar ese resultado.`);
  if (done >= 4 && score == null) watch.push('La evaluación está marcada, pero no hay puntaje.');
  if (watch.length) return { level: 'watch', label: 'Conviene observar', reasons: watch };
  const ok = [`${done} de 5 estaciones.`];
  if (score != null) ok.push(`Logro de selección ${score} %.`);
  return { level: 'ok', label: 'Progreso esperado', reasons: ok };
}
function signalMark(item) {
  return `<span class="pd-signal ${item.level}">${esc(item.label)}</span>`;
}
function mean(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function pct(value) { return value == null ? '—' : `${Math.round(value)} %`; }
function modeOf(values) {
  const counts = new Map();
  values.forEach(value => {
    const rounded = Math.round(value);
    counts.set(rounded, (counts.get(rounded) || 0) + 1);
  });
  let best = 0;
  counts.forEach(count => { if (count > best) best = count; });
  if (best < 2) return null;
  const valuesAtBest = [...counts.entries()].filter(([, count]) => count === best).map(([value]) => value).sort((a, b) => a - b);
  return { values: valuesAtBest, count: best };
}
function stdev(values) {
  if (values.length < 2) return null;
  const avg = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1));
}
function central(values, noun) {
  const who = noun.indexOf('logro') >= 0 ? 'estudiante' : 'registro';
  if (values.length < 2) {
    const only = values.length === 1 ? ` Hay un solo dato: ${Math.round(values[0])} %.` : '';
    return `<p class="pd-interp">Con menos de dos datos no hay promedio ni valor del medio.${only}</p>`;
  }
  const avgR = Math.round(mean(values));
  const midR = Math.round(median(values));
  const spread = values.length >= 8 ? stdev(values) : null;
  const spreadR = spread == null ? null : Math.round(spread);
  const mode = modeOf(values);
  const modeText = !mode ? '—' : mode.values.length > 2 ? 'Varias' : mode.values.map(value => `${value} %`).join(' y ');
  const modeHint = !mode ? 'Ningún valor se repite más que otro.' : mode.values.length > 2 ? 'Hay varios resultados igual de frecuentes.' : `Se repite ${mode.count} veces.`;
  let spreadValue = '—';
  let spreadHint = 'Hacen falta al menos 8 datos.';
  if (spreadR != null && spreadR < 8) { spreadValue = `${spreadR} pts`; spreadHint = 'Pequeña: datos más agrupados.'; }
  else if (spreadR != null && spreadR < 12) { spreadValue = `${spreadR} pts`; spreadHint = 'Moderada.'; }
  else if (spreadR != null) { spreadValue = `${spreadR} pts`; spreadHint = 'Grande: datos más dispersos.'; }
  let result;
  if (midR > avgR + 3) result = `El ${who} del medio está en ${midR} %. El promedio baja a ${avgR} % por unos pocos resultados bajos.`;
  else if (avgR > midR + 3) result = `El ${who} del medio está en ${midR} %. El promedio sube a ${avgR} % por unos pocos resultados altos.`;
  else result = `Promedio y ${who} del medio coinciden, cerca de ${avgR} %.`;
  if (mode && mode.values.length === 1) result += ` Lo más frecuente es ${mode.values[0]} %.`;
  else if (mode && mode.values.length === 2) result += ` Lo más frecuente son ${mode.values[0]} % y ${mode.values[1]} %.`;
  const spreadLine = spreadR == null ? ' Son pocos datos para ver si el curso está parejo.' : spreadR < 8 ? ' El curso está parejo.' : spreadR < 12 ? ' Hay diferencias moderadas: el promedio no describe a cada uno.' : ' Hay diferencias grandes: un solo porcentaje no representa al curso.';
  const cards = [
    ['media', 'Media → promedio', `${avgR} %`, 'Valor representativo del conjunto.'],
    ['mediana', 'Mediana → centro', `${midR} %`, 'Divide los datos en dos partes iguales.'],
    ['moda', 'Moda → más frecuente', modeText, modeHint],
    ['de', 'Desviación → dispersión', spreadValue, spreadHint]
  ];
  const grid = `<div class="pd-measures">${cards.map(([kind, label, value, hint]) => `<article class="pd-measure m-${kind}"><p>${label}</p><b>${value}</b><span>${hint}</span></article>`).join('')}</div>`;
  const example = '<p class="pd-example"><strong>Ejemplo.</strong> Notas 4, 5, 5, 6 y 10: media 6, mediana 5, moda 5. La desviación es alta porque el 10 está alejado del resto.</p>';
  return `<p class="pd-orient-lead">${result}</p>${grid}<p class="pd-interp">${spreadLine.trim()}</p>${example}`;
}
function bars(items, meta) {
  const info = meta || {};
  const rows = items.map(item => {
    const value = Math.max(0, Math.min(100, Math.round(item.value)));
    return `<div class="pd-bar"><span>${esc(item.label)}</span><div class="pd-track"><div class="pd-fill" style="width:${value}%"></div></div><strong>${value} %</strong></div>`;
  }).join('');
  const title = info.title ? `<figcaption class="pd-chart-title">${esc(info.title)}</figcaption>` : '';
  const axes = (info.y || info.x)
    ? `<p class="pd-axis-summary"><span><b>Eje vertical:</b> ${esc(info.y || 'Categoría')}</span><span><b>Eje horizontal:</b> ${esc(info.x || 'Valor')}</span></p>`
    : '';
  const aria = `${info.title || 'Gráfico de barras'}. Eje vertical: ${info.y || 'Categoría'}. Eje horizontal: ${info.x || 'Valor'}.`;
  return `<figure class="pd-figure">${title}${axes}<div class="pd-bars" role="img" aria-label="${esc(aria)}">${rows}</div></figure>`;
}
function chartSvg(w, h, title, body) {
  return `<svg class="pd-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}" font-family="Segoe UI, Arial, sans-serif"><title>${esc(title)}</title><text x="${w / 2}" y="22" text-anchor="middle" font-size="15" font-weight="700" fill="#143a78">${esc(title)}</text>${body}</svg>`;
}
function percentFrame(w, h, yName, xName, xTicks, sx) {
  const left = 86, right = 22, top = 42, bottom = 52;
  const sy = y => top + (1 - y / 100) * (h - top - bottom);
  const grid = [0, 25, 50, 75, 100].map(value => {
    const y = sy(value);
    return `<line x1="${left}" y1="${y}" x2="${w - right}" y2="${y}" stroke="#e4eef8"></line><text x="${left - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#5e7596">${value} %</text>`;
  }).join('');
  const labels = xTicks.map(value => `<text x="${sx(value)}" y="${h - bottom + 18}" text-anchor="middle" font-size="11" fill="#5e7596">${esc(value)}</text>`).join('');
  const midY = top + (h - top - bottom) / 2;
  const midX = left + (w - left - right) / 2;
  const axis = `<line x1="${left}" y1="${top}" x2="${left}" y2="${h - bottom}" stroke="#8aa4c4"></line><line x1="${left}" y1="${h - bottom}" x2="${w - right}" y2="${h - bottom}" stroke="#8aa4c4"></line>`;
  const names = `<text x="0" y="0" text-anchor="middle" font-size="12" fill="#3d5270" transform="translate(16, ${midY}) rotate(-90)">${esc(yName)}</text><text x="${midX}" y="${h - 12}" text-anchor="middle" font-size="12" fill="#3d5270">${esc(xName)}</text>`;
  return { left, right, top, bottom, sy, marks: `${grid}${labels}${axis}${names}` };
}
function linreg(points) {
  const n = points.length;
  if (n < 8) return null;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  points.forEach(point => { sx += point.x; sy += point.y; sxx += point.x * point.x; sxy += point.x * point.y; });
  const den = n * sxx - sx * sx;
  if (!den) return null;
  const slope = (n * sxy - sx * sy) / den;
  return { n, slope, intercept: (sy - slope * sx) / n };
}
function weeklyPoints(records) {
  const buckets = [];
  records.forEach(record => {
    ((record.state || {}).series || []).forEach(point => {
      const index = point.week - 1;
      if (index < 0) return;
      buckets[index] = buckets[index] || [];
      buckets[index].push(point.score);
    });
  });
  return buckets.map((values, index) => values && values.length >= 8 ? { x: index + 1, y: mean(values), n: values.length } : null).filter(Boolean);
}
function trendWord(points) {
  if (!points || points.length < 8) return 'Sin serie suficiente';
  const start = mean(points.slice(0, 3).map(point => point.y));
  const end = mean(points.slice(-3).map(point => point.y));
  if (end > start + 4) return '↑ mejora';
  if (start > end + 4) return '↓ descenso';
  return '→ estable';
}
function lineChart(points, title) {
  if (!points.length) return spotlight('No hay una serie semanal con suficientes observaciones comparables.');
  const reg = linreg(points);
  const w = 680, h = 320;
  const xs = points.map(point => point.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const plotMax = reg ? maxX + 1 : maxX;
  const left = 86, right = 22;
  const sx = x => left + ((x - minX) / Math.max(1, plotMax - minX)) * (w - left - right);
  const weeks = [];
  for (let week = minX; week <= plotMax; week += 1) weeks.push(week);
  const drawn = percentFrame(w, h, 'Desempeño medio (%)', 'Semana', weeks, sx);
  const sy = drawn.sy;
  const observed = points.map(point => `${sx(point.x)},${sy(point.y)}`).join(' ');
  const dots = points.map(point => `<circle cx="${sx(point.x)}" cy="${sy(point.y)}" r="3.5" fill="#4d7eb8"><title>Semana ${point.x}: ${Math.round(point.y)} %</title></circle>`).join('');
  let trend = '';
  let note = 'Menos de 8 observaciones comparables: no se traza regresión.';
  if (reg) {
    const y1 = reg.intercept + reg.slope * minX;
    const y2 = reg.intercept + reg.slope * maxX;
    trend = `<line x1="${sx(minX)}" y1="${sy(y1)}" x2="${sx(maxX)}" y2="${sy(y2)}" stroke="#c9843a" stroke-width="2"></line>`;
    const next = maxX + 1;
    const projected = Math.max(0, Math.min(100, reg.intercept + reg.slope * next));
    trend += `<line x1="${sx(maxX)}" y1="${sy(y2)}" x2="${sx(next)}" y2="${sy(projected)}" stroke="#c9843a" stroke-width="2" stroke-dasharray="5 4"></line>`;
    const direction = reg.slope > 0.4 ? 'ascendente' : reg.slope < -0.4 ? 'descendente' : 'estable';
    note = `La tendencia es ${direction}, con ${reg.n} semanas comparables. La línea continua resume lo observado. El tramo punteado estima la semana siguiente: no es un resultado ya obtenido.`;
  }
  const svg = chartSvg(w, h, title, `${drawn.marks}<polyline fill="none" stroke="#4d7eb8" stroke-width="2" points="${observed}"></polyline>${dots}${trend}`);
  return spotlight(note, [['Semanas', String(points.length)], ['Evolución', trendWord(points)]], svg);
}
function pieChart(parts, title) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  let angle = -Math.PI / 2;
  const r = 68, cx = 90, cy = 90;
  const paths = parts.filter(part => part.value > 0).map(part => {
    const slice = total ? (part.value / total) * Math.PI * 2 : 0;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += slice;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = slice > Math.PI ? 1 : 0;
    return `<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${part.color}"></path>`;
  }).join('');
  const legend = parts.map(part => `<li><i class="pd-swatch" style="background:${part.color}"></i>${esc(part.label)}: ${part.value} (${total ? Math.round(part.value / total * 100) : 0} %)</li>`).join('');
  return `<figure class="pd-figure"><figcaption class="pd-chart-title">${esc(title)}</figcaption><div class="pd-pie"><svg viewBox="0 0 180 180" role="img" aria-label="${esc(title)}">${paths}</svg><div><p class="pd-axis-name">Señal de acompañamiento · estudiantes</p><ul>${legend}</ul></div></div></figure>`;
}
function scatterChart(points) {
  if (points.length < 8) return spotlight('Menos de 8 estudiantes con práctica y logro: no se dibuja la relación.');
  const title = 'Relación entre práctica y logro de selección';
  const w = 680, h = 340, left = 86, right = 22;
  const maxX = Math.max(...points.map(point => point.x), 1);
  const step = Math.max(1, Math.ceil(maxX / 4));
  const ticks = [];
  for (let value = 0; value <= maxX; value += step) ticks.push(value);
  if (ticks[ticks.length - 1] !== maxX) ticks.push(maxX);
  const sx = x => left + (x / maxX) * (w - left - right);
  const drawn = percentFrame(w, h, 'Logro de selección (%)', 'Cantidad de prácticas', ticks, sx);
  const sy = drawn.sy;
  const dots = points.map(point => `<circle cx="${sx(point.x)}" cy="${sy(point.y)}" r="3.2" fill="#5b8fbf" opacity="0.85"><title>${esc(point.name)}: ${point.x} prácticas, ${Math.round(point.y)} %</title></circle>`).join('');
  const reg = linreg(points);
  const trend = reg ? `<line x1="${sx(0)}" y1="${sy(Math.max(0, Math.min(100, reg.intercept)))}" x2="${sx(maxX)}" y2="${sy(Math.max(0, Math.min(100, reg.intercept + reg.slope * maxX)))}" stroke="#c9843a" stroke-width="2"></line>` : '';
  const highX = median(points.map(point => point.x));
  const quadrants = { hh: 0, hl: 0, lh: 0, ll: 0 };
  points.forEach(point => {
    const highP = point.x >= highX;
    const highL = point.y >= 75;
    const lowL = point.y < 60;
    if (highP && highL) quadrants.hh += 1;
    else if (highP && lowL) quadrants.hl += 1;
    else if (!highP && highL) quadrants.lh += 1;
    else if (!highP && lowL) quadrants.ll += 1;
  });
  const svg = chartSvg(w, h, title, `${drawn.marks}${dots}${trend}`);
  return spotlight(
    `En ${points.length} estudiantes se ven juntas la práctica y el logro. Un punto es un estudiante. Eso no demuestra que practicar produzca el resultado.`,
    [
      ['Alta práctica y alto logro', String(quadrants.hh)],
      ['Alta práctica y logro bajo', String(quadrants.hl)],
      ['Baja práctica y alto logro', String(quadrants.lh)],
      ['Baja práctica y bajo logro', String(quadrants.ll)]
    ],
    svg
  );
}
function studentGroups() {
  const groups = new Map();
  scopedRecords().forEach(record => {
    if (!groups.has(record.name)) groups.set(record.name, []);
    groups.get(record.name).push(record);
  });
  const rank = { support: 0, watch: 1, ok: 2, none: 3 };
  return [...groups.values()].sort((a, b) => rank[groupSignal(a).level] - rank[groupSignal(b).level] || a[0].name.localeCompare(b[0].name, 'es'));
}
function groupSignal(records) {
  const marks = records.map(signal);
  return marks.find(item => item.level === 'support') || marks.find(item => item.level === 'watch') || marks.find(item => item.level === 'ok') || marks[0];
}
function moduleRows(module) {
  return scopedRecords().filter(record => String(record.module_id) === String(module.id));
}
function cumplimientoByModule() {
  return scopedModules().map(module => {
    const rows = moduleRows(module);
    const values = rows.map(cumplimientoPct);
    return { module, rows, value: values.length ? mean(values) : null };
  });
}
function cumplimientoPct(record) { return Number(record.percent || 0); }
function practiceRead(rows, entries) {
  if (!entries.length) return 'No hay encargos ni oficios guardados en los registros de esta vista. Conviene mirar si el recorrido ofrece práctica.';
  const tries = rows.reduce((sum, record) => sum + attempts(record), 0);
  const withBoth = rows.filter(record => practica(record) > 0 && logro(record) != null).length;
  const named = entries.slice(0, 3).map(item => `${item.kind.toLowerCase()}${item.paso ? ` «${item.paso}»` : ''}${item.station != null ? `, estación ${item.station}` : ''}${item.graded === false ? ', sin calificación' : ''}${item.ae ? `, ${item.ae}` : ', sin AE asociado'}`).join('; ');
  const sequence = rows.map(traceLine).filter(Boolean);
  const seq = sequence.length === 1 ? ` La secuencia registrada es ${sequence[0]}. Son actividades distintas, así que no describen una tendencia de desempeño.` : '';
  const link = withBoth >= 4
    ? ' Hay asociación observable entre práctica y logro en varios registros; eso no demuestra que practicar produzca el resultado.'
    : ' No hay observaciones suficientes para relacionar frecuencia de práctica y desempeño. No se dibuja dispersión ni regresión.';
  return `Hay ${entries.length} práctica${entries.length === 1 ? '' : 's'}: ${named}. Intentos registrados en experiencias de AE: ${tries}.${seq}${link}`;
}
function signalCounts(people) {
  const counts = { support: 0, watch: 0, ok: 0, none: 0 };
  people.forEach(group => { counts[groupSignal(group).level] += 1; });
  return counts;
}
function personRow(group) {
  const item = groupSignal(group);
  const scores = group.map(logro).filter(value => value != null);
  const score = scores.length ? Math.round(mean(scores)) : null;
  const practice = group.reduce((sum, record) => sum + practica(record), 0);
  const done = Math.round(mean(group.map(cumplimientoPct)));
  const email = group[0].email;
  const series = ((group.find(record => ((record.state || {}).series || []).length >= 8) || group[0]).state || {}).series || [];
  const points = series.map(point => ({ x: point.week, y: point.score }));
  const trend = points.length >= 8 ? trendWord(points) : 'Sin serie suficiente';
  const modules = group.map(record => `Módulo ${record.position}: ${stations(record)} de 5. ${logro(record) == null ? 'Sin evaluación de selección.' : `Logro ${logro(record)} %.`} ${practica(record)} prácticas.`).join(' ');
  return `<tr><td>${esc(group[0].name)}</td><td>${signalMark(item)}<br><span class="pd-note">${item.reasons.map(esc).join(' ')}</span></td><td>${done} %</td><td>${score == null ? 'Sin evaluación de selección' : `${score} %`}</td><td>${practice}</td><td>${email ? `<a href="mailto:${esc(email)}">Contactar estudiante</a>` : ''}<details><summary>Ver evidencia</summary><p>${esc(modules)} Evolución: ${esc(trend)}.</p></details></td></tr>`;
}
function peopleTable(people) {
  if (!people.length) return '<p class="pd-interp">Ningún estudiante de esta vista cae en este grupo.</p>';
  return `<div class="pd-table-wrap pd-scroll"><table><thead><tr><th>Estudiante</th><th>Señal y por qué</th><th>Cumplimiento</th><th>Logro de selección</th><th>Prácticas</th><th>Acompañamiento</th></tr></thead><tbody>${people.map(personRow).join('')}</tbody></table></div>`;
}
function modulesIn(from, to) {
  return scopedModules().filter(module => {
    const n = Number(module.position);
    return n >= from && n <= to;
  });
}
function modulePlan(module, solo) {
  const rows = moduleRows(module);
  const hechos = rows.reduce((sum, record) => sum + practica(record), 0);
  const previstos = Number(module.encargos_count || 0);
  const photo = PHOTOS[module.position];
  const oa = (module.oa || []).slice(0, 4).map(item => `<li>${esc(item)}</li>`).join('') || '<li>Este módulo no trae objetivos de aprendizaje en el contenido.</li>';
  const image = photo ? `<img class="pd-photo" src="${photo[0]}" alt="${esc(photo[1])}">` : '<p class="pd-note">Este módulo no tiene una fotografía de la puesta en marcha.</p>';
  const planLead = rows.length
    ? `${rows.length} registro${rows.length === 1 ? '' : 's'} ya ejecutan este módulo.`
    : 'Este módulo todavía no tiene registros en esta vista.';
  const layout = solo ? ' pd-plan-solo' : '';
  return `<article class="pd-card pd-plan${layout}">${image}<div><h3>Módulo ${module.position}. ${esc(module.title)}</h3>${spotlight(planLead, [['Horas oficiales', `${module.official_hp || module.hours || 0} HP`], ['Estaciones', '5'], ['Encargos previstos', String(previstos)], ['Encargos registrados', String(hechos)]])}<h3>Objetivos de aprendizaje</h3><ul>${oa}</ul></div></article>`;
}
function modulePlans(list) {
  if (!list.length) return '<p class="pd-interp">Ningún módulo de este tramo coincide con la búsqueda.</p>';
  if (list.length === 1) return modulePlan(list[0], true);
  return `<div class="pd-split">${list.map(module => modulePlan(module)).join('')}</div>`;
}
function aeCoverage() {
  const found = [];
  scopedModules().forEach(module => {
    const rows = moduleRows(module);
    (module.aes || []).forEach((ae, index) => {
      const covered = rows.filter(record => Object.keys(((record.state || {}).ae) || {}).some(key => key.startsWith(`${index}-`)));
      const missing = [...new Set(rows.filter(record => !covered.includes(record)).map(record => record.name).filter(Boolean))];
      found.push({ module, ae, index, covered: covered.length, total: rows.length, ratio: rows.length ? covered.length / rows.length : 1, missing });
    });
  });
  found.sort((a, b) => a.ratio - b.ratio || a.covered - b.covered);
  return found;
}
function aeArticles(list) {
  if (!list.length) return '<p class="pd-interp">Ningún módulo de este tramo coincide con la búsqueda.</p>';
  const coverage = aeCoverage();
  return `<div class="pd-stack">${list.map(module => {
    const aes = module.aes || [];
    const items = aes.length ? aes.map((ae, index) => {
      const item = coverage.find(entry => entry.module === module && entry.index === index);
      const ratio = item && item.total ? Math.round(item.ratio * 100) : null;
      const criteria = (ae.criteria || []).slice(0, 6).map(line => `<li>${esc(line)}</li>`).join('');
      const who = (item && item.missing) || [];
      const whoText = !item || !item.total ? '' : !who.length ? 'Todos los registros de la vista tienen algún paso en este AE.' : who.length > 6 ? `Sin evidencia en este AE: ${esc(who.slice(0, 6).join(', '))} y ${who.length - 6} más.` : `Sin evidencia en este AE: ${esc(who.join(', '))}.`;
      const lead = ratio == null
        ? 'Sin registros: no se calcula un porcentaje de evidencia.'
        : `${ratio} % de los registros tiene al menos un paso. Es cobertura, no nivel de logro.`;
      const bar = ratio == null ? '' : bars([{ label: ae.code || `AE ${index + 1}`, value: ratio }], { title: 'Cobertura de evidencia', y: 'Aprendizaje', x: 'Con evidencia (%)' });
      const missing = whoText ? `<p class="pd-note">${whoText}</p>` : '';
      return `<article class="pd-card"><h3>${esc(ae.code || `AE ${index + 1}`)}</h3><p class="pd-orient-lead">${lead}</p><p>${esc(ae.title || 'Sin enunciado en el contenido.')}</p>${bar}${missing}${criteria ? `<details><summary>Ver criterios de evaluación</summary><ul>${criteria}</ul></details>` : '<p class="pd-note">Este aprendizaje esperado no trae criterios en el contenido.</p>'}</article>`;
    }).join('') : '<p class="pd-card">Este módulo no trae aprendizajes esperados en el contenido.</p>';
    const oa = (module.oa || []).map(item => `<li>${esc(item)}</li>`).join('') || '<li>Sin objetivo en el contenido. No se inventa uno.</li>';
    return `<section class="pd-card"><h3>Módulo ${module.position}. ${esc(module.title)}</h3><p class="pd-note">OA del módulo</p><ul>${oa}</ul>${items}</section>`;
  }).join('')}</div>`;
}
function oagTable() {
  const rows = [
    ['A', 'Comunicarse con claridad en la situación laboral.', 'Informes técnicos pedidos en los criterios de los AE.'],
    ['B', 'Leer y utilizar especificaciones técnicas y normativa.', 'M1-AE2 lee especificaciones técnicas.'],
    ['C', 'Realizar las tareas con prolijidad y estándar de calidad.', 'Criterios de verificación de los módulos 3, 4 y 5.'],
    ['D', 'Trabajar en equipo y coordinar acciones.', 'M2, criterio 1.2: trabajar en equipo.'],
    ['E', 'Tratar con respeto, sin distinciones.', 'Marco de los objetivos genéricos. Sin evidencia separada en los registros.'],
    ['F', 'Respetar deberes y derechos laborales.', 'Marco de los objetivos genéricos. Sin evidencia separada en los registros.'],
    ['G', 'Participar en situaciones de aprendizaje y formación permanente.', 'El recorrido de estaciones es la evidencia de participación en esta plataforma.'],
    ['H', 'Manejar tecnologías para obtener información y comunicar resultados.', 'Criterios que piden informe con tecnologías de la información.'],
    ['I', 'Usar insumos con cuidado ambiental.', 'OA 6: refrigerantes y NCh3241.'],
    ['J', 'Emprender iniciativas y aplicar gestión básica.', 'Corresponde al módulo de emprendimiento, fuera de estos 5 módulos.'],
    ['K', 'Prevenir riesgos y usar elementos de protección.', 'Criterios de seguridad y NCh3241 en los módulos 3 a 5.'],
    ['L', 'Tomar decisiones financieras informadas.', 'Corresponde al módulo de emprendimiento, fuera de estos 5 módulos.']
  ];
  return `<div class="pd-table-wrap"><table><thead><tr><th>OAG</th><th>Aprendizaje</th><th>Dónde se observa</th></tr></thead><tbody>${rows.map(row => `<tr><td>${esc(row[0])}</td><td>${esc(row[1])}</td><td>${esc(row[2])}</td></tr>`).join('')}</tbody></table></div>`;
}
function profileMap() {
  const body = scopedModules().map(module => {
    const rows = moduleRows(module);
    const entries = rows.flatMap(practiceEntries);
    const steps = rows.reduce((sum, record) => sum + aeSteps(record), 0);
    const marks = rows.map(signal);
    const points = weeklyPoints(rows);
    const level = marks.some(item => item.level === 'support') ? 'Requiere mayor apoyo'
      : marks.some(item => item.level === 'watch') ? 'Conviene observar'
      : marks.some(item => item.level === 'ok') ? 'Progreso esperado'
      : 'Sin evidencia';
    const codes = (module.oa || []).map(item => String(item).split('.')[0]).filter(Boolean).join(' y ') || 'Sin objetivo en el contenido';
    const last = entries[0]
      ? `${entries[0].kind}${entries[0].paso ? ` · ${entries[0].paso}` : ''}${entries[0].station != null ? ` · estación ${entries[0].station}` : ''}`
      : (steps ? `${steps} pasos de AE` : 'Sin registro');
    const evidence = rows.length ? `${entries.length} registros con práctica · ${steps} pasos de AE` : 'Sin registros';
    return `<tr><td>Módulo ${module.position} · ${esc(codes)}</td><td>${esc(evidence)}</td><td>${esc(level)}</td><td>${esc(trendWord(points))}</td><td>${esc(last)}</td></tr>`;
  }).join('');
  return `<div class="pd-table-wrap"><table><thead><tr><th>Aprendizaje</th><th>Evidencias</th><th>Estado</th><th>Evolución</th><th>Última evidencia</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function panel() {
  const rows = scopedRecords();
  const groups = cumplimientoByModule().filter(item => item.value != null);
  const support = rows.filter(record => signal(record).level === 'support');
  const names = [...new Set(support.map(record => record.name).filter(Boolean))];
  const shown = names.slice(0, 8);
  const rest = names.length - shown.length;
  const weakest = [...groups].sort((a, b) => a.value - b.value)[0];
  const ae = weakestAe();
  const entries = rows.flatMap(practiceEntries);
  const people = studentGroups();
  const counts = signalCounts(people);
  const attentionFacts = [
    ['Mayor apoyo', String(counts.support)],
    ['Conviene observar', String(counts.watch)],
    ['Progreso esperado', String(counts.ok)],
    ['Sin recorrido', String(counts.none)]
  ];
  if (weakest) attentionFacts.push(['Módulo más bajo', `Módulo ${weakest.module.position}, ${Math.round(weakest.value)} %`]);
  if (ae) attentionFacts.push(['Menos evidencia', `${ae.code || ae.title}: ${ae.withEvidence} de ${ae.total}`]);
  const nameLine = names.length
    ? `<p>${esc(shown.join(', '))}${rest ? ` y ${rest} más` : ''}.</p>`
    : '';
  const solo = !weakest
    ? 'No hay registros para comparar el cumplimiento entre módulos.'
    : groups.length === 1
      ? `Solo el módulo ${groups[0].module.position} tiene registros en esta vista: cumplimiento ${Math.round(groups[0].value)} %${groups[0].rows.length === 1 ? ', en un solo registro' : ''}.`
      : `El módulo ${weakest.module.position} concentra el cumplimiento medio más bajo (${Math.round(weakest.value)} %). Esa cifra dice cuánto recorrido hay registrado; el nivel de logro se revisa en la evaluación de selección, cuando existe.`;
  const chart = groups.length
    ? spotlight(solo, groups.map(item => [`Módulo ${item.module.position}`, `${Math.round(item.value)} %`]), `<p class="pd-note">El porcentaje es estaciones completadas ÷ 5. No es logro.</p>${bars(groups.map(item => ({ label: `Módulo ${item.module.position}`, value: item.value })), { title: 'Cumplimiento medio por módulo', y: 'Módulo', x: 'Cumplimiento (%)' })}`)
    : spotlight('No hay registros en esta vista, así que no se muestra un porcentaje. Un 0 % sería un recorrido vacío; aquí faltan registros.');
  const pie = pieChart([
    { label: 'Requiere mayor apoyo', value: counts.support, color: '#f0b0b0' },
    { label: 'Conviene observar', value: counts.watch, color: '#f3d48a' },
    { label: 'Progreso esperado', value: counts.ok, color: '#8fd4b8' },
    { label: 'Sin recorrido', value: counts.none, color: '#d5e0ee' }
  ], 'Distribución del curso por señal de acompañamiento');
  const logroValues = people.map(group => {
    const scores = group.map(logro).filter(value => value != null);
    return scores.length ? mean(scores) : null;
  }).filter(value => value != null);
  const trend = lineChart(weeklyPoints(rows.filter(record => Number(record.position) === 1)), 'Evolución del desempeño del módulo 1');
  const scatterPoints = people.map(group => {
    const scores = group.map(logro).filter(value => value != null);
    if (!scores.length) return null;
    return { name: group[0].name, x: group.reduce((sum, record) => sum + practica(record), 0), y: mean(scores) };
  }).filter(Boolean);
  return frame([
    quad(1, 'cielo', 'Orientación', 'De qué curso y de qué periodo se habla', orient('El cumplimiento cuenta el recorrido hecho. No es el logro de la prueba ni el perfil de egreso.')),
    quad(2, 'rosa', 'Atención', 'A quién acompañar ahora', spotlight(names.length ? `${names.length} estudiantes requieren mayor apoyo.` : 'En esta vista nadie tiene la señal de mayor apoyo.', attentionFacts, `${nameLine}<p><a href="${href('/portal-docente/estudiantes')}">Ver estudiantes</a> · <a href="${href('/portal-docente/cumplimiento')}">Ver cumplimiento</a>${ae ? ` · <a href="${href('/portal-docente/oa-ae')}">Revisar AE</a>` : ''}</p>`), { lead: true }),
    quad(3, 'menta', 'Estado', 'Cómo se distribuye el curso', spotlight(`De ${people.length} estudiantes, ${counts.support} requieren mayor apoyo.`, attentionFacts.slice(0, 4), `<p class="pd-note">Una persona, una señal. Si tiene varios módulos, cuenta la más exigente.</p>${pie}`)),
    quad(4, 'ambar', 'Recorrido', 'Cuánto del proceso está registrado', chart),
    quad(5, 'lila', 'Evolución', 'Cómo cambia el módulo 1', trend, { wide: true }),
    quad(6, 'celeste', 'Decisión', 'Práctica y logro, leídos por separado', `<h3>Logro de la evaluación de selección</h3><p class="pd-note">Un valor por estudiante que rindió la prueba. No es perfil de egreso.</p>${central(logroValues, 'el logro de selección')}<h3>Relación con la frecuencia de práctica</h3>${scatterChart(scatterPoints)}<div class="pd-orient-extra"><p>${practiceRead(rows, entries)}</p><p><a href="${href('/portal-docente/estudiantes')}">Analizar práctica por estudiante</a></p></div>`, { wide: true })
  ].join(''));
}
function weakestAe() {
  const found = [];
  scopedModules().forEach(module => {
    const rows = moduleRows(module);
    if (!rows.length) return;
    (module.aes || []).forEach((ae, index) => {
      const withEvidence = rows.filter(record => Object.keys(((record.state || {}).ae) || {}).some(key => key.startsWith(`${index}-`))).length;
      found.push({ code: ae.code, title: ae.title, withEvidence, total: rows.length, ratio: withEvidence / rows.length });
    });
  });
  found.sort((a, b) => a.ratio - b.ratio || a.withEvidence - b.withEvidence);
  return found[0] || null;
}
function cursos() {
  const course = fiveCourse();
  const scope = (course && course.scope) || 'Alcance: módulos 1 a 5 de Refrigeración y Climatización.';
  const modules = scopedModules();
  const rows = scopedRecords();
  const hechos = rows.reduce((sum, record) => sum + practica(record), 0);
  const previstos = modules.reduce((sum, module) => sum + Number(module.encargos_count || 0), 0);
  const withRows = modules.filter(module => moduleRows(module).length).length;
  return frame([
    quad(1, 'cielo', 'Orientación', 'Qué abarca esta planificación', orient('Aquí se compara el plan con lo ya ejecutado. El porcentaje de cumplimiento se lee en Cumplimiento.', `<p>${esc(scope)}</p>`)),
    quad(2, 'rosa', 'Atención', 'Lo que ya se está ejecutando', spotlight(`${withRows} de ${modules.length} módulos ya tienen recorrido registrado.`, [['Registros', String(rows.length)], ['Encargos previstos', String(previstos)], ['Encargos registrados', String(hechos)]], '<p>La comparación muestra si el plan tiene evidencia. No convierte esa evidencia en nivel de logro.</p>'), { lead: true }),
    quad(3, 'menta', 'Estado', 'Módulos 1 y 2. Planos y medición', modulePlans(modulesIn(1, 2)), { wide: true }),
    quad(4, 'ambar', 'Evidencia', 'Módulos 3 y 4. Instalación y montaje', modulePlans(modulesIn(3, 4)), { wide: true }),
    quad(5, 'lila', 'Cierre', 'Módulo 5. Puesta en marcha', modulePlans(modulesIn(5, 5)), { wide: true }),
    quad(6, 'celeste', 'Decisión', 'Dónde continuar la lectura', spotlight('El plan dice qué debería ocurrir. El recorrido se mira en Cumplimiento.', [['Criterios de cada AE', 'Pestaña OA y AE']], `<p><a href="${href('/portal-docente/cumplimiento')}">Ver progreso del recorrido</a> · <a href="${href('/portal-docente/oa-ae')}">Revisar AE</a></p>`), { wide: true })
  ].join(''));
}
function students() {
  const people = studentGroups();
  const counts = signalCounts(people);
  const support = people.filter(group => groupSignal(group).level === 'support');
  const watch = people.filter(group => groupSignal(group).level === 'watch');
  const ok = people.filter(group => groupSignal(group).level === 'ok');
  const none = people.filter(group => groupSignal(group).level === 'none');
  const shown = support.slice(0, 8).map(group => group[0].name);
  const rest = support.length - shown.length;
  const names = shown.length ? `${esc(shown.join(', '))}${rest ? ` y ${rest} más` : ''}.` : 'Nadie en esta vista está en ese grupo.';
  return frame([
    quad(1, 'cielo', 'Orientación', 'Cómo se lee la señal', `<div class="pd-orient-side">${orient('Una fila es un estudiante. La señal usa el módulo que pide más apoyo.', '<ul class="pd-rules"><li><strong>Mayor apoyo.</strong> Menos de 2 estaciones, o logro bajo 60 %.</li><li><strong>Conviene observar.</strong> 2 o 3 estaciones, o logro de 60 % a 79 %.</li><li><strong>Progreso esperado.</strong> 4 o 5 estaciones, sin esas alertas.</li></ul>')}</div>`, { wide: true }),
    quad(2, 'rosa', 'Atención', 'Requiere mayor apoyo', `${spotlight(`${support.length} estudiantes requieren mayor apoyo.`, [['En este grupo', String(support.length)], ['Conviene observar', String(counts.watch)], ['Progreso esperado', String(counts.ok)], ['Sin recorrido', String(counts.none)]], `<p>${names}</p>`)}${peopleTable(support)}`, { lead: true, wide: true }),
    quad(3, 'ambar', 'Observación', 'Conviene observar', `${spotlight(`Conviene observar a ${watch.length} estudiantes.`, [['En este grupo', String(watch.length)], ['Mayor apoyo', String(counts.support)], ['Progreso esperado', String(counts.ok)], ['Sin recorrido', String(counts.none)]])}${peopleTable(watch)}`, { wide: true }),
    quad(4, 'menta', 'Avance', 'Progreso esperado', `${spotlight(`${ok.length} estudiantes van en el progreso esperado.`, [['En este grupo', String(ok.length)], ['Mayor apoyo', String(counts.support)], ['Conviene observar', String(counts.watch)], ['Sin recorrido', String(counts.none)]])}${peopleTable(ok)}`, { wide: true }),
    quad(5, 'lila', 'Sin recorrido', 'Todavía sin estaciones registradas', `${spotlight(`${none.length} estudiantes todavía no tienen recorrido.`, [['En este grupo', String(none.length)], ['Mayor apoyo', String(counts.support)], ['Conviene observar', String(counts.watch)], ['Progreso esperado', String(counts.ok)]])}${peopleTable(none)}`),
    quad(6, 'celeste', 'Decisión', 'Cómo acompañar', spotlight('El cumplimiento de la fila no es el logro de la prueba ni el perfil de egreso.', [['Contacto', 'Correo de cada fila'], ['Detalle', 'Estaciones, logro y prácticas']], `<p><a href="${href('/portal-docente/oa-ae')}">Revisar AE</a> · <a href="${href('/portal-docente/cumplimiento')}">Ver cumplimiento del curso</a></p>`))
  ].join(''));
}
function learning() {
  const low = aeCoverage().filter(item => item.total).slice(0, 4);
  const lowBody = low.length ? `<div class="pd-stack">${low.map(item => {
    const ratio = Math.round(item.ratio * 100);
    const who = item.missing;
    const whoText = !who.length ? 'Todos los registros de la vista tienen algún paso en este AE.' : who.length > 6 ? `Sin evidencia en este AE: ${esc(who.slice(0, 6).join(', '))} y ${who.length - 6} más.` : `Sin evidencia en este AE: ${esc(who.join(', '))}.`;
    return `<article class="pd-card"><h3>${esc(item.ae.code || item.ae.title || 'AE')} · módulo ${item.module.position}</h3><p class="pd-orient-lead">${ratio} % tiene al menos un paso. Es cobertura, no nivel de logro.</p><p>${esc(item.ae.title || 'Sin enunciado en el contenido.')}</p>${bars([{ label: 'Con evidencia', value: ratio }], { title: 'Cobertura de evidencia', y: 'Indicador', x: 'Con evidencia (%)' })}<p class="pd-note">${item.covered} de ${item.total}. ${whoText}</p></article>`;
  }).join('')}</div>` : '<p class="pd-interp">No hay AE con registros suficientes para comparar evidencia.</p>';
  const first = low[0];
  const lowLead = first
    ? `${first.ae.code || 'El aprendizaje con menos evidencia'} cubre ${first.covered} de ${first.total} registros.`
    : 'No hay AE con registros suficientes para comparar evidencia.';
  const lowFacts = low.map(item => [item.ae.code || `Módulo ${item.module.position}`, `${Math.round(item.ratio * 100)} %`]);
  return frame([
    quad(1, 'cielo', 'Orientación', 'Qué parte del perfil se observa aquí', orient('Esta vista mira los objetivos de los módulos 1 a 5.', '<p>El perfil de egreso reúne los objetivos de la especialidad y los objetivos genéricos. Los OA 7, 8 y 9 están en módulos posteriores.</p>')),
    quad(2, 'rosa', 'Atención', 'Aprendizajes con menos evidencia', spotlight(lowLead, lowFacts, lowBody), { lead: true }),
    quad(3, 'menta', 'Estado', 'Mapa de aprendizajes observados', spotlight('El estado usa la misma señal de acompañamiento.', [['Evolución', 'Compara las primeras y las últimas semanas'], ['Mínimo', '8 observaciones']], profileMap()), { wide: true }),
    quad(4, 'ambar', 'Referencia', 'Objetivos de Aprendizaje Genéricos', spotlight('Estos textos son del programa. No forman un porcentaje de perfil.', [['En estos 5 módulos', 'OAG A a I y K'], ['Fuera de esta vista', 'OAG J y L']], oagTable()), { wide: true }),
    quad(5, 'lila', 'Evidencia', 'AE de los módulos 1 y 2', spotlight('Cada porcentaje es cobertura de evidencia, no nivel de logro.', [], aeArticles(modulesIn(1, 2))), { wide: true }),
    quad(6, 'celeste', 'Decisión', 'AE de los módulos 3, 4 y 5', `${spotlight('Los módulos 3, 4 y 5 se leen con la misma regla de cobertura.', [], aeArticles(modulesIn(3, 5)))}${sealForm()}`, { wide: true })
  ].join(''));
}
function compliance() {
  const values = scopedRecords().map(cumplimientoPct);
  const ranked = cumplimientoByModule().filter(item => item.value != null).sort((a, b) => a.value - b.value);
  const low = ranked[0];
  const high = ranked[ranked.length - 1];
  const same = low && high && low.module === high.module;
  const body = scopedModules().map(module => {
    const moduleValues = moduleRows(module).map(cumplimientoPct);
    return `<tr><td>Módulo ${module.position}</td><td>${esc(module.title)}</td><td>${moduleValues.length}</td><td>${moduleValues.length ? Math.round(mean(moduleValues)) + ' %' : 'Sin registros'}</td><td>${moduleValues.length >= 2 ? Math.round(median(moduleValues)) + ' %' : '—'}</td></tr>`;
  }).join('');
  const lowText = !low
    ? spotlight('No hay registros para señalar un módulo con menor recorrido.')
    : spotlight(`El módulo ${low.module.position} tiene el menor recorrido: ${Math.round(low.value)} %.`, [['Módulo', low.module.title], ['Media', `${Math.round(low.value)} %`], ['Registros', String(low.rows.length)], ['Qué cuenta', 'Estaciones, no logro']]);
  const highText = !high
    ? spotlight('No hay registros para señalar un módulo con mayor recorrido.')
    : same
      ? spotlight('Solo hay un módulo con registros, así que no hay un extremo alto distinto del anterior.')
      : spotlight(`El módulo ${high.module.position} tiene el mayor recorrido: ${Math.round(high.value)} %.`, [['Módulo', high.module.title], ['Media', `${Math.round(high.value)} %`], ['Registros', String(high.rows.length)]]);
  return frame([
    quad(1, 'cielo', 'Orientación', 'Qué cuenta este indicador', orient('Este número cuenta estaciones del recorrido. No mide el nivel de logro.', '<p>Las estaciones son: contexto, aprendizajes esperados, casos, evaluación y cierre. Completar las cinco no equivale al perfil de egreso.</p>')),
    quad(2, 'rosa', 'Atención', 'Lectura del curso completo', central(values, 'el cumplimiento'), { lead: true }),
    quad(3, 'menta', 'Estado', 'Módulo con menor recorrido', lowText),
    quad(4, 'ambar', 'Comparación', 'Módulo con mayor recorrido', highText),
    quad(5, 'lila', 'Detalle', 'Los cinco módulos, uno al lado del otro', spotlight('Media y mediana de cada módulo, juntas.', [['Lectura', 'Si se separan, el promedio no representa a cada uno']], `<div class="pd-table-wrap"><table><thead><tr><th>Módulo</th><th>Nombre</th><th>Registros</th><th>Media</th><th>Mediana</th></tr></thead><tbody>${body}</tbody></table></div>`)),
    quad(6, 'celeste', 'Decisión', 'Dónde mirar después de este número', spotlight('Si la media y la mediana se separan, abre el listado antes de comunicar un solo porcentaje.', [['Por estudiante', 'Pestaña Estudiantes'], ['Poca evidencia', 'Pestaña OA y AE']], `<p><a href="${href('/portal-docente/estudiantes')}">Ver estudiantes</a> · <a href="${href('/portal-docente/oa-ae')}">Revisar AE</a></p>`))
  ].join(''));
}
function reports() {
  const kpi = (((state.teacher || {}).kpi || {}).avance_porcentaje) || {};
  const values = scopedRecords().map(cumplimientoPct);
  const counts = signalCounts(studentGroups());
  const low = cumplimientoByModule().filter(item => item.value != null).sort((a, b) => a.value - b.value)[0];
  const avg = values.length ? Math.round(mean(values)) : null;
  const mid = values.length ? Math.round(median(values)) : null;
  const fields = [
    ['Pregunta', '¿Cuánto del recorrido de cinco estaciones está registrado?'],
    ['Fórmula', kpi.formula || 'estaciones_completadas / 5 × 100'],
    ['Periodo', state.cohort ? '12 semanas de prácticas comparables en la cohorte de demostración.' : (kpi.periodo || 'Estado actual')],
    ['Población', 'Módulos 1 a 5 de esta vista.']
  ];
  return frame([
    quad(1, 'cielo', 'Orientación', 'Para qué sirve este reporte', orient('Este reporte deja escrito qué se mide y qué se puede comunicar.', '<p>Los gráficos de tendencia están en el Panel general.</p>')),
    quad(2, 'rosa', 'Atención', 'Lectura que se puede comunicar', spotlight(avg == null ? 'No hay registros para leer el curso.' : `El recorrido medio es ${avg} % y el del medio es ${mid} %.`, avg == null ? [] : [['Promedio', `${avg} %`], ['Mediana', `${mid} %`], ['Mayor apoyo', `${counts.support} estudiantes`], ['Módulo más bajo', low ? `Módulo ${low.module.position}, ${Math.round(low.value)} %` : '—']], '<p>Esto cuenta estaciones hechas, no el nivel de logro.</p>'), { lead: true }),
    quad(3, 'menta', 'Definición', 'El indicador, con su fórmula', spotlight('La fórmula cuenta estaciones completadas entre cinco.', [], `<div class="pd-table-wrap"><table><thead><tr><th>Campo</th><th>Definición</th></tr></thead><tbody>${fields.map(([key, value]) => `<tr><td>${esc(key)}</td><td>${esc(value)}</td></tr>`).join('')}</tbody></table></div>`)),
    quad(4, 'ambar', 'Pantalla', 'Qué muestra esta vista', spotlight('Los nombres de esta pantalla son una cohorte de demostración.', [['Estudiantes', '200'], ['Para qué', 'Leer medias, dispersión y señales'], ['Registro real', 'No. El campus está en el CSV']])),
    quad(5, 'lila', 'Archivo', 'Qué descarga el CSV', spotlight('El CSV trae los registros reales del campus, no los 200 de demostración.', [['Gráficos', 'No se repiten en el archivo']], '<p><a href="/api/teacher/export.csv">Descargar CSV del cumplimiento del campus</a></p>')),
    quad(6, 'celeste', 'Decisión', 'Dónde está el resto de la evidencia', spotlight('La tendencia, el listado y el plan están en otras pestañas.', [['Tendencia y logro', 'Panel general'], ['Por estudiante', 'Estudiantes'], ['Plan', 'Cursos']], `<p><a href="${href('/portal-docente')}">Abrir el panel</a> · <a href="${href('/portal-docente/estudiantes')}">Ver estudiantes</a> · <a href="${href('/portal-docente/cursos')}">Ver la planificación</a></p>`))
  ].join(''));
}
function sealRows() {
  return ((state.teacher && state.teacher.specialist_reviews) || []).filter(row => row.verdict === 'Sello del docente de la especialidad');
}
function sealForm() {
  const courses = state.courses || [];
  const selected = state.sealCourse || (courses[0] && courses[0].id);
  const course = courses.find(item => String(item.id) === String(selected)) || courses[0];
  const modules = ((course && course.modules) || []).slice().sort((a, b) => Number(a.position) - Number(b.position));
  const sealed = new Set(sealRows().map(row => String(row.module_id)));
  const pending = modules.filter(module => !sealed.has(String(module.id)));
  const courseOptions = courses.map(item => `<option value="${item.id}" ${String(item.id) === String(course && course.id) ? 'selected' : ''}>${esc(item.title)}</option>`).join('');
  const moduleOptions = modules.map(module => `<option value="${module.id}" ${pending[0] && pending[0].id === module.id ? 'selected' : ''}>Módulo ${module.position}. ${esc(module.title)}${sealed.has(String(module.id)) ? ' · con sello' : ''}</option>`).join('');
  const progress = `${modules.length - pending.length} de ${modules.length} módulos de esta especialidad tienen sello.`;
  const done = sealRows().filter(row => course && row.course === course.title);
  const list = done.length
    ? `<ul>${done.slice(0, 6).map(row => `<li>${esc(row.name)} selló el módulo ${esc(row.title)}.</li>`).join('')}</ul>`
    : '<p class="pd-note">Esta especialidad todavía no tiene un sello. El registro queda a nombre de quien confirma la revisión.</p>';
  return `<form id="pd-seal" class="pd-card pd-seal"><h3>Sello por especialidad</h3><p>${esc(progress)} Confirma el módulo cuyo ítem, norma y procedimiento revisaste. El sello no cubre el resto de la especialidad.</p><label>Especialidad<select name="course_id">${courseOptions}</select></label><label>Módulo<select name="module_id">${moduleOptions}</select></label><label>Qué revisaste<textarea name="note" minlength="20" maxlength="2000" required placeholder="Describe el ítem, la norma y el procedimiento que revisaste."></textarea></label><label class="pd-check"><input type="checkbox" name="confirm"> Revisé el ítem, la norma y el procedimiento de este módulo.</label><button type="submit">Guardar sello de este módulo</button>${list}</form>`;
}
function bindSeal() {
  const form = document.getElementById('pd-seal');
  if (!form) return;
  const courseSelect = form.querySelector('[name="course_id"]');
  if (courseSelect) courseSelect.onchange = () => { state.sealCourse = Number(courseSelect.value); draw(); };
  form.onsubmit = async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (!data.confirm) {
      form.querySelector('.pd-seal-error')?.remove();
      form.insertAdjacentHTML('beforeend', '<p class="pd-seal-error">Marca la confirmación para guardar el sello de este módulo.</p>');
      return;
    }
    try {
      await post('/api/teacher/specialist-review', {
        module_id: Number(data.module_id),
        verdict: 'Sello del docente de la especialidad',
        note: data.note,
        confirm: true
      });
      state.teacher = await api('/api/teacher');
      applyCohort();
      draw();
    } catch (error) {
      form.querySelector('.pd-seal-error')?.remove();
      form.insertAdjacentHTML('beforeend', `<p class="pd-seal-error">${esc(error.message)}</p>`);
    }
  };
}
function draw() {
  const tab = currentTab();
  nav();
  const body = { resumen: panel, cursos, estudiantes: students, 'oa-ae': learning, cumplimiento: compliance, reportes: reports }[tab.id]();
  document.getElementById('pd-main').innerHTML = body;
  document.title = `${tab.label} · Portal Docente`;
  bindSeal();
}
async function post(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Aula-Portal': 'docente', 'X-CSRF-Token': state.csrf || '' },
    body: JSON.stringify(data)
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'No se pudo registrar el sello.');
  return payload;
}
async function api(url) {
  const response = await fetch(url, { headers: { 'X-Aula-Portal': 'docente' } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo abrir el portal docente.');
  return data;
}
async function boot() {
  nav();
  const cached = readCourses();
  if (cached) {
    state.courses = cached;
    state.teacher = state.teacher || { records: [] };
    applyCohort();
    draw();
  }
  const entered = await api('/api/portal-docente/enter');
  state.user = entered.user;
  state.csrf = entered.csrf || '';
  const name = (entered.user && entered.user.name) || 'Docente';
  document.getElementById('pd-name').textContent = name;
  document.getElementById('pd-avatar').textContent = name.slice(0, 1).toUpperCase();
  state.courses = await api('/api/courses');
  saveCourses(state.courses);
  state.teacher = await api('/api/teacher');
  applyCohort();
  draw();
}
function readCourses() {
  try { return JSON.parse(sessionStorage.getItem('aula-pd-courses-v1') || 'null'); }
  catch (error) { return null; }
}
function saveCourses(courses) {
  try { sessionStorage.setItem('aula-pd-courses-v1', JSON.stringify(courses)); }
  catch (error) {}
}
function applyCohort() {
  if (!state.teacher) state.teacher = { records: [] };
  if (window.AulaCohort && fiveModules().length) {
    state.teacher.records = window.AulaCohort.build(fiveModules());
    state.cohort = true;
  }
}
nav();
boot().catch(error => {
  nav();
  document.getElementById('pd-main').innerHTML = `<p class="pd-card">${esc(error.message)}</p>`;
});
