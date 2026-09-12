/** Datos de ejemplo para la demo interactiva del Portal Docente (es-CL). */

import { generateClimatizacionEstudiantes } from "@/lib/generate-climatizacion-estudiantes";

export const DEMO_TEACHER = {
  name: "Prof. Camila Rojas",
  role: "Docente TP",
  school: "Establecimiento educacional TP",
  email: "camila.rojas@ejemplo.cl",
};

export const KPI = {
  cursosActivos: 6,
  estudiantes: 170, // 10 demo + 160 cohorte Clim (sync abajo)
  actividadesPendientes: 9,
  promedioGeneralPct: 78,
};

export const ESTUDIANTES_POR_HABILIDAD = [
  { label: "Circuitos básicos", value: 38 },
  { label: "Mediciones", value: 32 },
  { label: "Diagnóstico fallas", value: 24 },
  { label: "Normativa SEC", value: 18 },
];

export const ESTUDIANTES_POR_COMPETENCIA = [
  { label: "Instalaciones domiciliarias", value: 42 },
  { label: "Tableros eléctricos", value: 35 },
  { label: "Motores y arranque", value: 28 },
  { label: "Seguridad eléctrica", value: 45 },
  { label: "Documentación técnica", value: 22 },
];

export const APROBACION = {
  aprobadosPct: 82,
  reprobadosPct: 8,
  pendientesPct: 10,
};

export const EVOLUCION_PROMEDIO = [
  { mes: "Mar", pct: 68 },
  { mes: "Abr", pct: 71 },
  { mes: "May", pct: 74 },
  { mes: "Jun", pct: 76 },
  { mes: "Jul", pct: 75 },
  { mes: "Ago", pct: 78 },
];

/* ─── Objetivos de Aprendizaje (OA) y Aprendizajes Esperados (AE) ─── */
/** Catálogo demo/ejemplo alineado a especialidad Electricidad TP (currículo chileno). */

export type EstadoOaAe = "no_iniciado" | "en_progreso" | "logrado";

export const ESTADO_OA_AE_LABEL: Record<EstadoOaAe, string> = {
  no_iniciado: "No iniciado",
  en_progreso: "En progreso",
  logrado: "Logrado",
};

export type AeDemo = {
  codigo: string;
  descripcion: string;
};

export type OaDemo = {
  codigo: string;
  titulo: string;
  descripcion: string;
  especialidad: "Electricidad" | "Administración" | "Refrigeración y Climatización";
  ae: AeDemo[];
  /** OA en foco esta semana (resumen). */
  enFoco?: boolean;
};

