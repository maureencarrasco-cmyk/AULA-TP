/**
 * Cohorte sintética estable de Climatización para Portal Docente.
 * Seed fijo → mismos nombres/progresos entre builds. Sin dependencia de LMS.
 * OA/AE alineados a CATALOGO_OA (especialidad Refrigeración y Climatización).
 * No importa demo-data (evita import circular: demo-data → este módulo).
 */

export type EstadoOaAeGen = "no_iniciado" | "en_progreso" | "logrado";

export type CoberturaAeGen = {
  aeCodigo: string;
  estado: EstadoOaAeGen;
};

export type CoberturaOaGen = {
  oaCodigo: string;
  estado: EstadoOaAeGen;
  ae: CoberturaAeGen[];
};

/** Compatible con EstudianteDemo de demo-data. */
export type EstudianteClimGen = {
  id: string;
  nombre: string;
  curso: string;
  actividadesCompletadas: number;
  actividadesTotales: number;
  avancePct: number;
  ultimoAcceso: string;
  cobertura: CoberturaOaGen[];
  aeLogrados: number;
  aeTotales: number;
  ultimaActividad?: { oaCodigo: string; aeCodigo?: string; texto: string };
};

const SEED = 0xc1a7_2026;

/** OA/AE Clim espejo de CATALOGO_OA (demo-data). */
const CLIM_OA: {
  codigo: string;
  nivel: "3" | "4";
  ae: { codigo: string }[];
}[] = [
  {
    codigo: "OA 1",
    nivel: "3",
    ae: [{ codigo: "AE 1.1" }, { codigo: "AE 1.2" }],
  },
  {
    codigo: "OA 2",
    nivel: "3",
    ae: [{ codigo: "AE 1.3" }, { codigo: "AE 1.4" }],
  },
  {
    codigo: "OA 3",
    nivel: "3",
    ae: [{ codigo: "AE 2.1" }, { codigo: "AE 2.2" }],
  },
  {
    codigo: "OA 4",
    nivel: "3",
    ae: [{ codigo: "AE 3.1" }, { codigo: "AE 3.2" }],
  },
  {
    codigo: "OA 5",
    nivel: "4",
    ae: [{ codigo: "AE 4.1" }, { codigo: "AE 4.2" }],
  },
  {
    codigo: "OA 6",
    nivel: "4",
    ae: [{ codigo: "AE 5.1" }, { codigo: "AE 5.2" }],
  },
  {
    codigo: "OA 7",
    nivel: "4",
    ae: [{ codigo: "AE 6.1" }, { codigo: "AE 6.2" }, { codigo: "AE 6.3" }],
  },
  {
    codigo: "OA 8",
    nivel: "4",
    ae: [{ codigo: "AE 7.1" }, { codigo: "AE 7.2" }],
  },
];

const NOMBRES = [
  "Matías",
  "Javiera",
  "Diego",
  "Francisca",
  "Benjamín",
  "Antonia",
  "Tomás",
  "Valentina",
  "Catalina",
  "Ignacio",
  "Sofía",
  "Sebastián",
  "Camila",
  "Nicolás",
  "Martina",
  "Felipe",
  "Constanza",
  "Vicente",
  "Isidora",
  "Joaquín",
  "Emilia",
  "Agustín",
  "Florencia",
  "Maximiliano",
  "Amanda",
  "Cristóbal",
  "Fernanda",
  "Gabriel",
  "Josefa",
  "Martín",
  "Trinidad",
  "Alonso",
  "Magdalena",
  "Renato",
  "Paula",
  "Bruno",
  "Daniela",
  "Lucas",
  "Josefina",
  "Pedro",
];

