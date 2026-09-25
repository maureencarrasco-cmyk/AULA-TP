import fs from "fs";
import path from "path";

export type ClientErrorEntry = {
  id: string;
  ts: string;
  message: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  url?: string;
  userAgent?: string;
  componentStack?: string;
  digest?: string;
  extra?: Record<string, unknown>;
};

const DATA_DIR =
  process.env.CLIMATIZACION_DATA_DIR ||
  path.dirname(process.env.CLIMATIZACION_LMS_PATH || "/app/data/climatizacion-lms.json");
const LOG_PATH = path.join(DATA_DIR, "client-errors.jsonl");
const MAX_BYTES = 5 * 1024 * 1024; // rotate soft cap

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function appendClientError(
  partial: Omit<ClientErrorEntry, "id" | "ts"> & { ts?: string },
): ClientErrorEntry {
  ensureDir();
  const entry: ClientErrorEntry = {
    id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: partial.ts || new Date().toISOString(),
    message: String(partial.message || "unknown").slice(0, 2000),
    stack: partial.stack ? String(partial.stack).slice(0, 8000) : undefined,
    source: partial.source ? String(partial.source).slice(0, 500) : undefined,
    lineno: partial.lineno,
    colno: partial.colno,
    url: partial.url ? String(partial.url).slice(0, 1000) : undefined,
    userAgent: partial.userAgent
      ? String(partial.userAgent).slice(0, 500)
      : undefined,
    componentStack: partial.componentStack
      ? String(partial.componentStack).slice(0, 4000)
      : undefined,
    digest: partial.digest ? String(partial.digest).slice(0, 200) : undefined,
    extra: partial.extra,
  };
  try {
    const stat = fs.existsSync(LOG_PATH) ? fs.statSync(LOG_PATH) : null;
    if (stat && stat.size > MAX_BYTES) {
      const rotated = LOG_PATH.replace(/\.jsonl$/, `.${Date.now()}.jsonl`);
      fs.renameSync(LOG_PATH, rotated);
    }
  } catch {
    /* ignore rotate errors */
  }
  fs.appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`, "utf8");
  return entry;
}

export function readClientErrors(limit = 100): ClientErrorEntry[] {
  ensureDir();
  if (!fs.existsSync(LOG_PATH)) return [];
  const lines = fs.readFileSync(LOG_PATH, "utf8").split("\n").filter(Boolean);
  const slice = lines.slice(-Math.max(1, Math.min(limit, 500)));
  const out: ClientErrorEntry[] = [];
  for (const line of slice.reverse()) {
    try {
      out.push(JSON.parse(line) as ClientErrorEntry);
    } catch {
      /* skip bad line */
    }
  }
  return out;
}

export function getClientErrorLogPath() {
  return LOG_PATH;
}
