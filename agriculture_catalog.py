"""Unpublished Agropecuaria mention drafts grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'agriculture_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/agropecuaria.pdf'
COMMON = [
    ('Predio escolar simulado', 'plan de suelo, registro de residuos y pauta ambiental', 'El sector registrado no coincide con el mapa del predio.', 'análisis de suelo y observación ambiental'),
    ('Planificación de riego', 'mapa de parcelas, registro de agua y pauta de cultivo', 'El registro de riego indica una parcela distinta de la planificada.', 'revisión documental y consulta técnica'),
    ('Vivero simulado', 'ficha de especie, plan de propagación y registro ambiental', 'Una condición registrada difiere del rango de referencia.', 'comparación de evidencia y reporte'),
    ('Unidad pecuaria simulada', 'plan de alimentación, pesajes ficticios y ficha animal', 'Un pesaje aparece asignado a un animal diferente.', 'conciliación de registros y consulta al responsable'),
    ('Control fitosanitario documental', 'ficha de observación, mapa y pauta preventiva', 'El foco reportado no coincide con el sector del mapa.', 'identificación de discrepancia y derivación técnica'),
]
AGRICULTURE = [
    ('Planificación de cultivos', 'ficha de especie, calendario y mapa de parcela', 'El cultivo propuesto no corresponde al sector autorizado.', 'plan de cultivo revisado'),
    ('Control de frutales', 'bitácora, ficha de huerto y resultados ficticios', 'Un rendimiento registrado difiere de la planilla consolidada.', 'comparación de resultados y propuesta de mejora'),
    ('Centro de postcosecha simulado', 'registro de lote, pauta de guarda y ficha de producto', 'La identificación del lote cambia entre recepción y guarda.', 'control de trazabilidad y observación'),
    ('Taller de equipos agrícolas', 'inventario, manual y bitácora', 'Una máquina figura disponible pese a una revisión pendiente.', 'reporte de condición y retiro preventivo simulado'),
    ('Emprendimiento agrícola simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un control de calidad previsto.', 'plan de emprendimiento con costos revisados'),
]
LIVESTOCK = [
    ('Unidad de manejo pecuario', 'fichas animales, pauta de bienestar y registro ficticio', 'Una ficha no coincide con el grupo indicado en el registro.', 'revisión de identificación y consulta al responsable'),
    ('Planificación reproductiva simulada', 'ficha animal, calendario y protocolo institucional', 'La fecha prevista difiere de la registrada en la ficha.', 'análisis de antecedentes y derivación profesional'),
    ('Control de producción lechera', 'registro de lote, controles ficticios y pauta sanitaria', 'Un lote aparece con dos resultados diferentes.', 'conciliación de datos y reporte sanitario'),
    ('Comité de bienestar animal', 'pauta de observación, ficha y registro de alerta', 'Un signo de alerta no figura en el reporte diario.', 'identificación de riesgo y derivación al profesional competente'),
    ('Planificación de praderas', 'mapa, ficha forrajera y registro de uso', 'La superficie anotada difiere del mapa aprobado.', 'cálculo revisado y justificación'),
    ('Emprendimiento pecuario simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida de bienestar prevista.', 'plan de emprendimiento con costos revisados'),
]
VITICULTURE = [
    ('Planificación vitícola', 'mapa de cuarteles, ficha de vid y registro ambiental', 'Un cuartel se identifica de modo diferente en el mapa y la ficha.', 'revisión de trazabilidad y consulta técnica'),
    ('Control de cosecha de vides', 'calendario, guía ficticia y ficha de lote', 'El lote transportado no coincide con el programado.', 'conciliación documental y observación'),
    ('Análisis de producción vitivinícola', 'orden de producción, bitácora y registros ficticios', 'Una etapa consignada no coincide con la secuencia aprobada.', 'reporte de desvío y derivación al responsable'),
    ('Control de envasado vitivinícola', 'arte de etiqueta, ficha de lote y pauta de calidad', 'La etiqueta muestra un código de lote distinto.', 'control de rotulación y corrección documentada'),
    ('Bodega vitivinícola simulada', 'inventario, plano de bodega y registro ambiental', 'La ubicación de un lote difiere entre inventario y plano.', 'revisión de almacenamiento y trazabilidad'),
    ('Emprendimiento vitivinícola simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida de resguardo prevista.', 'plan de emprendimiento con costos revisados'),
]
TRACKS = (
    ('agricultura', 'Agropecuaria, mención Agricultura', 'agropecuaria-agricultura', COMMON + AGRICULTURE),
    ('pecuaria', 'Agropecuaria, mención Pecuaria', 'agropecuaria-pecuaria', COMMON + LIVESTOCK),
    ('vitivinicola', 'Agropecuaria, mención Vitivinícola', 'agropecuaria-vitivinicola', COMMON + VITICULTURE),
)


def draft_modules(track):
    key, title, slug, dossiers = next(entry for entry in TRACKS if entry[0] == track)
    for item, content in build_draft(OFFICIAL[key], dossiers, title, slug, SOURCE):
        content['specialty_source']['source_warnings'] = item['source_warnings']
        yield item, content


def install_agriculture_drafts(con):
    generic = con.execute("SELECT id FROM courses WHERE title='Agropecuaria'").fetchone()
    if generic and not con.execute('SELECT 1 FROM modules WHERE course_id=?', (generic['id'],)).fetchone():
        con.execute('UPDATE courses SET title=?,specialty=? WHERE id=?',
                    (TRACKS[0][1], TRACKS[0][1], generic['id']))
    student = con.execute("SELECT id FROM users WHERE role='student' ORDER BY id LIMIT 1").fetchone()
    for key, title, _, _ in TRACKS:
        course = con.execute('SELECT id FROM courses WHERE title=?', (title,)).fetchone()
        if not course:
            course_id = con.execute('INSERT INTO courses(title,specialty,level) VALUES(?,?,?)',
                                    (title, title, '3° y 4° medio')).lastrowid
        else:
            course_id = course['id']
        if student:
            con.execute('INSERT OR IGNORE INTO enrollments(user_id,course_id) VALUES(?,?)',
                        (student['id'], course_id))
        install_draft(con, title, draft_modules(key))
