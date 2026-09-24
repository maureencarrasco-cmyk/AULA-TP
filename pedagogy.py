"""Motor pedagógico de Aula TP Chile.

1 HP = 45 minutos. Aula TP ocupa el 30 % de las HP oficiales.
El factor ×5 estima tiempo del estudiante desde una tarea experta; no multiplica
la carga curricular oficial.
Solo 3° medio: cuatro módulos (190 / 190 / 228 / 228 HP).
"""
import re
from copy import deepcopy
from pathlib import Path

from curriculum import OFFICIAL_HP, TIME_FACTOR, MODULE_TITLES, SCOPE, apply_official, procedure_parts, PDF
from encargos import encargos_for
from instructional_quality import apply_instructional_quality

HP_MINUTES = 45
AULA_SHARE = 0.30
EXAM_HP = 2
PASS_PERCENT = 60


def verified_static_asset(value):
    if not isinstance(value, str) or not value.startswith('/static/'):
        return False
    static_root = (Path(__file__).resolve().parent / 'static').resolve()
    path = (static_root.parent / value.split('?', 1)[0].lstrip('/')).resolve()
    return path.is_relative_to(static_root) and path.is_file()


MODULE_HP = dict(OFFICIAL_HP)
COURSE_HP = sum(MODULE_HP.values())
SKILLS = ['Representar', 'Modelar', 'Resolver problemas', 'Argumentar']
DIFFICULTIES = ['Inicial', 'Intermedia', 'Avanzada']
REPS = ['texto', 'imagen', 'diagrama', 'tabla', 'documento', 'caso', 'error', 'diagnóstico', 'secuencia', 'comparación']
FOURTH = 'Confiar en la apariencia del elemento y continuar sin dejar registro.'
MCQ_FILLERS = [
    FOURTH,
    'Continuar sin registrar la información faltante.',
    'Dar por cerrado el caso porque el resultado numérico parece coherente.',
    'Declarar el límite de la evidencia y dejar constancia del dato que falta.',
]
PICTOGRAMS = [
    {'label': 'Equipo'}, {'label': 'Instrumento'}, {'label': 'Plano'}, {'label': 'Registro'},
]
CASE_FORMATS = ['photo', 'work-order', 'table', 'hotspot', 'incident', 'compare', 'document', 'data', 'error', 'diagnose', 'prioritize', 'sequence', 'photo', 'work-order', 'incident']
# Misma taxonomía que static/app.js stages[]
X5_FOCUS = [
    ('Analizar', 'Inicial', 'Representar'),
    ('Comprender', 'Inicial', 'Modelar'),
    ('Relacionar', 'Intermedia', 'Resolver problemas'),
    ('Aplicar y decidir', 'Intermedia', 'Resolver problemas'),
    ('Verificar', 'Avanzada', 'Argumentar'),
    ('Retroalimentar', 'Intermedia', 'Argumentar'),
]
STATION_SHARE = {1: 0.10, 2: 0.50, 3: 0.30, 5: 0.10}


def _load(hp, course_hp=COURSE_HP):
    official = int(hp)
    aula_hp = official * AULA_SHARE
    denominator = max(float(course_hp or COURSE_HP) * AULA_SHARE, 1)
    exam_hp = aula_hp / denominator * EXAM_HP
    formative_hp = aula_hp - exam_hp
    minutes = aula_hp * HP_MINUTES
    formative_minutes = formative_hp * HP_MINUTES
    exam_minutes = exam_hp * HP_MINUTES
    # Distribute operational minutes with largest remainders so the five
    # station values add exactly to the rounded module total.
    operational_formative = round(formative_minutes)
    raw = {key: formative_minutes * share for key, share in STATION_SHARE.items()}
    allocated = {key: int(raw[key]) for key in STATION_SHARE}
    remaining = operational_formative - sum(allocated.values())
    for key in sorted(STATION_SHARE, key=lambda value: raw[value] - allocated[value], reverse=True)[:remaining]:
        allocated[key] += 1
    e2 = allocated[2]
    return {
        'hp': official,
        'official_hp': official,
        'time_factor': TIME_FACTOR,
        'aula_share': AULA_SHARE,
        'aula_hp_exact': aula_hp,
        'aula_hp_operational': round(aula_hp, 1),
        'sim_hp': aula_hp,
        'exam_hp': exam_hp,
        'formative_hp': formative_hp,
        'exam_sim_hp': exam_hp,
        'formative_sim_hp': formative_hp,
        'minutes': minutes,
        'official_minutes': official * HP_MINUTES,
        'formative_minutes': formative_minutes,
        'exam_minutes': exam_minutes,
        'station_minutes': {
            '1': allocated[1],
            '2': e2,
            '2_etapa': max(1, round(e2 / 18)),
            '3': allocated[3],
            '4': round(exam_minutes),
            '5': allocated[5],
        },
        'station_minutes_exact': {
            '1': formative_minutes * STATION_SHARE[1],
            '2': formative_minutes * STATION_SHARE[2],
            '3': formative_minutes * STATION_SHARE[3],
            '4': exam_minutes,
            '5': formative_minutes * STATION_SHARE[5],
        },
    }


def course_planning(course=None):
    title = f"{(course or {}).get('title', '')} {(course or {}).get('specialty', '')}".lower()
    supplied = (course or {}).get('modules') or []
    custom = supplied and all(m.get('official_hp') for m in supplied)
    if not custom and 'climatiz' not in title and 'refriger' not in title:
        return None
    hp_rows = [(int(m.get('position') or i + 1), int(m['official_hp']), m.get('title')) for i, m in enumerate(supplied)] if custom else [(pos, hp, MODULE_TITLES.get(pos)) for pos, hp in MODULE_HP.items()]
    course_hp = sum(hp for _, hp, _ in hp_rows)
    modules = []
    for pos, hp, module_title in hp_rows:
        row = _load(hp, course_hp)
        row['position'] = pos
        row['title'] = module_title
        modules.append(row)
    scope = ((course or {}).get('scope') or SCOPE) if custom else SCOPE
    pdf = (course or {}).get('pdf') if custom else PDF
    return {
        'course_hp': course_hp,
        'course_aula_hp': round(course_hp * AULA_SHARE, 1),
        'course_sim_hp': round(course_hp * AULA_SHARE, 1),
        'aula_share': AULA_SHARE,
        'hp_minutes': HP_MINUTES,
        'time_factor': TIME_FACTOR,
        'exam_hp': EXAM_HP,
        'pass_percent': PASS_PERCENT,
        'modules': modules,
        'scope': scope,
        'pdf': pdf,
        'note': (
            f'1 HP = {HP_MINUTES} minutos. Aula TP utiliza el 30 % de las horas oficiales: '
            f'{course_hp} HP × 0,30 = {course_hp * AULA_SHARE:.1f} HP. '
            f'Las {EXAM_HP} HP de evaluación están incluidas en ese total. '
            f'El factor ×{TIME_FACTOR} se usa solo para estimar tareas desde tiempo experto. {scope}'
        ),
    }


def module_plan(position):
    hp = MODULE_HP.get(int(position or 0))
    if not hp:
        return None
    plan = _load(hp)
    plan['title'] = MODULE_TITLES.get(int(position))
    return plan