const APELLIDOS = [
  "Fuentes",
  "Muñoz",
  "Contreras",
  "Lagos",
  "Soto",
  "Pérez",
  "Herrera",
  "Ríos",
  "Núñez",
  "Vargas",
  "González",
  "Rodríguez",
  "Morales",
  "Silva",
  "Rojas",
  "Castro",
  "Jiménez",
  "Díaz",
  "Espinoza",
  "Reyes",
  "Gutiérrez",
  "Ramírez",
  "Flores",
  "Torres",
  "Sánchez",
  "Sepúlveda",
  "Araya",
  "Valenzuela",
  "Bravo",
  "Pizarro",
  "Carvajal",
  "Figueroa",
  "Henríquez",
  "Alarcón",
  "Tapia",
  "Cortés",
  "Miranda",
  "Vera",
  "Salinas",
  "Leiva",
];

const CURSOS = [
  "3° Medio Climatización A",
  "3° Medio Climatización B",
  "4° Medio Climatización A",
  "4° Medio Climatización B",
] as const;

const ACTIVIDAD_TEXTOS: Record<string, string[]> = {
  "OA 1": [
    "Estación lectura de simbología en plano",
    "Práctica de planos de redes de cañería",
    "Revisión de especificaciones técnicas",
  ],
  "OA 2": [
    "Cubicación de materiales en software",
    "Informe de costos del proyecto",
    "Cálculo de volúmenes y superficies",
  ],
  "OA 3": [
    "Medición de parámetros en taller",
    "Verificación con manuales de fábrica",
    "Control de magnitudes del proyecto",
  ],
  "OA 4": [
    "Unión soldada de tuberías",
    "Armado de red de ductos",
    "Aislación de cañerías refrigerantes",
  ],
  "OA 5": [
    "Instalación de equipo domiciliario",
    "Montaje de componentes de control",
    "Lectura de planos de equipos",
  ],
  "OA 6": [
    "Preparación de carga de fluidos",
    "Carga de refrigerante NCh3241",
    "Puesta en marcha del sistema",
  ],
  "OA 7": [
    "Inspección visual de fallas",
    "Informe de diagnóstico M6",
    "Propuesta de solución en obra",
  ],
  "OA 8": [
    "Mantención preventiva programada",
    "Correctivo según manual de fábrica",
    "Registro de parámetros de mantención",
  ],
};

type ProgressTier = "high" | "mid" | "low";

/** mulberry32 — PRNG determinista con semilla fija. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function oaEstadoFromAe(ae: { estado: EstadoOaAeGen }[]): EstadoOaAeGen {
  if (ae.length === 0) return "no_iniciado";
  if (ae.every((a) => a.estado === "logrado")) return "logrado";
  if (ae.every((a) => a.estado === "no_iniciado")) return "no_iniciado";
  return "en_progreso";
}

function estadoConBias(rng: () => number, tier: ProgressTier): EstadoOaAeGen {
  const r = rng();
  if (tier === "high") {
    if (r < 0.72) return "logrado";
    if (r < 0.92) return "en_progreso";
    return "no_iniciado";
  }
  if (tier === "low") {
    if (r < 0.18) return "logrado";
    if (r < 0.45) return "en_progreso";
    return "no_iniciado";
  }
  if (r < 0.42) return "logrado";
  if (r < 0.78) return "en_progreso";
  return "no_iniciado";
}

function pickTier(rng: () => number): ProgressTier {
  const r = rng();
  if (r < 0.22) return "high";
  if (r < 0.72) return "mid";
  return "low";
}

function climOasForCurso(curso: string) {
  const nivel = curso.startsWith("3°") ? "3" : "4";
  return CLIM_OA.filter((o) => o.nivel === nivel);
}

function countAe(cobertura: CoberturaOaGen[]): {
  logrados: number;
  totales: number;
} {
  let logrados = 0;
  let totales = 0;
  for (const c of cobertura) {
    for (const a of c.ae) {
      totales += 1;
      if (a.estado === "logrado") logrados += 1;
    }
  }
  return { logrados, totales };
}

function ultimoAccesoLabel(rng: () => number): string {
  const r = rng();
  if (r < 0.28) return "Hoy";
  if (r < 0.5) return "Ayer";
  const dias = 2 + Math.floor(rng() * 12);
  return `Hace ${dias} días`;
}

function buildName(rng: () => number, used: Set<string>, index: number): string {
  for (let attempt = 0; attempt < 80; attempt++) {
    const nombre = `${pick(rng, NOMBRES)} ${pick(rng, APELLIDOS)}`;
    if (!used.has(nombre)) {
      used.add(nombre);
      return nombre;
    }
  }
  const fallback = `${pick(rng, NOMBRES)} ${pick(rng, APELLIDOS)} ${index}`;
  used.add(fallback);
  return fallback;
}

/**
 * Genera `count` estudiantes de Climatización con progreso personalizado
 * alineado a OA/AE reales (3° → OA 1–4, 4° → OA 5–8).
 */
