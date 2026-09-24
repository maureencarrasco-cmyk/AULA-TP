"""Extract the three official Mecánica Industrial mention plans."""

import json
from copy import deepcopy
from pathlib import Path

from extract_programming_curriculum import module, oa_from_page
from pdf_ocr_curriculum import extract_tables


ROOT = Path(__file__).resolve().parents[1]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34328_programa.pdf'
COMMON = [
    (1, 81997, 'Soldadura', 190, 3),
    (2, 81998, 'Mantenimiento de herramientas', 190, 3),
    (3, 81999, 'Medición y verificación', 190, 3),
    (4, 82000, 'Mecánica de banco', 152, 3),
    (5, 82001, 'Lectura de manuales y planos', 114, 3),
]
ELECTROMECHANICAL = [
    (6, 81973, 'Mantenimiento y reparación industrial', 228, 4),
    (7, 81974, 'Detección de fallas en sistemas industriales', 152, 4),
    (8, 81975, 'Control de procesos industriales', 228, 4),
    (9, 81976, 'Montaje de equipos y sistemas industriales', 152, 4),
    (10, 81972, 'Emprendimiento y empleabilidad', 76, 4),
]
MACHINES = [
    (6, 81978, 'Torneado de piezas y conjuntos mecánicos', 228, 4),
    (7, 81979, 'Fresado de piezas y conjuntos mecánicos', 228, 4),
    (8, 81980, 'Taladrado y rectificado de piezas mecánicas', 76, 4),
    (9, 81981, 'Mecanizado con máquinas de control numérico computacional', 228, 4),
    (10, 81977, 'Emprendimiento y empleabilidad', 76, 4),
]
DIES = [
    (6, 81983, 'Fabricación de matrices', 190, 4),
    (7, 81984, 'Fabricación de moldes', 190, 4),
    (8, 81985, 'Mantención de matrices y moldes', 190, 4),
    (9, 81986, 'Diseño y dibujo de moldes y matrices', 190, 4),
    (10, 81982, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_PAGES = {6: [103, 104, 105], 7: [115, 116], 8: [125, 126], 9: [135, 136, 137]}
MISSING_AE_TITLES = {
    (6, '4'): ('Repone o repara partes y piezas de los sistemas mecánicos, electromecánicos, '
               'hidráulicos y neumáticos de equipos o máquinas industriales, de acuerdo a las '
               'especificaciones establecidas en el manual de fabricación y el respeto a la '
               'normativa de seguridad y de protección al medio ambiente.'),
}


def pdf_module(position, article, title, hours, grade):
    aes, criteria = extract_tables(ROOT / 'docs/fuentes/tp-programas/mecanica-industrial.pdf', PDF_PAGES[position])
    titles = {row['code']: row['title'] for row in aes}
    titles.update({code: value for (number, code), value in MISSING_AE_TITLES.items()
                   if number == position})
    grouped = {}
    for row in criteria:
        grouped.setdefault(row['code'].split('.')[0], []).append(f"{row['code']} {row['title']}")
    if set(titles) != set(grouped) or not titles:
        raise ValueError(f'PDF OCR missed an AE in mechanical module {position}')
    return {
        'position': position, 'title': title, 'hp': hours, 'year': f'{grade}° medio',
        'oa': oa_from_page(article),
        'aes': [{'code': f'M{position}-AE{code}', 'title': titles[code], 'criteria': grouped[code]}
                for code in sorted(titles, key=int)],
        'source_page': f'https://www.curriculumnacional.cl/614/w3-article-{article}.html',
        'source_pdf': PDF_URL,
        'source_pdf_pages': PDF_PAGES[position],
        'source_warnings': ['AE y criterios leídos visualmente del PDF oficial; pendiente revisión humana de la transcripción OCR.'],
        'extraction_status': 'pdf_ocr_review',
    }


def extract_track(specific):
    rows = []
    for position, article, title, hours, grade in COMMON + specific:
        try:
            row = module(position, article, title, hours, grade)
            row['extraction_status'] = 'verified_web'
        except ValueError:
            if position in PDF_PAGES:
                row = pdf_module(position, article, title, hours, grade)
            elif position == 10:
                row = deepcopy(json.loads((ROOT / 'programming_official.json').read_text(encoding='utf-8'))[-1])
                row.update({'position': position, 'title': title, 'hp': hours,
                            'year': f'{grade}° medio',
                            'source_page': f'https://www.curriculumnacional.cl/614/w3-article-{article}.html',
                            'source_pdf': PDF_URL,
                            'source_warnings': ['El módulo común de emprendimiento se vincula con OA genéricos; se cotejó con el PDF oficial de Mecánica Industrial.'],
                            'extraction_status': 'pdf_cotejado'})
                for ae in row['aes']:
                    ae['code'] = f'M{position}-AE{ae["code"].split("-AE")[-1]}'
            else:
                raise
        rows.append(row)
    for row in rows:
        row['source_pdf'] = PDF_URL
        if row['position'] == len(rows) and not row['oa']:
            row['source_warnings'].append(
                'El módulo común de emprendimiento se vincula con OA genéricos, no con OA de especialidad.'
            )
    if any(sum(row['hp'] for row in rows if row['year'] == grade) != 836
           for grade in ('3° medio', '4° medio')):
        raise ValueError('Mecánica Industrial mention plan differs from the official PDF')
    return rows


def main():
    tracks = {
        'mantenimiento_electromecanico': extract_track(ELECTROMECHANICAL),
        'maquinas_herramientas': extract_track(MACHINES),
        'matriceria': extract_track(DIES),
    }
    target = ROOT / 'mechanical_industry_official.json'
    target.write_text(json.dumps(tracks, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for name, rows in tracks.items():
        print(name, len(rows), sum(len(row['aes']) for row in rows),
              'pdf_ocr_review', [row['position'] for row in rows if row['extraction_status'] == 'pdf_ocr_review'])


if __name__ == '__main__':
    main()
