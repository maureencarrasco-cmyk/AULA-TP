/**
 * Módulo 4 — Instalación y montaje de equipos
 * AE 4.1 dificultades en plano · AE 4.2 instalación domiciliaria según manuales.
 * AE 4.3 control automático fuera del 30 %. Caso: oficina municipal Biobío.
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
  | "dificultades_plano"
  | "manual_montaje"
  | "posicionamiento"
  | "verificacion_post"
  | "gran_desafio"
  | "evaluacion_montaje"
  | "linea_decisiones"
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
  familia?: "plano" | "manual" | "montaje" | "seguridad" | "verificacion" | "decision";
};

export type EstacionM4 = {
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

export const M4_META = {
  moduloNumero: 4,
  nombre: "Instalación y montaje de equipos",
  especialidad: "Refrigeración y Climatización",
  oa: "OA 5",
  oaTexto:
    "Instalar equipos y componentes de sistemas de refrigeración, calefacción, climatización y ventilación… (NCh3241).",
  horasAulaTp: 68.4,
  horasDesarrollo: 66.4,
  horasEvaluacionFinal: 2,
  casoDemo: {
    titulo: "Oficina municipal — Biobío",
    resumen:
      "Identificar dificultades de instalación en plano, leer manual de montaje, posicionar evaporadora/condensadora y verificar post-montaje. AE 4.3 (control automático profundo) fuera del 30 %.",
    actor: "Instalador de equipos + electricista de apoyo",
    equipo: "Evaporadora / condensadora split oficina municipal",
    hallazgoTipico: "Dificultad de anclaje en muro + distancias de manual",
  },
  portalDocenteHref: "/curso/climatizacion",
  heroMediaUrl: "/images/climatizacion/m4-montaje-equipos.png",
  heroMediaAlt: "Montaje de equipo de climatización en muro",
  storageKey: "aula-tp-m4-equipos-progress-v1",
} as const;

export const PRACTICA_LIBRE_M4: PracticaLibreFase[] = [
  {
    id: "explorar",
    titulo: "Explorar",
    descripcion: "Dificultades en plano con apoyo.",
    actividad: "Marca tres dificultades típicas de montaje en un plano de oficina. Formativo.",
  },
  {
    id: "desafiar",
    titulo: "Desafiar",
    descripcion: "Decisión con manual.",
    actividad: "Ante conflicto plano vs manual de distancias, elige qué privilegias y justifica.",
  },
  {
    id: "investigar",
    titulo: "Investigar",
    descripcion: "Error de posicionamiento.",
    actividad: "Detecta un error de anclaje/nivelación y propone corrección.",
  },
  {
    id: "transferir",
    titulo: "Transferir",
    descripcion: "Otro equipo.",
    actividad: "Aplica el método a un casete de cielo (no split muro Biobío). No avanza la barra.",
  },
];

export const ESTACIONES_M4: EstacionM4[] = [
  {
    id: "m4-ctx",
    orden: 0,
    slug: "contextualizacion",
    titulo: "Contextualización — Comprendo la situación · Oficina municipal Biobío",
    horas: 3.4,
    fase: "contextualizacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "ANALIZAR",
    preguntaPedagogica:
      "¿Qué antecedentes orientan el montaje de evaporadora/condensadora?",
    escenario:
      "Oficina municipal en la Región del Biobío. Debes instalar un split: evaporadora en muro interior y condensadora en exterior. Entrega: planos, manual de fabricante, NCh3241 y apoyo de electricista (fuerza). AE 4.3 (control automático profundo) fuera del 30 %. Tu rol: instalador de equipos.",
    interaccion: "briefing",
    evidenciaMinima: "Registrar al menos 2 antecedentes iniciales del caso.",
    mediaUrl: "/images/climatizacion/m4-montaje-equipos.png",
    mediaAlt: "Montaje de equipo split en oficina municipal",
    mediaCaption: "Observa posicionamiento y anclaje antes de decidir el montaje.",
    opciones: [
      { id: "ctx-plano", label: "Planos de ubicación evaporadora/condensadora + distancias", correcta: true, familia: "plano" },
      { id: "ctx-man", label: "Manual de montaje del fabricante (anclajes, holguras)", correcta: true, familia: "manual" },
      { id: "ctx-obra", label: "Condiciones de muro/exterior y EPP de montaje", correcta: true, familia: "seguridad" },
      { id: "ctx-auto", label: "Programar control automático avanzado (AE 4.3 completa)", correcta: false },
    ],
    agente: [
      { nivel: 1, pregunta: "¿Qué datos son del plano y cuáles del manual de fábrica?" },
      { nivel: 2, pregunta: "¿Qué verificarías primero: muro de anclaje o distancias del manual?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Comprendo la situación — registrar antecedentes",
    ctaSiguiente: "Ir a dificultades de instalación",
    bloqueadoHastaCompletarAnterior: false,
  },
  {
    id: "m4-e1",
    orden: 1,
    slug: "dificultades-plano",
    titulo: "Estación 1 — Dificultades de instalación en plano",
    horas: 12,
    fase: "estacion_ae",
    aeCodigos: ["AE 4.1"],
    ceCodigos: [],
    habilidad: "ANALIZAR",
    preguntaPedagogica:
      "¿Qué dificultades de instalación identificas en planos y especificaciones?",
    escenario:
      "Lectura de plano: interferencias de anclaje, distancias a ventanas, acceso de condensadora, paso de líneas. AE 4.1.",
    interaccion: "dificultades_plano",
    evidenciaMinima: "Marcar ≥3 dificultades justificadas.",
    errorUtil: "Ignorar distancia mínima del plano → condensadora inaccesible.",
    opciones: [
      { id: "dif-muro", label: "Dificultad: tipo de muro / capacidad de anclaje de evaporadora", correcta: true, familia: "plano" },
      { id: "dif-dist", label: "Dificultad: distancias mínimas condensadora (aire / acceso)", correcta: true, familia: "plano" },
      { id: "dif-lin", label: "Dificultad: recorrido de líneas entre interior y exterior", correcta: true, familia: "plano" },
      { id: "dif-doc", label: "Documentar dificultades para el profesional a cargo", correcta: true, familia: "decision" },
      { id: "dif-ign", label: "Montar sin revisar plano porque «siempre se pone igual»", correcta: false },
    ],
    agente: [
      { nivel: 2, pregunta: "¿Qué dificultad del plano impactaría primero el montaje?" },
      { nivel: 4, pregunta: "Si el muro no admite anclaje, ¿qué registras antes de taladrar?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar dificultades de instalación",
    ctaSiguiente: "Ir a lectura de manual de montaje",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m4-e2",
    orden: 2,
    slug: "manual-montaje",
    titulo: "Estación 2 — Lectura de manual de montaje",
    horas: 10,
    fase: "estacion_ae",
    aeCodigos: ["AE 4.1", "AE 4.2"],
    ceCodigos: [],
    habilidad: "COMPRENDER",
    preguntaPedagogica:
      "¿Qué indica el manual de fabricación para el montaje seguro?",
    escenario:
      "Checklist de fabricante: plantilla de anclaje, torque, holguras, drenaje, advertencias. AE 4.1–4.2.",
    interaccion: "manual_montaje",
    evidenciaMinima: "Completar ≥2 ítems de checklist de manual correctos.",
    errorUtil: "Omitir plantilla de anclaje → equipo desnivelado y vibración.",
    opciones: [
      { id: "man-plant", label: "Usar plantilla / medidas de anclaje del manual", correcta: true, familia: "manual" },
      { id: "man-holg", label: "Respetar holguras y orientación indicadas por fábrica", correcta: true, familia: "manual" },
      { id: "man-dre", label: "Verificar pendiente de drenaje según manual", correcta: true, familia: "manual" },
      { id: "man-auto", label: "Configurar lógica de control automático avanzada (AE 4.3)", correcta: false },
    ],
    agente: [
      { nivel: 3, pregunta: "¿Qué página del manual contrastarías con el plano de anclaje?" },
      { nivel: 5, pregunta: "Si plano y manual difieren en distancia, ¿cuál documentas?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar checklist de manual",
    ctaSiguiente: "Ir a posicionamiento y montaje",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m4-e3",
    orden: 3,
    slug: "posicionamiento-montaje",
    titulo: "Estación 3 — Posicionamiento y montaje de equipo",
    horas: 18,
    fase: "estacion_ae",
    aeCodigos: ["AE 4.2"],
    ceCodigos: [],
    habilidad: "EJECUTAR",
    preguntaPedagogica:
      "¿Qué secuencia de posicionamiento y montaje es conforme a manual y NCh3241?",
    escenario:
      "Sim de montaje: fijar soporte, nivelar evaporadora, posicionar condensadora, pasar líneas con apoyo eléctrico solo en fuerza (no control AE 4.3). AE 4.2.",
    interaccion: "posicionamiento",
    evidenciaMinima: "Completar ≥3 pasos de montaje correctos.",
    errorUtil: "Fijar condensadora sin holgura de aire → sobrecalentamiento.",
    mediaUrl: "/images/climatizacion/m4-montaje-equipos.png",
    mediaAlt: "Posicionamiento y montaje de equipo de climatización",
    mediaCaption: "Verifica nivel, soporte y holguras según manual de montaje.",
    opciones: [
      { id: "pos-sop", label: "Instalar soporte/anclaje nivelado según plantilla", correcta: true, familia: "montaje" },
      { id: "pos-eva", label: "Montar evaporadora verificando nivel y drenaje", correcta: true, familia: "montaje" },
      { id: "pos-con", label: "Posicionar condensadora con holguras de aire/acceso", correcta: true, familia: "montaje" },
      { id: "pos-epp", label: "Mantener EPP y zona segura durante el izaje/fijación", correcta: true, familia: "seguridad" },
      { id: "pos-malo", label: "Colgar equipo sin nivelar «se ajusta después»", correcta: false },
    ],
    agente: [
      { nivel: 3, pregunta: "¿Qué verificación haces antes de apretar el último anclaje?" },
      { nivel: 5, pregunta: "Si la condensadora queda sin acceso de servicio, ¿qué decides?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar posicionamiento y montaje",
    ctaSiguiente: "Ir a verificación post-montaje",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m4-e4",
    orden: 4,
    slug: "verificacion-post-montaje",
    titulo: "Estación 4 — Verificación post-montaje",
    horas: 12,
    fase: "estacion_ae",
    aeCodigos: ["AE 4.2"],
    ceCodigos: [],
    habilidad: "VERIFICAR",
    preguntaPedagogica:
      "¿Qué evidencias demuestran montaje conforme a manual y NCh3241?",
    escenario:
      "Post-montaje: nivel, fijaciones, drenaje, holguras, registro fotográfico y firma. Sin puesta en marcha completa (eso es M5).",
    interaccion: "hotspots",
    evidenciaMinima: "Registrar ≥2 verificaciones post-montaje.",
    errorUtil: "Cerrar sin verificar drenaje → filtración en oficina municipal.",
    mediaUrl: "/images/climatizacion/m4-hotspots-base.png",
    mediaAlt: "Unidad exterior: verifica nivel, drenaje, holguras y registro",
    mediaCaption: "Haz clic en soporte/nivel, drenaje, holguras y válvulas de servicio.",
    hotspots: [
      { id: "hs-niv", optionId: "ver-niv", label: "Soporte / nivelación", x: 48, y: 82, r: 7 },
      { id: "hs-dre", optionId: "ver-dre", label: "Drenaje", x: 55, y: 88, r: 5 },
      { id: "hs-holg", optionId: "ver-holg", label: "Holguras / acceso", x: 22, y: 45, r: 6 },
      { id: "hs-reg", optionId: "ver-reg", label: "Válvulas de servicio", x: 78, y: 48, r: 6 },
      { id: "hs-omit", optionId: "ver-omit", label: "Cerrar sin checklist (error)", x: 90, y: 20, r: 5 },
    ],
    opciones: [
      { id: "ver-niv", label: "Nivelación y torque/fijaciones conforme a manual", correcta: true, familia: "verificacion" },
      { id: "ver-dre", label: "Drenaje libre y pendiente correcta", correcta: true, familia: "verificacion" },
      { id: "ver-holg", label: "Holguras de condensadora y acceso de servicio OK", correcta: true, familia: "verificacion" },
      { id: "ver-reg", label: "Bitácora / fotos + firma de instalador y encargado", correcta: true, familia: "decision" },
      { id: "ver-omit", label: "Dar por montado sin checklist post-montaje", correcta: false, detalle: "Sin checklist post-montaje no hay evidencia de conformidad." },
    ],
    agente: [
      { nivel: 4, pregunta: "¿Qué ítem del manual revisarías primero en el cierre?" },
      { nivel: 6, pregunta: "Si el drenaje gotea, ¿cierras o dejas pendiente documentado?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar verificación post-montaje",
    ctaSiguiente: "Abrir Situación Integradora",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m4-sit",
    orden: 5,
    slug: "situacion-integradora",
    titulo: "Situación Integradora — Montaje según plano/manual",
    horas: 9,
    fase: "situacion_integradora",
    aeCodigos: ["AE 4.1", "AE 4.2"],
    ceCodigos: [],
    habilidad: "INTEGRAR",
    preguntaPedagogica:
      "¿Qué montaje integral entregas verificando NCh3241?",
    escenario:
      "Gran desafío: instalar equipo según planos/manual. Combina dificultades, checklist, montaje y verificación.",
    interaccion: "gran_desafio",
    evidenciaMinima: "Integrar ≥4 fuentes y concluir montaje conforme.",
    errorUtil:
      "Dar por montado sin integrar checklist y verificación post-montaje → falla en obra.",
    opciones: [
      { id: "gd-dif", label: "Fuente: dificultades de instalación en plano", correcta: true },
      { id: "gd-man", label: "Fuente: checklist de manual de montaje", correcta: true },
      { id: "gd-pos", label: "Fuente: posicionamiento evaporadora/condensadora", correcta: true },
      { id: "gd-ver", label: "Fuente: verificación post-montaje + firmas", correcta: true },
      { id: "gd-conc", label: "Conclusión: montaje conforme; AE 4.3 fuera de alcance", correcta: true },
    ],
    agente: [
      { nivel: 5, pregunta: "¿Qué fuente abrirías primero para el montaje integral?" },
      { nivel: 6, pregunta: "Si plano y manual chocan en holgura, ¿cuál privilegias?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Entregar montaje integral",
    ctaSiguiente: "Pasar a Evaluación Final (2 h)",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m4-eval",
    orden: 6,
    slug: "evaluacion-final",
    titulo: "Evaluación Final (2 h) — Montaje + decisión (sin Tutor)",
    horas: 2,
    fase: "evaluacion_final",
    aeCodigos: ["AE 4.1", "AE 4.2"],
    ceCodigos: [],
    habilidad: "EVALUAR",
    preguntaPedagogica:
      "Decide el montaje con manual y fundamenta (≠ redes M3 · ≠ carga M5).",
    escenario:
      "Bloque A: dificultades/manual/montaje (muestra). Bloque B: interpretar → decidir montaje → fundamentar con manual. Agente off.",
    interaccion: "evaluacion_montaje",
    evidenciaMinima: "Completar Bloque A (muestra) y Bloque B (3 acciones).",
    opciones: [
      { id: "ev-a1", label: "A1 — Identificar dificultades de instalación en plano", correcta: true },
      { id: "ev-a2", label: "A2 — Aplicar checklist de manual (anclaje/holguras)", correcta: true },
      { id: "ev-a3", label: "A3 — Verificación post-montaje: nivel, drenaje, firmas", correcta: true },
      { id: "ev-b-interp", label: "B1 Interpretar: plano + manual oficina municipal Biobío", correcta: true },
      { id: "ev-b-decidir", label: "B2 Decidir: secuencia de montaje evaporadora/condensadora", correcta: true },
      { id: "ev-b-fund", label: "B3 Fundamentar: decisión con manual + NCh3241 (sin AE 4.3)", correcta: true },
    ],
    agente: [],
    permiteAgente: false,
    esEvaluacionFormal: true,
    ctaCompletar: "Enviar evaluación de montaje (simulado)",
    ctaSiguiente: "Ver línea de decisiones",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m4-cierre",
    orden: 7,
    slug: "retroalimentacion-cierre",
    titulo: "Retroalimentación y cierre — Línea de decisiones",
    horas: 2,
    fase: "retroalimentacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "RETROALIMENTAR",
    preguntaPedagogica:
      "¿Qué línea de decisiones de montaje consolidaste? (cierre único M4)",
    escenario:
      "Línea de decisiones: plano → manual → montaje → verificación. Distinto a M1–M3. Práctica Libre.",
    interaccion: "linea_decisiones",
    evidenciaMinima: "Marcar ≥1 decisión de la línea y 1 recomendación de Práctica Libre.",
    opciones: [
      { id: "lin-plano", label: "Decisión: priorizar dificultades del plano antes de taladrar", correcta: true, familia: "plano" },
      { id: "lin-man", label: "Decisión: privilegias holguras del manual ante duda", correcta: true, familia: "manual" },
      { id: "lin-ver", label: "Decisión: no cerrar sin verificación post-montaje", correcta: true, familia: "verificacion" },
      { id: "lin-pl", label: "Practicar montajes cortos en Práctica Libre", correcta: true, familia: "decision" },
    ],
    agente: [
      { nivel: 1, pregunta: "¿Qué decisión de la línea quieres reforzar primero?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar módulo y guardar reflexión",
    ctaSiguiente: "Volver al curso",
    bloqueadoHastaCompletarAnterior: true,
  },
];

export function getEstacionBySlug(slug: string): EstacionM4 | undefined {
  return ESTACIONES_M4.find((e) => e.slug === slug);
}

export function getEstacionById(id: string): EstacionM4 | undefined {
  return ESTACIONES_M4.find((e) => e.id === id);
}

export function getEstacionByOrden(orden: number): EstacionM4 | undefined {
  return ESTACIONES_M4.find((e) => e.orden === orden);
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
  currentId: ESTACIONES_M4[0].id,
  evalSubmitted: false,
  practicaLibreVisits: [],
};

export function stationIsUnlocked(
  estacion: EstacionM4,
  completedIds: string[],
): boolean {
  if (!estacion.bloqueadoHastaCompletarAnterior) return true;
  if (estacion.orden === 0) return true;
  const prev = ESTACIONES_M4.find((e) => e.orden === estacion.orden - 1);
  if (!prev) return true;
  return completedIds.includes(prev.id);
}

export function canCompleteStation(
  estacion: EstacionM4,
  selected: string[],
): boolean {
  const correctIds = estacion.opciones.filter((o) => o.correcta).map((o) => o.id);
  const selectedCorrect = selected.filter((id) => correctIds.includes(id));
  const selectedIncorrect = selected.filter(
    (id) => !correctIds.includes(id) && estacion.opciones.some((o) => o.id === id),
  );

  if (estacion.interaccion === "evaluacion_montaje") {
    return selectedCorrect.length >= 5 && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "gran_desafio") {
    return selectedCorrect.length >= 4;
  }
  if (estacion.interaccion === "linea_decisiones") {
    return selected.length >= 1;
  }
  if (estacion.interaccion === "dificultades_plano") {
    const minCorrect = Math.min(3, correctIds.length);
    return selectedCorrect.length >= minCorrect && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "posicionamiento") {
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
