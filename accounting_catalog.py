"""Unpublished Accounting draft with official module, OA, AE and criteria data."""

import json
from copy import deepcopy
from pathlib import Path

from specialty_catalog import _ae, _module
from tp_draft_builder import contextualize_draft, sync_draft_activities, sync_draft_context, sync_official_oa


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'accounting_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/contabilidad.pdf'
SOURCE_URL = 'https://www.curriculumnacional.cl/614/articles-34311_programa.pdf'
DOSSIERS = [
    ('Oficina contable de una pequeña empresa', 'plan de cuentas, factura ficticia y libro diario', 'La factura usa una cuenta distinta a la registrada en el asiento.', 'asiento corregido con respaldo documental'),
    ('Área de remuneraciones', 'contrato ficticio, registro de asistencia y liquidación simulada', 'Las horas del registro no coinciden con las usadas en la liquidación.', 'conciliación de antecedentes y registro de remuneración'),
    ('Unidad de control contable', 'libro mayor, auxiliares y comprobantes ficticios', 'El saldo del auxiliar no coincide con el libro mayor.', 'informe de conciliación de registros'),
    ('Oficina administrativa', 'procedimiento, archivo digital y control de versiones', 'Dos versiones del mismo comprobante aparecen como vigentes.', 'propuesta de organización y trazabilidad documental'),
    ('Mesa de atención contable', 'solicitud del cliente, ficha de atención y documento entregado', 'El identificador del documento no corresponde al indicado por el cliente.', 'respuesta de atención verificada'),
    ('Equipo de informes contables', 'balance simulado, anexos y requerimiento de jefatura', 'Un subtotal del informe no se puede reconstruir desde los anexos.', 'informe contable con conciliación de cifras'),
    ('Área tributaria de práctica', 'registros y documentos tributarios ficticios', 'El monto registrado en el formulario no coincide con el comprobante fuente.', 'revisión documentada del cálculo y registro'),
    ('Unidad de comercio exterior', 'orden de compra, documento de transporte y registro contable simulados', 'La fecha de la operación difiere entre el documento y el registro.', 'expediente de operación conciliado'),
    ('Área de información financiera', 'estado de situación simulado, detalle de cuentas y hoja de análisis', 'La clasificación de una cuenta cambia entre el detalle y el estado.', 'análisis contable-financiero trazable'),
    ('Emprendimiento de servicios contables', 'propuesta de servicio, presupuesto y cronograma ficticios', 'El presupuesto omite un recurso previsto en la propuesta.', 'plan de emprendimiento con control de avance'),
]


def draft_modules():
    if len(OFFICIAL) != 10 or len(DOSSIERS) != 10:
        raise ValueError('Incomplete official Accounting plan')
    scope = 'Plan de Contabilidad de 3° y 4° medio: 10 módulos y 1672 horas pedagógicas oficiales.'
    for item, (place, resources, conflict, product) in zip(OFFICIAL, DOSSIERS):
        aes = []
        for row in item['aes']:
            ae = _ae(row['code'], row['title'], row['criteria'])
            ae['official_title'] = row['title']
            ae['criteria_origin'] = 'Currículum Nacional MINEDUC, módulo de Contabilidad.'
            ae['lesson'] = [
                row['title'],
                f'En {place.lower()}, coteja {resources}. {conflict}',
                f'Fundamenta el {product} en el criterio de evaluación oficial.',
            ]
            ae['example'] = f'{conflict} Revisa {resources} y prepara un {product}.'
            aes.append(ae)
        content = _module(item['position'], item['title'], item['hp'], aes,
                          'administracion', SOURCE, SOURCE_URL, scope,
                          oa=item['oa'], year=item['year'], plan_section='Plan de Estudio MINEDUC')
        content['specialty'] = 'Contabilidad'
        content['context'] = f'{place}. {conflict} Dispones de {resources}. Producto: {product}.'
        content['application'] = f'Caso ficticio de {place.lower()}; concilia {resources} antes de entregar el {product}.'
        content['development'] = (
            f'{conflict} Usando {resources}, identifica la diferencia y relaciona tu decisión '
            f'con el AE y criterio oficial. Entrega el {product} con evidencia de verificación.'
        )
        content['reflection_prompt'] = f'¿Qué documento en {resources} respalda el {product} y qué falta cotejar?'
        content['curriculum']['url'] = item['source_page']
        content['specialty_source']['source_page'] = item['source_page']
        content['specialty_source']['official_criteria_count'] = sum(len(ae['criteria']) for ae in item['aes'])
        contextualize_draft(content, (place, resources, conflict, product))
        content['bibliography'] = [{
            'author': 'Ministerio de Educación de Chile',
            'work': 'Programa de Estudio de la especialidad Contabilidad',
            'year': 2015,
            'concept': 'Módulo, horas, OA, AE y criterios de evaluación',
            'application': item['title'],
            'url': item['source_page'],
        }]
        content['version'] = 'contabilidad-mineduc-draft-v1'
        yield item, content


def install_accounting_draft(con):
    course = con.execute('SELECT id FROM courses WHERE title=?', ('Contabilidad',)).fetchone()
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


def install_accounting_course(con):
    """Publica Contabilidad solo cuando cada módulo supera el control pedagógico."""
    from pedagogy import enrich, publication_gaps

    course = con.execute('SELECT id FROM courses WHERE title=?', ('Contabilidad',)).fetchone()
    if not course:
        return
    for item, content in draft_modules():
        content['version'] = 'contabilidad-mineduc-v1'
        enrich(content, item['position'])
        gaps = publication_gaps(content, 'Contabilidad')
        if gaps:
            raise ValueError(f'Contabilidad módulo {item["position"]} no publicable: {gaps[:3]}')
        existing = con.execute(
            'SELECT id,content FROM modules WHERE course_id=? AND position=?',
            (course['id'], item['position']),
        ).fetchone()
        serialized = json.dumps(content, ensure_ascii=False)
        if existing:
            previous = json.loads(existing['content'] or '{}')
            if previous.get('version') not in ('contabilidad-mineduc-draft-v1', 'contabilidad-mineduc-v1'):
                continue
            con.execute(
                'UPDATE modules SET title=?,published=1,content=? WHERE id=?',
                (item['title'], serialized, existing['id']),
            )
        else:
            con.execute(
                'INSERT INTO modules(course_id,title,position,published,content) VALUES(?,?,?,?,?)',
                (course['id'], item['title'], item['position'], 1, serialized),
            )
