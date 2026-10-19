# Ciudad Laboral: panel visual

## Flechas En La Ciudad Original

`native-route.js` dibuja las flechas en el escenario original, con las clases Three.js que ya usa ese motor. Lee sus puestos, posición del personaje, piso y obstáculos; calcula caminos transitables con `javascript-astar` 0.4.1 (MIT, conservado en `engine/vendor`). No crea otra sala ni mueve automáticamente al estudiante.

La guía comienza en el quiz 1 y sigue el primer quiz pendiente del desafío profesional nativo. Un evento emitido después de guardar el progreso existente comunica módulo, AE, preguntas y respuestas a la guía. Una respuesta incorrecta conserva el destino mientras el desafío pide corregirla. Varios quizzes pueden utilizar un mismo puesto. La guía no modifica preguntas, calificaciones, aprobaciones ni recompensas. Si aún no se eligió un módulo, orienta al primer puesto y permite abrir el desafío profesional existente.

Cada puesto muestra su propia placa 3D translúcida y luminosa con número consecutivo, nombre del equipo y tecla `E`, más un halo sobre el suelo. Las placas siguen la orientación del estudiante y usan el mismo catálogo de puestos de cada especialidad. Los letreros decorativos del muro se sustituyen por estos marcadores y se reemplaza la tarjeta duplicada de la esquina; la acción accesible de apertura se conserva al acercarse.

`deploy_native_route.py` incorpora dos puntos de integración mínimos al programa publicado: lectura del mundo antes del renderizado y notificación después del guardado del quiz. Exige los SHA-256 exactos del motor y del desafío conocidos; rechaza otras versiones. Genera archivos y runtime con nombres nuevos para no reutilizar la caché, conserva los originales y activa una versión reversible. No se debe ejecutar sobre una publicación desconocida ni actualizar las huellas sin auditar los nuevos programas.

`scripts/verify-native-route.cjs` comprueba el hangar real, flechas visibles, el evento real del desafío y los cambios de ruta mediante eventos de prueba. `--all` recorre las 35 especialidades; `--published` verifica el sitio sin interceptar archivos. `tests/test_native_route_patch.py` comprueba el rechazo de builds desconocidos o anclas ambiguas. Las pruebas no certifican los aprendizajes ni aprueban estudiantes.

Publicado en `/opt/ciudad-laboral-releases/city-20261018-native-floor-quiz-arrows-v64`, recursos `panel-ui-v18`. La revisión previa recorrió las 35 especialidades sin errores y la verificación publicada comprobó el hangar original, evento real del quiz, avance de destino y móvil. Los archivos originales siguen disponibles; dos copias versionadas incorporan los hooks y un runtime nuevo las selecciona. La revisión publicada de la guía no cambia las reglas de evaluación del campus.

El ajuste móvil posterior se publicó en `city-20261018-native-arrows-mobile-v65`: estilos `panel-ui-v19`, conservando los hooks nativos v18. Limita el ancho de la indicación para que no invada la botonera del escenario.

## Motor Editable De Quizzes

`engine/main.js` crea un recorrido 3D de conocimientos con Three.js 0.180.0 (copia local y licencia MIT en `engine/vendor`). `engine/route.js` calcula la secuencia y las flechas amarillas sobre el suelo. No es una recuperación del código del motor antiguo: es un recorrido adicional editable, con una sala compartida de terminales y contenidos obtenidos del módulo autorizado. No reemplaza los edificios ni las misiones de la ciudad original.

Desde una especialidad abierta con `cityModuleId`, aparece el enlace «Recorrido 3D de quizzes». Conserva el curso y módulo en la navegación y permite regresar a la ciudad original. Cada terminal se activa por proximidad, guarda la respuesta mediante la API existente y cambia el destino únicamente después de confirmar el guardado. Las respuestas incorrectas conservan su explicación y las reglas de recuperación del campus; no aprueban automáticamente la etapa. El estado del servidor permite retomar el recorrido tras recargar. No se incorpora un banco de preguntas genéricas al sitio.

Validación: `node --test tests/city-route.test.mjs city-panel/panel.test.cjs tests/city-experience-hero.test.mjs`. `scripts/verify-city-route.cjs` comprueba renderizado, movimiento, error de guardado, retroalimentación, avance, reanudación y móvil usando respuestas de API simuladas, no cuentas de estudiantes. No sustituye una prueba autenticada de extremo a extremo en producción.

