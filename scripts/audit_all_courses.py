"""Reproducible, read-only audit of every published Aula TP course."""

import csv
import json
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from instructional_quality import contract_is_complete
from pedagogy import course_planning, enrich, publication_gaps


def activities(content):
    yield 'context', 1, content.get('context_instruction'), content.get('context_didactic')
    for ae_index, ae in enumerate(content.get('aes') or []):
        for index, item in enumerate(ae.get('experiences') or []):
            yield f'ae-{ae_index + 1}-{index + 1}', 2, item.get('instruction'), item.get('didactic')
    for index, item in enumerate(content.get('formative_pack') or []):
        yield f'formative-{index + 1}', item.get('station', 3), item.get('instruction'), item.get('didactic')
    for index, item in enumerate(content.get('cases') or []):
        yield f'case-{index + 1}', 3, item.get('instruction'), item.get('didactic')
    scene = content.get('scene') or {}
    yield 'scene', 3, scene.get('instruction'), scene.get('didactic')
    for index, item in enumerate(content.get('questions') or []):
        yield f'question-{index + 1}', 4, item.get('instruction'), item.get('didactic')
    pack = content.get('development_pack') or {}
    yield 'development', 4, pack.get('instruction'), pack.get('didactic')
    practice = content.get('practice') or {}
    yield 'practice', 0, practice.get('instruction'), practice.get('didactic')
    for index, item in enumerate((content.get('encargos') or {}).get('items') or []):
        yield f'encargo-{index + 1}', item.get('station', 2), item.get('instruction'), item.get('didactic')
    yield 'feedback', 5, content.get('feedback_instruction'), content.get('feedback_didactic')


def bank_has_variety(items):
    if not items:
        return False
    if any(not item.get('options') or not isinstance(item.get('answer'), int)
           or not 0 <= item['answer'] < len(item['options']) for item in items):
        return False
    signatures = [tuple(sorted(str(option).strip().casefold() for option in item.get('options') or [])) for item in items]
    correct = [str((item.get('options') or [''])[item.get('answer', 0)]).strip().casefold() for item in items]
    evidence = [str(item.get('stimulus') or item.get('context') or item.get('question') or '').strip().casefold()
                for item in items]
    minimum = min(5, len(items))
    return all(len(set(values)) >= minimum for values in (signatures, correct, evidence))


def source_is_traceable(item, specialty, expected_url):
    url = str(item.get('source_url') or '')
    claim = str(item.get('source_claim') or '').strip()
    scope = str(item.get('source_scope') or '').lower()
    ric = str(item.get('regulatory_url') or '')
    return (url.startswith('https://www.curriculumnacional.cl/') and url == expected_url and bool(claim)
            and claim == str(item.get('criterion') or '').strip()
            and 'simulaci' in scope
            and (specialty != 'Electricidad' or ric.startswith('https://www.sec.cl/')))


def pct(passed, total):
    return f'{100 * passed / total:.1f}%' if total else 'N/D'