export const CATALOGO_OA: OaDemo[] = [
  {
    codigo: "OA 1",
    titulo: "Circuitos eléctricos básicos",
    descripcion:
      "Analiza e interpreta circuitos serie, paralelo y mixtos en instalaciones domiciliarias (ejemplo demo).",
    especialidad: "Electricidad",
    enFoco: true,
    ae: [
      {
        codigo: "AE 1.1",
        descripcion: "Identifica componentes y símbolos de circuitos serie y paralelo.",
      },
      {
        codigo: "AE 1.2",
        descripcion: "Calcula corrientes y tensiones en circuitos mixtos simples.",
      },
      {
        codigo: "AE 1.3",
        descripcion: "Monta y verifica un circuito doméstico básico en taller.",
      },
    ],
  },
  {
    codigo: "OA 2",
    titulo: "Mediciones eléctricas",
    descripcion:
      "Realiza mediciones de tensión, corriente y resistencia con instrumentos de taller (ejemplo demo).",
    especialidad: "Electricidad",
    enFoco: true,
    ae: [
      {
        codigo: "AE 2.1",
        descripcion: "Selecciona y configura el multímetro según la magnitud a medir.",
      },
      {
        codigo: "AE 2.2",
        descripcion: "Registra mediciones con criterios de seguridad y exactitud.",
      },
    ],
  },
  {
    codigo: "OA 3",
    titulo: "Tableros y protecciones",
    descripcion:
      "Instala y verifica protecciones en tableros residenciales según normativa aplicable (ejemplo demo).",
    especialidad: "Electricidad",
    ae: [
      {
        codigo: "AE 3.1",
        descripcion: "Reconoce tipos de interruptores diferenciales y termomagnéticos.",
      },
      {
        codigo: "AE 3.2",
        descripcion: "Dimensiones y ubica protecciones en un tablero modelo.",
      },
      {
        codigo: "AE 3.3",
        descripcion: "Verifica continuidad y aislamiento post-instalación.",
      },
    ],
  },
  {
    codigo: "OA 4",
    titulo: "Normativa SEC y seguridad",
    descripcion:
      "Aplica criterios de la normativa SEC y prácticas de seguridad eléctrica en taller (ejemplo demo).",
    especialidad: "Electricidad",
    enFoco: true,
    ae: [
      {
        codigo: "AE 4.1",
        descripcion: "Explica requisitos básicos de la normativa SEC vigentes en el módulo.",
      },
      {
        codigo: "AE 4.2",
        descripcion: "Aplica EPP y bloqueo/etiquetado en prácticas de taller.",
      },
    ],
  },
  {
    codigo: "OA 5",
    titulo: "Motores y sistemas de arranque",
    descripcion:
      "Diagnostica y opera motores trifásicos y sistemas de arranque comunes (ejemplo demo).",
    especialidad: "Electricidad",
    ae: [
      {
        codigo: "AE 5.1",
        descripcion: "Identifica conexiones estrella-triángulo y su aplicación.",
      },
      {
        codigo: "AE 5.2",
        descripcion: "Diagnostica fallas frecuentes en motores de inducción.",
      },
    ],
  },
  {
    codigo: "OA 6",
    titulo: "Gestión de inventarios (Administración)",
    descripcion:
      "Organiza inventarios de materiales de taller con registros básicos (ejemplo demo — Administración).",
    especialidad: "Administración",
    ae: [
      {
        codigo: "AE 6.1",
        descripcion: "Registra entradas y salidas de materiales en planilla.",
      },
      {
        codigo: "AE 6.2",
        descripcion: "Elabora un presupuesto simple de insumos eléctricos.",
      },
    ],
  },
  {
    codigo: "OA 1",
    titulo: "Lectura de planos de redes",
    descripcion:
      "Leer y utilizar planos de redes de cañería y ductos, simbología y especificaciones técnicas de proyectos de refrigeración y climatización.",
    especialidad: "Refrigeración y Climatización",
    enFoco: true,
    ae: [
      {
        codigo: "AE 1.1",
        descripcion:
          "Lee planos de refrigeración y climatización, utilizando la simbología técnica respectiva para reconocer el espacio físico donde se instalarán las distintas redes.",
      },
      {
        codigo: "AE 1.2",
        descripcion:
          "Lee y utiliza las especificaciones técnicas de proyectos de refrigeración y climatización para conocer indicaciones técnicas y materiales.",
      },
    ],
  },
  {
    codigo: "OA 2",
    titulo: "Cubicación de elementos y materiales",
    descripcion:
      "Cubicar elementos y materiales, de acuerdo a volúmenes y superficies, para la elaboración de proyectos de refrigeración, climatización, calefacción y ventilación.",
    especialidad: "Refrigeración y Climatización",
    ae: [
      {
        codigo: "AE 1.3",
        descripcion:
          "Cubica elementos y materiales de acuerdo a los requerimientos del lugar, indicados en el plano respectivo mediante un software de diseño (NCh353/2000).",
      },
      {
        codigo: "AE 1.4",
        descripcion:
          "Elabora informe de cubicación de elementos y materiales, estableciendo la cantidad de materiales a utilizar y los costos totales del proyecto (NCh353/2000).",
      },
    ],
  },
  {
    codigo: "OA 3",
    titulo: "Mediciones y controles de verificación",
    descripcion:
      "Realizar mediciones y controles de verificación de distintas magnitudes relacionadas con el proyecto, de acuerdo a especificaciones técnicas y normas de seguridad.",
    especialidad: "Refrigeración y Climatización",
    enFoco: true,
    ae: [
      {
        codigo: "AE 2.1",
        descripcion:
          "Utiliza instrumentos de medición y verificación de distintos parámetros, de acuerdo a indicaciones de fábrica, técnicas apropiadas y normas de seguridad.",
      },
      {
        codigo: "AE 2.2",
        descripcion:
          "Verifica parámetros medidos por los instrumentos, comparándolos con datos de manuales de fabricación para determinar posibles ajustes.",
      },
    ],
  },
  {
    codigo: "OA 4",
    titulo: "Armado e instalación de redes",
    descripcion:
      "Armar, instalar y aislar redes de ductos y cañerías para el flujo de refrigerantes, aire, agua y fluidos especiales, con uniones soldadas herméticas (NCh3241).",
    especialidad: "Refrigeración y Climatización",
    ae: [
      {
        codigo: "AE 3.1",
        descripcion:
          "Realiza unión de diferentes tipos de materiales, utilizando soldaduras autorizadas y considerando técnicas de fábrica, normativa técnica y de seguridad.",
      },
      {
        codigo: "AE 3.2",
        descripcion:
          "Arma diferentes redes de tuberías, utilizando diversas soldaduras y considerando técnicas de fábrica, normativa técnica y de seguridad.",
      },
    ],
  },
  {
    codigo: "OA 5",
    titulo: "Instalación de equipos y componentes",
    descripcion:
      "Instalar equipos y componentes de sistemas de refrigeración, calefacción, climatización y ventilación, incluidos dispositivos de control, según especificaciones y NCh3241.",
    especialidad: "Refrigeración y Climatización",
    ae: [
      {
        codigo: "AE 4.1",
        descripcion:
          "Lee y utiliza planos y especificaciones técnicas de sistemas y equipos para identificar dificultades que podrían presentarse en la instalación.",
      },
      {
        codigo: "AE 4.2",
        descripcion:
          "Instala equipos y componentes de sistemas domiciliarios considerando especificaciones de manuales, normativa técnica y de seguridad.",
      },
    ],
  },
  {
    codigo: "OA 6",
    titulo: "Carga de fluidos y puesta en marcha",
    descripcion:
      "Cargar fluidos y poner en marcha sistemas considerando presiones del fabricante, refrigerantes amigables con el medio ambiente y NCh3241.",
    especialidad: "Refrigeración y Climatización",
    ae: [
      {
        codigo: "AE 5.1",
        descripcion:
          "Prepara el espacio físico y el equipamiento para el transporte y carga de fluidos, aplicando medidas de seguridad y cuidado del medio ambiente (NCh3241).",
      },
      {
        codigo: "AE 5.2",
        descripcion:
          "Carga fluidos en equipos de refrigeración, aplicando las medidas de seguridad y cuidado del medio ambiente establecidos en NCh3241.",
      },
    ],
  },
  {
    codigo: "OA 7",
    titulo: "Inspección y diagnóstico de fallas",
    descripcion:
      "Inspeccionar y diagnosticar fallas del funcionamiento de los sistemas de refrigeración, climatización, calefacción y ventilación respecto de las especificaciones del fabricante.",
    especialidad: "Refrigeración y Climatización",
    enFoco: true,
    ae: [
      {
        codigo: "AE 6.1",
        descripcion:
          "Inspecciona instalaciones y equipos contrastando la información obtenida con manuales de funcionamiento y especificaciones técnicas.",
      },
      {
        codigo: "AE 6.2",
        descripcion:
          "Diagnostica posibles fallas con mediciones e inspección visual y propone posibles soluciones según especificaciones de fabricación.",
      },
      {
        codigo: "AE 6.3",
        descripcion:
          "Establece los tipos de fallas o mal funcionamiento que pueden corregirse en obra o en taller.",
      },
    ],
  },
  {
    codigo: "OA 8",
    titulo: "Mantención preventivo y correctivo",
    descripcion:
      "Realizar el mantenimiento preventivo y correctivo de los sistemas considerando los parámetros establecidos en los manuales de fabricación.",
    especialidad: "Refrigeración y Climatización",
    ae: [
      {
        codigo: "AE 7.1",
        descripcion:
          "Realiza mantenimiento preventivo considerando las especificaciones del proyecto, las condiciones de obra y los manuales de funcionamiento desde fábrica.",
      },
      {
        codigo: "AE 7.2",
        descripcion:
          "Realiza mantenimiento correctivo, considerando las especificaciones del proyecto, las condiciones de obra y los manuales de funcionamiento y fabricación.",
      },
    ],
  },
];

