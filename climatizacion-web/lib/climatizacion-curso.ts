/**
 * Curso Aula TP — Refrigeración y Climatización
 * Diseño según Prompt Maestro (30 % por módulo, ruta obligatoria, Práctica Libre paralela).
 * Fuente: Programa MINEDUC 2015 (DS 452/2013; Decreto Exento 0954/2015).
 * OA/AE/CE del programa. Casos = demo narrativo. No inventa AE.
 */

export type NivelMedio = "3°" | "4°";

export type EstadoOaAe = "no_iniciado" | "en_progreso" | "logrado";

export type AeCurso = {
  codigo: string;
  descripcion: string;
  incluidoEn30: boolean;
};

export type CriterioEvaluacion = {
  codigo: string;
  descripcion: string;
  oag: string[];
};

export type EstacionOutline = {
  id: string;
  titulo: string;
  horas: number;
  aeCodigos: string[];
  ceCodigos?: string[];
  resumen: string;
};

export type RutaPasoId =
  | "contextualizacion"
  | "estaciones_ae"
  | "situacion_integradora"
  | "evaluacion_final"
  | "retroalimentacion_cierre";

export type RutaPaso = {
  id: RutaPasoId;
  titulo: string;
  contenido: string;
  horas?: number;
};

export type PracticaLibreFase = {
  id: "explorar" | "desafiar" | "investigar" | "transferir";
  titulo: string;
  descripcion: string;
};

export type ModuloClimatizacion = {
  id: string;
  numero: number;
  nombre: string;
  /** Horas oficiales del Plan de Estudio MINEDUC */
  horasOficiales: number;
  /** 30 % Aula TP (incluye 2 h de Evaluación Final) */
  horasAulaTp: number;
  /** Siempre 2 h pedagógicas incluidas en horasAulaTp */
  horasEvaluacionFinal: 2;
  nivel: NivelMedio;
  oaCodigos: string[];
  oaDescripciones: { codigo: string; descripcion: string }[];
  ae: AeCurso[];
  aeExcluidosNota: string;
  estaciones: EstacionOutline[];
  /** Ruta obligatoria Prompt Maestro (sin Práctica Libre) */
  rutaObligatoria: RutaPaso[];
  /** @deprecated usar rutaObligatoria — se mantiene alias para compat */
  ruta: RutaPaso[];
  practicaLibre: {
    modo: "boton_verde_paralelo";
    label: string;
    nota: string;
    fases: PracticaLibreFase[];
    resumen: string;
  };
  evaluacionFinal: {
    horas: 2;
    formato: string;
    sinAgente: true;
  };
  cierre: {
    tipo: string;
    descripcion: string;
  };
  agentePedagogico: string;
  evidenciaDocente: string;
  piloto?: boolean;
  criteriosEvaluacionMuestra?: CriterioEvaluacion[];
  /** @deprecated usar horasOficiales */
  horas: number;
};

export const CLIMATIZACION_META = {
  especialidad: "Refrigeración y Climatización",
  sector: "Construcción",
  decretoBases: "Decreto Supremo de Educación N° 452/2013",
  decretoPrograma: "Decreto Exento de Educación N° 0954/2015",
  programaEdicion: "Primera edición: octubre de 2015",
  horasTotales: 1672,
  horasTercero: 836,
  horasCuarto: 836,
  regla30: "Cada módulo se trabaja de forma independiente con el 30 % de sus horas/contenido. La Evaluación Final (2 h) está incluida en las horas Aula TP.",
  rutaObligatoriaLabels: [
    "Contextualización",
    "Estaciones AE",
    "Situación Integradora",
    "Evaluación Final (2 h)",
    "Retroalimentación y cierre",
  ] as const,
  practicaLibreLabel: "Práctica Libre",
  practicaLibreNota:
    "Botón verde paralelo. Explorar → Desafiar → Investigar → Transferir. No altera progreso ni nota. No forma parte de la secuencia obligatoria.",
  documentoMaestro: "/aula-tp/climatizacion-curso-prompt-maestro.md",
  documentoAnteriorSuperseded: "/aula-tp/climatizacion-ruta-aula-tp.md",
  moduloComun: {
    nombre: "Emprendimiento y empleabilidad",
    horas: 76,
    nivel: "4°" as NivelMedio,
    nota: "En su diseño inicial no está asociado a OA de especialidad, sino a Objetivos de Aprendizaje Genéricos. Fuera del paquete A–F técnico de esta entrega.",
  },
} as const;

/** Tabla canónica 30 % (M1–M4 según ejemplo Prompt Maestro; M5–M8 = 30 % oficial) */
export const HORAS_AULA_TP_POR_MODULO: Record<
  number,
  { oficiales: number; aulaTp: number }
> = {
  1: { oficiales: 190, aulaTp: 57 },
  2: { oficiales: 190, aulaTp: 57 },
  3: { oficiales: 228, aulaTp: 68.4 },
  4: { oficiales: 228, aulaTp: 68.4 },
  5: { oficiales: 228, aulaTp: 68.4 },
  6: { oficiales: 190, aulaTp: 57 },
  7: { oficiales: 190, aulaTp: 57 },
  8: { oficiales: 152, aulaTp: 45.6 },
};

