'use strict';
/**
 * Aula TP · lógica de menús
 * Tres chromes excluyentes: público, estudiante, docente.
 * En Evaluación Final (estación 4) se apagan Tutor y Práctica Libre.
 * El catálogo ya no marca Electricidad / Enfermería como «próximamente»:
 * el estado sale de data-status o de módulos publicados.
 */
(function () {
  const ADMIN_TEXT = /revisi[oó]n administrador|desbloquear navegaci[oó]n|avanzar pantalla|reiniciar revisi[oó]n|ir a situaci[oó]n integradora/i;

  function role() {
    const fromBody = document.body.dataset.role;
    if (fromBody) return fromBody;
    try {
      if (typeof auth !== 'undefined' && auth && auth.user) return auth.user.role;
    } catch (e) { /* app aún no hidrata */ }
    return '';
  }

  function station() {
    const ds = document.body.dataset.station;
    if (ds) return Number(ds);
    try {
      if (typeof view !== 'undefined' && view && view.station) return Number(view.station);
    } catch (e) { /* sin vista */ }
    return 0;
  }

  function chrome() {
    const r = role();
    if (r === 'teacher') return 'teacher';
    if (r === 'student') return 'student';
    return 'public';
  }

  function applyChrome() {
    const c = chrome();
    const st = station();
    const b = document.body;
    b.dataset.chrome = c;
    if (st) {
      const nextStation = String(st);
      if (b.dataset.station !== nextStation) b.dataset.station = nextStation;
    }
    b.classList.toggle('chrome-public', c === 'public');
    b.classList.toggle('chrome-student', c === 'student');
    b.classList.toggle('chrome-teacher', c === 'teacher');
    b.classList.toggle('station-exam', st === 4);
    hideAdminForStudent(c);
    gateExamAids(st, c);
    hideHomeBack(c);
    labelPrimaryNav(c, st);
  }

  function hideAdminForStudent(c) {
    if (c === 'teacher') return;
    document.querySelectorAll('[data-admin-only], .admin-tools, .review-admin, [data-review-admin]').forEach(el => {
      el.hidden = true;
      el.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('button, a, [role="button"]').forEach(el => {
      const txt = (el.textContent || '').trim();
      if (ADMIN_TEXT.test(txt)) {
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function gateExamAids(st, c) {
    const exam = st === 4;
    document.querySelectorAll('[data-action="practice"], [data-open="practice"], #practice-free, .practice-free, [data-practice-free]').forEach(el => {
      if (exam && c !== 'teacher') {
        el.hidden = true;
        el.setAttribute('aria-disabled', 'true');
      } else {
        el.hidden = false;
        el.removeAttribute('aria-disabled');
      }
    });
    document.querySelectorAll('#agent-panel, .agent-panel, [data-agent], #tutor-panel').forEach(el => {
      if (exam && c !== 'teacher') {
        el.setAttribute('data-exam-silent', '1');
        const input = el.querySelector('textarea, input[type="text"]');
        if (input) {
          input.disabled = true;
          input.placeholder = 'En Evaluación Final el tutor no orienta el contenido.';
        }
      } else {
        el.removeAttribute('data-exam-silent');
        const input = el.querySelector('textarea, input[type="text"]');
        if (input) input.disabled = false;
      }
    });
  }

  function hideHomeBack(c) {
    const screen = document.body.dataset.screen;
    document.querySelectorAll('.floating-back-button').forEach(el => {
      const hide = c === 'public' || screen === 'courses' || screen === 'login';
      el.hidden = hide;
      el.setAttribute('aria-hidden', hide ? 'true' : 'false');
    });
  }

  function labelPrimaryNav(c, st) {
    const nav = document.querySelector('nav.primary, header nav, #app-nav');
    if (!nav) return;
    nav.dataset.chrome = c;
    if (c !== 'teacher') {
      nav.querySelectorAll('[data-nav="editor"], [data-nav="teacher"], [data-nav="enroll"]').forEach(el => {
        el.hidden = true;
      });
    } else {
      nav.querySelectorAll('[data-nav="editor"], [data-nav="teacher"]').forEach(el => {
        el.hidden = false;
      });
    }
    const crumbs = document.getElementById('station-crumb');
    if (crumbs && st) {
      const names = ['', 'Contextualización', 'Aprendizajes esperados', 'Situación integradora', 'Evaluación final', 'Cierre'];
      crumbs.textContent = names[st] || '';
    }
  }

  const obs = new MutationObserver(() => applyChrome());
  function boot() {
    applyChrome();
    obs.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['data-role', 'data-station', 'data-screen', 'class']});
    document.addEventListener('aula:view', applyChrome);
    document.addEventListener('aula:station', applyChrome);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.AulaMenu = {apply: applyChrome, chrome, station, role};
})();
