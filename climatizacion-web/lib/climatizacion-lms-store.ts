/**
 * LMS ligero Climatización — JSON file store (alpine-friendly).
 * Prefer /app/data (volume); fallback /tmp/climatizacion-lms.json.
 */

import fs from "fs";
import path from "path";
import { generateClimatizacionEstudiantes } from "@/lib/generate-climatizacion-estudiantes";
import {
  CLIMATIZACION_META,
  MODULOS_CLIMATIZACION,
} from "@/lib/climatizacion-curso";
import type { InstitutionalMetrics } from "@/lib/portal-cursos";

export type LmsStudent = {
  id: string;
  name: string;
  curso: string;
  createdAt: string;
};

export type LmsModuleProgress = {
  completedStationIds: string[];
  updatedAt: string;
  pct: number;
};

export type LmsStudentProgress = {
  modules: Record<string, LmsModuleProgress>;
  overallPct: number;
};

export type LmsStore = {
  version: 1;
  students: LmsStudent[];
  progressByStudent: Record<string, LmsStudentProgress>;
  updatedAt: string;
};

const MODULE_NUMS = MODULOS_CLIMATIZACION.map((m) => m.numero);
const COHORT = 160;

function candidatePaths(): string[] {
  const env = process.env.CLIMATIZACION_LMS_PATH;
  const cwd = process.cwd();
  return [
    ...(env ? [env] : []),
    path.join(cwd, "data", "climatizacion-lms.json"),
    "/app/data/climatizacion-lms.json",
    "/tmp/climatizacion-lms.json",
  ];
}

let resolvedPath: string | null = null;

