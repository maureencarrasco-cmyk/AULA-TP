"""Contratos de instrucción y auditoría pedagógica para Aula TP Chile.

Cada contrato explicita qué hacer, sobre qué, cómo comenzar, qué recurso usar,
qué evidencia producir, para qué se realiza la tarea y cuándo se completa.
"""

from copy import deepcopy


CONTRACT_FIELDS = (
    'action', 'object', 'start', 'resource', 'response', 'purpose', 'completion'
)


def _text(value, fallback=''):
    value = str(value or '').strip()
    return value or fallback


def _contract(*, action, object_, start, resource, response, purpose, completion,
              ae='', criterion='', original='', status='Parcial', problem=''):
    return {
        'action': _text(action),
        'object': _text(object_),
        'start': _text(start),
        'resource': _text(resource),
        'response': _text(response),
        'purpose': _text(purpose),
        'completion': _text(completion),
        'ae': _text(ae),
        'criterion': _text(criterion),
        'original': _text(original),
        'audit_status': status,
        'audit_problem': _text(problem),
    }


def _didactic(kind, criterion):
    conversion = {
        'hotspot': ('imagen técnica', 'explicación escrita'),
        'match': ('tarjetas conceptuales', 'relación semántica justificada'),
        'order': ('pasos desordenados', 'secuencia procedimental'),
        'classify': ('elementos del oficio', 'categorías técnicas'),
        'cube': ('medidas y unidades', 'cálculo con unidad común'),
        'choice': ('caso o evidencia', 'decisión argumentada'),
    }.get(kind, ('evidencia técnica', 'respuesta profesional'))
    return {
        'prior_knowledge': 'Distinguir dato observable, interpretación y supuesto.',
        'new_knowledge': criterion,
        'cognitive_action': 'Analizar, transformar la representación, decidir y verificar.',
        'expected_difficulty': 'Relacionar evidencia parcial con un criterio sin completar datos por intuición.',
        'scaffolding': 'Ruta breve: observa, nombra el dato, aplica el criterio y declara el pendiente.',
        'evidence': conversion[1],
        'feedback': 'Indicio progresivo centrado en el proceso, con posibilidad de reintento.',
        'transfer': 'Aplicación posterior en una situación integradora del mismo módulo.',
        'initial_register': conversion[0],
        'final_register': conversion[1],
        'transformation': f'Convierte {conversion[0]} en {conversion[1]}.',
        'brousseau_cycle': 'Situación → información → acción → decisión → consecuencia → validación.',
    }


def _ae_data(content, index):
    aes = content.get('aes') or []
    ae = aes[index] if 0 <= index < len(aes) else {}
    criteria = ae.get('criteria') or []
    return ae, _text(ae.get('official_code'), f'AE {index + 1}'), criteria


def _criterion(criteria, index=0):
    return _text(criteria[index % len(criteria)]) if criteria else 'Criterio del AE asociado'


