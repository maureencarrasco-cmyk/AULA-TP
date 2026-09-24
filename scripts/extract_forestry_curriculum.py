"""Extract official Forestal modules and outcomes from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81945, 'Producción de plantas y repoblación', 228, 3),
    (2, 81946, 'Mediciones forestales', 228, 3),
    (3, 81947, 'Control de plagas y enfermedades forestales', 228, 3),
    (4, 81948, 'Uso y mantenimiento de herramientas y máquinas', 152, 3),
    (5, 81949, 'Operaciones silvícolas', 228, 4),
    (6, 81950, 'Operaciones de cosecha forestal', 152, 4),
    (7, 81951, 'Control de la producción forestal', 152, 4),
    (8, 81952, 'Técnicas de prevención y combate de incendios forestales', 228, 4),
    (9, 81944, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34326_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Forestal plan differs from the official PDF')
    target = ROOT / 'forestry_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
