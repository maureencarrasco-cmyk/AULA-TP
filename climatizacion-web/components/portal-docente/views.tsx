"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CATALOGO_OA,
  ESTADO_OA_AE_LABEL,
  especialidadFromCurso,
  getAeByCodigo,
  getOaByCodigo,
  oaCatalogKey,
  RECURSOS,
  type EstadoOaAe,
  type EstudianteDemo,
} from "@/lib/demo-data";
import { BarChart, ChartPanel, CHART_HEX, DonutChart, MiniDonut } from "./charts";
import {
  AlertList,
  KpiStrip,
  PerspectiveTabs,
  SectionIntro,
  TendenciaCard,
} from "./analytics";
import {
  CursoComparePanel,
  EstudiantePriorityPanel,
  NivelAggregatePanel,
  OaEstadoCantidadChart,
  CriteriosDeEvaluacionList,
} from "./perspective-panels";
import {
  ConnectedCursosGrid,
  CursosVivosList,
  CumplimientoView,
  LiveKpiRow,
} from "./ConnectedCourses";
import { LiveStatusNote, useLivePortal } from "./live-data";
import { SchedulePlanner } from "./SchedulePlanner";
import {
  BrowserSaveHint,
  usePortalStore,
  type EstudiantesTabId,
  type OaFiltroId,
} from "./usePortalStore";
import {
  BANDA_LOGRO_COLOR,
  BANDA_LOGRO_LABEL,
  bandaFromPct,
  catalogoOaDeGrupo,
  conteoOaGrupo,
  criteriosDeEvaluacion,
  estudiantesDeEspecialidad,
  oaCodesForGroup,
  pctLogroAe,
  pluralEstudiantes,
  tendenciaCentral,
} from "@/lib/portal-stats";

export { CumplimientoView };

const ESTADO_BADGE: Record<EstadoOaAe, string> = {
  logrado: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  en_progreso: "bg-amber-100 text-amber-900 ring-amber-200",
  no_iniciado: "bg-slate-100 text-slate-600 ring-slate-200",
};

