"use client";

import Link from "next/link";
import { useId } from "react";
import CourseStatsCard from "@/components/curso/shared/CourseStatsCard";
import type { HubModule } from "@/lib/course-hubs";
import "@/app/curso/climatizacion/hub.css";
import "@/app/curso/climatizacion/clim-radial-map.css";
import "@/app/curso/climatizacion/learning-path.css";

const TONES = ["navy", "teal", "blue", "magenta"] as const;

export type PathVariant = "lineal" | "serpenteante" | "sendero" | "metro" | "escalera" | "pedagogica";

const MODEL_TAG: Record<PathVariant, string> = {
  lineal: "Modelo A · camino lineal",
  serpenteante: "Modelo B · camino serpenteante",
  sendero: "Modelo C · sendero por etapas",
  metro: "Modelo D · estaciones metro",
  escalera: "Modelo E · escalera de avance",
  pedagogica: "Ruta pedagógica · viaje por estaciones",
};

export type PathProgress = {
  numero: number;
  completed: number;
  total: number;
  pct: number;
  nextTitle?: string;
};

export type LearningPathProps = {
  variant: PathVariant;
  title: string;
  subtitle: string;
  modules: HubModule[];
  nums: number[];
  progress: PathProgress[];
  totalModules: number;
  loading?: boolean;
  error?: boolean;
  showProgress?: boolean;
  showModelTag?: boolean;
  sectionId?: string;
  /** CTA when the module is available and not done/next/in-progress */
  enterLabel?: string;
  showSupportTools?: boolean;
  firstModuleHref?: string;
};

function serpentineSlots(count: number) {
  const n = Math.max(count, 1);
  return Array.from({ length: n }, (_, i) => ({
    left: `${12 + (i * 76) / Math.max(n - 1, 1)}%`,
    top: i % 2 === 0 ? "6%" : "50%",
    side: (i % 2 === 0 ? "up" : "down") as "up" | "down",
  }));
}

function PedagogicaScene() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="aula-path-journey-bg"
        src="/images/aula-tp-ruta-paisaje.png"
        alt=""
        aria-hidden
      />
      <div className="aula-path-journey-veil" aria-hidden />
    </>
  );
}

function RoadStroke({ d }: { d: string }) {
  return (
    <>
      <path d={d} fill="none" stroke="var(--color-slate)" strokeWidth="54" strokeLinecap="round" />
      <path d={d} fill="none" stroke="var(--color-muted)" strokeWidth="40" strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke="var(--color-card)"
        strokeWidth="3"
        strokeDasharray="18 16"
        strokeLinecap="round"
        opacity="0.92"
      />
    </>
  );
}

function JourneyRoad({ count }: { count: number }) {
  const upper = count >= 5
    ? "M 40 250 C 180 230, 280 170, 420 210 S 680 310, 920 190"
    : "M 40 520 C 180 500, 260 430, 360 470 S 560 620, 680 430 S 820 280, 970 390";
  const lower = "M 40 560 C 200 530, 360 500, 540 540 S 780 620, 960 510";
  return (
    <svg className="aula-path-journey-road" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden>
      <RoadStroke d={upper} />
      {count >= 5 ? <RoadStroke d={lower} /> : null}
    </svg>
  );
}

function toneFor(i: number) {
  return TONES[i % TONES.length];
}

function stationState(p: PathProgress | undefined, next: boolean, available: boolean) {
  if (p?.pct === 100) return "done" as const;
  if (next) return "next" as const;
  if (p && p.completed > 0) return "next" as const;
  if (available) return "ready" as const;
  return "wait" as const;
}

function ctaLabel(args: {
  available: boolean;
  done: boolean;
  next: boolean;
  inProgress: boolean;
  enterLabel: string;
}) {
  if (!args.available) return "Próximamente";
  if (args.done) return "Revisar módulo";
  if (args.next) return "Continuar aquí →";
  if (args.inProgress) return "Retomar módulo";
  return args.enterLabel;
}

