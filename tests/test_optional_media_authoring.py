import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from copy import deepcopy
from pathlib import Path
from unittest.mock import patch

from app import create_app
from content import DEFAULT_CONTENT


class OptionalMediaAuthoringTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        self.addCleanup(self.tmp.cleanup)
        self.database = str(Path(self.tmp.name) / 'test.sqlite3')
        with patch('app.upgrade_catalog'):
            self.app = create_app({'TESTING': True, 'DATABASE': self.database, 'SECRET_KEY': 'test-only'})
        self.client = self.app.test_client()
        csrf = self.client.get('/api/session').json['csrf']
        login = self.client.post('/api/login', json={'username': 'docente', 'password': 'DocenteTP2026!'},
                                 headers={'X-CSRF-Token': csrf})
        self.csrf = login.json['csrf']

    def save(self, content):
        return self.client.put('/api/teacher/modules/2', json={
            'title': 'Modulo de prueba', 'published': False, 'content': content},
            headers={'X-CSRF-Token': self.csrf})

    def test_optional_context_can_be_saved_without_inventing_an_image(self):
        content = deepcopy(DEFAULT_CONTENT)
        item = content['questions'][0]
        item['image'] = None
        item['unavailable_media'] = {'image': {'role': 'context', 'path': 'static/headers/pendiente/e4.png'}}
        response = self.save(content)
        self.assertEqual(200, response.status_code, response.json)
        with closing(sqlite3.connect(self.database)) as db:
            saved = json.loads(db.execute('SELECT content FROM modules WHERE id=2').fetchone()[0])
        self.assertIsNone(saved['questions'][0]['image'])
        self.assertEqual(content['questions'][0]['answer'], saved['questions'][0]['answer'])
        self.assertEqual(content['questions'][0]['options'], saved['questions'][0]['options'])

    def test_required_or_unclassified_missing_image_still_rejected(self):
        for role, required in (('context', True), ('evidence', False), (None, False)):
            with self.subTest(role=role, required=required):
                content = deepcopy(DEFAULT_CONTENT)
                content['questions'][0].update(image=None, requires_image=required,
                    unavailable_media={'image': {'role': role}})
                self.assertEqual(400, self.save(content).status_code)

    def test_malformed_media_metadata_rejected_without_server_error(self):
        for metadata in ('incorrecto', ['image'], {'image': 'incorrecto'}, {'image': ['context']}):
            with self.subTest(metadata=metadata):
                content = deepcopy(DEFAULT_CONTENT)
                content['questions'][0].update(image=None, unavailable_media=metadata)
                self.assertEqual(400, self.save(content).status_code)
