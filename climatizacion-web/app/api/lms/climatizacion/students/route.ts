import { NextResponse } from "next/server";
import { listStudentsWithProgress } from "@/lib/climatizacion-lms-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const students = listStudentsWithProgress();
    return NextResponse.json(
      {
        count: students.length,
        students,
        source: "live",
        fetchedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error LMS";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