/** Clave estable para React keys / lookups cuando OA se repiten entre especialidades. */
export function oaCatalogKey(especialidad: OaDemo["especialidad"], codigo: string): string {
  return `${especialidad}::${codigo}`;
}

export function especialidadFromCurso(
  curso: string,
): OaDemo["especialidad"] | "Atención de Enfermería" | undefined {
  const c = curso.toLowerCase();
  if (c.includes("clim") || c.includes("refriger")) return "Refrigeración y Climatización";
  if (c.includes("enferm")) return "Atención de Enfermería";
  if (c.includes("elec")) return "Electricidad";
  if (c.includes("adm")) return "Administración";
  return undefined;
}

export function getOaByCodigo(
  codigo: string,
  especialidad?: OaDemo["especialidad"],
): OaDemo | undefined {
  if (especialidad) {
    return CATALOGO_OA.find((o) => o.codigo === codigo && o.especialidad === especialidad);
  }
  return CATALOGO_OA.find((o) => o.codigo === codigo);
}

export function getAeByCodigo(
  codigo: string,
  especialidad?: OaDemo["especialidad"],
): (AeDemo & { oaCodigo: string; especialidad: OaDemo["especialidad"] }) | undefined {
  const pool = especialidad
    ? CATALOGO_OA.filter((o) => o.especialidad === especialidad)
    : CATALOGO_OA;
  for (const oa of pool) {
    const ae = oa.ae.find((a) => a.codigo === codigo);
    if (ae) return { ...ae, oaCodigo: oa.codigo, especialidad: oa.especialidad };
  }
  return undefined;
}

export type CoberturaAe = {
  aeCodigo: string;
  estado: EstadoOaAe;
};