def _experience_contract(exp, ae, criterion):
    kind = exp.get('type') or 'respuesta'
    prompt = _text(exp.get('prompt') or exp.get('question') or exp.get('title'))
    common = {
        'ae': _text(ae.get('official_code'), ae.get('title')),
        'criterion': criterion,
        'original': prompt,
        'purpose': f'Demostrar el criterio: {criterion}',
        'status': 'Parcial',
        'problem': 'La consigna indica la acción principal, pero no reúne en un solo lugar el recurso, la evidencia esperada y el criterio de término.',
    }
    if kind == 'hotspot':
        return _contract(
            action='Localiza y abre todos los puntos señalados; luego explica qué información aporta cada uno.',
            object_=prompt,
            start='Comienza por el recinto o elemento principal y continúa punto por punto sin inferir datos que la imagen no muestra.',
            resource='Imagen técnica interactiva, etiquetas visibles y detalle de cada punto.',
            response='Todos los puntos inspeccionados y una explicación escrita basada en un dato visible.',
            completion='Terminas cuando abriste todos los puntos y tu explicación identifica un dato, su significado y un límite de la evidencia.',
            **common,
        )
    if kind == 'match':
        return _contract(
            action='Relaciona cada concepto con su significado técnico y justifica una de las relaciones.',
            object_=prompt,
            start='Lee primero todos los conceptos y significados; después forma las parejas usando función, unidad o documento de respaldo.',
            resource='Tarjetas de conceptos, significados y evidencia presentada en la etapa.',
            response='Todas las parejas correctas y una justificación escrita con vocabulario técnico.',
            completion='Terminas cuando no quedan tarjetas sin pareja y explicas por qué una relación es válida.',
            **common,
        )
    if kind == 'order':
        return _contract(
            action='Ordena el procedimiento y explica qué riesgo evita el orden elegido.',
            object_=prompt,
            start='Identifica el paso que prepara el trabajo y el que verifica el resultado; ubica después los pasos intermedios.',
            resource='Lista de pasos, caso de la etapa y criterio técnico asociado.',
            response='Secuencia completa y una justificación escrita del orden.',
            completion='Terminas cuando todos los pasos están ordenados y justificas el orden con una consecuencia técnica o de seguridad.',
            **common,
        )
    if kind == 'classify':
        return _contract(
            action='Clasifica cada elemento en la categoría que corresponde y fundamenta una clasificación.',
            object_=prompt,
            start='Lee las categorías y decide qué función, dato o documento distingue a cada elemento.',
            resource='Elementos y categorías de la actividad, más la evidencia técnica de la etapa.',
            response='Todos los elementos clasificados y una justificación escrita.',
            completion='Terminas cuando cada elemento pertenece a una categoría y explicas el criterio usado.',
            **common,
        )
    if kind == 'checklist':
        return _contract(
            action='Selecciona las comprobaciones necesarias y explica cuál realizarías primero.',
            object_=prompt,
            start='Distingue entre datos verificados, datos faltantes y suposiciones antes de marcar.',
            resource='Lista de comprobaciones, caso y documentación mostrada.',
            response='Selección completa y una explicación escrita de la prioridad.',
            completion='Terminas cuando marcas todas las comprobaciones pertinentes y justificas la primera acción.',
            **common,
        )
    if kind == 'reflect':
        return _contract(
            action='Revisa tu evidencia, identifica un error posible y propone una mejora verificable.',
            object_=prompt,
            start='Recupera la decisión de la etapa anterior y compárala con el criterio del AE.',
            resource='Tus respuestas de la etapa, retroalimentación recibida y criterio técnico.',
            response='Una reflexión que nombre evidencia, error o límite, acción de mejora y forma de comprobarla.',
            completion='Terminas cuando la mejora puede ejecutarse y verificarse con una evidencia concreta.',
            **common,
        )
    return _contract(
        action='Analiza la evidencia, selecciona la decisión profesional mejor fundamentada y justifícala.',
        object_=prompt,
        start='Identifica primero qué dato está disponible, qué falta y qué documento permitiría verificarlo.',
        resource='Caso, imagen, tabla o documento presentado y cuatro alternativas.',
        response='Una alternativa y una justificación escrita que cite un dato o documento.',
        completion='Terminas cuando seleccionas una alternativa y explicas por qué es válida sin agregar información no disponible.',
        **common,
    )


