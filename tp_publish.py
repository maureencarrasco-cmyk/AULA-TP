"""Publish remaining MINEDUC-backed drafts once they pass publication_gaps."""

from tp_draft_builder import install_course


def _count_unpublished(con, title):
    row = con.execute(
        '''SELECT COUNT(*) FROM modules m JOIN courses c ON c.id=m.course_id
           WHERE c.title=? AND m.published=0''',
        (title,),
    ).fetchone()
    return row[0]


def _publish(con, title, modules, slug):
    if not _count_unpublished(con, title):
        return
    install_course(
        con, title, modules,
        f'{slug}-mineduc-draft-v1',
        f'{slug}-mineduc-v1',
    )


def publish_remaining_courses(con):
    from accounting_catalog import draft_modules as accounting_modules
    from aircraft_catalog import TITLE as AIRCRAFT_TITLE, draft_modules as aircraft_modules
    from aquaculture_catalog import draft_modules as aquaculture_modules
    from automotive_catalog import draft_modules as automotive_modules
    from drawing_catalog import draft_modules as drawing_modules
    from early_childhood_catalog import draft_modules as parvulos_modules
    from electronics_catalog import draft_modules as electronics_modules
    from fisheries_catalog import draft_modules as fisheries_modules
    from food_industry_catalog import draft_modules as food_modules
    from forestry_catalog import draft_modules as forestry_modules
    from furniture_catalog import draft_modules as furniture_modules
    from geology_catalog import draft_modules as geology_modules
    from graphics_catalog import draft_modules as graphics_modules
    from merchant_crew_catalog import draft_modules as crew_modules
    from metallurgy_catalog import draft_modules as metallurgy_modules
    from metalworks_catalog import draft_modules as metalworks_modules
    from mining_catalog import draft_modules as mining_modules
    from networks_catalog import draft_modules as networks_modules
    from port_catalog import draft_modules as port_modules
    from programming_catalog import draft_modules as programming_modules
    from sanitary_catalog import draft_modules as sanitary_modules
    from telecom_catalog import draft_modules as telecom_modules
    from textile_catalog import draft_modules as textile_modules
    from tourism_catalog import draft_modules as tourism_modules
    from assembly_catalog import draft_modules as assembly_modules

    singles = [
        ('Acuicultura', aquaculture_modules, 'acuicultura'),
        ('Operaciones Portuarias', port_modules, 'operaciones-portuarias'),
        ('Pesquería', fisheries_modules, 'pesqueria'),
        ('Tripulación de Naves Mercantes y Especiales', crew_modules, 'tripulacion-naves-mercantes-especiales'),
        ('Construcciones Metálicas', metalworks_modules, 'construcciones-metalicas'),
        ('Mecánica Automotriz', automotive_modules, 'mecanica-automotriz'),
        (AIRCRAFT_TITLE, aircraft_modules, 'mecanica-mantenimiento-aeronaves'),
        ('Asistencia en Geología', geology_modules, 'asistencia-geologia'),
        ('Explotación Minera', mining_modules, 'explotacion-minera'),
        ('Metalurgia Extractiva', metallurgy_modules, 'metalurgia-extractiva'),
        ('Atención de Párvulos', parvulos_modules, 'atencion-parvulos'),
        ('Conectividad y Redes', networks_modules, 'redes'),
        ('Programación', programming_modules, 'programacion'),
        ('Telecomunicaciones', telecom_modules, 'telecomunicaciones'),
        ('Contabilidad', accounting_modules, 'contabilidad'),
        ('Elaboración Industrial de Alimentos', food_modules, 'elaboracion-industrial-alimentos'),
        ('Vestuario y Confección Textil', textile_modules, 'vestuario-confeccion-textil'),
        ('Instalaciones Sanitarias', sanitary_modules, 'sanitarias'),
        ('Montaje Industrial', assembly_modules, 'montaje'),
        ('Electrónica', electronics_modules, 'electronica'),
        ('Dibujo Técnico', drawing_modules, 'dibujo'),
        ('Gráfica', graphics_modules, 'grafica'),
        ('Servicios de Turismo', tourism_modules, 'turismo'),
        ('Forestal', forestry_modules, 'forestal'),
        ('Muebles y Terminaciones en Madera', furniture_modules, 'muebles-terminaciones-madera'),
    ]
    for title, builder, slug in singles:
        _publish(con, title, builder(), slug)

    from administration_catalog import TRACKS as ADMIN_TRACKS, draft_modules as admin_modules
    from agriculture_catalog import TRACKS as AGRO_TRACKS, draft_modules as agro_modules
    from construction_catalog import TRACKS as BUILD_TRACKS, draft_modules as build_modules
    from chemical_industry_catalog import TRACKS as CHEM_TRACKS, draft_modules as chem_modules
    from mechanical_industry_catalog import TRACKS as MECH_TRACKS, draft_modules as mech_modules
    for tracks, builder in (
        (ADMIN_TRACKS, admin_modules),
        (AGRO_TRACKS, agro_modules),
        (BUILD_TRACKS, build_modules),
        (CHEM_TRACKS, chem_modules),
        (MECH_TRACKS, mech_modules),
    ):
        for key, title, slug, _dossiers in tracks:
            _publish(con, title, builder(key), slug)

    from specialty_catalog import publish_unpublished_electricity
    publish_unpublished_electricity(con)
    drop_empty_nursing_shells(con)
    drop_empty_courses(con)
    enroll_everyone_in_published_courses(con)


def drop_empty_nursing_shells(con):
    """Remove leftover empty Enfermería titles that duplicate the published mentions."""
    titles = (
        'Atención de Enfermería · Plan común',
        'Atención de Enfermería · Mención Adulto Mayor',
        'Atención de Enfermería · Mención Enfermería',
    )
    for title in titles:
        row = con.execute('SELECT id FROM courses WHERE title=?', (title,)).fetchone()
        if not row:
            continue
        course_id = row['id']
        modules = list(con.execute(
            'SELECT id,published,content FROM modules WHERE course_id=?', (course_id,)
        ))
        if any(module['published'] or (module['content'] or '').strip() not in ('', '{}', 'null')
               for module in modules):
            continue
        if con.execute(
            '''SELECT 1 FROM progress p JOIN modules m ON m.id=p.module_id
               WHERE m.course_id=? LIMIT 1''',
            (course_id,),
        ).fetchone():
            continue
        con.execute('DELETE FROM enrollments WHERE course_id=?', (course_id,))
        con.execute('DELETE FROM modules WHERE course_id=?', (course_id,))
        con.execute('DELETE FROM courses WHERE id=?', (course_id,))


def drop_empty_courses(con):
    rows = list(con.execute('SELECT id FROM courses'))
    for row in rows:
        course_id = row['id']
        if con.execute('SELECT COUNT(*) FROM modules WHERE course_id=?', (course_id,)).fetchone()[0]:
            continue
        con.execute('DELETE FROM enrollments WHERE course_id=?', (course_id,))
        con.execute('DELETE FROM courses WHERE id=?', (course_id,))


def enroll_everyone_in_published_courses(con):
    users = [row['id'] for row in con.execute('SELECT id FROM users')]
    courses = [
        row['id'] for row in con.execute(
            '''SELECT c.id FROM courses c
               WHERE EXISTS (SELECT 1 FROM modules m WHERE m.course_id=c.id AND m.published=1)
                 AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.course_id=c.id AND m.published=0)'''
        )
    ]
    for user_id in users:
        for course_id in courses:
            con.execute(
                'INSERT OR IGNORE INTO enrollments(user_id,course_id) VALUES(?,?)',
                (user_id, course_id),
            )
