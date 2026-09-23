"""Official Gastronomy and Hotel Services curricula in Aula TP's existing course shell."""

from copy import deepcopy
import json
from pathlib import Path

from specialty_catalog import _ae, _module, _rotate
from pedagogy import enrich


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'hospitality_official.json').read_text(encoding='utf-8'))
GASTRONOMY_URL = 'https://www.curriculumnacional.cl/614/articles-34313_programa.pdf'
HOTEL_URL = 'https://www.curriculumnacional.cl/614/articles-34324_programa.pdf'
RSA_URL = 'https://www.bcn.cl/leychile/Navegar?idNorma=71271'
SERNATUR_URL = 'https://www.sernatur.cl/wp-content/uploads/2018/11/MDH-Alojamiento-Turi%CC%81stico-1.pdf'
FOOD_SAFETY_REVIEW_URL = 'https://pubmed.ncbi.nlm.nih.gov/28873718/'

# The dossiers are local learning simulations. Titles, hours, OA, AE and criteria
# come only from the MINEDUC programs represented in hospitality_official.json.
GASTRONOMY_DOSSIERS = [
    ('Cocina de un casino escolar', 'planilla de higiene y ficha de limpieza', 'Un utensilio vuelve a la mesa de preparación sin constancia de higienización.', 'registro de control de higiene', '06-cocina'),
    ('Cocina de producción', 'ficha técnica y orden de producción', 'El pedido cambia de 20 a 30 raciones sin actualizar la mise en place.', 'plan de preparación y servicio', '06-cocina'),
    ('Bodega de alimentos', 'guía de despacho, rótulo y registro de stock', 'El lote recibido no coincide con la fecha anotada en el inventario.', 'registro de recepción y almacenamiento', '10-bodega'),
    ('Cocina de un comedor', 'ficha técnica, requerimiento y lista de insumos', 'La preparación requiere un ingrediente que no figura en la solicitud.', 'plan de producción y mise en place', '06-cocina'),
    ('Servicio de buffet', 'solicitud del cliente y plano de montaje', 'Cambió el número de comensales después de definir el montaje.', 'propuesta de presentación y montaje', '06-cocina'),
    ('Salón de comedor', 'orden de servicio e inventario de implementos', 'La disposición preparada no corresponde al tipo de servicio confirmado.', 'montaje documentado del salón', '04-hotel'),
    ('Cocina regional', 'ficha de preparación y registro de productos de temporada', 'Un insumo regional previsto no está disponible en la estación.', 'propuesta de plato chileno ajustada', '06-cocina'),
    ('Cocina internacional', 'receta de referencia y ficha de variación', 'La propuesta cambia un ingrediente sin explicar su efecto en la preparación.', 'ficha de elaboración y justificación', '06-cocina'),
    ('Bar de práctica supervisada', 'recetario y comanda de bebidas', 'La comanda no distingue una bebida sin alcohol de otra solicitada.', 'comanda verificada y preparación simulada', '04-hotel'),
    ('Restaurante de menú diario', 'disponibilidad de insumos y perfil del cliente', 'La carta ofrecida incluye una preparación cuyo insumo no está disponible.', 'menú y carta fundamentados', '06-cocina'),
    ('Panadería de práctica', 'receta de masa y hoja de producción', 'La cantidad planificada no coincide con el rendimiento indicado en la receta.', 'hoja de producción corregida', '06-cocina'),
    ('Taller de repostería', 'ficha de postre y registro de equipos', 'El equipo reservado está ocupado durante la franja prevista.', 'secuencia de producción del postre', '06-cocina'),
    ('Taller de pastelería', 'ficha de torta y solicitud del cliente', 'La terminación solicitada no quedó registrada en la ficha de montaje.', 'ficha de armado y decoración', '06-cocina'),
    ('Taller de innovación', 'receta base, prueba y pauta sensorial', 'La variación propuesta no documenta el resultado de la prueba.', 'propuesta de innovación con evidencia', '06-cocina'),
    ('Emprendimiento gastronómico', 'presupuesto, cronograma y ficha de postulación', 'El costo de un insumo no aparece en el presupuesto del proyecto.', 'plan de emprendimiento verificable', '09-oficina'),
]
HOTEL_DOSSIERS = [
    ('Recepción de un hotel', 'solicitud del huésped y catálogo de servicios', 'La solicitud del huésped no coincide con el servicio anotado en la respuesta.', 'respuesta de atención documentada', '04-hotel'),
    ('Área de habitaciones', 'informe de estado y lista de revisión', 'Una habitación figura disponible sin revisión final registrada.', 'informe de supervisión de habitaciones', '04-hotel'),
    ('Programa recreativo del alojamiento', 'perfil de huéspedes y agenda de actividades', 'La actividad propuesta no considera la composición del grupo inscrito.', 'programa recreativo ajustado', '04-hotel'),
    ('Salón de eventos', 'orden del evento y plano de servicio', 'El montaje previsto no coincide con el aforo indicado en la orden.', 'plan de montaje y servicio', '04-hotel'),
    ('Atención inicial en un hotel', 'guion bilingüe y descripción de servicios', 'La respuesta en inglés omite una condición del servicio contratado.', 'mensaje de atención bilingüe', '04-hotel'),
    ('Mostrador de información turística', 'folleto, mapa y requerimiento del visitante', 'El folleto disponible no confirma el horario solicitado.', 'orientación turística con fuente', '11-terminal'),
    ('Recepción y reservas', 'reserva, tarifa y estado de cuenta', 'El valor informado al huésped difiere del detalle de la reserva.', 'registro de reserva y cierre de cuenta', '04-hotel'),
    ('Servicio de evento', 'comanda de cócteles y ficha de vinos', 'La comanda no confirma la preferencia de bebida del cliente.', 'plan de servicio de bebidas simulado', '04-hotel'),
    ('Información bilingüe', 'correo de reserva y folleto turístico en inglés', 'El correo de respuesta omite la fecha solicitada por el huésped.', 'respuesta escrita bilingüe', '04-hotel'),
    ('Emprendimiento de alojamiento', 'presupuesto, cronograma y perfil de servicio', 'La proyección de costos no incluye un servicio anunciado.', 'plan de emprendimiento verificable', '09-oficina'),
]


