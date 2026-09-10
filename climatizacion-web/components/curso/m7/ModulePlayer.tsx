"use client";

import AulaModuleShell from "@/components/curso/shared/AulaModuleShell";
import {
  ESTACIONES_M7,
  INITIAL_PROGRESS,
  M7_META as META,
  PRACTICA_LIBRE_M7,
  canCompleteStation,
  getEstacionBySlug,
  stationIsUnlocked,
} from "@/lib/m7-mantencion-estaciones";
import type { EstacionBase } from "@/lib/aula-module-types";

type Props = { initialSlug?: string };

const FAMILIA_LABELS: Record<string, string> = {
  preventivo: "Preventivo",
  correctivo: "Correctivo",
  seguridad: "Seguridad",
};

const CIERRE_CARDS = [
    { key: "seguridad", label: "Seguridad / EPP", width: "88%" },
    { key: "correctivo", label: "Alcance acotado", width: "75%" },
    { key: "preventivo", label: "Checklist preventivo", width: "82%" },
    { key: "bitacora", label: "Bitácora / OT", width: "70%" },
];

const EVIDENCIAS = [
    `🧊 Caso: ${META.casoDemo.titulo}`,
    `🧊 Hallazgo: ${META.casoDemo.hallazgoTipico}`,
    "📋 Plan anual de mantención (cámaras)",
    "📘 Manual evaporadora de techo",
    "📝 Bitácora / OT preventivo–correctivo",
    `👷 ${META.casoDemo.actor}`,
  ];

export default function ModulePlayer({ initialSlug }: Props) {
  return (
    <AulaModuleShell
      meta={META}
      estaciones={ESTACIONES_M7 as unknown as EstacionBase[]}
      practicaLibre={PRACTICA_LIBRE_M7}
      routeBase="/curso/climatizacion/m7-mantencion"
      familiaLabels={FAMILIA_LABELS}
      evalBanner={`Evaluación formal: Bloque A → Bloque B (interpretar → decidir → fundamentar). Sin pistas ni niveles 1–6. Formato: orden de trabajo (distinto a diagnóstico M6).`}
      cierreInteraccion="errores_criticos"
      cierreCards={CIERRE_CARDS}
      cierreBarClass="bg-[var(--aula-blue)]"
      evidencias={EVIDENCIAS}
      initialSlug={initialSlug}
      initialProgress={INITIAL_PROGRESS}
      stationIsUnlocked={stationIsUnlocked as (e: EstacionBase, ids: string[]) => boolean}
      canCompleteStation={canCompleteStation as (e: EstacionBase, sel: string[]) => boolean}
      getEstacionBySlug={getEstacionBySlug as (slug: string) => EstacionBase | undefined}
    />
  );
}
