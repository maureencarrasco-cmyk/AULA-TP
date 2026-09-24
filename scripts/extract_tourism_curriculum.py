"""Extract the official Tourism Services module data from MINEDUC pages."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81935, 'Sistemas de reservas', 190, 3),
    (2, 81936, 'Atención turística al cliente', 76, 3),
    (3, 81937, 'Patrimonio, cultura y atractivos turísticos de Chile', 228, 3),
    (4, 81938, 'Prevención y seguridad en programas turísticos', 190, 3),
    (5, 81939, 'Inglés para la comunicación oral en turismo', 152, 3),
    (6, 81940, 'Patrimonio, cultura y atractivos turísticos del mundo', 152, 4),
    (7, 81941, 'Conducción de grupos turísticos', 228, 4),
    (8, 81942, 'Elaboración de programas turísticos', 228, 4),
    (9, 81943, 'Inglés para la comunicación escrita en turismo', 152, 4),
    (10, 81934, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34325_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 10 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Tourism study plan differs from the official PDF')
    target = ROOT / 'tourism_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
