import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app import create_app


class CoursePerformanceTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        self.database = str(Path(self.temp.name) / 'campus.sqlite3')
        with patch('app.upgrade_catalog'):
            self.app = create_app({'TESTING': True, 'DATABASE': self.database, 'SECRET_KEY': 'test'})
        self.client = self.app.test_client()
        self.client.get('/api/session')

    def tearDown(self):
        self.temp.cleanup()

    def test_projection_matches_original_metadata(self):
        with sqlite3.connect(self.database) as con:
            for raw, count in con.execute('SELECT m.content,c.ae_count FROM modules m JOIN course_catalog c ON c.module_id=m.id'):
                self.assertEqual(count, len(json.loads(raw)['aes']))
        self.assertEqual(len(self.client.get('/api/courses?compact=1').json[0]['modules']), 4)

    def test_projection_tracks_insert_update_and_delete(self):
        content = {'aes': [{}, {}], 'specialty_source': {'official_hp': 90, 'year': '4° medio'}}
        with sqlite3.connect(self.database) as con:
            con.execute('INSERT INTO modules(id,course_id,title,position,published,content) VALUES(50,1,?,5,1,?)', ('Nuevo', json.dumps(content)))
        module = self.client.get('/api/courses?compact=1').json[0]['modules'][-1]
        self.assertEqual(module['official_year'], '4° medio')
        self.assertEqual(module['official_hp'], 90)
        with sqlite3.connect(self.database) as con:
            con.execute('UPDATE modules SET content=? WHERE id=50', (json.dumps({'aes': [{}]}),))
            self.assertEqual(con.execute('SELECT ae_count FROM course_catalog WHERE module_id=50').fetchone()[0], 1)
            con.execute('DELETE FROM modules WHERE id=50')
            self.assertIsNone(con.execute('SELECT 1 FROM course_catalog WHERE module_id=50').fetchone())

    def test_progress_is_not_cached_and_original_content_is_untouched(self):
        with sqlite3.connect(self.database) as con:
            original = con.execute('SELECT content FROM modules WHERE id=1').fetchone()[0]
            state = {'context': 'Mi evidencia', 'ae': {}, 'cases': {}, 'scene': None, 'exam': None, 'closed': False}
            con.execute('INSERT INTO progress(user_id,module_id,state) VALUES(1,1,?)', (json.dumps(state),))
        response = self.client.get('/api/courses?compact=1')
        self.assertEqual(response.json[0]['modules'][0]['percent'], 20)
        self.assertIn('no-store', response.headers['Cache-Control'])
        with sqlite3.connect(self.database) as con:
            con.execute('UPDATE progress SET state=? WHERE user_id=1 AND module_id=1', (json.dumps({**state, 'closed': True}),))
            self.assertEqual(con.execute('SELECT content FROM modules WHERE id=1').fetchone()[0], original)
        self.assertEqual(self.client.get('/api/courses?compact=1').json[0]['modules'][0]['percent'], 40)

    def test_private_catalog_still_requires_a_session(self):
        self.assertEqual(self.app.test_client().get('/api/courses?compact=1').status_code, 401)
        with sqlite3.connect(self.database) as con:
            con.execute("INSERT INTO users(id,username,name,password,role) VALUES(7,'other','Other','unused','student')")
        client = self.app.test_client()
        with client.session_transaction() as session:
            session['uid'] = 7
        self.assertEqual(client.get('/api/courses?compact=1').json, [])

    def test_versioned_resources_cache_but_documents_and_private_data_do_not(self):
        cached = self.client.get('/static/campus-bootstrap.js?v=20261011-fast-courses')
        self.assertIn('immutable', cached.headers['Cache-Control'])
        resource = self.client.get('/static/campus-bootstrap.js')
        self.assertIn('must-revalidate', resource.headers['Cache-Control'])
        unchanged = self.client.get('/static/campus-bootstrap.js', headers={'If-None-Match': resource.headers['ETag']})
        self.assertEqual(unchanged.status_code, 304)
        self.assertIn('no-store', self.client.get('/portal/cursos/').headers['Cache-Control'])
        self.assertIn('no-store', self.client.get('/api/session').headers['Cache-Control'])


if __name__ == '__main__':
    unittest.main()
