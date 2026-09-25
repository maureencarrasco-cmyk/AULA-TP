import { NextRequest, NextResponse } from "next/server";
import {
  appendClientError,
  getClientErrorLogPath,
  readClientErrors,
} from "@/lib/client-error-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit") || "50");
  const errors = readClientErrors(Number.isFinite(limit) ? limit : 50);
  return NextResponse.json(
    {
      ok: true,
      count: errors.length,
      logPath: getClientErrorLogPath(),
      errors,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const entry = appendClientError({
      message: String(body.message || body.error || "client error"),
      stack: body.stack ? String(body.stack) : undefined,
      source: body.source ? String(body.source) : undefined,
      lineno: typeof body.lineno === "number" ? body.lineno : undefined,
      colno: typeof body.colno === "number" ? body.colno : undefined,
      url: body.url ? String(body.url) : req.headers.get("referer") || undefined,
      userAgent:
        body.userAgent
          ? String(body.userAgent)
          : req.headers.get("user-agent") || undefined,
      componentStack: body.componentStack
        ? String(body.componentStack)
        : undefined,
      digest: body.digest ? String(body.digest) : undefined,
      extra:
        body.extra && typeof body.extra === "object"
          ? (body.extra as Record<string, unknown>)
          : undefined,
    });
    return NextResponse.json(
      { ok: true, id: entry.id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error guardando log";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
