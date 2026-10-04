import copy
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

from app import create_app
from content import DEFAULT_CONTENT
from learning_sequence import PHASES, learning_sequence, validate_sequence
from pedagogy import strip_for_student

TEXT = 'La leyenda permite reconocer el elemento; el recurso no muestra todas sus condiciones.'


class LearningSequence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        cls.app = create_app({'TESTING': True, 'DATABASE': str(Path(cls.temp.name) / 'test.sqlite3'), 'SECRET_KEY': 'ae-tests'})

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def setUp(self):
        self.client = self.app.test_client()
        self.csrf = self.client.get('/api/session').json['csrf']
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            con.execute('DELETE FROM progress')

    def post(self, **data):
        return self.client.post('/api/modules/1/activity', json=data, headers={'X-CSRF-Token': self.csrf})

    def test_feedback_is_not_progress_and_requires_context(self):
        self.assertEqual(self.post(kind='ae-check', sequence=1, ae=0, step=0, text=TEXT, response={}).status_code, 403)
        self.post(kind='context', text=TEXT)
        wrong = self.post(kind='ae-check', sequence=1, ae=0, step=0, text=TEXT, response={})
        self.assertEqual(wrong.status_code, 200)
        self.assertFalse(wrong.json['ready'])
        ids = learning_sequence(DEFAULT_CONTENT['aes'][0])[0]['answer']
        good = self.post(kind='ae-check', sequence=1, ae=0, step=0, text=TEXT, response={'ids': ids})
        self.assertTrue(good.json['ready'])
        self.assertEqual(set(good.json['feedback']), {'logrado', 'por_mejorar', 'recomendacion'})
        self.assertEqual(self.client.get('/api/modules/1').json['state']['ae'], {})
        saved = self.post(kind='ae', sequence=1, ae=0, step=0, text=TEXT, response={'ids': ids})
        self.assertEqual(saved.status_code, 200)
        self.assertEqual(saved.json['state']['ae_meta']['0-0']['attempts'], 1)
        self.assertEqual(saved.json['state']['ae_meta']['0-0']['response']['ids'], ids)
        self.assertIn('feedback', saved.json['state']['ae_meta']['0-0'])

    def test_six_phases_complete_in_order_and_keep_response_details(self):
        self.post(kind='context', text=TEXT)
        sequence = learning_sequence(DEFAULT_CONTENT['aes'][0])
        for step, exp in enumerate(sequence):
            response = ({'ids': exp['answer']} if step == 0 else {'pairs': exp['answer']} if step == 1 else
                        {'elements': [0, 1]} if step == 2 else {'choice': exp['answer']} if step == 3 else {'choice': 1, 'checks': [0, 2], 'review_version': 2} if step == 4 else
                        {'learned': 'Comprendo mejor la leyenda.', 'improve': 'Consultar\u00eda los datos faltantes.', 'final_decision': TEXT, 'review_version': 2})
            with self.subTest(phase=step):
                checked = self.post(kind='ae-check', sequence=1, ae=0, step=step, text=TEXT, response=response)
                self.assertTrue(checked.json['ready'], checked.json)
                saved = self.post(kind='ae', sequence=1, ae=0, step=step, text=TEXT, response=response)
                self.assertEqual(saved.status_code, 200, saved.json)
        state = self.client.get('/api/modules/1').json['state']
        self.assertEqual(len(state['ae']), 6)
        self.assertEqual(state['ae_meta']['0-5']['response']['learned'], 'Comprendo mejor la leyenda.')
        self.assertEqual(state['ae_meta']['0-4']['response']['checks'], [0, 2])
        self.assertEqual(state['ae_meta']['0-5']['response']['final_decision'], TEXT)
        self.assertNotIn('score', state['ae_meta']['0-5'])
        self.assertEqual(self.post(kind='ae-check', sequence=1, ae=1, step=0, text=TEXT, response={}).status_code, 200)
        self.assertEqual(self.post(kind='ae-professional', ae=1, text=TEXT, verified=True).status_code, 403)
        self.assertEqual(self.post(kind='ae-professional', ae=0, text=TEXT, verified=False).status_code, 400)
        professional = self.post(kind='ae-professional', ae=0, text=TEXT, verified=True)
        self.assertEqual(professional.status_code, 200, professional.json)
        self.assertEqual(professional.json['state']['ae_professional']['0']['text'], TEXT)

    def test_activity_can_be_saved_before_previous_phases(self):
        self.post(kind='context', text=TEXT)
        result = self.post(kind='ae', sequence=1, ae=1, step=4, text=TEXT,
                           response={'choice': 1, 'checks': [], 'review_version': 2})
        self.assertEqual(result.status_code, 200, result.json)
        self.assertIn('1-4', result.json['state']['ae'])
        self.assertFalse(result.json['completed'][1])

    def test_relation_and_reflection_validation(self):
        sequence = learning_sequence(DEFAULT_CONTENT['aes'][0])
        for response in ({}, {'elements': [0]}, {'elements': [0, 0]}, {'elements': [True, 1]}, {'elements': [0, 99]}):
            self.assertFalse(validate_sequence(sequence[2], response, TEXT)[0])
        self.assertTrue(validate_sequence(sequence[2], {'elements': [0, 1]}, TEXT)[0])
        self.assertFalse(validate_sequence(sequence[5], {'learned': 'Algo', 'improve': ''}, TEXT)[0])
        self.assertTrue(validate_sequence(sequence[4], {'choice': 0}, TEXT)[0])
        self.assertTrue(validate_sequence(sequence[4], {'choice': 1, 'checks': [0, 2]}, TEXT)[0])
        for response in ({}, {'choice': True}, {'choice': 2}, {'choice': 1, 'checks': [True]}, {'choice': 1, 'checks': [0, 0]}, {'choice': 1, 'checks': [9]}):
            self.assertFalse(validate_sequence(sequence[4], response, TEXT)[0])
        self.assertFalse(validate_sequence(sequence[5], {'learned': 'Conceptos', 'improve': 'Revisar', 'final_decision': 'x'}, TEXT)[0])
        self.assertFalse(validate_sequence(sequence[5], {'learned': 'Conceptos', 'improve': 'Revisar', 'final_decision': '', 'review_version': 2}, TEXT)[0])
        self.assertFalse(validate_sequence(sequence[0], {'ids': []}, TEXT)[0])

    def test_station_completion_requires_new_professional_evidence(self):
        self.post(kind='context', text=TEXT)
        state = self.client.get('/api/modules/1').json['state']
        state['ae'] = {f'{ae}-{step}': TEXT for ae in range(3) for step in range(6)}
        state['ae_meta'] = {'2-5': {'sequence': 1}}
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            con.execute('UPDATE progress SET state=? WHERE module_id=1', (json.dumps(state),))
        self.assertFalse(self.client.get('/api/modules/1').json['completed'][1])
        saved = self.post(kind='ae-professional', ae=2, text=TEXT, verified=True)
        self.assertEqual(saved.status_code, 200, saved.json)
        self.assertTrue(saved.json['completed'][1])
        state['ae_meta'] = {}
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            con.execute('UPDATE progress SET state=? WHERE module_id=1', (json.dumps(state),))
        self.assertTrue(self.client.get('/api/modules/1').json['completed'][1])

    def test_architecture_and_official_content_preserved_in_45_courses(self):
        with sqlite3.connect(self.app.config['DATABASE']) as con:
            rows = con.execute('SELECT course_id,content FROM modules').fetchall()
        self.assertEqual(len({course for course, _ in rows}), 45)
        for course, raw in rows:
            content = json.loads(raw)
            for ae in content.get('aes') or []:
                with self.subTest(course=course, ae=ae.get('title')):
                    before = copy.deepcopy(ae)
                    sequence = learning_sequence(ae)
                    self.assertEqual([e['phase'] for e in sequence], PHASES)
                    self.assertEqual(sequence[2]['type'], 'relate')
                    self.assertEqual(sequence[4]['type'], 'verify')
                    self.assertEqual(len(sequence[4]['checklist']), 5)
                    self.assertEqual(len(sequence[5]['guidance']), 4)
                    self.assertEqual(ae, before)
                    public = strip_for_student({'aes': [{'learning_sequence': sequence}]})
                    self.assertTrue(all('answer' not in e and 'hints' not in e for e in public['aes'][0]['learning_sequence']))

    def test_climate_plan_uses_natural_prompts_without_changing_official_content(self):
        ae = DEFAULT_CONTENT['aes'][0]
        before = copy.deepcopy(ae)
        sequence = learning_sequence(ae)
        self.assertIn('plano de climatizaci\u00f3n', sequence[0]['prompt'])
        self.assertIn('instalaci\u00f3n', sequence[1]['evidence_prompt'])
        self.assertIn('D\u00f3nde instalar\u00edas', sequence[3]['case_prompt'])
        self.assertEqual(sequence[3]['image'], sequence[0]['image'])
        self.assertIn('antes de instalar', sequence[3]['options'][0])
        self.assertEqual(sequence[4]['checklist'][0], 'La ubicaci\u00f3n del equipo.')
        self.assertNotIn('answer', sequence[4])
        self.assertEqual(ae, before)


if __name__ == '__main__':
    unittest.main()
