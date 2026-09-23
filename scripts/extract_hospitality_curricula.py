"""Extract candidate AE and criteria from the locally stored MINEDUC programs.

This is a review aid, not a runtime dependency or a claim of verified curriculum.
Run with the bundled Python environment that includes pypdf.
"""

import json
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
PROGRAMS = {
    'gastronomia': (
        ROOT / 'docs/fuentes/MINEDUC_Gastronomia_programa.pdf',
        [46, 56, 68, 80, 90, 100, 110, 120, 130, 136, 146, 154, 164, 174, 184, 200],
        1,
    ),
    'hoteleria': (
        ROOT / 'docs/fuentes/MINEDUC_Servicios_de_Hoteleria_programa.pdf',
        [34, 44, 52, 62, 72, 82, 94, 104, 112, 120, 138],
        0,
    ),
}

GASTRONOMY_META = [
    ('Higiene para la elaboración de alimentos', 228, 3),
    ('Elaboración de alimentos de baja complejidad', 228, 3),
    ('Recepción y almacenamiento de insumos', 76, 3),
    ('Planificación de la producción gastronómica', 76, 3),
    ('Preparación, diseño y montaje de buffet', 152, 3),
    ('Servicio de comedores, bares y salones', 76, 3),
    ('Cocina chilena', 228, 4),
    ('Innovación y cocina internacional', 228, 4),
    ('Elaboración de bebidas alcohólicas y analcohólicas', 152, 4),
    ('Elaboración de menús y carta', 152, 4),
    ('Elaboración de masas y pastas', 228, 4),
    ('Elaboración de productos de repostería', 114, 4),
    ('Elaboración de productos de pastelería', 228, 4),
    ('Innovación en la pastelería y repostería', 190, 4),
    ('Emprendimiento y empleabilidad', 76, 4),
]
HOTEL_META = [
    ('Atención al cliente en servicios de hotelería', 114, 3),
    ('Servicio de habitaciones', 228, 3),
    ('Actividades recreativas y de animación', 76, 3),
    ('Servicio de eventos', 190, 3),
    ('Inglés técnico para la industria de la hospitalidad', 228, 3),
    ('Información turística', 152, 4),
    ('Servicio de recepción y reservas', 228, 4),
    ('Servicio de coctelería y vinos', 152, 4),
    ('Servicio de información bilingüe', 228, 4),
    ('Emprendimiento y empleabilidad', 76, 4),
]


def clean(text):
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract(pdf, starts, offset):
    reader = PdfReader(pdf)
    modules = []
    for number, (first, last) in enumerate(zip(starts, starts[1:]), 1):
        pages = [page.extract_text() or '' for page in reader.pages[first + offset:last + offset]]
        text = '\n'.join(pages)
        match = re.search(r'(?im)^.*ESPER.*CRiTER.*$', text)
        if not match:
            raise ValueError(f'No AE table: {pdf} module {number}')
        text = text[match.end():]
        text = re.split(r'EJEMPLO DE ACTIVIDAD|Ejemplo de actividad', text, flags=re.I)[0]
        objective_block = re.split(r'(?im)^.*ESPER.*CRiTER.*$', text, maxsplit=1)[0]
        objective_matches = list(re.finditer(r'(?m)^OA\s+(\d+)\s*$', objective_block))
        objectives = []
        for pos, item in enumerate(objective_matches):
            end = objective_matches[pos + 1].start() if pos + 1 < len(objective_matches) else len(objective_block)
            objective = clean(objective_block[item.end():end])
            if objective:
                objectives.append({'code': f'OA {item.group(1)}', 'title': objective})
        heads = list(re.finditer(r'(?m)^(\d+)\.\s+(?=[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])', text))
        results = []
        seen = set()
        for pos, head in enumerate(heads):
            if head.group(1) in seen:
                continue
            end = heads[pos + 1].start() if pos + 1 < len(heads) else len(text)
            block = text[head.end():end]
            ce = re.search(r'(?m)^(\d+\.\d+)\s*$', block)
            if not ce or ce.group(1).split('.')[0] != head.group(1):
                continue
            title = clean(block[:ce.start()])
            criteria = []
            parts = re.split(r'(?m)^(\d+\.\d+)\s*$', block[ce.start():])[1:]
            for code, paragraph in zip(parts[::2], parts[1::2]):
                paragraph = re.split(r'(?m)^[A-L](?: [A-L])*\s*$', paragraph, maxsplit=1)[0]
                criterion = clean(paragraph)
                if criterion:
                    criteria.append(f'{code} {criterion}')
            results.append({'code': f'M{number}-AE{head.group(1)}', 'title': title, 'criteria': criteria})
            seen.add(head.group(1))
        modules.append({'oa': objectives, 'aes': results, 'source_page': first + 1})
    return modules


if __name__ == '__main__':
    output = {}
    for name, args in PROGRAMS.items():
        rows = extract(*args)
        meta = GASTRONOMY_META if name == 'gastronomia' else HOTEL_META
        assert len(rows) == len(meta)
        for row, (title, hp, year) in zip(rows, meta):
            row.update(title=title, hp=hp, year=f'{year}° medio')
            assert row['aes'] and all(ae['criteria'] for ae in row['aes'])
        output[name] = rows
        print(name, len(rows), sum(len(row['aes']) for row in rows))
    target = ROOT / 'hospitality_official.json'
    target.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
