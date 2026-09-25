"""Mapas de fuentes técnicas de nivel 1–2 ya presentes en el repositorio.

No se añaden autores, normas, DOI ni URL que no estén comprobados en el código o
en docs/fuentes/tp-programas/manifest.json.
"""

SEC_RIC = 'https://www.sec.cl/reglamento-de-seguridad-de-las-instalaciones-de-consumo-de-energia-electrica-decreto-08/'
RSA = 'https://www.bcn.cl/leychile/Navegar?idNorma=71271'
SERNATUR_MDH = 'https://www.sernatur.cl/wp-content/uploads/2018/11/MDH-Alojamiento-Turi%CC%81stico-1.pdf'
DECREE = 'Decreto Supremo N° 452/2013 (marco curricular EMTP citado en los programas)'


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


def regulators_for(key):
    key = (key or '').lower()
    if key in ('electricidad', 'electronica', 'electricidad'):
        return [{'type': 'normativa', 'name': 'SEC · Pliegos RIC', 'url': SEC_RIC,
                 'level': 2, 'use': 'Instalaciones eléctricas de consumo; no sustituye proyecto ni autorización',
                 'evidence': 'A'}]
    if key in ('climate', 'refrigeracion', 'refrigeracion-climatizacion'):
        return [{'type': 'normativa', 'name': 'SEC · RIC (equipos e instalaciones de consumo)',
                 'url': SEC_RIC, 'level': 2,
                 'use': 'Contexto eléctrico de equipos; NCh3241 se cita en el programa MINEDUC, texto INN no incorporado',
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