OFICIO_V = '3'
# Fotos de oficio: el estudiante las usa para observar, decidir o responder.
OFICIO_FILES = {
    'plano': 'oficio-plano-leyenda',
    'escala': 'oficio-escala',
    'visor21': 'oficio-visor-21c',
    'visor25': 'oficio-visor-25',
    'visor4': 'oficio-visor-4c',
    'manometro': 'oficio-manometro',
    'intervalo': 'oficio-intervalo',
    'tuberias': 'oficio-tuberias',
    'cruce': 'oficio-cruce',
    'tramos': 'oficio-tramos',
    'acceso': 'oficio-acceso-cm',
    'drenaje': 'oficio-drenaje',
    'equipo': 'oficio-equipo-ctrl',
}
OFICIO_CAPTION = {
    'plano': 'Planta HVAC en español · leyenda incompleta. El drenaje azul sale de UI-01 y se corta en el pasillo, sin destino. El cajetín declara escala 1:50.',
    'escala': 'Copia a escala 1:50. El dato es la medida sobre el papel (cm) y la escala del cajetín de plano, no un detalle de muro.',
    'visor21': 'Visor TERM-01 · 21,2 °C en ambiente de sala. Lee valor, unidad y punto de medición.',
    'visor25': 'Panel que muestra 25 sin unidad. Falta magnitud, unidad y punto antes de interpretar.',
    'visor4': 'Visor de cadena de frío · 4,0 °C. El valor es dato del caso, no un adorno.',
    'manometro': 'Manómetro de servicio. Lee valor y unidad en la escala del instrumento (psi / bar).',
    'intervalo': 'Termómetro analógico · intervalo declarado −10 a 50 °C. Comprueba si incluye el valor esperado.',
    'tuberias': 'Dos cañerías paralelas del mismo color. La identidad sale de etiqueta y leyenda, no del pintado.',
    'cruce': 'Planta: tubería y conducto se cruzan en el dibujo. La cota de altura falta; un cruce en planta no prueba colisión.',
    'tramos': 'Tramos rotulados: A 2,5 m · B 150 cm · C 3,0 m · codo C-01. Cubicación con unidad común.',
    'acceso': 'Split a 8 cm del rack. La ficha ficticia pide 30 cm de acceso lateral. Equipo sin marca.',
    'drenaje': 'Cassette con tubo de condensado sin descarga definida. El plano debe mostrar origen y destino.',
    'equipo': 'EQ-02 · 220 V 50 Hz y CTRL-02. Acceso lateral 24 cm; la ficha pide 30 cm. Contrasta placa y control.',
}
MODULE_OFICIO = {1: 'plano', 2: 'visor21', 3: 'tramos', 4: 'equipo'}
DECORATIVE_MEDIA = re.compile(r'themes/cases/|workshop\.png|reflection\.png|assessment\.png|headers/', re.I)

# (clave, patrón). El primero que coincida gana.
OFICIO_RULES = [
    ('escala', r'1:\d+|escala verificada|copia impresa|mide \d+ cm|longitud real'),
    ('visor4', r'4,0\s*°\s*c|4\.0\s*°|vacuna|farmacia'),
    ('visor25', r'unidad ausente|columna de unidad|sin unidad ni punto|25 sin unidad|muestra 25'),
    ('visor21', r'21[,.]2|term-01|promedio|amplitud|visor|resoluci[oó]n de indicaci[oó]n|pasos de 0,1|magnitud y el prop[oó]sito'),
    ('intervalo', r'intervalo|−10|50 a 150|-10 a 50|instrumento declara'),
    ('manometro', r'man[oó]metro|presi[oó]n'),
    ('drenaje', r'drenaje|condensado|desag[uü]e'),
    ('acceso', r'8 cm|30 cm|rack|acceso lateral|closet|servidor'),
    ('cruce', r'cruza|cruce|interfer|viga|conducto|bandeja el[eé]ctrica'),
    ('tuberias', r'paralelas|mismo color|l[ií]quido y succi[oó]n|pintad'),
    ('tramos', r'tramo|cubic|codo|c-01|150 cm|2,5 m|reserva'),
    ('plano', r'leyenda|s[ií]mbol|l[ií]nea discontinua|planta r-|revisi[oó]n [abc]|detalle d-|listado'),
    ('equipo', r'eq-0|ctrl-|ficha|control|compatib|condensadora|split|cassette|equipo'),
]


def _theme(mid):
    return {1: 'plans', 2: 'measurement', 3: 'networks', 4: 'equipment'}.get(mid, 'workshop')


def oficio_src(key):
    name = OFICIO_FILES.get(key) or OFICIO_FILES[MODULE_OFICIO.get(1)]
    return f'/static/themes/oficio/{name}.png?v={OFICIO_V}'


def _img(mid):
    return oficio_src(MODULE_OFICIO.get(int(mid or 1), 'plano'))


def _item_blob(item):
    if not isinstance(item, dict):
        return str(item or '')
    return ' '.join(str(item.get(k) or '') for k in (
        'title', 'prompt', 'question', 'context', 'lead', 'stimulus', 'site'
    ))


def oficio_key(item, module_id=1):
    text = _item_blob(item).lower()
    for key, pattern in OFICIO_RULES:
        if re.search(pattern, text, re.I):
            return key
    return MODULE_OFICIO.get(int(module_id or 1), 'plano')


def apply_oficio_media(item, module_id=1, index=0, force=False):
    """Asigna foto de oficio (y rótulo) si el medio actual no sirve para responder."""
    if not isinstance(item, dict):
        return item
    key = oficio_key(item, module_id)
    src = oficio_src(key)
    current = str(item.get('image') or '')
    item['image'] = src
    item['caption'] = OFICIO_CAPTION.get(key, 'Foto de oficio. Úsala para observar el dato o el riesgo del ítem.')
    item['alt'] = OFICIO_CAPTION.get(key, item.get('title') or 'Oficio')
    item['media_kind'] = 'foto'
    item['media_key'] = key
    return item


def case_photo(i, case=None):
    """Foto del objeto o procedimiento del ítem, no un aula genérica por índice."""
    if isinstance(case, dict):
        apply_oficio_media(case, case.get('_module_id') or 1, i, force=True)
        return case['image']
    return oficio_src(MODULE_OFICIO.get(1))


def _spots(mid):
    packs = {
        1: [
            {'id': 'ue', 'x': 18, 'y': 28, 'label': 'UE-01', 'note': '¿Qué indica esta etiqueta en el plano? Reconoce el signo; no resuelvas el sistema.'},
            {'id': 'ui', 'x': 62, 'y': 46, 'label': 'UI-01', 'note': '¿Qué informa este equipo dibujado? Contrástalo con el listado, sin decidir todavía.'},
            {'id': 'leyenda', 'x': 84, 'y': 18, 'label': 'Leyenda', 'note': '¿Qué indica este signo? La leyenda nombra; el color por sí solo no decide.'},
            {'id': 'drenaje', 'x': 48, 'y': 72, 'label': 'Drenaje', 'note': '¿Qué información da esta línea antes de decidir? El origen se ve; el destino aún no.'},
        ],
        2: [
            {'id': 'visor', 'x': 30, 'y': 36, 'label': 'Visor', 'note': '¿Qué dato muestra aquí? Anota valor y unidad; no interpretes todavía.'},
            {'id': 'ficha', 'x': 72, 'y': 24, 'label': 'Ficha', 'note': '¿Qué informa este recuadro antes de elegir instrumento?'},
            {'id': 'registro', 'x': 54, 'y': 70, 'label': 'Registro', 'note': '¿Qué le falta a esta fila para poder leerla?'},
        ],
        3: [
            {'id': 'planta', 'x': 28, 'y': 30, 'label': 'Planta', 'note': '¿Qué recorrido muestra este trazo? Un cruce dibujado no prueba colisión.'},
            {'id': 'seccion', 'x': 70, 'y': 38, 'label': 'Sección', 'note': '¿Qué dato de altura ves aquí antes de decidir?'},
            {'id': 'listado', 'x': 48, 'y': 74, 'label': 'Listado', 'note': '¿A qué tramo apunta esta cantidad? Reconoce; no cubiques aún.'},
        ],
        4: [
            {'id': 'equipo', 'x': 32, 'y': 34, 'label': 'EQ-02', 'note': '¿Qué identifica esta etiqueta? Reconoce el equipo; no instales todavía.'},
            {'id': 'acceso', 'x': 68, 'y': 48, 'label': 'Acceso', 'note': '¿Qué informa este paso libre antes de decidir el montaje?'},
            {'id': 'control', 'x': 50, 'y': 72, 'label': 'Control', 'note': '¿Qué dice la documentación de este control? El conector no basta.'},
        ],
    }
    return packs.get(mid, packs[1])


