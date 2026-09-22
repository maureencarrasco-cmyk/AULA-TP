"""Cuarto medio de Refrigeración y Climatización según programa MINEDUC."""

from copy import deepcopy

from specialty_catalog import _ae, _module
from official_curricula import REFRIGERATION_FOURTH_MODULES as OFFICIAL_FOURTH_MODULES


SOURCE = 'docs/fuentes/MINEDUC_Refrigeracion_y_Climatizacion_programa.pdf'
SOURCE_URL = 'https://www.curriculumnacional.cl/614/articles-34318_programa.pdf'
SCOPE = (
    'Programa completo de Refrigeración y Climatización para 3° y 4° medio: '
    'nueve módulos y 1.672 HP oficiales. Cuarto medio aporta 836 HP.'
)


FOURTH_MODULES = [
    ('Puesta en marcha de equipos de refrigeración y climatización', 228, 'OA 6', 3, [
        _ae('M5-AE1', 'Prepara el espacio físico y el equipamiento para el correcto transporte del equipo requerido en la carga de fluidos, aplicando las medidas de seguridad y cuidado del medio ambiente establecidas en la Norma Chilena NCh3241 de Buenas Prácticas.', [
            'Aplica las medidas de seguridad necesarias para manipular fluidos de refrigeración y climatización.',
            'Chequea las condiciones del recinto para la correcta manipulación de los distintos fluidos.',
            'Transporta el equipo de carga aplicando las medidas de seguridad correspondientes.',
        ]),
        _ae('M5-AE2', 'Carga fluidos en equipos de refrigeración, aplicando las medidas de seguridad y cuidado del medio ambiente establecidas en la Norma Chilena NCh3241 de Buenas Prácticas.', [
            'Prepara el lugar de trabajo según especificaciones técnicas, normativa y seguridad.',
            'Carga fluidos de acuerdo con planos, especificaciones y procedimientos del fabricante.',
            'Verifica con el equipamiento necesario que los parámetros de carga sean seguros.',
        ]),
        _ae('M5-AE3', 'Pone en marcha sistemas de refrigeración, considerando las especificaciones del fabricante y la normativa técnica, ambiental y de seguridad.', [
            'Elabora el listado de materiales, equipos e instrumentos necesarios para la puesta en marcha.',
            'Pone en marcha equipos de acuerdo con especificaciones técnicas y normas de seguridad.',
            'Verifica con instrumentos que el sistema funcione de manera segura.',
        ]),
    ]),
    ('Diagnóstico en sistemas de refrigeración y climatización', 190, 'OA 7', 3, [
        _ae('M6-AE1', 'Inspecciona instalaciones y equipos de refrigeración, climatización, calefacción y ventilación, contrastando la información con manuales y especificaciones técnicas.', [
            'Revisa instalaciones y equipos para identificar situaciones anómalas observables y registrarlas.',
            'Verifica el funcionamiento mediante instrumentos y compara valores con las especificaciones del fabricante.',
            'Organiza la inspección asignando roles y conservando la trazabilidad de los datos.',
        ]),
        _ae('M6-AE2', 'Diagnostica posibles fallas mediante mediciones e inspección visual y propone soluciones de acuerdo con las especificaciones técnicas.', [
            'Conecta instrumentos para buscar fallas y compara valores con especificaciones técnicas.',
            'Analiza mediciones e inspecciones para diagnosticar posibles fallas.',
            'Propone soluciones y planifica acciones, tareas y roles a partir de los datos obtenidos.',
        ]),
        _ae('M6-AE3', 'Establece qué fallas o funcionamientos anómalos pueden corregirse en obra o en taller, de acuerdo con las especificaciones de los equipos y sistemas.', [
            'Lista y clasifica las fallas según gravedad, prioridad y tiempo de reparación.',
            'Determina si la corrección corresponde a obra o taller según las especificaciones técnicas.',
            'Elabora el listado de materiales y repuestos necesarios para las mantenciones.',
        ]),
    ]),
    ('Mantención de sistemas de refrigeración y climatización', 190, 'OA 8', 2, [
        _ae('M7-AE1', 'Realiza mantenimiento preventivo considerando las especificaciones del proyecto, las condiciones de obra y los manuales de funcionamiento del fabricante.', [
            'Lee las especificaciones del proyecto, las condiciones de obra y el manual de fabricación.',
            'Planifica acciones coordinadas y asigna responsabilidades dentro del equipo.',
            'Ejecuta el plan de mantenimiento preventivo según las indicaciones del fabricante.',
        ]),
        _ae('M7-AE2', 'Realiza mantenimiento correctivo considerando las especificaciones del proyecto, las condiciones de obra y los manuales de funcionamiento y fabricación.', [
            'Lista las posibles fallas para elaborar un plan de mantenimiento correctivo.',
            'Interpreta las recomendaciones de mantenimiento correctivo del fabricante.',
            'Realiza el mantenimiento correctivo coordinando acciones y verificando su resultado.',
        ]),
        _ae('M7-SÍNTESIS', 'Integra el mantenimiento preventivo y correctivo en un informe técnico trazable, como síntesis aplicada de los dos aprendizajes oficiales del módulo.', [
            'Distingue acciones preventivas de correctivas y las relaciona con la evidencia disponible.',
            'Registra mediciones, acciones, repuestos, responsables y pendientes.',
            'Comprueba el cierre conforme al plan y a las especificaciones del fabricante.',
        ]),
    ]),
    ('Reciclaje y almacenamiento de refrigerantes', 152, 'OA 9', 3, [
        _ae('M8-AE1', 'Recupera refrigerantes en sistemas de refrigeración, aplicando medidas de seguridad y cuidado ambiental según la Norma Chilena NCh3241 de Buenas Prácticas.', [
            'Manipula fluidos con las medidas de seguridad y los equipos de protección personal correspondientes.',
            'Chequea las condiciones del recinto para una manipulación segura.',
            'Recupera refrigerantes según la norma y el manual de funcionamiento.',
        ]),
        _ae('M8-AE2', 'Recicla refrigerantes de sistemas de refrigeración aplicando los protocolos indicados en la Norma Chilena NCh3241.', [
            'Chequea las condiciones del recinto para el reciclaje de fluidos.',
            'Determina la factibilidad del reciclaje según criterios técnicos, ambientales y de seguridad.',
            'Aplica el protocolo de reciclaje utilizando los equipos de protección personal.',
        ]),
        _ae('M8-AE3', 'Almacena refrigerantes aplicando los protocolos indicados en la Norma Chilena NCh3241.', [
            'Chequea las condiciones del recinto para el almacenamiento de los distintos fluidos.',
            'Implementa los protocolos de almacenamiento establecidos.',
            'Aplica las medidas de seguridad para almacenar refrigerantes.',
        ]),
    ]),
    ('Emprendimiento y empleabilidad', 76, 'OA genéricos', 4, [
        _ae('MC-AE1', 'Diseña y ejecuta un proyecto de emprendimiento, definiendo acciones, cronograma, presupuesto, financiamiento y control de avance.', [
            'Analiza oportunidades considerando comunidad, recursos, fortalezas, debilidades y normativa.',
            'Formula objetivos, acciones, plazos y un presupuesto detallado.',
            'Controla el avance, evalúa financiamiento y ajusta las acciones según los resultados.',
        ]),
        _ae('MC-AE2', 'Maneja la legislación laboral y previsional chilena como marco de las relaciones entre trabajadores y empleadores.', [
            'Selecciona información relevante sobre derechos laborales y previsionales.',
            'Analiza elementos críticos de contratos y finiquitos según la legislación vigente.',
            'Propone formas de organización y participación respetando los derechos laborales.',
        ]),
        _ae('MC-AE3-4', 'Prepara su incorporación al mundo del trabajo y selecciona alternativas de capacitación y educación superior para fortalecer su trayectoria.', [
            'Elabora antecedentes laborales, currículum y preparación para entrevistas e ingreso al trabajo.',
            'Evalúa remuneración, finiquito, salud, pensión y seguro de desempleo según contrato y derechos.',
            'Compara alternativas de capacitación y educación superior, sus requisitos, acreditación y financiamiento.',
        ]),
    ]),
]

