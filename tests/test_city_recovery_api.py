import tempfile
import unittest
import json
import sqlite3
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

from app import create_app

TEXT = 'Revisé los procedimientos, contrasté mis evidencias y prepararé una nueva verificación segura.'
PHASES = ('planificar', 'actuar', 'verificar', 'justificar')


class CityRecoveryAPI(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        with patch('app.upgrade_catalog'), patch('app.ensure_course_catalog'):
            self.app = create_app({'TESTING': True, 'DATABASE': str(Path(self.tmp.name)/'city.sqlite3'), 'SECRET_KEY': 'test-city'})
        self.student, self.teacher = self.app.test_client(), self.app.test_client()
        self.tokens = {}
        for client, username, password in ((self.student, 'estudiante', 'AulaTP2026!'), (self.teacher, 'docente', 'DocenteTP2026!')):
            token = client.get('/api/session').json['csrf']
            response = client.post('/api/login', json={'username': username, 'password': password}, headers={'X-CSRF-Token': token})
            self.tokens[client] = response.json['csrf']

    def tearDown(self):
        self.tmp.cleanup()

    def post(self, body, teacher=False, path='/api/modules/1/city-experience'):
        client = self.teacher if teacher else self.student
        return client.post(path, json=body, headers={'X-CSRF-Token': self.tokens[client]})

    def get(self):
        return self.student.get('/api/modules/1/city-experience').json

    def advance(self, stage, seconds):
        while seconds:
            delta = min(60, seconds)
            result = self.post({'operation': 'heartbeat', 'stage': stage, 'seconds': delta})
            self.assertEqual(result.status_code, 200, result.json)
            seconds -= delta

    def complete(self, correct=True):
        payload = self.get()
        self.bank = self.teacher.get('/api/modules/1').json['content']['questions']
        for index, question in enumerate(payload['plan']['quiz']):
            original = next(item for item in self.bank if item['question'] == question['question'])
            answer = original['answer'] if correct else (original['answer']+1) % len(original['options'])
            self.assertEqual(self.post({'operation': 'quiz-answer', 'index': index, 'choice': answer}).status_code, 200)
        self.assertEqual(self.post({'operation': 'mission-submit', 'phase': 'planificar', 'text': TEXT}).status_code, 403)
        self.advance('quiz', 900)
        self.advance('mission', 1800)
        for phase in PHASES:
            self.assertEqual(self.post({'operation': 'mission-submit', 'phase': phase, 'text': TEXT}).status_code, 200)
        return payload

    def review(self, points=None, competencies=True, safety=True):
        result = self.post({'user_id': 1, 'module_id': 1, 'attempt_id': self.get()['state']['mission'].get('attempt_id', 1),
                            'points': points or [[5]*5 for _ in PHASES], 'competencies_approved': competencies,
                            'safety_approved': safety, 'critical_phases': ['actuar'], 'feedback': TEXT},
                           teacher=True, path='/api/teacher/city-review')
        self.assertEqual(result.status_code, 200, result.json)
        return result.json['reward']

    def test_full_retry_changes_situation_and_requires_new_30_minutes(self):
        initial = self.complete()
        result = self.review([[0]*5 for _ in PHASES], False, False)
        self.assertEqual(result['recovery']['minutes'], 30)
        self.assertEqual(self.post({'operation': 'recovery-start', 'reinforcement': TEXT}).status_code, 200)
        second = self.get()
        self.assertNotEqual(initial['plan']['module']['case_title'], second['plan']['module']['case_title'])
        self.assertEqual(second['state']['mission']['required_seconds'], 1800)
        self.assertEqual(len(second['state']['mission']['attempt_history']), 1)
        for phase in PHASES[:-1]:
            self.assertEqual(self.post({'operation': 'mission-submit', 'phase': phase, 'text': TEXT}).status_code, 200)
        self.assertEqual(self.post({'operation': 'mission-submit', 'phase': 'justificar', 'text': TEXT}).status_code, 403)
        self.advance('mission', 1800)
        self.assertEqual(self.post({'operation': 'mission-submit', 'phase': 'justificar', 'text': TEXT}).status_code, 200)
        self.assertTrue(self.review()['approved'])

    def test_selective_retry_alert_intervention_and_accumulated_awards(self):
        self.complete()
        points = [[5]*5, [3]*5, [5]*5, [5]*5]
        first = self.review(points, False)
        self.assertEqual(first['recovery']['phases'], ['actuar'])
        self.assertFalse(self.review(points, False)['teacher_alert'])
        self.assertEqual(self.post({'operation': 'recovery-start', 'reinforcement': TEXT}).status_code, 200)
        state = self.get()['state']['mission']
        self.assertEqual(set(state['responses']), {'planificar', 'verificar', 'justificar'})
        self.assertEqual(self.post({'operation': 'mission-submit', 'phase': 'planificar', 'text': TEXT}).status_code, 403)
        self.assertEqual(self.post({'operation': 'mission-submit', 'phase': 'actuar', 'text': TEXT}).status_code, 403)
        self.advance('mission', 900)
        self.assertEqual(self.post({'operation': 'mission-submit', 'phase': 'actuar', 'text': TEXT}).status_code, 200)
        second = self.review(points, False)
        self.assertTrue(second['teacher_alert'])
        acknowledgement = {'user_id': 1, 'module_id': 1, 'alert_id': second['alert']['id'], 'intervention': TEXT}
        self.assertEqual(self.post(acknowledgement, path='/api/teacher/city-alert').status_code, 403)
        self.assertEqual(self.post(acknowledgement, teacher=True, path='/api/teacher/city-alert').status_code, 200)
        self.assertEqual(self.get()['reward']['alert']['status'], 'acknowledged')
        self.post({'operation': 'recovery-start', 'reinforcement': TEXT})
        self.advance('mission', 900)
        self.post({'operation': 'mission-submit', 'phase': 'actuar', 'text': TEXT})
        approved = self.review()
        self.assertTrue(approved['approved'])
        self.assertEqual(approved['alert']['status'], 'resolved')
        self.assertEqual(len(approved['areas']), 3)
        self.assertTrue(self.student.get('/api/modules/1').json['city_completed'])
        self.assertFalse(self.review(safety=False)['approved'])
        self.assertEqual(len(self.get()['reward']['areas']), 3)
        area_id = approved['areas'][0]['id']
        self.assertEqual(self.post({'operation': 'area-evidence', 'area_id': area_id, 'text': TEXT}).status_code, 200)
        self.assertEqual(len(self.get()['state']['mission']['area_evidence'][area_id]), 1)

    def test_quiz_reassessment_updates_score_without_repeating_mastered_practice(self):
        self.complete(correct=False)
        result = self.review()
        self.assertFalse(result['approved'])
        self.assertEqual(result['recovery']['phases'], [])
        self.assertEqual(self.post({'operation': 'recovery-start', 'reinforcement': TEXT}).status_code, 409)
        for _ in range(2):
            pending = self.get()['recoveries'][0]
            self.assertNotIn('answer', pending['reassessment'])
            self.post({'operation': 'recovery-submit', 'index': pending['index'], 'text': TEXT})
            variant = pending['reassessment']
            original = next(item for item in self.bank if item['question'] == variant['question'])
            response = self.post({'operation': 'quiz-retry-answer', 'index': pending['index'], 'question': variant['question'], 'choice': original['answer']})
            self.assertEqual(response.status_code, 200, response.json)
        final = self.get()
        self.assertTrue(final['reward']['approved'])
        self.assertEqual(final['reward']['final_score'], 76)
        self.assertEqual(len(final['reward']['areas']), 1)
        self.assertEqual(final['state']['mission'].get('attempt_id', 1), 1)
        self.assertEqual(final['state']['quiz']['score'], 2)

    def test_concurrent_time_and_draft_keep_both_updates(self):
        self.complete()
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            state = json.loads(con.execute('SELECT state FROM progress WHERE user_id=1 AND module_id=1').fetchone()[0])
            state['city_experience']['mission'].pop('completed_at')
            state['city_experience']['mission']['responses'].pop('justificar')
            con.execute('UPDATE progress SET state=? WHERE user_id=1 AND module_id=1', (json.dumps(state),))
        def save(body, barrier):
            client = self.app.test_client()
            with client.session_transaction() as session:
                session['uid'] = 1
                session['csrf'] = 'parallel-city-test'
            barrier.wait()
            return client.post('/api/modules/1/city-experience', json=body, headers={'X-CSRF-Token': 'parallel-city-test'}).status_code
        for index in range(8):
            barrier = threading.Barrier(2)
            with ThreadPoolExecutor(max_workers=2) as pool:
                timer = pool.submit(save, {'operation': 'heartbeat', 'stage': 'mission', 'seconds': 60}, barrier)
                draft = pool.submit(save, {'operation': 'mission-draft', 'phase': 'justificar', 'text': f'{TEXT} Registro {index}'}, barrier)
                self.assertEqual(timer.result(), 200)
                self.assertEqual(draft.result(), 200)
        mission = self.get()['state']['mission']
        self.assertEqual(mission['active_seconds'], 1800+8*60)
        self.assertTrue(mission['drafts']['justificar'].endswith('Registro 7'))
        self.assertEqual(len(mission['responses']), 3)


if __name__ == '__main__':
    unittest.main()
