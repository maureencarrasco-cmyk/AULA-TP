"use client";

import { createElement, useEffect, useId, useState } from "react";
import type { MediaHotspot } from "@/lib/aula-module-types";

type Props = {
  modelUrl: string;
  hotspots: MediaHotspot[];
  selectedOptionIds: string[];
  onHotspotClick: (optionId: string, hotspotLabel: string) => void;
  disabled?: boolean;
};

/**
 * Posiciones en coordenadas del GLB condensadora-m6 (post Sketchfab):
 * X ≈ ancho (−0.39…0.41), Y ≈ profundidad (−0.32…0.61, fan hacia +Y),
 * Z ≈ alto (−0.22…0.16, base abajo).
 */
const POS: Record<string, string> = {
  // Aletas / serpentín — pack de fins cara +X (mitad altura del coil)
  "vis-suciedad": "0.39m 0.12m 0.06m",
  // Anclaje — pie delantero izquierdo del basamento (−Z abajo)
  "vis-anclaje": "-0.32m 0.10m -0.205m",
  // Unión de línea — válvulas / línea de servicio (lado, mitad baja, no bajo el frame)
  "vis-mancha": "0.32m -0.20m 0.00m",
  // Ventilador (distractor) — centro rejilla frontal (+Y)
  "vis-compresor": "-0.02m 0.50m 0.05m",
};

const NORMAL: Record<string, string> = {
  "vis-suciedad": "1 0.1 0.05",
  "vis-anclaje": "-0.4 0.35 -0.85",
  "vis-mancha": "0.75 -0.55 0.2",
  "vis-compresor": "0 1 0.08",
};

const SHORT_LABEL: Record<string, string> = {
  "vis-suciedad": "Aletas",
  "vis-anclaje": "Anclaje",
  "vis-mancha": "Unión",
  "vis-compresor": "Ventilador",
};

/** Alterna lado de la etiqueta para que las líneas no se amontonen. */
const LABEL_SIDE: Record<string, "left" | "right"> = {
  "vis-suciedad": "right",
  "vis-anclaje": "left",
  "vis-mancha": "left",
  "vis-compresor": "right",
};

