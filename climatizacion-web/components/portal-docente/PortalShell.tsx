"use client";

import Link from "next/link";
import { useState } from "react";
import {
  NAV_SECTIONS,
  type SectionId,
} from "@/lib/demo-data";
import { LivePortalProvider } from "./live-data";
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
      <div className="flex min-h-screen">
        <aside className="portal-sidebar hidden w-64 shrink-0 flex-col lg:flex">
          <div className="portal-brand border-b px-5 py-5">
            <img src="/images/portal-docente/brand/aula-tp-chile-logo.png" alt="Aula TP Chile" className="h-20 w-full object-contain object-left" />
            <p className="mt-2 text-center text-sm font-bold">Portal Docente</p>
            <p className="mt-1 text-center text-[11px]">Educación Técnico-Profesional para un mejor futuro</p>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegación principal">
            {NAV_SECTIONS.map((item) => {
              const active = item.id === section;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`portal-nav-item block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "portal-nav-active"
                      : ""
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="portal-sidebar-footer space-y-2 border-t px-4 py-4 text-sm">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 transition hover:bg-white"
            >
              ← Volver al sitio
            </Link>
            <Link
              href="/#contacto"
              className="portal-primary-button block rounded-xl px-3 py-2.5 text-center font-bold transition hover:brightness-105"
            >
              Solicitar demo real
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="portal-header sticky top-0 z-20 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-md sm:px-6">
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
              <div className="portal-header-copy">
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold sm:text-base">
                  <span>
                    Portal Docente{" "}
                    <span className="font-normal text-[var(--aula-text-muted,#5e7596)]">|</span>{" "}
                    <span>Aula TP Chile</span>
                  </span>
                </p>
                <p className="hidden text-xs sm:block">
                  Cursos vivos conectados al LMS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  Equipo docente
                </p>
                <p className="text-xs">Aula TP Chile</p>
              </div>
              <div
                className="portal-avatar flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-sm"
                aria-hidden="true"
              >
                TP
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
                      className={`block rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition ${
                        active
                          ? "border-[var(--aula-blue,#1558A0)] bg-[var(--aula-blue,#1558A0)] text-white shadow-[0_6px_16px_rgba(21,88,160,0.28)]"
                          : "border-[var(--color-line,#D5DEE8)] bg-white text-[var(--color-slate,#3D5166)] hover:border-[var(--aula-blue,#1558A0)]/40"
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

          <main className="portal-main flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <LivePortalProvider>
              <section className="portal-welcome mb-6 overflow-hidden rounded-[1.25rem] border p-5 sm:p-7">
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative z-10 max-w-2xl">
                    <div className="portal-eyebrow mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[.16em]">
                      <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,.18)]" />
                      Centro de gestión Aula TP
                    </div>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Convierte los datos en mejores decisiones pedagógicas.</h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 sm:text-base">Planifica, acompaña y potencia los aprendizajes de tus estudiantes en un solo lugar.</p>
                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="portal-pill rounded-full px-3 py-2">LMS conectado</span>
                      <span className="portal-pill rounded-full px-3 py-2">Datos en vivo</span>
                      <span className="portal-pill rounded-full px-3 py-2">Seguimiento por OA y AE</span>
                    </div>
                  </div>
                  <div className="relative hidden w-full max-w-sm lg:block">
                    <div className="absolute -inset-5 rounded-full bg-cyan-300/20 blur-3xl" />
                    <img src="/images/portal-docente/hero.png" alt="Docente revisando el avance de sus estudiantes" className="relative h-44 w-full rounded-2xl object-cover object-center shadow-2xl ring-1 ring-white/30" />
                  </div>
                </div>
              </section>
              <SectionBody section={section} />
            </LivePortalProvider>
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
