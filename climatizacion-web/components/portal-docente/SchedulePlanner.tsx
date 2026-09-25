"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  BLOQUES_HORARIO,
  CATALOGO_OA,
  DIAS_SEMANA,
  type BloquePlan,
} from "@/lib/demo-data";
import { BrowserSaveHint } from "./usePortalStore";

const COLOR_MAP = {
  blue: "border-brand-200 bg-brand-50 text-brand-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  violet: "border-violet-200 bg-violet-50 text-violet-900",
  sky: "border-sky-200 bg-sky-50 text-sky-900",
} as const;

const COLOR_OPTIONS: Array<BloquePlan["color"]> = [
  "blue",
  "emerald",
  "amber",
  "violet",
  "sky",
];

const COLOR_LABELS: Record<BloquePlan["color"], string> = {
  blue: "Azul (Electricidad)",
  emerald: "Verde (Administración)",
  amber: "Ámbar (Taller)",
  violet: "Violeta (Evaluación)",
  sky: "Celeste (Climatización)",
};

const CURSO_OPTIONS = [
  "3° Medio Elec. A",
  "4° Medio Elec. B",
  "3° Medio Clim. A",
  "4° Medio Clim. B",
];

const ASIGNATURA_OPTIONS = [
  "Electricidad",
  "Refrigeración y Climatización",
  "Administración",
];

const COMMON_OA = Array.from(
  new Set(CATALOGO_OA.map((o) => o.codigo)),
).sort((a, b) => a.localeCompare(b, "es"));

type FormState = {
  dia: (typeof DIAS_SEMANA)[number];
  bloque: number;
  curso: string;
  asignatura: string;
  tema: string;
  color: BloquePlan["color"];
  oaText: string;
};

function emptyForm(
  dia: (typeof DIAS_SEMANA)[number],
  bloque: number,
): FormState {
  const hora = BLOQUES_HORARIO.find((b) => b.n === bloque)?.hora ?? "";
  void hora;
  return {
    dia,
    bloque,
    curso: CURSO_OPTIONS[0],
    asignatura: ASIGNATURA_OPTIONS[0],
    tema: "",
    color: "blue",
    oaText: "",
  };
}

function fromBlock(b: BloquePlan): FormState {
  return {
    dia: b.dia,
    bloque: b.bloque,
    curso: b.curso,
    asignatura: b.asignatura,
    tema: b.tema,
    color: b.color,
    oaText: b.oaCodigos.join(", "),
  };
}

