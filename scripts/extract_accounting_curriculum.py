"""Extract the official Accounting module data from MINEDUC pages."""

import json

from extract_programming_curriculum import module
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81760, 'Contabilización de operaciones comerciales', 228, 3),
    (2, 81761, 'Cálculo y registro de remuneraciones', 228, 3),
    (3, 81762, 'Control y procesamiento de información contable', 228, 3),
    (4, 81763, 'Organización y métodos de trabajo en la oficina', 76, 3),
    (5, 81764, 'Atención de clientes', 76, 3),
    (6, 81765, 'Elaboración de informes contables', 152, 4),
    (7, 81766, 'Cálculo y registro de impuestos', 228, 4),
    (8, 81767, 'Registro de operaciones de comercio nacional e internacional', 152, 4),
    (9, 81768, 'Procesamiento de información contable-financiera', 228, 4),
    (10, 81759, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34311_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 10 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Accounting study plan differs from the official PDF')
    target = ROOT / 'accounting_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
