"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  replyAsClimatizacionTutor,
  tutorWelcome,
  type TutorContext,
} from "@/lib/tutor-climatizacion-expert";

export type TutorFlotanteProps = {
  context: TutorContext;
  disabled?: boolean;
  disabledReason?: string;
  /** Optional: persist open state */
  storageKey?: string;
  /** Hide the bottom-right FAB when a parent SupportHub opens the tutor */
  hideFab?: boolean;
};

type ChatMsg = {
  id: string;
  role: "user" | "tutor";
  text: string;
};

const QUICK: { id: string; label: string; message: string }[] = [
  { id: "explicar", label: "Explícame", message: "Explícame esta etapa" },
  { id: "pista", label: "Pista", message: "Dame una pista gradual" },
  {
    id: "evidencia",
    label: "¿Qué evidencia?",
    message: "¿Qué evidencia debo revisar?",
  },
  { id: "seguridad", label: "Seguridad", message: "¿Qué seguridad y EPP aplican?" },
];

const SESSION_OPEN_KEY = "aula-tp-tutor-flotante-open";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Simple markdown-ish bold for tutor replies */
function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[var(--aula-navy)]">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export default function TutorFlotante({
  context,
  disabled = false,
  disabledReason = "Evaluación formal: el Tutor está deshabilitado. Fundamenta solo con evidencias del caso (sin pistas).",
  storageKey = SESSION_OPEN_KEY,
  hideFab = false,
}: TutorFlotanteProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Restore open preference (collapsed by default if unset)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw === "1") setOpen(true);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  useEffect(() => {
    const openTutor = () => {
      if (!disabled) setOpen(true);
    };
    window.addEventListener("aula-tp-open-tutor", openTutor);
    return () => window.removeEventListener("aula-tp-open-tutor", openTutor);
  }, [disabled]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [open, storageKey]);

  // Reset hint ladder + seed welcome when station context changes
  const ctxKey = `${context.moduloNumero ?? ""}|${context.estacionTitulo ?? ""}|${context.pregunta ?? ""}`;
  useEffect(() => {
    setHintLevel(0);
    if (disabled) {
      setMessages([
        {
          id: uid(),
          role: "tutor",
          text: disabledReason,
        },
      ]);
      return;
    }
    setMessages([
      {
        id: uid(),
        role: "tutor",
        text: tutorWelcome(context),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-seed on station change
  }, [ctxKey, disabled, disabledReason]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const liveContext = useMemo<TutorContext>(
    () => ({ ...context, hintLevel }),
    [context, hintLevel],
  );

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      if (disabled) {
        setMessages((m) => [
          ...m,
          { id: uid(), role: "user", text },
          { id: uid(), role: "tutor", text: disabledReason },
        ]);
        setInput("");
        return;
      }

      setBusy(true);
      setInput("");
      setMessages((m) => [...m, { id: uid(), role: "user", text }]);

      let replyText: string;
      let nextHint: number | undefined;

      try {
        const res = await fetch("/api/tutor/climatizacion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, context: liveContext }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            reply?: string;
            nextHintLevel?: number;
          };
          replyText =
            data.reply ||
            replyAsClimatizacionTutor(text, liveContext).reply;
          nextHint = data.nextHintLevel;
        } else {
          const local = replyAsClimatizacionTutor(text, liveContext);
          replyText = local.reply;
          nextHint = local.nextHintLevel;
        }
      } catch {
        const local = replyAsClimatizacionTutor(text, liveContext);
        replyText = local.reply;
        nextHint = local.nextHintLevel;
      }

      if (typeof nextHint === "number") setHintLevel(nextHint);
      setMessages((m) => [
        ...m,
        { id: uid(), role: "tutor", text: replyText },
      ]);
      setBusy(false);
      inputRef.current?.focus();
    },
    [busy, disabled, disabledReason, liveContext],
  );

  const toggle = () => setOpen((v) => !v);

  const transition = reduceMotion
    ? ""
    : "transition-all duration-200 ease-out";

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6"
      data-tutor-flotante="climatizacion"
    >
      {/* Panel */}
      {open ? (
        <div
          className={`aula-tutor-panel pointer-events-auto flex w-[min(100vw-1.5rem,340px)] max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-[var(--aula-line)] bg-white shadow-[0_12px_40px_rgba(6,47,145,0.18)] ${transition}`}
          role="dialog"
          aria-label="Agente pedagógico de Climatización"
          aria-modal="false"
        >
          <header className="flex items-start gap-2 bg-gradient-to-br from-[var(--aula-navy)] to-[var(--aula-blue)] px-3 py-2.5 text-white">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-tight">
                Agente pedagógico · Climatización
              </p>
              <p className="text-[11px] font-medium text-white/80">
                experto pedagógico
                {disabled ? " · deshabilitado" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg p-1.5 text-white/90 hover:bg-white/15 hover:text-white"
              aria-label="Minimizar tutor"
              title="Minimizar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 12h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/90 hover:bg-white/15 hover:text-white"
              aria-label="Cerrar tutor"
              title="Cerrar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>

          {disabled ? (
            <div className="space-y-2 overflow-y-auto p-3 text-xs leading-relaxed text-[var(--aula-text)]">
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-950">
                <p className="font-bold">Tutor deshabilitado</p>
                <p className="mt-1">{disabledReason}</p>
              </div>
              <p className="text-[10px] text-[var(--aula-text-muted)]">
                El FAB permanece visible; vuelve a estaciones formativas para
                recibir pistas.
              </p>
            </div>
          ) : (
            <>
              <div
                ref={listRef}
                className="flex-1 space-y-2 overflow-y-auto bg-[var(--aula-bg)] px-3 py-3"
                style={{ minHeight: 160, maxHeight: "42vh" }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[92%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[var(--aula-blue)] text-white"
                          : "border border-[var(--aula-line)] bg-white text-[var(--aula-text)]"
                      }`}
                    >
                      {msg.role === "tutor" ? renderText(msg.text) : msg.text}
                    </div>
                  </div>
                ))}
                {busy ? (
                  <p className="text-[10px] font-medium text-[var(--aula-text-muted)]">
                    Agente pedagógico pensando…
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-1.5 border-t border-[var(--aula-line)] bg-white px-2.5 py-2">
                {QUICK.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    disabled={busy}
                    onClick={() => send(q.message)}
                    className="rounded-full border border-[var(--aula-line)] bg-[var(--aula-bg)] px-2.5 py-1 text-[10px] font-bold text-[var(--aula-navy)] hover:border-[var(--aula-blue)] hover:text-[var(--aula-blue)] disabled:opacity-50"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <form
                className="flex items-center gap-1.5 border-t border-[var(--aula-line)] bg-white p-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu duda…"
                  disabled={busy}
                  className="min-w-0 flex-1 rounded-xl border border-[var(--aula-line)] bg-[var(--aula-bg)] px-3 py-2 text-xs text-[var(--aula-text)] placeholder:text-[var(--aula-text-muted)] focus:border-[var(--aula-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--aula-blue)]"
                  aria-label="Mensaje al tutor"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--aula-blue)] text-white hover:bg-[var(--aula-navy)] disabled:opacity-40"
                  aria-label="Enviar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M4 12l16-7-7 16-2-6-7-3z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>

              <p className="bg-white px-3 pb-2 text-[9px] leading-snug text-[var(--aula-text-muted)]">
                No reemplaza normas ni al docente. Pistas graduales.
              </p>
            </>
          )}
        </div>
      ) : null}

      {/* FAB — optional when SupportHub owns the entry point */}
      {!hideFab ? (
      <button
        type="button"
        onClick={toggle}
        className={`aula-tutor-fab pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--aula-navy)] to-[var(--aula-blue)] text-white shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aula-blue)] focus-visible:ring-offset-2 ${transition} ${open ? "scale-95" : ""}`}
        aria-expanded={open}
        aria-controls={undefined}
        aria-label={open ? "Ocultar Agente pedagógico" : "Abrir Agente pedagógico"}
        title="Agente pedagógico"
        data-tutor-fab="true"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 12h12"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7A2.5 2.5 0 0117.5 16H9l-4 3.5V6.5z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {!open ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--aula-magenta)] px-1 text-[9px] font-bold text-white shadow"
            aria-hidden
          >
            {disabled ? "!" : "AI"}
          </span>
        ) : null}
      </button>
      ) : null}
      {!open && !hideFab ? (
        <span className="pointer-events-none sr-only">Agente pedagógico</span>
      ) : null}
    </div>
  );
}
