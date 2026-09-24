"""Extract official Elaboración Industrial de Alimentos modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81785, 'Recepción de materias primas', 190, 3),
    (2, 81786, 'Almacenaje y bodega de alimentos e insumos alimentarios', 190, 3),
    (3, 81787, 'Elaboración de alimentos e higiene', 228, 3),
    (4, 81788, 'Aseguramiento de la calidad de procesos y alimentos', 228, 3),
    (5, 81789, 'Tratamientos de conservación de alimentos', 228, 4),
    (6, 81790, 'Control y registro de procesos de la industria de alimentos', 228, 4),
    (7, 81791, 'Manejo de desechos de la industria de alimentos', 114, 4),
    (8, 81792, 'Envasado y rotulación de alimentos', 190, 4),
    (9, 81784, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34341_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Elaboración Industrial de Alimentos plan differs from the official PDF')
    target = ROOT / 'food_industry_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
