/** Persistencia localStorage del Portal Docente (prefijo aula-tp-portal-). */

import type { BloquePlan } from "@/lib/demo-data";

export const PORTAL_LS_PREFIX = "aula-tp-portal-";

export const PORTAL_LS_KEYS = {
  planificacion: `${PORTAL_LS_PREFIX}planificacion-v2`,
  estudiantesTab: `${PORTAL_LS_PREFIX}estudiantes-tab`,
  favoritos: `${PORTAL_LS_PREFIX}favoritos`,
  oaFiltro: `${PORTAL_LS_PREFIX}oa-filtro`,
  reportesFiltro: `${PORTAL_LS_PREFIX}reportes-filtro`,
  recursosUsados: `${PORTAL_LS_PREFIX}recursos-usados`,
} as const;

export type EstudiantesTabId = "curso" | "estudiante" | "nivel";

export type OaFiltroId =
  | "Todas"
  | "Electricidad"
  | "Administración"
  | "Refrigeración y Climatización";

export type ReportesFiltroId =
  | "Todas"
  | "Electricidad"
  | "Administración"
  | "Refrigeración y Climatización"
  | string; // curso name also allowed

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

export function loadPlanificacion(): BloquePlan[] {
  const data = loadJson<BloquePlan[] | null>(PORTAL_LS_KEYS.planificacion, null);
  if (!Array.isArray(data)) return [];
  return data;
}

export function savePlanificacion(blocks: BloquePlan[]): void {
  saveJson(PORTAL_LS_KEYS.planificacion, blocks);
}

export function defaultPlanificacion(): BloquePlan[] {
  return [];
}
