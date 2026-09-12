"use client";

import {
  CATALOGO_OA,
  type EstudianteDemo,
} from "@/lib/demo-data";
import {
  BANDA_LOGRO_COLOR,
  BANDA_LOGRO_LABEL,
  aePctBars,
  bandaFromPct,
  bandasCount,
  criterioPctBars,
  criteriosDeEvaluacion,
  heatmapEstudianteOaRows,
  heatmapOaBandaRows,
  oaCodesForGroup,
  oaCriticoDe,
  oaPctBars,
  PERIODO_ANTERIOR_LABEL,
  pctPeriodoAnterior,
  pluralEstudiantes,
  tendenciaCentral,
  transitoAmarilloVerde,
} from "@/lib/portal-stats";
import { HeatmapGrid, RankingList, TendenciaCard } from "./analytics";
import { BarChart, ChartPanel, CHART_HEX, DonutChart } from "./charts";

const ESTADO_BAR_COLORS = {
  logrado: CHART_HEX.success,
  en_progreso: CHART_HEX.warning,
  no_iniciado: CHART_HEX.muted,
} as const;

export function DonutBandas({
  estudiantes,
  title,
  subtitle,
}: {
  estudiantes: EstudianteDemo[];
  title: string;
  subtitle: string;
}) {
  const bandas = bandasCount(estudiantes);
  const n = estudiantes.length || 1;
  return (
    <ChartPanel title={title} subtitle={subtitle} badge="demo">
      <DonutChart
        title={title}
        hideTitle
        centerLabel={String(estudiantes.length)}
        slices={(Object.keys(BANDA_LOGRO_LABEL) as Array<keyof typeof BANDA_LOGRO_LABEL>).map(
          (k) => ({
            label: BANDA_LOGRO_LABEL[k],
            pct: Math.round((bandas[k] / n) * 100),
            count: bandas[k],
            unit: bandas[k] === 1 ? "estudiante" : "estudiantes",
            color: BANDA_LOGRO_COLOR[k],
          }),
        )}
      />
    </ChartPanel>
  );
}

export function NivelAggregatePanel({ estudiantes }: { estudiantes: EstudianteDemo[] }) {
  const stats = tendenciaCentral(estudiantes.map((e) => e.avancePct));
  const oaBars = oaPctBars(estudiantes);
  const aeBars = aePctBars(estudiantes, 8);
  const ceBars = criterioPctBars(estudiantes, 8);
  const heatRows = heatmapOaBandaRows(estudiantes);

  return (
    <div className="space-y-6">
      <p className="rounded-xl border border-[var(--color-info-soft,#E8F1FB)] bg-[var(--color-info-soft,#E8F1FB)] px-4 py-3 text-sm text-[var(--color-navy,#0B3A6B)]">
        Vista general del nivel: OA, AE y criterios de evaluación agregados. No se
        listan casos individuales. Sirve para ver tendencias, fortalezas y focos de
        refuerzo pedagógico.
      </p>
      <TendenciaCard stats={stats} />
      <div className="grid gap-6 lg:grid-cols-2">
        <DonutBandas
          estudiantes={estudiantes}
          title="Distribución del nivel según banda de logro"
          subtitle="Cantidad de estudiantes en logrado, medianamente logrado, en proceso o no logrado. El centro indica la cantidad total de estudiantes del recorte."
        />
        <ChartPanel
          title="OA y porcentaje de logro"
          subtitle="Comparación: Objetivo de Aprendizaje (eje horizontal) vs Porcentaje de logro % (eje vertical)."
          badge="demo"
        >
          <BarChart
            title="Porcentaje de logro % por OA del nivel"
            yAxisTitle="Porcentaje de logro %"
            xAxisTitle="Objetivo de Aprendizaje (OA)"
            valueSuffix="%"
            items={oaBars.map((item) => ({
              ...item,
              color: BANDA_LOGRO_COLOR[bandaFromPct(item.value)],
            }))}
          />
        </ChartPanel>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel
          title="AE y nivel de desempeño"
          subtitle="Comparación: Aprendizaje Esperado vs Porcentaje de logro %. Se muestran los 8 AE con menor logro."
          badge="demo"
        >
          <BarChart
            title="Porcentaje de logro % por AE (focos más descendidos)"
            yAxisTitle="Porcentaje de logro %"
            xAxisTitle="Aprendizaje Esperado (AE)"
            valueSuffix="%"
            items={aeBars.map((item) => ({
              ...item,
              color: BANDA_LOGRO_COLOR[bandaFromPct(item.value)],
            }))}
          />
        </ChartPanel>
        <ChartPanel
          title="Criterios de evaluación y resultados"
          subtitle="Cada criterio de evaluación hereda el Porcentaje de logro % de su AE. Se muestran los 8 más descendidos."
          badge="demo"
        >
          <BarChart
            title="Porcentaje de logro % por criterio de evaluación"
            yAxisTitle="Porcentaje de logro %"
            xAxisTitle="Criterio de evaluación"
            valueSuffix="%"
            items={ceBars.map((item) => ({
              label: item.label,
              value: item.value,
              color: BANDA_LOGRO_COLOR[bandaFromPct(item.value)],
            }))}
          />
        </ChartPanel>
      </div>
      <HeatmapGrid
        title="Mapa de calor del nivel · cantidad de estudiantes por OA y banda"
        subtitle="Cada celda es cantidad de estudiantes (no porcentaje) cuyo Porcentaje de logro % en ese OA cae en la banda."
        xAxisTitle="Banda de logro"
        yAxisTitle="OA"
        unit="cantidad de estudiantes"
        scale="count"
        columns={["Logrado", "Med. logrado", "En proceso", "No logrado"]}
        rows={heatRows}
      />
    </div>
  );
}

