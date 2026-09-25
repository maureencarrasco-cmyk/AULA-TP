/**
 * Módulo 7 — Mantención
 * Contenido de estaciones derivado de Prompt Maestro / programa MINEDUC.
 * AE 7.1 preventivo · AE 7.2 correctivo acotado. Caso demo = planta agroindustrial O’Higgins.
 * No inventa AE MINEDUC. Etapas ciclo Aula TP: Analizar → Comprender → Relacionar → Aplicar → Verificar → Retroalimentar. CE se expanden como criterios de desempeño trazables a AE 7.1–7.2.
 */

export type FaseRuta =
  | "contextualizacion"
  | "estacion_ae"
  | "situacion_integradora"
  | "evaluacion_final"
  | "retroalimentacion";

export type TipoInteraccion =
  | "briefing"
  | "lectura_plan"
  | "checklist_preventivo"
  | "correctivo_acotado"
  | "verificacion_post"
  | "gran_desafio"
  | "evaluacion_ot"
  | "errores_criticos"
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
  /** Si es evidencia/observación correcta para completar la estación */
  correcta?: boolean;
  detalle?: string;
  familia?: "preventivo" | "correctivo" | "seguridad" | "registro";
};

export type EstacionM7 = {
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
  mediaDemoGif?: string;
  mediaDemoMp4?: string;
  mediaNarratedMp4?: string;
  mediaNarratedTitle?: string;
  hotspots?: {
    id: string;
    optionId: string;
    label: string;
    x: number;
    y: number;
    r?: number;
  }[];
};

export const M7_META = {
  moduloNumero: 7,
  nombre: "Mantención de sistemas de refrigeración y climatización",
  especialidad: "Refrigeración y Climatización",
  oa: "OA 8",
  oaTexto:
    "Realizar el mantenimiento preventivo y correctivo de los sistemas de refrigeración, climatización, calefacción y ventilación, considerando los parámetros establecidos en los manuales de fabricación.",
  horasAulaTp: 57,
  horasDesarrollo: 55,
  horasEvaluacionFinal: 2,
  casoDemo: {
    titulo: "Planta agroindustrial — O’Higgins",
    resumen:
      "Plan de mantención anual de cámaras frigoríficas: checklist preventivo, hallazgo en evaporadora y correctivo acotado en obra, con verificación post-servicio y OT.",
    actor: "Cuadrilla de mantención + supervisor de calidad",
    equipo: "Cámaras de frío positivo / evaporadoras de techo",
    hallazgoTipico: "Hielo irregular en evaporadora + filtro obstruido",
  },
  portalDocenteHref: "/curso/climatizacion",
  heroMediaUrl: "/images/climatizacion/m7-mantencion.png",
  heroMediaAlt: "Mantención preventiva de equipo de refrigeración",
  storageKey: "aula-tp-m7-mantencion-progress-v1",
} as const;

export const PRACTICA_LIBRE_M7: PracticaLibreFase[] = [
  {
    id: "explorar",
    titulo: "Explorar",
    descripcion: "Checklists preventivos con apoyo guiado.",
    actividad:
      "Recorre un checklist de cámara frigorífica (filtros, drenajes, aletas, EPP) y marca tres ítems críticos de seguridad. Formativo, sin nota.",
  },
  {
    id: "desafiar",
    titulo: "Desafiar",
    descripcion: "Elige secuencia de OT.",
    actividad:
      "Ante hielo irregular en evaporadora, decide el orden: detener, EPP, inspección, correctivo acotado o escalar a taller. Justifica sin calificación.",
  },
  {
    id: "investigar",
    titulo: "Investigar",
    descripcion: "Errores críticos sin andamiaje.",
    actividad:
      "Identifica dos errores críticos en una OT mal cerrada (sin ΔT post-servicio, sin firma de supervisor) y propone corrección. Autonomía alta.",
  },
  {
    id: "transferir",
    titulo: "Transferir",
    descripcion: "Otra tipología de equipo.",
    actividad:
      "Aplica el mismo método preventivo/correctivo a un split de oficina distinta a las cámaras O’Higgins. No avanza la barra obligatoria.",
  },
];

