"""A single progressive route over existing resources and official AE content."""
from copy import deepcopy

PHASES = ['Analizar', 'Comprender', 'Relacionar', 'Aplicar y decidir', 'Verificar', 'Retroalimentar']
QUESTIONS = ['\u00bfQu\u00e9 informaci\u00f3n tengo?', '\u00bfQu\u00e9 significa?', '\u00bfC\u00f3mo se conecta con otros elementos?',
             '\u00bfQu\u00e9 hago con este conocimiento?', '\u00bfC\u00f3mo compruebo mi decisi\u00f3n?', '\u00bfQu\u00e9 logr\u00e9 y c\u00f3mo mejoro?']
MEDIA_FIELDS = ('image', 'alt', 'caption', 'video', 'vtt', 'document', 'table', 'media_kind', 'media_key')


def learning_sequence(ae):
    originals = ae.get('experiences') or []
    original = lambda i: deepcopy(originals[i]) if i < len(originals) else {}
    source = original(0)
    elements = [str(s.get('label') or s.get('id')) for s in source.get('spots') or []]
    if not elements:
        elements = list(original(1).get('left') or source.get('items') or ['Evidencia del caso', 'Documento de respaldo', 'Criterio del AE', 'Registro'])
    elements = list(dict.fromkeys(elements))[:8]
    if len(elements) < 2:
        elements += ['Documento de respaldo']
    analyze = source if source.get('type') in ('hotspot', 'classify') else {k: v for k, v in source.items() if k in MEDIA_FIELDS}
    analyze.setdefault('type', 'observe')
    analyze['prompt'] = ('Explora el recurso y abre todos los puntos se\u00f1alados. Identifica qu\u00e9 representa cada elemento y qu\u00e9 informaci\u00f3n entrega.'
                         if analyze['type'] == 'hotspot' else 'Observa el recurso y distingue los elementos y datos disponibles antes de tomar una decisi\u00f3n.')
    comprehend = original(1)
    if comprehend.get('type') != 'match':
        comprehend = {k: v for k, v in comprehend.items() if k in MEDIA_FIELDS}
        comprehend.update(type='match', left=['Dato observable', 'Fuente', 'Criterio', 'Informaci\u00f3n faltante'],
                          right=['Informaci\u00f3n que aparece directamente en el recurso.', 'Documento o registro del que proviene un dato.',
                                 'Condici\u00f3n con la que se contrasta la evidencia.', 'Antecedente que el recurso no permite determinar.'],
                          answer=[[i, i] for i in range(4)])
    comprehend['prompt'] = 'Relaciona cada concepto con su significado y explica c\u00f3mo ayuda a interpretar el recurso.'
    relate = {k: v for k, v in source.items() if k in MEDIA_FIELDS}
    relate.update(type='relate', elements=elements, prompt='Selecciona dos elementos relacionados y explica qu\u00e9 dato del recurso permite establecer esa relaci\u00f3n.')
    apply = original(3)
    if apply.get('type') != 'choice':
        apply.update(type='choice', prompt='Falta un antecedente necesario para actuar. \u00bfQu\u00e9 har\u00edas primero?',
                     options=['Solicitar el antecedente y contrastarlo con el criterio del AE.', 'Continuar suponiendo el dato que falta.', 'Reemplazar el documento por una opini\u00f3n personal.'], answer=0)
    verify = {k: v for k, v in source.items() if k in MEDIA_FIELDS and k not in ('video', 'vtt')}
    verify.update(type='verify', prompt='Revisa la decisi\u00f3n que tomaste y comprueba si es coherente con la informaci\u00f3n t\u00e9cnica disponible. Compara los datos del recurso y las especificaciones antes de confirmar.',
                  options=['Mantendr\u00eda mi decisi\u00f3n.', 'Modificar\u00eda mi decisi\u00f3n.'],
                  checklist=['La decisi\u00f3n o ubicaci\u00f3n propuesta.', 'Las medidas o condiciones disponibles.', 'La informaci\u00f3n del recurso.', 'Las especificaciones t\u00e9cnicas.', 'Las posibles contradicciones o interferencias.'])
    reflect = {'type': 'reflect', 'prompt': 'Revisa la retroalimentaci\u00f3n del sistema y las orientaciones de Nubi. Identifica lo que resolviste y lo que necesitas revisar. Utiliza esas orientaciones para mejorar tu respuesta y confirmar tu decisi\u00f3n final.'}
    analyze['prompt'] = 'Observa atentamente el recurso e identifica la informaci\u00f3n t\u00e9cnica que aparece en \u00e9l. Reconoce sus principales elementos, datos y notas.' + (' Abre cada punto se\u00f1alado.' if analyze['type'] == 'hotspot' else '')
    comprehend['prompt'] = 'Revisa los conceptos y especificaciones asociados al recurso. Observa qu\u00e9 representa cada elemento, qu\u00e9 funci\u00f3n cumple y qu\u00e9 informaci\u00f3n entregan las notas. Forma las parejas para comprobar su significado.'
    relate['prompt'] = 'Relaciona la informaci\u00f3n del recurso con sus elementos y especificaciones. Selecciona dos elementos y vinc\u00falalos con su funci\u00f3n, ubicaci\u00f3n o caracter\u00edstica t\u00e9cnica.'
    case = apply.get('prompt', '')
    apply['prompt'] = 'Utiliza la informaci\u00f3n que analizaste para tomar una decisi\u00f3n t\u00e9cnica. Revisa los datos y las especificaciones disponibles. Selecciona una alternativa y justifica brevemente tu respuesta.'
    apply['case_prompt'] = case if '\u00ab' not in case else 'El recurso no contiene todos los antecedentes necesarios. \u00bfQu\u00e9 har\u00edas antes de actuar?'
    evidence = ['\u00bfQu\u00e9 informaci\u00f3n consideras importante revisar antes de tomar una decisi\u00f3n?',
                '\u00bfQu\u00e9 significa la informaci\u00f3n del recurso y c\u00f3mo te ayuda a comprender el trabajo?',
                '\u00bfQu\u00e9 relaci\u00f3n existe entre los elementos que elegiste y sus caracter\u00edsticas t\u00e9cnicas?',
                '\u00bfQu\u00e9 informaci\u00f3n del recurso respalda tu decisi\u00f3n?',
                'Despu\u00e9s de revisar la informaci\u00f3n, \u00bfmantendr\u00edas tu decisi\u00f3n o realizar\u00edas alg\u00fan cambio? \u00bfPor qu\u00e9?',
                '\u00bfQu\u00e9 comprendiste mejor despu\u00e9s de revisar la retroalimentaci\u00f3n?']
    if 'planos de refrigeraci\u00f3n y climatizaci\u00f3n' in str(ae.get('description') or ae.get('title') or '').casefold():
        analyze['prompt'] = 'Observa atentamente el plano de climatizaci\u00f3n e identifica la informaci\u00f3n t\u00e9cnica que aparece en \u00e9l. Reconoce equipos, s\u00edmbolos, medidas, recorridos de tuber\u00edas y notas t\u00e9cnicas.' + (' Abre cada punto se\u00f1alado.' if analyze['type'] == 'hotspot' else '')
        comprehend['prompt'] = 'Revisa la simbolog\u00eda y las especificaciones t\u00e9cnicas asociadas al plano. Observa qu\u00e9 representa cada s\u00edmbolo, qu\u00e9 funci\u00f3n cumple cada componente y qu\u00e9 informaci\u00f3n entregan las notas. Forma las parejas para comprobar su significado.'
        evidence[0] = '\u00bfQu\u00e9 informaci\u00f3n consideras importante revisar antes de tomar una decisi\u00f3n sobre la instalaci\u00f3n?'
        evidence[1] = '\u00bfQu\u00e9 significa la informaci\u00f3n que aparece en el plano y c\u00f3mo te ayuda a comprender la instalaci\u00f3n?'
        relate['prompt'] = 'Relaciona la informaci\u00f3n del plano con los componentes y especificaciones correspondientes. Vincula los elementos con su funci\u00f3n, ubicaci\u00f3n o caracter\u00edstica t\u00e9cnica. Por ejemplo: s\u00edmbolo con componente; componente con funci\u00f3n; plano con especificaci\u00f3n.'
        evidence[2] = '\u00bfQu\u00e9 relaci\u00f3n existe entre la informaci\u00f3n del plano y las caracter\u00edsticas t\u00e9cnicas de los componentes?'
        for field in MEDIA_FIELDS:
            apply.pop(field, None)
            if field in source:
                apply[field] = deepcopy(source[field])
        apply.update(decision_version=2, case_prompt='\u00bfD\u00f3nde instalar\u00edas el equipo de climatizaci\u00f3n y qu\u00e9 informaci\u00f3n utilizaste para tomar esa decisi\u00f3n?',
                     options=['Propondr\u00eda la ubicaci\u00f3n indicada para la unidad interior en el plano y confirmar\u00eda dimensiones, especificaciones e interferencias antes de instalar.',
                              'Elegir\u00eda cualquier espacio libre, sin contrastar las especificaciones.',
                              'Cambiar\u00eda la ubicaci\u00f3n del equipo sin revisar el plano.'], answer=0)
        evidence[3] = '\u00bfD\u00f3nde instalar\u00edas el equipo de climatizaci\u00f3n y qu\u00e9 informaci\u00f3n utilizaste para tomar esa decisi\u00f3n? Indica tambi\u00e9n qu\u00e9 falta confirmar antes de instalar.'
        verify['checklist'] = ['La ubicaci\u00f3n del equipo.', 'Las dimensiones disponibles.', 'La informaci\u00f3n del plano.', 'Las especificaciones t\u00e9cnicas.', 'La existencia de posibles interferencias.']
    hints = ['Mira cada punto y separa lo que muestra de lo que tendr\u00edas que consultar.',
             'Busca la definici\u00f3n en el recurso. Compara su funci\u00f3n, no solo la forma o el nombre.',
             '\u00bfQu\u00e9 referencia comparten los dos elementos? Ubica el dato que permite conectarlos.',
             '\u00bfTu decisi\u00f3n depende de un dato visible o de algo que est\u00e1s suponiendo?',
             'Vuelve al recurso y distingue lo que permite comprobar de lo que requiere otra fuente.',
             'Compara tu primer intento con las orientaciones recibidas. Nombra un cambio concreto.']
    sequence = [analyze, comprehend, relate, apply, verify, reflect]
    for i, exp in enumerate(sequence):
        exp.update(phase=PHASES[i], focus=QUESTIONS[i], evidence_prompt=evidence[i], support=hints[i], hints=[hints[i]])
        exp['guidance'] = [QUESTIONS[i], hints[i],
                           'Busca un dato concreto en el recurso y comp\u00e1ralo con tu respuesta. Si no aparece, indica qu\u00e9 falta y d\u00f3nde lo consultar\u00edas.',
                           'Un dato visible, su significado y el criterio t\u00e9cnico cumplen funciones distintas. Relaciona esos antecedentes para justificar tu respuesta; no completes los datos faltantes por suposici\u00f3n.']
    return sequence


