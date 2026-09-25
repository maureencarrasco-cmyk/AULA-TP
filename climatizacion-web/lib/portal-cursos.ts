/**
 * Catálogo de cursos vivos conectados al Portal Docente.
 * Enfermería / Electricidad: métricas LMS vía API institucional.
 * Climatización: hub Next + LMS local (JSON).
 */

import { OA_ESPECIALIDAD } from "@/lib/climatizacion-curso";

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
  /** True when the portal is using clearly labelled synthetic data for preview. */
  demoData?: boolean;
  fetchedAt: string;
};

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
