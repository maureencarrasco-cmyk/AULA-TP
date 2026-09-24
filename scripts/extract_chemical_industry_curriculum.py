"""Extract both official Química Industrial mention plans."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34334_programa.pdf'
COMMON = [
    (1, 82087, 'Manejo y almacenamiento seguro de materiales', 152, 3),
    (2, 82088, 'Técnicas, procesos y equipos de laboratorio', 228, 3),
    (3, 82089, 'Fabricación de productos industriales', 228, 3),
    (4, 82090, 'Cuidado del medioambiente y tratamiento de residuos', 228, 3),
]
LABORATORY = [
    (5, 82077, 'Toma de muestra', 114, 4),
    (6, 82078, 'Preparación de muestras para análisis orgánico', 190, 4),
    (7, 82079, 'Técnicas de análisis físico-químico', 190, 4),
    (8, 82080, 'Técnicas de análisis instrumental', 152, 4),
    (9, 82081, 'Mantenimiento de equipos e instrumentos de laboratorio', 114, 4),
    (10, 82076, 'Emprendimiento y empleabilidad', 76, 4),
]
PLANT = [
    (5, 82083, 'Transferencia de calor y operaciones unitarias', 228, 4),
    (6, 82084, 'Acondicionamiento de sólidos y control automático', 114, 4),
    (7, 82085, 'Muestreo de productos industriales', 228, 4),
    (8, 82086, 'Mantenimiento de sistemas auxiliares', 190, 4),
    (9, 82082, 'Emprendimiento y empleabilidad', 76, 4),
]


def extract_track(specific):
    rows = [module(*item) for item in COMMON + specific]
    for row in rows:
        row['source_pdf'] = PDF_URL
        if row['position'] == len(rows) and not row['oa']:
            row['source_warnings'].append(
                'El módulo común de emprendimiento se vincula con OA genéricos, no con OA de especialidad.'
            )
    if any(sum(row['hp'] for row in rows if row['year'] == grade) != 836
           for grade in ('3° medio', '4° medio')):
        raise ValueError('Química Industrial mention plan differs from the official PDF')
    return rows


def main():
    tracks = {'laboratorio': extract_track(LABORATORY), 'planta': extract_track(PLANT)}
    target = ROOT / 'chemical_industry_official.json'
    target.write_text(json.dumps(tracks, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for name, rows in tracks.items():
        print(name, len(rows), sum(len(row['aes']) for row in rows))


if __name__ == '__main__':
    main()