export type CoberturaOa = {
  oaCodigo: string;
  estado: EstadoOaAe;
  ae: CoberturaAe[];
};

export const ACTIVIDAD_RECIENTE = [
  {
    id: "a1",
    texto: "Entregó práctica «Medición de resistencia»",
    estudiante: "Matías Fuentes",
    curso: "3° Medio Electricidad A",
    hace: "Hace 12 min",
    oaCodigo: "OA 2",
    aeCodigo: "AE 2.2",
  },
  {
    id: "a2",
    texto: "Completó módulo de normativa SEC",
    estudiante: "Javiera Muñoz",
    curso: "4° Medio Electricidad B",
    hace: "Hace 45 min",
    oaCodigo: "OA 4",
    aeCodigo: "AE 4.1",
  },
  {
    id: "a3",
    texto: "Solicitó revisión de informe de taller",
    estudiante: "Diego Contreras",
    curso: "3° Medio Electricidad A",
    hace: "Hace 2 h",
    oaCodigo: "OA 1",
    aeCodigo: "AE 1.3",
  },
  {
    id: "a5",
    texto: "Subió evidencia fotográfica de práctica",
    estudiante: "Benjamín Soto",
    curso: "4° Medio Electricidad B",
    hace: "Ayer",
    oaCodigo: "OA 3",
    aeCodigo: "AE 3.2",
  },
  {
    id: "a6",
    texto: "Completó estación «Simbología en plano»",
    estudiante: "Catalina Núñez",
    curso: "3° Medio Climatización A",
    hace: "Hace 20 min",
    oaCodigo: "OA 1",
    aeCodigo: "AE 1.1",
  },
  {
    id: "a7",
    texto: "Entregó informe de diagnóstico (M6)",
    estudiante: "Ignacio Vargas",
    curso: "4° Medio Climatización B",
    hace: "Hace 1 h",
    oaCodigo: "OA 7",
    aeCodigo: "AE 6.2",
  },
];

export const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie"] as const;

export type BloquePlan = {
  id: string;
  dia: (typeof DIAS_SEMANA)[number];
  bloque: number;
  hora: string;
  curso: string;
  asignatura: string;
  tema: string;
  color: "blue" | "emerald" | "amber" | "violet" | "sky";
  /** Códigos OA asociados a la clase. */
  oaCodigos: string[];
  /** AE relevantes (opcional). */
  aeCodigos?: string[];
};

export const PLANIFICACION_SEMANA: BloquePlan[] = [
  {
    id: "p1",
    dia: "Lun",
    bloque: 1,
    hora: "08:00–09:30",
    curso: "3° Medio Elec. A",
    asignatura: "Electricidad",
    tema: "Circuitos serie y paralelo",
    color: "blue",
    oaCodigos: ["OA 1"],
    aeCodigos: ["AE 1.1", "AE 1.2"],
  },
  {
    id: "p2",
    dia: "Lun",
    bloque: 3,
    hora: "11:15–12:45",
    curso: "4° Medio Elec. B",
    asignatura: "Electricidad",
    tema: "Tableros y protecciones",
    color: "blue",
    oaCodigos: ["OA 3"],
    aeCodigos: ["AE 3.1", "AE 3.2"],
  },
  {
    id: "p3",
    dia: "Mar",
    bloque: 2,
    hora: "09:45–11:15",
    curso: "3° Medio Clim. A",
    asignatura: "Refrigeración y Climatización",
    tema: "Lectura de planos y simbología",
    color: "sky",
    oaCodigos: ["OA 1"],
    aeCodigos: ["AE 1.1", "AE 1.2"],
  },
  {
    id: "p4",
    dia: "Mar",
    bloque: 4,
    hora: "14:00–15:30",
    curso: "3° Medio Elec. A",
    asignatura: "Electricidad",
    tema: "Taller: medición con multímetro",
    color: "amber",
    oaCodigos: ["OA 2"],
    aeCodigos: ["AE 2.1", "AE 2.2"],
  },
  {
    id: "p5",
    dia: "Mié",
    bloque: 1,
    hora: "08:00–09:30",
    curso: "4° Medio Elec. B",
    asignatura: "Electricidad",
    tema: "Motores trifásicos",
    color: "blue",
    oaCodigos: ["OA 5"],
    aeCodigos: ["AE 5.1"],
  },
  {
    id: "p7",
    dia: "Jue",
    bloque: 2,
    hora: "09:45–11:15",
    curso: "3° Medio Elec. A",
    asignatura: "Electricidad",
    tema: "Normativa SEC — aplicación",
    color: "violet",
    oaCodigos: ["OA 4"],
    aeCodigos: ["AE 4.1", "AE 4.2"],
  },
  {
    id: "p8",
    dia: "Jue",
    bloque: 4,
    hora: "14:00–15:30",
    curso: "4° Medio Elec. B",
    asignatura: "Electricidad",
    tema: "Simulador: diagnóstico de fallas",
    color: "amber",
    oaCodigos: ["OA 5", "OA 3"],
    aeCodigos: ["AE 5.2"],
  },
  {
    id: "p9",
    dia: "Vie",
    bloque: 1,
    hora: "08:00–09:30",
    curso: "4° Medio Clim. B",
    asignatura: "Refrigeración y Climatización",
    tema: "Diagnóstico de fallas (inspección)",
    color: "sky",
    oaCodigos: ["OA 7"],
    aeCodigos: ["AE 6.1", "AE 6.2"],
  },
  {
    id: "p10",
    dia: "Vie",
    bloque: 3,
    hora: "11:15–12:45",
    curso: "3° Medio Elec. A",
    asignatura: "Electricidad",
    tema: "Evaluación formativa — módulo 2",
    color: "violet",
    oaCodigos: ["OA 1", "OA 2"],
    aeCodigos: ["AE 1.3", "AE 2.2"],
  },
  {
    id: "p11",
    dia: "Lun",
    bloque: 2,
    hora: "09:45–11:15",
    curso: "3° Medio Clim. A",
    asignatura: "Refrigeración y Climatización",
    tema: "Instrumentos de medición",
    color: "sky",
    oaCodigos: ["OA 3"],
    aeCodigos: ["AE 2.1", "AE 2.2"],
  },
  {
    id: "p12",
    dia: "Mié",
    bloque: 2,
    hora: "09:45–11:15",
    curso: "4° Medio Clim. B",
    asignatura: "Refrigeración y Climatización",
    tema: "Mantención preventivo / correctivo",
    color: "sky",
    oaCodigos: ["OA 8"],
    aeCodigos: ["AE 7.1", "AE 7.2"],
  },
  {
    id: "p13",
    dia: "Jue",
    bloque: 1,
    hora: "08:00–09:30",
    curso: "3° Medio Clim. A",
    asignatura: "Refrigeración y Climatización",
    tema: "Montaje de redes — uniones",
    color: "sky",
    oaCodigos: ["OA 4"],
    aeCodigos: ["AE 3.1", "AE 3.2"],
  },

];

