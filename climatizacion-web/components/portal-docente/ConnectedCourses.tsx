"use client";

import { useEffect, useMemo, useState } from "react";
import {
  COLOR_ACCENT,
  COLOR_CARD,
  PORTAL_CURSOS,
  type InstitutionalMetrics,
  type PortalCurso,
} from "@/lib/portal-cursos";
import { especialidadFromCurso } from "@/lib/demo-data";
import { ChartPanel, CHART_HEX, DataBadge, MiniDonut, BarChart } from "./charts";
import {
  KpiStrip,
  PerspectiveTabs,
  SectionIntro,
  TendenciaCard,
} from "./analytics";
import { CursoComparePanel, EstudiantePriorityPanel } from "./perspective-panels";
import { useLivePortal } from "./live-data";
import {
  bandaFromPct,
  BANDA_LOGRO_COLOR,
  oaPctBars,
  pluralEstudiantes,
  tendenciaCentral,
} from "@/lib/portal-stats";

type FetchState =
  | { status: "loading" }
  | { status: "ok"; data: InstitutionalMetrics }
  | { status: "error"; message: string };

function useCourseMetrics(
  apiPath: string | undefined,
  refreshKey = 0,
): FetchState {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    if (!apiPath) {
      setState({
        status: "error",
        message: "Este curso no publica métricas LMS.",
      });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    fetch(apiPath)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            (body as { error?: string; detail?: string }).error ||
              (body as { detail?: string }).detail ||
              `HTTP ${res.status}`,
          );
        }
        return body as InstitutionalMetrics;
      })
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
  }, [apiPath, refreshKey]);

  return state;
}

