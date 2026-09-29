"""Ajustes pedagógicos autorizados para 3° y 4° medio.

No inventa objetivos oficiales. Reescribe la consigna genérica con el dato
que el módulo ya trae y separa la ruta de tercero de la de cuarto.
"""

import re


def _source(content):
    return content.get('specialty_source') or content.get('official_source') or {}


def _oa_line(item):
    if isinstance(item, str):
        return item.strip()[:400]
    if isinstance(item, dict):
        code = str(item.get('code') or '').strip()
        title = str(item.get('title') or item.get('text') or '').strip()
        if code and title:
            return f'{code}. {title}'[:400]
        return (title or code)[:400]
    return ''


def collect_oa(content):
    blobs = [content.get('oa')]
    for key in ('specialty_source', 'official_source'):
        blobs.append((content.get(key) or {}).get('oa'))
    for ae in content.get('aes') or []:
        if isinstance(ae, dict):
            blobs.append(ae.get('oa'))
    lines = []
    for blob in blobs:
        items = blob if isinstance(blob, list) else [blob]
        for item in items:
            line = _oa_line(item)
            if line and line not in lines:
                lines.append(line)
    return lines[:12]


def module_year(content, position=0, course_title=''):
    for key in ('specialty_source', 'official_source'):
        year = str((content.get(key) or {}).get('year') or '').strip()
        if year:
            return year
    name = f"{course_title} {content.get('specialty') or ''}".lower()
    if 'refriger' in name or 'climatiz' in name:
        return '3° medio' if int(position or 0) <= 4 else '4° medio'
    return ''


def module_draft(content, position=0, course_title='', year=''):
    if content.get('case_ready'):
        return False
    scope = ' '.join(
        str((content.get(key) or {}).get(field) or '')
        for key in ('specialty_source', 'official_source', 'curriculum')
        for field in ('scope', 'status')
    ).lower()
    if 'no se simulan' in scope and int(position or 0) >= 5:
        return True
    name = f"{course_title} {content.get('specialty') or ''}".lower()
    return ('refriger' in name or 'climatiz' in name) and int(position or 0) >= 5


def _fourth(year):
    return str(year).startswith('4')


def _rewrite_question(question, year, title):
    text = str(question.get('question') or '')
    generic = text.startswith('Caso simulado') or 'Criterio de aprendizaje' in text or text.startswith('Criterio:')
    if not generic:
        return False
    stimulus = str(question.get('stimulus') or '').strip().rstrip('.')
    emprend = 'emprend' in title.lower() or 'empleab' in title.lower()
    if _fourth(year):
        if emprend and stimulus:
            question['question'] = (
                f'{stimulus} En este proyecto, ¿qué dejas pendiente, a quién consultas '
                'y cómo comprobarías el recálculo antes de informar un total?'
            )
        elif stimulus:
            question['question'] = (
                f'{stimulus} ¿Qué decisión tomas dentro de tu rol, qué no puedes cerrar solo '
                'y cómo lo verificarías?'
            )
        else:
            question['question'] = (
                f'En {title} falta un antecedente. ¿Qué decisión tomas dentro de tu rol, '
                'qué escalas y cómo lo verificarías?'
            )
        question['criterion'] = 'La respuesta deja una decisión, un límite del rol y una forma de verificación.'
    else:
        if stimulus:
            question['question'] = (
                f'{stimulus} ¿Qué dato del recurso compruebas primero y qué dejas registrado antes de actuar?'
            )
        else:
            question['question'] = (
                f'En {title}, ¿qué dato del recurso compruebas primero y qué dejas registrado antes de actuar?'
            )
        question['criterion'] = 'La respuesta nombra el dato observado y el registro que queda antes de actuar.'
    return True