def _make_module(item, position, key, source, url, dossier, scope):
    place, resource, conflict, product, image_name = dossier
    image = f'/static/themes/cases/{image_name}.png'
    aes = []
    for row in item['aes']:
        ae = _ae(row['code'], row['title'], row['criteria'])
        ae['official_title'] = row['title']
        ae['criteria_origin'] = 'Criterios de evaluación del Programa de Estudio MINEDUC.'
        ae['lesson'] = [
            f'En {place.lower()}, el aprendizaje esperado exige: {row["title"]}',
            f'Examina {resource}, identifica el dato faltante y contrasta tu decisión con los criterios oficiales de evaluación.',
        ]
        ae['example'] = f'{conflict} Elabora un {product} y explica qué dato comprobaste en {resource}.'
        ae['steps'] = [
            f'Analiza el caso: {conflict}',
            f'Comprende el aprendizaje esperado y consulta {resource}.',
            'Relaciona la evidencia disponible con el criterio oficial.',
            f'Decide cómo preparar el {product} sin suponer datos ausentes.',
            'Verifica tu decisión con el criterio y el documento del caso.',
            'Retroalimenta: explica qué cambiarías tras la verificación.',
        ]
        aes.append(ae)
    content = _module(position, item['title'], item['hp'], aes, key, source, url, scope,
                      oa=item['oa'], year=item['year'], plan_section='Plan de Estudio MINEDUC')
    content['specialty'] = 'Gastronomía' if key == 'gastronomia' else 'Servicios de Hotelería'
    content['context'] = f'{place}. {conflict} Dispones de {resource}. Tu producto es un {product}.'
    content['application'] = (
        f'Caso simulado de {place.lower()}; consulta {resource}, aplica el criterio oficial '
        f'y deja trazabilidad en el {product}. La práctica presencial requiere supervisión docente.'
    )
    content['development'] = (
        f'Analiza el caso de {place.lower()}: {conflict} Usa {resource}, identifica el AE y el criterio '
        f'que respaldan tu respuesta y entrega un {product}. Explica cómo comprobarías el resultado.'
    )
    content['reflection_prompt'] = f'¿Qué comprobaste en {resource}, qué falta y cómo mejorarías el {product}?'
    content['scene'].update(image=image, alt=f'{place}: contexto de {item["title"].lower()}.',
                            title=f'Caso de oficio · {item["title"]}',
                            prompt=f'Revisa {resource}; identifica el dato que falta y prepara un {product}.')
    content['curriculum']['consulted'] = '2026-09-22'
    content['bibliography'] = [{
        'author': 'Ministerio de Educación de Chile', 'work': 'Programa de Estudio de la especialidad',
        'year': 2015, 'concept': 'Módulos, horas, OA, AE y criterios oficiales',
        'application': item['title'], 'url': url,
    }]
    if key == 'gastronomia' and item['title'] != 'Emprendimiento y empleabilidad':
        content['bibliography'].append({
            'author': 'Ministerio de Salud de Chile', 'work': 'Reglamento Sanitario de los Alimentos, Decreto 977',
            'year': 1996, 'concept': 'Condiciones sanitarias de la manipulación y producción de alimentos',
            'application': f'Resguardos de inocuidad en {item["title"]}', 'url': RSA_URL,
        })
        if item['title'] == 'Higiene para la elaboración de alimentos':
            content['bibliography'].append({
                'author': 'Zanin et al.',
                'work': 'Knowledge, attitudes and practices of food handlers in food safety: An integrative review',
                'year': 2017, 'concept': 'La formación debe contrastar conocimientos con prácticas observables',
                'application': 'Análisis de registros y decisiones de higiene', 'url': FOOD_SAFETY_REVIEW_URL,
            })
    if key == 'hoteleria' and item['title'] != 'Emprendimiento y empleabilidad':
        content['bibliography'].append({
            'author': 'Servicio Nacional de Turismo',
            'work': 'Manual de Hospitalidad para Establecimientos de Alojamiento Turístico',
            'year': 2018, 'concept': 'Atención, comunicación y buenas prácticas de servicio',
            'application': f'Caso simulado de {item["title"]}', 'url': SERNATUR_URL,
        })
    content['specialty_source']['source_page'] = item['source_page']
    content['specialty_source']['official_criteria_count'] = sum(len(ae['criteria']) for ae in item['aes'])
    content['version'] = 'hospitality-mineduc-v5'
    def decision(stage, criterion):
        checks = [
            (f'Antes de entregar el {product}, ¿qué debes comprobar ante esta diferencia?',
             f'Comparar el dato conflictivo con {resource} y aplicar «{criterion}».',
             f'Entregar el {product} sin revisar la diferencia.',
             'Suponer que el antecedente faltante coincide con lo esperado.',
             'Reemplazar el dato original para que el registro no muestre discrepancias.'),
            (f'¿Qué evidencia demuestra que el {product} responde al criterio evaluado?',
             f'Un registro que identifica el dato de {resource}, el criterio «{criterion}» y la decisión.',
             'Un resultado sin fuente ni relación con el criterio.',
             'Una afirmación de cumplimiento basada solo en la experiencia previa.',
             'Una copia de la solicitud sin revisión del dato discordante.'),
            (f'El equipo necesita decidir qué hacer con el antecedente discordante. ¿Qué corresponde?',
             f'Mantener el dato original, contrastarlo con {resource} y documentar el pendiente según «{criterion}».',
             'Eliminar el dato discordante del documento.',
             'Continuar como si la diferencia no afectara el servicio.',
             'Completar la información no disponible con una cifra estimada sin avisar.'),
            (f'¿Cómo verificas la calidad del {product} antes de cerrarlo?',
             f'Revisar la correspondencia entre {resource}, «{criterion}» y el resultado registrado.',
             'Confirmar solo que el documento tiene una fecha.',
             'Aceptar el trabajo porque su presentación es ordenada.',
             'Revisar únicamente la alternativa que eligió el equipo.'),
            (f'Tras revisar el {product}, ¿qué retroalimentación permite mejorar el trabajo?',
             f'Precisar el dato pendiente en {resource} y repetir la comprobación exigida por «{criterion}».',
             'Indicar que todo está correcto sin señalar evidencia.',
             'Cambiar el criterio para que se ajuste al resultado obtenido.',
             'Omitir el antecedente faltante en la entrega final.'),
        ]
        return checks[stage % len(checks)]

    for index, case in enumerate(content['cases']):
        ae = aes[index % len(aes)]
        criterion = ae['criteria'][index % len(ae['criteria'])]
        question, correct, *wrong = decision(index, criterion)
        options, answer = _rotate(correct, wrong, index)
        case.update(title=f'{item["title"]} · evidencia {index + 1}',
                    context=f'{place}. {conflict} Fuente disponible: {resource}. Tarea: {question} Criterio: {criterion}',
                    question=question,
                    options=options, answer=answer,
                    explanation=f'La decisión debe sostenerse en {resource} y en el criterio {criterion}',
                    ae=index % len(aes), criterion=criterion, image=image,
                    alt=f'{place}; imagen contextual del caso de {item["title"].lower()}.')
    for index, question in enumerate(content['questions']):
        ae = aes[index % len(aes)]
        criterion = ae['criteria'][index % len(ae['criteria'])]
        prompt, correct, *wrong = decision(index + 2, criterion)
        options, answer = _rotate(correct, wrong, index + 1)
        question.update(stimulus=f'{place}. {conflict} Etapa de revisión: {prompt}',
                        question=prompt,
                        options=options, answer=answer,
                        explanation=f'El criterio {criterion} requiere evidencia comprobable en {resource}.',
                        ae=index % len(aes), criterion=criterion, image=image,
                        alt=f'{place}; contexto de evaluación del módulo.')
    for index, task in enumerate(content['formative_pack']):
        ae = aes[index % len(aes)]
        criterion = ae['criteria'][index % len(ae['criteria'])]
        task['prompt'] = f'En {resource}, localiza el dato relacionado con «{criterion}» y explica cómo lo usarías en el {product}.'
        task['task']['image'] = image
        task['criterion'] = criterion
    for index, task in enumerate(content['encargos']['items']):
        ae = aes[index % len(aes)]
        criterion = ae['criteria'][index % len(ae['criteria'])]
        task.update(title=f'{product.capitalize()} · {index + 1}',
                    prompt=f'{place}. {conflict} Revisa {resource} y aplica el criterio «{criterion}».',
                    product=product, criterion=criterion)
    return content


