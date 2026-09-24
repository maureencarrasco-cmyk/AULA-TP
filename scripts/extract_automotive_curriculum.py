"""Extract official Mecánica Automotriz modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 81988, 'Ajuste de motores', 228, 3),
    (2, 81989, 'Lectura de planos y manuales técnicos', 152, 3),
    (3, 81990, 'Manejo de residuos y desechos automotrices', 76, 3),
    (4, 81991, 'Mantenimiento de sistemas de seguridad y confortabilidad', 152, 3),
    (5, 81992, 'Mantenimiento de sistemas eléctricos y electrónicos', 228, 3),
    (6, 81993, 'Mantenimiento de motores', 190, 4),
    (7, 81994, 'Mantenimiento de sistemas hidráulicos y neumáticos', 190, 4),
    (8, 81995, 'Mantenimiento de los sistemas de transmisión y frenos', 190, 4),
    (9, 81996, 'Mantenimiento de sistemas de dirección y suspensión', 190, 4),
    (10, 81987, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34330_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 10 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Mecánica Automotriz plan differs from the official PDF')
    target = ROOT / 'automotive_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