def apply_level_audit(content, course_title='', position=None):
    if not isinstance(content, dict):
        return content
    title = str(content.get('case_title') or content.get('title') or course_title or 'este módulo')
    position = int(position if position is not None else content.get('position') or 0)
    content['position'] = position
    year = module_year(content, position, course_title)
    fourth = _fourth(year)
    if year:
        for key in ('specialty_source', 'official_source'):
            src = content.get(key)
            if isinstance(src, dict) and not src.get('year'):
                src['year'] = year
                break
        else:
            content.setdefault('official_source', {})['year'] = year
    draft = module_draft(content, position, course_title, year)
    content['route_draft'] = bool(draft)
    content['route_year'] = year

    changed_q = 0
    for question in content.get('questions') or []:
        if isinstance(question, dict) and _rewrite_question(question, year, title):
            changed_q += 1

    context = str(content.get('context') or '')
    if context.startswith('En un entorno formativo'):
        if fourth:
            content['context'] = (
                f'En {title} el registro no está completo. Planifica qué harás, qué límite tiene tu rol '
                'y cómo verificarás antes de cerrar.'
            )
            content['context_guidance'] = 'Nombra la decisión, lo que no puedes cerrar solo y la comprobación.'
        else:
            content['context'] = (
                f'En {title} observa el recurso, separa el dato visible de lo que supones y anota qué debe '
                'quedar registrado antes de actuar, con supervisión.'
            )
            content['context_guidance'] = 'Primero el dato que sí puedes ver. Después el registro. No cierres el caso si falta un antecedente.'

    prompt = str(content.get('reflection_prompt') or '')
    if prompt.startswith('¿Qué dato revisarías primero'):
        content['reflection_prompt'] = (
            '¿Qué decisión tomas, qué no puedes cerrar solo y cómo lo verificarías?'
            if fourth else
            '¿Qué elemento del recurso observas, qué anotas y qué falta confirmar?'
        )

    instruction = content.get('context_instruction')
    if isinstance(instruction, dict) and str(instruction.get('action') or '').startswith('Observa el caso'):
        if fourth:
            instruction.update({
                'action': 'Planifica la decisión, marca el límite de tu rol y define cómo verificarás.',
                'start': 'Lee el dato que no coincide. Separa lo que puedes hacer de lo que debes escalar.',
                'response': 'Una decisión, un límite del rol y una comprobación.',
                'completion': 'Terminas cuando nombras qué harás, qué no cierras solo y cómo lo comprobarías.',
            })
        else:
            instruction.update({
                'action': 'Observa el recurso, separa el dato visible y anota el registro antes de actuar.',
                'start': 'Lee el caso y señala un elemento concreto del recurso antes de responder.',
                'response': 'El dato observado, el registro que queda y lo que falta confirmar.',
                'completion': 'Terminas cuando identificas un dato del recurso y lo que debe quedar escrito.',
            })

    scene = content.get('scene')
    if isinstance(scene, dict) and scene.get('media_kind') == 'interactive-procedure':
        if fourth:
            scene['prompt'] = (
                'Inspecciona el recorrido. Redacta una conclusión que cruce al menos dos aprendizajes del módulo '
                'y un pendiente que tu rol no puede cerrar solo.'
            )
        else:
            scene['prompt'] = (
                'Antes de concluir, señala qué elemento del recurso leíste, qué dato queda registrado '
                'y qué falta confirmar.'
            )
        parts = scene.get('parts') or []
        if parts and isinstance(parts[0], dict):
            parts[0]['detail'] = (
                'Identifica el dato que no coincide y el límite de tu rol.'
                if fourth else
                'Señala el elemento del recurso que leíste y conserva su fuente.'
            )

    generic_prompt = 'Revisa el caso simulado, identifica un dato comprobable y redacta una decisión dentro de tu rol.'
    generic_product = 'Registro breve con evidencia, criterio aplicado, decisión segura y antecedente pendiente'
    for item in (content.get('encargos') or {}).get('items') or []:
        if not isinstance(item, dict):
            continue
        if item.get('prompt') == generic_prompt:
            item['prompt'] = (
                f'En {title}, el registro no coincide con el recurso. Escribe la decisión, el límite de tu rol y cómo lo verificarías.'
                if fourth else
                f'En {title}, lee un elemento del recurso, anota el dato visible y qué debe quedar registrado antes de actuar.'
            )
        if item.get('product') == generic_product:
            item['product'] = (
                'Decisión, límite del rol y forma de verificación.'
                if fourth else
                'Dato observado y registro antes de actuar.'
            )

    generic_example = 'En el caso simulado, registra el dato disponible, aplica el criterio indicado'
    for ae in content.get('aes') or []:
        if isinstance(ae, dict) and str(ae.get('example') or '').startswith(generic_example):
            ae['example'] = (
                f'En {title} el registro no coincide con el recurso. Decides qué haces dentro de tu rol, qué escalas y cómo lo comprobarías.'
                if fourth else
                f'En {title} anotas el dato que sí está en el recurso y dejas escrito qué falta confirmar.'
            )

    plan = content.get('evaluation_plan')
    questions = content.get('questions') or []
    if isinstance(plan, dict) and plan.get('question_count') and questions:
        ae_count = len(content.get('aes') or []) or 1
        hp = int(_source(content).get('official_hp') or content.get('planning', {}).get('official_hp') or 0)
        target = max(int(plan['question_count']), ae_count)
        if fourth and hp >= 200:
            target = max(target, min(ae_count + 1, 8))
        plan['question_count'] = min(target, len(questions))
    return content