export const OA_ESPECIALIDAD = [
  {
    codigo: "OA 1",
    descripcion:
      "Leer y utilizar planos de redes de cañería y redes de ductos, simbología y especificaciones técnicas de proyectos de refrigeración y climatización, verificando su adecuación a las condiciones reales de la obra que facilitarían u obstaculizarían la realización del proyecto.",
  },
  {
    codigo: "OA 2",
    descripcion:
      "Cubicar elementos y materiales, de acuerdo a volúmenes y superficies, para la elaboración de proyectos de refrigeración, climatización, calefacción y ventilación, utilizando programas computacionales apropiados.",
  },
  {
    codigo: "OA 3",
    descripcion:
      "Realizar mediciones y controles de verificación de distintas magnitudes relacionadas con el proyecto, de acuerdo a las especificaciones técnicas, normas de seguridad, prevención de riesgos y protección del medio ambiente.",
  },
  {
    codigo: "OA 4",
    descripcion:
      "Armar, instalar y aislar redes de ductos y cañerías para el flujo de refrigerantes, aire, agua y fluidos especiales para los sistemas de refrigeración, ventilación, climatización y calefacción, realizando uniones soldadas que aseguren la hermeticidad, de acuerdo a la Norma chilena NCh3241 de Buenas Prácticas.",
  },
  {
    codigo: "OA 5",
    descripcion:
      "Instalar equipos y componentes de sistemas de refrigeración, calefacción, climatización y ventilación de energías diversas, incluidos los dispositivos electrónicos de control automático, de acuerdo a las especificaciones técnicas del proyecto y las orientaciones del profesional encargado, considerando la Norma Chilena NCh3241 de Buenas Prácticas.",
  },
  {
    codigo: "OA 6",
    descripcion:
      "Cargar fluidos y poner en marcha sistemas de refrigeración, climatización, calefacción y ventilación considerando las presiones y fuerzas indicadas por los fabricantes, el uso de refrigerantes amigables con el medio ambiente y la Norma Chilena NCh3241 de Buenas Prácticas.",
  },
  {
    codigo: "OA 7",
    descripcion:
      "Inspeccionar y diagnosticar fallas del funcionamiento de los sistemas de refrigeración, climatización, calefacción y ventilación, respecto de las especificaciones técnicas del fabricante.",
  },
  {
    codigo: "OA 8",
    descripcion:
      "Realizar el mantenimiento preventivo y correctivo de los sistemas de refrigeración, climatización, calefacción y ventilación, considerando los parámetros establecidos en los manuales de fabricación.",
  },
  {
    codigo: "OA 9",
    descripcion:
      "Recuperar, reciclar y almacenar refrigerantes de los sistemas de refrigeración y climatización, utilizando las herramientas y equipos apropiados para una manipulación adecuada y segura, con los contenedores aprobados para la operación, de acuerdo a la Norma Chilena NCh3241 de Buenas Prácticas.",
  },
] as const;

function oa(codes: string[]) {
  return OA_ESPECIALIDAD.filter((o) => codes.includes(o.codigo)).map((o) => ({
    codigo: o.codigo,
    descripcion: o.descripcion,
  }));
}

const FASES_PL_BASE: PracticaLibreFase[] = [
  {
    id: "explorar",
    titulo: "Explorar",
    descripcion: "Mayor apoyo, variables visibles y preguntas de observación.",
  },
  {
    id: "desafiar",
    titulo: "Desafiar",
    descripcion: "Menos procedimiento; el estudiante elige estrategia.",
  },
  {
    id: "investigar",
    titulo: "Investigar",
    descripcion: "Formular hipótesis y usar evidencia.",
  },
  {
    id: "transferir",
    titulo: "Transferir",
    descripcion: "Situación nueva con condiciones significativamente distintas.",
  },
];

function rutaObligatoria(parts: {
  contexto: string;
  estaciones: string;
  situacion: string;
  evaluacion: string;
  cierre: string;
  hCtx: number;
  hEst: number;
  hSit: number;
  hCierre: number;
}): RutaPaso[] {
  return [
    {
      id: "contextualizacion",
      titulo: "1. Contextualización",
      contenido: parts.contexto,
      horas: parts.hCtx,
    },
    {
      id: "estaciones_ae",
      titulo: "2. Estaciones AE (aprendizajes)",
      contenido: parts.estaciones,
      horas: parts.hEst,
    },
    {
      id: "situacion_integradora",
      titulo: "3. Situación integradora",
      contenido: parts.situacion,
      horas: parts.hSit,
    },
    {
      id: "evaluacion_final",
      titulo: "4. Evaluación final (2 h pedagógicas)",
      contenido: parts.evaluacion,
      horas: 2,
    },
    {
      id: "retroalimentacion_cierre",
      titulo: "5. Retroalimentación y cierre",
      contenido: parts.cierre,
      horas: parts.hCierre,
    },
  ];
}

function pl(resumen: string) {
  return {
    modo: "boton_verde_paralelo" as const,
    label: "Práctica Libre",
    nota: CLIMATIZACION_META.practicaLibreNota,
    fases: FASES_PL_BASE,
    resumen,
  };
}



