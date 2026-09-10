/**
 * Tutor Aula TP · especialista en Refrigeración y Climatización (EMTP Chile).
 * Motor pedagógico offline: pistas graduales, sin entregar respuestas completas.
 * No reemplaza normas (p. ej. NCh3241) ni la supervisión docente.
 */

export type TutorAgentHint = {
  nivel: number;
  pregunta: string;
};

export type TutorContext = {
  moduloNumero?: number;
  oa?: string;
  aeCodigos?: string[];
  etapa?: string;
  estacionTitulo?: string;
  pregunta?: string;
  evidenciaMinima?: string;
  casoTitulo?: string;
  agentHints?: TutorAgentHint[];
  /** Nivel de pista ya mostrado (0-based); el motor avanza si el usuario pide más. */
  hintLevel?: number;
};

export type TutorIntent =
  | "pista"
  | "explicar"
  | "evidencia"
  | "seguridad"
  | "norma"
  | "refrigerante"
  | "manometro"
  | "soldadura"
  | "diagnostico"
  | "montaje"
  | "mantencion"
  | "reciclaje"
  | "planos"
  | "medicion"
  | "saludo"
  | "general";

const PERSONA =
  "Tutor Aula TP · especialista en Refrigeración y Climatización";

const DISCLAIMER =
  "Recuerda: no reemplazo normas técnicas ni a tu docente.";

