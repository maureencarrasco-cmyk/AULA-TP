# Mejora Aula TP · 9 octubre 2026

Producción revisada en https://aulatpchile.cl/ y https://aulatpchile.cl/landing/catalogo.html.

## Qué seguía mal

- Home: Mecánica Automotriz marcada «En preparación». El catálogo y `/mision_laboral/` la tienen como misión 3D.
- Pie público: Inicio → Simulador → Especialidades → Cómo funciona → Comunidad → Demo. Faltan Ver catálogo y Campus.
- Catálogo: Demo apunta a `/#preguntas`. El formulario es `/#lead-form`.
- Catálogo: Electricidad, Enfermería y Climatización entran a `/portal/cursos/` sin filtro. Gastronomía no aparece, aunque el campus sí tiene la ruta.
- Pósters del catálogo: siglas SVG para oficios con foto propia. `06-cocina.png` no se reutiliza: la auditoría del 8 de octubre lo marca como escena de climatización.

## Este corte

- `landing/aula-tp-coherence.js` v20261009 y copia en `static/`: badge Automotriz a Misión 3D, pie con Ver catálogo y Campus, demo a `#lead-form`, hero de Electricidad.
- `landing/catalogo.html`: filtro Campus, deep-link `?q=`, fotos locales de Electricidad, Enfermería y taller de clima, misión automotriz sin video de clima, Cocina y Pastelería como ruta de campus sin simulador propio.

## Publicar

Copiar js/css a `/landing/` y `/static/`, y `catalogo.html` a `/landing/`. En el index de `/`:

```html
<link rel="stylesheet" href="/landing/aula-tp-coherence.css?v=20261009">
<script src="/landing/aula-tp-coherence.js?v=20261009" defer></script>
```

Sin ese bump de versión el HTML cacheado sigue en v20261007.
