"""Extract the three official Agropecuaria mention plans from MINEDUC."""

import json
from copy import deepcopy
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
COMMON = [
    (1, 81809, 'Manejo de suelo y residuos', 190, 3),
    (2, 81810, 'Manejo de técnicas de riego', 152, 3),
    (3, 81811, 'Técnicas de reproducción vegetal', 190, 3),
    (4, 81812, 'Alimentación y pesaje pecuario', 152, 3),
    (5, 81813, 'Control de plagas y enfermedades', 152, 3),
]
AGRICULTURE = [
    (6, 81804, 'Técnicas de cultivo de especies vegetales', 190, 4),
    (7, 81805, 'Manejos para optimización productiva de frutales', 228, 4),
    (8, 81806, 'Postcosecha y guarda de productos agrícolas', 228, 4),
    (9, 81807, 'Mantenimiento de maquinarias y equipos agrícolas', 114, 4),
    (10, 81808, 'Emprendimiento y empleabilidad', 76, 4),
]
LIVESTOCK = [
    (6, 81814, 'Manejos pecuarios', 190, 4),
    (7, 81815, 'Reproducción animal', 152, 4),
    (8, 81816, 'Producción lechera', 152, 4),
    (9, 81817, 'Sanidad y bienestar animal', 152, 4),
    (10, 81818, 'Cultivo de praderas y forrajes', 114, 4),
    (11, 81808, 'Emprendimiento y empleabilidad', 76, 4),
]
VITICULTURE = [
    (6, 81819, 'Viticultura', 190, 4),
    (7, 81820, 'Cosecha y transporte de vides', 152, 4),
    (8, 81821, 'Elaboración de vinos', 152, 4),
    (9, 81822, 'Envasado y maquinaria vitivinícola', 152, 4),
    (10, 81823, 'Manejo de bodegas vitivinícolas', 114, 4),
    (11, 81808, 'Emprendimiento y empleabilidad', 76, 4),
]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34312_programa.pdf'


def common_entrepreneurship(position):
    source = json.loads((ROOT / 'programming_official.json').read_text(encoding='utf-8'))[-1]
    row = deepcopy(source)
    row['position'] = position
    row['source_page'] = 'https://www.curriculumnacional.cl/614/w3-article-81808.html'
    row['source_pdf'] = PDF_URL
    row['source_warnings'] = [
        'La página web no muestra los AE; se reutilizó la versión oficial compartida. Pendiente cotejo íntegro con el PDF agropecuario.'
    ]
    for index, ae in enumerate(row['aes'], 1):
        ae['code'] = f'M{position}-AE{index}'
    return row


def extract_track(specific):
    rows = [common_entrepreneurship(item[0]) if item[1] == 81808 else module(*item)
            for item in COMMON + specific]
    for row in rows:
        row['source_pdf'] = PDF_URL
    if any(sum(row['hp'] for row in rows if row['year'] == grade) != 836
           for grade in ('3° medio', '4° medio')):
        raise ValueError('Agropecuaria mention plan differs from the official PDF')
    return rows


def main():
    tracks = {
        'agricultura': extract_track(AGRICULTURE),
        'pecuaria': extract_track(LIVESTOCK),
        'vitivinicola': extract_track(VITICULTURE),
    }
    target = ROOT / 'agriculture_official.json'
    target.write_text(json.dumps(tracks, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for name, rows in tracks.items():
        print(name, len(rows), sum(len(row['aes']) for row in rows))


if __name__ == '__main__':
    main()
