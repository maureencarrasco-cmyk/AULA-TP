# Mejora Aula TP · 26 septiembre 2026

Alcance: campus `static/` y header del sitio Next en `climatizacion-web`.

## Imperfecciones del curso

- El filtro `?q=` de la landing solo miraba título/especialidad/nivel. Un sector como «Agropecuaria» o «Salud y Educación» dejaba el catálogo vacío.
- Las tarjetas se eliminaban del DOM al filtrar; al limpiar el filtro dependían de un re-render completo.
- El chrome de catálogo/login seguía mezclando FAB de herramientas y botón Atrás si `fab-boot.js` las volvía a montar.

## Lógica de menús

- Tres chromes excluyentes: público / estudiante / docente.
- Cadena canónica visible: Contextualización → Aprendizajes esperados → Situación integradora → Evaluación final → Cierre.
- Evaluación (estación 4): Tutor y Práctica Libre se ocultan al estudiante, no solo se deshabilitan.
- `MutationObserver` ya no observa `class`. Evita el bucle que disparaba `applyChrome` al marcar `chrome-student`.
- `data-screen` se infiere del hash cuando el body todavía no lo declara.
- Header público: «Campus» entra al LMS; «Especialidades» ancla a productos. Menú móvil añadido.

## Multimedia faltante

- `static/media-fallback.js` entrega la secuencia local del módulo (`m1`–`m4` o especialidad) cuando la actividad no declara video.
- Si el `<video>` falla, se sustituye por un aviso y se sigue con la consigna escrita.
- Imágenes rotas de estación/catálogo caen a `workshop.webp`.
- Videos de secuencia existentes: climate, electricidad, enfermería, general y m1–m4.

## Archivos

- `static/menu-logic.js`
- `static/menu-logic.css`
- `static/campus-coherence.js`
- `static/media-fallback.js` (nuevo)
- `static/index.html`
- `climatizacion-web/components/Header.tsx`
