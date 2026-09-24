"""Verified, unpublished Mecánica Industrial mention drafts."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'mechanical_industry_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/mecanica-industrial.pdf'
COMMON = [
    ('Taller de soldadura simulado', 'plano, especificación de unión y pauta de seguridad', 'La unión indicada en la ficha difiere de la del plano.', 'revisión documental y consulta técnica'),
    ('Control de herramientas', 'inventario, manual y bitácora de inspección', 'Una herramienta figura disponible pese a una revisión pendiente.', 'reporte de condición y retiro preventivo simulado'),
    ('Metrología documental', 'plano acotado, registro de mediciones ficticias y tolerancias', 'Una lectura transcrita difiere del registro original.', 'comparación dimensional y reporte'),
    ('Mecánica de banco simulada', 'plano, ficha de pieza y pauta de calidad', 'La dimensión de la ficha no coincide con el plano.', 'verificación de antecedentes y consulta'),
    ('Lectura técnica', 'manual del fabricante, plano y registro de equipo', 'La referencia del manual corresponde a otra versión.', 'identificación de documento vigente'),
]
MACHINES = [
    ('Torneado simulado', 'plano de pieza, pauta de proceso y mediciones ficticias', 'Una medida registrada supera la tolerancia del plano.', 'control documental y reporte'),
    ('Fresado simulado', 'plano, ficha de herramienta y hoja de control', 'La herramienta de la ficha no corresponde al proceso aprobado.', 'revisión de compatibilidad y consulta'),
    ('Taladrado y rectificado simulados', 'plano, registro de pieza y pauta de calidad', 'Una terminación anotada difiere de la especificación.', 'identificación de desvío y reporte'),
    ('Mecanizado CNC documental', 'plano, programa validado y registro ficticio', 'La versión del programa no coincide con la orden de trabajo.', 'control de versión y derivación técnica'),
    ('Emprendimiento metalmecánico simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un control de seguridad previsto.', 'plan revisado y justificación'),
]
DIES = [
    ('Fabricación de matrices simulada', 'plano de matriz, ficha de material y pauta de calidad', 'El material de la ficha difiere del especificado.', 'revisión de correspondencia y consulta'),
    ('Fabricación de moldes simulada', 'plano de molde, detalle y mediciones ficticias', 'Una cota anotada difiere del detalle aprobado.', 'comparación dimensional y reporte'),
    ('Control de matrices y moldes', 'bitácora, manual y registro de inspección', 'Un molde figura disponible pese a una alerta pendiente.', 'revisión de condición y derivación técnica'),
    ('Diseño de moldes y matrices', 'plano, modelo y lista de componentes', 'Un componente del modelo no figura en la lista.', 'conciliación documental y justificación'),
    ('Emprendimiento de matricería simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un control de calidad previsto.', 'plan revisado y justificación'),
]
ELECTROMECHANICAL = [
    ('Mantenimiento industrial simulado', 'manual, bitácora y plan preventivo ficticio', 'La tarea registrada no coincide con la pauta del fabricante.', 'plan de mantenimiento revisado'),
    ('Diagnóstico industrial documental', 'diagramas, bitácora y registros de medición ficticios', 'La falla anotada corresponde a otro sistema.', 'reporte de diagnóstico y derivación'),
    ('Control de procesos simulado', 'diagrama, ficha de componentes y pauta de control', 'Un componente del registro no aparece en el diagrama.', 'verificación documental y reporte'),
    ('Montaje industrial simulado', 'plano, manual y registro de pruebas ficticio', 'La versión del plano no coincide con la orden.', 'control de versión y consulta'),
    ('Emprendimiento electromecánico simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un control de seguridad previsto.', 'plan revisado y justificación'),
]
TRACKS = (
    ('maquinas_herramientas', 'Mecánica Industrial, mención Máquinas-Herramientas', 'mecanica-industrial-maquinas', COMMON + MACHINES),
    ('matriceria', 'Mecánica Industrial, mención Matricería', 'mecanica-industrial-matriceria', COMMON + DIES),
    ('mantenimiento_electromecanico', 'Mecánica Industrial, mención Mantenimiento Electromecánico', 'mecanica-industrial-mantenimiento', COMMON + ELECTROMECHANICAL),
)


def draft_modules(track):
    key, title, slug, dossiers = next(entry for entry in TRACKS if entry[0] == track)
    rows = OFFICIAL[key]
    if any(row['extraction_status'] not in ('verified_web', 'pdf_ocr_review', 'pdf_cotejado') for row in rows):
        raise ValueError(f'Incomplete official curriculum for {track}')
    for item, content in build_draft(rows, dossiers, title, slug, SOURCE):
        content['specialty_source']['source_warnings'] = item['source_warnings']
        yield item, content


def install_mechanical_industry_drafts(con):
    generic = con.execute("SELECT id FROM courses WHERE title='Mecánica Industrial'").fetchone()
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