export function generateClimatizacionEstudiantes(
  count = 160,
): EstudianteClimGen[] {
  const rng = mulberry32(SEED);
  const usedNames = new Set<string>();
  const out: EstudianteClimGen[] = [];

  for (let i = 0; i < count; i++) {
    const curso = CURSOS[i % CURSOS.length]!;
    const tier = pickTier(rng);
    const oas = climOasForCurso(curso);
    const cobertura: CoberturaOaGen[] = oas.map((oa) => {
      const ae = oa.ae.map((a) => ({
        aeCodigo: a.codigo,
        estado: estadoConBias(rng, tier),
      }));
      return {
        oaCodigo: oa.codigo,
        estado: oaEstadoFromAe(ae),
        ae,
      };
    });

    const { logrados, totales } = countAe(cobertura);
    const avancePct =
      totales === 0 ? 0 : Math.round((logrados / totales) * 100);

    const actividadesTotales = Math.max(totales * 2, 8);
    const actividadesCompletadas = Math.min(
      actividadesTotales,
      Math.round((avancePct / 100) * actividadesTotales),
    );

    const flatAe: {
      oaCodigo: string;
      aeCodigo: string;
      estado: EstadoOaAeGen;
    }[] = [];
    for (const c of cobertura) {
      for (const a of c.ae) {
        flatAe.push({
          oaCodigo: c.oaCodigo,
          aeCodigo: a.aeCodigo,
          estado: a.estado,
        });
      }
    }
    const preferred =
      flatAe.filter((x) => x.estado === "en_progreso")[0] ??
      flatAe.filter((x) => x.estado === "logrado").slice(-1)[0] ??
      flatAe[0];

    const oaCode = preferred?.oaCodigo ?? oas[0]?.codigo ?? "OA 1";
    const textos = ACTIVIDAD_TEXTOS[oaCode] ?? ["Actividad de taller"];
    const texto = pick(rng, textos);

    const idNum = String(i + 1).padStart(3, "0");
    out.push({
      id: `clim-${idNum}`,
      nombre: buildName(rng, usedNames, i + 1),
      curso,
      actividadesCompletadas,
      actividadesTotales,
      avancePct,
      ultimoAcceso: ultimoAccesoLabel(rng),
      cobertura,
      aeLogrados: logrados,
      aeTotales: totales,
      ultimaActividad: preferred
        ? {
            oaCodigo: preferred.oaCodigo,
            aeCodigo: preferred.aeCodigo,
            texto,
          }
        : undefined,
    });
  }

  return out;
}

/** Stats de la cohorte generada (sin estudiantes manuales e9/e10). */
export function climatizacionGeneratedStats(count = 160): {
  count: number;
  byCurso: Record<string, number>;
  avgAvancePct: number;
} {
  const students = generateClimatizacionEstudiantes(count);
  const byCurso: Record<string, number> = {};
  let sum = 0;
  for (const e of students) {
    byCurso[e.curso] = (byCurso[e.curso] ?? 0) + 1;
    sum += e.avancePct;
  }
  return {
    count: students.length,
    byCurso,
    avgAvancePct: students.length ? Math.round(sum / students.length) : 0,
  };
}
