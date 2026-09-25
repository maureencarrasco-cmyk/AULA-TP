"use client";

import type { EstacionBase, FaseRuta } from "@/lib/aula-module-types";
import { FASE_LABELS } from "@/lib/aula-module-types";
import "@/app/curso/climatizacion/clim-module-overview.css";

export type StationRailTone =
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "pink"
  | "orange";
export type StationRailState = "completed" | "active" | "available" | "locked";

export type StationRailItem = {
  id: string;
  n: number;
  title: string;
  subtitle: string;
  duration?: string;
  state: StationRailState;
  tone: StationRailTone;
  icon: string;
};

const STATUS_LABEL: Record<StationRailState, string> = {
  completed: "Completada",
  active: "En desarrollo",
  available: "Disponible",
  locked: "Bloqueada",
};

/** Un color por posición en la ruta: el recorrido se lee de un vistazo. */
const RAIL_TONES: StationRailTone[] = [
  "blue",
  "green",
  "purple",
  "red",
  "pink",
  "orange",
];

const RAIL_ICONS = ["▤", "◈", "▣", "▥", "✎", "⚙", "▦", "◎"];

export function toneForIndex(index: number): StationRailTone {
  return RAIL_TONES[index % RAIL_TONES.length];
}

export function iconForFase(fase: FaseRuta, index = 0): string {
  if (fase === "contextualizacion") return "▤";
  if (fase === "situacion_integradora") return "✚";
  if (fase === "evaluacion_final") return "✓";
  if (fase === "retroalimentacion") return "↻";
  return RAIL_ICONS[index % RAIL_ICONS.length];
}

function durationLabel(horas: number): string | undefined {
  if (!horas) return undefined;
  const minutos = Math.round(horas * 60);
  return minutos >= 60 ? `${horas} h` : `${minutos} min`;
}

export function railItemFromEstacion(
  estacion: EstacionBase,
  args: { index: number; done: boolean; active: boolean; open: boolean },
): StationRailItem {
  const state: StationRailState = args.done
    ? "completed"
    : args.active
      ? "active"
      : args.open
        ? "available"
        : "locked";
  return {
    id: estacion.id,
    n: args.index + 1,
    title: estacion.titulo,
    subtitle: FASE_LABELS[estacion.fase] || estacion.habilidad,
    duration: durationLabel(estacion.horas),
    state,
    tone: toneForIndex(args.index),
    icon: iconForFase(estacion.fase, args.index),
  };
}

export default function StationRail({
  items,
  onSelect,
  layout = "track",
}: {
  items: StationRailItem[];
  onSelect: (id: string) => void;
  layout?: "track" | "panel";
}) {
  const isPanel = layout === "panel";
  return (
    <section
      className={`aula-overview-card aula-module-route aula-module-route--guide${isPanel ? " aula-module-route--panel" : ""}`}
      aria-labelledby="module-route-heading"
    >
      <h2 id="module-route-heading">
        <span aria-hidden>▦</span> Ruta del módulo
      </h2>
      <div
        className="aula-module-route-track"
        role="list"
        aria-label="Ruta de estaciones del módulo"
      >
        {items.map((item, index) => {
          const open = item.state !== "locked";
          return (
            <button
              key={item.id}
              type="button"
              role="listitem"
              disabled={!open}
              onClick={() => open && onSelect(item.id)}
              className={`aula-module-route-step is-${item.state}${
                index === items.length - 1 ? " is-last" : ""
              }`}
              aria-current={item.state === "active" ? "step" : undefined}
            >
              <span className="aula-module-route-number">
                {item.state === "completed" ? "✓" : item.n}
              </span>
              {isPanel ? null : (
                <span className="aula-module-route-icon" aria-hidden>
                  {item.icon}
                </span>
              )}
              <strong>{item.title}</strong>
              <em>{item.subtitle}</em>
              {item.duration ? <span className="aula-module-route-time">{item.duration}</span> : null}
              <small>{STATUS_LABEL[item.state]}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