def _explore(mid, context):
    shifts = {
        1: 'Son las 08:15. Acabas de comenzar tu turno en el taller de climatización del liceo y recibes el dossier de una sala.',
        2: 'Son las 08:15. En el laboratorio te entregan un registro de mediciones simuladas y dos instrumentos distintos.',
        3: 'Son las 08:15. El dossier de redes llega con planta, una sección incompleta y un listado con unidades mezcladas.',
        4: 'Son las 08:15. Llega el equipo EQ-02 al recinto y debes contrastarlo con ficha, acceso y control previsto.',
    }
    return {
        'shift': shifts.get(mid, shifts[1]),
        'image': _img(mid),
        'spots': _spots(mid),
        'prompts': [
            '¿Qué observas en este escenario profesional?',
            '¿Qué información consideras importante antes de actuar?',
            '¿Qué podría ocurrir si avanzas sin confirmar los antecedentes?',
        ],
        'purpose': 'Observa, descubre y anticipa. Esta estación no califica: conecta el módulo con el trabajo real.',
        'context': context,
        'media_kind': 'foto',
        'caption': OFICIO_CAPTION.get(MODULE_OFICIO.get(mid, 'plano')),
        'alt': OFICIO_CAPTION.get(MODULE_OFICIO.get(mid, 'plano')),
        'video': f'/static/media/m{mid}-secuencia.mp4',
        'vtt': f'/static/media/m{mid}-secuencia.vtt',
        'formative_pack': None,
    }


def _x5(mid, ae_index, ae):
    title = ae.get('title', 'este aprendizaje')
    img = _img(mid)
    focus = X5_FOCUS
    kinds = [
        ['hotspot', 'match', 'order', 'error', 'decide', 'reflect'],
        ['classify', 'choice', 'checklist', 'diagnose', 'prioritize', 'reflect'],
        ['document', 'table', 'compare', 'branch', 'justify', 'reflect'],
    ][ae_index % 3]
    banks = {
        1: {
            'match': [
                ('UE', 'Unidad exterior'), ('UI', 'Unidad interior'),
                ('Leyenda', 'Significado de símbolos y trazos'), ('Cota', 'Medida indicada en el plano'),
            ],
            'order': ['Identificar la revisión del documento', 'Leer la leyenda', 'Ubicar etiquetas de equipos', 'Contrastar con el listado', 'Registrar diferencias'],
            'classify': [
                ('UE-01', 'Equipo'), ('Soporte S-01', 'Accesorio'), ('Línea de líquido', 'Recorrido'), ('Control de temperatura', 'Control'),
            ],
            'buckets': ['Equipo', 'Accesorio', 'Recorrido', 'Control'],
            'error': 'Dos líneas se cruzan en planta y no se indica unión ni cota de altura.',
            'doc': 'ORDEN DE TRABAJO OT-14\nRevisión planta: B\nListado: A\nEquipos declarados: UI-01, UE-01\nObservación: UI-02 aparece en planta y no en el listado.',
            'table': [['Documento', 'Revisión', 'Equipos'], ['Planta', 'B', 'UI-01, UI-02, UE-01'], ['Listado', 'A', 'UI-01, UE-01']],
        },
        2: {
            'match': [
                ('Magnitud', 'Propiedad que se mide'), ('Unidad', 'Escala en que se expresa el valor'),
                ('Intervalo', 'Valores que el instrumento declara cubrir'), ('Resolución', 'Menor cambio que muestra el visor'),
            ],
            'order': ['Identificar magnitud y unidad', 'Comprobar el intervalo', 'Registrar punto y condición', 'Interpretar la lectura', 'Declarar límites'],
            'classify': [('21,2 °C', 'Lectura'), ('TERM-01', 'Instrumento'), ('Punto A', 'Ubicación'), ('18 a 22 °C', 'Criterio')],
            'buckets': ['Lectura', 'Instrumento', 'Ubicación', 'Criterio'],
            'error': 'El registro muestra 25 sin unidad, punto ni instrumento.',
            'doc': 'REGISTRO DE LABORATORIO\nPunto A · TERM-01 · 19,8 / 20,0 / 20,2 °C\nFila 4: 25  (sin unidad)',
            'table': [['Punto', 'Valor', 'Unidad'], ['A', '20,0', '°C'], ['B', '25', '—']],
        },
        3: {
            'match': [
                ('Planta', 'Distribución horizontal'), ('Sección', 'Alturas y niveles'),
                ('Cubicación', 'Cantidades trazables'), ('Reserva', 'Adicional solo si el enunciado la pide'),
            ],
            'order': ['Identificar tramos y etiquetas', 'Unificar unidades', 'Sumar longitudes netas', 'Separar accesorios', 'Registrar pendientes'],
            'classify': [('Tramo A 2,5 m', 'Tubería'), ('Codo C-01', 'Accesorio'), ('Cota 2,40 m', 'Nivel'), ('R2', 'Revisión')],
            'buckets': ['Tubería', 'Accesorio', 'Nivel', 'Revisión'],
            'error': 'El listado suma 2 m + 150 cm como si fueran la misma unidad.',
            'doc': 'CUBICACIÓN R1\nA: 2,5 m  B: 150 cm  C: 3 m\nC-01 en planta y en detalle.',
            'table': [['Tramo', 'Longitud', 'Unidad'], ['A', '2,5', 'm'], ['B', '150', 'cm'], ['C', '3', 'm']],
        },
        4: {
            'match': [
                ('Modelo', 'Identidad del equipo'), ('Acceso', 'Espacio de mantenimiento'),
                ('Control', 'Dispositivo asociado al equipo'), ('Pendiente', 'Hallazgo aún no cerrado'),
            ],
            'order': ['Identificar el modelo recibido', 'Contrastar la ficha', 'Medir el acceso disponible', 'Relacionar el control', 'Redactar pendientes'],
            'classify': [('EQ-02', 'Equipo'), ('CTRL-01', 'Control'), ('24 cm', 'Acceso'), ('Consulta técnica', 'Pendiente')],
            'buckets': ['Equipo', 'Control', 'Acceso', 'Pendiente'],
            'error': 'La ficha pide 30 cm de acceso y la maqueta muestra 24 cm.',
            'doc': 'ACTA DE RECEPCIÓN\nEquipo: EQ-02\nFicha adjunta: EQ-01\nControl recibido: CTRL-02\nDossier: CTRL-01',
            'table': [['Ítem', 'Dossier', 'Recibido'], ['Equipo', 'EQ-02', 'EQ-02'], ['Control', 'CTRL-01', 'CTRL-02'], ['Acceso', '30 cm', '24 cm']],
        },
    }
    bank = banks.get(mid, banks[1])
    # classify tuples may have been typed with a list by mistake
    classify_items = []
    for item in bank['classify']:
        classify_items.append(tuple(item) if not isinstance(item, tuple) else item)

    out = []
    for step, kind in enumerate(kinds):
        label, difficulty, skill = focus[step]
        minutes = [8, 10, 12, 15, 18, 10][step]
        exp = {
            'id': f'ae{ae_index+1}-x{step+1}',
            'type': kind,
            'activity_kind': ['observe', 'read', 'pair', 'procedure', 'error', 'argue'][step],
            'label': label,
            'skill': skill,
            'difficulty': difficulty,
            'minutes': minutes,
            'ae': ae_index,
            'prompt': ae.get('steps', [''])[step] if step < len(ae.get('steps', [])) else title,
            'hints': [
                'Identifica qué dato tienes y qué dato falta antes de concluir.',
                'Compara dos documentos o dos representaciones del mismo elemento.',
                'Explica el criterio que usarías para verificar, usando solo la información disponible.',
            ],
        }
        if kind == 'hotspot':
            exp.update(image=img, spots=_spots(mid), answer=[p['id'] for p in _spots(mid)],
                       prompt='Explora el escenario y abre cada punto. ¿Qué información aporta cada uno al aprendizaje '+title+'?')
        elif kind == 'match':
            pairs = bank['match']
            exp.update(left=[a for a, _ in pairs], right=[b for _, b in pairs],
                       answer=[[i, i] for i in range(len(pairs))],
                       prompt='Relaciona cada concepto con su significado en este módulo.')
        elif kind == 'order':
            exp.update(items=bank['order'], answer=list(range(len(bank['order']))),
                       prompt='Ordena el procedimiento de revisión. Arrastra o usa las flechas.')
        elif kind == 'classify':
            exp.update(items=[a for a, _ in classify_items], buckets=bank['buckets'],
                       answer={a: b for a, b in classify_items},
                       prompt='Clasifica cada elemento según su función en el proyecto simulado.')
        elif kind == 'checklist':
            items = [f'Comprobar {x}' for x in bank['match'][:3]] + ['Declarar lo que aún falta']
            exp.update(items=items, answer=list(range(len(items))),
                       prompt='Marca las comprobaciones mínimas antes de interpretar el caso.')
        elif kind == 'error':
            exp.update(type='choice', representation='error', image=img,
                       options=['Registrar el hallazgo y pedir el antecedente faltante', 'Completar el dato con una suposición razonable', 'Ignorar el detalle porque el resto del dossier se ve coherente', FOURTH],
                       answer=0, prompt=bank['error']+' ¿Qué harías?')
        elif kind in ('decide', 'diagnose', 'prioritize', 'branch', 'justify', 'choice'):
            options = [
                'Apoyar la decisión en documentos y declarar límites',
                'Elegir la opción más rápida para no detener el trabajo',
                'Usar un caso anterior aunque las condiciones sean distintas',
                FOURTH,
            ]
            exp.update(type='choice', options=options, answer=0, representation='caso' if kind != 'choice' else 'texto',
                       prompt=exp['prompt'])
        elif kind == 'document':
            exp.update(type='choice', representation='documento', document=bank['doc'],
                       options=['Conciliar revisiones y registrar la diferencia', 'Usar el listado porque es más corto', 'Usar la planta y descartar el listado', FOURTH],
                       answer=0, prompt='Lee la orden de trabajo. ¿Qué decisión permite seguir con evidencia?')
        elif kind == 'table':
            exp.update(type='choice', representation='tabla', table=bank['table'],
                       options=['Unificar unidades o revisiones antes de concluir', 'Sumar o comparar los valores tal como aparecen', 'Descartar la fila incompleta', FOURTH],
                       answer=0, prompt='Interpreta la tabla. ¿Qué límite tiene la información?')
        elif kind == 'compare':
            exp.update(type='choice', representation='comparación', image=img,
                       options=['Identificar qué coincide, qué difiere y qué falta', 'Promediar las dos versiones', 'Conservar la versión más reciente sin contrastar', FOURTH],
                       answer=0)
        elif kind == 'reflect':
            exp.update(type='reflect', prompt=exp['prompt'])
        if exp.get('type') == 'choice':
            ensure_mcq_fields(exp, ae_index * 6 + step, mid, 'choice')
            exp.setdefault('question', exp.get('prompt'))
            exp.setdefault('stimulus', exp.get('label') or title)
        out.append(exp)
    plan = module_plan(mid)
    if plan:
        etapa = plan['station_minutes']['2_etapa']
        for exp in out:
            exp['minutes'] = etapa
            exp['official_minutes'] = max(1, round(etapa / TIME_FACTOR))
            exp['time_factor'] = TIME_FACTOR
    return out


