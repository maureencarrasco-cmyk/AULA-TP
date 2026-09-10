"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ACTIVIDAD_RECIENTE,
  APROBACION,
  CATALOGO_OA,
  conteoEstudiantesPorOa,
  ESTADO_OA_AE_LABEL,
  ESTUDIANTES,
  ESTUDIANTES_POR_COMPETENCIA,
  ESTUDIANTES_POR_HABILIDAD,
  estudiantesLogradosPorOa,
  EVOLUCION_PROMEDIO,
  especialidadFromCurso,
  getAeByCodigo,
  getOaByCodigo,
  oaCatalogKey,
  pctLogroOa,
  RECURSOS,
  type EstadoOaAe,
  type EstudianteDemo,
} from "@/lib/demo-data";
import { BarChart, ChartPanel, CHART_HEX, DataBadge, DonutChart, LineChart, MiniDonut } from "./charts";
import {
  ConnectedCursosGrid,
  CursosVivosList,
  CumplimientoView,
  LiveKpiRow,
} from "./ConnectedCourses";
import { SchedulePlanner } from "./SchedulePlanner";
import {
  BrowserSaveHint,
  usePortalStore,
  type EstudiantesTabId,
  type OaFiltroId,
} from "./usePortalStore";

export { CumplimientoView };

const ESTADO_BADGE: Record<EstadoOaAe, string> = {
  logrado: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  en_progreso: "bg-amber-100 text-amber-900 ring-amber-200",
  no_iniciado: "bg-slate-100 text-slate-600 ring-slate-200",
};

const ESTADO_BAR_COLORS = {
  logrado: CHART_HEX.success,
  en_progreso: CHART_HEX.warning,
  no_iniciado: CHART_HEX.muted,
} as const;

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
          Estudiantes (demo)
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
          {ESTUDIANTES.length}
        </p>
      </div>
    </div>
  );
}

