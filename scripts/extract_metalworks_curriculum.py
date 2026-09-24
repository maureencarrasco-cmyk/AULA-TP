"""Extract official Construcciones Metálicas modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81964, 'Lectura y dibujo de planos en construcciones metálicas', 190, 3),
    (2, 81965, 'Trazado de partes y piezas en construcciones metálicas', 228, 3),
    (3, 81966, 'Mantenimiento de equipos y herramientas en construcciones metálicas', 190, 3),
    (4, 81967, 'Mecanizado de partes y piezas metálicas', 228, 3),
    (5, 81968, 'Corte y soldadura en construcciones metálicas', 228, 4),
    (6, 81969, 'Armado y montaje en construcciones metálicas', 228, 4),
    (7, 81970, 'Protección de estructuras y tratamientos de residuos', 190, 4),
    (8, 81971, 'Cubicación de materiales e insumos en construcciones metálicas', 114, 4),
    (9, 81963, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34329_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Construcciones Metálicas plan differs from the official PDF')
    target = ROOT / 'metalworks_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
