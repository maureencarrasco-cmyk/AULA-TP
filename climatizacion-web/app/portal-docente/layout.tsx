import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Docente — Demo",
  description:
    "Demo interactiva del Portal Docente de Aula TP Chile. Vista docente con datos de ejemplo.",
  robots: { index: false, follow: false },
};

export default function PortalDocenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