def main():
    with sqlite3.connect(ROOT / 'data' / 'aulatp.sqlite3') as con:
        con.row_factory = sqlite3.Row
        rows = con.execute('''SELECT c.id AS course_id, c.title AS course_title, c.specialty,
                                    m.id AS module_id, m.position, m.title AS module_title, m.content
                             FROM modules m JOIN courses c ON c.id=m.course_id
                             WHERE m.published=1 ORDER BY c.id, m.position''').fetchall()
        progress = con.execute('SELECT COUNT(*) FROM progress').fetchone()[0]
    if not rows:
        raise SystemExit('No published modules found')

    scores = {}
    activity_rows = []
    media_rows = []
    source_rows = []
    issues = []
    by_course = {}
    for row in rows:
        course = row['course_title']
        by_course.setdefault(course, []).append(row)
        content = enrich(json.loads(row['content']), row['position'])
        bucket = scores.setdefault(course, {key: [0, 0] for key in range(1, 10)})
        ae_codes = {str(ae.get('official_code') or f'AE {i + 1}') for i, ae in enumerate(content.get('aes') or [])}
        ae_count = len(content.get('aes') or [])
        for key, station, contract, didactic in activities(content):
            complete = contract_is_complete(contract)
            mapped = bool(contract and contract.get('ae') and contract.get('criterion'))
            instruction_ok = complete and mapped
            didactic_ok = bool(didactic and all(str(didactic.get(field) or '').strip() for field in (
                'prior_knowledge', 'new_knowledge', 'cognitive_action', 'scaffolding', 'evidence', 'feedback', 'transfer')))
            bucket[1][0] += instruction_ok
            bucket[1][1] += 1
            activity_rows.append({
                'curso': course, 'modulo': row['module_title'], 'id_modulo': row['module_id'],
                'actividad': key, 'estacion': station, 'contrato_7_campos': int(complete),
                'ae_y_criterio': int(mapped), 'ciclo_didactico_documentado': int(didactic_ok),
            })
        plan = content.get('planning') or {}
        expected = float(plan.get('official_hp') or 0) * 0.3
        minutes = plan.get('station_minutes') or {}
        hour_checks = [
            abs(float(plan.get('aula_hp_exact') or 0) - expected) < 1e-6,
            abs(float(plan.get('formative_hp') or 0) + float(plan.get('exam_hp') or 0) - expected) < 1e-6,
            all(str(i) in minutes for i in range(1, 6)),
        ]
        bucket[3][0] += sum(hour_checks)
        bucket[3][1] += len(hour_checks)
        source = content.get('specialty_source') or content.get('official_source') or {}
        bucket[4][0] += bool(source)
        bucket[4][1] += 1
        for kind in ('cases', 'questions'):
            for index, item in enumerate(content.get(kind) or [], 1):
                traceable = source_is_traceable(item, row['specialty'], (content.get('curriculum') or {}).get('url'))
                bucket[4][0] += traceable
                bucket[4][1] += 1
                source_rows.append({
                    'curso': course, 'modulo': row['module_title'], 'id_modulo': row['module_id'],
                    'tipo': kind, 'numero': index, 'criterio': item.get('criterion'),
                    'fuente_curricular': item.get('source_url'), 'afirmacion_respaldada': item.get('source_claim'),
                    'alcance': item.get('source_scope'), 'fuente_normativa': item.get('regulatory_url', ''),
                    'trazable': int(traceable),
                })
                if item.get('image'):
                    bucket[7][0] += bool(str(item.get('alt') or '').strip())
                    bucket[7][1] += 1
        for index, medium in enumerate(content.get('media_audit') or [], 1):
            complete_media = all(medium.get(field) for field in ('medio', 'tipo', 'lugar', 'criterio', 'sentido'))
            bucket[5][0] += complete_media
            bucket[5][1] += 1
            media_rows.append({
                'curso': course, 'modulo': row['module_title'], 'id_modulo': row['module_id'],
                'recurso': index, 'medio': medium.get('medio'), 'tipo': medium.get('tipo'),
                'lugar': medium.get('lugar'), 'criterio': medium.get('criterio'),
                'metadatos_completos': int(complete_media),
            })
        architecture = [ae_count >= 2, len(content.get('cases') or []) == 15,
                        bool(content.get('agent_hints')), bool(content.get('practice')),
                        bool(content.get('feedback_instruction'))]
        bucket[6][0] += sum(architecture)
        bucket[6][1] += len(architecture)
        bucket[8][0] += not publication_gaps(content, row['specialty'])
        bucket[8][1] += 1
        time_checks = [int(plan.get('time_factor') or 0) == 5,
                       bool(plan.get('station_minutes')),
                       int(minutes.get('2_etapa') or 0) == max(1, round(float(minutes.get('2') or 0) / (ae_count * 6))),
                       all(item.get('minutes') for item in content.get('cases') or [])]
        bucket[9][0] += sum(time_checks)
        bucket[9][1] += len(time_checks)
        for kind in ('cases', 'questions'):
            varied = bank_has_variety(content.get(kind))
            bucket[2][0] += varied
            bucket[2][1] += 1
            if not varied:
                issues.append(f'{course} / {row["module_title"]}: banco de {kind} con alternativas repetidas')
        if not all(hour_checks):
            issues.append(f'{course} / {row["module_title"]}: tiempo o reparto incompleto')
        if not all(architecture):
            issues.append(f'{course} / {row["module_title"]}: faltan elementos del modelo de estaciones')

    for course, course_rows in by_course.items():
        course_plan = course_planning({'title': course, 'modules': [
            {'position': row['position'], 'title': row['module_title'],
             'official_hp': enrich(json.loads(row['content']), row['position'])['planning']['official_hp']}
            for row in course_rows]})
        passed = abs(sum(module['exam_hp'] for module in course_plan['modules']) - 2) < 1e-6
        scores[course][3][0] += passed
        scores[course][3][1] += 1

    docs = ROOT / 'docs'
    docs.mkdir(exist_ok=True)
    for name, data in (('AUDITORIA_41_MODULOS_ACTIVIDADES.csv', activity_rows),
                       ('AUDITORIA_41_MODULOS_MEDIOS.csv', media_rows),
                       ('AUDITORIA_41_MODULOS_FUENTES.csv', source_rows)):
        with (docs / name).open('w', encoding='utf-8-sig', newline='') as handle:
            writer = csv.DictWriter(handle, fieldnames=data[0])
            writer.writeheader()
            writer.writerows(data)
    labels = {
        1: 'Consignas y trazabilidad', 2: 'Variedad de casos y evaluación',
        3: 'Horas oficiales y reparto', 4: 'Fuente curricular y alcance por ítem',
        5: 'Metadatos multimedia', 6: 'Estructura Aula TP',
        7: 'Texto alternativo en casos y preguntas', 8: 'Controles de publicación',
        9: 'Factor x5 y tiempos declarados',
    }
    lines = [
        '# Auditoría reproducible de los 9 prompts en todos los cursos', '',
        'Fecha: 2026-09-22. Fuente: los módulos publicados en la base local; cálculo de solo lectura.',
        f'Alcance: {len(by_course)} cursos, {len(rows)} módulos, {len(activity_rows)} actividades y {len(media_rows)} registros multimedia. Evidencias de estudiantes en esta instalación: {progress}.',
        '', '## Porcentaje por ítem y curso', '',
        'Cada porcentaje es **solo el cumplimiento de los controles automáticos indicados abajo**, no una calificación global de calidad ni una certificación. N/D significa que el juicio experto no está automatizado.',
        '', '| Prompt y control medido | ' + ' | '.join(by_course) + ' | Total |',
        '|---|' + '|'.join('---:' for _ in range(len(by_course) + 1)) + '|',
    ]
    for key, label in labels.items():
        values = [scores[course][key] for course in by_course]
        lines.append(f'| P{key} {label} | ' + ' | '.join(pct(*value) for value in values)
                     + f' | {pct(sum(value[0] for value in values), sum(value[1] for value in values))} |')
    lines += ['', '## Denominadores', '']
    for key, label in labels.items():
        passed = sum(scores[c][key][0] for c in by_course)
        total = sum(scores[c][key][1] for c in by_course)
        lines.append(f'- P{key}: {passed}/{total} controles; {label.lower()}.')
    lines += [
        '', '## Límites y correcciones', '',
        '- P1: los contratos se generan para las actividades inventariadas; su presencia no prueba claridad para estudiantes. En 37 módulos los criterios son indicadores didácticos derivados del AE, no criterios oficiales transcritos.',
        '- P2: se mide si cada banco de 15 casos y 25 preguntas tiene al menos cinco conjuntos de alternativas, decisiones correctas y evidencias distintas. Los campos didácticos están presentes, pero no prueban un ciclo Brousseau o una conversión Duval efectiva.',
        '- P3: el 30 %, las 2 HP por curso y el reparto se comprueban matemáticamente. No se ha cronometrado a estudiantes reales.',
        '- P4: cada caso y pregunta debe vincular su criterio a un programa oficial MINEDUC y declarar que los datos y decisiones son simulados; Electricidad agrega SEC/RIC. El 100 % de esta trazabilidad NO demuestra que cada decisión técnica o clínica sea correcta ni que un protocolo local esté vigente. Se requiere revisión disciplinar del contenido.',
        '- P5: los metadatos completos no prueban exactitud visual o valor pedagógico; cada medio necesita inspección humana.',
        '- P6: se comprueba arquitectura, no la calidad de los 15 casos ni de la práctica/retroalimentación.',
        '- P7: solo se comprueba presencia de texto alternativo en imágenes de casos y preguntas. DUA y lectores de pantalla requieren pruebas con usuarios.',
        '- P8: ausencia de bloqueos de publicación no equivale a consistencia visual. Falta probar las 5 estaciones en móvil y escritorio con estudiantes y docentes.',
        '- P9: el factor x5 y tiempos declarados no equivalen a una estimación real de abajo arriba por acción ni validan la carga cognitiva.',
        '- Correcciones en el simulador: instrucciones de contexto ajustadas a recursos reales y visibles en la estación 1; referencia dinámica al número de AE; tiempo por etapa calculado con los AE reales; descripción didáctica más prudente sobre conversión de registros.',
        f'- Bancos sin variedad suficiente según la pauta automática: {len(issues)} observaciones (ver lista). Los bancos generados se actualizaron solo en módulos sin progreso; la calidad disciplinar de cada decisión aún requiere revisión docente.',
        '- El informe del 21-09-2026, limitado a cuatro módulos, no acredita 100 % para los 41 módulos actuales y queda reemplazado por esta medición.',
        '', '## Fuentes oficiales de trazabilidad', '',
        '- MINEDUC Refrigeración: https://www.curriculumnacional.cl/614/articles-34318_programa.pdf',
        '- MINEDUC Electricidad: https://www.curriculumnacional.cl/614/articles-34320_programa.pdf',
        '- MINEDUC Atención de Enfermería: https://www.curriculumnacional.cl/614/articles-34350_programa.pdf',
        '- SEC Pliegos RIC: https://www.sec.cl/reglamento-de-seguridad-de-las-instalaciones-de-consumo-de-energia-electrica-decreto-08/',
        '', '## Observaciones por módulo', '',
    ]
    lines += [f'- {issue}' for issue in issues] or ['- Ninguna observación automática pendiente.']
    (docs / 'AUDITORIA_9_PROMPTS_41_MODULOS_2026-09-22.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'{len(rows)} modules, {len(activity_rows)} activities, {len(media_rows)} media, {len(issues)} issues')
    for key in labels:
        passed = sum(scores[c][key][0] for c in by_course)
        total = sum(scores[c][key][1] for c in by_course)
        print(f'P{key}: {passed}/{total} = {pct(passed, total)}')


if __name__ == '__main__':
    main()
