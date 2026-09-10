import CourseHub from "@/components/curso/shared/CourseHub";
import { getCourseHub } from "@/lib/course-hubs";

export const metadata = {
  title: "Curso Refrigeración y Climatización | Aula TP",
  description:
    "Curso estudiante Aula TP — Refrigeración y Climatización M1–M8 (3° y 4° medio). Ruta obligatoria, Práctica Libre y Tutor Aula TP.",
};

export default function ClimatizacionCursoPage() {
  const hub = getCourseHub("climatizacion");
  if (!hub) return null;
  return <CourseHub hub={hub} />;
}
