const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const analyticsEndpoint = '/api/analytics/events';
const analyticsQuery = new URLSearchParams(window.location.search);
const createClientId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};
const readOrCreate = (storage, key) => {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const created = createClientId();
    storage.setItem(key, created);
    return created;
  } catch {
    return createClientId();
  }
};
const analyticsVisitorId = readOrCreate(window.localStorage, 'aulatp_analytics_visitor');
const analyticsSessionId = readOrCreate(window.sessionStorage, 'aulatp_analytics_session');
const trackGoogleEvent = (eventName, params = {}) => {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
};
const trackEvent = (eventName) => {
  const payload = {
    event_name: eventName,
    page_path: window.location.pathname,
    visitor_id: analyticsVisitorId,
    session_id: analyticsSessionId,
    source: analyticsQuery.get('utm_source') || 'direct',
    medium: analyticsQuery.get('utm_medium') || undefined,
    campaign: analyticsQuery.get('utm_campaign') || undefined,
    term: analyticsQuery.get('utm_term') || undefined,
    content: analyticsQuery.get('utm_content') || undefined,
    referrer: document.referrer || undefined,
  };
  fetch(analyticsEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
};
trackEvent('page_view');

document.body.classList.remove('dark-original');
try { localStorage.removeItem('aulatp-theme'); } catch {}
const miningPromo = document.querySelector('#demo-mineria');
if (miningPromo && !document.querySelector('#demo-maritimo')) {
  miningPromo.insertAdjacentHTML('beforebegin', `
    <section class="maritime-promo section-pad" id="demo-maritimo">
      <div class="container">
        <div class="maritime-promo-shell">
          <div class="maritime-promo-copy reveal">
            <p class="eyebrow">Nueva demo 3D · Especialidad Marítimo</p>
            <h2>Del puerto a una maniobra <em>que se aprende</em></h2>
            <p>Explora un remolcador portuario en 3D y entrena observación, navegación, atraque y seguridad operacional en un entorno guiado, accesible desde el navegador.</p>
            <div class="maritime-promo-features">
              <span>✦ Remolcador 3D optimizado para la web</span>
              <span>✦ Navegación, atraque y seguridad operacional</span>
              <span>✦ Ruta guiada y evidencia para evaluación docente</span>
            </div>
            <a class="button button-maritime" href="/simuladores/maritimo">Explorar demo marítima <span aria-hidden="true">↗</span></a>
          </div>
          <div class="maritime-promo-visual reveal reveal-delay">
            <figure class="maritime-promo-photo"><img src="/landing/assets/maritime-tugboat-promo-v1.png" alt="Remolcador navegando en un puerto comercial para la demo marítima de Aula TP Chile" loading="lazy"></figure>
            <span class="maritime-promo-badge">NUEVA DEMO 3D · MARÍTIMO</span>
            <span class="maritime-promo-stamp">REMOLCADOR<br><small>WEBGL · AULA TP</small></span>
          </div>
        </div>
      </div>
    </section>
  `);
}
document.querySelectorAll('a[href="#contacto"]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('cta_click');
    trackGoogleEvent('select_content', { content_type: 'cta', item_id: 'diagnostico' });
  }, { passive: true });
});
document.querySelectorAll('[data-promo-cta]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('promotion_click');
    trackGoogleEvent('select_promotion', { promotion_id: 'demo_15_dias', promotion_name: 'Demo gratuita 15 dias' });
  }, { passive: true });
});
document.querySelectorAll('[data-contact-email]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('direct_email_click');
    trackGoogleEvent('select_content', { content_type: 'contact_email', item_id: 'aulatpchile_gmail' });
  }, { passive: true });
});
document.querySelectorAll('a[href*="youtube.com"]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('youtube_click');
    trackGoogleEvent('select_content', { content_type: 'youtube_channel', item_id: 'aula_tp_chile' });
  }, { passive: true });
});
document.querySelectorAll('a[href="/simulador/mineria"]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('mining_demo_click');
    trackGoogleEvent('select_content', { content_type: 'simulation_demo', item_id: 'mineria_jumbo' });
  }, { passive: true });
});
document.querySelectorAll('a[href="/simuladores/agropecuario"]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('agro_demo_click');
    trackGoogleEvent('select_content', { content_type: 'simulation_demo', item_id: 'agropecuaria_cultivo' });
  }, { passive: true });
});
document.querySelectorAll('a[href="/simuladores/enfermeria"]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('nursing_demo_click');
    trackGoogleEvent('select_content', { content_type: 'simulation_demo', item_id: 'enfermeria_clinica' });
  }, { passive: true });
});
document.querySelectorAll('a[href="/simuladores/maritimo"]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('maritime_demo_click');
    trackGoogleEvent('select_content', { content_type: 'simulation_demo', item_id: 'maritimo_remolcador' });
  }, { passive: true });
});
document.querySelectorAll('a[href="/estacion_sonrisa/"]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('smile_station_click');
    trackGoogleEvent('select_content', { content_type: 'commercial_3d_showcase', item_id: 'estacion_sonrisa' });
  }, { passive: true });
});
document.querySelectorAll('video').forEach((video) => {
  video.addEventListener('play', () => {
    trackEvent('demo_play');
    trackGoogleEvent('video_start', { video_title: video.querySelector('source')?.src || 'demo_aula_tp' });
  }, { once: true, passive: true });
});