def _pack_contract(item, ae_code, criterion):
    kind = item.get('kind') or 'actividad'
    prompt = _text(item.get('prompt') or item.get('label'))
    specs = {
        'observe': ('Identifica y marca las zonas solicitadas en la imagen.', 'Abre la imagen y comienza por la etiqueta o punto de referencia principal.', 'Imagen técnica con puntos interactivos.', 'Los puntos correctos marcados y una nota con el dato observado.', 'todos los puntos solicitados están marcados y la nota cita un dato visible'),
        'walk3d': ('Recorre la representación espacial y examina los componentes indicados.', 'Gira la vista, acércate al primer componente y abre cada punto.', 'Recorrido espacial interactivo, etiquetas y fichas de los componentes.', 'Al menos tres componentes inspeccionados y una conclusión breve.', 'inspeccionaste los componentes requeridos y relacionaste dos datos'),
        'video': ('Identifica un paso del procedimiento y registra el dato técnico que lo sustenta.', 'Mira la secuencia una vez; luego vuelve al momento en que aparece el paso elegido.', 'Video del módulo, subtítulos y ruta de lectura.', 'Un paso seleccionado y un dato visible del video.', 'registraste un paso y un dato, sin resumir todo el video'),
        'read': ('Extrae el dato solicitado y conserva su unidad, etiqueta o revisión.', 'Ubica el campo nombrado antes de copiar el valor.', 'Plano, visor, etiqueta o ficha técnica mostrada.', 'Dato transcrito con su unidad o referencia.', 'el dato puede rastrearse al recurso y no agregaste información supuesta'),
        'procedure': ('Ordena los pasos del procedimiento y verifica su secuencia.', 'Ubica primero la preparación y al final la comprobación.', 'Tarjetas con los pasos del procedimiento.', 'Secuencia completa en el orden técnico esperado.', 'todos los pasos están ubicados y la verificación queda al cierre'),
        'cube': ('Calcula el resultado solicitado usando una sola unidad.', 'Convierte primero todas las medidas a la misma unidad y después opera.', 'Datos numéricos del plano o caso y campo de resultado.', 'Cálculo y resultado con unidad.', 'el valor y la unidad son correctos y el cálculo usa solo los datos entregados'),
        'pair': ('Relaciona cada elemento con su función, dato o proceso.', 'Lee todas las opciones antes de formar la primera pareja.', 'Tarjetas de términos y significados.', 'Todas las parejas completadas.', 'no quedan elementos sin relacionar y cada pareja responde al recurso'),
        'integrate3d': ('Integra los tres AE al inspeccionar y explicar el recorrido.', 'Recorre los componentes en orden de preparación, ejecución y verificación.', 'Recorrido espacial interactivo, documentos y datos del módulo.', 'Componentes inspeccionados y conclusión que conecte los tres AE.', 'la conclusión usa evidencia de los tres AE y declara lo pendiente'),
    }
    action, start, resource, response, completion = specs.get(kind, (
        'Analiza la situación y registra una respuesta técnica basada en evidencia.',
        'Identifica el dato disponible y el dato que falta antes de responder.',
        'Caso, documento o recurso interactivo de la actividad.',
        'Respuesta breve con dato, decisión y pendiente.',
        'la respuesta cita evidencia y distingue datos de suposiciones',
    ))
    return _contract(
        action=action,
        object_=prompt,
        start=start,
        resource=resource,
        response=response,
        purpose=f'Practicar {criterion} en una tarea breve de oficio.',
        completion='Terminas cuando ' + completion + '.',
        ae=ae_code,
        criterion=criterion,
        original=prompt,
        status='Parcial',
        problem='La consigna original contiene un verbo observable, pero no explicita en conjunto el recurso, el producto y la condición de logro.',
    )


