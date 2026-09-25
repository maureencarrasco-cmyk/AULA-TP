import { notFound, redirect } from "next/navigation";
import { PortalShell } from "@/components/portal-docente/PortalShell";
import { isValidSection } from "@/lib/demo-data";

type Props = {
  params: Promise<{ section: string }>;
};

export default async function PortalSectionPage({ params }: Props) {
  const { section } = await params;

  if (section === "resumen") {
    redirect("/portal-docente");
  }

  // Sección eliminada: mantener URL antigua redirigida
  if (section === "recursos") {
    redirect("/portal-docente");
  }

  if (!isValidSection(section)) {
    notFound();
  }

  return <PortalShell section={section} />;
}
