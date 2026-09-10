"use client";

import {
  FASE_LABELS,
  mapHabilidadToEtapa,
  shortTitle,
  type EstacionBase,
} from "@/lib/aula-module-types";
import "@/app/curso/climatizacion/clim-radial-map.css";

export type ClimRadialMapProps = {
  estaciones: EstacionBase[];
  completedIds: string[];
  currentId: string;
  centerImage?: string;
  centerImageAlt?: string;
  isUnlocked: (e: EstacionBase, completedIds: string[]) => boolean;
  onSelect: (e: EstacionBase) => void;
};

const FASE_TONE: Record<
  EstacionBase["fase"],
  "navy" | "blue" | "teal" | "purple" | "orange" | "magenta" | "gold" | "eval"
> = {
  contextualizacion: "navy",
  estacion_ae: "teal",
  situacion_integradora: "orange",
  evaluacion_final: "eval",
  retroalimentacion: "magenta",
};

const AE_TONES = ["blue", "teal", "purple", "gold"] as const;

function toneFor(e: EstacionBase, aeIndex: number): string {
  if (e.fase === "estacion_ae") return AE_TONES[aeIndex % AE_TONES.length];
  return FASE_TONE[e.fase];
}

/** Safe positions (% left/top) around center — keeps labels inside the card. */
function orbitPosition(index: number, total: number): { left: string; top: string } {
  if (total <= 0) return { left: "50%", top: "50%" };

  const safeSlots = [
    { left: 17, top: 24 },
    { left: 39, top: 15 },
    { left: 62, top: 16 },
    { left: 80, top: 32 },
    { left: 78, top: 66 },
    { left: 59, top: 87 },
    { left: 38, top: 87 },
    { left: 18, top: 62 },
    { left: 50, top: 12 },
  ];

  if (total >= 7 && total <= safeSlots.length) {
    const pos = safeSlots[index] ?? safeSlots[safeSlots.length - 1];
    return { left: `${pos.left}%`, top: `${pos.top}%` };
  }

  // Smaller modules keep a soft orbital layout without touching the edges.
  const startDeg = -135;
  const sweep = total === 1 ? 0 : 270;
  const deg = startDeg + (index * sweep) / Math.max(total - 1, 1);
  const rad = (deg * Math.PI) / 180;
  const rx = 31;
  const ry = 28;
  const left = 50 + Math.cos(rad) * rx;
  const top = 48 + Math.sin(rad) * ry;
  return { left: `${left.toFixed(2)}%`, top: `${top.toFixed(2)}%` };
}

function statusLabel(
  e: EstacionBase,
  done: boolean,
  open: boolean,
  active: boolean,
): string {
  if (done) return "Completada";
  if (active) return "En progreso";
  if (!open) return "Bloqueada";
  return "Disponible";
}

