'use strict';
/* Parche producción: cards pegadas, video fuera de especialidad, CTAs de catálogo. */
(function () {
  function splitCapability(card) {
    if (card.querySelector('.capability-copy')) return;
    const icon = card.querySelector('.icon, svg');
    const raw = (card.textContent || '').replace(/\s+/g, ' ').trim();
    const map = [
      [/^Simula\s*/i, 'Simula', 'situaciones técnicas'],
      [/^Practica\s*/i, 'Practica', 'de forma segura'],
      [/^Recibe\s*/i, 'Recibe', 'retroalimentación'],
      [/^Demuestra\s*/i, 'Demuestra', 'lo aprendido']
    ];
    const hit = map.find(([re]) => re.test(raw));
    if (!hit) return;
    const copy = document.createElement('span');
    copy.className = 'capability-copy';
    copy.innerHTML = '<b>' + hit[1] + '</b><small>' + hit[2] + '</small>';
    card.innerHTML = '';
    if (icon) card.appendChild(icon);
    card.appendChild(copy);
  }

  function fixHeroMedia() {
    document.querySelectorAll('video').forEach((video) => {
      const src = (video.currentSrc || video.src || '').toLowerCase();
      const poster = (video.getAttribute('poster') || '').toLowerCase();
      const off =
        /gastr|pastel|cocina|chef|hoteler|alimento/.test(src + ' ' + poster);
      if (!off) return;
      video.setAttribute('data-off-specialty', '1');
      video.removeAttribute('autoplay');
      const wrap = video.closest('.hero-media') || video.parentElement;
      if (wrap && !wrap.querySelector('img[data-tp-poster]')) {
        const img = document.createElement('img');
        img.dataset.tpPoster = '1';
        img.src = '/images/simulador-circuitos-electricos.png';
        img.alt = 'Simulación interactiva de Electricidad';
        wrap.insertBefore(img, wrap.firstChild);
      }
    });
  }

  function retargetCatalog() {
    document.querySelectorAll('a[href*="/portal/cursos"]').forEach((a) => {
      const label = (a.textContent || '').toLowerCase();
      if (/cat[aá]logo|cursos vivos|explorar|ver cursos/.test(label)) {
        a.setAttribute('href', '/curso');
      }
    });
  }

  function boot() {
    document.querySelectorAll('.capability-card').forEach(splitCapability);
    fixHeroMedia();
    retargetCatalog();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
