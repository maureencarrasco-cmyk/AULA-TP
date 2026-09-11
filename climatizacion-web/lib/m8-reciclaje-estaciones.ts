/**
 * Módulo 8 — Reciclaje y almacenamiento de refrigerantes
 * Contenido de estaciones derivado de Prompt Maestro / programa MINEDUC.
 * AE 8.1 recupera (NCh3241) · AE 8.3 almacena (NCh3241/2011).
 * AE 8.2 reciclaje profundo = concepto/puente only (no protocolo de planta).
 * Caso demo = centro comercial RM — retiro controlado.
 * No inventa AE MINEDUC. Etapas ciclo Aula TP: Analizar → Comprender → Relacionar → Aplicar → Verificar → Retroalimentar. Distinto de M6 Ñuñoa y M7 O’Higgins.
 */

export type FaseRuta =
  | "contextualizacion"
  | "estacion_ae"
  | "situacion_integradora"
  | "evaluacion_final"
  | "retroalimentacion";

export type TipoInteraccion =
  | "briefing"
  | "epp_nch3241"
  | "secuencia_recuperacion"
  | "contenedores_etiquetado"
  | "custodia_registro"
  | "gran_desafio"
  | "evaluacion_protocolo"
  | "hotspots"
  | "cierre_narrativo";

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
  familia?:
    | "preparacion"
    | "recuperacion"
    | "almacenamiento"
    | "seguridad"
    | "registro"
    | "ambiental";
};

