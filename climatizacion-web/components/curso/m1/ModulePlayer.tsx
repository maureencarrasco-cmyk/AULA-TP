"use client";

import AulaModuleShell from "@/components/curso/shared/AulaModuleShell";
import {
  ESTACIONES_M1,
  INITIAL_PROGRESS,
  M1_META as META,
  PRACTICA_LIBRE_M1,
  canCompleteStation,
  getEstacionBySlug,
  stationIsUnlocked,
} from "@/lib/m1-planos-estaciones";
import type { EstacionBase } from "@/lib/aula-module-types";

type Props = { initialSlug?: string };

const FAMILIA_LABELS: Record<string, string> = {
  simbologia: "Simbología",
  espacio: "Espacio físico",
  especificacion: "Especificación",
  interferencia: "Interferencia",
  registro: "Registro",
};

const CIERRE_CARDS = [
    { key: "simbologia", label: "Simbología ↔ espacio", width: "88%" },
    { key: "especificacion", label: "Especificación ↔ partida", width: "82%" },
    { key: "interferencia", label: "Interferencia ↔ decisión", width: "80%" },
    { key: "registro", label: "Documentar evidencias", width: "78%" },
];

const EVIDENCIAS = [
    `🏢 Caso: ${META.casoDemo.titulo}`,
    "📐 Plano HVAC + leyenda",
    `⚠️ Hallazgo: ${META.casoDemo.hallazgoTipico}`,
    "📄 Especificaciones de partida",
    `👷 ${META.casoDemo.actor}`,
  ];

export default function ModulePlayer({ initialSlug }: Props) {
  return (
    <AulaModuleShell
      meta={META}
      estaciones={ESTACIONES_M1 as unknown as EstacionBase[]}
      practicaLibre={PRACTICA_LIBRE_M1}
      routeBase="/curso/climatizacion/m1-planos"
      familiaLabels={FAMILIA_LABELS}
      evalBanner={`Evaluación formal: Bloque A (simbología / especificación / interferencia) → Bloque B (interpretar plano → decidir interferencia crítica → fundamentar). Sin pistas. Formato: interpretación de planos/docs (≠ mediciones M2 · ≠ redes M3).`}
      cierreInteraccion="mapa_relaciones"
      cierreCards={CIERRE_CARDS}
      cierreBarClass="bg-indigo-600"
      evidencias={EVIDENCIAS}
      initialSlug={initialSlug}
      initialProgress={INITIAL_PROGRESS}
      stationIsUnlocked={stationIsUnlocked as (e: EstacionBase, ids: string[]) => boolean}
      canCompleteStation={canCompleteStation as (e: EstacionBase, sel: string[]) => boolean}
      getEstacionBySlug={getEstacionBySlug as (slug: string) => EstacionBase | undefined}
    />
  );
}
