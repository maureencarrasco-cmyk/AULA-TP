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
  { id: 'oa-ae', path: '/portal-docente/oa-ae', label: 'OA, AE y criterios de evaluación', question: '¿Qué aprendizajes están siendo desarrollados y cuáles requieren mayor atención?' },
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
function contextBar() {
  const q = state.q.trim();
  const rows = scopedRecords();
  const mods = scopedModules();
  const search = q ? `Búsqueda activa: «${q}».` : 'Sin búsqueda.';
  const period = state.cohort ? 'Periodo: 12 semanas de la cohorte de demostración.' : 'Periodo: estado actual, sin serie histórica.';
  const cohort = state.cohort ? ' Cohorte de demostración: 200 estudiantes.' : '';
  return `<p class="pd-context">Curso: ${esc(courseTitle())}. Módulos 1 a 5. ${period}${cohort} ${esc(search)} Universo de esta vista: ${rows.length} registro${rows.length === 1 ? '' : 's'} en ${mods.length} módulo${mods.length === 1 ? '' : 's'}.</p>`;
}
function frame(body) {
  const tab = currentTab();
  return `<header class="pd-pagehead"><p class="pd-kicker-page">${esc(tab.label)}</p><h1>${esc(tab.question)}</h1></header><div class="pd-board">${body}</div>`;
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
  if (score != null && score >= 60 && score < 80) watch.push(`Logro de selección ${score} %. Conviene mirar la distribución de ese resultado.`);
  if (done >= 4 && score == null) watch.push('El recorrido marca la evaluación, pero este registro no trae puntaje de selección.');
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
  let result;
  if (midR > avgR + 3) result = `El ${who} del medio está en ${midR} %. El promedio baja a ${avgR} % por unos pocos resultados bajos.`;
  else if (avgR > midR + 3) result = `El ${who} del medio está en ${midR} %. El promedio sube a ${avgR} % por unos pocos resultados altos.`;
  else result = `Promedio y ${who} del medio coinciden, cerca de ${avgR} %.`;
  let spreadLine = ' Son pocos datos para ver si el curso está parejo.';
  if (spreadR != null && spreadR < 8) spreadLine = ' El curso está parejo.';
  else if (spreadR != null && spreadR < 12) spreadLine = ' Hay diferencias moderadas: el promedio no describe a cada uno.';
  else if (spreadR != null) spreadLine = ' Hay diferencias grandes: un solo porcentaje no representa al curso.';
  const extra = spreadR != null ? `<span>Desviación estándar: ${spreadR} pts</span>` : '';
  return `<p class="pd-stats"><span>Media: ${avgR} %</span><span>Mediana: ${midR} %</span>${extra}<span>Datos: ${values.length}</span></p><p class="pd-interp"><strong>${result}</strong>${spreadLine}</p>`;
}
function bars(items) {
  return `<div class="pd-bars">${items.map(item => {
    const value = Math.max(0, Math.min(100, Math.round(item.value)));
    return `<div class="pd-bar"><span>${esc(item.label)}</span><div class="pd-track"><div class="pd-fill" style="width:${value}%"></div></div><strong>${value} %</strong></div>`;
  }).join('')}</div>`;
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
  if (!points.length) return '<p class="pd-interp">No hay una serie semanal con suficientes observaciones comparables.</p>';
  const reg = linreg(points);
  const w = 640, h = 230, left = 42, right = 16, top = 16, bottom = 36;
  const xs = points.map(point => point.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const sx = x => left + ((x - minX) / Math.max(1, maxX - minX)) * (w - left - right);
  const sy = y => top + (1 - y / 100) * (h - top - bottom);
  const observed = points.map(point => `${sx(point.x)},${sy(point.y)}`).join(' ');
  const dots = points.map(point => `<circle cx="${sx(point.x)}" cy="${sy(point.y)}" r="3.5" fill="#4d7eb8"></circle>`).join('');
  let trend = '';
  let note = 'Menos de 8 observaciones comparables: no se traza regresión.';
  if (reg) {
    const y1 = reg.intercept + reg.slope * minX;
    const y2 = reg.intercept + reg.slope * maxX;
    trend = `<line x1="${sx(minX)}" y1="${sy(y1)}" x2="${sx(maxX)}" y2="${sy(y2)}" stroke="#c9843a" stroke-width="2"></line>`;
    const next = maxX + 1;
    const projected = reg.intercept + reg.slope * next;
    trend += `<line x1="${sx(maxX)}" y1="${sy(y2)}" x2="${sx(next)}" y2="${sy(Math.max(0, Math.min(100, projected)))}" stroke="#c9843a" stroke-width="2" stroke-dasharray="5 4"></line>`;
    const direction = reg.slope > 0.4 ? 'ascendente' : reg.slope < -0.4 ? 'descendente' : 'estable';
    note = `Los resultados presentan una tendencia ${direction} en ${reg.n} observaciones semanales. La línea continua es la tendencia de los datos observados. El tramo punteado es una proyección estadística orientativa de la semana siguiente, no un resultado futuro.`;
  }
  return `<p class="pd-note">Eje X: semana. Eje Y: desempeño medio (%). Puntos: datos observados. Línea: tendencia. Universo: registros con serie en la misma escala.</p><svg class="pd-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><line x1="${left}" y1="${sy(0)}" x2="${w - right}" y2="${sy(0)}" stroke="#d7e4f5"></line><line x1="${left}" y1="${sy(100)}" x2="${left}" y2="${sy(0)}" stroke="#8aa4c4"></line><text x="4" y="${sy(100) + 4}" font-size="11" fill="#5e7596">100 %</text><text x="8" y="${sy(0)}" font-size="11" fill="#5e7596">0 %</text><text x="${w / 2}" y="${h - 8}" font-size="11" fill="#5e7596">Semana</text><polyline fill="none" stroke="#4d7eb8" stroke-width="2" points="${observed}"></polyline>${dots}${trend}</svg><p class="pd-interp">${note} Evolución: ${trendWord(points)}.</p>`;
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
  return `<div class="pd-pie"><svg viewBox="0 0 180 180" role="img" aria-label="${esc(title)}">${paths}</svg><ul>${legend}</ul></div>`;
}
function scatterChart(points) {
  if (points.length < 8) return '<p class="pd-interp">Menos de 8 estudiantes con práctica y logro: no se dibuja la relación.</p>';
  const w = 640, h = 240, left = 42, right = 16, top = 16, bottom = 36;
  const maxX = Math.max(...points.map(point => point.x), 1);
  const sx = x => left + (x / maxX) * (w - left - right);
  const sy = y => top + (1 - y / 100) * (h - top - bottom);
  const dots = points.map(point => `<circle cx="${sx(point.x)}" cy="${sy(point.y)}" r="3.2" fill="#5b8fbf" opacity="0.85"><title>${esc(point.name)}: ${point.x} prácticas, ${Math.round(point.y)} %</title></circle>`).join('');
  const reg = linreg(points);
  const trend = reg ? `<line x1="${sx(0)}" y1="${sy(reg.intercept)}" x2="${sx(maxX)}" y2="${sy(reg.intercept + reg.slope * maxX)}" stroke="#c9843a" stroke-width="2"></line>` : '';
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
  return `<p class="pd-note">Eje X: cantidad de prácticas. Eje Y: logro de selección (%). Un punto es un estudiante. La línea es la tendencia de los puntos, no una causa.</p><svg class="pd-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Relación entre frecuencia de práctica y desempeño">${dots}${trend}<text x="4" y="24" font-size="11" fill="#5e7596">100 %</text><text x="${w / 2}" y="${h - 8}" font-size="11" fill="#5e7596">Prácticas</text></svg><p class="pd-interp">Se observa la asociación entre la frecuencia de práctica y el logro de selección en ${points.length} estudiantes. Alta práctica y alto logro: ${quadrants.hh}. Alta práctica y logro bajo 60 %: ${quadrants.hl}; conviene revisar esa dificultad. Baja práctica y alto logro: ${quadrants.lh}; conviene mirar otras evidencias antes de interpretar. Baja práctica y bajo logro: ${quadrants.ll}. Esta asociación no demuestra que practicar produzca el resultado.</p>`;
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
function modulePlan(module) {
  const rows = moduleRows(module);
  const hechos = rows.reduce((sum, record) => sum + practica(record), 0);
  const previstos = Number(module.encargos_count || 0);
  const photo = PHOTOS[module.position];
  const oa = (module.oa || []).slice(0, 4).map(item => `<li>${esc(item)}</li>`).join('') || '<li>Este módulo no trae OA en el contenido cargado.</li>';
  const image = photo ? `<img class="pd-photo" src="${photo[0]}" alt="${esc(photo[1])}">` : '<p class="pd-note">Sin fotografía propia de puesta en marcha. No se reutiliza una imagen de otro módulo ni un afiche genérico.</p>';
  return `<article class="pd-card pd-plan">${image}<div><h3>Módulo ${module.position}. ${esc(module.title)}</h3><p class="pd-note">${module.official_hp || module.hours || 0} HP oficiales en el contenido. Recorrido planificado: 5 estaciones.</p><p>Ejecutado en esta vista: ${rows.length} registro${rows.length === 1 ? '' : 's'}. Encargos previstos: ${previstos}. Encargos u oficios registrados: ${hechos}.</p><h3>OA cargados</h3><ul>${oa}</ul></div></article>`;
}
function modulePlans(list) {
  if (!list.length) return '<p class="pd-interp">Ningún módulo de este tramo coincide con la búsqueda.</p>';
  return `<div class="pd-split">${list.map(modulePlan).join('')}</div>`;
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
      const bar = ratio == null ? '<p class="pd-note">Sin registros: no se calcula un porcentaje de evidencia.</p>' : `${bars([{ label: ae.code || `AE ${index + 1}`, value: ratio }])}<p class="pd-interp">El ${ratio} % de los registros de este módulo tiene al menos un paso guardado en este AE. Es cobertura de evidencia, no nivel de logro. ${whoText}</p>`;
      return `<article class="pd-card"><h3>${esc(ae.code || `AE ${index + 1}`)}</h3><p>${esc(ae.title || 'Sin enunciado cargado.')}</p>${bar}${criteria ? `<details><summary>Ver criterios de evaluación</summary><ul>${criteria}</ul></details>` : '<p class="pd-note">Este AE no trae criterios en el contenido cargado.</p>'}</article>`;
    }).join('') : '<p class="pd-card">Sin aprendizajes esperados cargados en este módulo.</p>';
    const oa = (module.oa || []).map(item => `<li>${esc(item)}</li>`).join('') || '<li>Sin OA en el contenido cargado. No se inventa un objetivo.</li>';
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
    const codes = (module.oa || []).map(item => String(item).split('.')[0]).filter(Boolean).join(' y ') || 'Sin OA cargado';
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
  const weakestLine = !weakest
    ? 'No hay registros para comparar el cumplimiento entre módulos.'
    : groups.length === 1
      ? `<a href="${href('/portal-docente/cumplimiento')}">Ver cumplimiento</a>: el módulo ${weakest.module.position} es el único con registros. Su cumplimiento es ${Math.round(weakest.value)} %.`
      : `<a href="${href('/portal-docente/cumplimiento')}">Ver cumplimiento</a>: el módulo ${weakest.module.position} tiene la media de cumplimiento más baja de esta vista (${Math.round(weakest.value)} %).`;
  const ae = weakestAe();
  const entries = rows.flatMap(practiceEntries);
  const attention = [
    names.length
      ? `<a href="${href('/portal-docente/estudiantes')}">Ver estudiantes</a>: ${esc(shown.join(', '))}${rest ? ` y ${rest} más` : ''} ${shown.length === 1 && !rest ? 'tiene' : 'tienen'} una señal de mayor apoyo.`
      : 'Ningún registro del universo filtrado reúne la señal de mayor apoyo.',
    weakestLine,
    ae
      ? `<a href="${href('/portal-docente/oa-ae')}">Revisar AE</a>: ${esc(ae.code || ae.title)} tiene evidencia en ${ae.withEvidence} de ${ae.total} registros del módulo.`
      : 'No hay AE con registros suficientes para comparar evidencia.'
  ];
  const solo = !weakest
    ? 'No hay registros para comparar el cumplimiento entre módulos.'
    : groups.length === 1
      ? `Solo el módulo ${groups[0].module.position} tiene registros en esta vista: cumplimiento ${Math.round(groups[0].value)} %${groups[0].rows.length === 1 ? ', en un solo registro' : ''}.`
      : `El módulo ${weakest.module.position} concentra el cumplimiento medio más bajo (${Math.round(weakest.value)} %). Esa cifra dice cuánto recorrido hay registrado; el nivel de logro se revisa en la evaluación de selección, cuando existe.`;
  const chart = groups.length
    ? `<p class="pd-note">Unidad: %. Universo: registros con recorrido en el filtro. El cumplimiento es estaciones completadas ÷ 5. No es logro.</p>${bars(groups.map(item => ({ label: `Módulo ${item.module.position}`, value: item.value })))}<p class="pd-interp">${solo}</p>`
    : '<p class="pd-interp">No hay registros en esta vista, así que no se dibuja un porcentaje de cumplimiento. Un gráfico en 0 % significaría recorrido nulo, y aquí la ausencia es falta de registros.</p>';
  const people = studentGroups();
  const counts = signalCounts(people);
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
    quad(1, 'cielo', 'Orientación', 'De qué curso y de qué periodo se habla', `${contextBar()}<p>Esta lectura dice qué ocurre ahora en los módulos 1 a 5. El cumplimiento cuenta estaciones del recorrido. El logro, cuando existe, es la evaluación de selección. Ninguno de los dos es el perfil de egreso.</p>`),
    quad(2, 'rosa', 'Atención', 'A quién acompañar ahora', `<ul class="pd-attention">${attention.map(item => `<li>${item}</li>`).join('')}</ul>`, { lead: true }),
    quad(3, 'menta', 'Estado', 'Cómo se distribuye el curso', `<p class="pd-note">Una persona, una señal. Si tiene varios módulos, cuenta la señal más exigente.</p>${pie}`),
    quad(4, 'ambar', 'Recorrido', 'Cuánto del proceso está registrado', chart),
    quad(5, 'lila', 'Evolución', 'Cómo cambia el módulo 1', trend, { wide: true }),
    quad(6, 'celeste', 'Decisión', 'Práctica y logro, leídos por separado', `<h3>Logro de la evaluación de selección</h3><p class="pd-note">Un valor por estudiante que rindió la prueba. No es perfil de egreso.</p>${central(logroValues, 'el logro de selección')}<h3>Relación con la frecuencia de práctica</h3>${scatterChart(scatterPoints)}<p class="pd-interp">${practiceRead(rows, entries)}</p><p><a href="${href('/portal-docente/estudiantes')}">Analizar práctica por estudiante</a></p>`, { wide: true })
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
  const scope = (course && course.scope) || 'Alcance cargado: módulos 1 a 5 de Refrigeración y Climatización.';
  const modules = scopedModules();
  const rows = scopedRecords();
  const hechos = rows.reduce((sum, record) => sum + practica(record), 0);
  const previstos = modules.reduce((sum, module) => sum + Number(module.encargos_count || 0), 0);
  const withRows = modules.filter(module => moduleRows(module).length).length;
  return frame([
    quad(1, 'cielo', 'Orientación', 'Qué abarca esta planificación', `${contextBar()}<p>${esc(scope)} Esta sección muestra lo planificado y lo ejecutado. El porcentaje de cumplimiento está en Cumplimiento, para no repetir el mismo gráfico.</p>`),
    quad(2, 'rosa', 'Atención', 'Lo que ya se está ejecutando', `<p>En esta vista hay ${rows.length} registro${rows.length === 1 ? '' : 's'} en ${withRows} de ${modules.length} módulo${modules.length === 1 ? '' : 's'} visibles. Encargos previstos en el contenido: ${previstos}. Encargos u oficios registrados: ${hechos}.</p><p class="pd-interp">La comparación sirve para ver si el recorrido planificado tiene evidencia. No convierte esa evidencia en nivel de logro.</p>`, { lead: true }),
    quad(3, 'menta', 'Estado', 'Módulos 1 y 2. Planos y medición', modulePlans(modulesIn(1, 2)), { wide: true }),
    quad(4, 'ambar', 'Evidencia', 'Módulos 3 y 4. Instalación y montaje', modulePlans(modulesIn(3, 4)), { wide: true }),
    quad(5, 'lila', 'Cierre', 'Módulo 5. Puesta en marcha', modulePlans(modulesIn(5, 5))),
    quad(6, 'celeste', 'Decisión', 'Dónde continuar la lectura', `<p>El plan dice qué debería estar ocurriendo. El recorrido realizado se mira en Cumplimiento. Los criterios de cada AE están en OA y AE.</p><p><a href="${href('/portal-docente/cumplimiento')}">Ver progreso del recorrido</a> · <a href="${href('/portal-docente/oa-ae')}">Revisar AE</a></p>`)
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
    quad(1, 'cielo', 'Orientación', 'Cómo se lee la señal', `${contextBar()}<p>Una fila por estudiante. La señal usa el módulo más exigente: estaciones del recorrido y, si existe, el logro de selección. Requiere mayor apoyo: menos de 2 estaciones con recorrido iniciado, o logro bajo 60 %. Conviene observar: 2 o 3 estaciones, o logro entre 60 % y 79 %. Progreso esperado: 4 o 5 estaciones sin esas alertas.</p>`),
    quad(2, 'rosa', 'Atención', 'Requiere mayor apoyo', `<p>${support.length} estudiante${support.length === 1 ? '' : 's'}. ${names}</p><p class="pd-note">También hay ${counts.watch} a quienes conviene observar, ${counts.ok} con progreso esperado y ${counts.none} sin recorrido.</p>${peopleTable(support)}`, { lead: true, wide: true }),
    quad(3, 'ambar', 'Observación', 'Conviene observar', peopleTable(watch), { wide: true }),
    quad(4, 'menta', 'Avance', 'Progreso esperado', peopleTable(ok), { wide: true }),
    quad(5, 'lila', 'Sin recorrido', 'Todavía sin estaciones registradas', peopleTable(none)),
    quad(6, 'celeste', 'Decisión', 'Cómo acompañar', `<p>Cada fila ofrece un correo para contactar al estudiante y el detalle de estaciones, logro y prácticas por módulo. El cumplimiento de la fila no es el logro de la evaluación ni un porcentaje de perfil de egreso.</p><p><a href="${href('/portal-docente/oa-ae')}">Revisar AE</a> · <a href="${href('/portal-docente/cumplimiento')}">Ver cumplimiento del curso</a></p>`)
  ].join(''));
}
function learning() {
  const low = aeCoverage().filter(item => item.total).slice(0, 4);
  const lowBody = low.length ? `<div class="pd-stack">${low.map(item => {
    const ratio = Math.round(item.ratio * 100);
    const who = item.missing;
    const whoText = !who.length ? 'Todos los registros de la vista tienen algún paso en este AE.' : who.length > 6 ? `Sin evidencia en este AE: ${esc(who.slice(0, 6).join(', '))} y ${who.length - 6} más.` : `Sin evidencia en este AE: ${esc(who.join(', '))}.`;
    return `<article class="pd-card"><h3>${esc(item.ae.code || item.ae.title || 'AE')} · módulo ${item.module.position}</h3><p>${esc(item.ae.title || 'Sin enunciado cargado.')}</p>${bars([{ label: 'Con evidencia', value: ratio }])}<p class="pd-interp">${item.covered} de ${item.total} registros tienen algún paso. Es cobertura de evidencia, no nivel de logro. ${whoText}</p></article>`;
  }).join('')}</div>` : '<p class="pd-interp">No hay AE con registros suficientes para comparar evidencia.</p>';
  return frame([
    quad(1, 'cielo', 'Orientación', 'Qué parte del perfil se observa aquí', `${contextBar()}<p>El perfil de egreso de Refrigeración y Climatización es el conjunto de Objetivos de Aprendizaje de la especialidad y los Objetivos de Aprendizaje Genéricos. Esta vista observa los OA de los módulos 1 a 5. Los OA 7, 8 y 9 quedan en módulos posteriores.</p>`),
    quad(2, 'rosa', 'Atención', 'Aprendizajes con menos evidencia', lowBody, { lead: true }),
    quad(3, 'menta', 'Estado', 'Mapa de aprendizajes observados', `<p class="pd-note">El estado usa la misma señal de acompañamiento. La evolución compara las primeras y las últimas semanas cuando hay al menos 8 observaciones.</p>${profileMap()}`, { wide: true }),
    quad(4, 'ambar', 'Referencia', 'Objetivos de Aprendizaje Genéricos', `<p class="pd-note">Textos del programa de Refrigeración y Climatización. La columna «Dónde se observa» cita el criterio o el OA ya cargado. No es un porcentaje de perfil.</p>${oagTable()}`, { wide: true }),
    quad(5, 'lila', 'Evidencia', 'AE de los módulos 1 y 2', `<p>El porcentaje de cada barra es cobertura de evidencia en los registros del módulo.</p>${aeArticles(modulesIn(1, 2))}`, { wide: true }),
    quad(6, 'celeste', 'Decisión', 'AE de los módulos 3, 4 y 5', `${aeArticles(modulesIn(3, 5))}<p><a href="${href('/portal-docente/estudiantes')}">Ver estudiantes</a></p>`, { wide: true })
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
    ? '<p class="pd-interp">No hay registros para señalar un módulo con menor recorrido.</p>'
    : `<p>Módulo ${low.module.position}. ${esc(low.module.title)}</p><p class="pd-interp">Media de cumplimiento ${Math.round(low.value)} % en ${low.rows.length} registro${low.rows.length === 1 ? '' : 's'}. Esa cifra cuenta estaciones, no el nivel de logro.</p>`;
  const highText = !high
    ? '<p class="pd-interp">No hay registros para señalar un módulo con mayor recorrido.</p>'
    : same
      ? '<p class="pd-interp">Solo hay un módulo con registros, así que no hay un extremo alto distinto del anterior.</p>'
      : `<p>Módulo ${high.module.position}. ${esc(high.module.title)}</p><p class="pd-interp">Media de cumplimiento ${Math.round(high.value)} % en ${high.rows.length} registro${high.rows.length === 1 ? '' : 's'}.</p>`;
  return frame([
    quad(1, 'cielo', 'Orientación', 'Qué cuenta este indicador', `${contextBar()}<p>Cumplimiento cuenta estaciones del recorrido: contexto, AE, casos, evaluación y cierre. Logro, cuando existe, es el puntaje de la evaluación de selección sobre su máximo. Completar las cinco estaciones no equivale a un nivel de logro ni al perfil de egreso.</p>`),
    quad(2, 'rosa', 'Atención', 'Lectura del curso completo', central(values, 'el cumplimiento'), { lead: true }),
    quad(3, 'menta', 'Estado', 'Módulo con menor recorrido', lowText),
    quad(4, 'ambar', 'Comparación', 'Módulo con mayor recorrido', highText),
    quad(5, 'lila', 'Detalle', 'Los cinco módulos, uno al lado del otro', `<div class="pd-table-wrap"><table><thead><tr><th>Módulo</th><th>Nombre</th><th>Registros</th><th>Media</th><th>Mediana</th></tr></thead><tbody>${body}</tbody></table></div>`, { wide: true }),
    quad(6, 'celeste', 'Decisión', 'Dónde mirar después de este número', `<p>El detalle por estudiante está en Estudiantes. Si la media y la mediana se separan, conviene abrir ese listado antes de comunicar un solo porcentaje. Los AE con poca evidencia están en OA y AE.</p><p><a href="${href('/portal-docente/estudiantes')}">Ver estudiantes</a> · <a href="${href('/portal-docente/oa-ae')}">Revisar AE</a></p>`)
  ].join(''));
}
function reports() {
  const kpi = (((state.teacher || {}).kpi || {}).avance_porcentaje) || {};
  const values = scopedRecords().map(cumplimientoPct);
  const counts = signalCounts(studentGroups());
  const low = cumplimientoByModule().filter(item => item.value != null).sort((a, b) => a.value - b.value)[0];
  const avg = values.length ? Math.round(mean(values)) : null;
  const mid = values.length ? Math.round(median(values)) : null;
  const lowLine = low ? ` El módulo ${low.module.position} tiene la media de cumplimiento más baja de esta vista (${Math.round(low.value)} %).` : '';
  const headline = avg == null
    ? 'No hay registros para leer el curso.'
    : `El registro del medio está en ${mid} % de recorrido y el promedio en ${avg} %. ${counts.support} estudiantes requieren mayor apoyo.${lowLine} Esto cuenta estaciones hechas, no el nivel de logro.`;
  const fields = [
    ['Pregunta', '¿Cuánto del recorrido de cinco estaciones está registrado?'],
    ['Fórmula', kpi.formula || 'estaciones_completadas / 5 × 100'],
    ['Periodo', state.cohort ? '12 semanas de prácticas comparables en la cohorte de demostración.' : (kpi.periodo || 'Estado actual')],
    ['Población', 'Módulos 1 a 5, acotados por la búsqueda activa.']
  ];
  return frame([
    quad(1, 'cielo', 'Orientación', 'Para qué sirve este reporte', `${contextBar()}<p>Este reporte deja por escrito qué se está midiendo y qué se puede comunicar. Los gráficos de tendencia están en el Panel general.</p>`),
    quad(2, 'rosa', 'Atención', 'Lectura que se puede comunicar', `<p>${esc(headline)}</p>`, { lead: true }),
    quad(3, 'menta', 'Definición', 'El indicador, con su fórmula', `<div class="pd-table-wrap"><table><thead><tr><th>Campo</th><th>Definición</th></tr></thead><tbody>${fields.map(([key, value]) => `<tr><td>${esc(key)}</td><td>${esc(value)}</td></tr>`).join('')}</tbody></table></div>`),
    quad(4, 'ambar', 'Pantalla', 'Qué muestra esta vista', '<p>La pantalla usa la cohorte de demostración de 200 estudiantes para que las medias, la dispersión y las señales se puedan leer. Esos nombres no son el registro real del campus.</p>'),
    quad(5, 'lila', 'Archivo', 'Qué descarga el CSV', `<p>El archivo trae los registros reales del campus. Pueden ser menos que los 200 de la demostración, y no repite los gráficos de esta pantalla.</p><p><a href="/api/teacher/export.csv">Descargar CSV del cumplimiento del campus</a></p>`),
    quad(6, 'celeste', 'Decisión', 'Dónde está el resto de la evidencia', `<p>La tendencia del módulo 1 y la relación entre práctica y logro están en el Panel general. El listado por estudiante está en Estudiantes. El plan de cada módulo está en Cursos.</p><p><a href="${href('/portal-docente')}">Abrir el panel</a> · <a href="${href('/portal-docente/estudiantes')}">Ver estudiantes</a> · <a href="${href('/portal-docente/cursos')}">Ver la planificación</a></p>`)
  ].join(''));
}
function draw() {
  const tab = currentTab();
  nav();
  const body = { resumen: panel, cursos, estudiantes: students, 'oa-ae': learning, cumplimiento: compliance, reportes: reports }[tab.id]();
  document.getElementById('pd-main').innerHTML = body;
  document.title = `${tab.label} · Portal Docente`;
}
async function api(url) {
  const response = await fetch(url, { headers: { 'X-Aula-Portal': 'docente' } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo abrir el portal docente.');
  return data;
}
async function boot() {
  const params = new URLSearchParams(location.search);
  state.q = params.get('q') || '';
  const input = document.getElementById('pd-q');
  input.value = state.q;
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
  const name = (entered.user && entered.user.name) || 'Docente';
  document.getElementById('pd-name').textContent = name;
  document.getElementById('pd-avatar').textContent = name.slice(0, 1).toUpperCase();
  state.courses = await api('/api/courses');
  saveCourses(state.courses);
  state.teacher = await api('/api/teacher');
  applyCohort();
  input.addEventListener('input', event => {
    state.q = event.target.value;
    const url = new URL(location.href);
    const value = state.q.trim();
    if (value) url.searchParams.set('q', value);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url.pathname + url.search);
    draw();
  });
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
