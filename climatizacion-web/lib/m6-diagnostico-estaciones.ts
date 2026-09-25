/**
 * Módulo 6 — Diagnóstico
 * Contenido de estaciones derivado de Prompt Maestro / programa MINEDUC.
 * CE = texto del programa. Caso demo = edificio Ñuñoa (narrativo).
 */
/** Etapas ciclo: Analizar→Comprender→Relacionar→Aplicar→Verificar→Retroalimentar (UI). */

export type FaseRuta =
  | "contextualizacion"
  | "estacion_ae"
  | "situacion_integradora"
  | "evaluacion_final"
  | "retroalimentacion";

export type TipoInteraccion =
  | "briefing"
  | "hotspots"
  | "matching"
  | "tabla_mediciones"
  | "checklist_conexion"
  | "hipotesis"
  | "decision_roles"
  | "kanban_clasificacion"
  | "formulario_repuestos"
  | "gran_desafio"
  | "evaluacion"
  | "mapa_desempeno";

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
  familia?: "electrica" | "mecanica" | "flujo" | "control";
};

export type EstacionM6 = {
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
  /** Evidencia mínima que el estudiante debe registrar */
  evidenciaMinima: string;
  /** Error útil / consecuencia profesional */
  errorUtil?: string;
  opciones: OpcionInteractiva[];
  /** Niveles del Tutor Aula TP (preguntas/hints, sin respuestas). Vacío en eval final. */
  agente: AgenteNivel[];
  permiteAgente: boolean;
  ctaCompletar: string;
  ctaSiguiente: string;
  bloqueadoHastaCompletarAnterior: boolean;
  /** Fase evaluativa formal (candado visual distinto) */
  esEvaluacionFormal?: boolean;
  mediaUrl?: string;
  mediaAlt?: string;
  mediaCaption?: string;
  mediaDemoGif?: string;
  mediaDemoMp4?: string;
  mediaNarratedMp4?: string;
  mediaNarratedTitle?: string;
  mediaModelUrl?: string;
  mediaModelCaption?: string;
  hotspots?: {
    id: string;
    optionId: string;
    label: string;
    x: number;
    y: number;
    r?: number;
  }[];
};

export const M6_META = {
  moduloNumero: 6,
  nombre: "Diagnóstico de sistemas de refrigeración y climatización",
  especialidad: "Refrigeración y Climatización",
  oa: "OA 7",
  oaTexto:
    "Inspeccionar y diagnosticar fallas en sistemas e instalaciones de refrigeración, climatización, calefacción y ventilación, respecto de las especificaciones técnicas del fabricante.",
  horasAulaTp: 57,
  horasDesarrollo: 55,
  horasEvaluacionFinal: 2,
  casoDemo: {
    titulo: "Edificio de departamentos — Ñuñoa",
    resumen:
      "Áreas comunes fuera de setpoint y ruido metálico en la condensadora del sistema de climatización de lobby y pasillos.",
    actor: "Técnico de diagnóstico + conserje (testimonio)",
    setpoint: "22 °C",
    retornoObservado: "27 °C",
  },
  portalDocenteHref: "/curso/climatizacion",
  heroMediaUrl: "/images/climatizacion/m6-inspeccion-visual.png",
  heroMediaAlt: "Inspección visual de unidad de climatización",
  storageKey: "aula-tp-m6-diagnostico-progress-v1",
} as const;

export const PRACTICA_LIBRE_M6: PracticaLibreFase[] = [
  {
    id: "explorar",
    titulo: "Explorar",
    descripcion: "Fallas evidentes con apoyo guiado.",
    actividad:
      "Identifica tres anomalías visibles en una condensadora de rooftop (suciedad en aletas, tornillo de anclaje flojo, mancha de aceite). Formativo, sin nota.",
  },
  {
    id: "desafiar",
    titulo: "Desafiar",
    descripcion: "Elige estrategia de medición.",
    actividad:
      "Ante ΔT alto en retorno, decide qué instrumento conectar primero (sonda T, manómetro, multímetro) y justifica el orden. Sin calificación.",
  },
  {
    id: "investigar",
    titulo: "Investigar",
    descripcion: "Hipótesis sin andamiaje.",
    actividad:
      "Formulas dos hipótesis para ruido metálico + presión de descarga elevada y defines qué medición descarta cada una. Autonomía alta.",
  },
  {
    id: "transferir",
    titulo: "Transferir",
    descripcion: "Otra tipología de equipo.",
    actividad:
      "Aplica el mismo método a un split domiciliario distinto al caso Ñuñoa (evaporadora en living). No avanza la barra obligatoria.",
  },
];

