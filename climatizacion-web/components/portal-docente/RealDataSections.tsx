"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  PORTAL_CURSOS,
  type InstitutionalMetrics,
  type PortalCurso,
} from "@/lib/portal-cursos";
import {
  ConnectedCursosGrid,
  CursosVivosList,
  LiveKpiRow,
} from "./ConnectedCourses";
import { SchedulePlanner } from "./SchedulePlanner";
import { BrowserSaveHint, usePortalStore } from "./usePortalStore";
import { BarChart, MiniDonut } from "./charts";

type FetchState =
  | { status: "loading" }
  | { status: "ok"; data: InstitutionalMetrics }
  | { status: "error"; message: string };

function useMetrics(path: string): FetchState {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetch(path)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            (body as { error?: string }).error || `HTTP ${res.status}`,
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
  }, [path]);
  return state;
}

function useAllCourseMetrics() {
  const paths = PORTAL_CURSOS.map((c) => c.metricsApiPath).filter(
    Boolean,
  ) as string[];
  const a = useMetrics(paths[0] || "/api/portal/metrics/enfermeria");
  const b = useMetrics(paths[1] || "/api/portal/metrics/electricidad");
  const c = useMetrics(paths[2] || "/api/portal/metrics/climatizacion");
  return useMemo(() => {
    const states = [a, b, c];
    const byId: Record<string, FetchState> = {};
    PORTAL_CURSOS.forEach((curso, i) => {
      byId[curso.id] = states[i] || { status: "loading" };
    });
    return { byId, states, allOk: states.every((s) => s.status === "ok") };
  }, [a, b, c]);
}

function formatPct(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(n * 10) / 10}%`;
}

function LiveStudentsTotal() {
  const { states } = useAllCourseMetrics();
  const total = states.reduce((acc, s) => {
    if (s.status === "ok") return acc + (s.data.totals.students || 0);
    return acc;
  }, 0);
  const loading = states.some((s) => s.status === "loading");
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Estudiantes (LMS vivos)
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
        {loading ? "…" : total}
      </p>
      <p className="mt-1 text-[11px] text-slate-500">
        Suma de matrículas activas en Enfermería, Electricidad y Climatización.
      </p>
    </div>
  );
}

function ResumenStoreCounts() {
  const { planificacion, hydrated } = usePortalStore();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Bloques en horario
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
          {hydrated ? planificacion.length : "…"}
        </p>
        <BrowserSaveHint className="mt-1" />
      </div>
      <LiveStudentsTotal />
    </div>
  );
}

export function ResumenView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Resumen</h1>
        <p className="mt-1 text-sm text-slate-600">
          Solo métricas reales desde LMS / hub de cursos conectados.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/portal-docente/cursos"
          className="rounded-xl border-2 border-brand-600 bg-brand-50 px-4 py-2 text-sm font-bold text-brand-800 hover:bg-brand-100"
        >
          Ir a Cursos / Planificación
        </Link>
        <Link
          href="/portal-docente/estudiantes"
          className="rounded-xl border-2 border-brand-600 bg-white px-4 py-2 text-sm font-bold text-brand-800 hover:bg-brand-50"
        >
          Ir a Estudiantes
        </Link>
        <Link
          href="/portal-docente/cumplimiento"
          className="rounded-xl border-2 border-brand-600 bg-white px-4 py-2 text-sm font-bold text-brand-800 hover:bg-brand-50"
        >
          Ir a Cumplimiento
        </Link>
      </div>

      <ResumenStoreCounts />
      <LiveKpiRow />
      <ConnectedCursosGrid />

      <ModuleProgressLive />
    </div>
  );
}

function ModuleProgressLive() {
  const { byId } = useAllCourseMetrics();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">
        Avance real por módulo
      </h2>
      <p className="mt-1 text-xs text-slate-600">
        Promedio LMS por módulo en cada curso conectado.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {PORTAL_CURSOS.map((curso) => {
          const st = byId[curso.id];
          return (
            <div key={curso.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {curso.title}
              </p>
              {st?.status === "loading" ? (
                <p className="mt-2 text-xs text-slate-500">Cargando…</p>
              ) : st?.status === "error" ? (
                <p className="mt-2 text-xs text-rose-700">{st.message}</p>
              ) : st?.status === "ok" ? (
                <ul className="mt-2 space-y-2">
                  {st.data.modules.map((m) => (
                    <li key={m.id} className="text-xs text-slate-700">
                      <div className="flex justify-between gap-2 font-medium">
                        <span className="truncate">
                          M{m.sequence} · {m.short_title || m.title}
                        </span>
                        <span className="tabular-nums">
                          {formatPct(m.average_progress)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{
                            width: `${Math.max(0, Math.min(100, m.average_progress ?? 0))}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CursosView() {
  const {
    planificacion,
    setPlanificacion,
    resetPlanificacion,
    savedFlash,
    hydrated,
  } = usePortalStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Mis cursos / Planificación
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Cursos vivos en producción y horario editable (guardado local del
          docente). Sin catálogos de ejemplo.
        </p>
      </div>

      <CursosVivosList />
      <ConnectedCursosGrid />

      {hydrated ? (
        <SchedulePlanner
          planificacion={planificacion}
          onChange={setPlanificacion}
          onReset={resetPlanificacion}
          savedFlash={savedFlash}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Cargando horario…
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        <LegendDot className="bg-teal-500" label="Enfermería (viva)" />
        <LegendDot className="bg-brand-500" label="Electricidad (viva)" />
        <LegendDot className="bg-sky-500" label="Climatización (viva)" />
        <LegendDot className="bg-amber-500" label="Taller / simulador" />
        <LegendDot className="bg-violet-500" label="Evaluación" />
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} aria-hidden="true" />
      {label}
    </span>
  );
}