const _MODULOS_RAW: Omit<ModuloClimatizacion, "ruta">[] = [
  {
    id: "mod-1-planos-cubicacion",
    numero: 1,
    nombre: "Lectura de planos y cubicación de materiales de proyectos",
    horasOficiales: 190,
    horasAulaTp: 57,
    horasEvaluacionFinal: 2,
    horas: 190,
    nivel: "3°",
    oaCodigos: ["OA 1", "OA 2"],
    oaDescripciones: oa(["OA 1", "OA 2"]),
    ae: [
      {
        codigo: "AE 1.1",
        incluidoEn30: true,
        descripcion:
          "Lee planos de refrigeración y climatización, utilizando la simbología técnica respectiva para reconocer el espacio físico donde se instalarán las distintas redes de refrigeración y climatización, en relación con las normas de dibujo técnico establecidas de calefacción y ventilación.",
      },
      {
        codigo: "AE 1.2",
        incluidoEn30: true,
        descripcion:
          "Lee y utiliza las especificaciones técnicas de proyectos de refrigeración y climatización, para conocer las indicaciones técnicas y el tipo de material que se empleará en la ejecución de los trabajos y poder determinar posibles interferencias o dificultades en las etapas del proyecto.",
      },
      {
        codigo: "AE 1.3",
        incluidoEn30: false,
        descripcion:
          "Cubica elementos y materiales de acuerdo a los requerimientos del lugar, indicados en el plano respectivo mediante un software de diseño para determinar cantidad de materiales y elementos a emplear en la ejecución del proyecto (NCh353/2000).",
      },
      {
        codigo: "AE 1.4",
        incluidoEn30: false,
        descripcion:
          "Elabora informe de cubicación de elementos y materiales, estableciendo la cantidad de materiales a utilizar y los costos totales del proyecto, de acuerdo a NCh353/2000.",
      },
    ],
    aeExcluidosNota:
      "Fuera del 30 % Aula TP: AE 1.3 y AE 1.4 (cubicación software e informe de costos) — taller/presencial o fase posterior.",
    estaciones: [
      { id: "m1-e1", titulo: "Simbología en plano", horas: 10, aeCodigos: ["AE 1.1"], resumen: "Hotspots + leyenda." },
      { id: "m1-e2", titulo: "Espacio físico / interferencias", horas: 12, aeCodigos: ["AE 1.1"], resumen: "Overlay plano–obra." },
      { id: "m1-e3", titulo: "Lectura de especificaciones", horas: 10, aeCodigos: ["AE 1.2"], resumen: "Ficha vs partida." },
      { id: "m1-e4", titulo: "Interferencias de proyecto", horas: 10, aeCodigos: ["AE 1.2"], resumen: "Marcar dificultades por etapa." },
    ],
    rutaObligatoria: rutaObligatoria({
      contexto: "Caso demo: edificio de oficinas en Providencia (RM). Contrastar planos con restricciones reales de obra.",
      estaciones: "AE 1.1–1.2: simbología, overlay, especificaciones, interferencias (~42 h estaciones + ctx/sit/cierre).",
      situacion: "Interpretar planos + especificaciones y marcar interferencias críticas (sin informe de costos).",
      evaluacion: "Interpretación de planos/docs + situación: interpretar → decidir interferencia → fundamentar. 2 h. Sin Agente.",
      cierre: "Mapa de relaciones simbología ↔ especificación ↔ espacio físico.",
      hCtx: 3, hEst: 42, hSit: 8, hCierre: 2,
    }),
    practicaLibre: pl("Leyendas, planos incompletos, interferencias y transferencia a otro tipo de red."),
    evaluacionFinal: {
      horas: 2,
      formato: "25 ítems contextualizados (simbología/especificación) + situación interpretar–decidir–fundamentar.",
      sinAgente: true,
    },
    cierre: {
      tipo: "mapa_relaciones",
      descripcion: "Mapa de relaciones simbología–especificación–espacio físico.",
    },
    agentePedagogico: "Niveles 0–6: orienta símbolos y lectura; no resuelve. Off en Evaluación Final.",
    evidenciaDocente: "Portal: OA 1–2 y AE 1.1–1.2 (rebanada 30 %); estados por estación.",
  },
  {
    id: "mod-2-instrumentos",
    numero: 2,
    nombre: "Instrumentos de medición y verificación",
    horasOficiales: 190,
    horasAulaTp: 57,
    horasEvaluacionFinal: 2,
    horas: 190,
    nivel: "3°",
    oaCodigos: ["OA 3"],
    oaDescripciones: oa(["OA 3"]),
    ae: [
      {
        codigo: "AE 2.1",
        incluidoEn30: true,
        descripcion:
          "Utiliza instrumentos de medición y verificación de distintos parámetros, de acuerdo a las indicaciones establecidas desde fábrica, considerando técnicas apropiadas y normas de seguridad necesarias para el uso del instrumento.",
      },
      {
        codigo: "AE 2.2",
        incluidoEn30: true,
        descripcion:
          "Verifica parámetros medidos por los instrumentos, comparándolos con datos de manuales de fabricación de los equipos, para determinar posibles ajustes que deben realizarse a equipos dentro del sistema de refrigeración.",
      },
    ],
    aeExcluidosNota: "Recorte: ajustes correctivos profundos de taller y metrología de laboratorio avanzada.",
    estaciones: [
      { id: "m2-e1", titulo: "Selección y seguridad de instrumentos", horas: 10, aeCodigos: ["AE 2.1"], resumen: "Instrumento–magnitud–EPP." },
      { id: "m2-e2", titulo: "Técnica de medición guiada", horas: 12, aeCodigos: ["AE 2.1"], resumen: "Microsim manómetro/termómetro." },
      { id: "m2-e3", titulo: "Contraste con manual", horas: 12, aeCodigos: ["AE 2.2"], resumen: "Tabla medido vs fábrica." },
      { id: "m2-e4", titulo: "Propuesta de ajuste", horas: 8, aeCodigos: ["AE 2.2"], resumen: "Ajustar / re-medir / escalar." },
    ],
    rutaObligatoria: rutaObligatoria({
      contexto: "Caso demo: cámara de frío en packing frutícola (Valle de Aconcagua).",
      estaciones: "AE 2.1–2.2: selección, técnica, contraste, propuesta de ajuste.",
      situacion: "Bitácora completa de verificación vs ficha de fabricante.",
      evaluacion: "Énfasis mediciones/tablas; interpretar lecturas → decidir ajuste → fundamentar. 2 h.",
      cierre: "Comparación «al inicio / ahora» en competencia de medición.",
      hCtx: 3, hEst: 42, hSit: 8, hCierre: 2,
    }),
    practicaLibre: pl("Estaciones cortas de medición y contraste con rangos de fábrica."),
    evaluacionFinal: {
      horas: 2,
      formato: "Datos e instrumentos + caso de verificación de parámetros.",
      sinAgente: true,
    },
    cierre: { tipo: "comparacion_inicio_ahora", descripcion: "Comparación al inicio / ahora." },
    agentePedagogico: "Guía procedimiento de lectura y errores típicos (niveles 0–6). Off en eval.",
    evidenciaDocente: "Portal: OA 3 y AE 2.1–2.2.",
  },
  {
    id: "mod-3-redes",
    numero: 3,
    nombre: "Instalación y montaje de redes de refrigeración y climatización",
    horasOficiales: 228,
    horasAulaTp: 68.4,
    horasEvaluacionFinal: 2,
    horas: 228,
    nivel: "3°",
    oaCodigos: ["OA 4"],
    oaDescripciones: oa(["OA 4"]),
    ae: [
      {
        codigo: "AE 3.1",
        incluidoEn30: true,
        descripcion:
          "Realiza unión de diferentes tipos de materiales, utilizando soldaduras autorizadas por la normativa y considerando las técnicas establecidas desde fábrica, la normativa técnica y de seguridad.",
      },
      {
        codigo: "AE 3.2",
        incluidoEn30: true,
        descripcion:
          "Arma diferentes redes de tuberías, utilizando diversas soldaduras y considerando las técnicas establecidas desde fábrica, la normativa técnica y de seguridad respectiva.",
      },
      {
        codigo: "AE 3.3",
        incluidoEn30: false,
        descripcion:
          "Instala diferentes redes de tuberías para la conducción de agua, aire y refrigerantes, asegurando su estabilidad mediante fijaciones apropiadas al plano y al material que las sustentará.",
      },
      {
        codigo: "AE 3.4",
        incluidoEn30: false,
        descripcion:
          "Aísla redes de tuberías para la conducción de agua, aire y refrigerantes, considerando las técnicas establecidas desde fábrica, la normativa técnica y de seguridad respectiva.",
      },
    ],
    aeExcluidosNota: "Fuera del 30 %: AE 3.3 y AE 3.4 (instalación con fijaciones y aislamiento completo) — presencial/taller.",
    estaciones: [
      { id: "m3-e1", titulo: "Materiales y soldaduras autorizadas", horas: 12, aeCodigos: ["AE 3.1"], resumen: "Normativa y selección." },
      { id: "m3-e2", titulo: "Secuencia de unión segura", horas: 14, aeCodigos: ["AE 3.1"], resumen: "Procedimiento + EPP." },
      { id: "m3-e3", titulo: "Armado de tramo de red", horas: 16, aeCodigos: ["AE 3.2"], resumen: "Microsim de armado." },
      { id: "m3-e4", titulo: "Hermeticidad conceptual", horas: 10, aeCodigos: ["AE 3.2"], resumen: "Verificación NCh3241." },
    ],
    rutaObligatoria: rutaObligatoria({
      contexto: "Caso demo: líneas de refrigerante y drenaje para split en vivienda social (Valparaíso).",
      estaciones: "AE 3.1–3.2: unión, secuencia, armado, hermeticidad (~52 h estaciones).",
      situacion: "Armar tramo según plano con uniones bajo NCh3241.",
      evaluacion: "Secuencia de montaje + detección de riesgos. 2 h.",
      cierre: "Checklist profesional de competencias de unión/armado.",
      hCtx: 3.4, hEst: 52, hSit: 11, hCierre: 2,
    }),
    practicaLibre: pl("Uniones cortas y chequeos de secuencia segura."),
    evaluacionFinal: {
      horas: 2,
      formato: "Ordenamiento de montaje + riesgos + situación de hermeticidad.",
      sinAgente: true,
    },
    cierre: { tipo: "checklist_competencias", descripcion: "Checklist profesional de uniones/armado." },
    agentePedagogico: "Alerta pasos de seguridad omitidos; no ejecuta el procedimiento. Off en eval.",
    evidenciaDocente: "Portal: OA 4 y AE 3.1–3.2 (30 %).",
  },
  {
    id: "mod-4-equipos",
    numero: 4,
    nombre: "Instalación y montaje de equipos",
    horasOficiales: 228,
    horasAulaTp: 68.4,
    horasEvaluacionFinal: 2,
    horas: 228,
    nivel: "3°",
    oaCodigos: ["OA 5"],
    oaDescripciones: oa(["OA 5"]),
    ae: [
      {
        codigo: "AE 4.1",
        incluidoEn30: true,
        descripcion:
          "Lee y utiliza planos, junto con las especificaciones técnicas de distintos sistemas y equipos de refrigeración y climatización, para identificar las dificultades que podrían presentar en la instalación.",
      },
      {
        codigo: "AE 4.2",
        incluidoEn30: true,
        descripcion:
          "Instala equipos y componentes de sistemas de refrigeración, climatización, calefacción y ventilación disponibles para instalaciones domiciliarias, considerando las especificaciones técnicas de los manuales de instalación, la normativa técnica y de seguridad respectiva.",
      },
      {
        codigo: "AE 4.3",
        incluidoEn30: false,
        descripcion:
          "Instala dispositivos de control automáticos, considerando las especificaciones técnicas establecidas desde fábrica, la normativa técnica y de seguridad respectiva.",
      },
    ],
    aeExcluidosNota: "Fuera del 30 %: AE 4.3 (control automático en profundidad).",
    estaciones: [
      { id: "m4-e1", titulo: "Dificultades de instalación en plano", horas: 12, aeCodigos: ["AE 4.1"], resumen: "Identificar obstáculos." },
      { id: "m4-e2", titulo: "Lectura de manual de montaje", horas: 10, aeCodigos: ["AE 4.1", "AE 4.2"], resumen: "Checklist de fabricante." },
      { id: "m4-e3", titulo: "Posicionamiento y montaje", horas: 18, aeCodigos: ["AE 4.2"], resumen: "Sim de montaje domiciliario." },
      { id: "m4-e4", titulo: "Verificación post-montaje", horas: 12, aeCodigos: ["AE 4.2"], resumen: "NCh3241 + EPP." },
    ],
    rutaObligatoria: rutaObligatoria({
      contexto: "Caso demo: evaporadora/condensadora en oficina municipal (Biobío).",
      estaciones: "AE 4.1–4.2: dificultades, manual, montaje, verificación.",
      situacion: "Instalar equipo según planos/manual verificando NCh3241.",
      evaluacion: "Montaje + decisión técnica con manual. 2 h.",
      cierre: "Línea de decisiones de montaje.",
      hCtx: 3.4, hEst: 52, hSit: 11, hCierre: 2,
    }),
    practicaLibre: pl("Montaje de componentes y chequeos de manual."),
    evaluacionFinal: {
      horas: 2,
      formato: "Montaje + decisión con manual de instalación.",
      sinAgente: true,
    },
    cierre: { tipo: "linea_decisiones", descripcion: "Línea de decisiones tomadas en el montaje." },
    agentePedagogico: "Checklist de manual paso a paso (orienta, no completa). Off en eval.",
    evidenciaDocente: "Portal: OA 5 y AE 4.1–4.2 (30 %).",
  },
  {
    id: "mod-5-puesta-en-marcha",
    numero: 5,
    nombre: "Puesta en marcha de equipos de refrigeración y climatización",
    horasOficiales: 228,
    horasAulaTp: 68.4,
    horasEvaluacionFinal: 2,
    horas: 228,
    nivel: "4°",
    oaCodigos: ["OA 6"],
    oaDescripciones: oa(["OA 6"]),
    ae: [
      {
        codigo: "AE 5.1",
        incluidoEn30: true,
        descripcion:
          "Prepara el espacio físico y el equipamiento para el correcto transporte del equipo de refrigeración requerido en la carga de fluidos en sistemas refrigerantes, aplicando medidas de seguridad y cuidado del medio ambiente (NCh3241).",
      },
      {
        codigo: "AE 5.2",
        incluidoEn30: true,
        descripcion:
          "Carga fluidos en equipos de refrigeración, aplicando las medidas de seguridad y cuidado del medio ambiente necesarios, establecidos en NCh3241.",
      },
      {
        codigo: "AE 5.3",
        incluidoEn30: false,
        descripcion:
          "Pone en marcha sistemas de refrigeración, considerando las especificaciones técnicas establecidas desde fábrica, la normativa técnica, medio ambiental y de seguridad respectiva.",
      },
    ],
    aeExcluidosNota: "Fuera del 30 %: AE 5.3 completa (puesta en marcha multi-sistema); solo verificación mínima post-carga como puente.",
    estaciones: [
      { id: "m5-e1", titulo: "Preparación de área y EPP", horas: 12, aeCodigos: ["AE 5.1"], resumen: "NCh3241 preparación." },
      { id: "m5-e2", titulo: "Equipos de carga y transporte", horas: 12, aeCodigos: ["AE 5.1"], resumen: "Selección de equipamiento." },
      { id: "m5-e3", titulo: "Secuencia de carga de fluido", horas: 18, aeCodigos: ["AE 5.2"], resumen: "Sim de carga segura." },
      { id: "m5-e4", titulo: "Registro de parámetros / ambiente", horas: 12, aeCodigos: ["AE 5.2"], resumen: "Presiones y cuidado ambiental." },
    ],
    rutaObligatoria: rutaObligatoria({
      contexto: "Caso demo: puesta en marcha de frío en sala de venta (Los Lagos) — foco preparación y carga.",
      estaciones: "AE 5.1–5.2: preparación, transporte, carga, registro.",
      situacion: "Preparar área y cargar fluido con verificación de parámetros (NCh3241).",
      evaluacion: "Protocolo de carga + lectura de presiones. 2 h.",
      cierre: "Síntesis visual de buenas prácticas NCh3241.",
      hCtx: 3.4, hEst: 54, hSit: 11, hCierre: 2,
    }),
    practicaLibre: pl("Drills de checklist pre-carga y EPP."),
    evaluacionFinal: {
      horas: 2,
      formato: "Protocolo de carga y parámetros; sin pistas.",
      sinAgente: true,
    },
    cierre: { tipo: "sintesis_visual", descripcion: "Síntesis visual NCh3241." },
    agentePedagogico: "Detiene secuencia insegura (EPP/ambiente); no da valores objetivo. Off en eval.",
    evidenciaDocente: "Portal: OA 6 y AE 5.1–5.2 (30 %).",
  },
  {
    id: "mod-6-diagnostico",
    numero: 6,
    nombre: "Diagnóstico de sistemas de refrigeración y climatización",
    horasOficiales: 190,
    horasAulaTp: 57,
    horasEvaluacionFinal: 2,
    horas: 190,
    nivel: "4°",
    oaCodigos: ["OA 7"],
    oaDescripciones: oa(["OA 7"]),
    ae: [
      {
        codigo: "AE 6.1",
        incluidoEn30: true,
        descripcion:
          "Inspecciona instalaciones y equipos de refrigeración, climatización, calefacción y ventilación, contrastando la información obtenida con los manuales de funcionamiento y las especificaciones técnicas de los equipos.",
      },
      {
        codigo: "AE 6.2",
        incluidoEn30: true,
        descripcion:
          "Diagnostica posibles fallas con la información obtenida a través de mediciones con instrumentos e inspección visual y propone posibles soluciones, de acuerdo con las especificaciones técnicas de su fabricación.",
      },
      {
        codigo: "AE 6.3",
        incluidoEn30: true,
        descripcion:
          "Establece los tipos de fallas o mal funcionamiento que pueden corregirse en obra o en taller, de acuerdo a las especificaciones técnicas de los distintos equipos y sistemas.",
      },
    ],
    aeExcluidosNota:
      "Reparación física completa pertenece a M7. Se incluyen AE 6.1–6.3 en la rebanada horaria del 30 % (módulo publicado).",
    criteriosEvaluacionMuestra: [
      {
        codigo: "CE 1.1",
        descripcion:
          "Revisa las instalaciones y equipos para identificar situaciones anómalas observables a simple vista, registrando y comparando con manuales y catálogos de fabricación.",
        oag: ["B", "C"],
      },
      {
        codigo: "CE 1.2",
        descripcion:
          "Verifica funcionamiento mediante lectura de instrumentos vs. especificaciones de fabricación, trabajando en equipo y asignando roles.",
        oag: ["B", "C", "D"],
      },
      {
        codigo: "CE 2.1",
        descripcion:
          "Conecta instrumentos para la búsqueda de fallas, comparando valores medidos con especificaciones técnicas de fabricación.",
        oag: ["B", "C"],
      },
      {
        codigo: "CE 2.2",
        descripcion:
          "Diagnostica posibles fallas analizando mediciones e inspección visual, trabajando en equipo y coordinando tareas.",
        oag: ["B", "C", "D"],
      },
      {
        codigo: "CE 2.3",
        descripcion:
          "Propone soluciones posibles a los problemas detectados, de acuerdo con los datos obtenidos y trabajando en equipo.",
        oag: ["C", "D"],
      },
      {
        codigo: "CE 2.4",
        descripcion:
          "Planifica acciones comunes e individuales para el logro del trabajo, proyecto o tarea, y asigna roles.",
        oag: ["C", "D"],
      },
      {
        codigo: "CE 3.1",
        descripcion:
          "Realiza un listado de fallas encontradas en la revisión de equipos para su posterior clasificación y búsqueda de solución.",
        oag: ["C"],
      },
      {
        codigo: "CE 3.2",
        descripcion:
          "Clasifica el tipo de fallas según su gravedad y tiempo de ejecución en la reparación, para determinar orden de prioridad.",
        oag: ["C"],
      },
      {
        codigo: "CE 3.3",
        descripcion:
          "Determina los tipos de fallas o mal funcionamiento que pueden corregirse en obra o en taller.",
        oag: ["B", "C"],
      },
      {
        codigo: "CE 3.4",
        descripcion:
          "Desarrolla listados de materiales y repuestos necesarios para las distintas mantenciones, para solicitar al fabricante.",
        oag: ["B", "C"],
      },
    ],
    estaciones: [
      { id: "m6-e1", titulo: "Inspección visual guiada", horas: 5, aeCodigos: ["AE 6.1"], ceCodigos: ["CE 1.1"], resumen: "Hotspots de anomalías." },
      { id: "m6-e2", titulo: "Contraste con manual y catálogo", horas: 5, aeCodigos: ["AE 6.1"], ceCodigos: ["CE 1.1"], resumen: "Observación ↔ especificación." },
      { id: "m6-e3", titulo: "Lectura de instrumentos vs especificación", horas: 6, aeCodigos: ["AE 6.1"], ceCodigos: ["CE 1.2"], resumen: "Tabla medido vs fábrica." },
      { id: "m6-e4", titulo: "Conexión de instrumentos", horas: 6, aeCodigos: ["AE 6.2"], ceCodigos: ["CE 2.1"], resumen: "Sim de conexión segura." },
      { id: "m6-e5", titulo: "Hipótesis de falla con evidencia", horas: 6, aeCodigos: ["AE 6.2"], ceCodigos: ["CE 2.2"], resumen: "Tablero de hipótesis." },
      { id: "m6-e6", titulo: "Soluciones y roles", horas: 5, aeCodigos: ["AE 6.2"], ceCodigos: ["CE 2.3", "CE 2.4"], resumen: "Propuesta + plan." },
      { id: "m6-e7", titulo: "Clasificación obra vs taller", horas: 6, aeCodigos: ["AE 6.3"], ceCodigos: ["CE 3.1", "CE 3.2", "CE 3.3"], resumen: "Prioridad y lugar." },
      { id: "m6-e8", titulo: "Listado de repuestos", horas: 4, aeCodigos: ["AE 6.3"], ceCodigos: ["CE 3.4"], resumen: "Solicitud a fabricante." },
    ],
    rutaObligatoria: rutaObligatoria({
      contexto:
        "Caso demo: edificio de departamentos en Ñuñoa — áreas comunes fuera de setpoint y ruido en condensadora (3 h).",
      estaciones:
        "AE 6.1–6.3 / CE 1.1–3.4: inspección, contraste, mediciones, hipótesis, soluciones, obra–taller, repuestos (~43 h estaciones).",
      situacion:
        "Gran desafío: info distribuida (audio, ficha, fotos, lecturas); informe de diagnóstico integral sin AE nuevo (7 h).",
      evaluacion:
        "Diagnóstico + fundamentación: 25 ítems + interpretar–decidir–fundamentar. 2 h. Agente nivel 0.",
      cierre: "Mapa de desempeño por familia de fallas + recomendaciones de Práctica Libre.",
      hCtx: 3, hEst: 43, hSit: 7, hCierre: 2,
    }),
    practicaLibre: pl(
      "Escenarios de falla (flujo restringido, sensor fuera de rango, etc.): Explorar→Desafiar→Investigar→Transferir.",
    ),
    evaluacionFinal: {
      horas: 2,
      formato:
        "Énfasis diagnóstico: 25 cerradas contextualizadas + situación interpretar / decidir falla y lugar / fundamentar con evidencia.",
      sinAgente: true,
    },
    cierre: {
      tipo: "mapa_desempeno",
      descripcion: "Mapa de desempeño por familia de fallas (eléctrica / mecánica / flujo / control).",
    },
    agentePedagogico:
      "Preguntas socráticas (¿qué magnitud contrastar primero?). Niveles 0–6. Sin ayuda en Evaluación Final.",
    evidenciaDocente:
      "Portal: OA 7, AE 6.1–6.3, CE 1.1–3.4; estados e informes/capturas de sim.",
  },
  {
    id: "mod-7-mantencion",
    numero: 7,
    nombre: "Mantención de sistemas de refrigeración y climatización",
    horasOficiales: 190,
    horasAulaTp: 57,
    horasEvaluacionFinal: 2,
    horas: 190,
    nivel: "4°",
    oaCodigos: ["OA 8"],
    oaDescripciones: oa(["OA 8"]),
    ae: [
      {
        codigo: "AE 7.1",
        incluidoEn30: true,
        descripcion:
          "Realiza mantenimiento preventivo considerando las especificaciones del proyecto, las condiciones de obra y los manuales de funcionamiento desde fábrica.",
      },
      {
        codigo: "AE 7.2",
        incluidoEn30: true,
        descripcion:
          "Realiza mantenimiento correctivo, considerando las especificaciones del proyecto, las condiciones de obra y los manuales de funcionamiento y fabricación.",
      },
    ],
    aeExcluidosNota: "Recorte: overhaul de taller y programas anuales multi-equipo completos.",
    estaciones: [
      { id: "m7-e1", titulo: "Lectura de plan preventivo", horas: 10, aeCodigos: ["AE 7.1"], resumen: "Manual + condiciones de obra." },
      { id: "m7-e2", titulo: "Ejecución checklist preventivo", horas: 14, aeCodigos: ["AE 7.1"], resumen: "Secuencia preventiva." },
      { id: "m7-e3", titulo: "Correctivo acotado", horas: 12, aeCodigos: ["AE 7.2"], resumen: "Una intervención derivada." },
      { id: "m7-e4", titulo: "Verificación post-servicio", horas: 8, aeCodigos: ["AE 7.1", "AE 7.2"], resumen: "Registro OT." },
    ],
    rutaObligatoria: rutaObligatoria({
      contexto: "Caso demo: plan de mantención anual de cámaras en planta agroindustrial (O’Higgins).",
      estaciones: "AE 7.1–7.2: preventivo, correctivo acotado, verificación.",
      situacion: "OT preventiva + correctiva acotada derivada de hallazgo.",
      evaluacion: "Orden de trabajo preventivo/correctivo. 2 h.",
      cierre: "Revisión de errores críticos y cómo fueron corregidos.",
      hCtx: 3, hEst: 44, hSit: 6, hCierre: 2,
    }),
    practicaLibre: pl("Checklists preventivos y drills de OT."),
    evaluacionFinal: {
      horas: 2,
      formato: "OT y registro post-servicio; caso preventivo/correctivo.",
      sinAgente: true,
    },
    cierre: {
      tipo: "errores_criticos",
      descripcion: "Revisión de errores críticos corregidos durante el módulo.",
    },
    agentePedagogico: "Recuerda intervalos y tolerancias del manual. Off en eval.",
    evidenciaDocente: "Portal: OA 8 y AE 7.1–7.2.",
  },
  {
    id: "mod-8-reciclaje",
    numero: 8,
    nombre: "Reciclaje y almacenamiento de refrigerantes",
    horasOficiales: 152,
    horasAulaTp: 45.6,
    horasEvaluacionFinal: 2,
    horas: 152,
    nivel: "4°",
    oaCodigos: ["OA 9"],
    oaDescripciones: oa(["OA 9"]),
    ae: [
      {
        codigo: "AE 8.1",
        incluidoEn30: true,
        descripcion:
          "Recupera refrigerantes en sistemas de refrigeración, aplicando medidas de seguridad y cuidado del medio ambiente (NCh3241).",
      },
      {
        codigo: "AE 8.2",
        incluidoEn30: false,
        descripcion:
          "Recicla refrigerantes de los sistemas de refrigeración, aplicando protocolos de reciclaje de fluidos según NCh3241/2011.",
      },
      {
        codigo: "AE 8.3",
        incluidoEn30: true,
        descripcion:
          "Almacena refrigerantes aplicando protocolos de almacenamiento según NCh3241/2011.",
      },
    ],
    aeExcluidosNota: "Fuera del 30 %: AE 8.2 reciclaje profundo en planta (se introduce concepto/puente).",
    estaciones: [
      { id: "m8-e1", titulo: "Preparación EPP / NCh3241", horas: 8, aeCodigos: ["AE 8.1"], resumen: "Seguridad y ambiente." },
      { id: "m8-e2", titulo: "Secuencia de recuperación", horas: 12, aeCodigos: ["AE 8.1"], resumen: "Equipo de recuperación." },
      { id: "m8-e3", titulo: "Contenedores y etiquetado", horas: 10, aeCodigos: ["AE 8.3"], resumen: "Contenedores aprobados." },
      { id: "m8-e4", titulo: "Custodia y registro", horas: 6, aeCodigos: ["AE 8.3"], resumen: "Documentación de custodia." },
    ],
    rutaObligatoria: rutaObligatoria({
      contexto: "Caso demo: retiro controlado de refrigerante en centro comercial (RM).",
      estaciones: "AE 8.1 y 8.3: recuperación, contenedores, custodia (~36 h estaciones).",
      situacion: "Recuperar y almacenar en contenedores aprobados con documentación.",
      evaluacion: "Protocolo + identificación de contenedores/riesgos. 2 h.",
      cierre: "Cierre narrativo del ciclo recuperar→almacenar.",
      hCtx: 2.6, hEst: 36, hSit: 5, hCierre: 2,
    }),
    practicaLibre: pl("Drills de conexión, etiquetado y contenedores aprobados."),
    evaluacionFinal: {
      horas: 2,
      formato: "Protocolo NCh3241 + contenedores y riesgos ambientales.",
      sinAgente: true,
    },
    cierre: {
      tipo: "cierre_narrativo",
      descripcion: "Narrativa de custodia del refrigerante recuperado.",
    },
    agentePedagogico: "Bloquea pasos inseguros (venteo, contenedor no aprobado). Off en eval.",
    evidenciaDocente: "Portal: OA 9 y AE 8.1 / 8.3 (30 %).",
  },
];


export const MODULOS_CLIMATIZACION: ModuloClimatizacion[] = _MODULOS_RAW.map((m) => ({
  ...m,
  ruta: m.rutaObligatoria,
}));

/** @deprecated M6 ya no es piloto — todos los módulos están publicados. */
export const PILOTO_MODULO_ID = "mod-6-diagnostico";

export function getModuloClimatizacion(id: string) {
  return MODULOS_CLIMATIZACION.find((m) => m.id === id);
}

/** @deprecated M6 publicado; retorna undefined. Preferir getModuloClimatizacion. */
export function getModuloPiloto(): ModuloClimatizacion | undefined {
  return undefined;
}

export function aeIncluidos30(m: ModuloClimatizacion) {
  return m.ae.filter((a) => a.incluidoEn30);
}
