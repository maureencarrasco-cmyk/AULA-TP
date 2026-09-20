(function(){
  function currentStation(){
    try{
      if(window.view && view.name==='module') return Number(view.station)||0;
      const m = String(location.hash||'').match(/#?module\/\d+\/(\d+)/);
      return m ? Number(m[1])||0 : 0;
    }catch(e){ return 0; }
  }
  function bootFab(){
    try{
      if(document.body && document.body.dataset && document.body.dataset.screen==='login') return;
      const station = currentStation();
      if(typeof ensureToolsFabVisible==='function'){ ensureToolsFabVisible(); return; }
      if(typeof mountToolsFab==='function'){ mountToolsFab(station); }
    }catch(e){}
  }
  window.addEventListener('load', function(){
    setTimeout(bootFab, 150);
    setTimeout(bootFab, 600);
    setTimeout(bootFab, 1500);
  });
  window.addEventListener('hashchange', function(){
    setTimeout(bootFab, 100);
    setTimeout(bootFab, 500);
  });
})();
