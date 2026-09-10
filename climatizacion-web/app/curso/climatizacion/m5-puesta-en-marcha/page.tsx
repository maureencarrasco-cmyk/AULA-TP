import type { Metadata } from "next";
import ModulePlayer from "@/components/curso/m5/ModulePlayer";
import { M5_META } from "@/lib/m5-puesta-estaciones";

export const metadata: Metadata = {
  title: `Módulo 5 — Puesta en marcha | ${M5_META.especialidad}`,
  description:
    "Prototipo estudiante Aula TP: Puesta en marcha (supermercado Los Lagos). Preparación/carga NCh3241, ruta obligatoria + Práctica Libre + Tutor Aula TP.",
};

type PageProps = {
  searchParams: Promise<{ estacion?: string; station?: string }>;
};

export default async function M5PuestaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const initialSlug = sp?.estacion ?? sp?.station;

  return <ModulePlayer initialSlug={initialSlug} />;
}
