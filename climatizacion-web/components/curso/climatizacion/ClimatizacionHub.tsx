"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CLIMATIZACION_META,
  HORAS_AULA_TP_POR_MODULO,
  MODULOS_CLIMATIZACION,
  OA_ESPECIALIDAD,
} from "@/lib/climatizacion-curso";
import { generateClimatizacionEstudiantes } from "@/lib/generate-climatizacion-estudiantes";
import ClimStudentAuth, {
  CLIM_STUDENT_LS_KEY,
  CLIM_STUDENT_NAME_LS_KEY,
  type ClimSessionStudent,
} from "@/components/curso/shared/ClimStudentAuth";
import "@/app/curso/climatizacion/hub.css";
import "@/app/curso/climatizacion/clim-radial-map.css";

const CLIM_COHORT = generateClimatizacionEstudiantes(160);

const MODULO_HREF: Record<number, string> = {
  1: "/curso/climatizacion/m1-planos",
  2: "/curso/climatizacion/m2-medicion",
  3: "/curso/climatizacion/m3-redes",
  4: "/curso/climatizacion/m4-equipos",
  5: "/curso/climatizacion/m5-puesta-en-marcha",
  6: "/curso/climatizacion/m6-diagnostico",
  7: "/curso/climatizacion/m7-mantencion",
  8: "/curso/climatizacion/m8-reciclaje",
};

const MODULO_CARD: Record<
  number,
  {
    title: string;
    blurb: string;
    accent: string;
    accentBg: string;
    ring: string;
    cover: string;
  }
> = {
  1: {
    title: "Lectura de planos",
    blurb: "Simbología e interpretación de planos en proyecto real.",
    accent: "#0870EF",
    accentBg: "rgba(8,112,239,0.12)",
    ring: "rgba(8,112,239,0.35)",
    cover: "/images/climatizacion/m1-planos-contexto.png",
  },
  2: {
    title: "Instrumentos de medición",
    blurb: "Selección y uso de instrumentos en contexto frigorífico.",
    accent: "#062F91",
    accentBg: "rgba(6,47,145,0.10)",
    ring: "rgba(6,47,145,0.30)",
    cover: "/images/climatizacion/m2-instrumentos.png",
  },
  3: {
    title: "Montaje de redes",
    blurb: "Uniones, hermeticidad y secuencia segura de montaje.",
    accent: "#008B98",
    accentBg: "rgba(0,139,152,0.12)",
    ring: "rgba(0,139,152,0.35)",
    cover: "/images/climatizacion/m3-montaje-redes.png",
  },
  4: {
    title: "Montaje de equipos",
    blurb: "Instalación post-montaje y decisión con manual técnico.",
    accent: "#F51670",
    accentBg: "rgba(245,22,112,0.10)",
    ring: "rgba(245,22,112,0.30)",
    cover: "/images/climatizacion/m4-montaje-equipos.png",
  },
  5: {
    title: "Puesta en marcha",
    blurb: "Protocolo de carga, EPP y lecturas de presión.",
    accent: "#4F46E5",
    accentBg: "rgba(79,70,229,0.10)",
    ring: "rgba(79,70,229,0.30)",
    cover: "/images/climatizacion/m5-carga-fluidos.png",
  },
  6: {
    title: "Diagnóstico",
    blurb: "Inspección visual/3D, CE del programa y evaluación 2 h.",
    accent: "#0870EF",
    accentBg: "rgba(8,112,239,0.14)",
    ring: "rgba(8,112,239,0.40)",
    cover: "/images/climatizacion/m6-inspeccion-visual.png",
  },
  7: {
    title: "Mantención",
    blurb: "Preventivo y correctivo acotado con orden de trabajo.",
    accent: "#008B98",
    accentBg: "rgba(0,139,152,0.14)",
    ring: "rgba(0,139,152,0.35)",
    cover: "/images/climatizacion/m7-mantencion.png",
  },
  8: {
    title: "Reciclaje y almacenamiento",
    blurb: "Recuperar y almacenar refrigerantes según NCh3241.",
    accent: "#F51670",
    accentBg: "rgba(245,22,112,0.12)",
    ring: "rgba(245,22,112,0.30)",
    cover: "/images/climatizacion/m8-recuperacion-epp.png",
  },
};