def _clip(text, limit=90):
    text = ' '.join(str(text or '').split())
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(' ', 1)[0]
    return cut or text[:limit]


def _ae_at(content, index):
    aes = content.get('aes') or []
    if not aes:
        return {}
    item = aes[int(index or 0) % len(aes)]
    return item if isinstance(item, dict) else {}


def _indicator(ae, turn):
    usable = []
    for raw in ae.get('criteria') or []:
        text = raw if isinstance(raw, str) else (raw.get('text') if isinstance(raw, dict) else '')
        text = ' '.join(str(text or '').split())
        if not text or text.startswith('Indicador didáctico'):
            continue
        if text == ' '.join(str(ae.get('title') or '').split()):
            continue
        usable.append(text[:320])
    if not usable:
        return ''
    return usable[int(turn) % len(usable)]


def _needs_depth(question):
    text = str(question.get('question') or '')
    tails = (
        '¿Qué dato del recurso compruebas primero',
        '¿Qué decisión tomas dentro de tu rol',
        'cómo comprobarías el recálculo',
        'qué dejas pendiente',
    )
    return text.startswith('Caso simulado') or any(tail in text for tail in tails)


def _attach_generic_objectives(content, title):
    if 'emprend' not in title.lower() and 'empleab' not in title.lower():
        return
    src = None
    for key in ('specialty_source', 'official_source'):
        if isinstance(content.get(key), dict):
            src = content[key]
            break
    if src is None:
        content['official_source'] = {}
        src = content['official_source']
    if src.get('oa'):
        content['oa_note'] = (
            'Este módulo no tiene un OA de especialidad. Estos textos son los aprendizajes '
            'del programa para Emprendimiento y empleabilidad.'
        )
        return
    lines = []
    for index, ae in enumerate(content.get('aes') or []):
        if not isinstance(ae, dict):
            continue
        text = ' '.join(str(ae.get('title') or '').split())
        if not text:
            continue
        code = str(ae.get('official_code') or ae.get('code') or f'AE {index + 1}').strip()
        lines.append(f'{code}. {text}'[:400])
    if not lines:
        return
    src['oa'] = lines
    src['oa_kind'] = 'Objetivos de Aprendizaje Genéricos'
    content['oa_note'] = (
        'Este módulo no tiene un OA de especialidad. Estos textos son los aprendizajes '
        'del programa para Emprendimiento y empleabilidad.'
    )


def _hp_target(ae_count, hp, current, bank):
    if hp >= 220:
        floor = 8
    elif hp >= 180:
        floor = 7
    elif hp >= 140:
        floor = 6
    elif hp >= 70:
        floor = max(4, ae_count)
    else:
        floor = max(1, ae_count)
    return min(max(int(current or 0), ae_count, floor), bank)


def _poor_criteria(ae):
    title = ' '.join(str(ae.get('title') or '').split())
    texts = []
    for raw in ae.get('criteria') or []:
        text = raw if isinstance(raw, str) else (raw.get('text') if isinstance(raw, dict) else '')
        text = ' '.join(str(text or '').split())
        if text:
            texts.append(text)
    if not texts:
        return True
    return all(text == title or text.startswith('Indicador didáctico') for text in texts)


def _source_dict(content):
    for key in ('specialty_source', 'official_source'):
        if isinstance(content.get(key), dict):
            return content[key]
    content['official_source'] = {}
    return content['official_source']


def _oa_lines(items):
    lines = []
    for item in items or []:
        line = _oa_line(item)
        if line and line not in lines:
            lines.append(line)
    return lines


def merge_official(content, record):
    """Copia OA y criterios literales de la ficha oficial cuando el módulo no los trae."""
    if not isinstance(content, dict) or not isinstance(record, dict):
        return content
    src = _source_dict(content)
    if not src.get('oa'):
        lines = _oa_lines(record.get('oa'))
        if lines:
            src['oa'] = lines
    official_aes = [ae for ae in (record.get('aes') or []) if isinstance(ae, dict)]
    for index, ae in enumerate(content.get('aes') or []):
        if not isinstance(ae, dict) or index >= len(official_aes) or not _poor_criteria(ae):
            continue
        cleaned = []
        for raw in official_aes[index].get('criteria') or []:
            text = ' '.join(str(raw or '').split()) if isinstance(raw, str) else ''
            title = ' '.join(str(official_aes[index].get('title') or '').split())
            if text and text != title and not text.startswith('Indicador didáctico') and text not in cleaned:
                cleaned.append(text[:320])
        if cleaned:
            ae['criteria'] = cleaned
    if not src.get('oa') and not content.get('oa'):
        lines = []
        for index, ae in enumerate(content.get('aes') or []):
            if not isinstance(ae, dict):
                continue
            text = ' '.join(str(ae.get('title') or '').split())
            if not text:
                continue
            code = str(ae.get('official_code') or ae.get('code') or f'AE {index + 1}').strip()
            lines.append(f'{code}. {text}'[:400])
        if lines:
            src['oa'] = lines
            src['oa_kind'] = 'Aprendizajes del programa'
            content['oa_note'] = (
                'La ficha del programa no trae un código de OA distinto para este módulo. '
                'Orientan estos aprendizajes y sus criterios.'
            )
    return content


