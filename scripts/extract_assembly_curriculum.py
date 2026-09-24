"""Extract official Montaje Industrial modules and outcomes from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81857, 'Unión y reparación de elementos metálicos', 228, 3),
    (2, 81858, 'Dibujo e interpretación de planos de montaje', 228, 3),
    (3, 81859, 'Mediciones, trazados y cálculos de montaje industrial', 228, 3),
    (4, 81860, 'Maniobras de levante de cargas', 152, 3),
    (5, 81861, 'Tratamientos superficiales y manejo de residuos', 228, 4),
    (6, 81862, 'Fijación y montaje de elementos', 152, 4),
    (7, 81863, 'Mantenimiento industrial', 152, 4),
    (8, 81864, 'Cubicación de proyectos', 228, 4),
    (9, 81856, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34317_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Montaje Industrial study plan differs from the official PDF')
    target = ROOT / 'assembly_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