Publicado en `/opt/ciudad-laboral-releases/city-20261018-editable-quiz-route-v63`, con recursos `panel-ui-v17`. El despliegue conservó los 42 archivos JavaScript originales del motor antiguo. La comprobación de navegador se ejecutó también contra estos recursos publicados con la API simulada. Los módulos se cargan como archivos `.js` para respetar los tipos MIME del servidor sin cambiar su configuración.

Panel publicado el 17 de octubre de 2026 en la ruta existente de Ciudad Laboral.

## Alcance

- `city-panel.css` presenta los controles originales con el estilo de la quinta referencia del usuario.
- `assets/panel-reference.png` conserva la referencia proporcionada por el usuario. Sus variantes WebP mantienen las dimensiones y se usan como fondos recortados por CSS. Los textos, el reloj, los botones, el selector y la casilla siguen siendo elementos interactivos de la aplicación, no una captura superpuesta.
- `city-panel.js` conserva la tarjeta de Isla Minera que invoca el botón original y añade la guía de ruta en el mapa sin reemplazar controles ni escenas del motor.
- Se mantienen los destinos originales, las 35 especialidades, los enlaces de misión, el modo ligero y el motor 3D. Las fotos de las tres especialidades mecánicas no se reutilizan para distritos de otras áreas.

## Rendimiento Compartido

La optimización del panel se aplica a todos los cursos que usan la ciudad existente. Las dos imágenes decorativas pasan de 3.092.765 a 344.652 bytes (88,9% menos), sin cambiar sus dimensiones; los PNG originales quedan como referencia. Se regeneran con `python scripts/optimize-city-panel-assets.py`.

El adaptador espera a que la escena esté montada antes de agregar controles. Filtra las mutaciones de texto del HUD, agrupa los cambios estructurales en una actualización por cuadro y suspende la guía al ocultar el mapa o la pestaña. Los trazos del mapa se escriben solo cuando cambian. Los controles superpuestos evitan el desenfoque del fondo 3D y las secciones fuera de vista pueden omitir su pintura.

`node --test city-panel/panel.test.cjs` comprueba carga diferida, agrupación de cambios, controles y las 35 especialidades originales. `node scripts/verify-city-panel-performance.cjs` compara el sitio publicado con los recursos locales interceptados, comprueba la escena, el movimiento, los distritos y las vistas de escritorio y teléfono. Deja mediciones y capturas en `tmp/city-performance-qa/`. Esta comprobación no publica archivos ni modifica los modelos del motor.

## Guía Dinámica

`city-panel.js` añade «Guiarme a mi distrito» al panel original, lee las coordenadas `data-player-x` y `data-player-z` del personaje y proyecta su posición y los marcadores del mapa. Traza una ruta amarilla en el mapa 3D y actualiza la ruta y el estado de llegada mientras se mueve el personaje. Un enlace con `cityRoute=<distrito>` activa la misma guía al abrir la ciudad; `static/city-experience.js` genera ese enlace para el curso/módulo seleccionado y para las áreas ganadas.

La ruta termina en el distrito existente. El motor publicado no expone una API para crear o abrir puertas de nuevas áreas profesionales, así que el adaptador no altera el motor ni simula ese desbloqueo físico.

## Publicación

Versión anterior: `/opt/ciudad-laboral-releases/city-20261014-circuit-bikes-v41`.

Nueva versión: `/opt/ciudad-laboral-releases/city-20261017-panel-reference-v42`.

Guía de ruta amarilla: `/opt/ciudad-laboral-releases/city-20261018-dynamic-guide-v54`, con `--skin-version panel-ui-v8`. El panel añade «Guiarme a mi distrito» y dibuja una línea sobre el mapa 3D usando la posición actual del personaje y la proyección de los marcadores existentes. El despliegue conservó los 42 archivos JavaScript originales del motor y dejó la versión anterior enlazada para recuperación. Se verificaron HTTP 200 en la página y recursos v8.

Actualización de aprendizaje: `/opt/ciudad-laboral-releases/city-20261017-learning-panel-v43`, con `--skin-version panel-ui-v2`. Mejora el encabezado, selector y tarjetas de distritos según el ancho disponible. El selector original sigue cambiando las especialidades y el personaje. Los recursos versionados evitan servir estilos antiguos desde la caché. El instalador sustituye las referencias anteriores sin duplicarlas y conserva el manifiesto de la versión previa.

Encabezado de Ciudad Laboral: `/opt/ciudad-laboral-releases/city-20261017-city-header-v44`, con `--skin-version panel-ui-v3`. Usa la segunda imagen proporcionada para la ilustración de fondo (`assets/city-header-reference.png`), sin modificar el archivo. El título, descripción y enlace de regreso siguen siendo elementos originales accesibles. La ilustración se recorta proporcionalmente con CSS; en teléfono se coloca debajo del texto. Los 37 archivos originales del motor permanecen intactos.

