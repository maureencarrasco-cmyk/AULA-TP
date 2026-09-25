"""Unpublished aircraft-maintenance draft based on its own MINEDUC PDF."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'aircraft_official.json').read_text(encoding='utf-8'))
TITLE = 'Mecánica de Mantenimiento de Aeronaves'
SOURCE = 'docs/fuentes/tp-programas/mecanica-mantenimiento-aeronaves.pdf'
DOSSIERS = [
    ('Inspección estructural simulada', 'manual del fabricante, plano estructural y registro ficticio', 'La zona registrada no coincide con el plano.', 'reporte de discrepancia y consulta autorizada'),
    ('Diagnóstico documental de aviónica', 'diagrama, bitácora ficticia y manual de mantenimiento', 'Un síntoma anotado corresponde a otro sistema.', 'análisis de evidencia y derivación técnica'),
    ('Control de vuelo simulado', 'esquema de superficies, bitácora y pauta de inspección', 'Una referencia del esquema difiere del registro.', 'revisión documental y aviso al responsable'),
    ('Lectura de inglés técnico', 'extracto de manual en inglés, glosario y esquema', 'Una traducción cambia el sentido de una advertencia.', 'interpretación contrastada y consulta'),
    ('Control de documentación técnica', 'manual vigente, revisión anterior y registro de tarea', 'El registro cita una revisión obsoleta.', 'identificación de versión aplicable'),
    ('Normativa aeronáutica simulada', 'extracto normativo, bitácora y formulario ficticio', 'El formulario no corresponde al tipo de registro.', 'análisis de cumplimiento y reporte'),
    ('Motor recíproco simulado', 'diagrama, manual y bitácora de falla ficticia', 'El componente señalado difiere del diagrama.', 'identificación de discrepancia y derivación'),
    ('Motor a reacción simulado', 'diagrama de sistema, manual y registro ficticio', 'La unidad registrada no coincide con la configuración.', 'comparación documental y aviso'),
    ('Sistemas de aeronave simulados', 'esquema, bitácora y lista de chequeo', 'Una alerta aparece en la bitácora pero no en la lista.', 'conciliación de antecedentes y reporte'),
    ('Inglés técnico de motores', 'extracto de manual en inglés, diagrama y glosario', 'Una instrucción interpretada no coincide con el diagrama.', 'lectura contrastada y consulta'),
    ('Emprendimiento aeronáutico simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida normativa prevista.', 'plan revisado y justificación'),
]


def draft_modules():
    if len(OFFICIAL) != 11 or any(not row['aes'] for row in OFFICIAL):
        raise ValueError('Incomplete aircraft curriculum')
    for item, content in build_draft(OFFICIAL, DOSSIERS, TITLE, 'mecanica-mantenimiento-aeronaves', SOURCE):
        content['specialty_source']['source_warnings'] = item['source_warnings']
        content['specialty_source']['extraction_status'] = item['extraction_status']
        content['specialty_source']['source_pdf_pages'] = item['source_pdf_pages']
        yield item, content


def install_aircraft_draft(con):
    course = con.execute('SELECT id FROM courses WHERE title=?', (TITLE,)).fetchone()
    if not course:
        course_id = con.execute('INSERT INTO courses(title,specialty,level) VALUES(?,?,?)',
                                (TITLE, TITLE, '3° y 4° medio')).lastrowid
    else:
        course_id = course['id']
    student = con.execute("SELECT id FROM users WHERE role='student' ORDER BY id LIMIT 1").fetchone()
    if student:
        con.execute('INSERT OR IGNORE INTO enrollments(user_id,course_id) VALUES(?,?)',
                    (student['id'], course_id))
    install_draft(con, TITLE, draft_modules())


def install_aircraft_course(con):
    install_course(con, TITLE, draft_modules(),
                   'mecanica-mantenimiento-aeronaves-mineduc-draft-v1',
                   'mecanica-mantenimiento-aeronaves-mineduc-v1')
