/** Verificación rápida (espejo del generador TS, misma SEED). */
const SEED = 0xc1a7_2026;
const NOMBRES = ["Matías","Javiera","Diego","Francisca","Benjamín","Antonia","Tomás","Valentina","Catalina","Ignacio","Sofía","Sebastián","Camila","Nicolás","Martina","Felipe","Constanza","Vicente","Isidora","Joaquín","Emilia","Agustín","Florencia","Maximiliano","Amanda","Cristóbal","Fernanda","Gabriel","Josefa","Martín","Trinidad","Alonso","Magdalena","Renato","Paula","Bruno","Daniela","Lucas","Josefina","Pedro"];
const APELLIDOS = ["Fuentes","Muñoz","Contreras","Lagos","Soto","Pérez","Herrera","Ríos","Núñez","Vargas","González","Rodríguez","Morales","Silva","Rojas","Castro","Jiménez","Díaz","Espinoza","Reyes","Gutiérrez","Ramírez","Flores","Torres","Sánchez","Sepúlveda","Araya","Valenzuela","Bravo","Pizarro","Carvajal","Figueroa","Henríquez","Alarcón","Tapia","Cortés","Miranda","Vera","Salinas","Leiva"];
const CURSOS = ["3° Medio Climatización A","3° Medio Climatización B","4° Medio Climatización A","4° Medio Climatización B"];
const CLIM_OA = [
  { codigo:"OA 1", nivel:"3", ae:[{codigo:"AE 1.1"},{codigo:"AE 1.2"}] },
  { codigo:"OA 2", nivel:"3", ae:[{codigo:"AE 1.3"},{codigo:"AE 1.4"}] },
  { codigo:"OA 3", nivel:"3", ae:[{codigo:"AE 2.1"},{codigo:"AE 2.2"}] },
  { codigo:"OA 4", nivel:"3", ae:[{codigo:"AE 3.1"},{codigo:"AE 3.2"}] },
  { codigo:"OA 5", nivel:"4", ae:[{codigo:"AE 4.1"},{codigo:"AE 4.2"}] },
  { codigo:"OA 6", nivel:"4", ae:[{codigo:"AE 5.1"},{codigo:"AE 5.2"}] },
  { codigo:"OA 7", nivel:"4", ae:[{codigo:"AE 6.1"},{codigo:"AE 6.2"},{codigo:"AE 6.3"}] },
  { codigo:"OA 8", nivel:"4", ae:[{codigo:"AE 7.1"},{codigo:"AE 7.2"}] },
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function estadoConBias(rng, tier) {
  const r = rng();
  if (tier === "high") { if (r < 0.72) return "logrado"; if (r < 0.92) return "en_progreso"; return "no_iniciado"; }
  if (tier === "low") { if (r < 0.18) return "logrado"; if (r < 0.45) return "en_progreso"; return "no_iniciado"; }
  if (r < 0.42) return "logrado"; if (r < 0.78) return "en_progreso"; return "no_iniciado";
}
function pickTier(rng) { const r = rng(); if (r < 0.22) return "high"; if (r < 0.72) return "mid"; return "low"; }

function generate(count = 160) {
  const rng = mulberry32(SEED);
  const used = new Set();
  const out = [];
  for (let i = 0; i < count; i++) {
    const curso = CURSOS[i % 4];
    const tier = pickTier(rng);
    const nivel = curso.startsWith("3°") ? "3" : "4";
    const oas = CLIM_OA.filter(o => o.nivel === nivel);
    let logrados = 0, totales = 0;
    for (const oa of oas) {
      for (const a of oa.ae) {
        const e = estadoConBias(rng, tier);
        totales++;
        if (e === "logrado") logrados++;
      }
    }
    // consume RNG for name + ultimoAcceso + actividad like TS does
    // (approximate: name tries)
    let nombre;
    for (let attempt = 0; attempt < 80; attempt++) {
      nombre = `${pick(rng, NOMBRES)} ${pick(rng, APELLIDOS)}`;
      if (!used.has(nombre)) { used.add(nombre); break; }
    }
    // ultima actividad pick + ultimo acceso
    rng(); // texto pick approximate - skip exact parity; just need counts
    const rAcc = rng();
    if (rAcc >= 0.5) rng(); // dias
    const avancePct = totales ? Math.round((logrados / totales) * 100) : 0;
    out.push({ id: `clim-${String(i+1).padStart(3,"0")}`, curso, avancePct, nombre, tier });
  }
  return out;
}

const g = generate(160);
const by = {};
for (const e of g) by[e.curso] = (by[e.curso] || 0) + 1;
const av = g.map(e => e.avancePct);
console.log(JSON.stringify({
  length: g.length,
  byCurso: by,
  avance: { min: Math.min(...av), max: Math.max(...av), avg: Math.round(av.reduce((a,b)=>a+b,0)/av.length) },
  sample: g.slice(0,3),
  uniqueIds: new Set(g.map(e => e.id)).size,
}, null, 2));
