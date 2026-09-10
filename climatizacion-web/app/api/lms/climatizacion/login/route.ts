import { NextRequest, NextResponse } from "next/server";
import {
  authenticateClimStudent,
  emailForStudentId,
  setSessionCookie,
} from "@/lib/climatizacion-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      studentId?: string;
      email?: string;
      password?: string;
    };
    const identifier = (body.studentId || body.email || "").trim();
    const password = (body.password || "").trim();
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Indica ID/correo y clave." },
        { status: 400 },
      );
    }
    const result = authenticateClimStudent(identifier, password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    const res = NextResponse.json(
      {
        ok: true,
        student: {
          id: result.student.id,
          name: result.student.name,
          curso: result.student.curso,
          email: emailForStudentId(result.student.id),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
    setSessionCookie(res, result.student.id);
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error de login";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
