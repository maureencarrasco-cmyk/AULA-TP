"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CATALOGO_OA,
  type CoberturaOa,
  type EstadoOaAe,
  type EstudianteDemo,
} from "@/lib/demo-data";
import { MODULOS_CLIMATIZACION } from "@/lib/climatizacion-curso";
import type {
  InstitutionalMetrics,
  InstitutionalStudentRow,
} from "@/lib/portal-cursos";

export type LiveCourseState =
  | { status: "loading" }
  | { status: "ok"; data: InstitutionalMetrics }
  | { status: "error"; message: string };

export type LivePortalValue = {
  enfermeria: LiveCourseState;
  electricidad: LiveCourseState;
  climatizacion: LiveCourseState;
  estudiantes: EstudianteDemo[];
  loading: boolean;
  errors: string[];
};

const LivePortalContext = createContext<LivePortalValue | null>(null);

function estadoFromPct(pct: number): EstadoOaAe {
  if (pct >= 85) return "logrado";
  if (pct >= 40) return "en_progreso";
  return "no_iniciado";
}

function coberturaFromModulePcts(
  modules: Record<string, number> | undefined,
): CoberturaOa[] {
  if (!modules) return [];
  const oaPct = new Map<string, number[]>();
  for (const m of MODULOS_CLIMATIZACION) {
    const pct = modules[String(m.numero)] ?? 0;
    for (const oa of m.oaCodigos) {
      const list = oaPct.get(oa) ?? [];
      list.push(pct);
      oaPct.set(oa, list);
    }
  }
  const rows: CoberturaOa[] = [];
  for (const [oaCodigo, pcts] of oaPct) {
    const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    const estado = estadoFromPct(avg);
    const catalog =
      CATALOGO_OA.find(
        (o) =>
          o.codigo === oaCodigo &&
          o.especialidad === "Refrigeración y Climatización",
      ) ?? CATALOGO_OA.find((o) => o.codigo === oaCodigo);
    const ae = (catalog?.ae ?? [{ codigo: `${oaCodigo} · AE`, descripcion: "" }]).map(
      (a) => ({
        aeCodigo: a.codigo,
        estado,
      }),
    );
    rows.push({ oaCodigo, estado, ae });
  }
  return rows;
}

export function mapLiveStudent(
  row: InstitutionalStudentRow,
  course: "enfermeria" | "electricidad" | "climatizacion",
): EstudianteDemo {
  const cobertura =
    course === "climatizacion" ? coberturaFromModulePcts(row.modules) : [];
  let logrados = 0;
  let totales = 0;
  for (const c of cobertura) {
    for (const a of c.ae) {
      totales += 1;
      if (a.estado === "logrado") logrados += 1;
    }
  }
  const pct = Math.round(row.overallPct);
  const pendiente = cobertura.find((c) => c.estado !== "logrado");
  return {
    id: `${course}-${row.id}`,
    nombre: row.name,
    curso: row.curso,
    actividadesCompletadas: totales > 0 ? Math.round((pct / 100) * totales) : 0,
    actividadesTotales: totales,
    avancePct: pct,
    ultimoAcceso: "LMS",
    cobertura,
    aeLogrados: logrados,
    aeTotales: totales,
    avancePctPeriodoAnterior: pct,
    ultimaActividad: pendiente
      ? { oaCodigo: pendiente.oaCodigo, texto: "Progreso LMS" }
      : cobertura[0]
        ? { oaCodigo: cobertura[0].oaCodigo, texto: "Progreso LMS" }
        : undefined,
  };
}

async function fetchMetrics(path: string): Promise<InstitutionalMetrics> {
  const res = await fetch(path, { cache: "no-store" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (body as { error?: string; detail?: string }).error ||
        (body as { detail?: string }).detail ||
        `HTTP ${res.status}`,
    );
  }
  return body as InstitutionalMetrics;
}

function useCourse(path: string): LiveCourseState {
  const [state, setState] = useState<LiveCourseState>({ status: "loading" });
  useEffect(() => {
    let cancelled = false;
    fetchMetrics(path)
      .then((data) => {
        if (!cancelled) setState({ status: "ok", data });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Error de red",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [path]);
  return state;
}

export function LivePortalProvider({ children }: { children: ReactNode }) {
  const enfermeria = useCourse("/api/portal/metrics/enfermeria");
  const electricidad = useCourse("/api/portal/metrics/electricidad");
  const climatizacion = useCourse("/api/portal/metrics/climatizacion");

  const value = useMemo<LivePortalValue>(() => {
    const states = [
      { label: "Enfermería", kind: "enfermeria" as const, state: enfermeria },
      { label: "Electricidad", kind: "electricidad" as const, state: electricidad },
      { label: "Climatización", kind: "climatizacion" as const, state: climatizacion },
    ];
    const estudiantes: EstudianteDemo[] = [];
    for (const { state, kind } of states) {
      if (state.status !== "ok") continue;
      for (const row of state.data.students ?? []) {
        estudiantes.push(mapLiveStudent(row, kind));
      }
    }
    return {
      enfermeria,
      electricidad,
      climatizacion,
      estudiantes,
      loading: states.some((s) => s.state.status === "loading"),
      errors: states
        .filter((s) => s.state.status === "error")
        .map((s) =>
          s.state.status === "error" ? `${s.label}: ${s.state.message}` : "",
        )
        .filter(Boolean),
    };
  }, [enfermeria, electricidad, climatizacion]);

  return (
    <LivePortalContext.Provider value={value}>{children}</LivePortalContext.Provider>
  );
}

export function useLivePortal(): LivePortalValue {
  const ctx = useContext(LivePortalContext);
  if (!ctx) {
    throw new Error("useLivePortal debe usarse dentro de LivePortalProvider");
  }
  return ctx;
}

export function LiveStatusNote() {
  const { loading, errors, estudiantes } = useLivePortal();
  if (loading) {
    return (
      <p className="text-sm text-[var(--color-muted,#6B7C8E)]">
        Cargando métricas reales del LMS…
      </p>
    );
  }
  if (errors.length > 0 && estudiantes.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--color-err,#C0392B)]/25 bg-[var(--color-err-soft,#FDECEA)] px-4 py-3 text-sm text-[var(--color-navy,#0B3A6B)]">
        No hay datos del LMS en este momento. {errors.join(" · ")}
      </p>
    );
  }
  if (errors.length > 0) {
    return (
      <p className="text-xs text-[var(--color-warn,#C47A12)]">
        Algunas fuentes LMS no respondieron: {errors.join(" · ")}
      </p>
    );
  }
  return null;
}
