import tempfile
import unittest
import json
import sqlite3
from pathlib import Path
from unittest.mock import patch
from urllib.parse import quote

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

    def test_each_station_has_five_distinct_four_choice_questions_and_all_four_skills(self):
        topics = ['Diagrama de sistemas', 'Diagnóstico de fallas', 'Procedimiento de reparación', 'Control de calidad']
        path = '/api/modules/1/city-station-quiz?station=1&topics=' + quote(json.dumps(topics))
        first = self.student.get(path)
        self.assertEqual(first.status_code, 200, first.json)
        question = first.json['question']
        self.assertNotIn('answer', question)
        self.assertEqual((first.json['question_number'], first.json['total_questions']), (1, 5))
        banks = {}
        for station in range(1, 5):
            data = first.json if station == 1 else self.student.get(f'/api/modules/1/city-station-quiz?station={station}').json
            self.assertEqual(len(data['question']['options']), 4)
            banks[station] = data
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            raw = con.execute('select state from progress where user_id=1 and module_id=1').fetchone()[0]
        state = json.loads(raw)['city_station_quizzes']
        ids = [question_id for station in range(1, 5) for question_id in state[str(station)]['question_ids']]
        self.assertEqual(len(ids), 20)
        self.assertEqual(len(set(ids)), 20)
        expected = {'Representar', 'Resolver problemas', 'Modelar', 'Argumentar'}
        for station in range(1, 5):
            data = banks[station]
            item = state[str(station)]
            self.assertEqual(len(item['question_ids']), 5)
            self.assertTrue(expected.issubset(set(item['skills'])))
            self.assertEqual(data['skill'], item['skills'][0])
            self.assertEqual(data['topic'], topics[station-1])

    def test_wrong_answer_retries_same_slot_then_requires_all_five_correct(self):
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
        self.assertEqual(wrong.json['next_skill'], first.json['skill'])
        self.assertNotIn('answer', next_question)
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            state = json.loads(con.execute('select state from progress where user_id=1 and module_id=1').fetchone()[0])['city_station_quizzes']
        other_station_ids = {question_id for station, group in state.items() if station in ('2', '3', '4') for question_id in group.get('question_ids', [])}
        self.assertNotIn(next_question['id'], other_station_ids)
        self.assertEqual(self.submit(1, question, original['answer']).status_code, 409)

        refreshed = self.student.get(path)
        self.assertEqual(refreshed.json['question']['id'], next_question['id'])
        current = next_question
        result = None
        for index in range(5):
            original = next(item for item in bank if item['id'] == current['id'])
            result = self.submit(1, current, original['answer'])
            self.assertEqual(result.status_code, 200, result.json)
            if index < 4:
                self.assertTrue(result.json['correct'])
                self.assertFalse(result.json['passed'])
                self.assertEqual(result.json['question_number'], index + 2)
                current = result.json['next_question']
            else:
                self.assertTrue(result.json['correct'])
                self.assertTrue(result.json['passed'])
        passed = result
        self.assertTrue(passed.json['passed'])
        self.assertEqual(self.student.get(path).json['passed'], True)

    def test_station_number_and_authentication_are_checked(self):
        self.assertEqual(self.student.get('/api/modules/1/city-station-quiz?station=5').status_code, 400)
        self.assertEqual(self.app.test_client().get('/api/modules/1/city-station-quiz?station=1').status_code, 401)


if __name__ == '__main__':
    unittest.main()