export const BLOQUES_HORARIO = [
  { n: 1, hora: "08:00–09:30" },
  { n: 2, hora: "09:45–11:15" },
  { n: 3, hora: "11:15–12:45" },
  { n: 4, hora: "14:00–15:30" },
];

export type EstudianteDemo = {
  id: string;
  nombre: string;
  curso: string;
  actividadesCompletadas: number;
  actividadesTotales: number;
  avancePct: number;
  ultimoAcceso: string;
  cobertura: CoberturaOa[];
  aeLogrados: number;
  aeTotales: number;
  /** Porcentaje de logro % del periodo anterior registrado (agosto 2026). */
  avancePctPeriodoAnterior: number;
  ultimaActividad?: { oaCodigo: string; aeCodigo?: string; texto: string };
};

function coberturaFrom(
  entries: { oa: string; estado: EstadoOaAe; ae: { codigo: string; estado: EstadoOaAe }[] }[],
): CoberturaOa[] {
  return entries.map((e) => ({
    oaCodigo: e.oa,
    estado: e.estado,
    ae: e.ae.map((a) => ({ aeCodigo: a.codigo, estado: a.estado })),
  }));
}

function countAe(cobertura: CoberturaOa[]): { logrados: number; totales: number } {
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

const _e1 = coberturaFrom([
  {
    oa: "OA 1",
    estado: "logrado",
    ae: [
      { codigo: "AE 1.1", estado: "logrado" },
      { codigo: "AE 1.2", estado: "logrado" },
      { codigo: "AE 1.3", estado: "en_progreso" },
    ],
  },
  {
    oa: "OA 2",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 2.1", estado: "logrado" },
      { codigo: "AE 2.2", estado: "en_progreso" },
    ],
  },
  {
    oa: "OA 4",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 4.1", estado: "en_progreso" },
      { codigo: "AE 4.2", estado: "no_iniciado" },
    ],
  },
]);

const _e2 = coberturaFrom([
  {
    oa: "OA 3",
    estado: "logrado",
    ae: [
      { codigo: "AE 3.1", estado: "logrado" },
      { codigo: "AE 3.2", estado: "logrado" },
      { codigo: "AE 3.3", estado: "logrado" },
    ],
  },
  {
    oa: "OA 4",
    estado: "logrado",
    ae: [
      { codigo: "AE 4.1", estado: "logrado" },
      { codigo: "AE 4.2", estado: "logrado" },
    ],
  },
  {
    oa: "OA 5",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 5.1", estado: "logrado" },
      { codigo: "AE 5.2", estado: "en_progreso" },
    ],
  },
]);

