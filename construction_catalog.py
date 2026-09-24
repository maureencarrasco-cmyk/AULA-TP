"""Unpublished Construcción mention drafts grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'construction_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/construccion.pdf'
COMMON = [
    ('Laboratorio de materiales simulado', 'ficha de muestra, ensayo y especificación técnica', 'El código de la muestra no coincide con el registro.', 'conciliación de evidencia y reporte'),
    ('Planificación de instalación de faenas', 'plano, listado de materiales y pauta de seguridad', 'Un elemento del plano no figura en la lista.', 'revisión de correspondencia y consulta técnica'),
    ('Bodega de obra simulada', 'inventario, manuales y registro de movimientos', 'Un equipo figura disponible pese a una revisión pendiente.', 'control documental y aviso al responsable'),
    ('Cubicación documental', 'plano acotado, presupuesto y planilla de cantidades', 'Una superficie calculada difiere de la indicada en el plano.', 'cálculo revisado y justificación'),
    ('Lectura de planos', 'planos de arquitectura y estructura y simbología', 'La referencia de una lámina no coincide con su detalle.', 'identificación de discrepancia y consulta'),
    ('Comité de prevención simulado', 'matriz de riesgos, señalización y pauta normativa', 'La señal registrada no corresponde al riesgo descrito.', 'análisis de riesgo y propuesta preventiva'),
    ('Revisión de trazado', 'plano, cotas y registro de levantamiento ficticio', 'La cota del registro difiere de la del plano aprobado.', 'verificación documental y derivación técnica'),
]
EDIFICATION = [
    ('Revisión de albañilería', 'plano estructural, ficha de materiales y pauta de calidad', 'La partida descrita difiere de la especificación.', 'observación técnica documentada'),
    ('Carpintería estructural simulada', 'plano, detalle de uniones y lista de materiales', 'Una unión propuesta no coincide con el detalle aprobado.', 'revisión del detalle y consulta técnica'),
    ('Revisión de enfierradura', 'plano de armaduras, planilla y registro de inspección', 'Un elemento anotado no aparece en la planilla.', 'conciliación documental y aviso al responsable'),
    ('Control de hormigón', 'especificación, ficha de lote y registro de ensayo', 'El lote de ensayo no coincide con la partida.', 'control de trazabilidad y reporte'),
    ('Emprendimiento de edificación simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida de prevención prevista.', 'plan revisado y justificación'),
]
FINISHING = [
    ('Revisión de aislación', 'detalle constructivo, ficha de material y pauta de inspección', 'El material registrado difiere del especificado.', 'observación de calidad y consulta'),
    ('Control de cubierta simulado', 'plano de cubierta, ficha de producto y pauta de seguridad', 'Un punto de evacuación no coincide con el plano.', 'identificación de desvío y reporte'),
    ('Instalación de elementos simulada', 'plano, ficha de puerta o ventana y registro de medidas', 'Una medida de la ficha difiere del plano.', 'comparación dimensional documentada'),
    ('Revisión de revestimientos', 'especificación de terminaciones, muestra y planilla', 'El revestimiento indicado no coincide con el recinto.', 'revisión de partida y consulta técnica'),
    ('Emprendimiento de terminaciones simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un control de calidad previsto.', 'plan revisado y justificación'),
]
ROADS = [
    ('Control de calidad vial', 'especificaciones, ensayos y registro de tramo', 'El identificador del ensayo no coincide con el tramo.', 'conciliación de evidencia y reporte'),
    ('Análisis de seguridad vial', 'plano de señalización, matriz de riesgos y normativa', 'Una señal del plano no corresponde al riesgo descrito.', 'propuesta preventiva justificada'),
    ('Mantenimiento vial simulado', 'bitácora, plano y ficha de deterioro ficticia', 'La ubicación del deterioro cambia entre registros.', 'priorización documentada y consulta'),
    ('Control de calzada', 'perfil vial, planilla de cantidades y pauta de calidad', 'Una dimensión de la planilla difiere del perfil.', 'comparación de antecedentes y reporte'),
    ('Protección de calzada', 'plano de drenaje, ficha de obra y registro de inspección', 'Un elemento registrado no figura en el plano.', 'observación técnica documentada'),
    ('Emprendimiento vial simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida de seguridad prevista.', 'plan revisado y justificación'),
]
TRACKS = (
    ('edificacion', 'Construcción, mención Edificación', 'construccion-edificacion', COMMON + EDIFICATION),
    ('terminaciones', 'Construcción, mención Terminaciones de la Construcción', 'construccion-terminaciones', COMMON + FINISHING),
    ('obras_viales', 'Construcción, mención Obras Viales e Infraestructura', 'construccion-obras-viales', COMMON + ROADS),
)


def draft_modules(track):
    key, title, slug, dossiers = next(entry for entry in TRACKS if entry[0] == track)
    for item, content in build_draft(OFFICIAL[key], dossiers, title, slug, SOURCE):
        content['specialty_source']['source_warnings'] = item['source_warnings']
        yield item, content


def install_construction_drafts(con):
    generic = con.execute("SELECT id FROM courses WHERE title='Construcción'").fetchone()
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
