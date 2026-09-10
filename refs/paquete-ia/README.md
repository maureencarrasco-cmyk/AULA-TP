# Aula TP Chile - paquete para IA de programación

Este paquete reúne los 10 sitios Aula TP Chile identificados en la conversación de referencia, en el orden solicitado:

1. Pantalla principal
2. Presentación del curso
3. Estación 1
4. Estación 2 AE1
5. Estación 2 AE2
6. Estación 2 AE3
7. Estación 3
8. Estación 4
9. Estación 5
10. Versión adicional Refrigeración y Climatización

## Qué contiene

- manifest.json: listado estructurado con nombre, propósito, orden, URL, estado, metadatos de Sites, versión, commit y hash del archivo interno de cada sitio.
- Una carpeta por sitio, numerada en orden.
- En cada carpeta:
  - metadata.json: ficha técnica del sitio.
  - contenido-recuperado/contenido-textual-recuperado.md: contenido textual recuperable desde los metadatos y la verificación de acceso.
  - capturas/screenshot-sites.png: captura visual descargada desde Sites cuando estuvo disponible.
  - uente-original/NO_EXTRAIDO.md: nota explícita sobre la fuente original no extraída.

## Limitación importante

Los sitios están activos en ChatGPT Sites, pero configurados con acceso custom. La descarga directa de sus URLs responde 401 Unauthorized. Al intentar entrar con navegador, OpenAI solicita consentimiento para compartir perfil básico con el sitio antes de permitir acceso autenticado. Ese consentimiento no fue aprobado desde esta automatización, por lo que no se extrajo el código fuente original ni el HTML renderizado autenticado.

Para una IA de programación, los datos más útiles para reconstrucción están en manifest.json y en las capturas de cada carpeta. Los campos project_id, ersion_id, source_commit_sha, rchive_content_hash, rchive_size_bytes y rchive_file_count permiten rastrear la procedencia de cada versión dentro de Sites.

## URLs incluidas

1. Pantalla principal: https://aula-tp-chile-ruta-0909.xam345345.chatgpt.site
2. Presentación del curso: https://aula-tpi-refrigeracion-climatizacion.xam345345.chatgpt.site
3. Estación 1: https://aula-tp-chile-estacion-1.xam345345.chatgpt.site
4. Estación 2 AE1: https://aula-tp-chile-estaciones.xam345345.chatgpt.site
5. Estación 2 AE2: https://aula-tp-chile-estacion-2.xam345345.chatgpt.site
6. Estación 2 AE3: https://aula-tp-estacion-2-ae3.xam345345.chatgpt.site
7. Estación 3: https://aula-tp-chile-estacion-3.xam345345.chatgpt.site
8. Estación 4: https://aula-tp-chile-evaluacion-final.xam345345.chatgpt.site
9. Estación 5: https://aula-tp-estacion5-cierre.xam345345.chatgpt.site
10. Versión adicional Refrigeración y Climatización: https://aula-tp-chile-refrigeracion-climatizacion.xam345345.chatgpt.site