const HOW_IT_WORKS = [
  {
    id: "ruta",
    label: "Ruta obligatoria",
    hint: "Contexto → estaciones → cierre",
    detail:
      "Secuencia fija del Prompt Maestro: contextualización, estaciones AE, situación integradora, evaluación final (2 h) y cierre. Sin atajos.",
    emoji: "🛤️",
    color: "var(--aula-navy)",
    bg: "rgba(6,47,145,0.08)",
    activeBorder: "rgba(6,47,145,0.55)",
    image: "/images/climatizacion/fondo-ruta.png",
  },
  {
    id: "estaciones",
    label: "Estaciones AE",
    hint: "Práctica guiada por OA/AE",
    detail:
      "Cada estación trabaja Aprendizajes Esperados del programa con práctica guiada, evidencias y Tutor Aula TP cuando corresponde.",
    emoji: "🛠️",
    color: "var(--aula-blue)",
    bg: "rgba(8,112,239,0.10)",
    activeBorder: "rgba(8,112,239,0.55)",
    image: "/images/climatizacion/fondo-estaciones.png",
  },
  {
    id: "eval",
    label: "Evaluación 2 h",
    hint: "Sin Tutor · incluida en horas",
    detail:
      "Evaluación Final de 2 horas pedagógicas incluida en las horas Aula TP. Sin Tutor: demuestra lo aprendido de forma independiente.",
    emoji: "⏱️",
    color: "var(--aula-magenta)",
    bg: "rgba(245,22,112,0.08)",
    activeBorder: "rgba(245,22,112,0.45)",
    image: "/images/climatizacion/fondo-evaluacion.png",
  },
  {
    id: "libre",
    label: "Práctica Libre",
    hint: "Verde · paralelo · sin nota",
    detail:
      "Botón verde paralelo (Explorar → Desafiar → Investigar → Transferir). No altera progreso ni nota; refuerza curiosidad y transferencia.",
    emoji: "🌿",
    color: "var(--aula-green-pl)",
    bg: "rgba(16,185,129,0.12)",
    activeBorder: "rgba(16,185,129,0.5)",
    image: "/images/climatizacion/fondo-practica-libre.png",
  },
] as const;

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


