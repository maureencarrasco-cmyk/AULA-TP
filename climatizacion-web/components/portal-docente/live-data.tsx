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
  ESTUDIANTES,
  type CoberturaOa,
  type EstadoOaAe,
  type EstudianteDemo,
} from "@/lib/demo-data";
import { MODULOS_CLIMATIZACION } from "@/lib/climatizacion-curso";
import type {
  InstitutionalMetrics,
  InstitutionalModule,
  InstitutionalStudentRow,
} from "@/lib/portal-cursos";
import { PORTAL_CURSOS } from "@/lib/portal-cursos";

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
  usingDemoData: boolean;
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

const DEMO_COURSE_CONFIG: Record<string, { students: number; average: number; activities: number; integrator: number; modules: number }> = {
  "/api/portal/metrics/enfermeria": { students: 40, average: 72, activities: 78, integrator: 68, modules: 6 },
  "/api/portal/metrics/electricidad": { students: 40, average: 76, activities: 81, integrator: 73, modules: 6 },
  "/api/portal/metrics/climatizacion": { students: 160, average: 71, activities: 74, integrator: 66, modules: 8 },
};

function demoModules(path: string, config: (typeof DEMO_COURSE_CONFIG)[string]): InstitutionalModule[] {
  const catalog = CATALOGO_OA.filter((oa) =>
    path.includes("climatizacion")
      ? oa.especialidad === "Refrigeración y Climatización"
      : oa.especialidad === "Electricidad",
  );
  return Array.from({ length: config.modules }, (_, index) => {
    const oa = catalog[index % Math.max(1, catalog.length)];
    const progress = Math.max(42, config.average + ((index % 3) - 1) * 6);
    return {
      id: `demo-${path.split("/").pop()}-${index + 1}`,
      sequence: index + 1,
      code: `M${index + 1}`,
      oa_code: oa?.codigo ?? `OA ${index + 1}`,
      title: oa?.titulo ?? `Módulo de aprendizaje ${index + 1}`,
      short_title: oa?.titulo,
      activity_count: 6 + (index % 3),
      average_progress: progress,
      completed_enrollments: Math.round(config.students * (progress / 100)),
      in_progress_enrollments: Math.round(config.students * ((100 - progress) / 100)),
      average_score: progress,
    };
  });
}

/**
 * Synthetic preview data is used only when an LMS endpoint returns no usable
 * records. It keeps every screen explorable without presenting it as live data.
 */
export function demoMetricsForPath(path: string): InstitutionalMetrics {
  const config = DEMO_COURSE_CONFIG[path] ?? DEMO_COURSE_CONFIG["/api/portal/metrics/climatizacion"];
  const course = PORTAL_CURSOS.find((item) => item.metricsApiPath === path);
  const matchingStudents = path.includes("climatizacion")
    ? ESTUDIANTES.filter((student) => /climatización/i.test(student.curso))
    : [];
  const students = matchingStudents.map((student) => ({
    id: student.id,
    name: student.nombre,
    curso: student.curso,
    overallPct: student.avancePct,
  }));
  const modules = demoModules(path, config);
  return {
    course: {
      id: course?.id ?? "demo-course",
      kind: "demo",
      code: `DEMO-${course?.id ?? "course"}`,
      title: course?.title ?? "Curso de demostración",
      specialty: course?.specialty ?? "Aula TP",
      level: course?.level ?? "3°–4° Medio",
      status: "Datos sintéticos de demostración",
    },
    totals: {
      students: config.students,
      active_enrollments: config.students,
      completed_enrollments: Math.round(config.students * 0.72),
      average_progress: config.average,
      modules: modules.length,
      activities: modules.reduce((sum, module) => sum + (module.activity_count ?? 0), 0),
      activity_completion: config.activities,
      integrator_total: config.students,
      integrator_completed: Math.round(config.students * (config.integrator / 100)),
      integrator_average_progress: config.integrator,
    },
    modules,
    students,
    source: "static",
    demoData: true,
    fetchedAt: "demo",
  };
}

export function shouldUseDemoMetrics(data: InstitutionalMetrics): boolean {
  return data.totals.students === 0 || data.modules.length === 0;
}

function useCourse(path: string): LiveCourseState {
  const [state, setState] = useState<LiveCourseState>({ status: "loading" });
  useEffect(() => {
    let cancelled = false;
    fetchMetrics(path)
      .then((data) => {
        if (!cancelled) {
          setState({ status: "ok", data: shouldUseDemoMetrics(data) ? demoMetricsForPath(path) : data });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "ok", data: demoMetricsForPath(path) });
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
      usingDemoData: states.some((item) => item.state.status === "ok" && item.state.data.demoData === true),
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

function totalsEstudiantes(state: LiveCourseState): number {
  return state.status === "ok" ? state.data.totals.students : 0;
}

export function LiveStatusNote() {
  const { loading, errors, estudiantes, enfermeria, electricidad, climatizacion, usingDemoData } =
    useLivePortal();
  if (loading) {
    return (
      <p className="portal-status-note text-sm text-[var(--color-muted,#6B7C8E)]">
        Cargando métricas reales del LMS…
      </p>
    );
  }
  if (errors.length > 0 && estudiantes.length === 0) {
    return (
      <p className="portal-status-note rounded-xl border border-[var(--color-err,#C0392B)]/25 bg-[var(--color-err-soft,#FDECEA)] px-4 py-3 text-sm text-[var(--color-navy,#0B3A6B)]">
        No hay datos del LMS en este momento. {errors.join(" · ")}
      </p>
    );
  }
  if (usingDemoData) {
    return (
      <p className="portal-status-note rounded-xl border border-[var(--color-warn,#C47A12)]/25 bg-[var(--color-warn-soft,#FFF4E0)] px-4 py-3 text-sm text-[var(--color-navy,#0B3A6B)]">
        Mostrando datos sintéticos de demostración para visualizar resultados. No corresponden a estudiantes ni métricas reales del LMS.
      </p>
    );
  }
  const registrados =
    totalsEstudiantes(enfermeria) +
    totalsEstudiantes(electricidad) +
    totalsEstudiantes(climatizacion);
  const notes: string[] = [];
  if (errors.length > 0) {
    notes.push(`Algunas fuentes LMS no respondieron: ${errors.join(" · ")}`);
  }
  if (registrados > estudiantes.length) {
    notes.push(
      `El listado por estudiante muestra ${estudiantes.length} de Climatización. Enfermería y Electricidad informan totales LMS (${registrados} en total) sin nómina individual.`,
    );
  }
  if (notes.length === 0) return null;
  return (
    <p className="portal-status-note text-xs text-[var(--color-slate,#3D5166)]">{notes.join(" ")}</p>
  );
}
