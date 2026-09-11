import type { EstacionBase, FaseRuta } from "@/lib/aula-module-types";
import { ETAPA_LABELS, type EtapaCiclo } from "@/lib/aula-module-types";

export const LMS_OVERVIEW_FASES: FaseRuta[] = [
  "contextualizacion",
  "estacion_ae",
  "situacion_integradora",
  "evaluacion_final",
  "retroalimentacion",
];

export const LMS_OVERVIEW_NAMES: Record<FaseRuta, string> = {
  contextualizacion: "Contextualización",
  estacion_ae: "Aprendizajes Esperados",
  situacion_integradora: "Situación Integradora",
  evaluacion_final: "Evaluación Final",
  retroalimentacion: "Retroalimentación y Cierre",
};

export const LMS_OVERVIEW_PURPOSE: Record<FaseRuta, string> = {
  contextualizacion: "Comprendo la situación técnica o laboral",
  estacion_ae: "Analizo, comprendo y aplico los aprendizajes esperados",
  situacion_integradora: "Resuelvo una situación integradora en contexto real",
  evaluacion_final: "Demuestro lo aprendido en la evaluación final",
  retroalimentacion: "Reflexiono sobre mi avance y proyecto el módulo siguiente",
};

export const LMS_AE_STAGE_COPY: { id: EtapaCiclo; title: string; body: string }[] = [
  {
    id: "analizar",
    title: ETAPA_LABELS.analizar,
    body: "Observa la situación profesional, identifica los antecedentes relevantes y reconoce qué información necesitas antes de actuar.",
  },
  {
    id: "comprender",
    title: ETAPA_LABELS.comprender,
    body: "Interpreta el contexto del caso y explica con tus palabras las necesidades, riesgos y condiciones que debes atender.",
  },
  {
    id: "relacionar",
    title: ETAPA_LABELS.relacionar,
    body: "Conecta los conceptos técnicos con los datos del caso para comprender cómo se relacionan entre sí.",
  },
  {
    id: "aplicar",
    title: ETAPA_LABELS.aplicar,
    body: "Selecciona procedimientos seguros, prioriza acciones y toma decisiones fundamentadas para responder al caso.",
  },
  {
    id: "verificar",
    title: ETAPA_LABELS.verificar,
    body: "Revisa los resultados, comprueba que la intervención fue segura e identifica los aspectos que debes corregir.",
  },
  {
    id: "retroalimentar",
    title: ETAPA_LABELS.retroalimentar,
    body: "Integra la retroalimentación, reconoce tus avances y registra aquello que necesitas reforzar antes de continuar.",
  },
];

export type LmsOverviewGroup = {
  fase: FaseRuta;
  name: string;
  purpose: string;
  estaciones: EstacionBase[];
  n: number;
};

export function groupEstacionesToOverview(estaciones: EstacionBase[]): LmsOverviewGroup[] {
  return LMS_OVERVIEW_FASES.map((fase, index) => ({
    fase,
    name: LMS_OVERVIEW_NAMES[fase],
    purpose: LMS_OVERVIEW_PURPOSE[fase],
    estaciones: estaciones.filter((estacion) => estacion.fase === fase),
    n: index + 1,
  })).filter((group) => group.estaciones.length > 0);
}

export function overviewGroupForEstacion(
  groups: LmsOverviewGroup[],
  estacion: EstacionBase,
): LmsOverviewGroup {
  return groups.find((group) => group.fase === estacion.fase) ?? groups[0];
}

export function firstOpenInGroup(
  group: LmsOverviewGroup,
  isOpen: (estacion: EstacionBase) => boolean,
): EstacionBase {
  return group.estaciones.find((estacion) => isOpen(estacion)) ?? group.estaciones[0];
}

export function groupState(
  group: LmsOverviewGroup,
  args: { completedIds: string[]; currentId: string; isOpen: (estacion: EstacionBase) => boolean },
): "completed" | "active" | "available" | "locked" {
  const allDone = group.estaciones.every((estacion) => args.completedIds.includes(estacion.id));
  if (allDone) return "completed";
  if (group.estaciones.some((estacion) => estacion.id === args.currentId)) return "active";
  if (group.estaciones.some((estacion) => args.isOpen(estacion))) return "available";
  return "locked";
}

export function groupDurationHours(group: LmsOverviewGroup): number {
  return group.estaciones.reduce((sum, estacion) => sum + (estacion.horas || 0), 0);
}

export function shortEstacionTitle(titulo: string): string {
  return titulo
    .replace(/^Estación \d+\s*[—-]\s*/i, "")
    .replace(/^Contextualización\s*[—-]\s*/i, "")
    .trim();
}