function shortLabel(hs: MediaHotspot): string {
  return SHORT_LABEL[hs.optionId] ?? hs.label.split(/[/(]/)[0]!.trim().slice(0, 14);
}

function labelSide(optionId: string): "left" | "right" {
  return LABEL_SIDE[optionId] ?? "right";
}

type ModelViewerProps = React.HTMLAttributes<HTMLElement> & {
  src?: string;
  alt?: string;
  exposure?: string;
  "camera-controls"?: boolean | string;
  "touch-action"?: string;
  "shadow-intensity"?: string;
  "camera-orbit"?: string;
  "field-of-view"?: string;
  "interaction-prompt"?: string;
  children?: React.ReactNode;
};

function ModelViewer(props: ModelViewerProps) {
  return createElement("model-viewer", props);
}

const HOTSPOT_CSS = `
model-viewer.clim-mv {
  width: 100%;
  height: 100%;
  background-color: #e8eef6;
  --poster-color: transparent;
  overflow: visible;
}
model-viewer.clim-mv::part(default-progress-bar) {
  height: 2px;
  background: #0870ef;
}
button.clim-hotspot {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #0870ef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  cursor: pointer;
  padding: 0;
  position: relative;
  transition: background 0.15s ease, transform 0.15s ease;
}
button.clim-hotspot:hover,
button.clim-hotspot:focus-visible {
  transform: scale(1.12);
  outline: none;
}
button.clim-hotspot.is-active {
  background: #10b981;
  border-color: #ecfdf5;
}
button.clim-hotspot:disabled {
  cursor: default;
  opacity: 0.7;
}
.clim-annotation {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  color: rgba(0, 0, 0, 0.8);
  display: block;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  max-width: 9rem;
  padding: 0.4em 0.65em;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  width: max-content;
  pointer-events: none;
  z-index: 1;
}
/* Stem / leader line from label toward the blue dot (Google MV style) */
.clim-annotation::after {
  content: "";
  position: absolute;
  top: 50%;
  height: 2px;
  width: 34px;
  background: #fff;
  box-shadow:
    0 0 1px rgba(0, 0, 0, 0.95),
    0 1px 3px rgba(0, 0, 0, 0.55);
  transform: translateY(-50%);
  pointer-events: none;
}
button.clim-hotspot.label-right .clim-annotation {
  left: calc(100% + 34px);
  right: auto;
}
button.clim-hotspot.label-right .clim-annotation::after {
  right: 100%;
  left: auto;
}
button.clim-hotspot.label-left .clim-annotation {
  left: auto;
  right: calc(100% + 34px);
}
button.clim-hotspot.label-left .clim-annotation::after {
  left: 100%;
  right: auto;
}
/* Slight vertical stagger so overlapping side labels stay readable */
button.clim-hotspot[data-option="vis-suciedad"] .clim-annotation {
  transform: translateY(calc(-50% - 10px));
}
button.clim-hotspot[data-option="vis-mancha"] .clim-annotation {
  transform: translateY(calc(-50% + 12px));
}
button.clim-hotspot[data-option="vis-compresor"] .clim-annotation {
  transform: translateY(calc(-50% - 8px));
}
button.clim-hotspot[data-option="vis-anclaje"] .clim-annotation {
  transform: translateY(calc(-50% + 6px));
}
button.clim-hotspot.is-active .clim-annotation {
  background: #ecfdf5;
  color: #065f46;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.35);
}
button.clim-hotspot.is-active .clim-annotation::after {
  background: #10b981;
  box-shadow:
    0 0 1px rgba(6, 95, 70, 0.9),
    0 1px 2px rgba(0, 0, 0, 0.35);
}
button.clim-hotspot:hover .clim-annotation,
button.clim-hotspot:focus-visible .clim-annotation {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.28);
}
`;

export default function CondensadoraViewer({
  modelUrl,
  hotspots,
  selectedOptionIds,
  onHotspotClick,
  disabled,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void import("@google/model-viewer").then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-[var(--aula-line)] bg-slate-100 sm:h-[460px] [contain:paint]">
      <style dangerouslySetInnerHTML={{ __html: HOTSPOT_CSS }} />

      {!ready ? (
        <p className="absolute inset-0 z-10 flex items-center justify-center text-xs font-medium text-slate-700">
          Cargando visor 3D…
        </p>
      ) : null}

      <ModelViewer
        className="clim-mv"
        src={modelUrl}
        alt="Condensadora exterior para inspección visual"
        camera-controls
        touch-action="pan-y"
        shadow-intensity="0.85"
        exposure="1.05"
        camera-orbit="38deg 72deg 2.65m"
        field-of-view="38deg"
        interaction-prompt="none"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {hotspots.map((hs) => {
          const active = selectedOptionIds.includes(hs.optionId);
          const side = labelSide(hs.optionId);
          const slot = `hotspot-${uid}-${hs.id}`;
          return (
            <button
              key={hs.id}
              type="button"
              className={`clim-hotspot label-${side}${active ? " is-active" : ""}`}
              slot={slot}
              data-option={hs.optionId}
              data-position={POS[hs.optionId] ?? "0m 0.3m 0.5m"}
              data-normal={NORMAL[hs.optionId] ?? "0 0 1"}
              data-visibility-attribute="visible"
              disabled={disabled}
              title={hs.label}
              aria-label={hs.label}
              onClick={(e) => {
                e.stopPropagation();
                if (disabled) return;
                onHotspotClick(hs.optionId, hs.label);
              }}
            >
              <span className="clim-annotation">{shortLabel(hs)}</span>
            </button>
          );
        })}
      </ModelViewer>

      <p className="pointer-events-none absolute bottom-2 left-2 right-2 z-10 text-center text-[11px] font-medium text-slate-700">
        Arrastra para orbitar · toca el punto azul para etiquetar
      </p>
    </div>
  );
}