window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 12), { passive: true });

const menuSymbol = menuToggle?.querySelector('.menu-symbol');
const menuSrOnly = menuToggle?.querySelector('.sr-only');
const setMobileNavOpen = (isOpen) => {
  if (!nav || !menuToggle) return;
  nav.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('nav-open', isOpen);
  if (menuSymbol) menuSymbol.textContent = isOpen ? '✕' : '☰';
  if (menuSrOnly) menuSrOnly.textContent = isOpen ? 'Cerrar menú' : 'Abrir menú';
  menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
};

menuToggle?.addEventListener('click', () => {
  setMobileNavOpen(!nav.classList.contains('is-open'));
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  setMobileNavOpen(false);
}));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
    setMobileNavOpen(false);
    menuToggle?.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1100 && nav?.classList.contains('is-open')) {
    setMobileNavOpen(false);
  }
}, { passive: true });

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }
}), { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

const prepareReveal = (element, index = 0) => {
  if (!prefersReducedMotion) {
    element.style.setProperty('--reveal-delay', `${Math.min((index % 6) * 70, 350)}ms`);
  } else {
    element.classList.add('is-visible');
  }
  observer.observe(element);
};

document.querySelectorAll('.reveal').forEach((element, index) => prepareReveal(element, index));

/* === text motion v2 === */
const splitTextMotionTargets = () => {
  if (prefersReducedMotion) return;

  const wrapUnits = (element, mode) => {
    if (element.dataset.tmSplit === '1') return;
    const htmlBreaks = /<br\s*\/?>/i.test(element.innerHTML);
    if (mode === 'lines' || htmlBreaks) {
      let parts;
      if (htmlBreaks) {
        parts = element.innerHTML.split(/<br\s*\/?>/i);
      } else {
        const plain = (element.textContent || '').trim();
        parts = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
        if (parts.length < 2) parts = [plain];
      }
      element.innerHTML = parts
        .map((part, i) => {
          const clean = String(part).replace(/<[^>]+>/g, '').trim();
          if (!clean) return '';
          return `<span class="tm-line" style="--tm-i:${i}">${clean}</span>`;
        })
        .filter(Boolean)
        .join('');
    } else {
      const words = (element.textContent || '').trim().split(/\s+/).filter(Boolean);
      element.innerHTML = words
        .map((word, i) => `<span class="tm-word" style="--tm-i:${i}">${word}</span>`)
        .join('<span class="tm-space" aria-hidden="true"> </span>');
    }
    element.dataset.tmSplit = '1';
    element.classList.add('tm-ready');
  };

  document.querySelectorAll('[data-text-motion]').forEach((el) => {
    wrapUnits(el, el.getAttribute('data-text-motion') || 'words');
    if (!el.closest('.reveal')) prepareReveal(el);
  });
};

splitTextMotionTargets();

const heroVisual = document.querySelector('.hero-v2-visual');
const heroVideo = heroVisual?.querySelector('video.hero-video');
const markHeroFallback = () => heroVisual?.classList.add('video-failed');
heroVideo?.addEventListener('error', markHeroFallback);
heroVideo?.querySelectorAll('source').forEach((source) => {
  source.addEventListener('error', markHeroFallback);
});
/* === end text motion v2 === */

// Los títulos se presentan como frases visuales, sin punto final.
document.querySelectorAll('h1, h2, h3').forEach((heading) => {
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);
  textNodes.forEach((textNode) => {
    textNode.textContent = textNode.textContent.replace(/[.,;:]+\s*$/, '');
  });
});