export function EstudiantesView() {
  const { byId, states } = useAllCourseMetrics();
  const total = states.reduce(
    (acc, s) => (s.status === "ok" ? acc + s.data.totals.students : acc),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Estudiantes
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Matrícula y avance institucional reales. El listado nominativo no está
          expuesto por la API LMS; se muestra el resumen por curso.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-950">
        Total matrículas activas:{" "}
        <strong className="tabular-nums">{total || "…"}</strong>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PORTAL_CURSOS.map((curso) => (
          <CourseEnrollmentCard key={curso.id} curso={curso} state={byId[curso.id]} />
        ))}
      </div>
    </div>
  );
}

function CourseEnrollmentCard({
  curso,
  state,
}: {
  curso: PortalCurso;
  state: FetchState | undefined;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={curso.imagePath}
        alt=""
        className="aspect-[16/9] w-full object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h2 className="text-base font-bold text-slate-900">{curso.title}</h2>
        <p className="text-xs text-slate-600">
          {curso.level} · {curso.statusLabel}
        </p>
        {state?.status === "loading" ? (
          <p className="mt-3 text-xs text-slate-500">Cargando métricas…</p>
        ) : state?.status === "error" ? (
          <p className="mt-3 text-xs text-rose-700">{state.message}</p>
        ) : state?.status === "ok" ? (
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-slate-50 p-2">
              <dt className="text-[10px] font-semibold uppercase text-slate-500">
                Estudiantes
              </dt>
              <dd className="text-lg font-bold tabular-nums">
                {state.data.totals.students}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <dt className="text-[10px] font-semibold uppercase text-slate-500">
                Avance prom.
              </dt>
              <dd className="text-lg font-bold tabular-nums">
                {formatPct(state.data.totals.average_progress)}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <dt className="text-[10px] font-semibold uppercase text-slate-500">
                Activos
              </dt>
              <dd className="font-bold tabular-nums">
                {state.data.totals.active_enrollments}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <dt className="text-[10px] font-semibold uppercase text-slate-500">
                Completados
              </dt>
              <dd className="font-bold tabular-nums">
                {state.data.totals.completed_enrollments}
              </dd>
            </div>
          </dl>
        ) : null}
        <a
          href={curso.studentHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Abrir curso
        </a>
      </div>
    </article>
  );
}

type TraceRow = {
  course_name?: string;
  specialty?: string;
  module_name?: string;
  module_short_title?: string;
  learning_objective_code?: string;
  expected_learning_code?: string;
  expected_learning_title?: string;
  students?: number;
  attempts?: number;
  average_progress?: number;
  average_score?: number;
  evidence_state?: string;
};

export function OaAeView() {
  const enf = useMetrics("/api/portal/metrics/enfermeria");
  const elec = useMetrics("/api/portal/metrics/electricidad");
  const clim = useMetrics("/api/portal/metrics/climatizacion");

  const rows = useMemo(() => {
    const out: TraceRow[] = [];
    for (const st of [enf, elec]) {
      if (st.status !== "ok") continue;
      const matrix =
        (
          st.data as InstitutionalMetrics & {
            curricular_traceability?: { matrix?: TraceRow[] };
          }
        ).curricular_traceability?.matrix || [];
      out.push(...matrix);
    }
    if (clim.status === "ok") {
      for (const m of clim.data.modules) {
        out.push({
          course_name: clim.data.course.title,
          specialty: clim.data.course.specialty,
          module_name: m.title,
          module_short_title: m.short_title,
          learning_objective_code: m.oa_code,
          expected_learning_code: `M${m.sequence}`,
          expected_learning_title: m.title,
          students: clim.data.totals.students,
          attempts: m.attempts,
          average_progress: m.average_progress,
          average_score: m.average_score,
          evidence_state:
            (m.attempts ?? 0) > 0 ? "Con actividad LMS" : "Sin intentos aún",
        });
      }
    }
    return out;
  }, [enf, elec, clim]);

  const loading =
    enf.status === "loading" ||
    elec.status === "loading" ||
    clim.status === "loading";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">OA y AE</h1>
        <p className="mt-1 text-sm text-slate-600">
          Trazabilidad curricular real (módulo → OA/AE → evidencia) desde LMS.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando trazabilidad…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          No hay matriz curricular disponible en las APIs en este momento.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Curso</th>
                <th className="px-3 py-2">Módulo</th>
                <th className="px-3 py-2">OA</th>
                <th className="px-3 py-2">AE</th>
                <th className="px-3 py-2">Est.</th>
                <th className="px-3 py-2">Intentos</th>
                <th className="px-3 py-2">Avance</th>
                <th className="px-3 py-2">Evidencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, i) => (
                <tr key={`${r.expected_learning_code}-${r.module_name}-${i}`}>
                  <td className="px-3 py-2 text-slate-700">
                    {r.specialty || r.course_name}
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {r.module_short_title || r.module_name}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-brand-800">
                    {r.learning_objective_code || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">
                      {r.expected_learning_code}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {r.expected_learning_title}
                    </span>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{r.students ?? "—"}</td>
                  <td className="px-3 py-2 tabular-nums">{r.attempts ?? "—"}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {formatPct(r.average_progress)}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {r.evidence_state || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ReportesView() {
  const { byId, states } = useAllCourseMetrics();

  const moduleBars = useMemo(() => {
    const items: Array<{ label: string; value: number }> = [];
    for (const curso of PORTAL_CURSOS) {
      const st = byId[curso.id];
      if (st?.status !== "ok") continue;
      for (const m of st.data.modules) {
        items.push({
          label: `${curso.title.slice(0, 12)} · M${m.sequence}`,
          value: Math.round(m.average_progress ?? 0),
        });
      }
    }
    return items;
  }, [byId]);

  const scoreBars = useMemo(() => {
    return PORTAL_CURSOS.map((curso) => {
      const st = byId[curso.id];
      const v =
        st?.status === "ok" ? Math.round(st.data.totals.average_progress ?? 0) : 0;
      return { label: curso.title, value: v };
    });
  }, [byId]);

  const loading = states.some((s) => s.status === "loading");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Reportes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Reportes construidos solo con métricas LMS en vivo.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando reportes…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {PORTAL_CURSOS.map((curso) => {
              const st = byId[curso.id];
              const pct =
                st?.status === "ok" ? st.data.totals.average_progress ?? 0 : 0;
              return (
                <div
                  key={curso.id}
                  className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <MiniDonut pct={pct} label={curso.title} />
                  {st?.status === "ok" ? (
                    <p className="mt-2 text-xs text-slate-600">
                      {st.data.totals.students} est. ·{" "}
                      {st.data.totals.modules} módulos · fuente{" "}
                      <strong>{st.data.source}</strong>
                    </p>
                  ) : st?.status === "error" ? (
                    <p className="mt-2 text-xs text-rose-700">{st.message}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BarChart
              title="Avance promedio por curso (real)"
              yAxisTitle="%"
              items={scoreBars}
            />
          </div>

          {moduleBars.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <BarChart
                title="Avance promedio por módulo (real)"
                yAxisTitle="%"
                items={moduleBars}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
