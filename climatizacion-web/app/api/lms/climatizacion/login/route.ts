import { NextRequest, NextResponse } from "next/server";
import {
  authenticateClimStudent,
  emailForStudentId,
  findStudentById,
  resolveStudentIdFromLogin,
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
    if (!identifier) {
      return NextResponse.json(
        { error: "Indica un estudiante demo." },
        { status: 400 },
      );
    }
    const studentId = resolveStudentIdFromLogin(identifier);
    if (!studentId) {
      return NextResponse.json({ error: "Estudiante no encontrado." }, { status: 404 });
    }
    let student = findStudentById(studentId);
    if (password) {
      const result = authenticateClimStudent(identifier, password);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 401 });
      }
      student = result.student;
    }
    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado." }, { status: 404 });
    }
    const res = NextResponse.json(
      {
        ok: true,
        student: {
          id: student.id,
          name: student.name,
          curso: student.curso,
          email: emailForStudentId(student.id),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
    setSessionCookie(res, student.id);
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error de login";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
