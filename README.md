# Aula TP Chile — Campus LMS local

Versión local ampliada del curso, construida a partir de `INSTRUCCION_MAESTRA_CODEX_AULA_TP_V2_VISUAL.docx` y las referencias de `final.zip`. Se ejecuta exclusivamente en **http://127.0.0.1:8000**, en el equipo que inicia Python. No publica en Internet ni utiliza servicios de nube.

## Entrar ahora

| Rol | Usuario | Contraseña de demostración |
|---|---|---|
| Estudiante | `estudiante` | `AulaTP2026!` |
| Docente | `docente` | `DocenteTP2026!` |

Estas cuentas son ejemplos locales. El acceso muestra sus credenciales para facilitar la prueba inicial.

Para volver a iniciar, abre una terminal dentro de esta carpeta y ejecuta:

```bash
./start.sh
```

Después abre **http://127.0.0.1:8000** en el navegador. Mantén la terminal abierta; `Ctrl+C` detiene el servidor. Cerrar el navegador no elimina el progreso. Si ya está funcionando, abre la dirección sin iniciar otro proceso.

El entorno Python está instalado en este equipo. Una copia del proyecto incluye paquetes en `wheelhouse/` para reinstalar sin Internet en Linux x86_64 con Python 3.12. En otro sistema o versión de Python puede ser necesario instalar las dependencias compatibles mediante `python -m pip install -r requirements.txt`. Se requiere Python 3.10 o posterior con soporte `venv`. El uso cotidiano del campus no necesita Internet.

## Qué puedes hacer

- Ingresar con estudiantes diferentes y guardar sus evidencias separadas en SQLite.
- Consultar cursos y una ruta horizontal de módulos con cinco estaciones permanentes.
- Completar contextualización, tres aprendizajes esperados con seis etapas cada uno, 15 situaciones integradoras y una actividad conceptual 3D en la estación 3.
- Responder 25 preguntas y un desarrollo. Guardar y recuperar borradores antes de la entrega definitiva.
- Recibir corrección automática de selección múltiple. El desarrollo se califica por el docente con cinco criterios de 0 a 5 puntos; el total es sobre 50 y se convierte a porcentaje cuando existe revisión.
- Consultar explicaciones, reflexión y plan de mejora; cerrar el recorrido conservando las evidencias. El cierre no inventa una nota para el desarrollo pendiente.
- Usar práctica libre, orientación pedagógica local y accesibilidad según la estación. La evaluación no muestra práctica, agente ni ayuda de retroalimentación.
- Crear estudiantes, matricularlos, crear cursos y módulos, editar contenidos, revisar evidencias y exportar avances en CSV desde el espacio docente.
- Configurar Accesibilidad de forma transversal: perfiles rápidos, tamaño A/A+/A++, contraste, modo simple, movimiento, lectura en voz alta, teclado y alternativas de interacción. Las preferencias se guardan solas y se aplican a las 9 pantallas y al motor de actividades, sin cambiar la dificultad ni entregar la respuesta.

El progreso del módulo cuenta estaciones terminadas (20% cada una); no es una calificación. El progreso del curso incluye todos los módulos de su ruta; si el docente crea módulos en preparación, también forman parte de ese alcance.

## Contenido inicial y límites de esta entrega

El curso de **Refrigeración y Climatización, 3° medio** dispone ahora de cuatro módulos de simulación:

1. Lectura de planos y ubicación de materiales de proyectos.
2. Instrumentos de medición y verificación.
3. Instalación y montaje de redes.
4. Instalación y montaje de equipos.

Cada uno contiene cinco estaciones, tres AE con seis etapas, quince situaciones integradoras, un escenario conceptual de inspección, veinticinco preguntas y un desarrollo. En total: 72 etapas, 60 casos, 4 escenarios y 100 preguntas. Hay explicaciones y ejemplos para los doce AE; los tres del módulo inicial se incorporan como apoyo visual sin modificar sus evidencias ni su banco de evaluación.

Las prácticas libres cambian según el módulo: escalas, lecturas y promedios, cubicación con reserva, y comparación de espacios. Los escenarios de los módulos nuevos inspeccionan registros y condiciones propios de cada tema. Las rúbricas del desarrollo también se adaptan al módulo y son visibles antes de responder.

