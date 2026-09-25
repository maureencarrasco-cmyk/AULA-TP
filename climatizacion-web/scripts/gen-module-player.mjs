#!/usr/bin/env node
/**
 * Generates ModulePlayer.tsx from shared template (M6/M7/M8 pattern).
 * Usage: node scripts/gen-module-player.mjs <config.json>
 */
import fs from "fs";
import path from "path";

const cfg = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const {
  mod, // "M5"
  libFile, // "m5-puesta-estaciones"
  route, // "m5-puesta-en-marcha"
  familias, // { key: "Label" }
  evalBanner,
  cierreInteraccion, // e.g. "sintesis_nch3241"
  cierreCards, // [[key,label,width],...]
  cierreBarClass, // "bg-violet-600"
  evidencias, // string[] of <li> inner HTML text
} = cfg;

const famEntries = Object.entries(familias)
  .map(([k, v]) => `  ${k}: "${v}",`)
  .join("\n");

const cierreCardsJs = cierreCards
  .map(([k, l, w]) => `                      ["${k}", "${l}", "${w}"],`)
  .join("\n");

const evidenciasJs = evidencias.map((e) => `              <li>${e}</li>`).join("\n");

const out = `"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ESTACIONES_${mod},
  FASE_LABELS,
  INITIAL_PROGRESS,
  ${mod}_META,
  PRACTICA_LIBRE_${mod},
  canCompleteStation,
  getEstacionBySlug,
  stationIsUnlocked,
  type Estacion${mod},
  type ProgressState,
} from "@/lib/${libFile}";

type Props = {
  initialSlug?: string;
};

function loadProgress(): ProgressState {
  if (typeof window === "undefined") return INITIAL_PROGRESS;
  try {
    const raw = localStorage.getItem(${mod}_META.storageKey);
    if (!raw) return INITIAL_PROGRESS;
    return { ...INITIAL_PROGRESS, ...JSON.parse(raw) } as ProgressState;
  } catch {
    return INITIAL_PROGRESS;
  }
}

function saveProgress(state: ProgressState) {
  try {
    localStorage.setItem(${mod}_META.storageKey, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

const FAMILIA_LABEL: Record<string, string> = {
${famEntries}
};

function formatHoras(h: number): string {
  return String(h).replace(".", ",");
}

function shortTitle(titulo: string): string {
  return titulo
    .replace(/^Estación \\d+ — /, "")
    .replace(/^Contextualización — /, "Ctx · ")
    .replace(/^Situación Integradora — /, "SI · ")
    .replace(/^Evaluación Final.*/, "Evaluación Final")
    .replace(/^Retroalimentación.*/, "Cierre");
}

export default function ModulePlayer({ initialSlug }: Props) {
  const [progress, setProgress] = useState<ProgressState>(INITIAL_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [agentOpen, setAgentOpen] = useState(true);
  const [agentLevel, setAgentLevel] = useState(0);
  const [plOpen, setPlOpen] = useState(false);
  const [plFase, setPlFase] = useState<(typeof PRACTICA_LIBRE_${mod})[number]["id"]>("explorar");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadProgress();
    if (initialSlug) {
      const est = getEstacionBySlug(initialSlug);
      if (est && stationIsUnlocked(est, loaded.completedIds)) {
        loaded.currentId = est.id;
      }
    }
    setProgress(loaded);
    setHydrated(true);
  }, [initialSlug]);

  useEffect(() => {
    if (!hydrated) return;
    saveProgress(progress);
  }, [progress, hydrated]);

  const current =
    ESTACIONES_${mod}.find((e) => e.id === progress.currentId) ?? ESTACIONES_${mod}[0];
  const selected = progress.selectedByStation[current.id] ?? [];
  const completedCount = progress.completedIds.length;
  const total = ESTACIONES_${mod}.length;
  const pct = Math.round((completedCount / total) * 100);
  const unlocked = stationIsUnlocked(current, progress.completedIds);
  const isDone = progress.completedIds.includes(current.id);
  const canComplete = canCompleteStation(current, selected);
  const agentDisabled = !current.permiteAgente;

  const goTo = useCallback(
    (est: Estacion${mod}) => {
      if (!stationIsUnlocked(est, progress.completedIds)) {
        setFeedback("Completa la estación anterior para desbloquear esta fase.");
        return;
      }
      setFeedback(null);
      setAgentLevel(0);
      setProgress((p) => ({ ...p, currentId: est.id }));
      if (typeof window !== "undefined") {
        window.history.replaceState(
          null,
          "",
          \`/curso/climatizacion/${route}?estacion=\${est.slug}\`,
        );
      }
    },
    [progress.completedIds],
  );

  const toggleOption = (optId: string) => {
    if (isDone && current.esEvaluacionFormal) return;
    setFeedback(null);
    setProgress((p) => {
      const prev = p.selectedByStation[current.id] ?? [];
      const next = prev.includes(optId)
        ? prev.filter((id) => id !== optId)
        : [...prev, optId];
      return {
        ...p,
        selectedByStation: { ...p.selectedByStation, [current.id]: next },
      };
    });
  };

  const completeCurrent = () => {
    if (!canComplete) {
      const hasWrong = selected.some((id) => {
        const opt = current.opciones.find((o) => o.id === id);
        return opt && !opt.correcta;
      });
      if (hasWrong) {
        setFeedback(
          current.errorUtil ||
            "Hay una selección sin evidencia suficiente. Revisa la consecuencia profesional y reintenta.",
        );
      } else {
        setFeedback(\`Evidencia insuficiente: \${current.evidenciaMinima}\`);
      }
      return;
    }
    setFeedback(null);
    setProgress((p) => {
      const completedIds = p.completedIds.includes(current.id)
        ? p.completedIds
        : [...p.completedIds, current.id];
      return {
        ...p,
        completedIds,
        evalSubmitted:
          current.fase === "evaluacion_final" ? true : p.evalSubmitted,
      };
    });
  };

  const goNext = () => {
    const next = ESTACIONES_${mod}.find((e) => e.orden === current.orden + 1);
    if (next) {
      if (!progress.completedIds.includes(current.id)) {
        setFeedback("Completa la evidencia mínima antes de avanzar.");
        return;
      }
      goTo(next);
      return;
    }
    window.location.href = ${mod}_META.portalDocenteHref;
  };

  const agentHints = current.agente;
  const shownHint =
    !agentDisabled && agentHints.length > 0
      ? agentHints[Math.min(agentLevel, agentHints.length - 1)]
      : null;

  const faseGroups = useMemo(() => {
    const map = new Map<string, Estacion${mod}[]>();
    for (const e of ESTACIONES_${mod}) {
      const list = map.get(e.fase) ?? [];
      list.push(e);
      map.set(e.fase, list);
    }
    return map;
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Cargando módulo…
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href={${mod}_META.portalDocenteHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
          >
            <span aria-hidden>←</span>
            <span>Especialidad Climatización</span>
          </Link>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
              Módulo {${mod}_META.moduloNumero} · {formatHoras(${mod}_META.horasAulaTp)} h Aula TP · Eval.{" "}
              {${mod}_META.horasEvaluacionFinal} h reservadas · {${mod}_META.oa}
            </p>
            <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">
              {${mod}_META.nombre}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setPlOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            aria-haspopup="dialog"
            aria-expanded={plOpen}
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-white" aria-hidden />
            Práctica Libre
          </button>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso del módulo"
            >
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: \`\${pct}%\` }}
              />
            </div>
            <span className="whitespace-nowrap text-xs font-semibold text-slate-600">
              {completedCount}/{total} · {pct}%
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[220px_1fr_280px] sm:px-6">
        <nav
          className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
          aria-label="Ruta obligatoria"
        >
          <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Ruta obligatoria
          </p>
          <ul className="space-y-3">
            {Array.from(faseGroups.entries()).map(([fase, estaciones]) => (
              <li key={fase}>
                <p
                  className={\`mb-1 px-1 text-[10px] font-bold uppercase tracking-wide \${
                    fase === "evaluacion_final"
                      ? "text-amber-800"
                      : "text-slate-400"
                  }\`}
                >
                  {FASE_LABELS[fase as keyof typeof FASE_LABELS]}
                  {fase === "evaluacion_final" ? " · candado" : ""}
                </p>
                <ul className="space-y-1">
                  {estaciones.map((e) => {
                    const open = stationIsUnlocked(e, progress.completedIds);
                    const done = progress.completedIds.includes(e.id);
                    const active = e.id === current.id;
                    return (
                      <li key={e.id}>
                        <button
                          type="button"
                          disabled={!open}
                          onClick={() => goTo(e)}
                          className={\`flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition \${
                            active
                              ? "bg-brand-50 font-semibold text-brand-900 ring-1 ring-brand-200"
                              : open
                                ? "text-slate-700 hover:bg-slate-50"
                                : "cursor-not-allowed text-slate-400"
                          }\`}
                        >
                          <span className="mt-0.5 shrink-0" aria-hidden>
                            {done
                              ? "✅"
                              : open
                                ? e.esEvaluacionFormal
                                  ? "🔒"
                                  : "○"
                                : "🔒"}
                          </span>
                          <span>
                            <span className="block leading-snug">
                              {shortTitle(e.titulo)}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              {formatHoras(e.horas)} h
                              {e.aeCodigos.length
                                ? \` · \${e.aeCodigos.slice(0, 2).join(", ")}\`
                                : ""}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <main className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {!unlocked ? (
            <p className="text-sm text-slate-600">Estación bloqueada.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                    {FASE_LABELS[current.fase]} · {current.habilidad}
                    {current.aeCodigos.length
                      ? \` · \${current.aeCodigos.join(", ")}\`
                      : ""}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {current.titulo}
                  </h2>
                </div>
                <span
                  className={\`rounded-full px-3 py-1 text-xs font-bold \${
                    current.esEvaluacionFormal
                      ? "bg-amber-100 text-amber-950"
                      : isDone
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-slate-100 text-slate-700"
                  }\`}
                >
                  {current.esEvaluacionFormal
                    ? "Fase formal · 2 h"
                    : isDone
                      ? "Completada"
                      : \`\${formatHoras(current.horas)} h\`}
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Caso · {${mod}_META.casoDemo.titulo}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {current.escenario}
                </p>
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-900">
                {current.preguntaPedagogica}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Evidencia mínima: {current.evidenciaMinima}
              </p>

              {current.esEvaluacionFormal ? (
                <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                  <p className="font-bold">Agente Pedagógico deshabilitado</p>
                  <p className="mt-1 text-xs leading-relaxed">
                    ${evalBanner}
                  </p>
                </div>
              ) : null}

              {current.interaccion === "${cierreInteraccion}" ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(
                    [
${cierreCardsJs}
                    ] as const
                  ).map(([key, label, width]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <p className="text-xs font-bold text-slate-800">{label}</p>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className={\`h-2 rounded-full ${cierreBarClass}\`}
                          style={{ width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <fieldset className="mt-5 space-y-2">
                <legend className="sr-only">Opciones de la estación</legend>
                {current.opciones.map((opt) => {
                  const checked = selected.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={\`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm transition \${
                        checked
                          ? "border-brand-400 bg-brand-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }\`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        checked={checked}
                        onChange={() => toggleOption(opt.id)}
                        disabled={isDone && !!current.esEvaluacionFormal}
                      />
                      <span>
                        <span className="font-medium text-slate-900">
                          {opt.label}
                        </span>
                        {opt.familia ? (
                          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                            {FAMILIA_LABEL[opt.familia] ?? opt.familia}
                          </span>
                        ) : null}
                        {opt.detalle && checked ? (
                          <span className="mt-1 block text-xs text-slate-600">
                            {opt.detalle}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </fieldset>

              {feedback ? (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                >
                  {feedback}
                </div>
              ) : null}

              {current.errorUtil && !isDone ? (
                <p className="mt-3 text-xs italic text-slate-500">
                  Error útil a evitar: {current.errorUtil}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {!isDone ? (
                  <button
                    type="button"
                    onClick={completeCurrent}
                    className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700"
                  >
                    {current.ctaCompletar}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700"
                  >
                    {current.ctaSiguiente}
                  </button>
                )}
                {isDone ? (
                  <span className="text-xs font-semibold text-emerald-700">
                    Evidencia registrada
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">
                    Un CTA primario por pantalla · sin timer punitivo
                  </span>
                )}
              </div>
            </>
          )}
        </main>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Agente Pedagógico
            </h3>
            <button
              type="button"
              className="text-xs font-medium text-brand-700 hover:underline"
              onClick={() => setAgentOpen((v) => !v)}
              aria-expanded={agentOpen}
            >
              {agentOpen ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {agentDisabled ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              <p className="font-bold text-slate-800">Nivel 0 — sin ayuda</p>
              <p className="mt-1">
                En Evaluación Final el Agente no entrega pistas ni niveles 1–6.
                Fundamenta con evidencias del caso.
              </p>
            </div>
          ) : agentOpen ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-slate-600">
                Orientación por preguntas (no entrega respuestas). Niveles 0–6.
              </p>
              {shownHint ? (
                <div className="rounded-xl border border-brand-100 bg-brand-50 p-3">
                  <p className="text-[10px] font-bold uppercase text-brand-800">
                    Nivel {shownHint.nivel}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-800">
                    {shownHint.pregunta}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Sin pistas en esta fase.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={agentLevel <= 0}
                  onClick={() => setAgentLevel((n) => Math.max(0, n - 1))}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40"
                >
                  Menos ayuda
                </button>
                <button
                  type="button"
                  disabled={agentLevel >= Math.max(0, agentHints.length - 1)}
                  onClick={() =>
                    setAgentLevel((n) =>
                      Math.min(Math.max(0, agentHints.length - 1), n + 1),
                    )
                  }
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40"
                >
                  Más ayuda (pregunta)
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Evidencias del caso
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
${evidenciasJs}
            </ul>
          </div>
        </aside>
      </div>

      {plOpen ? (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-slate-900/40"
          role="dialog"
          aria-modal="true"
          aria-label="Práctica Libre"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Cerrar Práctica Libre"
            onClick={() => setPlOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                <h2 className="text-base font-bold text-emerald-950">
                  Práctica Libre
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPlOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm leading-relaxed text-slate-600">
                Acceso paralelo formativo. No altera progreso ni nota. No bloquea
                la ruta obligatoria.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {PRACTICA_LIBRE_${mod}.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setPlFase(f.id);
                      setProgress((p) => ({
                        ...p,
                        practicaLibreVisits: p.practicaLibreVisits.includes(f.id)
                          ? p.practicaLibreVisits
                          : [...p.practicaLibreVisits, f.id],
                      }));
                    }}
                    className={\`rounded-full px-3 py-1.5 text-xs font-bold \${
                      plFase === f.id
                        ? "bg-emerald-500 text-white"
                        : "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                    }\`}
                  >
                    {f.titulo}
                  </button>
                ))}
              </div>
              {(() => {
                const fase = PRACTICA_LIBRE_${mod}.find((f) => f.id === plFase)!;
                return (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <p className="text-xs font-bold uppercase text-emerald-800">
                      {fase.titulo}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {fase.descripcion}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {fase.actividad}
                    </p>
                    <p className="mt-4 text-xs font-medium text-emerald-800">
                      Formativo · sin calificación · barra obligatoria intacta (
                      {pct}%)
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
`;

const outDir = path.join(
  "/workspace/aula-tp-landing/components/curso",
  mod.toLowerCase(),
);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "ModulePlayer.tsx"), out);
console.log("Wrote", path.join(outDir, "ModulePlayer.tsx"));
