import { notFound, redirect } from "next/navigation";
import { PortalShell } from "@/components/portal-docente/PortalShell";
import { isValidSection } from "@/lib/demo-data";

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ vista?: string | string[] }>;
};

export default async function PortalSectionPage({ params, searchParams }: Props) {
  const { section } = await params;
  const { vista } = await searchParams;

  if (section === "resumen") {
    redirect("/portal-docente");
  }

  // Sección eliminada: mantener URL antigua redirigida
  if (section === "recursos") {
    redirect("/portal-docente");
  }

  if (section === "cumplimiento") {
    redirect("/portal-docente/reportes?vista=cobertura");
  }

  if (!isValidSection(section)) {
    notFound();
  }

  return (
    <PortalShell
      section={section}
      defaultReportArea={section === "reportes" && vista === "cobertura" ? "cobertura" : "analisis"}
    />
  );
}