document.querySelectorAll('.upload-tile').forEach((element) => element.remove());

const form = document.querySelector('[data-contact-form]');
const status = document.querySelector('[data-form-status]');
const submitButton = form?.querySelector('button[type="submit"]');
// El landing y la API viven en el mismo dominio de DigitalOcean.
const leadsEndpoint = '/api/leads';
const tpSpecialties = [
  'Forestal', 'Muebles y Terminaciones en Madera', 'Agropecuaria',
  'Elaboración Industrial de Alimentos', 'Gastronomía', 'Construcción',
  'Instalaciones Sanitarias', 'Montaje Industrial', 'Refrigeración y Climatización',
  'Mecánica Automotriz', 'Mecánica Industrial', 'Mecánica de Mantenimiento de Aeronaves',
  'Construcciones Metálicas', 'Electricidad', 'Electrónica', 'Acuicultura',
  'Pesquería', 'Tripulación de Naves Mercantes y Especiales', 'Operaciones Portuarias',
  'Explotación Minera', 'Metalurgia Extractiva', 'Asistencia en Geología', 'Gráfica',
  'Dibujo Técnico', 'Vestuario y Confección Textil', 'Administración', 'Contabilidad',
  'Atención de Párvulos', 'Atención de Enfermería', 'Química Industrial',
  'Conectividad y Redes', 'Telecomunicaciones', 'Programación', 'Servicios de Hotelería',
  'Servicios de Turismo',
];

const specialtyCatalog = {
  Maderero: { icon: '🌲', description: 'Diseño, transformación y uso responsable de la madera.' },
  Agropecuario: { icon: '🌾', description: 'Producción agropecuaria, recursos naturales y tecnología aplicada al campo.' },
  Alimentación: { icon: '🍽️', description: 'Elaboración, manipulación y gestión de alimentos con estándares de calidad.' },
  Construcción: { icon: '🏗️', description: 'Obras, instalaciones y soluciones técnicas para entornos construidos.' },
  Metalmecánica: { icon: '⚙️', description: 'Diseño, mantenimiento y operación de sistemas mecánicos e industriales.' },
  Electricidad: { icon: '⚡', description: 'Circuitos, instalaciones y sistemas eléctricos seguros y eficientes.' },
  Marítimo: { icon: '⚓', description: 'Operaciones, navegación y servicios vinculados al entorno marítimo.' },
  Minero: { icon: '⛏️', description: 'Procesos mineros, geología y operación responsable de recursos.' },
  Gráfico: { icon: '✏️', description: 'Comunicación visual, representación técnica y producción gráfica.' },
  Confección: { icon: '🧵', description: 'Diseño, producción y control de prendas y productos textiles.' },
  Administración: { icon: '📊', description: 'Gestión administrativa, contable y organizacional para empresas.' },
  'Salud y Educación': { icon: '✚', description: 'Atención, cuidado y apoyo a personas en contextos de salud y educación.' },
  'Química e Industria': { icon: '🧪', description: 'Procesos químicos, control y transformación de materiales industriales.' },
  'Tecnología y Comunicaciones': { icon: '💻', description: 'Programación, redes, conectividad y soluciones digitales.' },
  'Hotelería y Turismo': { icon: '🧭', description: 'Servicios de hospitalidad, turismo y experiencias para visitantes.' },
};
const specialtySectorOrder = Object.keys(specialtyCatalog);
const specialtyGrid = document.querySelector('.specialty-grid');
if (specialtyGrid) {
  const cards = [...specialtyGrid.querySelectorAll(':scope > article')];
  const groups = new Map();
  cards.forEach((card) => {
    const sector = card.querySelector('.specialty-sector')?.textContent.trim() || 'Otros';
    const title = card.querySelector('h3')?.textContent.trim() || '';
    const info = specialtyCatalog[sector] || { icon: '✦', description: 'Formación técnico-profesional aplicada a contextos reales.' };
    card.setAttribute('tabindex', '0');
    card.dataset.sector = sector;
    card.setAttribute('aria-label', `${title}. Sector ${sector}. ${info.description}`);
    // Keep sector chip in DOM for semantics; visually quieted via CSS inside groups.
    const sectorChip = card.querySelector('.specialty-sector');
    if (sectorChip) sectorChip.setAttribute('aria-hidden', 'true');
    if (!groups.has(sector)) groups.set(sector, []);
    groups.get(sector).push(card);
  });

  const fragment = document.createDocumentFragment();
  [...specialtySectorOrder, ...groups.keys()].filter((sector, index, list) => list.indexOf(sector) === index).forEach((sector) => {
    const info = specialtyCatalog[sector] || { icon: '✦', description: 'Formación técnico-profesional aplicada a contextos reales.' };
    const sectorCards = groups.get(sector) || [];
    if (!sectorCards.length) return;
    const countLabel = sectorCards.length === 1 ? '1 especialidad' : `${sectorCards.length} especialidades`;
    const group = document.createElement('section');
    group.className = 'specialty-group reveal';
    group.dataset.sector = sector;
    group.setAttribute('aria-label', `Sector ${sector}, ${countLabel}`);
    group.innerHTML = `<div class="specialty-group-heading"><span class="specialty-group-icon" aria-hidden="true">${info.icon}</span><div><p>Sector formativo · ${countLabel}</p><h3>${sector}</h3><small>${info.description}</small></div></div>`;
    const groupGrid = document.createElement('div');
    groupGrid.className = 'specialty-group-grid';
    sectorCards.forEach((card) => groupGrid.append(card));
    group.append(groupGrid);
    fragment.append(group);
  });
  specialtyGrid.replaceChildren(fragment);
  document.querySelectorAll('.specialty-group.reveal').forEach((element, index) => prepareReveal(element, index));
}

