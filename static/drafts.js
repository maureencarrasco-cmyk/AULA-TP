'use strict';
// Drafts never award progress. Account/module keys prevent accidental cross-account restoration.
const localDrafts = {
  prefix: 'aulatp:draft:v1:',
  enabled() { return auth.user?.role === 'student' && current && !current.state.closed; },
  activityKey(kind, data = {}) {
    if (kind === 'ae') return `ae:${data.ae ?? ae}:${data.step ?? step}`;
    if (kind === 'case') return `case:${data.index ?? caseIndex}`;
    return kind === 'draft' ? 'exam' : kind;
  },
  key(activity) { return `${this.prefix}${auth.user.id}:${current.id}:${activity}`; },
  baseline(activity) {
    const s = current.state, parts = activity.split(':');
    if (parts[0] === 'ae') return JSON.stringify(s.ae[`${parts[1]}-${parts[2]}`] ?? null);
    if (parts[0] === 'case') return JSON.stringify(s.cases[parts[1]] ?? null);
    if (activity === 'exam') return JSON.stringify([s.exam, s.draft]);
    if (activity === 'close') return JSON.stringify([s.reflection, s.plan, s.closed]);
    return JSON.stringify(s[activity] ?? null);
  },
  read(activity) {
    if (!this.enabled() || (activity === 'exam' && current.state.exam)) return null;
    try {
      const record = JSON.parse(localStorage.getItem(this.key(activity)) || 'null');
      if (!record) return null;
      if (record.baseline !== this.baseline(activity) || !record.values || typeof record.values !== 'object') {
        localStorage.removeItem(this.key(activity));
        return null;
      }
      return record.values;
    } catch { return null; }
  },
  write(activity, values, form) {
    if (!this.enabled()) return;
    try {
      localStorage.setItem(this.key(activity), JSON.stringify({baseline:this.baseline(activity), values}));
      this.status(form, 'Borrador guardado automáticamente en este navegador. Aún no entregado.');
    } catch {
      this.status(form, 'No se pudo guardar el borrador. Conserva esta pantalla y entrega tu respuesta antes de salir.');
    }
  },
  status(form, text) {
    if (!form) return;
    let node = form.querySelector('[data-autosave-status]');
    if (!node) {
      node = document.createElement('p');
      node.dataset.autosaveStatus = '';
      node.className = 'muted small autosave-status';
      node.setAttribute('role', 'status');
      form.append(node);
    }
    node.textContent = text;
  },
  restoreExam() {
    const values = this.read('exam');
    if (!values || !values.answers || typeof values.answers !== 'object') return;
    const answers = {};
    for (const [k,v] of Object.entries(values.answers)) {
      if (/^(?:[0-9]|1[0-9]|2[0-4])$/.test(k) && Number.isInteger(v) && v >= 0 && v <= 2) answers[k] = v;
    }
    examDraft = {answers, development:typeof values.development === 'string' ? values.development.slice(0,10000) : ''};
  },
  mount() {
    if (!this.enabled()) return;
    for (const kind of ['context','ae','case','scene','close','exam']) {
      const form = document.getElementById(`${kind}-form`);
      if (!form || (kind === 'exam' && current.state.exam)) continue;
      const activity = this.activityKey(kind);
      const saved = this.read(activity);
      if (kind !== 'exam' && saved) {
        for (const field of form.querySelectorAll('textarea[name], input[type="radio"][name]')) {
          if (field.type === 'radio') field.checked = saved[field.name] === field.value;
          else if (typeof saved[field.name] === 'string') field.value = saved[field.name].slice(0,10000);
        }
      }
      this.status(form, saved ? 'Borrador recuperado de este navegador. Aún no entregado.' : 'Guardado automático en este navegador al escribir. Entrega la respuesta para registrar tu avance.');
      const capture = () => {
        const values = kind === 'exam' ? structuredClone(examDraft) : Object.fromEntries(new FormData(form));
        this.write(activity, values, form);
      };
      form.addEventListener('input', capture);
      form.addEventListener('change', capture);
    }
  },
  discard(key) { try { localStorage.removeItem(key); } catch { /* Evidence was already committed. */ } }
};
