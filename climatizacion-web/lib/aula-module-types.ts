/** Shared types for Climatización ModulePlayers / AulaModuleShell */

export type FaseRuta =
  | "contextualizacion"
  | "estacion_ae"
  | "situacion_integradora"
  | "evaluacion_final"
  | "retroalimentacion";

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
  familia?: string;
};

/** Hotspot clicable sobre mediaUrl (coordenadas % del ancho/alto de la imagen). */
export type MediaHotspot = {
  id: string;
  /** id de OpcionInteractiva vinculada */
  optionId: string;
  label: string;
  x: number;
  y: number;
  /** radio visual aprox. en % del ancho */
  r?: number;
};

export type EstacionBase = {
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
  interaccion: string;
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
  /** Video con narración (controles, sin mute forzado) */
  mediaNarratedMp4?: string;
  mediaNarratedTitle?: string;
  /** GLB/glTF para visor 3D (p. ej. condensadora) */
  mediaModelUrl?: string;
  mediaModelCaption?: string;
  hotspots?: MediaHotspot[];
};

export type CasoDemo = {
  titulo: string;
  resumen?: string;
  actor?: string;
  equipo?: string;
  hallazgoTipico?: string;
  setpoint?: string;
  retornoObservado?: string;
};

export type ModuleMeta = {
  moduloNumero: number;
  nombre: string;
  especialidad: string;
  oa: string;
  oaTexto?: string;
  horasAulaTp: number;
  horasDesarrollo: number;
  horasEvaluacionFinal: number;
  casoDemo: CasoDemo;
  portalDocenteHref: string;
  storageKey: string;
  heroMediaUrl?: string;
  heroMediaAlt?: string;
};

export type ProgressState = {
  completedIds: string[];
  selectedByStation: Record<string, string[]>;
  currentId: string;
  evalSubmitted: boolean;
  practicaLibreVisits: string[];
  /** Fases PL con desafío completado (explorar/desafiar/investigar/transferir). */
  practicaLibreDone?: string[];
  plCounters?: {
    situacion: number;
    correctas: number;
    reintentos: number;
  };
};

export type CierreCard = {
  key: string;
  label: string;
  width?: string;
};

export type EtapaCiclo =
  | "analizar"
  | "comprender"
  | "relacionar"
  | "aplicar"
  | "verificar"
  | "retroalimentar";

export const FASE_LABELS: Record<FaseRuta, string> = {
  contextualizacion: "Contextualización",
  estacion_ae: "Estaciones AE",
  situacion_integradora: "Situación Integradora",
  evaluacion_final: "Evaluación Final (2 h)",
  retroalimentacion: "Retroalimentación y cierre",
};

export const ETAPA_LABELS: Record<EtapaCiclo, string> = {
  analizar: "Analizar",
  comprender: "Comprender",
  relacionar: "Reconocer y relacionar",
  aplicar: "Aplicar y decidir",
  verificar: "Verificar",
  retroalimentar: "Retroalimentar",
};

/** Stage accent colors from design system */
export const ETAPA_ACCENT: Record<
  EtapaCiclo,
  { bg: string; text: string; ring: string; hex: string }
> = {
  analizar: {
    bg: "bg-[#0870EF]",
    text: "text-[#0870EF]",
    ring: "ring-[#0870EF]/40",
    hex: "#0870EF",
  },
  comprender: {
    bg: "bg-[#008B98]",
    text: "text-[#008B98]",
    ring: "ring-[#008B98]/40",
    hex: "#008B98",
  },
  relacionar: {
    bg: "bg-indigo-600",
    text: "text-indigo-700",
    ring: "ring-indigo-400/40",
    hex: "#4F46E5",
  },
  aplicar: {
    bg: "bg-amber-500",
    text: "text-amber-700",
    ring: "ring-amber-400/40",
    hex: "#D97706",
  },
  verificar: {
    bg: "bg-teal-700",
    text: "text-teal-800",
    ring: "ring-teal-600/40",
    hex: "#0F766E",
  },
  retroalimentar: {
    bg: "bg-[#F51670]",
    text: "text-[#F51670]",
    ring: "ring-[#F51670]/40",
    hex: "#F51670",
  },
};

export function mapHabilidadToEtapa(habilidad: string): EtapaCiclo {
  const h = habilidad.toUpperCase();
  if (h.includes("RETROALIMENT") || h.includes("CIERRE")) return "retroalimentar";
  if (h.includes("EVALUAR") && !h.includes("VERIFIC")) return "retroalimentar";
  if (h.includes("VERIFIC") || h.includes("REGISTR") || h.includes("CLASIFIC"))
    return "verificar";
  if (
    h.includes("APLICAR") ||
    h.includes("EJECUTAR") ||
    h.includes("DECIDIR") ||
    h.includes("PREPARAR") ||
    h.includes("DIAGNOSTIC") ||
    h.includes("TRANSFER") ||
    h.includes("INTEGRAR")
  )
    return "aplicar";
  if (h.includes("RELACION") || h.includes("RECONOCER")) return "relacionar";
  if (h.includes("COMPRENDER")) return "comprender";
  if (h.includes("ANALIZAR")) return "analizar";
  return "analizar";
}

export function formatHoras(h: number): string {
  return String(h).replace(".", ",");
}

export function shortTitle(titulo: string): string {
  return titulo
    .replace(/^Estación \d+ — /, "")
    .replace(/^Contextualización — /, "Ctx · ")
    .replace(/^Situación Integradora — /, "SI · ")
    .replace(/^Evaluación Final.*/, "Evaluación Final")
    .replace(/^Retroalimentación.*/, "Cierre");
}

export type A11yPrefs = {
  perfil: "ninguno" | "lectura" | "baja" | "apoyo";
  texto: "normal" | "grande" | "muy_grande";
  altoContraste: boolean;
  visualSimple: boolean;
  reducirMovimiento: boolean;
  resaltarFoco: boolean;
  masTiempo: boolean;
  masAyuda: boolean;
};

export const DEFAULT_A11Y: A11yPrefs = {
  perfil: "ninguno",
  texto: "normal",
  altoContraste: false,
  visualSimple: false,
  reducirMovimiento: false,
  resaltarFoco: false,
  masTiempo: false,
  masAyuda: false,
};

export const A11Y_STORAGE_KEY = "aula-tp-a11y-prefs-v1";
