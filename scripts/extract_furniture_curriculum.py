"""Extract official Muebles y Terminaciones en Madera modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81954, 'Abastecimiento y despacho', 228, 3),
    (2, 81955, 'Fabricación de componentes de carpintería y muebles', 228, 3),
    (3, 81956, 'Cubicaciones', 152, 3),
    (4, 81957, 'Aseguramiento de la calidad, seguridad y cuidado del medio ambiente', 76, 3),
    (5, 81958, 'Representación gráfica de muebles y elementos de carpintería', 152, 3),
    (6, 81959, 'Armado de estructuras', 228, 4),
    (7, 81960, 'Terminaciones de muebles y elementos de carpintería', 228, 4),
    (8, 81961, 'Instalación de muebles y elementos de carpintería', 152, 4),
    (9, 81962, 'Mantenimiento de máquinas, equipos y herramientas', 152, 4),
    (10, 81953, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34327_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 10 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Muebles y Terminaciones en Madera plan differs from the official PDF')
    target = ROOT / 'furniture_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