def _course(title, specialty, key, items, indexes, dossiers, source, url):
    selected = [items[index] for index in indexes]
    scope = f'Plan oficial de {title}: {len(selected)} módulos y {sum(item["hp"] for item in selected)} horas pedagógicas.'
    return {
        'title': title, 'specialty': specialty, 'level': '3° y 4° medio',
        'modules': [
            {'position': position, 'title': item['title'],
             'content': _make_module(item, position, key, source, url, dossiers[index], scope)}
            for position, (index, item) in enumerate(zip(indexes, selected), 1)
        ],
    }


def courses():
    gastronomy = OFFICIAL['gastronomia']
    hotel = OFFICIAL['hoteleria']
    common = list(range(6))
    return [
        _course('Gastronomía, mención Cocina', 'Gastronomía, mención Cocina', 'gastronomia',
                gastronomy, common + list(range(6, 10)) + [14], GASTRONOMY_DOSSIERS,
                'docs/fuentes/MINEDUC_Gastronomia_programa.pdf', GASTRONOMY_URL),
        _course('Gastronomía, mención Pastelería y Repostería', 'Gastronomía, mención Pastelería y Repostería',
                'gastronomia', gastronomy, common + list(range(10, 15)), GASTRONOMY_DOSSIERS,
                'docs/fuentes/MINEDUC_Gastronomia_programa.pdf', GASTRONOMY_URL),
        _course('Servicios de Hotelería', 'Servicios de Hotelería', 'hoteleria',
                hotel, list(range(10)), HOTEL_DOSSIERS,
                'docs/fuentes/MINEDUC_Servicios_de_Hoteleria_programa.pdf', HOTEL_URL),
    ]


