"""Unpublished Administración mention drafts grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'administration_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/administracion.pdf'
COMMON = [
    ('Oficina contable simulada', 'resumen, comprobantes y libro auxiliar ficticios', 'Un comprobante no coincide con el saldo informado.', 'conciliación y observación documentada'),
    ('Gestión comercial simulada', 'orden de venta, registro tributario ficticio y pauta', 'La orden muestra una fecha distinta de la registrada.', 'revisión documental y consulta técnica'),
    ('Planificación administrativa', 'programa operativo, recursos y cronograma ficticios', 'Una tarea no dispone del recurso previsto en el plan.', 'reprogramación justificada y reporte de avance'),
    ('Atención de clientes simulada', 'solicitud, historial y protocolo de respuesta', 'La respuesta propuesta no aborda un requerimiento registrado.', 'respuesta revisada y derivación al responsable'),
    ('Organización de oficina', 'agenda, inventario y flujo de documentos', 'Un documento figura en una ubicación distinta de la registrada.', 'control de archivo y trazabilidad'),
    ('Gestión administrativa digital', 'planilla, documento y control de acceso ficticios', 'Una versión compartida no coincide con la aprobada.', 'control de versión y resguardo de información'),
]
LOGISTICS = [
    ('Planificación de almacenamiento', 'inventario, ficha de mercancía y plano de bodega', 'La ubicación asignada difiere del plano autorizado.', 'propuesta de almacenamiento y consulta técnica'),
    ('Operaciones de bodega simuladas', 'registro de entrada, guía y conteo ficticio', 'El conteo no coincide con la guía de recepción.', 'conciliación de existencias y observación'),
    ('Coordinación logística', 'pedido, ruta y cronograma ficticios', 'La ruta propuesta no cumple el plazo consignado.', 'plan de distribución revisado'),
    ('Comité de seguridad de bodega', 'mapa de riesgos, ficha de carga y pauta preventiva', 'Una carga aparece en una zona restringida.', 'reporte de riesgo y derivación al supervisor'),
    ('Emprendimiento logístico simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una etapa de almacenamiento.', 'plan de emprendimiento con costos revisados'),
]
HUMAN_RESOURCES = [
    ('Oficina de personas simulada', 'contrato ficticio, pauta y registro de cambios', 'Una fecha contractual difiere entre dos documentos.', 'observación documental y consulta a personal competente'),
    ('Cálculo de remuneraciones simulado', 'liquidación ficticia, planilla y registro de asistencia', 'Un dato base no coincide entre planilla y registro.', 'conciliación de antecedentes sin emitir asesoría legal'),
    ('Bienestar del personal', 'encuesta anónima, plan de apoyo y acta ficticia', 'Una necesidad detectada no aparece en el plan.', 'propuesta de mejora y resguardo de privacidad'),
    ('Dotación de personal simulada', 'perfil de cargo, solicitud y matriz de evaluación ficticios', 'Un criterio de selección no figura en el perfil aprobado.', 'matriz revisada y consulta al responsable'),
    ('Emprendimiento de servicios administrativos simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un recurso comprometido.', 'plan de emprendimiento con costos revisados'),
]
TRACKS = (
    ('logistica', 'Administración, mención Logística', 'administracion-logistica', COMMON + LOGISTICS),
    ('recursos_humanos', 'Administración, mención Recursos Humanos', 'administracion-recursos-humanos', COMMON + HUMAN_RESOURCES),
)


def draft_modules(track):
    key, title, slug, dossiers = next(entry for entry in TRACKS if entry[0] == track)
    for item, content in build_draft(OFFICIAL[key], dossiers, title, slug, SOURCE):
        content['specialty_source']['source_warnings'] = item['source_warnings']
        yield item, content


def install_administration_drafts(con):
    generic = con.execute("SELECT id FROM courses WHERE title='Administración'").fetchone()
    if generic and not con.execute('SELECT 1 FROM modules WHERE course_id=?', (generic['id'],)).fetchone():
        con.execute("UPDATE courses SET title=?,specialty=? WHERE id=?",
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


def install_administration_catalog(con):
    """Install both reviewed Administration mentions as complete courses."""
    generic = con.execute("SELECT id FROM courses WHERE title='Administración'").fetchone()
    if generic and not con.execute('SELECT 1 FROM modules WHERE course_id=?', (generic['id'],)).fetchone():
        con.execute("UPDATE courses SET title=?,specialty=? WHERE id=?",
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
        version_slug = 'administracion-logistica' if key == 'logistica' else 'administracion-recursos-humanos'
        install_course(con, title, draft_modules(key),
                       f'{version_slug}-mineduc-draft-v1', f'{version_slug}-mineduc-v1')
