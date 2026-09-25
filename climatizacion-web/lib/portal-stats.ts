/** Estadística pedagógica del Portal Docente (es-CL). */

import {
  CATALOGO_OA,
  especialidadFromCurso,
  type AeDemo,
  type EstudianteDemo,
  type OaDemo,
} from "@/lib/demo-data";

export type CriterioEvaluacionDemo = {
  codigo: string;
  descripcion: string;
};

export type BandaLogro = "logrado" | "medianamente_logrado" | "en_proceso" | "no_logrado";

export const BANDA_LOGRO_LABEL: Record<BandaLogro, string> = {
  logrado: "Logrado",
  medianamente_logrado: "Medianamente logrado",
  en_proceso: "En proceso",
  no_logrado: "No logrado",
};

export const BANDA_LOGRO_COLOR: Record<BandaLogro, string> = {
  logrado: "#08a85f",
  medianamente_logrado: "#c6d94e",
  en_proceso: "#e99300",
  no_logrado: "#e23b5c",
};

export function bandaFromPct(pct: number): BandaLogro {
  if (pct >= 85) return "logrado";
  if (pct >= 70) return "medianamente_logrado";
  if (pct >= 40) return "en_proceso";
  return "no_logrado";
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function media(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function mediana(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

export function moda(values: number[]): number | null {
  if (values.length === 0) return null;
  const buckets = new Map<number, number>();
  for (const v of values) {
    const key = Math.round(v);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  let best: number | null = null;
  let count = 0;
  for (const [value, n] of buckets) {
    if (n > count) {
      best = value;
      count = n;
    }
  }
  return best;
}

export type TendenciaCentral = {
  media: number;
  mediana: number;
  moda: number | null;
  n: number;
};

export function tendenciaCentral(values: number[]): TendenciaCentral {
  return {
    media: round1(media(values)),
    mediana: round1(mediana(values)),
    moda: moda(values),
    n: values.length,
  };
}

export const PERIODO_ANTERIOR_LABEL = "agosto 2026";

/** Porcentaje de logro % del periodo anterior registrado en la cohorte. */
export function pctPeriodoAnterior(estudiante: EstudianteDemo): number {
  return Math.max(0, Math.min(100, estudiante.avancePctPeriodoAnterior));
}

export function transitoAmarilloVerde(estudiante: EstudianteDemo): boolean {
  const prev = pctPeriodoAnterior(estudiante);
  return prev < 70 && prev >= 40 && estudiante.avancePct >= 70;
}

export function oaCriticoDe(estudiante: EstudianteDemo): string {
  const pendiente = estudiante.cobertura.find((c) => c.estado !== "logrado");
  if (!pendiente) return estudiante.ultimaActividad?.oaCodigo ?? "—";
  const ae = pendiente.ae.find((a) => a.estado !== "logrado");
  return ae ? `${pendiente.oaCodigo} / ${ae.aeCodigo}` : pendiente.oaCodigo;
}

export function criteriosDeEvaluacion(ae: AeDemo): CriterioEvaluacionDemo[] {
  return [
    {
      codigo: `${ae.codigo} · CE 1`,
      descripcion: `Ejecuta el procedimiento de ${ae.codigo} con evidencia observable y segura.`,
    },
    {
      codigo: `${ae.codigo} · CE 2`,
      descripcion: `Fundamenta la decisión de ${ae.codigo} con criterio técnico y normativa aplicable.`,
    },
  ];
}

export function estudiantesDeEspecialidad(
  estudiantes: EstudianteDemo[],
  especialidad: OaDemo["especialidad"] | "Todas",
): EstudianteDemo[] {
  if (especialidad === "Todas") return estudiantes;
  return estudiantes.filter((e) => especialidadFromCurso(e.curso) === especialidad);
}

export function pctLogroAe(
  estudiantes: EstudianteDemo[],
  oaCodigo: string,
  aeCodigo: string,
  especialidad?: OaDemo["especialidad"],
): { logrado: number; en_progreso: number; no_iniciado: number; total: number; pct: number } {
  let logrado = 0;
  let en_progreso = 0;
  let no_iniciado = 0;
  for (const e of estudiantes) {
    if (especialidad && especialidadFromCurso(e.curso) !== especialidad) continue;
    const oa = e.cobertura.find((c) => c.oaCodigo === oaCodigo);
    const ae = oa?.ae.find((a) => a.aeCodigo === aeCodigo);
    if (!ae) continue;
    if (ae.estado === "logrado") logrado += 1;
    else if (ae.estado === "en_progreso") en_progreso += 1;
    else no_iniciado += 1;
  }
  const total = logrado + en_progreso + no_iniciado;
  return {
    logrado,
    en_progreso,
    no_iniciado,
    total,
    pct: total === 0 ? 0 : Math.round((logrado / total) * 100),
  };
}

export function oaCodesForGroup(estudiantes: EstudianteDemo[]): string[] {
  const set = new Set<string>();
  for (const e of estudiantes) {
    for (const c of e.cobertura) set.add(c.oaCodigo);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

export function pctOaEstudiante(estudiante: EstudianteDemo, oaCodigo: string): number | null {
  const oa = estudiante.cobertura.find((c) => c.oaCodigo === oaCodigo);
  if (!oa || oa.ae.length === 0) return null;
  const log = oa.ae.filter((a) => a.estado === "logrado").length;
  return Math.round((log / oa.ae.length) * 100);
}

export function catalogoOaDeGrupo(estudiantes: EstudianteDemo[]): OaDemo[] {
  const especialidades = new Set(
    estudiantes.map((e) => especialidadFromCurso(e.curso)).filter(Boolean),
  );
  return CATALOGO_OA.filter((oa) => especialidades.has(oa.especialidad));
}

export function pluralEstudiantes(n: number): string {
  return n === 1 ? "1 estudiante" : `${n} estudiantes`;
}

export type ConteosEstado = {
  logrado: number;
  en_progreso: number;
  no_iniciado: number;
  total: number;
  pct: number;
};

export function bandasCount(estudiantes: EstudianteDemo[]): Record<BandaLogro, number> {
  const acc: Record<BandaLogro, number> = {
    logrado: 0,
    medianamente_logrado: 0,
    en_proceso: 0,
    no_logrado: 0,
  };
  for (const e of estudiantes) acc[bandaFromPct(e.avancePct)] += 1;
  return acc;
}

export function conteoOaGrupo(
  estudiantes: EstudianteDemo[],
  oaCodigo: string,
): ConteosEstado {
  let logrado = 0;
  let en_progreso = 0;
  let no_iniciado = 0;
  for (const e of estudiantes) {
    const oa = e.cobertura.find((c) => c.oaCodigo === oaCodigo);
    if (!oa) continue;
    if (oa.estado === "logrado") logrado += 1;
    else if (oa.estado === "en_progreso") en_progreso += 1;
    else no_iniciado += 1;
  }
  const total = logrado + en_progreso + no_iniciado;
  return {
    logrado,
    en_progreso,
    no_iniciado,
    total,
    pct: total === 0 ? 0 : Math.round((logrado / total) * 100),
  };
}

export function heatmapOaBandaRows(estudiantes: EstudianteDemo[]): Array<{
  id: string;
  label: string;
  values: Array<number | null>;
}> {
  const columnas: BandaLogro[] = [
    "logrado",
    "medianamente_logrado",
    "en_proceso",
    "no_logrado",
  ];
  return oaCodesForGroup(estudiantes).map((oaCodigo) => {
    const counts: Record<BandaLogro, number> = {
      logrado: 0,
      medianamente_logrado: 0,
      en_proceso: 0,
      no_logrado: 0,
    };
    for (const e of estudiantes) {
      const pct = pctOaEstudiante(e, oaCodigo);
      if (pct == null) continue;
      counts[bandaFromPct(pct)] += 1;
    }
    return {
      id: oaCodigo,
      label: oaCodigo,
      values: columnas.map((col) => counts[col]),
    };
  });
}

export function heatmapEstudianteOaRows(
  estudiantes: EstudianteDemo[],
  oaCols: string[],
  limit = 28,
): Array<{ id: string; label: string; values: Array<number | null>; hint?: string }> {
  return [...estudiantes]
    .sort((a, b) => a.avancePct - b.avancePct)
    .slice(0, limit)
    .map((e) => ({
      id: e.id,
      label: e.nombre,
      hint: `${e.curso} · ${e.avancePct}% · OA/AE crítico: ${oaCriticoDe(e)}`,
      values: oaCols.map((oa) => pctOaEstudiante(e, oa)),
    }));
}

export function oaPctBars(estudiantes: EstudianteDemo[]): Array<{ label: string; value: number }> {
  return oaCodesForGroup(estudiantes).map((codigo) => ({
    label: codigo,
    value: conteoOaGrupo(estudiantes, codigo).pct,
  }));
}

export function aePctBars(
  estudiantes: EstudianteDemo[],
  limit = 10,
): Array<{ label: string; value: number }> {
  const seen = new Map<string, { oa: string; ae: string }>();
  for (const e of estudiantes) {
    for (const c of e.cobertura) {
      for (const ae of c.ae) {
        const key = `${c.oaCodigo}·${ae.aeCodigo}`;
        if (!seen.has(key)) seen.set(key, { oa: c.oaCodigo, ae: ae.aeCodigo });
      }
    }
  }
  return Array.from(seen.values())
    .map(({ oa, ae }) => {
      const r = pctLogroAe(estudiantes, oa, ae);
      return { label: ae, value: r.pct };
    })
    .sort((a, b) => a.value - b.value)
    .slice(0, limit);
}

export function criterioPctBars(
  estudiantes: EstudianteDemo[],
  limit = 10,
): Array<{ label: string; value: number; detalle: string }> {
  const catalog = catalogoOaDeGrupo(estudiantes);
  const items: Array<{ label: string; value: number; detalle: string }> = [];
  for (const oa of catalog) {
    for (const ae of oa.ae) {
      const r = pctLogroAe(estudiantes, oa.codigo, ae.codigo, oa.especialidad);
      if (r.total === 0) continue;
      for (const ce of criteriosDeEvaluacion(ae)) {
        items.push({
          label: ce.codigo,
          value: r.pct,
          detalle: ce.descripcion,
        });
      }
    }
  }
  return items.sort((a, b) => a.value - b.value).slice(0, limit);
}
