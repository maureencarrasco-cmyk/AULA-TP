import { NextRequest, NextResponse } from "next/server";
import {
  getStudentProgress,
  upsertProgress,
} from "@/lib/climatizacion-lms-store";
import { getSessionStudentId } from "@/lib/climatizacion-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId")?.trim();
  if (!studentId) {
    return NextResponse.json(
      { error: "Falta query studentId" },
      { status: 400 },
    );
  }
  try {
    const data = getStudentProgress(studentId);
    if (!data.student) {
      return NextResponse.json(
        { error: "Estudiante no encontrado", studentId },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        student: data.student,
        progress: data.progress,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error LMS";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      studentId?: string;
      moduleNumero?: number;
      completedStationIds?: string[];
      stationId?: string;
      stationTotal?: number;
    };
    const studentId = body.studentId?.trim();
    const moduleNumero = Number(body.moduleNumero);
    if (!studentId || !Number.isFinite(moduleNumero) || moduleNumero < 1) {
      return NextResponse.json(
        { error: "Body inválido: studentId y moduleNumero requeridos" },
        { status: 400 },
      );
    }

    const sessionId = getSessionStudentId(req);
    const allowDemoBypass =
      process.env.CLIM_ALLOW_DEMO_PROGRESS === "1" ||
      process.env.NODE_ENV !== "production";
    if (sessionId) {
      if (sessionId !== studentId) {
        return NextResponse.json(
          {
            error:
              "La sesión no coincide con el estudiante. Cierra sesión o inicia con ese ID.",
          },
          { status: 403 },
        );
      }
    } else if (!allowDemoBypass) {
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión para guardar progreso (demo: clim-001 / aula2026).",
        },
        { status: 401 },
      );
    }

    const completedStationIds = Array.isArray(body.completedStationIds)
      ? body.completedStationIds.map(String)
      : [];
    const progress = upsertProgress({
      studentId,
      moduleNumero,
      completedStationIds,
      stationId: body.stationId,
      stationTotal: body.stationTotal,
    });
    return NextResponse.json(
      { ok: true, studentId, moduleNumero, progress },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error LMS";
    const status = message.includes("desconocido") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
