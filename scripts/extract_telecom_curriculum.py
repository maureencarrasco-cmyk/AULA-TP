"""Extract official Telecomunicaciones modules and outcomes from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 82137, 'Operaciones y fundamentos de las telecomunicaciones', 114, 3),
    (2, 82138, 'Instalación y mantenimiento básico de un terminal informático', 152, 3),
    (3, 82139, 'Instalación y configuración de redes', 228, 3),
    (4, 82140, 'Mantenimiento de circuitos electrónicos básicos', 190, 3),
    (5, 82141, 'Instalación de servicios básicos de telecomunicaciones', 152, 3),
    (6, 82142, 'Comunicaciones inalámbricas', 228, 4),
    (7, 82143, 'Instalación de redes telefónicas convergentes', 190, 4),
    (8, 82144, 'Sistemas operativos de redes', 152, 4),
    (9, 82145, 'Mantenimiento de redes de acceso y banda ancha', 190, 4),
    (10, 82136, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34340_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 10 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Telecomunicaciones study plan differs from the official PDF')
    target = ROOT / 'telecom_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
