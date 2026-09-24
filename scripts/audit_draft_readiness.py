"""Read-only inventory of unpublished course readiness."""

import json
import sqlite3
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from pedagogy import verified_static_asset


def inspect_module(content):
    source = content.get('specialty_source') or {}
    pdf = ROOT / str(source.get('pdf') or '')
    aes = content.get('aes') or []
    cases = content.get('cases') or []
    questions = content.get('questions') or []
    resources = content.get('media_resources') or []
    visuals = {item['image'] for item in resources
               if item.get('kind') == '3d' and verified_static_asset(item.get('image'))}
    video_items = [content, content.get('scene') or {}, *(row.get('task') or {}
                    for row in content.get('formative_pack') or [])]
    videos = {item['video'] for item in video_items
              if verified_static_asset(item.get('video'))}
    return {
        'source': pdf.is_file() and str(content.get('curriculum', {}).get('url') or '').startswith(
            'https://www.curriculumnacional.cl/'),
        'oa': bool(source.get('oa')),
        'ae': bool(aes) and all(ae.get('official_code') and ae.get('criteria') for ae in aes),
        'ae_count': len(aes),
        'visuals_3d': len(visuals),
        'videos': len(videos),
        'assessment_images': sum(verified_static_asset(item.get('image')) for item in cases + questions),
        'assessment_total': len(cases) + len(questions),
        'unique_exam_stimuli': len({str(item.get('stimulus') or '') for item in questions}),
    }


def audit(database):
    with sqlite3.connect(database) as con:
        rows = con.execute('''SELECT c.title, m.title, m.content
                              FROM modules m JOIN courses c ON c.id=m.course_id
                              WHERE m.published=0 ORDER BY c.id,m.position''').fetchall()
    by_course = defaultdict(list)
    for course, module, raw in rows:
        by_course[course].append((module, inspect_module(json.loads(raw))))
    return by_course


def report(by_course):
    modules = sum(len(items) for items in by_course.values())
    checks = [result for items in by_course.values() for _, result in items]
    lines = [
        '# Estado verificable de cursos en borrador', '',
        f'Fecha: {date.today().isoformat()}. Alcance: {len(by_course)} cursos y {modules} módulos no publicados.',
        'Esta tabla mide presencia de datos y archivos locales, no calidad pedagógica ni autorización para publicar.',
        '',
        '| Curso | Módulos | PDF y página oficial | OA explícito | AE con criterios | Visuales 3D reales | Imágenes de evaluación reales | Videos reales |',
        '|---|---:|---:|---:|---:|---:|---:|---:|',
    ]
    for course, items in by_course.items():
        values = [row for _, row in items]
        count = len(items)
        lines.append(
            f'| {course} | {count} | {sum(v["source"] for v in values)}/{count} | '
            f'{sum(v["oa"] for v in values)}/{count} | {sum(v["ae"] for v in values)}/{count} | '
            f'{sum(v["visuals_3d"] for v in values)}/{3 * count} mínimo | '
            f'{sum(v["assessment_images"] for v in values)}/{sum(v["assessment_total"] for v in values)} | '
            f'{sum(v["videos"] for v in values)} |'
        )
    lines += [
        '', '## Resultado y límites', '',
        f'- PDF local y página curricular declarada: {sum(v["source"] for v in checks)}/{modules} módulos.',
        f'- OA explícito en el registro: {sum(v["oa"] for v in checks)}/{modules}; los módulos sin OA requieren revisar el alcance del programa antes de asignarles uno.',
        f'- AE con código y criterios: {sum(v["ae"] for v in checks)}/{modules}, con {sum(v["ae_count"] for v in checks)} AE registrados.',
        f'- Imágenes 3D verificadas: {sum(v["visuals_3d"] for v in checks)}/{3 * modules} del mínimo solicitado.',
        f'- Imágenes reales en casos y evaluación: {sum(v["assessment_images"] for v in checks)}/{sum(v["assessment_total"] for v in checks)}.',
        f'- Videos locales verificados: {sum(v["videos"] for v in checks)}. La pertinencia se debe decidir por módulo; cero videos no demuestra que ninguno corresponda.',
        f'- Estímulos distintos por banco de 25 preguntas: entre {min(v["unique_exam_stimuli"] for v in checks)} y {max(v["unique_exam_stimuli"] for v in checks)}. La repetición requiere rediseño y revisión disciplinar.',
        '- No se ha certificado en estos borradores la exactitud técnica de cada decisión, la pertinencia de cada medio, accesibilidad con usuarios ni la experiencia completa de las cinco estaciones.',
        '- Estado: ninguno de estos cursos está listo para publicación. No se asigna un porcentaje global ficticio.',
        '', '## Próximo trabajo verificable', '',
        '1. Revisar por especialidad la correspondencia OA → AE → criterio → actividad y corregir las decisiones técnicas con docentes del área.',
        '2. Crear al menos tres visuales 3D diferentes por módulo con función pedagógica documentada y sustituir las imágenes ausentes de los ítems.',
        '3. Decidir por módulo si el movimiento aporta al aprendizaje y producir videos con subtítulos cuando corresponda.',
        '4. Probar las cinco estaciones, accesibilidad y evaluación antes de publicar cada curso.',
    ]
    return '\n'.join(lines) + '\n'


if __name__ == '__main__':
    result = audit(ROOT / 'data' / 'aulatp.sqlite3')
    target = ROOT / 'docs' / 'AUDITORIA_BORRADORES_CURRICULARES.md'
    target.write_text(report(result), encoding='utf-8')
    print(f'{len(result)} courses, {sum(map(len, result.values()))} draft modules: {target}')