Los adjuntos definen estructura y referencias visuales, pero no incluyen una base de código ni un banco curricular completo. Se prepararon contenidos y casos didácticos originales para los cuatro módulos; deben ser revisados por un docente antes de usarse como evaluación curricular. No se afirma alineación oficial a OA específicos ni se genera una nota chilena de 1 a 7.

La composición sigue el documento V2: cabecera azul, ruta de cinco estaciones, colores funcionales, AE homogéneos, panel derecho estrecho y navegación inferior. Algunas imágenes antiguas muestran ocho estaciones; prevalece la estructura V2 de cinco. El mapa de paisaje se reconstruyó en SVG y se reutilizaron el logotipo y una fotografía recortados de las imágenes entregadas. La implementación conserva estructura e identidad, pero no es una réplica exacta píxel por píxel de las ilustraciones.

El agente pedagógico es una **guía local basada en reglas**, no un modelo de IA generativa. El escenario 3D usa CSS con giro e inspección de tres componentes; es **conceptual**, sin cálculo físico, motor de simulación ni modelos CAD. Los nuevos módulos incluyen su contexto, explicaciones, ejemplos, consigna y elementos del escenario en el contenido del módulo. El editor docente permite modificarlos mientras no existan evidencias. El tipo de calculadora de práctica libre se configura en `catalog.py`; las calculadoras disponibles no sustituyen simuladores físicos.

El editor admite tres AE con seis etapas, quince casos, veinticinco preguntas y un desarrollo por módulo. Permite cargar una base editable; no presenta esa copia como contenido validado para una nueva especialidad. Los contenidos con evidencias no pueden sobrescribirse: crea un nuevo módulo para otra versión.

No se incluyen todavía archivos adjuntos de estudiantes, SCORM/H5P, videoconferencia, certificados, recuperación de contraseña por correo, administración institucional avanzada ni integración con otros LMS. La evaluación no tiene temporizador. La entrega final es única por estudiante y módulo.

## Recorrido docente

1. Ingresa con la cuenta docente y abre **Espacio docente**.
2. En **Estudiantes y matrículas**, crea al estudiante y luego asígnale un curso.
3. En **Cursos y contenidos**, crea cursos y módulos. Abre **Editar contenido**, carga la base, reemplaza textos y respuestas, guarda y habilita el módulo cuando esté preparado.
4. **Vista previa** permite recorrer estaciones sin generar evidencias como estudiante. Para probar el recorrido y la entrega usa una cuenta estudiante.
5. En **Seguimiento y evaluación**, abre las evidencias, revisa el desarrollo, asigna la rúbrica y guarda la retroalimentación.
6. Exporta el avance en CSV cuando lo necesites.

## Datos y respaldo

La información se guarda en `data/aulatp.sqlite3`; `data/.secret` firma las sesiones. No borres estos archivos para actualizar el código.

Crear una copia consistente de la base, incluso con el servidor encendido:

```bash
.venv/bin/python manage.py backup
```

El respaldo queda en `backups/` con fecha y hora. Para restaurarlo, detén el servidor, conserva una copia de la base actual, reemplaza `data/aulatp.sqlite3` por el respaldo elegido y vuelve a iniciar. Las sesiones dependen de `data/.secret`; conservar ese archivo evita invalidarlas accidentalmente.

Cambiar una contraseña desde la terminal local:

```bash
.venv/bin/python manage.py password --user docente
```

La herramienta solicita la contraseña sin mostrarla. Las contraseñas de la base se almacenan como hashes, no como texto. La página de acceso mantiene las etiquetas de demostración; si se cambian las cuentas para uso real, también hay que retirar esas etiquetas en `static/app.js`.

## Estructura técnica

- `app.py`: servidor Flask, sesiones, permisos, matrículas, actividades, evaluación y almacenamiento.
- `content.py`: contenido del primer módulo.
- `catalog.py`: contenidos de los módulos 2 a 4 e importación única de los módulos iniciales vacíos.
- `static/course-tools.js`: explicaciones, ejemplos, calculadoras y escenarios configurables.
- `static/app.js`: componentes de navegación, estaciones, herramientas y espacio docente.
- `static/style.css`: diseño, colores, disposición y adaptación a móvil.
- `static/logo-aula-tp-oficial.png`: lockup oficial (escudo Aula TP Chile). `static/logo.png` se conserva como respaldo del lockup anterior. `static/climatizacion.jpg`: imagen de especialidad.
- `tests/test_lms.py`: pruebas funcionales con bases temporales independientes.
- `manage.py`: respaldo y cambio local de contraseñas.
- `start.sh`: inicio en loopback; `PORT=8002 ./start.sh` permite elegir otro puerto.