export const ESTACIONES_M7: EstacionM7[] = [
  {
    id: "m7-ctx",
    orden: 0,
    slug: "contextualizacion",
    titulo: "Contextualización — Comprendo la situación · Llegada a planta O’Higgins",
    horas: 3,
    fase: "contextualizacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "ANALIZAR",
    preguntaPedagogica:
      "¿Qué información del briefing y del plan anual orienta tu primera mantención en cámara?",
    escenario:
      "Llegas a una planta agroindustrial en la Región de O’Higgins. El supervisor entrega el plan de mantención anual de cámaras de frío positivo: calendario de preventivo, manuales de evaporadoras de techo, bitácora de la última visita y un aviso de «hielo irregular en evaporadora cámara 3». Tu rol: cuadrilla de mantención.",
    interaccion: "briefing",
    evidenciaMinima: "Registrar al menos 2 antecedentes iniciales del caso.",
    mediaUrl: "/images/climatizacion/m7-mantencion.png",
    mediaAlt: "Mantención preventiva en planta agroindustrial",
    mediaCaption: "Observa el contexto de servicio antes de abrir el plan preventivo.",
    opciones: [
      {
        id: "ctx-plan",
        label: "Plan anual de preventivo vigente para cámaras (calendario + manuales)",
        correcta: true,
        detalle: "Marco de AE 7.1: preventivo según proyecto, obra y fábrica.",
        familia: "preventivo",
      },
      {
        id: "ctx-hallazgo",
        label: "Aviso: hielo irregular en evaporadora de cámara 3",
        correcta: true,
        detalle: "Antecedente que puede derivar en correctivo acotado (AE 7.2).",
        familia: "correctivo",
      },
      {
        id: "ctx-bitacora",
        label: "Bitácora de última visita (filtros / drenaje / ΔT)",
        correcta: true,
        familia: "registro",
      },
      {
        id: "ctx-falso",
        label: "Abrir overhaul de taller sin OT ni evidencia de preventivo",
        correcta: false,
        detalle: "Fuera de alcance Aula TP: overhaul completo excluido del 30 %.",
      },
    ],
    agente: [
      {
        nivel: 1,
        pregunta:
          "¿Qué datos del briefing son requisitos de preventivo y cuáles son hallazgos?",
      },
      {
        nivel: 2,
        pregunta:
          "¿Qué contrastarías primero: calendario del plan o el aviso de hielo en cámara 3?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Comprendo la situación — registrar antecedentes",
    ctaSiguiente: "Ir a lectura de plan preventivo",
    bloqueadoHastaCompletarAnterior: false,
  },
  {
    id: "m7-e1",
    orden: 1,
    slug: "lectura-plan-preventivo",
    titulo: "Estación 1 — Lectura de plan preventivo",
    horas: 10,
    fase: "estacion_ae",
    aeCodigos: ["AE 7.1"],
    ceCodigos: [],
    habilidad: "RELACIONAR",
    preguntaPedagogica:
      "¿Cómo se relacionan el plan de obra, las condiciones de planta y el manual de fábrica?",
    escenario:
      "Dispones del plan de mantención, condiciones de obra (acceso a cámara 3, EPP frío, horarios de faena) y manual del fabricante (intervalos de limpieza de aletas, drenaje, torque de fijaciones, ΔT de diseño). Debes emparejar ítems del plan ↔ especificación de fábrica.",
    interaccion: "lectura_plan",
    evidenciaMinima:
      "Completar matriz plan–manual–obra (≥2 pares correctos; excluir overhaul).",
    errorUtil:
      "Ignorar condición de obra (horario de faena) y programar intervención en plena carga → riesgo operativo.",
    opciones: [
      {
        id: "plan-filtros",
        label:
          "Ítem plan «filtros / retorno» ↔ manual: intervalo de inspección y reemplazo",
        correcta: true,
        familia: "preventivo",
      },
      {
        id: "plan-drenaje",
        label:
          "Ítem plan «drenaje evaporadora» ↔ manual: verificar libre de obstrucción",
        correcta: true,
        familia: "preventivo",
      },
      {
        id: "plan-obra",
        label:
          "Condición de obra: acceso y EPP frío ↔ secuencia segura antes de checklist",
        correcta: true,
        familia: "seguridad",
      },
      {
        id: "plan-overhaul",
        label: "Programar overhaul completo de compresor en esta visita",
        correcta: false,
        detalle: "Excluido del alcance 30 % / AE 7.2 acotado.",
      },
    ],
    agente: [
      {
        nivel: 2,
        pregunta:
          "¿Qué ítem del manual corresponde al intervalo de filtros del plan?",
      },
      {
        nivel: 4,
        pregunta:
          "Si plan y condiciones de obra no coinciden en horario, ¿qué registras antes de ejecutar?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar matriz plan–manual–obra",
    ctaSiguiente: "Ir a ejecución de checklist preventivo",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m7-e2",
    orden: 2,
    slug: "checklist-preventivo",
    titulo: "Estación 2 — Ejecución checklist preventivo",
    horas: 14,
    fase: "estacion_ae",
    aeCodigos: ["AE 7.1"],
    ceCodigos: [],
    habilidad: "EJECUTAR",
    preguntaPedagogica:
      "¿Qué secuencia de checklist preventivo es segura y trazable al manual?",
    escenario:
      "Simulación de mantención guiada en cámara 3: EPP, bloqueo/etiquetado según procedimiento de planta, inspección de filtros, aletas, drenaje, fijaciones y registro en bitácora. Debes marcar los pasos correctos del checklist.",
    interaccion: "hotspots",
    evidenciaMinima: "Completar checklist preventivo (≥3 pasos correctos; sin saltos inseguros).",
    errorUtil:
      "Omitir EPP / bloqueo y entrar a cámara en operación → riesgo de seguridad.",
    mediaUrl: "/images/climatizacion/m7-hotspots-base.png",
    mediaAlt: "Mantención preventiva: marca filtros, EPP, drenaje/circuito y registro",
    mediaCaption: "Haz clic en filtro, EPP, zona de drenaje/circuito y evita intervenir tablero sin LOTO.",
    mediaDemoGif: "/images/climatizacion/m7-mantencion-demo.gif",
    mediaDemoMp4: "/images/climatizacion/m7-mantencion-demo.mp4",
    mediaNarratedMp4: "/images/climatizacion/m7-mantencion-narrado.mp4",
    mediaNarratedTitle: "Video con narración — checklist preventivo (≈ 50 s)",
    hotspots: [
      { id: "hs-epp", optionId: "chk-epp", label: "EPP (guantes)", x: 18, y: 58, r: 6 },
      { id: "hs-filtros", optionId: "chk-filtros", label: "Filtro de aire", x: 22, y: 38, r: 8 },
      { id: "hs-drenaje", optionId: "chk-drenaje", label: "Circuito / mirilla", x: 78, y: 72, r: 7 },
      { id: "hs-bit", optionId: "chk-bitacora", label: "Estado abierto a registrar", x: 55, y: 45, r: 6 },
      { id: "hs-peligro", optionId: "chk-peligro", label: "Tablero / cableado sin LOTO", x: 82, y: 28, r: 6 },
    ],
    opciones: [
      {
        id: "chk-epp",
        label: "Verificar EPP frío y autorización de ingreso a cámara",
        correcta: true,
        familia: "seguridad",
      },
      {
        id: "chk-filtros",
        label: "Inspeccionar / limpiar filtros según intervalo del manual",
        correcta: true,
        familia: "preventivo",
      },
      {
        id: "chk-drenaje",
        label: "Verificar drenaje y aletas libres de hielo/obstrucción",
        correcta: true,
        familia: "preventivo",
      },
      {
        id: "chk-bitacora",
        label: "Registrar hallazgos y mediciones en bitácora / OT preventiva",
        correcta: true,
        familia: "registro",
      },
      {
        id: "chk-peligro",
        label: "Intervenir tablero sin verificar tensión cero / LOTO",
        correcta: false,
        detalle: "Secuencia insegura: en campo real se detiene de inmediato.",
      },
    ],
    agente: [
      {
        nivel: 3,
        pregunta: "¿Qué verificación haces antes de abrir la puerta de cámara 3?",
      },
      {
        nivel: 5,
        pregunta:
          "Si el drenaje está obstruido, ¿lo registras como hallazgo preventivo o ya es correctivo?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar checklist preventivo",
    ctaSiguiente: "Continuar a correctivo acotado",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m7-e3",
    orden: 3,
    slug: "correctivo-acotado",
    titulo: "Estación 3 — Correctivo acotado",
    horas: 12,
    fase: "estacion_ae",
    aeCodigos: ["AE 7.2"],
    ceCodigos: [],
    habilidad: "DECIDIR / EJECUTAR",
    preguntaPedagogica:
      "Ante el hallazgo del preventivo, ¿qué intervención correctiva acotada es coherente y cuál se escala?",
    escenario:
      "Del checklist: filtro de retorno muy obstruido e hielo irregular en evaporadora. Alcance AE 7.2 acotado: una intervención derivada del hallazgo en obra (limpieza/deshielo controlado + reemplazo de filtro). Sin overhaul de taller ni cambio de compresor especulativo.",
    interaccion: "correctivo_acotado",
    evidenciaMinima:
      "Seleccionar ≥2 acciones correctivas acotadas justificadas; excluir overhaul.",
    errorUtil:
      "Cambiar compresor «por si acaso» sin evidencia → costo y fuera de alcance acotado.",
    opciones: [
      {
        id: "cor-filtro",
        label: "Reemplazar filtro obstruido según catálogo / OT correctiva",
        correcta: true,
        familia: "correctivo",
      },
      {
        id: "cor-deshielo",
        label: "Deshielo / limpieza controlada de evaporadora (procedimiento planta)",
        correcta: true,
        familia: "correctivo",
      },
      {
        id: "cor-registro",
        label: "Documentar hallazgo → acción → evidencia fotográfica en OT",
        correcta: true,
        familia: "registro",
      },
      {
        id: "cor-taller",
        label: "Enviar equipo completo a taller para overhaul sin más evidencia",
        correcta: false,
        familia: "correctivo",
      },
    ],
    agente: [
      {
        nivel: 4,
        pregunta:
          "¿Qué evidencia del preventivo sostiene el correctivo de filtro y no un cambio de compresor?",
      },
      {
        nivel: 5,
        pregunta:
          "Si tras limpieza el hielo persiste, ¿qué registras y a quién escalas?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar OT correctiva acotada",
    ctaSiguiente: "Ir a verificación post-servicio",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m7-e4",
    orden: 4,
    slug: "verificacion-post-servicio",
    titulo: "Estación 4 — Verificación post-servicio",
    horas: 8,
    fase: "estacion_ae",
    aeCodigos: ["AE 7.1", "AE 7.2"],
    ceCodigos: [],
    habilidad: "VERIFICAR / REGISTRAR",
    preguntaPedagogica:
      "¿Qué evidencias demuestran que el preventivo/correctivo quedó conforme a manual?",
    escenario:
      "Post-intervención: mides ΔT, verificas drenaje libre, ausencia de hielo irregular y cierras la OT con firma de cuadrilla y supervisor. Debes marcar las verificaciones mínimas de cierre.",
    interaccion: "verificacion_post",
    evidenciaMinima: "Registrar ≥2 verificaciones post-servicio y cierre de OT.",
    errorUtil:
      "Cerrar OT sin ΔT ni firma de supervisor → error crítico de trazabilidad.",
    opciones: [
      {
        id: "ver-dt",
        label: "ΔT / temperatura de cámara dentro de tolerancia de diseño",
        correcta: true,
        familia: "registro",
      },
      {
        id: "ver-drenaje",
        label: "Drenaje libre y evaporadora sin hielo irregular residual",
        correcta: true,
        familia: "preventivo",
      },
      {
        id: "ver-ot",
        label: "OT cerrada con hallazgos, acciones, evidencias y firmas",
        correcta: true,
        familia: "registro",
      },
      {
        id: "ver-omitir",
        label: "Dar por cerrado sin medición ni registro fotográfico",
        correcta: false,
      },
    ],
    agente: [
      {
        nivel: 4,
        pregunta: "¿Qué magnitud contrastarías primero con la ficha post-servicio?",
      },
      {
        nivel: 6,
        pregunta:
          "Si ΔT aún está fuera de rango, ¿cierras la OT o dejas pendiente documentado?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar verificación post-servicio",
    ctaSiguiente: "Abrir Situación Integradora",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m7-sit",
    orden: 5,
    slug: "situacion-integradora",
    titulo: "Situación Integradora — OT preventiva + correctiva",
    horas: 6,
    fase: "situacion_integradora",
    aeCodigos: ["AE 7.1", "AE 7.2"],
    ceCodigos: [],
    habilidad: "INTEGRAR / TRANSFERIR",
    preguntaPedagogica:
      "Con plan, checklist, hallazgo y mediciones, ¿qué OT integral preventivo/correctivo elaboras?",
    escenario:
      "No se introduce AE nuevo. Combina lectura de plan + checklist preventivo + correctivo acotado + verificación. Tú eliges el orden de consulta de fuentes. Control progresivo (Gran Desafío).",
    interaccion: "gran_desafio",
    evidenciaMinima:
      "Integrar ≥4 fuentes y elaborar OT con preventivo, correctivo acotado y cierre.",
    errorUtil:
      "Cerrar OT sin evidencia de preventivo/correctivo acotado → mantención incompleta.",
    opciones: [
      {
        id: "gd-plan",
        label: "Fuente: plan anual + manual de evaporadora",
        correcta: true,
      },
      {
        id: "gd-checklist",
        label: "Fuente: checklist preventivo ejecutado (filtros, drenaje, EPP)",
        correcta: true,
      },
      {
        id: "gd-hallazgo",
        label: "Fuente: hallazgo hielo irregular + filtro obstruido",
        correcta: true,
      },
      {
        id: "gd-post",
        label: "Fuente: verificación post-servicio (ΔT, drenaje, firmas)",
        correcta: true,
      },
      {
        id: "gd-conclusion",
        label:
          "Conclusión OT: preventivo conforme + correctivo acotado en obra; sin overhaul; pendiente solo si ΔT no recupera",
        correcta: true,
      },
    ],
    agente: [
      { nivel: 5, pregunta: "¿Qué fuente consultarías primero para armar la OT y por qué?" },
      {
        nivel: 6,
        pregunta:
          "Si bitácora y medición post-servicio se contradicen, ¿cuál privilegias para el cierre?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Entregar OT integral preventivo/correctivo",
    ctaSiguiente: "Pasar a Evaluación Final (2 h)",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m7-eval",
    orden: 6,
    slug: "evaluacion-final",
    titulo: "Evaluación Final (2 h) — Orden de trabajo (sin Tutor)",
    horas: 2,
    fase: "evaluacion_final",
    aeCodigos: ["AE 7.1", "AE 7.2"],
    ceCodigos: [],
    habilidad: "EVALUAR",
    preguntaPedagogica:
      "Elabora y fundamenta una orden de trabajo preventivo/correctivo (formato distinto al diagnóstico de M6).",
    escenario:
      "Bloque A: ítems cerrados sobre secuencia preventiva y hallazgo acotado (muestra). Bloque B: interpretar → decidir OT preventivo/correctivo → fundamentar con evidencias. Sin pistas. Tutor deshabilitado (nivel 0).",
    interaccion: "evaluacion_ot",
    evidenciaMinima: "Completar Bloque A (muestra) y Bloque B (3 acciones de OT).",
    opciones: [
      {
        id: "ev-a1",
        label: "A1 — Preventivo: EPP + checklist filtros/drenaje antes de correctivo",
        correcta: true,
      },
      {
        id: "ev-a2",
        label: "A2 — Hallazgo típico derivado: filtro obstruido / hielo irregular",
        correcta: true,
      },
      {
        id: "ev-a3",
        label: "A3 — Correctivo acotado en obra: reemplazo filtro + limpieza controlada",
        correcta: true,
      },
      {
        id: "ev-b-interp",
        label: "B1 Interpretar: plan + hallazgo + condiciones de cámara 3",
        correcta: true,
      },
      {
        id: "ev-b-decidir",
        label: "B2 Decidir: OT preventiva + correctiva acotada (sin overhaul)",
        correcta: true,
      },
      {
        id: "ev-b-fund",
        label: "B3 Fundamentar: verificación ΔT/drenaje + firmas en cierre de OT",
        correcta: true,
      },
    ],
    agente: [],
    permiteAgente: false,
    esEvaluacionFormal: true,
    ctaCompletar: "Enviar OT de evaluación (simulado)",
    ctaSiguiente: "Ver errores críticos y cierre",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m7-cierre",
    orden: 7,
    slug: "retroalimentacion-cierre",
    titulo: "Retroalimentación y cierre — Errores críticos corregidos",
    horas: 2,
    fase: "retroalimentacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "RETROALIMENTAR",
    preguntaPedagogica:
      "¿Qué errores críticos identificaste y cómo se corrigieron? (distinto al mapa de fallas de M6)",
    escenario:
      "Revisión de errores críticos del módulo (seguridad, alcance acotado, trazabilidad de OT) y cómo se corrigieron. Recomendaciones de Práctica Libre. No es otra evaluación.",
    interaccion: "errores_criticos",
    evidenciaMinima: "Marcar ≥1 error crítico corregido y 1 recomendación de Práctica Libre.",
    opciones: [
      {
        id: "err-epp",
        label:
          "Error: omitir EPP/LOTO → Corrección: checklist de ingreso obligatorio antes de cámara",
        correcta: true,
        familia: "seguridad",
      },
      {
        id: "err-overhaul",
        label:
          "Error: proponer overhaul sin evidencia → Corrección: correctivo acotado documentado en OT",
        correcta: true,
        familia: "correctivo",
      },
      {
        id: "err-ot",
        label:
          "Error: cerrar OT sin ΔT/firmas → Corrección: verificación post-servicio obligatoria",
        correcta: true,
        familia: "registro",
      },
      {
        id: "err-pl",
        label:
          "Practicar drills de OT en Práctica Libre (Desafiar / Investigar)",
        correcta: true,
        familia: "preventivo",
      },
    ],
    agente: [
      {
        nivel: 1,
        pregunta:
          "¿Qué error crítico quieres reforzar primero en Práctica Libre?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar módulo y guardar reflexión",
    ctaSiguiente: "Volver al curso",
    bloqueadoHastaCompletarAnterior: true,
  },
];

export function getEstacionBySlug(slug: string): EstacionM7 | undefined {
  return ESTACIONES_M7.find((e) => e.slug === slug);
}

export function getEstacionById(id: string): EstacionM7 | undefined {
  return ESTACIONES_M7.find((e) => e.id === id);
}

export function getEstacionByOrden(orden: number): EstacionM7 | undefined {
  return ESTACIONES_M7.find((e) => e.orden === orden);
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
  currentId: ESTACIONES_M7[0].id,
  evalSubmitted: false,
  practicaLibreVisits: [],
};

export function stationIsUnlocked(
  estacion: EstacionM7,
  completedIds: string[],
): boolean {
  if (!estacion.bloqueadoHastaCompletarAnterior) return true;
  if (estacion.orden === 0) return true;
  const prev = ESTACIONES_M7.find((e) => e.orden === estacion.orden - 1);
  if (!prev) return true;
  return completedIds.includes(prev.id);
}

export function canCompleteStation(
  estacion: EstacionM7,
  selected: string[],
): boolean {
  const correctIds = estacion.opciones.filter((o) => o.correcta).map((o) => o.id);
  const selectedCorrect = selected.filter((id) => correctIds.includes(id));
  const selectedIncorrect = selected.filter(
    (id) => !correctIds.includes(id) && estacion.opciones.some((o) => o.id === id),
  );

  if (estacion.interaccion === "evaluacion_ot") {
    return selectedCorrect.length >= 5 && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "gran_desafio") {
    return selectedCorrect.length >= 4;
  }
  if (estacion.interaccion === "errores_criticos") {
    return selected.length >= 1;
  }
  if (estacion.interaccion === "checklist_preventivo") {
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