def refresh_criteria(content):
    if not isinstance(content, dict):
        return content
    year = content.get('route_year') or ''
    fourth = _fourth(year)
    turns = {}
    for question in content.get('questions') or []:
        if not isinstance(question, dict):
            continue
        text = str(question.get('question') or '')
        if ' En «' in text:
            question['question'] = text.replace(' En «', '. En «').replace('.. En «', '. En «')
        if not str(question.get('criterion') or '').startswith('La respuesta aplica'):
            continue
        ae = _ae_at(content, question.get('ae'))
        turn = turns.get(question.get('ae'), 0)
        turns[question.get('ae')] = turn + 1
        indicator = _indicator(ae, turn)
        if indicator:
            question['criterion'] = indicator
        elif fourth:
            short = _clip(ae.get('short_title') or ae.get('title') or '')
            if short:
                question['criterion'] = f'La respuesta aplica «{short}»: deja una decisión, un límite del rol y una forma de verificación.'
        else:
            short = _clip(ae.get('short_title') or ae.get('title') or '')
            if short:
                question['criterion'] = f'La respuesta aplica «{short}»: nombra el dato observado y el registro que queda antes de actuar.'
    return content


def deepen_module(content, course_title='', position=None, module_title=''):
    """Usa el aprendizaje y el recurso que el módulo ya trae.

    No inventa objetivos de especialidad ni declara un sello técnico.
    """
    if not isinstance(content, dict):
        return content
    title = str(module_title or content.get('case_title') or content.get('title') or course_title or 'este módulo')
    position = int(position if position is not None else content.get('position') or 0)
    year = content.get('route_year') or module_year(content, position, course_title)
    fourth = _fourth(year)
    name = f'{course_title} {content.get("specialty") or ""}'.lower()
    refri = ('refriger' in name or 'climatiz' in name) and position >= 5
    _attach_generic_objectives(content, title)

    if refri:
        from refrigeration_fourth import CASE_BLURBS, EXPLORE_BRIEFS
        brief = EXPLORE_BRIEFS.get(position)
        if brief:
            content['context'] = brief[0]
            content['case_blurb'] = CASE_BLURBS.get(position) or content.get('case_blurb')
            content['case_ready'] = True
            content['route_draft'] = False
    else:
        shift = str((content.get('explore') or {}).get('shift') or '').strip()
        context = str(content.get('context') or '')
        if shift and ('el registro no está completo' in context or 'observa el recurso, separa el dato' in context):
            content['context'] = shift

    scope_old = 'no se simulan aquí'
    scope_new = (
        'Los módulos 5 a 9 corresponden a 4° medio y trabajan el caso del programa: '
        'puesta en marcha, diagnóstico, mantención, refrigerantes y emprendimiento.'
    )
    if 'refriger' in name or 'climatiz' in name:
        for key in ('specialty_source', 'official_source', 'curriculum'):
            src = content.get(key)
            if isinstance(src, dict) and scope_old in str(src.get('scope') or ''):
                src['scope'] = scope_new

    turns = {}
    for question in content.get('questions') or []:
        if not isinstance(question, dict) or not _needs_depth(question):
            continue
        ae = _ae_at(content, question.get('ae'))
        short = _clip(ae.get('short_title') or ae.get('title') or title)
        turn = turns.get(question.get('ae'), 0)
        turns[question.get('ae')] = turn + 1
        stimulus = str(question.get('stimulus') or '').strip().rstrip('.')
        emprend = 'emprend' in title.lower() or 'empleab' in title.lower()
        if emprend:
            asks = (
                '¿qué partida falta en el presupuesto, a quién consultas y cómo comprobarías el recálculo antes de informar un total?',
                '¿qué derecho o deber queda sin confirmar, a quién consultas y qué documento lo verifica?',
                '¿qué antecedente de tu trayectoria falta, a quién se lo pides y cómo compruebas que el documento está completo?',
                '¿qué alternativa de capacitación comparas, qué requisito te falta y cómo verificas el financiamiento?',
            )
            ask = asks[int(question.get('ae') or 0) % 4]
            question['question'] = f'{stimulus} En «{short}», {ask}' if stimulus else f'En «{short}», {ask[0].upper()}{ask[1:]}'
        elif fourth:
            ask = '¿qué decisión tomas dentro de tu rol, qué no puedes cerrar solo y cómo lo verificarías?'
            question['question'] = f'{stimulus} En «{short}», {ask}' if stimulus else f'En «{short}», {ask[0].upper()}{ask[1:]}'
        else:
            ask = '¿qué dato del recurso compruebas primero y qué dejas registrado antes de actuar?'
            question['question'] = f'{stimulus} En «{short}», {ask}' if stimulus else f'En «{short}», {ask[0].upper()}{ask[1:]}'
        indicator = _indicator(ae, turn)
        if indicator:
            question['criterion'] = indicator
        elif fourth:
            question['criterion'] = f'La respuesta aplica «{short}»: deja una decisión, un límite del rol y una forma de verificación.'
        else:
            question['criterion'] = f'La respuesta aplica «{short}»: nombra el dato observado y el registro que queda antes de actuar.'

    scene = content.get('scene')
    labels = [
        str(spot.get('label') or '').strip()
        for spot in ((content.get('explore') or {}).get('spots') or [])
        if isinstance(spot, dict) and spot.get('label')
    ]
    if isinstance(scene, dict) and scene.get('media_kind') == 'interactive-procedure' and labels:
        named = ', '.join(labels[:4])
        if fourth:
            scene['prompt'] = (
                f'Inspecciona el recurso ({named}). Redacta una conclusión que cruce al menos dos aprendizajes '
                'del módulo y un pendiente que tu rol no puede cerrar solo.'
            )
            detail = f'Identifica el elemento del recurso ({labels[0]}) y el límite de tu rol.'
        else:
            scene['prompt'] = (
                f'Antes de concluir, señala cuál de estos elementos leíste ({named}), '
                'qué dato queda registrado y qué falta confirmar.'
            )
            detail = f'Señala el elemento «{labels[0]}» y conserva su fuente.'
        parts = scene.get('parts') or []
        if parts and isinstance(parts[0], dict):
            parts[0]['detail'] = detail

    plan = content.get('evaluation_plan')
    questions = content.get('questions') or []
    if isinstance(plan, dict) and plan.get('question_count') and questions:
        ae_count = len(content.get('aes') or []) or 1
        hp = int(_source(content).get('official_hp') or content.get('planning', {}).get('official_hp') or 0)
        plan['question_count'] = _hp_target(ae_count, hp, plan.get('question_count'), len(questions))
    return content


