"""Extract official Operaciones Portuarias modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 82050, 'Documentación en la operación portuaria', 266, 3),
    (2, 82051, 'Consolidación y desconsolidación de contenedores', 228, 3),
    (3, 82052, 'Seguridad y prevención de riesgos en faenas portuarias', 152, 3),
    (4, 82053, 'Operación de movilización y distribución de cargas', 190, 3),
    (5, 82054, 'Tramitación y documentación de recepción y despacho de carga', 228, 4),
    (6, 82055, 'Estiba y desestiba de naves mercantes', 190, 4),
    (7, 82056, 'Tramitación de movilización y distribución de cargas', 190, 4),
    (8, 82057, 'Organización y almacenamiento de cargas en zonas de depósito', 152, 4),
    (9, 82049, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34306_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Operaciones Portuarias plan differs from the official PDF')
    target = ROOT / 'port_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
