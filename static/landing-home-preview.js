document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('[aria-controls="additional-specialties"]');
  const catalog = document.querySelector('#additional-specialties');
  toggle?.addEventListener('click', function () {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    catalog.hidden = !expanded;
  });
  catalog?.querySelector('input[type="search"]')?.addEventListener('input', function (event) {
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const query = normalize(event.target.value.trim());
    catalog.querySelectorAll('.additional-card').forEach(function (card) {
      card.hidden = !normalize(card.textContent).includes(query);
    });
  });
  document.querySelector('#lead-form')?.addEventListener('submit', function (event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent('Solicitud de demostracion Aula TP Chile');
    const body = encodeURIComponent(`Establecimiento: ${data.get('establecimiento')}\nCargo: ${data.get('cargo')}\nEspecialidad de interes: ${data.get('especialidad')}\n\nSolicito una demostracion para el establecimiento.`);
    window.location.href = `mailto:contacto@aulatpchile.cl?subject=${subject}&body=${body}`;
  });
  window.lucide?.createIcons({ attrs: { 'aria-hidden': 'true' } });
});
