"""Extract official Electronics modules and outcomes from MINEDUC pages."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81895, 'Proyectos electrónicos', 190, 3),
    (2, 81896, 'Armado y reparación de circuitos electrónicos', 228, 3),
    (3, 81897, 'Ensamblaje y mantención de sistemas y equipos digitales', 228, 3),
    (4, 81898, 'Sistemas de control domótico', 190, 3),
    (5, 81899, 'Mantención y operación de equipos de control electrónico de potencia', 152, 4),
    (6, 81900, 'Detección de fallas industriales', 152, 4),
    (7, 81901, 'Operación y programación de equipos de control eléctrico industrial', 152, 4),
    (8, 81902, 'Montaje de equipos industriales', 152, 4),
    (9, 81903, 'Automatización industrial', 152, 4),
    (10, 81894, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34321_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 10 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Electronics study plan differs from the official PDF')
    target = ROOT / 'electronics_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
