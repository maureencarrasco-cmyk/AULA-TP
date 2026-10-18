/* Presentation alias only: navigation is still handled by the original control. */
(() => {
  function syncMiningTile() {
    const panel=document.querySelector('.city-walk-inspector');
    const grid=panel?.querySelector('.city-island-grid');
    const original=panel?.querySelector('.city-island-card > .city-approach');
    if(!grid||!original)return;
    let tile=grid.querySelector('[data-city-panel-mining]');
    // Wait for the original application to hydrate and enable its controls.
    if(!tile&&!original.disabled) {
      tile=document.createElement('button');
      tile.type='button';
      tile.dataset.cityPanelMining='';
      const icon=original.querySelector('svg');
      if(icon)tile.append(icon.cloneNode(true));
      const copy=document.createElement('span');
      const title=document.createElement('strong');title.textContent='ISLA MINERA';
      const detail=document.createElement('small');detail.textContent='Operaciones mineras y equipos';
      copy.append(title,detail);tile.append(copy);
      tile.addEventListener('click',()=>{
        const action=document.querySelector('.city-walk-inspector .city-island-card > .city-approach');
        if(action&&!action.disabled)action.click();
      });
      grid.append(tile);
    }
    if(tile&&tile.disabled!==original.disabled)tile.disabled=original.disabled;
  }
  function syncLearningLink() {
    const card=document.querySelector('.city-walk-inspector .city-mission-card');
    if(!card||card.querySelector('[data-city-learning-experience]'))return;
    const link=document.createElement('a');
    link.dataset.cityLearningExperience='';
    link.href='/api/city-experience';
    link.target='_blank';
    link.rel='noopener';
    link.textContent='Estación 4 · Quiz + Práctica profesional';
    card.append(link);
  }
  function syncConstructionDistrict() {
    const cards=[...document.querySelectorAll('.city-island-card')];
    const card=cards.find(item=>item.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleUpperCase().includes('CONSTRUCCION'));
    const action=card?.querySelector('.city-approach');
    if(!action||action.dataset.cityDistrictNavigation)return;
    action.dataset.cityDistrictNavigation='construction';
    action.addEventListener('click',()=>setTimeout(()=>{
      const section=document.querySelector('.city-specialty-section');
      const select=section?.querySelector('.city-district-select');
      if(!section||!select)return;
      const option=[...select.options].find(item=>item.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase()==='construccion');
      if(!option)return;
      section.open=true;select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));
      section.scrollIntoView({behavior:'smooth',block:'center'});
    },0));
  }
  function syncPanel() { syncMiningTile(); syncLearningLink(); syncConstructionDistrict(); }
  const observer=new MutationObserver(syncPanel);
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled']});
  syncPanel();
})();
