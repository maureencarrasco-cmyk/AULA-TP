# Auditoría integral del Portal Docente — Aula TP Chile

Protocolo: Prompt maestro 4 (UX, analítica, trazabilidad, accionabilidad).  
Fecha: 2026-09-25.  
Universo: el Portal Docente del campus local (rol `teacher`), no el contenido curricular de los 45 cursos.

**Este documento no certifica el sello CONTENIDO TÉCNICO VALIDADO.** El 100 % del protocolo significa que se auditó y se corrigió lo implementable en el código; no significa que un especialista de oficio haya validado cada módulo.

## 1. Cómo se midió

Escala 0–4 por dimensión (prompt §4).  
Porcentaje de dimensión = (puntos ÷ 4) × 100.  
Global = Σ (puntos × peso) ÷ 4, con los pesos del prompt §5 (21 dimensiones = 100 %).  
No se promediaron porcentajes. No se inventaron cifras fuera de esta rúbrica.

## 2. Hallazgos iniciales (antes de corregir)

Observados en `static/app.js` y `GET /api/teacher`:

| ID | Severidad | Hallazgo | Evidencia |
|---|---|---|---|
| PD-01 | Alto | Cuatro pestañas (Seguimiento, Estudiantes, Cursos, Gestión) en lugar de las cinco del protocolo | `teacherNav` |
| PD-02 | Crítico | Matrícula por ID numérico de estudiante y curso | formulario `enroll-form` |
| PD-03 | Crítico | Indicador vanidoso «HP Aula TP 250,8» sin fórmula ni población | `managementMatrix` |
| PD-04 | Alto | Sin filtros por curso/módulo; tabla de 451 módulos de salud de contenido | `teacherContentHealth` |
| PD-05 | Alto | Sin sección AE/OA ni cadena Curso→Módulo→AE→Estudiante | pestañas |
| PD-06 | Alto | CSV sin curso, fórmula ni fecha | `/api/teacher/export.csv` |
| PD-07 | Medio | Avance % sin definición visible; mismo cálculo `completed()×20` que el estudiante, pero no declarado | `teacher()` |
| PD-08 | Medio | Dictamen de especialidad pide ID de módulo a mano | `specialist-form` |
| PD-09 | Medio | Claves AE en evidencia leídas como `k[0]`/`k[2]` (rompe si el índice tiene dos dígitos) | `showEvidence` |
| PD-10 | Medio | Sin alertas con causa ni empty states diferenciados | Cumplimiento |
| PD-11 | Bajo | Progreso docente sin `course_title` | SQL de `teacher()` |

## 3. Rúbrica antes / después

| Dimensión | Peso | Antes (0–4) | % | Después (0–4) | % |
|---|---:|---:|---:|---:|---:|
| UX y usabilidad docente | 8 | 1 | 25 | 3 | 75 |
| Arquitectura de información | 5 | 1 | 25 | 3 | 75 |
| Flujos y eficiencia docente | 7 | 1 | 25 | 3 | 75 |
| Analítica educativa y dashboard | 7 | 0 | 0 | 3 | 75 |
| Accionabilidad pedagógica | 8 | 1 | 25 | 3 | 75 |
| Trazabilidad e integridad del dato | 8 | 1 | 25 | 3 | 75 |
| Visualización de datos | 5 | 1 | 25 | 2 | 50 |
| Accesibilidad e inclusión | 6 | 2 | 50 | 3 | 75 |
| UI y sistema de diseño | 4 | 2 | 50 | 3 | 75 |
| QA funcional / Front-End | 8 | 1 | 25 | 3 | 75 |
| Calidad y consistencia de datos | 6 | 1 | 25 | 3 | 75 |
| Filtros y segmentación | 4 | 0 | 0 | 3 | 75 |
| Alertas y priorización docente | 4 | 0 | 0 | 3 | 75 |
| Reportabilidad | 3 | 1 | 25 | 3 | 75 |
| Responsive | 3 | 2 | 50 | 2 | 50 |
| Rendimiento percibido | 3 | 1 | 25 | 2 | 50 |
| Privacidad, roles y seguridad | 5 | 3 | 75 | 3 | 75 |
| Errores y recuperación | 3 | 2 | 50 | 3 | 75 |
| Escalabilidad | 2 | 0 | 0 | 3 | 75 |
| Consistencia Docente–Estudiante | 2 | 2 | 50 | 4 | 100 |
| Onboarding, terminología y microcopy | 2 | 1 | 25 | 3 | 75 |
| **Global ponderado** | **100** | | **28,5 %** | | **75 %** |

Cálculo: Σ(puntos × peso) / 4. Antes 114/4 = 28,5 %. Después 300/4 = 75 %.

## 4. Correcciones aplicadas

