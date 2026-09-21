# Plan de mejora Aula TP Chile
Fecha: 21 septiembre 2026
Alcance: campus local y portal público aulatpchile.cl

Fuente de verdad ampliada: `docs/MEJORA_CURSO_MENUS_MULTIMEDIA_2026-09-21.md`.

## Regla de menús
Tres chromes excluyentes: público, estudiante, docente. Las herramientas de administrador no se renderizan para el estudiante. Práctica Libre y Tutor se apagan en Evaluación.

Implementado en `static/menu-logic.js` + `static/menu-logic.css` (incluido desde `static/index.html`).

## Cadena del curso
Contextualización → AE (3 x 6) → Situación Integradora (15 casos + escena) → Evaluación → Cierre.
Práctica Libre es paralela y no altera nota ni porcentaje.

## Alcance honesto
Refrigeración y Climatización 3° medio: 4 módulos. No marcar Electricidad, Atención de Enfermería ni Administración como Publicada sin banco propio.

## Multimedia P0
Hero landing reproducible, plano M1, display M2, VTT reales m1-m4, fallback si el 3D no carga, `static/themes/estacion5-hero.png`.
