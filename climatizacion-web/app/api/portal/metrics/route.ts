import { NextResponse } from "next/server";
import type { InstitutionalMetrics } from "@/lib/portal-cursos";
import { fetchInstitutionalMetrics } from "@/lib/portal-metrics-fetch";
import { buildClimatizacionLiveMetrics } from "@/lib/climatizacion-lms-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type AggregateItem = {
  id: string;
  ok: boolean;
  metrics?: InstitutionalMetrics;
  error?: string;
};

export async function GET() {
  const [enf, elec, clim] = await Promise.allSettled([
    fetchInstitutionalMetrics("enfermeria"),
    fetchInstitutionalMetrics("electricidad"),
    Promise.resolve(buildClimatizacionLiveMetrics()),
  ]);

  const items: AggregateItem[] = [
    enf.status === "fulfilled"
      ? { id: "enfermeria", ok: true, metrics: enf.value }
      : {
          id: "enfermeria",
          ok: false,
          error: enf.reason instanceof Error ? enf.reason.message : String(enf.reason),
        },
    elec.status === "fulfilled"
      ? { id: "electricidad", ok: true, metrics: elec.value }
      : {
          id: "electricidad",
          ok: false,
          error:
            elec.reason instanceof Error ? elec.reason.message : String(elec.reason),
        },
    clim.status === "fulfilled"
      ? { id: "climatizacion", ok: true, metrics: clim.value }
      : {
          id: "climatizacion",
          ok: false,
          error:
            clim.reason instanceof Error ? clim.reason.message : String(clim.reason),
        },
  ];

  return NextResponse.json(
    {
      courses: items,
      fetchedAt: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