export default function ClimRadialMap({
  estaciones,
  completedIds,
  currentId,
  centerImage,
  centerImageAlt,
  isUnlocked,
  onSelect,
}: ClimRadialMapProps) {
  const si =
    estaciones.find((e) => e.fase === "situacion_integradora") ??
    estaciones.find((e) => /situacion.?integradora/i.test(e.slug)) ??
    null;

  const satellites = estaciones.filter((e) => (si ? e.id !== si.id : true));
  const compact = satellites.length >= 7;
  let aeIdx = 0;

  const siDone = si ? completedIds.includes(si.id) : false;
  const siOpen = si ? isUnlocked(si, completedIds) : false;
  const siActive = si ? si.id === currentId : false;

  return (
    <div className="clim-radial-wrap">
      <section
        className="clim-radial-card"
        aria-label="Mapa de ruta del módulo · Situación Integradora al centro"
      >
        <div className="clim-radial-orbit" role="list">
          {satellites.map((e, i) => {
            const tone =
              e.fase === "estacion_ae"
                ? toneFor(e, aeIdx++)
                : toneFor(e, 0);
            const pos = orbitPosition(i, satellites.length);
            const done = completedIds.includes(e.id);
            const open = isUnlocked(e, completedIds);
            const active = e.id === currentId;
            const label = statusLabel(e, done, open, active);
            const icon =
              e.fase === "contextualizacion"
                ? "◎"
                : e.fase === "evaluacion_final"
                  ? "⏱"
                  : e.fase === "retroalimentacion"
                    ? "↻"
                    : "◆";

            return (
              <button
                key={e.id}
                type="button"
                role="listitem"
                disabled={!open}
                onClick={() => open && onSelect(e)}
                className={`clim-radial-node tone-${tone}${compact ? " clim-radial-node--compact" : ""}${
                  done ? " is-done" : ""
                }${active ? " is-active" : ""}${!open ? " is-locked" : ""}`}
                style={{ left: pos.left, top: pos.top }}
                aria-label={`${shortTitle(e.titulo)}: ${label}`}
                aria-current={active ? "step" : undefined}
              >
                <span className="clim-radial-disc">
                  <b className="clim-radial-number">{e.orden + 1}</b>
                  <span aria-hidden style={{ fontSize: compact ? 18 : 22 }}>
                    {icon}
                  </span>
                </span>
                <strong>{shortTitle(e.titulo)}</strong>
                <span className="clim-radial-status">{label}</span>
              </button>
            );
          })}
        </div>

        {si ? (
          <button
            type="button"
            className={`clim-radial-center${si.id === "m1-sit" ? " clim-radial-center--planos" : ""}${siDone ? " is-done" : ""}${
              siActive ? " is-active" : ""
            }${!siOpen ? " is-locked" : ""}`}
            disabled={!siOpen}
            onClick={() => siOpen && onSelect(si)}
            aria-label={`Situación Integradora: ${statusLabel(si, siDone, siOpen, siActive)}`}
            aria-current={siActive ? "step" : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                (si.id === "m1-sit" ? "/images/climatizacion/si-planos-v2.png" : centerImage) ||
                si.mediaUrl ||
                "/images/climatizacion/m1-planos-contexto.png"
              }
              alt={si.id === "m1-sit" ? "Ilustración de oficinas con ductos de climatización, tuberías y un plano arquitectónico" : centerImageAlt || si.mediaAlt || "Situación Integradora"}
            />
            <div>
              <strong>{si.id === "m1-sit" ? "Situación Integradora" : "SI"}</strong>
              <span>{si.id === "m1-sit" ? si.titulo.replace(/^Situación Integradora — /, "") : shortTitle(si.titulo)}</span>
            </div>
            {si.id === "m1-sit" ? (
              <span className="clim-center-state">
                <i aria-hidden>{siDone ? "✓" : siOpen ? "→" : "○"}</i>
                {statusLabel(si, siDone, siOpen, siActive)}
              </span>
            ) : (
              <i className="clim-radial-shield" aria-hidden>
                {siDone ? "✓" : "★"}
              </i>
            )}
          </button>
        ) : null}
      </section>

      <p className="mt-2 px-1 text-[11px] text-[var(--aula-text-muted)]">
        Centro: {FASE_LABELS.situacion_integradora}. Satélites: estaciones de la
        ruta obligatoria (contexto → AE → evaluación → cierre).
      </p>
    </div>
  );
}

export function ClimPedagogicalRibbon({
  activeEtapa,
}: {
  activeEtapa: ReturnType<typeof mapHabilidadToEtapa>;
}) {
  const stages: {
    id: ReturnType<typeof mapHabilidadToEtapa>;
    label: string;
    tone: string;
    n: number;
  }[] = [
    { id: "analizar", label: "Analizar", tone: "navy", n: 1 },
    { id: "comprender", label: "Comprender", tone: "red", n: 2 },
    { id: "relacionar", label: "Relacionar", tone: "purple", n: 3 },
    { id: "aplicar", label: "Aplicar", tone: "orange", n: 4 },
    { id: "verificar", label: "Verificar", tone: "teal", n: 5 },
    { id: "retroalimentar", label: "Retroalimentar", tone: "gold", n: 6 },
  ];

  const activeIdx = stages.findIndex((s) => s.id === activeEtapa);

  return (
    <section className="clim-ribbon" aria-label="Ciclo pedagógico Aula TP">
      <h2 className="clim-ribbon-title">
        Ciclo Aula TP · etapa activa
      </h2>
      <div className="clim-ribbon-stages">
        {stages.map((s, i) => (
          <div
            key={s.id}
            className={`clim-ribbon-stage tone-${s.tone}${
              s.id === activeEtapa ? " is-active" : ""
            }${i < activeIdx ? " is-done" : ""}`}
            aria-current={s.id === activeEtapa ? "step" : undefined}
          >
            <span aria-hidden>{s.n}</span>
            <strong>{s.label}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
