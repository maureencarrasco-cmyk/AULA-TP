/**
 * Catálogo de cursos vivos conectados al Portal Docente.
 * Enfermería / Electricidad: métricas LMS vía API institucional.
 * Climatización: hub Next + LMS local (JSON) + cohorte seed 160.
 */

import {
  CLIMATIZACION_META,
  MODULOS_CLIMATIZACION,
  OA_ESPECIALIDAD,
} from "@/lib/climatizacion-curso";
import { ESTUDIANTES } from "@/lib/demo-data";

export type MetricsKind = "enfermeria" | "electricidad" | "climatizacion" | "none";

export type PortalCursoColor = "teal" | "amber" | "sky" | "slate";

export type PortalCurso = {
  id: string;
  specialty: string;
  title: string;
  level: string;
  studentHref: string;
  metricsKind: MetricsKind;
  metricsApiPath?: string;
  color: PortalCursoColor;
  statusLabel: string;
  /** Visual del curso en Portal Docente (datos vivos). */
  imagePath: string;
};

export const PORTAL_CURSOS: PortalCurso[] = [
  {
    id: "enfermeria",
    specialty: "Atención de Enfermería",
    title: "Atención de Enfermería",
    level: "3° Medio",
    studentHref: "https://aulatpchile.cl/portal/simuladores/atencion_enfermeria/",
    metricsKind: "enfermeria",
    metricsApiPath: "/api/portal/metrics/enfermeria",
    color: "teal",
    statusLabel: "Curso vivo · LMS",
    imagePath: "/images/portal-docente/cursos/enfermeria.png",
  },
  {
    id: "electricidad",
    specialty: "Electricidad",
    title: "Electricidad 3° Medio",
    level: "3° Medio",
    studentHref: "https://aulatpchile.cl/portal/simuladores/electricidad_3_medio/",
    metricsKind: "electricidad",
    metricsApiPath: "/api/portal/metrics/electricidad",
    color: "amber",
    statusLabel: "Curso vivo · LMS",
    imagePath: "/images/portal-docente/cursos/electricidad.png",
  },
  {
    id: "climatizacion",
    specialty: "Refrigeración y Climatización",
    title: "Refrigeración y Climatización",
    level: "3°–4° Medio",
    studentHref: "https://aulatpchile.cl/curso/climatizacion",
    metricsKind: "climatizacion",
    metricsApiPath: "/api/portal/metrics/climatizacion",
    color: "sky",
    statusLabel: "Curso vivo · LMS",
    imagePath: "/images/portal-docente/cursos/climatizacion.png",
  },
  {
    id: "administracion",
    specialty: "Administración de Empresas",
    title: "Administración de Empresas",
    level: "3° Medio",
    studentHref: "https://aulatpchile.cl/curso/administracion",
    metricsKind: "none",
    color: "slate",
    statusLabel: "Curso vivo · ERP",
    imagePath: "/images/especialidades/sector-administracion.png",
  },
];

export type InstitutionalCourse = {
  id: string;
  kind: string;
  code: string;
  title: string;
  specialty: string;
  level: string;
  period?: string;
  program?: string;
  description?: string;
  status?: string;
};

export type InstitutionalModule = {
  id: string;
  sequence: number;
  code: string;
  oa_code?: string;
  title: string;
  short_title?: string;
  annual_hours?: number;
  hours_3d?: number;
  activity_count?: number;
  average_progress?: number;
  completed_enrollments?: number;
  in_progress_enrollments?: number;
  attempts?: number;
  average_score?: number;
};

export type InstitutionalTotals = {
  students: number;
  active_enrollments: number;
  completed_enrollments: number;
  average_progress: number;
  modules: number;
  annual_hours?: number;
  hours_3d?: number;
  activities?: number;
  activity_completion?: number;
  attempts?: number;
  completed_attempts?: number;
  average_score?: number;
  total_duration_seconds?: number;
  learning_events?: number;
  integrator_total?: number;
  integrator_completed?: number;
  integrator_average_progress?: number;
};

export type InstitutionalStudentRow = {
  id: string;
  name: string;
  curso: string;
  overallPct: number;
  modules?: Record<string, number>;
};

export type InstitutionalMetrics = {
  course: InstitutionalCourse;
  totals: InstitutionalTotals;
  modules: InstitutionalModule[];
  /** Per-student live pct (Climatización LMS); optional for other courses. */
  students?: InstitutionalStudentRow[];
  source: "live" | "static";
  fetchedAt: string;
};

/** Resumen estático para Climatización (cohorte demo sintética, sin API LMS). */
export function buildClimatizacionStaticMetrics(): InstitutionalMetrics {
  const clim = ESTUDIANTES.filter((e) => /clim/i.test(e.curso));
  const students = clim.length;
  const average_progress = students
    ? Math.round(
        (clim.reduce((acc, e) => acc + e.avancePct, 0) / students) * 10,
      ) / 10
    : 0;
  const completed = clim.filter((e) => e.avancePct >= 85).length;
  const avgByModulo = average_progress;

  return {
    course: {
      id: "climatizacion-hub",
      kind: "climatizacion",
      code: "RC-34M",
      title: CLIMATIZACION_META.especialidad,
      specialty: CLIMATIZACION_META.especialidad,
      level: "3°–4° Medio",
      period: "Anual",
      program: "Diferenciado Técnico Profesional",
      description: `Hub Aula TP con ${MODULOS_CLIMATIZACION.length} módulos (${CLIMATIZACION_META.horasTotales} h programa). Cohorte demo ${students} estudiantes (avance simulado alineado a OA/AE).`,
      status: "publicado",
    },
    totals: {
      students,
      active_enrollments: students,
      completed_enrollments: completed,
      average_progress,
      modules: MODULOS_CLIMATIZACION.length,
      annual_hours: CLIMATIZACION_META.horasTotales,
      activities: MODULOS_CLIMATIZACION.reduce(
        (acc, m) => acc + (m.estaciones?.length ?? 0),
        0,
      ),
      activity_completion: average_progress,
      integrator_total: students,
      integrator_completed: completed,
      integrator_average_progress: average_progress,
    },
    modules: MODULOS_CLIMATIZACION.map((m) => ({
      id: m.id,
      sequence: m.numero,
      code: String(m.numero).padStart(2, "0"),
      oa_code: m.oaCodigos.join(" · "),
      title: m.nombre,
      short_title: m.nombre,
      annual_hours: m.horasOficiales,
      hours_3d: Math.round(m.horasAulaTp * 10) / 10,
      activity_count: m.estaciones?.length ?? 0,
      average_progress: avgByModulo,
      completed_enrollments: completed,
      in_progress_enrollments: Math.max(0, students - completed),
    })),
    source: "static",
    fetchedAt: new Date().toISOString(),
  };
}

export const CLIMATIZACION_OA_COUNT = OA_ESPECIALIDAD.length;

export const COLOR_CARD: Record<PortalCursoColor, string> = {
  teal: "border-teal-200 bg-teal-50/70",
  amber: "border-amber-200 bg-amber-50/70",
  sky: "border-sky-200 bg-sky-50/70",
  slate: "border-slate-200 bg-slate-50",
};

export const COLOR_ACCENT: Record<PortalCursoColor, string> = {
  teal: "text-teal-800",
  amber: "text-amber-900",
  sky: "text-sky-900",
  slate: "text-slate-800",
};
