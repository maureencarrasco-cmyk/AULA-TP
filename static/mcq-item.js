'use strict';
/* Molde único A–D. No traduce nombres: mcqItemMarkup, options, form, pack. */
const MCQ_LETTERS = ['A', 'B', 'C', 'D'];

function mcqEsc(v) {
  return typeof esc === 'function' ? esc(v) : String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function mcqPhotoSrc(item) {
  const src = item && (item.image || item.photo);
  if (!src) return '';
  return String(src).split('?')[0] + (String(src).includes('?') ? src.slice(src.indexOf('?')) : '?v=mcq1');
}

function mcqChipLabel(item, opts) {
  const pack = item.pack || {};
  if (pack.pack_id && pack.pack_total > 1) {
    return `Caso ${pack.pack_label || pack.pack_id} · pregunta ${pack.pack_index} de ${pack.pack_total}`;
  }
  const index = (opts.index || 1);
  const total = opts.total || 1;
  if (opts.exam) return `Ítem ${index} de ${total}`;
  return `Ítem ${index} de ${total}`;
}

function mcqMedia(item) {
  const form = Number(item.form || item.mcq_form || 1);
  const photo = mcqPhotoSrc(item);
  const alt = item.alt || 'Foto real del oficio. El objeto está centrado para leer el dato, no la respuesta.';
  const photoFig = photo
    ? `<figure class="mcq-figure"><img src="${mcqEsc(photo)}" alt="${mcqEsc(alt)}" decoding="async"><figcaption>${mcqEsc(item.caption || 'Foto real del oficio · simulación')}</figcaption></figure>`
    : `<p class="muted small">Falta la foto real de este ítem. No se publica un módulo sin imagen.</p>`;
  const illus = item.illustration
    ? `<figure class="mcq-figure"><img src="${mcqEsc(item.illustration)}" alt="Ilustración técnica del mismo equipo. Acompaña; no reemplaza la foto." decoding="async"><figcaption>Ilustración técnica del mismo equipo</figcaption></figure>`
    : '';
  const pictos = (item.pictograms || []).map(p => `<span class="mcq-picto">${mcqEsc(p.label || p)}</span>`).join('');
  const table = item.table && item.table.length
    ? `<div class="mcq-table-wrap"><table class="mcq-table">${item.table.map((row, i) => `<tr>${row.map(cell => i ? `<td>${mcqEsc(cell)}</td>` : `<th>${mcqEsc(cell)}</th>`).join('')}</tr>`).join('')}</table></div>`
    : '';
  const formula = item.formula ? `<p class="mcq-formula">${mcqEsc(item.formula)}</p>` : '';
  const chart = item.chart ? `<p class="mcq-chart">${mcqEsc(item.chart)}</p>` : '';
  const doc = item.document && typeof professionalDocument === 'function'
    ? professionalDocument(item.document)
    : (item.document ? `<pre class="mcq-formula">${mcqEsc(item.document)}</pre>` : '');

  if (form === 2) return `<div class="mcq-pictos">${pictos}</div><div class="mcq-media">${photoFig}</div>`;
  if (form === 3) return `<div class="mcq-media is-pair">${photoFig}${illus || photoFig}</div>`;
  if (form === 5) return `${table}<div class="mcq-media">${photoFig}</div>`;
  if (form === 6) return `${formula}<div class="mcq-media">${photoFig}</div>`;
  if (form === 7) return `${chart}<div class="mcq-media">${photoFig}</div>`;
  if (form === 9 && doc) return `${doc}<div class="mcq-media">${photoFig}</div>`;
  return `<div class="mcq-media">${photoFig}</div>`;
}

function mcqOptions(item, opts) {
  const name = opts.name || 'choice';
  const selected = opts.selected;
  const required = opts.required ? 'required' : '';
  const form = Number(item.form || 1);
  const imgs = item.option_images || [];
  return `<fieldset class="mcq-options" data-field="choice"><legend class="sr-only">Selecciona una alternativa A, B, C o D</legend>${(item.options || []).slice(0, 4).map((o, i) => {
    const img = form === 8 && imgs[i] ? `<img class="mcq-opt-img" src="${mcqEsc(imgs[i])}" alt="">` : '';
    return `<label class="option"><input type="radio" name="${mcqEsc(name)}" value="${i}" ${selected === i ? 'checked' : ''} ${required}><b>${MCQ_LETTERS[i]}</b>${img}<span>${mcqEsc(o)}</span></label>`;
  }).join('')}</fieldset>`;
}

function mcqItemMarkup(item, opts) {
  opts = opts || {};
  if (!item) return '';
  const exam = !!opts.exam;
  const stimulus = item.stimulus || item.lead || item.context || '';
  const prompt = item.question || item.prompt || item.title || '';
  const chips = [];
  if (exam) chips.push('<span class="mcq-chip is-exam">Evaluación final</span>');
  chips.push(`<span class="mcq-chip ${item.pack ? 'is-pack' : ''}">${mcqEsc(mcqChipLabel(item, opts))}</span>`);
  return `<article class="mcq-card" data-exam="${exam ? 1 : 0}" data-form="${Number(item.form || 1)}">
    <div class="mcq-toolbar">${chips.join('')}</div>
    ${stimulus ? `<p class="mcq-stimulus">${mcqEsc(stimulus)}</p>` : ''}
    ${mcqMedia(item)}
    <h3 class="mcq-prompt">${mcqEsc(prompt)}</h3>
    ${mcqOptions(item, opts)}
  </article>`;
}

function mcqDevelopmentBanner() {
  return '<p class="mcq-dev-banner" role="status">Esta pregunta no es de alternativa</p>';
}