_SHARED_STEM = 'El equipo necesita decidir qué hacer con el antecedente discordante.'
_COPIED_SPOTS = ('UE-01', 'UI-01', 'Drenaje')


def _core_caso(text):
    if not text.startswith('Caso simulado') or ':' not in text:
        return ''
    rest = text.split(':', 1)[1].strip()
    for marker in (' Criterio de aprendizaje:', ' Criterio:'):
        if marker in rest:
            rest = rest.split(marker, 1)[0].strip()
    return rest


def _case_antecedents(question):
    stimulus = ' '.join(str(question.get('stimulus') or question.get('context') or '').split())
    question_text = ' '.join(str(question.get('question') or '').split())
    for marker in ('Etapa de revisión:', 'Tarea:'):
        if marker in stimulus:
            stimulus = stimulus.split(marker, 1)[0].strip().rstrip('.')
    if question_text and stimulus.endswith(question_text):
        stimulus = stimulus[:-len(question_text)].strip().rstrip('.')
    marker = 'Antecedentes disponibles:'
    if marker in stimulus:
        return stimulus.split(marker, 1)[1].split('.', 1)[0].strip()[:240]
    if not stimulus or stimulus.lower().startswith('caso simulado'):
        return ''
    if any(token in stimulus for token in _COPIED_SPOTS):
        return ''
    parts = stimulus.split('. ')
    return '. '.join(parts[:2]).strip()[:240]


