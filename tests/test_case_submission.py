import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from unittest.mock import patch

from app import create_app


class CaseSubmissionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        self.addCleanup(self.tmp.cleanup)
        self.database = str(Path(self.tmp.name) / 'test.sqlite3')
        with patch('app.upgrade_catalog'):
            self.app = create_app({'TESTING': True, 'DATABASE': self.database, 'SECRET_KEY': 'test-only'})
        self.client = self.app.test_client()
        self.csrf = self.client.get('/api/session').json['csrf']
        with closing(sqlite3.connect(self.database)) as db:
            self.content = json.loads(db.execute('SELECT content FROM modules WHERE id=1').fetchone()[0])
            state = {'context': 'Contexto completado', 'ae': {
                f'{a}-{step}': 'Evidencia previa' for a in range(len(self.content['aes'])) for step in range(6)},
                'cases': {}, 'scene': None, 'exam': None, 'closed': False, 'ae_meta': {}}
            db.execute('INSERT INTO progress(user_id,module_id,state) VALUES(1,1,?)', (json.dumps(state),))
            db.commit()

    def submit(self, choice, index=0):
        return self.client.post('/api/modules/1/activity', json={
            'kind': 'case', 'index': index, 'choice': choice,
            'text': 'Contrasto los antecedentes y registro mi decision fundamentada.'},
            headers={'X-CSRF-Token': self.csrf})

    def test_third_and_fourth_alternatives_can_be_saved(self):
        for answer in (2, 3):
            with self.subTest(answer=answer):
                self.content['cases'][0]['answer'] = answer
                with closing(sqlite3.connect(self.database)) as db:
                    db.execute('UPDATE modules SET content=? WHERE id=1', (json.dumps(self.content),))
                    db.commit()
                response = self.submit(answer)
                self.assertEqual(200, response.status_code, response.json)
                self.assertEqual(answer, response.json['state']['cases']['0']['choice'])

    def test_invalid_choices_rejected_without_saving(self):
        for choice in (-1, 4, True, '2', None):
            with self.subTest(choice=choice):
                self.assertEqual(400, self.submit(choice).status_code)
        with closing(sqlite3.connect(self.database)) as db:
            state = json.loads(db.execute('SELECT state FROM progress WHERE module_id=1').fetchone()[0])
        self.assertEqual({}, state['cases'])

    def test_future_case_remains_locked(self):
        answer = self.content['cases'][1]['answer']
        self.assertEqual(403, self.submit(answer, index=1).status_code)


if __name__ == '__main__':
    unittest.main()
