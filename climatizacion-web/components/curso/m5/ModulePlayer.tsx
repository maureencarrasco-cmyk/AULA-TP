"use client";

import AulaModuleShell from "@/components/curso/shared/AulaModuleShell";
import {
  ESTACIONES_M5,
  INITIAL_PROGRESS,
  M5_META as META,
  PRACTICA_LIBRE_M5,
  canCompleteStation,
  getEstacionBySlug,
  stationIsUnlocked,
} from "@/lib/m5-puesta-estaciones";
import type { EstacionBase } from "@/lib/aula-module-types";

type Props = { initialSlug?: string };

const FAMILIA_LABELS: Record<string, string> = {
  preparacion: "Preparación",
  carga: "Carga",
  seguridad: "Seguridad",
  ambiente: "Ambiente",
  equipo: "Equipo",
};

const CIERRE_CARDS = [
    { key: "preparacion", label: "Preparar área / EPP", width: "90%" },
    { key: "carga", label: "Cargar sin venteo", width: "85%" },
    { key: "ambiente", label: "Cuidado ambiental NCh3241", width: "80%" },
    { key: "equipo", label: "Registro de parámetros", width: "78%" },
];

const EVIDENCIAS = [
    `🛒 Caso: ${META.casoDemo.titulo}`,
    `📋 Hallazgo: ${META.casoDemo.hallazgoTipico}`,
    "❄️ Equipo: sala fría de venta",
    "📗 NCh3241 · preparación y carga",
    `👷 ${META.casoDemo.actor}`,
  ];

export default function ModulePlayer({ initialSlug }: Props) {
  return (
    <AulaModuleShell
      meta={META}
      estaciones={ESTACIONES_M5 as unknown as EstacionBase[]}
      practicaLibre={PRACTICA_LIBRE_M5}
      routeBase="/curso/climatizacion/m5-puesta-en-marcha"
      familiaLabels={FAMILIA_LABELS}
      evalBanner={`Evaluación formal: Bloque A (preparación / carga / ambiente) → Bloque B (protocolo de carga → lecturas → fundamentar NCh3241). Sin pistas. Formato: puesta en marcha (≠ montaje M4).`}
      cierreInteraccion="sintesis_nch3241"
      cierreCards={CIERRE_CARDS}
      cierreBarClass="bg-violet-600"
      evidencias={EVIDENCIAS}
      initialSlug={initialSlug}
      initialProgress={INITIAL_PROGRESS}
      stationIsUnlocked={stationIsUnlocked as (e: EstacionBase, ids: string[]) => boolean}
      canCompleteStation={canCompleteStation as (e: EstacionBase, sel: string[]) => boolean}
      getEstacionBySlug={getEstacionBySlug as (slug: string) => EstacionBase | undefined}
    />
  );
}
