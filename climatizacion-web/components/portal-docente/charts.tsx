/** Gráficos SVG/CSS alineados a tokens Aula TP — donut (%), barras (cantidades), línea (evolución). */

import type { ReactNode } from "react";

export const CHART = {
  blue: "var(--aula-blue, #0870ef)",
  blueDeep: "var(--aula-blue-deep, #0549b8)",
  teal: "var(--aula-teal, #008b98)",
  success: "var(--aula-success, #08a85f)",
  warning: "var(--aula-warning, #e99300)",
  danger: "var(--aula-danger, #e23b5c)",
  violet: "var(--aula-violet, #6d28d9)",
  muted: "var(--aula-text-muted, #5e7596)",
  line: "var(--aula-line, #d9e5f6)",
  track: "var(--aula-surface-tint, #edf6ff)",
  text: "var(--aula-text, #082b80)",
  soft: "var(--aula-surface-soft, #f5f9fe)",
} as const;

/** Colores hex para slices SVG (stroke no resuelve bien var() en todos los browsers). */
export const CHART_HEX = {
  blue: "#0870ef",
  blueDeep: "#0549b8",
  teal: "#008b98",
  success: "#08a85f",
  warning: "#e99300",
  danger: "#e23b5c",
  violet: "#6d28d9",
  muted: "#94a3b8",
  track: "#e2e8f0",
  ink: "#082b80",
} as const;

type ChartPanelProps = {
  children: ReactNode;
  className?: string;
  badge?: "live" | "demo" | "hub";
  title?: string;
  subtitle?: string;
};

