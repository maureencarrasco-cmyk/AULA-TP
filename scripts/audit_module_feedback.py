"""Verify all module feedback endpoints in a disposable database, never the campus DB."""
import json
import sqlite3
import sys
import tempfile
from contextlib import closing
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import create_app

ROOT = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmp:
    database = str(Path(tmp) / 'verification.sqlite3')
    app = create_app({'TESTING': True, 'DATABASE': database, 'SECRET_KEY': 'feedback-audit-only'})
    teacher, student = app.test_client(), app.test_client()

    def login(client, username, password):
        token = client.get('/api/session').json['csrf']
        result = client.post('/api/login', json={'username': username, 'password': password}, headers={'X-CSRF-Token': token})
        assert result.status_code == 200
        return result.json['csrf']

    token = login(teacher, 'docente', 'DocenteTP2026!')
    login(student, 'estudiante', 'AulaTP2026!')
    with closing(sqlite3.connect(database)) as con, con:
        con.row_factory = sqlite3.Row
        courses = [dict(row) for row in con.execute('SELECT id,title FROM courses ORDER BY id')]
        modules = [dict(row) for row in con.execute('SELECT id,course_id,title FROM modules ORDER BY id')]
    expected = {}
    for course in courses:
        first = next(module for module in modules if module['course_id'] == course['id'])
        text = f"PRUEBA AUTOMATIZADA: Retroalimentación exclusiva del módulo {first['id']} del curso {course['id']}."
        result = teacher.put(f"/api/teacher/modules/{first['id']}/feedback", json={'text': text}, headers={'X-CSRF-Token': token})
        assert result.status_code == 200
        expected[first['id']] = text
    checks = []
    for module in modules:
        for client in (teacher, student):
            response = client.get(f"/api/modules/{module['id']}/feedback")
            assert response.status_code == 200
            result = response.json
            assert result['module_id'] == module['id']
            assert (result['feedback'] or {}).get('text') == expected.get(module['id'])
            assert result['individual_feedback'] is None
        checks.append({**module, 'teacherAccess': True, 'studentAccess': True, 'moduleIsolation': True})
    with closing(sqlite3.connect(database)) as con, con:
        assert con.execute('SELECT count(*) FROM progress').fetchone()[0] == 0
    assert len(courses) == 45 and len(modules) == 451
    report = {'courses': 45, 'modules': 451, 'endpointReads': 902, 'testPublications': 45, 'database': 'Disposable test database only', 'progressUnchanged': True, 'coursesDetail': [{**course, 'modules': [row for row in checks if row['course_id'] == course['id']]} for course in courses]}
    output = ROOT / 'reports' / 'retroalimentacion-docente-20261008'
    output.mkdir(parents=True, exist_ok=True)
    (output / 'catalogo-verificado.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({key: report[key] for key in ('courses', 'modules', 'endpointReads', 'testPublications', 'progressUnchanged')}))
