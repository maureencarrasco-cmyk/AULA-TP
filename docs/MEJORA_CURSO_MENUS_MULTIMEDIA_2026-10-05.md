# Mejora Aula TP · 5 octubre 2026

Producción revisada en `https://aulatpchile.cl/`.

## Qué seguía mal

- Menú público: Comunidad antes de Cómo funciona. Canónico: Inicio → Simulador → Especialidades → Cómo funciona → Comunidad → Ver catálogo → Campus → Solicitar demo.
- Hero: `videos/aula-tp-presentacion.mp4` con póster `portal-video-poster-gastronomia.png`. El texto habla de Electricidad.
- `/curso` responde y termina en `/portal/cursos/` (campus con sesión). El catálogo público no puede usar esa ruta hasta cambiar Nginx.
- `/landing/aula-tp-coherence.js` sigue en 404. `/static/aula-tp-coherence.js` responde 200, pero el HTML de `/` no lo incluye.
- Especialidades en preparación sin imagen de oficio. No deben heredar el clip de clima ni la foto de gastronomía.

## Este corte

- `landing/aula-tp-coherence.js` y copia en `static/`: reordena el menú, parte «Solicitar demo», separa Ver catálogo (`/landing/catalogo.html`) de Campus (`/portal/cursos/`), cambia el póster al header de Electricidad y pone una figura de oficio en cada card.
- `landing/catalogo.html`: grilla pública, filtro por estado, póster SVG propio por especialidad.
- Electricidad, Enfermería y Climatización quedan como simulador. Automotriz queda como misión 3D (`/mision_laboral/`), sin video de clima.

## Publicar

1. Copiar `landing/aula-tp-coherence.js`, `landing/aula-tp-coherence.css` y `landing/catalogo.html` al docroot `/landing/`.
2. Copiar las mismas js/css a `/static/`.
3. En el HTML de `/`, antes de `</body>`:

```html
<link rel="stylesheet" href="/landing/aula-tp-coherence.css?v=20261005">
<script src="/landing/aula-tp-coherence.js?v=20261005" defer></script>
```

4. Nginx, cuando se pueda: `/curso` y `/curso/` al hub público, no al Flask de `/portal/cursos/`. Hasta entonces el CTA público es `/landing/catalogo.html`.