export function EstudiantePriorityPanel({
  estudiantes,
  total,
}: {
  estudiantes: EstudianteDemo[];
  total: number;
}) {
  const stats = tendenciaCentral(estudiantes.map((e) => e.avancePct));
  const oaCols = oaCodesForGroup(estudiantes).slice(0, 8);
  const heatRows = heatmapEstudianteOaRows(estudiantes, oaCols, 28);
  const topAltos = [...estudiantes]
    .sort((a, b) => b.avancePct - a.avancePct)
    .slice(0, 10);
  const topBajos = [...estudiantes]
    .sort((a, b) => a.avancePct - b.avancePct)
    .slice(0, 10);
  const transito = estudiantes
    .filter(transitoAmarilloVerde)
    .sort((a, b) => b.avancePct - a.avancePct)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <p className="rounded-xl border border-[var(--color-warn-soft,#FFF4E0)] bg-[var(--color-warn-soft,#FFF4E0)] px-4 py-3 text-sm text-[var(--color-navy,#0B3A6B)]">
        En ~30 segundos identifica a quién acudir primero: el mapa está ordenado de
        menor a mayor Porcentaje de logro %. Se muestran hasta 28 estudiantes con
        más dificultad
        {total > 28 ? ` (de ${pluralEstudiantes(total)})` : ""}.
      </p>
      <TendenciaCard stats={stats} />
      <HeatmapGrid
        title="Mapa de calor por estudiante (prioridad de apoyo)"
        subtitle="Orden descendente de dificultad. Color = Porcentaje de logro % del OA. Pasa el cursor para ver el OA/AE crítico."
        xAxisTitle="Objetivo de Aprendizaje (OA)"
        yAxisTitle="Estudiante"
        columns={oaCols}
        rows={heatRows}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <RankingList
          title="10 estudiantes con mayor porcentaje de logro"
          subtitle="Unidad: Porcentaje de logro %"
          items={topAltos.map((e) => ({
            id: e.id,
            label: e.nombre,
            value: `${e.avancePct}%`,
            detail: e.curso,
          }))}
        />
        <RankingList
          title="10 estudiantes más descendidos"
          subtitle="Menor Porcentaje de logro % · OA/AE crítico"
          items={topBajos.map((e) => ({
            id: e.id,
            label: e.nombre,
            value: `${e.avancePct}%`,
            detail: `${e.curso} · ${oaCriticoDe(e)}`,
          }))}
        />
        <RankingList
          title="10 estudiantes que pasaron de amarillo a verde"
          subtitle={`Comparación con ${PERIODO_ANTERIOR_LABEL}: en proceso (40–69%) → medianamente logrado o logrado (≥70%)`}
          empty="Nadie transitó de amarillo a verde respecto del periodo anterior."
          items={transito.map((e) => ({
            id: e.id,
            label: e.nombre,
            value: `${pctPeriodoAnterior(e)}% → ${e.avancePct}%`,
            detail: e.curso,
          }))}
        />
      </div>
    </div>
  );
}

