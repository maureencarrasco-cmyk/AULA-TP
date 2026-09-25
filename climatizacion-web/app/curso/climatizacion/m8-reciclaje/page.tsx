import type { Metadata } from "next";
import ModulePlayer from "@/components/curso/m8/ModulePlayer";
import { M8_META } from "@/lib/m8-reciclaje-estaciones";

export const metadata: Metadata = {
  title: `Módulo 8 — Reciclaje | ${M8_META.especialidad}`,
  description:
    "Prototipo estudiante Aula TP: Reciclaje y almacenamiento de refrigerantes (centro comercial RM — retiro controlado). Ruta obligatoria + Práctica Libre + Tutor Aula TP.",
};

type PageProps = {
  searchParams: Promise<{ estacion?: string; station?: string }>;
};

export default async function M8ReciclajePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const initialSlug = sp?.estacion ?? sp?.station;

  return <ModulePlayer initialSlug={initialSlug} />;
}
