"""Extract official Vestuario y Confección Textil modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81825, 'Patronaje computacional', 228, 3),
    (2, 81826, 'Elaboración de fichas técnicas', 114, 3),
    (3, 81827, 'Mantenimiento de máquinas', 76, 3),
    (4, 81828, 'Tendido, trazado y corte de telas', 190, 3),
    (5, 81829, 'Confección y terminaciones', 228, 3),
    (6, 81830, 'Diseño computacional de artículos y vestuario', 190, 4),
    (7, 81831, 'Patronaje y escalado industrial', 228, 4),
    (8, 81832, 'Procesos de confección industrial', 228, 4),
    (9, 81833, 'Control de calidad', 114, 4),
    (10, 81824, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34314_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 10 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Vestuario y Confección Textil plan differs from the official PDF')
    target = ROOT / 'textile_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
