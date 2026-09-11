/**
 * Módulo 3 — Instalación y montaje de redes
 * AE 3.1 unión/soldaduras · AE 3.2 armado de redes.
 * AE 3.3–3.4 fuera del 30 %. Caso: vivienda social Valparaíso — tramo split.
 * No inventa AE MINEDUC. Etapas ciclo Aula TP: Analizar → Comprender → Relacionar → Aplicar → Verificar → Retroalimentar.
 */

export type FaseRuta =
  | "contextualizacion"
  | "estacion_ae"
  | "situacion_integradora"
  | "evaluacion_final"
  | "retroalimentacion";

export type TipoInteraccion =
  | "briefing"
  | "materiales_soldadura"
  | "secuencia_union"
  | "armado_tramo"
  | "hermeticidad"
  | "gran_desafio"
  | "evaluacion_redes"
  | "checklist_competencias"
  | "hotspots";

export type AgenteNivel = {
  nivel: number;
  pregunta: string;
};

export type PracticaLibreFase = {
  id: "explorar" | "desafiar" | "investigar" | "transferir";
  titulo: string;
  descripcion: string;
  actividad: string;
};

export type OpcionInteractiva = {
  id: string;
  label: string;
  correcta?: boolean;
  detalle?: string;
  familia?: "material" | "soldadura" | "secuencia" | "seguridad" | "hermeticidad" | "registro";
};

export type EstacionM3 = {
  id: string;
  orden: number;
  slug: string;
  titulo: string;
  horas: number;
  fase: FaseRuta;
  aeCodigos: string[];
  ceCodigos: string[];
  habilidad: string;
  preguntaPedagogica: string;
  escenario: string;
  interaccion: TipoInteraccion;
  evidenciaMinima: string;
  errorUtil?: string;
  opciones: OpcionInteractiva[];
  agente: AgenteNivel[];
  permiteAgente: boolean;
  ctaCompletar: string;
  ctaSiguiente: string;
  bloqueadoHastaCompletarAnterior: boolean;
  esEvaluacionFormal?: boolean;
  mediaUrl?: string;
  mediaAlt?: string;
  mediaCaption?: string;
  hotspots?: {
    id: string;
    optionId: string;
    label: string;
    x: number;
    y: number;
    r?: number;
  }[];
};

export const M3_META = {
  moduloNumero: 3,
  nombre: "Instalación y montaje de redes de refrigeración y climatización",
  especialidad: "Refrigeración y Climatización",
  oa: "OA 4",
  oaTexto:
    "Armar, instalar y aislar redes de ductos y cañerías… realizando uniones soldadas que aseguren la hermeticidad (NCh3241).",
  horasAulaTp: 68.4,
  horasDesarrollo: 66.4,
  horasEvaluacionFinal: 2,
  casoDemo: {
    titulo: "Vivienda social — Valparaíso (tramo split)",
    resumen:
      "Unión con soldaduras autorizadas, secuencia segura, armado de tramo y hermeticidad conceptual NCh3241. Sin fijaciones profundas ni aislamiento completo (AE 3.3–3.4).",
    actor: "Soldador/instalador de redes",
    equipo: "Líneas de refrigerante y drenaje para split domiciliario",
    hallazgoTipico: "Tramo a armar con riesgo de secuencia insegura de soldadura",
  },
  portalDocenteHref: "/curso/climatizacion",
  heroMediaUrl: "/images/climatizacion/m3-montaje-redes.png",
  heroMediaAlt: "Montaje de red de cañerías de refrigeración",
  storageKey: "aula-tp-m3-redes-progress-v1",
} as const;

export const PRACTICA_LIBRE_M3: PracticaLibreFase[] = [
  {
    id: "explorar",
    titulo: "Explorar",
    descripcion: "Materiales y soldaduras autorizadas.",
    actividad: "Clasifica tres pares material–soldadura autorizada. Formativo, sin nota.",
  },
  {
    id: "desafiar",
    titulo: "Desafiar",
    descripcion: "Orden de secuencia segura.",
    actividad: "Ordena EPP → preparación → soldadura → verificación. Sin calificación.",
  },
  {
    id: "investigar",
    titulo: "Investigar",
    descripcion: "Riesgo de soldadura sin andamiaje.",
    actividad: "Detecta un riesgo crítico (sin EPP / zona inflamable) y propone corrección.",
  },
  {
    id: "transferir",
    titulo: "Transferir",
    descripcion: "Otro tramo.",
    actividad: "Aplica el método a un tramo de drenaje distinto al split Valparaíso. No avanza la barra.",
  },
];

