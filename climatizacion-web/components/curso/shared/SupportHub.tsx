"use client";

import { useEffect, useId, useRef, useState } from "react";
import "@/app/curso/climatizacion/support-hub.css";

export type SupportHubContext = {
  moduleLabel: string;
  stationTitle: string;
  topicPrompt?: string;
  aeCodes?: string[];
  stageLabel?: string;
  plDone?: number;
  plTotal?: number;
  agentDisabled?: boolean;
  agentDisabledReason?: string;
};

export type SupportHubProps = {
  context: SupportHubContext;
  onOpenPractice: () => void;
  onOpenAgent: () => void;
  onOpenAccessibility: () => void;
};

export default function SupportHub({
  context,
  onOpenPractice,
  onOpenAgent,
  onOpenAccessibility,
}: SupportHubProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const plLabel =
    typeof context.plDone === "number" && typeof context.plTotal === "number"
      ? `${context.plDone}/${context.plTotal}`
      : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  const topicLine = [
    context.moduleLabel,
    context.stationTitle,
    context.aeCodes?.length ? context.aeCodes.join(" · ") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div ref={rootRef} className={`aula-support-hub ${open ? "is-open" : ""}`}>
      {open ? (
        <div className="aula-support-hub__menu" id={menuId} role="menu" aria-label="Apoyos contextualizados">
          <div className="aula-support-hub__context" role="status">
            <small>Ayuda según lo que ves ahora</small>
            <strong>{topicLine}</strong>
            {context.topicPrompt ? <p>{context.topicPrompt}</p> : null}
            {context.stageLabel ? <em>{context.stageLabel}</em> : null}
          </div>

          <button
            type="button"
            role="menuitem"
            className="aula-support-hub__card is-practice"
            onClick={() => run(onOpenPractice)}
          >
            <strong>Práctica libre</strong>
            <span>
              Explora sin alterar tu % de ruta
              {plLabel ? ` · ${plLabel}` : ""}
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            className="aula-support-hub__card is-agent"
            onClick={() => run(onOpenAgent)}
            disabled={context.agentDisabled}
            aria-disabled={context.agentDisabled || undefined}
          >
            <strong>Agente pedagógico</strong>
            <span>
              {context.agentDisabled
                ? context.agentDisabledReason || "No disponible en evaluación formal"
                : "Pistas y orientación gradual sobre esta estación"}
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            className="aula-support-hub__card is-a11y"
            onClick={() => run(onOpenAccessibility)}
          >
            <strong>Accesibilidad</strong>
            <span>Texto, contraste y apoyo visual</span>
          </button>
        </div>
      ) : null}

      <button
        type="button"
        className="aula-support-hub__fab"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        title="Apoyos: práctica libre, agente pedagógico y accesibilidad"
      >
        <span className="aula-support-hub__fab-icon" aria-hidden>
          {open ? "×" : "◎"}
        </span>
        <span className="aula-support-hub__fab-copy">
          <small>{open ? "Cerrar" : "Apoyos"}</small>
          <strong>{open ? "Menú" : "Ayuda del módulo"}</strong>
        </span>
      </button>
    </div>
  );
}
