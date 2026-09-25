import type { Metadata } from "next";
import ModulePlayer from "@/components/curso/m7/ModulePlayer";
import { M7_META } from "@/lib/m7-mantencion-estaciones";

export const metadata: Metadata = {
  title: `Módulo 7 — Mantención | ${M7_META.especialidad}`,
  description:
    "Prototipo estudiante Aula TP: Mantención de sistemas de refrigeración y climatización (planta agroindustrial O’Higgins). Ruta obligatoria + Práctica Libre + Tutor Aula TP.",
};

type PageProps = {
  searchParams: Promise<{ estacion?: string; station?: string }>;
};

export default async function M7MantencionPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const initialSlug = sp?.estacion ?? sp?.station;

  return <ModulePlayer initialSlug={initialSlug} />;
}