function StationCard({
  card,
  i,
  p,
  next,
  loading,
  error,
  showProgress,
  totalModules,
  enterLabel,
  compact = false,
}: {
  card: HubModule;
  i: number;
  p?: PathProgress;
  next: boolean;
  loading?: boolean;
  error?: boolean;
  showProgress?: boolean;
  totalModules: number;
  enterLabel: string;
  compact?: boolean;
}) {
  const done = p?.pct === 100;
  const inProgress = Boolean(p && p.completed > 0 && p.pct !== 100);
  const tone = toneFor(i);
  const itemClass = `clim-hub-route-item tone-${tone}${compact ? " is-compact" : ""}${done ? " route-done" : next ? " route-next" : ""}${card.available ? "" : " opacity-90"}`;
  const statusText = loading
    ? "Cargando…"
    : error
      ? "Avance no disponible"
      : done
        ? "Completado"
        : next
          ? "Continúa aquí"
          : inProgress
            ? "En curso"
            : card.available
              ? "Disponible"
              : "Por comenzar";
  const inner = (
    <>
      <span className="clim-hub-route-step">{done ? "✓" : card.numero}</span>
      <div className="clim-hub-route-body">
        {compact ? null : (
          <span className="clim-hub-route-icon" aria-hidden>
            {card.numero}
          </span>
        )}
        <small className="text-[10px] font-bold uppercase tracking-wide text-[var(--aula-teal)]">
          Módulo {card.numero}
          {card.oa ? ` · ${card.oa}` : ""}
        </small>
        <h3>{card.title}</h3>
        <span className="route-state">{statusText}</span>
        {showProgress && p && !loading && !error ? (
          <>
            <progress className="route-progress" max={p.total} value={p.completed} aria-label={`Avance del módulo ${card.numero}`} />
            <span className="route-count">
              {p.completed} de {p.total} estaciones · {p.pct}%
            </span>
            {next && p.nextTitle ? (
              <span className="route-pending" title={p.nextTitle}>
                Siguiente: {p.nextTitle}
              </span>
            ) : null}
          </>
        ) : (
          <p className="clim-hub-route-blurb">{card.blurb}</p>
        )}
        <p className="clim-hub-route-hours">{card.hoursLabel}</p>
        {compact ? null : (
          <CourseStatsCard
            modules={`${card.numero} de ${totalModules}`}
            hoursAnnual={card.hoursAnnual}
            hours3d={card.hours3d}
            status={
              done
                ? "Completado"
                : next || inProgress
                  ? "En curso"
                  : card.available
                    ? "Disponible"
                    : "Próximamente"
            }
            label={`Resumen del módulo ${card.numero}`}
          />
        )}
        <span className="clim-hub-route-enter">{ctaLabel({ available: card.available, done, next, inProgress, enterLabel })}</span>
      </div>
    </>
  );
  if (card.available) {
    return (
      <Link href={card.href} id={`modulo-${card.numero}`} className={itemClass} aria-current={next ? "step" : undefined}>
        {inner}
      </Link>
    );
  }
  return (
    <div id={`modulo-${card.numero}`} className={itemClass}>
      {inner}
    </div>
  );
}

