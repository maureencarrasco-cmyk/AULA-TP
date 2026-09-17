# Ampliación del curso local

Los cuatro módulos del curso de Refrigeración y Climatización están disponibles como simulaciones didácticas. La ampliación incorpora los tres módulos que estaban vacíos y conserva las respuestas existentes del primero.

| Módulo | Trabajo principal | Práctica interactiva |
|---|---|---|
| Lectura de planos | Símbolos, accesorios y relaciones entre documentos | Escalas |
| Instrumentos | Magnitudes, lecturas, unidades y límites de una conclusión | Promedio, amplitud y comparación con un intervalo ficticio |
| Redes | Trazados, cantidades, interferencias y registros | Longitud neta, reserva y total |
| Equipos | Documentación, condiciones previas, planificación y controles | Comparación entre espacio disponible y mínimo del ejercicio |

Cada módulo conserva cinco estaciones: contextualización, aprendizajes esperados, integración, evaluación y cierre. El curso reúne 72 etapas de AE, 60 casos, cuatro escenarios conceptuales, 100 preguntas y cuatro desarrollos.

Las explicaciones y ejemplos ayudan a razonar antes de responder. Los escenarios de los módulos nuevos contienen tres puntos de inspección propios de cada tema, con acceso por ratón o botones. Las rúbricas del desarrollo se presentan antes de evaluar y orientan la revisión docente. Las ayudas pedagógicas siguen excluidas de la evaluación.

La importación es única y solo afecta a los módulos originales vacíos sin evidencias. Los contenidos editados y los avances guardados se conservan. El respaldo previo está en `backups/`.

## Alcance pedagógico

Los contenidos son una adaptación didáctica original para revisión docente. El [programa de Mineduc](https://www.curriculumnacional.cl/docente/629/w3-article-34318.html) se usa como referencia de ámbito. Estas actividades no sustituyen los talleres supervisados ni acreditan dominio de procedimientos reales.

## Comprobación

Siete pruebas automatizadas cubren recorridos, claves de respuestas, permisos, rúbricas, conservación de datos y escenarios específicos. La revisión de navegador comprobó cálculos, inspección de elementos, visualización móvil y ausencia de ayudas durante la evaluación.

## Continuidad de respuestas

Se agregó guardado automático de borradores en el navegador para las cinco estaciones, recuperación al regresar, separación por estudiante y módulo, eliminación tras entrega y aviso de fallos de almacenamiento. La evaluación mantiene su guardado adicional en SQLite. Las siete pruebas integrales siguen pasando; nuevas comprobaciones JavaScript cubren aislamiento, borradores obsoletos, evaluación, cierre y almacenamiento no disponible.

## Reanudación del recorrido

Se recuerda la posición de cada estudiante en cada módulo: etapa, caso y pregunta o desarrollo de evaluación. La restauración valida los límites y bloqueos del recorrido. Las siete pruebas integrales, las comprobaciones de borradores y las nuevas pruebas de posición pasan. Se verificó en el navegador la reanudación de la pregunta 18 después de recargar.

## Ruta visual con paisaje

Se renovó la ruta con paisaje cordillerano realista generado para el proyecto y almacenado localmente, cuatro colores por módulo, nodos conectados, tarjetas con indicadores de cinco estaciones y meta dorada junto al tramo final. La meta cambia de estado solo cuando se completan todos los módulos; no equivale a una calificación aprobatoria.

El diseño usa border-box también en pseudoelementos, columnas minmax, espacios interiores y separación entre tarjetas. Se verificaron escritorio y móvil de 390 px y el acceso al punto de avance desde Continuar mi recorrido. CSS editable en static/journey.css; paisaje en static/andes-route.png.

## Tema visual de todo el campus

Ingreso, catálogo, módulos, cinco estaciones, herramientas, seguimiento docente, matrículas, gestión de contenidos y editor comparten fondo cordillerano local, tarjetas claras, espacios consistentes y border-box. Las estaciones usan verde, azul, violeta, ámbar y rosado. El editor y la gestión docente usan violeta.

La vista móvil convierte las cinco estaciones en una lista legible y las seis etapas en dos filas, evitando superposición de títulos. Se revisaron ingreso, cinco estaciones en vista docente, seguimiento y editor; se verificó visualmente la estación de aprendizajes en 390 px y ausencia de desbordamiento del editor. La revisión docente sin evidencias mantiene los mensajes reales de estado. No se modificaron notas ni evidencias. Estilos editables en static/campus-theme.css.

## Fondos por especialidad y actividad

Siete escenas fotográficas generadas para Refrigeración y Climatización se guardan en static/themes: taller, planos, medición, redes, montaje de equipos, evaluación y reflexión. Ingreso y ruta usan el taller; cada módulo usa su escena, y evaluación y cierre tienen escenas propias. El espacio docente y el editor usan el escritorio de planos. Las tarjetas de curso también muestran la especialidad.

La selección usa el curso activo y no el módulo visitado anteriormente. Los cursos de otras especialidades conservan un fondo general hasta incorporar sus recursos específicos. Las imágenes son ilustrativas. No se realizan conexiones externas para mostrarlas. Pruebas: node tests/test_specialty_theme.cjs; siete recursos comprobados por HTTP y revisión visual del módulo de instrumentos.

## Situación integradora según referencia adjunta

La estación 3 ocupa el ancho del contenido sin herramientas laterales. Se incorporaron propósito con diana, alcance con iconos, pestañas unidas, franja de selección, filtro orientativo por tramos, carrusel de cinco fotografías en escritorio, flechas, tres páginas para los quince casos, estados bloqueados y navegación inferior con mensaje decorativo. Se conservan las consignas originales y el formulario de decisión de la captura. Los nombres de ejemplo del texto no sustituyen el contenido del curso.

Inicial corresponde a casos 1–5, Intermedia a 6–10 y Avanzada a 11–15; es una clasificación orientativa de navegación, no una medición validada ni una modificación de notas. El filtro no desbloquea situaciones. La pestaña 3D permanece dentro de la estación. El botón inferior lleva al formulario; no entrega respuestas.

Comprobado: cinco tarjetas en escritorio 1440 px, desplazamiento móvil 390 px sin desbordamiento de página, filtro avanzado con casos 11–15 bloqueados, flechas y pestaña 3D. Siete pruebas integrales y prueba JS de filtrado/índices/bloqueos pasan. Estilos y componentes separados en static/integrated-station.css y static/integrated-station.js.
