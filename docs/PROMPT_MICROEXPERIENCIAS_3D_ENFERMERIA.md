# Prompt maestro · Microexperiencias 3D

**Implementación actual:** solo **Atención de Enfermería** (5 misiones). La arquitectura de este prompt es la que se usará en los 35 cursos cuando el formato esté validado. No afirmar que los 35 ya están producidos.

**Sello Aula TP:** *No te preguntamos qué sabes. Te ponemos en una situación y te pedimos que decidas.*

**Voz:** perfil único `docs/VOZ_OFICIAL_AULA_TP.md`. Misma persona en videos y 3D. En campus, `AulaNarration` guarda el voice ID en `aula-tp-voice-master-v1`. No cambiar acento, edad ni energía entre cursos.

**Fuente curricular (Enfermería, no inventar otras URL):** Programa MINEDUC *Atención de Enfermería* (`docs/fuentes/MINEDUC_Atencion_de_Enfermeria_programa.pdf`; `https://www.curriculumnacional.cl/614/articles-34350_programa.pdf`). Marco DS N° 452/2013. MINSAL aparece **citado en los AE**; no inventar guía OMS/MINSAL ni DOI.

**Simulación didáctica.** No certifica competencia. Datos de caso.

**Tiempo:** oficio **2–3 minutos**. `TIME_FACTOR = 5` (planificación de estación, no duración del clic).

**Representación 3D en campus:** HTML/CSS/JS (escena espacial). No afirmar Unity/WebGL ni fabricante.

---

## PRINCIPIO PEDAGÓGICO DEL MUNDO 3D

El escenario 3D **NO** es una decoración detrás de una serie de preguntas.

El escenario **ES** el recurso pedagógico principal.

El estudiante aprende **dentro del mundo profesional** mediante:

**MUNDO 3D → OBSERVAR → INTERPRETAR → DECIDIR → ACTUAR → CONSECUENCIA → REFLEXIONAR**

Los recuadros, instrucciones y orientaciones están **integrados al mundo** y funcionan como **mediadores**, no como un cuestionario.

### Principio central

No diseñar: *una pregunta dentro de un escenario 3D.*

Diseñar: *una situación profesional interactiva donde la pregunta nace de lo que está ocurriendo dentro del mundo.*

El estudiante no mira el mundo para responder una pregunta. **Mira el mundo para comprender qué hacer.**

---

## REGLAS (los 35 cursos, cuando se produzcan)

1. La información necesaria para resolver la situación debe encontrarse **principalmente en el escenario 3D**. No entregar la respuesta en un recuadro.

2. Los objetos del mundo tienen intención pedagógica:
   - **relevante** → aporta una pista (dato visible, no la solución);
   - **interactivo** → permite actuar o decidir;
   - **documento / señalética / persona** → información o situación;
   - **realismo** → oficio auténtico, sin distraer.

3. Evitar entregar la respuesta directamente mediante texto.

4. Favorecer **preguntas de pensamiento** (observación, interpretación, anticipación, decisión), no de memoria.
   - *Observa. ¿Qué te hace pensar que existe un riesgo?*
   - *¿Qué harías antes de intervenir?*
   - *¿Qué podría ocurrir si decides continuar?*

5. Cada decisión produce una **consecuencia visible o significativa** en el mundo (el entorno cambia). No basta “incorrecto”.

6. El error es oportunidad: retro breve y contextual + **pista progresiva**. No revelar de inmediato la respuesta.

7. Un recuadro = **poco texto**, lenguaje claro, **una sola intención cognitiva**.

8. **El mundo primero. La interfaz después.** El escenario ocupa ~80–90 % de la experiencia. Los recuadros no tapan el objeto que hay que observar.

9. Las alternativas de decisión se **vinculan a objetos del mundo** (A → tablero, B → herramienta), no a una prueba tradicional.

10. Oficio **2–3 minutos**: situación auténtica, observación, decisión, consecuencia y reflexión. La brevedad no reduce la profundidad.

11. El currículo (OA/AE) está **incorporado en la situación**, no como clase insertada.

12. El estudiante debe sentir que **resuelve una situación profesional**, no que contesta un cuestionario.

### Microfeedback (no clases dentro del juego)

Evitar: *“La respuesta correcta es B porque según el OA X…”*

Preferir: *“Buena decisión. Verificar esta condición antes de intervenir permite reducir el riesgo.”*

Una idea. Una explicación. Continuar.

### Cierre

**Lo que hiciste** · **Lo que aprendiste** · **Tu desempeño** (observación / análisis / decisión, cualitativo, sin % inventado).

Ofrecer: *¿Quieres volver a intentarlo y descubrir qué ocurre con otra decisión?*

---

## ESTRUCTURA DE CADA MICROEXPERIENCIA

| Fase | Qué ocurre | Recuadro |
| --- | --- | --- |
| Contexto | Entra al mundo. Reloj y lugar. No se le dice todavía qué mirar. | Chip mínimo |
| Misión | Problema profesional concreto. | 2 líneas |
| Exploración | Observa, camina, inspecciona objetos. | Slip breve al tocar un objeto; luego chip |
| Interpretar | Una pregunta de pensamiento. | Una línea para escribir |
| Decisión | Elige **un objeto** del entorno. | Pregunta corta; letras en el mundo |
| Consecuencia | El mundo reacciona (marca, se detiene, cambia). | Microfeedback |
| Segunda acción | La situación continúa ~30 s. | Otra elección en objetos |
| Cierre | Síntesis + rejugabilidad. | Lo que hiciste / aprendiste / desempeño |

### Campos JSON

```json
{
  "id": "m0X",
  "clock": "HH:MM",
  "place": "lugar de oficio",
  "oa": "OA citado",
  "ae_code": "código AE citado",
  "ae_text": "texto del AE, sin parafraseo inventado",
  "contexto": "dónde está, qué hora es",
  "mision": "problema. Observa el entorno antes de intervenir.",
  "thinkRisk": "pregunta de pensamiento",
  "hint": "pista que devuelve al mundo, no la respuesta",
  "objects": [{"id": "", "space": "", "role": "clue|act|doc|person|realism", "fact": "dato visible", "think": "pregunta"}],
  "decisions": [{"id": "", "object": "", "mark": "A", "quality": "ok|partial|wrong", "fx": [], "feedback": "una idea"}],
  "second": [],
  "did": "lo que hizo si decide bien",
  "aprendizaje": "una frase",
  "error_tipico": "si calidad != ok"
}
```

### Telemetría (hechos, no %)

Iniciada, completada, tiempo (ms), objetos inspeccionados, secuencia de decisiones, intentos, calidad (`ok|partial|wrong`), AE, refuerzo (`calidad != ok`). **Universo = misiones de esta colección.** No inventar dominio de la especialidad.

### Colección Enfermería (5)

1. El riesgo en la unidad — `PC-M4-AE2`
2. La lectura que no cuadra — `PC-M2-AE1`
3. Antes de entrar — `PC-M6-AE2`
4. Pudor y protocolo — `PC-M1-AE2`
5. Varios llamados — `ENF-M2-AE1`

### Qué no hacer

- Reciclar climatización o electricidad como si fuera enfermería.
- Llenar el mundo de recuadros o de la respuesta escrita.
- Etiquetar al estudiante (solo la decisión y el AE).
- Prometer 35 cursos o 100 % de cobertura.
- Usar Three.js/glTF si no hay modelo validado; el campus usa escena CSS.
