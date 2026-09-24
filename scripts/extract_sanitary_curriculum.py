"""Extract official Instalaciones Sanitarias module outcomes from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81847, 'Lectura de planos de instalaciones sanitarias', 76, 3),
    (2, 81848, 'Trazado de redes', 228, 3),
    (3, 81849, 'Instalación de redes de agua potable', 228, 3),
    (4, 81850, 'Instalación de redes de alcantarillado', 228, 3),
    (5, 81851, 'Instalación de redes para riego agrícola', 76, 3),
    (6, 81852, 'Cubicación en instalaciones sanitarias', 228, 4),
    (7, 81853, 'Instalación de artefactos sanitarios', 228, 4),
    (8, 81854, 'Instalación de gas', 152, 4),
    (9, 81855, 'Mantenimiento de redes y artefactos', 152, 4),
    (10, 81846, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34470_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 10 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Instalaciones Sanitarias study plan differs from the official PDF')
    target = ROOT / 'sanitary_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