def validate_sequence(exp, response, text):
    from pedagogy import validate_experience
    if not isinstance(response, dict) or not isinstance(text, str) or not 20 <= len(text.strip()) <= 10000:
        return False, 'Escribe una respuesta breve con al menos 20 caracteres y un dato del recurso.'
    kind = exp['type']
    if kind == 'relate':
        elements = response.get('elements')
        if not isinstance(elements, list) or len(elements) != 2 or any(type(i) is not int or i not in range(len(exp['elements'])) for i in elements) or len(set(elements)) != 2:
            return False, 'Selecciona dos elementos diferentes y explica qu\u00e9 informaci\u00f3n los conecta.'
    elif kind == 'verify':
        if type(response.get('choice')) is not int or response['choice'] not in (0, 1):
            return False, 'Indica si mantendr\u00edas o modificar\u00edas tu decisi\u00f3n y explica por qu\u00e9.'
        checks = response.get('checks', [])
        if not isinstance(checks, list) or any(type(i) is not int or i not in range(len(exp['checklist'])) for i in checks) or len(set(checks)) != len(checks):
            return False, 'Revisa los elementos de la lista de comprobaci\u00f3n.'
    elif kind == 'reflect':
        if any(not isinstance(response.get(k), str) or not 3 <= len(response[k].strip()) <= 1200 for k in ('learned', 'improve')):
            return False, 'Responde las dos preguntas breves para cerrar la retroalimentaci\u00f3n.'
        final = response.get('final_decision', '')
        if not isinstance(final, str) or ((final or response.get('review_version') == 2) and not 20 <= len(final.strip()) <= 1200):
            return False, 'Explica tu decisi\u00f3n final con al menos 20 caracteres.'
    elif kind != 'observe':
        if kind == 'choice' and type(response.get('choice')) is not int:
            return False, exp['support']
        try:
            ok, _ = validate_experience(exp, response)
        except (TypeError, ValueError, KeyError):
            ok = False
        if not ok:
            return False, exp['support']
    return True, ''


