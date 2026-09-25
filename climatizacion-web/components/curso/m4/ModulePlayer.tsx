"use client";

import AulaModuleShell from "@/components/curso/shared/AulaModuleShell";
import {
  ESTACIONES_M4,
  INITIAL_PROGRESS,
  M4_META as META,
  PRACTICA_LIBRE_M4,
  canCompleteStation,
  getEstacionBySlug,
  stationIsUnlocked,
} from "@/lib/m4-equipos-estaciones";
import type { EstacionBase } from "@/lib/aula-module-types";

type Props = { initialSlug?: string };

const FAMILIA_LABELS: Record<string, string> = {
  plano: "Plano",
  manual: "Manual",
  montaje: "Montaje",
  seguridad: "Seguridad",
  verificacion: "Verificación",
  decision: "Decisión",
};

const CIERRE_CARDS = [
    { key: "plano", label: "Dificultades en plano", width: "86%" },
    { key: "manual", label: "Checklist de manual", width: "84%" },
    { key: "montaje", label: "Posicionamiento", width: "82%" },
    { key: "verificacion", label: "Post-montaje / firmas", width: "80%" },
];

const EVIDENCIAS = [
    `🏛️ Caso: ${META.casoDemo.titulo}`,
    `⚠️ Hallazgo: ${META.casoDemo.hallazgoTipico}`,
    "📦 Equipo: evaporadora / condensadora",
    "📘 Manual de montaje + NCh3241",
    `👷 ${META.casoDemo.actor}`,
  ];

export default function ModulePlayer({ initialSlug }: Props) {
  return (
    <AulaModuleShell
      meta={META}
      estaciones={ESTACIONES_M4 as unknown as EstacionBase[]}
      practicaLibre={PRACTICA_LIBRE_M4}
      routeBase="/curso/climatizacion/m4-equipos"
      familiaLabels={FAMILIA_LABELS}
      evalBanner={`Evaluación formal: Bloque A (plano / manual / montaje) → Bloque B (decidir posicionamiento → verificar post-montaje → fundamentar). Sin pistas. Formato: montaje de equipos (≠ redes M3).`}
      cierreInteraccion="linea_decisiones"
      cierreCards={CIERRE_CARDS}
      cierreBarClass="bg-rose-600"
      evidencias={EVIDENCIAS}
      initialSlug={initialSlug}
      initialProgress={INITIAL_PROGRESS}
      stationIsUnlocked={stationIsUnlocked as (e: EstacionBase, ids: string[]) => boolean}
      canCompleteStation={canCompleteStation as (e: EstacionBase, sel: string[]) => boolean}
      getEstacionBySlug={getEstacionBySlug as (slug: string) => EstacionBase | undefined}
    />
  );
}
