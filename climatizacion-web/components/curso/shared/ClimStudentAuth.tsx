"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  const [demoOpen, setDemoOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const initialStudent = cohort.find((c) => c.id === studentId);
  const [authedName, setAuthedName] = useState<string | null>(
    studentName ?? initialStudent?.nombre ?? null,
  );
  const autoSessionStudentRef = useRef<string | null>(null);

  useEffect(() => {
    if (studentName) setAuthedName(studentName);
  }, [studentName]);

  const startDemoSession = useCallback(async (id: string) => {
    const cleanId = id.trim();
    const localStudent = cohort.find((c) => c.id === cleanId);
    if (!cleanId || !localStudent) {
      setError("No se pudo seleccionar el estudiante demo.");
      return;
    }
    autoSessionStudentRef.current = localStudent.id;
    setBusy(true);
    setError(null);
    setAuthedName(localStudent.nombre);
    try {
      localStorage.setItem(CLIM_STUDENT_LS_KEY, localStudent.id);
      localStorage.setItem(CLIM_STUDENT_NAME_LS_KEY, localStudent.nombre);
    } catch {
      /* ignore */
    }
    onSessionChange({
      id: localStudent.id,
      name: localStudent.nombre,
      curso: localStudent.curso,
    });
    try {
      const res = await fetch("/api/lms/climatizacion/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: localStudent.id,
        }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        error?: string;
        student?: ClimSessionStudent;
      };
      if (!res.ok || !body.student) {
        setError(body.error || "No se pudo activar el estudiante demo.");
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
    } catch {
      setError("Error de red. El avance local sigue disponible.");
    } finally {
      setBusy(false);
    }
  }, [cohort, onSessionChange]);

  useEffect(() => {
    if (!studentId) return;
    const selected = cohort.find((c) => c.id === studentId);
    if (!selected) return;
    if (autoSessionStudentRef.current === selected.id) return;
    setAuthedName(selected.nombre);
    void startDemoSession(selected.id);
  }, [studentId, cohort, startDemoSession]);

  const displayName =
    authedName ||
    cohort.find((c) => c.id === studentId)?.nombre ||
    studentId;

  return (
    <div className={`flex flex-col gap-1 ${compact ? "" : ""}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="max-w-[11rem] truncate rounded-lg border border-white/30 bg-white/15 px-2 py-1.5 text-[11px] font-semibold text-white"
          title={`Estudiante demo: ${displayName} · ${studentId}`}
        >
          Estudiante: {displayName.split(" ")[0]}
        </span>
        <button
          type="button"
          onClick={() => setDemoOpen((v) => !v)}
          className="rounded-lg border border-white/25 bg-transparent px-2 py-1.5 text-[10px] font-semibold text-white/85 hover:bg-white/10"
          aria-expanded={demoOpen}
          disabled={busy}
        >
          Cambiar estudiante (demo)
        </button>
      </div>
      {error ? (
        <p className="max-w-[18rem] rounded-lg bg-white/90 px-2 py-1 text-[11px] font-semibold text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      {demoOpen ? (
        <label className="flex max-w-[14rem] flex-col gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
          <span>Soy… (demo)</span>
          <select
            value={studentId}
            onChange={(e) => {
              onDemoPick(e.target.value);
              void startDemoSession(e.target.value);
              setDemoOpen(false);
            }}
            className="max-w-[14rem] truncate rounded-lg border border-white/30 bg-white/15 px-2 py-1.5 text-xs font-semibold normal-case text-white"
            aria-label="Seleccionar estudiante demo Climatización"
            disabled={busy}
          >
            {cohort.map((s) => (
              <option key={s.id} value={s.id} className="text-slate-900">
                {s.nombre} · {s.curso}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
