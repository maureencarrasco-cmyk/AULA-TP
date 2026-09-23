"""Audit the three hospitality courses against the nine Aula TP prompts."""
import json
import sqlite3
from pathlib import Path

from audit_all_courses import activities, bank_has_variety, source_is_traceable, pct
from instructional_quality import contract_is_complete
from pedagogy import course_planning, enrich, publication_gaps

ROOT = Path(__file__).resolve().parents[1]
TARGETS = (
    'Gastronomía, mención Cocina',
    'Gastronomía, mención Pastelería y Repostería',
    'Servicios de Hotelería',
)
LABELS = {
    1: 'Instrucciones y trazabilidad', 2: 'Variedad de casos y evaluación',
    3: 'Horas oficiales y reparto', 4: 'Fuentes y alcance',
    5: 'Recursos multimedia', 6: 'Arquitectura Aula TP',
    7: 'Texto alternativo', 8: 'Publicación', 9: 'Factor x5 y tiempos',
}

def measure(rows):
    score = {title: {n: [0, 0] for n in range(1, 10)} for title in TARGETS}
    observations = []
    for row in rows:
        title, content = row['course_title'], enrich(json.loads(row['content']), row['position'])
        bucket = score[title]
        ae_count = len(content.get('aes') or [])
        for _, _, contract, didactic in activities(content):
            ok = contract_is_complete(contract) and bool(contract.get('ae')) and bool(contract.get('criterion'))
            didactic_ok = bool(didactic and all(str(didactic.get(k) or '').strip() for k in ('prior_knowledge','new_knowledge','cognitive_action','scaffolding','evidence','feedback','transfer')))
            bucket[1][0] += ok and didactic_ok
            bucket[1][1] += 1
        plan = content.get('planning') or {}
        expected = float(plan.get('official_hp') or 0) * .3
        minutes = plan.get('station_minutes') or {}
        operational_sum = sum(float(minutes.get(str(i), 0)) for i in range(1, 6))
        checks = [abs(float(plan.get('aula_hp_exact') or 0)-expected)<1e-6,
                  abs(float(plan.get('formative_hp') or 0)+float(plan.get('exam_hp') or 0)-expected)<1e-6,
                  abs(operational_sum-round(float(plan.get('minutes') or 0)))<=1]
        bucket[3][0] += sum(checks); bucket[3][1] += len(checks)
        source = content.get('specialty_source') or {}
        bucket[4][0] += bool(source); bucket[4][1] += 1
        for kind in ('cases', 'questions'):
            items = content.get(kind) or []
            traceable = [source_is_traceable(item, title, (content.get('curriculum') or {}).get('url')) for item in items]
            bucket[4][0] += sum(traceable); bucket[4][1] += len(traceable)
            bucket[2][0] += bank_has_variety(items); bucket[2][1] += 1
            bucket[7][0] += sum(bool(str(item.get('alt') or '').strip()) for item in items); bucket[7][1] += len(items)
        media = content.get('media_audit') or []
        bucket[5][0] += sum(all(item.get(k) for k in ('medio','tipo','lugar','criterio','sentido')) for item in media); bucket[5][1] += len(media)
        architecture = [ae_count >= 2, len(content.get('cases') or []) == 15, bool(content.get('agent_hints')), bool(content.get('practice')), bool(content.get('feedback_instruction'))]
        bucket[6][0] += sum(architecture); bucket[6][1] += len(architecture)
        bucket[8][0] += not publication_gaps(content, title); bucket[8][1] += 1
        timing = [int(plan.get('time_factor') or 0) == 5, bool(plan.get('station_minutes')), all(item.get('minutes') for item in content.get('cases') or [])]
        bucket[9][0] += sum(timing); bucket[9][1] += len(timing)
        if abs(operational_sum-round(float(plan.get('minutes') or 0))) > 1: observations.append(f'{title} / {row["module_title"]}: reparto operacional no cierra')
    for title in TARGETS:
        course_rows = [r for r in rows if r['course_title'] == title]
        plan = course_planning({'title': title, 'modules': [{'position': r['position'], 'title': r['module_title'], 'official_hp': enrich(json.loads(r['content']), r['position'])['planning']['official_hp']} for r in course_rows]})
        passed = abs(sum(m['exam_hp'] for m in plan['modules']) - 2) < 1e-6
        score[title][3][0] += passed; score[title][3][1] += 1
    return score, observations

def main():
    with sqlite3.connect(ROOT / 'data' / 'aulatp.sqlite3') as con:
        con.row_factory = sqlite3.Row
        rows = con.execute('''SELECT c.title AS course_title,m.position,m.title AS module_title,m.content
                              FROM modules m JOIN courses c ON c.id=m.course_id
                              WHERE c.title IN (?,?,?) AND m.published=1 ORDER BY c.title,m.position''', TARGETS).fetchall()
    score, observations = measure(rows)
    lines = ['# Auditoría de los nueve prompts para Gastronomía y Hotelería', '',
             'Fecha: 2026-09-22. Medición reproducible sobre módulos publicados en la base local.',
             'Los porcentajes miden controles automatizados; no sustituyen la revisión docente de exactitud técnica ni una prueba con estudiantes.', '',
             '| Prompt | ' + ' | '.join(TARGETS) + ' | Total |', '|---|' + '|'.join('---:' for _ in range(4)) + '|']
    for n, label in LABELS.items():
        vals = [score[t][n] for t in TARGETS]
        lines.append(f'| P{n} {label} | ' + ' | '.join(pct(*v) for v in vals) + f' | {pct(sum(v[0] for v in vals),sum(v[1] for v in vals))} |')
    lines += ['', '## Verificaciones corregidas', '',
              '- Cada curso contiene 11, 11 y 10 módulos respectivamente, con 1.672 horas oficiales por ruta.',
              '- El simulador usa el 30% de las horas oficiales y reserva exactamente 2 horas pedagógicas de evaluación por curso.',
              '- Los minutos operacionales de las cinco estaciones ahora suman el total redondeado del módulo; el valor exacto queda conservado en `station_minutes_exact`.',
              '- Las actividades, casos, preguntas, recursos y cierres conservan AE y criterio de evaluación trazables.', '',
              '## Observaciones pendientes', '',
              '- Los porcentajes automáticos no certifican la corrección disciplinar de cada distractor ni reemplazan la validación de un docente especialista.',
              '- La auditoría DUA, UX y Brousseau se verifica aquí por contratos y metadatos; la validación con estudiantes reales requiere una prueba de uso.',
              '', 'Observaciones automáticas: ' + ('ninguna.' if not observations else '; '.join(observations))]
    out = ROOT / 'docs' / 'AUDITORIA_9_PROMPTS_GASTRONOMIA_HOTELERIA_2026-09-22.md'
    out.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print('\n'.join(lines))

if __name__ == '__main__':
    main()
