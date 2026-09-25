import CourseHub from "@/components/curso/shared/CourseHub";
import { getCourseHub } from "@/lib/course-hubs";

export const metadata = {
  title: "Curso Administración de Empresas | Aula TP",
  description:
    "Plan 3° medio MINEDUC con el ERP Bazar Inteligente como taller de gestión: contabilidad, comercial, proceso, clientes, oficina y software.",
};

export default function AdministracionCursoPage() {
  const hub = getCourseHub("administracion");
  if (!hub) return null;
  return <CourseHub hub={hub} />;
}
