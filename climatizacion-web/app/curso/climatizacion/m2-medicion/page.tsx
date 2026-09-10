import type { Metadata } from "next";
import ModulePlayer from "@/components/curso/m2/ModulePlayer";
import { M2_META } from "@/lib/m2-medicion-estaciones";

export const metadata: Metadata = {
  title: `Módulo 2 — Instrumentos de medición | ${M2_META.especialidad}`,
  description:
    "Prototipo estudiante Aula TP: Instrumentos de medición (packing Aconcagua). Selección, técnica, contraste y ajuste acotado.",
};

type PageProps = {
  searchParams: Promise<{ estacion?: string; station?: string }>;
};

export default async function M2MedicionPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const initialSlug = sp?.estacion ?? sp?.station;

  return <ModulePlayer initialSlug={initialSlug} />;
}
