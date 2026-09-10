import type { Metadata } from "next";
import ModulePlayer from "@/components/curso/m3/ModulePlayer";
import { M3_META } from "@/lib/m3-redes-estaciones";

export const metadata: Metadata = {
  title: `Módulo 3 — Montaje de redes | ${M3_META.especialidad}`,
  description:
    "Prototipo estudiante Aula TP: Montaje de redes (vivienda social Valparaíso). Uniones, secuencia, armado y hermeticidad NCh3241.",
};

type PageProps = {
  searchParams: Promise<{ estacion?: string; station?: string }>;
};

export default async function M3RedesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const initialSlug = sp?.estacion ?? sp?.station;

  return <ModulePlayer initialSlug={initialSlug} />;
}
