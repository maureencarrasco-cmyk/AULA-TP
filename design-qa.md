# Design QA - Portal Aula TP Chile

## Reference

- Source: `C:/Users/Martín/Downloads/Imagen de Codex 24 sept 2026, 15_44_33.png`
- Viewport represented: 1024 x 1536 px
- Local preview: `http://127.0.0.1:8100/landing/#portal`

## Visual comparison

- Structure, section order, typography, colors, imagery and proportions match the supplied reference because the approved artwork is rendered at its native 2:3 ratio.
- Desktop rendering preserves the native 1024 px composition.
- Mobile rendering scales the full composition proportionally without horizontal overflow or cropping.
- Interactive regions remain aligned because their coordinates use percentages relative to the reference artwork.

## Functional verification

- Main navigation links scroll to real sections.
- The video CTA opens a working modal with the existing corporate video.
- Student and specialty actions link to `/portal/cursos/` or its filtered variants.
- Teacher and evidence actions link to `/portal-docente/`.
- Demo and implementation actions scroll to the contact area or open a populated email request.
- All controls have accessible names and visible keyboard focus.
- No empty links or destination-less buttons remain.

## Remaining notes

- The reference artwork contains the visible interface text. Accessible labels expose equivalent names to assistive technology.

final result: passed
