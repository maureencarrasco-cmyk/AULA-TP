"""Extract Conectividad y Redes OA, AE and criteria from MINEDUC pages."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 82119, 'Instalación de redes de área local cableadas e inalámbricas', 228, 3),
    (2, 82120, 'Ensamblado y configuración de computadores y equipos terminales portátiles', 228, 3),
    (3, 82121, 'Instalación y explotación de software de aplicaciones productivas', 152, 3),
    (4, 82122, 'Configuración y puesta en servicio de aplicaciones en redes de área local', 228, 3),
    (5, 82123, 'Configuración de la seguridad en redes de área local', 152, 4),
    (6, 82124, 'Mantenimiento y actualización de hardware en redes de área local', 228, 4),
    (7, 82125, 'Mantenimiento y actualización de software en redes de área local', 228, 4),
    (8, 82126, 'Recuperación y respaldo de información en redes de área local', 152, 4),
    (9, 82118, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34335_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 9 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Conectividad y Redes study plan differs from the official PDF')
    target = ROOT / 'networks_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
