"""Read-only formative practice. Official progress and grading never enter this flow."""
from hashlib import sha256
import json
import unicodedata

MODES = ('explore', 'challenge', 'investigate')
LEVELS = ('Inicial', 'Intermedio', 'Avanzado', 'Experto')
STAGES = {
    'explore': ['Observa', 'Analiza', 'Relaciona', 'Reflexiona'],
    'challenge': ['Analiza', 'Decide', 'Justifica', 'Revisa'],
    'investigate': ['Revisa', 'Analiza evidencias', 'Fundamenta', 'Concluye'],
}
WRITTEN = {
    'explore': 'Explica qué observas, qué relación tiene con el criterio y cómo comprobarías tu interpretación.',
    'challenge': 'Propón una decisión profesional y justifícala con la evidencia disponible. Explica cómo verificarías su resultado.',
    'investigate': 'Contrasta los antecedentes disponibles, formula una conclusión y explica qué evidencia la respalda y qué falta confirmar.',
}
REVIEW = [
    'Cité un dato o antecedente concreto y su fuente.',
    'Relacioné mi respuesta con el criterio curricular del caso.',
    'Expliqué mi decisión o conclusión y cómo verificarla.',
    'Distinguí lo comprobado de lo que falta confirmar.',
]


def rank(item):
    text = ''.join(c for c in unicodedata.normalize('NFD', str(item.get('difficulty', ''))) if not unicodedata.combining(c)).lower()
    return 1 if 'inicial' in text else 2 if 'intermedi' in text else 3 if 'avanzad' in text else 0


def practice_bank(content, mode, level):
    family = 'cases' if mode == 'challenge' else 'questions'
    tier = min(level, 3)
    return [(family, i, item) for i, item in enumerate(content.get(family) or [])
            if rank(item) in (0, tier) and len(item.get('options') or []) == 4
            and type(item.get('answer')) is int and 0 <= item['answer'] < 4]


def digest(item):
    return sha256(json.dumps(item, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def scenario(content, mode, level, number, previous=None):
    if mode not in MODES or type(level) is not int or not 1 <= level <= 4 or type(number) is not int or not 1 <= number <= 1000000:
        raise ValueError('Selecciona una modalidad y un nivel válidos.')
    bank = practice_bank(content, mode, level)
    if not bank:
        raise ValueError('No hay casos con cuatro alternativas verificadas para este nivel.')
    offset = MODES.index(mode) * 2
    index = (number - 1 + offset) % len(bank)
    if len(bank) > 1 and f'{bank[index][0]}:{bank[index][1]}' == previous:
        index = (index + 1) % len(bank)
    family, source_index, item = bank[index]
    aes = content.get('aes') or []
    ae_index = item.get('ae', 0)
    ae = aes[ae_index] if type(ae_index) is int and 0 <= ae_index < len(aes) else {}
    criterion = item.get('criterion') or next(iter(ae.get('criteria') or []), '')
    context = item.get('context') or item.get('stimulus') or item.get('document') or content.get('context') or ''
    response_format = 'choice' if number % 2 else 'written'
    public = dict(source_id=f'{family}:{source_index}', source_index=source_index, family=family,
                  mode=mode, level=level, level_label=LEVELS[level-1], number=number, bank_size=len(bank),
                  response_format=response_format, title=item.get('title') or content.get('case_title') or 'Caso del módulo',
                  context=context, question=item.get('question') or '¿Qué decisión tomarías con estos antecedentes?',
                  prompt=WRITTEN[mode] if response_format == 'written' else item.get('question') or '¿Qué decisión tomarías con estos antecedentes?',
                  options=list(item['options']) if response_format == 'choice' else [],
                  image=item.get('image'), alt=item.get('alt'), table=item.get('table'), document=item.get('document'),
                  ae_title=ae.get('title') or '', criterion=criterion, stages=STAGES[mode], review_criteria=REVIEW,
                  specialty=content.get('specialty') or '', source=content.get('curriculum') or {})
    if level >= 3:
        companion = next((other for _, _, other in bank if other is not item and other.get('criterion') != criterion), None)
        if companion:
            public['comparison'] = dict(context=companion.get('context') or companion.get('stimulus') or '',
                                        criterion=companion.get('criterion') or '')
    public['demand'] = [
        'Identifica un dato, su fuente y el criterio antes de decidir.',
        'Relaciona los antecedentes y explica cómo verificarías tu decisión.',
        'Contrasta los antecedentes y justifica la diferencia entre los criterios.',
        'Prioriza una decisión, contrasta el segundo antecedente y declara riesgos, límites y verificación.',
    ][level-1]
    claim = dict(family=family, index=source_index, digest=digest(item), mode=mode, level=level, format=response_format)
    return public, claim


def review(content, claim, response):
    family, index = claim.get('family'), claim.get('index')
    if family not in ('questions', 'cases') or type(index) is not int or not 0 <= index < len(content.get(family) or []):
        raise ValueError('El caso ya no está disponible. Abre una nueva situación.')
    item = content[family][index]
    if digest(item) != claim.get('digest'):
        raise ValueError('El caso cambió. Conserva tu borrador y abre una nueva situación.')
    if claim.get('format') == 'choice':
        choice = response.get('choice')
        if type(choice) is not int or not 0 <= choice < 4:
            raise ValueError('Selecciona una alternativa antes de comprobar.')
        correct = choice == item['answer']
        feedback = item.get('option_feedback') or []
        explanation = feedback[choice] if choice < len(feedback) else item.get('explanation') if correct else None
        return dict(kind='choice', correct=correct, title='Decisión bien sustentada' if correct else 'Revisa tu decisión',
                    feedback=explanation or 'Contrasta la alternativa elegida con el antecedente y el criterio. Evita completar datos por suposición.',
                    criterion=item.get('criterion') or '',
                    next_action='Explica qué antecedente respalda tu decisión y cómo la verificarías.' if correct else 'Vuelve al recurso, identifica el supuesto y prueba otra alternativa.')
    text = response.get('text')
    if not isinstance(text, str) or not 20 <= len(text.strip()) <= 6000:
        raise ValueError('Escribe entre 20 y 6.000 caracteres para guardar y revisar.')
    return dict(kind='written', title='Borrador guardado para revisión',
                feedback='Tu respuesta permanece editable en este dispositivo. Esta guía no comprueba la corrección técnica ni asigna una nota.',
                review_criteria=REVIEW, criterion=item.get('criterion') or '',
                next_action='Revisa cada criterio, identifica lo que ya fundamentaste y amplía los aspectos pendientes.')
