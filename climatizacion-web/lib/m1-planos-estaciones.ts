/**
 * Módulo 1 — Lectura de planos y cubicación (rebanada 30 %)
 * AE 1.1 simbología/espacio físico · AE 1.2 especificaciones/interferencias.
 * AE 1.3–1.4 fuera del 30 %. Caso: edificio oficinas Providencia.
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
  | "simbologia_plano"
  | "overlay_obra"
  | "lectura_especificaciones"
  | "interferencias"
  | "gran_desafio"
  | "evaluacion_planos"
  | "hotspots"
  | "mapa_relaciones";

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
  familia?: "simbologia" | "espacio" | "especificacion" | "interferencia" | "registro";
};

export type EstacionM1 = {
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

export const M1_META = {
  moduloNumero: 1,
  nombre: "Lectura de planos y cubicación de materiales de proyectos",
  especialidad: "Refrigeración y Climatización",
  oa: "OA 1–2",
  oaTexto:
    "Leer y utilizar planos de redes de cañería y redes de ductos, simbología y especificaciones técnicas de proyectos de refrigeración y climatización.",
  horasAulaTp: 57,
  horasDesarrollo: 55,
  horasEvaluacionFinal: 2,
  casoDemo: {
    titulo: "Edificio de oficinas — Providencia (RM)",
    resumen:
      "Contrastar planos HVAC con restricciones reales de obra (shaft, cielos, interferencias). AE 1.1–1.2. Sin informe de costos ni cubicación software (AE 1.3–1.4).",
    actor: "Dibujante/instalador junior + jefe de terreno",
    equipo: "Redes de ductos y cañerías de climatización de oficinas",
    hallazgoTipico: "Plano vs shaft real: interferencia con bandeja eléctrica",
  },
  portalDocenteHref: "/curso/climatizacion",
  heroMediaUrl: "/images/climatizacion/m1-planos-contexto.png",
  heroMediaAlt: "Plano HVAC de oficinas con leyenda de ductos y tuberías",
  storageKey: "aula-tp-m1-planos-progress-v1",
} as const;

export const PRACTICA_LIBRE_M1: PracticaLibreFase[] = [
  {
    id: "explorar",
    titulo: "Explorar",
    descripcion: "Leyendas y simbología con apoyo guiado.",
    actividad:
      "Recorre una leyenda de ductos/cañerías y marca tres símbolos críticos. Formativo, sin nota.",
  },
  {
    id: "desafiar",
    titulo: "Desafiar",
    descripcion: "Planos incompletos.",
    actividad:
      "Ante un plano con simbología faltante, decide qué consultar (leyenda, especificación o jefe de terreno). Justifica sin calificación.",
  },
  {
    id: "investigar",
    titulo: "Investigar",
    descripcion: "Interferencia sin andamiaje.",
    actividad:
      "Identifica una interferencia plano–obra y propone cómo documentarla. Autonomía alta.",
  },
  {
    id: "transferir",
    titulo: "Transferir",
    descripcion: "Otro tipo de red.",
    actividad:
      "Aplica el mismo método de lectura a una red de drenaje distinta a HVAC Providencia. No avanza la barra obligatoria.",
  },
];

export const ESTACIONES_M1: EstacionM1[] = [
  {
    id: "m1-ctx",
    orden: 0,
    slug: "contextualizacion",
    titulo: "Contextualización — Comprendo la situación · Oficinas Providencia",
    horas: 3,
    fase: "contextualizacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "ANALIZAR",
    preguntaPedagogica:
      "¿Qué información del briefing y del plano orienta tu primera lectura en obra?",
    escenario:
      "Llegas a un edificio de oficinas en Providencia (RM). El jefe de terreno entrega planos HVAC, leyenda de simbología y un aviso: «el shaft del piso 4 no coincide con el plano; hay bandeja eléctrica». Tu rol: dibujante/instalador junior. AE 1.3–1.4 (cubicación/costos) quedan fuera del 30 %.",
    interaccion: "briefing",
    evidenciaMinima: "Registrar al menos 2 antecedentes iniciales del caso.",
    mediaUrl: "/images/climatizacion/m1-planos-contexto.png",
    mediaAlt: "Plano HVAC de oficinas con leyenda de ductos y tuberías",
    mediaCaption: "Observa simbología y recorrido de ductos antes de marcar opciones.",
    opciones: [
      {
        id: "ctx-plano",
        label: "Plano HVAC vigente + leyenda de simbología de ductos/cañerías",
        correcta: true,
        familia: "simbologia",
      },
      {
        id: "ctx-shaft",
        label: "Aviso: shaft piso 4 no coincide; interferencia con bandeja eléctrica",
        correcta: true,
        familia: "interferencia",
      },
      {
        id: "ctx-esp",
        label: "Especificaciones técnicas de materiales y partidas del proyecto",
        correcta: true,
        familia: "especificacion",
      },
      {
        id: "ctx-falso",
        label: "Elaborar informe de costos NCh353 sin leer el plano",
        correcta: false,
        detalle: "AE 1.4 excluido del 30 %; primero lectura e interferencias.",
      },
    ],
    agente: [
      { nivel: 1, pregunta: "¿Qué datos del briefing son del plano y cuáles de la obra real?" },
      { nivel: 2, pregunta: "¿Qué contrastarías primero: leyenda o el aviso del shaft?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Comprendo la situación — registrar antecedentes",
    ctaSiguiente: "Ir a simbología en plano",
    bloqueadoHastaCompletarAnterior: false,
  },
  {
    id: "m1-e1",
    orden: 1,
    slug: "simbologia-plano",
    titulo: "Estación 1 — Simbología en plano",
    horas: 10,
    fase: "estacion_ae",
    aeCodigos: ["AE 1.1"],
    ceCodigos: [],
    habilidad: "RECONOCER",
    preguntaPedagogica:
      "¿Qué símbolos del plano corresponden a redes de climatización en el espacio físico?",
    escenario:
      "Hotspots + leyenda interactiva: identifica ductos de suministro/retorno, cañerías de refrigerante, rejillas y equipos en planta. AE 1.1.",
    interaccion: "hotspots",
    evidenciaMinima: "Identificar ≥3 símbolos correctos; excluir símbolo ajeno al HVAC.",
    errorUtil: "Confundir bandeja eléctrica con ducto de retorno → error de lectura.",
    mediaUrl: "/images/climatizacion/m1-hotspots-base.png",
    mediaAlt: "Plano HVAC: marca los símbolos de climatización",
    mediaCaption: "Haz clic en los símbolos del plano. La lista abajo también vale.",
    hotspots: [
      { id: "hs-sum", optionId: "sim-sum", label: "Ducto suministro", x: 52, y: 62, r: 6 },
      { id: "hs-ret", optionId: "sim-ret", label: "Retorno / trazado discontinuo", x: 48, y: 28, r: 6 },
      { id: "hs-eq", optionId: "sim-eq", label: "Unidad / UMA", x: 50, y: 48, r: 7 },
      { id: "hs-dif", optionId: "sim-ref", label: "Difusor / red asociada", x: 58, y: 72, r: 5 },
      { id: "hs-malo", optionId: "sim-malo", label: "Mobiliario (no HVAC)", x: 18, y: 48, r: 6 },
    ],
    opciones: [
      { id: "sim-sum", label: "Símbolo: ducto de suministro de aire (planta)", correcta: true, familia: "simbologia" },
      { id: "sim-ret", label: "Símbolo: ducto / retorno o rejilla de retorno", correcta: true, familia: "simbologia" },
      { id: "sim-ref", label: "Símbolo: cañería de refrigerante / líquido-gas", correcta: true, familia: "simbologia" },
      { id: "sim-eq", label: "Símbolo: unidad interior / evaporadora en cielo", correcta: true, familia: "simbologia" },
      { id: "sim-malo", label: "Interpretar bandeja eléctrica / mobiliario como ducto HVAC", correcta: false, detalle: "Ese elemento no es simbología HVAC: no lo registres como ducto." },
    ],
    agente: [
      { nivel: 2, pregunta: "¿Qué consultaras si un símbolo no está en la leyenda del plano?" },
      { nivel: 4, pregunta: "¿Cómo distingues un ducto de una cañería de refrigerante en planta?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar simbología marcada",
    ctaSiguiente: "Ir a espacio físico / interferencias",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m1-e2",
    orden: 2,
    slug: "espacio-interferencias",
    titulo: "Estación 2 — Espacio físico / interferencias",
    horas: 12,
    fase: "estacion_ae",
    aeCodigos: ["AE 1.1"],
    ceCodigos: [],
    habilidad: "RELACIONAR → APLICAR",
    preguntaPedagogica:
      "¿Cómo se relaciona el plano con el espacio físico real del shaft?",
    escenario:
      "Overlay plano–foto obra: el shaft del piso 4 muestra bandeja eléctrica donde el plano dibuja el ducto. Debes marcar coherencias e interferencias. AE 1.1.",
    interaccion: "overlay_obra",
    evidenciaMinima: "Marcar ≥2 relaciones plano–obra correctas.",
    errorUtil: "Ignorar la foto de obra y asumir que el plano manda sin verificar → retrabajo.",
    mediaUrl: "/images/climatizacion/m1-interferencias.png",
    mediaAlt: "Interferencia entre conducto HVAC del plano y bandeja eléctrica en obra",
    mediaCaption: "Contrasta plano vs obra y documenta la interferencia antes de decidir el trazado.",
    opciones: [
      { id: "ov-coher", label: "Coherencia: ubicación de evaporadora coincide con cielo falso", correcta: true, familia: "espacio" },
      { id: "ov-shaft", label: "Interferencia: ducto en plano vs bandeja eléctrica en shaft real", correcta: true, familia: "interferencia" },
      { id: "ov-foto", label: "Registrar evidencia fotográfica etiquetada del shaft piso 4", correcta: true, familia: "registro" },
      { id: "ov-ignorar", label: "Instalar según plano sin contrastar con la obra", correcta: false },
    ],
    agente: [
      { nivel: 3, pregunta: "¿Qué evidencia de obra sostendría marcar una interferencia?" },
      { nivel: 5, pregunta: "Si plano y obra no coinciden, ¿a quién escalas antes de cortar ducto?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar overlay plano–obra",
    ctaSiguiente: "Ir a lectura de especificaciones",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m1-e3",
    orden: 3,
    slug: "lectura-especificaciones",
    titulo: "Estación 3 — Lectura de especificaciones",
    horas: 10,
    fase: "estacion_ae",
    aeCodigos: ["AE 1.2"],
    ceCodigos: [],
    habilidad: "COMPRENDER → VERIFICAR",
    preguntaPedagogica:
      "¿Qué indican las especificaciones técnicas sobre materiales y partidas del tramo?",
    escenario:
      "Ficha técnica vs partida: contrastas material de ducto, aislación y tipo de unión con la especificación del proyecto. AE 1.2. Sin cubicación de costos.",
    interaccion: "lectura_especificaciones",
    evidenciaMinima: "Emparejar ≥2 ítems especificación–partida correctos.",
    errorUtil: "Usar material «equivalente» no autorizado por especificación → rechazo en obra.",
    opciones: [
      { id: "esp-mat", label: "Material de ducto / espesor según especificación de partida", correcta: true, familia: "especificacion" },
      { id: "esp-ais", label: "Aislación térmica indicada en ficha vs partida", correcta: true, familia: "especificacion" },
      { id: "esp-union", label: "Tipo de unión / sello autorizado en especificación", correcta: true, familia: "especificacion" },
      { id: "esp-costo", label: "Calcular presupuesto completo NCh353 en esta estación", correcta: false, detalle: "AE 1.4 fuera del 30 %." },
    ],
    agente: [
      { nivel: 3, pregunta: "¿Qué campo de la ficha contrastarías primero con la partida?" },
      { nivel: 5, pregunta: "Si ficha y partida difieren en aislación, ¿qué registras?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar contraste especificación–partida",
    ctaSiguiente: "Ir a interferencias de proyecto",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m1-e4",
    orden: 4,
    slug: "interferencias-proyecto",
    titulo: "Estación 4 — Interferencias de proyecto",
    horas: 10,
    fase: "estacion_ae",
    aeCodigos: ["AE 1.2"],
    ceCodigos: [],
    habilidad: "DECIDIR",
    preguntaPedagogica:
      "¿Qué dificultades por etapa del proyecto marcas a partir de planos y especificaciones?",
    escenario:
      "Marcas interferencias/dificultades por etapa (shaft, cielo, acceso) usando plano + especificación + evidencia de obra. Puente ligero a cubicación (cantidades) sin informe de costos.",
    interaccion: "interferencias",
    evidenciaMinima: "Marcar ≥2 dificultades justificadas por etapa.",
    errorUtil: "No documentar la interferencia del shaft → la cuadrilla llega sin alternativa.",
    mediaUrl: "/images/climatizacion/m1-interferencias.png",
    mediaAlt: "Interferencia plano-obra en instalaciones HVAC",
    mediaCaption: "Identifica y registra la interferencia con evidencia para la decisión de trazado.",
    opciones: [
      { id: "int-shaft", label: "Etapa shaft: redefinir trazado por bandeja eléctrica (evidencia foto)", correcta: true, familia: "interferencia" },
      { id: "int-cielo", label: "Etapa cielo falso: verificar altura libre vs evaporadora (especificación)", correcta: true, familia: "espacio" },
      { id: "int-doc", label: "Documentar lista de interferencias para jefe de terreno", correcta: true, familia: "registro" },
      { id: "int-costo", label: "Emitir informe de costos totales del proyecto", correcta: false },
    ],
    agente: [
      { nivel: 4, pregunta: "¿Qué etapa del proyecto priorizarías al reportar interferencias?" },
      { nivel: 6, pregunta: "Si hay dos trazados posibles, ¿qué criterio de especificación usas?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Tomo decisiones — guardar interferencias",
    ctaSiguiente: "Abrir Situación Integradora",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m1-sit",
    orden: 5,
    slug: "situacion-integradora",
    titulo: "Situación Integradora — Lectura + interferencias",
    horas: 8,
    fase: "situacion_integradora",
    aeCodigos: ["AE 1.1", "AE 1.2"],
    ceCodigos: [],
    habilidad: "INTEGRAR",
    preguntaPedagogica:
      "Con plano, leyenda, especificación y foto de obra, ¿qué lectura integral entregas?",
    escenario:
      "Gran desafío: entregas lectura de planos/docs + lista de interferencias críticas (sin informe de costos). Tú eliges el orden de fuentes.",
    interaccion: "gran_desafio",
    evidenciaMinima: "Integrar ≥4 fuentes y concluir interferencia crítica fundamentada.",
    errorUtil:
      "Concluir sin integrar fuentes (plano, foto, especificación) → interferencia no documentada.",
    opciones: [
      { id: "gd-ley", label: "Fuente: leyenda / simbología del plano HVAC", correcta: true },
      { id: "gd-foto", label: "Fuente: foto shaft piso 4 (bandeja eléctrica)", correcta: true },
      { id: "gd-esp", label: "Fuente: especificaciones de material/partida", correcta: true },
      { id: "gd-lista", label: "Fuente: lista de dificultades por etapa", correcta: true },
      { id: "gd-conc", label: "Conclusión: interferencia shaft crítica; redefinir trazado; sin informe de costos", correcta: true },
    ],
    agente: [
      { nivel: 5, pregunta: "¿Qué fuente consultarías primero para la lectura integral?" },
      { nivel: 6, pregunta: "Si especificación y foto se contradicen con el plano, ¿cuál privilegias?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Entregar lectura + lista de interferencias",
    ctaSiguiente: "Pasar a Evaluación Final (2 h)",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m1-eval",
    orden: 6,
    slug: "evaluacion-final",
    titulo: "Evaluación Final (2 h) — Interpretación de planos (sin Tutor)",
    horas: 2,
    fase: "evaluacion_final",
    aeCodigos: ["AE 1.1", "AE 1.2"],
    ceCodigos: [],
    habilidad: "EVALUAR",
    preguntaPedagogica:
      "Interpreta planos/docs y fundamenta una interferencia crítica (formato distinto a M2–M8).",
    escenario:
      "Bloque A: ítems de simbología y especificación (muestra). Bloque B: interpretar fragmento de plano → decidir interferencia crítica → fundamentar con especificación. Sin pistas. Agente off.",
    interaccion: "evaluacion_planos",
    evidenciaMinima: "Completar Bloque A (muestra) y Bloque B (3 acciones).",
    opciones: [
      { id: "ev-a1", label: "A1 — Simbología: identificar ducto/cañería/equipo en planta", correcta: true },
      { id: "ev-a2", label: "A2 — Especificación: material/aislación según partida", correcta: true },
      { id: "ev-a3", label: "A3 — Interferencia típica: plano vs espacio físico (shaft)", correcta: true },
      { id: "ev-b-interp", label: "B1 Interpretar: fragmento plano Providencia + foto obra", correcta: true },
      { id: "ev-b-decidir", label: "B2 Decidir: interferencia crítica en shaft (bandeja vs ducto)", correcta: true },
      { id: "ev-b-fund", label: "B3 Fundamentar: especificación + evidencia de obra (sin costos)", correcta: true },
    ],
    agente: [],
    permiteAgente: false,
    esEvaluacionFormal: true,
    ctaCompletar: "Enviar interpretación de evaluación (simulado)",
    ctaSiguiente: "Ver mapa de relaciones",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m1-cierre",
    orden: 7,
    slug: "retroalimentacion-cierre",
    titulo: "Retroalimentación y cierre — Mapa de relaciones",
    horas: 2,
    fase: "retroalimentacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "RETROALIMENTAR",
    preguntaPedagogica:
      "¿Cómo se relacionan simbología, especificación y espacio físico? (cierre único M1)",
    escenario:
      "Mapa de relaciones simbología ↔ especificación ↔ espacio físico. Recomendaciones de Práctica Libre. No es otra evaluación.",
    interaccion: "mapa_relaciones",
    evidenciaMinima: "Marcar ≥1 relación del mapa y 1 recomendación de Práctica Libre.",
    opciones: [
      { id: "map-sim", label: "Relación: simbología del plano ↔ elemento en espacio físico", correcta: true, familia: "simbologia" },
      { id: "map-esp", label: "Relación: especificación ↔ material/partida aplicable en obra", correcta: true, familia: "especificacion" },
      { id: "map-int", label: "Relación: interferencia documentada ↔ decisión de trazado", correcta: true, familia: "interferencia" },
      { id: "map-pl", label: "Practicar leyendas e interferencias en Práctica Libre", correcta: true, familia: "registro" },
    ],
    agente: [
      { nivel: 1, pregunta: "¿Qué relación del mapa quieres reforzar primero en Práctica Libre?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar módulo y guardar reflexión",
    ctaSiguiente: "Volver al curso",
    bloqueadoHastaCompletarAnterior: true,
  },
];

export function getEstacionBySlug(slug: string): EstacionM1 | undefined {
  return ESTACIONES_M1.find((e) => e.slug === slug);
}

export function getEstacionById(id: string): EstacionM1 | undefined {
  return ESTACIONES_M1.find((e) => e.id === id);
}

export function getEstacionByOrden(orden: number): EstacionM1 | undefined {
  return ESTACIONES_M1.find((e) => e.orden === orden);
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
  currentId: ESTACIONES_M1[0].id,
  evalSubmitted: false,
  practicaLibreVisits: [],
};

export function stationIsUnlocked(
  estacion: EstacionM1,
  completedIds: string[],
): boolean {
  if (!estacion.bloqueadoHastaCompletarAnterior) return true;
  if (estacion.orden === 0) return true;
  const prev = ESTACIONES_M1.find((e) => e.orden === estacion.orden - 1);
  if (!prev) return true;
  return completedIds.includes(prev.id);
}

export function canCompleteStation(
  estacion: EstacionM1,
  selected: string[],
): boolean {
  const correctIds = estacion.opciones.filter((o) => o.correcta).map((o) => o.id);
  const selectedCorrect = selected.filter((id) => correctIds.includes(id));
  const selectedIncorrect = selected.filter(
    (id) => !correctIds.includes(id) && estacion.opciones.some((o) => o.id === id),
  );

  if (estacion.interaccion === "evaluacion_planos") {
    return selectedCorrect.length >= 5 && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "gran_desafio") {
    return selectedCorrect.length >= 4;
  }
  if (estacion.interaccion === "mapa_relaciones") {
    return selected.length >= 1;
  }
  if (estacion.interaccion === "simbologia_plano") {
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
