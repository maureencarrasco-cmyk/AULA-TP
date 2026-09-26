'use strict';
/**
 * Aula TP · lógica de menús
 * Tres chromes excluyentes: público, estudiante, docente.
 * Cadena canónica: Contextualización → AE → Situación integradora → Evaluación → Cierre.
 * En Evaluación Final (estación 4) se ocultan Tutor y Práctica Libre al estudiante.
 */
(function () {
  const ADMIN_TEXT = /revisi[oó]n administrador|desbloquear navegaci[oó]n|avanzar pantalla|reiniciar revisi[oó]n|ir a situaci[oó]n integradora/i;
  const SUPPORT_TEXT = /apoyos aula tp|herramientas de apoyo|herramientas locales/i;
  const STATION_NAMES = ['', 'Contextualización', 'Aprendizajes esperados', 'Situación integradora', 'Evaluación final', 'Cierre'];
  let applying = false;

  function role() {
    const fromBody = document.body.dataset.role;
    if (fromBody) return fromBody;
    try {
      if (typeof auth !== 'undefined' && auth && auth.user) return auth.user.role;
    } catch (e) { /* app aún no hidrata */ }
    return '';
  }

  function inferScreen() {
    if (document.body.dataset.screen) return document.body.dataset.screen;
    const hash = (location.hash || '').replace(/^#/, '');
    if (!hash || hash === 'login') return document.querySelector('#login, .login-card, [data-login]') ? 'login' : '';
    if (/^courses?$/.test(hash) || hash === 'catalogo') return 'courses';
    if (hash.startsWith('module')) return 'module';
    if (hash.startsWith('course')) return 'course';
    if (hash.startsWith('teacher') || hash.startsWith('follow')) return 'teacher';
    if (hash.startsWith('editor')) return 'editor';
    return '';
  }

  function station() {
    const ds = document.body.dataset.station;
    if (ds) return Number(ds);
    try {
      if (typeof view !== 'undefined' && view && view.station) return Number(view.station);
    } catch (e) { /* sin vista */ }
    const hash = (location.hash || '');
    const m = hash.match(/module\/\d+\/(\d+)/);
    if (m) return Number(m[1]);
    return 0;
  }

  function chrome() {
    const r = role();
    if (r === 'teacher') return 'teacher';
    if (r === 'student') return 'student';
    return 'public';
  }

  function applyChrome() {
    if (applying) return;
    applying = true;
    try {
      const c = chrome();
      const st = station();
      const screen = inferScreen();
      const b = document.body;
      if (b.dataset.chrome !== c) b.dataset.chrome = c;
      if (screen && b.dataset.screen !== screen) b.dataset.screen = screen;
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
      hideHomeChrome(c, screen);
      labelPrimaryNav(c, st);
    } finally {
      applying = false;
    }
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
    const hideAids = exam && c !== 'teacher';
    document.querySelectorAll('[data-action="practice"], [data-open="practice"], #practice-free, .practice-free, [data-practice-free]').forEach(el => {
      el.hidden = hideAids;
      if (hideAids) el.setAttribute('aria-disabled', 'true');
      else el.removeAttribute('aria-disabled');
    });
    document.querySelectorAll('#agent-panel, .agent-panel, [data-agent], #tutor-panel, [data-open="tutor"], [data-action="tutor"]').forEach(el => {
      if (hideAids) {
        el.setAttribute('data-exam-silent', '1');
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
        const input = el.querySelector('textarea, input[type="text"]');
        if (input) {
          input.disabled = true;
          input.placeholder = 'En Evaluación Final el tutor no orienta el contenido.';
        }
      } else {
        el.removeAttribute('data-exam-silent');
        el.hidden = false;
        el.setAttribute('aria-hidden', 'false');
        const input = el.querySelector('textarea, input[type="text"]');
        if (input) input.disabled = false;
      }
    });
  }

  function hideHomeChrome(c, screen) {
    const hideNavChrome = c === 'public' || screen === 'courses' || screen === 'login';
    document.querySelectorAll('.floating-back-button, .tools-fab, .tools-fab-backdrop, .tools-fab-layer, [data-open="support"]').forEach(el => {
      el.hidden = hideNavChrome;
      el.setAttribute('aria-hidden', hideNavChrome ? 'true' : 'false');
    });
    if (!hideNavChrome) return;
    document.querySelectorAll('button, a, [role="button"]').forEach(el => {
      const txt = (el.textContent || '').trim();
      if (SUPPORT_TEXT.test(txt)) {
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function labelPrimaryNav(c, st) {
    const nav = document.querySelector('nav.primary, header nav, #app-nav');
    if (nav) {
      nav.dataset.chrome = c;
      nav.querySelectorAll('[data-nav="editor"], [data-nav="teacher"], [data-nav="enroll"]').forEach(el => {
        el.hidden = c !== 'teacher';
      });
    }
    const crumbs = document.getElementById('station-crumb');
    if (crumbs && st) crumbs.textContent = STATION_NAMES[st] || '';
    const route = document.getElementById('station-route');
    if (route && st) {
      route.innerHTML = STATION_NAMES.slice(1).map((name, i) => {
        const n = i + 1;
        const state = n < st ? 'done' : n === st ? 'current' : 'todo';
        return `<li data-station-step="${n}" data-state="${state}">${n}. ${name}</li>`;
      }).join('');
    }
  }

  const obs = new MutationObserver(() => applyChrome());
  function boot() {
    applyChrome();
    obs.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-role', 'data-station', 'data-screen']
    });
    document.addEventListener('aula:view', applyChrome);
    document.addEventListener('aula:station', applyChrome);
    window.addEventListener('hashchange', applyChrome);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.AulaMenu = {apply: applyChrome, chrome, station, role, inferScreen, STATION_NAMES};
})();
