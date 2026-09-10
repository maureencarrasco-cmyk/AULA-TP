import type { Metadata } from "next";
import ModulePlayer from "@/components/curso/m4/ModulePlayer";
import { M4_META } from "@/lib/m4-equipos-estaciones";

export const metadata: Metadata = {
  title: `Módulo 4 — Montaje de equipos | ${M4_META.especialidad}`,
  description:
    "Prototipo estudiante Aula TP: Montaje de equipos (oficina municipal Biobío). Dificultades, manual, posicionamiento y verificación.",
};

type PageProps = {
  searchParams: Promise<{ estacion?: string; station?: string }>;
};

export default async function M4EquiposPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const initialSlug = sp?.estacion ?? sp?.station;

  return <ModulePlayer initialSlug={initialSlug} />;
}
