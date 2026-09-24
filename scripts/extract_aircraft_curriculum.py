"""Extract the official Mecánica de Mantenimiento de Aeronaves plan."""

import json
from pathlib import Path

from extract_programming_curriculum import oa_from_page
from pdf_ocr_curriculum import extract_tables


ROOT = Path(__file__).resolve().parents[1]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-37245_programa.pdf'
MODULES = [
    (1, 82003, 'Reparación y remplazo de elementos estructurales de la aeronave', 228, 3),
    (2, 82004, 'Detección de fallas en instrumentos y sistemas de navegación y comunicación de la aeronave', 228, 3),
    (3, 82005, 'Mantenimiento de los controles de vuelo de la aeronave', 152, 3),
    (4, 82006, 'Inglés técnico de estructura, controles de vuelo y sistemas de navegación y comunicación de la aeronave', 76, 3),
    (5, 82007, 'Lectura e interpretación de manuales de mantenimiento de aeronaves', 76, 3),
    (6, 82008, 'Normativa de mantenimiento aeronáutico', 76, 3),
    (7, 82009, 'Mantenimiento de las unidades y sistemas asociados al motor recíproco', 228, 4),
    (8, 82010, 'Mantenimiento de las unidades y sistemas asociados al motor a reacción', 228, 4),
    (9, 82011, 'Mantenimiento de los sistemas de la aeronave', 228, 4),
    (10, 82012, 'Inglés técnico de mantenimiento de aeronaves', 76, 4),
    (11, 82002, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_PAGES = {
    1: [45, 46],
    2: [55, 56],
    3: [65, 66],
    4: [76, 77],
    5: [86, 87],
    6: [97, 98],
    7: [106, 107, 108],
    8: [117, 118, 119],
    9: [130, 131, 132],
    10: [141, 142],
    11: [152, 153, 154],
}
MISSING_AE_TITLES = {
    (2, '3'): ('Determina fallas en el funcionamiento de los instrumentos y de los sistemas '
               'de navegación y de comunicación de la aeronave, utilizando equipos, '
               'herramientas e instrumentos de medición de acuerdo a las discrepancias informadas.'),
    (8, '1'): ('Desmonta y monta las unidades y sistemas asociados del motor a reacción, '
               'para analizar su función en el motor y en la aeronave, utilizando '
               'herramientas y equipos apropiados de acuerdo a especificaciones del manual de mantenimiento.'),
    (9, '2'): ('Diagnostica el funcionamiento de los sistemas de la aeronave considerando '
               'los principios físicos de cada sistema, de acuerdo a los procedimientos '
               'de mantenimiento preventivo y correctivo establecidos en el manual de mantenimiento.'),
}


def pdf_module(position, article, title, hours, grade):
    ae_blocks, criteria_blocks = extract_tables(
        ROOT / 'docs/fuentes/tp-programas/mecanica-mantenimiento-aeronaves.pdf',
        PDF_PAGES[position],
    )
    titles = {block['code']: block['title'] for block in ae_blocks}
    titles.update({code: value for (number, code), value in MISSING_AE_TITLES.items()
                   if number == position})
    by_ae = {}
    for block in criteria_blocks:
        number = block['code'].split('.')[0]
        by_ae.setdefault(number, []).append(f"{block['code']} {block['title']}")
    if set(titles) != set(by_ae) or sorted(map(int, titles)) != list(range(1, len(titles) + 1)):
        raise ValueError(f'PDF OCR missed an AE in aircraft module {position}')
    aes = [{'code': f'M{position}-AE{number}', 'title': titles[number],
            'criteria': by_ae[number]} for number in sorted(titles, key=int)]
    return {
        'position': position, 'title': title, 'hp': hours, 'year': f'{grade}° medio',
        'oa': oa_from_page(article), 'aes': aes,
        'source_page': f'https://www.curriculumnacional.cl/614/w3-article-{article}.html',
        'source_warnings': [
            'AE y criterios leídos visualmente del PDF oficial; pendiente revisión humana de la transcripción OCR.'
        ],
        'extraction_status': 'pdf_ocr_review',
        'source_pdf_pages': PDF_PAGES[position],
    }


def main():
    rows = [pdf_module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
        if row['position'] == len(rows) and not row['oa']:
            row['source_warnings'].append(
                'El módulo común de emprendimiento se vincula con OA genéricos, no con OA de especialidad.'
            )
    if any(sum(row['hp'] for row in rows if row['year'] == grade) != 836
           for grade in ('3° medio', '4° medio')):
        raise ValueError('Mecánica de Mantenimiento de Aeronaves differs from the official PDF')
    target = ROOT / 'aircraft_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(len(rows), sum(len(row['aes']) for row in rows),
          'pdf_ocr_review', [row['position'] for row in rows if row['extraction_status'] == 'pdf_ocr_review'])


if __name__ == '__main__':
    main()