type RouteProgress = {numero:number;completed:number;total:number;pct:number;nextSlug?:string;nextTitle?:string};
type StudentOverview = {
 studentName:string;curso:string;especialidad:string;nivel:string;periodo:string|null;programa:string;scope:string;
 completed:number;total:number;pct:number;completedModules:number;totalModules:number;
 nextModule?:number;nextSlug?:string;nextTitle?:string;
};
function StudentDashboard({data,loading,error}:{data?:StudentOverview;loading:boolean;error:boolean}) {
 return <section className="clim-student-dashboard" aria-labelledby="student-overview-heading" aria-busy={loading}>
  <h2 id="student-overview-heading"><span aria-hidden>ⓘ</span> Información general</h2>
  {loading ? <p className="student-dashboard-message" role="status">Consultando la información del estudiante…</p> : error || !data ?
   <p className="student-dashboard-message" role="alert">No se pudo cargar la información. Recarga la página para volver a consultar tu avance.</p> :
   <div className="student-dashboard-grid">
    <dl className="student-dashboard-details">
      {[
       ['Estudiante',data.studentName],['Curso',data.curso],['Especialidad',data.especialidad],
       ['Nivel',data.nivel],['Período',data.periodo||'No informado'],['Programa',data.programa],
      ].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
    <div className="student-dashboard-progress">
      <p className="student-dashboard-eyebrow">Progreso general · {data.scope}</p>
      <div className="student-dashboard-result"><span className="student-dashboard-ring" style={{background:`conic-gradient(#008a98 ${data.pct}%, #dfedf3 0)`}} aria-hidden><b>{data.pct}%</b></span><div><strong>{data.completed} de {data.total}</strong><span>estaciones completadas</span></div></div>
      <progress max={data.total||1} value={data.completed} aria-label={`Progreso general: ${data.pct}% completado`} />
      <p>{data.completedModules} de {data.totalModules} módulos completados</p>
      {data.nextModule ? <div className="student-dashboard-next"><strong>Tu siguiente paso · Módulo {data.nextModule}</strong><p>{data.nextTitle}</p><Link className="aula-btn-primary" href={`${MODULO_HREF[data.nextModule]}?reanudar=1&estacion=${encodeURIComponent(data.nextSlug||'')}`}>Continuar mi curso →</Link></div> : <div className="student-dashboard-next"><strong>✓ Recorrido completado</strong><p>Ya completaste todas las estaciones de este nivel. Puedes revisar tus módulos en la ruta.</p></div>}
      <small>Avance basado en estaciones guardadas, no en calificaciones. La práctica libre no modifica este porcentaje.</small>
    </div>
   </div>}
 </section>;
}
function ModuleRouteSection({
  nums,
  title,
  progress,
  loading,
  error,
}: {
  nums: number[];
  title: string;
  progress: RouteProgress[];
  loading: boolean;
  error: boolean;
}) {
  const tones = ["navy", "teal", "blue", "magenta"] as const;
  const recommended=nums.find(n=>progress.find(p=>p.numero===n)?.pct!==100);
  return (
    <section className="mt-10 clim-hub-route-panel" aria-label={title}>
      <h2>
        <span aria-hidden className="clim-route-heading-icon" />
        <span>Ruta de aprendizaje · {title}</span>
      </h2>
      <p className="mt-1 text-xs text-[var(--aula-text-muted)]">
        {loading ? "Consultando tu avance…" : error ? "No se pudo consultar el avance. Recarga para intentarlo nuevamente." : "Tu ruta: revisa lo completado y continúa desde la primera estación pendiente."}
      </p>
      <div className="clim-hub-route">
        <div className="clim-hub-route-line" aria-hidden />
        {nums.map((n, i) => {
          const card = MODULO_CARD[n];
          const mod = MODULOS_CLIMATIZACION.find((m) => m.numero === n);
          const h = HORAS_AULA_TP_POR_MODULO[n];
          const p=progress.find(p=>p.numero===n);
          const done=p?.pct===100;
          const next=!loading && !error && n===recommended;
          const href = p?.nextSlug ? `${MODULO_HREF[n]}?estacion=${encodeURIComponent(p.nextSlug)}&reanudar=1` : `${MODULO_HREF[n]}?vista=mapa&reanudar=1`;
          const tone = tones[i % tones.length];
          return (
            <Link
              key={n}
              href={href}
              className={`clim-hub-route-item tone-${tone}${done ? " route-done" : next ? " route-next" : ""}`}
              aria-current={next ? "step" : undefined}
            >
              {i < nums.length - 1 ? (
                <span className="clim-hub-route-arrow" aria-hidden>
                  ›
                </span>
              ) : null}
              <span className="clim-hub-route-step">{done ? "✓" : n}</span>
              <div className="clim-hub-route-body">
                <span className="clim-hub-route-icon" aria-hidden>
                  {n}
                </span>
                <small className="text-[10px] font-bold uppercase tracking-wide text-[var(--aula-teal)]">
                  Módulo {n}
                  {(mod?.oaCodigos ?? []).length
                    ? ` · ${(mod?.oaCodigos ?? []).join(", ")}`
                    : ""}
                </small>
                <h3>{card.title}</h3>
                <span className="route-state">{loading ? "Cargando…" : error ? "Avance no disponible" : done ? "Completado" : next ? "Continúa aquí" : p?.completed ? "En curso" : "Por comenzar"}</span>
                {p && !loading && !error ? <>
                  <progress className="route-progress" max={p.total} value={p.completed} aria-label={`Avance del módulo ${n}`} />
                  <span className="route-count">{p.completed} de {p.total} estaciones · {p.pct}%</span>
                  {next && p.nextTitle ? <span className="route-pending">Siguiente: {p.nextTitle}</span> : null}
                </> : null}
                <p className="clim-hub-route-hours">
                  {h.aulaTp} h Aula TP
                  {n === 6 ? " · 3D" : ""}
                </p>
                <span className="clim-hub-route-enter">{done ? "Revisar módulo" : next ? "Continuar mi recorrido →" : p?.completed ? "Retomar módulo" : "Entrar al mapa"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function HeroCollage({
  reducedMotion,
}: {
  reducedMotion: boolean;
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

  const onLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto h-64 w-full max-w-md sm:mx-0 sm:h-72"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-hidden
    >
      {/* Back card — planos */}
      <div
        className={`clim-hub-collage__card clim-hub-collage__card--float-a absolute left-0 top-6 z-10 h-40 w-[58%] overflow-hidden rounded-2xl border-2 border-white/50 shadow-xl sm:h-48 ${
          reducedMotion ? "" : ""
        }`}
        style={{
          transform: reducedMotion
            ? undefined
            : `translate(${offset.x * -0.6}px, ${offset.y * -0.5}px)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/climatizacion/m1-planos-contexto.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Mid card — montaje / gif */}
      <div
        className="clim-hub-collage__card clim-hub-collage__card--float-b absolute bottom-2 right-2 z-20 h-36 w-[52%] overflow-hidden rounded-2xl border-2 border-white/60 shadow-2xl sm:h-44"
        style={{
          transform: reducedMotion
            ? undefined
            : `translate(${offset.x * 0.9}px, ${offset.y * 0.7}px)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/climatizacion/m6-inspeccion-demo.gif"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Front accent — equipos */}
      <div
        className="clim-hub-collage__card clim-hub-collage__card--float-c absolute left-[28%] top-0 z-30 h-28 w-[42%] overflow-hidden rounded-2xl border-2 border-white/70 shadow-xl sm:h-32"
        style={{
          transform: reducedMotion
            ? undefined
            : `translate(${offset.x * 1.2}px, ${offset.y * 1.1}px)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/climatizacion/m4-montaje-equipos.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Logo corporativo Aula TP Chile */}
      <div className="absolute -right-1 top-6 z-40 w-28 overflow-hidden rounded-2xl border border-white/50 bg-white p-2 shadow-xl sm:w-32 sm:p-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/climatizacion/aula-tp-chile-logo-corporativo.jpg"
          alt="Aula TP Chile"
          className="h-auto w-full object-contain"
        />
      </div>
    </div>
  );
}

export default function ClimatizacionHub() {
  const reducedMotion = usePrefersReducedMotion();
  const [studentId, setStudentId] = useState(CLIM_COHORT[0]?.id ?? "clim-001");
  const [studentName, setStudentName] = useState<string | null>(null);
  const [routeData,setRouteData]=useState<{id:string;modules:RouteProgress[];overview?:StudentOverview}>({id:'',modules:[]});
  const [routeLoading,setRouteLoading]=useState(true);
  const [routeError,setRouteError]=useState(false);
  const [sessionReady,setSessionReady]=useState(false);
  useEffect(()=>{
    if(!sessionReady) return;
    let active=true;
    const controller=new AbortController();
    const refresh=async()=>{
      setRouteLoading(true);
      try {
        const res=await fetch(`/api/lms/climatizacion/route-progress?studentId=${encodeURIComponent(studentId)}`,{credentials:'include',cache:'no-store',signal:controller.signal});
        if(!res.ok) throw Error('progress');
        const data=await res.json();
        if(active){setRouteData({id:studentId,modules:data.modules,overview:data.overview});setRouteError(false);}
      }catch {if(active)setRouteError(true);}
      finally{if(active)setRouteLoading(false);}
    };
    void refresh();
    const visible=()=>{if(document.visibilityState==='visible')void refresh();};
    window.addEventListener('focus',refresh);
    window.addEventListener('pageshow',refresh);
    document.addEventListener('visibilitychange',visible);
    return ()=>{active=false;controller.abort();window.removeEventListener('focus',refresh);window.removeEventListener('pageshow',refresh);document.removeEventListener('visibilitychange',visible);};
  },[studentId,sessionReady]);
  useEffect(() => {
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
      }).finally(()=>setSessionReady(true));
  }, []);

  return (
    <div className="aula-font min-h-screen bg-[var(--aula-bg)] text-[var(--aula-text)]">
      {/* Impressive hero */}
      <header className="aula-header-hero clim-hub-hero">
        <div className="clim-hub-hero__blobs" data-decor aria-hidden>
          <span className="clim-hub-hero__blob clim-hub-hero__blob--1" />
          <span className="clim-hub-hero__blob clim-hub-hero__blob--2" />
          <span className="clim-hub-hero__blob clim-hub-hero__blob--3" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-center sm:px-6 sm:py-14">
          <div className="min-w-0 flex-1">
            <nav className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/85">
              <Link href="/portal-docente" className="font-medium hover:underline">
                Portal Docente
              </Link>
              <span className="text-white/35">·</span>
              <Link href="/" className="font-medium hover:underline">
                Sitio
              </Link>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                Aula TP
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                EMTP
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                Sector {CLIMATIZACION_META.sector}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {CLIMATIZACION_META.especialidad}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
              Curso completo M1–M8 · 3° y 4° medio · ruta obligatoria + Práctica
              Libre. Entra por el módulo que te corresponde y avanza con
              estaciones AE.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--aula-teal)]/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Tutor Aula TP
              </span>
              <span className="rounded-full bg-[var(--aula-green-pl)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Práctica Libre
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/curso/climatizacion/m1-planos?vista=mapa"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[var(--aula-navy)] shadow-lg transition hover:bg-white/95 hover:shadow-xl"
              >
                Empezar por Módulo 1
              </Link>
              <Link
                href="/curso/climatizacion/m5-puesta-en-marcha?vista=mapa"
                className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Ver 4° medio (M5)
              </Link>
            </div>
            <div className="mt-4">
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
                  const name =
                    CLIM_COHORT.find((c) => c.id === id)?.nombre ?? null;
                  setStudentName(name);
                  try {
                    localStorage.setItem(CLIM_STUDENT_LS_KEY, id);
                    if (name)
                      localStorage.setItem(CLIM_STUDENT_NAME_LS_KEY, name);
                  } catch {
                    /* ignore */
                  }
                }}
              />
            </div>
          </div>

          <div className="w-full shrink-0 sm:w-[420px]">
            <HeroCollage reducedMotion={reducedMotion} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <StudentDashboard data={routeData.id===studentId?routeData.overview:undefined} loading={routeLoading||(!routeError&&routeData.id!==studentId)} error={routeError} />
        {/* Module route follows the student dashboard directly. */}
        <ModuleRouteSection nums={[1, 2, 3, 4]} title="3° medio · M1–M4" progress={routeData.id===studentId?routeData.modules:[]} loading={routeLoading||(!routeError&&routeData.id!==studentId)} error={routeError} />
        {/*
        <section aria-label="Cómo funciona">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--aula-text-muted)]">
            Cómo funciona
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {HOW_IT_WORKS.map((item) => {
              const active = howActive === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHowActive(item.id)}
                  className={`clim-hub-how-card rounded-2xl border px-3 py-3 text-center shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--aula-blue)] ${
                    active ? "is-active" : ""
                  }`}
                  style={{
                    backgroundColor: item.bg,
                    backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.82), rgba(255,255,255,0.64)), url(${item.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderColor: active ? item.activeBorder : "var(--aula-line)",
                    borderWidth: active ? 2 : 1,
                  }}
                  aria-pressed={active}
                >
                  <span className="text-lg" aria-hidden>
                    {item.emoji}
                  </span>
                  <p
                    className="mt-1 text-xs font-extrabold uppercase tracking-wide"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--aula-text-muted)]">
                    {item.hint}
                  </p>
                </button>
              );
            })}
          </div>
          <div
            className="mt-3 rounded-2xl border border-[var(--aula-line)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--aula-text-muted)] shadow-sm"
            role="status"
          >
            <span className="mr-2" aria-hidden>
              {activeHow.emoji}
            </span>
            <strong
              className="font-semibold"
              style={{ color: activeHow.color }}
            >
              {activeHow.label}:{" "}
            </strong>
            {activeHow.detail}
          </div>
        </section>
        */}

        {/* Spotlight M6 */}
        <section
          className="clim-hub-spotlight mt-10 overflow-hidden rounded-2xl border border-[rgba(8,112,239,0.25)] shadow-sm"
          aria-labelledby="spotlight-m6"
        >
          <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
            <div className="relative min-h-[200px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/climatizacion/m6-inspeccion-demo.gif"
                alt="Inspección visual 3D — módulo 6"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(6,47,145,0.55)] to-transparent sm:bg-gradient-to-t sm:from-[rgba(6,47,145,0.4)] sm:to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--aula-blue)] shadow">
                Spotlight · M6
              </span>
            </div>
            <div className="flex flex-col justify-center p-5 sm:p-7">
              <h2
                id="spotlight-m6"
                className="text-xl font-bold text-[var(--aula-text)]"
              >
                Diagnóstico con inspección 3D
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--aula-text-muted)]">
                Explora la condensadora en 3D, recorre hotspots de inspección
                visual y conecta hallazgos con los CE del programa. Ideal para
                4° medio.
              </p>
              <Link
                href="/curso/climatizacion/m6-diagnostico?estacion=inspeccion-visual"
                className="aula-btn-primary mt-5 inline-flex w-fit items-center justify-center gap-2 px-5 py-2.5 text-sm"
              >
                Abrir inspección visual
              </Link>
            </div>
          </div>
        </section>

        <ModuleRouteSection nums={[5, 6, 7, 8]} title="4° medio · M5–M8" progress={routeData.id===studentId?routeData.modules:[]} loading={routeLoading||(!routeError&&routeData.id!==studentId)} error={routeError} />

        {/* Collapsible OA — quieter */}
        <details className="aula-card mt-10 group opacity-90">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[var(--aula-text-muted)] marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <span className="text-[var(--aula-blue)] transition-transform group-open:rotate-90">
                ▸
              </span>
              Ver OA del programa (perfil de egreso)
            </span>
          </summary>
          <ul className="space-y-2 border-t border-[var(--aula-line)] px-4 py-3">
            {OA_ESPECIALIDAD.map((oa) => (
              <li key={oa.codigo} className="text-sm">
                <span className="font-bold text-[var(--aula-blue)]">
                  {oa.codigo}
                </span>
                <span className="mt-0.5 block text-[var(--aula-text-muted)]">
                  {oa.descripcion}
                </span>
              </li>
            ))}
          </ul>
        </details>

        <footer className="mt-8 rounded-2xl border border-[var(--aula-line)] bg-white/80 px-4 py-3 text-center text-xs text-[var(--aula-text-muted)] sm:px-5">
          Prompt Maestro 30% ·{" "}
          <a
            href={CLIMATIZACION_META.documentoMaestro}
            className="font-semibold text-[var(--aula-blue)] hover:underline"
          >
            Ver documento maestro
          </a>
        </footer>
      </main>
    </div>
  );
}