function EstadoBadge({ estado }: { estado: EstadoOaAe }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${ESTADO_BADGE[estado]}`}
    >
      {ESTADO_OA_AE_LABEL[estado]}
    </span>
  );
}

function ResumenStoreCounts() {
  const { planificacion, hydrated } = usePortalStore();
  const { estudiantes, loading } = useLivePortal();
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
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Cantidad de estudiantes (LMS)
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
          {loading ? "…" : estudiantes.length}
        </p>
      </div>
    </div>
  );
}

export function ResumenView() {
  const { estudiantes } = useLivePortal();
  const pcts = estudiantes.map((e) => e.avancePct);
  const stats = tendenciaCentral(pcts);
  const bandas = estudiantes.reduce(
    (acc, e) => {
      acc[bandaFromPct(e.avancePct)] += 1;
      return acc;
    },
    { logrado: 0, medianamente_logrado: 0, en_proceso: 0, no_logrado: 0 },
  );
  const n = estudiantes.length || 1;
  const descendidos = [...estudiantes].sort((a, b) => a.avancePct - b.avancePct).slice(0, 5);
  const oaCriticos = CATALOGO_OA.map((oa) => ({
    oa,
    pct: conteoOaGrupo(estudiantes, oa.codigo).pct,
    conteo: conteoOaGrupo(estudiantes, oa.codigo),
  }))
    .filter((x) => x.conteo.total > 0)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 4);
  const porCurso = groupEstudiantesBy(estudiantes, (e) => e.curso)
    .slice()
    .sort((a, b) => a.avg - b.avg);

  return (
    <div className="space-y-6">
      <SectionIntro
        title="Panel general"
        purpose="Vista institucional para leer en segundos el estado de cursos, estudiantes, avance y cumplimiento. Desde aquí identificas alertas y entras al detalle por el menú lateral."
      />
      <LiveStatusNote />

      <ResumenStoreCounts />
      <LiveKpiRow />

      <KpiStrip
        items={[
          {
            label: "Porcentaje de logro % (media)",
            value: `${stats.media}`,
            hint: `Mediana ${stats.mediana} · moda ${stats.moda ?? "—"} · ${pluralEstudiantes(stats.n)}`,
          },
          {
            label: "Estudiantes en proceso o no logrados",
            value: String(bandas.en_proceso + bandas.no_logrado),
            hint: "Cantidad de estudiantes que requieren apoyo",
          },
          {
            label: "OA con menor porcentaje de logro",
            value: oaCriticos[0] ? `${oaCriticos[0].pct}%` : "—",
            hint: oaCriticos[0]
              ? `${oaCriticos[0].oa.codigo} · ${oaCriticos[0].oa.especialidad}`
              : "Sin evidencia LMS",
          },
          {
            label: "Cursos con menor avance",
            value: porCurso[0] ? `${porCurso[0].avg}%` : "—",
            hint: porCurso[0] ? porCurso[0].key : "Sin cursos",
          },
        ]}
      />

      <AlertList
        title="Focos prioritarios (30 segundos)"
        items={[
          ...porCurso.slice(0, 2).map((c) => ({
            id: `curso-${c.key}`,
            title: `Curso con menor avance: ${c.key}`,
            detail: `Avance promedio ${c.avg}% · ${pluralEstudiantes(c.estudiantes.length)}. Revisa Cumplimiento o Estudiantes para el detalle.`,
            tone: "warn" as const,
          })),
          ...oaCriticos.slice(0, 2).map((o) => ({
            id: `oa-${o.oa.especialidad}-${o.oa.codigo}`,
            title: `${o.oa.codigo} crítico · ${o.oa.especialidad}`,
            detail: `Porcentaje de logro ${o.pct}% · ${pluralEstudiantes(o.conteo.logrado)} logrados de ${o.conteo.total}.`,
            tone: "warn" as const,
          })),
          {
            id: "desc",
            title: `${pluralEstudiantes(descendidos.length)} con menor porcentaje de logro`,
            detail: descendidos
              .slice(0, 3)
              .map((e) => `${e.nombre} (${e.avancePct}%)`)
              .join(" · "),
            tone: "info" as const,
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel
          title="Distribución de estudiantes según nivel de logro"
          subtitle="Cantidad de estudiantes (no porcentaje) agrupados por banda de Porcentaje de logro %."
        >
          <DonutChart
            title="Cantidad de estudiantes por banda de logro institucional"
            centerLabel={String(estudiantes.length)}
            slices={(Object.keys(BANDA_LOGRO_LABEL) as Array<keyof typeof BANDA_LOGRO_LABEL>).map(
              (k) => ({
                label: BANDA_LOGRO_LABEL[k],
                pct: Math.round((bandas[k] / n) * 100),
                count: bandas[k],
                unit: "estudiantes",
                color: BANDA_LOGRO_COLOR[k],
              }),
            )}
          />
        </ChartPanel>
        <ChartPanel
          title="Avance promedio por curso"
          subtitle="Unidad: Porcentaje de logro % (promedio de estudiantes del curso)."
        >
          <BarChart
            title="Comparación de cursos · Porcentaje de logro %"
            yAxisTitle="Porcentaje de logro %"
            xAxisTitle="Curso"
            valueSuffix="%"
            items={porCurso.map((c) => ({
              label: c.key.replace("Medio ", "M. "),
              value: c.avg,
              color: BANDA_LOGRO_COLOR[bandaFromPct(c.avg)],
            }))}
          />
        </ChartPanel>
      </div>

      <TendenciaCard stats={stats} />

      <ConnectedCursosGrid />

      <div className="rounded-2xl border border-[var(--aula-line,#d9e5f6)] bg-[var(--aula-surface-tint,#edf6ff)] p-5 shadow-[var(--shadow-sm)]">
        <h2 className="text-sm font-semibold text-[var(--aula-text,#082b80)]">
          OA, AE y criterios de evaluación con menor logro
        </h2>
        <p className="mt-1 text-xs text-[var(--aula-text-muted,#5e7596)]">
          Lectura general del nivel: cantidad de estudiantes por estado del OA, no casos individuales.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {oaCriticos.length === 0 ? (
            <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              Sin evidencia LMS de OA en este momento.
            </li>
          ) : null}
          {oaCriticos.map(({ oa, conteo: c }) => {
            return (
              <li
                key={oaCatalogKey(oa.especialidad, oa.codigo)}
                className="rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  {oa.codigo}{" "}
                  <span className="font-medium text-slate-500">· {oa.especialidad}</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{oa.titulo}</p>
                <p className="mt-2 text-xs text-slate-600">
                  {pluralEstudiantes(c.logrado)} logrados · {pluralEstudiantes(c.en_progreso)} en
                  proceso · {pluralEstudiantes(c.no_iniciado)} no iniciados
                </p>
              </li>
            );
          })}
        </ul>
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
  const { estudiantes } = useLivePortal();
  const porCurso = groupEstudiantesBy(estudiantes, (e) => e.curso);

  return (
    <div className="space-y-6">
      <SectionIntro
        title="Cursos / Planificación"
        purpose="Cursos publicados, comparación de avance entre grupos y horario semanal asociado a OA/AE. El acceso estudiantil único es el catálogo /portal/cursos/."
      />
      <LiveStatusNote />

      <CursosVivosList />

      <CursoComparePanel grupos={porCurso} />

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
        <LegendDot className="bg-brand-500" label="Electricidad" />
        <LegendDot className="bg-emerald-500" label="Administración" />
        <LegendDot className="bg-sky-500" label="Refrigeración y Climatización" />
        <LegendDot className="bg-amber-500" label="Taller / simulador" />
        <LegendDot className="bg-violet-500" label="Evaluación / normativa" />
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

function nivelFromCurso(curso: string): string {
  const m = curso.match(/([2-4])\s*°\s*Medio/i);
  if (m) return `${m[1]}° Medio`;
  return "Otro";
}

function avgAvance(estudiantes: EstudianteDemo[]): number {
  if (estudiantes.length === 0) return 0;
  const sum = estudiantes.reduce((acc, e) => acc + e.avancePct, 0);
  return Math.round(sum / estudiantes.length);
}

function groupEstudiantesBy(
  estudiantes: EstudianteDemo[],
  keyFn: (e: EstudianteDemo) => string,
): Array<{ key: string; estudiantes: EstudianteDemo[]; avg: number }> {
  const map = new Map<string, EstudianteDemo[]>();
  for (const e of estudiantes) {
    const key = keyFn(e);
    const list = map.get(key);
    if (list) list.push(e);
    else map.set(key, [e]);
  }
  return Array.from(map.entries())
    .map(([key, list]) => ({
      key,
      estudiantes: list,
      avg: avgAvance(list),
    }))
    .sort((a, b) => a.key.localeCompare(b.key, "es"));
}

const ESTUDIANTES_TABS: Array<{ id: EstudiantesTabId; label: string }> = [
  { id: "curso", label: "Por curso" },
  { id: "estudiante", label: "Por estudiante" },
  { id: "nivel", label: "Por nivel" },
];

export function EstudiantesView() {
  const {
    estudiantesTab: tab,
    setEstudiantesTab: setTab,
    favoritos,
    toggleFavorito,
    hydrated,
  } = usePortalStore();
  const { estudiantes: estudiantesLms } = useLivePortal();
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!openId && estudiantesLms[0]) setOpenId(estudiantesLms[0].id);
  }, [openId, estudiantesLms]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return estudiantesLms;
    return estudiantesLms.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.curso.toLowerCase().includes(q),
    );
  }, [search, estudiantesLms]);

  const porCurso = useMemo(
    () => groupEstudiantesBy(filtered, (e) => e.curso),
    [filtered],
  );
  const porNivel = useMemo(
    () => groupEstudiantesBy(filtered, (e) => nivelFromCurso(e.curso)),
    [filtered],
  );

  return (
    <div className="space-y-6">
      <SectionIntro
        title="Estudiantes"
        purpose="Lee el avance desde tres perspectivas. Por nivel: tendencias de OA, AE y criterios de evaluación. Por curso: comparación entre grupos. Por estudiante: quién requiere apoyo ahora."
      >
        <BrowserSaveHint className="mt-1" />
      </SectionIntro>
      <LiveStatusNote />

      <div className="flex flex-wrap items-center gap-3">
        <label className="block min-w-[16rem] flex-1 text-xs font-semibold text-slate-700">
          Buscar por nombre o curso
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ej. Camila, 3° Medio Clim…"
            className="mt-1 w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <p className="self-end pb-2 text-xs text-slate-500">
          {pluralEstudiantes(filtered.length)} de {pluralEstudiantes(estudiantesLms.length)} ·
          Favoritos: {hydrated ? favoritos.length : "…"} · LMS en vivo
        </p>
      </div>

      <PerspectiveTabs
        label="Vista de estudiantes"
        value={tab}
        options={ESTUDIANTES_TABS}
        onChange={setTab}
      />

      {tab === "estudiante" ? (
        <div role="tabpanel" className="space-y-6">
          <EstudiantePriorityPanel estudiantes={filtered} total={filtered.length} />
          <EstudiantesTable
            estudiantes={filtered}
            openId={openId}
            setOpenId={setOpenId}
            showCurso
            favoritos={favoritos}
            onToggleFavorito={toggleFavorito}
          />
        </div>
      ) : null}

      {tab === "curso" ? (
        <div role="tabpanel" className="space-y-6">
          <CursoComparePanel grupos={porCurso} />
          {porCurso.map((g) => (
            <EstudianteGroupCard
              key={g.key}
              title={g.key}
              count={g.estudiantes.length}
              avg={g.avg}
            >
              <EstudiantesTable
                estudiantes={g.estudiantes}
                openId={openId}
                setOpenId={setOpenId}
                showCurso={false}
                favoritos={favoritos}
                onToggleFavorito={toggleFavorito}
              />
            </EstudianteGroupCard>
          ))}
        </div>
      ) : null}

      {tab === "nivel" ? (
        <div role="tabpanel" className="space-y-6">
          {porNivel.map((g) => (
            <section key={g.key} className="space-y-4">
              <header className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-navy,#0B3A6B)]">{g.key}</h2>
                  <p className="text-xs text-[var(--color-muted,#6B7C8E)]">
                    {pluralEstudiantes(g.estudiantes.length)} · Porcentaje de logro % promedio{" "}
                    {g.avg}
                  </p>
                </div>
              </header>
              <NivelAggregatePanel estudiantes={g.estudiantes} />
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EstudianteGroupCard({
  title,
  count,
  avg,
  children,
}: {
  title: string;
  count: number;
  avg: number;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 sm:text-base">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {pluralEstudiantes(count)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Porcentaje de logro % (promedio)
          </p>
          <p className="text-sm font-bold tabular-nums text-brand-700">{avg}%</p>
        </div>
      </header>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function EstudiantesTable({
  estudiantes,
  openId,
  setOpenId,
  showCurso,
  favoritos,
  onToggleFavorito,
}: {
  estudiantes: EstudianteDemo[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
  showCurso: boolean;
  favoritos: string[];
  onToggleFavorito: (id: string) => void;
}) {
  return (
    <div
      className={
        showCurso
          ? "overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"
          : ""
      }
    >
      <table className="min-w-[820px] w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 w-8" />
            <th className="px-2 py-3 w-10" />
            <th className="px-4 py-3">Estudiante</th>
            {showCurso ? <th className="px-4 py-3">Curso</th> : null}
            <th className="px-4 py-3">AE logrados</th>
            <th className="px-4 py-3">Porcentaje de logro %</th>
            <th className="px-4 py-3">Último OA/AE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {estudiantes.length === 0 ? (
            <tr>
              <td
                colSpan={showCurso ? 7 : 6}
                className="px-4 py-8 text-center text-sm text-slate-500"
              >
                Sin resultados para la búsqueda.
              </td>
            </tr>
          ) : (
            estudiantes.map((e) => {
              const open = openId === e.id;
              return (
                <EstudianteRows
                  key={e.id}
                  estudiante={e}
                  open={open}
                  onToggle={() => setOpenId(open ? null : e.id)}
                  showCurso={showCurso}
                  favorito={favoritos.includes(e.id)}
                  onToggleFavorito={() => onToggleFavorito(e.id)}
                />
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function EstudianteRows({
  estudiante: e,
  open,
  onToggle,
  showCurso = true,
  favorito = false,
  onToggleFavorito,
}: {
  estudiante: EstudianteDemo;
  open: boolean;
  onToggle: () => void;
  showCurso?: boolean;
  favorito?: boolean;
  onToggleFavorito?: () => void;
}) {
  const colSpan = showCurso ? 7 : 6;
  return (
    <>
      <tr className="hover:bg-slate-50/80">
        <td className="px-2 py-3">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 border-brand-500 bg-brand-50 text-brand-700 shadow-sm hover:bg-brand-600 hover:text-white hover:border-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-expanded={open}
            aria-label={open ? "Ocultar detalle OA/AE" : "Ver detalle OA/AE"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className={`transition ${open ? "rotate-90" : ""}`}
            >
              <path
                d="M5 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </td>
        <td className="px-1 py-3">
          <button
            type="button"
            onClick={onToggleFavorito}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              favorito
                ? "border-amber-500 bg-amber-100 text-amber-700"
                : "border-slate-300 bg-white text-slate-400 hover:border-amber-400 hover:text-amber-600"
            }`}
            aria-label={favorito ? "Quitar de favoritos" : "Marcar favorito"}
            aria-pressed={favorito}
          >
            ★
          </button>
        </td>
        <td className="px-4 py-3 font-medium text-slate-900">{e.nombre}</td>
        {showCurso ? (
          <td className="px-4 py-3 text-slate-600">{e.curso}</td>
        ) : null}
        <td className="px-4 py-3 tabular-nums text-slate-800">
          {e.aeLogrados}/{e.aeTotales}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-24 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={e.avancePct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Porcentaje de logro ${e.avancePct}%`}
            >
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: `${e.avancePct}%` }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums text-slate-700">
              {e.avancePct}%
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-slate-600">
          {e.ultimaActividad ? (
            <span>
              <span className="font-semibold text-brand-700">
                {e.ultimaActividad.oaCodigo}
                {e.ultimaActividad.aeCodigo
                  ? ` / ${e.ultimaActividad.aeCodigo}`
                  : ""}
              </span>
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>
      </tr>
      {open ? (
        <tr className="bg-slate-50/70">
          <td colSpan={colSpan} className="px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cobertura OA / AE de {e.nombre}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {e.cobertura.map((c) => {
                const esp = especialidadFromCurso(e.curso);
                const oa = getOaByCodigo(c.oaCodigo, esp);
                return (
                  <div
                    key={`${esp ?? "x"}-${c.oaCodigo}`}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-brand-700">{c.oaCodigo}</p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-900">
                          {oa?.titulo ?? c.oaCodigo}
                        </p>
                      </div>
                      <EstadoBadge estado={c.estado} />
                    </div>
                    <ul className="mt-3 space-y-2">
                      {c.ae.map((a) => {
                        const aeMeta = getAeByCodigo(a.aeCodigo, esp);
                        const criterios = aeMeta ? criteriosDeEvaluacion(aeMeta) : [];
                        return (
                          <li
                            key={a.aeCodigo}
                            className="space-y-1 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-800">
                                  {a.aeCodigo}
                                </span>
                                <span className="text-slate-600">
                                  {" "}
                                  — {aeMeta?.descripcion ?? ""}
                                </span>
                              </div>
                              <EstadoBadge estado={a.estado} />
                            </div>
                            {criterios.length > 0 ? (
                              <ul className="ml-2 space-y-0.5 border-l border-slate-200 pl-2 text-[11px] text-slate-600">
                                {criterios.map((ce) => (
                                  <li key={ce.codigo}>
                                    <span className="font-semibold text-slate-700">
                                      Criterio de evaluación {ce.codigo}:
                                    </span>{" "}
                                    {ce.descripcion}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function OaAeView() {
  const especialidades: OaFiltroId[] = [
    "Todas",
    "Electricidad",
    "Administración",
    "Refrigeración y Climatización",
  ];
  type OaVista = "todas" | "carrera" | "curso" | "estudiante" | "nivel";
  const { oaFiltro: filtro, setOaFiltro: setFiltro } = usePortalStore();
  const { estudiantes } = useLivePortal();
  const [vista, setVista] = useState<OaVista>("todas");
  const [search, setSearch] = useState("");
  const [cursoSel, setCursoSel] = useState("");
  const [nivelSel, setNivelSel] = useState("");
  const [estSel, setEstSel] = useState("");
  const cursos = useMemo(
    () => Array.from(new Set(estudiantes.map((e) => e.curso))).sort((a, b) => a.localeCompare(b, "es")),
    [estudiantes],
  );
  const niveles = useMemo(
    () =>
      Array.from(new Set(estudiantes.map((e) => nivelFromCurso(e.curso)))).sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [estudiantes],
  );

  const recorte = useMemo(() => {
    if (vista === "carrera") return estudiantesDeEspecialidad(estudiantes, filtro);
    if (vista === "curso") {
      const curso = cursoSel || cursos[0];
      return estudiantes.filter((e) => e.curso === curso);
    }
    if (vista === "estudiante") {
      return estudiantes.filter((e) => e.id === (estSel || estudiantes[0]?.id));
    }
    if (vista === "nivel") {
      const nivel = nivelSel || niveles[0];
      return estudiantes.filter((e) => nivelFromCurso(e.curso) === nivel);
    }
    return filtro === "Todas" ? estudiantes : estudiantesDeEspecialidad(estudiantes, filtro);
  }, [vista, filtro, cursoSel, cursos, estSel, nivelSel, niveles, estudiantes]);

  const filtered = useMemo(() => {
    const catalog = catalogoOaDeGrupo(recorte.length ? recorte : estudiantes);
    const byEsp =
      vista === "carrera" && filtro !== "Todas"
        ? catalog.filter((o) => o.especialidad === filtro)
        : catalog;
    const q = search.trim().toLowerCase();
    if (!q) return byEsp;
    return byEsp.filter(
      (o) =>
        o.codigo.toLowerCase().includes(q) ||
        o.titulo.toLowerCase().includes(q) ||
        o.descripcion.toLowerCase().includes(q),
    );
  }, [filtro, search, recorte, vista, estudiantes]);
  const [expanded, setExpanded] = useState<string | null>(
    CATALOGO_OA[0] ? oaCatalogKey(CATALOGO_OA[0].especialidad, CATALOGO_OA[0].codigo) : null,
  );

  return (
    <div className="space-y-6">
      <SectionIntro
        title="OA, AE y criterios de evaluación"
        purpose="Analiza Objetivos de Aprendizaje, Aprendizajes Esperados y criterios de evaluación desde todas las carreras, una carrera, un curso, un estudiante o el nivel completo."
      >
        <BrowserSaveHint className="mt-1" />
      </SectionIntro>
      <LiveStatusNote />

      <PerspectiveTabs
        label="Perspectiva de OA / AE / criterios de evaluación"
        value={vista}
        onChange={setVista}
        options={[
          { id: "todas", label: "Todas las carreras" },
          { id: "carrera", label: "Por carrera" },
          { id: "curso", label: "Por curso" },
          { id: "estudiante", label: "Por estudiante" },
          { id: "nivel", label: "Nivel completo" },
        ]}
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="block min-w-[16rem] flex-1 text-xs font-semibold text-slate-700">
          Buscar por código o título
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ej. OA 1, planos, motores…"
            className="mt-1 w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none"
          />
        </label>
        {vista === "carrera" || vista === "todas" ? (
          <div className="flex flex-wrap gap-2 pb-1">
            {especialidades.map((esp) => (
              <button
                key={esp}
                type="button"
                onClick={() => setFiltro(esp)}
                className={`min-h-11 rounded-xl border-2 px-3 py-2 text-xs font-bold transition ${
                  filtro === esp
                    ? "border-[var(--aula-blue,#1558A0)] bg-[var(--aula-blue,#1558A0)] text-white"
                    : "border-[var(--color-line,#D5DEE8)] bg-white text-[var(--color-slate,#3D5166)]"
                }`}
              >
                {esp}
              </button>
            ))}
          </div>
        ) : null}
        {vista === "curso" ? (
          <label className="text-xs font-semibold text-slate-700">
            Curso
            <select
              value={cursoSel || cursos[0]}
              onChange={(e) => setCursoSel(e.target.value)}
              className="mt-1 block min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {cursos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {vista === "nivel" ? (
          <label className="text-xs font-semibold text-slate-700">
            Nivel
            <select
              value={nivelSel || niveles[0]}
              onChange={(e) => setNivelSel(e.target.value)}
              className="mt-1 block min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {niveles.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {vista === "estudiante" ? (
          <label className="text-xs font-semibold text-slate-700">
            Estudiante
            <select
              value={estSel}
              onChange={(e) => setEstSel(e.target.value)}
              className="mt-1 block min-h-11 max-w-xs rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {estudiantes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} · {e.curso}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <p className="text-xs text-[var(--color-muted,#6B7C8E)]">
        Recorte actual: <strong>{pluralEstudiantes(recorte.length)}</strong>. Los gráficos muestran
        cantidad de estudiantes o Porcentaje de logro %, según el título de cada eje.
      </p>

      {vista === "nivel" ? <NivelAggregatePanel estudiantes={recorte} /> : null}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Sin OA con evidencia LMS en este recorte.
          </p>
        ) : null}
        {filtered.map((oa) => {
          const key = oaCatalogKey(oa.especialidad, oa.codigo);
          const open = expanded === key;
          const conteo = conteoOaGrupo(recorte, oa.codigo);
          const pct = conteo.pct;
          return (
            <article
              key={key}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50/80"
                onClick={() => setExpanded(open ? null : key)}
                aria-expanded={open}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                      {oa.codigo}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {oa.especialidad}
                    </span>
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-slate-900">
                    {oa.titulo}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{oa.descripcion}</p>
                  <p className="mt-2 text-xs text-slate-600">
                    {pluralEstudiantes(conteo.logrado)} logrados ·{" "}
                    {pluralEstudiantes(conteo.en_progreso)} en proceso ·{" "}
                    {pluralEstudiantes(conteo.no_iniciado)} no iniciados
                  </p>
                </div>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className={`mt-1 shrink-0 text-slate-400 transition ${open ? "rotate-90" : ""}`}
                >
                  <path
                    d="M5 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {open ? (
                <div className="border-t border-slate-100 px-5 py-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Aprendizajes Esperados (AE)
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {oa.ae.map((ae) => {
                      const aeConteo = pctLogroAe(recorte, oa.codigo, ae.codigo, oa.especialidad);
                      return (
                        <li
                          key={ae.codigo}
                          className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                        >
                          <div className="flex gap-3">
                            <span className="shrink-0 font-bold text-brand-700">
                              {ae.codigo}
                            </span>
                            <span className="text-slate-700">{ae.descripcion}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {pluralEstudiantes(aeConteo.logrado)} logrados ·{" "}
                            {pluralEstudiantes(aeConteo.en_progreso)} en proceso ·{" "}
                            {pluralEstudiantes(aeConteo.no_iniciado)} no iniciados ·{" "}
                            Porcentaje de logro {aeConteo.pct}%
                          </p>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-6">
                    <CriteriosDeEvaluacionList
                      oaCodigo={oa.codigo}
                      especialidad={oa.especialidad}
                    />
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <OaEstadoCantidadChart
                      oaCodigo={oa.codigo}
                      logrado={conteo.logrado}
                      enProgreso={conteo.en_progreso}
                      noIniciado={conteo.no_iniciado}
                    />
                    <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <MiniDonut
                        pct={pct}
                        label={`Porcentaje de logro % · ${oa.codigo}`}
                        size={100}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function exportEstudiantesCsv(rows: EstudianteDemo[]) {
  const header = ["nombre", "curso", "porcentaje_logro_pct", "porcentaje_logro_periodo_anterior_pct", "aeLogrados", "aeTotales"];
  const lines = [
    header.join(","),
    ...rows.map((e) =>
      [
        `"${e.nombre.replace(/"/g, '""')}"`,
        `"${e.curso.replace(/"/g, '""')}"`,
        e.avancePct,
        e.avancePctPeriodoAnterior,
        e.aeLogrados,
        e.aeTotales,
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "estudiantes-aula-tp.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportesView() {
  type ReportesVista = "nivel" | "especialidad" | "curso" | "estudiante";
  type SortKey = "nombre" | "curso" | "especialidad" | "avance" | "ae";
  const { reportesFiltro, setReportesFiltro } = usePortalStore();
  const { estudiantes: estudiantesBase } = useLivePortal();
  const [vista, setVista] = useState<ReportesVista>("nivel");
  const [sortKey, setSortKey] = useState<SortKey>("avance");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const cursosUnicos = useMemo(
    () => Array.from(new Set(estudiantesBase.map((e) => e.curso))).sort((a, b) => a.localeCompare(b, "es")),
    [estudiantesBase],
  );
  const niveles = useMemo(
    () =>
      Array.from(new Set(estudiantesBase.map((e) => nivelFromCurso(e.curso)))).sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [estudiantesBase],
  );
  const filtroOptions = [
    "Todas",
    "Electricidad",
    "Administración",
    "Refrigeración y Climatización",
    ...niveles,
    ...cursosUnicos,
  ];

  const estudiantesFiltrados = useMemo(() => {
    if (reportesFiltro === "Todas") return estudiantesBase;
    if (
      reportesFiltro === "Electricidad" ||
      reportesFiltro === "Administración" ||
      reportesFiltro === "Refrigeración y Climatización"
    ) {
      return estudiantesBase.filter(
        (e) => especialidadFromCurso(e.curso) === reportesFiltro,
      );
    }
    if (niveles.includes(reportesFiltro)) {
      return estudiantesBase.filter((e) => nivelFromCurso(e.curso) === reportesFiltro);
    }
    return estudiantesBase.filter((e) => e.curso === reportesFiltro);
  }, [reportesFiltro, estudiantesBase, niveles]);

  const cobPct = useMemo(() => {
    if (estudiantesFiltrados.length === 0) return 0;
    let log = 0;
    let tot = 0;
    for (const e of estudiantesFiltrados) {
      log += e.aeLogrados;
      tot += e.aeTotales;
    }
    return tot === 0 ? 0 : Math.round((log / tot) * 100);
  }, [estudiantesFiltrados]);

  const logradosPorOa = useMemo(() => {
    return oaCodesForGroup(estudiantesFiltrados).map((codigo) => {
      const c = conteoOaGrupo(estudiantesFiltrados, codigo);
      return {
        label: codigo,
        value: c.logrado,
        valueLabel: pluralEstudiantes(c.logrado),
      };
    });
  }, [estudiantesFiltrados]);

  const porEspecialidad = useMemo(
    () =>
      groupEstudiantesBy(
        estudiantesFiltrados,
        (e) => especialidadFromCurso(e.curso) ?? "Otra",
      ),
    [estudiantesFiltrados],
  );
  const porCurso = useMemo(
    () => groupEstudiantesBy(estudiantesFiltrados, (e) => e.curso),
    [estudiantesFiltrados],
  );
  const stats = tendenciaCentral(estudiantesFiltrados.map((e) => e.avancePct));
  const n = estudiantesFiltrados.length;
  const bandas = estudiantesFiltrados.reduce(
    (acc, e) => {
      acc[bandaFromPct(e.avancePct)] += 1;
      return acc;
    },
    { logrado: 0, medianamente_logrado: 0, en_proceso: 0, no_logrado: 0 },
  );
  const nSafe = n || 1;

  const sortedEstudiantes = useMemo(() => {
    const rows = [...estudiantesFiltrados];
    const dir = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      if (sortKey === "nombre") return a.nombre.localeCompare(b.nombre, "es") * dir;
      if (sortKey === "curso") return a.curso.localeCompare(b.curso, "es") * dir;
      if (sortKey === "especialidad") {
        return (
          (especialidadFromCurso(a.curso) ?? "").localeCompare(
            especialidadFromCurso(b.curso) ?? "",
            "es",
          ) * dir
        );
      }
      if (sortKey === "ae") return (a.aeLogrados - b.aeLogrados) * dir;
      return (a.avancePct - b.avancePct) * dir;
    });
    return rows;
  }, [estudiantesFiltrados, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "avance" || key === "ae" ? "asc" : "asc");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionIntro
          title="Reportes"
          purpose="De lo general a lo específico: nivel, especialidad, curso y estudiante. Cada gráfico indica si muestra cantidad de estudiantes, Porcentaje de logro %, cobertura OA/AE o evolución en el tiempo."
        >
          <BrowserSaveHint className="mt-1" />
        </SectionIntro>
        <button
          type="button"
          onClick={() => exportEstudiantesCsv(estudiantesFiltrados)}
          className="rounded-xl border-2 border-brand-600 bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-700"
        >
          Exportar CSV
        </button>
      </div>
      <LiveStatusNote />

      <PerspectiveTabs
        label="Perspectiva del reporte"
        value={vista}
        onChange={setVista}
        options={[
          { id: "nivel", label: "Por nivel" },
          { id: "especialidad", label: "Por especialidad" },
          { id: "curso", label: "Por curso" },
          { id: "estudiante", label: "Por estudiante" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600">Filtro:</span>
        {filtroOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setReportesFiltro(opt)}
            className={`min-h-11 rounded-xl border-2 px-3 py-2 text-[11px] font-bold transition ${
              reportesFiltro === opt
                ? "border-[var(--aula-blue,#1558A0)] bg-[var(--aula-blue,#1558A0)] text-white"
                : "border-[var(--color-line,#D5DEE8)] bg-white text-[var(--color-slate,#3D5166)]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <KpiStrip
        items={[
          {
            label: "Cantidad de estudiantes considerados",
            value: String(n),
            hint: reportesFiltro === "Todas" ? "Nivel institucional" : reportesFiltro,
          },
          {
            label: "Porcentaje de logro % (media)",
            value: `${stats.media}`,
            hint: `Mediana ${stats.mediana} · moda ${stats.moda ?? "—"}`,
          },
          {
            label: "Cobertura OA/AE",
            value: `${cobPct}%`,
            hint: "AE logrados / AE totales del recorte",
          },
          {
            label: "Estudiantes en logrado",
            value: String(bandas.logrado),
            hint: `${pluralEstudiantes(bandas.logrado)} con Porcentaje de logro % ≥ 85`,
          },
        ]}
      />

      <TendenciaCard stats={stats} />

      {vista === "nivel" ? <NivelAggregatePanel estudiantes={estudiantesFiltrados} /> : null}
      {vista === "especialidad" ? (
        <div className="space-y-6">
          <ChartPanel
            title="Porcentaje de logro % promedio por especialidad"
            subtitle="Comparación entre carreras. Unidad: Porcentaje de logro %."
          >
            <BarChart
              title="Avance promedio por especialidad"
              yAxisTitle="Porcentaje de logro %"
              xAxisTitle="Especialidad"
              valueSuffix="%"
              items={porEspecialidad.map((g) => ({
                label: g.key,
                value: g.avg,
                color: BANDA_LOGRO_COLOR[bandaFromPct(g.avg)],
              }))}
            />
          </ChartPanel>
          <ChartPanel
            title="Cantidad de estudiantes por especialidad"
            subtitle="Unidad: cantidad de estudiantes."
          >
            <BarChart
              title="Estudiantes considerados por especialidad"
              yAxisTitle="Cantidad de estudiantes"
              xAxisTitle="Especialidad"
              items={porEspecialidad.map((g) => ({
                label: g.key,
                value: g.estudiantes.length,
                valueLabel: pluralEstudiantes(g.estudiantes.length),
                color: CHART_HEX.blueDeep,
              }))}
            />
          </ChartPanel>
        </div>
      ) : null}
      {vista === "curso" ? <CursoComparePanel grupos={porCurso} /> : null}
      {vista === "estudiante" ? (
        <EstudiantePriorityPanel
          estudiantes={estudiantesFiltrados}
          total={estudiantesFiltrados.length}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel
          title="Distribución de logro"
          subtitle="Cantidad de estudiantes del recorte LMS según banda de Porcentaje de logro %."
        >
          <DonutChart
            title="Cantidad de estudiantes según banda de logro"
            centerLabel={String(n)}
            slices={(Object.keys(BANDA_LOGRO_LABEL) as Array<keyof typeof BANDA_LOGRO_LABEL>).map(
              (k) => ({
                label: BANDA_LOGRO_LABEL[k],
                pct: Math.round((bandas[k] / nSafe) * 100),
                count: bandas[k],
                unit: "estudiantes",
                color: BANDA_LOGRO_COLOR[k],
              }),
            )}
          />
        </ChartPanel>
        <ChartPanel
          title="Cobertura AE del recorte"
          subtitle="Porcentaje de AE logrados vs pendientes (cobertura OA/AE)."
        >
          <DonutChart
            title="Cobertura de AE (porcentaje)"
            centerLabel={`${cobPct}%`}
            slices={[
              { label: "AE logrados", pct: cobPct, color: CHART_HEX.teal },
              {
                label: "AE pendientes",
                pct: 100 - cobPct,
                color: CHART_HEX.track,
              },
            ]}
          />
        </ChartPanel>
      </div>

      <ChartPanel
        title="Cobertura de OA: cantidad de estudiantes que lograron cada objetivo"
        subtitle="Eje vertical: cantidad de estudiantes. Eje horizontal: OA."
      >
        <BarChart
          title="Cantidad de estudiantes que lograron cada OA"
          yAxisTitle="Cantidad de estudiantes"
          xAxisTitle="Objetivo de Aprendizaje (OA)"
          items={logradosPorOa}
          color={CHART_HEX.success}
        />
      </ChartPanel>

      <ChartPanel title="Tabla de estudiantes (ordenable)" className="overflow-x-auto">
        <table className="mt-1 min-w-[640px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--aula-line,#d9e5f6)] text-xs uppercase tracking-wide text-[var(--aula-text-muted,#5e7596)]">
              {(
                [
                  ["nombre", "Nombre"],
                  ["curso", "Curso"],
                  ["especialidad", "Especialidad"],
                  ["avance", "Porcentaje de logro %"],
                  ["ae", "Cantidad de AE logrados"],
                ] as Array<[SortKey, string]>
              ).map(([key, label]) => (
                <th key={key} className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className="font-bold uppercase tracking-wide hover:text-[var(--aula-blue,#1558A0)]"
                  >
                    {label}
                    {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--aula-line,#d9e5f6)]">
            {sortedEstudiantes.slice(0, 40).map((e) => (
              <tr key={e.id}>
                <td className="px-2 py-1.5 font-medium text-[var(--aula-text,#082b80)]">{e.nombre}</td>
                <td className="px-2 py-1.5 text-[var(--aula-text-secondary,#43628f)]">{e.curso}</td>
                <td className="px-2 py-1.5 text-[var(--aula-text-secondary,#43628f)]">
                  {especialidadFromCurso(e.curso) ?? "—"}
                </td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--aula-text,#082b80)]">
                  {e.avancePct}%
                </td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--aula-text,#082b80)]">
                  {e.aeLogrados}/{e.aeTotales}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {estudiantesFiltrados.length > 40 ? (
          <p className="mt-2 text-xs text-[var(--aula-text-muted,#5e7596)]">
            Mostrando 40 de {pluralEstudiantes(estudiantesFiltrados.length)}. Usa Exportar CSV para el
            listado completo.
          </p>
        ) : null}
      </ChartPanel>
    </div>
  );
}

export function RecursosView() {
  const { recursosUsados, toggleRecursoUsado } = usePortalStore();
  const [filtro, setFiltro] = useState<"all" | "usados" | "pendientes">("all");

  const list = useMemo(() => {
    if (filtro === "usados") {
      return RECURSOS.filter((r) => recursosUsados.includes(r.id));
    }
    if (filtro === "pendientes") {
      return RECURSOS.filter((r) => !recursosUsados.includes(r.id));
    }
    return RECURSOS;
  }, [filtro, recursosUsados]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Recursos</h1>
        <p className="mt-1 text-sm text-slate-600">
          Accesos a cursos vivos (Enfermería, Electricidad, Climatización M1–M8) y
          materiales de apoyo. Marca recursos como usados; el estado se guarda en
          este navegador.
        </p>
        <BrowserSaveHint className="mt-1" />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Todos"],
            ["usados", "Usados"],
            ["pendientes", "Pendientes"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFiltro(id)}
            className={`min-h-11 rounded-xl border-2 px-3 py-2 text-xs font-bold transition ${
              filtro === id
                ? "border-[var(--aula-blue,#1558A0)] bg-[var(--aula-blue,#1558A0)] text-white"
                : "border-[var(--color-line,#D5DEE8)] bg-white text-[var(--color-slate,#3D5166)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => {
          const usado = recursosUsados.includes(r.id);
          return (
            <article
              key={r.id}
              className={`flex flex-col rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                usado
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-slate-200 bg-white hover:border-brand-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {r.especialidad}
                </p>
                {usado ? (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Usado
                  </span>
                ) : null}
              </div>
              <h3 className="mt-2 text-base font-semibold text-slate-900">{r.titulo}</h3>
              <dl className="mt-4 space-y-1 text-xs text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt>Tipo</dt>
                  <dd className="font-medium text-slate-800">{r.tipo}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Duración</dt>
                  <dd className="font-medium text-slate-800">{r.duracion}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Nivel</dt>
                  <dd className="font-medium text-slate-800">{r.nivel}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => toggleRecursoUsado(r.id)}
                  className={`inline-flex w-full items-center justify-center rounded-lg border-2 px-3 py-2 text-sm font-bold transition ${
                    usado
                      ? "border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border-brand-600 bg-white text-brand-800 hover:bg-brand-50"
                  }`}
                >
                  {usado ? "✓ Usado (quitar)" : "Marcar como usado"}
                </button>
                {r.href ? (
                  <Link
                    href={r.href}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-brand-50 hover:text-brand-800"
                  >
                    Abrir recurso
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-brand-50 hover:text-brand-800"
                  >
                    Abrir recurso
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {list.length === 0 ? (
        <p className="text-center text-sm text-slate-500">
          No hay recursos en este filtro.
        </p>
      ) : null}
    </div>
  );
}