/** Snippets cortos y precisos (español Chile / EMTP). */
const KNOWLEDGE: Record<string, string> = {
  nch3241:
    "NCh3241 orienta buenas prácticas de refrigeración: identificación de fugas, recuperación de refrigerante, hermeticidad y registro. Úsala como criterio, no como checklist memorizado.",
  epp: "EPP típico en climatización: guantes, gafas, calzado de seguridad, y protección respiratoria cuando hay riesgo de refrigerante o soldadura. Verifica el protocolo del taller antes de actuar.",
  inspeccion:
    "Inspección visual primero: corrosión, aceite, deformaciones, aislamiento, fijaciones y trazado vs plano. Solo después mides o intervienes el circuito.",
  r410a:
    "R-410A opera a alta presión: no mezclar con R-22, usar mangueras/manómetros aptos y recuperar con equipo certificado. Nunca ventilar a la atmósfera.",
  recuperacion:
    "Recuperación: conectar equipo de recuperación, recuperar líquido/vapor según procedimiento, pesar y registrar. Evita liberar refrigerante (obligación ambiental y NCh3241).",
  hermeticidad:
    "Hermeticidad: prueba con nitrógeno seco a presión de prueba del equipo/norma, detectar fugas (jabón/electrónico), no con refrigerante como «prueba».",
  manometro:
    "Manómetro: identifica alto/bajo, unidades (psi/bar), y relación con temperatura de saturación del refrigerante. Compara con tabla PT del gas del equipo.",
  soldadura:
    "Soldadura/brasado de cobre: limpieza, flujo adecuado, nitrógeno de purga para evitar cascarilla interna, y EPP. Revisa junta y orientación antes de calentar.",
  diagnostico:
    "Diagnóstico: síntomas → evidencias (T°, ΔT, corrientes, presiones, ruidos) → hipótesis → prueba. No cambies piezas «a ciegas».",
  planos:
    "Planos HVAC: leyenda, simbología de ductos/cañerías, cotas y especificaciones. Contrasta plano con obra (shaft, interferencias eléctricas).",
  montaje:
    "Montaje: soporte, nivelación, distancias de servicio, pendiente de drenaje, aislamiento y torque de conexiones según fabricante.",
  mantencion:
    "Mantención: filtros, serpentines, drenajes, fijaciones, lecturas de operación y bitácora. Separa correctiva de preventiva.",
  reciclaje:
    "Fin de vida: recuperar refrigerante, clasificar residuos (aceite, metales, aislamiento) y documentar disposición conforme a normativa vigente.",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function detectIntent(message: string): TutorIntent {
  const t = normalize(message);

  if (/^(hola|buenas|hey|saludos)\b/.test(t) || t.includes("quien eres")) {
    return "saludo";
  }
  if (
    /\bpista\b/.test(t) ||
    t.includes("ayuda") ||
    t.includes("dame una pista") ||
    t.includes("no se") ||
    t.includes("no entiendo") ||
    t.includes("orient")
  ) {
    return "pista";
  }
  if (
    t.includes("explic") ||
    t.includes("que es esta etapa") ||
    t.includes("para que sirve") ||
    t.includes("como funciona esta")
  ) {
    return "explicar";
  }
  if (
    t.includes("evidencia") ||
    t.includes("que reviso") ||
    t.includes("que debo registrar") ||
    t.includes("minima")
  ) {
    return "evidencia";
  }
  if (
    t.includes("seguridad") ||
    t.includes("epp") ||
    t.includes("riesgo") ||
    t.includes("proteccion")
  ) {
    return "seguridad";
  }
  if (
    t.includes("norma") ||
    t.includes("nch") ||
    t.includes("3241") ||
    t.includes("reglamento")
  ) {
    return "norma";
  }
  if (
    t.includes("refrigerante") ||
    t.includes("r410") ||
    t.includes("r-410") ||
    t.includes("r22") ||
    t.includes("r-22") ||
    t.includes("recuper") ||
    t.includes("carga de gas")
  ) {
    return "refrigerante";
  }
  if (
    t.includes("manometr") ||
    t.includes("presion") ||
    t.includes("vacío") ||
    t.includes("vacio") ||
    t.includes("psi") ||
    t.includes("bar")
  ) {
    return "manometro";
  }
  if (
    t.includes("soldadur") ||
    t.includes("brasad") ||
    t.includes("oxiacetilen") ||
    t.includes("cobre")
  ) {
    return "soldadura";
  }
  if (
    t.includes("diagnost") ||
    t.includes("falla") ||
    t.includes("averia") ||
    t.includes("sintoma")
  ) {
    return "diagnostico";
  }
  if (t.includes("montaj") || t.includes("instal")) return "montaje";
  if (t.includes("manten") || t.includes("preventiv")) return "mantencion";
  if (
    t.includes("recicl") ||
    t.includes("residuo") ||
    t.includes("desmantel")
  ) {
    return "reciclaje";
  }
  if (
    t.includes("plano") ||
    t.includes("simbolo") ||
    t.includes("leyenda") ||
    t.includes("ducto")
  ) {
    return "planos";
  }
  if (
    t.includes("medicion") ||
    t.includes("termometr") ||
    t.includes("amper") ||
    t.includes("multimetr")
  ) {
    return "medicion";
  }
  return "general";
}

function guidingQuestion(ctx: TutorContext, intent: TutorIntent): string {
  if (ctx.pregunta && (intent === "pista" || intent === "explicar")) {
    return `¿Qué parte de «${trimQ(ctx.pregunta)}» puedes respaldar ya con una evidencia concreta?`;
  }
  switch (intent) {
    case "seguridad":
      return "¿Qué EPP o control de riesgo aplicarías antes del siguiente paso?";
    case "evidencia":
      return "¿Qué dato o foto registrarías ahora en la bitácora?";
    case "norma":
      return "¿Qué criterio de NCh3241 o del protocolo del taller estás usando?";
    case "refrigerante":
      return "¿Identificaste el refrigerante del equipo antes de conectar mangueras?";
    case "manometro":
      return "¿Qué lectura (alta/baja) contrastarías primero con la tabla PT?";
    case "diagnostico":
      return "¿Cuál es el síntoma principal y qué medición lo confirma?";
    default:
      return "¿Qué observarías primero sin intervenir el circuito?";
  }
}

function trimQ(s: string, max = 120): string {
  const t = s.trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function contextHeader(ctx: TutorContext): string {
  const bits: string[] = [];
  if (ctx.moduloNumero != null) bits.push(`M${ctx.moduloNumero}`);
  if (ctx.estacionTitulo) bits.push(ctx.estacionTitulo);
  if (ctx.etapa) bits.push(`etapa ${ctx.etapa}`);
  if (ctx.aeCodigos?.length) bits.push(ctx.aeCodigos.join(", "));
  if (!bits.length) return "";
  return `Contexto: ${bits.join(" · ")}.`;
}

function hintFromStation(
  ctx: TutorContext,
): { text: string; nextLevel: number } | null {
  const hints = ctx.agentHints ?? [];
  if (!hints.length) return null;
  const level = Math.min(
    Math.max(0, ctx.hintLevel ?? 0),
    hints.length - 1,
  );
  const h = hints[level];
  const nextLevel = Math.min(level + 1, hints.length - 1);
  return {
    text: `Pista nivel ${h.nivel}: ${h.pregunta}`,
    nextLevel,
  };
}

function knowledgeBlock(intent: TutorIntent): string | null {
  switch (intent) {
    case "norma":
      return KNOWLEDGE.nch3241;
    case "seguridad":
      return KNOWLEDGE.epp;
    case "refrigerante":
      return `${KNOWLEDGE.r410a} ${KNOWLEDGE.recuperacion}`;
    case "manometro":
      return KNOWLEDGE.manometro;
    case "soldadura":
      return KNOWLEDGE.soldadura;
    case "diagnostico":
      return `${KNOWLEDGE.diagnostico} ${KNOWLEDGE.inspeccion}`;
    case "planos":
      return KNOWLEDGE.planos;
    case "montaje":
      return KNOWLEDGE.montaje;
    case "mantencion":
      return KNOWLEDGE.mantencion;
    case "reciclaje":
      return KNOWLEDGE.reciclaje;
    case "medicion":
      return `${KNOWLEDGE.inspeccion} ${KNOWLEDGE.manometro}`;
    default:
      return null;
  }
}

export type ExpertReply = {
  reply: string;
  intent: TutorIntent;
  /** Sugerencia de hintLevel a persistir en el cliente tras una pista. */
  nextHintLevel?: number;
};

/**
 * Genera respuesta pedagógica. Nunca entrega la clave de la estación ni lista
 * completa de opciones correctas.
 */
export function replyAsClimatizacionTutor(
  message: string,
  context: TutorContext = {},
): ExpertReply {
  const intent = detectIntent(message || "pista");
  const header = contextHeader(context);
  const parts: string[] = [];

  parts.push(`**${PERSONA}**`);
  if (header) parts.push(header);

  if (intent === "saludo") {
    parts.push(
      "Estoy aquí para orientarte con pistas graduales en refrigeración y climatización (planos, medición, montaje, diagnóstico, mantención y reciclaje).",
    );
    parts.push(
      "Pide una pista, evidencia, seguridad o una norma. No te daré la respuesta completa: tú construyes el razonamiento.",
    );
    parts.push(guidingQuestion(context, intent));
    parts.push(DISCLAIMER);
    return { reply: parts.join("\n\n"), intent };
  }

  if (intent === "explicar") {
    const etapa = context.etapa ? `«${context.etapa}»` : "esta etapa";
    parts.push(
      `En ${etapa} el foco es observar, relacionar y decidir con evidencia — no memorizar.`,
    );
    if (context.pregunta) {
      parts.push(`Pregunta guía de la estación: ${trimQ(context.pregunta)}`);
    }
    if (context.casoTitulo) {
      parts.push(`Caso: ${context.casoTitulo}. Úsalo como ancla, no como atajo.`);
    }
    parts.push(
      "Te oriento a mirar el escenario y contrastar con plano, norma o manual — sin adelantar la clave.",
    );
    parts.push(guidingQuestion(context, intent));
    parts.push(DISCLAIMER);
    return { reply: parts.join("\n\n"), intent };
  }

  if (intent === "evidencia") {
    if (context.evidenciaMinima) {
      parts.push(
        `Evidencia mínima pedida: ${context.evidenciaMinima}. Contrástala con plano, norma (p. ej. NCh3241), manual o bitácora.`,
      );
    } else {
      parts.push(
        "Define qué evidencia mínima vas a registrar: medida, foto, contraste plano–obra o criterio de norma.",
      );
    }
    parts.push(KNOWLEDGE.inspeccion);
    parts.push(guidingQuestion(context, intent));
    parts.push(DISCLAIMER);
    return { reply: parts.join("\n\n"), intent };
  }

  if (intent === "pista") {
    const stationHint = hintFromStation(context);
    if (stationHint) {
      parts.push(stationHint.text);
      parts.push(
        "Si aún no basta, pide otra pista: subiré un nivel sin entregar la respuesta.",
      );
      if (context.evidenciaMinima) {
        parts.push(`Mantén a la vista: ${context.evidenciaMinima}`);
      }
      parts.push(guidingQuestion(context, intent));
      parts.push(DISCLAIMER);
      return {
        reply: parts.join("\n\n"),
        intent,
        nextHintLevel: stationHint.nextLevel,
      };
    }
    // Sin hints de estación: pista genérica por módulo/tema
    parts.push(
      "Pista: parte por lo observable (inspección visual o leyenda del plano) antes de intervenir o medir.",
    );
    if (context.evidenciaMinima) {
      parts.push(`Tu evidencia mínima apunta a: ${context.evidenciaMinima}`);
    }
    const kb = knowledgeBlock(
      context.moduloNumero === 1
        ? "planos"
        : context.moduloNumero === 2
          ? "medicion"
          : context.moduloNumero === 6
            ? "diagnostico"
            : context.moduloNumero === 8
              ? "reciclaje"
              : "general",
    );
    if (kb) parts.push(kb);
    parts.push(guidingQuestion(context, intent));
    parts.push(DISCLAIMER);
    return { reply: parts.join("\n\n"), intent };
  }

  // Knowledge intents
  const kb = knowledgeBlock(intent);
  if (kb) {
    parts.push(kb);
    if (context.evidenciaMinima && intent !== "seguridad") {
      parts.push(
        `Relaciona esto con la evidencia de la estación: ${context.evidenciaMinima}`,
      );
    }
    parts.push(guidingQuestion(context, intent));
    parts.push(DISCLAIMER);
    return { reply: parts.join("\n\n"), intent };
  }

  // general
  parts.push(
    "Puedo ayudarte con pistas, evidencia, seguridad (EPP), NCh3241, refrigerantes, manómetros, soldadura, diagnóstico, montaje, mantención o reciclaje.",
  );
  if (context.pregunta) {
    parts.push(`Estás trabajando: ${trimQ(context.pregunta)}`);
  }
  parts.push(
    "Escribe «pista», «evidencia» o tu duda concreta. Responderé con orientación gradual.",
  );
  parts.push(guidingQuestion(context, "general"));
  parts.push(DISCLAIMER);
  return { reply: parts.join("\n\n"), intent: "general" };
}

/** Welcome line when the panel opens (no user message yet). */
export function tutorWelcome(context: TutorContext = {}): string {
  const header = contextHeader(context);
  const lines = [
    `Hola. Soy el ${PERSONA}.`,
    header || "Estoy listo para orientarte en el módulo de climatización.",
    "Usa los chips o escribe tu duda. Doy pistas graduales — no la respuesta completa.",
    DISCLAIMER,
  ];
  return lines.filter(Boolean).join("\n\n");
}