def _rewrite_stem(item, content):
    if not isinstance(item, dict):
        return False
    text = ' '.join(str(item.get('question') or '').split())
    core = _core_caso(text)
    stimulus = ' '.join(str(item.get('stimulus') or '').split())
    if core:
        item['question'] = f'{stimulus} {core}'.strip() if stimulus else core
        return item['question'] != text
    if not text.startswith(_SHARED_STEM):
        return False
    base = stimulus or ' '.join(str(item.get('context') or '').split())
    if text and base.endswith(text):
        base = base[:-len(text)].strip().rstrip('.')
    for marker in ('Etapa de revisión:', 'Tarea:'):
        if marker in base:
            base = base.split(marker, 1)[0].strip().rstrip('.')
    ae = _ae_at(content, item.get('ae'))
    short = _clip(ae.get('short_title') or ae.get('title') or '')
    ask = '¿qué corresponde con el antecedente que no coincide?'
    if short:
        ask = f'Aplicando «{short}», {ask}'
    item['question'] = f'{base}. {ask[0].upper()}{ask[1:]}' if base else ask[0].upper() + ask[1:]
    return True


def _scene_names_trade(content, course_title, year):
    scene = content.get('scene')
    if not isinstance(scene, dict) or scene.get('media_kind') != 'interactive-procedure':
        return False
    name = course_title.lower()
    refrigeration = 'refriger' in name or 'climatiz' in name
    prompt = str(scene.get('prompt') or '')
    changed = False
    if refrigeration:
        labels = [
            str(spot.get('label') or '').strip()
            for spot in ((content.get('explore') or {}).get('spots') or [])
            if isinstance(spot, dict) and spot.get('label')
        ]
        if labels and not any(label in prompt for label in labels[:2]) and 'punto del escenario' in prompt:
            named = ', '.join(labels[:4])
            if _fourth(year):
                scene['prompt'] = (
                    f'Inspecciona el recurso ({named}). Redacta una conclusión que cruce al menos dos aprendizajes '
                    'del módulo y un pendiente que tu rol no puede cerrar solo.'
                )
            else:
                scene['prompt'] = (
                    f'Antes de concluir, señala cuál de estos elementos leíste ({named}), '
                    'qué dato queda registrado y qué falta confirmar.'
                )
            changed = True
        return changed
    copied = any(token in prompt for token in _COPIED_SPOTS)
    generic = 'punto del escenario' in prompt or prompt.startswith('Inspecciona el recorrido')
    if not copied and not generic:
        return False
    antecedents = ''
    for item in (content.get('questions') or []) + (content.get('cases') or []):
        if isinstance(item, dict):
            antecedents = _case_antecedents(item)
        if antecedents:
            break
    if not antecedents:
        return False
    if _fourth(year):
        scene['prompt'] = (
            f'Revisa estos antecedentes del caso ({antecedents}). '
            'Redacta una conclusión, el límite de tu rol y cómo lo verificarías.'
        )
    else:
        scene['prompt'] = (
            f'Antes de concluir, revisa estos antecedentes del caso ({antecedents}). '
            'Señala qué dato queda registrado y qué falta confirmar.'
        )
    parts = scene.get('parts') or []
    if parts and isinstance(parts[0], dict):
        first = antecedents.split(',')[0].strip()
        parts[0]['detail'] = f'Señala el antecedente «{first}» y conserva su fuente.'
    return True


_ERROR_REASONS = (
    ('plazo', 'para no retrasar la entrega'),
    ('porque', 'porque la diferencia parece menor'),
    ('primera vista', 'confiando en lo que se ve a primera vista'),
    ('sin ', 'sin consultar a la persona responsable'),
    ('costumbre', 'como se ha hecho otras veces en el equipo'),
)


def _short_correct(text, criterion):
    text = ' '.join(str(text or '').split())
    start, end = text.find('«'), text.rfind('»')
    if start < 0 or end <= start:
        return text
    quoted = text[start + 1:end].strip().rstrip('.')
    if len(quoted) < 40:
        return text
    crit = ' '.join(str(criterion or '').split()).rstrip('.')
    if crit and not (quoted.startswith(crit[:30]) or crit.startswith(quoted[:30])):
        return text
    short = text[:start] + 'el criterio evaluado' + text[end + 1:]
    return short.replace('..', '.').replace(' .', '.').strip()


_VALID_PRACTICES = (
    ('constancia', 'dejando constancia de la fuente'),
    ('cerrar', 'antes de cerrar el registro'),
    ('responsable', 'con aviso a la persona responsable'),
)
def _strip_tails(text):
    text = ' '.join(str(text or '').split())
    previous = None
    while previous != text:
        previous = text
        for _, clause in _ERROR_REASONS + _VALID_PRACTICES:
            text = text.replace(f', {clause}.', '.')
    return text


