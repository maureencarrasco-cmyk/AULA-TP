"use client";

import type { EstacionBase, FaseRuta } from "@/lib/aula-module-types";
import StationRail, { railItemFromEstacion } from "@/components/curso/shared/StationRail";
import { FASE_LABELS } from "@/lib/aula-module-types";

const TEMPLATE: FaseRuta[] = [
  "contextualizacion",
  "estacion_ae",
  "situacion_integradora",
  "evaluacion_final",
  "retroalimentacion",
];

export function pedagogicalTitle(fase: FaseRuta) {
  if (fase === "estacion_ae") return "Aprendizajes Esperados";
  if (fase === "retroalimentacion") return "Retroalimentación y Cierre";
  if (fase === "evaluacion_final") return "Evaluación Final";
  return FASE_LABELS[fase].replace(/\s*\(.*\)$/, "");
}

type Props = {
  estaciones: EstacionBase[];
  currentFase: FaseRuta;
  completedIds: string[];
  onSelectFase: (firstStation: EstacionBase) => void;
};

export default function PedagogicalStationStrip({
  estaciones,
  currentFase,
  completedIds,
  onSelectFase,
}: Props) {
  const items = TEMPLATE.flatMap((fase, index) => {
    const group = estaciones.filter((e) => e.fase === fase);
    const first = group[0];
    if (!first) return [];
    const allDone = group.every((e) => completedIds.includes(e.id));
    const active = currentFase === fase;
    return [
      railItemFromEstacion(
        { ...first, titulo: pedagogicalTitle(fase) },
        {
          index,
          done: allDone,
          active,
          open: Boolean(first),
        },
      ),
    ];
  });

  return (
    <StationRail
      items={items}
      onSelect={(id) => {
        const first = estaciones.find((e) => e.id === id);
        if (first) onSelectFase(first);
      }}
    />
  );
}