def install_hospitality_courses(con):
    version = 'hospitality-mineduc-v5'
    if con.execute('SELECT 1 FROM content_updates WHERE version=?', (version,)).fetchone():
        return
    student = con.execute("SELECT id FROM users WHERE role='student' ORDER BY id LIMIT 1").fetchone()
    for course in courses():
        existing = con.execute('SELECT id FROM courses WHERE title=?', (course['title'],)).fetchone()
        if existing:
            course_id = existing['id']
        else:
            course_id = con.execute('INSERT INTO courses(title,specialty,level) VALUES(?,?,?)',
                                    (course['title'], course['specialty'], course['level'])).lastrowid
        for module in course['modules']:
            found = con.execute('SELECT id,content FROM modules WHERE course_id=? AND position=?',
                                (course_id, module['position'])).fetchone()
            content = deepcopy(module['content'])
            content['specialty_source'].update(course_hp=1672, question_count=5,
                course_question_total=len(course['modules']) * 5,
                development_required=module['position'] == len(course['modules']),
                evaluation_note='Cinco preguntas por módulo y un desarrollo integrador en el último.')
            enrich(content, module['position'])
            serialized = json.dumps(content, ensure_ascii=False)
            if found:
                old = json.loads(found['content'] or '{}')
                if old.get('version') not in ('hospitality-mineduc-v1', 'hospitality-mineduc-v2', 'hospitality-mineduc-v3', 'hospitality-mineduc-v4', version) or con.execute('SELECT 1 FROM progress WHERE module_id=?',
                                                               (found['id'],)).fetchone():
                    continue
                con.execute('UPDATE modules SET title=?,content=?,published=1 WHERE id=?',
                            (module['title'], serialized, found['id']))
            else:
                con.execute('INSERT INTO modules(course_id,title,position,published,content) VALUES(?,?,?,?,?)',
                            (course_id, module['title'], module['position'], 1, serialized))
        if student:
            con.execute('INSERT OR IGNORE INTO enrollments(user_id,course_id) VALUES(?,?)',
                        (student['id'], course_id))
    con.execute('INSERT INTO content_updates(version) VALUES(?)', (version,))