function ensureWritableDir(filePath: string): boolean {
  try {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    const probe = path.join(dir, ".write-probe");
    fs.writeFileSync(probe, "ok");
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

export function getLmsFilePath(): string {
  if (resolvedPath) return resolvedPath;
  for (const p of candidatePaths()) {
    if (ensureWritableDir(p)) {
      resolvedPath = p;
      return p;
    }
  }
  resolvedPath = "/tmp/climatizacion-lms.json";
  return resolvedPath;
}

/** Known station counts from ModulePlayer ESTACIONES_* (client also sends stationTotal). */
const MODULE_STATION_TOTALS: Record<number, number> = {
  1: 8,
  2: 8,
  3: 8,
  4: 8,
  5: 8,
  6: 12,
  7: 8,
  8: 8,
};

/** Safe high denominator when module meta is unknown and client omitted stationTotal. */
const FALLBACK_STATION_TOTAL = 20;

function stationTotalForModule(
  moduleNumero: number,
  provided?: number,
): number | null {
  if (provided && provided > 0) return provided;
  if (MODULE_STATION_TOTALS[moduleNumero]) return MODULE_STATION_TOTALS[moduleNumero]!;
  // Unknown module without stationTotal: refuse to invent 100% from unique.length.
  return null;
}

function emptyProgress(): LmsStudentProgress {
  return { modules: {}, overallPct: 0 };
}

/**
 * Build LMS module progress from synthetic cohort avancePct / AE coverage
 * so Portal metrics show credible demo averages (not all zeros).
 */
function buildProgressFromCohort(
  students: LmsStudent[],
): Record<string, LmsStudentProgress> {
  const cohort = generateClimatizacionEstudiantes(COHORT);
  const byId = new Map(cohort.map((e) => [e.id, e]));
  const now = new Date().toISOString();
  const out: Record<string, LmsStudentProgress> = {};

  for (const s of students) {
    const gen = byId.get(s.id);
    const avance = gen?.avancePct ?? 0;
    // Deterministic per-module jitter ±8 pts so modules aren't identical.
    let hash = 0;
    for (let i = 0; i < s.id.length; i++) hash = (hash * 31 + s.id.charCodeAt(i)) | 0;
    const modules: Record<string, LmsModuleProgress> = {};
    for (const n of MODULE_NUMS) {
      const jitter = ((hash + n * 17) % 17) - 8; // -8..+8
      const pct = Math.max(0, Math.min(100, Math.round(avance + jitter)));
      const total = MODULE_STATION_TOTALS[n] ?? FALLBACK_STATION_TOTAL;
      const completedCount = Math.round((pct / 100) * total);
      const completedStationIds = Array.from(
        { length: completedCount },
        (_, i) => `m${n}-seed-${i + 1}`,
      );
      modules[String(n)] = {
        completedStationIds,
        updatedAt: now,
        pct,
      };
    }
    out[s.id] = {
      modules,
      overallPct: recomputeOverall(modules),
    };
  }
  return out;
}

function storeAverageOverall(store: LmsStore): number {
  if (!store.students.length) return 0;
  let sum = 0;
  for (const s of store.students) {
    sum += store.progressByStudent[s.id]?.overallPct ?? 0;
  }
  return Math.round((sum / store.students.length) * 10) / 10;
}

/**
 * One-time / idempotent migrate: if students exist but progress is empty
 * (or average_progress ≈ 0), populate from generateClimatizacionEstudiantes
 * without wiping student ids.
 */
export function ensureSeededProgress(store: LmsStore): boolean {
  if (!store.students?.length) return false;
  const progressKeys = Object.keys(store.progressByStudent ?? {});
  const avg = storeAverageOverall(store);
  const needs =
    progressKeys.length === 0 ||
    (progressKeys.length < store.students.length && avg === 0) ||
    avg === 0;
  if (!needs) return false;
  const seeded = buildProgressFromCohort(store.students);
  // Preserve any existing non-zero student progress; fill gaps / zeros.
  for (const s of store.students) {
    const existing = store.progressByStudent[s.id];
    if (existing && existing.overallPct > 0) continue;
    store.progressByStudent[s.id] = seeded[s.id] ?? emptyProgress();
  }
  store.updatedAt = new Date().toISOString();
  return true;
}

function seedStore(): LmsStore {
  const now = new Date().toISOString();
  const cohort = generateClimatizacionEstudiantes(COHORT);
  const students = cohort.map((e) => ({
    id: e.id,
    name: e.nombre,
    curso: e.curso,
    createdAt: now,
  }));
  const store: LmsStore = {
    version: 1,
    students,
    progressByStudent: {},
    updatedAt: now,
  };
  store.progressByStudent = buildProgressFromCohort(students);
  store.updatedAt = new Date().toISOString();
  return store;
}

function recomputeOverall(modules: Record<string, LmsModuleProgress>): number {
  let sum = 0;
  for (const n of MODULE_NUMS) {
    sum += modules[String(n)]?.pct ?? 0;
  }
  return Math.round((sum / MODULE_NUMS.length) * 10) / 10;
}

/** Simple exclusive lock via lockfile + atomic write. */
function withLock<T>(fn: (store: LmsStore) => T): T {
  const file = getLmsFilePath();
  const lock = `${file}.lock`;
  const started = Date.now();
  while (true) {
    try {
      const fd = fs.openSync(lock, "wx");
      fs.closeSync(fd);
      break;
    } catch {
      if (Date.now() - started > 5000) {
        try {
          fs.unlinkSync(lock);
        } catch {
          /* ignore */
        }
      }
      const waitUntil = Date.now() + 25;
      while (Date.now() < waitUntil) {
        /* spin */
      }
    }
  }
  try {
    let store: LmsStore;
    if (!fs.existsSync(file)) {
      store = seedStore();
      atomicWrite(file, store);
    } else {
      try {
        store = JSON.parse(fs.readFileSync(file, "utf8")) as LmsStore;
        if (!store.students?.length) {
          store = seedStore();
          atomicWrite(file, store);
        } else if (!store.progressByStudent) {
          store.progressByStudent = {};
        }
        if (ensureSeededProgress(store)) {
          atomicWrite(file, store);
        }
      } catch {
        store = seedStore();
        atomicWrite(file, store);
      }
    }
    return fn(store);
  } finally {
    try {
      fs.unlinkSync(lock);
    } catch {
      /* ignore */
    }
  }
}

function atomicWrite(file: string, store: LmsStore) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

export function readLmsStore(): LmsStore {
  return withLock((store) => store);
}

export function getStudentProgress(studentId: string): {
  student: LmsStudent | null;
  progress: LmsStudentProgress;
} {
  return withLock((store) => {
    const student = store.students.find((s) => s.id === studentId) ?? null;
    const progress = store.progressByStudent[studentId] ?? emptyProgress();
    return { student, progress };
  });
}

export function upsertProgress(input: {
  studentId: string;
  moduleNumero: number;
  completedStationIds: string[];
  stationTotal?: number;
  stationId?: string;
}): LmsStudentProgress {
  return withLock((store) => {
    const { studentId, moduleNumero, completedStationIds } = input;
    if (!store.students.some((s) => s.id === studentId)) {
      throw new Error(`studentId desconocido: ${studentId}`);
    }
    const now = new Date().toISOString();
    const prev = store.progressByStudent[studentId] ?? emptyProgress();
    const key = String(moduleNumero);
    const unique = Array.from(new Set(completedStationIds));
    // Never default total to unique.length (1 station → 100%). Prefer client
    // stationTotal, else known module station count; unknown → safe high denom.
    const resolved = stationTotalForModule(moduleNumero, input.stationTotal);
    const total = resolved ?? FALLBACK_STATION_TOTAL;
    const pct =
      unique.length === 0
        ? 0
        : Math.min(100, Math.round((unique.length / total) * 1000) / 10);
    const modules = {
      ...prev.modules,
      [key]: {
        completedStationIds: unique,
        updatedAt: now,
        pct,
      },
    };
    const next: LmsStudentProgress = {
      modules,
      overallPct: recomputeOverall(modules),
    };
    store.progressByStudent[studentId] = next;
    store.updatedAt = now;
    atomicWrite(getLmsFilePath(), store);
    return next;
  });
}

export function listClimStudents(): LmsStudent[] {
  return withLock((store) => store.students);
}

export function buildClimatizacionLiveMetrics(): InstitutionalMetrics {
  // readLmsStore → withLock already migrates empty progress; re-read is enough.
  const store = readLmsStore();
  const students = store.students.length;
  const progresses = store.students.map(
    (s) => store.progressByStudent[s.id] ?? emptyProgress(),
  );
  const average_progress =
    students === 0
      ? 0
      : Math.round(
          (progresses.reduce((a, p) => a + p.overallPct, 0) / students) * 10,
        ) / 10;

  const modules = MODULOS_CLIMATIZACION.map((m) => {
    const key = String(m.numero);
    const pcts = progresses.map((p) => p.modules[key]?.pct ?? 0);
    const avg =
      pcts.length === 0
        ? 0
        : Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10) / 10;
    const completed = pcts.filter((p) => p >= 85).length;
    return {
      id: m.id,
      sequence: m.numero,
      code: String(m.numero).padStart(2, "0"),
      oa_code: m.oaCodigos.join(" · "),
      title: m.nombre,
      short_title: m.nombre,
      annual_hours: m.horasOficiales,
      hours_3d: Math.round(m.horasAulaTp * 10) / 10,
      activity_count: m.estaciones?.length ?? 0,
      average_progress: avg,
      completed_enrollments: completed,
      in_progress_enrollments: Math.max(0, students - completed),
    };
  });

  const completedEnrollments = progresses.filter((p) => p.overallPct >= 85)
    .length;

  const studentRows = store.students.map((s) => {
    const prog = store.progressByStudent[s.id] ?? emptyProgress();
    const modPct: Record<string, number> = {};
    for (const n of MODULE_NUMS) {
      modPct[String(n)] = prog.modules[String(n)]?.pct ?? 0;
    }
    return {
      id: s.id,
      name: s.name,
      curso: s.curso,
      overallPct: prog.overallPct,
      modules: modPct,
    };
  });

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
      description: `Hub Aula TP con ${MODULOS_CLIMATIZACION.length} módulos (${CLIMATIZACION_META.horasTotales} h programa). LMS local ${students} estudiantes.`,
      status: "publicado",
    },
    totals: {
      students,
      active_enrollments: students,
      completed_enrollments: completedEnrollments,
      average_progress,
      modules: MODULOS_CLIMATIZACION.length,
      annual_hours: CLIMATIZACION_META.horasTotales,
      activities: MODULOS_CLIMATIZACION.reduce(
        (acc, m) => acc + (m.estaciones?.length ?? 0),
        0,
      ),
      activity_completion: average_progress,
      integrator_total: students,
      integrator_completed: completedEnrollments,
      integrator_average_progress: average_progress,
    },
    modules,
    students: studentRows,
    source: "live",
    fetchedAt: new Date().toISOString(),
  };
}

export type LmsStudentRow = {
  id: string;
  name: string;
  curso: string;
  email: string;
  overallPct: number;
  modules: Record<string, number>;
  updatedAt: string | null;
};

export function listStudentsWithProgress(): LmsStudentRow[] {
  const store = readLmsStore();
  return store.students.map((s) => {
    const prog = store.progressByStudent[s.id] ?? emptyProgress();
    const modules: Record<string, number> = {};
    for (const n of MODULE_NUMS) {
      modules[String(n)] = prog.modules[String(n)]?.pct ?? 0;
    }
    const moduleUpdates = Object.values(prog.modules).map((m) => m.updatedAt);
    const updatedAt =
      moduleUpdates.sort().slice(-1)[0] ?? null;
    return {
      id: s.id,
      name: s.name,
      curso: s.curso,
      email: `${s.id}@demo.aulatpchile.cl`,
      overallPct: prog.overallPct,
      modules,
      updatedAt,
    };
  });
}
