import { NextResponse } from "next/server";
import { fetchInstitutionalMetrics } from "@/lib/portal-metrics-fetch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await fetchInstitutionalMetrics("enfermeria");
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al obtener métricas";
    return NextResponse.json(
      {
        error: "No se pudieron obtener métricas de Atención de Enfermería",
        detail: message,
      },
      { status: 502 },
    );
  }
}
