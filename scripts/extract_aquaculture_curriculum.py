"""Extract official Acuicultura modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 82041, 'Manejo de reproductores, desove y crías de larvas de especies hidrobiológicas', 228, 3),
    (2, 82042, 'Engorde de especies acuícolas', 228, 3),
    (3, 82043, 'Operación de sistemas, equipos y maquinarias', 228, 3),
    (4, 82044, 'Seguridad, prevención de riesgos y cuidado del medio ambiente', 152, 3),
    (5, 82045, 'Cosecha de especies acuícolas', 228, 4),
    (6, 82046, 'Captación de semillas', 152, 4),
    (7, 82047, 'Trabajos subacuáticos en acuicultura', 228, 4),
    (8, 82048, 'Manejo de información acuícola', 152, 4),
    (9, 82040, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34302_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Acuicultura plan differs from the official PDF')
    target = ROOT / 'aquaculture_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
