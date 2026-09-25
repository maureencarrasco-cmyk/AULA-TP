"""Unpublished Química Industrial mention drafts grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'chemical_industry_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/quimica-industrial.pdf'
COMMON = [
    ('Bodega química simulada', 'inventario, fichas de seguridad y plano de almacenamiento', 'Una etiqueta no coincide con el inventario.', 'identificación documental y aviso al responsable'),
    ('Laboratorio didáctico simulado', 'protocolo institucional, registro de equipos y resultados ficticios', 'El equipo consignado no corresponde al procedimiento aprobado.', 'revisión de compatibilidad y consulta'),
    ('Control de fabricación documental', 'orden de producción, registro de lote y pauta de calidad', 'El lote cambia de identificador entre dos registros.', 'control de trazabilidad y reporte'),
    ('Comité ambiental simulado', 'matriz de residuos, registro ficticio y pauta normativa', 'Un residuo figura en una categoría distinta entre documentos.', 'análisis de discrepancia y derivación técnica'),
]
LABORATORY = [
    ('Plan de muestreo simulado', 'pauta de muestreo, identificación de lote y registro ficticio', 'La muestra registrada corresponde a otro lote.', 'conciliación de antecedentes y reporte'),
    ('Preparación analítica documental', 'protocolo validado, ficha de muestra y registro ficticio', 'La ficha consigna una preparación distinta de la autorizada.', 'verificación documental y consulta'),
    ('Análisis físico-químico simulado', 'resultados ficticios, especificación y hoja de control', 'Un resultado transcrito difiere del registro original.', 'comparación y comunicación del desvío'),
    ('Análisis instrumental documental', 'manual, registro de calibración y resultados ficticios', 'El registro de calibración está pendiente para el equipo indicado.', 'validación de antecedentes y aviso'),
    ('Control de instrumentos', 'inventario, manual y bitácora de mantenimiento', 'Un instrumento figura disponible pese a una revisión pendiente.', 'retiro preventivo simulado y reporte'),
    ('Emprendimiento de laboratorio simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un control de calidad previsto.', 'plan revisado y justificación'),
]
PLANT = [
    ('Análisis de proceso térmico', 'diagrama de flujo, registro ficticio y pauta de control', 'Una lectura anotada no coincide con el tramo del diagrama.', 'identificación de desvío y reporte'),
    ('Control de sólidos simulado', 'diagrama, registro de lote y ficha de proceso', 'La etapa consignada difiere de la secuencia aprobada.', 'comparación documental y consulta'),
    ('Muestreo de producto simulado', 'plan de muestreo, ficha de lote y registro ficticio', 'El identificador de la muestra cambia entre registros.', 'control de trazabilidad y aviso'),
    ('Sistemas auxiliares simulados', 'plano, bitácora y manual de equipo', 'Un equipo figura operativo pese a una alerta pendiente.', 'revisión de condición y derivación técnica'),
    ('Emprendimiento de planta simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida ambiental prevista.', 'plan revisado y justificación'),
]
TRACKS = (
    ('laboratorio', 'Química Industrial, mención Laboratorio Químico', 'quimica-industrial-laboratorio', COMMON + LABORATORY),
    ('planta', 'Química Industrial, mención Planta Química', 'quimica-industrial-planta', COMMON + PLANT),
)


def draft_modules(track):
    key, title, slug, dossiers = next(entry for entry in TRACKS if entry[0] == track)
    for item, content in build_draft(OFFICIAL[key], dossiers, title, slug, SOURCE):
        content['specialty_source']['source_warnings'] = item['source_warnings']
        yield item, content


def install_chemical_industry_drafts(con):
    generic = con.execute("SELECT id FROM courses WHERE title='Química Industrial'").fetchone()
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


def install_chemical_industry_courses(con):
    generic = con.execute("SELECT id FROM courses WHERE title='Química Industrial'").fetchone()
    if generic and not con.execute('SELECT 1 FROM modules WHERE course_id=?', (generic['id'],)).fetchone():
        con.execute('UPDATE courses SET title=?,specialty=? WHERE id=?',
                    (TRACKS[0][1], TRACKS[0][1], generic['id']))
    student = con.execute("SELECT id FROM users WHERE role='student' ORDER BY id LIMIT 1").fetchone()
    for key, title, slug, _ in TRACKS:
        course = con.execute('SELECT id FROM courses WHERE title=?', (title,)).fetchone()
        if not course:
            course_id = con.execute('INSERT INTO courses(title,specialty,level) VALUES(?,?,?)',
                                    (title, title, '3° y 4° medio')).lastrowid
        else:
            course_id = course['id']
        if student:
            con.execute('INSERT OR IGNORE INTO enrollments(user_id,course_id) VALUES(?,?)',
                        (student['id'], course_id))
        install_course(con, title, draft_modules(key),
                       f'{slug}-mineduc-draft-v1', f'{slug}-mineduc-v1')
