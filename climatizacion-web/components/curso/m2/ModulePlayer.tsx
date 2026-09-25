"use client";

import AulaModuleShell from "@/components/curso/shared/AulaModuleShell";
import {
  ESTACIONES_M2,
  INITIAL_PROGRESS,
  M2_META as META,
  PRACTICA_LIBRE_M2,
  canCompleteStation,
  getEstacionBySlug,
  stationIsUnlocked,
} from "@/lib/m2-medicion-estaciones";
import type { EstacionBase } from "@/lib/aula-module-types";

type Props = { initialSlug?: string };

const FAMILIA_LABELS: Record<string, string> = {
  instrumento: "Instrumento",
  tecnica: "Técnica",
  seguridad: "Seguridad",
  contraste: "Contraste",
  ajuste: "Ajuste",
};

const CIERRE_CARDS = [
    { key: "instrumento", label: "Selección instrumento–EPP", width: "85%" },
    { key: "tecnica", label: "Técnica de medición", width: "82%" },
    { key: "contraste", label: "Contraste con manual", width: "80%" },
    { key: "ajuste", label: "Propuesta de ajuste", width: "78%" },
];

const EVIDENCIAS = [
    `🍎 Caso: ${META.casoDemo.titulo}`,
    `🌡️ Hallazgo: ${META.casoDemo.hallazgoTipico}`,
    "🧰 Kit: termómetro / manómetro / vacuómetro",
    "📘 Manual de fábrica (rangos)",
    `👷 ${META.casoDemo.actor}`,
  ];

export default function ModulePlayer({ initialSlug }: Props) {
  return (
    <AulaModuleShell
      meta={META}
      estaciones={ESTACIONES_M2 as unknown as EstacionBase[]}
      practicaLibre={PRACTICA_LIBRE_M2}
      routeBase="/curso/climatizacion/m2-medicion"
      familiaLabels={FAMILIA_LABELS}
      evalBanner={`Evaluación formal: Bloque A (instrumento / técnica / contraste) → Bloque B (interpretar dato → decidir ajuste → fundamentar). Sin pistas. Formato: datos e instrumentos (≠ planos M1 · ≠ redes M3).`}
      cierreInteraccion="comparacion_inicio_ahora"
      cierreCards={CIERRE_CARDS}
      cierreBarClass="bg-sky-600"
      evidencias={EVIDENCIAS}
      initialSlug={initialSlug}
      initialProgress={INITIAL_PROGRESS}
      stationIsUnlocked={stationIsUnlocked as (e: EstacionBase, ids: string[]) => boolean}
      canCompleteStation={canCompleteStation as (e: EstacionBase, sel: string[]) => boolean}
      getEstacionBySlug={getEstacionBySlug as (slug: string) => EstacionBase | undefined}
    />
  );
}