def _official_fourth_modules():
    rows = []
    for item in OFFICIAL_FOURTH_MODULES:
        aes = []
        for row in item['aes']:
            entry = _ae(row['code'], row['title'], [row['title']])
            entry['official_title'] = row['title']
            entry['criteria_origin'] = 'Indicador didáctico basado en la formulación literal del AE oficial.'
            aes.append(entry)
        rows.append((item['title'], item['hp'], deepcopy(item['oa']), len(aes), aes))
    return rows


# Sustituye la versión preliminar por la transcripción literal de la visión global.
FOURTH_MODULES = _official_fourth_modules()


CASE_BLURBS = {
    5: 'Una puesta en marcha segura comienza verificando el espacio, la carga de fluidos, los parámetros del fabricante y las condiciones previas del sistema.',
    6: 'Un diagnóstico confiable compara síntomas, mediciones y especificaciones antes de definir la falla y proponer una solución.',
    7: 'La mantención exige distinguir tareas preventivas y correctivas, aplicar procedimientos seguros y dejar trazabilidad de cada intervención.',
    8: 'La recuperación, el reciclaje y el almacenamiento de refrigerantes protegen a las personas y al ambiente cuando se ejecutan según la NCh3241.',
    9: 'La empleabilidad y el emprendimiento requieren decisiones informadas sobre proyectos, derechos laborales y trayectorias de formación.',
}