function RoadSvg({ id }: { id: string }) {
  const d = "M 70 430 C 160 220, 250 140, 340 250 S 520 560, 620 250 S 780 80, 940 210";
  return (
    <svg className="aula-path-svg" viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d7eef8" />
          <stop offset="55%" stopColor="#cfe8c9" />
          <stop offset="100%" stopColor="#e7f3dc" />
        </linearGradient>
      </defs>
      <rect width="1000" height="640" fill={`url(#${id}-sky)`} />
      <ellipse cx="780" cy="150" rx="180" ry="48" fill="#9ec9e8" opacity="0.45" />
      <path d="M 0 470 C 180 430, 280 500, 430 470 S 720 430, 1000 500 L 1000 640 L 0 640 Z" fill="#8fbf72" />
      <path d={d} fill="none" stroke="#5f686d" strokeWidth="46" strokeLinecap="round" />
      <path d={d} fill="none" stroke="#9aa3aa" strokeWidth="34" strokeLinecap="round" />
      <path d={d} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="16 14" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export default function LearningPath({
  variant,
  title,
  subtitle,
  modules,
  nums,
  progress,
  totalModules,
  loading,
  error,
  showProgress = true,
  showModelTag = false,
  sectionId,
  enterLabel = "Entrar al mapa",
  showSupportTools = false,
  firstModuleHref,
}: LearningPathProps) {
  const uid = useId().replace(/:/g, "");
  const recommended =
    progress.length > 0 ? nums.find((n) => progress.find((p) => p.numero === n)?.pct !== 100) : undefined;
  const stations = nums
    .map((n, i) => {
      const card = modules.find((m) => m.numero === n);
      if (!card) return null;
      const p = progress.find((item) => item.numero === n);
      const next = Boolean(!loading && !error && recommended !== undefined && n === recommended);
      return { card, i, p, next };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const cardProps = { loading, error, showProgress, totalModules, enterLabel };

  return (
    <section
      className={`clim-hub-route-panel aula-path aula-path--${variant}`}
      aria-label={title}
      id={sectionId}
    >
      <div className="aula-path-head">
        <h2>
          <span aria-hidden className="clim-route-heading-icon" />
          <span>
            {variant === "pedagogica" ? "Ruta pedagógica" : "Ruta de aprendizaje"} · {title}
          </span>
        </h2>
        {showModelTag ? <span className="aula-path-model-tag">{MODEL_TAG[variant]}</span> : null}
      </div>
      <p>{subtitle}</p>

      {variant === "lineal" ? (
        <>
          <div className="clim-hub-route" style={{ ["--path-cols" as string]: String(Math.max(stations.length, 1)) }}>
            {stations.map(({ card, i, p, next }) => (
              <div key={card.numero} className="aula-path-lineal-slot">
                {i < stations.length - 1 ? (
                  <span className="clim-hub-route-arrow" aria-hidden>
                    ›
                  </span>
                ) : null}
                <StationCard card={card} i={i} p={p} next={next} {...cardProps} />
              </div>
            ))}
          </div>
          <div className="aula-path-lineal-road" aria-hidden>
            <svg viewBox="0 0 1000 42" preserveAspectRatio="none">
              <path d="M 20 22 C 180 8, 320 34, 500 22 S 820 8, 980 22" fill="none" stroke="#5f686d" strokeWidth="18" />
              <path d="M 20 22 C 180 8, 320 34, 500 22 S 820 8, 980 22" fill="none" stroke="#9aa3aa" strokeWidth="12" />
              <path d="M 20 22 C 180 8, 320 34, 500 22 S 820 8, 980 22" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="12 10" />
            </svg>
            <ol className="aula-path-nodes" style={{ gridTemplateColumns: `repeat(${stations.length}, minmax(0, 1fr))` }}>
              {stations.map(({ card, p, next }) => {
                const kind = stationState(p, next, card.available);
                return (
                  <li key={card.numero}>
                    <span className={`aula-path-node is-${kind}`} />
                    <span className="aula-path-node-label">M{card.numero}</span>
                  </li>
                );
              })}
            </ol>
            <span className="aula-path-finish">▶</span>
          </div>
        </>
      ) : null}

      {variant === "serpenteante" ? (
        <div className="aula-path-board">
          <RoadSvg id={uid} />
          <div className="aula-path-flags" aria-hidden>
            <span />
            <span />
          </div>
          {stations.map(({ card, i, p, next }) => {
            const slot = serpentineSlots(stations.length)[i];
            const kind = stationState(p, next, card.available);
            return (
              <div
                key={card.numero}
                className="aula-path-stop"
                data-side={slot.side}
                style={{ left: slot.left, top: slot.top }}
              >
                <StationCard card={card} i={i} p={p} next={next} {...cardProps} />
                <span className={`aula-path-pin is-${kind}`}>{doneLabel(p, card.numero)}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      {variant === "sendero" ? (
        <div className="aula-path-trail">
          {stations.map(({ card, i, p, next }) => {
            const kind = stationState(p, next, card.available);
            return (
              <div key={card.numero} className="aula-path-trail-row">
                <div className="aula-path-trail-rail" aria-hidden>
                  <span className={`aula-path-trail-dot is-${kind}`}>{doneLabel(p, card.numero)}</span>
                </div>
                <div className="aula-path-trail-card">
                  <StationCard card={card} i={i} p={p} next={next} {...cardProps} />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {variant === "metro" ? (
        <div className="aula-path-metro" style={{ ["--metro-cols" as string]: String(Math.max(stations.length, 1)) }}>
          <div className="aula-path-metro-track" aria-hidden>
            <span className="aula-path-metro-rail" />
            {stations.map(({ card, p, next }, i) => {
              const kind = stationState(p, next, card.available);
              return (
                <div key={card.numero} className={`aula-path-metro-stop is-${kind}`} style={{ ["--metro-i" as string]: String(i) }}>
                  <span className="aula-path-metro-disc">{doneLabel(p, card.numero)}</span>
                  <span className="aula-path-metro-stem" />
                </div>
              );
            })}
            <span className="aula-path-metro-end" aria-hidden>
              Meta
            </span>
          </div>
          <div className="aula-path-metro-cards">
            {stations.map(({ card, i, p, next }) => (
              <div key={card.numero} className="aula-path-metro-card-slot">
                <StationCard card={card} i={i} p={p} next={next} {...cardProps} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {variant === "escalera" ? (
        <div className="aula-path-stairs" style={{ ["--stair-cols" as string]: String(Math.max(stations.length, 1)) }}>
          <div className="aula-path-stairs-sky" aria-hidden>
            <span className="aula-path-stairs-flag" />
            <span className="aula-path-stairs-flag aula-path-stairs-flag--teal" />
          </div>
          <ol className="aula-path-stairs-list">
            {stations.map(({ card, i, p, next }) => {
              const kind = stationState(p, next, card.available);
              return (
                <li
                  key={card.numero}
                  className={`aula-path-stair is-${kind}`}
                  style={{ ["--stair-i" as string]: String(i), ["--stair-n" as string]: String(stations.length) }}
                >
                  <div className="aula-path-stair-riser" aria-hidden>
                    <span className="aula-path-stair-badge">{doneLabel(p, card.numero)}</span>
                    <span className="aula-path-stair-tread" />
                  </div>
                  <div className="aula-path-stair-card">
                    <StationCard card={card} i={i} p={p} next={next} {...cardProps} />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {variant === "pedagogica" ? (
        <div className="aula-path-journey" data-count={stations.length}>
          <PedagogicaScene />
          <JourneyRoad count={stations.length} />
          {showSupportTools && firstModuleHref ? (
            <aside className="aula-path-journey-tools" aria-label="Herramientas de apoyo">
              <Link className="aula-path-journey-tool aula-path-journey-tool--pl" href={firstModuleHref}>
                <i aria-hidden>⚗</i>
                <div>
                  <b>Práctica libre</b>
                  <span>Explora, experimenta y refuerza tus habilidades</span>
                </div>
              </Link>
              <Link className="aula-path-journey-tool aula-path-journey-tool--tutor" href={firstModuleHref}>
                <i aria-hidden>●</i>
                <div>
                  <b>Agente pedagógico</b>
                  <span>Te orienta y resuelve tus dudas</span>
                </div>
              </Link>
              <Link className="aula-path-journey-tool aula-path-journey-tool--a11y" href={firstModuleHref}>
                <i aria-hidden>☺</i>
                <div>
                  <b>Accesibilidad</b>
                  <span>Personaliza tu experiencia de aprendizaje</span>
                </div>
              </Link>
            </aside>
          ) : null}
          {stations.map(({ card, i, p, next }) => {
            const kind = stationState(p, next, card.available);
            const isMeta = i === stations.length - 1;
            return (
              <div
                key={card.numero}
                className={`aula-path-stop aula-path-stop--journey${isMeta ? " is-meta" : ""}`}
                data-side="up"
                data-slot={i}
              >
                <StationCard card={card} i={i} p={p} next={next} compact {...cardProps} />
                <span className={`aula-path-pin aula-path-pin--glow is-${kind}`}>
                  {doneLabel(p, card.numero)}
                </span>
              </div>
            );
          })}
          <div className="aula-path-meta" aria-label="Meta del tramo">
            <span className="aula-path-meta-flag" aria-hidden />
            <strong>Meta</strong>
            <small>Cierre del tramo</small>
          </div>
          {showProgress ? (
            <div className="aula-path-journey-bar">
              <span className="aula-path-journey-bar-copy">
                Tu progreso general
                <small>
                  {stations.filter(({ p }) => p?.pct === 100).length} de {stations.length} módulos completados
                </small>
              </span>
              <span className="aula-path-journey-bar-track">
                <i
                  style={{
                    width: `${Math.round(
                      (stations.filter(({ p }) => p?.pct === 100).length / Math.max(stations.length, 1)) * 100,
                    )}%`,
                  }}
                />
              </span>
              <strong className="aula-path-journey-bar-copy" style={{ minWidth: "3rem", textAlign: "right" }}>
                {Math.round(
                  (stations.filter(({ p }) => p?.pct === 100).length / Math.max(stations.length, 1)) * 100,
                )}
                %
              </strong>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function doneLabel(p: PathProgress | undefined, n: number) {
  return p?.pct === 100 ? "✓" : String(n);
}
