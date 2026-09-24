"""Extract official Tripulación de Naves Mercantes y Especiales modules."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 82068, 'Operación de equipos de maniobras de cubierta', 228, 3),
    (2, 82069, 'Mantenimiento de máquinas de cubierta', 228, 3),
    (3, 82070, 'Prevención de riesgos en el mar', 228, 3),
    (4, 82071, 'Operación puente de gobierno', 152, 3),
    (5, 82072, 'Primeros auxilios', 152, 4),
    (6, 82073, 'Operación de máquinas propulsoras y auxiliares', 228, 4),
    (7, 82074, 'Mantenimiento de máquinas marinas', 228, 4),
    (8, 82075, 'Comunicaciones', 152, 4),
    (9, 82067, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34309_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Tripulación de Naves plan differs from the official PDF')
    target = ROOT / 'merchant_crew_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
