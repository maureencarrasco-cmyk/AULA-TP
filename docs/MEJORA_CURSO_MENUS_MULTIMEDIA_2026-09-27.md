# Mejora Aula TP · 27 septiembre 2026

Auditoría de producción `aulatpchile.cl` + repo `aula-tp-chile`.

## Imperfecciones corregidas

- Cards del hero pegaban el verbo con el complemento (`Simulasituaciones`). Causa: HTML pasó de `<a>` a `<div.capability-card>` y el CSS flex quedó huérfano.
- Hero usaba póster y video de gastronomía mientras el copy habla de Electricidad, Enfermería y Climatización.
- Administración estaba `live` en `course-hubs.ts` y “En preparación” en la landing.
- “Ver catálogo de cursos” mandaba al login `/portal/cursos/` en vez de la grilla pública.

## Lógica de menús

Cadena pública:

1. Inicio → Simulador → Especialidades → Cómo funciona → Comunidad
2. `Cursos vivos` → `/curso` (hubs Next de especialidades publicadas)
3. `Entrar al campus` → `/portal/cursos/` (sesión institucional)
4. `Solicitar demo` → `#preguntas` / `#lead-form`
5. Dialog de especialidad viva → `/curso/{slug}`
6. Especialidad en preparación → `#preguntas`

Header Next (`climatizacion-web/components/Header.tsx`) alineado a esa IA. Menú móvil incluido.

## Multimedia faltante

- Hero muestra el simulador de Electricidad como visual principal; el video queda como clip secundario.
- `static/media-fallback.js` cubre M5–M8 de climatización con `climate-secuencia` si no hay clip propio.
- Videos rotos siguen cayendo a aviso + imagen de oficio. No se reutiliza material de otra especialidad como si fuera el módulo actual.

## Deploy

Copiar `landing/index.html`, `landing/portal-reference.css` y `landing/portal-reference.js` al docroot del sitio (`/` + `/landing/`) y bump `?v=20260927.1`.
