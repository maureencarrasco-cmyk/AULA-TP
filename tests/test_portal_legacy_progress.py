import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app import create_app


class PortalLegacyProgressTest(unittest.TestCase):
    def test_partial_progress_loads_without_changing_saved_data(self):
        with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as directory, patch('app.upgrade_catalog'):
            database = str(Path(directory) / 'portal.sqlite3')
            app = create_app({'TESTING': True, 'DATABASE': database, 'SECRET_KEY': 'test'})
            client = app.test_client()
            entered = client.get('/api/portal-docente/enter').get_json()
            uid = entered['user']['id']
            with sqlite3.connect(database) as connection:
                module = connection.execute('SELECT id FROM modules LIMIT 1').fetchone()[0]
                original = json.dumps({'context': 'avance anterior', 'ae': None, 'cases': None})
                connection.execute('INSERT INTO progress(user_id,module_id,state) VALUES(?,?,?)', (uid, module, original))
            for endpoint in ['/api/courses', '/api/teacher']:
                response = client.get(endpoint, headers={'X-Aula-Portal': 'docente'})
                self.assertEqual(response.status_code, 200, endpoint)
                self.assertTrue(response.is_json)
            with sqlite3.connect(database) as connection:
                self.assertEqual(connection.execute('SELECT state FROM progress WHERE user_id=? AND module_id=?', (uid, module)).fetchone()[0], original)


if __name__ == '__main__':
    unittest.main()
