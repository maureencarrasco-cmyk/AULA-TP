"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CourseHubConfig, HubModule } from "@/lib/course-hubs";
import { generateClimatizacionEstudiantes } from "@/lib/generate-climatizacion-estudiantes";
import ClimStudentAuth, {
  CLIM_STUDENT_LS_KEY,
  CLIM_STUDENT_NAME_LS_KEY,
  type ClimSessionStudent,
} from "@/components/curso/shared/ClimStudentAuth";
import CourseStatsCard from "@/components/curso/shared/CourseStatsCard";
import LearningPath from "@/components/curso/shared/LearningPath";
import { COURSE_CATALOG_HREF } from "@/lib/course-portal";
import "@/app/curso/climatizacion/hub.css";
import "@/app/curso/climatizacion/clim-radial-map.css";
import "@/app/curso/climatizacion/learning-path.css";
import "@/app/curso/climatizacion/station-strip.css";

const CLIM_COHORT = generateClimatizacionEstudiantes(160);

type RouteProgress = {
  numero: number;
  completed: number;
  total: number;
  pct: number;
  nextSlug?: string;
  nextTitle?: string;
};
type StudentOverview = {
  studentName: string;
  curso: string;
  especialidad: string;
  nivel: string;
  periodo: string | null;
  programa: string;
  scope: string;
  completed: number;
  total: number;
  pct: number;
  completedModules: number;
  totalModules: number;
  nextModule?: number;
  nextSlug?: string;
  nextTitle?: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function StudentDashboard({
  data,
  loading,
  error,
  modules,
}: {
  data?: StudentOverview;
  loading: boolean;
  error: boolean;
  modules: HubModule[];
}) {
  return (
    <section className="clim-student-dashboard" aria-labelledby="student-overview-heading" aria-busy={loading}>
      <h2 id="student-overview-heading">
        <span aria-hidden>ⓘ</span> Información general
      </h2>
      {loading ? (
        <p className="student-dashboard-message" role="status">
          Consultando la información del estudiante…
        </p>
      ) : error || !data ? (
        <p className="student-dashboard-message" role="alert">
          No se pudo cargar la información. Recarga la página para volver a consultar tu avance.
        </p>
      ) : (
        <div className="student-dashboard-grid">
          <dl className="student-dashboard-details">
            {(
              [
                ["Estudiante", data.studentName],
                ["Curso", data.curso],
                ["Especialidad", data.especialidad],
                ["Nivel", data.nivel],
                ["Período", data.periodo || "No informado"],
                ["Programa", data.programa],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="student-dashboard-progress">
            <p className="student-dashboard-eyebrow">Progreso general · {data.scope}</p>
            <div className="student-dashboard-result">
              <span
                className="student-dashboard-ring"
                style={{ background: `conic-gradient(#008a98 ${data.pct}%, #dfedf3 0)` }}
                aria-hidden
              >
                <b>{data.pct}%</b>
              </span>
              <div>
                <strong>
                  {data.completed} de {data.total}
                </strong>
                <span>estaciones completadas</span>
              </div>
            </div>
            <progress max={data.total || 1} value={data.completed} aria-label={`Progreso general: ${data.pct}% completado`} />
            <p>
              {data.completedModules} de {data.totalModules} módulos completados
            </p>
            {data.nextModule ? (
              <div className="student-dashboard-next">
                <strong>Tu siguiente paso · Módulo {data.nextModule}</strong>
                <p>{data.nextTitle}</p>
                <Link
                  className="aula-btn-primary"
                  href={`${modules.find((m) => m.numero === data.nextModule)?.href || "#"}`}
                >
                  Continuar mi curso →
                </Link>
              </div>
            ) : (
              <div className="student-dashboard-next">
                <strong>✓ Recorrido completado</strong>
                <p>Ya completaste todas las estaciones de este nivel. Puedes revisar tus módulos en la ruta.</p>
              </div>
            )}
            <small>Avance basado en estaciones guardadas, no en calificaciones. La práctica libre no modifica este porcentaje.</small>
          </div>
        </div>
      )}
    </section>
  );
}

function StaticCourseInfo({ hub }: { hub: CourseHubConfig }) {
  return (
    <section className="clim-student-dashboard" aria-labelledby="student-overview-heading">
      <h2 id="student-overview-heading">
        <span aria-hidden>ⓘ</span> Información general
      </h2>
      <div className="student-dashboard-grid">
        <dl className="student-dashboard-details">
          <div>
            <dt>Especialidad</dt>
            <dd>{hub.title}</dd>
          </div>
          <div>
            <dt>Sector</dt>
            <dd>{hub.sector}</dd>
          </div>
          <div>
            <dt>Nivel</dt>
            <dd>{hub.level}</dd>
          </div>
          <div>
            <dt>Programa</dt>
            <dd>EMTP · MINEDUC</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{hub.slug === "administracion" ? "Curso vivo · ERP Bazar Inteligente" : hub.live ? "Curso vivo · LMS" : "Próximamente"}</dd>
          </div>
          <div>
            <dt>Modelo</dt>
            <dd>Ruta obligatoria + Práctica Libre</dd>
          </div>
        </dl>
        <div className="student-dashboard-progress">
          <p className="student-dashboard-eyebrow">{hub.live ? "Cómo avanzar" : "Ruta en preparación"}</p>
          <p>
            {hub.slug === "administracion"
              ? "Avanza por los 6 módulos del plan 3° y practica cada competencia en el ERP Bazar Inteligente, el bazar de simulación del curso."
              : hub.live
                ? "Entra al LMS para conservar avances, evidencias y evaluación. Esta portada muestra la misma arquitectura de climatización."
                : "La portada ya usa el modelo Aula TP. Los módulos se habilitarán con estaciones AE, mapa y evaluación 2 h."}
          </p>
          {hub.live ? (
            <div className="student-dashboard-next">
              <strong>Ingresa a tu ruta</strong>
              <Link className="aula-btn-primary" href={hub.startCta.href}>
                {hub.startCta.label} →
              </Link>
            </div>
          ) : (
            <small>Puedes recorrer la ruta de módulos para conocer el foco de cada tema. El ingreso a estaciones se habilitará cuando el curso esté vivo.</small>
          )}
        </div>
      </div>
    </section>
  );
}

function ModuleRouteSection({
  hub,
  nums,
  title,
  progress,
  loading,
  error,
  sectionId,
}: {
  hub: CourseHubConfig;
  nums: number[];
  title: string;
  progress: RouteProgress[];
  loading: boolean;
  error: boolean;
  sectionId?: string;
}) {
  const subtitle =
    hub.lms === "climatizacion"
      ? loading
        ? "Consultando tu avance…"
        : error
          ? "No se pudo consultar el avance. Recarga para intentarlo nuevamente."
          : "Tu ruta: revisa lo completado y continúa desde la primera estación pendiente."
      : hub.live
        ? "Misma ruta Aula TP: entra al módulo y avanza contexto → estaciones AE → integradora → evaluación."
        : "Ruta contextualizada de la especialidad. Las estaciones se habilitarán cuando el curso esté vivo.";

  const enterLabel =
    hub.lms === "climatizacion" ? "Entrar al mapa" : hub.live ? "Entrar al módulo" : "Ver foco del módulo";
  const firstHref = hub.modules.find((m) => nums.includes(m.numero) && m.available)?.href;

  return (
    <LearningPath
      variant="pedagogica"
      title={title}
      subtitle={subtitle}
      modules={hub.modules}
      nums={nums}
      progress={progress}
      totalModules={hub.modules.length}
      loading={loading}
      error={error}
      showProgress={hub.lms === "climatizacion"}
      sectionId={sectionId}
      enterLabel={enterLabel}
      showSupportTools={Boolean(sectionId && firstHref)}
      firstModuleHref={firstHref}
    />
  );
}

function HeroCollage({
  reducedMotion,
  collage,
}: {
  reducedMotion: boolean;
  collage: [string, string, string];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      setOffset({ x: nx * 8, y: ny * 6 });
    },
    [reducedMotion],
  );
  const onLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto h-64 w-full max-w-md sm:mx-0 sm:h-72"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-hidden
    >
      <div
        className="clim-hub-collage__card clim-hub-collage__card--float-a absolute left-0 top-6 z-10 h-40 w-[58%] overflow-hidden rounded-2xl border-2 border-white/50 shadow-xl sm:h-48"
        style={{ transform: reducedMotion ? undefined : `translate(${offset.x * -0.6}px, ${offset.y * -0.5}px)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={collage[0]} alt="" className="h-full w-full object-cover" />
      </div>
      <div
        className="clim-hub-collage__card clim-hub-collage__card--float-b absolute bottom-2 right-2 z-20 h-36 w-[52%] overflow-hidden rounded-2xl border-2 border-white/60 shadow-2xl sm:h-44"
        style={{ transform: reducedMotion ? undefined : `translate(${offset.x * 0.9}px, ${offset.y * 0.7}px)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={collage[1]} alt="" className="h-full w-full object-cover" />
      </div>
      <div
        className="clim-hub-collage__card clim-hub-collage__card--float-c absolute left-[28%] top-0 z-30 h-28 w-[42%] overflow-hidden rounded-2xl border-2 border-white/70 shadow-xl sm:h-32"
        style={{ transform: reducedMotion ? undefined : `translate(${offset.x * 1.2}px, ${offset.y * 1.1}px)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={collage[2]} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute -right-1 top-6 z-40 w-28 overflow-hidden rounded-2xl border border-white/50 bg-white p-2 shadow-xl sm:w-32 sm:p-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/climatizacion/aula-tp-chile-logo-corporativo.jpg" alt="Aula TP Chile" className="h-auto w-full object-contain" />
      </div>
    </div>
  );
}

export default function CourseHub({ hub }: { hub: CourseHubConfig }) {
  const isClim = hub.lms === "climatizacion";
  const [studentId, setStudentId] = useState(CLIM_COHORT[0]?.id ?? "clim-001");
  const [studentName, setStudentName] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<{ id: string; modules: RouteProgress[]; overview?: StudentOverview }>({
    id: "",
    modules: [],
  });
  const [routeLoading, setRouteLoading] = useState(isClim);
  const [routeError, setRouteError] = useState(false);
  const [sessionReady, setSessionReady] = useState(!isClim);

  useEffect(() => {
    if (!isClim || !sessionReady) return;
    let active = true;
    const controller = new AbortController();
    const refresh = async () => {
      setRouteLoading(true);
      try {
        const res = await fetch(`/api/lms/climatizacion/route-progress?studentId=${encodeURIComponent(studentId)}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw Error("progress");
        const data = await res.json();
        if (active) {
          setRouteData({ id: studentId, modules: data.modules, overview: data.overview });
          setRouteError(false);
        }
      } catch {
        if (active) setRouteError(true);
      } finally {
        if (active) setRouteLoading(false);
      }
    };
    void refresh();
    const visible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      controller.abort();
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [studentId, sessionReady, isClim]);

  useEffect(() => {
    if (!isClim) return;
    try {
      const sid = localStorage.getItem(CLIM_STUDENT_LS_KEY);
      const sname = localStorage.getItem(CLIM_STUDENT_NAME_LS_KEY);
      if (sid && CLIM_COHORT.some((s) => s.id === sid)) {
        setStudentId(sid);
        if (sname) setStudentName(sname);
      }
    } catch {
      /* ignore */
    }
    void fetch("/api/lms/climatizacion/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; student?: ClimSessionStudent }) => {
        if (data.authenticated && data.student) {
          setStudentId(data.student.id);
          setStudentName(data.student.name);
          try {
            localStorage.setItem(CLIM_STUDENT_LS_KEY, data.student.id);
            localStorage.setItem(CLIM_STUDENT_NAME_LS_KEY, data.student.name);
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => setSessionReady(true));
  }, [isClim]);

  return (
    <div className="aula-font sites-hub text-[var(--aula-text)]" data-specialty={hub.slug}>
      <header className="sites-hub-top">
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <Link href={COURSE_CATALOG_HREF}>← Volver al catálogo</Link>
          <span className="text-[var(--aula-text-muted)]">·</span>
          <Link href="/portal-docente">Portal docente</Link>
          <span className="text-[var(--aula-text-muted)]">·</span>
          <Link href="/">Sitio</Link>
        </nav>
        {isClim ? (
          <ClimStudentAuth
            studentId={studentId}
            studentName={studentName ?? undefined}
            cohort={CLIM_COHORT}
            onSessionChange={(s) => {
              if (s) {
                setStudentId(s.id);
                setStudentName(s.name);
              } else {
                setStudentName(null);
              }
            }}
            onDemoPick={(id) => {
              setStudentId(id);
              const name = CLIM_COHORT.find((c) => c.id === id)?.nombre ?? null;
              setStudentName(name);
              try {
                localStorage.setItem(CLIM_STUDENT_LS_KEY, id);
                if (name) localStorage.setItem(CLIM_STUDENT_NAME_LS_KEY, name);
              } catch {
                /* ignore */
              }
            }}
            compact
          />
        ) : null}
      </header>
      <div className="sites-hub-hero-note mx-auto max-w-6xl px-4 pb-2 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--aula-blue)]">{hub.sector} · {hub.level}</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--aula-navy)] sm:text-3xl">{hub.title}</h1>
      </div>

      <main className="sites-hub-main">
        {hub.groups.map((group, index) => (
          <div key={group.title}>
            <div className={index === 0 ? "mt-2" : "mt-8"}>
              <ModuleRouteSection
                hub={hub}
                nums={group.nums}
                title={group.title}
                progress={isClim && routeData.id === studentId ? routeData.modules : []}
                loading={isClim && (routeLoading || (!routeError && routeData.id !== studentId))}
                error={isClim && routeError}
                sectionId={index === 0 ? "ruta" : undefined}
              />
            </div>
          </div>
        ))}

        {isClim ? (
          <StudentDashboard
            data={routeData.id === studentId ? routeData.overview : undefined}
            loading={routeLoading || (!routeError && routeData.id !== studentId)}
            error={routeError}
            modules={hub.modules}
          />
        ) : (
          <StaticCourseInfo hub={hub} />
        )}
        <CourseStatsCard
          modules={hub.stats.modules}
          hoursAnnual={hub.stats.hoursAnnual}
          hours3d={hub.stats.hours3d}
          status={hub.stats.status}
          label={`Resumen de ${hub.title}`}
        />

        {hub.spotlight ? (
              <section className="clim-hub-spotlight mt-10 overflow-hidden rounded-2xl border border-[rgba(8,112,239,0.25)] shadow-sm" aria-labelledby="spotlight-heading">
                <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
                  <div className="relative min-h-[200px] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hub.spotlight.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[rgba(6,47,145,0.55)] to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--aula-blue)] shadow">
                      {hub.spotlight.badge}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center p-5 sm:p-7">
                    <h2 id="spotlight-heading" className="text-xl font-bold text-[var(--aula-text)]">
                      {hub.spotlight.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--aula-text-muted)]">{hub.spotlight.body}</p>
                    <Link href={hub.spotlight.href} className="aula-btn-primary mt-5 inline-flex w-fit items-center justify-center gap-2 px-5 py-2.5 text-sm">
                      {hub.spotlight.cta}
                    </Link>
                  </div>
                </div>
              </section>
        ) : null}

        <details className="aula-card mt-10 group opacity-90">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[var(--aula-text-muted)] marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <span className="text-[var(--aula-blue)] transition-transform group-open:rotate-90">▸</span>
              Ver OA del programa (perfil de egreso)
            </span>
          </summary>
          <ul className="space-y-2 border-t border-[var(--aula-line)] px-4 py-3">
            {hub.oa.map((oa) => (
              <li key={oa.codigo} className="text-sm">
                <span className="font-bold text-[var(--aula-blue)]">{oa.codigo}</span>
                <span className="mt-0.5 block text-[var(--aula-text-muted)]">{oa.descripcion}</span>
              </li>
            ))}
          </ul>
        </details>

        <footer className="mt-8 rounded-2xl border border-[var(--aula-line)] bg-white/80 px-4 py-3 text-center text-xs text-[var(--aula-text-muted)] sm:px-5">
          {hub.footerNote}
          {hub.slug === "climatizacion" ? (
            <>
              {" · "}
              <a href="/aula-tp/climatizacion-curso-prompt-maestro.md" className="font-semibold text-[var(--aula-blue)] hover:underline">
                Ver documento maestro
              </a>
            </>
          ) : null}
        </footer>
      </main>
    </div>
  );
}
