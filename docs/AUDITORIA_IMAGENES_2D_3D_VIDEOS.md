# Auditoría de imágenes 2D, 3D y videos — Aula TP

Fecha: 2026-09-25. Universo inicial congelado: 29085 referencias en 451 módulos / 45 cursos.
Prompt: docs/PROMPT_MAESTRO_AUDITORIA_IMAGENES_2D_3D_VIDEOS.txt

## Porcentaje inicial (antes de gobernanza de medios, evidencia en SQLite)

- Referencias con archivo en disco: **11.2%** (3258 / 29085).
- Recursos etiquetados como 3D en el JSON almacenado (no verificados como modelo 3D): 2852.
- APTO pedagógicamente (prueba de 17 preguntas + especialista): **0%**.
- Validación técnica de imagen/3D/video por especialista: **0%**.
- Recursos IA revisados por especialista: **0%**.

No se declara 100% multimedia. El archivo ausente y la etiqueta 3D sobre PNG son hallazgos, no fallos de inventario.

## Después de aplicar el protocolo (inventario + formato honesto + contingencia)

- Inventariados: 100.0% de 29406 ítems del inventario.
- Archivo presente o interactivo real: 12.2%.
- Alt o contingencia textual: 99.5%.
- OA/AE trazable: 100.0%.
- Propósito y acción del estudiante (gobernanza): 100.0%.
- Videos con archivo: 24 / 24 (los 4 mp4 de climatización no se reutilizan en otras especialidades).
- 3D interactivo o simulación (circuito, escena con partes): 9.
- Contingencia textual (sin archivo, no se muestra 404): 25826.
- APTO pedagógico / validación técnica: 0.0% / 0.0%.

## Camino al 100% (bloqueado hasta evidencia)

1. Fotografías o ilustraciones técnicas reales por especialidad (reemplazan headers y 404).
2. Mínimo 3 recursos 3D distintos por módulo **solo** si el AE lo necesita; no se inventan para la cuota.
3. Videos procedimentales propios, con EPP, VTT y protocolo antes-durante-después, validados por docente de oficio.
4. Revisión especialista: exactitud, seguridad, accesibilidad y prueba del estudiante (prompt 40–51).
5. Recién entonces pueden subir APTO pedagógico y validación técnica. Hasta ahí el techo honesto es el inventario, no el sello.

## Correcciones ya aplicadas

- PNG/WebP ya no se clasifican como 3D.
- Videos de climatización no se cuelgan en otras especialidades.
- Rutas inexistentes salen de pantalla; queda contingencia textual + alt/consigna.
- Cada referencia recibe ID, OA/AE, propósito, qué observar y acción.
- No se fabricó multimedia nueva ni se inventaron licencias.

{
  "inicial": {
    "referencias": 29085,
    "archivo_presente_pct": 11.2,
    "etiquetados_3d_sin_verificar": 2852,
    "apto_pedagogicamente_pct": 0.0,
    "tecnicamente_validado_pct": 0.0,
    "ia_revisado_pct": 0.0,
    "archivos": 3258
  },
  "protocolo": {
    "inventariados_pct": 100.0,
    "archivo_o_interactivo_pct": 12.2,
    "alt_o_contingencia_pct": 99.5,
    "oa_ae_pct": 100.0,
    "proposito_y_accion_pct": 100.0,
    "videos_con_archivo": 24,
    "videos_en_inventario": 24,
    "3d_o_simulacion": 9,
    "contingencia_textual": 25826,
    "apto_pedagogicamente_pct": 0.0,
    "tecnicamente_validado_pct": 0.0
  },
  "cursos": 45,
  "modulos": 451
}