const programSelect = form?.querySelector('select[name="program"]');
if (programSelect) {
  programSelect.innerHTML = '<option value="" disabled selected>Selecciona una especialidad</option>';
  tpSpecialties.forEach((specialty) => {
    const option = document.createElement('option');
    option.value = specialty;
    option.textContent = specialty;
    programSelect.appendChild(option);
  });
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  const query = new URLSearchParams(window.location.search);

  payload.source = payload.source || 'landing';
  payload.medium = query.get('utm_medium') || undefined;
  payload.campaign = query.get('utm_campaign') || undefined;
  payload.term = query.get('utm_term') || undefined;
  payload.content = query.get('utm_content') || undefined;
  payload.landing_page = window.location.href;
  payload.referrer = document.referrer || undefined;

  if (submitButton) submitButton.disabled = true;
  if (status) {
    status.classList.remove('is-error');
    status.textContent = 'Enviando solicitud…';
  }

  try {
    const response = await fetch(leadsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`La API respondió con HTTP ${response.status}`);
    }

    trackEvent('form_submit');
    trackGoogleEvent('generate_lead', {
      method: 'contact_form',
      program: payload.program || 'sin_especialidad',
    });
    if (status) status.textContent = 'Gracias. Recibimos su solicitud y nos pondremos en contacto pronto.';
    document.dispatchEvent(new CustomEvent('aulatp:sound', { detail: { type: 'success' } }));
    form.reset();
  } catch (error) {
    console.error('No se pudo enviar la solicitud comercial:', error);
    if (status) {
      status.classList.add('is-error');
      status.textContent = 'No pudimos enviar la solicitud. Intente nuevamente o contáctenos directamente.';
    }
    document.dispatchEvent(new CustomEvent('aulatp:sound', { detail: { type: 'alert' } }));
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

const uploadInput = document.querySelector('[data-video-upload]');
const uploadPreview = document.querySelector('[data-upload-preview]');
const uploadStatus = document.querySelector('[data-upload-status]');
uploadInput?.addEventListener('change', () => {
  const [file] = uploadInput.files || [];
  if (!file) return;
  uploadPreview.src = URL.createObjectURL(file);
  uploadPreview.hidden = false;
  uploadStatus.textContent = `${file.name} listo para previsualizar. La carga permanente se conectará al panel privado.`;
});

document.querySelectorAll('[data-testimonial-slot]').forEach((button) => {
  button.addEventListener('click', () => {
    button.textContent = 'Disponible para incorporar contenido';
  });
});