export function ResumenView() {
  const oaEnFoco = CATALOGO_OA.filter((o) => o.enFoco);
  const progresoPorOa = CATALOGO_OA.map((oa) => {
    const c = conteoEstudiantesPorOa(oa.codigo, oa.especialidad);
    return {
      key: oaCatalogKey(oa.especialidad, oa.codigo),
      codigo: oa.codigo,
      titulo: oa.titulo,
      especialidad: oa.especialidad,
      ...c,
    };
  }).filter((x) => x.total > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Resumen</h1>
        <p className="mt-1 text-sm text-slate-600">
          Vista general de cursos vivos conectados y avance institucional.
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

      <div className="rounded-2xl border border-[var(--aula-warning,#e99300)]/35 bg-[var(--aula-warning-soft,#fff5dd)] p-3 text-xs text-[var(--aula-warning-ink,#9b3e13)]">
        <span className="mr-2 inline-flex align-middle">
          <DataBadge kind="demo" />
        </span>
        Las secciones siguientes (OA en foco, habilidades, actividad reciente) usan{" "}
        <strong>datos de ejemplo</strong> para la demo pedagógica.
      </div>

      <div className="rounded-2xl border border-[var(--aula-line,#d9e5f6)] bg-[var(--aula-surface-tint,#edf6ff)] p-5 shadow-[var(--shadow-sm)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[var(--aula-text,#082b80)]">
              Objetivos de Aprendizaje (OA) en foco esta semana
            </h2>
            <p className="mt-1 text-xs text-[var(--aula-text-muted,#5e7596)]">
              OA priorizados en la planificación semanal (datos de ejemplo).
            </p>
          </div>
          <DataBadge kind="demo" />
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {oaEnFoco.map((oa) => {
            const c = conteoEstudiantesPorOa(oa.codigo, oa.especialidad);
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
                  <span className="font-semibold text-emerald-700">{c.logrado}</span> logrados ·{" "}
                  <span className="font-semibold text-amber-700">{c.en_progreso}</span> en
                  progreso ·{" "}
                  <span className="font-semibold text-slate-500">{c.no_iniciado}</span> no
                  iniciados
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel badge="demo">
          <BarChart
            title="Estudiantes por habilidad"
            yAxisTitle="Estudiantes"
            items={ESTUDIANTES_POR_HABILIDAD}
            color={CHART_HEX.blue}
          />
        </ChartPanel>
        <ChartPanel title="Avance de estudiantes por OA (cantidades)" badge="demo">
          <ul className="space-y-3">
            {progresoPorOa.map((p) => (
              <li key={p.key} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--aula-text,#082b80)]">
                    {p.codigo}{" "}
                    <span className="font-normal text-[var(--aula-text-secondary,#43628f)]">
                      — {p.titulo}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-normal text-[var(--aula-text-muted,#5e7596)]">
                      {p.especialidad}
                    </span>
                  </p>
                </div>
                <p className="shrink-0 tabular-nums text-xs text-[var(--aula-text-muted,#5e7596)]">
                  <span className="font-semibold text-[var(--aula-success-ink,#00784d)]">
                    {p.logrado}
                  </span>
                  /{p.total} logr.
                </p>
              </li>
            ))}
          </ul>
        </ChartPanel>
      </div>

      <ChartPanel title="Actividad reciente" badge="demo">
        <ul className="divide-y divide-[var(--aula-line,#d9e5f6)]">
          {ACTIVIDAD_RECIENTE.map((a) => (
            <li key={a.id} className="py-3 first:pt-0 last:pb-0">
              <p className="text-sm font-medium text-[var(--aula-text,#082b80)]">
                {a.estudiante}{" "}
                <span className="font-normal text-[var(--aula-text-secondary,#43628f)]">
                  — {a.texto}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-[var(--aula-text-muted,#5e7596)]">
                {a.curso} · {a.hace}
                {a.oaCodigo ? (
                  <>
                    {" "}
                    ·{" "}
                    <span className="font-semibold text-[var(--aula-blue-deep,#0549b8)]">
                      {a.oaCodigo}
                      {a.aeCodigo ? ` / ${a.aeCodigo}` : ""}
                    </span>
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      </ChartPanel>
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
          Cursos vivos publicados. El acceso estudiantil único es el{" "}
          <a className="font-semibold text-[var(--aula-blue)] underline" href="https://aulatpchile.cl/portal/cursos/">
            catálogo /portal/cursos/
          </a>
          . Horario semanal editable con OA asociados; los cambios se guardan en este navegador.
        </p>
      </div>

      <CursosVivosList />

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
        <LegendDot className="bg-emerald-500" label="Administración (demo)" />
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
  const [openId, setOpenId] = useState<string | null>(ESTUDIANTES[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [climLivePct, setClimLivePct] = useState<Record<string, number> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/lms/climatizacion/students")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{
          students?: Array<{ id: string; overallPct: number }>;
          fetchedAt?: string;
        }>;
      })
      .then((data) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        for (const s of data.students ?? []) {
          map[s.id] = s.overallPct;
        }
        setClimLivePct(map);
      })
      .catch(() => {
        if (!cancelled) setClimLivePct(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const estudiantesConLive = useMemo(() => {
    if (!climLivePct) return ESTUDIANTES;
    return ESTUDIANTES.map((e) => {
      if (!e.id.startsWith("clim-")) return e;
      const live = climLivePct[e.id];
      if (live == null) return e;
      return {
        ...e,
        avancePct: Math.round(live),
        actividadesCompletadas: Math.round(
          (live / 100) * e.actividadesTotales,
        ),
      };
    });
  }, [climLivePct]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return estudiantesConLive;
    return estudiantesConLive.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.curso.toLowerCase().includes(q),
    );
  }, [search, estudiantesConLive]);

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
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Estudiantes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Seguimiento de avance, actividades y cobertura de Objetivos de Aprendizaje
          (OA) / Aprendizajes Esperados (AE). Explora por curso, por estudiante o por
          nivel. Expande una fila para ver el detalle.
        </p>
        <BrowserSaveHint className="mt-1" />
      </div>

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
        <p className="text-xs text-slate-500 self-end pb-2">
          {filtered.length} de {estudiantesConLive.length} · Favoritos:{" "}
          {hydrated ? favoritos.length : "…"}
          {climLivePct
            ? " · Clim LMS en vivo"
            : " · Clim: avance seed (LMS no disponible)"}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Vista de estudiantes"
        className="inline-flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"
      >
        {ESTUDIANTES_TABS.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`estudiantes-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`estudiantes-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={`min-w-[8.5rem] rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                selected
                  ? "border-brand-600 bg-brand-600 text-white shadow-md"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "estudiante" ? (
        <div
          role="tabpanel"
          id="estudiantes-panel-estudiante"
          aria-labelledby="estudiantes-tab-estudiante"
        >
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
        <div
          role="tabpanel"
          id="estudiantes-panel-curso"
          aria-labelledby="estudiantes-tab-curso"
          className="space-y-4"
        >
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
        <div
          role="tabpanel"
          id="estudiantes-panel-nivel"
          aria-labelledby="estudiantes-tab-nivel"
          className="space-y-4"
        >
          {porNivel.map((g) => (
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
                showCurso
                favoritos={favoritos}
                onToggleFavorito={toggleFavorito}
              />
            </EstudianteGroupCard>
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
            {count} estudiante{count === 1 ? "" : "s"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Avance promedio
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
            <th className="px-4 py-3">Avance</th>
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
              aria-label={`Avance ${e.avancePct}%`}
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
                        return (
                          <li
                            key={a.aeCodigo}
                            className="flex items-start justify-between gap-2 text-xs"
                          >
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
  const { oaFiltro: filtro, setOaFiltro: setFiltro } = usePortalStore();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const byEsp =
      filtro === "Todas"
        ? CATALOGO_OA
        : CATALOGO_OA.filter((o) => o.especialidad === filtro);
    const q = search.trim().toLowerCase();
    if (!q) return byEsp;
    return byEsp.filter(
      (o) =>
        o.codigo.toLowerCase().includes(q) ||
        o.titulo.toLowerCase().includes(q) ||
        o.descripcion.toLowerCase().includes(q),
    );
  }, [filtro, search]);
  const [expanded, setExpanded] = useState<string | null>(
    CATALOGO_OA[0] ? oaCatalogKey(CATALOGO_OA[0].especialidad, CATALOGO_OA[0].codigo) : null,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Objetivos de Aprendizaje (OA) y Aprendizajes Esperados (AE)
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Catálogo de ejemplo para especialidades TP (Electricidad, Administración y
          Refrigeración y Climatización). Expande cada OA para ver AE y estudiantes
          por estado.
        </p>
        <BrowserSaveHint className="mt-1" />
      </div>

      <label className="block max-w-md text-xs font-semibold text-slate-700">
        Buscar por código o título
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ej. OA 1, planos, motores…"
          className="mt-1 w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {especialidades.map((esp) => (
          <button
            key={esp}
            type="button"
            onClick={() => setFiltro(esp)}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
              filtro === esp
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:bg-brand-50"
            }`}
          >
            {esp}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Sin OA que coincidan con el filtro.
          </p>
        ) : null}
        {filtered.map((oa) => {
          const key = oaCatalogKey(oa.especialidad, oa.codigo);
          const open = expanded === key;
          const conteo = conteoEstudiantesPorOa(oa.codigo, oa.especialidad);
          const pct = pctLogroOa(oa.codigo, oa.especialidad);
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
                    {oa.enFoco ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                        En foco esta semana
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-slate-900">
                    {oa.titulo}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{oa.descripcion}</p>
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
                    {oa.ae.map((ae) => (
                      <li
                        key={ae.codigo}
                        className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                      >
                        <span className="shrink-0 font-bold text-brand-700">
                          {ae.codigo}
                        </span>
                        <span className="text-slate-700">{ae.descripcion}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div>
                      <BarChart
                        title="Estudiantes por estado"
                        yAxisTitle="Estudiantes"
                        items={[
                          {
                            label: "Logrado",
                            value: conteo.logrado,
                            color: ESTADO_BAR_COLORS.logrado,
                          },
                          {
                            label: "En progreso",
                            value: conteo.en_progreso,
                            color: ESTADO_BAR_COLORS.en_progreso,
                          },
                          {
                            label: "No iniciado",
                            value: conteo.no_iniciado,
                            color: ESTADO_BAR_COLORS.no_iniciado,
                          },
                        ]}
                      />
                    </div>
                    <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <MiniDonut
                        pct={pct}
                        label={`% de logro del curso — ${oa.codigo}`}
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
  const header = ["nombre", "curso", "avance%", "aeLogrados", "aeTotales"];
  const lines = [
    header.join(","),
    ...rows.map((e) =>
      [
        `"${e.nombre.replace(/"/g, '""')}"`,
        `"${e.curso.replace(/"/g, '""')}"`,
        e.avancePct,
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
  const { reportesFiltro, setReportesFiltro } = usePortalStore();
  const [climLivePct, setClimLivePct] = useState<Record<string, number> | null>(
    null,
  );
  useEffect(() => {
    let cancelled = false;
    void fetch("/api/lms/climatizacion/students")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{
          students?: Array<{ id: string; overallPct: number }>;
        }>;
      })
      .then((data) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        for (const s of data.students ?? []) map[s.id] = s.overallPct;
        setClimLivePct(map);
      })
      .catch(() => {
        if (!cancelled) setClimLivePct(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const estudiantesBase = useMemo(() => {
    if (!climLivePct) return ESTUDIANTES;
    return ESTUDIANTES.map((e) => {
      if (!e.id.startsWith("clim-")) return e;
      const live = climLivePct[e.id];
      if (live == null) return e;
      return { ...e, avancePct: Math.round(live) };
    });
  }, [climLivePct]);
  const cursosUnicos = useMemo(
    () => Array.from(new Set(estudiantesBase.map((e) => e.curso))).sort((a, b) => a.localeCompare(b, "es")),
    [estudiantesBase],
  );
  const filtroOptions = [
    "Todas",
    "Electricidad",
    "Administración",
    "Refrigeración y Climatización",
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
    return estudiantesBase.filter((e) => e.curso === reportesFiltro);
  }, [reportesFiltro, estudiantesBase]);

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
    const all = estudiantesLogradosPorOa();
    if (reportesFiltro === "Todas") return all;
    if (
      reportesFiltro === "Electricidad" ||
      reportesFiltro === "Administración" ||
      reportesFiltro === "Refrigeración y Climatización"
    ) {
      const filtered = all.filter((item) =>
        CATALOGO_OA.some(
          (o) =>
            o.especialidad === reportesFiltro &&
            (item.label.includes(o.codigo) || item.label.includes(o.titulo.slice(0, 12))),
        ),
      );
      return filtered.length > 0 ? filtered : all;
    }
    // Course filter: keep chart labels; table below shows course students
    return all;
  }, [reportesFiltro]);

  const competencias = useMemo(() => {
    if (reportesFiltro === "Todas") return ESTUDIANTES_POR_COMPETENCIA;
    // Soft filter: show labels matching specialty keywords, else keep all with note
    const q = reportesFiltro.toLowerCase();
    const filtered = ESTUDIANTES_POR_COMPETENCIA.filter((i) =>
      i.label.toLowerCase().includes(q.slice(0, 6)),
    );
    return filtered.length > 0 ? filtered : ESTUDIANTES_POR_COMPETENCIA;
  }, [reportesFiltro]);

  const avgAvanceFiltro =
    estudiantesFiltrados.length === 0
      ? 0
      : Math.round(
          estudiantesFiltrados.reduce((a, e) => a + e.avancePct, 0) /
            estudiantesFiltrados.length,
        );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Reportes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Indicadores de aprobación, competencias, evolución y cobertura OA/AE.
          </p>
          <BrowserSaveHint className="mt-1" />
        </div>
        <button
          type="button"
          onClick={() => exportEstudiantesCsv(estudiantesFiltrados)}
          className="rounded-xl border-2 border-brand-600 bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-700"
        >
          Exportar CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600">Filtro:</span>
        {filtroOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setReportesFiltro(opt)}
            className={`rounded-full border-2 px-3 py-1 text-[11px] font-bold transition ${
              reportesFiltro === opt
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-600">
        Mostrando <strong>{estudiantesFiltrados.length}</strong> estudiantes · avance
        promedio <strong>{avgAvanceFiltro}%</strong>
        {reportesFiltro !== "Todas" ? (
          <>
            {" "}
            · filtro <strong>{reportesFiltro}</strong>
          </>
        ) : null}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel badge="demo">
          <DonutChart
            title={`Aprobación (${reportesFiltro === "Todas" ? "institucional" : reportesFiltro})`}
            centerLabel={`${APROBACION.aprobadosPct}%`}
            slices={[
              {
                label: "Aprobados",
                pct: APROBACION.aprobadosPct,
                color: CHART_HEX.blue,
              },
              {
                label: "Reprobados",
                pct: APROBACION.reprobadosPct,
                color: CHART_HEX.danger,
              },
              {
                label: "Pendientes",
                pct: APROBACION.pendientesPct,
                color: CHART_HEX.muted,
              },
            ]}
          />
        </ChartPanel>
        <ChartPanel badge="demo">
          <BarChart
            title="Estudiantes por competencia"
            yAxisTitle="Estudiantes"
            items={competencias}
            color={CHART_HEX.blueDeep}
          />
        </ChartPanel>
      </div>

      <ChartPanel
        title="Cobertura Objetivos de Aprendizaje (OA) / Aprendizajes Esperados (AE)"
        subtitle="Cantidad de estudiantes que lograron cada OA; donut según filtro de estudiantes seleccionado."
        badge="demo"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <BarChart
            title="Estudiantes por OA (cantidad logrados)"
            yAxisTitle="Estudiantes"
            items={logradosPorOa}
            color={CHART_HEX.success}
          />
          <div className="flex items-center justify-center">
            <DonutChart
              title="% cobertura AE (filtro actual)"
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
          </div>
        </div>
      </ChartPanel>

      <ChartPanel title="Tabla estudiantes (filtro actual)" badge="demo" className="overflow-x-auto">
        <table className="mt-1 min-w-[560px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--aula-line,#d9e5f6)] text-xs uppercase tracking-wide text-[var(--aula-text-muted,#5e7596)]">
              <th className="px-2 py-2">Nombre</th>
              <th className="px-2 py-2">Curso</th>
              <th className="px-2 py-2">Avance</th>
              <th className="px-2 py-2">AE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--aula-line,#d9e5f6)]">
            {estudiantesFiltrados.slice(0, 40).map((e) => (
              <tr key={e.id}>
                <td className="px-2 py-1.5 font-medium text-[var(--aula-text,#082b80)]">{e.nombre}</td>
                <td className="px-2 py-1.5 text-[var(--aula-text-secondary,#43628f)]">{e.curso}</td>
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
            Mostrando 40 de {estudiantesFiltrados.length}. Usa Exportar CSV para el
            listado completo.
          </p>
        ) : null}
      </ChartPanel>

      <ChartPanel badge="demo">
        <LineChart
          title="Evolución del promedio general (%)"
          points={EVOLUCION_PROMEDIO.map((p) => ({
            label: p.mes,
            pct: p.pct,
          }))}
        />
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
            className={`rounded-xl border-2 px-3 py-2 text-xs font-bold transition ${
              filtro === id
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:bg-brand-50"
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