def _add_tail(text, kind, turn):
    base = ' '.join(str(text or '').split()).rstrip('.')
    if kind == 'none':
        return base + '.'
    lower = base.lower()
    pool = _ERROR_REASONS if kind == 'error' else _VALID_PRACTICES
    if kind == 'valid' and any(word in lower for word in ('sin ', 'no ', 'omit', 'elimin')):
        return base + '.'
    for step in range(len(pool)):
        key, clause = pool[(turn + step) % len(pool)]
        if key in lower or clause.split()[-1] in lower:
            continue
        return f'{base}, {clause}.'
    return base + '.'


def _balance_item(item, turn):
    options = item.get('options')
    answer = item.get('answer')
    if not isinstance(options, list) or len(options) != 4 or not isinstance(answer, int) or not 0 <= answer < 4:
        return False
    options = [_strip_tails(o) for o in options]
    correct = _short_correct(options[answer], item.get('criterion'))
    wrong = [o for i, o in enumerate(options) if i != answer]
    mode = turn % 4
    plain = _add_tail(correct, 'none', turn)
    correct = _add_tail(correct, 'valid', turn) if mode in (0, 2) else plain
    partner_valid = mode in (0, 1)
    order = [(turn + step) % 3 for step in range(3)]
    partner = order[0]
    if partner_valid:
        fits = [i for i in order if _add_tail(wrong[i], 'valid', turn + 1) != _add_tail(wrong[i], 'none', turn)]
        if fits:
            partner = fits[0]
        else:
            partner_valid = False
            correct = plain
    target = len(correct)
    padded = []
    for index, text in enumerate(wrong):
        if index == partner:
            text = _add_tail(text, 'valid' if partner_valid else 'none', turn + 1)
            for extra in (2, 3):
                if partner_valid and len(text) <= target:
                    text = _add_tail(text, 'valid', turn + extra)
            padded.append(text)
            continue
        text = _add_tail(text, 'error', turn + index)
        if len(text) < target * 0.9:
            text = _add_tail(text, 'error', turn + index + 2)
        padded.append(text)
    others = [i for i in range(3) if i != partner]
    if turn % 3 and max(len(padded[i]) for i in others) <= target:
        pick = others[turn % 2]
        padded[pick] = _add_tail(padded[pick], 'error', turn + 3)
    slot = (turn * 3 + 1) % 4
    ordered = padded[:slot] + [correct] + padded[slot:]
    changed = ordered != item.get('options') or slot != answer
    item['options'] = ordered
    item['answer'] = slot
    return changed


def balance_items(content, module_id=0):
    """Quita la pista de longitud y reparte la posición de la clave sin cambiar qué es correcto."""
    if not isinstance(content, dict) or content.get('items_balanced') == 5:
        return False
    changed = False
    for key in ('questions', 'cases'):
        for turn, item in enumerate(content.get(key) or []):
            if isinstance(item, dict) and _balance_item(item, turn + int(module_id or 0)):
                changed = True
    content['items_balanced'] = 5
    return changed


_FOCI = (
    'identificación del documento o del lote',
    'unidad, magnitud o instrumento omitido',
    'responsable y fecha de la revisión',
    'ubicación o zona del procedimiento',
    'versión o vigencia del protocolo',
)
_COMPLICATIONS = (
    ('El documento «{doc}» no identifica a qué lote, equipo o recinto corresponde.',
     'El documento «{doc}» trae un código distinto del que figura en los demás antecedentes.',
     'El documento «{doc}» llegó sin rótulo que permita asociarlo a este caso.'),
    ('En el documento «{doc}» un valor aparece sin unidad de medida.',
     'El documento «{doc}» no indica con qué instrumento o método se obtuvo el dato.',
     'En el documento «{doc}» el mismo dato aparece con dos unidades distintas.'),
    ('El documento «{doc}» no indica quién lo revisó ni en qué fecha.',
     'El documento «{doc}» tiene fecha posterior a la entrega que debía respaldar.',
     'El documento «{doc}» tiene una corrección a mano sin firma de la persona responsable.'),
    ('El documento «{doc}» no señala en qué zona o etapa se registró el dato.',
     'El documento «{doc}» ubica el dato en un sector distinto del indicado en los otros antecedentes.',
     'El documento «{doc}» mezcla registros de dos etapas del procedimiento.'),
    ('El documento «{doc}» corresponde a una versión anterior del procedimiento.',
     'Circulan dos versiones del documento «{doc}» con contenido distinto.',
     'El documento «{doc}» no indica su versión ni su fecha de vigencia.'),
)
_CASE_HEAD = re.compile(r'^Caso (\d+) en ([^.]+)\.\s*')


