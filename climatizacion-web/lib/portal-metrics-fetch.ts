import type { InstitutionalMetrics } from "@/lib/portal-cursos";

const DEFAULT_ENFERMERIA =
  process.env.COURSE_ENFERMERIA_METRICS_URL ??
  "http://course-app:8000/api/institutional/metrics";

const DEFAULT_ELECTRICIDAD =
  process.env.COURSE_ELECTRICIDAD_METRICS_URL ??
  "http://course-electricity-app:8000/api/institutional/metrics";

export const METRICS_URLS = {
  enfermeria: DEFAULT_ENFERMERIA,
  electricidad: DEFAULT_ELECTRICIDAD,
} as const;

export type MetricsCourseKey = keyof typeof METRICS_URLS;

export async function fetchInstitutionalMetrics(
  key: MetricsCourseKey,
  init?: RequestInit,
): Promise<InstitutionalMetrics> {
  const url = METRICS_URLS[key];
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    // Docker network; short timeout via AbortSignal when available
    signal: init?.signal ?? AbortSignal.timeout(12_000),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Upstream ${key} metrics returned HTTP ${res.status} from ${url}`,
    );
  }

  const data = (await res.json()) as Omit<
    InstitutionalMetrics,
    "source" | "fetchedAt"
  >;

  return {
    ...data,
    source: "live",
    fetchedAt: new Date().toISOString(),
  };
}
