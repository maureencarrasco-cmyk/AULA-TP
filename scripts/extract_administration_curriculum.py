"""Extract both official Administración mention plans from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
COMMON = [
    (1, 81753, 'Utilización de información contable', 152, 3),
    (2, 81754, 'Gestión comercial y tributaria', 152, 3),
    (3, 81755, 'Procesos administrativos', 190, 3),
    (4, 81756, 'Atención de clientes', 152, 3),
    (5, 81757, 'Organización de oficinas', 76, 3),
    (6, 81758, 'Aplicaciones informáticas para la gestión administrativa', 114, 3),
]
LOGISTICS = [
    (7, 81770, 'Operaciones de almacenamiento', 228, 4),
    (8, 81771, 'Operaciones de bodega', 228, 4),
    (9, 81772, 'Logística y distribución', 228, 4),
    (10, 81773, 'Seguridad en bodegas', 76, 4),
    (11, 81769, 'Emprendimiento y empleabilidad', 76, 4),
]
HUMAN_RESOURCES = [
    (7, 81775, 'Legislación laboral', 152, 4),
    (8, 81776, 'Cálculo de remuneración, finiquitos y obligaciones laborales', 228, 4),
    (9, 81777, 'Desarrollo y bienestar del personal', 228, 4),
    (10, 81778, 'Dotación de personal', 152, 4),
    (11, 81774, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34310_programa.pdf'


def common_from_pdf(position):
    if position == 3:
        title = 'Procesos administrativos'
        hours = 190
        oa = [
            {'code': 'OA 2', 'title': 'Elaborar un programa de actividades operativas de un departamento o área de una empresa, de acuerdo a orientaciones de la jefatura y/o del plan estratégico de gestión, considerando recursos humanos, insumos, equipamiento, distribución temporal y proyección de resultados.'},
            {'code': 'OA 3', 'title': 'Hacer seguimiento y elaborar informes del desarrollo de un programa operativo de un departamento o área de una empresa, en base a evidencias, aplicando técnicas apropiadas, considerando todos los elementos del programa.'},
        ]
        aes = [
            ('Analiza disponibilidad de recursos humanos, insumos, equipamiento y tiempos, teniendo en cuenta los requerimientos que señala el plan estratégico y las orientaciones de los superiores.', [
                'Verifica los distintos tipos de recursos disponibles para satisfacer los requerimientos en una unidad de trabajo, según las instrucciones superiores.',
                'Evalúa los plazos necesarios para realizar las actividades solicitadas en la unidad de trabajo, considerando los recursos disponibles y las instrucciones entregadas.',
                'Determina el equipo de trabajo necesario para la implementación de las tareas, considerando los recursos disponibles y orientaciones de sus superiores.',
            ]),
            ('Programa las actividades necesarias para alcanzar el objetivo planteado de un departamento o área, según orientaciones superiores y considerando los recursos disponibles y el plan estratégico de la organización.', [
                'Redacta detalladamente el programa, indicando las tareas necesarias para el logro de las actividades, considerando los recursos disponibles y las indicaciones superiores.',
                'Grafica la programación de las diferentes tareas, con los plazos establecidos, y los distintos recursos disponibles, utilizando software apropiados para ello y considerando las orientaciones de los superiores.',
                'Elabora informe escrito y presentación sobre programación realizada, considerando los recursos y el plan estratégico para informar a sus jefaturas.',
            ]),
            ('Realiza seguimiento de un programa operativo de trabajo, recopilando evidencias y empleando técnicas de verificación de avances, según procedimientos definidos.', [
                'Diseña una pauta o instrumento de chequeo y/o cotejo para verificar los avances de un programa de trabajo, considerando las indicaciones de sus superiores y el tipo de programa.',
                'Revisa de manera sistemática los avances del programa operativo, de acuerdo a las técnicas existentes, recabando las evidencias correspondientes.',
                'Registra los avances y/o retrasos del programa operativo en documento diseñado para ello, teniendo en cuenta todos los elementos definidos en la programación.',
            ]),
            ('Reporta a sus superiores los avances y/o retrasos del programa operativo de trabajo de un departamento, utilizando las evidencias, elementos y técnicas apropiadas.', [
                'Selecciona la información clave para elaborar reporte de avances y/o retrasos del programa operativo, según instrucciones de superiores.',
                'Redacta reporte ejecutivo y esquematizado de los avances y/o retrasos de un programa operativo de trabajo, en tiempo y forma solicitadas, utilizando software apropiados para ello.',
                'Presenta los avances y/o retrasos en la ejecución de un programa operativo de trabajo, utilizando las herramientas tecnológicas disponibles.',
            ]),
        ]
    elif position == 6:
        title = 'Aplicaciones informáticas para la gestión administrativa'
        hours = 114
        oa = [{'code': 'OA 6', 'title': 'Utilizar los equipos y herramientas tecnológicas utilizadas en la gestión administrativa, considerando un uso eficiente de la energía, de los materiales y de los insumos.'}]
        aes = [
            ('Utiliza equipos y herramientas tecnológicas existentes para el desarrollo de la gestión administrativa de acuerdo a estándares de eficiencia en el uso de materiales y de energía.', [
                'Maneja equipos tecnológicos necesarios para desempeñar sus funciones, teniendo en cuenta las demandas de la administración actual y los requerimientos de la organización.',
                'Resuelve problemas simples de los equipos tecnológicos que le corresponde usar, siguiendo las instrucciones del manual de los equipos.',
            ]),
            ('Utiliza internet y herramientas de comunicación social para el procesamiento y difusión de información según sea necesario para la organización.', [
                'Utiliza buscadores en línea, aplicando variadas estrategias de exploración para la obtención de información requerida por sus superiores.',
                'Usa aplicaciones web de trabajo en equipo para coordinar eficientemente el trabajo dentro y fuera de la organización, respetando las políticas institucionales.',
                'Aplica y actualiza los sistemas de seguridad contra amenazas en la red, para resguardar la información de la unidad de trabajo.',
            ]),
            ('Maneja a nivel intermedio software de propósito general, para desarrollar las tareas administrativas con eficiencia y eficacia.', [
                'Elabora documentos e informes con el procesador de textos Word, de manera ordenada considerando los criterios definidos para ello.',
                'Diseña informes, planillas de cálculo y bases de datos con el programa Excel, de acuerdo a requerimientos específicos de calidad y tiempo.',
                'Crea presentaciones dinámicas con el programa PowerPoint, para apoyar la entrega de información.',
            ]),
        ]
    else:
        raise ValueError(position)
    return {
        'position': position, 'title': title, 'hp': hours, 'year': '3° medio',
        'oa': oa,
        'aes': [{'code': f'M{position}-AE{n}', 'title': name,
                 'criteria': [f'{n}.{index} {value}' for index, value in enumerate(criteria, 1)]}
                for n, (name, criteria) in enumerate(aes, 1)],
        'source_page': f'https://www.curriculumnacional.cl/614/w3-article-{81752 + position}.html',
        'source_pdf': PDF_URL,
        'source_warnings': ['OA, AE y criterios transcritos del PDF oficial porque el sitio web no muestra la lista.'],
    }


def extract_track(specific):
    rows = [common_from_pdf(item[0]) if item[0] in (3, 6) else module(*item)
            for item in COMMON + specific]
    for row in rows:
        row['source_pdf'] = PDF_URL
    rows[5]['source_warnings'].append(
        'La tabla del PDF imprime 144 horas, pero la introducción del módulo indica 114; 114 permite el total oficial de 836 horas en 3° medio.'
    )
    if len(rows) != 11 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Administración mention plan differs from the official PDF')
    return rows


def main():
    tracks = {
        'logistica': extract_track(LOGISTICS),
        'recursos_humanos': extract_track(HUMAN_RESOURCES),
    }
    target = ROOT / 'administration_official.json'
    target.write_text(json.dumps(tracks, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for name, rows in tracks.items():
        print(name, len(rows), sum(len(row['aes']) for row in rows))


if __name__ == '__main__':
    main()
