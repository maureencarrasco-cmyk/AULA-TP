# Voz oficial Aula TP

**Identidad vocal de marca.** No es “una voz agradable”. Es **un perfil único y reconocible** para videos, experiencias 3D, simuladores y recursos audiovisuales.

**Regla fundamental:** la voz se siente como *una persona experta que te acompaña a resolver una situación profesional*, no como *una persona que te lee instrucciones*.

En campus, el motor es `static/narration.js`. El *voice ID* se guarda en `localStorage` clave `aula-tp-voice-master-v1` (URI + nombre + lang del sintetizador del equipo). No cambiarlo al azar entre Enfermería, Electricidad u otro curso.

Cuando se produzcan videos con un estudio TTS (Azure, ElevenLabs u otro), **registrar aquí el ID del proveedor y no cambiarlo**. Hasta que exista ese contrato, no inventar un ID de estudio.

```
studio_provider: (sin asignar)
studio_voice_id: (sin asignar)
campus_store: aula-tp-voice-master-v1
lang: es-CL
```

---

## VOZ OFICIAL AULA TP

Voz institucional **única y consistente**.

Transmite: cercanía, confianza, profesionalismo, calma, claridad, motivación, acompañamiento pedagógico.

### Características

Voz adulta, natural y cálida, preferentemente femenina, tono profesional y educativo.

Suena como **una profesional que acompaña al estudiante**, no como locutora comercial, actriz ni voz artificial.

**Tono:** cálido, sereno, seguro, positivo, ligeramente motivador. Nunca exageradamente entusiasta.

**Ritmo:** pausado pero dinámico; pronunciación muy clara; velocidad moderada; pausas naturales entre instrucciones e ideas.

Un estudiante debe comprender la instrucción de inmediato, aunque no tenga experiencia previa en la especialidad.

### Evitar

Voz infantil o excesivamente juvenil. Tono publicitario. Tono de videojuego. Entusiasmo artificial. Dramatización. Voz robótica. Pronunciación acelerada. Cambios bruscos de volumen. Exceso de emoción. Tono excesivamente solemne.

### Estilo de interpretación

Mentor profesional que acompaña una experiencia práctica.

| Momento | Tono |
| --- | --- |
| Presenta una misión | Claro, ligeramente intrigante |
| Entrega una instrucción | Seguro, pausado, preciso |
| Entrega una pista | Cercano, orientación, sin soltar la respuesta |
| El estudiante se equivoca | Tranquilo y constructivo, nunca reproche |
| Logra una tarea | Satisfacción moderada y auténtica |
| Retroalimentación | Reflexivo, claro, pedagógico |

### Consistencia

No cambiar al azar: edad aparente, acento, velocidad, tono, energía, pronunciación, personalidad.

### Acento

Español latinoamericano neutro, pronunciación natural para estudiantes de Chile.

Evitar modismos excesivamente locales. Mantener cercanía educativa chilena (`es-CL` en campus).

### Parámetros de campus (Web Speech)

Estos valores son la **voz maestra**. Los intents solo los matizan, no inventan otra persona.

| Parámetro | Valor |
| --- | --- |
| lang | `es-CL` |
| rate | `0.88` |
| pitch | `1.02` |
| volume | `0.92` |
| Preferencia | voz adulta femenina, `es-CL` / Catalina u otra latina natural |

Intents (`mission`, `instruction`, `hint`, `error`, `success`, `feedback`): variación mínima de ritmo y tono. Misma voz. Misma persona.