`deploy.py` crea una versión separada, reemplaza mediante nuevos archivos solamente los dos HTML de entrada y agrega la carpeta `panel-ui-v1`. Verifica que los 37 archivos JavaScript originales del juego conserven sus hashes. La activación cambia el enlace simbólico del sitio de forma atómica; la versión anterior sigue disponible para recuperación. No cambia Nginx, certificados, bases de datos ni archivos del motor.

## Verificación

### Recuperación tras publicación del motor

La publicación `city-20261017-professional-learning-v47` reemplazó los HTML y omitió el diseño. Se restauró sobre esa misma base en `city-20261017-learning-and-design-v48`, usando `--skin-version panel-ui-v6`, conservando sus 39 archivos JavaScript y las mejoras pedagógicas. No fue un problema de caché. Las futuras publicaciones completas deben incluir esta capa visual en ambos HTML y sus recursos, además del motor; subir este repositorio a GitHub por sí solo no modifica la publicación del servidor.

Comprobación posterior: la página pública debe referenciar `panel-ui-v8/city-panel.css` y `panel-ui-v8/city-panel.js`, sus imágenes deben responder 200 y `panel-ui-release.json` debe identificar `/opt/ciudad-laboral-releases/city-20261018-dynamic-guide-v54`. Antes de activar otra versión, comprobar también visualmente el encabezado, el panel y la guía de ruta.

`node --test city-panel/panel.test.cjs`

Se verificaron el renderizado de la escena, la selección de distrito, el acceso a Isla Minera y su cambio de personaje, la disponibilidad de las 35 especialidades, la casilla de modo ligero y el diseño en escritorio y teléfono. La apertura del mapa resultó demasiado exigente para el navegador de pruebas; su código y su botón original se conservaron sin modificaciones.

`preview.py` permite revisar el panel localmente sobre la aplicación publicada. No crea una copia del motor ni de los modelos.

### Rótulos 3D de las fases del quiz

El adaptador oculta los tres rótulos decorativos de fases junto a los puestos de quiz en cada especialidad. Restaura los objetos al salir de la sala y conserva la ruta de flechas, la interacción original, los quizzes y su progreso.

La versión `city-20261019-quiz-stage-signs-v100` (`panel-ui-v54`) oculta los carteles antiguos de las fases Observar, Planificar y Verificar. La versión `city-20261019-quiz-station-images-even-v101` (`panel-ui-v55`) usa una imagen diferente por estación (imagen de pregunta cuando existe; en su defecto, fotografía relacionada y sin repetir dentro del módulo) y ubica las cuatro en una línea con separación regular, ajustada al espacio libre de cada sala.

La versión `city-20261019-quiz-station-artwork-v102` (`panel-ui-v56`) reúne en una sola placa 3D el número, nombre del objeto, fotografía propia del quiz, marco blanco/cian y plataforma luminosa, tomando como referencia la imagen entregada. El diseño se genera dinámicamente para las cuatro estaciones de cada módulo de las 35 especialidades y conserva las fotos distintas, la separación regular, el halo de suelo y el acceso al quiz.

La versión `city-20261019-quiz-guide-removed-v103` (`panel-ui-v57`) elimina el panel flotante con el título y los cuatro botones Quiz 1-4 de la especialidad. Las cuatro estaciones 3D, las flechas guía y el botón nativo de acceso del juego permanecen disponibles.

La versión `city-20261019-quiz-hologram-drop-v104` (`panel-ui-v58`) cambia cada estación a una placa horizontal luminosa con número y objeto arriba, imagen individual suspendida debajo, haz holográfico azul en forma de cono y aro brillante sobre el suelo. Los elementos se orientan al estudiante y se generan con la imagen asociada a cada quiz.

### Fotografías de especialidades

Las 35 especialidades de los 12 distritos tienen fotografías propias, compartidas por los cursos correspondientes. Se conservan los botones y sus acciones originales. Las miniaturas WebP se cargan bajo demanda, sin descargar todo el catálogo al ingresar.

`node scripts/build-city-specialty-photos.cjs` reconstruye las miniaturas desde el catálogo local de fotografías. `assets/specialties/credits.html` conserva las fuentes, autores, licencias y aviso de adaptación; el panel incluye su enlace. La publicación debe incluir toda la carpeta de recursos, no solamente CSS y JavaScript.
