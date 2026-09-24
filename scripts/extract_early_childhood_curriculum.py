"""Extract official Atención de Párvulos modules from MINEDUC."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    (1, 82105, 'Material didáctico y de ambientación', 228, 3),
    (2, 82106, 'Expresión musical para párvulos', 152, 3),
    (3, 82107, 'Relación con la familia', 76, 3),
    (4, 82108, 'Salud en párvulos', 152, 3),
    (5, 82109, 'Recreación y bienestar de los párvulos', 228, 3),
    (6, 82110, 'Actividades educativas para párvulos', 266, 4),
    (7, 82111, 'Expresión literaria y teatral con párvulos', 228, 4),
    (8, 82112, 'Alimentación de los párvulos', 114, 4),
    (9, 82113, 'Higiene y seguridad de los párvulos', 152, 4),
    (10, 82104, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34352_programa.pdf'


def main():
    rows = [module(*item) for item in MODULES]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if len(rows) != 10 or any(
        sum(row['hp'] for row in rows if row['year'] == grade) != 836
        for grade in ('3° medio', '4° medio')
    ):
        raise ValueError('Atención de Párvulos plan differs from the official PDF')
    target = ROOT / 'early_childhood_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
