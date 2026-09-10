/**
 * Módulo 2 — Instrumentos de medición y verificación
 * AE 2.1 uso de instrumentos · AE 2.2 verificación vs manuales.
 * Caso: packing frutícola Aconcagua — cámara de frío.
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
  | "seleccion_instrumentos"
  | "tecnica_medicion"
  | "contraste_manual"
  | "propuesta_ajuste"
  | "gran_desafio"
  | "evaluacion_medicion"
  | "comparacion_inicio_ahora"
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
  familia?: "instrumento" | "tecnica" | "seguridad" | "contraste" | "ajuste" | "registro";
};

export type EstacionM2 = {
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

export const M2_META = {
  moduloNumero: 2,
  nombre: "Instrumentos de medición y verificación",
  especialidad: "Refrigeración y Climatización",
  oa: "OA 3",
  oaTexto:
    "Realizar mediciones y controles de verificación de distintas magnitudes relacionadas con el proyecto.",
  horasAulaTp: 57,
  horasDesarrollo: 55,
  horasEvaluacionFinal: 2,
  casoDemo: {
    titulo: "Packing frutícola — Valle de Aconcagua",
    resumen:
      "Cámara de frío: selección de instrumentos, técnica de medición, contraste con manual y propuesta de ajuste acotada. Sin metrología de laboratorio avanzada.",
    actor: "Técnico de servicio + supervisor de calidad",
    equipo: "Cámara de frío positivo · evaporadora / tablero de control",
    hallazgoTipico: "Temperatura de cámara fuera de rango vs ficha de fábrica",
  },
  portalDocenteHref: "/curso/climatizacion",
  heroMediaUrl: "/images/climatizacion/m2-instrumentos.png",
  heroMediaAlt: "Instrumentos de medición en cámara frigorífica",
  storageKey: "aula-tp-m2-medicion-progress-v1",
} as const;

export const PRACTICA_LIBRE_M2: PracticaLibreFase[] = [
  {
    id: "explorar",
    titulo: "Explorar",
    descripcion: "Clasificar instrumento–magnitud–EPP.",
    actividad:
      "Empareja tres instrumentos con su magnitud y EPP asociado. Formativo, sin nota.",
  },
  {
    id: "desafiar",
    titulo: "Desafiar",
    descripcion: "Lecturas fuera de rango.",
    actividad:
      "Ante una tabla con valores fuera de especificación, decide: re-medir, ajustar o escalar. Sin calificación.",
  },
  {
    id: "investigar",
    titulo: "Investigar",
    descripcion: "Error de técnica sin andamiaje.",
    actividad:
      "Detecta un error típico (manómetro mal conectado / termómetro mal ubicado) y corrige el procedimiento.",
  },
  {
    id: "transferir",
    titulo: "Transferir",
    descripcion: "Otra tipología.",
    actividad:
      "Aplica el mismo método a un split de oficina (no cámara packing). No avanza la barra obligatoria.",
  },
];

export const ESTACIONES_M2: EstacionM2[] = [
  {
    id: "m2-ctx",
    orden: 0,
    slug: "contextualizacion",
    titulo: "Contextualización — Comprendo la situación · Cámara packing Aconcagua",
    horas: 3,
    fase: "contextualizacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "ANALIZAR",
    preguntaPedagogica:
      "¿Qué antecedentes orientan la verificación instrumental en cámara de frío?",
    escenario:
      "Packing frutícola en el Valle de Aconcagua. El supervisor de calidad reporta temperatura de cámara fuera de setpoint. Entrega ficha de fabricante, bitácora y kit de instrumentos. Tu rol: técnico de servicio. Ajustes correctivos profundos de taller quedan fuera del recorte 30 %.",
    interaccion: "briefing",
    evidenciaMinima: "Registrar al menos 2 antecedentes iniciales del caso.",
    mediaUrl: "/images/climatizacion/m2-instrumentos.png",
    mediaAlt: "Instrumentos de medición listos en cámara frigorífica",
    mediaCaption: "Revisa el set de instrumentos antes de decidir qué medir y cómo.",
    opciones: [
      { id: "ctx-ficha", label: "Ficha / manual de fábrica con rangos de T y P", correcta: true, familia: "contraste" },
      { id: "ctx-aviso", label: "Aviso: temperatura de cámara fuera de rango", correcta: true, familia: "registro" },
      { id: "ctx-kit", label: "Kit: termómetro, manómetro, vacuómetro + EPP", correcta: true, familia: "instrumento" },
      { id: "ctx-taller", label: "Abrir overhaul de taller sin mediciones", correcta: false },
    ],
    agente: [
      { nivel: 1, pregunta: "¿Qué datos son del manual y cuáles son lecturas de campo?" },
      { nivel: 2, pregunta: "¿Qué magnitud medirías primero al llegar a la cámara?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Comprendo la situación — registrar antecedentes",
    ctaSiguiente: "Ir a selección de instrumentos",
    bloqueadoHastaCompletarAnterior: false,
  },
  {
    id: "m2-e1",
    orden: 1,
    slug: "seleccion-seguridad",
    titulo: "Estación 1 — Selección y seguridad de instrumentos",
    horas: 10,
    fase: "estacion_ae",
    aeCodigos: ["AE 2.1"],
    ceCodigos: [],
    habilidad: "RECONOCER",
    preguntaPedagogica:
      "¿Qué instrumento–magnitud–EPP corresponde a la verificación en cámara?",
    escenario:
      "Clasifica instrumentos según magnitud (T, P, vacío) y normas de seguridad de uso. AE 2.1.",
    interaccion: "hotspots",
    evidenciaMinima: "Emparejar ≥3 pares instrumento–magnitud–EPP correctos.",
    errorUtil: "Usar manómetro de rango inadecuado → lectura inválida y riesgo.",
    mediaUrl: "/images/climatizacion/m2-hotspots-base.png",
    mediaAlt: "Instrumentos de medición: marca el adecuado a cada magnitud",
    mediaCaption: "Haz clic en termómetro, manifold, vacuómetro y revisa estado antes de usar.",
    hotspots: [
      { id: "hs-t", optionId: "sel-t", label: "Termómetro / sonda", x: 78, y: 22, r: 7 },
      { id: "hs-p", optionId: "sel-p", label: "Manifold / manómetros", x: 72, y: 72, r: 8 },
      { id: "hs-v", optionId: "sel-v", label: "Vacuómetro", x: 28, y: 72, r: 7 },
      { id: "hs-epp", optionId: "sel-epp", label: "Multímetro (verificar estado)", x: 22, y: 28, r: 7 },
      { id: "hs-malo", optionId: "sel-malo", label: "Usar sin criterio (distractor)", x: 50, y: 28, r: 6 },
    ],
    opciones: [
      { id: "sel-t", label: "Termómetro / sonda → temperatura de cámara · EPP frío", correcta: true, familia: "instrumento" },
      { id: "sel-p", label: "Manómetro compatible → presión de circuito · EPP ojos/manos", correcta: true, familia: "instrumento" },
      { id: "sel-v", label: "Vacuómetro → vacío previo / hermeticidad conceptual", correcta: true, familia: "instrumento" },
      { id: "sel-epp", label: "Verificar calibración visual / estado del instrumento antes de usar", correcta: true, familia: "seguridad" },
      { id: "sel-malo", label: "Conectar cualquier manómetro sin mirar rango ni EPP", correcta: false, detalle: "Sin verificar rango ni EPP no hay evidencia segura." },
    ],
    agente: [
      { nivel: 2, pregunta: "¿Qué verificas del instrumento antes de conectarlo?" },
      { nivel: 4, pregunta: "Si el rango del manómetro es menor al esperado, ¿qué haces?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar selección instrumento–EPP",
    ctaSiguiente: "Ir a técnica de medición",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m2-e2",
    orden: 2,
    slug: "tecnica-medicion",
    titulo: "Estación 2 — Técnica de medición guiada",
    horas: 12,
    fase: "estacion_ae",
    aeCodigos: ["AE 2.1"],
    ceCodigos: [],
    habilidad: "APLICAR",
    preguntaPedagogica:
      "¿Qué técnica de medición es correcta según fábrica y seguridad?",
    escenario:
      "Microsim: conexión de manómetro/termómetro/vacuómetro en cámara. Secuencia segura y lectura estable. AE 2.1.",
    interaccion: "tecnica_medicion",
    evidenciaMinima: "Completar ≥3 pasos de técnica correcta.",
    errorUtil: "Leer con el sistema en transición sin estabilizar → dato engañoso.",
    mediaUrl: "/images/climatizacion/m2-tecnica-medicion.png",
    mediaAlt: "Técnica de medición con manifold y sonda en sistema de refrigeración",
    mediaCaption: "Coloca sonda y manifold en los puntos correctos y registra lecturas estables.",
    opciones: [
      { id: "tec-epp", label: "EPP y autorización de ingreso a cámara antes de medir", correcta: true, familia: "seguridad" },
      { id: "tec-con", label: "Conectar instrumento en punto de medición indicado", correcta: true, familia: "tecnica" },
      { id: "tec-est", label: "Esperar estabilización y registrar lectura con unidad", correcta: true, familia: "tecnica" },
      { id: "tec-bit", label: "Anotar condición de operación (puertas, carga de producto)", correcta: true, familia: "registro" },
      { id: "tec-malo", label: "Forzar conexión en válvula incorrecta «para salir del paso»", correcta: false },
    ],
    agente: [
      { nivel: 3, pregunta: "¿Cuándo consideras «estable» una lectura de temperatura?" },
      { nivel: 5, pregunta: "Si la lectura oscila, ¿re-mides o reportas el primer valor?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar técnica de medición",
    ctaSiguiente: "Ir a contraste con manual",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m2-e3",
    orden: 3,
    slug: "contraste-manual",
    titulo: "Estación 3 — Contraste con manual",
    horas: 12,
    fase: "estacion_ae",
    aeCodigos: ["AE 2.2"],
    ceCodigos: [],
    habilidad: "VERIFICAR",
    preguntaPedagogica:
      "¿Cómo contrastas valores medidos con el manual de fabricación?",
    escenario:
      "Tabla dual medido vs especificación: marcas dentro/fuera de rango y documentas. AE 2.2 (criterios de comparación; sin ajuste profundo de taller).",
    interaccion: "contraste_manual",
    evidenciaMinima: "Completar ≥2 contrastes correctos medido–manual.",
    errorUtil: "Declarar «conforme» sin comparar con ficha → falla de verificación.",
    opciones: [
      { id: "con-t", label: "T cámara medida vs rango de ficha (fuera de rango → marcar)", correcta: true, familia: "contraste" },
      { id: "con-p", label: "Presión medida vs especificación de operación", correcta: true, familia: "contraste" },
      { id: "con-reg", label: "Registrar desviación y condición de medición en bitácora", correcta: true, familia: "registro" },
      { id: "con-ign", label: "Ignorar el manual y confiar solo en la sensación térmica", correcta: false },
    ],
    agente: [
      { nivel: 3, pregunta: "¿Qué tolerancia del manual aplicarías a la temperatura de cámara?" },
      { nivel: 5, pregunta: "Si T está fuera y P dentro, ¿qué documentas primero?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar tabla medido vs fábrica",
    ctaSiguiente: "Ir a propuesta de ajuste",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m2-e4",
    orden: 4,
    slug: "propuesta-ajuste",
    titulo: "Estación 4 — Propuesta de ajuste",
    horas: 8,
    fase: "estacion_ae",
    aeCodigos: ["AE 2.2"],
    ceCodigos: [],
    habilidad: "DECIDIR",
    preguntaPedagogica:
      "Ante la desviación, ¿ajustas, re-mides o escalas?",
    escenario:
      "Decisión acotada: setpoint / verificación adicional / escalamiento a supervisor. Sin overhaul de taller. AE 2.2.",
    interaccion: "propuesta_ajuste",
    evidenciaMinima: "Seleccionar ≥2 decisiones justificadas; excluir overhaul.",
    errorUtil: "Cambiar piezas mayores sin evidencia de medición → fuera de alcance.",
    opciones: [
      { id: "aj-remedir", label: "Re-medir en otro punto / estabilizar condiciones de cámara", correcta: true, familia: "ajuste" },
      { id: "aj-set", label: "Proponer ajuste de setpoint según manual (si aplica y autorizado)", correcta: true, familia: "ajuste" },
      { id: "aj-esc", label: "Escalar a supervisor con evidencias de tabla medido–manual", correcta: true, familia: "registro" },
      { id: "aj-over", label: "Desarmar compresor en packing sin OT de taller", correcta: false },
    ],
    agente: [
      { nivel: 4, pregunta: "¿Qué evidencia mínima pedirías antes de tocar el setpoint?" },
      { nivel: 6, pregunta: "Si tras re-medir sigue fuera, ¿qué dejas documentado?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Tomo decisiones — guardar propuesta de ajuste",
    ctaSiguiente: "Abrir Situación Integradora",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m2-sit",
    orden: 5,
    slug: "situacion-integradora",
    titulo: "Situación Integradora — Bitácora de verificación",
    horas: 8,
    fase: "situacion_integradora",
    aeCodigos: ["AE 2.1", "AE 2.2"],
    ceCodigos: [],
    habilidad: "INTEGRAR",
    preguntaPedagogica:
      "¿Qué bitácora completa de verificación elaboras con instrumentos y manual?",
    escenario:
      "Gran desafío: bitácora integral selección→técnica→contraste→propuesta. Sin AE nuevo.",
    interaccion: "gran_desafio",
    evidenciaMinima: "Integrar ≥4 fuentes y concluir verificación fundamentada.",
    errorUtil:
      "Cerrar la bitácora sin contrastar lecturas con ficha → verificación sin fundamento.",
    opciones: [
      { id: "gd-kit", label: "Fuente: selección instrumento–magnitud–EPP", correcta: true },
      { id: "gd-lec", label: "Fuente: lecturas estabilizadas (T/P)", correcta: true },
      { id: "gd-man", label: "Fuente: tabla medido vs manual de fábrica", correcta: true },
      { id: "gd-aj", label: "Fuente: propuesta ajustar / re-medir / escalar", correcta: true },
      { id: "gd-conc", label: "Conclusión: T fuera de rango; re-medir + escalar con evidencias; sin overhaul", correcta: true },
    ],
    agente: [
      { nivel: 5, pregunta: "¿Qué fuente abrirías primero para armar la bitácora?" },
      { nivel: 6, pregunta: "Si bitácora previa y tu medición se contradicen, ¿cuál privilegias?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Entregar bitácora de verificación",
    ctaSiguiente: "Pasar a Evaluación Final (2 h)",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m2-eval",
    orden: 6,
    slug: "evaluacion-final",
    titulo: "Evaluación Final (2 h) — Datos e instrumentos (sin Tutor)",
    horas: 2,
    fase: "evaluacion_final",
    aeCodigos: ["AE 2.1", "AE 2.2"],
    ceCodigos: [],
    habilidad: "EVALUAR",
    preguntaPedagogica:
      "Interpreta un set de lecturas, decide ajuste y fundamenta (≠ planos M1).",
    escenario:
      "Bloque A: instrumentos/técnica/contraste (muestra). Bloque B: interpretar lecturas → decidir ajuste → fundamentar. Agente off.",
    interaccion: "evaluacion_medicion",
    evidenciaMinima: "Completar Bloque A (muestra) y Bloque B (3 acciones).",
    opciones: [
      { id: "ev-a1", label: "A1 — Selección: instrumento correcto para la magnitud", correcta: true },
      { id: "ev-a2", label: "A2 — Técnica: conexión segura + lectura estabilizada", correcta: true },
      { id: "ev-a3", label: "A3 — Contraste: medido vs rango de manual", correcta: true },
      { id: "ev-b-interp", label: "B1 Interpretar: set de lecturas cámara Aconcagua", correcta: true },
      { id: "ev-b-decidir", label: "B2 Decidir: re-medir / ajuste acotado / escalar", correcta: true },
      { id: "ev-b-fund", label: "B3 Fundamentar: tabla medido–manual + bitácora", correcta: true },
    ],
    agente: [],
    permiteAgente: false,
    esEvaluacionFormal: true,
    ctaCompletar: "Enviar evaluación de medición (simulado)",
    ctaSiguiente: "Ver comparación inicio/ahora",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m2-cierre",
    orden: 7,
    slug: "retroalimentacion-cierre",
    titulo: "Retroalimentación y cierre — Comparación inicio/ahora",
    horas: 2,
    fase: "retroalimentacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "RETROALIMENTAR",
    preguntaPedagogica:
      "¿Qué avanzaste en competencia de medición desde el inicio del módulo?",
    escenario:
      "Comparación «al inicio / ahora» en selección, técnica y contraste. Distinto al mapa de relaciones M1. Práctica Libre.",
    interaccion: "comparacion_inicio_ahora",
    evidenciaMinima: "Marcar ≥1 avance y 1 recomendación de Práctica Libre.",
    opciones: [
      { id: "cmp-sel", label: "Avance: elijo instrumento–magnitud–EPP con criterio", correcta: true, familia: "instrumento" },
      { id: "cmp-tec", label: "Avance: aplico técnica de lectura estabilizada", correcta: true, familia: "tecnica" },
      { id: "cmp-con", label: "Avance: contrasto con manual antes de proponer ajuste", correcta: true, familia: "contraste" },
      { id: "cmp-pl", label: "Practicar drills de medición en Práctica Libre", correcta: true, familia: "registro" },
    ],
    agente: [
      { nivel: 1, pregunta: "¿Qué competencia de medición quieres reforzar primero?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar módulo y guardar reflexión",
    ctaSiguiente: "Volver al curso",
    bloqueadoHastaCompletarAnterior: true,
  },
];

export function getEstacionBySlug(slug: string): EstacionM2 | undefined {
  return ESTACIONES_M2.find((e) => e.slug === slug);
}

export function getEstacionById(id: string): EstacionM2 | undefined {
  return ESTACIONES_M2.find((e) => e.id === id);
}

export function getEstacionByOrden(orden: number): EstacionM2 | undefined {
  return ESTACIONES_M2.find((e) => e.orden === orden);
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
  currentId: ESTACIONES_M2[0].id,
  evalSubmitted: false,
  practicaLibreVisits: [],
};

export function stationIsUnlocked(
  estacion: EstacionM2,
  completedIds: string[],
): boolean {
  if (!estacion.bloqueadoHastaCompletarAnterior) return true;
  if (estacion.orden === 0) return true;
  const prev = ESTACIONES_M2.find((e) => e.orden === estacion.orden - 1);
  if (!prev) return true;
  return completedIds.includes(prev.id);
}

export function canCompleteStation(
  estacion: EstacionM2,
  selected: string[],
): boolean {
  const correctIds = estacion.opciones.filter((o) => o.correcta).map((o) => o.id);
  const selectedCorrect = selected.filter((id) => correctIds.includes(id));
  const selectedIncorrect = selected.filter(
    (id) => !correctIds.includes(id) && estacion.opciones.some((o) => o.id === id),
  );

  if (estacion.interaccion === "evaluacion_medicion") {
    return selectedCorrect.length >= 5 && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "gran_desafio") {
    return selectedCorrect.length >= 4;
  }
  if (estacion.interaccion === "comparacion_inicio_ahora") {
    return selected.length >= 1;
  }
  if (estacion.interaccion === "seleccion_instrumentos") {
    const minCorrect = Math.min(3, correctIds.length);
    return selectedCorrect.length >= minCorrect && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "tecnica_medicion") {
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
