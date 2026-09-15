"use client";

import LearningPath, { type PathProgress } from "@/components/curso/shared/LearningPath";
import { getCourseHub } from "@/lib/course-hubs";
import "@/app/curso/climatizacion/hub.css";
import "@/app/curso/climatizacion/learning-path.css";

const DEMO_PROGRESS: PathProgress[] = [
  { numero: 1, completed: 8, total: 8, pct: 100 },
  { numero: 2, completed: 8, total: 8, pct: 100 },
  {
    numero: 3,
    completed: 0,
    total: 8,
    pct: 0,
    nextTitle: "Contextualización — Comprendo la situación · Vivienda social Valparaíso",
  },
  { numero: 4, completed: 0, total: 8, pct: 0 },
];

export default function RutaAprendizajePreviewPage() {
  const hub = getCourseHub("climatizacion");
  if (!hub) return null;
  const nums = [1, 2, 3, 4];
  const modules = hub.modules.filter((m) => nums.includes(m.numero));
  const subtitle = "Tu ruta pedagógica: avanza estación por estación hasta la meta del programa.";

  return (
    <div className="aula-font aula-preview-page">
      <div className="aula-preview-banner">
        <div>
          <strong>Vista local — Ruta pedagógica</strong>
          <p>Paisaje + camino + hitos. No está desplegado en aulatpchile.cl todavía.</p>
        </div>
        <nav className="aula-preview-jump" aria-label="Atajos">
          <a href="#ruta-pedagogica">Ver ruta</a>
        </nav>
      </div>
      <div className="aula-preview-wrap">
        <p className="aula-preview-intro">
          Esto ya no es una fila de tarjetas: es un <strong>viaje por estaciones</strong>. El camino recorre un paisaje realista; cada módulo es una caja con margen, borde, padding y contenido; la bandera marca la meta.
        </p>

        <section id="ruta-pedagogica" className="aula-preview-block">
          <h2>Ruta pedagógica · viaje por estaciones</h2>
          <p>Montañas reales, camino asfaltado, hitos 1–4 y meta al cierre. Las tarjetas usan box-sizing: border-box.</p>
          <LearningPath
            variant="pedagogica"
            title="3° medio · M1–M4"
            subtitle={subtitle}
            modules={modules}
            nums={nums}
            progress={DEMO_PROGRESS}
            totalModules={hub.modules.length}
            showModelTag
          />
        </section>
      </div>
    </div>
  );
}
