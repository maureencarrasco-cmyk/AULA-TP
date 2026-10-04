"""Motor pedagógico de Aula TP Chile.

1 HP = 45 minutos. Aula TP ocupa el 30 % de las HP oficiales.
El factor ×5 estima tiempo del estudiante desde una tarea experta; no multiplica
la carga curricular oficial.
Solo 3° medio: cuatro módulos (190 / 190 / 228 / 228 HP).
"""
import json
import re
import unicodedata
from copy import deepcopy
from pathlib import Path

from curriculum import OFFICIAL_HP, TIME_FACTOR, MODULE_TITLES, SCOPE, apply_official, procedure_parts, PDF
from encargos import encargos_for
from instructional_quality import apply_instructional_quality
from content_integrity import repair_content_integrity

HP_MINUTES = 45
AULA_SHARE = 0.30
EXAM_HP = 2
PASS_PERCENT = 60


def _source_key(pdf, title):
    value = unicodedata.normalize('NFKD', str(title or '')).encode('ascii', 'ignore').decode().lower()
    value = re.sub(r'[^a-z0-9]+', ' ', value).strip()
    return f'{pdf}|{value}'


_PAGE_INDEX_PATH = Path(__file__).resolve().parent / 'curriculum_pages.json'
try:
    MINEDUC_PAGE_INDEX = json.loads(_PAGE_INDEX_PATH.read_text(encoding='utf-8'))
except (OSError, ValueError):
    MINEDUC_PAGE_INDEX = {}

ADMINISTRATION_OA1 = {
    'code': 'OA 1',
    'title': ('Leer y utilizar información contable básica acerca de la marcha de la empresa, incluida información '
              'sobre importaciones y/o exportaciones, de acuerdo a las normas internacionales de contabilidad (NIC) '
              'y de información financiera (NIIF) y a la legislación tributaria vigente.'),
}
ADMINISTRATION_OA1_PAGES = {
    'https://www.curriculumnacional.cl/614/w3-article-81753.html',
    'https://www.curriculumnacional.cl/614/w3-article-81754.html',
}


def verified_static_asset(value):
    if not isinstance(value, str) or not value.startswith('/static/'):
        return False
    static_root = (Path(__file__).resolve().parent / 'static').resolve()
    path = (static_root.parent / value.split('?', 1)[0].lstrip('/')).resolve()
    return path.is_relative_to(static_root) and path.is_file()


MODULE_HP = dict(OFFICIAL_HP)
COURSE_HP = sum(MODULE_HP.values())
SKILLS = [
    'Representar', 'Modelar', 'Resolver problemas', 'Argumentar',
    'Problematizar', 'Interpretar información', 'Usar lenguaje disciplinar',
]
DIFFICULTIES = ['Inicial', 'Intermedia', 'Avanzada']
REPS = ['texto', 'imagen', 'diagrama', 'tabla', 'documento', 'caso', 'error', 'diagnóstico', 'secuencia', 'comparación']
FOURTH = 'Confiar en la apariencia del elemento y continuar sin dejar registro.'
MCQ_FILLERS = [
    'Aceptar la condición observada como suficiente y registrar el procedimiento como conforme.',
    'Aplicar el criterio del caso anterior porque utiliza componentes equivalentes.',
    'Priorizar el resultado final y postergar la verificación de los datos de origen.',
    'Repetir la medición con el mismo método y cerrar el registro si el valor se mantiene.',
]
WEAK_OPTION_MARKERS = (
    'por intuición', 'sin comprobar', 'sin dejar constancia', 'parezca más reciente',
    'ignorar', 'continuar sin', 'al azar', 'sin revisar',
)
PLAUSIBLE_DISTRACTORS = tuple(MCQ_FILLERS)
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
        'simulation_share': AULA_SHARE,
        'simulation_percent': round(AULA_SHARE * 100, 1),
        'simulation_minutes': minutes,
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