export const ESTACIONES_M3: EstacionM3[] = [
  {
    id: "m3-ctx",
    orden: 0,
    slug: "contextualizacion",
    titulo: "Contextualización — Comprendo la situación · Vivienda social Valparaíso",
    horas: 3.4,
    fase: "contextualizacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "ANALIZAR",
    preguntaPedagogica:
      "¿Qué antecedentes orientan el armado del tramo de red del split?",
    escenario:
      "Vivienda social en Valparaíso. Debes armar un tramo de líneas de refrigerante y drenaje para split. Entrega: plano de tramo, listado de materiales, NCh3241 y EPP de soldadura. AE 3.3–3.4 (fijaciones/aislamiento completos) fuera del 30 %. Tu rol: soldador/instalador de redes.",
    interaccion: "briefing",
    evidenciaMinima: "Registrar al menos 2 antecedentes iniciales del caso.",
    mediaUrl: "/images/climatizacion/m3-montaje-redes.png",
    mediaAlt: "Montaje de tramo de red de cañerías en obra",
    mediaCaption: "Observa materiales y uniones antes de decidir la secuencia de montaje.",
    opciones: [
      { id: "ctx-plano", label: "Plano de tramo split (líneas + drenaje) y listado de materiales", correcta: true, familia: "material" },
      { id: "ctx-nch", label: "NCh3241 de buenas prácticas para uniones / hermeticidad", correcta: true, familia: "hermeticidad" },
      { id: "ctx-epp", label: "EPP de soldadura y condiciones del patio de trabajo", correcta: true, familia: "seguridad" },
      { id: "ctx-ais", label: "Aislar toda la red del edificio en esta visita (AE 3.4 completa)", correcta: false },
    ],
    agente: [
      { nivel: 1, pregunta: "¿Qué datos del briefing son de material y cuáles de seguridad?" },
      { nivel: 2, pregunta: "¿Qué verificarías primero: listado de materiales o EPP de soldadura?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Comprendo la situación — registrar antecedentes",
    ctaSiguiente: "Ir a materiales y soldaduras",
    bloqueadoHastaCompletarAnterior: false,
  },
  {
    id: "m3-e1",
    orden: 1,
    slug: "materiales-soldaduras",
    titulo: "Estación 1 — Materiales y soldaduras autorizadas",
    horas: 12,
    fase: "estacion_ae",
    aeCodigos: ["AE 3.1"],
    ceCodigos: [],
    habilidad: "RECONOCER",
    preguntaPedagogica:
      "¿Qué materiales y soldaduras están autorizados para el tramo?",
    escenario:
      "Selección normativa: cobre/aceros, aleaciones y técnicas autorizadas según fábrica y NCh3241. AE 3.1.",
    interaccion: "materiales_soldadura",
    evidenciaMinima: "Seleccionar ≥3 pares material–soldadura correctos.",
    errorUtil: "Usar soldadura no autorizada → falla de hermeticidad y rechazo.",
    mediaUrl: "/images/climatizacion/m3-soldadura.png",
    mediaAlt: "Soldadura autorizada de cañería de cobre para refrigeración",
    mediaCaption: "Usa materiales y EPP autorizados; purga con nitrógeno al brasar.",
    opciones: [
      { id: "mat-cu", label: "Cañería de cobre del diámetro indicado en plano/listado", correcta: true, familia: "material" },
      { id: "mat-sol", label: "Soldadura / aleación autorizada para refrigeración (según norma/fábrica)", correcta: true, familia: "soldadura" },
      { id: "mat-flux", label: "Consumibles (fundente/varilla) compatibles y en buen estado", correcta: true, familia: "material" },
      { id: "mat-epp", label: "EPP de soldadura listo antes de encender equipo", correcta: true, familia: "seguridad" },
      { id: "mat-malo", label: "Soldar con material improvisado no autorizado", correcta: false },
    ],
    agente: [
      { nivel: 2, pregunta: "¿Cómo verificas que la aleación está autorizada para el fluido?" },
      { nivel: 4, pregunta: "Si falta una varilla del listado, ¿sustituyes o detienes?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar materiales y soldaduras",
    ctaSiguiente: "Ir a secuencia de unión segura",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m3-e2",
    orden: 2,
    slug: "secuencia-union",
    titulo: "Estación 2 — Secuencia de unión segura",
    horas: 14,
    fase: "estacion_ae",
    aeCodigos: ["AE 3.1"],
    ceCodigos: [],
    habilidad: "EJECUTAR",
    preguntaPedagogica:
      "¿Qué secuencia de unión/soldadura es segura y trazable?",
    escenario:
      "Procedimiento: EPP → preparación de extremos → soldadura → enfriado/limpieza → inspección visual. AE 3.1.",
    interaccion: "secuencia_union",
    evidenciaMinima: "Completar ≥3 pasos de secuencia correcta; sin saltos inseguros.",
    errorUtil: "Soldar sin EPP ni zona despejada → riesgo grave.",
    mediaUrl: "/images/climatizacion/m3-soldadura.png",
    mediaAlt: "Secuencia de unión segura en cañería de cobre",
    mediaCaption: "Sigue la secuencia de brasaje segura antes de pasar a hermeticidad.",
    opciones: [
      { id: "sec-epp", label: "EPP + zona despejada / sin materiales inflamables", correcta: true, familia: "seguridad" },
      { id: "sec-prep", label: "Preparar extremos (corte, escariado, limpieza) según técnica", correcta: true, familia: "secuencia" },
      { id: "sec-sol", label: "Ejecutar soldadura autorizada con técnica de fábrica", correcta: true, familia: "soldadura" },
      { id: "sec-insp", label: "Inspección visual de la unión y registro fotográfico", correcta: true, familia: "registro" },
      { id: "sec-malo", label: "Encender soplete sin EPP ni control de zona", correcta: false },
    ],
    agente: [
      { nivel: 3, pregunta: "¿Qué verificación haces antes de abrir el gas del soplete?" },
      { nivel: 5, pregunta: "Si la unión queda irregular, ¿continúas el tramo o rehaces?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar secuencia de unión",
    ctaSiguiente: "Ir a armado de tramo",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m3-e3",
    orden: 3,
    slug: "armado-tramo",
    titulo: "Estación 3 — Armado de tramo de red",
    horas: 16,
    fase: "estacion_ae",
    aeCodigos: ["AE 3.2"],
    ceCodigos: [],
    habilidad: "APLICAR",
    preguntaPedagogica:
      "¿Cómo armas el tramo según plano con uniones autorizadas?",
    escenario:
      "Microsim de armado: orden de tramos, uniones sucesivas, pendientes de drenaje. AE 3.2. Fijaciones profundas (AE 3.3) solo como mención.",
    interaccion: "armado_tramo",
    evidenciaMinima: "Seleccionar ≥2 acciones de armado correctas.",
    errorUtil: "Armar sin seguir el plano → interferencias y retrabajo.",
    mediaUrl: "/images/climatizacion/m3-montaje-redes.png",
    mediaAlt: "Armado de tramo de red de refrigeración",
    mediaCaption: "Contrasta el armado del tramo con plano y buenas prácticas de unión.",
    opciones: [
      { id: "arm-ord", label: "Seguir orden de tramo del plano (líneas + drenaje)", correcta: true, familia: "secuencia" },
      { id: "arm-uni", label: "Aplicar uniones soldadas en cada empalme del tramo", correcta: true, familia: "soldadura" },
      { id: "arm-dre", label: "Respetar pendiente / sentido de drenaje según indicación", correcta: true, familia: "secuencia" },
      { id: "arm-fij", label: "Instalar todas las fijaciones estructurales del edificio (AE 3.3 completa)", correcta: false, detalle: "Fuera del 30 %." },
    ],
    agente: [
      { nivel: 4, pregunta: "¿Qué criterio del plano define el orden de armado del tramo?" },
      { nivel: 5, pregunta: "Si el drenaje queda sin pendiente, ¿qué registras?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar armado de tramo",
    ctaSiguiente: "Ir a hermeticidad conceptual",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m3-e4",
    orden: 4,
    slug: "hermeticidad-conceptual",
    titulo: "Estación 4 — Verificación de hermeticidad conceptual",
    horas: 10,
    fase: "estacion_ae",
    aeCodigos: ["AE 3.2"],
    ceCodigos: [],
    habilidad: "VERIFICAR",
    preguntaPedagogica:
      "¿Qué evidencias conceptuales de hermeticidad registras según NCh3241?",
    escenario:
      "Verificación conceptual (no prueba de campo completa): inspección de uniones, checklist NCh3241, registro. Puente breve a aislamiento (AE 3.4) sin ejecutarlo.",
    interaccion: "hotspots",
    evidenciaMinima: "Registrar ≥2 evidencias de hermeticidad conceptual.",
    errorUtil: "Dar por hermético sin inspeccionar uniones → fuga posterior.",
    mediaUrl: "/images/climatizacion/m3-hotspots-base.png",
    mediaAlt: "Prueba de hermeticidad: marca uniones, manómetros y evidencia",
    mediaCaption: "Haz clic en la fuga/unión, el manifold y el cilindro de nitrógeno.",
    hotspots: [
      { id: "hs-insp", optionId: "her-insp", label: "Unión / burbujas", x: 72, y: 42, r: 7 },
      { id: "hs-nch", optionId: "her-nch", label: "Manifold / presiones", x: 32, y: 72, r: 8 },
      { id: "hs-reg", optionId: "her-reg", label: "Cilindro N2 / registro", x: 18, y: 42, r: 7 },
      { id: "hs-ais", optionId: "her-ais", label: "Aislar todo el edificio (error)", x: 88, y: 18, r: 5 },
    ],
    opciones: [
      { id: "her-insp", label: "Inspección visual de todas las uniones del tramo", correcta: true, familia: "hermeticidad" },
      { id: "her-nch", label: "Checklist NCh3241 de buenas prácticas de unión", correcta: true, familia: "hermeticidad" },
      { id: "her-reg", label: "Bitácora: uniones OK / pendientes documentados", correcta: true, familia: "registro" },
      { id: "her-ais", label: "Aislar completamente la red del condominio (AE 3.4)", correcta: false, detalle: "Fuera del 30 % de este módulo: aquí verificas el tramo, no toda la red." },
    ],
    agente: [
      { nivel: 4, pregunta: "¿Qué defecto visual te haría rechazar una unión?" },
      { nivel: 6, pregunta: "Si una unión duda, ¿cierras el tramo o dejas pendiente?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar verificación de hermeticidad",
    ctaSiguiente: "Abrir Situación Integradora",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m3-sit",
    orden: 5,
    slug: "situacion-integradora",
    titulo: "Situación Integradora — Tramo bajo NCh3241",
    horas: 9,
    fase: "situacion_integradora",
    aeCodigos: ["AE 3.1", "AE 3.2"],
    ceCodigos: [],
    habilidad: "INTEGRAR",
    preguntaPedagogica:
      "¿Qué entrega integral de armado de tramo elaboras?",
    escenario:
      "Gran desafío: armar tramo según plano con uniones bajo NCh3241. Combina materiales, secuencia, armado y hermeticidad.",
    interaccion: "gran_desafio",
    evidenciaMinima: "Integrar ≥4 fuentes y concluir tramo conforme.",
    errorUtil:
      "Declarar tramo conforme sin evidencia de uniones/hermeticidad → fuga posterior.",
    opciones: [
      { id: "gd-mat", label: "Fuente: materiales y soldaduras autorizadas", correcta: true },
      { id: "gd-sec", label: "Fuente: secuencia EPP → soldadura → inspección", correcta: true },
      { id: "gd-arm", label: "Fuente: armado de tramo según plano", correcta: true },
      { id: "gd-her", label: "Fuente: checklist hermeticidad NCh3241", correcta: true },
      { id: "gd-conc", label: "Conclusión: tramo conforme; sin AE 3.3–3.4 completas", correcta: true },
    ],
    agente: [
      { nivel: 5, pregunta: "¿Qué fuente abrirías primero para el armado integral?" },
      { nivel: 6, pregunta: "Si plano y listado de materiales difieren, ¿cuál privilegias?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Entregar armado integral del tramo",
    ctaSiguiente: "Pasar a Evaluación Final (2 h)",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m3-eval",
    orden: 6,
    slug: "evaluacion-final",
    titulo: "Evaluación Final (2 h) — Secuencia + riesgos (sin Tutor)",
    horas: 2,
    fase: "evaluacion_final",
    aeCodigos: ["AE 3.1", "AE 3.2"],
    ceCodigos: [],
    habilidad: "EVALUAR",
    preguntaPedagogica:
      "Ordena el montaje y detecta riesgos (≠ planos M1 · ≠ mediciones M2).",
    escenario:
      "Bloque A: secuencia y riesgos (muestra). Bloque B: interpretar tramo → decidir secuencia → fundamentar riesgos. Agente off.",
    interaccion: "evaluacion_redes",
    evidenciaMinima: "Completar Bloque A (muestra) y Bloque B (3 acciones).",
    opciones: [
      { id: "ev-a1", label: "A1 — Materiales/soldaduras autorizadas antes de armar", correcta: true },
      { id: "ev-a2", label: "A2 — Secuencia segura: EPP → preparación → soldadura", correcta: true },
      { id: "ev-a3", label: "A3 — Riesgo típico: soldar sin zona despejada / sin EPP", correcta: true },
      { id: "ev-b-interp", label: "B1 Interpretar: plano tramo Valparaíso + listado", correcta: true },
      { id: "ev-b-decidir", label: "B2 Decidir: secuencia de armado con uniones NCh3241", correcta: true },
      { id: "ev-b-fund", label: "B3 Fundamentar: riesgos detectados + hermeticidad conceptual", correcta: true },
    ],
    agente: [],
    permiteAgente: false,
    esEvaluacionFormal: true,
    ctaCompletar: "Enviar evaluación de redes (simulado)",
    ctaSiguiente: "Ver checklist de competencias",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m3-cierre",
    orden: 7,
    slug: "retroalimentacion-cierre",
    titulo: "Retroalimentación y cierre — Checklist de competencias",
    horas: 2,
    fase: "retroalimentacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "RETROALIMENTAR",
    preguntaPedagogica:
      "¿Qué competencias de unión/armado consolidaste? (checklist profesional)",
    escenario:
      "Checklist de competencias de unión y armado. Distinto a mapa M1 y comparación M2. Práctica Libre.",
    interaccion: "checklist_competencias",
    evidenciaMinima: "Marcar ≥1 competencia y 1 recomendación de Práctica Libre.",
    opciones: [
      { id: "chk-mat", label: "Competencia: seleccionar materiales/soldaduras autorizadas", correcta: true, familia: "material" },
      { id: "chk-sec", label: "Competencia: ejecutar secuencia segura con EPP", correcta: true, familia: "seguridad" },
      { id: "chk-her", label: "Competencia: verificar hermeticidad conceptual NCh3241", correcta: true, familia: "hermeticidad" },
      { id: "chk-pl", label: "Practicar uniones cortas en Práctica Libre", correcta: true, familia: "registro" },
    ],
    agente: [
      { nivel: 1, pregunta: "¿Qué competencia del checklist quieres reforzar primero?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar módulo y guardar reflexión",
    ctaSiguiente: "Volver al curso",
    bloqueadoHastaCompletarAnterior: true,
  },
];

export function getEstacionBySlug(slug: string): EstacionM3 | undefined {
  return ESTACIONES_M3.find((e) => e.slug === slug);
}

export function getEstacionById(id: string): EstacionM3 | undefined {
  return ESTACIONES_M3.find((e) => e.id === id);
}

export function getEstacionByOrden(orden: number): EstacionM3 | undefined {
  return ESTACIONES_M3.find((e) => e.orden === orden);
}

export type ProgressState = {
  completedIds: string[];
  selectedByStation: Record<string, string[]>;
  currentId: string;
  evalSubmitted: boolean;
  practicaLibreVisits: string[];
};

export const INITIAL_PROGRESS: ProgressState = {
  completedIds: [],
  selectedByStation: {},
  currentId: ESTACIONES_M3[0].id,
  evalSubmitted: false,
  practicaLibreVisits: [],
};

export function stationIsUnlocked(
  estacion: EstacionM3,
  completedIds: string[],
): boolean {
  if (!estacion.bloqueadoHastaCompletarAnterior) return true;
  if (estacion.orden === 0) return true;
  const prev = ESTACIONES_M3.find((e) => e.orden === estacion.orden - 1);
  if (!prev) return true;
  return completedIds.includes(prev.id);
}

export function canCompleteStation(
  estacion: EstacionM3,
  selected: string[],
): boolean {
  const correctIds = estacion.opciones.filter((o) => o.correcta).map((o) => o.id);
  const selectedCorrect = selected.filter((id) => correctIds.includes(id));
  const selectedIncorrect = selected.filter(
    (id) => !correctIds.includes(id) && estacion.opciones.some((o) => o.id === id),
  );

  if (estacion.interaccion === "evaluacion_redes") {
    return selectedCorrect.length >= 5 && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "gran_desafio") {
    return selectedCorrect.length >= 4;
  }
  if (estacion.interaccion === "checklist_competencias") {
    return selected.length >= 1;
  }
  if (estacion.interaccion === "materiales_soldadura") {
    const minCorrect = Math.min(3, correctIds.length);
    return selectedCorrect.length >= minCorrect && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "secuencia_union") {
    const minCorrect = Math.min(3, correctIds.length);
    return selectedCorrect.length >= minCorrect && selectedIncorrect.length === 0;
  }
  const minCorrect = Math.min(2, correctIds.length);
  return selectedCorrect.length >= minCorrect && selectedIncorrect.length === 0;
}

export const FASE_LABELS: Record<FaseRuta, string> = {
  contextualizacion: "Contextualización",
  estacion_ae: "Estaciones AE",
  situacion_integradora: "Situación Integradora",
  evaluacion_final: "Evaluación Final (2 h)",
  retroalimentacion: "Retroalimentación y cierre",
};
