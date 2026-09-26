'use strict';
/* Mundo profesional = recurso pedagógico. Recuadros solo median. */
(function () {
  const SRC = 'Programa MINEDUC Atención de Enfermería (PDF del repo). MINSAL citado en AE; sin URL de guía inventada. Simulación didáctica: no certifica competencia clínica.';
  const MISSIONS = [
    {
      id: 'm01', title: 'Misión 01 — El riesgo en la unidad', clock: '08:15', place: 'Unidad 12',
      scene: '', photo: '/static/themes/route/enfermeria-1.webp',
      oa: 'OA 4 · Mantener condiciones sanitarias y de seguridad en las dependencias donde se encuentran las personas bajo su cuidado.',
      ae: 'PC-M4-AE2', aeText: 'Mantiene un ambiente clínico seguro para cada paciente durante el proceso de atención, aplicando las normas de seguridad de la institución.',
      contexto: '08:15. Unidad 12. Te asignan aseo de confort.',
      mision: 'Algo no está funcionando correctamente.\nObserva el entorno antes de intervenir.',
      thinkRisk: 'Observa. ¿Qué te hace pensar que existe un riesgo?',
      hint: 'Mira de nuevo el entorno. ¿Hay alguna señal que indique una condición de riesgo?',
      decideAsk: '¿Qué revisarías primero?',
      secondAsk: 'El entorno cambió. ¿Qué haces ahora?',
      did: 'Identificaste la condición de riesgo antes de intervenir.',
      aprendizaje: 'En esta situación, la observación previa es fundamental para actuar de manera segura.',
      error: 'Intervenir o delegar sin leer el ambiente',
      spaces: [
        {id: 'pasillo', label: 'Pasillo', photo: '/static/themes/route/enfermeria-1.webp', focus: '18% 40%', voice: 'Pasillo. Todavía no te dicen qué mirar. Recorre.'},
        {id: 'umbral', label: 'Umbral', photo: '/static/themes/route/enfermeria-1.webp', focus: '50% 52%', voice: 'Umbral. Arrastra la vista. ¿El piso y la puerta te dicen algo?'},
        {id: 'unidad', label: 'Unidad 12', photo: '/static/themes/route/enfermeria-1.webp', focus: '78% 55%', voice: 'Unidad. La cama espera. El carro está ahí. ¿Actúas ya?'}
      ],
      objects: [
        {id: 'aviso', space: 'pasillo', label: 'Aviso', x: 36, y: 38, role: 'doc',
          fact: 'Hay un aviso de aislamiento de contacto.', think: '¿Qué te pide este aviso antes de entrar?', voice: 'Lees el aviso. ¿Qué te pide antes de entrar?'},
        {id: 'puerta', space: 'pasillo', label: 'Puerta', x: 10, y: 50, role: 'realism',
          fact: 'La puerta está entreabierta.', think: '¿Cruzarías ahora o mirarías primero?', voice: 'La puerta está entreabierta. ¿Entras?'},
        {id: 'piso', space: 'umbral', label: 'Piso', x: 62, y: 78, role: 'clue',
          fact: 'Hay líquido junto a la cama. Nadie lo señaló.', think: '¿Está listo para caminar?', voice: 'Miras el piso. ¿Está seco?'},
        {id: 'cama', space: 'unidad', label: 'Cama', x: 84, y: 48, role: 'act',
          fact: 'La persona espera el aseo.', think: '¿El aseo es lo primero o el entorno?', voice: 'La persona espera. ¿Tocas ya?'},
        {id: 'carro', space: 'unidad', label: 'Carro', x: 70, y: 58, role: 'act',
          fact: 'No ves guantes ni delantal listos.', think: '¿Puedes armar barreras con esto?', voice: 'Miras el carro. ¿Están las barreras?'}
      ],
      need: 2,
      decisions: [
        {id: 'a', object: 'cama', mark: 'A', quality: 'wrong', retry: true, fx: ['stop', 'wet'],
          feedback: 'El entorno se detiene. Avanzar sin mirar el piso deja el riesgo activo.'},
        {id: 'b', object: 'piso', mark: 'B', quality: 'ok', fx: ['wet'],
          feedback: 'Buena decisión. Verificar esta condición antes de intervenir reduce el riesgo.'},
        {id: 'c', object: 'puerta', mark: 'C', quality: 'partial', fx: ['wet'],
          feedback: 'Salir no elimina el riesgo. El ambiente inseguro sigue. Continúas tú.'}
      ],
      second: [
        {id: 's1', object: 'carro', mark: 'A', quality: 'ok', fx: ['safe', 'tape'],
          feedback: 'El piso queda marcado y las barreras quedan a mano.'},
        {id: 's2', object: 'cama', mark: 'B', quality: 'wrong', fx: ['stop'],
          feedback: 'Usar un textil de confort como paño de piso detiene el procedimiento.'},
        {id: 's3', object: 'aviso', mark: 'C', quality: 'wrong', fx: ['stop'],
          feedback: 'Ocultar el aviso no restaura seguridad. Vuelve a mirar el entorno.'}
      ]
    },
    {
      id: 'm02', title: 'Misión 02 — La lectura que no cuadra', clock: '09:40', place: 'Control de signos',
      scene: '', photo: '/static/themes/route/enfermeria-2.webp',
      oa: 'OA 2 · Medir, controlar y registrar parámetros de salud de los pacientes… aplicando instrumentos de medición apropiados.',
      ae: 'PC-M2-AE1', aeText: 'Controla los signos vitales de acuerdo a la indicación profesional, al plan de atención y necesidad de la o el paciente, considerando los principios de asepsia, antisepsia y seguridad.',
      contexto: '09:40. Debes controlar signos y dejar registro.',
      mision: 'Algo no coincide en esta unidad.\nObserva el entorno antes de registrar.',
      thinkRisk: 'Observa. ¿Qué no puedes afirmar todavía?',
      hint: 'Compara tres cosas del entorno: pantalla, hoja y persona. ¿Cuentan la misma historia?',
      decideAsk: '¿Qué revisarías primero?',
      secondAsk: 'El sensor ya está en su sitio. ¿Qué haces con el registro?',
      did: 'Comprobaste el instrumento antes de registrar un número.',
      aprendizaje: 'Un parámetro se registra después de comprobar el instrumento y contrastarlo con la persona.',
      error: 'Transcribir un valor de monitor sin verificar el sensor',
      spaces: [
        {id: 'muro', label: 'Muro', photo: '/static/themes/route/enfermeria-2.webp', focus: '22% 40%', voice: 'Muro. Tienes una hoja. Compárala con lo que ves.'},
        {id: 'cama', label: 'Cama', photo: '/static/themes/route/enfermeria-2.webp', focus: '82% 45%', voice: 'Cama y monitor. ¿Cuentan la misma historia?'},
        {id: 'manos', label: 'Orilla', photo: '/static/themes/route/enfermeria-3.webp', focus: '55% 50%', voice: 'Orilla. ¿Dónde está el sensor?'}
      ],
      objects: [
        {id: 'hoja', space: 'muro', label: 'Hoja', x: 32, y: 62, role: 'doc',
          fact: 'Hace 10 min: FC 78. Sin nota de fiebre.', think: '¿Hay una nota que explique un cambio?', voice: 'Lees la hoja. ¿Qué se anotó hace diez minutos?'},
        {id: 'protocolo', space: 'muro', label: 'Protocolo', x: 18, y: 36, role: 'realism',
          fact: 'Hay un protocolo de control en la pared.', think: '¿El papel te da el número de ahora?', voice: 'El protocolo está ahí. No es la lectura de hoy.'},
        {id: 'monitor', space: 'cama', label: 'Monitor', x: 82, y: 16, role: 'clue',
          fact: 'Pantalla: FC 118. El clip no está en el dedo.', think: '¿El número nace de un instrumento bien puesto?', voice: 'Mira la pantalla. ¿El sensor está donde debería?'},
        {id: 'paciente', space: 'manos', label: 'Persona', x: 62, y: 58, role: 'person',
          fact: 'Dice que el clip se cayó hace rato.', think: '¿Qué te dice la persona que el aparato no puede?', voice: 'Escucha a la persona.'}
      ],
      need: 2,
      decisions: [
        {id: 'a', object: 'monitor', mark: 'A', quality: 'wrong', retry: true, fx: ['stop', 'alarm'],
          feedback: 'El entorno no guarda ese 118. El instrumento no estaba en su sitio.'},
        {id: 'b', object: 'paciente', mark: 'B', quality: 'ok', fx: ['safe'],
          feedback: 'Buena decisión. La lectura debe nacer del instrumento y de la persona.'},
        {id: 'c', object: 'hoja', mark: 'C', quality: 'partial', fx: ['alarm'],
          feedback: 'No inventaste un número, pero el control indicado sigue incompleto.'}
      ],
      second: [
        {id: 's1', object: 'hoja', mark: 'A', quality: 'ok', fx: ['safe'],
          feedback: 'El registro describe el dato y el hallazgo. Otro puede seguirte.'},
        {id: 's2', object: 'monitor', mark: 'B', quality: 'wrong', fx: ['stop'],
          feedback: 'Dos cifras sin contexto no permiten seguir tu razonamiento.'},
        {id: 's3', object: 'protocolo', mark: 'C', quality: 'wrong', fx: ['stop'],
          feedback: 'Borrar lo anterior rompe la trazabilidad. El entorno lo detiene.'}
      ]
    },
    {
      id: 'm03', title: 'Misión 03 — Antes de entrar', clock: '11:05', place: 'Precaución de contacto',
      scene: '', photo: '/static/headers/enfermeria/e1.webp',
      oa: 'OA 5 · Contribuir a la prevención y control de infecciones… aplicando normas de asepsia y antisepsia.',
      ae: 'PC-M6-AE2', aeText: 'Aplica, durante la atención de cada paciente, las barreras protectoras y las medidas de aislamiento establecidas en el plan de atención.',
      contexto: '11:05. Te piden entrar un momento a dejar agua.',
      mision: 'La puerta está entreabierta.\nObserva el entorno antes de cruzar.',
      thinkRisk: 'Observa. ¿Qué te hace pensar que no puedes entrar así?',
      hint: 'Lee el cartel y mira el material. ¿Qué barreras pide y cuáles están limpias?',
      decideAsk: '¿Qué usarías para entrar?',
      secondAsk: 'Ya estás dentro. ¿Cómo sales?',
      did: 'Colocaste las barreras del aviso antes de entrar.',
      aprendizaje: 'Las barreras del plan se colocan antes de entrar y se retiran al salir.',
      error: 'Entrar o circular sin las barreras del aviso',
      spaces: [
        {id: 'pasillo', label: 'Pasillo', photo: '/static/headers/enfermeria/e1.webp', focus: '12% 45%', voice: 'Pasillo. Te pidieron un segundo. En aislamiento, un segundo también cuenta.'},
        {id: 'umbral', label: 'Umbral', photo: '/static/headers/enfermeria/e1.webp', focus: '36% 40%', voice: 'Umbral. Lee el cartel. Todavía no cruces.'},
        {id: 'unidad', label: 'Dentro', photo: '/static/themes/route/enfermeria-1.webp', focus: '72% 55%', voice: 'Dentro. ¿Qué material es limpio?'}
      ],
      objects: [
        {id: 'dispensador', space: 'pasillo', label: 'Alcohol', x: 8, y: 48, role: 'act',
          fact: 'Hay dosis para un uso.', think: '¿Basta el alcohol para entrar?', voice: 'Miras el dispensador. ¿Alcanza? ¿Basta?'},
        {id: 'cartel', space: 'umbral', label: 'Cartel', x: 36, y: 38, role: 'doc',
          fact: 'Precaución de contacto: guantes y delantal.', think: '¿Qué no puedes improvisar?', voice: 'Lee el cartel. ¿Guantes? ¿Delantal?'},
        {id: 'batea', space: 'unidad', label: 'Batea', x: 70, y: 70, role: 'clue',
          fact: 'Hay un delantal usado, doblado hacia afuera.', think: '¿Ese delantal es limpio?', voice: 'Miras la batea. ¿Es stock limpio?'},
        {id: 'vaso', space: 'unidad', label: 'Mesa', x: 78, y: 42, role: 'realism',
          fact: 'El vaso está en la mesa.', think: '¿Dejar el vaso cierra el aislamiento?', voice: 'El vaso está ahí. La salida también cuenta.'}
      ],
      need: 2,
      decisions: [
        {id: 'a', object: 'dispensador', mark: 'A', quality: 'wrong', retry: true, fx: ['stop'],
          feedback: 'Un segundo sin barreras no cumple el aislamiento. No cruzas.'},
        {id: 'b', object: 'cartel', mark: 'B', quality: 'ok', fx: ['safe'],
          feedback: 'Buena decisión. El entorno permite continuar solo con barreras completas.'},
        {id: 'c', object: 'batea', mark: 'C', quality: 'wrong', retry: true, fx: ['stop'],
          feedback: 'Reutilizar un delantal usado es una vía de contaminación.'}
      ],
      second: [
        {id: 's1', object: 'dispensador', mark: 'A', quality: 'ok', fx: ['safe'],
          feedback: 'Retiras barreras y haces higiene al salir. El ciclo cierra.'},
        {id: 's2', object: 'vaso', mark: 'B', quality: 'wrong', fx: ['stop'],
          feedback: 'Salir con el delantal puesto lleva barreras usadas al pasillo.'},
        {id: 's3', object: 'batea', mark: 'C', quality: 'wrong', fx: ['stop'],
          feedback: 'El textil usado no se deja sobre la cama.'}
      ]
    },
    {
      id: 'm04', title: 'Misión 04 — Pudor y protocolo', clock: '14:20', place: 'Unidad 7',
      scene: '', photo: '/static/themes/route/enfermeria-4.webp',
      oa: 'OA 1 · Aplicar cuidados básicos de enfermería, higiene y confort… trato digno, acogedor y coherente con los derechos y deberes del paciente.',
      ae: 'PC-M1-AE2', aeText: 'Ejecuta los procedimientos de higiene y confort a pacientes pediátricos y adultos, de acuerdo al plan de atención de enfermería, respetando la privacidad, el pudor y el protocolo establecido.',
      contexto: '14:20. Corresponde aseo de confort.',
      mision: 'Hay otras personas y la cama a la vista.\nObserva el entorno antes de descubrir.',
      thinkRisk: 'Observa. ¿Qué te hace pensar que el pudor no está resuelto?',
      hint: 'Mira hacia el pasillo y escucha quién decide. ¿La cortina y la voz de la persona están listas?',
      decideAsk: '¿Por dónde empezarías?',
      secondAsk: 'La persona pide que el familiar se quede de espaldas. ¿Cómo sigues?',
      did: 'Protegiste privacidad y preguntaste a la persona antes del aseo.',
      aprendizaje: 'Higiene y confort exigen privacidad, información y respeto a la decisión de la persona.',
      error: 'Exponer el cuerpo o decidir la presencia del familiar sin consultar',
      spaces: [
        {id: 'vano', label: 'Vano', photo: '/static/themes/route/enfermeria-4.webp', focus: '88% 20%', voice: 'Desde el vano. ¿Se ve la cama desde el pasillo?'},
        {id: 'equipo', label: 'Equipo', photo: '/static/themes/route/enfermeria-4.webp', focus: '22% 45%', voice: 'Hay otras personas. ¿A quién le preguntas primero?'},
        {id: 'cama', label: 'Cama', photo: '/static/themes/route/enfermeria-4.webp', focus: '70% 55%', voice: 'Orilla de la cama. Todavía no descubras.'}
      ],
      objects: [
        {id: 'cortina', space: 'vano', label: 'Cortina', x: 88, y: 18, role: 'act',
          fact: 'La cortina está abierta hacia el pasillo.', think: '¿Alguien podría ver el aseo?', voice: 'Mira hacia el pasillo.'},
        {id: 'familiar', space: 'equipo', label: 'Familiar', x: 22, y: 42, role: 'person',
          fact: 'Pregunta: «¿ya lo bañamos?»', think: '¿Decides tú o le preguntas a quien está en la cama?', voice: 'Escucha esa pregunta.'},
        {id: 'plan', space: 'cama', label: 'Plan', x: 42, y: 62, role: 'doc',
          fact: 'Plan: respetar pudor e informar dolor o lesión.', think: '¿Qué te pide el plan si hay dolor?', voice: 'El plan está en tus manos.'},
        {id: 'cuerpo', space: 'cama', label: 'Cama', x: 70, y: 52, role: 'realism',
          fact: 'La persona está cubierta todavía.', think: '¿Descubrir todo acelera o expone?', voice: 'Todavía está cubierta.'}
      ],
      need: 2,
      decisions: [
        {id: 'a', object: 'cuerpo', mark: 'A', quality: 'wrong', retry: true, fx: ['stop'],
          feedback: 'No se consultó ni se cerró la cortina. El entorno detiene el descubrimiento.'},
        {id: 'b', object: 'cortina', mark: 'B', quality: 'ok', fx: ['curtain', 'safe'],
          feedback: 'Buena decisión. Privacidad y consentimiento van antes del procedimiento.'},
        {id: 'c', object: 'familiar', mark: 'C', quality: 'partial', fx: ['curtain'],
          feedback: 'Proteges la vista, pero decides por la persona. Aún falta su voz.'}
      ],
      second: [
        {id: 's1', object: 'plan', mark: 'A', quality: 'ok', fx: ['safe', 'curtain'],
          feedback: 'Cubres, explicas y respetas esa presencia. El aseo puede avanzar.'},
        {id: 's2', object: 'cuerpo', mark: 'B', quality: 'wrong', fx: ['stop'],
          feedback: 'Descubrir todo el cuerpo contradice el pudor. Detenido.'},
        {id: 's3', object: 'familiar', mark: 'C', quality: 'partial', fx: ['curtain'],
          feedback: 'El silencio no permite detener si hay dolor. Explica cada paso.'}
      ]
    },
    {
      id: 'm05', title: 'Misión 05 — Varios llamados', clock: '16:50', place: 'Sala de hospitalización',
      scene: '', photo: '/static/themes/route/enfermeria-3.webp',
      oa: 'OA 2 (mención Enfermería) · Monitorear e informar al personal de salud el estado de pacientes… conforme a procedimientos establecidos.',
      ae: 'ENF-M2-AE1', aeText: 'Vigila el contexto clínico de pacientes en estado crítico o que han sido sometidos a procedimientos invasivos, de acuerdo a los estándares vigentes y a las indicaciones entregadas, e informa sobre posibles alteraciones a los o las profesionales.',
      contexto: '16:50. Suenan dos llamados y una bomba.',
      mision: 'No puedes estar en tres sitios.\nObserva cada llamado antes de correr.',
      thinkRisk: 'Observa. ¿Qué no puede esperar?',
      hint: 'Escucha la alarma y lee cada llamado. ¿Cuál es vía o riesgo y cuál es confort diferible?',
      decideAsk: '¿A dónde irías primero?',
      secondAsk: 'La oclusión se resolvió. La persona sigue somnolienta. ¿Qué sigue?',
      did: 'Priorizaste la alarma de infusión e informaste el estado.',
      aprendizaje: 'Se prioriza riesgo de vía, se informa y el confort diferible espera.',
      error: 'Atender primero un confort diferible o silenciar una alarma sin informar',
      spaces: [
        {id: 'u3', label: 'Unidad 3', photo: '/static/themes/route/enfermeria-3.webp', focus: '60% 40%', voice: 'Unidad 3. Suena una alarma. Mira la vía y a la persona.'},
        {id: 'pasillo', label: 'Pasillo', photo: '/static/themes/route/enfermeria-1.webp', focus: '30% 45%', voice: 'Pasillo. Hay otro llamado. ¿Es urgente?'},
        {id: 'u5', label: 'Unidad 5', photo: '/static/themes/route/enfermeria-4.webp', focus: '70% 70%', voice: 'Unidad 5. Mira el piso junto al riel.'}
      ],
      objects: [
        {id: 'bomba', space: 'u3', label: 'Bomba', x: 68, y: 28, role: 'act',
          fact: 'Alarma de oclusión. Paciente somnoliento.', think: '¿Puede esperar esta vía?', voice: 'La bomba pita. ¿El sonido o el estado?'},
        {id: 'timbr1', space: 'pasillo', label: 'Unidad 9', x: 28, y: 48, role: 'person',
          fact: 'Piden el urinario. Dicen que no es urgente.', think: '¿Dónde queda eso en tu orden?', voice: 'Piden el urinario y dicen que puede esperar.'},
        {id: 'timbr2', space: 'u5', label: 'Charco', x: 48, y: 82, role: 'clue',
          fact: 'Hay charco bajo el riel del suero.', think: '¿Eso se señala ya o espera a la bomba?', voice: 'Mira el piso. ¿Hay un charco?'},
        {id: 'reloj', space: 'pasillo', label: 'Turno', x: 14, y: 22, role: 'realism',
          fact: 'Falta poco para el cambio de turno.', think: '¿Firmar el turno cierra la vigilancia?', voice: 'El reloj apura. La alarma sigue.'}
      ],
      need: 2,
      decisions: [
        {id: 'a', object: 'timbr1', mark: 'A', quality: 'wrong', retry: true, fx: ['stop', 'alarm'],
          feedback: 'El entorno te devuelve. La alarma de infusión no esperaba al urinario.'},
        {id: 'b', object: 'bomba', mark: 'B', quality: 'ok', fx: ['alarm'],
          feedback: 'Buena decisión. La vigilancia de una vía no espera al confort diferible.'},
        {id: 'c', object: 'timbr2', mark: 'C', quality: 'partial', fx: ['wet', 'alarm'],
          feedback: 'El charco es un riesgo, pero la alarma de infusión sigue activa.'}
      ],
      second: [
        {id: 's1', object: 'bomba', mark: 'A', quality: 'ok', fx: ['safe'],
          feedback: 'Informas el evento y el estado. Luego el charco. Luego el urinario.'},
        {id: 's2', object: 'reloj', mark: 'B', quality: 'wrong', fx: ['stop'],
          feedback: '«Ya quedó andando» deja al equipo sin el dato. El AE pide informar.'},
        {id: 's3', object: 'timbr1', mark: 'C', quality: 'wrong', fx: ['stop'],
          feedback: 'Apagar y retirarte no cierra la vigilancia.'}
      ]
    }
  ];

  function hx(v) {
    if (typeof esc === 'function') return esc(v);
    return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }
  const STORE = 'aula-tp-mm-enf-v1';
  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { return {}; }
  }
  function runs() { return loadStore().missions || {}; }
  function saveRun(st) {
    const db = loadStore();
    db.missions = db.missions || {};
    db.missions[st.mission.id] = {
      completed: true,
      quality: st.quality || 'partial',
      attempts: st.attempts,
      elapsed_ms: Date.now() - st.t0,
      ae: st.mission.ae,
      reinforce: (st.quality || 'partial') !== 'ok',
      observe: String(st.observe || '').slice(0, 2000),
      at: new Date().toISOString()
    };
    localStorage.setItem(STORE, JSON.stringify(db));
    st.saved = true;
  }
  function isUnlocked(id) {
    const i = MISSIONS.findIndex(m => m.id === id);
    if (i <= 0) return true;
    const prev = runs()[MISSIONS[i - 1].id];
    return !!(prev && prev.completed);
  }
  function completedCount() { return MISSIONS.filter(m => runs()[m.id]?.completed).length; }
  function byId(id) { return MISSIONS.find(m => m.id === id) || MISSIONS[0]; }
  function missionForPosition(pos) {
    const map = {1: 'm01', 2: 'm02', 3: 'm03', 4: 'm04', 5: 'm04', 6: 'm03', 7: 'm02', 8: 'm05', 9: 'm01'};
    return map[Number(pos)] || 'm01';
  }
  function speak(text, intent) {
    const line = String(text || '').replace(/\s+/g, ' ').trim();
    if (!line) return;
    const live = document.querySelector('[data-mm-voice-live]');
    if (live) live.textContent = line;
    if (window.AulaNarration && typeof AulaNarration.speak === 'function') {
      AulaNarration.speak(line, {intent: intent || 'instruction'});
    }
  }
  function spacesOf(m) { return m.spaces; }
  function spaceOf(m, id) { return m.spaces.find(s => s.id === id) || m.spaces[0]; }
  function wallsOf(m) {
    const s = spacesOf(m);
    const faces = [s[0], s[1] || s[0], s[2] || s[1] || s[0]];
    const yaws = [-70, 0, 70];
    return faces.map((sp, i) => ({
      yaw: yaws[i],
      space: sp,
      silent: false,
      focus: sp.focus || '50% 45%'
    }));
  }
  function yawForSpace(m, id) {
    const i = Math.max(0, spacesOf(m).findIndex(s => s.id === id));
    return [-70, 0, 70][Math.min(i, 2)];
  }
  function clampYaw(y) {
    return Math.max(-90, Math.min(90, y));
  }
  function objOf(m, id) { return (m.objects || []).find(o => o.id === id); }
  function enough(s) { return String(s || '').trim().length >= 16; }
  function explored(st) {
    return st.inspected.size >= st.mission.need && st.visitedSpaces.size >= 2;
  }

  function voiceFor(st, extra) {
    const m = st.mission;
    const sp = spaceOf(m, st.space);
    if (st.phase === 'mundo') return m.contexto + ' No te dicen qué mirar todavía. Recorre.';
    if (st.phase === 'explorar') return extra || (sp.voice + ' ' + m.mision.replace(/\n/g, ' '));
    if (st.phase === 'interpretar') return m.thinkRisk;
    if (st.phase === 'decidir') return m.decideAsk + ' Elige un objeto del entorno.';
    if (st.phase === 'segunda') return m.secondAsk + ' Elige de nuevo en el mundo.';
    if (st.phase === 'cierre') return 'Misión cumplida. ' + m.aprendizaje;
    return extra || '';
  }

  function scores(st) {
    const obs = st.visitedSpaces.size >= 2 && st.inspected.size >= st.mission.need ? 'Alta' : st.inspected.size ? 'Media' : 'Inicial';
    const an = enough(st.observe) ? 'Alta' : 'En construcción';
    const dec = st.quality === 'ok' ? 'Adecuada' : st.quality === 'partial' ? 'Con vacíos' : 'Detenida y reintentada';
    return {obs, an, dec};
  }

  function fxHtml(st) {
    const fx = st.fx;
    return `${fx.has('wet') ? '<i class="mm-fx-wet"></i>' : ''}
      ${fx.has('tape') ? '<i class="mm-fx-tape"></i><span class="mm-fx-tag" style="left:62%;top:72%">Piso señalizado</span>' : ''}
      ${fx.has('stop') ? '<i class="mm-fx-vignette"></i>' : ''}
      ${fx.has('safe') ? '<i class="mm-fx-ok"></i>' : ''}
      ${fx.has('curtain') ? '<i class="mm-fx-curtain"></i><span class="mm-fx-tag" style="left:88%;top:22%">Cortina cerrada</span>' : ''}`;
  }

  function cardHtml(st) {
    const m = st.mission;
    const voice = `<p class="mm-voice-line" data-mm-voice-live aria-live="polite"></p>`;
    if (st.phase === 'mundo') {
      return `<article class="mm-card is-chip"><span class="mm-card-kicker">${hx(m.clock)} · ${hx(m.place)}</span><p>${hx(m.contexto)}</p></article>`;
    }
    if (st.chip && (st.phase === 'explorar' || st.phase === 'decidir' || st.phase === 'segunda') && !st.slip) {
      const k = st.phase === 'explorar' ? 'Misión' : st.phase === 'decidir' ? 'Decide en el mundo' : 'La situación continúa';
      return `<article class="mm-card is-chip"><span class="mm-card-kicker">${hx(k)}</span>
        <p>${st.phase === 'explorar' ? 'Observa el entorno.' : 'Elige un objeto marcado.'}</p>
        ${st.canHint ? `<button type="button" class="outline" data-mm="hint">Pista</button>` : ''}
        ${explored(st) && st.phase === 'explorar' ? `<button type="button" class="primary" data-mm="to-int">Ya observé</button>` : ''}
        ${voice}</article>`;
    }
    if (st.phase === 'explorar' && st.slip) {
      const o = objOf(m, st.slip);
      return `<article class="mm-card"><span class="mm-card-kicker">Entorno</span>
        <h4>${hx(o ? o.think : '¿Qué ves?')}</h4>
        <p class="muted">${hx(o ? o.fact : '')}</p>
        <button type="button" class="outline" data-mm="chip">Seguir observando</button>
        ${voice}</article>`;
    }
    if (st.phase === 'explorar') {
      return `<article class="mm-card"><span class="mm-card-kicker">Misión</span>
        <p>${hx(m.mision).replace(/\n/g, '<br>')}</p>
        <button type="button" class="primary" data-mm="chip">Observar</button>
        ${voice}</article>`;
    }
    if (st.phase === 'interpretar') {
      return `<article class="mm-card"><span class="mm-card-kicker">Pregunta de pensamiento</span>
        <h4>${hx(m.thinkRisk)}</h4>
        <label class="mm-write"><input name="observe" maxlength="400" value="${hx(st.observe)}" placeholder="Una idea, con un dato del entorno."></label>
        <button type="button" class="primary" data-mm="to-dec" ${enough(st.observe) ? '' : 'disabled'}>Decidir en el mundo</button>
        ${voice}</article>`;
    }
    if (st.phase === 'decidir' || st.phase === 'segunda') {
      return `<article class="mm-card"><span class="mm-card-kicker">${st.phase === 'segunda' ? 'La situación continúa' : 'Decide en el mundo'}</span>
        <h4>${hx(st.phase === 'segunda' ? m.secondAsk : m.decideAsk)}</h4>
        <p class="muted">Las opciones están en los objetos. A, B o C.</p>
        ${st.feedback ? `<p>${hx(st.feedback)}</p>` : ''}
        ${st.canHint ? `<button type="button" class="outline" data-mm="hint">Pista</button>` : ''}
        ${voice}</article>`;
    }
    const sc = scores(st);
    return `<article class="mm-card"><span class="mm-card-kicker">Misión completada</span>
      <p><b>Lo que hiciste</b><br>${hx(m.did)}</p>
      <p><b>Lo que aprendiste</b><br>${hx(m.aprendizaje)}</p>
      <div class="mm-scores" aria-label="Desempeño en esta experiencia">
        <div>👁 Observación · ${hx(sc.obs)}</div>
        <div>🧠 Análisis · ${hx(sc.an)}</div>
        <div>⚙️ Decisión · ${hx(sc.dec)}</div>
      </div>
      <p class="muted">${hx(m.ae)}</p>
      <div class="mm-close-actions">
        <button type="button" class="primary" data-mm="save">Registrar y volver</button>
        <button type="button" class="outline" data-mm="replay">Otra decisión</button>
      </div>
      ${voice}</article>`;
  }

  function worldHtml(st) {
    const m = st.mission;
    const list = spacesOf(m);
    const sp = spaceOf(m, st.space);
    const choosing = st.phase === 'decidir' || st.phase === 'segunda';
    const opts = choosing ? (st.phase === 'segunda' ? m.second : m.decisions) : [];
    const byObj = {};
    opts.forEach(d => { byObj[d.object] = d; });
    const left = Math.max(0, 180 - Math.floor((Date.now() - st.t0) / 1000));
    const fxClass = [...st.fx].map(f => 'fx-' + f).join(' ');
    const walls = wallsOf(m);
    return `<div class="mm-world" data-mm-world>
      <div class="mm-look mm-stage" tabindex="0" aria-label="${hx(sp.label)}. Arrastra para mirar en 180 grados. Rueda o usa más y menos para acercar.">
        <div class="mm-orbit ${hx(fxClass)}" data-mm-orbit data-mm-room>
          ${walls.map(w => {
            const wallPins = (m.objects || []).filter(h => !h.space || h.space === w.space.id);
            return `<div class="mm-wall" data-mm-wall="${hx(w.space.id)}" style="transform:rotateY(${w.yaw}deg) translateZ(52vw)">
              <img class="mm-photo" src="${hx(w.space.photo)}" alt="" style="object-position:${hx(w.focus)}" decoding="async" draggable="false">
              ${w.space.id === sp.id ? fxHtml(st) : ''}
              ${wallPins.map(h => {
                const d = byObj[h.id];
                const choice = !!(d && choosing);
                return `<button type="button" class="mm-hot${st.inspected.has(h.id) ? ' is-done' : ''}${choice ? ' is-choice' : ''}" data-mm-hot="${hx(h.id)}" data-role="${hx(h.role || 'clue')}" style="left:${h.x}%;top:${h.y}%">${choice ? `<b class="mm-mark">${hx(d.mark)}</b>` : '<i></i>'}<span>${choice ? hx(d.mark + ' · ' + h.label) : hx(h.label)}</span></button>`;
              }).join('')}
            </div>`;
          }).join('')}
          <div class="mm-floor"></div>
          <div class="mm-ceil"></div>
        </div>
      </div>
      <div class="mm-hud">
        <div class="mm-hud-top">
          <button type="button" class="outline" data-mm="hub">Colección</button>
          <p class="mm-clock">${hx(m.clock)} · ${hx(sp.label)} · 180° · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</p>
          <nav class="mm-spaces" aria-label="Caminar">
            ${list.map(s => `<button type="button" class="${s.id === sp.id ? 'is-here' : ''}" data-mm-space="${hx(s.id)}">${hx(s.label)}</button>`).join('')}
          </nav>
        </div>
      </div>
      <div class="mm-look-tools">
        <button type="button" data-mm-cam="out" aria-label="Alejar">−</button>
        <span class="mm-zoom-read" data-mm-zoom-read>1.0×</span>
        <button type="button" data-mm-cam="in" aria-label="Acercar">+</button>
        <button type="button" data-mm-cam="reset" aria-label="Centrar la vista">180°</button>
      </div>
      ${cardHtml(st)}
    </div>`;
  }

  function pickerHtml() {
    const n = completedCount();
    const rec = runs();
    return `<div class="mm-root" data-mm-root>
      <div class="mm-banner mm-banner-game">
        <div>
          <p class="mm-kicker">No te preguntamos qué sabes. Te ponemos en una situación y te pedimos que decidas.</p>
          <h3>Colección · Atención de Enfermería</h3>
          <p class="muted">5 situaciones profesionales. El mundo es el recurso. Los recuadros solo guían.</p>
        </div>
        <p class="mm-count" aria-label="Misiones de esta colección"><b>${n}</b><span> de ${MISSIONS.length} misiones</span></p>
      </div>
      <ol class="mm-track">${MISSIONS.map((m, i) => {
        const run = rec[m.id];
        const open = isUnlocked(m.id);
        const stamp = !run ? (open ? 'Disponible' : 'Bloqueada') : (run.quality === 'ok' ? 'Lograda' : 'Completada · refuerzo');
        return `<li class="${run ? 'is-done' : ''} ${open ? '' : 'is-lock'}">
          <button type="button" data-mm-pick="${hx(m.id)}" ${open ? '' : 'disabled'}>
            <img src="${hx(m.photo)}" alt="">
            <span class="mm-num">${String(i + 1).padStart(2, '0')}</span>
            <b>${hx(m.title.replace(/^Misión 0\d — /, ''))}</b>
            <small>${hx(m.ae)} · ${hx(stamp)}</small>
          </button>
        </li>`;
      }).join('')}</ol>
      <p class="mm-src">${hx(SRC)} Universo: las 5 misiones de esta página. No es nota del curso.</p>
    </div>`;
  }

  function render(root, st) {
    root.innerHTML = `<div class="mm-root is-in-world" data-mm-root>${worldHtml(st)}</div>`;
    bindCam(root, st);
    const live = root.querySelector('[data-mm-voice-live]');
    if (live && st.voiceLine) live.textContent = st.voiceLine;
  }
  function bindCam(root, st) {
    const stage = root.querySelector('.mm-look');
    const orbit = root.querySelector('[data-mm-orbit]');
    if (!stage || !orbit) return;
    if (!st.cam) st.cam = {yaw: yawForSpace(st.mission, st.space), pitch: 0, zoom: 1};
    st.cam.yaw = clampYaw(st.cam.yaw);
    const cam = st.cam;
    const photo = stage.querySelector('.mm-photo');
    const maxSharp = () => {
      const nat = photo && photo.naturalWidth ? photo.naturalWidth : 1920;
      const view = stage.clientWidth || 1280;
      return Math.max(1.35, Math.min(2.4, nat / view));
    };
    const apply = () => {
      const z = (cam.zoom - 1) * 420;
      orbit.style.transform = `translateZ(${z}px) rotateX(${cam.pitch}deg) rotateY(${-cam.yaw}deg)`;
      const read = root.querySelector('[data-mm-zoom-read]');
      if (read) read.textContent = cam.zoom.toFixed(1) + '×';
    };
    const clampZoom = (z) => Math.max(1, Math.min(maxSharp(), z));
    let drag = null;
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.mm-hot, .mm-card, .mm-hud, .mm-look-tools')) return;
      if (e.isPrimary === false) return;
      drag = {x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch};
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', e => {
      if (!drag) return;
      cam.yaw = clampYaw(drag.yaw + (e.clientX - drag.x) * 0.18);
      cam.pitch = Math.max(-18, Math.min(18, drag.pitch + (e.clientY - drag.y) * -0.1));
      apply();
    });
    stage.addEventListener('pointerup', () => {
      drag = null;
      const walls = wallsOf(st.mission);
      let near = walls[0];
      let best = 999;
      walls.forEach(w => {
        const d = Math.abs(cam.yaw - w.yaw);
        if (d < best) { best = d; near = w; }
      });
      if (near && near.space) st.visitedSpaces.add(near.space.id);
    });
    stage.addEventListener('wheel', e => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? -0.12 : 0.12;
      cam.zoom = clampZoom(cam.zoom + dir);
      apply();
    }, {passive: false});
    stage.addEventListener('gesturestart', e => e.preventDefault());
    root.querySelectorAll('[data-mm-cam]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const a = btn.dataset.mmCam;
        if (a === 'in') cam.zoom = clampZoom(cam.zoom + 0.2);
        if (a === 'out') cam.zoom = clampZoom(cam.zoom - 0.2);
        if (a === 'reset') { cam.zoom = 1; cam.pitch = 0; cam.yaw = yawForSpace(st.mission, st.space); }
        apply();
      });
    });
    apply();
  }

  function showHub(root) {
    root.innerHTML = pickerHtml();
    root.onclick = e => {
      const b = e.target.closest('[data-mm-pick]');
      if (!b || b.disabled) return;
      play(root, b.dataset.mmPick);
    };
  }
  function applyChoice(st, d) {
    st.attempts += 1;
    st.choiceIds.push(d.id);
    st.choiceLabels.push(d.object);
    if (st.phase === 'decidir') st.quality = d.quality;
    else if (d.quality === 'wrong') st.quality = 'wrong';
    else if (d.quality === 'partial' && st.quality === 'ok') st.quality = 'partial';
    st.feedback = d.feedback;
    st.fx = new Set(d.fx || []);
    st.chip = false;
    st.slip = '';
  }

  function play(root, missionId) {
    const mission = byId(missionId);
    const st = {
      mission, phase: 'mundo', inspected: new Set(), slip: '',
      choiceIds: [], choiceLabels: [], quality: '', feedback: '',
      attempts: 0, t0: Date.now(), saved: false,
      observe: '', space: mission.spaces[0].id,
      visitedSpaces: new Set([mission.spaces[0].id]),
      fx: new Set(), chip: false, canHint: false, voiceLine: '', hintOn: false,
      cam: {yaw: 0, pitch: 0, zoom: 1}
    };
    let idle = null;
    const armHint = () => {
      clearTimeout(idle);
      if (st.phase !== 'explorar' && st.phase !== 'decidir') return;
      idle = setTimeout(() => {
        st.canHint = true;
        render(root, st);
      }, 16000);
    };
    const intentOf = (phase, extra) => {
      if (extra) return extra;
      if (phase === 'mundo' || phase === 'explorar') return 'mission';
      if (phase === 'interpretar' || phase === 'decidir' || phase === 'segunda') return 'instruction';
      return 'feedback';
    };
    const say = (t, intent) => { st.voiceLine = t; speak(t, intent); };
    const tick = (line, intent) => {
      render(root, st);
      say(line || voiceFor(st), intent || intentOf(st.phase));
      armHint();
    };
    const readObserve = () => {
      const o = root.querySelector('[name="observe"]');
      if (o) st.observe = o.value;
    };

    root.oninput = e => {
      if (e.target && e.target.name === 'observe') {
        st.observe = e.target.value;
        const btn = root.querySelector('[data-mm="to-dec"]');
        if (btn) btn.disabled = !enough(st.observe);
      }
    };
    root.onclick = e => {
      const hot = e.target.closest('[data-mm-hot]');
      if (hot) {
        const id = hot.dataset.mmHot;
        const o = objOf(mission, id);
        if (!o) return;
        if (st.phase === 'decidir' || st.phase === 'segunda') {
          const list = st.phase === 'segunda' ? mission.second : mission.decisions;
          const d = list.find(x => x.object === id);
          if (!d) {
            st.inspected.add(id);
            st.slip = id;
            st.chip = false;
            render(root, st);
            say(o.voice || o.think, 'instruction');
            return;
          }
          applyChoice(st, d);
          if (d.retry && d.quality === 'wrong') {
            render(root, st);
            say(d.feedback + ' Vuelve a mirar. ¿Qué espacio te saltaste?', 'error');
            setTimeout(() => {
              st.feedback = '';
              st.fx = new Set(d.fx.filter(x => x === 'wet' || x === 'alarm'));
              render(root, st);
            }, 2200);
            return;
          }
          if (st.phase === 'decidir') {
            st.phase = 'segunda';
            tick(d.feedback + ' ' + mission.secondAsk, d.quality === 'ok' ? 'success' : 'feedback');
            return;
          }
          st.phase = 'cierre';
          tick(d.feedback + ' ' + mission.aprendizaje, d.quality === 'ok' ? 'success' : 'feedback');
          return;
        }
        if (st.phase === 'mundo' || st.phase === 'explorar' || st.phase === 'interpretar') {
          if (st.phase === 'mundo') st.phase = 'explorar';
          st.inspected.add(id);
          st.slip = id;
          st.chip = false;
          st.canHint = false;
          render(root, st);
          say(o.voice || o.think, 'instruction');
          armHint();
          return;
        }
      }
      const go = e.target.closest('[data-mm-space]');
      if (go) {
        st.space = go.dataset.mmSpace;
        st.visitedSpaces.add(st.space);
        st.cam = st.cam || {yaw: 0, pitch: 0, zoom: 1};
        st.cam.yaw = yawForSpace(mission, st.space);
        if (st.phase === 'mundo') st.phase = 'explorar';
        if (st.phase === 'explorar') { st.slip = ''; st.chip = true; }
        render(root, st);
        say(voiceFor(st, spaceOf(mission, st.space).voice), 'instruction');
        armHint();
        return;
      }
      const act = e.target.closest('[data-mm]');
      if (!act) return;
      const a = act.dataset.mm;
      if (a === 'hub') { clearTimeout(idle); showHub(root); return; }
      if (a === 'chip') { st.chip = true; st.slip = ''; render(root, st); return; }
      if (a === 'hint') {
        st.canHint = false;
        st.chip = false;
        st.slip = '';
        st.hintOn = true;
        render(root, st);
        const card = root.querySelector('.mm-card');
        if (card) {
          card.innerHTML = `<span class="mm-card-kicker">Pista</span><h4>${hx(mission.hint)}</h4><button type="button" class="outline" data-mm="chip">Volver al entorno</button><p class="mm-voice-line" data-mm-voice-live></p>`;
        }
        say(mission.hint, 'hint');
        return;
      }
      if (a === 'to-int' && explored(st)) { st.phase = 'interpretar'; st.chip = false; tick(); return; }
      if (a === 'to-dec') {
        readObserve();
        if (!enough(st.observe)) return;
        st.phase = 'decidir';
        st.feedback = '';
        st.chip = false;
        tick();
        return;
      }
      if (a === 'save') {
        saveRun(st);
        clearTimeout(idle);
        showHub(root);
        return;
      }
      if (a === 'replay') { clearTimeout(idle); play(root, mission.id); return; }
      if (a === 'voice') { say(st.voiceLine || voiceFor(st), intentOf(st.phase)); return; }
    };

    tick();
    setTimeout(() => {
      if (st.phase !== 'mundo') return;
      st.phase = 'explorar';
      tick();
    }, 1600);
  }

  function mount(el) {
    if (!el) return;
    showHub(el);
  }

  globalThis.AulaMicroEnfermeria = {mount, missions: MISSIONS, missionForPosition};
})();
