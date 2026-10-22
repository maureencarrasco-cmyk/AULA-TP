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

    def test_room_resources_require_access_and_do_not_expose_answers(self):
        self.assertNotEqual(self.app.test_client().get('/api/modules/1/city-room-setup').status_code, 200)
        result = self.student.get('/api/modules/1/city-room-setup')
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.json['learning_outcomes'])
        self.assertNotIn('questions', result.json)
        self.assertNotIn('answers', result.json)
        self.assertNotEqual(self.student.get('/api/modules/999999/city-room-setup').status_code, 200)

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
        difficulty_counts = {'Fácil': 0, 'Media': 0, 'Difícil': 0}
        for station in range(1, 5):
            data = banks[station]
            item = state[str(station)]
            self.assertEqual(len(item['question_ids']), 5)
            self.assertEqual(len(item['difficulty_levels']), 5)
            for level in item['difficulty_levels']:
                difficulty_counts[level] += 1
            self.assertTrue(expected.issubset(set(item['skills'])))
            self.assertEqual(data['skill'], item['skills'][0])
            self.assertEqual(data['topic'], topics[station-1])
        self.assertEqual(difficulty_counts, {'Fácil': 10, 'Media': 8, 'Difícil': 2})

    def test_station_quiz_rejects_banks_without_exactly_four_distinct_choices(self):
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            original = con.execute('select content from modules where id=1').fetchone()[0]
        for options in (['A', 'B', 'C'], ['A', 'B', 'C', 'D', 'E'], ['A', 'B', 'C', 'C']):
            content = json.loads(original)
            for question in content['questions']:
                question['options'] = options
            with sqlite3.connect(self.app.config['DATABASE']) as con:
                con.execute('update modules set content=? where id=1', (json.dumps(content),))
            with self.subTest(options=options):
                with patch('app.enrich', side_effect=lambda value, position: value):
                    response = self.student.get('/api/modules/1/city-station-quiz?station=1')
                self.assertEqual(response.status_code, 409)

    def test_legacy_ten_question_station_bank_is_archived_and_rebuilt_as_five(self):
        self.assertEqual(self.student.get('/api/modules/1/city-station-quiz?station=1').status_code, 200)
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            con.execute('update progress set state=? where user_id=1 and module_id=1', (json.dumps({
                'city_station_quizzes': {
                    'version': 4,
                    **{str(number): {
                        'question_ids': list(range(number * 10, number * 10 + 10)),
                        'skills': ['Representar'] * 10,
                        'difficulty_levels': ['Fácil'] * 10,
                        'slot_index': 0,
                        'current_id': number * 10,
                        'attempts': [],
                        'passed': False,
                    } for number in range(1, 5)},
                }
            }),))

        response = self.student.get('/api/modules/1/city-station-quiz?station=1')
        self.assertEqual(response.status_code, 200, response.json)
        self.assertEqual((response.json['question_number'], response.json['total_questions']), (1, 5))
        self.assertEqual(len(response.json['question']['options']), 4)
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            state = json.loads(con.execute('select state from progress where user_id=1 and module_id=1').fetchone()[0])
        stations = state['city_station_quizzes']
        self.assertEqual(stations['version'], 5)
        self.assertEqual(len(state['city_station_quiz_history']), 1)
        self.assertEqual(state['city_station_quiz_history'][0]['stations']['1']['question_ids'], list(range(10, 20)))
        for number in range(1, 5):
            self.assertEqual(len(stations[str(number)]['question_ids']), 5)
            self.assertEqual(len(stations[str(number)]['difficulty_levels']), 5)

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
        self.assertEqual(wrong.json['feedback'], original['option_feedback'][(original['answer'] + 1) % 4])
        self.assertEqual((wrong.json['question_number'], wrong.json['correct_in_quiz']), (1, 0))
        next_question = wrong.json['next_question']
        self.assertNotEqual(next_question['id'], question['id'])
        self.assertEqual(wrong.json['next_skill'], first.json['skill'])
        self.assertNotIn('answer', next_question)
        next_original = next(item for item in bank if item['id'] == next_question['id'])
        wrong_again = self.submit(1, next_question, (next_original['answer'] + 1) % len(next_original['options']))
        self.assertFalse(wrong_again.json['correct'])
        self.assertEqual(wrong_again.json['feedback'], next_original['option_feedback'][(next_original['answer'] + 1) % 4])
        self.assertEqual((wrong_again.json['question_number'], wrong_again.json['correct_in_quiz']), (1, 0))
        second_retry = wrong_again.json['next_question']
        self.assertNotIn(second_retry['id'], {question['id'], next_question['id']})
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            state = json.loads(con.execute('select state from progress where user_id=1 and module_id=1').fetchone()[0])['city_station_quizzes']
        other_station_ids = {question_id for station, group in state.items() if station in ('2', '3', '4') for question_id in group.get('question_ids', [])}
        self.assertNotIn(second_retry['id'], other_station_ids)
        self.assertEqual(self.submit(1, question, original['answer']).status_code, 409)

        refreshed = self.student.get(path)
        self.assertEqual(refreshed.json['question']['id'], second_retry['id'])
        current = second_retry
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

    def test_four_station_quizzes_unlock_portal_and_preserve_mission_progression(self):
        experience = self.student.get('/api/modules/1/city-experience')
        self.assertEqual(experience.status_code, 200)
        self.assertTrue(experience.json['preview_mode'])
        self.assertTrue(experience.json['stage2_unlocked'])
        self.assertEqual(len(experience.json['plan']['quiz']), 5)
        self.assertTrue(all(len(question.get('options') or []) == 4 for question in experience.json['plan']['quiz']))
        self.assertEqual(experience.json['station_progress'], [
            {'station': 1, 'passed': False}, {'station': 2, 'passed': False},
            {'station': 3, 'passed': False}, {'station': 4, 'passed': False},
        ])
        self.assertEqual(self.student.post('/api/modules/1/city-experience', json={'operation': 'flag-interact'},
                                           headers={'X-CSRF-Token': self.csrf}).status_code, 403)
        blocked_mission = self.student.post('/api/modules/1/city-experience', json={
            'operation': 'mission-submit', 'phase': 'planificar', 'text': 'Intento de escritura bloqueado en la vista previa.'
        }, headers={'X-CSRF-Token': self.csrf})
        self.assertEqual(blocked_mission.status_code, 403)

        bank = DEFAULT_CONTENT['questions']
        for station in range(1, 5):
            current = self.student.get(f'/api/modules/1/city-station-quiz?station={station}').json['question']
            for slot in range(5):
                original = next(item for item in bank if item['id'] == current['id'])
                response = self.submit(station, current, original['answer'])
                self.assertEqual(response.status_code, 200, response.json)
                if slot < 4:
                    self.assertTrue(response.json['correct'])
                    current = response.json['next_question']
                else:
                    self.assertTrue(response.json['passed'])

        early_flag = self.student.post('/api/modules/1/city-experience', json={'operation': 'flag-interact'},
                                       headers={'X-CSRF-Token': self.csrf})
        self.assertEqual(early_flag.status_code, 403)
        for _ in range(20):
            heartbeat = self.student.post('/api/modules/1/city-experience', json={
                'operation': 'heartbeat', 'stage': 'quiz', 'seconds': 60,
            }, headers={'X-CSRF-Token': self.csrf})
            self.assertEqual(heartbeat.status_code, 200, heartbeat.json)
        opened = self.student.post('/api/modules/1/city-experience', json={'operation': 'flag-interact'},
                                   headers={'X-CSRF-Token': self.csrf})
        self.assertEqual(opened.status_code, 200, opened.json)
        status = self.student.get('/api/modules/1/city-experience').json
        self.assertTrue(status['stage2_unlocked'])
        self.assertTrue(status['quiz_learning']['approved'])
        self.assertEqual(len(status['state']['quiz']['answers']), 5)

    def test_four_workplace_missions_have_distinct_products_and_module_criteria(self):
        response = self.student.get('/api/modules/1/city-experience')
        self.assertEqual(response.status_code, 200, response.json)
        mission = response.json['plan']['mission']
        self.assertEqual(len(mission['phases']), 4)
        self.assertEqual(len(mission['tasks']), 4)
        self.assertEqual([phase['id'] for phase in mission['phases']],
                         ['planificar', 'actuar', 'verificar', 'justificar'])
        self.assertEqual([phase['minutes'] for phase in mission['phases']], [5, 15, 5, 5])
        self.assertEqual(len({task['product'] for task in mission['tasks']}), 4)
        self.assertEqual({task['skill'] for task in mission['tasks']}, {
            'Representar y planificar', 'Modelar y resolver',
            'Resolver y verificar', 'Argumentar y comunicar'})
        content = self.student.get('/api/modules/1').json['content']
        for task in mission['tasks']:
            self.assertTrue(task['source_title'])
            self.assertTrue(task['ae_code'])
            self.assertTrue(task['criterion'])
            ae = content['aes'][task['ae'] - 1]
            self.assertIn(task['criterion'], ae.get('criteria') or [])
            self.assertGreaterEqual(len(task['prompt']), 60)


if __name__ == '__main__':
    unittest.main()
