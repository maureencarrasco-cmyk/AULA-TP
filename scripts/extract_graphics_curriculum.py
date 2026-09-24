"""Extract official Gráfica modules and outcomes from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81916, 'Verificación y preparación de archivos digitales', 228, 3),
    (2, 81917, 'Preparación de la máquina impresora', 228, 3),
    (3, 81918, 'Impresión del producto gráfico', 228, 3),
    (4, 81919, 'Materiales e insumos de la industria gráfica', 152, 3),
    (5, 81920, 'Encuadernación del producto impreso', 152, 4),
    (6, 81921, 'Imposición de archivos y obtención de prueba de color', 228, 4),
    (7, 81922, 'Salida del archivo a matriz impresora e impresión digital', 228, 4),
    (8, 81923, 'Postimpresión en embalajes y recubrimientos a impresos', 152, 4),
    (9, 81915, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34323_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Gráfica study plan differs from the official PDF')
    target = ROOT / 'graphics_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
