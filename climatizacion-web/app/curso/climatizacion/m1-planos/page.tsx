import type { Metadata } from "next";
import ModulePlayer from "@/components/curso/m1/ModulePlayer";
import { M1_META } from "@/lib/m1-planos-estaciones";

export const metadata: Metadata = {
  title: `Módulo 1 — Lectura de planos | ${M1_META.especialidad}`,
  description:
    "Prototipo estudiante Aula TP: Lectura de planos (oficinas Providencia). Simbología, overlay, especificaciones e interferencias.",
};

type PageProps = {
  searchParams: Promise<{ estacion?: string; station?: string }>;
};

export default async function M1PlanosPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const initialSlug = sp?.estacion ?? sp?.station;

  return <ModulePlayer initialSlug={initialSlug} />;
}
