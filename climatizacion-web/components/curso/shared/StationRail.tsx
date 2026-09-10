"use client";

import type { EstacionBase, FaseRuta } from "@/lib/aula-module-types";
import { FASE_LABELS } from "@/lib/aula-module-types";
import "@/app/curso/climatizacion/clim-module-overview.css";

export type StationRailTone = "green" | "blue" | "purple" | "orange" | "pink";
export type StationRailState = "completed" | "active" | "available" | "locked";

export type StationRailItem = {
  id: string;
  n: number;
  title: string;
  subtitle: string;
  state: StationRailState;
  tone: StationRailTone;
  icon: string;
};

const STATUS_LABEL: Record<StationRailState, string> = {
  completed: "Completada",
  active: "En curso",
  available: "Disponible",
  locked: "Pendiente",
};

export function toneForFase(fase: FaseRuta): StationRailTone {
  if (fase === "contextualizacion") return "green";
  if (fase === "situacion_integradora") return "purple";
  if (fase === "evaluacion_final") return "orange";
  if (fase === "retroalimentacion") return "pink";
  return "blue";
}

export function iconForFase(fase: FaseRuta): string {
  if (fase === "contextualizacion") return "▤";
  if (fase === "situacion_integradora") return "✚";
  if (fase === "evaluacion_final") return "✓";
  if (fase === "retroalimentacion") return "↻";
  return "◎";
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
    state,
    tone: toneForFase(estacion.fase),
    icon: iconForFase(estacion.fase),
  };
}

export default function StationRail({
  items,
  onSelect,
}: {
  items: StationRailItem[];
  onSelect: (id: string) => void;
}) {
  return (
    <section className="aula-overview-card aula-module-route aula-module-route--guide" aria-labelledby="module-route-heading">
      <h2 id="module-route-heading">
        <span aria-hidden>▦</span> Ruta del módulo
      </h2>
      <div className="aula-module-route-track" role="list" aria-label="Ruta de estaciones del módulo">
        {items.map((item, index) => {
          const open = item.state !== "locked";
          return (
            <button
              key={item.id}
              type="button"
              role="listitem"
              disabled={!open}
              onClick={() => open && onSelect(item.id)}
              className={`aula-module-route-step tone-${item.tone} is-${item.state}${index === items.length - 1 ? " is-last" : ""}`}
              aria-current={item.state === "active" ? "step" : undefined}
            >
              <span className="aula-module-route-number">{item.state === "completed" ? "✓" : item.n}</span>
              <span className="aula-module-route-icon" aria-hidden>
                {item.icon}
              </span>
              <strong>{item.title}</strong>
              <em>{item.subtitle}</em>
              <small>{STATUS_LABEL[item.state]}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
