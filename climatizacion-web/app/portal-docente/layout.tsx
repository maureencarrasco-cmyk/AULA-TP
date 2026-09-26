import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Docente — Aula TP Chile",
  description:
    "Panel docente de Aula TP Chile: cursos, estudiantes, OA/AE, cobertura curricular y análisis pedagógico desde el LMS.",
  robots: { index: false, follow: false },
};

export default function PortalDocenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
