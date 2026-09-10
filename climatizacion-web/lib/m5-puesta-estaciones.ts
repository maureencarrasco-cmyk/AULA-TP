/**
 * Módulo 5 — Puesta en marcha de equipos
 * AE 5.1 preparación/transporte · AE 5.2 carga de fluidos (NCh3241).
 * AE 5.3 solo verificación mínima post-carga (puente). Caso: Supermercado Los Lagos.
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
  | "prep_area_epp"
  | "equipos_carga"
  | "secuencia_carga"
  | "registro_parametros"
  | "gran_desafio"
  | "evaluacion_carga"
  | "sintesis_nch3241"
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
  familia?:
    | "preparacion"
    | "carga"
    | "seguridad"
    | "registro"
    | "ambiente"
    | "equipo";
};

export type EstacionM5 = {
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

export const M5_META = {
  moduloNumero: 5,
  nombre: "Puesta en marcha de equipos de refrigeración y climatización",
  especialidad: "Refrigeración y Climatización",
  oa: "OA 6",
  oaTexto:
    "Poner en marcha equipos y sistemas de refrigeración y climatización, aplicando procedimientos técnicos, de seguridad y de protección del medio ambiente.",
  horasAulaTp: 68.4,
  horasDesarrollo: 66.4,
  horasEvaluacionFinal: 2,
  casoDemo: {
    titulo: "Supermercado Los Lagos — sala fría",
    resumen:
      "Preparación de área/EPP, equipos de carga y transporte, secuencia de carga de fluido y registro de parámetros con verificación mínima post-carga (NCh3241). Sin puesta en marcha multi-sistema completa (AE 5.3).",
    actor: "Técnico de carga y puesta en marcha",
    equipo: "Sala fría de venta · circuito de refrigeración comercial",
    hallazgoTipico: "Protocolo de carga pendiente + lecturas de presión a registrar",
  },
  portalDocenteHref: "/curso/climatizacion",
  heroMediaUrl: "/images/climatizacion/m5-carga-fluidos.png",
  heroMediaAlt: "Carga de fluido refrigerante con balanza y manifold",
  storageKey: "aula-tp-m5-puesta-progress-v1",
} as const;

export const PRACTICA_LIBRE_M5: PracticaLibreFase[] = [
  {
    id: "explorar",
    titulo: "Explorar",
    descripcion: "Checklist pre-carga con apoyo guiado.",
    actividad:
      "Recorre un checklist NCh3241 de preparación de área (EPP, ventilación, señalización, cilindros) y marca tres ítems críticos. Formativo, sin nota.",
  },
  {
    id: "desafiar",
    titulo: "Desafiar",
    descripcion: "Elige secuencia de carga segura.",
    actividad:
      "Ante un protocolo incompleto en sala fría, decide el orden: EPP → vacío → conexión → carga → registro. Justifica sin calificación.",
  },
  {
    id: "investigar",
    titulo: "Investigar",
    descripcion: "Errores de venteo / registro sin andamiaje.",
    actividad:
      "Identifica dos errores críticos (venteo a atmósfera, presión sin registrar) y propone corrección. Autonomía alta.",
  },
  {
    id: "transferir",
    titulo: "Transferir",
    descripcion: "Otra tipología de equipo.",
    actividad:
      "Aplica el mismo método de preparación/carga a un split de oficina distinta a la sala fría Los Lagos. No avanza la barra obligatoria.",
  },
];

export const ESTACIONES_M5: EstacionM5[] = [
  {
    id: "m5-ctx",
    orden: 0,
    slug: "contextualizacion",
    titulo: "Contextualización — Comprendo la situación · Llegada a supermercado Los Lagos",
    horas: 3.4,
    fase: "contextualizacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "ANALIZAR",
    preguntaPedagogica:
      "¿Qué antecedentes del briefing orientan la preparación y la carga segura en sala fría?",
    escenario:
      "Llegas a un supermercado en la Región de Los Lagos. El jefe de mantención solicita la puesta en marcha acotada de la sala fría de venta: preparación de área, equipos de carga y transporte de fluido, secuencia de carga según NCh3241 y registro de parámetros. AE 5.3 completa (arranque multi-sistema) queda fuera; solo verificación mínima post-carga. Tu rol: técnico de carga y puesta en marcha.",
    interaccion: "briefing",
    evidenciaMinima: "Registrar al menos 2 antecedentes iniciales del caso.",
    mediaUrl: "/images/climatizacion/m5-carga-fluidos.png",
    mediaAlt: "Estación de carga de fluido refrigerante en supermercado",
    mediaCaption: "Observa área, EPP y equipos de carga antes de iniciar el protocolo.",
    opciones: [
      {
        id: "ctx-ot",
        label: "OT de carga: fluido, masa objetivo y zona de trabajo (sala fría)",
        correcta: true,
        detalle: "Marco AE 5.1–5.2: preparación y carga con trazabilidad.",
        familia: "registro",
      },
      {
        id: "ctx-nch",
        label: "Referencia NCh3241 de buenas prácticas (seguridad y medio ambiente)",
        correcta: true,
        familia: "ambiente",
      },
      {
        id: "ctx-epp",
        label: "Condiciones de obra: ventilación, EPP y acceso a sala fría",
        correcta: true,
        familia: "seguridad",
      },
      {
        id: "ctx-falso",
        label: "Arrancar todos los sistemas del local sin protocolo de carga",
        correcta: false,
        detalle: "AE 5.3 completa excluida del 30 %; primero preparación y carga.",
      },
    ],
    agente: [
      {
        nivel: 1,
        pregunta:
          "¿Qué datos del briefing son requisitos de preparación y cuáles de carga?",
      },
      {
        nivel: 2,
        pregunta:
          "¿Qué contrastarías primero: OT de fluido o condiciones de ventilación/EPP?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Comprendo la situación — registrar antecedentes",
    ctaSiguiente: "Ir a preparación de área y EPP",
    bloqueadoHastaCompletarAnterior: false,
  },
  {
    id: "m5-e1",
    orden: 1,
    slug: "prep-area-epp",
    titulo: "Estación 1 — Preparación de área y EPP",
    horas: 12,
    fase: "estacion_ae",
    aeCodigos: ["AE 5.1"],
    ceCodigos: [],
    habilidad: "APLICAR",
    preguntaPedagogica:
      "¿Qué preparación de espacio físico y EPP cumple NCh3241 antes de transportar/cargar?",
    escenario:
      "Debes preparar el espacio físico junto a la sala fría: delimitar zona, verificar ventilación, disponer EPP (guantes, gafas, calzado), señalizar y asegurar que no haya fuentes de ignición ni tránsito de público. AE 5.1.",
    interaccion: "hotspots",
    evidenciaMinima:
      "Completar preparación segura (≥3 ítems correctos; excluir omitir EPP).",
    errorUtil:
      "Cargar sin delimitar área ni EPP en pasillo de público → riesgo de seguridad y fuga.",
    mediaUrl: "/images/climatizacion/m5-hotspots-base.png",
    mediaAlt: "Cámara fría: marca zona acotada, EPP y bloqueo antes de cargar",
    mediaCaption: "Haz clic en la cinta de acotamiento, el EPP y el bloqueo del equipo.",
    hotspots: [
      { id: "hs-zona", optionId: "prep-zona", label: "Zona acotada", x: 50, y: 62, r: 8 },
      { id: "hs-epp", optionId: "prep-epp", label: "EPP frío", x: 82, y: 48, r: 8 },
      { id: "hs-vent", optionId: "prep-vent", label: "Acceso / ventilación área", x: 48, y: 35, r: 6 },
      { id: "hs-ext", optionId: "prep-ext", label: "Bloqueo / control seguro", x: 18, y: 42, r: 7 },
      { id: "hs-malo", optionId: "prep-malo", label: "Entrar sin preparación (error)", x: 48, y: 78, r: 5 },
    ],
    opciones: [
      {
        id: "prep-zona",
        label: "Delimitar y señalizar zona de carga (sin tránsito de clientes)",
        correcta: true,
        familia: "preparacion",
      },
      {
        id: "prep-epp",
        label: "Verificar EPP completo (ojos, manos, calzado) antes de manipular fluido",
        correcta: true,
        familia: "seguridad",
      },
      {
        id: "prep-vent",
        label: "Comprobar ventilación / extracción en área de trabajo",
        correcta: true,
        familia: "ambiente",
      },
      {
        id: "prep-ext",
        label: "Ubicar extintor / kit de contención según procedimiento de obra",
        correcta: true,
        familia: "seguridad",
      },
      {
        id: "prep-malo",
        label: "Iniciar carga en pasillo abierto sin EPP ni señalización",
        correcta: false,
        detalle: "Secuencia insegura: se detiene de inmediato.",
      },
    ],
    agente: [
      {
        nivel: 2,
        pregunta: "¿Qué verificación haces antes de abrir un cilindro de refrigerante?",
      },
      {
        nivel: 4,
        pregunta:
          "Si hay público cerca de la sala fría, ¿qué registras antes de continuar?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar preparación de área y EPP",
    ctaSiguiente: "Ir a equipos de carga y transporte",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m5-e2",
    orden: 2,
    slug: "equipos-carga-transporte",
    titulo: "Estación 2 — Equipos de carga y transporte",
    horas: 12,
    fase: "estacion_ae",
    aeCodigos: ["AE 5.1"],
    ceCodigos: [],
    habilidad: "RELACIONAR",
    preguntaPedagogica:
      "¿Qué equipamiento de transporte y carga es el adecuado para el fluido y la OT?",
    escenario:
      "Seleccionas cilindros aprobados, mangueras, balanza, manifold y equipo de vacío compatibles con el fluido de la OT. El transporte desde bodega a sala fría debe ser seguro (posición, fijación, sin golpes). AE 5.1.",
    interaccion: "equipos_carga",
    evidenciaMinima:
      "Seleccionar ≥2 equipos/condiciones correctas; excluir cilindro no aprobado.",
    errorUtil:
      "Usar cilindro dañado o no identificado → riesgo de fuga y mezcla de fluidos.",
    opciones: [
      {
        id: "eq-cil",
        label: "Cilindro aprobado, etiquetado y en buen estado (fluido = OT)",
        correcta: true,
        familia: "equipo",
      },
      {
        id: "eq-bal",
        label: "Balanza / dosificación para control de masa de carga",
        correcta: true,
        familia: "equipo",
      },
      {
        id: "eq-vac",
        label: "Bomba de vacío y manifold compatibles con el circuito",
        correcta: true,
        familia: "equipo",
      },
      {
        id: "eq-trans",
        label: "Transporte vertical seguro del cilindro (tapa / fijación)",
        correcta: true,
        familia: "preparacion",
      },
      {
        id: "eq-malo",
        label: "Cilindro sin etiqueta / abollado «porque alcanza»",
        correcta: false,
        familia: "equipo",
      },
    ],
    agente: [
      {
        nivel: 3,
        pregunta:
          "¿Cómo verificas que el cilindro corresponde al fluido indicado en la OT?",
      },
      {
        nivel: 5,
        pregunta:
          "Si la balanza no calibra, ¿cargas «a ojo» o detienes y registras?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Confirmar equipos de carga y transporte",
    ctaSiguiente: "Ir a secuencia de carga de fluido",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m5-e3",
    orden: 3,
    slug: "secuencia-carga-fluido",
    titulo: "Estación 3 — Secuencia de carga de fluido",
    horas: 18,
    fase: "estacion_ae",
    aeCodigos: ["AE 5.2"],
    ceCodigos: [],
    habilidad: "EJECUTAR",
    preguntaPedagogica:
      "¿Qué secuencia de carga de fluido es segura y conforme a NCh3241?",
    escenario:
      "Simulación de carga en sala fría: vacío previo, conexión sin fugas, carga por masa/presión según procedimiento, sin venteo a la atmósfera, monitoreo continuo. AE 5.2. Arranque multi-sistema completo (AE 5.3) no se exige; solo dejar listo para verificación mínima.",
    interaccion: "secuencia_carga",
    evidenciaMinima:
      "Completar secuencia segura (≥3 pasos correctos; sin venteo).",
    errorUtil:
      "Venteo de refrigerante a la atmósfera «para purgar» → infracción ambiental y NCh3241.",
    mediaUrl: "/images/climatizacion/m5-carga-fluidos.png",
    mediaAlt: "Secuencia de carga de fluido refrigerante",
    mediaCaption: "Sigue la secuencia de carga y registro según NCh3241.",
    mediaDemoGif: "/images/climatizacion/m5-carga-demo.gif",
    mediaDemoMp4: "/images/climatizacion/m5-carga-demo.mp4",
    mediaNarratedMp4: "/images/climatizacion/m5-carga-narrado.mp4",
    mediaNarratedTitle: "Video con narración — carga de fluidos (≈ 50 s)",
    opciones: [
      {
        id: "car-vac",
        label: "Realizar vacío / verificación de hermeticidad previa a la carga",
        correcta: true,
        familia: "carga",
      },
      {
        id: "car-con",
        label: "Conectar mangueras/manifold sin fugas y con EPP",
        correcta: true,
        familia: "seguridad",
      },
      {
        id: "car-masa",
        label: "Cargar según masa/procedimiento de fábrica (sin sobrellenar)",
        correcta: true,
        familia: "carga",
      },
      {
        id: "car-mon",
        label: "Monitorear presión/temperatura durante la carga",
        correcta: true,
        familia: "registro",
      },
      {
        id: "car-venteo",
        label: "Purgar venteando refrigerante al aire libre",
        correcta: false,
        detalle: "Prohibido: cuidado del medio ambiente NCh3241.",
        familia: "ambiente",
      },
    ],
    agente: [
      {
        nivel: 3,
        pregunta: "¿Qué haces si detectas una fuga al conectar el manifold?",
      },
      {
        nivel: 5,
        pregunta:
          "Si la masa objetivo no se alcanza y la presión sube de más, ¿qué decides?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar secuencia de carga",
    ctaSiguiente: "Ir a registro de parámetros",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m5-e4",
    orden: 4,
    slug: "registro-parametros",
    titulo: "Estación 4 — Registro de parámetros / ambiente",
    horas: 12,
    fase: "estacion_ae",
    aeCodigos: ["AE 5.2"],
    ceCodigos: [],
    habilidad: "VERIFICAR / REGISTRAR",
    preguntaPedagogica:
      "¿Qué parámetros y evidencias ambientales cierran la carga de forma trazable?",
    escenario:
      "Post-carga: registras presiones de alta/baja, masa cargada, temperatura ambiente, ausencia de fuga audible/visual y verificación mínima de arranque acotado (puente AE 5.3, sin multi-sistema). Cierras bitácora con firmas.",
    interaccion: "registro_parametros",
    evidenciaMinima:
      "Registrar ≥2 parámetros post-carga y cierre de bitácora.",
    errorUtil:
      "Cerrar OT sin lecturas de presión ni masa → error crítico de trazabilidad.",
    opciones: [
      {
        id: "reg-p",
        label: "Lecturas de presión (alta/baja) dentro de rango de procedimiento",
        correcta: true,
        familia: "registro",
      },
      {
        id: "reg-masa",
        label: "Masa de fluido cargada documentada (kg) vs OT",
        correcta: true,
        familia: "registro",
      },
      {
        id: "reg-fuga",
        label: "Verificación de ausencia de fuga + cuidado ambiental (sin venteo)",
        correcta: true,
        familia: "ambiente",
      },
      {
        id: "reg-min",
        label:
          "Verificación mínima post-carga (arranque acotado; no multi-sistema AE 5.3)",
        correcta: true,
        familia: "carga",
      },
      {
        id: "reg-omitir",
        label: "Dar por cerrado sin lecturas ni firma de supervisor",
        correcta: false,
      },
    ],
    agente: [
      {
        nivel: 4,
        pregunta: "¿Qué magnitud registrarías primero en la bitácora post-carga?",
      },
      {
        nivel: 6,
        pregunta:
          "Si la presión está fuera de rango, ¿cierras o dejas pendiente documentado?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar registro de parámetros",
    ctaSiguiente: "Abrir Situación Integradora",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m5-sit",
    orden: 5,
    slug: "situacion-integradora",
    titulo: "Situación Integradora — Protocolo de carga NCh3241",
    horas: 11,
    fase: "situacion_integradora",
    aeCodigos: ["AE 5.1", "AE 5.2"],
    ceCodigos: [],
    habilidad: "INTEGRAR / TRANSFERIR",
    preguntaPedagogica:
      "Con preparación, equipos, secuencia y registros, ¿qué protocolo integral de carga elaboras?",
    escenario:
      "No se introduce AE nuevo. Combina preparación/EPP + equipos + secuencia de carga + registro. Tú eliges el orden de consulta de fuentes. Control progresivo (Gran Desafío). AE 5.3 solo como verificación mínima ya registrada.",
    interaccion: "gran_desafio",
    evidenciaMinima:
      "Integrar ≥4 fuentes y elaborar protocolo de carga con cierre trazable.",
    errorUtil:
      "Cerrar protocolo sin trazabilidad de masa/presiones → carga no auditable.",
    opciones: [
      {
        id: "gd-prep",
        label: "Fuente: preparación de área / EPP / ventilación",
        correcta: true,
      },
      {
        id: "gd-eq",
        label: "Fuente: cilindro aprobado + balanza + vacío/manifold",
        correcta: true,
      },
      {
        id: "gd-seq",
        label: "Fuente: secuencia de carga sin venteo (NCh3241)",
        correcta: true,
      },
      {
        id: "gd-reg",
        label: "Fuente: lecturas de presión/masa + bitácora firmada",
        correcta: true,
      },
      {
        id: "gd-conc",
        label:
          "Conclusión: protocolo de carga conforme; verificación mínima post-carga; sin AE 5.3 multi-sistema",
        correcta: true,
      },
    ],
    agente: [
      {
        nivel: 5,
        pregunta: "¿Qué fuente consultarías primero para armar el protocolo y por qué?",
      },
      {
        nivel: 6,
        pregunta:
          "Si masa y presión se contradicen, ¿cuál privilegias para el cierre?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Entregar protocolo integral de carga",
    ctaSiguiente: "Pasar a Evaluación Final (2 h)",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m5-eval",
    orden: 6,
    slug: "evaluacion-final",
    titulo: "Evaluación Final (2 h) — Protocolo de carga (sin Tutor)",
    horas: 2,
    fase: "evaluacion_final",
    aeCodigos: ["AE 5.1", "AE 5.2"],
    ceCodigos: [],
    habilidad: "EVALUAR",
    preguntaPedagogica:
      "Elabora y fundamenta un protocolo de carga + lecturas de presión (formato distinto a OT M7 / diagnóstico M6).",
    escenario:
      "Bloque A: ítems sobre preparación, secuencia y ambiente (muestra). Bloque B: interpretar OT sala fría → decidir protocolo de carga → fundamentar con lecturas de presión/masa. Sin pistas. Tutor deshabilitado (nivel 0).",
    interaccion: "evaluacion_carga",
    evidenciaMinima: "Completar Bloque A (muestra) y Bloque B (3 acciones).",
    opciones: [
      {
        id: "ev-a1",
        label: "A1 — Preparación: EPP + zona delimitada + ventilación antes de carga",
        correcta: true,
      },
      {
        id: "ev-a2",
        label: "A2 — Secuencia: vacío/conexión → carga por masa → sin venteo",
        correcta: true,
      },
      {
        id: "ev-a3",
        label: "A3 — Registro: presiones + kg cargados + firma en bitácora",
        correcta: true,
      },
      {
        id: "ev-b-interp",
        label: "B1 Interpretar: OT Los Lagos + fluido + condiciones de sala fría",
        correcta: true,
      },
      {
        id: "ev-b-decidir",
        label:
          "B2 Decidir: protocolo preparación→carga→registro (verificación mínima; sin AE 5.3 completa)",
        correcta: true,
      },
      {
        id: "ev-b-fund",
        label: "B3 Fundamentar: lecturas de presión/masa + cuidado ambiental NCh3241",
        correcta: true,
      },
    ],
    agente: [],
    permiteAgente: false,
    esEvaluacionFormal: true,
    ctaCompletar: "Enviar protocolo de evaluación (simulado)",
    ctaSiguiente: "Ver síntesis visual NCh3241",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m5-cierre",
    orden: 7,
    slug: "retroalimentacion-cierre",
    titulo: "Retroalimentación y cierre — Síntesis visual NCh3241",
    horas: 2,
    fase: "retroalimentacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "RETROALIMENTAR",
    preguntaPedagogica:
      "¿Qué buenas prácticas NCh3241 sintetizas del módulo? (distinto a mapa de fallas M6, errores críticos M7 y ciclo custodia M8)",
    escenario:
      "Síntesis visual de buenas prácticas NCh3241 aplicadas a preparación, carga y registro en sala fría Los Lagos. Recomendaciones de Práctica Libre. No es otra evaluación.",
    interaccion: "sintesis_nch3241",
    evidenciaMinima:
      "Marcar ≥1 buena práctica NCh3241 y 1 recomendación de Práctica Libre.",
    opciones: [
      {
        id: "sin-prep",
        label: "Buena práctica: preparar área/EPP antes de manipular fluido",
        correcta: true,
        familia: "preparacion",
      },
      {
        id: "sin-carga",
        label: "Buena práctica: secuencia de carga sin venteo a la atmósfera",
        correcta: true,
        familia: "carga",
      },
      {
        id: "sin-reg",
        label: "Buena práctica: registrar presiones/masa y firmar bitácora",
        correcta: true,
        familia: "registro",
      },
      {
        id: "sin-pl",
        label:
          "Practicar drills de checklist pre-carga en Práctica Libre (Desafiar / Investigar)",
        correcta: true,
        familia: "ambiente",
      },
    ],
    agente: [
      {
        nivel: 1,
        pregunta:
          "¿Qué buena práctica NCh3241 quieres reforzar primero en Práctica Libre?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar módulo y guardar reflexión",
    ctaSiguiente: "Volver al curso",
    bloqueadoHastaCompletarAnterior: true,
  },
];

export function getEstacionBySlug(slug: string): EstacionM5 | undefined {
  return ESTACIONES_M5.find((e) => e.slug === slug);
}

export function getEstacionById(id: string): EstacionM5 | undefined {
  return ESTACIONES_M5.find((e) => e.id === id);
}

export function getEstacionByOrden(orden: number): EstacionM5 | undefined {
  return ESTACIONES_M5.find((e) => e.orden === orden);
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
  currentId: ESTACIONES_M5[0].id,
  evalSubmitted: false,
  practicaLibreVisits: [],
};

export function stationIsUnlocked(
  estacion: EstacionM5,
  completedIds: string[],
): boolean {
  if (!estacion.bloqueadoHastaCompletarAnterior) return true;
  if (estacion.orden === 0) return true;
  const prev = ESTACIONES_M5.find((e) => e.orden === estacion.orden - 1);
  if (!prev) return true;
  return completedIds.includes(prev.id);
}

export function canCompleteStation(
  estacion: EstacionM5,
  selected: string[],
): boolean {
  const correctIds = estacion.opciones.filter((o) => o.correcta).map((o) => o.id);
  const selectedCorrect = selected.filter((id) => correctIds.includes(id));
  const selectedIncorrect = selected.filter(
    (id) => !correctIds.includes(id) && estacion.opciones.some((o) => o.id === id),
  );

  if (estacion.interaccion === "evaluacion_carga") {
    return selectedCorrect.length >= 5 && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "gran_desafio") {
    return selectedCorrect.length >= 4;
  }
  if (estacion.interaccion === "sintesis_nch3241") {
    return selected.length >= 1;
  }
  if (estacion.interaccion === "secuencia_carga" || estacion.interaccion === "prep_area_epp") {
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
