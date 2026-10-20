import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app import create_app
from content import DEFAULT_CONTENT


class CityStationQuizAPI(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        with patch('app.upgrade_catalog'), patch('app.ensure_course_catalog'):
            self.app = create_app({'TESTING': True, 'DATABASE': str(Path(self.tmp.name) / 'station.sqlite3'), 'SECRET_KEY': 'station-test'})
        self.student = self.app.test_client()
        token = self.student.get('/api/session').json['csrf']
        response = self.student.post('/api/login', json={'username': 'estudiante', 'password': 'AulaTP2026!'}, headers={'X-CSRF-Token': token})
        self.csrf = response.json['csrf']

    def tearDown(self):
        self.tmp.cleanup()

    def submit(self, station, question, choice):
        return self.student.post('/api/modules/1/city-station-quiz', json={
            'station': station, 'question_id': question['id'], 'choice': choice,
            'argument': 'Contrasté la evidencia y el criterio técnico antes de decidir.'
        }, headers={'X-CSRF-Token': self.csrf})

    def test_wrong_answer_returns_new_question_then_pass_persists(self):
        path = '/api/modules/1/city-station-quiz?station=1'
        first = self.student.get(path)
        self.assertEqual(first.status_code, 200, first.json)
        question = first.json['question']
        self.assertNotIn('answer', question)
        bank = DEFAULT_CONTENT['questions']
        original = next(item for item in bank if item['id'] == question['id'])

        wrong = self.submit(1, question, (original['answer'] + 1) % len(original['options']))
        self.assertEqual(wrong.status_code, 200, wrong.json)
        self.assertFalse(wrong.json['passed'])
        self.assertIn('feedback', wrong.json)
        next_question = wrong.json['next_question']
        self.assertNotEqual(next_question['id'], question['id'])
        self.assertEqual(next_question['ae'], question['ae'])
        self.assertNotIn('answer', next_question)
        self.assertEqual(self.submit(1, question, original['answer']).status_code, 409)

        refreshed = self.student.get(path)
        self.assertEqual(refreshed.json['question']['id'], next_question['id'])
        next_original = next(item for item in bank if item['id'] == next_question['id'])
        passed = self.submit(1, next_question, next_original['answer'])
        self.assertEqual(passed.status_code, 200, passed.json)
        self.assertTrue(passed.json['passed'])
        self.assertEqual(self.student.get(path).json['passed'], True)

    def test_station_number_and_authentication_are_checked(self):
        self.assertEqual(self.student.get('/api/modules/1/city-station-quiz?station=5').status_code, 400)
        self.assertEqual(self.app.test_client().get('/api/modules/1/city-station-quiz?station=1').status_code, 401)


if __name__ == '__main__':
    unittest.main()
