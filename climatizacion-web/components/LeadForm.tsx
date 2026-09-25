"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitLead } from "@/app/actions/leads";
import type { LeadFormState } from "@/lib/types";
import { INTERESES, REGIONES_CHILE } from "@/lib/regions";

const initialState: LeadFormState = {
  ok: false,
  message: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

export function LeadForm() {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  if (state.ok) {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-emerald-900">Solicitud enviada</h3>
        <p className="mt-2 text-sm text-emerald-800">{state.message}</p>
        <button
          type="button"
          className="mt-6 inline-flex rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          onClick={() => window.location.reload()}
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8"
      noValidate
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">Solicita una demo</h3>
        <p className="mt-1 text-sm text-slate-600">
          Completa el formulario y te contactamos a la brevedad.
        </p>
      </div>

      {state.message && !state.ok ? (
        <p
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-slate-800">
            Nombre <span className="text-red-600">*</span>
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={Boolean(state.errors?.nombre)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            placeholder="Nombre y apellido"
          />
          <FieldError message={state.errors?.nombre} />
        </div>

        <div>
          <label htmlFor="cargo" className="mb-1.5 block text-sm font-medium text-slate-800">
            Cargo
          </label>
          <input
            id="cargo"
            name="cargo"
            type="text"
            autoComplete="organization-title"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            placeholder="Director/a, Coordinador/a, DAEM…"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="establecimiento" className="mb-1.5 block text-sm font-medium text-slate-800">
            Establecimiento <span className="text-red-600">*</span>
          </label>
          <input
            id="establecimiento"
            name="establecimiento"
            type="text"
            autoComplete="organization"
            required
            aria-required="true"
            aria-invalid={Boolean(state.errors?.establecimiento)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            placeholder="Nombre del liceo, colegio o DAEM"
          />
          <FieldError message={state.errors?.establecimiento} />
        </div>

        <div>
          <label htmlFor="region" className="mb-1.5 block text-sm font-medium text-slate-800">
            Región
          </label>
          <select
            id="region"
            name="region"
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">Selecciona una región</option>
            {REGIONES_CHILE.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="interes" className="mb-1.5 block text-sm font-medium text-slate-800">
            Interés <span className="text-red-600">*</span>
          </label>
          <select
            id="interes"
            name="interes"
            required
            aria-required="true"
            defaultValue=""
            aria-invalid={Boolean(state.errors?.interes)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {INTERESES.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
          <FieldError message={state.errors?.interes} />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-800">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={Boolean(state.errors?.email)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            placeholder="nombre@establecimiento.cl"
          />
          <FieldError message={state.errors?.email} />
        </div>

        <div>
          <label htmlFor="telefono" className="mb-1.5 block text-sm font-medium text-slate-800">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            placeholder="+56 9 1234 5678"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium text-slate-800">
            Mensaje <span className="font-normal text-slate-500">(opcional)</span>
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows={4}
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            placeholder="Cuéntanos brevemente tu contexto o necesidades…"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Enviando…" : "Solicitar demo"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        Campos con * son obligatorios. Te contactaremos solo por tu solicitud.
      </p>
    </form>
  );
}
