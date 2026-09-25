import { NextRequest, NextResponse } from "next/server";
import {
  emailForStudentId,
  findStudentById,
  getSessionStudentId,
} from "@/lib/climatizacion-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const sid = getSessionStudentId(req);
  if (!sid) {
    return NextResponse.json(
      { authenticated: false, student: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  const student = findStudentById(sid);
  if (!student) {
    return NextResponse.json(
      { authenticated: false, student: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    {
      authenticated: true,
      student: {
        id: student.id,
        name: student.name,
        curso: student.curso,
        email: emailForStudentId(student.id),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
