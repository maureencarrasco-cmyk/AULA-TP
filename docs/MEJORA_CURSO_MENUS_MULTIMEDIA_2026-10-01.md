# Mejora Aula TP · 1 octubre 2026

## Qué sigue roto en producción

- Menú público: Comunidad va antes de Cómo funciona. El orden canónico es Inicio → Simulador → Especialidades → Cómo funciona → Comunidad.
- Hero usa `videos/aula-tp-presentacion.mp4` con póster `portal-video-poster-gastronomia.png`. El copy habla de Electricidad, Enfermería y Climatización.
- `/curso` responde 301 a `/portal/cursos/`. El catálogo público no debe caer al campus con sesión.
- `/landing/aula-tp-coherence.js` no está publicado (404). El parche anterior no corre.
- `fab-boot.js` monta Herramientas de apoyo en la pantalla de carga, antes de saber el rol.
- Un módulo sin video propio no debe heredar el clip de otra especialidad.

## Menús

1. Inicio → Simulador → Especialidades → Cómo funciona → Comunidad
2. Cursos vivos → `/curso` (grilla pública, sin login)
3. Campus → `/portal/cursos/`
4. Portal docente → `/portal-docente`
5. Demo y especialidad en preparación → `/#preguntas`
6. Estudiante: sin revisión administrador. Evaluación final sin práctica libre ni tutor.
7. FAB solo dentro de un módulo, y no en la estación 4 si el rol no es docente.

## Multimedia

- Posters locales en `static/themes/poster-*.svg`.
- Secuencia solo si la especialidad tiene clip propio: electricidad, enfermería, climatización M1–M4 y secuencia de clima.
- Automotriz y el resto no reutilizan el video de clima. Muestran poster de oficio y la consigna.

## Deploy

1. Publicar `static/aula-tp-coherence.js` y `.css` (copia de `landing/`).
2. En el HTML de `/` incluir:
   - `/static/aula-tp-coherence.css?v=20261001`
   - `/static/aula-tp-coherence.js?v=20261001`
3. Nginx: `/curso` y `/curso/` al hub Next, no al Flask de `/portal/cursos/`.
4. Invalidar `menu-logic.js`, `media-fallback.js` y `fab-boot.js` con `v=20261001`.
