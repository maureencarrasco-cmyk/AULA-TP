"""Extract official Metalurgia Extractiva modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 82032, 'Laboratorio y análisis químico', 190, 3),
    (2, 82033, 'Muestreo y control de procesos', 190, 3),
    (3, 82034, 'Control de inventario', 228, 3),
    (4, 82035, 'Legislación y prevención de riesgos en la minería', 228, 3),
    (5, 82036, 'Transformación mecánica de los minerales', 152, 4),
    (6, 82037, 'Acondicionamiento químico de los minerales', 190, 4),
    (7, 82038, 'Técnicas de hidrometalurgia', 228, 4),
    (8, 82039, 'Fundición y refinería', 190, 4),
    (9, 82031, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34332_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Metalurgia Extractiva plan differs from the official PDF')
    target = ROOT / 'metallurgy_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
