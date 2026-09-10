"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import ZoomableImage from "@/components/curso/shared/ZoomableImage";
import TutorFlotante from "@/components/curso/shared/TutorFlotante";
import SupportHub from "@/components/curso/shared/SupportHub";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  A11Y_STORAGE_KEY,
  DEFAULT_A11Y,
  ETAPA_ACCENT,
  ETAPA_LABELS,
  FASE_LABELS,
  formatHoras,
  mapHabilidadToEtapa,
  shortTitle,
  type A11yPrefs,
  type CierreCard,
  type EstacionBase,
  type FaseRuta,
  type ModuleMeta,
  type PracticaLibreFase,
  type ProgressState,
} from "@/lib/aula-module-types";
import { getPracticaLibreDesafios } from "@/lib/practica-libre-desafios";
import { generateClimatizacionEstudiantes } from "@/lib/generate-climatizacion-estudiantes";
import ClimStudentAuth, {
  CLIM_STUDENT_LS_KEY,
  CLIM_STUDENT_NAME_LS_KEY,
  type ClimSessionStudent,
} from "@/components/curso/shared/ClimStudentAuth";
import CourseStatsCard from "@/components/curso/shared/CourseStatsCard";
import StationRail, { railItemFromEstacion } from "@/components/curso/shared/StationRail";
import { HORAS_AULA_TP_POR_MODULO } from "@/lib/climatizacion-curso";
import "@/app/curso/climatizacion/clim-shell-chrome.css";
import "@/app/curso/climatizacion/clim-module-overview.css";

const CLIM_COHORT = generateClimatizacionEstudiantes(160);

const CASE_IMAGES: Record<number, { src: string; alt: string }> = {
  1: { src: "/images/climatizacion/caso-m1-oficinas-providencia.png", alt: "Planificación de climatización en oficinas de Providencia" },
  2: { src: "/images/climatizacion/caso-m2-packing-aconcagua.png", alt: "Instrumentos de medición en packing frutícola del Aconcagua" },
  3: { src: "/images/climatizacion/caso-m3-vivienda-valparaiso.png", alt: "Instalación de climatización en vivienda de Valparaíso" },
  4: { src: "/images/climatizacion/caso-m4-oficina-biobio.png", alt: "Montaje de equipo de climatización en oficina municipal" },
  5: { src: "/images/climatizacion/caso-supermercado-los-lagos-sala-fria.png", alt: "Equipos de carga y transporte para sala fría de supermercado" },
  6: { src: "/images/climatizacion/caso-m6-edificio-nunoa.png", alt: "Diagnóstico de equipo de climatización en edificio de Ñuñoa" },
  7: { src: "/images/climatizacion/caso-m7-planta-ohiggins.png", alt: "Mantención de cámaras frigoríficas en planta agroindustrial" },
  8: { src: "/images/climatizacion/caso-m8-centro-comercial-rm.png", alt: "Recuperación controlada de refrigerante en centro comercial" },
};

const CondensadoraViewer = dynamic(
  () => import("@/components/curso/shared/CondensadoraViewer"),
  { ssr: false, loading: () => (
    <div className="flex h-[360px] items-center justify-center rounded-xl border border-[var(--aula-line)] bg-slate-100 text-sm text-slate-600">
      Cargando visor 3D…
    </div>
  ) },
);


export type AulaModuleShellProps = {
  meta: ModuleMeta;
  estaciones: EstacionBase[];
  practicaLibre: PracticaLibreFase[];
  routeBase: string;
  familiaLabels: Record<string, string>;
  evalBanner: string;
  cierreInteraccion: string;
  cierreCards: CierreCard[];
  cierreBarClass?: string;
  evidencias: string[];
  initialSlug?: string;
  initialProgress: ProgressState;
  stationIsUnlocked: (e: EstacionBase, completedIds: string[]) => boolean;
  canCompleteStation: (e: EstacionBase, selected: string[]) => boolean;
  getEstacionBySlug: (slug: string) => EstacionBase | undefined;
};

function loadA11y(): A11yPrefs {
  if (typeof window === "undefined") return DEFAULT_A11Y;
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return DEFAULT_A11Y;
    return { ...DEFAULT_A11Y, ...JSON.parse(raw) } as A11yPrefs;
  } catch {
    return DEFAULT_A11Y;
  }
}

function a11yClassNames(p: A11yPrefs): string {
  const parts = ["aula-font"];
  if (p.texto === "grande") parts.push("aula-a11y-large");
  if (p.texto === "muy_grande") parts.push("aula-a11y-xlarge");
  if (p.altoContraste) parts.push("aula-a11y-hc");
  if (p.visualSimple) parts.push("aula-a11y-simple");
  if (p.reducirMovimiento) parts.push("aula-a11y-reduce-motion");
  if (p.resaltarFoco) parts.push("aula-a11y-focus-strong");
  if (p.perfil === "baja") parts.push("aula-a11y-baja");
  if (p.perfil === "apoyo" || p.masAyuda) parts.push("aula-a11y-apoyo");
  return parts.join(" ");
}