def sequence_feedback(exp, ok, message=''):
    kind = exp['type']
    achieved = {'hotspot': 'Abriste los puntos del recurso y registraste una respuesta escrita.',
                'match': 'Relacionaste correctamente los conceptos con sus significados.',
                'classify': 'Clasificaste los elementos de acuerdo con las categor\u00edas del recurso.',
                'relate': 'Seleccionaste dos elementos diferentes y registraste una explicaci\u00f3n de su relaci\u00f3n.',
                'choice': 'Tu selecci\u00f3n coincide con el criterio de esta actividad.',
                'verify': 'Registraste si mantendr\u00edas o modificar\u00edas tu decisi\u00f3n y explicaste por qu\u00e9.',
                'reflect': 'Registraste qu\u00e9 comprendiste y qu\u00e9 cambiar\u00edas.'}.get(kind, 'Registraste una observaci\u00f3n escrita del recurso.')
    return {'logrado': achieved if ok else 'Registraste un intento para revisar tu razonamiento.',
            'por_mejorar': 'Contrasta tambi\u00e9n tu explicaci\u00f3n escrita con el recurso: esta revisi\u00f3n autom\u00e1tica no eval\u00faa su exactitud t\u00e9cnica.' if ok else message,
            'recomendacion': exp['support']}