EXPLORE_BRIEFS = {
    5: ('Antes de la puesta en marcha, recibes el equipo, la ficha del fabricante y un registro de carga incompleto.', ['Área de trabajo', 'Placa del equipo', 'Carga de fluido', 'EPP']),
    6: ('El sistema presenta funcionamiento irregular. Debes contrastar el síntoma con mediciones, manuales y registros antes de emitir un diagnóstico.', ['Síntoma', 'Medición', 'Manual', 'Registro']),
    7: ('La orden de trabajo solicita mantención. Debes reconocer el historial, el estado del sistema y las tareas autorizadas antes de intervenir.', ['Historial', 'Inspección', 'Procedimiento', 'Cierre']),
    8: ('Se recibe un cilindro con refrigerante recuperado. Debes comprobar identificación, condición, trazabilidad y almacenamiento conforme a la NCh3241.', ['Etiqueta', 'Cilindro', 'Registro', 'Almacenamiento']),
    9: ('Analizas una oportunidad de servicio técnico y antecedentes de inserción laboral para tomar decisiones de proyecto y trayectoria formativa.', ['Oportunidad', 'Presupuesto', 'Contrato', 'Formación']),
}


def fourth_content(position, title, hp, oa, official_ae_count, aes):
    content = _module(
        position, title, hp, aes, 'climate', SOURCE, SOURCE_URL, SCOPE,
        oa=oa, year='4° medio', plan_section='Plan de estudio',
    )
    content['case_blurb'] = CASE_BLURBS[position]
    shift, labels = EXPLORE_BRIEFS[position]
    content['context_guidance'] = 'Observa el caso y reconoce la evidencia disponible. Anticipa qué información debes confirmar antes de tomar una decisión o ejecutar un procedimiento.'
    content['explore'] = {
        'shift': shift,
        'image': '/static/headers/climate/e3.png?v=3',
        'spots': [
            {'id': f'punto-{i}', 'x': x, 'y': y, 'label': label, 'note': f'Reconoce la evidencia asociada a {label.lower()} y señala qué falta confirmar.'}
            for i, (label, x, y) in enumerate(zip(labels, (25, 70, 30, 73), (30, 32, 70, 72)), 1)
        ],
        'prompts': [
            '¿Qué evidencia comprobable observas en el escenario?',
            '¿Qué criterio técnico, normativo o laboral deberías consultar?',
            '¿Qué información falta antes de decidir o actuar?',
        ],
        'guidance': 'Reconoce la evidencia visible y su procedencia. Todavía no ejecutes el procedimiento ni cierres la decisión.',
        'analysis_guidance': 'Registra lo observado, separa datos de suposiciones y declara lo que aún requiere verificación.',
        'purpose': 'Observa, distingue evidencia y anticipa verificaciones. Esta estación no califica y prepara el trabajo de los aprendizajes esperados.',
        'context': content['context'],
        'media_kind': 'foto',
        'caption': f'Escenario profesional simulado de {title}.',
        'alt': f'Escenario profesional simulado de {title} con cuatro puntos de observación.',
        'formative_pack': None,
    }
    content['specialty_source'].update({
        'oa': deepcopy(oa),
        'course_hp': 1672,
        'question_count': 5,
        'course_question_total': 50,
        'development_required': position == 9,
        'evaluation_note': 'Cuarto medio utiliza cinco preguntas por módulo; el módulo 9 incorpora además un desarrollo integrador.',
        'official_ae_count': official_ae_count,
    })
    content['version'] = 'refrigeracion-cuarto-medio-v6'
    return content