def apply_instructional_quality(content, module_id=1):
    """Agrega contratos pedagógicos sin modificar respuestas ni calificaciones."""
    if not isinstance(content, dict) or not content.get('aes'):
        return content
    c = content
    mid = int(module_id or 1)

    ae0, code0, criteria0 = _ae_data(c, 0)
    reflection = _text(c.get('reflection_prompt'))
    c['context_instruction'] = _contract(
        action='Observa el caso, distingue datos de suposiciones y anticipa qué debes verificar.',
        object_=_text(c.get('context')),
        start='Lee el caso profesional, abre todos los puntos del escenario y anota primero solo lo que puedes observar.',
        resource='Caso profesional, imagen interactiva, video y documentos simulados del módulo.',
        response='Tres observaciones breves y una respuesta final que incluya un elemento reconocido, una revisión necesaria y un dato faltante.',
        purpose='Activar conocimientos previos y preparar el trabajo de los tres AE sin resolver aún el proyecto.',
        completion='Terminas cuando abriste todos los puntos y tu respuesta final identifica un dato, una revisión y una información pendiente.',
        ae=code0,
        criterion=_criterion(criteria0),
        original=reflection,
        status='Parcial',
        problem='Las instrucciones estaban repartidas en varios bloques; el estudiante debía reconstruir por sí mismo el producto final y el criterio de término.',
    )
    c['context_didactic'] = _didactic('observe', _criterion(criteria0))
    if isinstance(c.get('explore'), dict):
        c['explore']['instruction'] = deepcopy(c['context_instruction'])

    for ai, ae in enumerate(c.get('aes') or []):
        _, ae_code, criteria = _ae_data(c, ai)
        for si, exp in enumerate(ae.get('experiences') or []):
            criterion = _criterion(criteria, si)
            exp['instruction'] = _experience_contract(exp, ae, criterion)
            exp['didactic'] = _didactic(exp.get('type'), criterion)

    for i, item in enumerate(c.get('formative_pack') or []):
        ai = i % max(1, len(c.get('aes') or []))
        _, ae_code, criteria = _ae_data(c, ai)
        item['instruction'] = _pack_contract(item, ae_code, _criterion(criteria, i))
        item['didactic'] = _didactic(item.get('kind'), _criterion(criteria, i))

    for i, case in enumerate(c.get('cases') or []):
        ai = int(case.get('ae', i % 3))
        _, ae_code, criteria = _ae_data(c, ai)
        criterion = _text(case.get('criterion'), _criterion(criteria, i))
        original = _text(case.get('question'), '¿Qué decisión tomarías?')
        case['instruction'] = _contract(
            action='Analiza el caso, selecciona la decisión profesional y justifícala con evidencia.',
            object_=_text(case.get('prompt') or case.get('context') or case.get('title')),
            start='Lee la presión del contexto; separa los datos comprobables de las suposiciones y localiza el antecedente que falta.',
            resource='Contexto profesional, imagen, documento o tabla del caso y cuatro alternativas.',
            response='Una alternativa y una justificación de al menos 20 caracteres que cite un dato, documento o criterio.',
            purpose=f'Aplicar el {ae_code} en una decisión situada y trazable.',
            completion='Terminas cuando la alternativa es coherente con la evidencia y la justificación explica qué harías, por qué y qué verificarías.',
            ae=ae_code,
            criterion=criterion,
            original=original,
            status='Parcial',
            problem='La interfaz pedía elegir y justificar, pero no exigía de forma visible citar la evidencia ni declarar cómo verificar la decisión.',
        )
        case['didactic'] = _didactic('choice', criterion)

    scene = c.get('scene') or {}
    scene['instruction'] = _contract(
        action='Inspecciona todos los componentes del recorrido, relaciónalos y redacta una conclusión técnica.',
        object_=_text(scene.get('prompt') or scene.get('title')),
        start='Comienza por el primer paso numerado; gira, acerca y abre cada componente en orden.',
        resource='Recorrido espacial interactivo, video del procedimiento, etiquetas y fichas de los componentes.',
        response='Todos los componentes inspeccionados y una conclusión que conecte evidencia, decisión y pendiente.',
        purpose='Integrar los tres AE del módulo en un mismo procedimiento profesional simulado.',
        completion='Terminas cuando inspeccionaste todos los puntos y la conclusión usa evidencia de los tres AE sin afirmar lo que el escenario no demuestra.',
        ae='AE 1 + AE 2 + AE 3',
        criterion='Integración de los criterios trabajados en el módulo',
        original=_text(scene.get('prompt')),
        status='Parcial',
        problem='La consigna enumeraba componentes, pero no explicitaba la evidencia escrita esperada ni la relación con los tres AE.',
    )
    scene['didactic'] = _didactic('walk3d', 'Integración de los criterios trabajados en el módulo')
    c['scene'] = scene

    for i, q in enumerate(c.get('questions') or []):
        ai = int(q.get('ae', i % 3))
        _, ae_code, criteria = _ae_data(c, ai)
        criterion = _text(q.get('criterion'), _criterion(criteria, i))
        original = _text(q.get('question'))
        q['instruction'] = _contract(
            action='Analiza el estímulo y selecciona la alternativa mejor sustentada.',
            object_=original,
            start='Lee primero el dato visible y la pregunta completa; descarta opciones que supongan información no entregada.',
            resource='Imagen, tabla, documento o caso del ítem y alternativas A–D.',
            response='Una alternativa A, B, C o D.',
            purpose=f'Evidenciar la habilidad {_text(q.get("skill"), "técnica")} asociada al {ae_code}.',
            completion='El ítem termina al seleccionar una alternativa; la evaluación se entrega al completar los ítems asignados a este módulo.',
            ae=ae_code,
            criterion=criterion,
            original=original,
            status='Completa',
            problem='Sin problema crítico de instrucción; se estandariza el inicio, el recurso y el criterio de término para evitar dobles interpretaciones.',
        )
        q['didactic'] = _didactic('choice', criterion)

    pack = c.get('development_pack') or {}
    development = _text(c.get('development'))
    pack['instruction'] = _contract(
        action='Representa las evidencias, resuelve los cálculos, decide, argumenta y explica cómo verificarías.',
        object_=development,
        start='Organiza la respuesta en cinco apartados: evidencias, modelo o cálculo, decisión, argumento y verificación.',
        resource='Caso de desarrollo, antecedentes, restricciones y rúbrica de cinco criterios.',
        response='Un desarrollo escrito de al menos 80 caracteres que responda los cinco apartados y distinga datos de pendientes.',
        purpose='Integrar los tres AE y producir evidencia evaluable con la rúbrica del módulo.',
        completion='Terminas cuando abordas los cinco criterios de la rúbrica y cada conclusión se puede rastrear a un dato del caso.',
        ae='AE 1 + AE 2 + AE 3',
        criterion='Cinco criterios de la rúbrica de desarrollo',
        original=development,
        status='Parcial',
        problem='La situación era rica en antecedentes, pero la longitud mínima podía confundirse con suficiencia y no guiaba la estructura de la evidencia.',
    )
    pack['didactic'] = _didactic('development', 'Cinco criterios de la rúbrica de desarrollo')
    c['development_pack'] = pack

    for item in (c.get('encargos') or {}).get('items') or []:
        ai = max(0, min(2, int(item.get('ae') or 1) - 1))
        _, ae_code, criteria = _ae_data(c, ai)
        product = _text(item.get('product'))
        original = _text(item.get('prompt') or item.get('title'))
        item['instruction'] = _contract(
            action='Elabora el producto solicitado con evidencia trazable del oficio.',
            object_=_text(item.get('title')),
            start='Lee el producto pedido y localiza un dato en el plano, la leyenda, la ficha o las notas antes de redactar.',
            resource='Documentos simulados del encargo y criterio del AE asociado.',
            response=product + '. Incluye dato visible, decisión y pendiente.',
            purpose=f'Profundizar el {ae_code} mediante un producto de trabajo de {item.get("minutes", 60)} minutos.',
            completion='Terminas cuando el texto tiene al menos 80 caracteres, entrega el producto pedido y señala la fuente del dato o la consulta necesaria.',
            ae=ae_code,
            criterion=_criterion(criteria, int(str(item.get('id') or '0').split('.')[-1] or 0)),
            original=original,
            status='Completa',
            problem='La secuencia ya explicaba producto, recurso y evidencia; se agrega propósito y criterio de término en el mismo bloque.',
        )
        item['didactic'] = _didactic(item.get('kind'), item['instruction']['criterion'])

    practice = c.get('practice') or {}
    practice['instruction'] = _contract(
        action='Modifica los valores, calcula o compara el resultado y explica qué sí permite concluir.',
        object_=_text(practice.get('title'), f'Práctica libre del módulo {mid}'),
        start='Revisa las unidades y límites de cada campo antes de cambiar el primer valor.',
        resource='Simulador numérico del módulo y criterio ficticio indicado en pantalla.',
        response='Resultado calculado y una interpretación limitada a los datos del ejercicio.',
        purpose='Ensayar cálculos y comparaciones sin afectar la calificación ni el progreso.',
        completion='Terminas cuando todos los valores son válidos, el resultado muestra unidad y puedes explicar su alcance y límite.',
        ae='AE asociado a la práctica libre',
        criterion='Aplicación formativa no calificable',
        original=_text(practice.get('title')),
        status='Parcial',
        problem='La herramienta calculaba en tiempo real, pero no explicitaba un producto del estudiante ni cuándo la práctica podía considerarse cerrada.',
    )
    practice['didactic'] = _didactic('cube', 'Aplicación formativa no calificable')
    c['practice'] = practice

    c['feedback_instruction'] = _contract(
        action='Analiza tus resultados, identifica una fortaleza y una necesidad, y define una acción de mejora verificable.',
        object_='Resultados, correcciones, evidencias y retroalimentación del módulo.',
        start='Comienza por el resultado general; abre después cada corrección y contrástala con tu respuesta.',
        resource='Resultados reales, evidencias guardadas, explicaciones de los ítems y retroalimentación docente cuando corresponda.',
        response='Una reflexión sobre el logro y una acción de mejora que indique recurso, plazo y forma de comprobación.',
        purpose='Convertir los resultados en una decisión de aprendizaje y preparar la transferencia al siguiente módulo.',
        completion='Terminas cuando identificas una fortaleza, una necesidad y un próximo paso que puedes comprobar.',
        ae='AE 1 + AE 2 + AE 3',
        criterion='Reflexión, retroalimentación y transferencia del aprendizaje',
        original='Ruta de retroalimentación y cierre.',
        status='Completa',
        problem='Las etapas de cierre no compartían un contrato único que indicara producto y criterio de término.',
    )
    c['feedback_didactic'] = _didactic('reflect', 'Reflexión, retroalimentación y transferencia del aprendizaje')
    return c


def contract_is_complete(contract):
    return isinstance(contract, dict) and all(_text(contract.get(k)) for k in CONTRACT_FIELDS)
