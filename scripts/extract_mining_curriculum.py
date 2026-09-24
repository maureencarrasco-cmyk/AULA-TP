"""Extract official Explotación Minera modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 82023, 'Lectura de planos de ubicación y de tronadura', 152, 3),
    (2, 82024, 'Fortificación de minas subterráneas y a cielo abierto', 228, 3),
    (3, 82025, 'Perforación y tronadura en faenas mineras', 228, 3),
    (4, 82026, 'Marco legal y seguridad en plantas de explotación minera', 228, 3),
    (5, 82027, 'Ventilación secundaria y drenaje de minas', 152, 4),
    (6, 82028, 'Muestreo en explotaciones mineras', 228, 4),
    (7, 82029, 'Cubicación, carguío y transporte', 152, 4),
    (8, 82030, 'Chancado primario de minerales', 228, 4),
    (9, 82022, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34331_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Explotación Minera plan differs from the official PDF')
    target = ROOT / 'mining_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
