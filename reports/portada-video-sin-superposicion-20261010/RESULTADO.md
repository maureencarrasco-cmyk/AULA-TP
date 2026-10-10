# Correccion de portada: video y recuadros

Fecha: 10 de octubre de 2026.

## Cambio preparado

- Se elimina la imagen adicional del taller que el script insertaba encima del video.
- El video conserva su archivo, controles, sonido y reproduccion; ya no usa la foto del taller como poster.
- La columna derecha queda centrada verticalmente respecto al texto de la izquierda.
- Los cuatro recuadros permanecen debajo del contenido, sin margen negativo.
- Las leyendas admiten varias lineas y los recuadros se apilan en pantallas de hasta 480 px.
- Se mantienen los colores e iconos existentes. No se cambian cursos, evidencias ni navegacion del campus.

Los cambios estan en landing/aula-tp-coherence.js y .css, y sus copias en static/.
landing/INCLUIR-EN-INDEX.txt identifica la nueva version para invalidar la cache.

## Verificacion

- 8 pruebas automatizadas aprobadas: retiro de imagen, conservacion del video, inicializacion repetida, comportamiento de otros videos y sincronizacion de copias.
- Navegador: 320 px, 768 px y 1280 px. Sin desbordamientos en los recuadros ni superposicion con las leyendas.
- Escritorio: video a la derecha y centrado verticalmente.
- Video original reproducido hasta el final, duracion de 10.005 segundos.
- Evidencias: escritorio.png, movil-320.png y verificacion.json.

Vista previa: http://127.0.0.1:8100/static/landing-home-preview.html
Esta pagina de comprobacion utiliza una copia de los estilos publicados y el video ya existente en el proyecto.
Los archivos de landing-preview-assets y landing-home-preview son solamente para esta comprobacion; no sustituyen la pagina completa.

## Publicacion pendiente

Estos cambios no modifican por si solos el sitio publicado. Su envio a GitHub queda registrado en el historial del repositorio.
No hay acceso de publicacion configurado en este proyecto.
El sitio publico carga una version mas reciente del script (20261010-summary1); antes de publicar, integrar solamente este cambio en esa version para conservar sus mejoras de contenido.
No reemplazar el HTML completo de produccion por la vista previa ni sobrescribir la version reciente del script con una copia anterior.