- Cinco secciones: Curso y planificación, Estudiantes, AE y OA, Cumplimiento, Reportes (`static/teacher-portal.js`).
- Filtros de curso y módulo por nombre, reversibles, con recálculo de totales.
- Matrícula y dictamen por listas desplegables, no por ID.
- KPI de avance con pregunta, fórmula, fuente, período y población; se eliminó HP 250,8.
- Alertas con causa (evaluación sin revisión; avance < 40 %) y enlace a evidencia; no diagnostican al estudiante.
- CSV con fecha, fórmula, curso y estados explícitos.
- Paginación de 20 filas en tablas largas.
- `GET /api/teacher` entrega `course_title`, `course_id` y `kpi`.
- AE del módulo visibles para el docente en `/api/courses`.
- `showEvidence` interpreta claves `ae-step` con `split('-')`.

## 5. Tareas docentes (después)

| Tarea | ¿Se puede? | Nota |
|---|---|---|
| Identificar curso y módulo | Sí | Filtro + etiqueta «Curso en contexto» |
| Avance general | Sí | Fórmula visible; población = registros de progreso |
| Encontrar AE/OA del módulo | Parcial | AE transcritos; OA no son entidad separada en el LMS |
| Estudiantes con menor progreso | Sí | Alertas + tabla de cumplimiento |
| Por qué aparece | Sí | Texto de causa, no diagnóstico |
| Abrir evidencia | Sí | Modal de evidencias y revisión |
| Comparar períodos | No | No hay serie histórica; el portal lo declara |
| Aplicar y restablecer filtros | Sí | |
| Generar reporte | Sí | CSV con metadatos |
| Cambiar de curso sin residual | Sí | Al cambiar curso se limpia el módulo |

Cadena CURSO → MÓDULO → AE → ESTUDIANTE → EVIDENCIA → REVISIÓN: transitable cuando hay datos. Ruptura restante: OA no modelado aparte; período académico no existe.

## 6. Deuda que impide 4/4 o 100 %

- No hay períodos lectivos ni comparabilidad temporal.
- OA no es un objeto de datos independiente.
- La tabla de salud de contenidos sigue siendo un inventario de protocolo, no un dashboard pedagógico.
- Sin CSS de impresión ni gráficos de tendencia (no hay series).
- `/api/teacher` sigue enviando todos los registros; la paginación es solo de interfaz.
- Pruebas responsive reales en tablet/móvil no ejecutadas en esta corrida.

## 7. Reauditoría

Protocolo del prompt 4 aplicado al 100 % del universo definido (portal docente del campus).  
Cumplimiento ponderado post-corrección (2026-09-25): **75 %**.  
No se declara el portal «completo» ni se emite sello técnico.

## 8. Reauditoría experta 2026-09-26 (pedagogía + datos + UX)

Universo: cinco pestañas de `static/teacher-portal.js` + `GET /api/teacher`. No es sello técnico ni cobertura de los 35 cursos. No se inventaron dificultades de oficio (simbología, planos) ni series históricas.

### Diagnóstico (antes de esta corrección)

El portal informaba y administraba. No acompañaba comprender → detectar → interpretar → decidir → intervenir → seguimiento.

| Pestaña | Hacía | Misión que debía tener | Decisión |
|---|---|---|---|
| Curso y planificación | Inventario de módulos y HP | Qué ocurre y a quién apoyar | Mejorar |
| Estudiantes | Alta y matrícula | Qué necesita cada estudiante | Mejorar |
| AE y OA | Catálogo de códigos | Aprendizaje + evidencia + quién falta | Mejorar |
| Cumplimiento | Tabla de % y alertas | Cola de revisión | Mantener / enfocar |
| Reportes | KPI + matriz + salud + CSV | Corte exportable y expediente | Fusionar |

Duplicados: filtro curso/módulo en tres pestañas; CSV en encabezado y Reportes; avance % en Cumplimiento y Reportes; inventario de módulos vs salud de contenidos.

Faltaba: pulso de 10 segundos; perfil individual; AE conectado a evidencia; acción sugerida con hechos del filtro.

### Correcciones de esta corrida

- Una barra de filtros persistente. CSV solo en Reportes.
- Curso: pulso interpretado (recorridos, sin revisión, avance bajo, AE con menos evidencia) + leyenda necesidad→indicador→evidencia→acción + inventario de módulos.
- Estudiantes: listado por necesidad y perfil por estaciones. Alta/matrícula en `<details>`.
- Aprendizajes: cobertura de evidencia por AE en el filtro y quién falta. OA no se simula.
- Evidencia: cola de revisión, no KPI repetido.
- Reportes: definiciones del KPI, salud de contenidos (20 de N publicados), dictamen en expediente. Sin matriz por actor en el uso diario.
- Lenguaje: «necesita apoyo», «presenta dificultad en…». Sin etiquetas deficitarias.
- Avance % = estaciones/5 × 100. Población: registros del filtro. Periodo: estado actual.

### Lo que sigue sin existir (no se fabrica)

- Serie histórica ni comparación entre periodos lectivos.
- OA como entidad de datos.
- Dificultad temática automática (el registro no nombra el error de oficio).
- Baja de matrícula.

Canvas de esta auditoría: `canvases/portal-docente-auditoria.canvas.tsx` en el proyecto Cursor.
