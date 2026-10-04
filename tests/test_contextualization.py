import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

from app import create_app
from contextualization import ACTIVITIES, context_plan, save_context_step


class ContextualizationFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        cls.app = create_app({'TESTING': True, 'DATABASE': str(Path(cls.temp.name) / 'test.sqlite3'), 'SECRET_KEY': 'context-tests'})

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def setUp(self):
        self.client = self.app.test_client()
        self.csrf = self.client.get('/api/session').json['csrf']
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            con.execute('DELETE FROM progress')

    def save(self, index, response):
        return self.client.post('/api/modules/1/activity', json={'kind': 'context-step', 'index': index, 'response': response}, headers={'X-CSRF-Token': self.csrf})

    def test_five_tabs_save_without_grading_and_complete_only_at_the_end(self):
        replies = [{}, {'recognized': [0, 2], 'other': ''}, {'prior': 'He visto planos en el taller.'}, {'importance': 2}, {'anticipated': [0, 1]}]
        for i, reply in enumerate(replies):
            with self.subTest(activity=i):
                result = self.save(i, reply)
                self.assertEqual(result.status_code, 200, result.json)
                self.assertEqual(result.json['completed'][0], i == 4)
                sequence = result.json['state']['contextualization']
                self.assertEqual(sequence['completed'], list(range(i + 1)))
                self.assertNotIn('score', sequence)
                self.assertNotIn('grade', sequence)
        fresh = self.app.test_client()
        fresh.get('/api/session')
        stored = fresh.get('/api/modules/1').json['state']
        self.assertEqual(stored['contextualization']['responses']['2']['prior'], replies[2]['prior'])
        self.assertEqual(stored['contextualization']['responses']['3']['importance'], 2)
        self.assertTrue(stored['context'])

    def test_free_entry_and_invalid_answers(self):
        self.assertEqual(self.save(1, {'recognized': [0]}).status_code, 200)
        self.assertEqual(self.save(0, {}).status_code, 200)
        for value in ([], [True], [7], ['0'], None):
            self.assertEqual(self.save(1, {'recognized': value}).status_code, 400)
        self.assertEqual(self.save(1, {'recognized': [6], 'other': 'Una etiqueta'}).status_code, 200)
        self.assertEqual(self.save(2, {'prior': ''}).status_code, 400)
        self.assertEqual(self.save(2, {'prior': 'No lo conozco.'}).status_code, 200)
        self.assertEqual(self.save(3, {'importance': True}).status_code, 400)
        self.assertEqual(self.save(3, {'importance': 3}).status_code, 200)
        self.assertEqual(self.save(3, {'importance': 4}).status_code, 400)
        self.assertEqual(self.save(4, {'anticipated': [0]}).status_code, 200)

    def test_out_of_order_completion_waits_for_every_activity(self):
        replies = {4: {'anticipated': [0]}, 2: {'prior': 'He visto equipos.'}, 0: {}, 3: {'importance': 0}, 1: {'recognized': [0]}}
        for position, (index, response) in enumerate(replies.items()):
            result = self.save(index, response)
            self.assertEqual(result.status_code, 200, result.json)
            self.assertEqual(result.json['completed'][0], position == 4)

    def test_revisiting_keeps_later_responses_and_existing_evidence(self):
        state = {'context': 'Evidencia previa conservada.'}
        for i, response in enumerate([{}, {'recognized': [1]}, {'prior': 'He visto equipos.'}, {'importance': 1}, {'anticipated': [2]}]):
            save_context_step(state, i, response)
        summary = state['context']
        save_context_step(state, 1, {'recognized': [1, 2]})
        self.assertEqual(state['context'], summary)
        self.assertEqual(state['contextualization']['responses']['4']['anticipated'], [2])
        self.assertEqual(state['contextualization']['completed'], [0, 1, 2, 3, 4])

    def test_common_architecture_for_all_45_courses_and_modules(self):
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            con.row_factory = sqlite3.Row
            rows = con.execute('SELECT c.id,c.title,c.specialty,m.title AS module_title,m.content FROM courses c JOIN modules m ON m.course_id=c.id').fetchall()
        self.assertEqual(len({row['id'] for row in rows}), 45)
        for row in rows:
            with self.subTest(course=row['id'], module=row['module_title']):
                raw = json.loads(row['content'])
                before = json.dumps(raw, sort_keys=True)
                plan = context_plan(raw, dict(row), row['module_title'])
                self.assertEqual(plan['activities'], ACTIVITIES)
                self.assertEqual(len(plan['elements']), 7)
                self.assertEqual(len(plan['learning']), 4)
                self.assertEqual(len(plan['importance_options']), 4)
                self.assertEqual(len(plan['importance_feedback']), 4)
                self.assertTrue(plan['scenario'] and plan['application'] and plan['relevance'])
                self.assertEqual(before, json.dumps(raw, sort_keys=True))
        module = self.client.get('/api/modules/1').json
        self.assertEqual(module['content']['contextualization']['title'], 'Climatizaci\u00f3n en un edificio educacional')
        self.assertEqual(module['content']['contextualization']['elements'][2], 'Equipos de climatizaci\u00f3n')

    def test_station_two_stays_locked_until_context_is_complete(self):
        self.save(0, {})
        result = self.client.post('/api/modules/1/activity', json={'kind': 'ae', 'ae': 0, 'step': 0, 'text': 'Una evidencia escrita suficiente para el aprendizaje.'}, headers={'X-CSRF-Token': self.csrf})
        self.assertEqual(result.status_code, 403)


if __name__ == '__main__':
    unittest.main()
