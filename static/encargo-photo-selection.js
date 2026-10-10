'use strict';
// Photographs are context, not fabricated evidence from the learner's case.
function encargoPhotoTopic(item, course, moduleTitle='') {
  const id=Number(course?.id);
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const taskText=normalize([item?.title,item?.instruction?.object].join(' '));
  const scopes=(ids)=>ids.includes(id);
  const rules=[
    [true,/emprendimiento|empleabilidad|emprender/,'meeting'],
    [true,/primeros auxilios/,'firstaid'],
    [true,/residuos|desechos|reciclaje/,'waste'],
    [scopes([1,2,11,12,14,23,24,27,38,39,40,43,44,45]),/lectura.*plano|interpretacion.*plano|dibujo.*plano|dossier|cubicacion|cubicaciones|escala|leyenda/,'plans'],
    [scopes([1,2,12,13,23,43,44,45]),/manometro|presion/,'pressure'],
    [scopes([1,2,12,13,23,43,44,45]),/termometro|temperatura|visor|instrumentos de medicion/,'thermometer'],
    [scopes([2,13,24,30,31,32]),/multimetro|voltaje|tension|resistencia electrica/,'multimeter'],
    [scopes([2,12,13,45]),/motor.*electri|motores electricos|maquinas.*electric/,'motor'],
    [scopes([1]),/tuberia|conexion|drenaje|redes/,'coolingtubes'],
    [scopes([3,4]),/parametros|presion|signos vitales|medicion/,'bloodpressure'],
    [scopes([3,4]),/medicamento|farmacia/,'medication'],
    [scopes([3,4,5,6,9,29]),/higiene|bioseguridad|infecciones/,'handwash'],
    [scopes([5,6,7]),/buffet/,'buffet'],
    [scopes([5,6,7]),/bebidas|cocteleria|bar/,'cocktails'],
    [scopes([5,6,9,18,20,28,33,38,39,40]),/almacen|bodega|despacho|abastecimiento|recepcion.*insumos/,'warehouse'],
    [scopes([5,6]),/masas|pastas|pasteleria|reposteria/,'bakery'],
    [scopes([9,37]),/envasado|rotulacion/,'packaging'],
    [scopes([10]),/maquina|confeccion|corte.*tela/,'textile'],
    [scopes([12,23,43,44,45]),/soldadura|union.*metal|corte.*soldadura/,'welding'],
    [scopes([12,20]),/levante|carga|estiba|contenedor/,'port'],
    [scopes([17]),/plantas|repoblacion|silvicola/,'silviculture'],
    [scopes([17]),/incendio/,'fire'],
    [scopes([17,18]),/cosecha forestal|aserradero|abastecimiento/,'timber'],
    [scopes([19]),/reproductor|desove|larva|semilla/,'hatchery'],
    [scopes([19]),/subacuatico|buceo/,'diving'],
    [scopes([21,22]),/maquinas.*marin|propulsor|motor/,'engine'],
    [scopes([21,22]),/navegacion|puente|comunicacion/,'ship'],
    [scopes([24]),/motor/,'enginecar'],
    [scopes([26,27]),/rocas|mineral|muestreo|sondaje/,'rocks'],
    [scopes([28,41,42]),/laboratorio|analisis|muestra/,'laboratory'],
    [scopes([30,31,32]),/hardware|servidor|respaldo|seguridad.*red/,'server'],
    [scopes([30,31,32]),/circuito/,'electronics'],
    [scopes([30,31,32]),/programacion|software|aplicacion|base.*datos|sistema.*operativo/,'programming'],
    [scopes([33,34,8]),/contable|tributari|remuneracion|impuesto|contabil|finiquito/,'accounting'],
    [scopes([35,36,37]),/riego/,'irrigation'],
    [scopes([35,36,37]),/reproduccion vegetal/,'seedlings'],
    [scopes([35,36,37]),/pecuario|animal|forraje|pradera/,'cattle'],
    [scopes([36]),/lechera|leche/,'dairy'],
    [scopes([37]),/vino|bodega.*vitivinicola/,'wine'],
    [scopes([37]),/vides|viticultura/,'vineyard'],
    [scopes([38,39,40]),/muestra|hormigon|suelos y materiales/,'concrete'],
    [scopes([38,39,40]),/prevencion|seguridad|riesgo/,'safety'],
    [scopes([39]),/cubierta|lluvia/,'roof'],
    [scopes([39]),/revestimiento|piso/,'tiles'],
    [scopes([39]),/mueble|puerta|ventana/,'furniture'],
    [scopes([40]),/vial|calzada|carretera/,'road'],
    [scopes([43,44,45]),/medicion|verificacion/,'caliper'],
    [scopes([43,44,45]),/herramienta|mecanica de banco/,'tools'],
    [scopes([43]),/torneado|fresado|taladrado|rectificado|mecanizado/,'machining'],
    [scopes([44]),/moldes|matrices/,'molds']
  ];
  const match=rules.find(([scope,pattern])=>scope&&pattern.test(taskText))||rules.find(([scope,pattern])=>scope&&pattern.test(normalize(moduleTitle)));
  if(match)return match[2];
  const defaults={1:'cooling',2:'electrical',3:'nursing',4:'nursing',5:'cooking',6:'bakery',7:'hotel',8:'accounting',9:'food',10:'textile',11:'plumbing',12:'assembly',13:'electronics',14:'drawing',15:'printing',16:'tourism',17:'forestry',18:'furniture',19:'aquaculture',20:'port',21:'fishing',22:'ship',23:'welding',24:'car',25:'aircraft',26:'geology',27:'mining',28:'metallurgy',29:'preschool',30:'network',31:'programming',32:'telecom',33:'warehouse',34:'office',35:'crops',36:'cattle',37:'vineyard',38:'construction',39:'construction',40:'road',41:'laboratory',42:'plant',43:'machining',44:'molds',45:'motor'};
  return defaults[id]||'meeting';
}
function encargoRealPhoto(item,course,moduleTitle='') {
  const topic=encargoPhotoTopic(item,course,moduleTitle);
  const photo=ENCARGO_PHOTOS[topic];
  if(!photo)throw new Error(`Missing encargo photograph: ${topic}`);
  return {...photo,image:`/static/encargo-photos/${photo.file}`,alt:photo.alt||photo.title.replace(/^File:/,'').replace(/\.[^.]+$/,'')};
}
