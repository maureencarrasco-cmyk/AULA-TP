"""Mapas de fuentes técnicas de nivel 1–2 ya presentes en el repositorio.

No se añaden autores, normas, DOI ni URL que no estén comprobados en el código o
en docs/fuentes/tp-programas/manifest.json.
"""

SEC_RIC = 'https://www.sec.cl/reglamento-de-seguridad-de-las-instalaciones-de-consumo-de-energia-electrica-decreto-08/'
SEC_NORMAS = 'https://www.sec.cl/normas-tecnicas-electricas/'
RIC_N07 = 'https://www.sec.cl/sitio-web/wp-content/uploads/2021/03/RIC-N07-Instalaciones-de-Equipos-V1.1-1.pdf'
RSA = 'https://www.bcn.cl/leychile/Navegar?idNorma=71271'
SERNATUR_MDH = 'https://www.sernatur.cl/wp-content/uploads/2018/11/MDH-Alojamiento-Turi%CC%81stico-1.pdf'
DECREE = 'Decreto Supremo N° 452/2013 (marco curricular EMTP citado en los programas)'
NCH3241 = 'NCh3241/2011 Buenas prácticas en refrigeración (citada en el Programa MINEDUC; texto INN no incorporado)'
NCH353 = 'NCh353/2000 Cubicaciones (citada en el Programa MINEDUC; texto INN no incorporado)'
MINSAL_CITED = 'MINSAL (citado en AE del Programa MINEDUC de Enfermería; URL de guía específica no incorporada)'


def curricular_source(url, pdf='', title=''):
    rows = [{
        'type': 'curricular', 'name': 'MINEDUC · Programa de Estudio',
        'author': 'Ministerio de Educación de Chile', 'url': url or '',
        'pdf': pdf or '', 'year': 2015, 'level': 1,
        'use': 'OA, AE, criterios, horas y perfil de la especialidad',
        'evidence': 'A' if str(url).startswith('https://www.curriculumnacional.cl/') else 'C',
    }]
    if title:
        rows[0]['title'] = title
    rows.append({
        'type': 'curricular', 'name': DECREE, 'url': '',
        'year': 2013, 'level': 1,
        'use': 'Marco de la Formación Diferenciada TP',
        'evidence': 'B',
    })
    return rows


def _sec_pack():
    return [
        {'type': 'normativa', 'name': 'SEC · Pliegos RIC', 'url': SEC_RIC,
         'level': 2, 'use': 'Instalaciones eléctricas de consumo; no sustituye proyecto ni autorización',
         'evidence': 'A'},
        {'type': 'normativa', 'name': 'SEC · Normas técnicas eléctricas', 'url': SEC_NORMAS,
         'level': 2, 'use': 'Índice de pliegos; contrastar versión vigente antes de una instalación real',
         'evidence': 'A'},
        {'type': 'normativa', 'name': 'SEC · RIC N°07 instalaciones de equipos (PDF en auditoría del repo)',
         'url': RIC_N07, 'level': 2,
         'use': 'Equipos de consumo; no cubre todos los pliegos ni 220 V de proyecto',
         'evidence': 'B'},
    ]


def regulators_for(key):
    key = (key or '').lower()
    if key in ('electricidad', 'electronica'):
        return _sec_pack()
    if key in ('climate', 'refrigeracion', 'refrigeracion-climatizacion'):
        rows = [
            {'type': 'normativa', 'name': 'SEC · RIC (equipos e instalaciones de consumo)',
             'url': SEC_RIC, 'level': 2,
             'use': 'Contexto eléctrico de equipos; no sustituye proyecto ni autorización SEC',
             'evidence': 'A'},
            {'type': 'normativa', 'name': NCH3241, 'url': '', 'level': 3,
             'use': 'Buenas prácticas citadas por MINEDUC; no se usa un PDF INN no presente en el repo',
             'evidence': 'B'},
            {'type': 'normativa', 'name': NCH353, 'url': '', 'level': 3,
             'use': 'Cubicaciones citadas por MINEDUC; magnitudes del campus son simuladas',
             'evidence': 'B'},
        ]
        rows.append({'type': 'normativa', 'name': 'SEC · RIC N°07 (PDF en el repo)',
                     'url': RIC_N07, 'level': 2, 'use': 'Equipos; precisión de ficha de fabricante no incorporada',
                     'evidence': 'B'})
        return rows
    if key in ('enfermeria', 'atencion-enfermeria'):
        return [{'type': 'sector', 'name': MINSAL_CITED, 'url': '',
                 'level': 2, 'use': 'Ámbito de competencia y programas de salud del AE; no se inventa una guía OMS/MINSAL',
                 'evidence': 'B'}]
    if key in ('gastronomia', 'elaboracion-industrial-alimentos'):
        return [{'type': 'normativa', 'name': 'Reglamento sanitario de los alimentos (BCN)',
                 'url': RSA, 'level': 2, 'use': 'Inocuidad; no reemplaza autorización sanitaria local',
                 'evidence': 'A'}]
    if key in ('hoteleria', 'servicios-hoteleria', 'turismo', 'servicios-turismo'):
        return [{'type': 'sector', 'name': 'SERNATUR · Manual de destinos / alojamiento',
                 'url': SERNATUR_MDH, 'level': 2, 'use': 'Referente de alojamiento; no es norma única de calidad',
                 'evidence': 'B'}]
    return []


def second_source_label(specialty_key):
    rows = regulators_for(specialty_key)
    if not rows:
        return 'FUENTE NO VERIFICADA — no se inventa segunda fuente académica ni DOI'
    row = rows[0]
    extra = row['url'] if row.get('url') else 'sin URL en el repositorio'
    return f"{row['name']} ({extra})"


def norma_label(specialty_key):
    rows = regulators_for(specialty_key)
    if not rows:
        return ''
    return rows[0]['name']


def source_map(specialty_key, curriculum_url='', pdf=''):
    rows = curricular_source(curriculum_url, pdf)
    rows.extend(regulators_for(specialty_key))
    return rows


def governance(specialty_key, curriculum_url='', pdf=''):
    return {
        'status': 'En revisión',
        'internal_seal': None,
        'ia_generated_media': 'NO VALIDADO',
        'scope': (
            'Simulación documental de 3° y 4° medio TP. Los datos de casos son didácticos; '
            'no son valores normativos ni de fabricante. Falta validación de docente de especialidad '
            'y de multimedia 3D/video reales.'
        ),
        'source_map': source_map(specialty_key, curriculum_url, pdf),
    }
