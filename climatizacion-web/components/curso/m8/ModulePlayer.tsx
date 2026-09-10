"use client";

import AulaModuleShell from "@/components/curso/shared/AulaModuleShell";
import {
  ESTACIONES_M8,
  INITIAL_PROGRESS,
  M8_META as META,
  PRACTICA_LIBRE_M8,
  canCompleteStation,
  getEstacionBySlug,
  stationIsUnlocked,
} from "@/lib/m8-reciclaje-estaciones";
import type { EstacionBase } from "@/lib/aula-module-types";

type Props = { initialSlug?: string };

const FAMILIA_LABELS: Record<string, string> = {
  preparacion: "Preparación",
  recuperacion: "Recuperación",
  almacenamiento: "Almacenamiento",
  seguridad: "Seguridad",
  ambiental: "Ambiental",
};

const CIERRE_CARDS = [
    { key: "preparacion", label: "Preparar (EPP / NCh3241)", width: "90%" },
    { key: "recuperacion", label: "Recuperar (sin venteo)", width: "85%" },
    { key: "almacenamiento", label: "Etiquetar / almacenar", width: "80%" },
    { key: "ambiental", label: "Custodia ambiental", width: "78%" },
];

const EVIDENCIAS = [
    `🏬 Caso: ${META.casoDemo.titulo}`,
    `⚠️ Hallazgo: ${META.casoDemo.hallazgoTipico}`,
    "❄️ Fluido / equipo: rooftop · R-410A",
    "📦 Contenedores aprobados + etiquetado NCh3241",
    `👷 ${META.casoDemo.actor}`,
  ];

export default function ModulePlayer({ initialSlug }: Props) {
  return (
    <AulaModuleShell
      meta={META}
      estaciones={ESTACIONES_M8 as unknown as EstacionBase[]}
      practicaLibre={PRACTICA_LIBRE_M8}
      routeBase="/curso/climatizacion/m8-reciclaje"
      familiaLabels={FAMILIA_LABELS}
      evalBanner={`Evaluación formal: Bloque A → Bloque B (protocolo → fundamentar riesgos). Sin pistas ni niveles 1–6. Formato: protocolo + identificación de contenedores/riesgos (≠ diagnóstico M6 · ≠ OT M7).`}
      cierreInteraccion="cierre_narrativo"
      cierreCards={CIERRE_CARDS}
      cierreBarClass="bg-cyan-600"
      evidencias={EVIDENCIAS}
      initialSlug={initialSlug}
      initialProgress={INITIAL_PROGRESS}
      stationIsUnlocked={stationIsUnlocked as (e: EstacionBase, ids: string[]) => boolean}
      canCompleteStation={canCompleteStation as (e: EstacionBase, sel: string[]) => boolean}
      getEstacionBySlug={getEstacionBySlug as (slug: string) => EstacionBase | undefined}
    />
  );
}
