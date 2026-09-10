"use client";

import AulaModuleShell from "@/components/curso/shared/AulaModuleShell";
import {
  ESTACIONES_M3,
  INITIAL_PROGRESS,
  M3_META as META,
  PRACTICA_LIBRE_M3,
  canCompleteStation,
  getEstacionBySlug,
  stationIsUnlocked,
} from "@/lib/m3-redes-estaciones";
import type { EstacionBase } from "@/lib/aula-module-types";

type Props = { initialSlug?: string };

const FAMILIA_LABELS: Record<string, string> = {
  material: "Material",
  soldadura: "Soldadura",
  secuencia: "Secuencia",
  seguridad: "Seguridad",
  hermeticidad: "Hermeticidad",
};

const CIERRE_CARDS = [
    { key: "material", label: "Materiales autorizados", width: "88%" },
    { key: "seguridad", label: "Secuencia con EPP", width: "90%" },
    { key: "soldadura", label: "Uniones NCh3241", width: "84%" },
    { key: "hermeticidad", label: "Hermeticidad conceptual", width: "80%" },
];

const EVIDENCIAS = [
    `🏠 Caso: ${META.casoDemo.titulo}`,
    `🔧 Hallazgo: ${META.casoDemo.hallazgoTipico}`,
    "📗 NCh3241 · uniones / hermeticidad",
    "🧱 Materiales y soldaduras autorizadas",
    `👷 ${META.casoDemo.actor}`,
  ];

export default function ModulePlayer({ initialSlug }: Props) {
  return (
    <AulaModuleShell
      meta={META}
      estaciones={ESTACIONES_M3 as unknown as EstacionBase[]}
      practicaLibre={PRACTICA_LIBRE_M3}
      routeBase="/curso/climatizacion/m3-redes"
      familiaLabels={FAMILIA_LABELS}
      evalBanner={`Evaluación formal: Bloque A (material / secuencia / riesgos) → Bloque B (decidir secuencia segura → fundamentar hermeticidad). Sin pistas. Formato: montaje de redes (≠ planos M1 · ≠ medición M2).`}
      cierreInteraccion="checklist_competencias"
      cierreCards={CIERRE_CARDS}
      cierreBarClass="bg-orange-600"
      evidencias={EVIDENCIAS}
      initialSlug={initialSlug}
      initialProgress={INITIAL_PROGRESS}
      stationIsUnlocked={stationIsUnlocked as (e: EstacionBase, ids: string[]) => boolean}
      canCompleteStation={canCompleteStation as (e: EstacionBase, sel: string[]) => boolean}
      getEstacionBySlug={getEstacionBySlug as (slug: string) => EstacionBase | undefined}
    />
  );
}
