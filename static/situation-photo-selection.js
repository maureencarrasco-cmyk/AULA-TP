'use strict';
// Select across the entire module, not the current carousel page.
function situationPhotoSet(module, course) {
  const used=new Set();
  const related={
    cooling:['coolingtubes','pressure','thermometer','electrical'],electrical:['motor','multimeter','electronics'],
    nursing:['bloodpressure','medication','handwash','firstaid'],bloodpressure:['nursing','medication'],medication:['nursing','laboratory'],
    cooking:['bakery','food','buffet'],bakery:['cooking','food'],hotel:['buffet','office'],
    accounting:['office','meeting'],food:['packaging','cooking'],textile:['tools'],plumbing:['tools','pressure'],assembly:['welding','motor'],
    electronics:['multimeter','network'],drawing:['plans','tools'],plans:['drawing','construction'],printing:['office'],
    tourism:['hotel'],forestry:['timber','silviculture'],furniture:['timber','tools'],hatchery:['aquaculture'],aquaculture:['hatchery','fishing'],
    port:['warehouse','ship'],fishing:['ship','aquaculture'],ship:['engine','port'],welding:['assembly','tools'],car:['enginecar'],enginecar:['car'],
    aircraft:['tools','motor'],geology:['rocks','mining'],rocks:['geology','laboratory'],mining:['rocks','geology'],metallurgy:['machining','welding'],
    preschool:['handwash','firstaid'],network:['server','electronics'],programming:['server','network','office'],telecom:['network','server'],
    warehouse:['port','packaging'],office:['accounting','meeting'],crops:['irrigation','seedlings'],cattle:['dairy'],vineyard:['wine'],
    construction:['concrete','roof','road'],road:['construction','concrete'],laboratory:['microscope'],plant:['laboratory','packaging'],
    machining:['caliper','tools'],molds:['machining','caliper'],motor:['electrical','multimeter'],thermometer:['pressure','caliper'],
    handwash:['nursing','firstaid'],firstaid:['nursing'],buffet:['cooking','hotel'],cocktails:['buffet','hotel'],wine:['vineyard'],
    irrigation:['crops'],seedlings:['crops','silviculture'],dairy:['cattle'],fire:['forestry','safety'],timber:['forestry','furniture'],
    concrete:['construction'],roof:['construction'],tiles:['construction','furniture'],multimeter:['electrical','electronics'],server:['network'],
    caliper:['tools','machining'],tools:['machining','assembly'],safety:['construction','firstaid'],engine:['ship'],waste:['safety'],
    meeting:['office','accounting'],diving:['aquaculture','ship'],microscope:['laboratory'],packaging:['food','warehouse'],silviculture:['seedlings','forestry'],
    pressure:['coolingtubes','motor'],coolingtubes:['cooling','pressure']
  };
  return (module.content?.cases||[]).map((item,index)=>{
    const subject=encargoPhotoTopic({title:item.criterion||item.title},course,module.title);
    const pool=[subject,...(related[subject]||[])].flatMap(topic=>(SITUATION_PHOTOS[topic]||[]).map(photo=>({...photo,primary:topic===subject})));
    const normalize=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const criterion=normalize(item.criterion||item.context);
    const concepts=[
      [/aliment|nutric|forraj/,/feed|feeding|nutrition|fodder/],
      [/reproduct|reproducc/,/broodstock|breeding|reproduction/],
      [/larva|desov|gamet|huevo/,/egg|fry|hatch|spawn|larva/],
      [/muest|analiz|analisis/,/sample|sampling|analysis|laboratory|research/],
      [/temperat|termomet/,/temperature|thermometer/],
      [/cultiv|siembr|plantac/,/cultivation|planting|seedling|crop/],
      [/cosech|recolecc/,/harvest|collect/],
      [/medic|farmac/,/medicine|pharmacy|pharmacist|medication/],
      [/soldad/,/weld|welding|welder/],
      [/mantenc|mantenim|repar/,/maintenance|repair|servicing/],
      [/instala|montaj/,/installation|installing|assembly/],
      [/segurid|protec|prevenc/,/safety|protection|protective/],
      [/limpiez|higien/,/cleaning|washing|hygiene/],
      [/registro|informe|document/,/record|document|writing|report/],
      [/motor/,/engine|motor/],
      [/electri|circuit/,/electrical|circuit|electric/],
      [/carga|estib|despach/,/loading|cargo|freight|forklift/],
      [/riego/,/irrigation|drip/],
      [/program|software|datos/,/programming|coding|software|computer/]
    ];
    const score=photo=>concepts.reduce((sum,[task,image])=>sum+(task.test(criterion)&&image.test(normalize(photo.title+' '+photo.description))?1:0),photo.primary?100:0);
    const photo=pool.map((candidate,order)=>({candidate,order,score:score(candidate)})).filter(({candidate})=>!used.has(candidate.source)&&!used.has(candidate.fingerprint)).sort((a,b)=>b.score-a.score||a.order-b.order)[0]?.candidate;
    if(!photo)return null;
    used.add(photo.source);
    if(photo.fingerprint)used.add(photo.fingerprint);
    return {...photo,subject,alt:`${item.title||'Situacion '+(index+1)}. ${photo.alt}`};
  });
}
function situationPhotoAt(module,course,index){
  return situationPhotoSet(module,course)[index]||null;
}
