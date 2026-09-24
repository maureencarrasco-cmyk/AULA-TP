"""Extract the three Construccion mention plans from the official module pages."""

import json
from pathlib import Path

from extract_programming_curriculum import module


ROOT = Path(__file__).resolve().parents[1]
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34315_programa.pdf'
COMMON = [
    (1, 81834, 'Análisis de muestras de hormigón, suelos y materiales', 152, 3),
    (2, 81835, 'Carpintería de instalación de faenas', 152, 3),
    (3, 81836, 'Control y mantenimiento de bodegas y pañoles', 76, 3),
    (4, 81837, 'Cubicación de materiales e insumos', 76, 3),
    (5, 81838, 'Interpretación de planos de construcción', 152, 3),
    (6, 81839, 'Prevención de riesgos en la construcción', 76, 3),
    (7, 81840, 'Trazado de obras de construcción', 152, 3),
]
EDIFICATION = [
    (8, 81842, 'Albañilerías estructurales y no estructurales', 152, 4),
    (9, 81843, 'Carpintería estructural', 228, 4),
    (10, 81844, 'Enfierradura para elementos estructurales', 152, 4),
    (11, 81845, 'Estructuras de hormigón', 228, 4),
    (12, 81841, 'Emprendimiento y empleabilidad', 76, 4),
]
FINISHING = [
    (8, 81881, 'Impermeabilización y aislación de elementos', 152, 4),
    (9, 81882, 'Instalación de cubiertas y elementos de evacuación de aguas lluvias', 152, 4),
    (10, 81883, 'Instalación de muebles, puertas y ventanas', 228, 4),
    (11, 81884, 'Revestimientos para pisos, muros y cielos', 228, 4),
    (12, 81880, 'Emprendimiento y empleabilidad', 76, 4),
]
ROADS = [
    (8, 81866, 'Calidad en obras viales e infraestructura', 190, 4),
    (9, 81867, 'Seguridad vial', 152, 4),
    (10, 81868, 'Mantenimiento de obras viales', 152, 4),
    (11, 81869, 'Conformación de la calzada', 152, 4),
    (12, 81870, 'Infraestructura para la protección de la calzada', 114, 4),
    (13, 81865, 'Empleabilidad y emprendimiento', 76, 4),
]


def extract_track(specific):
    rows = [module(*item) for item in COMMON + specific]
    for row in rows:
        row['source_pdf'] = PDF_URL
        if row['position'] == len(rows):
            row['source_warnings'].append(
                'El módulo común de emprendimiento responde a Objetivos de Aprendizaje Genéricos, no a OA de especialidad (PDF, p. 248).'
            )
    if any(sum(row['hp'] for row in rows if row['year'] == grade) != 836
           for grade in ('3° medio', '4° medio')):
        raise ValueError('Construcción mention plan differs from the official PDF')
    return rows


def main():
    tracks = {
        'edificacion': extract_track(EDIFICATION),
        'terminaciones': extract_track(FINISHING),
        'obras_viales': extract_track(ROADS),
    }
    target = ROOT / 'construction_official.json'
    target.write_text(json.dumps(tracks, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for name, rows in tracks.items():
        print(name, len(rows), sum(len(row['aes']) for row in rows))


if __name__ == '__main__':
    main()
