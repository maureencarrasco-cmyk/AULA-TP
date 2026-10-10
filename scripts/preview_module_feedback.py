"""Temporary visual test server with synthetic feedback; no production data is read."""
import secrets
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from flask import redirect, session
from app import create_app

with tempfile.TemporaryDirectory(prefix='aulatp-feedback-preview-', ignore_cleanup_errors=True) as tmp:
    app = create_app({'TESTING': True, 'DATABASE': str(Path(tmp) / 'preview.sqlite3'), 'SECRET_KEY': 'visual-test-only'})
    @app.get('/preview/<role>')
    def preview(role):
        if role not in ('teacher', 'student'):
            return 'Invalid test role', 404
        session['uid'] = 2 if role == 'teacher' else 1
        session['csrf'] = secrets.token_hex(32)
        return redirect('/portal/cursos/#module/227/5')

    client = app.test_client()
    token = client.get('/api/session').json['csrf']
    login = client.post('/api/login', json={'username': 'docente', 'password': 'DocenteTP2026!'}, headers={'X-CSRF-Token': token})
    token = login.json['csrf']
    result = client.put('/api/teacher/modules/227/feedback', json={'text': 'PRUEBA VISUAL: Reconoce tus avances al mantener los parámetros ambientales.\nContrasta tus decisiones con las evidencias y explica cómo verificarías el resultado.'}, headers={'X-CSRF-Token': token})
    assert result.status_code == 200

    app.run(host='127.0.0.1', port=8101, debug=False)
