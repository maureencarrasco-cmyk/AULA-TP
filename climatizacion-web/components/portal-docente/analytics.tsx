"use client";

import type { ReactNode } from "react";
import {
  BANDA_LOGRO_COLOR,
  BANDA_LOGRO_LABEL,
  bandaFromPct,
  type TendenciaCentral,
} from "@/lib/portal-stats";
import { CHART, CHART_HEX } from "./charts";

export function PerspectiveTabs<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (id: T) => void;
}) {
  const selectedTone = (id: string) => {
    const normalized = id.toLowerCase();
    if (normalized.includes("estudiante")) {
      return "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-[0_6px_16px_rgba(16,185,129,0.14)]";
    }
    if (normalized.includes("curso")) {
      return "border-violet-200 bg-violet-50 text-violet-900 shadow-[0_6px_16px_rgba(124,58,237,0.14)]";
    }
    if (normalized.includes("carrera")) {
      return "border-teal-200 bg-teal-50 text-teal-900 shadow-[0_6px_16px_rgba(20,184,166,0.14)]";
    }
    if (normalized.includes("nivel")) {
      return "border-blue-200 bg-blue-50 text-blue-900 shadow-[0_6px_16px_rgba(59,130,246,0.16)]";
    }
    return "border-sky-200 bg-sky-50 text-sky-900 shadow-[0_6px_16px_rgba(14,165,233,0.14)]";
  };

  return (
    <div role="tablist" aria-label={label} className="portal-tabs flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.id)}
            className={`portal-tab min-h-11 min-w-[7.5rem] rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aula-cyan,#3EC6E0)] focus-visible:ring-offset-2 ${
              selected
                ? selectedTone(opt.id)
                : "border-[var(--color-line,#D5DEE8)] bg-[var(--color-card,#fff)] text-[var(--color-slate,#3D5166)] hover:border-[var(--aula-blue,#1558A0)]/40 hover:bg-[var(--color-surface,#F4F7FB)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function TendenciaCard({
  stats,
  unidad = "Porcentaje de logro %",
}: {
  stats: TendenciaCentral;
  unidad?: string;
}) {
  return (
    <section className="portal-surface portal-tendency-card overflow-hidden rounded-2xl border p-4" aria-labelledby="portal-tendency-title">
      <h3 id="portal-tendency-title" className="text-sm font-bold text-[var(--color-navy,#0B3A6B)]">
        Tendencia central · {unidad}
      </h3>
      <p className="mt-1 text-xs text-[var(--color-muted,#6B7C8E)]">
        Calculado sobre {stats.n} {stats.n === 1 ? "dato" : "datos"}. La mediana evita que extremos distorsionen la lectura.
      </p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="portal-metric-card portal-tone-info rounded-xl px-2 py-3">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-blue,#1558A0)]">Media</dt>
          <dd className="mt-1 text-lg font-extrabold tabular-nums text-[var(--color-navy,#0B3A6B)]">{stats.media}</dd>
        </div>
        <div className="portal-metric-card portal-tone-success rounded-xl px-2 py-3">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ok,#1F8A5B)]">Mediana</dt>
          <dd className="mt-1 text-lg font-extrabold tabular-nums text-[var(--color-navy,#0B3A6B)]">{stats.mediana}</dd>
        </div>
        <div className="portal-metric-card portal-tone-warning rounded-xl px-2 py-3">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-warn,#C47A12)]">Moda</dt>
          <dd className="mt-1 text-lg font-extrabold tabular-nums text-[var(--color-navy,#0B3A6B)]">{stats.moda ?? "—"}</dd>
        </div>
      </dl>
    </section>
  );
}

export function heatColor(pct: number | null): string {
  if (pct == null) return "#E8EEF5";
  return BANDA_LOGRO_COLOR[bandaFromPct(pct)];
}

function heatCountColor(value: number | null, max: number): string {
  if (value == null || max <= 0 || value === 0) return "#E8EEF5";
  const t = value / max;
  if (t < 0.25) return "#3EC6E0";
  if (t < 0.5) return "#1B6BC4";
  if (t < 0.75) return "#1558A0";
  return "#0B3A6B";
}

export function HeatmapGrid({
  title,
  subtitle,
  xAxisTitle,
  yAxisTitle,
  columns,
  rows,
  unit = "Porcentaje de logro %",
  scale = "pct",
}: {
  title: string;
  subtitle?: string;
  xAxisTitle: string;
  yAxisTitle: string;
  columns: string[];
  rows: Array<{ id: string; label: string; values: Array<number | null>; hint?: string }>;
  unit?: string;
  scale?: "pct" | "count";
}) {
  const maxCount = Math.max(
    1,
    ...rows.flatMap((row) => row.values.map((v) => (v == null ? 0 : v))),
  );
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-line,#D5DEE8)] bg-white shadow-[0_3px_12px_rgba(11,58,107,0.08)]">
      <header className="border-b border-[var(--color-line,#D5DEE8)] px-4 py-3 sm:px-5">
        <h3 className="text-sm font-bold text-[var(--color-navy,#0B3A6B)]">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-[var(--color-muted,#6B7C8E)]">{subtitle}</p>
        ) : null}
        <p className="mt-1 text-[11px] text-[var(--color-slate,#3D5166)]">
          Eje horizontal: {xAxisTitle}. Eje vertical: {yAxisTitle}. Unidad: {unit}.
        </p>
      </header>
      <div className="overflow-x-auto p-3 sm:p-4">
        <table className="min-w-[520px] w-full border-separate border-spacing-1 text-left">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white px-2 py-1 text-[11px] font-bold text-[var(--color-muted,#6B7C8E)]">
                {yAxisTitle}
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-1 py-1 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--color-slate,#3D5166)]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th
                  className="sticky left-0 z-10 max-w-[11rem] truncate bg-white px-2 py-1 text-left text-xs font-semibold text-[var(--color-navy,#0B3A6B)]"
                  title={row.hint ?? row.label}
                >
                  {row.label}
                </th>
                {row.values.map((value, i) => {
                  const bg =
                    scale === "count" ? heatCountColor(value, maxCount) : heatColor(value);
                  const ink = value == null || value === 0 ? "#3D5166" : "#fff";
                  return (
                    <td key={`${row.id}-${columns[i]}`} className="p-0">
                      <span
                        className="flex h-8 min-w-10 items-center justify-center rounded-md text-[10px] font-bold tabular-nums"
                        style={{ background: bg, color: ink }}
                        title={`${row.label} · ${columns[i]}: ${value == null ? "sin dato" : `${value} ${unit}`}`}
                      >
                        {value == null ? "—" : value}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-wrap gap-3 border-t border-[var(--color-line,#D5DEE8)] px-4 py-2 text-[11px] text-[var(--color-muted,#6B7C8E)]">
        {scale === "count" ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2.5 w-2.5 rounded-sm bg-[#E8EEF5]" aria-hidden />
              0 estudiantes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2.5 w-2.5 rounded-sm bg-[#3EC6E0]" aria-hidden />
              Menor cantidad
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2.5 w-2.5 rounded-sm bg-[#0B3A6B]" aria-hidden />
              Mayor cantidad
            </span>
          </>
        ) : (
          (Object.keys(BANDA_LOGRO_LABEL) as Array<keyof typeof BANDA_LOGRO_LABEL>).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <i
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: BANDA_LOGRO_COLOR[k] }}
                aria-hidden
              />
              {BANDA_LOGRO_LABEL[k]}
            </span>
          ))
        )}
      </footer>
    </section>
  );
}

export function AlertList({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; title: string; detail: string; tone?: "warn" | "ok" | "info" }>;
}) {
  return (
    <section className="portal-surface portal-priority-card overflow-hidden rounded-2xl border p-5" aria-labelledby="portal-priority-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="portal-priority-title" className="text-sm font-bold text-[var(--color-navy,#0B3A6B)]">{title}</h2>
          <p className="mt-1 text-xs text-[var(--color-muted,#6B7C8E)]">Ordena los focos para decidir qué revisar primero.</p>
        </div>
        <span className="portal-icon-badge portal-tone-warning" aria-hidden="true">!</span>
      </div>
      <ul className="mt-3 grid gap-2 lg:grid-cols-2">
        {items.map((item, index) => (
          <li key={item.id} className={`portal-alert portal-alert-${item.tone ?? "warn"} rounded-xl border px-3 py-2`}>
            <div className="flex items-start gap-3">
              <span className="portal-alert-index" aria-hidden="true">{index + 1}</span>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--color-navy,#0B3A6B)]">{item.title}</p>
                <p className="mt-0.5 text-xs text-[var(--color-slate,#3D5166)]">{item.detail}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RankingList({
  title,
  subtitle,
  items,
  empty = "Sin datos en este recorte.",
}: {
  title: string;
  subtitle?: string;
  items: Array<{ id: string; label: string; value: string; detail?: string }>;
  empty?: string;
}) {
  return (
    <section className="portal-surface rounded-2xl border p-4">
      <h3 className="text-sm font-bold text-[var(--color-navy,#0B3A6B)]">{title}</h3>
      {subtitle ? <p className="mt-0.5 text-xs text-[var(--color-muted,#6B7C8E)]">{subtitle}</p> : null}
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-muted,#6B7C8E)]">{empty}</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {items.map((item, i) => (
            <li key={item.id} className="flex items-start justify-between gap-2 text-sm">
              <span className="min-w-0">
                <span className="mr-2 font-bold tabular-nums text-[var(--color-blue,#1558A0)]">
                  {i + 1}.
                </span>
                <span className="font-semibold text-[var(--color-navy,#0B3A6B)]">{item.label}</span>
                {item.detail ? (
                  <span className="mt-0.5 block pl-6 text-xs text-[var(--color-muted,#6B7C8E)]">
                    {item.detail}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 font-bold tabular-nums text-[var(--color-navy,#0B3A6B)]">
                {item.value}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function KpiStrip({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  const titleColors = [
    "text-[var(--color-blue,#1558A0)]",
    "text-[var(--color-a11y,#6B5CE7)]",
    "text-[var(--color-warn,#C47A12)]",
    "text-[var(--color-ok,#1F8A5B)]",
  ];

  return (
    <div className="portal-kpi-grid grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`portal-surface portal-kpi-card portal-tone-${["info", "violet", "warning", "success"][index % 4]} rounded-2xl border p-4`}
        >
          <p className={`text-[11px] font-extrabold uppercase tracking-wide ${titleColors[index % titleColors.length]}`}>
            {item.label}
          </p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[var(--color-navy,#0B3A6B)]">
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-1 text-xs text-[var(--color-slate,#3D5166)]">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function SectionIntro({
  title,
  purpose,
  children,
}: {
  title: string;
  purpose: string;
  children?: ReactNode;
}) {
  return (
    <div className="portal-section-intro">
      <div className="flex items-start gap-3">
        <span className="portal-section-mark" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-bold text-[var(--color-navy,#0B3A6B)] sm:text-2xl">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-[var(--color-slate,#3D5166)]">{purpose}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export const LOGRO_UNIT = "Porcentaje de logro %";
export { CHART, CHART_HEX };