function parseOa(text: string): string[] {
  return text
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type SchedulePlannerProps = {
  planificacion: BloquePlan[];
  onChange: (next: BloquePlan[]) => void;
  onReset: () => void;
  savedFlash?: boolean;
};

export function SchedulePlanner({
  planificacion,
  onChange,
  onReset,
  savedFlash,
}: SchedulePlannerProps) {
  const [modal, setModal] = useState<
    | { mode: "add"; dia: (typeof DIAS_SEMANA)[number]; bloque: number }
    | { mode: "edit"; id: string }
    | null
  >(null);
  const [form, setForm] = useState<FormState>(emptyForm("Lun", 1));
  const [confirmReset, setConfirmReset] = useState(false);

  const editing = useMemo(() => {
    if (!modal || modal.mode !== "edit") return null;
    return planificacion.find((p) => p.id === modal.id) ?? null;
  }, [modal, planificacion]);

  function openAdd(dia: (typeof DIAS_SEMANA)[number], bloque: number) {
    setForm(emptyForm(dia, bloque));
    setModal({ mode: "add", dia, bloque });
  }

  function openEdit(block: BloquePlan) {
    setForm(fromBlock(block));
    setModal({ mode: "edit", id: block.id });
  }

  function closeModal() {
    setModal(null);
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    const hora =
      BLOQUES_HORARIO.find((b) => b.n === form.bloque)?.hora ?? "08:00–09:30";
    const oaCodigos = parseOa(form.oaText);
    if (modal?.mode === "edit") {
      onChange(
        planificacion.map((p) =>
          p.id === modal.id
            ? {
                ...p,
                dia: form.dia,
                bloque: form.bloque,
                hora,
                curso: form.curso.trim() || p.curso,
                asignatura: form.asignatura.trim() || p.asignatura,
                tema: form.tema.trim() || p.tema,
                color: form.color,
                oaCodigos,
              }
            : p,
        ),
      );
    } else {
      const id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const next: BloquePlan = {
        id,
        dia: form.dia,
        bloque: form.bloque,
        hora,
        curso: form.curso.trim() || "Curso",
        asignatura: form.asignatura.trim() || "Asignatura",
        tema: form.tema.trim() || "Tema",
        color: form.color,
        oaCodigos,
      };
      // Replace if cell already occupied
      const withoutConflict = planificacion.filter(
        (p) => !(p.dia === next.dia && p.bloque === next.bloque),
      );
      onChange([...withoutConflict, next]);
    }
    closeModal();
  }

  function handleDelete() {
    if (!modal || modal.mode !== "edit") return;
    onChange(planificacion.filter((p) => p.id !== modal.id));
    closeModal();
  }

  function toggleOaChip(code: string) {
    const current = parseOa(form.oaText);
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    setForm((f) => ({ ...f, oaText: next.join(", ") }));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Horario semanal editable
          </h2>
          <p className="mt-0.5 text-xs text-slate-600">
            Haz clic en una celda vacía para <strong>Agregar</strong> un bloque, o
            en una tarjeta para editar / eliminar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {savedFlash ? (
            <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-300">
              Guardado
            </span>
          ) : null}
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-amber-400 bg-amber-50 px-3 py-2">
              <span className="text-xs font-semibold text-amber-950">
                ¿Restablecer horario al valor por defecto?
              </span>
              <button
                type="button"
                className="rounded-lg border-2 border-emerald-700 bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                onClick={() => {
                  onReset();
                  setConfirmReset(false);
                }}
              >
                Sí, restablecer
              </button>
              <button
                type="button"
                className="rounded-lg border-2 border-slate-400 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                onClick={() => setConfirmReset(false)}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="rounded-xl border-2 border-brand-600 bg-white px-3 py-2 text-xs font-bold text-brand-800 shadow-sm hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Restablecer horario
            </button>
          )}
        </div>
      </div>

      <BrowserSaveHint />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[720px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="border-b border-slate-200 px-3 py-3 w-28">Bloque</th>
              {DIAS_SEMANA.map((d) => (
                <th key={d} className="border-b border-slate-200 px-3 py-3">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLOQUES_HORARIO.map((bloque) => (
              <tr key={bloque.n}>
                <td className="border-b border-slate-100 px-3 py-2 align-top text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">B{bloque.n}</span>
                  <br />
                  {bloque.hora}
                </td>
                {DIAS_SEMANA.map((dia) => {
                  const cell = planificacion.find(
                    (p) => p.dia === dia && p.bloque === bloque.n,
                  );
                  return (
                    <td
                      key={`${dia}-${bloque.n}`}
                      className="border-b border-slate-100 px-2 py-2 align-top"
                    >
                      {cell ? (
                        <button
                          type="button"
                          onClick={() => openEdit(cell)}
                          className={`w-full rounded-lg border px-2.5 py-2 text-left transition hover:ring-2 hover:ring-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${COLOR_MAP[cell.color]}`}
                          aria-label={`Editar bloque ${cell.curso} — ${cell.tema}`}
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                            {cell.asignatura}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold leading-snug">
                            {cell.curso}
                          </p>
                          <p className="mt-1 text-[11px] leading-snug opacity-90">
                            {cell.tema}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {cell.oaCodigos.map((code) => (
                              <span
                                key={`${cell.id}-${code}`}
                                className="inline-flex rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-bold text-slate-800 ring-1 ring-black/5"
                              >
                                {code}
                              </span>
                            ))}
                          </div>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openAdd(dia, bloque.n)}
                          className="flex h-16 w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-400 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                          aria-label={`Agregar bloque ${dia} B${bloque.n}`}
                        >
                          + Agregar
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-modal-title"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) closeModal();
          }}
        >
          <form
            onSubmit={handleSave}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border-2 border-brand-200 bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="schedule-modal-title"
                  className="text-base font-bold text-slate-900"
                >
                  {modal.mode === "add" ? "Agregar bloque" : "Editar bloque"}
                </h3>
                <BrowserSaveHint className="mt-1" />
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border-2 border-slate-300 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-slate-700">
                Día
                <select
                  value={form.dia}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      dia: e.target.value as (typeof DIAS_SEMANA)[number],
                    }))
                  }
                  className="mt-1 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  {DIAS_SEMANA.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Bloque
                <select
                  value={form.bloque}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bloque: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  {BLOQUES_HORARIO.map((b) => (
                    <option key={b.n} value={b.n}>
                      B{b.n} · {b.hora}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                Curso
                <input
                  list="portal-cursos-list"
                  value={form.curso}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, curso: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border-2 border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none"
                  required
                />
                <datalist id="portal-cursos-list">
                  {CURSO_OPTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                Asignatura
                <input
                  list="portal-asignatura-list"
                  value={form.asignatura}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, asignatura: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border-2 border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none"
                  required
                />
                <datalist id="portal-asignatura-list">
                  {ASIGNATURA_OPTIONS.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </label>
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                Tema
                <input
                  value={form.tema}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tema: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border-2 border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none"
                  placeholder="Ej. Circuitos serie y paralelo"
                  required
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                Color
                <select
                  value={form.color}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      color: e.target.value as BloquePlan["color"],
                    }))
                  }
                  className="mt-1 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {COLOR_LABELS[c]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  OA (códigos separados por coma)
                  <input
                    value={form.oaText}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, oaText: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border-2 border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none"
                    placeholder="OA 1, OA 2"
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {COMMON_OA.map((code) => {
                    const selected = parseOa(form.oaText).includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleOaChip(code)}
                        className={`rounded-full border-2 px-2.5 py-1 text-[11px] font-bold transition ${
                          selected
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"
                        }`}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              {modal.mode === "edit" ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-xl border-2 border-rose-600 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100"
                >
                  Eliminar
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl border-2 border-brand-700 bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
                >
                  {modal.mode === "add" ? "Agregar" : "Guardar"}
                </button>
              </div>
            </div>
            {editing ? (
              <p className="mt-3 text-[11px] text-slate-500">
                Editando: {editing.curso} · {editing.tema}
              </p>
            ) : null}
          </form>
        </div>
      ) : null}
    </div>
  );
}
