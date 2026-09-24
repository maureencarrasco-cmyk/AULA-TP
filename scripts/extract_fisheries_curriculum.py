"""Extract official Pesquería modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 82059, 'Navegación y meteorología', 228, 3),
    (2, 82060, 'Armado, mantenimiento y reparación de implementos de pesca', 228, 3),
    (3, 82061, 'Tratamientos de conservación y manipulación de recursos hidrobiológicos', 228, 3),
    (4, 82062, 'Prevención de riesgos en el mar', 152, 3),
    (5, 82063, 'Primeros auxilios', 152, 4),
    (6, 82064, 'Maniobras y operación de artes de pesca', 228, 4),
    (7, 82065, 'Gestión de planes y proyectos de manejo y emprendimiento pesquero', 228, 4),
    (8, 82066, 'Comunicaciones marítimas', 152, 4),
    (9, 82058, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34308_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Pesquería plan differs from the official PDF')
    target = ROOT / 'fisheries_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
