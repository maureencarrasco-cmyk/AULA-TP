"""Official TP specialty index; unpublished courses have no invented modules."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
TITLES = {
    'administracion': 'Administración',
    'contabilidad': 'Contabilidad',
    'agropecuaria': 'Agropecuaria',
    'elaboracion-industrial-alimentos': 'Elaboración Industrial de Alimentos',
    'gastronomia': 'Gastronomía',
    'vestuario-confeccion-textil': 'Vestuario y Confección Textil',
    'construccion': 'Construcción',
    'instalaciones-sanitarias': 'Instalaciones Sanitarias',
    'montaje-industrial': 'Montaje Industrial',
    'refrigeracion-climatizacion': 'Refrigeración y Climatización',
    'electricidad': 'Electricidad',
    'electronica': 'Electrónica',
    'dibujo-tecnico': 'Dibujo Técnico',
    'grafica': 'Gráfica',
    'servicios-hoteleria': 'Servicios de Hotelería',
    'servicios-turismo': 'Servicios de Turismo',
    'forestal': 'Forestal',
    'muebles-terminaciones-madera': 'Muebles y Terminaciones en Madera',
    'acuicultura': 'Acuicultura',
    'operaciones-portuarias': 'Operaciones Portuarias',
    'pesqueria': 'Pesquería',
    'tripulacion-naves-mercantes-especiales': 'Tripulación de Naves Mercantes y Especiales',
    'construcciones-metalicas': 'Construcciones Metálicas',
    'mecanica-automotriz': 'Mecánica Automotriz',
    'mecanica-mantenimiento-aeronaves': 'Mecánica de Mantenimiento de Aeronaves',
    'mecanica-industrial': 'Mecánica Industrial',
    'asistencia-geologia': 'Asistencia en Geología',
    'explotacion-minera': 'Explotación Minera',
    'metalurgia-extractiva': 'Metalurgia Extractiva',
    'quimica-industrial': 'Química Industrial',
    'atencion-enfermeria': 'Atención de Enfermería',
    'atencion-parvulos': 'Atención de Párvulos',
    'conectividad-redes': 'Conectividad y Redes',
    'programacion': 'Programación',
    'telecomunicaciones': 'Telecomunicaciones',
}
PUBLISHED = set(TITLES)
MENTION_DRAFTS = {'administracion', 'agropecuaria', 'construccion', 'quimica-industrial', 'mecanica-industrial'}


def official_programs():
    manifest = json.loads((ROOT / 'docs/fuentes/tp-programas/manifest.json').read_text(encoding='utf-8'))
    if len(manifest) != 35 or {item['slug'] for item in manifest} != TITLES.keys():
        raise ValueError('The official TP program index is incomplete')
    return manifest


def install_pending_courses(con):
    """Add catalog entries without presenting unreviewed content as a course."""
    student = con.execute("SELECT id FROM users WHERE role='student' ORDER BY id LIMIT 1").fetchone()
    for item in official_programs():
        slug = item['slug']
        if slug in PUBLISHED or slug in MENTION_DRAFTS:
            continue
        title = TITLES[slug]
        row = con.execute('SELECT id FROM courses WHERE title=?', (title,)).fetchone()
        if row:
            course_id = row['id']
        else:
            course_id = con.execute(
                'INSERT INTO courses(title,specialty,level) VALUES(?,?,?)',
                (title, title, '3° y 4° medio'),
            ).lastrowid
        if student:
            con.execute('INSERT OR IGNORE INTO enrollments(user_id,course_id) VALUES(?,?)',
                        (student['id'], course_id))