const _e3 = coberturaFrom([
  {
    oa: "OA 1",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 1.1", estado: "logrado" },
      { codigo: "AE 1.2", estado: "en_progreso" },
      { codigo: "AE 1.3", estado: "no_iniciado" },
    ],
  },
  {
    oa: "OA 2",
    estado: "no_iniciado",
    ae: [
      { codigo: "AE 2.1", estado: "no_iniciado" },
      { codigo: "AE 2.2", estado: "no_iniciado" },
    ],
  },
  {
    oa: "OA 4",
    estado: "no_iniciado",
    ae: [
      { codigo: "AE 4.1", estado: "no_iniciado" },
      { codigo: "AE 4.2", estado: "no_iniciado" },
    ],
  },
]);

const _e5 = coberturaFrom([
  {
    oa: "OA 3",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 3.1", estado: "logrado" },
      { codigo: "AE 3.2", estado: "en_progreso" },
      { codigo: "AE 3.3", estado: "no_iniciado" },
    ],
  },
  {
    oa: "OA 4",
    estado: "logrado",
    ae: [
      { codigo: "AE 4.1", estado: "logrado" },
      { codigo: "AE 4.2", estado: "logrado" },
    ],
  },
  {
    oa: "OA 5",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 5.1", estado: "en_progreso" },
      { codigo: "AE 5.2", estado: "no_iniciado" },
    ],
  },
]);

const _e6 = coberturaFrom([
  {
    oa: "OA 1",
    estado: "logrado",
    ae: [
      { codigo: "AE 1.1", estado: "logrado" },
      { codigo: "AE 1.2", estado: "logrado" },
      { codigo: "AE 1.3", estado: "logrado" },
    ],
  },
  {
    oa: "OA 2",
    estado: "logrado",
    ae: [
      { codigo: "AE 2.1", estado: "logrado" },
      { codigo: "AE 2.2", estado: "logrado" },
    ],
  },
  {
    oa: "OA 4",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 4.1", estado: "logrado" },
      { codigo: "AE 4.2", estado: "en_progreso" },
    ],
  },
]);

const _e8 = coberturaFrom([
  {
    oa: "OA 3",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 3.1", estado: "logrado" },
      { codigo: "AE 3.2", estado: "en_progreso" },
      { codigo: "AE 3.3", estado: "en_progreso" },
    ],
  },
  {
    oa: "OA 4",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 4.1", estado: "en_progreso" },
      { codigo: "AE 4.2", estado: "no_iniciado" },
    ],
  },
  {
    oa: "OA 5",
    estado: "no_iniciado",
    ae: [
      { codigo: "AE 5.1", estado: "no_iniciado" },
      { codigo: "AE 5.2", estado: "no_iniciado" },
    ],
  },
]);


const _e9 = coberturaFrom([
  {
    oa: "OA 1",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 1.1", estado: "logrado" },
      { codigo: "AE 1.2", estado: "en_progreso" },
    ],
  },
  {
    oa: "OA 3",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 2.1", estado: "en_progreso" },
      { codigo: "AE 2.2", estado: "no_iniciado" },
    ],
  },
  {
    oa: "OA 4",
    estado: "no_iniciado",
    ae: [
      { codigo: "AE 3.1", estado: "no_iniciado" },
      { codigo: "AE 3.2", estado: "no_iniciado" },
    ],
  },
]);

const _e10 = coberturaFrom([
  {
    oa: "OA 7",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 6.1", estado: "logrado" },
      { codigo: "AE 6.2", estado: "en_progreso" },
      { codigo: "AE 6.3", estado: "en_progreso" },
    ],
  },
  {
    oa: "OA 8",
    estado: "en_progreso",
    ae: [
      { codigo: "AE 7.1", estado: "en_progreso" },
      { codigo: "AE 7.2", estado: "no_iniciado" },
    ],
  },
]);