export const ESTACIONES_M6: EstacionM6[] = [
  {
    id: "m6-ctx",
    orden: 0,
    slug: "contextualizacion",
    titulo: "Contextualización — Comprendo la situación · Llegada al edificio Ñuñoa",
    horas: 3,
    fase: "contextualizacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "ANALIZAR",
    preguntaPedagogica:
      "¿Qué información del briefing y del testimonio del conserje orienta tu primera inspección?",
    escenario:
      "Llegas al edificio de departamentos en Ñuñoa. El conserje reporta: «El lobby no baja de 26–27 °C aunque el termostato está en 22 °C, y en la terraza se oye un ruido metálico en la condensadora desde hace una semana». Tienes fotos del rooftop, un fragmento de plano de redes y la ficha del equipo VRV/condensadora de áreas comunes.",
    interaccion: "briefing",
    evidenciaMinima: "Registrar al menos 2 antecedentes iniciales del caso.",
    mediaUrl: "/images/climatizacion/m6-inspeccion-visual.png",
    mediaAlt: "Inspección visual de equipo en edificio de departamentos",
    mediaCaption: "Observa el estado visible del equipo antes de formular hipótesis.",
    opciones: [
      {
        id: "ctx-setpoint",
        label: "Setpoint 22 °C vs retorno/ambiente ~27 °C (fuera de confort)",
        correcta: true,
        detalle: "Desvío térmico respecto de consignas de operación.",
        familia: "control",
      },
      {
        id: "ctx-ruido",
        label: "Ruido metálico en condensadora de terraza (≈1 semana)",
        correcta: true,
        detalle: "Síntoma mecánico reportado por conserje.",
        familia: "mecanica",
      },
      {
        id: "ctx-plano",
        label: "Ubicación de condensadora en rooftop según fragmento de plano",
        correcta: true,
        detalle: "Referencia espacial antes de inspeccionar.",
        familia: "flujo",
      },
      {
        id: "ctx-falso",
        label: "Declarar falla de compresor sin inspección ni medición",
        correcta: false,
        detalle: "Diagnóstico prematuro: riesgo de repuesto innecesario.",
      },
    ],
    agente: [
      { nivel: 1, pregunta: "¿Qué datos del testimonio son síntomas y cuáles son opiniones?" },
      { nivel: 2, pregunta: "¿Qué contrastarías primero: confort térmico o ruido mecánico? ¿Por qué?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Comprendo la situación — registrar antecedentes",
    ctaSiguiente: "Ir a inspección visual",
    bloqueadoHastaCompletarAnterior: false,
  },
  {
    id: "m6-e1",
    orden: 1,
    slug: "inspeccion-visual",
    titulo: "Estación 1 — Inspección visual guiada",
    horas: 5,
    fase: "estacion_ae",
    aeCodigos: ["AE 6.1"],
    ceCodigos: ["CE 1.1"],
    habilidad: "RECONOCER",
    preguntaPedagogica:
      "¿Qué anomalías son observables a simple vista antes de conectar instrumentos?",
    escenario:
      "En la terraza inspeccionas la condensadora: aletas con suciedad acumulada, un anclaje con holgura visible, leve mancha en unión de línea y vibración perceptible al tacto en el basamento.",
    interaccion: "hotspots",
    evidenciaMinima: "Etiquetar ≥3 anomalías visibles (sin diagnosticar causa raíz).",
    errorUtil:
      "Etiquetar como «falla de compresor» una vibración por fijación suelta → tiempo perdido y repuesto innecesario.",
    mediaUrl: "/images/climatizacion/m6-hotspots-base.png",
    mediaAlt: "Condensadora exterior: marca anomalías visibles en la imagen",
    mediaCaption: "Haz clic en las zonas con anomalía. También puedes marcarlas en la lista.",
    mediaDemoGif: "/images/climatizacion/m6-inspeccion-demo.gif",
    mediaDemoMp4: "/images/climatizacion/m6-inspeccion-demo.mp4",
    mediaNarratedMp4: "/images/climatizacion/m6-inspeccion-narrado.mp4",
    mediaNarratedTitle: "Video con narración — inspección visual (≈ 50 s)",
    mediaModelUrl: "/models/climatizacion/condensadora-m6.glb",
    mediaModelCaption: "Modelo 3D de condensadora: orbita y marca hallazgos en los puntos.",
    hotspots: [
      {
        id: "hs-suciedad",
        optionId: "vis-suciedad",
        label: "Aletas / serpentín",
        x: 72,
        y: 46,
        r: 8,
      },
      {
        id: "hs-anclaje",
        optionId: "vis-anclaje",
        label: "Anclaje / soporte",
        x: 30,
        y: 84,
        r: 6,
      },
      {
        id: "hs-mancha",
        optionId: "vis-mancha",
        label: "Unión de línea",
        x: 82,
        y: 74,
        r: 6,
      },
      {
        id: "hs-compresor",
        optionId: "vis-compresor",
        label: "Zona del ventilador (distractor)",
        x: 42,
        y: 40,
        r: 7,
      },
    ],
    opciones: [
      {
        id: "vis-suciedad",
        label: "Suciedad / obstrucción en aletas del condensador",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "vis-anclaje",
        label: "Holgura en anclaje / fijación del equipo",
        correcta: true,
        familia: "mecanica",
      },
      {
        id: "vis-mancha",
        label: "Mancha en unión de línea (posible filtración)",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "vis-compresor",
        label: "Falla interna de compresor (sin abrir ni medir)",
        correcta: false,
        detalle: "No es observable a simple vista con evidencia actual.",
      },
    ],
    agente: [
      { nivel: 2, pregunta: "¿Qué dice el manual sobre holgura de anclajes?" },
      { nivel: 3, pregunta: "¿Cuál de estas anomalías registrarías primero en la bitácora fotográfica?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar registro fotográfico etiquetado",
    ctaSiguiente: "Continuar a contraste con manual",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m6-e2",
    orden: 2,
    slug: "contraste-manual",
    titulo: "Estación 2 — Contraste con manual y catálogo",
    horas: 5,
    fase: "estacion_ae",
    aeCodigos: ["AE 6.1"],
    ceCodigos: ["CE 1.1"],
    habilidad: "RELACIONAR",
    preguntaPedagogica:
      "¿Cómo se relacionan tus observaciones con los ítems del manual de fabricación?",
    escenario:
      "Dispones del manual del fabricante: holgura máxima de anclajes, ΔT de diseño, torque de fijaciones y criterio de limpieza de aletas. Debes emparejar observación ↔ especificación.",
    interaccion: "matching",
    evidenciaMinima: "Completar matriz observación–especificación (≥2 pares correctos).",
    errorUtil:
      "Emparejar «ruido → cambiar compresor» sin medición → solución sin evidencia.",
    opciones: [
      {
        id: "mat-anclaje",
        label: "Holgura visible ↔ «anclajes sin holgura; reapretar según torque»",
        correcta: true,
        familia: "mecanica",
      },
      {
        id: "mat-aletas",
        label: "Aletas sucias ↔ «mantener aletas libres de obstrucción»",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "mat-dt",
        label: "Ambiente 27 °C / setpoint 22 °C ↔ ΔT fuera de rango de confort de diseño",
        correcta: true,
        familia: "control",
      },
      {
        id: "mat-errado",
        label: "Ruido ↔ «cambiar compresor de inmediato» (sin medición)",
        correcta: false,
      },
    ],
    agente: [
      { nivel: 2, pregunta: "¿Qué ítem del catálogo corresponde a la holgura que viste?" },
      { nivel: 4, pregunta: "Si observación y manual no coinciden, ¿qué registras antes de proponer solución?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar matriz observación–especificación",
    ctaSiguiente: "Ir a lectura de instrumentos",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m6-e3",
    orden: 3,
    slug: "lectura-instrumentos",
    titulo: "Estación 3 — Lectura de instrumentos vs especificación",
    horas: 6,
    fase: "estacion_ae",
    aeCodigos: ["AE 6.1"],
    ceCodigos: ["CE 1.2"],
    habilidad: "APLICAR",
    preguntaPedagogica:
      "¿Qué valores medidos se desvían de las especificaciones de fabricación?",
    escenario:
      "Trabajo en equipo virtual: un rol lee T de retorno, otro presión de alta, otro amperaje. Comparan con ficha de fábrica.",
    interaccion: "tabla_mediciones",
    evidenciaMinima: "Marcar al menos 2 lecturas fuera de especificación.",
    errorUtil:
      "Ignorar lecturas fuera de especificación → diagnóstico incompleto.",
    mediaUrl: "/images/climatizacion/m6-instrumentos.png",
    mediaAlt: "Lectura de instrumentos en diagnóstico HVAC",
    mediaCaption: "Contrasta lecturas de presión, temperatura y corriente con la especificación.",
    opciones: [
      {
        id: "med-t",
        label: "T retorno 27 °C (esp. confort / diseño ~22–24 °C) — fuera de rango",
        correcta: true,
        familia: "control",
      },
      {
        id: "med-p",
        label: "Presión de descarga elevada vs ficha (ΔP anómalo)",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "med-a",
        label: "Amperaje de compresor levemente sobre nominal",
        correcta: true,
        familia: "electrica",
      },
      {
        id: "med-ok",
        label: "Tensión de alimentación dentro de tolerancia (±10 %)",
        correcta: false,
        detalle: "Esta lectura está dentro de especificación; no es desvío.",
      },
    ],
    agente: [
      { nivel: 3, pregunta: "¿Qué magnitud contrastarías primero con la ficha: T, P o A?" },
      { nivel: 4, pregunta: "¿Cómo documentas el rol de cada integrante en la tabla medido vs fábrica?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar tabla medido vs fábrica",
    ctaSiguiente: "Continuar a conexión de instrumentos",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m6-e4",
    orden: 4,
    slug: "conexion-instrumentos",
    titulo: "Estación 4 — Conexión de instrumentos para búsqueda",
    horas: 6,
    fase: "estacion_ae",
    aeCodigos: ["AE 6.2"],
    ceCodigos: ["CE 2.1"],
    habilidad: "EJECUTAR",
    preguntaPedagogica:
      "¿Qué secuencia de conexión es segura y permite comparar valores con fabricación?",
    escenario:
      "Simulación: manómetros, multímetro y sonda de temperatura. Debes marcar los pasos de conexión segura antes de buscar fallas.",
    interaccion: "checklist_conexion",
    evidenciaMinima: "Completar checklist de conexión segura (≥3 pasos correctos).",
    errorUtil:
      "Abrir circuito sin verificar tensión cero → riesgo eléctrico grave.",
    mediaUrl: "/images/climatizacion/m6-instrumentos.png",
    mediaAlt: "Conexión de instrumentos para diagnóstico en unidad exterior",
    mediaCaption: "Conecta manifold, pinza y termómetro con EPP y equipo en condición segura.",
    opciones: [
      {
        id: "con-epp",
        label: "Verificar EPP y estado del equipo antes de conectar",
        correcta: true,
      },
      {
        id: "con-valvulas",
        label: "Conectar manómetros en válvulas de servicio según manual",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "con-sonda",
        label: "Ubicar sonda T en punto de retorno indicado por fabricante",
        correcta: true,
        familia: "control",
      },
      {
        id: "con-peligro",
        label: "Abrir circuito eléctrico sin verificar tensión cero",
        correcta: false,
        detalle: "Secuencia insegura: en campo real se detiene de inmediato.",
      },
    ],
    agente: [
      { nivel: 3, pregunta: "¿Qué verificación haces antes de conectar el manómetro?" },
      { nivel: 5, pregunta: "Si el valor medido no coincide con fábrica, ¿qué registras en la bitácora?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar checklist de conexión",
    ctaSiguiente: "Ir a hipótesis de falla",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m6-e5",
    orden: 5,
    slug: "hipotesis-falla",
    titulo: "Estación 5 — Hipótesis de falla con evidencia",
    horas: 6,
    fase: "estacion_ae",
    aeCodigos: ["AE 6.2"],
    ceCodigos: ["CE 2.2"],
    habilidad: "DIAGNOSTICAR",
    preguntaPedagogica:
      "Ante setpoint 22 °C, retorno 27 °C, ruido metálico y ΔP anómalo, ¿qué hipótesis sostienes con evidencia?",
    escenario:
      "Tablero de hipótesis: formula ≥2, elige mediciones y descarta. Evidencia: bitácora con magnitud, valor, referencia de fábrica y conclusión.",
    interaccion: "hipotesis",
    evidenciaMinima: "Seleccionar ≥2 hipótesis plausibles y descartar al menos 1 infundada.",
    errorUtil:
      "Mantener «falla de PCB» sin medición eléctrica → propuesta sin evidencia.",
    opciones: [
      {
        id: "hip-flujo",
        label: "Restricción de flujo de aire por aletas sucias (explica ΔT y ΔP)",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "hip-mecanica",
        label: "Vibración por anclaje flojo (explica ruido metálico)",
        correcta: true,
        familia: "mecanica",
      },
      {
        id: "hip-carga",
        label: "Posible subcarga / filtración (mancha + ΔP) — requiere más medición",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "hip-pcb",
        label: "Falla de placa electrónica (sin medición de señales)",
        correcta: false,
        familia: "electrica",
      },
    ],
    agente: [
      { nivel: 4, pregunta: "¿Qué medición descartaría primero la hipótesis de anclaje flojo?" },
      { nivel: 5, pregunta: "¿Cómo rankeas las hipótesis con la evidencia que ya tienes?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar hipótesis rankeadas + evidencia",
    ctaSiguiente: "Continuar a soluciones y roles",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m6-e6",
    orden: 6,
    slug: "soluciones-roles",
    titulo: "Estación 6 — Propuesta de soluciones y roles",
    horas: 5,
    fase: "estacion_ae",
    aeCodigos: ["AE 6.2"],
    ceCodigos: ["CE 2.3", "CE 2.4"],
    habilidad: "DECIDIR / ARGUMENTAR",
    preguntaPedagogica:
      "¿Qué soluciones son coherentes con los datos y cómo asignas roles en el plan?",
    escenario:
      "Caso con alternativas plausibles: limpieza de aletas, reajuste de anclajes, prueba de hermeticidad, o cambio inmediato de compresor. Debes proponer y planificar roles.",
    interaccion: "decision_roles",
    evidenciaMinima: "Elegir ≥2 acciones justificadas y un plan de roles.",
    errorUtil:
      "Cambiar compresor de inmediato sin más evidencia → costo y tiempo innecesarios.",
    opciones: [
      {
        id: "sol-limpieza",
        label: "Limpieza de aletas + verificación ΔT post-intervención (rol: técnico A)",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "sol-anclaje",
        label: "Reapretar anclajes según torque de manual (rol: técnico B)",
        correcta: true,
        familia: "mecanica",
      },
      {
        id: "sol-hermeticidad",
        label: "Prueba de hermeticidad si mancha persiste (rol: técnico A + registro)",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "sol-compresor",
        label: "Cambiar compresor de inmediato sin más evidencia",
        correcta: false,
      },
    ],
    agente: [
      { nivel: 4, pregunta: "¿Qué acción priorizarías si el ruido y el ΔT deben resolverse en la misma visita?" },
      { nivel: 5, pregunta: "¿Cómo documentas la asignación de roles en el plan de acción?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar propuesta + plan de roles",
    ctaSiguiente: "Ir a clasificación obra vs taller",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m6-e7",
    orden: 7,
    slug: "clasificacion-obra-taller",
    titulo: "Estación 7 — Clasificación obra vs taller y prioridad",
    horas: 6,
    fase: "estacion_ae",
    aeCodigos: ["AE 6.3"],
    ceCodigos: ["CE 3.1", "CE 3.2", "CE 3.3"],
    habilidad: "CLASIFICAR",
    preguntaPedagogica:
      "¿Qué fallas se corrigen en obra, cuáles en taller, y con qué prioridad?",
    escenario:
      "Kanban: gravedad × tiempo de reparación × lugar (obra / taller). Listado priorizado para el jefe de mantención del edificio.",
    interaccion: "kanban_clasificacion",
    evidenciaMinima: "Clasificar ≥3 fallas por lugar y prioridad.",
    errorUtil:
      "Enviar toda anomalía a taller sin priorizar → demora y costo evitables.",
    opciones: [
      {
        id: "kan-aletas",
        label: "Suciedad en aletas → Obra · gravedad media · prioridad alta",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "kan-anclaje",
        label: "Anclaje flojo → Obra · gravedad media · prioridad alta (ruido/seguridad)",
        correcta: true,
        familia: "mecanica",
      },
      {
        id: "kan-compresor",
        label: "Sospecha de daño interno de compresor → Taller · tras confirmación",
        correcta: true,
        familia: "mecanica",
      },
      {
        id: "kan-errado",
        label: "Toda anomalía → Taller inmediato sin priorizar",
        correcta: false,
      },
    ],
    agente: [
      { nivel: 5, pregunta: "¿Qué criterio usas para decidir obra vs taller según el manual?" },
      { nivel: 6, pregunta: "¿Cómo ordenas prioridad si gravedad y tiempo de reparación entran en conflicto?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar listado priorizado obra–taller",
    ctaSiguiente: "Continuar a listado de repuestos",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m6-e8",
    orden: 8,
    slug: "listado-repuestos",
    titulo: "Estación 8 — Listado de repuestos y materiales",
    horas: 4,
    fase: "estacion_ae",
    aeCodigos: ["AE 6.3"],
    ceCodigos: ["CE 3.4"],
    habilidad: "REGISTRAR",
    preguntaPedagogica:
      "¿Qué materiales y repuestos solicitar al fabricante según el diagnóstico?",
    escenario:
      "Formulario profesional de solicitud: solo ítems respaldados por evidencia (no pedidos especulativos).",
    interaccion: "formulario_repuestos",
    evidenciaMinima: "Incluir ≥2 ítems justificados; excluir pedidos sin evidencia.",
    errorUtil: "Pedir compresor completo sin evidencia → costo y tiempo innecesarios.",
    opciones: [
      {
        id: "rep-kit-anclaje",
        label: "Kit de fijación / pernos según catálogo (evidencia: holgura)",
        correcta: true,
        familia: "mecanica",
      },
      {
        id: "rep-limpieza",
        label: "Materiales de limpieza de aletas / bobina (evidencia: suciedad)",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "rep-juntas",
        label: "Juntas / sellos de línea si hermeticidad confirma filtración",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "rep-compresor",
        label: "Compresor completo «por si acaso»",
        correcta: false,
      },
    ],
    agente: [
      { nivel: 5, pregunta: "¿Qué código de catálogo asociarías a cada ítem solicitado?" },
      { nivel: 6, pregunta: "¿Qué ítem excluirías por falta de evidencia en la bitácora?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Enviar lista a fabricante (simulado)",
    ctaSiguiente: "Abrir Situación Integradora",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m6-sit",
    orden: 9,
    slug: "situacion-integradora",
    titulo: "Situación Integradora — Gran Desafío",
    horas: 7,
    fase: "situacion_integradora",
    aeCodigos: ["AE 6.1", "AE 6.2", "AE 6.3"],
    ceCodigos: ["CE 1.1", "CE 1.2", "CE 2.1", "CE 2.2", "CE 2.3", "CE 2.4", "CE 3.1", "CE 3.2", "CE 3.3", "CE 3.4"],
    habilidad: "INTEGRAR / TRANSFERIR",
    preguntaPedagogica:
      "Con información distribuida (audio del conserje, ficha, fotos, lecturas), ¿qué informe de diagnóstico integral elaboras?",
    escenario:
      "No se introduce AE nuevo. Combina inspección + medición + clasificación obra/taller + listado de repuestos. Tú eliges el orden de consulta de fuentes. Control progresivo (Gran Desafío).",
    interaccion: "gran_desafio",
    evidenciaMinima:
      "Integrar ≥4 fuentes y elaborar conclusión con lugar de corrección y repuestos.",
    errorUtil:
      "Informe sin integrar fuentes ni lugar de corrección → diagnóstico no transferible.",
    opciones: [
      {
        id: "gd-audio",
        label: "Fuente: testimonio conserje (ruido + confort)",
        correcta: true,
      },
      {
        id: "gd-fotos",
        label: "Fuente: fotos rooftop (aletas, anclaje, mancha)",
        correcta: true,
      },
      {
        id: "gd-lecturas",
        label: "Fuente: lecturas T/P/A vs ficha",
        correcta: true,
      },
      {
        id: "gd-manual",
        label: "Fuente: manual / catálogo (torque, ΔT, limpieza)",
        correcta: true,
      },
      {
        id: "gd-conclusion",
        label:
          "Conclusión: restricción de flujo + anclaje flojo en obra; hermeticidad pendiente; sin cambio de compresor aún",
        correcta: true,
      },
    ],
    agente: [
      { nivel: 5, pregunta: "¿Qué fuente consultarías primero y por qué?" },
      {
        nivel: 6,
        pregunta:
          "Si dos fuentes se contradicen, ¿cuál privilegias para el informe? (sin revelar la falla)",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Entregar informe de diagnóstico integral",
    ctaSiguiente: "Pasar a Evaluación Final (2 h)",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m6-eval",
    orden: 10,
    slug: "evaluacion-final",
    titulo: "Evaluación Final (2 h) — sin Tutor Aula TP",
    horas: 2,
    fase: "evaluacion_final",
    aeCodigos: ["AE 6.1", "AE 6.2", "AE 6.3"],
    ceCodigos: ["CE 1.1", "CE 1.2", "CE 2.1", "CE 2.2", "CE 2.3", "CE 2.4", "CE 3.1", "CE 3.2", "CE 3.3", "CE 3.4"],
    habilidad: "EVALUAR",
    preguntaPedagogica:
      "Diagnóstico de situación profesional y fundamentación (formato variable vs otros módulos).",
    escenario:
      "Bloque A: ítems cerrados contextualizados (muestra). Bloque B: interpretar → decidir falla y lugar → fundamentar con evidencia. Sin pistas. Tutor deshabilitado (nivel 0).",
    interaccion: "evaluacion",
    evidenciaMinima: "Completar Bloque A (muestra) y Bloque B (3 acciones).",
    opciones: [
      {
        id: "ev-a1",
        label: "A1 — Anomalía visual típica antes de instrumentos: suciedad en aletas",
        correcta: true,
      },
      {
        id: "ev-a2",
        label: "A2 — Lectura fuera de esp.: retorno 27 °C con setpoint 22 °C",
        correcta: true,
      },
      {
        id: "ev-a3",
        label: "A3 — Corrección en obra: reapretar anclajes según manual",
        correcta: true,
      },
      {
        id: "ev-b-interp",
        label: "B1 Interpretar: antecedentes de confort + ruido + ΔP",
        correcta: true,
      },
      {
        id: "ev-b-decidir",
        label: "B2 Decidir: falla más probable flujo/anclaje · corrección en obra",
        correcta: true,
      },
      {
        id: "ev-b-fund",
        label: "B3 Fundamentar: medición T/P + ítems de manual (sin especulación)",
        correcta: true,
      },
    ],
    agente: [],
    permiteAgente: false,
    esEvaluacionFormal: true,
    ctaCompletar: "Enviar evaluación (simulado)",
    ctaSiguiente: "Ver retroalimentación y cierre",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m6-cierre",
    orden: 11,
    slug: "retroalimentacion-cierre",
    titulo: "Retroalimentación y cierre — Mapa de desempeño",
    horas: 2,
    fase: "retroalimentacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "RETROALIMENTAR",
    preguntaPedagogica:
      "¿En qué familias de falla te desempeñaste mejor y qué practicarías en Práctica Libre?",
    escenario:
      "Mapa de desempeño por familia (eléctrica / mecánica / flujo / control) + recomendaciones personalizadas de Práctica Libre. No es otra evaluación.",
    interaccion: "mapa_desempeno",
    evidenciaMinima: "Revisar mapa y marcar ≥1 recomendación de Práctica Libre.",
    opciones: [
      {
        id: "map-flujo",
        label: "Familia flujo: fuerte en aletas / ΔP — reforzar hermeticidad en PL Investigar",
        correcta: true,
        familia: "flujo",
      },
      {
        id: "map-mecanica",
        label: "Familia mecánica: anclajes OK — transferir a otro equipo en PL Transferir",
        correcta: true,
        familia: "mecanica",
      },
      {
        id: "map-control",
        label: "Familia control: contraste setpoint — practicar en PL Desafiar",
        correcta: true,
        familia: "control",
      },
      {
        id: "map-electrica",
        label: "Familia eléctrica: pendiente profundizar mediciones — PL Explorar",
        correcta: true,
        familia: "electrica",
      },
    ],
    agente: [
      { nivel: 1, pregunta: "¿Qué familia de falla quieres reforzar primero en Práctica Libre?" },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar módulo y guardar reflexión",
    ctaSiguiente: "Volver al curso",
    bloqueadoHastaCompletarAnterior: true,
  },
];

export function getEstacionBySlug(slug: string): EstacionM6 | undefined {
  return ESTACIONES_M6.find((e) => e.slug === slug);
}

export function getEstacionById(id: string): EstacionM6 | undefined {
  return ESTACIONES_M6.find((e) => e.id === id);
}

export function getEstacionByOrden(orden: number): EstacionM6 | undefined {
  return ESTACIONES_M6.find((e) => e.orden === orden);
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
  currentId: ESTACIONES_M6[0].id,
  evalSubmitted: false,
  practicaLibreVisits: [],
};

export function stationIsUnlocked(
  estacion: EstacionM6,
  completedIds: string[],
): boolean {
  if (!estacion.bloqueadoHastaCompletarAnterior) return true;
  if (estacion.orden === 0) return true;
  const prev = ESTACIONES_M6.find((e) => e.orden === estacion.orden - 1);
  if (!prev) return true;
  return completedIds.includes(prev.id);
}

export function canCompleteStation(
  estacion: EstacionM6,
  selected: string[],
): boolean {
  const correctIds = estacion.opciones.filter((o) => o.correcta).map((o) => o.id);
  const selectedCorrect = selected.filter((id) => correctIds.includes(id));
  const selectedIncorrect = selected.filter(
    (id) => !correctIds.includes(id) && estacion.opciones.some((o) => o.id === id),
  );

  if (estacion.interaccion === "evaluacion") {
    return selectedCorrect.length >= 5 && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "gran_desafio") {
    return selectedCorrect.length >= 4;
  }
  if (estacion.interaccion === "mapa_desempeno") {
    return selected.length >= 1;
  }
  // Default: at least 2 correct and no incorrect selected (or allow incorrect as teaching moments but block complete)
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
