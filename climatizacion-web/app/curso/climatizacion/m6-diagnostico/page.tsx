import type { Metadata } from "next";
import ModulePlayer from "@/components/curso/m6/ModulePlayer";
import { M6_META } from "@/lib/m6-diagnostico-estaciones";

export const metadata: Metadata = {
  title: `Módulo 6 — Diagnóstico | ${M6_META.especialidad}`,
  description:
    "Prototipo estudiante Aula TP: Diagnóstico de sistemas de refrigeración y climatización (Ñuñoa). Ruta obligatoria + Práctica Libre + Tutor Aula TP.",
};

type PageProps = {
  searchParams: Promise<{ estacion?: string; station?: string }>;
};

export default async function M6DiagnosticoPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const initialSlug = sp?.estacion ?? sp?.station;

  return <ModulePlayer initialSlug={initialSlug} />;
}
