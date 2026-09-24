"""Extract official Asistencia en Geología modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 82014, 'Preparación e instalación de campamentos', 190, 3),
    (2, 82015, 'Marco legal y seguridad en geología', 190, 3),
    (3, 82016, 'Clasificación de rocas y minerales', 266, 3),
    (4, 82017, 'Lectura y elaboración de mapas topográficos y geológicos', 190, 3),
    (5, 82018, 'Prospección geológica con sondajes', 228, 4),
    (6, 82019, 'Técnicas de muestreo geológico', 266, 4),
    (7, 82020, 'Registro y transferencia de información geológica', 152, 4),
    (8, 82021, 'Transporte y mantenimiento de equipos e instrumentos geológicos', 114, 4),
    (9, 82013, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34333_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Asistencia en Geología plan differs from the official PDF')
    target = ROOT / 'geology_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
