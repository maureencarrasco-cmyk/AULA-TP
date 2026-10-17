# Ciudad Laboral: panel visual

Panel publicado el 17 de octubre de 2026 en la ruta existente de Ciudad Laboral.

## Alcance

- `city-panel.css` presenta los controles originales con el estilo de la quinta referencia del usuario.
- `assets/panel-reference.png` es la referencia proporcionada por el usuario. Solo sus regiones fotográficas e ilustradas se usan como fondos recortados por CSS. Los textos, el reloj, los botones, el selector y la casilla siguen siendo elementos interactivos de la aplicación, no una captura superpuesta.
- `city-panel.js` agrega únicamente una tarjeta visual de Isla Minera que invoca el botón original. Espera a que termine la hidratación y respeta el estado deshabilitado de ese control.
- Se mantienen los destinos originales, las 35 especialidades, los enlaces de misión, el modo ligero y el motor 3D. Las fotos de las tres especialidades mecánicas no se reutilizan para distritos de otras áreas.

## Publicación

Versión anterior: `/opt/ciudad-laboral-releases/city-20261014-circuit-bikes-v41`.

Nueva versión: `/opt/ciudad-laboral-releases/city-20261017-panel-reference-v42`.

Actualización de aprendizaje: `/opt/ciudad-laboral-releases/city-20261017-learning-panel-v43`, con `--skin-version panel-ui-v2`. Mejora el encabezado, selector y tarjetas de distritos según el ancho disponible. El selector original sigue cambiando las especialidades y el personaje. Los recursos versionados evitan servir estilos antiguos desde la caché. El instalador sustituye las referencias anteriores sin duplicarlas y conserva el manifiesto de la versión previa.

Encabezado de Ciudad Laboral: `/opt/ciudad-laboral-releases/city-20261017-city-header-v44`, con `--skin-version panel-ui-v3`. Usa la segunda imagen proporcionada para la ilustración de fondo (`assets/city-header-reference.png`), sin modificar el archivo. El título, descripción y enlace de regreso siguen siendo elementos originales accesibles. La ilustración se recorta proporcionalmente con CSS; en teléfono se coloca debajo del texto. Los 37 archivos originales del motor permanecen intactos.

`deploy.py` crea una versión separada, reemplaza mediante nuevos archivos solamente los dos HTML de entrada y agrega la carpeta `panel-ui-v1`. Verifica que los 37 archivos JavaScript originales del juego conserven sus hashes. La activación cambia el enlace simbólico del sitio de forma atómica; la versión anterior sigue disponible para recuperación. No cambia Nginx, certificados, bases de datos ni archivos del motor.

## Verificación

`node --test city-panel/panel.test.cjs`

Se verificaron el renderizado de la escena, la selección de distrito, el acceso a Isla Minera y su cambio de personaje, la disponibilidad de las 35 especialidades, la casilla de modo ligero y el diseño en escritorio y teléfono. La apertura del mapa resultó demasiado exigente para el navegador de pruebas; su código y su botón original se conservaron sin modificaciones.

`preview.py` permite revisar el panel localmente sobre la aplicación publicada. No crea una copia del motor ni de los modelos.
