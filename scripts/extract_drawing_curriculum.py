"""Extract official Dibujo Técnico modules and outcomes from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81905, 'Lectura de planos y documentos técnicos', 76, 3),
    (2, 81906, 'Dibujo manual de levantamientos', 152, 3),
    (3, 81907, 'Dibujo digital de proyectos de arquitectura', 228, 3),
    (4, 81908, 'Dibujo digital de piezas y conjuntos mecánicos', 190, 3),
    (5, 81909, 'Maquetas virtuales', 190, 3),
    (6, 81910, 'Dibujo digital de instalaciones domiciliarias', 190, 4),
    (7, 81911, 'Dibujo digital de sistemas constructivos', 190, 4),
    (8, 81912, 'Dibujo digital de montaje industrial', 152, 4),
    (9, 81913, 'Cubicación de proyectos', 152, 4),
    (10, 81914, 'Impresión y reproducción de planos', 76, 4),
    (11, 81904, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34322_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 11 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Dibujo Técnico study plan differs from the official PDF')
    target = ROOT / 'drawing_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
