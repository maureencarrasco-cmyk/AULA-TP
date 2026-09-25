/**
 * Demo institutional auth for Climatización cohort (clim-001…clim-160).
 * Cookie httpOnly + deterministic password check (no OAuth).
 */

import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { listClimStudents, type LmsStudent } from "@/lib/climatizacion-lms-store";

export const CLIM_SESSION_COOKIE = "aula_clim_session";
export const DEMO_PASSWORD = "aula2026";
export const CLIM_EMAIL_DOMAIN = "demo.aulatpchile.cl";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 14; // 14 días

function secret(): string {
  return (
    process.env.CLIM_AUTH_SECRET ||
    process.env.CLIMATIZACION_LMS_PATH ||
    "aula-tp-clim-demo-2026"
  );
}

export function emailForStudentId(studentId: string): string {
  return `${studentId.toLowerCase()}@${CLIM_EMAIL_DOMAIN}`;
}

export function resolveStudentIdFromLogin(
  identifier: string,
): string | null {
  const raw = identifier.trim().toLowerCase();
  if (!raw) return null;
  if (/^clim-\d{3}$/.test(raw)) return raw;
  const emailMatch = raw.match(/^(clim-\d{3})@/);
  if (emailMatch) return emailMatch[1]!;
  // Accept bare number 1..160 → clim-00N
  if (/^\d{1,3}$/.test(raw)) {
    const n = Number(raw);
    if (n >= 1 && n <= 160) return `clim-${String(n).padStart(3, "0")}`;
  }
  return null;
}

/** Demo passwords: shared clave OR last 4 of id (e.g. clim-001 → 0001). */
export function verifyDemoPassword(studentId: string, password: string): boolean {
  const pw = password.trim();
  if (!pw) return false;
  if (pw === DEMO_PASSWORD) return true;
  const last4 = studentId.replace(/\D/g, "").padStart(4, "0").slice(-4);
  return pw === last4;
}

type SessionPayload = {
  sid: string;
  exp: number;
};

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function mintSessionToken(studentId: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const body = `${studentId}.${exp}`;
  return `${body}.${sign(body)}`;
}

export function parseSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [sid, expStr, sig] = parts;
  if (!sid || !expStr || !sig) return null;
  const body = `${sid}.${expStr}`;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  if (!/^clim-\d{3}$/.test(sid)) return null;
  return { sid, exp };
}

export function getSessionStudentId(req: NextRequest): string | null {
  const raw = req.cookies.get(CLIM_SESSION_COOKIE)?.value;
  const parsed = parseSessionToken(raw);
  return parsed?.sid ?? null;
}

export function setSessionCookie(res: NextResponse, studentId: string): void {
  const token = mintSessionToken(studentId);
  res.cookies.set(CLIM_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(CLIM_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function findStudentById(studentId: string): LmsStudent | null {
  return listClimStudents().find((s) => s.id === studentId) ?? null;
}

export function authenticateClimStudent(
  identifier: string,
  password: string,
): { ok: true; student: LmsStudent } | { ok: false; error: string } {
  const studentId = resolveStudentIdFromLogin(identifier);
  if (!studentId) {
    return {
      ok: false,
      error: "Usa tu ID (clim-001 … clim-160) o el correo demo.",
    };
  }
  if (!verifyDemoPassword(studentId, password)) {
    return { ok: false, error: "Clave incorrecta. Prueba aula2026." };
  }
  const student = findStudentById(studentId);
  if (!student) {
    return { ok: false, error: "Estudiante no encontrado en la cohorte." };
  }
  return { ok: true, student };
}
