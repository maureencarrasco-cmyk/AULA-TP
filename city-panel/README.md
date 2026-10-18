# Ciudad Laboral: panel visual

Panel publicado el 17 de octubre de 2026 en la ruta existente de Ciudad Laboral.

## Alcance

- `city-panel.css` presenta los controles originales con el estilo de la quinta referencia del usuario.
- `assets/panel-reference.png` es la referencia proporcionada por el usuario. Solo sus regiones fotográficas e ilustradas se usan como fondos recortados por CSS. Los textos, el reloj, los botones, el selector y la casilla siguen siendo elementos interactivos de la aplicación, no una captura superpuesta.
- `city-panel.js` conserva la tarjeta de Isla Minera que invoca el botón original y añade la guía de ruta en el mapa sin reemplazar controles ni escenas del motor.
- Se mantienen los destinos originales, las 35 especialidades, los enlaces de misión, el modo ligero y el motor 3D. Las fotos de las tres especialidades mecánicas no se reutilizan para distritos de otras áreas.

## Guía dinámica por distrito

`city-panel.js` lee las coordenadas `data-player-x` y `data-player-z` que publica el escenario original, junto a las posiciones de los marcadores del mapa. Un enlace con `cityRoute=<distrito>` abre el mapa y traza una ruta amarilla en su proyección 3D; la ruta y el estado de llegada se actualizan mientras se mueve el personaje. `static/city-experience.js` genera ese enlace para el curso/módulo seleccionado y para las áreas ganadas.

La ruta termina en el distrito existente. El motor publicado no expone una API para crear o abrir puertas de nuevas áreas profesionales, así que el adaptador no altera el motor ni simula ese desbloqueo físico.

## Publicación

Versión anterior: `/opt/ciudad-laboral-releases/city-20261014-circuit-bikes-v41`.

Nueva versión: `/opt/ciudad-laboral-releases/city-20261017-panel-reference-v42`.

Actualización de aprendizaje: `/opt/ciudad-laboral-releases/city-20261017-learning-panel-v43`, con `--skin-version panel-ui-v2`. Mejora el encabezado, selector y tarjetas de distritos según el ancho disponible. El selector original sigue cambiando las especialidades y el personaje. Los recursos versionados evitan servir estilos antiguos desde la caché. El instalador sustituye las referencias anteriores sin duplicarlas y conserva el manifiesto de la versión previa.

Encabezado de Ciudad Laboral: `/opt/ciudad-laboral-releases/city-20261017-city-header-v44`, con `--skin-version panel-ui-v3`. Usa la segunda imagen proporcionada para la ilustración de fondo (`assets/city-header-reference.png`), sin modificar el archivo. El título, descripción y enlace de regreso siguen siendo elementos originales accesibles. La ilustración se recorta proporcionalmente con CSS; en teléfono se coloca debajo del texto. Los 37 archivos originales del motor permanecen intactos.

`deploy.py` crea una versión separada, reemplaza mediante nuevos archivos solamente los dos HTML de entrada y agrega la carpeta `panel-ui-v1`. Verifica que los 37 archivos JavaScript originales del juego conserven sus hashes. La activación cambia el enlace simbólico del sitio de forma atómica; la versión anterior sigue disponible para recuperación. No cambia Nginx, certificados, bases de datos ni archivos del motor.

## Verificación

### Recuperación tras publicación del motor

La publicación `city-20261017-professional-learning-v47` reemplazó los HTML y omitió el diseño. Se restauró sobre esa misma base en `city-20261017-learning-and-design-v48`, usando `--skin-version panel-ui-v6`, conservando sus 39 archivos JavaScript y las mejoras pedagógicas. No fue un problema de caché. Las futuras publicaciones completas deben incluir esta capa visual en ambos HTML y sus recursos, además del motor; subir este repositorio a GitHub por sí solo no modifica la publicación del servidor.

Comprobación posterior: la página pública debe referenciar `panel-ui-v6/city-panel.css` y `panel-ui-v6/city-panel.js`, sus imágenes deben responder 200 y `panel-ui-release.json` debe identificar la base conservada. Antes de activar otra versión, comprobar también visualmente el encabezado y el panel.

`node --test city-panel/panel.test.cjs`

Se verificaron el renderizado de la escena, la selección de distrito, el acceso a Isla Minera y su cambio de personaje, la disponibilidad de las 35 especialidades, la casilla de modo ligero y el diseño en escritorio y teléfono. La apertura del mapa resultó demasiado exigente para el navegador de pruebas; su código y su botón original se conservaron sin modificaciones.

`preview.py` permite revisar el panel localmente sobre la aplicación publicada. No crea una copia del motor ni de los modelos.