export function CursoComparePanel({
  grupos,
}: {
  grupos: Array<{ key: string; estudiantes: EstudianteDemo[]; avg: number }>;
}) {
  const all = grupos.flatMap((g) => g.estudiantes);
  const stats = tendenciaCentral(all.map((e) => e.avancePct));
  const peor = [...grupos].sort((a, b) => a.avg - b.avg)[0];
  const oaCols = peor ? oaCodesForGroup(peor.estudiantes).slice(0, 8) : [];

  return (
    <div className="space-y-6">
      <p className="rounded-xl border border-[var(--color-info-soft,#E8F1FB)] bg-[var(--color-info-soft,#E8F1FB)] px-4 py-3 text-sm text-[var(--color-navy,#0B3A6B)]">
        Comparación entre cursos del recorte: avance promedio, cantidad de
        estudiantes, AE logrados y último OA/AE trabajado. El mapa de calor del
        curso más descendido ayuda a priorizar apoyo dentro del grupo.
      </p>
      <TendenciaCard stats={stats} />
      <ChartPanel
        title="Avance promedio por curso"
        subtitle="Comparación entre cursos. Unidad: Porcentaje de logro % (promedio de estudiantes del curso)."
        badge="demo"
      >
        <BarChart
          title="Porcentaje de logro % promedio por curso"
          yAxisTitle="Porcentaje de logro %"
          xAxisTitle="Curso"
          valueSuffix="%"
          items={grupos.map((g) => ({
            label: g.key.replace("Medio ", "M. "),
            value: g.avg,
            color: BANDA_LOGRO_COLOR[bandaFromPct(g.avg)],
          }))}
        />
      </ChartPanel>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-line,#D5DEE8)] bg-white shadow-[0_3px_12px_rgba(11,58,107,0.08)]">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line,#D5DEE8)] bg-[var(--color-surface,#F4F7FB)] text-xs uppercase tracking-wide text-[var(--color-muted,#6B7C8E)]">
              <th className="px-3 py-2">Curso</th>
              <th className="px-3 py-2">Cantidad de estudiantes</th>
              <th className="px-3 py-2">Porcentaje de logro % (promedio)</th>
              <th className="px-3 py-2">AE logrados (promedio)</th>
              <th className="px-3 py-2">Último OA / AE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line,#D5DEE8)]">
            {grupos.map((g) => {
              const aeAvg =
                g.estudiantes.length === 0
                  ? 0
                  : Math.round(
                      g.estudiantes.reduce((acc, e) => acc + e.aeLogrados, 0) /
                        g.estudiantes.length,
                    );
              const last = g.estudiantes.find((e) => e.ultimaActividad)?.ultimaActividad;
              return (
                <tr key={g.key}>
                  <td className="px-3 py-2 font-semibold text-[var(--color-navy,#0B3A6B)]">
                    {g.key}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {pluralEstudiantes(g.estudiantes.length)}
                  </td>
                  <td className="px-3 py-2 tabular-nums font-bold">{g.avg}%</td>
                  <td className="px-3 py-2 tabular-nums">{aeAvg} AE</td>
                  <td className="px-3 py-2 text-xs">
                    {last
                      ? `${last.oaCodigo}${last.aeCodigo ? ` / ${last.aeCodigo}` : ""}`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {peor ? (
        <HeatmapGrid
          title={`Mapa de calor del curso más descendido: ${peor.key}`}
          subtitle={`Orden de menor a mayor Porcentaje de logro %. ${pluralEstudiantes(peor.estudiantes.length)} en este curso.`}
          xAxisTitle="OA"
          yAxisTitle="Estudiante"
          columns={oaCols}
          rows={heatmapEstudianteOaRows(peor.estudiantes, oaCols, 16)}
        />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        {grupos.slice(0, 6).map((g) => {
          const altos = [...g.estudiantes].sort((a, b) => b.avancePct - a.avancePct).slice(0, 5);
          const bajos = [...g.estudiantes].sort((a, b) => a.avancePct - b.avancePct).slice(0, 5);
          const avance = g.estudiantes.filter(transitoAmarilloVerde).slice(0, 5);
          return (
            <div key={g.key} className="space-y-3">
              <h3 className="text-sm font-bold text-[var(--color-navy,#0B3A6B)]">{g.key}</h3>
              <RankingList
                title="Mayor porcentaje de logro"
                items={altos.map((e) => ({
                  id: e.id,
                  label: e.nombre,
                  value: `${e.avancePct}%`,
                }))}
              />
              <RankingList
                title="Más descendidos"
                items={bajos.map((e) => ({
                  id: e.id,
                  label: e.nombre,
                  value: `${e.avancePct}%`,
                  detail: oaCriticoDe(e),
                }))}
              />
              <RankingList
                title={`Avances significativos vs ${PERIODO_ANTERIOR_LABEL}`}
                empty="Sin tránsito amarillo → verde."
                items={avance.map((e) => ({
                  id: e.id,
                  label: e.nombre,
                  value: `${pctPeriodoAnterior(e)}% → ${e.avancePct}%`,
                }))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OaEstadoCantidadChart({
  oaCodigo,
  logrado,
  enProgreso,
  noIniciado,
  alcance = "OA",
}: {
  oaCodigo: string;
  logrado: number;
  enProgreso: number;
  noIniciado: number;
  alcance?: "OA" | "AE" | "criterio de evaluación";
}) {
  const items = [
    {
      label: "Logrado",
      value: logrado,
      color: ESTADO_BAR_COLORS.logrado,
      valueLabel: `${pluralEstudiantes(logrado)} logrados`,
    },
    {
      label: "En proceso",
      value: enProgreso,
      color: ESTADO_BAR_COLORS.en_progreso,
      valueLabel: `${pluralEstudiantes(enProgreso)} en proceso`,
    },
    {
      label: "No iniciado",
      value: noIniciado,
      color: ESTADO_BAR_COLORS.no_iniciado,
      valueLabel: `${pluralEstudiantes(noIniciado)} no iniciados`,
    },
  ];
  return (
    <BarChart
      title={`Cantidad de estudiantes según estado de avance del ${alcance} seleccionado (${oaCodigo})`}
      yAxisTitle="Cantidad de estudiantes"
      xAxisTitle="Estado de avance"
      items={items}
    />
  );
}

export function CriteriosDeEvaluacionList({
  oaCodigo,
  especialidad,
}: {
  oaCodigo: string;
  especialidad?: string;
}) {
  const oa = CATALOGO_OA.find(
    (o) => o.codigo === oaCodigo && (!especialidad || o.especialidad === especialidad),
  );
  if (!oa) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Criterios de evaluación
      </h3>
      <ul className="mt-3 space-y-3">
        {oa.ae.map((ae) => (
          <li key={ae.codigo}>
            <p className="text-xs font-bold text-brand-700">{ae.codigo} · Aprendizaje Esperado</p>
            <ul className="mt-1 space-y-1">
              {criteriosDeEvaluacion(ae).map((ce) => (
                <li
                  key={ce.codigo}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <span className="font-bold text-[var(--color-navy,#0B3A6B)]">
                    {ce.codigo}
                  </span>
                  {" — "}
                  {ce.descripcion}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
