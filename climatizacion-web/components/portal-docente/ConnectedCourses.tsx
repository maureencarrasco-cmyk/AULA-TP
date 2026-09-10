"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  COLOR_ACCENT,
  COLOR_CARD,
  PORTAL_CURSOS,
  buildClimatizacionStaticMetrics,
  type InstitutionalMetrics,
  type PortalCurso,
} from "@/lib/portal-cursos";
import { KPI } from "@/lib/demo-data";
import { ChartPanel, CHART_HEX, DataBadge, MiniDonut } from "./charts";

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
      setState({ status: "ok", data: buildClimatizacionStaticMetrics() });
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

function CourseMetricsCard({ curso, refreshKey = 0 }: { curso: PortalCurso; refreshKey?: number }) {
  const state = useCourseMetrics(curso.metricsApiPath, refreshKey);

  return (
    <article
      className={`flex flex-col rounded-2xl border p-5 shadow-sm ${COLOR_CARD[curso.color]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${COLOR_ACCENT[curso.color]}`}>
            {curso.specialty}
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{curso.title}</h3>
          <p className="mt-0.5 text-xs text-slate-600">
            {curso.level} · {curso.statusLabel}
          </p>
        </div>
        {state.status === "ok" && state.data.source === "live" ? (
          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Real
          </span>
        ) : state.status === "ok" && state.data.source === "static" ? (
          <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Hub
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {state.status === "loading" ? (
          <p className="col-span-2 text-xs text-slate-500">Cargando métricas…</p>
        ) : state.status === "error" ? (
          <p className="col-span-2 text-xs text-rose-700">
            No disponible: {state.message}
          </p>
        ) : (
          <>
            <Metric
              label="Estudiantes"
              value={String(state.data.totals.students)}
            />
            <Metric
              label="Avance promedio"
              value={
                formatPct(state.data.totals.average_progress)
              }
            />
            <Metric label="Módulos" value={String(state.data.totals.modules)} />
            <Metric
              label="Actividades"
              value={
                state.data.totals.activity_completion != null
                  ? `${formatPct(state.data.totals.activity_completion)} compl.`
                  : String(state.data.totals.activities ?? "—")
              }
            />
          </>
        )}
      </div>

      <a
        href={curso.studentHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[linear-gradient(100deg,#0747bb,#0878ea)] px-3 py-2 text-sm font-bold text-white shadow-[0_8px_18px_rgba(0,77,185,0.22)] transition hover:brightness-110"
      >
        Abrir curso estudiante
      </a>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-black/5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function useLiveKpis() {
  const enf = useCourseMetrics("/api/portal/metrics/enfermeria");
  const elec = useCourseMetrics("/api/portal/metrics/electricidad");
  const clim = useCourseMetrics("/api/portal/metrics/climatizacion");

  return useMemo(() => {
    const liveOk =
      enf.status === "ok" && elec.status === "ok" && enf.data && elec.data;
    if (!liveOk) {
      return {
        mode: "demo" as const,
        cursosActivos: KPI.cursosActivos,
        estudiantes: KPI.estudiantes,
        actividadesPendientes: KPI.actividadesPendientes,
        promedioGeneralPct: KPI.promedioGeneralPct,
      };
    }
    const climData = clim.status === "ok" ? clim.data : null;
    const students =
      enf.data.totals.students +
      elec.data.totals.students +
      (climData?.totals.students ?? 0);
    const weighted =
      enf.data.totals.average_progress * enf.data.totals.students +
      elec.data.totals.average_progress * elec.data.totals.students +
      (climData
        ? climData.totals.average_progress * climData.totals.students
        : 0);
    const avg = students > 0 ? weighted / students : 0;
    return {
      mode: "live" as const,
      cursosActivos: PORTAL_CURSOS.length,
      estudiantes: students,
      actividadesPendientes: Math.max(
        0,
        Math.round(
          ((100 - (enf.data.totals.activity_completion ?? 0)) / 100) *
            (enf.data.totals.activities ?? 0) +
            ((100 - (elec.data.totals.activity_completion ?? 0)) / 100) *
              (elec.data.totals.activities ?? 0) +
            (climData
              ? ((100 - (climData.totals.activity_completion ?? 0)) / 100) *
                (climData.totals.activities ?? 0)
              : 0),
        ),
      ),
      promedioGeneralPct: Math.round(avg),
    };
  }, [enf, elec, clim]);
}

export function ConnectedCursosGrid() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Cursos conectados</h2>
          <p className="mt-0.5 text-xs text-slate-600">
            Métricas en vivo desde LMS (Enfermería, Electricidad y Climatización).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="rounded-lg border-2 border-brand-600 bg-white px-3 py-1.5 text-xs font-bold text-brand-800 hover:bg-brand-50"
          >
            Actualizar métricas
          </button>
          <Link
            href="/portal-docente/cumplimiento"
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            Ver cumplimiento →
          </Link>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {PORTAL_CURSOS.map((c) => (
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
            <span>KPIs desde métricas reales (Enfermería + Electricidad + Climatización LMS).</span>
          </>
        ) : (
          <>
            <DataBadge kind="demo" />
            <span>KPIs en modo demo (fallback mientras cargan o fallan las APIs).</span>
          </>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Cursos activos" value={String(kpi.cursosActivos)} />
        <KpiCard label="Estudiantes (LMS)" value={String(kpi.estudiantes)} />
        <KpiCard
          label="Actividades pendientes (est.)"
          value={String(kpi.actividadesPendientes)}
        />
        <ChartPanel className="flex items-center justify-center !p-4">
          <MiniDonut
            pct={kpi.promedioGeneralPct}
            label="Avance promedio LMS"
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
        Especialidades con acceso estudiante en producción. Enfermería y Electricidad
        usan LMS en vivo (Enfermería, Electricidad y Climatización).
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
  const [refreshKey, setRefreshKey] = useState(0);
  const enf = useCourseMetrics("/api/portal/metrics/enfermeria", refreshKey);
  const elec = useCourseMetrics("/api/portal/metrics/electricidad", refreshKey);
  const clim = useCourseMetrics("/api/portal/metrics/climatizacion", refreshKey);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Cumplimiento</h1>
          <p className="mt-1 text-sm text-slate-600">
            Avance institucional por curso vivo: progreso, actividades e integradores
            (Enfermería / Electricidad / Climatización LMS).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="rounded-xl border-2 border-brand-600 bg-white px-4 py-2 text-sm font-bold text-brand-800 shadow-sm hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Actualizar métricas
        </button>
      </div>

      <CumplimientoCourseBlock
        title="Atención de Enfermería"
        href="https://aulatpchile.cl/portal/simuladores/atencion_enfermeria/"
        state={enf}
      />
      <CumplimientoCourseBlock
        title="Electricidad 3° Medio"
        href="https://aulatpchile.cl/portal/simuladores/electricidad_3_medio/"
        state={elec}
      />
      <CumplimientoCourseBlock
        title="Refrigeración y Climatización"
        href="https://aulatpchile.cl/curso/climatizacion"
        state={clim}
      />
    </div>
  );
}

function CumplimientoCourseBlock({
  title,
  href,
  state,
}: {
  title: string;
  href: string;
  state: FetchState;
}) {
  const avance = state.status === "ok" ? state.data.totals.average_progress ?? 0 : 0;
  const actividades =
    state.status === "ok" ? state.data.totals.activity_completion ?? 0 : 0;
  const integrador =
    state.status === "ok" ? state.data.totals.integrator_average_progress ?? 0 : 0;

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
              {state.data.totals.students} estudiantes · avance{" "}
              {formatPct(state.data.totals.average_progress)} · actividades{" "}
              {formatPct(state.data.totals.activity_completion)} · integrador{" "}
              {formatPct(state.data.totals.integrator_average_progress)} (
              {state.data.totals.integrator_completed}/
              {state.data.totals.integrator_total})
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
            <MiniDonut pct={avance} label="Avance" color={CHART_HEX.blue} size={76} />
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
                  <th className="px-2 py-2">Actividades</th>
                  <th className="px-2 py-2">Completados</th>
                  <th className="px-2 py-2">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--aula-line,#d9e5f6)]">
                {state.data.modules.map((m) => (
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
                      {m.completed_enrollments ?? 0}
                      {m.in_progress_enrollments
                        ? ` (+${m.in_progress_enrollments} en curso)`
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