Todo el JavaScript, CSS y los recursos visuales se sirven localmente. No hay CDN, analítica, APIs externas ni llamadas a modelos remotos. El servidor Flask incluido es apropiado para esta prueba local. No está configurado para exposición pública ni para un despliegue institucional.

## Verificación realizada

```bash
.venv/bin/python -m unittest discover -s tests -v
```

Siete pruebas integrales verifican permisos y CSRF, bloqueo de etapas, separación entre estudiantes, matrículas y edición, recuperación del borrador desde una nueva instancia, entrega única, puntajes, revisión docente, cierre y exportación. La prueba de navegador se hizo con una base independiente: entrega, recuperación del borrador, revisión con rúbrica y cierre al 100%. También se inspeccionaron escritorio, móvil, ausencia de ayudas en evaluación e interacción 3D.

Las pruebas usan bases temporales. La actualización conserva las respuestas existentes y solo importa los módulos iniciales vacíos sin evidencias; no reemplaza módulos que el docente haya editado. El ZIP incluye código y dependencias, sin copiar los datos personales ni el avance de esta instalación.


## Referencia curricular y alcance de la adaptación

El [programa de la especialidad publicado por Mineduc](https://www.curriculumnacional.cl/docente/629/w3-article-34318.html) se utilizó como referencia del ámbito de los módulos de medición, redes y equipos. El módulo de equipos incluye en su programa lectura de documentación, condiciones previas y relación con controles; esta simulación ejercita una parte de ese ámbito mediante casos ficticios.

Los AE de la plataforma son objetivos de estas actividades didácticas y no transcripciones de los AE oficiales. No se declara cobertura completa de los aprendizajes prácticos, horas oficiales ni cumplimiento normativo. Los materiales no instruyen operaciones reales con refrigerantes, circuitos energizados o uniones en caliente.

En Contextualización, «Acerca de estos contenidos» identifica la referencia curricular de cada nuevo módulo. Esos enlaces son externos y opcionales; ninguna actividad depende de una conexión a Internet.

## Recuperación automática de respuestas

Contextualización, etapas de AE, casos, conclusión del escenario, evaluación y cierre guardan sus textos al escribir en el almacenamiento de este navegador, separados por cuenta, módulo y actividad. Al volver a la actividad se recuperan sin registrarlos como evidencia entregada. La entrega correcta elimina el borrador correspondiente; un cambio de la evidencia guardada invalida las copias antiguas. La vista docente no genera borradores.

Para recuperar estos borradores usa la misma cuenta, navegador y dirección local (127.0.0.1:8000). No se incluyen en respaldos SQLite ni se trasladan a otro navegador; borrar los datos del navegador los elimina. En evaluación, **Guardar borrador** conserva además una copia en SQLite. Si el navegador rechaza el almacenamiento, el formulario muestra un aviso y debes entregar antes de salir.

Pruebas de recuperación e aislamiento: `node tests/test_drafts.cjs`. Se comprobó en una base de pruebas independiente que la reflexión y el desarrollo reaparecen tras recargar y que el avance cambia solo después de entregar.

## Retomar el recorrido

El navegador recuerda por cuenta y módulo la última etapa de AE, situación integradora, pestaña de evaluación y pregunta visitada. Al recargar o continuar un módulo en curso recupera una posición permitida. Si la estación ya se completó, el enlace general del módulo continúa con la siguiente pendiente. Los enlaces a estaciones específicas siguen abriendo la estación solicitada. Esta preferencia no cambia calificaciones ni desbloquea actividades, y permanece únicamente en el mismo navegador.

Verificación: `node tests/test_resume.cjs`. Comprobado también en navegador: recarga en la pregunta 18 y recuperación de esa pregunta con su respuesta.

En este equipo el campus se inició como servicio temporal de usuario `aulatp-campus-local`, independiente de la terminal de trabajo. Se puede consultar con `systemctl --user status aulatp-campus-local` y detener con `systemctl --user stop aulatp-campus-local`. No se configuró inicio automático después de reiniciar el equipo; para volver a iniciarlo usa `./start.sh`.
