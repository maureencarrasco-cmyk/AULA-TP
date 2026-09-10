import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/climatizacion-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST() {
  const res = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  clearSessionCookie(res);
  return res;
}
