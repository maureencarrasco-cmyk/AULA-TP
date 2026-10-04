"""Read-only assessment inventory of every stored and runtime module."""
import json
import sqlite3
import sys
from collections import Counter
from contextlib import closing
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from assessment_integrity import assessment_issues
from pedagogy import enrich


def main():
    courses = {}
    with closing(sqlite3.connect(f'file:{ROOT / "data/aulatp.sqlite3"}?mode=ro', uri=True)) as db:
        rows = db.execute('SELECT c.title,m.id,m.position,m.content FROM modules m JOIN courses c ON c.id=m.course_id ORDER BY c.title,m.position').fetchall()
    for course, mid, position, payload in rows:
        content = json.loads(payload)
        findings = {}
        for scope, value in (('stored', content), ('runtime', enrich(deepcopy(content), position))):
            findings[scope] = assessment_issues(value)
        courses.setdefault(course, []).append({'module_id': mid, 'position': position,
            'questions': len(content.get('questions') or []),
            'cases': len(content.get('cases') or []), 'issues': findings})
    totals = Counter(issue['code'] for modules in courses.values() for module in modules
                     for issue in module['issues']['runtime'])
    output = ROOT / 'reports/correcciones-integridad-20261004'
    output.mkdir(parents=True, exist_ok=True)
    report = {'courses': len(courses), 'modules': len(rows), 'runtime_issue_counts': dict(totals),
              'disciplinary_validation': False, 'course_results': courses}
    (output / 'evaluaciones.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    lines = ['# Integridad estructural de evaluaciones', '',
             'Revision automatica; no certifica correccion tecnica de respuestas ni calidad pedagogica.', '',
             '| Curso | Modulos | Preguntas | Casos | Hallazgos en datos | Hallazgos efectivos |',
             '| --- | ---: | ---: | ---: | ---: | ---: |']
    for course, modules in courses.items():
        counts = [len(modules), sum(m['questions'] for m in modules), sum(m['cases'] for m in modules),
                  sum(len(m['issues']['stored']) for m in modules), sum(len(m['issues']['runtime']) for m in modules)]
        lines.append('| ' + course + ' | ' + ' | '.join(map(str, counts)) + ' |')
    (output / 'evaluaciones.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'course_results'}))


if __name__ == '__main__':
    main()
