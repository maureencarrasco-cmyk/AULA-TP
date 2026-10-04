# Auditoria de los 45 cursos

Fecha: 4 de octubre de 2026. No se modificaron contenidos, claves ni respuestas guardadas.

## Alcance

**Presupuesto curricular:** el simulador dispone del 30 % de las horas oficiales del programa de cada especialidad. Por modulo, horas disponibles = HP oficiales x minutos por HP / 60 x 0,30. Ocupacion y horas restantes se calculan contra ese presupuesto, no contra el 100 % oficial. El factor x5 estima duracion; no multiplica las horas disponibles. La tabla separa HP y horas cronologicas.

Inventario estructural de 45 cursos, 451 modulos y 40.135 elementos almacenados. Incluye 11.275 preguntas de seleccion multiple. Revision visual por muestra de las cinco estaciones habilitadas del modulo 1. Mision laboral permanece bloqueada, no es un juego implementado. No se certifica calidad semantica exhaustiva de cada actividad.

## Hallazgos

1. **Alta: referencias visuales ausentes.** 24.226 referencias a imagenes no corresponden a archivos locales existentes. Son referencias, no 24.226 archivos distintos. Se comprobo HTTP 404 para `/static/headers/gastronomia/e4.png?v=3`. No se verifico por HTTP cada referencia ni el comportamiento de respaldo de cada pantalla.
2. **Alta: tiempos no validados.** `pedagogy.py` iguala el tiempo requerido con el disponible y deduce el tiempo docente dividiendo por cinco. Los resultados 60/80/100/120 % para x3/x4/x5/x6 son consecuencias algebraicas, no mediciones de estudiantes. El plan efectivo asigna 30 % de las horas oficiales; hay que distinguir ese denominador de las horas totales del modulo.
3. **Alta: calibracion no certificada.** Las etiquetas de las preguntas son 1.775 faciles (15,74 %), 5.128 medias (45,48 %) y 4.372 dificiles (38,78 %). No equivalen a dificultad real por pasos cognitivos. La tabla individual usa un tamiz lexical provisional, no juicio disciplinar.
4. **Media: retroalimentacion incompleta.** 3.114 elementos con alternativas no tienen explicacion registrada en el inventario. Puede existir retroalimentacion generada en ejecucion; debe contrastarse antes de afirmar que el estudiante no recibe ninguna.
5. **Media: repeticion.** 1.046 enunciados de evaluacion se repiten exactamente, con 4.005 apariciones. La repeticion puede ser pertinente, pero requiere comparacion entre modulos, recursos y criterios.
6. **Media: distractores.** 412 elementos tienen posibles distractores evidentes segun un filtro lexical. Requieren revision humana; no se declaran incorrectos automaticamente.
7. **Media: numeracion inconsistente.** La ruta principal muestra seis estaciones, pero persisten etiquetas `ESTACION 5` en el recorrido interno del cierre, y el backend sigue teniendo cinco etapas activas. No debe confundirse posicion visible con identificador interno ni anunciar seis actividades implementadas.
8. **Media: avance abierto.** Caracteres minimos y listas marcadas validan completitud, no calidad tecnica. Las respuestas abiertas necesitan rubrica y juicio docente para evaluar Argumentar, Modelar o Resolver problemas.
9. **Media: diversidad limitada.** Las plantillas compartidas mantienen seis etapas por AE y cinco pestanas de cierre. Transfiere deriva una modificacion generica del caso anterior. No garantiza experiencias distintas entre modulos ni casos nuevos ajustados individualmente.
10. **Media: Nubi puede tapar contenido.** La captura de Aprendizajes esperados muestra el agente superpuesto al titulo principal. Su posicion arrastrable heredada requiere un area segura o un control para restablecer su posicion. No se cambio la posicion del usuario durante la auditoria.

## Recorrido visual revisado

1. Contextualizacion: cinco pestanas visibles; sin desbordamiento horizontal detectado a 1280 px.
2. Aprendizajes esperados: seis actividades por AE visibles; misma comprobacion de ancho.
3. Situacion integradora: selector y acceso a encargos; Mision laboral visible y bloqueada en la ruta.
4. Evaluacion final (posicion visible 5): botonera y acceso preservados; bloques solicitados eliminados.
5. Retroalimentacion y cierre (posicion visible 6): cinco pestanas presentes; etiqueta interna antigua detectada.

Capturas: `auditoria-estacion1.png`, `auditoria-estacion2.png`, `auditoria-estacion3.png`, `auditoria-estacion5.png`, `auditoria-estacion6.png` en esta carpeta. Se inspeccionaron pantallas del modulo 1, no 45 cursos completos en navegador. Los controles de arrastre de Nubi y todas las variantes de pantallas no recibieron una prueba exhaustiva. La tipografia se definio en hojas compartidas; no se certifica contraste y accesibilidad completa por captura.

## Entregables

`informe.html`: tablas filtrables por curso, modulo, pregunta/actividad, propuestas, dificultad provisional, pasos estimados, habilidades, criterios, alertas, plan temporal y escenarios.

`audit-data.json`: inventario completo reutilizable.

Las propuestas de la tabla NO son reformulaciones disciplinarias aprobadas. No se aplicaron al simulador. La auditoria requiere una segunda fase de validacion docente, correccion de recursos, rubricas y pilotaje de tiempos antes de garantizar alta calidad en los 45 cursos.
