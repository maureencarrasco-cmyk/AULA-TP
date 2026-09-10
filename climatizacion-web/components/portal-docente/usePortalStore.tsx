"use client";

import { useCallback, useEffect, useState } from "react";
import type { BloquePlan } from "@/lib/demo-data";
import {
  defaultPlanificacion,
  loadJson,
  loadPlanificacion,
  PORTAL_LS_KEYS,
  saveJson,
  savePlanificacion,
  type EstudiantesTabId,
  type OaFiltroId,
  type ReportesFiltroId,
} from "@/lib/portal-local-store";

export type { EstudiantesTabId, OaFiltroId, ReportesFiltroId };

/** Shared portal demo state backed by localStorage (aula-tp-portal-*). */
export function usePortalStore() {
  const [hydrated, setHydrated] = useState(false);
  const [planificacion, setPlanificacionState] = useState<BloquePlan[]>([]);
  const [estudiantesTab, setEstudiantesTabState] =
    useState<EstudiantesTabId>("estudiante");
  const [favoritos, setFavoritosState] = useState<string[]>([]);
  const [oaFiltro, setOaFiltroState] = useState<OaFiltroId>("Todas");
  const [reportesFiltro, setReportesFiltroState] =
    useState<ReportesFiltroId>("Todas");
  const [recursosUsados, setRecursosUsadosState] = useState<string[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setPlanificacionState(loadPlanificacion());
    setEstudiantesTabState(
      loadJson<EstudiantesTabId>(PORTAL_LS_KEYS.estudiantesTab, "estudiante"),
    );
    setFavoritosState(loadJson<string[]>(PORTAL_LS_KEYS.favoritos, []));
    setOaFiltroState(loadJson<OaFiltroId>(PORTAL_LS_KEYS.oaFiltro, "Todas"));
    setReportesFiltroState(
      loadJson<ReportesFiltroId>(PORTAL_LS_KEYS.reportesFiltro, "Todas"),
    );
    setRecursosUsadosState(
      loadJson<string[]>(PORTAL_LS_KEYS.recursosUsados, []),
    );
    setHydrated(true);
  }, []);

  const flashSaved = useCallback(() => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  }, []);

  const setPlanificacion = useCallback(
    (next: BloquePlan[] | ((prev: BloquePlan[]) => BloquePlan[])) => {
      setPlanificacionState((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        savePlanificacion(value);
        return value;
      });
      flashSaved();
    },
    [flashSaved],
  );

  const resetPlanificacion = useCallback(() => {
    const fresh = defaultPlanificacion();
    savePlanificacion(fresh);
    setPlanificacionState(fresh);
    flashSaved();
  }, [flashSaved]);

  const setEstudiantesTab = useCallback((tab: EstudiantesTabId) => {
    setEstudiantesTabState(tab);
    saveJson(PORTAL_LS_KEYS.estudiantesTab, tab);
  }, []);

  const toggleFavorito = useCallback((id: string) => {
    setFavoritosState((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      saveJson(PORTAL_LS_KEYS.favoritos, next);
      return next;
    });
  }, []);

  const setOaFiltro = useCallback((filtro: OaFiltroId) => {
    setOaFiltroState(filtro);
    saveJson(PORTAL_LS_KEYS.oaFiltro, filtro);
  }, []);

  const setReportesFiltro = useCallback((filtro: ReportesFiltroId) => {
    setReportesFiltroState(filtro);
    saveJson(PORTAL_LS_KEYS.reportesFiltro, filtro);
  }, []);

  const toggleRecursoUsado = useCallback((id: string) => {
    setRecursosUsadosState((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      saveJson(PORTAL_LS_KEYS.recursosUsados, next);
      return next;
    });
  }, []);

  return {
    hydrated,
    savedFlash,
    planificacion,
    setPlanificacion,
    resetPlanificacion,
    estudiantesTab,
    setEstudiantesTab,
    favoritos,
    toggleFavorito,
    oaFiltro,
    setOaFiltro,
    reportesFiltro,
    setReportesFiltro,
    recursosUsados,
    toggleRecursoUsado,
  };
}

export function BrowserSaveHint({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] text-slate-500 ${className}`}>
      Cambios guardados en este navegador
    </p>
  );
}
