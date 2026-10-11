'use strict';
(function () {
  async function read(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api' + url, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
      if (!(response.headers.get('Content-Type') || '').includes('application/json')) throw new Error('El servicio no pudo cargar los cursos. Vuelve a intentarlo.');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudieron cargar los cursos.');
      return data;
    } catch (error) {
      if (error.name === 'AbortError' || error instanceof TypeError) {
        const retry = new Error('No se pudo conectar a tiempo. Comprueba tu conexi\u00f3n y vuelve a intentarlo.');
        retry.network = true;
        throw retry;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
  const session = read('/session');
  const courses = session.then(data => data.user ? read('/courses?compact=1') : null);
  // Fetch while the remaining UI scripts download, without storing private data.
  session.catch(() => {});
  courses.catch(() => {});
  window.AulaCampusBoot = { session, courses };
})();
