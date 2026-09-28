# Mejora Aula TP · 28 septiembre 2026

## Qué estaba roto en producción

- `/curso` redirigía a `/portal/cursos/` (login) y en el proxy armaba `ERR_TOO_MANY_REDIRECTS`.
- “Ver catálogo de cursos” y “Entrar a cursos” caían al campus con sesión.
- Cards del hero: `Simulasituaciones`, `Practicade`, `Reciberetroalimentación`, `Demuestralo`.
- Video `aula-tp-presentacion.mp4` muestra pastelería; el copy habla de Electricidad / Enfermería / Climatización.
- Orden del menú no coincidía con el scroll: Especialidades saltaba Comunidad y Cómo funciona.

## Lógica de menús (fuente de verdad)

1. Inicio → Simulador → Especialidades → Cómo funciona → Comunidad
2. `Cursos vivos` → `/curso` (grilla pública, sin login)
3. Hub publicado → `/curso/{slug}`
4. `Campus` → `/portal/cursos/` (cuenta institucional)
5. `Portal docente` → `/portal-docente`
6. `Solicitar demo` → `/#preguntas`
7. Especialidad en preparación → `/#preguntas`

Constante: `climatizacion-web/lib/course-portal.ts`.

## Multimedia

- Hero Next usa el simulador de circuitos, no un clip de otro oficio.
- Parche `landing/aula-tp-coherence.js` oculta el video si el src/póster es gastronomía y pone el poster eléctrico.
- LMS: `static/media-fallback.js` sigue cubriendo clips faltantes por especialidad (M5–M8 climatización → `climate-secuencia`).

## Deploy

1. Rebuild + release de `climatizacion-web`.
2. En el docroot estático de `/` incluir:
   - `landing/aula-tp-coherence.css?v=20260928`
   - `landing/aula-tp-coherence.js?v=20260928`
3. Nginx: `/curso` y `/curso/` deben ir a Next, no al Flask de `/portal/cursos/`.
