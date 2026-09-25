"use client";

import AulaModuleShell from "@/components/curso/shared/AulaModuleShell";
import {
  ESTACIONES_M6,
  INITIAL_PROGRESS,
  M6_META as META,
  PRACTICA_LIBRE_M6,
  canCompleteStation,
  getEstacionBySlug,
  stationIsUnlocked,
} from "@/lib/m6-diagnostico-estaciones";
import type { EstacionBase } from "@/lib/aula-module-types";

type Props = { initialSlug?: string };

const FAMILIA_LABELS: Record<string, string> = {
  electrica: "Eléctrica",
  mecanica: "Mecánica",
  flujo: "Flujo",
  control: "Control",
};

const CIERRE_CARDS = [
    { key: "electrica", label: "Eléctrica", width: "55%" },
    { key: "mecanica", label: "Mecánica", width: "78%" },
    { key: "flujo", label: "Flujo", width: "85%" },
    { key: "control", label: "Control", width: "70%" },
];

const EVIDENCIAS = [
    "📷 Fotos rooftop / condensadora",
    "📋 Fragmento de plano de redes",
    "🔊 Testimonio conserje (subtítulos)",
    `📊 Setpoint ${META.casoDemo.setpoint} · retorno ~${META.casoDemo.retornoObservado}`,
  ];

export default function ModulePlayer({ initialSlug }: Props) {
  return (
    <AulaModuleShell
      meta={META}
      estaciones={ESTACIONES_M6 as unknown as EstacionBase[]}
      practicaLibre={PRACTICA_LIBRE_M6}
      routeBase="/curso/climatizacion/m6-diagnostico"
      familiaLabels={FAMILIA_LABELS}
      evalBanner={`Evaluación formal: Bloque A (ítems cerrados contextualizados) → Bloque B (interpretar → decidir → fundamentar). Sin pistas ni niveles 1–6.`}
      cierreInteraccion="mapa_desempeno"
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
