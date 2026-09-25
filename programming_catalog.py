"""Programming course draft based on the official MINEDUC plan and module pages."""

import json
from copy import deepcopy
from pathlib import Path

from specialty_catalog import _ae, _module
from tp_draft_builder import contextualize_draft, install_course, sync_draft_activities, sync_draft_context, sync_official_oa


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'programming_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/programacion.pdf'
SOURCE_URL = 'https://www.curriculumnacional.cl/614/articles-34336_programa.pdf'
DOSSIERS = [
    ('Equipo de desarrollo de una aplicación de pedidos', 'requerimiento del usuario, tabla de pedidos y diagrama de flujo', 'El diagrama no contempla qué ocurre cuando el pedido está vacío.', 'algoritmo y prueba de escritorio documentados'),
    ('Taller de soporte informático', 'orden de trabajo, inventario y manual del fabricante', 'La memoria instalada no coincide con la especificación de la estación.', 'informe de instalación y verificación'),
    ('Mesa de ayuda de una oficina', 'solicitud del usuario, inventario de software y registro de incidencias', 'La aplicación requerida no figura en el inventario de licencias.', 'respuesta de soporte y registro de instalación'),
    ('Laboratorio de sistemas operativos', 'requisitos del sistema, configuración de la máquina virtual y lista de comprobación', 'La memoria asignada a la máquina virtual es menor que el mínimo indicado.', 'plan de instalación y pruebas del sistema'),
    ('Equipo de diseño de datos', 'requerimiento de clientes y pedidos, entidades y diccionario de datos', 'La tabla de pedidos repite el nombre del cliente sin una relación identificable.', 'modelo relacional y justificación de claves'),
    ('Equipo de desarrollo de software', 'historias de usuario, diagrama de clases y pruebas unitarias', 'La clase derivada duplica una operación de la clase base y falla una prueba.', 'revisión del diseño orientado a objetos y resultado de pruebas'),
    ('Área de administración de bases de datos', 'esquema, solicitud de actualización y respaldo', 'La actualización propuesta deja registros sin relación con la tabla principal.', 'plan de consulta, respaldo y comprobación de integridad'),
    ('Equipo de desarrollo web', 'requisitos de la interfaz, formulario y resultados de prueba', 'El formulario acepta un dato obligatorio vacío pese al requerimiento.', 'corrección propuesta y plan de pruebas web'),
    ('Emprendimiento de servicios informáticos', 'propuesta de servicio, presupuesto y cronograma', 'El presupuesto no incluye el costo del alojamiento previsto.', 'plan de emprendimiento y control de avance'),
]


def draft_modules():
    if len(OFFICIAL) != 9 or len(DOSSIERS) != 9:
        raise ValueError('Incomplete official Programming course')
    scope = 'Plan de Programación de 3° y 4° medio: 9 módulos y 1672 horas pedagógicas oficiales.'
    for item, (place, resources, conflict, product) in zip(OFFICIAL, DOSSIERS):
        aes = []
        for row in item['aes']:
            ae = _ae(row['code'], row['title'], row['criteria'])
            ae['official_title'] = row['title']
            ae['criteria_origin'] = 'Currículum Nacional MINEDUC, módulo de Programación.'
            ae['lesson'] = [
                row['title'],
                f'En {place.lower()}, analiza {resources}. {conflict}',
                f'Relaciona la decisión para el {product} con un criterio de evaluación oficial.',
            ]
            ae['example'] = f'{conflict} Revisa {resources} y entrega un {product}.'
            aes.append(ae)
        content = _module(item['position'], item['title'], item['hp'], aes,
                          'programacion', SOURCE, SOURCE_URL, scope,
                          oa=item['oa'], year=item['year'], plan_section='Plan de Estudio MINEDUC')
        content['specialty'] = 'Programación'
        content['context'] = f'{place}. {conflict} Dispones de {resources}. Producto: {product}.'
        content['application'] = f'Caso simulado de {place.lower()}; coteja {resources} antes de entregar el {product}.'
        content['development'] = (
            f'{conflict} Con los datos de {resources}, explica el problema, cita el AE y criterio '
            f'oficial que corresponde, prepara el {product} y describe una verificación reproducible.'
        )
        content['reflection_prompt'] = f'¿Qué evidencia en {resources} respalda el {product} y qué prueba falta?'
        content['curriculum']['url'] = item['source_page']
        content['specialty_source']['source_page'] = item['source_page']
        content['specialty_source']['official_criteria_count'] = sum(len(ae['criteria']) for ae in item['aes'])
        contextualize_draft(content, (place, resources, conflict, product))
        content['bibliography'] = [{
            'author': 'Ministerio de Educación de Chile',
            'work': 'Programa de Estudio de la especialidad Programación',
            'year': 2015,
            'concept': 'Módulo, horas, OA, AE y criterios de evaluación',
            'application': item['title'],
            'url': item['source_page'],
        }]
        content['version'] = 'programacion-mineduc-draft-v1'
        yield item, content


def install_programming_draft(con):
    """Stage reviewed curricular facts without publishing unreviewed assessments."""
    course = con.execute('SELECT id FROM courses WHERE title=?', ('Programación',)).fetchone()
    if not course:
        return
    for item, content in draft_modules():
        existing = con.execute('SELECT id,published,content FROM modules WHERE course_id=? AND position=?',
                               (course['id'], item['position'])).fetchone()
        if existing:
            if not existing['published']:
                sync_official_oa(con, existing['id'], existing['content'], item['oa'])
                refreshed = con.execute('SELECT content FROM modules WHERE id=?', (existing['id'],)).fetchone()
                sync_draft_context(con, existing['id'], refreshed['content'], content)
                refreshed = con.execute('SELECT content FROM modules WHERE id=?', (existing['id'],)).fetchone()
                sync_draft_activities(con, existing['id'], refreshed['content'], content)
            continue
        con.execute('INSERT INTO modules(course_id,title,position,published,content) VALUES(?,?,?,?,?)',
                    (course['id'], item['title'], item['position'], 0,
                     json.dumps(deepcopy(content), ensure_ascii=False)))


def install_programming_course(con):
    install_course(con, 'Programación', draft_modules(),
                   'programacion-mineduc-draft-v1', 'programacion-mineduc-v1')