const ESTUDIANTES_MANUAL: EstudianteDemo[] = [
  {
    id: "e1",
    nombre: "Matías Fuentes",
    curso: "3° Medio Electricidad A",
    actividadesCompletadas: 14,
    actividadesTotales: 18,
    avancePct: 78,
    avancePctPeriodoAnterior: 58,
    ultimoAcceso: "Hoy",
    cobertura: _e1,
    aeLogrados: countAe(_e1).logrados,
    aeTotales: countAe(_e1).totales,
    ultimaActividad: {
      oaCodigo: "OA 2",
      aeCodigo: "AE 2.2",
      texto: "Práctica medición de resistencia",
    },
  },
  {
    id: "e2",
    nombre: "Javiera Muñoz",
    curso: "4° Medio Electricidad B",
    actividadesCompletadas: 16,
    actividadesTotales: 18,
    avancePct: 89,
    avancePctPeriodoAnterior: 81,
    ultimoAcceso: "Hoy",
    cobertura: _e2,
    aeLogrados: countAe(_e2).logrados,
    aeTotales: countAe(_e2).totales,
    ultimaActividad: {
      oaCodigo: "OA 4",
      aeCodigo: "AE 4.1",
      texto: "Módulo normativa SEC",
    },
  },
  {
    id: "e3",
    nombre: "Diego Contreras",
    curso: "3° Medio Electricidad A",
    actividadesCompletadas: 11,
    actividadesTotales: 18,
    avancePct: 61,
    avancePctPeriodoAnterior: 49,
    ultimoAcceso: "Ayer",
    cobertura: _e3,
    aeLogrados: countAe(_e3).logrados,
    aeTotales: countAe(_e3).totales,
    ultimaActividad: {
      oaCodigo: "OA 1",
      aeCodigo: "AE 1.3",
      texto: "Informe de taller circuitos",
    },
  },
  {
    id: "e5",
    nombre: "Benjamín Soto",
    curso: "4° Medio Electricidad B",
    actividadesCompletadas: 15,
    actividadesTotales: 18,
    avancePct: 83,
    avancePctPeriodoAnterior: 62,
    ultimoAcceso: "Ayer",
    cobertura: _e5,
    aeLogrados: countAe(_e5).logrados,
    aeTotales: countAe(_e5).totales,
    ultimaActividad: {
      oaCodigo: "OA 3",
      aeCodigo: "AE 3.2",
      texto: "Evidencia fotográfica tablero",
    },
  },
  {
    id: "e6",
    nombre: "Antonia Pérez",
    curso: "3° Medio Electricidad A",
    actividadesCompletadas: 17,
    actividadesTotales: 18,
    avancePct: 94,
    avancePctPeriodoAnterior: 88,
    ultimoAcceso: "Hoy",
    cobertura: _e6,
    aeLogrados: countAe(_e6).logrados,
    aeTotales: countAe(_e6).totales,
    ultimaActividad: {
      oaCodigo: "OA 2",
      aeCodigo: "AE 2.2",
      texto: "Evaluación formativa mediciones",
    },
  },
  {
    id: "e8",
    nombre: "Valentina Ríos",
    curso: "4° Medio Electricidad B",
    actividadesCompletadas: 13,
    actividadesTotales: 18,
    avancePct: 72,
    avancePctPeriodoAnterior: 54,
    ultimoAcceso: "Ayer",
    cobertura: _e8,
    aeLogrados: countAe(_e8).logrados,
    aeTotales: countAe(_e8).totales,
    ultimaActividad: {
      oaCodigo: "OA 3",
      aeCodigo: "AE 3.1",
      texto: "Identificación de protecciones",
    },
  },
  {
    id: "e9",
    nombre: "Catalina Núñez",
    curso: "3° Medio Climatización A",
    actividadesCompletadas: 10,
    actividadesTotales: 16,
    avancePct: 63,
    avancePctPeriodoAnterior: 51,
    ultimoAcceso: "Hoy",
    cobertura: _e9,
    aeLogrados: countAe(_e9).logrados,
    aeTotales: countAe(_e9).totales,
    ultimaActividad: {
      oaCodigo: "OA 1",
      aeCodigo: "AE 1.1",
      texto: "Estación simbología en plano",
    },
  },
  {
    id: "e10",
    nombre: "Ignacio Vargas",
    curso: "4° Medio Climatización B",
    actividadesCompletadas: 12,
    actividadesTotales: 16,
    avancePct: 75,
    avancePctPeriodoAnterior: 64,
    ultimoAcceso: "Hoy",
    cobertura: _e10,
    aeLogrados: countAe(_e10).logrados,
    aeTotales: countAe(_e10).totales,
    ultimaActividad: {
      oaCodigo: "OA 7",
      aeCodigo: "AE 6.2",
      texto: "Informe de diagnóstico M6",
    },
  },
];


export const ESTUDIANTES: EstudianteDemo[] = [
  ...ESTUDIANTES_MANUAL,
  ...generateClimatizacionEstudiantes(160),
];

KPI.estudiantes = ESTUDIANTES.length;

/** Conteos de estudiantes por estado para un OA (solo quienes lo tienen en cobertura). */
export function conteoEstudiantesPorOa(
  oaCodigo: string,
  especialidad?: OaDemo["especialidad"],
): {
  logrado: number;
  en_progreso: number;
  no_iniciado: number;
  total: number;
} {
  let logrado = 0;
  let en_progreso = 0;
  let no_iniciado = 0;
  for (const e of ESTUDIANTES) {
    if (especialidad) {
      const esp = especialidadFromCurso(e.curso);
      if (esp !== especialidad) continue;
    }
    const c = e.cobertura.find((x) => x.oaCodigo === oaCodigo);
    if (!c) continue;
    if (c.estado === "logrado") logrado += 1;
    else if (c.estado === "en_progreso") en_progreso += 1;
    else no_iniciado += 1;
  }
  return {
    logrado,
    en_progreso,
    no_iniciado,
    total: logrado + en_progreso + no_iniciado,
  };
}

