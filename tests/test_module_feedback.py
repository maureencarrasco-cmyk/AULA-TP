import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

from app import create_app

TEXT = 'Reconoce tus avances y fundamenta tus decisiones utilizando las evidencias del módulo.'


class ModuleFeedbackFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        cls.config = {'TESTING': True, 'DATABASE': str(Path(cls.tmp.name) / 'feedback.sqlite3'), 'SECRET_KEY': 'feedback-test-only'}
        cls.app = create_app(cls.config)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def setUp(self):
        with closing(sqlite3.connect(self.config['DATABASE'])) as con, con:
            con.execute('DELETE FROM module_feedback')
            con.execute('DELETE FROM progress')
        self.student = self.app.test_client()
        self.teacher = self.app.test_client()
        self.student_csrf = self.login(self.student, 'estudiante', 'AulaTP2026!')
        self.teacher_csrf = self.login(self.teacher, 'docente', 'DocenteTP2026!')

    def login(self, client, username, password):
        token = client.get('/api/session').json['csrf']
        result = client.post('/api/login', json={'username': username, 'password': password}, headers={'X-CSRF-Token': token})
        self.assertEqual(result.status_code, 200)
        return result.json['csrf']

    def publish(self, text=TEXT, mid=1):
        return self.teacher.put(f'/api/teacher/modules/{mid}/feedback', json={'text': text}, headers={'X-CSRF-Token': self.teacher_csrf})

    def test_publish_read_update_and_persist_without_changing_progress(self):
        before = self.student.get('/api/modules/1').json
        self.assertIsNone(before['module_feedback'])
        self.assertIsNone(self.student.get('/api/modules/1/feedback').json['feedback'])
        published = self.publish('  ' + TEXT + '  ')
        self.assertEqual(published.status_code, 200)
        self.assertEqual(published.json['feedback']['text'], TEXT)
        self.assertEqual(published.json['feedback']['teacher_id'], 2)
        self.assertTrue(published.json['feedback']['updated_at'].endswith('Z'))
        after = self.student.get('/api/modules/1').json
        self.assertEqual(after['state'], before['state'])
        self.assertEqual(after['completed'], before['completed'])
        self.assertEqual(after['content'], before['content'])
        self.assertEqual(after['module_feedback']['text'], TEXT)
        updated = TEXT + ' Revisa también el criterio técnico.'
        self.assertEqual(self.publish(updated).status_code, 200)
        fresh = create_app(self.config).test_client()
        self.login(fresh, 'estudiante', 'AulaTP2026!')
        self.assertEqual(fresh.get('/api/modules/1/feedback').json['feedback']['text'], updated)
        self.assertIsNone(fresh.get('/api/modules/2/feedback').json['feedback'])

    def test_role_csrf_enrollment_and_publication_permissions(self):
        path = '/api/teacher/modules/1/feedback'
        self.assertEqual(self.student.put(path, json={'text': TEXT}, headers={'X-CSRF-Token': self.student_csrf}).status_code, 403)
        self.assertEqual(self.teacher.put(path, json={'text': TEXT}).status_code, 403)
        self.assertEqual(self.app.test_client().get('/api/modules/1/feedback').status_code, 401)
        self.assertEqual(self.publish(mid=999999).status_code, 404)
        self.assertEqual(self.student.get('/api/modules/999999/feedback').status_code, 404)
        with closing(sqlite3.connect(self.config['DATABASE'])) as con, con:
            uid = con.execute("SELECT id FROM users WHERE username='feedbackprivate'").fetchone()
        if not uid:
            created = self.teacher.post('/api/teacher/users', json={'username': 'feedbackprivate', 'name': 'Estudiante de prueba', 'password': 'FeedbackTest2026!'}, headers={'X-CSRF-Token': self.teacher_csrf})
            self.assertEqual(created.status_code, 200)
        private = self.app.test_client()
        self.login(private, 'feedbackprivate', 'FeedbackTest2026!')
        self.assertEqual(private.get('/api/modules/1/feedback').status_code, 403)
        with closing(sqlite3.connect(self.config['DATABASE'])) as con, con:
            con.execute('UPDATE modules SET published=0 WHERE id=1')
        try:
            self.assertEqual(self.student.get('/api/modules/1/feedback').status_code, 403)
            self.assertEqual(self.teacher.get('/api/modules/1/feedback').status_code, 200)
        finally:
            with closing(sqlite3.connect(self.config['DATABASE'])) as con, con:
                con.execute('UPDATE modules SET published=1 WHERE id=1')

    def test_validation_does_not_publish_invalid_comments(self):
        for value in ['', 'Muy corto', 'x' * 10001, None, True, 123, ['comment']]:
            with self.subTest(value_type=type(value).__name__):
                self.assertEqual(self.publish(value).status_code, 400)
        self.assertEqual(self.teacher.put('/api/teacher/modules/1/feedback', json=['invalid'], headers={'X-CSRF-Token': self.teacher_csrf}).status_code, 400)
        self.assertIsNone(self.student.get('/api/modules/1/feedback').json['feedback'])

    def test_individual_review_is_private_and_retained(self):
        initial = self.student.get('/api/modules/1').json['state']
        initial['exam'] = {'score': 10, 'review': {'score': 15, 'feedback': 'Comentario personal del estudiante uno.'}}
        other = dict(initial, exam={'score': 20, 'review': {'score': 25, 'feedback': 'Comentario privado de otro estudiante.'}})
        with closing(sqlite3.connect(self.config['DATABASE'])) as con, con:
            con.execute('INSERT INTO progress(user_id,module_id,state) VALUES(1,1,?)', (json.dumps(initial),))
            con.execute('INSERT INTO progress(user_id,module_id,state) VALUES(2,1,?)', (json.dumps(other),))
            before = con.execute('SELECT user_id,state,updated FROM progress ORDER BY user_id').fetchall()
        self.assertEqual(self.publish().status_code, 200)
        student = self.student.get('/api/modules/1/feedback').json
        self.assertEqual(student['feedback']['text'], TEXT)
        self.assertEqual(student['individual_feedback'], initial['exam']['review']['feedback'])
        self.assertNotIn('Comentario privado', json.dumps(student))
        self.assertIsNone(self.teacher.get('/api/modules/1/feedback').json['individual_feedback'])
        with closing(sqlite3.connect(self.config['DATABASE'])) as con, con:
            self.assertEqual(con.execute('SELECT user_id,state,updated FROM progress ORDER BY user_id').fetchall(), before)


if __name__ == '__main__':
    unittest.main()
