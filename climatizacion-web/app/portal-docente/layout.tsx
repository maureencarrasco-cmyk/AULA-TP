import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Docente — Aula TP Chile",
  description:
    "Portal docente de Aula TP Chile: panel, planificación, estudiantes, referencia curricular y reportes. No es un sitio oficial del MINEDUC.",
  robots: { index: false, follow: false },
};

export default function PortalDocenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