function formatPct(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(n * 10) / 10}%`;
}

type CourseIconName =
  | "graduation"
  | "users"
  | "chart"
  | "layers"
  | "clipboard"
  | "book"
  | "arrow"
  | "refresh"
  | "info";

const CONNECTED_COURSES_REFERENCE = "/images/portal-docente/frames/connected-courses-reference.png";

function CourseIcon({ name, className = "h-5 w-5" }: { name: CourseIconName; className?: string }) {
  const paths: Record<CourseIconName, string> = {
    graduation: "M3 9.5 12 4l9 5.5-9 5.5-9-5.5Zm3.5 2.1V17c2.8 2.1 7.2 2.1 10 0v-5.4M21 10v5",
    users: "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20m6.5-9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm5.5-6.5a3 3 0 0 1 0 5.8M17 14.5h1a4 4 0 0 1 4 4V20",
    chart: "M4 19V9m6 10V5m6 14v-7m6 7V3",
    layers: "m12 3 9 4.5-9 4.5-9-4.5L12 3Zm-9 9 9 4.5 9-4.5M3 16.5l9 4.5 9-4.5",
    clipboard: "M8 4h8m-7 0v2h6V4m-8 0H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1M8 12h8m-8 4h5",
    book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Zm0 0v16M8 7h8",
    arrow: "m9 5 7 7-7 7",
    refresh: "M20 11a8 8 0 0 0-14.8-3L3 11m0 0V5m0 6h6m-3 2a8 8 0 0 0 14.8 3L21 13m0 0v6m0-6h-6",
    info: "M12 16v-4m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  };
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

function CourseReferenceBanner({ curso }: { curso: PortalCurso }) {
  const bannerClass =
    curso.id === "enfermeria"
      ? "portal-course-reference-banner--enfermeria"
      : curso.id === "electricidad"
        ? "portal-course-reference-banner--electricidad"
        : "portal-course-reference-banner--climatizacion";

  return (
    <div
      role="img"
      aria-label={`Imagen de ${curso.title}`}
      className={`portal-course-reference-banner ${bannerClass} h-40 w-full bg-no-repeat sm:h-44 lg:h-48`}
      style={{
        backgroundImage: `url(${CONNECTED_COURSES_REFERENCE})`,
      }}
    />
  );
}

function CourseMetricsCard({ curso, refreshKey = 0 }: { curso: PortalCurso; refreshKey?: number }) {
  const state = useCourseMetrics(curso.metricsApiPath, refreshKey);

  return (
    <article
      className={`portal-course-card flex flex-col rounded-[1.7rem] border p-4 sm:p-5 ${COLOR_CARD[curso.color]}`}
    >
      <div className="mb-4 overflow-hidden rounded-[1.45rem] bg-white/70 ring-1 ring-black/5">
        <CourseReferenceBanner curso={curso} />
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wide ${COLOR_ACCENT[curso.color]}`}>
            {curso.specialty}
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-[var(--portal-heading-strong,#082b70)]">{curso.title}</h3>
          <p className="mt-1 text-sm text-[var(--aula-text-muted,#5e7596)]">
            {curso.level} · {curso.statusLabel}
          </p>
        </div>
        {state.status === "ok" && state.data.source === "live" ? (
          <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
            Real
          </span>
        ) : state.status === "ok" && state.data.source === "static" ? (
          <span className="rounded-full bg-sky-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
            Hub
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {state.status === "loading" ? (
          <p className="col-span-2 rounded-2xl bg-white/65 px-3 py-3 text-sm text-[var(--aula-text-muted,#5e7596)]">Cargando métricas…</p>
        ) : state.status === "error" ? (
          <div className="col-span-2 flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/85 px-3 py-3 text-sm text-rose-600">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
              <CourseIcon name="info" className="h-3.5 w-3.5" />
            </span>
            <p><span className="font-bold">No disponible:</span> {state.message}</p>
          </div>
        ) : (
          <>
            <Metric
              label="Cantidad de estudiantes"
              value={String(state.data.totals.students)}
              icon="users"
            />
            <Metric
              label="Porcentaje de logro % (promedio)"
              value={
                formatPct(state.data.totals.average_progress)
              }
              icon="chart"
            />
            <Metric label="Módulos" value={String(state.data.totals.modules)} icon="layers" />
            <Metric
              label="Actividades"
              value={
                state.data.totals.activity_completion != null
                  ? `${formatPct(state.data.totals.activity_completion)} compl.`
                  : String(state.data.totals.activities ?? "—")
              }
              icon="clipboard"
            />
          </>
        )}
      </div>

      <a
        href={curso.studentHref}
        target="_blank"
        rel="noopener noreferrer"
        className="portal-button portal-button-primary mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(34,111,226,.18)]"
      >
        <CourseIcon name="book" className="h-5 w-5" />
        Abrir curso estudiante
        <CourseIcon name="arrow" className="h-5 w-5" />
      </a>
    </article>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: Extract<CourseIconName, "users" | "chart" | "layers" | "clipboard">;
}) {
  return (
    <div className="flex min-h-[4.25rem] items-center gap-2.5 rounded-2xl bg-white/75 px-3 py-2.5 ring-1 ring-black/5">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
        <CourseIcon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-[var(--aula-text-muted,#5e7596)]">
          {label}
        </p>
        <p className="mt-0.5 text-base font-extrabold tabular-nums text-[var(--portal-heading-strong,#082b70)]">{value}</p>
      </div>
    </div>
  );
}

function useLiveKpis() {
  const enf = useCourseMetrics("/api/portal/metrics/enfermeria");
  const elec = useCourseMetrics("/api/portal/metrics/electricidad");
  const clim = useCourseMetrics("/api/portal/metrics/climatizacion");

  return useMemo(() => {
    const parts = [enf, elec, clim].filter(
      (s): s is { status: "ok"; data: InstitutionalMetrics } => s.status === "ok",
    );
    const loading = [enf, elec, clim].some((s) => s.status === "loading");
    if (loading && parts.length === 0) {
      return {
        mode: "loading" as const,
        cursosActivos: PORTAL_CURSOS.filter((c) => c.metricsApiPath).length,
        estudiantes: 0,
        actividadesPendientes: 0,
        promedioGeneralPct: 0,
      };
    }
    if (parts.length === 0) {
      return {
        mode: "error" as const,
        cursosActivos: PORTAL_CURSOS.filter((c) => c.metricsApiPath).length,
        estudiantes: 0,
        actividadesPendientes: 0,
        promedioGeneralPct: 0,
      };
    }
    const students = parts.reduce((acc, p) => acc + p.data.totals.students, 0);
    const weighted = parts.reduce(
      (acc, p) => acc + (p.data.totals.average_progress ?? 0) * p.data.totals.students,
      0,
    );
    const avg = students > 0 ? weighted / students : 0;
    const actividadesPendientes = Math.max(
      0,
      Math.round(
        parts.reduce((acc, p) => {
          const tot = p.data.totals;
          return (
            acc +
            ((100 - (tot.activity_completion ?? 0)) / 100) * (tot.activities ?? 0)
          );
        }, 0),
      ),
    );
    return {
      mode: "live" as const,
      cursosActivos: parts.length,
      estudiantes: students,
      actividadesPendientes,
      promedioGeneralPct: Math.round(avg),
    };
  }, [enf, elec, clim]);
}

export function ConnectedCursosGrid() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="portal-connected-courses space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-blue-200 bg-blue-50 text-blue-600 shadow-sm">
            <CourseIcon name="graduation" className="h-9 w-9" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-[var(--portal-heading-strong,#082b70)] sm:text-3xl">Cursos conectados</h2>
            <p className="mt-1 text-sm text-[var(--aula-text-muted,#5e7596)] sm:text-base">
            Métricas en vivo desde LMS. Cada tarjeta conserva el estado real de su curso.
            </p>
            <span className="mt-2 block h-1 w-11 rounded-full bg-gradient-to-r from-blue-500 to-violet-400" aria-hidden="true" />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="portal-button portal-button-secondary inline-flex min-h-12 items-center gap-3 rounded-full border-2 px-5 py-2.5 text-sm font-extrabold"
        >
          <CourseIcon name="refresh" className="h-6 w-6 text-blue-600" />
          Actualizar métricas
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {PORTAL_CURSOS.filter((c) => c.metricsApiPath).map((c) => (
          <CourseMetricsCard key={c.id} curso={c} refreshKey={refreshKey} />
        ))}
      </div>
    </div>
  );
}

export function LiveKpiRow() {
  const kpi = useLiveKpis();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--aula-text-muted,#5e7596)]">
        {kpi.mode === "live" ? (
          <>
            <DataBadge kind="live" />
            <span>KPIs desde métricas reales del LMS.</span>
          </>
        ) : kpi.mode === "loading" ? (
          <span>Cargando métricas del LMS…</span>
        ) : (
          <span>No se pudieron cargar las métricas del LMS.</span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Cantidad de cursos activos" value={String(kpi.cursosActivos)} />
        <KpiCard
          label="Cantidad de estudiantes registrados (LMS)"
          value={String(kpi.estudiantes)}
        />
        <KpiCard
          label="Cantidad estimada de actividades pendientes"
          value={String(kpi.actividadesPendientes)}
        />
        <ChartPanel className="flex items-center justify-center !p-4">
          <MiniDonut
            pct={kpi.promedioGeneralPct}
            label="Porcentaje de logro % (promedio LMS)"
            color={CHART_HEX.teal}
          />
        </ChartPanel>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--aula-line,#d9e5f6)] bg-white p-5 shadow-[var(--shadow-sm)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--aula-text-muted,#5e7596)]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--aula-text,#082b80)]">{value}</p>
    </div>
  );
}

export function CursosVivosList() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Cursos vivos publicados</h2>
      <p className="mt-1 text-xs text-slate-600">
        Especialidades publicadas. Las métricas de Enfermería, Electricidad y
        Climatización salen del LMS.
      </p>
      <ul className="mt-4 divide-y divide-slate-100">
        {PORTAL_CURSOS.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{c.title}</p>
              <p className="text-xs text-slate-600">
                {c.specialty} · {c.level} · {c.statusLabel}
              </p>
            </div>
            <a
              href={c.studentHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-brand-50 hover:text-brand-800"
            >
              Abrir curso
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CumplimientoView() {
  type Vista = "nivel" | "curso" | "estudiante";
  const [refreshKey, setRefreshKey] = useState(0);
  const [vista, setVista] = useState<Vista>("nivel");
  const [carrera, setCarrera] = useState<"Todas" | "enfermeria" | "electricidad" | "climatizacion">(
    "Todas",
  );
  const [nivel, setNivel] = useState("Todos");
  const [oaFiltro, setOaFiltro] = useState("Todos");
  const { estudiantes } = useLivePortal();
  const enf = useCourseMetrics("/api/portal/metrics/enfermeria", refreshKey);
  const elec = useCourseMetrics("/api/portal/metrics/electricidad", refreshKey);
  const clim = useCourseMetrics("/api/portal/metrics/climatizacion", refreshKey);

  const bloques = [
    {
      id: "enfermeria" as const,
      title: "Atención de Enfermería",
      href: "https://aulatpchile.cl/portal/simuladores/atencion_enfermeria/",
      state: enf,
    },
    {
      id: "electricidad" as const,
      title: "Electricidad 3° Medio",
      href: "https://aulatpchile.cl/portal/simuladores/electricidad_3_medio/",
      state: elec,
    },
    {
      id: "climatizacion" as const,
      title: "Refrigeración y Climatización",
      href: "https://aulatpchile.cl/curso/climatizacion",
      state: clim,
    },
  ];
  const visibles = bloques.filter((b) => carrera === "Todas" || b.id === carrera);
  const okStates = visibles.filter((b) => b.state.status === "ok");
  const studentsN = okStates.reduce(
    (acc, b) => acc + (b.state.status === "ok" ? b.state.data.totals.students : 0),
    0,
  );
  const avanceAvg =
    studentsN === 0
      ? 0
      : Math.round(
          okStates.reduce((acc, b) => {
            if (b.state.status !== "ok") return acc;
            return acc + (b.state.data.totals.average_progress ?? 0) * b.state.data.totals.students;
          }, 0) / studentsN,
        );
  const actAvg =
    okStates.length === 0
      ? 0
      : Math.round(
          okStates.reduce(
            (acc, b) =>
              acc + (b.state.status === "ok" ? (b.state.data.totals.activity_completion ?? 0) : 0),
            0,
          ) / okStates.length,
        );
  const intAvg =
    okStates.length === 0
      ? 0
      : Math.round(
          okStates.reduce(
            (acc, b) =>
              acc +
              (b.state.status === "ok"
                ? (b.state.data.totals.integrator_average_progress ?? 0)
                : 0),
            0,
          ) / okStates.length,
        );
  const oaCodes = Array.from(
    new Set(
      okStates.flatMap((b) =>
        b.state.status === "ok"
          ? b.state.data.modules.map((m) => m.oa_code).filter((x): x is string => Boolean(x))
          : [],
      ),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));
  const oaBars = okStates.flatMap((b) =>
    b.state.status === "ok"
      ? b.state.data.modules
          .filter((m) => oaFiltro === "Todos" || (m.oa_code ?? "").includes(oaFiltro))
          .map((m) => ({
            label: `${m.oa_code ?? m.code} · ${b.title.split(" ")[0]}`,
            value: Math.round(m.average_progress ?? 0),
            color: BANDA_LOGRO_COLOR[bandaFromPct(m.average_progress ?? 0)],
          }))
      : [],
  );
  const recorteEstudiantes = estudiantes.filter((e) => {
    if (nivel !== "Todos") {
      const n = e.curso.match(/([2-4])\s*°/)?.[1];
      if (`${n}° Medio` !== nivel) return false;
    }
    if (carrera === "enfermeria") return /enferm/i.test(e.curso);
    if (carrera === "electricidad") return especialidadFromCurso(e.curso) === "Electricidad";
    if (carrera === "climatizacion")
      return especialidadFromCurso(e.curso) === "Refrigeración y Climatización";
    return true;
  });
  const porCurso = (() => {
    const map = new Map<string, typeof estudiantes>();
    for (const e of recorteEstudiantes) {
      const list = map.get(e.curso);
      if (list) list.push(e);
      else map.set(e.curso, [e]);
    }
    return Array.from(map.entries()).map(([key, estudiantes]) => ({
      key,
      estudiantes,
      avg:
        estudiantes.length === 0
          ? 0
          : Math.round(
              estudiantes.reduce((acc, x) => acc + x.avancePct, 0) / estudiantes.length,
            ),
    }));
  })();
  const stats = tendenciaCentral(recorteEstudiantes.map((e) => e.avancePct));
  const oaBarsNivel = oaPctBars(recorteEstudiantes);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionIntro
          title="Cumplimiento"
          purpose="Eje principal: cumplimiento de Objetivos de Aprendizaje (OA), actividades e integradores. Revisa por nivel, por curso o por estudiante."
        />
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="rounded-xl border-2 border-brand-600 bg-white px-4 py-2 text-sm font-bold text-brand-800 shadow-sm hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Actualizar métricas
        </button>
      </div>

      <PerspectiveTabs
        label="Perspectiva de cumplimiento"
        value={vista}
        onChange={setVista}
        options={[
          { id: "nivel", label: "Por nivel" },
          { id: "curso", label: "Por curso" },
          { id: "estudiante", label: "Por estudiante" },
        ]}
      />

      <div className="flex flex-wrap gap-3">
        <label className="text-xs font-semibold text-slate-700">
          Carrera
          <select
            value={carrera}
            onChange={(e) => setCarrera(e.target.value as typeof carrera)}
            className="mt-1 block min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="Todas">Todas</option>
            <option value="enfermeria">Atención de Enfermería</option>
            <option value="electricidad">Electricidad</option>
            <option value="climatizacion">Refrigeración y Climatización</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Nivel
          <select
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            className="mt-1 block min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="Todos">Todos</option>
            <option value="2° Medio">2° Medio</option>
            <option value="3° Medio">3° Medio</option>
            <option value="4° Medio">4° Medio</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">
          OA
          <select
            value={oaFiltro}
            onChange={(e) => setOaFiltro(e.target.value)}
            className="mt-1 block min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="Todos">Todos los OA</option>
            {oaCodes.map((oa) => (
              <option key={oa} value={oa}>
                {oa}
              </option>
            ))}
          </select>
        </label>
      </div>

      <KpiStrip
        items={[
          {
            label: "Porcentaje de logro % (promedio LMS)",
            value: `${avanceAvg}`,
            hint: `${pluralEstudiantes(studentsN)} en cursos vivos del recorte`,
          },
          {
            label: "Actividades completadas",
            value: `${actAvg}%`,
            hint: "Promedio de cumplimiento de actividades",
          },
          {
            label: "Cumplimiento del integrador",
            value: `${intAvg}%`,
            hint: "Avance promedio de actividades integradoras",
          },
          {
            label: "Porcentaje de logro % (estudiantes LMS)",
            value: `${stats.media}`,
            hint: `Mediana ${stats.mediana} · moda ${stats.moda ?? "—"}`,
          },
        ]}
      />

      <TendenciaCard stats={stats} />

      {oaBars.length > 0 ? (
        <ChartPanel
          title="Cumplimiento por OA (cursos vivos)"
          subtitle="Comparación: OA vs Porcentaje de logro % del módulo asociado."
        >
          <BarChart
            title="Porcentaje de logro % por OA / módulo"
            yAxisTitle="Porcentaje de logro %"
            xAxisTitle="OA · curso"
            valueSuffix="%"
            items={oaBars.slice(0, 14)}
          />
        </ChartPanel>
      ) : null}

      {vista === "nivel" ? (
        <ChartPanel
          title="Cumplimiento de OA en el nivel"
          subtitle="Visión agregada del recorte LMS. Unidad: Porcentaje de logro %."
        >
          <BarChart
            title="Porcentaje de logro % por OA del nivel"
            yAxisTitle="Porcentaje de logro %"
            xAxisTitle="OA"
            valueSuffix="%"
            items={oaBarsNivel.map((item) => ({
              ...item,
              color: BANDA_LOGRO_COLOR[bandaFromPct(item.value)],
            }))}
          />
        </ChartPanel>
      ) : null}

      {vista === "curso" ? <CursoComparePanel grupos={porCurso} /> : null}

      {vista === "estudiante" ? (
        <EstudiantePriorityPanel
          estudiantes={recorteEstudiantes}
          total={recorteEstudiantes.length}
        />
      ) : null}

      {visibles.map((b) => (
        <CumplimientoCourseBlock
          key={b.id}
          title={b.title}
          href={b.href}
          state={b.state}
          oaFiltro={oaFiltro}
        />
      ))}
    </div>
  );
}

function CumplimientoCourseBlock({
  title,
  href,
  state,
  oaFiltro = "Todos",
}: {
  title: string;
  href: string;
  state: FetchState;
  oaFiltro?: string;
}) {
  const avance = state.status === "ok" ? state.data.totals.average_progress ?? 0 : 0;
  const actividades =
    state.status === "ok" ? state.data.totals.activity_completion ?? 0 : 0;
  const integrador =
    state.status === "ok" ? state.data.totals.integrator_average_progress ?? 0 : 0;
  const modules =
    state.status === "ok"
      ? state.data.modules.filter(
          (m) => oaFiltro === "Todos" || (m.oa_code ?? "").includes(oaFiltro),
        )
      : [];

  return (
    <div className="rounded-2xl border border-[var(--aula-line,#d9e5f6)] bg-white p-5 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-[var(--aula-text,#082b80)]">{title}</h2>
            {state.status === "ok" ? (
              <DataBadge kind={state.data.source === "live" ? "live" : "hub"} />
            ) : null}
          </div>
          {state.status === "loading" ? (
            <p className="mt-1 text-sm text-[var(--aula-text-muted,#5e7596)]">Cargando métricas…</p>
          ) : state.status === "error" ? (
            <p className="mt-1 text-sm text-[var(--aula-danger-ink,#a2334d)]">{state.message}</p>
          ) : (
            <p className="mt-1 text-sm text-[var(--aula-text-secondary,#43628f)]">
              {pluralEstudiantes(state.data.totals.students)} · Porcentaje de logro{" "}
              {formatPct(state.data.totals.average_progress)} · actividades{" "}
              {formatPct(state.data.totals.activity_completion)} · integrador{" "}
              {formatPct(state.data.totals.integrator_average_progress)} (
              {state.data.totals.integrator_completed}/
              {state.data.totals.integrator_total} estudiantes)
            </p>
          )}
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-[var(--aula-line,#d9e5f6)] bg-[var(--aula-surface-soft,#f5f9fe)] px-3 py-2 text-xs font-semibold text-[var(--aula-text,#082b80)] hover:bg-[var(--aula-surface-tint,#edf6ff)]"
        >
          Abrir curso
        </a>
      </div>

      {state.status === "ok" ? (
        <>
          <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-[var(--aula-line,#d9e5f6)] bg-[var(--aula-surface-soft,#f5f9fe)] p-4">
            <MiniDonut pct={avance} label="Porcentaje de logro %" color={CHART_HEX.blue} size={76} />
            <MiniDonut pct={actividades} label="Actividades" color={CHART_HEX.teal} size={76} />
            <MiniDonut pct={integrador} label="Integrador" color={CHART_HEX.violet} size={76} />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--aula-line,#d9e5f6)] text-xs uppercase tracking-wide text-[var(--aula-text-muted,#5e7596)]">
                  <th className="px-2 py-2">Módulo</th>
                  <th className="px-2 py-2">OA</th>
                  <th className="px-2 py-2">Avance</th>
                  <th className="px-2 py-2">Cantidad de actividades</th>
                  <th className="px-2 py-2">Estudiantes completados</th>
                  <th className="px-2 py-2">Porcentaje de logro %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--aula-line,#d9e5f6)]">
                {modules.map((m) => (
                  <tr key={m.id}>
                    <td className="px-2 py-2 font-medium text-[var(--aula-text,#082b80)]">
                      {m.code} · {m.short_title || m.title}
                    </td>
                    <td className="px-2 py-2 text-[var(--aula-text-secondary,#43628f)]">
                      {m.oa_code ?? "—"}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-[var(--aula-surface-tint,#edf6ff)]">
                          <div
                            className="h-full rounded-full bg-[var(--aula-blue,#0870ef)]"
                            style={{
                              width: `${Math.min(100, Math.max(0, m.average_progress ?? 0))}%`,
                            }}
                          />
                        </div>
                        <span className="tabular-nums text-xs font-semibold text-[var(--aula-text,#082b80)]">
                          {formatPct(m.average_progress)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 tabular-nums text-[var(--aula-text,#082b80)]">
                      {m.activity_count ?? "—"}
                    </td>
                    <td className="px-2 py-2 tabular-nums text-[var(--aula-text,#082b80)]">
                      {m.completed_enrollments != null
                        ? pluralEstudiantes(m.completed_enrollments)
                        : "0 estudiantes"}
                      {m.in_progress_enrollments
                        ? ` (+${pluralEstudiantes(m.in_progress_enrollments)} en curso)`
                        : ""}
                    </td>
                    <td className="px-2 py-2 tabular-nums text-[var(--aula-text,#082b80)]">
                      {m.average_score != null ? formatPct(m.average_score) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