export default function AulaModuleShell({
  meta,
  estaciones,
  practicaLibre,
  routeBase,
  familiaLabels,
  evalBanner,
  cierreInteraccion,
  cierreCards,
  cierreBarClass = "bg-[var(--aula-blue)]",
  evidencias,
  initialSlug,
  initialProgress,
  stationIsUnlocked,
  canCompleteStation,
  getEstacionBySlug,
}: AulaModuleShellProps) {
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [hydrated, setHydrated] = useState(false);
  const [plOpen, setPlOpen] = useState(false);
  const [plFase, setPlFase] =
    useState<PracticaLibreFase["id"]>("explorar");
  const [a11yOpen, setA11yOpen] = useState(false);
  const [a11y, setA11y] = useState<A11yPrefs>(DEFAULT_A11Y);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string>(CLIM_COHORT[0]?.id ?? "clim-001");
  const [studentName, setStudentName] = useState<string | null>(null);
  const [plChallengeMsg, setPlChallengeMsg] = useState<string | null>(null);
  const [plSelectedOpt, setPlSelectedOpt] = useState<string | null>(null);
  /** Banner when hub/deep-link opens a station ahead of the sequential unlock chain (demo). */
  const [deepLinkBanner, setDeepLinkBanner] = useState<string | null>(null);
  /** Mapa radial (SI centro) vs estación detallada — arquitectura visual tipo Enfermería. */
  const [viewMode, setViewMode] = useState<"mapa" | "estacion">("mapa");
  /**
   * P1 deep-link / hub spotlight (demo-friendly):
   * When URL has estacion=/station= matching a known slug still locked by the
   * sequential ruta, temporarily unlock stations up to that orden in-session
   * so CondensadoraViewer / target station opens — WITHOUT marking prior
   * stations completed (localStorage/LMS stay honest; prior remain available).
   */
  const [spotlightUnlockThroughOrden, setSpotlightUnlockThroughOrden] =
    useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
    let loaded = initialProgress;
    try {
      const raw = localStorage.getItem(meta.storageKey);
      if (raw) loaded = { ...initialProgress, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    if (new URLSearchParams(window.location.search).get('reanudar') === '1') {
      try {
        const sessionResponse = await fetch('/api/lms/climatizacion/session', {credentials:'include',cache:'no-store'});
        const session = await sessionResponse.json();
        const resumeId = session.student?.id || localStorage.getItem(CLIM_STUDENT_LS_KEY) || CLIM_COHORT[0]?.id;
        const response = await fetch(`/api/lms/climatizacion/progress?studentId=${encodeURIComponent(resumeId)}`, {credentials:'include',cache:'no-store'});
        if(!response.ok) throw Error('No se pudo recuperar el avance');
        const saved = await response.json();
        const ids = saved.progress?.modules?.[String(meta.moduloNumero)]?.completedStationIds || [];
        loaded = {...initialProgress, completedIds: estaciones.filter(e=>ids.includes(e.id)).map(e=>e.id)};
        if(cancelled) return;
      } catch {
        if(!cancelled) setDeepLinkBanner('No se pudo recuperar tu avance. Recarga la página antes de continuar.');
        return;
      }
    }
    if (!loaded.plCounters) {
      loaded.plCounters = { situacion: 1, correctas: 0, reintentos: 0 };
    }
    // Resolve deep-link slug from prop or URL (?estacion= / ?station=).
    let slug = initialSlug?.trim() || undefined;
    if (!slug && typeof window !== "undefined") {
      try {
        const sp = new URLSearchParams(window.location.search);
        slug =
          (sp.get("estacion") || sp.get("station") || undefined)?.trim() ||
          undefined;
      } catch {
        /* ignore */
      }
    }
    if (slug) {
      const est = getEstacionBySlug(slug);
      if (est) {
        const alreadyOpen = stationIsUnlocked(est, loaded.completedIds);
        if (!alreadyOpen) {
          setSpotlightUnlockThroughOrden(est.orden);
          setDeepLinkBanner(
            `Entraste a ${shortTitle(est.titulo)} (demo). Las estaciones anteriores siguen disponibles en la ruta.`,
          );
        } else {
          setSpotlightUnlockThroughOrden(null);
          setDeepLinkBanner(null);
        }
        loaded = { ...loaded, currentId: est.id };
        setViewMode("estacion");
      }
    } else if (typeof window !== "undefined") {
      try {
        const sp = new URLSearchParams(window.location.search);
        if (sp.get("vista") === "estacion") setViewMode("estacion");
        else setViewMode("mapa");
      } catch {
        setViewMode("mapa");
      }
    }
    if (!loaded.practicaLibreDone) loaded.practicaLibreDone = [];
    setProgress(loaded);
    setA11y(loadA11y());
    try {
      const sid = localStorage.getItem(CLIM_STUDENT_LS_KEY);
      const sname = localStorage.getItem(CLIM_STUDENT_NAME_LS_KEY);
      if (sid && CLIM_COHORT.some((s) => s.id === sid)) {
        setStudentId(sid);
        if (sname) setStudentName(sname);
      } else if (CLIM_COHORT[0]) {
        setStudentId(CLIM_COHORT[0].id);
        localStorage.setItem(CLIM_STUDENT_LS_KEY, CLIM_COHORT[0].id);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
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
        /* sesión opcional */
      });
    };
    void hydrate();
    return () => { cancelled = true; };
  }, [
    initialSlug,
    initialProgress,
    meta.storageKey,
    meta.moduloNumero,
    getEstacionBySlug,
    stationIsUnlocked,
    estaciones,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(meta.storageKey, JSON.stringify(progress));
    } catch {
      /* ignore */
    }
  }, [progress, hydrated, meta.storageKey]);

  // Cada módulo consulta el avance persistido del alumno al entrar.
  // Así la ruta interna refleja la misma evidencia en cualquier dispositivo,
  // no únicamente el estado local del navegador.
  useEffect(() => {
    if (!hydrated || !studentId) return;
    let cancelled = false;
    const loadPersistedModuleProgress = async () => {
      try {
        const response = await fetch(
          `/api/lms/climatizacion/progress?studentId=${encodeURIComponent(studentId)}`,
          { credentials: "include", cache: "no-store" },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as {
          progress?: {
            modules?: Record<
              string,
              { completedStationIds?: string[]; currentStationId?: string }
            >;
          };
        };
        if (cancelled) return;
        const remoteModule = payload.progress?.modules?.[String(meta.moduloNumero)];
        if (!remoteModule) return;
        const validCompletedIds = (remoteModule.completedStationIds ?? []).filter(
          (id) => estaciones.some((estacion) => estacion.id === id),
        );
        setProgress((currentProgress) => ({
          ...currentProgress,
          completedIds: validCompletedIds,
          currentId:
            remoteModule.currentStationId &&
            estaciones.some((estacion) => estacion.id === remoteModule.currentStationId)
              ? remoteModule.currentStationId
              : currentProgress.currentId,
        }));
      } catch {
        // La ruta puede seguir funcionando con el estado local si el LMS no responde.
      }
    };
    void loadPersistedModuleProgress();
    return () => {
      cancelled = true;
    };
  }, [hydrated, studentId, meta.moduloNumero, estaciones]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(a11y));
    } catch {
      /* ignore */
    }
  }, [a11y, hydrated]);

  const syncLmsProgress = useCallback(
    (completedIds: string[], stationId?: string) => {
      if (!studentId) return;
      void fetch("/api/lms/climatizacion/progress", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          moduleNumero: meta.moduloNumero,
          completedStationIds: completedIds,
          stationId,
          stationTotal: estaciones.length,
        }),
      }).catch(() => {
        /* LMS opcional en demo offline */
      });
    },
    [studentId, meta.moduloNumero, estaciones.length],
  );

  useEffect(() => {
    if (!hydrated || !studentId) return;
    syncLmsProgress(progress.completedIds);
    // solo al hidratar / cambiar estudiante
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, studentId]);

  const isStationOpen = useCallback(
    (e: EstacionBase, completedIds: string[]) => {
      if (
        spotlightUnlockThroughOrden != null &&
        e.orden <= spotlightUnlockThroughOrden
      ) {
        return true;
      }
      return stationIsUnlocked(e, completedIds);
    },
    [spotlightUnlockThroughOrden, stationIsUnlocked],
  );

  const current =
    estaciones.find((e) => e.id === progress.currentId) ?? estaciones[0];
  const selected = progress.selectedByStation[current.id] ?? [];
  const correctOptionCount = current.opciones.filter((option) => option.correcta).length;
  const questionMode = correctOptionCount === 1 ? "single" : "multiple";
  const questionModeLabel =
    questionMode === "single" ? "Selección única" : "Selección múltiple";
  const questionMethod = current.interaccion.includes("hotspot")
    ? {
        label: "Identificación visual",
        description:
          "Reconoce evidencias directamente sobre la imagen y confirma la selección en la lista.",
      }
    : current.interaccion.includes("secuencia") || current.interaccion.includes("armado")
      ? {
          label: "Decisión de procedimiento",
          description:
            "Selecciona las acciones o condiciones que permiten ejecutar el procedimiento con seguridad.",
        }
      : current.interaccion.includes("matching")
        ? {
            label: "Relación de conceptos",
            description:
              "Relaciona la evidencia técnica con el concepto o decisión profesional correspondiente.",
          }
        : current.interaccion.includes("tabla") || current.interaccion.includes("registro")
          ? {
              label: "Lectura y registro de datos",
              description:
                "Interpreta mediciones o registros y selecciona la conclusión respaldada por los datos.",
            }
          : current.interaccion.includes("evaluacion") || current.interaccion === "evaluacion"
            ? {
                label: "Decisión profesional",
                description:
                  "Elige la alternativa que mejor fundamenta la decisión frente al caso técnico.",
              }
            : {
                label: questionModeLabel,
                description:
                  questionMode === "single"
                    ? "Selecciona la alternativa que mejor fundamenta la decisión."
                    : "Selecciona todas las alternativas que aportan evidencia válida.",
              };
  const completedCount = progress.completedIds.length;
  const total = estaciones.length;
  const pct = Math.round((completedCount / total) * 100);
  const unlocked = isStationOpen(current, progress.completedIds);
  const isDone = progress.completedIds.includes(current.id);
  const canComplete = canCompleteStation(current, selected);
  const agentDisabled = !current.permiteAgente || !!current.esEvaluacionFormal;
  const etapa = mapHabilidadToEtapa(current.habilidad);
  const etapaAccent = ETAPA_ACCENT[etapa];
  const aeCodes = Array.from(
    new Set(estaciones.flatMap((estacion) => estacion.aeCodigos)),
  );
  const selectedAe = current.aeCodigos[0] ?? aeCodes[0] ?? null;
  const nextOpenStation =
    estaciones.find(
      (estacion) =>
        !progress.completedIds.includes(estacion.id) &&
        isStationOpen(estacion, progress.completedIds),
    ) ?? current;
  const plCounters = progress.plCounters ?? {
    situacion: 1,
    correctas: 0,
    reintentos: 0,
  };

  const goTo = useCallback(
    (est: EstacionBase) => {
      if (!isStationOpen(est, progress.completedIds)) {
        setFeedback(
          "Estación bloqueada. Completa la anterior: la ruta obligatoria es secuencial.",
        );
        return;
      }
      setFeedback(null);
      setSuccessFeedback(null);
      setViewMode("estacion");
      setProgress((p) => ({ ...p, currentId: est.id }));
      if (typeof window !== "undefined") {
        window.history.replaceState(
          null,
          "",
          `${routeBase}?estacion=${est.slug}`,
        );
      }
    },
    [progress.completedIds, routeBase, isStationOpen],
  );

  const toggleOption = (optId: string) => {
    if (isDone && current.esEvaluacionFormal) return;
    setFeedback(null);
    setSuccessFeedback(null);
    setProgress((p) => {
      const prev = p.selectedByStation[current.id] ?? [];
      const next = prev.includes(optId)
        ? prev.filter((id) => id !== optId)
        : [...prev, optId];
      return {
        ...p,
        selectedByStation: { ...p.selectedByStation, [current.id]: next },
      };
    });
  };

  const selectQuestionOption = (optId: string) => {
    if (questionMode === "single") {
      if (isDone && current.esEvaluacionFormal) return;
      setFeedback(null);
      setSuccessFeedback(null);
      setProgress((p) => ({
        ...p,
        selectedByStation: { ...p.selectedByStation, [current.id]: [optId] },
      }));
      return;
    }
    toggleOption(optId);
  };

  const completeCurrent = () => {
    if (!canComplete) {
      const hasWrong = selected.some((id) => {
        const opt = current.opciones.find((o) => o.id === id);
        return opt && !opt.correcta;
      });
      if (hasWrong) {
        setSuccessFeedback(null);
        setFeedback(
          current.errorUtil
            ? `No conforme. ${current.errorUtil} Corrige la selección y vuelve a registrar.`
            : `No conforme. Selección sin respaldo técnico. Requisito: ${current.evidenciaMinima}`,
        );
      } else {
        setSuccessFeedback(null);
        setFeedback(
          `Evidencia insuficiente. Requisito: ${current.evidenciaMinima}. Completa lo mínimo antes de avanzar.`,
        );
      }
      return;
    }
    setFeedback(null);
    setSuccessFeedback(
      `Evidencia registrada conforme. Cumple: ${current.evidenciaMinima}`,
    );
    setProgress((p) => {
      const completedIds = p.completedIds.includes(current.id)
        ? p.completedIds
        : [...p.completedIds, current.id];
      syncLmsProgress(completedIds, current.id);
      return {
        ...p,
        completedIds,
        evalSubmitted:
          current.fase === "evaluacion_final" ? true : p.evalSubmitted,
      };
    });
  };

  const goNext = () => {
    const next = estaciones.find((e) => e.orden === current.orden + 1);
    if (next) {
      if (!progress.completedIds.includes(current.id)) {
        setFeedback(
          "Sin evidencia registrada no hay avance. Completa esta estación antes de continuar.",
        );
        return;
      }
      goTo(next);
      return;
    }
    window.location.href = meta.portalDocenteHref;
  };

  const agentHints = current.agente;

  const faseGroups = useMemo(() => {
    const map = new Map<FaseRuta, EstacionBase[]>();
    for (const e of estaciones) {
      const list = map.get(e.fase) ?? [];
      list.push(e);
      map.set(e.fase, list);
    }
    return map;
  }, [estaciones]);


  const plDesafios = useMemo(
    () => getPracticaLibreDesafios(meta.moduloNumero),
    [meta.moduloNumero],
  );
  const plDone = progress.practicaLibreDone ?? [];
  const plDoneCount = plDesafios.filter((d) => plDone.includes(d.faseId)).length;
  const activePlIndex = Math.max(
    0,
    practicaLibre.findIndex((fase) => fase.id === plFase),
  );

  const selectPlFase = (faseId: PracticaLibreFase["id"]) => {
    setPlFase(faseId);
    setPlChallengeMsg(null);
    setPlSelectedOpt(null);
    setProgress((p) => ({
      ...p,
      practicaLibreVisits: p.practicaLibreVisits.includes(faseId)
        ? p.practicaLibreVisits
        : [...p.practicaLibreVisits, faseId],
    }));
  };

  const completePlDesafio = (faseId: PracticaLibreFase["id"], ok: boolean) => {
    if (ok) {
      setProgress((p) => {
        const done = p.practicaLibreDone ?? [];
        const c = p.plCounters ?? { situacion: 1, correctas: 0, reintentos: 0 };
        const already = done.includes(faseId);
        return {
          ...p,
          practicaLibreDone: already ? done : [...done, faseId],
          practicaLibreVisits: p.practicaLibreVisits.includes(faseId)
            ? p.practicaLibreVisits
            : [...p.practicaLibreVisits, faseId],
          plCounters: {
            ...c,
            correctas: already ? c.correctas : c.correctas + 1,
            situacion: c.situacion,
          },
        };
      });
      setPlChallengeMsg(
        plDoneCount + (plDone.includes(faseId) ? 0 : 1) >= plDesafios.length
          ? `¡Desafíos PL ${plDesafios.length}/${plDesafios.length} completados! (formativo, sin nota)`
          : "Desafío completado. Sigue con la siguiente fase.",
      );
      setPlSelectedOpt(null);
    } else {
      setProgress((p) => {
        const c = p.plCounters ?? { situacion: 1, correctas: 0, reintentos: 0 };
        return { ...p, plCounters: { ...c, reintentos: c.reintentos + 1 } };
      });
      setPlChallengeMsg("No conforme. Reintenta sin penalización (PL formativo).");
    }
  };

  const onStudentChange = (id: string) => {
    setStudentId(id);
    const name = CLIM_COHORT.find((s) => s.id === id)?.nombre ?? null;
    setStudentName(name);
    try {
      localStorage.setItem(CLIM_STUDENT_LS_KEY, id);
      if (name) localStorage.setItem(CLIM_STUDENT_NAME_LS_KEY, name);
    } catch {
      /* ignore */
    }
  };

  const onAuthSessionChange = (student: ClimSessionStudent | null) => {
    if (student) {
      setStudentId(student.id);
      setStudentName(student.name);
    } else {
      setStudentName(null);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--aula-bg)] text-[var(--aula-text-muted)]">
        Cargando módulo…
      </div>
    );
  }

  const estadoBadge = current.esEvaluacionFormal
    ? "Evaluación formal"
    : isDone
      ? "Completada"
      : "En curso";

  return (
    <div
      className={`relative min-h-screen bg-[var(--aula-bg)] text-[var(--aula-text)] ${a11yClassNames(a11y)}`}
    >
      {/* Hero header */}
      <header
        className="aula-header-hero sticky top-0 z-30 shadow-md"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(20,144,199,0.98) 0%, rgba(47,172,216,0.93) 56%, rgba(100,197,230,0.78) 100%), url('/images/climatizacion/climatizacion-module-header-bg-v1.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="aula-header-top mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/curso/climatizacion" className="aula-header-brand mr-2 hidden sm:inline-flex" aria-label="Aula TP Chile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/climatizacion/aula-tp-chile-logo-corporativo.jpg" alt="" className="aula-header-brand-logo h-9 w-9 rounded-lg border border-[var(--aula-line)] bg-white object-contain p-0.5 shadow-sm" />
          </Link>
          <Link
            href={meta.portalDocenteHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-white hover:underline"
          >
            <span aria-hidden>←</span>
            <span>Volver al curso</span>
          </Link>
          <span className="hidden text-white/40 sm:inline">|</span>
          <div className="aula-header-course min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {meta.oa}
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Módulo {meta.moduloNumero}
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {estadoBadge}
              </span>
              {current.aeCodigos.slice(0, 2).map((ae) => (
                <span
                  key={ae}
                  className="rounded-full bg-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                >
                  {ae}
                </span>
              ))}
            </div>
            <p className="aula-header-specialty">◇ Aula TP Chile</p>
            <h1 className="mt-1 truncate text-sm font-bold text-white sm:text-base">
              {meta.especialidad}
            </h1>
            <p className="aula-header-module-title">
              Módulo {meta.moduloNumero} · {meta.nombre}
            </p>
            <p className="aula-header-course-copy truncate text-[11px] text-white/75">
              {meta.oaTexto ?? `${formatHoras(meta.horasAulaTp)} h Aula TP · Eval. ${meta.horasEvaluacionFinal} h`}
            </p>
          </div>
          {meta.heroMediaUrl ? (
            <div className="aula-header-media hidden h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-white/25 bg-white/10 sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={meta.heroMediaUrl}
                alt={meta.heroMediaAlt ?? meta.nombre}
                className="h-full w-full object-cover opacity-90"
              />
            </div>
          ) : null}
          <ClimStudentAuth
            studentId={studentId}
            studentName={studentName ?? undefined}
            cohort={CLIM_COHORT}
            onSessionChange={onAuthSessionChange}
            onDemoPick={onStudentChange}
            compact
          />
        </div>
        <div className="aula-header-progress mx-auto max-w-7xl px-4 pb-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="aula-progress-track h-2.5 flex-1 overflow-hidden rounded-full"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso del módulo"
            >
              <div
                className="aula-progress-fill h-full rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="whitespace-nowrap text-xs font-semibold text-white/90">
              {completedCount}/{total} · {pct}%
            </span>
            <div className="ml-1 flex shrink-0 overflow-hidden rounded-full border border-white/30 bg-white/10 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setViewMode("mapa");
                  if (typeof window !== "undefined") {
                    window.history.replaceState(null, "", routeBase);
                  }
                }}
                className={`px-2.5 py-1 ${
                  viewMode === "mapa"
                    ? "bg-white text-[var(--aula-navy)]"
                    : "text-white/90 hover:bg-white/15"
                }`}
                aria-pressed={viewMode === "mapa"}
              >
                Ruta
              </button>
              <button
                type="button"
                onClick={() => setViewMode("estacion")}
                className={`px-2.5 py-1 ${
                  viewMode === "estacion"
                    ? "bg-white text-[var(--aula-navy)]"
                    : "text-white/90 hover:bg-white/15"
                }`}
                aria-pressed={viewMode === "estacion"}
              >
                Estación
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <CourseStatsCard
          modules={`${meta.moduloNumero} de 8`}
          hoursAnnual={`${HORAS_AULA_TP_POR_MODULO[meta.moduloNumero]?.oficiales ?? meta.horasAulaTp} h`}
          hours3d={`${HORAS_AULA_TP_POR_MODULO[meta.moduloNumero]?.aulaTp ?? meta.horasAulaTp} h`}
          status={isDone ? "Completado" : "En curso"}
          label={`Resumen del módulo ${meta.moduloNumero}`}
        />
      </div>

      {deepLinkBanner ? (
        <div
          role="status"
          className="mx-auto flex max-w-7xl items-start justify-between gap-3 px-4 pt-3 sm:px-6"
        >
          <div className="flex-1 rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-sm text-sky-950 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wide text-sky-800">
              Acceso demo
            </p>
            <p className="mt-0.5 leading-relaxed">{deepLinkBanner}</p>
          </div>
          <button
            type="button"
            onClick={() => setDeepLinkBanner(null)}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-sky-800 hover:bg-sky-100"
            aria-label="Cerrar aviso de acceso demo"
          >
            Cerrar
          </button>
        </div>
      ) : null}

      {viewMode === "mapa" ? (
        <main className="aula-module-overview aula-module-overview--guide mx-auto max-w-[1580px] px-4 py-4 sm:px-6">
          <div className="aula-module-overview-main">
            <section className="aula-map-hero" aria-labelledby="map-hero-title">
              <div className="aula-map-hero__copy">
                <p className="aula-map-hero__eyebrow">Aula TP · Refrigeración y Climatización</p>
                <h2 id="map-hero-title">{meta.especialidad}</h2>
                <p className="aula-map-hero__module">
                  Módulo {meta.moduloNumero} · {meta.nombre}
                </p>
                <p className="aula-map-hero__station">
                  <span aria-hidden>★</span>
                  Estación {current.orden + 1} de {total} · {shortTitle(current.titulo)}
                </p>
                <div className="aula-map-hero__progress">
                  <div
                    className="aula-map-hero__bar"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progreso del módulo"
                  >
                    <i style={{ width: `${pct}%` }} />
                  </div>
                  <span>
                    {completedCount} de {total} estaciones ({pct}%)
                  </span>
                </div>
              </div>
              <div className="aula-map-hero__visual" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CASE_IMAGES[meta.moduloNumero]?.src ?? meta.heroMediaUrl ?? "/images/climatizacion/caso-m3-vivienda-valparaiso.png"}
                  alt=""
                />
                <p>Aprende · Haz · Practica · Avanza</p>
              </div>
            </section>

            <StationRail
              items={estaciones.map((estacion, index) =>
                railItemFromEstacion(estacion, {
                  index,
                  done: progress.completedIds.includes(estacion.id),
                  active: estacion.id === current.id,
                  open: isStationOpen(estacion, progress.completedIds),
                }),
              )}
              onSelect={(id) => {
                const next = estaciones.find((e) => e.id === id);
                if (next) goTo(next);
              }}
            />

            <section className="aula-overview-card aula-station-details" aria-labelledby="station-details-heading">
              <h2 id="station-details-heading">
                <span aria-hidden>▤</span> Detalles de la estación
              </h2>
              <dl className="aula-station-details-grid">
                <div>
                  <dt>
                    <span aria-hidden>①</span> Estación
                  </dt>
                  <dd>
                    {current.orden + 1}. {shortTitle(current.titulo)}
                  </dd>
                </div>
                <div>
                  <dt>
                    <span aria-hidden>◎</span> Tipo de actividad
                  </dt>
                  <dd>{FASE_LABELS[current.fase]}</dd>
                </div>
                <div>
                  <dt>
                    <span aria-hidden>☆</span> Objetivo / OA
                  </dt>
                  <dd>{meta.oaTexto ?? meta.oa}</dd>
                </div>
                <div>
                  <dt>
                    <span aria-hidden>◷</span> Duración estimada
                  </dt>
                  <dd>{current.horas} h de estación</dd>
                </div>
                <div>
                  <dt>
                    <span aria-hidden>✦</span> Aprendizajes esperados
                  </dt>
                  <dd>{current.aeCodigos.length ? current.aeCodigos.join(", ") : "Según ruta del módulo"}</dd>
                </div>
                <div>
                  <dt>
                    <span aria-hidden>✓</span> Estado
                  </dt>
                  <dd>
                    <span className={`aula-status-pill is-${progress.completedIds.includes(current.id) ? "done" : "live"}`}>
                      {estadoBadge}
                    </span>
                  </dd>
                </div>
              </dl>
            </section>

            <div className="aula-map-focus-row">
              <section className="aula-overview-card aula-map-learn" aria-labelledby="map-learn-heading">
                <h2 id="map-learn-heading">
                  <span aria-hidden>✓</span> ¿Qué aprenderás en esta estación?
                </h2>
                <ul>
                  <li>Comprender el escenario: {meta.casoDemo.titulo}</li>
                  <li>Orientarte con la pregunta pedagógica de la estación</li>
                  <li>Registrar evidencia mínima: {current.evidenciaMinima}</li>
                  {current.aeCodigos[0] ? <li>Avanzar el aprendizaje esperado {current.aeCodigos.join(" · ")}</li> : null}
                </ul>
              </section>
              <section className="aula-overview-card aula-map-concepts" aria-labelledby="map-concepts-heading">
                <h2 id="map-concepts-heading">
                  <span aria-hidden>💡</span> Conceptos clave de esta estación
                </h2>
                <p className="aula-map-concepts__q">{current.preguntaPedagogica}</p>
                <p className="aula-map-concepts__body">{current.escenario}</p>
              </section>
            </div>

            <div className="aula-map-actions">
              <Link href="/curso/climatizacion" className="aula-map-actions__ghost">
                Volver al curso
              </Link>
              <button type="button" className="aula-map-actions__primary" onClick={() => goTo(nextOpenStation)}>
                {nextOpenStation.id === current.id
                  ? "Comenzar esta estación"
                  : `Continuar: ${shortTitle(nextOpenStation.titulo)}`}{" "}
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>

          <aside className="aula-overview-sidebar" aria-label="Panel del módulo">
            <div className="aula-map-quick" aria-label="Apoyos del módulo">
              <button type="button" className="aula-map-quick__btn is-pl" onClick={() => setPlOpen(true)}>
                <strong>Práctica libre</strong>
                <span>
                  Relacionada con {shortTitle(current.titulo)} · {plDoneCount}/{plDesafios.length}
                </span>
              </button>
              <button
                type="button"
                className="aula-map-quick__btn is-agent"
                onClick={() => window.dispatchEvent(new Event("aula-tp-open-tutor"))}
                disabled={agentDisabled}
              >
                <strong>Agente pedagógico</strong>
                <span>
                  {agentDisabled
                    ? "Deshabilitado en evaluación formal"
                    : `Sobre: ${shortTitle(current.titulo)}`}
                </span>
              </button>
              <button type="button" className="aula-map-quick__btn is-a11y" onClick={() => setA11yOpen(true)}>
                <strong>Accesibilidad</strong>
                <span>Texto, contraste y apoyo visual</span>
              </button>
            </div>

            <section className="aula-overview-card aula-module-information">
              <h2>
                <span aria-hidden>ⓘ</span> Información general
              </h2>
              <dl>
                <div>
                  <dt>
                    <span aria-hidden>◌</span> Especialidad
                  </dt>
                  <dd>{meta.especialidad}</dd>
                </div>
                <div>
                  <dt>
                    <span aria-hidden>▥</span> Nivel
                  </dt>
                  <dd>3° y 4° medio TP</dd>
                </div>
                <div>
                  <dt>
                    <span aria-hidden>◷</span> Período
                  </dt>
                  <dd>Ruta del módulo</dd>
                </div>
                <div>
                  <dt>
                    <span aria-hidden>▤</span> Programa
                  </dt>
                  <dd>Aula TP Chile</dd>
                </div>
                <div>
                  <dt>
                    <span className="aula-progress-ring" style={{ "--progress": `${pct * 3.6}deg` } as CSSProperties} aria-hidden />{" "}
                    Progreso general
                  </dt>
                  <dd>{pct}%</dd>
                </div>
              </dl>
              <div className="aula-module-progress-summary">
                <strong>{pct}%</strong>
                <span>
                  <i style={{ width: `${pct}%` }} />
                </span>
                <b>
                  {completedCount} / {total}
                </b>
              </div>
            </section>

            <section className="aula-overview-card aula-module-current">
              <div>
                <span aria-hidden>▤</span>
                <p>Módulo actual</p>
                <strong>M{meta.moduloNumero}</strong>
              </div>
              <div>
                <span aria-hidden>⚑</span>
                <p>Estación</p>
                <strong>
                  {current.orden + 1}/{total}
                </strong>
              </div>
              <div>
                <span aria-hidden>☆</span>
                <p>AE activo</p>
                <strong>{selectedAe ?? "—"}</strong>
              </div>
              <div>
                <span aria-hidden>✓</span>
                <p>Estado</p>
                <strong>{estadoBadge}</strong>
              </div>
            </section>

            <section className="aula-overview-card aula-map-help">
              <h2>
                <span aria-hidden>💬</span> ¿Necesitas ayuda?
              </h2>
              <p>El agente pedagógico te orienta sin entregar la respuesta final.</p>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("aula-tp-open-tutor"))}
                disabled={agentDisabled}
              >
                Abrir agente pedagógico
              </button>
            </section>
          </aside>
        </main>
      ) : null}

      {viewMode === "estacion" ? (
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[240px_1fr_300px] sm:px-6">
        {/* Left nav — numbered circular stations */}
        <nav className="aula-card aula-shell-nav p-3" aria-label="Ruta obligatoria">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--aula-text-muted)]">
              Ruta obligatoria
            </p>
            <button
              type="button"
              onClick={() => {
                setViewMode("mapa");
                if (typeof window !== "undefined") {
                  window.history.replaceState(null, "", routeBase);
                }
              }}
              className="rounded-full border border-[var(--aula-line)] bg-[var(--aula-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--aula-blue)] hover:border-[var(--aula-blue)]"
            >
              Ver mapa
            </button>
          </div>
          <ul className="space-y-3">
            {Array.from(faseGroups.entries()).map(([fase, list]) => (
              <li key={fase}>
                <p
                  className={`mb-1 px-1 text-[10px] font-bold uppercase tracking-wide ${
                    fase === "evaluacion_final"
                      ? "text-amber-700"
                      : "text-[var(--aula-text-muted)]"
                  }`}
                >
                  {FASE_LABELS[fase]}
                  {fase === "evaluacion_final" ? " · sin tutor" : ""}
                </p>
                <ul className="space-y-1">
                  {list.map((e) => {
                    const open = isStationOpen(e, progress.completedIds);
                    const done = progress.completedIds.includes(e.id);
                    const active = e.id === current.id;
                    const eEtapa = mapHabilidadToEtapa(e.habilidad);
                    const accent = ETAPA_ACCENT[eEtapa];
                    return (
                      <li key={e.id}>
                        <button
                          type="button"
                          disabled={!open}
                          onClick={() => goTo(e)}
                          className={`flex w-full items-start gap-2 rounded-xl px-2 py-1.5 text-left text-xs transition ${
                            active
                              ? `bg-[var(--aula-bg)] font-semibold text-[var(--aula-text)] ring-1 ${accent.ring}`
                              : open
                                ? "text-[var(--aula-text)] hover:bg-[var(--aula-bg)]"
                                : "cursor-not-allowed text-[var(--aula-text-muted)] opacity-50"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                              done
                                ? "bg-emerald-500"
                                : open
                                  ? accent.bg
                                  : "bg-slate-300"
                            }`}
                            aria-hidden
                          >
                            {done ? "✓" : e.esEvaluacionFormal ? "🔒" : e.orden + 1}
                          </span>
                          <span>
                            <span className="block leading-snug">
                              {shortTitle(e.titulo)}
                            </span>
                            <span className={`text-[10px] font-medium ${accent.text}`}>
                              {ETAPA_LABELS[eEtapa]} · {formatHoras(e.horas)} h
                              {e.aeCodigos.length
                                ? ` · ${e.aeCodigos.slice(0, 2).join(", ")}`
                                : ""}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content card */}
        <main className="aula-card aula-shell-main p-5 sm:p-6">
          {!unlocked ? (
            <p className="text-sm text-[var(--aula-text-muted)]">
              Estación bloqueada.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--aula-text-muted)]">
                    {meta.oa} → M{meta.moduloNumero} →{" "}
                    <span className={etapaAccent.text}>
                      {ETAPA_LABELS[etapa]}
                    </span>{" "}
                    → estación
                    {current.aeCodigos.length
                      ? ` · ${current.aeCodigos.join(", ")}`
                      : ""}
                    {current.ceCodigos.length
                      ? ` · ${current.ceCodigos.join(", ")}`
                      : ""}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[var(--aula-text)]">
                    {current.titulo}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-[var(--aula-text-muted)]">
                    Etapa: {ETAPA_LABELS[etapa]} · habilidad {current.habilidad}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    current.esEvaluacionFormal
                      ? "bg-amber-100 text-amber-950"
                      : isDone
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-[var(--aula-bg)] text-[var(--aula-text)] ring-1 ring-[var(--aula-line)]"
                  }`}
                >
                  {current.esEvaluacionFormal
                    ? "Fase formal · 2 h"
                    : isDone
                      ? "Completada"
                      : `${formatHoras(current.horas)} h`}
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-[var(--aula-line)] bg-[var(--aula-bg)]">
                {CASE_IMAGES[meta.moduloNumero] ? (
                  <img
                    src={CASE_IMAGES[meta.moduloNumero].src}
                    alt={CASE_IMAGES[meta.moduloNumero].alt}
                    className="h-40 w-full object-cover sm:h-48"
                  />
                ) : null}
                <div className="p-4">
                  <p className="text-xs font-bold uppercase text-[var(--aula-text-muted)]">
                    Caso · {meta.casoDemo.titulo}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--aula-text)]">
                    {current.escenario}
                  </p>
                </div>
              </div>

              {current.mediaUrl || current.mediaDemoMp4 || current.mediaDemoGif || current.mediaNarratedMp4 || current.mediaModelUrl ? (
                <figure className="aula-shell-media mt-4 overflow-hidden rounded-xl border border-[var(--aula-line)] bg-white">
                  {current.mediaModelUrl && current.hotspots && current.hotspots.length > 0 ? (
                    <div className="p-2 sm:p-3">
                      <CondensadoraViewer
                        modelUrl={current.mediaModelUrl}
                        hotspots={current.hotspots}
                        selectedOptionIds={selected}
                        disabled={isDone && !!current.esEvaluacionFormal}
                        onHotspotClick={(optionId, label) => {
                          const opt = current.opciones.find((o) => o.id === optionId);
                          const already = selected.includes(optionId);
                          if (!already) toggleOption(optionId);
                          if (opt && !opt.correcta) {
                            setFeedback(
                              `No conforme. ${opt.detalle || "Selección sin evidencia suficiente para esta zona."}`,
                            );
                            setSuccessFeedback(null);
                            if (already) toggleOption(optionId);
                          } else if (opt?.correcta) {
                            setFeedback(null);
                            setSuccessFeedback(
                              already ? "Ya marcado." : `Correcto: ${label}.`,
                            );
                          }
                        }}
                      />
                      {current.mediaModelCaption ? (
                        <p className="mt-2 text-center text-xs text-[var(--aula-text-muted)]">
                          {current.mediaModelCaption}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {current.mediaUrl ? (
                    <>
                      <ZoomableImage
                        src={current.mediaUrl}
                        alt={current.mediaAlt ?? current.titulo}
                        maxHeightClass="max-h-[420px]"
                        className="mx-auto max-h-[420px] w-full object-contain"
                      >
                        {current.hotspots && current.hotspots.length > 0 ? (
                          <div
                            className="pointer-events-none absolute inset-0"
                            aria-hidden={false}
                          >
                            <p className="sr-only">
                              Zonas clicables sobre la imagen. También puedes usar la lista de opciones.
                            </p>
                            {current.hotspots.map((hs) => {
                              const opt = current.opciones.find(
                                (o) => o.id === hs.optionId,
                              );
                              const active = selected.includes(hs.optionId);
                              const size = Math.max(hs.r ?? 6, 5);
                              return (
                                <button
                                  key={hs.id}
                                  type="button"
                                  data-hotspot
                                  title={hs.label}
                                  aria-label={`Marcar hallazgo: ${hs.label}`}
                                  aria-pressed={active}
                                  disabled={
                                    isDone && !!current.esEvaluacionFormal
                                  }
                                  onClick={() => {
                                    const already = selected.includes(hs.optionId);
                                    // Varios hotspots pueden compartir optionId: el clic marca, no desmarca.
                                    // Para quitar la marca, usar la lista de opciones.
                                    if (!already) toggleOption(hs.optionId);
                                    if (opt && !opt.correcta) {
                                      setFeedback(
                                        opt.detalle
                                          ? `No conforme. ${opt.detalle}`
                                          : "No conforme. Esta zona no aporta evidencia válida.",
                                      );
                                      setSuccessFeedback(null);
                                      // permitir desmarcar distractor con segundo clic en el mismo punto
                                      if (already) toggleOption(hs.optionId);
                                    } else if (opt?.correcta) {
                                      setFeedback(null);
                                      setSuccessFeedback(
                                        already
                                          ? "Ya marcado."
                                          : `Correcto: ${hs.label}.`,
                                      );
                                    }
                                  }}
                                  className={`pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aula-blue)] focus-visible:ring-offset-2 ${
                                    active
                                      ? opt && !opt.correcta
                                        ? "border-rose-600 bg-rose-500/70"
                                        : "border-emerald-600 bg-emerald-500/70"
                                      : "border-white bg-[var(--aula-blue)]/55 hover:bg-[var(--aula-blue)]/80 animate-pulse"
                                  } ${a11y.reducirMovimiento ? "!animate-none" : ""}`}
                                  style={{
                                    left: `${hs.x}%`,
                                    top: `${hs.y}%`,
                                    width: `${size}%`,
                                    height: "auto",
                                    aspectRatio: "1 / 1",
                                    minWidth: 28,
                                    minHeight: 28,
                                  }}
                                >
                                  <span className="sr-only">{hs.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </ZoomableImage>
                      {current.hotspots && current.hotspots.length > 0 ? (
                        <p className="border-t border-[var(--aula-line)] bg-[var(--aula-blue)]/5 px-3 py-2 text-xs font-medium text-[var(--aula-blue)]">
                          Inspección interactiva: toca los puntos en la imagen
                          para etiquetar anomalías ({selected.filter((id) =>
                            current.hotspots?.some((h) => h.optionId === id),
                          ).length}
                          /{current.hotspots.length} zonas tocadas).
                        </p>
                      ) : null}
                      {(current.mediaCaption || a11y.visualSimple) ? (
                        <figcaption
                          className={`border-t border-[var(--aula-line)] px-3 py-2 text-xs leading-relaxed text-[var(--aula-text-muted)] ${
                            a11y.visualSimple
                              ? "bg-[var(--aula-bg)] font-medium text-[var(--aula-text)]"
                              : "bg-[var(--aula-bg)]/60"
                          }`}
                        >
                          {a11y.visualSimple && current.mediaCaption
                            ? `Imagen de apoyo: ${current.mediaCaption}`
                            : current.mediaCaption ??
                              (a11y.visualSimple
                                ? `Imagen de apoyo: ${current.mediaAlt ?? current.titulo}`
                                : null)}
                        </figcaption>
                      ) : null}
                    </>
                  ) : null}
                  {current.mediaDemoMp4 || current.mediaDemoGif ? (
                    <div className="border-t border-[var(--aula-line)] bg-[var(--aula-bg)]/40 p-3">
                      {current.mediaDemoMp4 ? (
                        <video
                          className="mx-auto max-h-[240px] w-full rounded-lg object-contain"
                          autoPlay
                          loop
                          muted
                          playsInline
                          poster={current.mediaUrl}
                          aria-label="Secuencia pedagógica: observar → detectar → registrar"
                        >
                          <source src={current.mediaDemoMp4} type="video/mp4" />
                          {current.mediaDemoGif ? (
                            <ZoomableImage
                              src={current.mediaDemoGif}
                              alt="Secuencia pedagógica: observar → detectar → registrar"
                              maxHeightClass="max-h-[240px]"
                              className="mx-auto max-h-[240px] w-full object-contain"
                            />
                          ) : null}
                        </video>
                      ) : current.mediaDemoGif ? (
                        <ZoomableImage
                          src={current.mediaDemoGif}
                          alt="Secuencia pedagógica: observar → detectar → registrar"
                          maxHeightClass="max-h-[240px]"
                          className="mx-auto max-h-[240px] w-full rounded-lg object-contain"
                        />
                      ) : null}
                      <p className="mt-2 text-center text-[11px] font-medium text-[var(--aula-text-muted)]">
                        Secuencia pedagógica: observar → detectar → registrar
                      </p>
                    </div>
                  ) : null}
                  {current.mediaNarratedMp4 ? (
                    <div className="border-t border-[var(--aula-line)] bg-[var(--aula-bg)]/40 p-3">
                      <p className="mb-2 text-xs font-semibold text-[var(--aula-text)]">
                        {current.mediaNarratedTitle ?? "Video con narración"}
                      </p>
                      <video
                        className="mx-auto max-h-[280px] w-full rounded-lg object-contain"
                        controls
                        playsInline
                        preload="metadata"
                        poster={current.mediaUrl}
                        aria-label={current.mediaNarratedTitle ?? "Video con narración pedagógica"}
                      >
                        <source src={current.mediaNarratedMp4} type="video/mp4" />
                      </video>
                      <p className="mt-2 text-center text-[11px] text-[var(--aula-text-muted)]">
                        Usa auriculares si estás en sala. La narración guía la inspección antes de medir.
                      </p>
                    </div>
                  ) : null}
                </figure>
              ) : null}

              <p className="mt-4 text-sm font-semibold text-[var(--aula-text)]">
                {current.preguntaPedagogica}
              </p>
              <p className="mt-1 text-xs text-[var(--aula-text-muted)]">
                Evidencia mínima: {current.evidenciaMinima}
              </p>

              {current.esEvaluacionFormal ? (
                <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                  <p className="font-bold">Tutor Aula TP deshabilitado (evaluación formal)</p>
                  <p className="mt-1 text-xs leading-relaxed">{evalBanner}</p>
                </div>
              ) : null}

              {current.interaccion === cierreInteraccion ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {cierreCards.map((card) => (
                    <div
                      key={card.key}
                      className="rounded-xl border border-[var(--aula-line)] bg-white p-3"
                    >
                      <p className="text-xs font-bold text-[var(--aula-text)]">
                        {card.label}
                      </p>
                      <div className="mt-2 h-2 rounded-full bg-[var(--aula-line)]">
                        <div
                          className={`h-2 rounded-full ${cierreBarClass}`}
                          style={{ width: card.width ?? "80%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--aula-line)] bg-white px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--aula-blue)]">
                  {questionMethod.label}
                </span>
                <span className="text-[11px] text-[var(--aula-text-muted)]">
                  {questionMethod.description}
                </span>
              </div>
              <fieldset className="mt-3 space-y-2">
                <legend className="sr-only">Opciones de la estación</legend>
                {current.opciones.map((opt) => {
                  const checked = selected.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={`aula-shell-station-option flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                        checked
                          ? "border-[var(--aula-blue)] bg-[var(--aula-bg)]"
                          : "border-[var(--aula-line)] bg-white hover:border-[var(--aula-blue)]/40"
                      }`}
                    >
                      <input
                        type={questionMode === "single" ? "radio" : "checkbox"}
                        className="mt-1 h-4 w-4 rounded border-[var(--aula-line)] text-[var(--aula-blue)] focus:ring-[var(--aula-blue)]"
                        name={questionMode === "single" ? `station-${current.id}` : undefined}
                        checked={checked}
                        onChange={() => selectQuestionOption(opt.id)}
                        disabled={isDone && !!current.esEvaluacionFormal}
                      />
                      <span>
                        <span className="font-medium text-[var(--aula-text)]">
                          {opt.label}
                        </span>
                        {opt.familia ? (
                          <span className="ml-2 rounded bg-[var(--aula-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--aula-text-muted)]">
                            {familiaLabels[opt.familia] ?? opt.familia}
                          </span>
                        ) : null}
                        {opt.detalle && checked ? (
                          <span className="mt-1 block text-xs text-[var(--aula-text-muted)]">
                            {opt.detalle}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </fieldset>

              {feedback ? (
                <div
                  role="alert"
                  className="aula-shell-feedback-warn mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                    Retroalimentación
                  </p>
                  <p className="mt-0.5 leading-relaxed">{feedback}</p>
                </div>
              ) : null}

              {successFeedback ? (
                <div
                  role="status"
                  className="aula-shell-feedback-ok mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-950"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                    Avance registrado
                  </p>
                  <p className="mt-0.5 leading-relaxed">{successFeedback}</p>
                </div>
              ) : null}

              {current.errorUtil && !isDone ? (
                <p className="mt-3 text-xs italic text-[var(--aula-text-muted)]">
                  Error útil a evitar: {current.errorUtil}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {!isDone ? (
                  <button
                    type="button"
                    onClick={completeCurrent}
                    className="aula-btn-primary inline-flex items-center justify-center px-5 py-2.5 text-sm shadow-sm"
                  >
                    {current.ctaCompletar}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    className="aula-btn-primary inline-flex items-center justify-center px-5 py-2.5 text-sm shadow-sm"
                  >
                    {current.ctaSiguiente}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPlOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
                >
                  Práctica libre
                  <span className="rounded-full bg-emerald-200/80 px-1.5 py-0.5 text-[10px]">
                    {plDoneCount}/{plDesafios.length}
                  </span>
                </button>
                {isDone ? (
                  <span className="text-xs font-semibold text-emerald-700">
                    Evidencia registrada
                  </span>
                ) : (
                  <span className="text-xs text-[var(--aula-text-muted)]">
                    Un CTA primario · sin timer punitivo
                    {a11y.masTiempo ? " · más tiempo activo" : ""}
                  </span>
                )}
              </div>
            </>
          )}
        </main>

        {/* Sidebar: evidencias del caso (Tutor vive en widget flotante) */}
        <aside className="aula-card aula-shell-aside p-4">
          <h3 className="text-sm font-bold text-[var(--aula-text)]">
            Evidencias del caso
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--aula-text-muted)]">
            Contrasta plano, norma y bitácora. Usa el hub de <strong>Apoyos</strong> (abajo a la derecha) para práctica libre, agente pedagógico y accesibilidad.
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-[var(--aula-text-muted)]">
              {evidencias.map((ev) => (
                <li key={ev} className="flex gap-1.5">
                  <span className="text-[var(--aula-blue)]" aria-hidden>•</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          {agentDisabled ? (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
              <p className="font-bold">Evaluación formal</p>
              <p className="mt-1">Tutor deshabilitado. Fundamenta solo con evidencias del caso.</p>
            </div>
          ) : null}
        </aside>
      </div>
      ) : null}

      {/* Práctica libre drawer */}
      {plOpen ? (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-[var(--aula-navy)]/40"
          role="dialog"
          aria-modal="true"
          aria-label="Práctica libre"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Cerrar práctica libre"
            onClick={() => setPlOpen(false)}
          />
          <div className="aula-shell-drawer relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                <h2 className="text-base font-bold text-emerald-950">
                  Práctica libre · M{meta.moduloNumero}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPlOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-3 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-950">
                <p className="font-extrabold uppercase tracking-wide text-emerald-800">
                  Contextualizado a lo que ves ahora
                </p>
                <p className="mt-1 font-semibold">
                  {current.titulo}
                  {current.aeCodigos?.length ? ` · ${current.aeCodigos.join(" · ")}` : ""}
                </p>
                <p className="mt-1 leading-relaxed text-emerald-900/80">{current.preguntaPedagogica}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800">
                  Recorrido formativo independiente
                </p>
                <h3 className="mt-1 text-lg font-bold text-emerald-950">
                  Explora, decide y comprueba
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-emerald-900/80">
                  Avanza fase por fase sin alterar el % de la ruta obligatoria. Relaciona cada desafío con la estación actual: {shortTitle(current.titulo)}.
                </p>
                <ol className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold text-emerald-950 sm:grid-cols-4">
                  {["Lee la situación", "Elige una opción", "Comprueba", "Registra el logro"].map(
                    (step, index) => (
                      <li key={step} className="rounded-xl bg-white/75 px-2 py-2">
                        <span className="mr-1 text-emerald-600">{index + 1}.</span>
                        {step}
                      </li>
                    ),
                  )}
                </ol>
              </div>
              <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3 text-xs font-bold text-emerald-950">
                  <span>Avance de Práctica Libre</span>
                  <span>{plDoneCount}/{plDesafios.length} desafíos</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100" role="progressbar" aria-valuenow={plDoneCount} aria-valuemin={0} aria-valuemax={plDesafios.length} aria-label="Avance de Práctica Libre">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round((plDoneCount / Math.max(plDesafios.length, 1)) * 100)}%` }} />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-emerald-800">
                  Este avance es formativo: no modifica la ruta obligatoria ni la calificación.
                </p>
                {plDoneCount >= plDesafios.length ? (
                  <p className="mt-2 rounded-lg bg-emerald-100 px-2 py-1.5 text-xs font-bold text-emerald-900">
                    ✓ Práctica Libre completada. Puedes volver a cualquier fase para repasar.
                  </p>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                  <p className="text-[10px] font-bold uppercase text-emerald-800">
                    Situación
                  </p>
                  <p className="text-lg font-bold text-emerald-950">
                    {plCounters.situacion}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                  <p className="text-[10px] font-bold uppercase text-emerald-800">
                    Correctas
                  </p>
                  <p className="text-lg font-bold text-emerald-950">
                    {plCounters.correctas}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                  <p className="text-[10px] font-bold uppercase text-emerald-800">
                    Reintentos
                  </p>
                  <p className="text-lg font-bold text-emerald-950">
                    {plCounters.reintentos}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-900">
                  Fase {activePlIndex + 1} de {practicaLibre.length}
                </p>
                <p className="text-[11px] text-emerald-800">
                  Selecciona una fase para comenzar
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {practicaLibre.map((f) => {
                  const done = plDone.includes(f.id);
                  return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => selectPlFase(f.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      plFase === f.id
                        ? "bg-emerald-500 text-white"
                        : done
                          ? "bg-emerald-200 text-emerald-950 ring-1 ring-emerald-400"
                          : "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                    }`}
                  >
                    {done ? "✓ " : `${practicaLibre.indexOf(f) + 1}. `}{f.titulo}
                  </button>
                  );
                })}
              </div>
              {(() => {
                const fase = practicaLibre.find((f) => f.id === plFase)!;
                const desafio = plDesafios.find((d) => d.faseId === plFase)!;
                const alreadyDone = plDone.includes(plFase);
                return (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                      <p className="text-xs font-bold uppercase text-emerald-800">
                        {fase.titulo}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--aula-text)]">
                        {fase.descripcion}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--aula-text)]">
                        {fase.actividad}
                      </p>
                    </div>
                    <div className="rounded-xl border-2 border-emerald-400 bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase text-emerald-800">
                        Desafío · {desafio.titulo}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--aula-text)]">
                        {desafio.prompt}
                      </p>
                      {desafio.opciones && desafio.opciones.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {desafio.opciones.map((op) => (
                            <button
                              key={op.id}
                              type="button"
                              disabled={alreadyDone}
                              onClick={() => setPlSelectedOpt(op.id)}
                              className={`flex w-full rounded-lg border px-3 py-2 text-left text-sm ${
                                plSelectedOpt === op.id
                                  ? "border-emerald-500 bg-emerald-50 font-semibold"
                                  : "border-slate-200 bg-slate-50"
                              } ${alreadyDone ? "opacity-60" : ""}`}
                            >
                              {op.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            disabled={alreadyDone || !plSelectedOpt}
                            onClick={() => {
                              const op = desafio.opciones!.find(
                                (o) => o.id === plSelectedOpt,
                              );
                              completePlDesafio(plFase, !!op?.correcta);
                            }}
                            className="mt-2 w-full rounded-full bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                          >
                            {alreadyDone ? "Desafío completado" : "Comprobar desafío"}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={alreadyDone}
                          onClick={() => completePlDesafio(plFase, true)}
                          className="mt-3 w-full rounded-full bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                        >
                          {alreadyDone ? "Desafío completado" : "Completar desafío"}
                        </button>
                      )}
                      {plChallengeMsg ? (
                        <p className="mt-3 text-xs font-semibold text-emerald-900">
                          {plChallengeMsg}
                        </p>
                      ) : null}
                      {alreadyDone && activePlIndex < practicaLibre.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => selectPlFase(practicaLibre[activePlIndex + 1].id)}
                          className="mt-3 w-full rounded-full bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                        >
                          Continuar con la fase {activePlIndex + 2} →
                        </button>
                      ) : null}
                    </div>
                    <p className="text-xs font-medium text-emerald-800">
                      Formativo · sin calificación · barra obligatoria intacta (
                      {pct}%)
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : null}

      {/* Accesibilidad panel */}
      {a11yOpen ? (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-[var(--aula-navy)]/40"
          role="dialog"
          aria-modal="true"
          aria-label="Accesibilidad"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Cerrar accesibilidad"
            onClick={() => setA11yOpen(false)}
          />
          <div className="aula-shell-drawer relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--aula-line)] bg-[var(--aula-bg)] px-4 py-3">
              <h2 className="text-base font-bold text-[var(--aula-text)]">
                Accesibilidad
              </h2>
              <button
                type="button"
                onClick={() => setA11yOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-[var(--aula-blue)] hover:bg-[var(--aula-bg)]"
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase text-[var(--aula-text-muted)]">
                  Perfiles
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["ninguno", "Sin perfil"],
                      ["lectura", "Lectura cómoda"],
                      ["baja", "Baja estimulación"],
                      ["apoyo", "Apoyo guiado"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setA11y((p) => ({
                          ...p,
                          perfil: id,
                          ...(id === "lectura"
                            ? { texto: "grande" as const }
                            : {}),
                          ...(id === "baja"
                            ? {
                                reducirMovimiento: true,
                                visualSimple: true,
                              }
                            : {}),
                          ...(id === "apoyo"
                            ? { masAyuda: true, masTiempo: true }
                            : {}),
                        }));
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        a11y.perfil === id
                          ? "bg-[var(--aula-blue)] text-white"
                          : "border border-[var(--aula-line)] text-[var(--aula-text)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[var(--aula-text-muted)]">
                  Tamaño de texto
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["normal", "Normal"],
                      ["grande", "Grande"],
                      ["muy_grande", "Muy grande"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setA11y((p) => ({ ...p, texto: id }))}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        a11y.texto === id
                          ? "bg-[var(--aula-teal)] text-white"
                          : "border border-[var(--aula-line)] text-[var(--aula-text)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {(
                  [
                    ["altoContraste", "Alto contraste"],
                    ["visualSimple", "Modo visual simple"],
                    ["reducirMovimiento", "Reducir movimiento"],
                    ["resaltarFoco", "Resaltar foco"],
                    ["masTiempo", "Más tiempo"],
                    ["masAyuda", "Más ayuda"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--aula-line)] px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={a11y[key]}
                      onChange={(e) =>
                        setA11y((p) => ({ ...p, [key]: e.target.checked }))
                      }
                      className="h-4 w-4 rounded text-[var(--aula-blue)]"
                    />
                    <span className="text-xs font-semibold text-[var(--aula-text)]">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setA11y(DEFAULT_A11Y)}
                className="aula-btn-secondary px-4 py-2 text-xs"
              >
                Restablecer preferencias
              </button>
              <p className="text-[10px] text-[var(--aula-text-muted)]">
                Preferencias guardadas en este navegador (localStorage).
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <TutorFlotante
        hideFab
        disabled={agentDisabled}
        context={{
          moduloNumero: meta.moduloNumero,
          oa: meta.oa,
          aeCodigos: current.aeCodigos,
          etapa: ETAPA_LABELS[etapa],
          estacionTitulo: current.titulo,
          pregunta: current.preguntaPedagogica,
          evidenciaMinima: current.evidenciaMinima,
          casoTitulo: meta.casoDemo?.titulo,
          agentHints: agentHints.map((h) => ({
            nivel: h.nivel,
            pregunta: h.pregunta,
          })),
        }}
      />
      <SupportHub
        context={{
          moduleLabel: `M${meta.moduloNumero} · ${meta.nombre}`,
          stationTitle: current.titulo,
          topicPrompt: current.preguntaPedagogica,
          aeCodes: current.aeCodigos,
          stageLabel: ETAPA_LABELS[etapa],
          plDone: plDoneCount,
          plTotal: plDesafios.length,
          agentDisabled,
          agentDisabledReason: "Deshabilitado en evaluación formal",
        }}
        onOpenPractice={() => setPlOpen(true)}
        onOpenAgent={() => window.dispatchEvent(new Event("aula-tp-open-tutor"))}
        onOpenAccessibility={() => setA11yOpen(true)}
      />
    </div>
  );
}