def install_refrigeration_fourth(con):
    """Agrega módulos 5 a 9 sin alterar evidencias ni módulos existentes."""
    import json
    from pedagogy import enrich

    version = 'refrigeracion-cuarto-medio-v6'
    con.execute('CREATE TABLE IF NOT EXISTS content_updates(version TEXT PRIMARY KEY,applied TEXT DEFAULT CURRENT_TIMESTAMP)')
    if con.execute('SELECT 1 FROM content_updates WHERE version=?', (version,)).fetchone():
        return
    course = con.execute('SELECT id FROM courses WHERE title=?', ('Refrigeración y Climatización',)).fetchone()
    if not course:
        return
    course_id = course['id']
    con.execute('UPDATE courses SET level=? WHERE id=?', ('3° y 4° medio', course_id))
    for position, (title, hp, oa, official_ae_count, aes) in enumerate(FOURTH_MODULES, 5):
        existing = con.execute('SELECT id,content FROM modules WHERE course_id=? AND position=?', (course_id, position)).fetchone()
        content = fourth_content(position, title, hp, oa, official_ae_count, deepcopy(aes))
        custom_explore = deepcopy(content['explore'])
        enrich(content, position)
        content['explore'] = custom_explore
        content['development_pack'] = {
            'context': f'Situación profesional simulada de {title}',
            'role': 'Técnico o técnica en formación que actúa bajo procedimientos, autorización y supervisión',
            'objective': 'Integrar evidencia, criterio técnico, seguridad, decisión y trazabilidad',
            'problem': 'El caso presenta información parcial y exige distinguir lo comprobado de lo pendiente.',
            'background': content['context'],
            'evidence': ['Registro técnico', 'Especificación o norma aplicable', 'Dato observable', 'Antecedente pendiente'],
            'constraints': 'No intervenir equipos, manipular refrigerantes ni ejecutar procedimientos reales fuera de un taller autorizado y supervisado.',
            'decision': 'Definir la acción segura que corresponde dentro del rol técnico.',
            'argument': 'Relacionar la decisión con los aprendizajes y criterios del módulo.',
            'verify': 'Explicar qué evidencia permitiría cerrar el caso de forma trazable.',
            'development': content['development'],
        }
        serialized = json.dumps(content, ensure_ascii=False)
        if existing:
            previous = json.loads(existing['content'] or '{}')
            if previous.get('version') not in ('refrigeracion-cuarto-medio-v4', 'refrigeracion-cuarto-medio-v5', 'refrigeracion-cuarto-medio-v6'):
                continue
            if con.execute('SELECT 1 FROM progress WHERE module_id=? LIMIT 1', (existing['id'],)).fetchone():
                continue
            con.execute(
                'UPDATE modules SET title=?,published=1,content=? WHERE id=?',
                (title, serialized, existing['id']),
            )
        else:
            con.execute(
                'INSERT INTO modules(course_id,title,position,published,content) VALUES(?,?,?,?,?)',
                (course_id, title, position, 1, serialized),
            )
    con.execute('INSERT INTO content_updates(version) VALUES(?)', (version,))