/** Estudiantes que lograron cada OA (cantidad). Etiqueta incluye especialidad corta. */
export function estudiantesLogradosPorOa(): { label: string; value: number }[] {
  const shortEsp: Record<OaDemo["especialidad"], string> = {
    Electricidad: "Elec.",
    Administración: "Adm.",
    "Refrigeración y Climatización": "Clim.",
  };
  return CATALOGO_OA.map((oa) => {
    const c = conteoEstudiantesPorOa(oa.codigo, oa.especialidad);
    return {
      label: `${oa.codigo} · ${shortEsp[oa.especialidad]}`,
      value: c.logrado,
      total: c.total,
    };
  })
    .filter((x) => x.total > 0)
    .map(({ label, value }) => ({ label, value }));
}

/** % cobertura general: AE logrados / AE totales en el curso demo. */
export function coberturaGeneralPct(): number {
  let logrados = 0;
  let totales = 0;
  for (const e of ESTUDIANTES) {
    logrados += e.aeLogrados;
    totales += e.aeTotales;
  }
  if (totales === 0) return 0;
  return Math.round((logrados / totales) * 100);
}

/** % de logro del curso para un OA (estudiantes con OA logrado / con cobertura del OA). */
export function pctLogroOa(
  oaCodigo: string,
  especialidad?: OaDemo["especialidad"],
): number {
  const c = conteoEstudiantesPorOa(oaCodigo, especialidad);
  if (c.total === 0) return 0;
  return Math.round((c.logrado / c.total) * 100);
}

export type RecursoDemo = {
  id: string;
  titulo: string;
  especialidad: string;
  tipo: string;
  duracion: string;
  nivel: string;
  /** Si existe, el botón abre este enlace (curso o recurso externo). */
  href?: string;
};

export const RECURSOS: RecursoDemo[] = [
  {
    id: "r-enf",
    titulo: "Curso vivo: Atención de Enfermería",
    especialidad: "Atención de Enfermería",
    tipo: "Simulador LMS",
    duracion: "836 h programa",
    nivel: "3° Medio",
    href: "https://aulatpchile.cl/portal/simuladores/atencion_enfermeria/",
  },
  {
    id: "r-elec",
    titulo: "Curso vivo: Electricidad 3° Medio",
    especialidad: "Electricidad",
    tipo: "Simulador LMS",
    duracion: "646 h programa",
    nivel: "3° Medio",
    href: "https://aulatpchile.cl/portal/simuladores/electricidad_3_medio/",
  },
  {
    id: "r7",
    titulo: "Curso Aula TP: Refrigeración y Climatización (M1–M8)",
    especialidad: "Refrigeración y Climatización",
    tipo: "Ruta de aprendizaje",
    duracion: "1.672 h programa",
    nivel: "3°–4° Medio",
    href: "/curso/climatizacion",
  },
  {
    id: "r8",
    titulo: "Guía: lectura de planos y simbología (M1)",
    especialidad: "Refrigeración y Climatización",
    tipo: "Guía de aprendizaje",
    duracion: "2 bloques",
    nivel: "3° Medio",
    href: "/curso/climatizacion/m1-planos",
  },
  {
    id: "r9",
    titulo: "Simulación 3D: diagnóstico de fallas (M6)",
    especialidad: "Refrigeración y Climatización",
    tipo: "Simulación 3D",
    duracion: "1–2 bloques",
    nivel: "4° Medio",
    href: "/curso/climatizacion/m6-diagnostico",
  },
  {
    id: "r1",
    titulo: "Guía de circuitos serie y paralelo (demo)",
    especialidad: "Electricidad",
    tipo: "Guía de aprendizaje",
    duracion: "2 bloques",
    nivel: "3° Medio",
  },
];

export const NAV_SECTIONS = [
  { id: "resumen", label: "Panel general", href: "/portal-docente" },
  { id: "cursos", label: "Cursos / Planificación", href: "/portal-docente/cursos" },
  { id: "estudiantes", label: "Estudiantes", href: "/portal-docente/estudiantes" },
  { id: "oa-ae", label: "OA, AE y criterios de evaluación", href: "/portal-docente/oa-ae" },
  { id: "cumplimiento", label: "Cumplimiento", href: "/portal-docente/cumplimiento" },
  { id: "reportes", label: "Reportes", href: "/portal-docente/reportes" },
] as const;

export type SectionId = (typeof NAV_SECTIONS)[number]["id"];

export function isValidSection(s: string): s is SectionId {
  return NAV_SECTIONS.some((n) => n.id === s);
}
