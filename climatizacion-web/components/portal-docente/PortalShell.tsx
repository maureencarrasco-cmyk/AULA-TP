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
  resumen: { src: "/images/portal-docente/hero-docentes.png", alt: "Docentes de Aula TP acompañando aprendizajes" },
  cursos: { src: "/images/portal-docente/frames/hero-cursos-planificacion.png", alt: "Banner de cursos y planificación del Portal Docente" },
  estudiantes: { src: "/images/portal-docente/frames/hero-estudiantes.png", alt: "Banner de estudiantes y seguimiento de aprendizajes" },
  "oa-ae": { src: "/images/portal-docente/frames/hero-oa-ae.png", alt: "Banner de objetivos de aprendizaje y aprendizajes esperados" },
  cumplimiento: { src: "/images/portal-docente/frames/hero-cumplimiento.png", alt: "Banner de seguimiento de cumplimiento" },
  reportes: { src: "/images/portal-docente/frames/hero-reportes.png", alt: "Banner de reportes y análisis pedagógico" },
} satisfies Record<SectionId, { src: string; alt: string }>;

const PORTAL_SECTION_COPY: Record<SectionId, { eyebrow: string; title: string; subtitle: string }> = {
  resumen: { eyebrow: "Bienvenido/a al Portal Docente", title: "Convierte los datos en mejores decisiones pedagógicas", subtitle: "Planifica, acompaña y potencia los aprendizajes de tus estudiantes en un solo lugar." },
  cursos: { eyebrow: "Inicio  ›  Cursos / Planificación", title: "Mis cursos / Planificación", subtitle: "Organiza, planifica y gestiona tus cursos en un solo lugar." },
  estudiantes: { eyebrow: "Inicio  ›  Estudiantes", title: "Mis estudiantes", subtitle: "Conoce, acompaña y potencia sus aprendizajes." },
  "oa-ae": { eyebrow: "Inicio  ›  OA / AE y criterios", title: "Objetivos de Aprendizaje (OA) y Aprendizajes Esperados (AE)", subtitle: "Explora, planifica y utiliza los OA, AE y criterios de evaluación de tus cursos." },
  cumplimiento: { eyebrow: "Inicio  ›  Cumplimiento", title: "Seguimiento de Cumplimiento", subtitle: "Monitorea el avance, la cobertura y el cumplimiento de actividades, OA y evaluaciones en todos tus cursos." },
  reportes: { eyebrow: "Inicio  ›  Reportes", title: "Reportes y análisis", subtitle: "Información clara para una mejor toma de decisiones pedagógicas." },
};

export function PortalShell({ section }: PortalShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionArt = PORTAL_SECTION_ART[section];
  const sectionCopy = PORTAL_SECTION_COPY[section];

  return (
    <div className="min-h-screen bg-[var(--aula-pale,#f7fbff)]">
      <div className="flex min-h-screen">
        <aside className="portal-sidebar hidden min-h-screen w-64 shrink-0 flex-col overflow-y-auto lg:flex" aria-label="Navegación principal">
          <div className="portal-sidebar-reference relative w-full shrink-0">
            <img
              src="/images/portal-docente/brand/portal-sidebar-reference.png"
              alt="Portal Docente Aula TP Chile"
              className="block h-auto w-full"
            />
            <nav className="absolute inset-x-0 top-0 h-[75%]" aria-label="Secciones del Portal Docente">
              {NAV_SECTIONS.map((item, index) => {
                const active = item.id === section;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`portal-reference-link portal-reference-link-${index + 1} absolute block rounded-[1.25rem] ${
                      active ? "portal-reference-link-active" : ""
                    }`}
                    aria-current={active ? "page" : undefined}
                    aria-label={item.label}
                  >
                    <span className="sr-only">{item.label}</span>
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
                        ? "portal-mobile-nav-link-active border-[var(--aula-blue,#1558A0)] bg-[var(--aula-blue,#1558A0)] text-white shadow-[0_6px_16px_rgba(21,88,160,0.28)]"
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
                {section === "resumen" ? (
                  <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative z-10 max-w-2xl">
                      <div className="portal-eyebrow mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[.16em]">
                        <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,.18)]" />
                        {sectionCopy.eyebrow}
                      </div>
                      <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{sectionCopy.title}</h1>
                      <p className="mt-2 max-w-xl text-sm leading-6 sm:text-base">{sectionCopy.subtitle}</p>
                      <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="portal-pill rounded-full px-3 py-2">LMS conectado</span>
                        <span className="portal-pill rounded-full px-3 py-2">Datos en vivo</span>
                        <span className="portal-pill rounded-full px-3 py-2">Seguimiento por OA y AE</span>
                      </div>
                    </div>
                    <div className="relative hidden w-full max-w-2xl lg:block lg:flex-[1.35]">
                      <div className="absolute -inset-5 rounded-full bg-cyan-300/20 blur-3xl" />
                      <img src={sectionArt.src} alt={sectionArt.alt} className="relative h-auto max-h-64 w-full rounded-2xl object-contain object-center shadow-2xl ring-1 ring-white/30" />
                    </div>
                  </div>
                ) : (
                  <div className="portal-section-banner bg-white/20 p-2 sm:p-3">
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