def _documents(text):
    names = [part.strip() for part in re.split(r',\s*|\s+y\s+', text or '') if part.strip()]
    return [re.sub(r'\s+fictici[oa]s?$', '', name) for name in names] or ['registro del caso']


def _complication(focus_index, turn, docs):
    variant = (turn // len(_FOCI)) % 3
    doc = docs[(turn // (len(_FOCI) * 3) + focus_index) % len(docs)]
    return _COMPLICATIONS[focus_index][variant].format(doc=doc)


def vary_conflicts(content):
    """Da a cada ítem una complicación propia, coherente con su foco y con los antecedentes del módulo."""
    if not isinstance(content, dict) or content.get('conflicts_varied') == 1:
        return False
    context = ' '.join(str(content.get('context') or '').split())
    match = re.match(r'([^.]+)\.\s*(.+?\.)\s*Dispones de (.+?)\.', context)
    changed = False
    for key, field in (('questions', 'stimulus'), ('cases', 'context')):
        for turn, item in enumerate(content.get(key) or []):
            if not isinstance(item, dict):
                continue
            text = ' '.join(str(item.get(field) or '').split())
            head = _CASE_HEAD.match(text)
            if head and 'Antecedentes disponibles:' in text:
                rest = text[head.end():]
                docs = _documents(rest.split('Antecedentes disponibles:', 1)[1].split('.', 1)[0])
                focus = next((i for i, name in enumerate(_FOCI) if f'foco de esta revisión es {name}' in rest), turn % len(_FOCI))
                new = f'{head.group(0)}{_complication(focus, turn, docs)} {rest}'
            elif match and text.startswith(f'{match.group(1)}.') and 'Etapa de revisión:' in text:
                place, conflict, resources = match.groups()
                focus = turn % len(_FOCI)
                stage = text.split('Etapa de revisión:', 1)[1].strip()
                new = (f'Caso {turn + 1} en {place[0].lower()}{place[1:]}. '
                       f'{_complication(focus, turn, _documents(resources))} {conflict} '
                       f'Antecedentes disponibles: {resources}. El foco de esta revisión es {_FOCI[focus]}. '
                       f'Etapa de revisión: {stage}')
            else:
                continue
            question = ' '.join(str(item.get('question') or '').split())
            if field == 'stimulus' and question.startswith(text):
                item['question'] = new + question[len(text):]
            item[field] = new
            changed = True
    content['conflicts_varied'] = 1
    return changed


def cover_every_ae(content):
    """Ordena el banco para que la evaluación incluya al menos un ítem de cada AE."""
    questions = [q for q in (content.get('questions') or []) if isinstance(q, dict)]
    aes = len(content.get('aes') or [])
    plan = content.get('evaluation_plan')
    if not questions or not aes or not isinstance(plan, dict):
        return False
    count = max(1, min(len(questions), int(plan.get('question_count') or 25)))
    covered = {q.get('ae') for q in questions[:count]}
    missing = [i for i in range(aes) if i not in covered]
    if not missing:
        return False
    first = []
    for index in range(aes):
        hit = next((q for q in questions if q.get('ae') == index and q not in first), None)
        if hit:
            first.append(hit)
    rest = [q for q in questions if q not in first]
    content['questions'] = first + rest
    if plan.get('question_count'):
        plan['question_count'] = min(len(questions), max(count, len(first)))
    return True


def apply_authorized_route(content, course_title='', position=None, module_title=''):
    """Aplica la auditoría autorizada sin inventar OA, normas ni un sello técnico.

    Reescribe la consigna genérica con el estímulo que el ítem ya trae, nombra
    en la escena un antecedente del mismo caso y copia el año de la ficha.
    """
    if not isinstance(content, dict):
        return content
    position = int(position if position is not None else content.get('position') or 0)
    content['position'] = position
    year = content.get('route_year') or module_year(content, position, course_title)
    changed = False
    if year and not content.get('route_year'):
        content['route_year'] = year
        changed = True
    application = ' '.join(str(content.get('application') or '').split())
    if application.startswith('Caso simulado de '):
        content['application'] = 'En el caso de ' + application[len('Caso simulado de '):]
        changed = True
    elif application.startswith('Caso simulado '):
        content['application'] = application[len('Caso simulado '):]
        changed = True
    for key in ('questions', 'cases'):
        for item in content.get(key) or []:
            if _rewrite_stem(item, content):
                changed = True
    if _scene_names_trade(content, course_title, year):
        changed = True
    if changed:
        version = str(content.get('version') or '')
        if not version.endswith('-ruta-v1'):
            content['version'] = f'{version}-ruta-v1' if version else 'ruta-v1'
    return content
