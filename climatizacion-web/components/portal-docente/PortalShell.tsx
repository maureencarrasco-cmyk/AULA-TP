"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DEMO_TEACHER,
  NAV_SECTIONS,
  type SectionId,
} from "@/lib/demo-data";
import {
  CumplimientoView,
  CursosView,
  EstudiantesView,
  OaAeView,
  ReportesView,
  ResumenView,
} from "./views";

type PortalShellProps = {
  section: SectionId;
};

export function PortalShell({ section }: PortalShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--aula-pale,#f7fbff)]">
      <div className="border-b border-[var(--aula-line,#d9e5f6)] bg-[linear-gradient(100deg,#e7f9f1_0%,#edf6ff_55%,#f3e9ff_100%)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--aula-text,#082b80)]">
        Portal Docente — cursos vivos conectados (Enfermería, Electricidad, Climatización).
        Algunas secciones aún muestran datos de ejemplo.
      </div>

      <div className="flex min-h-[calc(100vh-44px)]">
        <aside className="hidden w-64 shrink-0 flex-col bg-[linear-gradient(180deg,var(--aula-navy,#062f91)_0%,#041f66_100%)] text-white lg:flex">
          <div className="border-b border-white/15 px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--aula-cyan,#07a8b8)]">
              Portal Docente
            </p>
            <p className="mt-1 text-base font-bold">Aula TP Chile</p>
            <p className="mt-1 text-[11px] text-white/65">Seguimiento pedagógico TP</p>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegación principal">
            {NAV_SECTIONS.map((item) => {
              const active = item.id === section;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-white/25"
                      : "text-white/75 hover:bg-white/8 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="space-y-2 border-t border-white/15 px-4 py-4 text-sm">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              ← Volver al sitio
            </Link>
            <Link
              href="/#contacto"
              className="block rounded-xl bg-[linear-gradient(100deg,#0747bb,#0878ea)] px-3 py-2.5 text-center font-bold text-white shadow-[0_8px_18px_rgba(0,77,185,0.28)] transition hover:brightness-110"
            >
              Solicitar demo real
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--aula-line,#d9e5f6)] bg-white/92 px-4 py-3 shadow-[var(--shadow-xs,0_2px_6px_rgba(17,70,147,0.06))] backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--aula-line,#d9e5f6)] p-2 text-[var(--aula-text,#082b80)] lg:hidden"
                aria-expanded={mobileOpen}
                aria-controls="portal-mobile-nav"
                onClick={() => setMobileOpen((o) => !o)}
              >
                <span className="sr-only">Abrir menú</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M3 5h14M3 10h14M3 15h14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--aula-text,#082b80)] sm:text-base">
                  <span>
                    Portal Docente{" "}
                    <span className="font-normal text-[var(--aula-text-muted,#5e7596)]">|</span>{" "}
                    <span className="text-[var(--aula-blue,#0870ef)]">Aula TP Chile</span>
                  </span>
                  <span className="rounded-full border border-[var(--aula-line,#d9e5f6)] bg-[var(--aula-surface-tint,#edf6ff)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--aula-blue-deep,#0549b8)]">
                    Demo interactiva
                  </span>
                </p>
                <p className="hidden text-xs text-[var(--aula-text-muted,#5e7596)] sm:block">
                  {DEMO_TEACHER.school}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-[var(--aula-text,#082b80)]">
                  {DEMO_TEACHER.name}
                </p>
                <p className="text-xs text-[var(--aula-text-muted,#5e7596)]">{DEMO_TEACHER.role}</p>
              </div>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--aula-blue,#0870ef),var(--aula-teal,#008b98))] text-sm font-bold text-white shadow-sm"
                aria-hidden="true"
              >
                CR
              </div>
            </div>
          </header>

          {mobileOpen ? (
            <nav
              id="portal-mobile-nav"
              className="border-b border-[var(--aula-line,#d9e5f6)] bg-white px-3 py-3 lg:hidden"
              aria-label="Navegación móvil"
            >
              <div className="space-y-1">
                {NAV_SECTIONS.map((item) => {
                  const active = item.id === section;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "border-[var(--aula-blue,#0870ef)]/30 bg-[var(--aula-surface-tint,#edf6ff)] text-[var(--aula-blue-deep,#0549b8)]"
                          : "border-transparent text-[var(--aula-text,#082b80)] hover:bg-[var(--aula-surface-soft,#f5f9fe)]"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-col gap-2 border-t border-[var(--aula-line,#d9e5f6)] pt-3">
                <Link
                  href="/"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--aula-text,#082b80)] hover:bg-[var(--aula-surface-soft,#f5f9fe)]"
                >
                  ← Volver al sitio
                </Link>
                <Link
                  href="/#contacto"
                  className="rounded-xl bg-[linear-gradient(100deg,#0747bb,#0878ea)] px-3 py-2 text-center text-sm font-bold text-white"
                >
                  Solicitar demo real
                </Link>
              </div>
            </nav>
          ) : null}

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <SectionBody section={section} />
          </main>
        </div>
      </div>
    </div>
  );
}

function SectionBody({ section }: { section: SectionId }) {
  switch (section) {
    case "resumen":
      return <ResumenView />;
    case "cursos":
      return <CursosView />;
    case "estudiantes":
      return <EstudiantesView />;
    case "oa-ae":
      return <OaAeView />;
    case "reportes":
      return <ReportesView />;
    case "cumplimiento":
      return <CumplimientoView />;
    default:
      return <ResumenView />;
  }
}