export type EstacionM8 = {
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

export const M8_META = {
  moduloNumero: 8,
  nombre: "Reciclaje y almacenamiento de refrigerantes",
  especialidad: "Refrigeración y Climatización",
  oa: "OA 9",
  oaTexto:
    "Recuperar, reciclar y almacenar refrigerantes de los sistemas de refrigeración, aplicando protocolos de reciclaje y almacenamiento de fluidos según NCh3241/2011.",
  horasAulaTp: 45.6,
  horasDesarrollo: 43.6,
  horasEvaluacionFinal: 2,
  casoDemo: {
    titulo: "Centro comercial RM — retiro controlado",
    resumen:
      "Retiro controlado de refrigerante en equipos de climatización de un centro comercial en la Región Metropolitana: preparación NCh3241, secuencia de recuperación, contenedores aprobados, etiquetado, custodia y registro.",
    actor: "Técnico ambiental / refrigerantes + supervisor de seguridad",
    equipo: "Unidades rooftop / chillers de área común (retiro programado)",
    hallazgoTipico: "Carga residual + cilindro sin etiqueta / sin hoja de custodia",
  },
  portalDocenteHref: "/curso/climatizacion",
  heroMediaUrl: "/images/climatizacion/m8-recuperacion-epp.png",
  heroMediaAlt: "Recuperación de refrigerante con EPP y contenedores",
  storageKey: "aula-tp-m8-reciclaje-progress-v1",
} as const;

/** Formato es-CL para horas decimales (45,6 · 2,6). */
export function formatHorasEs(h: number): string {
  return String(h).replace(".", ",");
}

export const PRACTICA_LIBRE_M8: PracticaLibreFase[] = [
  {
    id: "explorar",
    titulo: "Explorar",
    descripcion: "Conexión de equipo de recuperación con apoyo guiado.",
    actividad:
      "Recorre el esquema de mangueras, válvulas y cilindro de recuperación y marca tres puntos de verificación NCh3241 (EPP, hermeticidad de conexiones, capacidad del contenedor). Formativo, sin nota.",
  },
  {
    id: "desafiar",
    titulo: "Desafiar",
    descripcion: "Decide secuencia de retiro controlado.",
    actividad:
      "Ante un rooftop con carga residual en centro comercial RM, decide el orden: aislar zona, EPP, conectar recuperación, transferir a cilindro aprobado o detener por riesgo. Justifica sin calificación.",
  },
  {
    id: "investigar",
    titulo: "Investigar",
    descripcion: "Errores de etiquetado y custodia sin andamiaje.",
    actividad:
      "Identifica dos fallas en un cilindro mal etiquetado (tipo de fluido omitido, sin hoja de custodia) y propone corrección según NCh3241/2011. Autonomía alta.",
  },
  {
    id: "transferir",
    titulo: "Transferir",
    descripcion: "Otra tipología de equipo.",
    actividad:
      "Aplica el mismo ciclo recuperar→etiquetar→custodiar a un rack de cámara fría distinta a los rooftop del mall RM. No avanza la barra obligatoria. AE 8.2 solo como puente conceptual (sin planta de reciclaje).",
  },
];

export const ESTACIONES_M8: EstacionM8[] = [
  {
    id: "m8-ctx",
    orden: 0,
    slug: "contextualizacion",
    titulo: "Contextualización — Comprendo la situación · Retiro en centro comercial RM",
    horas: 2.6,
    fase: "contextualizacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "ANALIZAR",
    preguntaPedagogica:
      "¿Qué antecedentes del briefing orientan un retiro controlado de refrigerante sin ventear a la atmósfera?",
    escenario:
      "Llegas a un centro comercial en la Región Metropolitana. El supervisor de seguridad entrega la OT de retiro programado de dos rooftop de área común: ficha de refrigerante (R-410A), bitácora de carga residual estimada, plano de acceso a terraza y cilindros disponibles en bodega. Tu rol: técnico ambiental / refrigerantes. Distinto de diagnóstico Ñuñoa (M6) y mantención O’Higgins (M7).",
    interaccion: "briefing",
    evidenciaMinima: "Registrar al menos 2 antecedentes iniciales del caso.",
    mediaUrl: "/images/climatizacion/m8-recuperacion-epp.png",
    mediaAlt: "Recuperación de refrigerante con EPP en centro comercial",
    mediaCaption: "Revisa EPP, equipos y contenedores antes del retiro controlado.",
    opciones: [
      {
        id: "ctx-ot",
        label: "OT de retiro programado + ficha de refrigerante (R-410A)",
        correcta: true,
        detalle: "Marco de AE 8.1: recuperación con identidad del fluido.",
        familia: "recuperacion",
      },
      {
        id: "ctx-carga",
        label: "Bitácora: carga residual estimada en rooftop terraza",
        correcta: true,
        detalle: "Define capacidad de cilindro y tiempo de transferencia.",
        familia: "preparacion",
      },
      {
        id: "ctx-acceso",
        label: "Plano de acceso a terraza + zona de acopio temporal",
        correcta: true,
        familia: "seguridad",
      },
      {
        id: "ctx-falso",
        label: "Ventear refrigerante a la atmósfera «para acelerar el retiro»",
        correcta: false,
        detalle: "Prohibido: riesgo ambiental y fuera de NCh3241.",
        familia: "ambiental",
      },
    ],
    agente: [
      {
        nivel: 1,
        pregunta:
          "¿Qué datos del briefing son requisitos de seguridad y cuáles definen el fluido a recuperar?",
      },
      {
        nivel: 2,
        pregunta:
          "¿Qué contrastarías primero: ficha del refrigerante o capacidad de los cilindros en bodega?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Comprendo la situación — registrar antecedentes",
    ctaSiguiente: "Ir a preparación y EPP / NCh3241",
    bloqueadoHastaCompletarAnterior: false,
  },
  {
    id: "m8-e1",
    orden: 1,
    slug: "preparacion-epp-nch3241",
    titulo: "Estación 1 — Preparación y EPP / NCh3241",
    horas: 8,
    fase: "estacion_ae",
    aeCodigos: ["AE 8.1"],
    ceCodigos: [],
    habilidad: "PREPARAR",
    preguntaPedagogica:
      "¿Qué preparación y EPP son coherentes con NCh3241 antes de conectar el equipo de recuperación?",
    escenario:
      "En terraza del mall: delimitas zona de trabajo, verificas EPP (guantes, gafas, ropa adecuada), ventilación, equipo de recuperación calibrado y mangueras/válvulas compatibles con R-410A. Sin iniciar transferencia aún. AE 8.2 (planta de reciclaje) solo se menciona como puente: aquí no se opera planta.",
    interaccion: "hotspots",
    evidenciaMinima:
      "Completar preparación segura (≥2 ítems correctos; excluir venteo / sin EPP).",
    errorUtil:
      "Conectar sin EPP ni verificación de compatibilidad de mangueras → riesgo personal y de fuga.",
    mediaUrl: "/images/climatizacion/m8-hotspots-epp-base.png",
    mediaAlt: "EPP y equipo de recuperación: marca lo requerido antes de conectar",
    mediaCaption: "Haz clic en EPP, recuperadora y cilindro aprobado. La lista abajo también vale.",
    mediaDemoGif: "/images/climatizacion/m8-recuperacion-demo.gif",
    mediaDemoMp4: "/images/climatizacion/m8-recuperacion-demo.mp4",
    mediaNarratedMp4: "/images/climatizacion/m8-reciclaje-narrado.mp4",
    mediaNarratedTitle: "Video con narración — recuperación y EPP (≈ 50 s)",
    hotspots: [
      { id: "hs-epp", optionId: "prep-epp", label: "EPP (guantes/gafas)", x: 18, y: 42, r: 8 },
      { id: "hs-gafas", optionId: "prep-epp", label: "Gafas de seguridad", x: 42, y: 22, r: 5 },
      { id: "hs-equipo", optionId: "prep-equipo", label: "Equipo de recuperación", x: 68, y: 28, r: 7 },
      { id: "hs-manifold", optionId: "prep-equipo", label: "Manifold / mangueras", x: 62, y: 72, r: 7 },
      { id: "hs-cil", optionId: "prep-cilindro", label: "Cilindro aprobado", x: 86, y: 48, r: 7 },
    ],
    opciones: [
      {
        id: "prep-epp",
        label: "EPP completo + zona delimitada / señalizada en terraza",
        correcta: true,
        familia: "seguridad",
      },
      {
        id: "prep-equipo",
        label:
          "Equipo de recuperación y mangueras compatibles con R-410A (NCh3241)",
        correcta: true,
        familia: "preparacion",
      },
      {
        id: "prep-cilindro",
        label:
          "Verificar cilindro aprobado vacío/parcial y tara antes de conectar",
        correcta: true,
        familia: "almacenamiento",
      },
      {
        id: "prep-puente",
        label:
          "Recordar puente AE 8.2: reciclaje profundo ocurre en planta autorizada, no en terraza",
        correcta: true,
        detalle: "Concepto/puente solamente; no protocolo de planta en este 30 %.",
        familia: "ambiental",
      },
      {
        id: "prep-peligro",
        label: "Omitir EPP y «sacar rápido» abriendo válvula a la atmósfera",
        correcta: false,
        detalle: "Inseguro y ambientalmente prohibido.",
      },
    ],
    agente: [
      {
        nivel: 2,
        pregunta:
          "¿Qué verificación haces al cilindro antes de conectar mangueras?",
      },
      {
        nivel: 4,
        pregunta:
          "Si el equipo de recuperación no es compatible con R-410A, ¿qué registras y a quién escalas?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar preparación y EPP",
    ctaSiguiente: "Ir a secuencia de recuperación",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m8-e2",
    orden: 2,
    slug: "secuencia-recuperacion",
    titulo: "Estación 2 — Secuencia de recuperación",
    horas: 12,
    fase: "estacion_ae",
    aeCodigos: ["AE 8.1"],
    ceCodigos: [],
    habilidad: "EJECUTAR",
    preguntaPedagogica:
      "¿Qué secuencia de recuperación evita fugas y deja evidencia trazable (NCh3241)?",
    escenario:
      "Simulación de conexión al rooftop: aislar circuito según procedimiento, conectar equipo de recuperación, transferir carga residual a cilindro aprobado, monitorear presión/peso y cerrar válvulas. Sin venteo. Sin operar planta de reciclaje (AE 8.2 puente).",
    interaccion: "secuencia_recuperacion",
    evidenciaMinima:
      "Completar secuencia (≥3 pasos correctos; sin venteo ni saltos inseguros).",
    errorUtil:
      "Abrir circuito a la atmósfera «para vaciar más rápido» → fuga y incumplimiento NCh3241.",
    opciones: [
      {
        id: "rec-aislar",
        label: "Aislar / preparar circuito del rooftop según procedimiento de retiro",
        correcta: true,
        familia: "recuperacion",
      },
      {
        id: "rec-conectar",
        label: "Conectar equipo de recuperación y verificar hermeticidad de uniones",
        correcta: true,
        familia: "recuperacion",
      },
      {
        id: "rec-transferir",
        label: "Transferir a cilindro aprobado monitoreando peso / presión",
        correcta: true,
        familia: "recuperacion",
      },
      {
        id: "rec-cerrar",
        label: "Cerrar válvulas, desconectar con control de residuales y registrar kg recuperados",
        correcta: true,
        familia: "registro",
      },
      {
        id: "rec-venteo",
        label: "Ventear residual a la atmósfera al terminar la transferencia",
        correcta: false,
        detalle: "Prohibido en campo: se detiene de inmediato por seguridad.",
        familia: "ambiental",
      },
    ],
    agente: [
      {
        nivel: 3,
        pregunta: "¿Qué señales te indican que la transferencia debe detenerse?",
      },
      {
        nivel: 5,
        pregunta:
          "Si el peso del cilindro se acerca al 80 % de capacidad, ¿qué haces antes de seguir?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Validar secuencia de recuperación",
    ctaSiguiente: "Continuar a contenedores y etiquetado",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m8-e3",
    orden: 3,
    slug: "contenedores-etiquetado",
    titulo: "Estación 3 — Contenedores y etiquetado",
    horas: 10,
    fase: "estacion_ae",
    aeCodigos: ["AE 8.3"],
    ceCodigos: [],
    habilidad: "APLICAR / VERIFICAR",
    preguntaPedagogica:
      "¿Qué contenedores y etiquetas cumplen NCh3241/2011 para almacenar el refrigerante recuperado?",
    escenario:
      "Tras la recuperación: seleccionas cilindros aprobados, no mezclas fluidos, etiquetas con tipo de refrigerante, masa, fecha, origen (rooftop / OT) y estado (recuperado / pendiente de destino). Bodega temporal del mall ≠ planta de reciclaje.",
    interaccion: "hotspots",
    evidenciaMinima:
      "Seleccionar ≥2 prácticas correctas de contenedor/etiqueta; excluir mezcla o sin etiqueta.",
    errorUtil:
      "Mezclar R-410A con otro fluido en el mismo cilindro → contaminar carga y violar protocolo.",
    mediaUrl: "/images/climatizacion/m8-hotspots-cilindro-base.png",
    mediaAlt: "Cilindros de recuperación: marca etiqueta, contenedor aprobado y separación de fluidos",
    mediaCaption: "Haz clic en el cilindro, la etiqueta y elementos de seguridad. Evita dejar sin etiqueta.",
    hotspots: [
      { id: "hs-aprob", optionId: "con-aprobado", label: "Cilindro aprobado", x: 32, y: 55, r: 8 },
      { id: "hs-etiq", optionId: "con-etiqueta", label: "Zona de etiqueta", x: 32, y: 38, r: 6 },
      { id: "hs-sep", optionId: "con-no-mezcla", label: "Segundo cilindro (no mezclar)", x: 70, y: 55, r: 8 },
      { id: "hs-sin", optionId: "con-sin-etiqueta", label: "Sin etiqueta (error)", x: 70, y: 38, r: 6 },
    ],
    opciones: [
      {
        id: "con-aprobado",
        label: "Usar solo cilindros / contenedores aprobados para el refrigerante",
        correcta: true,
        familia: "almacenamiento",
      },
      {
        id: "con-etiqueta",
        label:
          "Etiquetar: tipo de fluido, kg, fecha, OT/origen y estado (recuperado)",
        correcta: true,
        familia: "registro",
      },
      {
        id: "con-no-mezcla",
        label: "No mezclar refrigerantes distintos en el mismo contenedor",
        correcta: true,
        familia: "ambiental",
      },
      {
        id: "con-sin-etiqueta",
        label: "Guardar cilindro sin etiqueta «porque va a planta mañana»",
        correcta: false,
        detalle: "Sin etiqueta no hay trazabilidad NCh3241, aunque el destino sea planta.",
        familia: "almacenamiento",
      },
    ],
    agente: [
      {
        nivel: 4,
        pregunta:
          "¿Qué dato de la etiqueta permite trazar el refrigerante hasta la OT del mall?",
      },
      {
        nivel: 5,
        pregunta:
          "Si falta tara del cilindro, ¿qué riesgo introduces al registrar kg netos?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Guardar contenedores y etiquetado",
    ctaSiguiente: "Ir a custodia y registro",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m8-e4",
    orden: 4,
    slug: "custodia-registro",
    titulo: "Estación 4 — Custodia y registro",
    horas: 6,
    fase: "estacion_ae",
    aeCodigos: ["AE 8.3"],
    ceCodigos: [],
    habilidad: "REGISTRAR / CUSTODIAR",
    preguntaPedagogica:
      "¿Qué evidencias demuestran custodia segura del refrigerante hasta su destino autorizado?",
    escenario:
      "Acopio temporal en bodega del centro comercial: ubicación ventilada, cilindros asegurados, hoja de custodia / cadena de custodia, firmas de técnico y supervisor, y destino declarado (transporte a gestor / planta — AE 8.2 solo como puente, sin operar el reciclaje profundo aquí).",
    interaccion: "custodia_registro",
    evidenciaMinima: "Registrar ≥2 evidencias de custodia y cierre documental.",
    errorUtil:
      "Dejar cilindros sin hoja de custodia ni firmas → quiebre de trazabilidad ambiental.",
    opciones: [
      {
        id: "cus-bodega",
        label: "Acopio en zona ventilada / segura con cilindros asegurados",
        correcta: true,
        familia: "almacenamiento",
      },
      {
        id: "cus-hoja",
        label: "Hoja de custodia: kg, fluido, OT, fecha, origen y destino declarado",
        correcta: true,
        familia: "registro",
      },
      {
        id: "cus-firmas",
        label: "Firmas de técnico ambiental y supervisor de seguridad",
        correcta: true,
        familia: "registro",
      },
      {
        id: "cus-omitir",
        label: "Entregar cilindros sin registro «de palabra» al transportista",
        correcta: false,
      },
    ],
    agente: [
      {
        nivel: 4,
        pregunta: "¿Qué campo de la hoja de custodia no puede quedar en blanco?",
      },
      {
        nivel: 6,
        pregunta:
          "Si el destino es planta de reciclaje, ¿qué documentas aquí sin ejecutar AE 8.2 completo?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar custodia y registro",
    ctaSiguiente: "Abrir Situación Integradora",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m8-sit",
    orden: 5,
    slug: "situacion-integradora",
    titulo: "Situación Integradora — Retiro controlado integral",
    horas: 3,
    fase: "situacion_integradora",
    aeCodigos: ["AE 8.1", "AE 8.3"],
    ceCodigos: [],
    habilidad: "INTEGRAR / TRANSFERIR",
    preguntaPedagogica:
      "Con briefing, EPP, secuencia, contenedores y custodia, ¿qué paquete integral de retiro entregas?",
    escenario:
      "No se introduce AE nuevo. Combina preparación NCh3241 + secuencia de recuperación + contenedores/etiquetado + custodia. Tú eliges el orden de consulta de fuentes. Control progresivo (Gran Desafío). AE 8.2 permanece como puente hacia planta autorizada.",
    interaccion: "gran_desafio",
    evidenciaMinima:
      "Integrar ≥4 fuentes y elaborar paquete recuperar→almacenar con documentación.",
    errorUtil:
      "Cerrar paquete sin documentación recuperar→almacenar → incumplimiento NCh3241.",
    opciones: [
      {
        id: "gd-briefing",
        label: "Fuente: OT + ficha R-410A + carga residual estimada",
        correcta: true,
      },
      {
        id: "gd-prep",
        label: "Fuente: EPP / zona / equipo de recuperación verificado (NCh3241)",
        correcta: true,
      },
      {
        id: "gd-seq",
        label: "Fuente: secuencia de transferencia con kg recuperados",
        correcta: true,
      },
      {
        id: "gd-cont",
        label: "Fuente: cilindros aprobados etiquetados (sin mezcla)",
        correcta: true,
      },
      {
        id: "gd-conclusion",
        label:
          "Conclusión: retiro controlado documentado; custodia firmada; destino a gestor/planta (puente AE 8.2, sin operar planta aquí)",
        correcta: true,
      },
    ],
    agente: [
      {
        nivel: 5,
        pregunta: "¿Qué fuente consultarías primero para armar el paquete de retiro y por qué?",
      },
      {
        nivel: 6,
        pregunta:
          "Si kg recuperados y tara del cilindro no cuadran, ¿qué privilegias antes de firmar custodia?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Entregar paquete integral de retiro",
    ctaSiguiente: "Pasar a Evaluación Final (2 h)",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m8-eval",
    orden: 6,
    slug: "evaluacion-final",
    titulo: "Evaluación Final (2 h) — Protocolo + contenedores (sin Tutor)",
    horas: 2,
    fase: "evaluacion_final",
    aeCodigos: ["AE 8.1", "AE 8.3"],
    ceCodigos: [],
    habilidad: "EVALUAR",
    preguntaPedagogica:
      "Elabora un protocolo de recuperación/almacenamiento e identifica contenedores y riesgos (formato distinto a diagnóstico M6 y OT M7).",
    escenario:
      "Bloque A: ítems cerrados sobre secuencia NCh3241 y contenedores aprobados (muestra). Bloque B: interpretar → decidir protocolo de retiro → fundamentar con riesgos ambientales y etiquetado. Sin pistas. Tutor deshabilitado (nivel 0). ≠ diagnóstico M6 · ≠ OT M7.",
    interaccion: "evaluacion_protocolo",
    evidenciaMinima: "Completar Bloque A (muestra) y Bloque B (3 acciones de protocolo).",
    opciones: [
      {
        id: "ev-a1",
        label: "A1 — Preparación: EPP + equipo compatible + cilindro aprobado (NCh3241)",
        correcta: true,
      },
      {
        id: "ev-a2",
        label: "A2 — Recuperación: transferir sin venteo; registrar kg",
        correcta: true,
      },
      {
        id: "ev-a3",
        label: "A3 — Almacenamiento: etiqueta completa + no mezclar fluidos",
        correcta: true,
      },
      {
        id: "ev-b-interp",
        label: "B1 Interpretar: OT mall RM + fluido + carga residual + zona terraza",
        correcta: true,
      },
      {
        id: "ev-b-decidir",
        label:
          "B2 Decidir: protocolo recuperar→etiquetar→custodiar (destino gestor; sin planta AE 8.2 completa)",
        correcta: true,
      },
      {
        id: "ev-b-fund",
        label:
          "B3 Fundamentar: riesgos (fuga/venteo/mezcla) + hoja de custodia firmada",
        correcta: true,
      },
    ],
    agente: [],
    permiteAgente: false,
    esEvaluacionFormal: true,
    ctaCompletar: "Enviar protocolo de evaluación (simulado)",
    ctaSiguiente: "Ver cierre narrativo del ciclo",
    bloqueadoHastaCompletarAnterior: true,
  },
  {
    id: "m8-cierre",
    orden: 7,
    slug: "retroalimentacion-cierre",
    titulo: "Retroalimentación y cierre — Ciclo recuperar→almacenar",
    horas: 2,
    fase: "retroalimentacion",
    aeCodigos: [],
    ceCodigos: [],
    habilidad: "RETROALIMENTAR",
    preguntaPedagogica:
      "¿Cómo narras el ciclo recuperar→almacenar y qué refuerzas en Práctica Libre? (distinto a mapa de fallas M6 y errores críticos M7)",
    escenario:
      "Cierre narrativo de custodia del refrigerante: del briefing en el mall RM hasta la hoja de custodia firmada. Refuerza el puente hacia reciclaje en planta (AE 8.2) sin convertirlo en protocolo completo. Recomendaciones de Práctica Libre. No es otra evaluación.",
    interaccion: "cierre_narrativo",
    evidenciaMinima:
      "Marcar ≥1 hito del ciclo narrativo y 1 recomendación de Práctica Libre.",
    opciones: [
      {
        id: "nar-prep",
        label:
          "Hito: preparación EPP / NCh3241 en terraza → condición para recuperar sin fuga",
        correcta: true,
        familia: "preparacion",
      },
      {
        id: "nar-rec",
        label:
          "Hito: secuencia de recuperación → kg en cilindro aprobado (sin venteo)",
        correcta: true,
        familia: "recuperacion",
      },
      {
        id: "nar-alm",
        label:
          "Hito: etiquetado + custodia firmada → trazabilidad hasta destino autorizado",
        correcta: true,
        familia: "almacenamiento",
      },
      {
        id: "nar-pl",
        label:
          "Practicar drills de conexión/etiquetado en Práctica Libre (Desafiar / Investigar)",
        correcta: true,
        familia: "ambiental",
      },
    ],
    agente: [
      {
        nivel: 1,
        pregunta:
          "¿Qué hito del ciclo recuperar→almacenar quieres reforzar primero en Práctica Libre?",
      },
    ],
    permiteAgente: true,
    ctaCompletar: "Cerrar módulo y guardar reflexión",
    ctaSiguiente: "Volver al curso",
    bloqueadoHastaCompletarAnterior: true,
  },
];

export function getEstacionBySlug(slug: string): EstacionM8 | undefined {
  return ESTACIONES_M8.find((e) => e.slug === slug);
}

export function getEstacionById(id: string): EstacionM8 | undefined {
  return ESTACIONES_M8.find((e) => e.id === id);
}

export function getEstacionByOrden(orden: number): EstacionM8 | undefined {
  return ESTACIONES_M8.find((e) => e.orden === orden);
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
  currentId: ESTACIONES_M8[0].id,
  evalSubmitted: false,
  practicaLibreVisits: [],
};

export function stationIsUnlocked(
  estacion: EstacionM8,
  completedIds: string[],
): boolean {
  if (!estacion.bloqueadoHastaCompletarAnterior) return true;
  if (estacion.orden === 0) return true;
  const prev = ESTACIONES_M8.find((e) => e.orden === estacion.orden - 1);
  if (!prev) return true;
  return completedIds.includes(prev.id);
}

export function canCompleteStation(
  estacion: EstacionM8,
  selected: string[],
): boolean {
  const correctIds = estacion.opciones.filter((o) => o.correcta).map((o) => o.id);
  const selectedCorrect = selected.filter((id) => correctIds.includes(id));
  const selectedIncorrect = selected.filter(
    (id) => !correctIds.includes(id) && estacion.opciones.some((o) => o.id === id),
  );

  if (estacion.interaccion === "evaluacion_protocolo") {
    return selectedCorrect.length >= 5 && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "gran_desafio") {
    return selectedCorrect.length >= 4;
  }
  if (estacion.interaccion === "cierre_narrativo") {
    return selected.length >= 1;
  }
  if (estacion.interaccion === "secuencia_recuperacion") {
    const minCorrect = Math.min(3, correctIds.length);
    return selectedCorrect.length >= minCorrect && selectedIncorrect.length === 0;
  }
  if (estacion.interaccion === "epp_nch3241") {
    const minCorrect = Math.min(2, correctIds.length);
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
