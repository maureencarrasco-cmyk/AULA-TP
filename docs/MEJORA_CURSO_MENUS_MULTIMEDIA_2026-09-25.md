# Mejora Aula TP · 25 septiembre 2026

Alcance: campus `xamoxor5775/aula-tp-chile` desplegado en `aulatpchile.cl`.

## Imperfecciones del curso que se corrigen

- Las tarjetas decían «N módulos | 5 estaciones» y un único sello «3° y 4° medio», aunque Refrigeración mezcla 4 módulos de 3° con 5 de 4°.
- El botón **Atrás** aparecía en Inicio y salía del campus hacia la landing.
- **Herramientas de apoyo** se montaba en el catálogo, mezclando chrome de estación con el menú de cursos.
- `menu-logic.js` marcaba Electricidad, Enfermería y Administración como «Próximamente» aunque ya están publicadas.

## Menús

Cadena canónica por módulo:

1. Contextualización
2. Aprendizajes esperados (3 × 6)
3. Situación integradora
4. Evaluación final (sin Tutor ni Práctica Libre)
5. Cierre

Chrome excluyente: público / estudiante / docente.

El query `?q=` de la landing (`/portal/cursos/?q=Electricidad`) ahora filtra el catálogo del campus y se recuerda hasta «Ver todas».

## Multimedia

Pendiente de despliegue en la landing (no vive en este repo):

- El video hero existe (`/landing/media/aula-tp-cuando-la-inteligencia.mp4`) pero no hace autoplay; el poster de enfermería queda como imagen fija.
- CTA «Ver catálogo de cursos» apunta al login, no a un catálogo público. El filtro `q` cierra ese hueco después de ingresar.

En el campus, las portadas siguen la especialidad (`specialtyCover` / `headers/{especialidad}`).

## Archivos

- `static/app.js`
- `static/menu-logic.js`
- `static/menu-logic.css`
- `static/index.html` (cache bust)
