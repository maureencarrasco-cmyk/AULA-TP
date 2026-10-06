# Mejora Aula TP · 6 octubre 2026

Producción revisada en https://aulatpchile.cl/.

## Hallazgos

- Menú público: Comunidad antes de Cómo funciona. Falta Ver catálogo. Campus y catálogo comparten «Entrar a cursos».
- «Solicitar demo» y «Demo» apuntan a `#preguntas`. El formulario real es `#lead-form`.
- El botón móvil es `Solicitar<br>demo` y se lee «Solicitardemo».
- Hero: `videos/aula-tp-presentacion.mp4` con póster `portal-video-poster-gastronomia.png`, mientras el texto habla de Electricidad.
- `/landing/aula-tp-coherence.js` no está incluido en el HTML de `/`. El campus en `/portal/cursos/` sí responde `/api/session`.

## Este corte

- `landing/aula-tp-coherence.js` v20261006: orden canónico, demo al formulario, separa Ver catálogo y Campus, póster de Electricidad, figura de oficio por card. El video se mantiene visible.
- Misma copia en `static/aula-tp-coherence.js`.
- `climatizacion-web/lib/course-portal.ts`: `DEMO_HREF` pasa de `/#preguntas` a `/#lead-form`.

## Publicar el HTML estático

Antes de `</body>` en el index de `/`:

```html
<link rel="stylesheet" href="/landing/aula-tp-coherence.css?v=20261006">
<script src="/landing/aula-tp-coherence.js?v=20261006" defer></script>
```

Copiar js/css a `/landing/` y a `/static/`. Sin ese script el HTML de producción no cambia.