def _case_extra(i, mid, case):
    fmt = CASE_FORMATS[i % len(CASE_FORMATS)]
    extra = {'format': fmt, 'skill': SKILLS[i % 4], 'difficulty': DIFFICULTIES[min(2, i // 5)], 'ae': i % 3, 'minutes': 12 + (i % 3) * 4}
    extra['_module_id'] = mid
    apply_oficio_media(case if isinstance(case, dict) else extra, mid, i, force=True)
    extra['image'] = (case or extra).get('image') or oficio_src(MODULE_OFICIO.get(mid))
    extra['caption'] = (case or extra).get('caption')
    extra['alt'] = (case or extra).get('alt')
    if fmt == 'photo':
        extra['image'] = extra['image']
    elif fmt == 'work-order':
        extra['document'] = f"ORDEN DE TRABAJO OT-{i+1:02d}\nMódulo simulado {mid}\nSituación: {case.get('title','')}\n{case.get('context','')}"
    elif fmt in ('table', 'data'):
        extra['table'] = [['Antecedente', 'Estado'], ['Documento recibido', 'Sí'], ['Dato crítico', 'Incompleto'], ['Consulta enviada', 'No']]
    elif fmt == 'hotspot':
        extra['spots'] = _spots(mid)[:3]
        extra['inspect'] = [_spots(mid)[0]['id']]
    elif fmt == 'document':
        extra['document'] = case.get('context', '')
    return extra


def _exam_meta(i):
    return {
        'ae': i % 3,
        'skill': SKILLS[i % 4],
        'difficulty': DIFFICULTIES[0 if i % 5 == 0 else (1 if i % 5 in (1, 2) else 2)],
        'representation': REPS[i % len(REPS)],
        'format': ['análisis visual', 'caso', 'decisión', 'fundamento', 'secuencia', 'comparación', 'error', 'diagnóstico', 'tabla', 'documento'][i % 10],
    }


def _fourth_option(q):
    return ensure_four_options(q)


def ensure_four_options(item):
    """Completa A–D sin mover el índice de la respuesta correcta."""
    if not isinstance(item, dict):
        return item
    opts = list(item.get('options') or [])
    seen = set(opts)
    n = 0
    while len(opts) < 4:
        extra = MCQ_FILLERS[n % len(MCQ_FILLERS)]
        n += 1
        if extra not in seen:
            opts.append(extra)
            seen.add(extra)
        elif n > 10:
            extra = 'Limitar la conclusión a lo documentado (' + str(len(opts) + 1) + ').'
            opts.append(extra)
            seen.add(extra)
    item['options'] = opts[:4]
    ans = item.get('answer', 0)
    if type(ans) != int or not (0 <= ans < len(item['options'])):
        item['answer'] = 0
    return item


def ensure_mcq_fields(item, index=0, module_id=1, kind='question'):
    """Foto real, estímulo, forma 1–9 y pack cuando un recurso alimenta varias preguntas."""
    if not isinstance(item, dict):
        return item
    ensure_four_options(item)
    form = ((index % 9) + 1)
    item.setdefault('form', form)
    item['form'] = int(item.get('form') or form)
    apply_oficio_media(item, module_id, index, force=True)
    stim = item.get('stimulus') or item.get('lead') or item.get('title') or ''
    if kind == 'question' and not stim:
        stim = (item.get('question') or '')[:160]
    item.setdefault('stimulus', stim)
    if item['form'] == 2:
        item.setdefault('pictograms', PICTOGRAMS[:3])
    if item['form'] == 3:
        companion = oficio_src('plano' if oficio_key(item, module_id) != 'plano' else 'escala')
        item['illustration'] = companion
    if item['form'] == 5:
        item.setdefault('table', [['Antecedente', 'Valor'], ['Documento', 'Recibido'], ['Dato crítico', 'Incompleto']])
    if item['form'] == 6:
        item.setdefault('formula', 'Valor real = medida en el plano × escala ÷ 100')
    if item['form'] == 7:
        item.setdefault('chart', 'Croquis: eje horizontal = tramo; eje vertical = cota o lectura.')
    if item['form'] == 4:
        pack_n = index // 3
        pack_index = (index % 3) + 1
        item['pack'] = {
            'pack_id': f'{kind}-m{module_id}-p{pack_n}',
            'pack_label': str(pack_n + 1),
            'pack_index': pack_index,
            'pack_total': 3,
        }
        # Pack = mismo caso documental. La foto sigue el texto del ítem, no el índice del trío.
    if kind == 'question' and not item.get('question'):
        item['question'] = item.get('prompt') or item.get('title') or '¿Cuál es la decisión mejor fundamentada?'
    if kind == 'case' and not item.get('question'):
        item['question'] = '¿Qué decisión tomarías?'
    item.setdefault('alt', item.get('caption') or ((item.get('title') or 'Oficio') + '. Foto del objeto del ítem.'))
    return item


def practiced_forms(content):
    forms = set()
    for case in content.get('cases') or []:
        if case.get('form'):
            forms.add(int(case['form']))
    for ae in content.get('aes') or []:
        for exp in ae.get('experiences') or []:
            if exp.get('type') == 'choice' and exp.get('form'):
                forms.add(int(exp['form']))
    return forms


def build_traceability(content, specialty='Refrigeración y climatización'):
    rows = []
    aes = content.get('aes') or []
    ae_count = max(1, len(aes))
    src = content.get('official_source') or {}
    pdf_page = lambda ae: (ae or {}).get('official_page') or src.get('title') or PDF

    def crit_label(ae_i):
        ae = aes[ae_i] if ae_i < len(aes) else {}
        codes = ae.get('criteria') or []
        head = codes[0] if codes else ae.get('title')
        return ae.get('official_code') or f'AE{ae_i+1}', ae.get('title'), head, ae.get('official_page')

    for i, case in enumerate(content.get('cases') or []):
        ae_i = case.get('ae', i % ae_count)
        code, title, criterion, page = crit_label(ae_i)
        rows.append({
            'specialty': specialty,
            'page': f'PDF p. {page} · {code}',
            'pdf': PDF,
            'activity': case.get('title') or f'Situación {i+1}',
            'criterion': criterion,
            'ae_code': code,
            'ae_title': title,
            'practiced_in': 'estación 3',
            'form': case.get('form') or ((i % 9) + 1),
            'exam_item': None,
        })
    for ai, ae in enumerate(aes):
        for si, exp in enumerate(ae.get('experiences') or []):
            code, title, criterion, page = crit_label(ai)
            rows.append({
                'specialty': specialty,
                'page': f'PDF p. {page} · {code} · criterio {si+1}',
                'pdf': PDF,
                'activity': exp.get('prompt') or ae.get('title'),
                'criterion': (ae.get('criteria') or [criterion])[min(si, len(ae.get('criteria') or [criterion]) - 1)],
                'ae_code': code,
                'ae_title': title,
                'practiced_in': 'estación 2',
                'form': exp.get('form') or ((si % 9) + 1),
                'exam_item': None,
                'activity_kind': exp.get('activity_kind') or exp.get('type'),
            })
    for act in content.get('formative_pack') or []:
        rows.append({
            'specialty': specialty,
            'page': f'PDF · actividad de oficio {act.get("kind")}',
            'pdf': PDF,
            'activity': act.get('label'),
            'criterion': act.get('prompt'),
            'ae_code': 'pack',
            'practiced_in': f'estación {act.get("station", 3)}',
            'form': act.get('kind'),
            'exam_item': None,
        })
    practiced = {(r.get('ae_code'), int(r['form'])) for r in rows if str(r.get('form', '')).isdigit()}
    practiced_forms = {int(r['form']) for r in rows if str(r.get('form', '')).isdigit()}
    for i, q in enumerate(content.get('questions') or []):
        ae_i = q.get('ae', i % ae_count)
        code, title, criterion, page = crit_label(ae_i)
        form = int(q.get('form') or ((i % 9) + 1))
        crits = aes[ae_i].get('criteria') if ae_i < len(aes) else []
        mapped = crits[i % len(crits)] if crits else criterion
        rows.append({
            'specialty': specialty,
            'page': f'PDF p. {page} · {code}',
            'pdf': PDF,
            'activity': q.get('stimulus') or q.get('question'),
            'criterion': mapped,
            'ae_code': code,
            'ae_title': title,
            'practiced_in': 'estación 4',
            'form': form,
            'exam_item': i + 1,
            'had_practice': form in practiced_forms,
            'formative_footprint': True,
        })
    rows.append({
        'specialty': specialty,
        'page': f'PDF · {src.get("title") or "módulo"}',
        'pdf': PDF,
        'activity': 'Situación de desarrollo',
        'criterion': 'Aplicación y análisis de los AE del módulo (huella de las formativas del PDF)',
        'practiced_in': 'estación 4',
        'form': 'desarrollo',
        'exam_item': 'desarrollo',
        'had_practice': True,
    })
    return rows


def publication_gaps(content, specialty='Refrigeración y climatización'):
    """Hueco = criterio sin actividad, alternativa sin práctica del mismo formato, o ítem A–D incompleto."""
    if not isinstance(content, dict):
        return ['No hay contenido para publicar.']
    gaps = []
    aes = content.get('aes') or []
    cases = content.get('cases') or []
    qs = content.get('questions') or []
    if not content.get('development') or len(str(content.get('development'))) < 80:
        gaps.append('Falta la situación de desarrollo (no es de alternativa).')
    if content.get('development_kind') not in (None, 'desarrollo'):
        gaps.append('El desarrollo debe quedar marcado como no A–D.')
    for i, case in enumerate(cases):
        if not isinstance(case, dict):
            gaps.append(f'Situación {i+1}: no es un ítem A–D.')
            continue
        if len(case.get('options') or []) != 4:
            gaps.append(f'Situación {i+1}: debe tener A, B, C y D.')
        if not case.get('image'):
            gaps.append(f'Situación {i+1}: falta la foto real.')
        elif DECORATIVE_MEDIA.search(str(case.get('image') or '')) and not content.get('specialty_source'):
            gaps.append(f'Situación {i+1}: la foto es decorativa, no de oficio.')
        if not case.get('question') and not case.get('title'):
            gaps.append(f'Situación {i+1}: falta la consigna.')
    for i, q in enumerate(qs):
        if not isinstance(q, dict):
            gaps.append(f'Ítem EF {i+1}: no es un ítem A–D.')
            continue
        if len(q.get('options') or []) != 4:
            gaps.append(f'Ítem EF {i+1}: debe tener A, B, C y D.')
        if not q.get('image'):
            gaps.append(f'Ítem EF {i+1}: falta la foto real.')
        elif DECORATIVE_MEDIA.search(str(q.get('image') or '')) and not content.get('specialty_source'):
            gaps.append(f'Ítem EF {i+1}: la foto es decorativa, no de oficio.')
        if not textish(q.get('question'), 3):
            gaps.append(f'Ítem EF {i+1}: falta la consigna.')
        if int(q.get('form') or 0) not in range(1, 10):
            gaps.append(f'Ítem EF {i+1}: falta la forma de ítem (1–9).')
    forms = practiced_forms(content)
    for i, q in enumerate(qs):
        form = int(q.get('form') or 0)
        if form and form not in forms:
            gaps.append(f'Ítem EF {i+1}: la forma {form} no se practicó en el módulo.')
    ae_count = max(1, len(aes))
    for i, ae in enumerate(aes):
        title = ae.get('title') if isinstance(ae, dict) else ''
        has_formative = any((c.get('ae', j % ae_count) == i) for j, c in enumerate(cases))
        has_choice = any(exp.get('type') == 'choice' for exp in (ae.get('experiences') or []) if isinstance(ae, dict))
        if not has_formative and not has_choice:
            gaps.append(f'Criterio «{title}»: no tiene actividad formativa.')
        has_exam = any(q.get('ae', j % ae_count) == i for j, q in enumerate(qs))
        if not has_exam:
            gaps.append(f'Criterio «{title}»: no tiene pregunta en la evaluación.')
        if isinstance(ae, dict) and not ae.get('criteria'):
            gaps.append(f'AE «{title}»: falta la transcripción de criterios del PDF.')
        if isinstance(ae, dict) and not ae.get('official_code'):
            gaps.append(f'AE «{title}»: falta el código oficial del PDF.')
    return gaps


def textish(v, n=1):
    return isinstance(v, str) and len(v.strip()) >= n


def _visual_stem(q, i, mid):
    rep = q.get('representation')
    apply_oficio_media(q, mid, i, force=True)
    if rep == 'tabla':
        q.setdefault('table', [['Dato', 'Valor'], ['Revisión', 'B'], ['Cantidad declarada', '3'], ['Cantidad dibujada', '4']])
    elif rep == 'documento':
        q.setdefault('document', q.get('question', ''))
    return q


def development_pack(mid, development):
    packs = {
        1: {
            'context': 'Sala de un liceo · climatización de aula',
            'role': 'Técnico en formación que revisa el dossier antes de cualquier montaje',
            'objective': 'Dejar una revisión fundada, con inconsistencias y consultas trazables',
            'problem': 'La planta revisión B y el listado revisión A no cuentan la misma historia de equipos y drenaje.',
            'background': 'UI-01, UI-02 y UE-01 aparecen en planta. El listado solo declara una unidad interior.',
            'evidence': ['Planta R-B con UI-01 y UI-02', 'Listado R-A con una UI', 'Drenaje sin destino', 'Leyenda parcial'],
            'constraints': 'Trabaja con las cotas, materiales y procedimientos que figuran en el dossier. Declara lo que falta.',
            'decision': 'Qué revisarías, qué registrarías y a quién consultarías.',
            'argument': 'Por qué esa secuencia evita una conformidad infundada.',
            'verify': 'Cómo comprobarías que la corrección quedó reflejada en planta, listado y leyenda.',
        },
        2: {
            'context': 'Laboratorio del liceo · registro simulado de temperatura',
            'role': 'Estudiante que interpreta lecturas sin certificar la instalación',
            'objective': 'Informar promedio, amplitud y límites de la evidencia',
            'problem': 'Hay una serie comparable y una fila sin unidad ni punto.',
            'background': 'Punto A: 19,8; 20,0 y 20,2 °C con TERM-01. Criterio ficticio 18 a 22 °C.',
            'evidence': ['Serie del punto A', 'Ficha de intervalo −10 a 50 °C', 'Fila 25 sin unidad'],
            'constraints': 'No borres el dato inesperado ni extiendas la conclusión a todo el sistema.',
            'decision': 'Qué puedes concluir y qué queda pendiente.',
            'argument': 'Por qué el promedio no reemplaza la revisión de cada lectura.',
            'verify': 'Qué dato pedirías para interpretar la fila incompleta.',
        },
        3: {
            'context': 'Maqueta documental de redes',
            'role': 'Quien cubicará tramos sin ejecutar el montaje',
            'objective': 'Obtener longitudes trazables y dejar el cruce abierto si falta cota',
            'problem': 'Unidades mezcladas, accesorio duplicado en dos vistas y cruce sin altura.',
            'background': 'A 2,5 m · B 150 cm · C 3 m · reserva 10% · C-01 en planta y detalle.',
            'evidence': ['Planta R2', 'Listado de materiales', 'Detalle C-01', 'Cruce sin cota'],
            'constraints': 'No definas diámetros, presiones ni uniones reales.',
            'decision': 'Calcula neto, reserva y total; explica C-01 y el cruce.',
            'argument': 'Por qué separar accesorios de metros de tubería.',
            'verify': 'Cómo actualizarías la cubicación si cambia la revisión.',
        },
        4: {
            'context': 'Recepción documental de equipo de climatización',
            'role': 'Quien prepara la revisión previa al montaje',
            'objective': 'Distinguir lo verificado de lo pendiente',
            'problem': 'Ficha, acceso y control no coinciden del todo con lo recibido.',
            'background': 'EQ-02 recibido · ficha EQ-01 · acceso 24 vs 30 cm · CTRL-02 vs CTRL-01.',
            'evidence': ['Etiqueta EQ-02', 'Ficha EQ-01', 'Maqueta 24 cm', 'Listado CTRL-01'],
            'constraints': 'No energices ni certifiques la instalación.',
            'decision': 'Qué discrepancias registrar y qué consulta enviar.',
            'argument': 'Por qué el equipo que cabe no demuestra acceso suficiente.',
            'verify': 'Qué evidencia cerraría cada pendiente.',
        },
    }
    pack = packs.get(mid, packs[1])
    pack['development'] = development
    return pack


def exam_profile(questions, answers):
    buckets = {'ae': {}, 'skill': {}, 'difficulty': {}}
    for i, q in enumerate(questions):
        ok = answers.get(str(i)) == q.get('answer')
        for key, attr in (('ae', 'ae'), ('skill', 'skill'), ('difficulty', 'difficulty')):
            label = q.get(attr)
            if key == 'ae':
                label = f"AE{(label or 0)+1}"
            slot = buckets[key].setdefault(str(label), {'ok': 0, 'n': 0})
            slot['n'] += 1
            slot['ok'] += int(bool(ok))
    def pct(slot):
        return {k: {'ok': v['ok'], 'n': v['n'], 'percent': round(100 * v['ok'] / v['n']) if v['n'] else 0} for k, v in slot.items()}
    return {k: pct(v) for k, v in buckets.items()}


def same_set(expected, observed):
    if not isinstance(observed, list):
        return False
    return sorted(map(str, observed)) == sorted(map(str, expected))


def validate_experience(exp, response):
    """Devuelve (ok, mensaje). Nunca incluye la solución."""
    if not exp:
        return True, ''
    kind = exp.get('type')
    hints = exp.get('hints') or ['Revisa los datos disponibles y lo que todavía falta.']
    if kind == 'reflect':
        return True, ''
    if not isinstance(response, dict):
        return False, hints[0]
    answer = exp.get('answer')
    if kind == 'hotspot':
        got = response.get('ids') or response.get('spots') or []
        if same_set(answer, got):
            return True, ''
        return False, hints[0]
    if kind == 'match':
        pairs = response.get('pairs')
        if not isinstance(pairs, list):
            return False, hints[0]
        norm = sorted((int(a), int(b)) for a, b in pairs if isinstance(a, int) and isinstance(b, int) or str(a).isdigit())
        try:
            norm = sorted((int(a), int(b)) for a, b in pairs)
        except Exception:
            return False, hints[0]
        if norm == sorted((int(a), int(b)) for a, b in answer):
            return True, ''
        return False, hints[1] if len(hints) > 1 else hints[0]
    if kind == 'order':
        got = response.get('order')
        if got == answer or got == [str(x) for x in answer]:
            return True, ''
        return False, hints[1] if len(hints) > 1 else hints[0]
    if kind == 'classify':
        got = response.get('map') or {}
        if not isinstance(got, dict):
            return False, hints[0]
        if all(str(got.get(k, '')) == str(v) for k, v in answer.items()):
            return True, ''
        return False, hints[0]
    if kind == 'checklist':
        got = response.get('checked') or []
        if same_set(answer, got) or same_set(answer, [str(x) for x in got]):
            return True, ''
        return False, hints[0]
    if kind == 'choice':
        if response.get('choice') == answer:
            return True, ''
        return False, hints[0]
    return True, ''


def hint_for(exp, attempts):
    hints = (exp or {}).get('hints') or [
        '¿Qué elemento del escenario te falta observar?',
        'Piensa qué función cumple cada dato antes de decidir.',
        'Compara tu conclusión con la evidencia disponible. Aún no es la solución, es un criterio de verificación.',
    ]
    idx = min(max(int(attempts or 0), 0), len(hints) - 1)
    return hints[idx]


def summarize_response(exp, response):
    kind = (exp or {}).get('type', 'actividad')
    text = f'Registré la experiencia {kind} del aprendizaje. Observé, comparé y dejé constancia de mi decisión con los datos disponibles.'
    if isinstance(response, dict) and response.get('note'):
        text += ' ' + str(response['note'])
    return text[:10000]


def strip_for_student(content):
    c = deepcopy(content)
    for q in c.get('questions', []):
        q.pop('answer', None)
        q.pop('explanation', None)
    for q in c.get('cases', []):
        q.pop('answer', None)
        q.pop('inspect', None)
    for a in c.get('aes', []):
        for exp in a.get('experiences', []):
            exp.pop('answer', None)
            exp.pop('hints', None)
    c.pop('media_audit', None)
    return c


def _default_scene(mid, content):
    key = MODULE_OFICIO.get(int(mid or 1), 'plano')
    titles = {
        1: 'Recorrido espacial interactivo · lectura de plano e interferencias',
        2: 'Recorrido espacial interactivo · medición y verificación',
        3: 'Recorrido espacial interactivo · armar, unir y probar la red',
        4: 'Recorrido espacial interactivo · instalar equipo y control',
    }
    prompts = {
        1: 'Recorre los 8 pasos: recinto, leyenda, trazado, cruce, equipo, control, drenaje y cierre. Contrasta con el listado.',
        2: 'Recorre catálogo, instrumento, punto, intervalo, registro, unidad, criterio e informe.',
        3: 'Recorre puesto, listado, unión, tramo, cruce, fijación, hermeticidad y verificación NCh3241.',
        4: 'Recorre planos, obras previas, listado, EQ-02, acceso, montaje, control y cierre NCh3241.',
    }
    scene = {
        'title': titles.get(int(mid), titles[1]),
        'prompt': prompts.get(int(mid), prompts[1]),
        'parts': procedure_parts(mid),
        'procedure': True,
        'media_kind': '3d-procedure',
    }
    incoming = (content or {}).get('scene') if isinstance(content, dict) else None
    if incoming and incoming.get('parts'):
        seen = {p.get('id') for p in incoming['parts']}
        merged = list(incoming['parts'])
        for p in procedure_parts(mid):
            if p['id'] not in seen:
                merged.append(p)
        scene['parts'] = merged
        scene['title'] = incoming.get('title') or scene['title']
        scene['prompt'] = incoming.get('prompt') or scene['prompt']
    scene['image'] = oficio_src(key)
    scene['caption'] = OFICIO_CAPTION.get(key)
    scene['video'] = f'/static/media/m{int(mid)}-secuencia.mp4'
    scene['vtt'] = f'/static/media/m{int(mid)}-secuencia.vtt'
    return scene


def media_audit(content, module_id=1):
    """Lista: medio | sentido | acción | tipo | criterio."""
    rows = []
    mid = int(module_id or 1)

    def row(where, item, criterio, kind='foto'):
        blob = _item_blob(item)
        key = (item or {}).get('media_key') or oficio_key(item or {}, mid)
        src = (item or {}).get('image') or ''
        sense = 'sí' if src and '/oficio/' in src else 'no'
        action = 'mantener' if sense == 'sí' else 'cambiar'
        rows.append({
            'lugar': where,
            'medio': src.split('/')[-1] if src else '—',
            'sentido': sense,
            'accion': action,
            'tipo': (item or {}).get('media_kind') or kind,
            'criterio': criterio,
            'clave': key,
            'titulo': (item or {}).get('title') or (item or {}).get('prompt') or (item or {}).get('question') or where,
        })

    exp = content.get('explore') or {}
    row('E1 Contextualización · explorar', exp, 'Observar el escenario del AE con hotspots ligados a criterio', 'foto+hotspot')
    for ai, ae in enumerate(content.get('aes') or []):
        for si, e in enumerate(ae.get('experiences') or []):
            kind = '3d' if e.get('type') == 'hotspot' else ('foto' if e.get('type') in ('choice', 'compare', 'match') else 'texto')
            row(f'E2 AE{ai+1} etapa {si+1} ({e.get("type")})', e, ae.get('title') or 'AE', kind)
    for i, case in enumerate(content.get('cases') or []):
        row(f'E3 Situación {i+1}', case, 'Decidir en la situación con evidencia visible', 'foto' if i < 14 else 'foto')
    scene = content.get('scene') or {}
    row('E3 Situación final 3D', scene, 'Recorrer el procedimiento (armar, instalar, diagnosticar) en el equipo', '3d-procedure')
    for i, q in enumerate(content.get('questions') or []):
        row(f'E4 Ítem {i+1}', q, 'Imagen real del estímulo; el dato se lee en la figura', 'foto')
    row('E5 Retroalimentación', {'image': _img(mid), 'media_kind': 'foto', 'title': 'Recorte del error del ítem, no ampolleta suelta'}, 'Frame del error en cada pregunta incorrecta', 'foto')
    return rows


def enrich(content, module_id=1):
    """Idempotente: agrega motor pedagógico sin borrar textos curriculares."""
    if not isinstance(content, dict) or not content.get('aes'):
        return content
    c = content
    draft = str(c.get('version', '')).endswith('-mineduc-draft-v1')
    mid = int(module_id or 1)
    custom = c.get('specialty_source') if isinstance(c.get('specialty_source'), dict) else None
    if custom:
        c['official_source'] = {
            'pdf': custom.get('pdf'), 'decreto': custom.get('decree'),
            'scope': custom.get('scope'), 'time_factor': TIME_FACTOR,
            'official_hp': custom.get('official_hp'), 'title': custom.get('title'),
            'oa': custom.get('oa') or [],
        }
        plan = _load(custom.get('official_hp') or 190, custom.get('course_hp') or custom.get('official_hp') or 190)
        plan['title'] = custom.get('title')
    else:
        apply_official(c, mid)
        plan = module_plan(mid) or _load(OFFICIAL_HP.get(mid, 190))
    c['planning'] = plan
    ae_steps = max(1, len(c.get('aes') or [])) * 6
    plan['station_minutes']['2_etapa'] = max(1, round(plan['station_minutes']['2'] / ae_steps))
    c['pass_percent'] = PASS_PERCENT
    c['hp_minutes'] = HP_MINUTES
    c['time_factor'] = TIME_FACTOR
    c['explore'] = _explore(mid, c.get('context', ''))
    if custom:
        key = c.get('specialty_key') or 'general'
        c['explore'].update({
            'shift': c.get('context'),
            'image': f'/static/headers/{key}/e1.png?v=3',
            'caption': f'Escenario profesional simulado de {custom.get("title")}.',
            'alt': f'Contexto formativo de {custom.get("title")}; la imagen no contiene la respuesta.',
            'video': None, 'vtt': None,
        })
    c['explore']['formative_pack'] = [a for a in c.get('formative_pack') or [] if a.get('station') != 3]
    c['explore']['video'] = c.get('video')
    c['explore']['vtt'] = c.get('vtt')
    media_key = c.get('specialty_key') or 'general'
    primary_ae = (c.get('aes') or [{}])[0]
    primary_criterion = (primary_ae.get('criteria') or ['Reconocer y aplicar el procedimiento técnico']) [0]
    media_root = f'/static/headers/{media_key}'
    c['media_resources'] = [
        {'kind': '3d', 'image': f'{media_root}/e2.png?v=3', 'title': 'Identifica componentes y relaciones',
         'oa': (primary_ae.get('oa') or primary_ae.get('oa_code') or 'OA del módulo'), 'ae': primary_ae.get('title', ''),
         'content': primary_criterion, 'activity': 'Observa e identifica antes de avanzar.',
         'purpose': 'Distinguir partes, señales y condiciones relevantes del procedimiento.',
         'observe': 'Qué componente interviene, qué función cumple y qué evidencia lo demuestra.'},
        {'kind': '3d', 'image': f'{media_root}/e3.png?v=3', 'title': 'Analiza una situación de trabajo',
         'oa': (primary_ae.get('oa') or primary_ae.get('oa_code') or 'OA del módulo'), 'ae': primary_ae.get('title', ''),
         'content': primary_criterion, 'activity': 'Relaciona la representación con el caso y decide.',
         'purpose': 'Comparar una condición segura con una decisión técnicamente fundada.',
         'observe': 'Qué dato cambia la decisión y qué riesgo o consecuencia debes prevenir.'},
        {'kind': '3d', 'image': f'{media_root}/e4.png?v=3', 'title': 'Verifica la aplicación',
         'oa': (primary_ae.get('oa') or primary_ae.get('oa_code') or 'OA del módulo'), 'ae': primary_ae.get('title', ''),
         'content': primary_criterion, 'activity': 'Aplica el criterio y comprueba tu respuesta.',
         'purpose': 'Verificar el resultado del procedimiento usando evidencia observable.',
         'observe': 'Qué indicador confirma que la aplicación es correcta y qué debes corregir.'},
    ]
    if c.get('video'):
        c['media_resources'][0]['video'] = c.get('video')
        c['media_resources'][0]['vtt'] = c.get('vtt')
    c['development_pack'] = development_pack(mid, c.get('development', ''))
    question_counts = {1: 5, 2: 5, 3: 7, 4: 8}
    question_count = int(custom.get('question_count') or question_counts.get(mid, 5)) if custom else question_counts.get(mid, 5)
    development_required = bool(custom.get('development_required', mid == 4)) if custom else mid == 4
    c['evaluation_plan'] = {
        'question_count': question_count,
        'development_required': development_required,
        'minutes': round(plan['exam_minutes']),
        'course_question_total': int(custom.get('course_question_total') or sum(question_counts.values())) if custom else sum(question_counts.values()),
        'course_evaluation_hp': EXAM_HP,
        'note': custom.get('evaluation_note') if custom else 'Los 25 ítems se distribuyen 5, 5, 7 y 8. El desarrollo integrador se realiza en el módulo 4.',
    }
    c['encargos'] = c.get('encargos') if custom and c.get('encargos') else encargos_for(mid)
    curriculum_url = (c.get('curriculum') or {}).get('url') or (custom or {}).get('url') or ''
    curriculum_url = curriculum_url if curriculum_url.startswith('https://www.curriculumnacional.cl/') else ''
    for i, ae in enumerate(c.get('aes', [])):
        if not ae.get('experiences') or len(ae.get('experiences', [])) != 6:
            ae['experiences'] = _x5(mid, i, ae)
        for si, exp in enumerate(ae.get('experiences') or []):
            exp.setdefault('title', ae.get('title', ''))
            apply_oficio_media(exp, mid, i * 6 + si, force=True)
            if exp.get('type') == 'hotspot':
                exp['media_kind'] = '3d'
            if si == 2:
                exp['video'] = c.get('video')
                exp['vtt'] = c.get('vtt')
            if exp.get('type') == 'choice':
                ensure_mcq_fields(exp, i * 6 + si, mid, 'choice')
                exp.setdefault('question', exp.get('prompt'))
            crits = ae.get('criteria') or []
            if crits:
                exp['criterion'] = crits[si % len(crits)]
            if plan:
                exp['minutes'] = plan['station_minutes']['2_etapa']
    for i, case in enumerate(c.get('cases', [])):
        extra = _case_extra(i, mid, case)
        for k, v in extra.items():
            if k in ('image', 'caption', 'alt', 'media_kind', 'media_key'):
                case[k] = v
            else:
                case.setdefault(k, v)
        ensure_mcq_fields(case, i, mid, 'case')
        ae_count = max(1, len(c.get('aes') or []))
        ae_i = case.get('ae', i % ae_count)
        crits = (c['aes'][ae_i].get('criteria') if ae_i < len(c.get('aes') or []) else []) or []
        if crits:
            case['criterion'] = crits[i % len(crits)]
        if curriculum_url:
            case.setdefault('source_url', curriculum_url)
            case.setdefault('source_claim', case.get('criterion') or c.get('official_source', {}).get('title'))
            case.setdefault('source_scope', 'Respalda el aprendizaje curricular; los datos y decisiones del caso son una simulación didáctica.')
        if c.get('specialty_key') == 'electricidad':
            case.setdefault('regulatory_url', 'https://www.sec.cl/reglamento-de-seguridad-de-las-instalaciones-de-consumo-de-energia-electrica-decreto-08/')
        kinds = ['observe', 'read', 'cube', 'error', 'before', 'argue', 'pair', 'procedure', 'context',
                 'log', 'walk3d', 'video', 'error', 'cube', 'before']
        case['activity_kind'] = kinds[i % len(kinds)]
        if i in (2, 8):
            case['video'] = c.get('video')
            case['vtt'] = c.get('vtt')
    if custom:
        c['scene'] = c.get('scene') or {}
        c['scene'].setdefault('media_kind', 'interactive-procedure')
    else:
        c['scene'] = _default_scene(mid, c)
    for i, q in enumerate(c.get('questions', [])):
        _fourth_option(q)
        meta = _exam_meta(i)
        for k, v in meta.items():
            q.setdefault(k, v)
        _visual_stem(q, i, mid)
        q.setdefault('id', i)
        ensure_mcq_fields(q, i, mid, 'question')
        ae_count = max(1, len(c.get('aes') or []))
        ae_i = q.get('ae', i % ae_count)
        crits = (c['aes'][ae_i].get('criteria') if ae_i < len(c.get('aes') or []) else []) or []
        if crits:
            q['criterion'] = crits[i % len(crits)]
            q['formative_footprint'] = True
        if curriculum_url:
            q.setdefault('source_url', curriculum_url)
            q.setdefault('source_claim', q.get('criterion') or c.get('official_source', {}).get('title'))
            q.setdefault('source_scope', 'Respalda el aprendizaje curricular; los datos y decisiones del ítem son una simulación didáctica.')
        if c.get('specialty_key') == 'electricidad':
            q.setdefault('regulatory_url', 'https://www.sec.cl/reglamento-de-seguridad-de-las-instalaciones-de-consumo-de-energia-electrica-decreto-08/')
    c['development_kind'] = 'desarrollo'
    if custom:
        key = c.get('specialty_key') or 'general'
        case_image = f'/static/headers/{key}/e3.png?v=3'
        question_image = f'/static/headers/{key}/e4.png?v=3'
        for item in c.get('cases') or []:
            item['image'] = case_image
            item['caption'] = 'Escenario profesional simulado; la ejecución real requiere protocolos y supervisión.'
            item['alt'] = f'Evidencia contextual de {custom.get("title")}; no revela la respuesta.'
        for item in c.get('questions') or []:
            item['image'] = question_image
            item['caption'] = 'Evidencia de evaluación en contexto simulado.'
            item['alt'] = f'Evidencia neutral de {custom.get("title")}; no anticipa la alternativa correcta.'
        for ai, ae_item in enumerate(c.get('aes') or []):
            for exp in ae_item.get('experiences') or []:
                exp['image'] = f'/static/headers/{key}/e2.png?v=3'
                exp['caption'] = f'Recurso formativo del AE {ai + 1} de {custom.get("title")}.'
                exp['alt'] = 'Recurso contextual para observar y argumentar; no contiene la solución.'
    apply_instructional_quality(c, mid)
    c['traceability'] = build_traceability(c, c.get('specialty') or 'Refrigeración y climatización')
    if draft:
        media_items = [c.get('explore') or {}, c.get('scene') or {}, c]
        media_items.extend(c.get('cases') or [])
        media_items.extend(c.get('questions') or [])
        media_items.extend(e for ae in c.get('aes') or [] for e in ae.get('experiences') or [])
        media_items.extend(row.get('task') or {} for row in c.get('formative_pack') or [])
        for item in media_items:
            for field in ('image', 'video', 'vtt'):
                if item.get(field) and not verified_static_asset(item[field]):
                    item[field] = None
        c['media_resources'] = [item for item in c.get('media_resources') or []
                                if verified_static_asset(item.get('image'))]
    if not c.get('agent_hints'):
        c['agent_hints'] = [
            'Empieza por lo que observas. Separa datos, documentos y suposiciones.',
            '¿Qué aprendizaje esperado te ayuda a interpretar este caso?',
            '¿Qué evidencia te permitiría verificar tu conclusión?',
        ]
    c['pedagogy_version'] = 'mineduc-3medio-x5-1'
    c['media_audit'] = [] if draft else media_audit(c, mid)
    return _scrub_inventes(c)


def _scrub_inventes(value):
    if isinstance(value, str):
        for old, new in (
            ('No inventes. ', ''),
            (' No inventes.', ''),
            ('No inventes.', ''),
            ('no inventes.', ''),
            ('No inventes piezas.', ''),
            ('sin inventar datos', 'con datos del documento'),
            ('sin inventar información', 'usando solo la información disponible'),
            ('sin inventar una tolerancia', 'y qué dato pedirías'),
            ('sin inventar la escala', ': falta verificar la escala de la copia'),
            ('en vez de inventar su contenido', 'con lo que observaste'),
            ('decidir sin inventar', 'decidir'),
            ('Si inventas la función', 'Si asignas una función solo por el color'),
            ('No completes un dato inventándolo. ', ''),
            ('No inventes cotas, materiales ni procedimientos de instalación. Declara lo que falta.',
             'Trabaja con las cotas, materiales y procedimientos que figuran en el dossier. Declara lo que falta.'),
        ):
            value = value.replace(old, new)
        return value
    if isinstance(value, list):
        return [_scrub_inventes(v) for v in value]
    if isinstance(value, dict):
        return {k: _scrub_inventes(v) for k, v in value.items()}
    return value
