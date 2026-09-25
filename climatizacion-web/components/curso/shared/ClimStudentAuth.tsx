"use client";

import { useCallback, useEffect, useState } from "react";

export const CLIM_STUDENT_LS_KEY = "aula-tp-clim-student-id";
export const CLIM_STUDENT_NAME_LS_KEY = "aula-tp-clim-student-name";

export type ClimSessionStudent = {
  id: string;
  name: string;
  curso: string;
  email?: string;
};

type Props = {
  studentId: string;
  studentName?: string;
  cohort: Array<{ id: string; nombre: string; curso: string }>;
  onSessionChange: (student: ClimSessionStudent | null) => void;
  onDemoPick: (id: string) => void;
  compact?: boolean;
};

export function useClimSessionBootstrap(
  onReady: (student: ClimSessionStudent | null) => void,
) {
  useEffect(() => {
    let cancelled = false;
    void fetch("/api/lms/climatizacion/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; student?: ClimSessionStudent }) => {
        if (cancelled) return;
        if (data.authenticated && data.student) {
          try {
            localStorage.setItem(CLIM_STUDENT_LS_KEY, data.student.id);
            localStorage.setItem(CLIM_STUDENT_NAME_LS_KEY, data.student.name);
          } catch {
            /* ignore */
          }
          onReady(data.student);
        } else {
          onReady(null);
        }
      })
      .catch(() => {
        if (!cancelled) onReady(null);
      });
    return () => {
      cancelled = true;
    };
  }, [onReady]);
}

export default function ClimStudentAuth({
  studentId,
  studentName,
  cohort,
  onSessionChange,
  onDemoPick,
  compact,
}: Props) {
  const [open, setOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [identifier, setIdentifier] = useState(studentId || "clim-001");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [authedName, setAuthedName] = useState<string | null>(studentName ?? null);

  useEffect(() => {
    if (studentName) setAuthedName(studentName);
  }, [studentName]);

  const login = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/lms/climatizacion/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: identifier.trim(),
          password,
        }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        error?: string;
        student?: ClimSessionStudent;
      };
      if (!res.ok || !body.student) {
        setError(body.error || "No se pudo iniciar sesión.");
        return;
      }
      try {
        localStorage.setItem(CLIM_STUDENT_LS_KEY, body.student.id);
        localStorage.setItem(CLIM_STUDENT_NAME_LS_KEY, body.student.name);
      } catch {
        /* ignore */
      }
      setAuthedName(body.student.name);
      onSessionChange(body.student);
      setOpen(false);
      setPassword("");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }, [identifier, password, onSessionChange]);

  const logout = useCallback(async () => {
    setBusy(true);
    try {
      await fetch("/api/lms/climatizacion/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    try {
      localStorage.removeItem(CLIM_STUDENT_NAME_LS_KEY);
    } catch {
      /* ignore */
    }
    setAuthedName(null);
    onSessionChange(null);
    setBusy(false);
  }, [onSessionChange]);

  const displayName =
    authedName ||
    cohort.find((c) => c.id === studentId)?.nombre ||
    studentId;

  return (
    <div className={`flex flex-col gap-1 ${compact ? "" : ""}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        {authedName ? (
          <>
            <span
              className="max-w-[10rem] truncate rounded-lg border border-white/30 bg-white/15 px-2 py-1.5 text-[11px] font-semibold text-white"
              title={`Sesión: ${displayName} · ${studentId}`}
            >
              Sesión: {displayName.split(" ")[0]}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={busy}
              className="rounded-lg border border-white/30 bg-white/10 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-white/20"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setError(null);
            }}
            className="aula-btn-success rounded-full border-0 px-2.5 py-1.5 text-[11px] shadow-sm"
          >
            Iniciar sesión
          </button>
        )}
        <button
          type="button"
          onClick={() => setDemoOpen((v) => !v)}
          className="rounded-lg border border-white/25 bg-transparent px-2 py-1.5 text-[10px] font-semibold text-white/85 hover:bg-white/10"
          aria-expanded={demoOpen}
        >
          Cambiar estudiante (demo)
        </button>
      </div>

      {demoOpen ? (
        <label className="flex max-w-[14rem] flex-col gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
          <span>Soy… (demo)</span>
          <select
            value={studentId}
            onChange={(e) => {
              onDemoPick(e.target.value);
              setDemoOpen(false);
            }}
            className="max-w-[14rem] truncate rounded-lg border border-white/30 bg-white/15 px-2 py-1.5 text-xs font-semibold normal-case text-white"
            aria-label="Seleccionar estudiante demo Climatización"
          >
            {cohort.map((s) => (
              <option key={s.id} value={s.id} className="text-slate-900">
                {s.nombre} · {s.curso}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {open ? (
        <div
          className="aula-modal-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clim-login-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="aula-modal-card w-full max-w-md p-5">
            <h2
              id="clim-login-title"
              className="text-lg font-bold text-[var(--aula-text)]"
            >
              Ingreso estudiante · Climatización
            </h2>
            <p className="mt-1 text-sm text-[var(--aula-text-muted)]">
              Acceso demo institucional Aula TP. Tu avance se guarda en el LMS y
              el Portal Docente lo ve en vivo.
            </p>
            <p className="mt-2 rounded-xl bg-[var(--aula-surface-tint)] px-3 py-2 text-xs text-[var(--aula-text)] ring-1 ring-[var(--aula-line)]">
              <strong>Demo:</strong> ID <code>clim-001</code> …{" "}
              <code>clim-160</code> (o correo{" "}
              <code>clim-001@demo.aulatpchile.cl</code>), clave{" "}
              <code>aula2026</code> (también valen los últimos 4 dígitos del ID).
            </p>
            <label className="mt-4 block text-xs font-semibold text-[var(--aula-text)]">
              ID o correo
              <input
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="clim-001"
                className="aula-login-input mt-1 w-full px-3 py-2.5 text-sm font-medium text-[var(--aula-text)]"
              />
            </label>
            <label className="mt-3 block text-xs font-semibold text-[var(--aula-text)]">
              Clave
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="aula2026"
                className="aula-login-input mt-1 w-full px-3 py-2.5 text-sm font-medium text-[var(--aula-text)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void login();
                }}
              />
            </label>
            {error ? (
              <p className="mt-2 text-sm font-medium text-rose-700" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="aula-btn-secondary px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void login()}
                className="aula-btn-primary px-4 py-2 text-sm disabled:opacity-60"
              >
                {busy ? "Ingresando…" : "Ingresar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
