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

const PORTAL_SECTION_ART = {
  resumen: { src: "/images/portal-docente/frames/hero-resumen-reference.png", alt: "Portal Docente con docentes analizando resultados y decisiones pedagógicas", trimVerticalWhitespace: false },
  cursos: { src: "/images/portal-docente/frames/hero-cursos-planificacion.png", alt: "Banner de cursos y planificación del Portal Docente", trimVerticalWhitespace: false },
  estudiantes: { src: "/images/portal-docente/frames/hero-estudiantes-reference.png", alt: "Banner de estudiantes y seguimiento de aprendizajes", trimVerticalWhitespace: false },
  "oa-ae": { src: "/images/portal-docente/frames/hero-oa-ae-reference.png", alt: "Banner de objetivos de aprendizaje y aprendizajes esperados", trimVerticalWhitespace: false },
  cumplimiento: { src: "/images/portal-docente/frames/hero-cumplimiento.png", alt: "Banner de seguimiento de cumplimiento", trimVerticalWhitespace: false },
  reportes: {
    src: "/images/portal-docente/frames/hero-reportes-reference.png",
    alt: "Banner de reportes y análisis pedagógico",
    trimVerticalWhitespace: false,
  },
} satisfies Record<SectionId, { src: string; alt: string; trimVerticalWhitespace: boolean }>;

export function PortalShell({ section }: PortalShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionArt = PORTAL_SECTION_ART[section];

  return (
    <div className="min-h-screen bg-[var(--aula-pale,#f7fbff)]">
      <div className="flex min-h-screen">
        <aside className="portal-sidebar hidden min-h-screen w-64 shrink-0 flex-col overflow-y-auto lg:flex" aria-label="Navegación principal">
          <div className="portal-sidebar-reference relative w-full shrink-0">
            <img
              src="/images/portal-docente/brand/portal-sidebar-reference.png"
              alt="Portal Docente Aula TP Chile"
              className="portal-sidebar-reference-art block h-auto w-full"
            />
            <nav className="portal-reference-nav absolute" aria-label="Secciones del Portal Docente">
              {NAV_SECTIONS.map((item) => {
                const active = item.id === section;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`portal-reference-nav-item${active ? " portal-reference-nav-item-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <PortalNavIcon section={item.id} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
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
              <label className="portal-search hidden min-w-0 items-center gap-2 rounded-xl border px-3 py-2 sm:flex sm:w-[min(30rem,48vw)]">
                <span aria-hidden="true" className="text-lg leading-none">⌕</span>
                <input aria-label="Buscar en el portal docente" placeholder="Buscar cursos, estudiantes, módulos o actividades..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
              </label>
              <div className="portal-header-copy sm:hidden">
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
              <button type="button" aria-label="Ver notificaciones" className="portal-icon-button hidden h-10 w-10 items-center justify-center rounded-full sm:flex">♧</button>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">Sebastián Chamorro</p>
                <p className="text-xs">Aula TP Chile</p>
              </div>
              <div
                className="portal-avatar flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-sm"
                aria-hidden="true"
              >
                SC
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
                      className={`portal-mobile-nav-link block rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition ${
                      active
                        ? "portal-mobile-nav-link-active border-[var(--aula-blue,#1558A0)] bg-[#dcecff] text-[var(--aula-blue,#1558A0)] shadow-none"
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
                  className="portal-button portal-button-primary rounded-xl px-3 py-2 text-center text-sm font-bold"
                >
                  Solicitar demo real
                </Link>
              </div>
            </nav>
          ) : null}

          <main className="portal-main flex-1 px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-5">
            <LivePortalProvider>
              <section className="portal-welcome mb-4 overflow-hidden rounded-[1.25rem] border">
                {section === "resumen" || section === "oa-ae" ? (
                  <img src={sectionArt.src} alt={sectionArt.alt} className="block h-auto w-full object-contain" />
                ) : (
                  <div
                    className={`portal-section-banner${sectionArt.trimVerticalWhitespace ? " portal-section-banner--trim-vertical" : ""} bg-white/20 p-2 sm:p-3`}
                  >
                    <img src={sectionArt.src} alt={sectionArt.alt} className="block h-auto w-full rounded-[1rem] object-contain" />
                  </div>
                )}
              </section>
              <SectionBody section={section} />
            </LivePortalProvider>
          </main>
        </div>
      </div>
    </div>
  );
}

function PortalNavIcon({ section }: { section: SectionId }) {
  const paths: Record<SectionId, string> = {
    resumen: "M3 10.5 10 4l7 6.5M5 9v7h10V9M8 16v-4h4v4",
    cursos: "M3 6.5 10 4l7 2.5-7 2.5L3 6.5Zm2 3.5v3.5c2.7 2 7.3 2 10 0V10",
    estudiantes: "M6.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 16c.3-3 2-4.5 4-4.5S10.2 13 10.5 16M9.5 16c.3-3 2-4.5 4-4.5s3.7 1.5 4 4.5",
    "oa-ae": "M5 3.5h8l2.5 2.5v10.5H5V3.5Zm8 0V6h2.5M8 9h5M8 12h5M8 15h3",
    cumplimiento: "M10 3.5 16 6v4.5c0 3.5-2.3 5.8-6 7-3.7-1.2-6-3.5-6-7V6l6-2.5Zm-2.5 6.5 1.7 1.7 3.5-3.5",
    reportes: "M4 16V9h3v7H4Zm4.5 0V5h3v11h-3Zm4.5 0v-4h3v4h-3Z",
  };

  return (
    <span className={`portal-reference-nav-icon portal-reference-nav-icon-${section}`} aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none">
        <path d={paths[section]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
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