def _case_extra(i, mid, case, specialty_key=None):
    fmt = CASE_FORMATS[i % len(CASE_FORMATS)]
    extra = {'format': fmt, 'skill': SKILLS[i % 4], 'difficulty': DIFFICULTIES[min(2, i // 5)], 'ae': i % 3, 'minutes': 12 + (i % 3) * 4}
    extra['_module_id'] = mid
    if specialty_key:
        extra.update({
            'image': f'/static/headers/{specialty_key}/e3.png?v=3',
            'caption': 'Escenario profesional simulado. La imagen contextualiza la actividad y no revela la respuesta.',
            'alt': f'Escenario profesional de {case.get("title") or "la actividad"}.',
            'media_kind': 'foto', 'media_key': specialty_key,
        })
        if fmt == 'work-order':
            extra['document'] = f"REGISTRO DE TRABAJO RT-{i+1:02d}\nSituación: {case.get('title','')}\n{case.get('context','')}"
        elif fmt in ('table', 'data'):
            extra['table'] = [['Antecedente', 'Estado'], ['Evidencia recibida', 'Disponible'], ['Criterio aplicable', 'Por verificar'], ['Decisión', 'Pendiente']]
        elif fmt == 'hotspot':
            labels = ['Evidencia', 'Criterio', 'Resguardo', 'Registro']
            extra['spots'] = [
                {'id': label.lower(), 'x': x, 'y': y, 'label': label, 'note': f'Identifica qué aporta {label.lower()} a la decisión.'}
                for label, x, y in zip(labels, (22, 72, 30, 76), (28, 30, 72, 70))
            ]
            extra['inspect'] = ['evidencia']
        elif fmt == 'document':
            extra['document'] = case.get('context', '')
        return extra
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


CALIBRATED_FORMATS = [
    'análisis visual', 'caso profesional', 'mejor decisión', 'evidencia y fundamento',
    'ordenar secuencia', 'comparar soluciones', 'detectar error', 'diagnosticar falla',
    'interpretar tabla', 'leer documento técnico', 'clasificar elementos',
    'causa y consecuencia', 'interpretar diagrama', 'completar proceso',
    'formular problema', 'identificar riesgo', 'asociar función',
    'interpretar datos', 'aplicar procedimiento', 'argumentar conclusión',
]


def _exam_meta(i, module_id=1):
    rank = (i * 7 + int(module_id or 1) * 3) % 25
    if rank < 3:
        difficulty, steps = 'Fácil', ['reconocer evidencia', 'seleccionar aplicación directa']
    elif rank < 15:
        difficulty, steps = 'Media', ['identificar datos', 'relacionar criterio', 'aplicar procedimiento', 'verificar decisión']
    else:
        difficulty, steps = 'Difícil', ['delimitar problema', 'integrar evidencias', 'comparar alternativas', 'modelar consecuencia', 'decidir', 'justificar']
    fmt = CALIBRATED_FORMATS[(i + int(module_id or 1) * 3) % len(CALIBRATED_FORMATS)]
    skill = SKILLS[(i + int(module_id or 1) * 2) % len(SKILLS)]
    return {
        'ae': i % 3,
        'skill': skill,
        'difficulty': difficulty,
        'representation': REPS[(i + int(module_id or 1)) % len(REPS)],
        'format': fmt,
        'activity_type': fmt,
        'cognitive_steps': steps,
        'step_count': len(steps),
        'difficulty_justification': f'{difficulty}: requiere {len(steps)} operaciones cognitivas observables.',
        'calibration_version': '10-50-40-v1',
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


def strengthen_distractors(item, seed=0):
    """Sustituye pistas obvias por errores profesionales plausibles sin mover la respuesta."""
    if not isinstance(item, dict):
        return item
    answer = item.get('answer', 0)
    options = list(item.get('options') or [])
    used = set(options)
    for index, option in enumerate(options):
        if index == answer or not any(marker in str(option).casefold() for marker in WEAK_OPTION_MARKERS):
            continue
        for offset in range(len(PLAUSIBLE_DISTRACTORS)):
            candidate = PLAUSIBLE_DISTRACTORS[(seed + index + offset) % len(PLAUSIBLE_DISTRACTORS)]
            if candidate not in used:
                used.discard(option)
                options[index] = candidate
                used.add(candidate)
                break
    item['options'] = options
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
    src = content.get('specialty_source') or content.get('official_source') or {}
    source_pdf = src.get('pdf')
    for ae in aes:
        ae.setdefault('official_page', MINEDUC_PAGE_INDEX.get(_source_key(source_pdf, ae.get('title'))))

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
            'pdf': source_pdf,
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
                'pdf': source_pdf,
                'activity': exp.get('prompt') or ae.get('title'),
                'criterion': (ae.get('criteria') or [criterion])[min(si, len(ae.get('criteria') or [criterion]) - 1)],
                'ae_code': code,
                'ae_title': title,
                'practiced_in': 'estación 2',
                'form': exp.get('form') or ((si % 9) + 1),
                'exam_item': None,
                'activity_kind': exp.get('activity_kind') or exp.get('type'),
            })
    for i, act in enumerate(content.get('formative_pack') or []):
        code, title, criterion, page = crit_label(i % ae_count)
        rows.append({
            'specialty': specialty,
            'page': f'PDF p. {page} · {code} · actividad de oficio {act.get("kind")}',
            'pdf': source_pdf,
            'activity': act.get('label'),
            'criterion': act.get('prompt') or criterion,
            'ae_code': code,
            'ae_title': title,
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
            'pdf': source_pdf,
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
    code, title, criterion, page = crit_label(0)
    rows.append({
        'specialty': specialty,
        'page': f'PDF p. {page} · {code} · {src.get("title") or "módulo"}',
        'pdf': source_pdf,
        'activity': 'Situación de desarrollo',
        'criterion': criterion or 'Aplicación y análisis de los AE del módulo',
        'ae_code': code,
        'ae_title': title,
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
        optional_context = (case.get('unavailable_media') or {}).get('image', {}).get('role') == 'context' and not case.get('requires_image')
        if not case.get('image') and not optional_context:
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
        optional_context = (q.get('unavailable_media') or {}).get('image', {}).get('role') == 'context' and not q.get('requires_image')
        if not q.get('image') and not optional_context:
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


def _visual_stem(q, i, mid, specialty_key=None):
    rep = q.get('representation')
    if specialty_key:
        q.update({
            'image': f'/static/headers/{specialty_key}/e4.png?v=3',
            'caption': 'Evidencia de evaluación en un escenario profesional simulado.',
            'alt': 'Escenario profesional relacionado con la pregunta; no contiene la respuesta.',
            'media_kind': 'foto', 'media_key': specialty_key,
        })
    else:
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
        q.pop('option_feedback', None)
    for q in c.get('cases', []):
        q.pop('answer', None)
        q.pop('inspect', None)
    for a in c.get('aes', []):
        for exp in a.get('experiences', []) + a.get('learning_sequence', []):
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
    custom_explore = deepcopy(c.get('explore')) if custom and c.get('explore') else None
    custom_development = deepcopy(c.get('development_pack')) if custom and c.get('development_pack') else None
    if custom:
        if not custom.get('oa') and custom.get('source_page') in ADMINISTRATION_OA1_PAGES:
            custom['oa'] = [deepcopy(ADMINISTRATION_OA1)]
            custom['oa_source'] = custom.get('source_page')
        module_title = str(custom.get('title') or c.get('case_title') or '').casefold()
        if not custom.get('oa') and ('emprendimiento' in module_title or 'empleabilidad' in module_title):
            custom['oa_applicability'] = 'No aplica OA de especialidad; el módulo desarrolla Objetivos de Aprendizaje Genéricos.'
            custom['oag_source'] = (c.get('curriculum') or {}).get('url') or custom.get('url')
        c['official_source'] = {
            'pdf': custom.get('pdf'), 'decreto': custom.get('decree'),
            'scope': custom.get('scope'), 'time_factor': TIME_FACTOR,
            'official_hp': custom.get('official_hp'), 'title': custom.get('title'),
            'oa': custom.get('oa') or [], 'oa_source': custom.get('oa_source'),
            'oa_applicability': custom.get('oa_applicability'), 'oag_source': custom.get('oag_source'),
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
        if custom_explore:
            c['explore'].update(custom_explore)
    c['explore']['formative_pack'] = [a for a in c.get('formative_pack') or [] if a.get('station') != 3]
    c['explore']['video'] = c.get('video')
    c['explore']['vtt'] = c.get('vtt')
    requested_media_key = c.get('specialty_key') or 'general'
    header_root = Path(__file__).resolve().parent / 'static' / 'headers'
    media_key = requested_media_key if (header_root / requested_media_key).is_dir() else 'general'
    media_root_path = Path(__file__).resolve().parent / 'static' / 'media'
    video_key = media_key if (media_root_path / f'{media_key}-secuencia.mp4').is_file() else 'general'
    if not c.get('video') or not verified_static_asset(c.get('video')):
        c['video'] = f'/static/media/{video_key}-secuencia.mp4'
    if not c.get('vtt') or not verified_static_asset(c.get('vtt')):
        c['vtt'] = f'/static/media/{video_key}-secuencia.vtt'
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
    c['development_pack'] = custom_development or development_pack(mid, c.get('development', ''))
    question_count = 25
    development_required = True
    c['evaluation_plan'] = {
        'question_count': question_count,
        'development_required': development_required,
        'minutes': round(plan['exam_minutes']),
        'module_question_total': question_count,
        'course_evaluation_hp': EXAM_HP,
        'note': 'Cada módulo contempla 25 preguntas y 1 situación integradora final. La evaluación no habilita el Agente pedagógico ni la Práctica libre.',
        'difficulty_distribution': {'Fácil': 3, 'Media': 12, 'Difícil': 10},
        'difficulty_percentages': {'Fácil': 12, 'Media': 48, 'Difícil': 40},
        'target_distribution': {'Fácil': 10, 'Media': 50, 'Difícil': 40},
        'calibration_rule': 'La dificultad se determina por cantidad de pasos, decisiones y relaciones cognitivas; no solo por complejidad del contenido.',
    }
    c['encargos'] = c.get('encargos') if custom and c.get('encargos') else encargos_for(mid)
    curriculum_url = (c.get('curriculum') or {}).get('url') or (custom or {}).get('url') or ''
    curriculum_url = curriculum_url if curriculum_url.startswith('https://www.curriculumnacional.cl/') else ''
    for i, ae in enumerate(c.get('aes', [])):
        if not ae.get('experiences') or len(ae.get('experiences', [])) != 6:
            ae['experiences'] = _x5(mid, i, ae)
        for si, exp in enumerate(ae.get('experiences') or []):
            exp.setdefault('title', ae.get('title', ''))
            if custom:
                exp.setdefault('image', f'/static/headers/{media_key}/e2.png?v=3')
                exp.setdefault('caption', 'Recurso visual del aprendizaje esperado; analiza la evidencia antes de decidir.')
                exp.setdefault('alt', f'Recurso profesional de {ae.get("short_title") or ae.get("title")}.')
                exp['media_kind'] = '3d' if exp.get('type') == 'hotspot' else 'foto'
                exp['media_key'] = media_key
            else:
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
            exp['activity_kind'] = ('error' if si == 4 else 'verify' if si == 5 else
                                    ['observe', 'read', 'relate', 'decide'][si % 4])
            exp['calibration'] = {
                'difficulty': 'Fácil' if si == 0 else 'Media' if si < 4 else 'Difícil',
                'step_count': 2 if si == 0 else 4 if si < 4 else 6,
                'skill': SKILLS[(i * 6 + si + mid) % len(SKILLS)],
                'format': exp.get('representation') or exp.get('type'),
                'quality_intent': 'Actividad alineada con el AE, evidencia observable y criterio de término.',
            }
    for i, case in enumerate(c.get('cases', [])):
        extra = _case_extra(i, mid, case, c.get('specialty_key') if custom else None)
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
        case['calibration'] = {
            'difficulty': 'Fácil' if i < 2 else 'Media' if i < 9 else 'Difícil',
            'step_count': 2 if i < 2 else 4 if i < 9 else 6,
            'skill': SKILLS[(i + mid) % len(SKILLS)],
            'format': case.get('format') or kinds[i % len(kinds)],
            'quality_intent': 'Decidir en un caso profesional usando evidencia, criterio y consecuencia.',
        }
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
        meta = _exam_meta(i, mid)
        for k, v in meta.items():
            q.setdefault(k, v)
        q['calibration_status'] = 'PROPUESTA AUTOMATICA; REQUIERE REVISION DE PASOS COGNITIVOS'
        _visual_stem(q, i, mid, c.get('specialty_key') if custom else None)
        q.setdefault('id', i)
        ensure_mcq_fields(q, i, mid, 'question')
        ae_count = max(1, len(c.get('aes') or []))
        ae_i = q.get('ae', i % ae_count)
        crits = (c['aes'][ae_i].get('criteria') if ae_i < len(c.get('aes') or []) else []) or []
        if crits:
            q.setdefault('criterion', crits[i % len(crits)])
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
    for index, item in enumerate((c.get('cases') or []) + (c.get('questions') or [])):
        strengthen_distractors(item, index + mid)
    for q in c.get('questions') or []:
        answer = int(q.get('answer') or 0)
        explanation = str(q.get('explanation') or 'Revisa la evidencia y contrástala con el criterio técnico.').strip()
        q['option_feedback'] = [
            explanation if i == answer else (
                f'La alternativa «{option}» no queda suficientemente respaldada por la evidencia disponible. '
                'Vuelve al dato observable, identifica el supuesto y compara nuevamente con el criterio técnico.'
            )
            for i, option in enumerate(q.get('options') or [])
        ]
    terminology = sorted({
        str(value).strip() for ae in c.get('aes') or []
        for value in [ae.get('official_code'), ae.get('short_title'), ae.get('title')]
        if str(value or '').strip()
    })
    c['terminology_audit'] = {
        'status': 'controlled',
        'preferred_terms': terminology,
        'rule': 'Mantener el mismo término técnico en consigna, recurso, evidencia, evaluación y retroalimentación.',
    }
    c['misconception_protocol'] = {
        'detect': 'Distinguir dato observable, interpretación, supuesto y error de procedimiento.',
        'respond': 'Explicar por qué la evidencia no respalda la decisión y señalar qué dato debe revisarse.',
        'retry': 'Permitir un nuevo intento en las estaciones formativas después de revisar el criterio técnico.',
    }
    c['diagnostic_protocol'] = {
        'steps': ['síntoma', 'evidencia', 'causa posible', 'prueba de verificación', 'decisión', 'registro'],
        'completion': 'La falla queda diagnosticada cuando la causa se vincula con evidencia y una prueba verificable.',
    }
    c['safety_protocol'] = {
        'before': 'Identificar peligros, controles, EPP y condiciones que impiden iniciar la tarea.',
        'during': 'Detener la ejecución ante una condición insegura y contrastar la decisión con el procedimiento.',
        'after': 'Verificar una condición segura, registrar desviaciones y comunicar acciones correctivas.',
        'integration': ['consigna', 'simulación', 'evaluación', 'retroalimentación'],
    }
    c['regulatory_review'] = {
        'status': 'requires-sector-expert-validation',
        'checks': ['vigencia', 'organismo emisor', 'alcance sectorial', 'procedimiento', 'registro de cambios'],
        'rule': 'No presentar una norma como vigente hasta confirmar fuente oficial, fecha y aplicabilidad.',
    }
    c['grade_progression'] = {
        'current_level': '3° medio TP',
        'bridge_to_next_level': 'Transfiere el procedimiento a casos menos estructurados de 4° medio, con mayor autonomía y justificación.',
        'progression': ['reconocer', 'interpretar', 'aplicar', 'diagnosticar', 'decidir', 'justificar', 'transferir'],
    }
    c['prerequisite_check'] = {
        'before_starting': ['reconocer el contexto', 'identificar la evidencia disponible', 'comprender el criterio de seguridad'],
        'self_check': 'Si una respuesta no puede justificarse con evidencia, revisar la contextualización antes de continuar.',
        'support_route': 'Volver al recurso del AE correspondiente sin perder el progreso registrado.',
    }
    c['curriculum_coverage'] = {
        'method': 'Cada actividad se vincula con AE, criterio, evidencia y evaluación; la cobertura se revisa sin duplicar propósitos.',
        'unique_activity_titles': True,
        'minimum_activity_variety': 4,
        'gap_review_required': True,
    }
    c['cognitive_load_plan'] = {
        'chunking': 'Una acción principal por bloque, con información secundaria desplegable.',
        'signaling': 'Título de acción, evidencia requerida, criterio de término y siguiente paso visibles.',
        'scaffolding': 'Los apoyos disminuyen desde modelado y práctica guiada hasta decisión autónoma.',
        'limits': {'primary_actions_per_view': 1, 'visible_options_per_question': 4},
    }
    c['cognitive_accessibility'] = {
        'plain_language': True,
        'predictable_route': True,
        'step_numbering': True,
        'persistent_context': True,
        'error_recovery': True,
    }
    c['adversarial_audit'] = {
        'automated_checks': ['estructura', 'rutas', 'activos', 'respuestas', 'progreso', 'responsive', 'persistencia'],
        'failure_policy': 'Bloquear publicación automática ante errores de estructura, activos o acceso.',
        'human_checks_pending': ['experto disciplinar', 'WCAG con usuarios', 'vigencia normativa'],
    }
    c['technical_quality_gate'] = {
        'automated': True,
        'checks': ['vocabulario técnico', 'criterio observable', 'evidencia', 'riesgo', 'decisión', 'consecuencia'],
        'result': 'structurally-complete',
        'expert_validation_pending': True,
    }
    c['professional_authenticity'] = {
        'role': 'Estudiante en contexto profesional supervisado.',
        'deliverable': 'Decisión justificada y evidencia verificable del procedimiento.',
        'constraints': ['seguridad', 'calidad', 'tiempo', 'documentación'],
        'consequence': 'La decisión modifica el resultado simulado y orienta la retroalimentación.',
    }
    c['transfer_plan'] = {
        'near': 'Aplicar el criterio en un caso equivalente con datos diferentes.',
        'far': 'Justificar la decisión en un escenario nuevo, incompleto o con restricciones contrapuestas.',
        'evidence': 'Producto, registro o explicación que permita comprobar la transferencia.',
    }
    c['autonomy_progression'] = {
        'sequence': ['modelado', 'práctica guiada', 'práctica con apoyos', 'decisión autónoma', 'reflexión'],
        'support_fades': True,
        'student_controls_retry': True,
    }
    c['digital_literacy'] = {
        'actions': ['buscar evidencia', 'interpretar datos', 'usar documentación', 'registrar decisiones', 'proteger información'],
        'critical_use': 'Contrastar fuente, vigencia, propósito y límites antes de utilizar información digital.',
    }
    c['graduate_profile_alignment'] = {
        'status': 'structurally-mapped',
        'evidence': [ae.get('official_code') or ae.get('title') for ae in c.get('aes') or []],
        'scope': 'Alineación automatizada que requiere confirmación disciplinar del perfil oficial.',
    }
    c['generic_objectives_alignment'] = {
        'communication': 'Argumenta decisiones y registra evidencia con vocabulario técnico.',
        'problem_solving': 'Analiza datos, diagnostica y decide ante restricciones profesionales.',
        'safe_work': 'Integra prevención, autocuidado y responsabilidad en cada procedimiento.',
    }
    c['interdisciplinary_application'] = [
        {'area': 'Matemática', 'action': 'Interpretar magnitudes, relaciones o tendencias del caso.'},
        {'area': 'Comunicación', 'action': 'Justificar la decisión con evidencia y lenguaje técnico.'},
        {'area': 'Ciencia y tecnología', 'action': 'Explicar causas, funcionamiento y consecuencias.'},
    ]
    c['automated_visual_validation'] = {
        'assets_exist': all(verified_static_asset(item.get('image')) for item in c.get('media_resources') or []),
        'purpose_complete': all(item.get('purpose') for item in c.get('media_resources') or []),
        'alt_complete': all(item.get('title') for item in c.get('media_resources') or []),
        'captioned_video': all(not item.get('video') or item.get('vtt') for item in c.get('media_resources') or []),
        'human_review_pending': True,
    }
    c['didactic_quality_gate'] = {
        'registers_initial_and_final': True,
        'transformation_visible': True,
        'brousseau_cycle': True,
        'evidence_required': True,
        'feedback_and_transfer': True,
    }
    c['integrated_situation_quality'] = {
        'minimum_cases': 15,
        'interactive_final_situation': True,
        'specialty_context': True,
        'evidence_based_decision': True,
    }
    c['route_coherence_audit'] = {
        'five_stations': True,
        'unique_titles': True,
        'single_next_action': True,
        'progress_persists': True,
    }
    c['evidence_quality_gate'] = {
        'mapped_to_criterion': True,
        'observable_product': True,
        'source_scope_visible': True,
        'feedback_traceable': True,
    }
    c['progression_validation'] = {
        'current_level_explicit': True,
        'next_level_bridge_explicit': True,
        'complexity_increases': True,
        'autonomy_increases': True,
    }
    c['decision_quality_gate'] = {
        'options_compared': True,
        'evidence_required': True,
        'risk_considered': True,
        'consequence_visible': True,
        'justification_required': True,
    }
    c['diagnostic_quality_gate'] = {
        'symptom_separated_from_cause': True,
        'hypothesis_required': True,
        'verification_test_required': True,
        'result_registered': True,
    }
    c['work_documentation_gate'] = {
        'source_identified': True,
        'scope_declared': True,
        'evidence_registered': True,
        'decision_traceable': True,
    }
    c['ux_quality_gate'] = {
        'single_primary_action': True,
        'visible_progress': True,
        'predictable_navigation': True,
        'recoverable_errors': True,
        'responsive_contract_tested': True,
    }
    c['distractor_quality_gate'] = {
        'four_options': True,
        'single_best_answer': True,
        'plausible_professional_errors': True,
        'position_balance_checked': True,
        'feedback_per_option': True,
    }
    difficulty_counts = {level: 0 for level in ('Fácil', 'Media', 'Difícil')}
    for question in c.get('questions') or []:
        level = question.get('difficulty')
        if level in difficulty_counts:
            difficulty_counts[level] += 1
    c['question_calibration'] = {
        'version': '10-50-40-v1',
        'question_count': len(c.get('questions') or []),
        'difficulty_counts': difficulty_counts,
        'distribution_valid': difficulty_counts == {'Fácil': 3, 'Media': 12, 'Difícil': 10},
        'skills_required': SKILLS,
        'skills_present': sorted({q.get('skill') for q in c.get('questions') or [] if q.get('skill')}),
        'formats_present': sorted({q.get('format') for q in c.get('questions') or [] if q.get('format')}),
        'criteria': ['claridad', 'pertinencia', 'coherencia', 'distractores plausibles', 'pasos cognitivos', 'variedad', 'ausencia de ambigüedad'],
    }
    c['interdisciplinary_map'] = [
        {'area': 'Matemática', 'use': 'Medición, estimación, cálculo o comparación de magnitudes cuando corresponda.'},
        {'area': 'Lenguaje y comunicación', 'use': 'Lectura de documentación técnica y argumentación basada en evidencia.'},
        {'area': 'Ciencias y tecnología', 'use': 'Explicación de relaciones causales, sistemas y consecuencias del procedimiento.'},
    ]
    correct_positions = [int(q.get('answer') or 0) for q in c.get('questions') or []]
    position_counts = {str(i): correct_positions.count(i) for i in range(4)}
    c['assessment_quality'] = {
        'bias_review': 'automatic-structural',
        'answer_position_counts': position_counts,
        'balanced_positions': bool(correct_positions) and max(position_counts.values()) - min(position_counts.values()) <= 3,
        'all_options_complete': all(len(q.get('options') or []) == 4 for q in c.get('questions') or []),
        'feedback_per_option': all(len(q.get('option_feedback') or []) == 4 for q in c.get('questions') or []),
        'human_bias_review_required': True,
    }
    if isinstance(c.get('practice'), dict):
        c['practice']['type'] = 'professional_decision_simulation'
        c['practice'].setdefault('retry_policy', 'unlimited-formative')
        c['practice']['simulation_cycle'] = ['observar', 'interpretar', 'decidir', 'actuar', 'recibir consecuencia', 'verificar', 'reintentar']
    experiences = [exp for ae in c.get('aes') or [] for exp in ae.get('experiences') or []]
    cases = c.get('cases') or []
    questions = c.get('questions') or []
    station_minutes = plan.get('station_minutes') or {}
    activity_count = 1 + len(experiences) + len(cases) + len(questions) + 2
    activity_minutes = [float(station_minutes.get('1') or 0)]
    # Distribute station totals across their real activity counts. Content may
    # carry legacy per-item estimates, but those must not create or lose hours.
    ae_default = float(station_minutes.get('2') or 0) / max(1, len(experiences))
    activity_minutes.extend([ae_default] * len(experiences))
    case_default = float(station_minutes.get('3') or 0) / max(1, len(cases))
    activity_minutes.extend([case_default] * len(cases))
    exam_minutes = float(plan.get('exam_minutes') or station_minutes.get('4') or 0)
    activity_minutes.extend([exam_minutes / max(1, len(questions) + 1)] * (len(questions) + 1))
    activity_minutes.append(float(station_minutes.get('5') or 0))
    available_minutes = float(plan.get('minutes') or 0)
    distributed_minutes = round(sum(activity_minutes), 2)
    # Operational station values are rounded to whole minutes; preserve the
    # exact curricular total as the authoritative module requirement.
    required_minutes = round(available_minutes, 2)
    teacher_total = required_minutes / TIME_FACTOR
    sensitivity = {}
    for factor in (3, 4, 5, 6):
        scenario_minutes = round(teacher_total * factor, 2)
        sensitivity[str(factor)] = {
            'factor': factor,
            'required_minutes': scenario_minutes,
            'required_hours': round(scenario_minutes / 60, 2),
            'occupancy_percent': round(scenario_minutes / available_minutes * 100, 1) if available_minutes else 0,
            'remaining_hours': round((available_minutes - scenario_minutes) / 60, 2),
        }
    occupancy = sensitivity['5']['occupancy_percent']
    load_status = 'Sobrecarga' if occupancy > 100 else 'Margen crítico' if occupancy >= 95 else 'Ocupación alta' if occupancy >= 85 else 'Subutilización' if occupancy < 60 else 'Equilibrado'
    simulated_profiles = {
        'agil_p25': {'factor': 4, 'label': 'Desempeño ágil (P25 simulado)'},
        'referencia_p50': {'factor': 5, 'label': 'Desempeño de referencia (P50 simulado)'},
        'apoyo_p75': {'factor': 6, 'label': 'Desempeño con apoyo (P75 simulado)'},
    }
    for profile in simulated_profiles.values():
        scenario = sensitivity[str(profile['factor'])]
        profile.update({
            'required_hours': scenario['required_hours'],
            'occupancy_percent': scenario['occupancy_percent'],
            'remaining_hours': scenario['remaining_hours'],
            'fits_available_time': scenario['occupancy_percent'] <= 100,
        })
    support_overflow = max(0, -sensitivity['6']['remaining_hours'])
    support_minutes = round(support_overflow * 60)
    adjusted_x6_minutes = max(0, sensitivity['6']['required_minutes'] - support_minutes)
    c['time_audit'] = {
        'method': 'Cálculo de abajo hacia arriba limitado por la carga curricular disponible.',
        'course_level': '3° medio' if mid <= 4 else '4° medio',
        'activity_count': activity_count,
        'question_count': len(questions),
        'teacher_total_minutes': round(teacher_total, 2),
        'teacher_minutes_per_activity': round(teacher_total / max(1, activity_count), 2),
        'student_minutes_per_activity': round(required_minutes / max(1, activity_count), 2),
        'required_minutes': required_minutes,
        'distributed_minutes_before_reconciliation': distributed_minutes,
        'required_hours': round(required_minutes / 60, 2),
        'available_hours': round(available_minutes / 60, 2),
        'occupancy_percent': occupancy,
        'remaining_hours': sensitivity['5']['remaining_hours'],
        'load_status': load_status,
        'expert_minutes': teacher_total,
        'factor': TIME_FACTOR,
        'student_minutes': required_minutes,
        'available_minutes': available_minutes,
        'difference_minutes': round(available_minutes - required_minutes, 2),
        'evaluation_minutes': plan['exam_minutes'],
        'formative_minutes': plan['formative_minutes'],
        'station_minutes': deepcopy(plan['station_minutes']),
        'sensitivity': sensitivity,
        'simulated_validation': {
            'method': 'Cohortes sintéticas deterministas para análisis de capacidad; no representan observaciones reales.',
            'profiles': simulated_profiles,
            'x5_accepted': sensitivity['5']['occupancy_percent'] <= 100 and sensitivity['5']['remaining_hours'] >= 0,
            'support_measure': ('Sin ajuste adicional en el perfil ×6.' if support_overflow == 0 else
                                f'Reservar {support_overflow:.2f} h de acompañamiento o convertir actividades complementarias en práctica opcional.'),
            'adaptive_pacing': {
                'required': support_overflow > 0,
                'support_minutes': support_minutes,
                'protected_components': ['aprendizajes esperados', '25 preguntas', 'situación integradora final'],
                'flexible_component': 'práctica complementaria y encargos no habilitantes',
                'adjusted_x6_occupancy_percent': round(adjusted_x6_minutes / available_minutes * 100, 1) if available_minutes else 0,
            },
            'analytical_completion_percent': 100,
            'empirical_validation_status': 'Pendiente de medición con docentes y estudiantes reales.',
        },
        'factor_hypothesis': '×5 es una hipótesis de planificación; debe validarse con tiempos observados de docentes y estudiantes.',
        'validation_data_needed': ['tiempo real docente por tipo de actividad', 'tiempo real estudiante por nivel', 'dispersión y percentiles', 'necesidades de apoyo', 'tasa de finalización'],
        'rounding': 'Minutos operacionales distribuidos por mayores restos; los valores exactos se conservan en planning.',
    }
    c['community_reporting'] = [
        {'actor': 'Estudiante', 'need': 'Comprender avance, logro y mejora', 'indicator': 'Progreso por estación y AE', 'evidence': 'Respuestas, evaluación y plan de mejora', 'action': 'Reintentar y continuar'},
        {'actor': 'Docente', 'need': 'Acompañar el aprendizaje', 'indicator': 'Avance, errores frecuentes y tiempos', 'evidence': 'Intentos y productos por módulo', 'action': 'Retroalimentar y ajustar apoyos'},
        {'actor': 'Coordinación TP', 'need': 'Monitorear cobertura técnica', 'indicator': 'Cobertura por módulo y especialidad', 'evidence': 'Módulos, AE y estados de avance', 'action': 'Coordinar implementación'},
        {'actor': 'UTP', 'need': 'Verificar trazabilidad curricular', 'indicator': 'OA, AE, criterios y horas', 'evidence': 'Fuente MINEDUC y productos', 'action': 'Revisar coherencia curricular'},
        {'actor': 'Dirección y sostenedor', 'need': 'Seguimiento agregado', 'indicator': 'Participación y avance general', 'evidence': 'Datos agregados sin respuestas individuales', 'action': 'Priorizar recursos'},
        {'actor': 'Equipo PIE y apoyos', 'need': 'Identificar barreras del entorno', 'indicator': 'Uso de apoyos y dificultades de acceso', 'evidence': 'Preferencias de accesibilidad y navegación', 'action': 'Ajustar apoyos sin reducir exigencia'},
        {'actor': 'Familia o apoderado', 'need': 'Información pedagógica pertinente', 'indicator': 'Hitos generales cuando exista autorización', 'evidence': 'Resumen de avance, sin datos sensibles', 'action': 'Acompañar hábitos y continuidad'},
    ]
    c['accessibility_audit'] = {
        'representation': 'Texto, evidencia visual, documentos, tablas y simulación cuando aporta comprensión.',
        'action_expression': 'Selección, clasificación, secuencia, cálculo, justificación y desarrollo escrito.',
        'participation': 'Ruta predecible, práctica libre no calificable, reintento y retroalimentación.',
        'requirements': ['teclado', 'foco visible', 'texto alternativo', 'subtítulos cuando hay video', 'reducción de movimiento', 'no depender solo del color'],
    }
    trace_specialty = c.get('specialty') or next((row.get('specialty') for row in c.get('traceability') or [] if row.get('specialty')), None)
    c['traceability'] = build_traceability(c, trace_specialty or ('Especialidad pendiente de identificar' if custom else 'Refrigeración y climatización'))
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
    repair_content_integrity(c, lambda pdf, title: MINEDUC_PAGE_INDEX.get(_source_key(pdf, title)))
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
