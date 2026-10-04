"""Build course-specific resource, review and timing queues without changing data."""
import json
import sqlite3
import sys
from contextlib import closing
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from teacher_timing import PHASES
from assessment_integrity import learning_coverage_issues


def activity_ids(content):
    result = ['context']
    for ai, ae in enumerate(content.get('aes') or []):
        result.extend(f'ae:{ai}:step:{step}' for step in range(len(ae.get('steps') or [])))
        result.append(f'ae:{ai}:professional')
    result.extend(f'case:{i}' for i in range(len(content.get('cases') or [])))
    if content.get('scene'):
        result.append('scene')
    result.extend(f'exam:{i}' for i in range(len(content.get('questions') or [])))
    if content.get('development'):
        result.append('development')
    result.extend(f'closure:{name}' for name in ('analyze', 'understand', 'connect', 'transfer', 'project'))
    return result


def main():
    output = ROOT / 'reports/correcciones-integridad-20261004'
    inventory = json.loads((output / 'porcentajes.json').read_text(encoding='utf-8'))
    courses = {course['course']: {'missing_files': course['missing_files'], 'modules': []}
               for course in inventory['courses']}
    with closing(sqlite3.connect(f'file:{ROOT / "data/aulatp.sqlite3"}?mode=ro', uri=True)) as db:
        rows = db.execute('SELECT c.title,m.id,m.title,m.content FROM modules m JOIN courses c ON c.id=m.course_id ORDER BY c.title,m.position').fetchall()
    for course, mid, title, raw in rows:
        content = json.loads(raw)
        source = content.get('specialty_source') or content.get('official_source') or {}
        aes = [{'title': ae.get('title'), 'code': ae.get('official_code'), 'criteria': ae.get('criteria') or []}
               for ae in content.get('aes') or []]
        ids = activity_ids(content)
        courses[course]['modules'].append({'module_id': mid, 'title': title, 'source_pdf': source.get('pdf'),
            'learning_review': aes, 'required_timing_activity_ids': ids,
            'structural_review_findings': learning_coverage_issues(content),
            'timing_status': 'NOT_MEASURED', 'recorded_timings': [],
            'budget_minutes_registered': (content.get('time_audit') or {}).get('available_minutes'),
            'review_tasks': ['Contrastar AE y criterios con el PDF indicado.',
                'Resolver preguntas y casos; revisar clave, distractores, fundamento y seguridad.',
                'Comprobar que el recurso permite observar los datos requeridos sin revelar la respuesta.',
                'Revisar progresion, ayudas, transferencia y evidencia solicitada en las cinco estaciones.']})
    report = {'courses': courses, 'measurement_template': {'activity_id': 'ID de la lista del modulo',
        'role': 'teacher', 'status': 'pending', 'measured_at': None,
        'minutes': dict.fromkeys(PHASES)}, 'technical_validation_complete': False}
    (output / 'plan-completar.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    lines = ['# Plan para completar los 45 cursos', '',
        'Pendientes localizados, no certificaciones. Las mediciones estan vacias: deben registrarse al resolver cada actividad.', '',
        '| Curso | Archivos faltantes | Modulos por revisar | Hallazgos de cobertura AE | Actividades por cronometrar |',
        '| --- | --- | ---: | ---: | ---: |']
    for course, entry in courses.items():
        count = sum(len(module['required_timing_activity_ids']) for module in entry['modules'])
        findings = sum(len(module['structural_review_findings']) for module in entry['modules'])
        lines.append(f'| {course} | {", ".join(entry["missing_files"]) or "Sin faltantes registrados"} | {len(entry["modules"])} | {findings} | {count} |')
    lines.extend(['', '## Recursos',
        'Cada imagen pendiente necesita observaciones tecnicas propias de su especialidad y de los AE/criterios listados en el JSON. Una foto ambiental no sustituye una evidencia tecnica. No agregar cotas, lecturas ni normas sin fuente.',
        '', '## Tiempos',
        'Registrar lectura, consulta de recursos, resolucion y escritura en minutos, con fecha y rol docente. El calculo aplica x5 al tiempo observado y sensibilidad x3/x4/x6. Si falta una actividad, no se calcula cobertura total.',
        'Las actividades listadas son el recorrido principal; revisar con el docente encargos y componentes internos antes de usarlo como inventario definitivo. El presupuesto registrado tambien requiere contraste curricular.'])
    (output / 'plan-completar.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(json.dumps({'courses': len(courses), 'modules': len(rows),
        'missing_files': len({path for entry in courses.values() for path in entry['missing_files']}),
        'structural_review_findings': sum(len(module['structural_review_findings']) for entry in courses.values() for module in entry['modules']),
        'measured_activities': 0}))


if __name__ == '__main__':
    main()
