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

/* === catálogo nacional TP: filtros, vista y detalle de especialidad === */
(() => {
  const catalog = document.querySelector('.sector-catalog');
  if (!catalog) return;

  const section = catalog.closest('.specialties');
  if (!section) return;

  const sectorRows = [...catalog.querySelectorAll(':scope > .sector-row')];
  const normalize = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const sectorImageKeys = {
    maderero: 'maderero',
    agropecuario: 'agropecuario',
    alimentacion: 'alimentacion',
    construccion: 'construccion',
    metalmecanica: 'metalmecanica',
    electricidad: 'electricidad',
    maritimo: 'maritimo',
    minero: 'minero',
    grafico: 'grafico',
    confeccion: 'confeccion',
    administracion: 'administracion',
    salud: 'salud',
    quimica: 'quimica',
    tecnologia: 'tecnologia',
    hoteleria: 'hoteleria',
  };

  const specialtyImages = {
    'Refrigeración y Climatización': '/images/climatizacion/climatizacion-hero-v2.png',
    Electricidad: '/images/portal-docente/cursos/electricidad.png',
    'Atención de Enfermería': '/images/portal-docente/cursos/enfermeria.png',
    Administración: '/landing/assets/especialidades/sector-administracion.png',
  };

  // Estas descripciones corresponden al catálogo de rutas existente en course-hubs.ts.
  const specialtyDescriptions = {
    'Forestal': 'Silvicultura, operaciones de cosecha y seguridad en el recurso bosque.',
    'Muebles y Terminaciones en Madera': 'Trazado, maquinado, ensamble y acabado de un mueble o terminación.',
    'Agropecuaria': 'Producción vegetal y animal, recursos y prácticas sustentables en un predio formativo.',
    'Elaboración Industrial de Alimentos': 'Líneas de proceso, inocuidad y control de calidad en planta de alimentos.',
    'Gastronomía': 'Cocina, higiene de alimentos y servicio, con estaciones de mise en place, producción y servicio seguro.',
    'Construcción': 'Obras, lectura de planos, seguridad en faena y ejecución de partidas constructivas.',
    'Instalaciones Sanitarias': 'Agua potable y evacuación: planos, trazado, uniones y pruebas de hermeticidad.',
    'Montaje Industrial': 'Montaje de estructuras y equipos con planos, izaje, alineación y seguridad.',
    'Refrigeración y Climatización': 'Curso completo M1–M8 · 3° y 4° medio · ruta obligatoria + Práctica Libre. Entra por el módulo que te corresponde y avanza con estaciones AE.',
    'Mecánica Automotriz': 'Diagnóstico y mantención de sistemas del vehículo con pauta y seguridad.',
    'Mecánica Industrial': 'Mantenimiento de maquinaria: diagnóstico, ajuste y lubricación segura.',
    'Mecánica de Mantenimiento de Aeronaves': 'Inspección, fichas técnicas y cultura de seguridad aeronáutica.',
    'Construcciones Metálicas': 'Trazado, corte, soldadura y montaje de estructuras metálicas.',
    'Electricidad': 'Ruta técnica M1–M4 · motores y calefacción, instalaciones domiciliarias, proyectos y mantenimiento.',
    'Electrónica': 'Circuitos, ensamble, medición y diagnóstico de fallas en sistemas electrónicos básicos.',
    'Acuicultura': 'Cultivo, calidad de agua y bioseguridad en un centro formativo.',
    'Pesquería': 'Faena pesquera, conservación de la captura y seguridad a bordo.',
    'Tripulación de Naves Mercantes y Especiales': 'Guardia, faenas de cubierta y procedimientos de emergencia a bordo.',
    'Operaciones Portuarias': 'Transferencia de carga, señalización y seguridad en recinto portuario.',
    'Explotación Minera': 'Ciclo de mina, seguridad y operación de equipos en un escenario formativo.',
    'Metalurgia Extractiva': 'Chancado, molienda, flotación y control de proceso en planta piloto.',
    'Asistencia en Geología': 'Muestreo, registro de terreno y apoyo a campañas geológicas.',
    'Gráfica': 'Diseño y producción impresa/digital: originales, preprensa y control de color.',
    'Dibujo Técnico': 'Representación gráfica, normas de acotado y comunicación visual de proyectos.',
    'Vestuario y Confección Textil': 'Patronaje, corte, costura y terminaciones con control de calidad de prenda.',
    'Administración': 'Plan 3° MINEDUC con el ERP Bazar Inteligente como taller: ventas, inventario, caja, proveedores y contabilidad.',
    'Contabilidad': 'Registra operaciones, controla documentos tributarios y apoya la información económica del establecimiento o empresa.',
    'Atención de Párvulos': 'Cuidado y educación inicial: bienestar, juego y registro en aula.',
    'Atención de Enfermería': 'Ruta clínica M1–M5 · cuidados básicos, parámetros, promoción, bioseguridad y registro.',
    'Química Industrial': 'Procesos, muestreo, control de calidad y seguridad de planta química.',
    'Conectividad y Redes': 'Cableado, direccionamiento, verificación de enlace y documentación de red.',
    'Telecomunicaciones': 'Enlaces, medición y puesta en servicio de un sistema de telecomunicaciones.',
    'Programación': 'Lógica, desarrollo de un caso y pruebas: misma ruta de estaciones AE.',
    'Servicios de Hotelería': 'Recepción, pisos y calidad de servicio en un hotel formativo.',
    'Servicios de Turismo': 'Atención al visitante, diseño de experiencia e información territorial.',
  };

  const rows = sectorRows.map((row) => {
    const card = row.querySelector('.sector-card');
    const image = card?.querySelector('img');
    const sector = card?.dataset.sector || '';
    const sectorName = card?.querySelector('h3')?.textContent.trim() || sector;
    const sectorDescription = card?.querySelector('.sector-card-body p')?.textContent.trim() || '';
    const imagePath = `/landing/assets/especialidades/sector-${sectorImageKeys[sector] || sector}.png`;
    if (image) {
      image.src = imagePath;
      image.addEventListener('error', () => {
        image.closest('.sector-card-media')?.classList.add('sector-card-media--placeholder');
      }, { once: true });
    }
    const specialties = [...row.querySelectorAll('.sector-chip')].map((chip) => ({
      name: chip.textContent.trim(),
      href: chip.getAttribute('href') || '#',
      element: chip,
    }));
    return { row, card, sector, sectorName, sectorDescription, imagePath, specialties };
  });

  const allSpecialties = rows.flatMap((item) => item.specialties.map((specialty) => specialty.name));
  const specialtyNames = [...new Set(allSpecialties)];
  const sectorNames = rows.map((item) => item.sectorName);

  const toolbar = document.createElement('div');
  toolbar.className = 'catalog-toolbar';
  toolbar.setAttribute('aria-label', 'Filtros y vista del catálogo nacional TP');
  toolbar.innerHTML = `
    <label class="catalog-search">
      <span class="sr-only">Buscar sector o especialidad</span>
      <input type="search" data-catalog-search placeholder="Buscar sector o especialidad…" autocomplete="off" />
    </label>
    <button type="button" class="catalog-filter-all is-active" data-catalog-all aria-pressed="true">Todos</button>
    <select data-catalog-sector aria-label="Filtrar por sector">
      <option value="">Todos</option>
      ${sectorNames.map((name) => `<option value="${normalize(name)}">${name}</option>`).join('')}
    </select>
    <select data-catalog-specialty aria-label="Filtrar por especialidad">
      <option value="">Especialidad</option>
      ${specialtyNames.map((name) => `<option value="${normalize(name)}">${name}</option>`).join('')}
    </select>
    <button type="button" class="catalog-reset-button" data-catalog-reset>↻ Limpiar filtros</button>
    <div class="catalog-toolbar-view" role="group" aria-label="Cambiar vista del catálogo">
      <button type="button" class="catalog-view-toggle is-active" data-catalog-view="cards" aria-pressed="true">▦ Tarjetas</button>
      <button type="button" class="catalog-view-toggle" data-catalog-view="list" aria-pressed="false">☷ Lista</button>
    </div>
    <output class="catalog-result-count" data-catalog-count></output>
  `;
  const summary = section.querySelector('.catalog-summary');
  summary?.insertAdjacentElement('afterend', toolbar);

  const detail = document.createElement('aside');
  detail.className = 'catalog-specialty-detail';
  detail.hidden = true;
  detail.setAttribute('data-catalog-detail', '');
  detail.setAttribute('aria-live', 'polite');
  detail.innerHTML = `
    <img data-catalog-detail-image alt="" loading="lazy" decoding="async" />
    <div>
      <small data-catalog-detail-sector></small>
      <h3 data-catalog-detail-title></h3>
      <p data-catalog-detail-description></p>
      <a data-catalog-detail-link href="#">Abrir especialidad <span aria-hidden="true">›</span></a>
    </div>
  `;
  toolbar.insertAdjacentElement('afterend', detail);

  const searchInput = toolbar.querySelector('[data-catalog-search]');
  const sectorSelect = toolbar.querySelector('[data-catalog-sector]');
  const specialtySelect = toolbar.querySelector('[data-catalog-specialty]');
  const countOutput = toolbar.querySelector('[data-catalog-count]');
  const allButton = toolbar.querySelector('[data-catalog-all]');

  const showDetail = (item, specialty) => {
    if (!item || !specialty) return;
    const image = detail.querySelector('[data-catalog-detail-image]');
    const description = specialtyDescriptions[specialty.name] || item.sectorDescription;
    const specialtyImage = specialtyImages[specialty.name] || item.imagePath;
    image.src = specialtyImage;
    image.alt = `${specialty.name} · ${item.sectorName}`;
    image.onerror = () => { image.src = item.imagePath; };
    detail.querySelector('[data-catalog-detail-sector]').textContent = `Sector · ${item.sectorName}`;
    detail.querySelector('[data-catalog-detail-title]').textContent = specialty.name;
    detail.querySelector('[data-catalog-detail-description]').textContent = description;
    const link = detail.querySelector('[data-catalog-detail-link]');
    link.href = specialty.href;
    detail.hidden = false;
    rows.forEach(({ specialties }) => specialties.forEach(({ element }) => element.classList.remove('is-selected')));
    specialty.element.classList.add('is-selected');
  };

  const updateFilters = () => {
    const query = normalize(searchInput.value);
    const selectedSector = sectorSelect.value;
    const selectedSpecialty = specialtySelect.value;
    let visibleRows = 0;
    let visibleSpecialties = 0;

    rows.forEach((item) => {
      const sectorMatches = !selectedSector || normalize(item.sectorName) === selectedSector;
      const specialtyMatches = !selectedSpecialty || item.specialties.some(({ name }) => normalize(name) === selectedSpecialty);
      const queryMatches = !query || normalize(`${item.sectorName} ${item.sectorDescription} ${item.specialties.map(({ name }) => name).join(' ')}`).includes(query);
      const visible = sectorMatches && specialtyMatches && queryMatches;
      item.row.hidden = !visible;
      item.specialties.forEach(({ element }) => {
        const matches = !selectedSpecialty || normalize(element.textContent) === selectedSpecialty;
        element.hidden = !matches && Boolean(selectedSpecialty);
      });
      if (visible) {
        visibleRows += 1;
        visibleSpecialties += item.specialties.filter(({ element }) => !element.hidden).length;
      }
    });

    countOutput.textContent = `${visibleRows} sectores · ${visibleSpecialties} especialidades`;
    const allActive = !selectedSector && !selectedSpecialty;
    allButton?.classList.toggle('is-active', allActive);
    allButton?.setAttribute('aria-pressed', String(allActive));

    if (selectedSpecialty) {
      const match = rows.flatMap((item) => item.specialties.map((specialty) => ({ item, specialty })))
        .find(({ specialty }) => normalize(specialty.name) === selectedSpecialty);
      if (match) showDetail(match.item, match.specialty);
    }
  };

  rows.forEach((item) => {
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'sector-card-action';
    action.textContent = 'Ver especialidades';
    action.addEventListener('click', () => {
      const firstSpecialty = item.specialties[0];
      if (!firstSpecialty) return;
      showDetail(item, firstSpecialty);
      specialtySelect.value = normalize(firstSpecialty.name);
      updateFilters();
      detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    item.card?.append(action);

    item.specialties.forEach((specialty) => {
      specialty.element.setAttribute('aria-label', `${specialty.name}, sector ${item.sectorName}`);
      specialty.element.addEventListener('click', (event) => {
        event.preventDefault();
        showDetail(item, specialty);
        specialtySelect.value = normalize(specialty.name);
        updateFilters();
      });
    });
  });

  searchInput.addEventListener('input', updateFilters);
  sectorSelect.addEventListener('change', updateFilters);
  specialtySelect.addEventListener('change', updateFilters);
  allButton?.addEventListener('click', () => {
    sectorSelect.value = '';
    specialtySelect.value = '';
    detail.hidden = true;
    updateFilters();
  });
  toolbar.querySelector('[data-catalog-reset]')?.addEventListener('click', () => {
    searchInput.value = '';
    sectorSelect.value = '';
    specialtySelect.value = '';
    detail.hidden = true;
    updateFilters();
  });

  toolbar.querySelectorAll('[data-catalog-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const isList = button.dataset.catalogView === 'list';
      catalog.classList.toggle('is-list', isList);
      toolbar.querySelectorAll('[data-catalog-view]').forEach((toggle) => {
        const active = toggle === button;
        toggle.classList.toggle('is-active', active);
        toggle.setAttribute('aria-pressed', String(active));
      });
    });
  });

  // Keep the visible count tied to the real DOM catalog (15 sectors / 35 specialties).
  const catalogCount = section.querySelector('.catalog-summary article:nth-child(2) strong');
  if (catalogCount) catalogCount.textContent = String(specialtyNames.length);
  updateFilters();
})();
