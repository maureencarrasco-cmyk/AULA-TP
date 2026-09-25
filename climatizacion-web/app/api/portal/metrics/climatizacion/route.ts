import { NextResponse } from "next/server";
import { buildClimatizacionLiveMetrics } from "@/lib/climatizacion-lms-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const data = buildClimatizacionLiveMetrics();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al obtener métricas";
    return NextResponse.json(
      {
        error: "No se pudieron obtener métricas de Climatización",
        detail: message,
      },
      { status: 502 },
    );
  }
}