export function ChartPanel({
  children,
  className = "",
  badge,
  title,
  subtitle,
}: ChartPanelProps) {
  return (
    <section
      className={`portal-chart-panel rounded-[1.5rem] border border-[var(--aula-line,#d9e5f6)] bg-[linear-gradient(135deg,rgba(255,255,255,.98),rgba(242,248,255,.98)_62%,rgba(247,244,255,.96))] p-5 shadow-[0_12px_28px_rgba(72,122,190,.10)] ${className}`}
    >
      {(title || badge) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-sm font-bold text-[var(--aula-text,#082b80)]">{title}</h3>
            ) : null}
            {subtitle ? (
              <p className="mt-0.5 text-xs text-[var(--aula-text-muted,#5e7596)]">{subtitle}</p>
            ) : null}
          </div>
          {badge ? <DataBadge kind={badge} /> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export function DataBadge({ kind }: { kind: "live" | "demo" | "hub" }) {
  const styles = {
    live: "bg-[var(--aula-success,#08a85f)] text-white",
    demo: "bg-[var(--aula-warning-soft,#fff5dd)] text-[var(--aula-warning-ink,#9b3e13)] ring-1 ring-[var(--aula-warning,#e99300)]/35",
    hub: "bg-[var(--aula-surface-tint,#edf6ff)] text-[var(--aula-blue-deep,#0549b8)] ring-1 ring-[var(--aula-blue,#0870ef)]/30",
  } as const;
  const labels = { live: "Datos reales", demo: "Ejemplo", hub: "Hub" } as const;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[kind]}`}
    >
      {labels[kind]}
    </span>
  );
}

type DonutSlice = { label: string; pct: number; color: string; count?: number; unit?: string };

type DonutChartProps = {
  title: string;
  slices: DonutSlice[];
  centerLabel?: string;
  size?: number;
  hideTitle?: boolean;
};

export function DonutChart({
  title,
  slices,
  centerLabel,
  size = 168,
  hideTitle = false,
}: DonutChartProps) {
  const stroke = 20;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  let offset = 0;
  const total = slices.reduce((s, x) => s + x.pct, 0) || 1;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${title}: ${slices.map((s) => `${s.label} ${s.count != null ? `${s.count} ${s.unit || "estudiantes"} · ` : ""}${s.pct}%`).join(", ")}`}
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={CHART_HEX.track}
            strokeWidth={stroke}
          />
          {slices.map((slice) => {
            const frac = slice.pct / total;
            const dash = frac * c;
            const el = (
              <circle
                key={slice.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={slice.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        {centerLabel ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums text-[var(--aula-text,#082b80)]">
              {centerLabel}
            </span>
          </div>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        {!hideTitle ? (
          <h3 className="text-sm font-semibold text-[var(--aula-text,#082b80)]">{title}</h3>
        ) : null}
        <ul className={`space-y-2 ${hideTitle ? "" : "mt-3"}`}>
          {slices.map((s) => (
            <li
              key={s.label}
              className="flex items-center gap-2 text-sm text-[var(--aula-text-secondary,#43628f)]"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">{s.label}</span>
              <span className="font-semibold tabular-nums text-[var(--aula-text,#082b80)]">
                {s.count != null ? `${s.count} ${s.unit || "estudiantes"} · ${s.pct}%` : `${s.pct}%`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type BarItem = { label: string; value: number; color?: string; valueLabel?: string };

type BarChartProps = {
  title: string;
  yAxisTitle: string;
  xAxisTitle?: string;
  items: BarItem[];
  color?: string;
  hideTitle?: boolean;
  valueSuffix?: string;
};

export function BarChart({
  title,
  yAxisTitle,
  xAxisTitle,
  items,
  color = CHART_HEX.blue,
  hideTitle = false,
  valueSuffix,
}: BarChartProps) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div>
      {!hideTitle ? (
        <>
          <h3 className="text-sm font-semibold text-[var(--aula-text,#082b80)]">{title}</h3>
          <p className="mt-1 text-xs text-[var(--aula-text-muted,#5e7596)]">
            Eje vertical: {yAxisTitle}
            {xAxisTitle ? ` · Eje horizontal: ${xAxisTitle}` : ""}
          </p>
        </>
      ) : (
        <p className="sr-only">
          {title}. {yAxisTitle}
        </p>
      )}
      <div
        className="portal-bar-chart mt-3 space-y-2.5 rounded-[1.25rem] border border-[var(--aula-line,#d9e5f6)] bg-[linear-gradient(135deg,rgba(255,255,255,.82),rgba(238,246,255,.95))] p-3 sm:p-4"
        role="img"
        aria-label={`${title}. ${items.map((i) => `${i.label}: ${i.valueLabel ?? `${i.value}${valueSuffix ? ` ${valueSuffix}` : ""}`}`).join("; ")}`}
      >
        {items.map((item) => {
          const pct = Math.max(2, Math.round((item.value / max) * 100));
          const barColor = item.color ?? color;
          const shown =
            item.valueLabel ?? `${item.value}${valueSuffix ? ` ${valueSuffix}` : ""}`;
          return (
            <div
              key={item.label}
              className="grid grid-cols-[minmax(0,6.5rem)_1fr_minmax(2.5rem,auto)] items-center gap-2 sm:grid-cols-[minmax(0,11rem)_1fr_minmax(4.5rem,auto)] sm:gap-3"
            >
              <p
                className="truncate text-right text-[11px] font-semibold leading-tight text-[var(--aula-text,#082b80)] sm:text-xs"
                title={item.label}
              >
                {item.label}
              </p>
              <div className="h-8 overflow-hidden rounded-full bg-white/90 ring-1 ring-[var(--aula-line,#d9e5f6)] sm:h-9">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: barColor,
                    minWidth: item.value > 0 ? "6px" : 0,
                  }}
                  title={`${item.label}: ${shown}`}
                />
              </div>
              <span className="text-right text-[11px] font-bold tabular-nums leading-tight text-[var(--aula-text,#082b80)] sm:text-xs">
                {shown}
              </span>
            </div>
          );
        })}
      </div>
      <p className="sr-only">
        {items.map((i) => `${i.label}: ${i.value} ${yAxisTitle}`).join(". ")}
      </p>
    </div>
  );
}

type LinePoint = { label: string; pct: number };

type LineChartProps = {
  title: string;
  points: LinePoint[];
  hideTitle?: boolean;
  yAxisTitle?: string;
  xAxisTitle?: string;
};

export function LineChart({
  title,
  points,
  hideTitle = false,
  yAxisTitle = "Porcentaje de logro %",
  xAxisTitle = "Mes",
}: LineChartProps) {
  const w = 560;
  const h = 220;
  const pad = { t: 28, r: 20, b: 40, l: 44 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const safePoints = points.map((point) => ({
    ...point,
    pct: Math.max(0, Math.min(100, point.pct)),
  }));
  const xs = safePoints.map((_, i) =>
    pad.l + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW),
  );
  const ys = safePoints.map((p) => pad.t + innerH - (p.pct / 100) * innerH);
  const path = safePoints
    .map((_, i) => `${i === 0 ? "M" : "L"} ${xs[i]} ${ys[i]}`)
    .join(" ");
  const areaPath =
    safePoints.length > 1
      ? `${path} L ${xs[xs.length - 1]} ${pad.t + innerH} L ${xs[0]} ${pad.t + innerH} Z`
      : "";
  const meanX = safePoints.length
    ? safePoints.reduce((sum, _, i) => sum + i, 0) / safePoints.length
    : 0;
  const meanY = safePoints.length
    ? safePoints.reduce((sum, point) => sum + point.pct, 0) / safePoints.length
    : 0;
  const denominator = safePoints.reduce((sum, _, i) => sum + (i - meanX) ** 2, 0);
  const slope = denominator
    ? safePoints.reduce((sum, point, i) => sum + (i - meanX) * (point.pct - meanY), 0) /
      denominator
    : 0;
  const intercept = meanY - slope * meanX;
  const trendPct = (index: number) =>
    Math.max(0, Math.min(100, intercept + slope * index));
  const trendPath = safePoints.length
    ? `M ${xs[0]} ${pad.t + innerH - (trendPct(0) / 100) * innerH} L ${xs[xs.length - 1]} ${pad.t + innerH - (trendPct(safePoints.length - 1) / 100) * innerH}`
    : "";

  return (
    <div>
      {!hideTitle ? (
        <>
          <h3 className="text-sm font-semibold text-[var(--aula-text,#082b80)]">{title}</h3>
          <p className="mt-1 text-xs text-[var(--aula-text-muted,#5e7596)]">
            Eje vertical: {yAxisTitle} · Eje horizontal: {xAxisTitle}
          </p>
        </>
      ) : (
        <p className="sr-only">
          {title}. Eje vertical: {yAxisTitle}. Eje horizontal: {xAxisTitle}.
        </p>
      )}
      <div className="mt-3 overflow-hidden rounded-xl border border-[var(--aula-line,#d9e5f6)] bg-[var(--aula-surface-soft,#f5f9fe)] p-2 sm:p-3">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${title}. Incluye resultado y recta de tendencia`}
        >
          <defs>
            <linearGradient id="aulaLineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_HEX.blue} stopOpacity="0.22" />
              <stop offset="100%" stopColor={CHART_HEX.blue} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = pad.t + innerH - (pct / 100) * innerH;
            return (
              <g key={pct}>
                <line
                  x1={pad.l}
                  x2={w - pad.r}
                  y1={y}
                  y2={y}
                  stroke={CHART_HEX.track}
                  strokeDasharray={pct === 0 ? undefined : "4 4"}
                />
                <text
                  x={pad.l - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill={CHART_HEX.muted}
                  fontSize="11"
                >
                  {pct}%
                </text>
              </g>
            );
          })}
          {areaPath ? <path d={areaPath} fill="url(#aulaLineFill)" /> : null}
          <path
            d={trendPath}
            fill="none"
            stroke={CHART_HEX.violet}
            strokeWidth={2}
            strokeDasharray="6 5"
          >
            <title>Recta de tendencia lineal</title>
          </path>
          <path d={path} fill="none" stroke={CHART_HEX.blue} strokeWidth={2.75} strokeLinejoin="round" strokeLinecap="round" />
          {safePoints.map((p, i) => (
            <g key={p.label}>
              <circle
                cx={xs[i]}
                cy={ys[i]}
                r={5.5}
                fill="#fff"
                stroke={CHART_HEX.blue}
                strokeWidth={2.5}
              >
                <title>{`${p.label}: ${p.pct}%`}</title>
              </circle>
              <text
                x={xs[i]}
                y={ys[i] - 12}
                textAnchor="middle"
                fill={CHART_HEX.ink}
                fontSize="11"
                fontWeight="700"
              >
                {p.pct}%
              </text>
              <text
                x={xs[i]}
                y={h - 14}
                textAnchor="middle"
                fill={CHART_HEX.muted}
                fontSize="11"
                fontWeight="600"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div
        className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--aula-text-muted,#5e7596)]"
        aria-hidden="true"
      >
        <span className="inline-flex items-center gap-2">
          <i
            className="h-2.5 w-6 rounded-full"
            style={{ background: CHART_HEX.blue }}
          />
          Resultado
        </span>
        <span className="inline-flex items-center gap-2">
          <i
            className="h-0.5 w-6 border-t-2 border-dashed"
            style={{ borderColor: CHART_HEX.violet }}
          />
          Recta de tendencia
        </span>
      </div>
    </div>
  );
}

type MiniDonutProps = {
  pct: number;
  label: string;
  size?: number;
  color?: string;
};

export function MiniDonut({
  pct,
  label,
  size = 88,
  color = CHART_HEX.blue,
}: MiniDonutProps) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const safe = Math.max(0, Math.min(100, pct));
  const dash = (safe / 100) * c;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label={`${label}: ${safe}%`}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={CHART_HEX.track}
            strokeWidth={stroke}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold tabular-nums text-[var(--aula-text,#082b80)]">
            {Math.round(safe)}%
          </span>
        </div>
      </div>
      <p className="text-center text-xs font-medium text-[var(--aula-text-muted,#5e7596)]">
        {label}
      </p>
    </div>
  );
}
