'use strict';
(() => {
  let rendering = false;
  const paths = new Set(TABS.map(tab => tab.path));
  const contextKey = url => [...url.searchParams.entries()].sort(([a],[b]) => a.localeCompare(b)).map(pair => JSON.stringify(pair)).join('|');
  const renderPage = () => {
    draw();
    const title = document.querySelector('.pd-banner-title h1,.pd-report-view-heading h1');
    if (title) { title.tabIndex = -1; title.focus({preventScroll:true}); }
    window.scrollTo({top:0,behavior:'instant'});
  };
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.hasAttribute('download') || link.target || link.getAttribute('aria-disabled') === 'true') return;
    const target = new URL(link.href, location.href);
    const current = new URL(location.href);
    // Context changes and unsaved plans retain normal navigation and its safety prompt.
    if (!state.user || target.origin !== current.origin || !paths.has(target.pathname) || target.hash || contextKey(target) !== contextKey(current) || window.PortalLayout?.hasUnsavedChanges()) return;
    event.preventDefault();
    if (rendering || target.href === current.href) return;
    rendering = true;
    const main = document.getElementById('pd-main');
    main.classList.add('is-navigating');
    main.setAttribute('aria-busy','true');
    try {
      history.pushState({portalNavigation:true},'',target.href);
      renderPage();
    } catch (_) {
      location.assign(target.href);
    } finally {
      main.classList.remove('is-navigating');
      main.removeAttribute('aria-busy');
      rendering = false;
    }
  });
  window.addEventListener('popstate', () => {
    const current = new URL(location.href);
    if (!state.user || window.PortalLayout?.hasUnsavedChanges() || current.searchParams.get('course') !== (state.courseId || null) || current.searchParams.get('module') !== (state.moduleId || null) || (current.searchParams.get('q') || '') !== state.q) { location.reload(); return; }
    renderPage();
  });
})();
