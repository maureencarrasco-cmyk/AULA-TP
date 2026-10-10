import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from copy import deepcopy
from pathlib import Path

from app import create_app
from pedagogy import enrich
from practice_scenarios import scenario, review, practice_bank, MODES


class PracticeScreens(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        cls.database = str(Path(cls.tmp.name) / 'practice.sqlite3')
        cls.app = create_app({'TESTING': True, 'DATABASE': cls.database, 'SECRET_KEY': 'practice-test-only'})

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def setUp(self):
        self.client = self.app.test_client()
        self.csrf = self.client.get('/api/session').json['csrf']

    def get_case(self, mode='explore', level=2, number=1, mid=84, previous=''):
        result = self.client.get(f'/api/modules/{mid}/practice/scenario', query_string=dict(mode=mode, level=level, number=number, previous=previous))
        self.assertEqual(result.status_code, 200, result.json)
        return result.json

    def submit(self, data, **response):
        return self.client.post('/api/modules/84/practice/review', json=dict(token=data['token'], **response), headers={'X-CSRF-Token': self.csrf})

    def test_student_server_keys_not_default_a_and_no_official_mutation(self):
        with closing(sqlite3.connect(self.database)) as con:
            before = con.execute('SELECT * FROM progress').fetchall()
            raw, position = con.execute('SELECT content,position FROM modules WHERE id=84').fetchone()
        content = enrich(json.loads(raw), position)
        found_nonzero = False
        for number in range(1, 20, 2):
            data = self.get_case(number=number)
            item = content[data['family']][data['source_index']]
            self.assertNotIn('answer', data)
            self.assertNotIn('explanation', data)
            self.assertNotIn('option_feedback', data)
            self.assertNotIn('correct_choice', data)
            self.assertNotIn('model_answer', data)
            if item['answer'] != 0:
                found_nonzero = True
                self.assertFalse(self.submit(data, choice=0).json['correct'])
                self.assertEqual(self.submit(data, choice=0).json['correct_choice'], item['answer'])
                self.assertTrue(self.submit(data, choice=item['answer']).json['correct'])
                break
        self.assertTrue(found_nonzero)
        official = self.client.get('/api/modules/84').json
        self.assertTrue(all('answer' not in q for q in official['content']['questions']))
        with closing(sqlite3.connect(self.database)) as con:
            self.assertEqual(con.execute('SELECT * FROM progress').fetchall(), before)

    def test_three_modes_four_levels_alternation_and_written_limits(self):
        for mode in MODES:
            for level in range(1, 5):
                previous = ''
                for number in range(1, 7):
                    data = self.get_case(mode, level, number, previous=previous)
                    self.assertNotEqual(previous, data['source_id'])
                    previous = data['source_id']
                    self.assertEqual(len(data['stages']), 4)
                    expected = 'choice' if level == 1 or (level == 2 and number % 2) else 'written'
                    self.assertEqual(data['response_format'], expected)
                    self.assertEqual(len(data['options']), 4 if expected == 'choice' else 0)
                    if expected == 'written':
                        result = self.submit(data, text='Relaciono la evidencia del caso con el criterio y declaro qué antecedente falta confirmar. ' * 3)
                        self.assertEqual(result.status_code, 200)
                        self.assertEqual(result.json['kind'], 'written')
                        self.assertTrue(result.json['model_answer'])
                        self.assertNotIn('model_answer', data)
                        self.assertNotIn('score', result.json)
                        self.assertEqual(len(result.json['review_criteria']), 4)
                        self.assertEqual(self.submit(data, text='corto').status_code, 400)

    def test_access_csrf_token_tampering_and_validation(self):
        data = self.get_case()
        self.assertEqual(self.app.test_client().get('/api/modules/84/practice/scenario').status_code, 401)
        self.assertEqual(self.client.post('/api/modules/84/practice/review', json={'token': data['token'], 'choice': 0}).status_code, 403)
        changed = dict(data, token=data['token'] + 'x')
        self.assertEqual(self.submit(changed, choice=0).status_code, 400)
        for value in [True, '0', -1, 4, None]:
            self.assertEqual(self.submit(data, choice=value).status_code, 400)
        self.assertEqual(self.client.post('/api/modules/85/practice/review', json={'token':data['token'],'choice':0}, headers={'X-CSRF-Token': self.csrf}).status_code, 403)
        for query in [{'mode':'bad','level':1,'number':1}, {'mode':'explore','level':5,'number':1}, {'mode':'explore','level':1,'number':0}]:
            self.assertEqual(self.client.get('/api/modules/84/practice/scenario',query_string=query).status_code, 400)
        self.assertEqual(self.client.post('/api/modules/84/practice/review',json=['invalid'],headers={'X-CSRF-Token':self.csrf}).status_code,400)

    def test_read_only_catalog_all_45_courses_451_modules(self):
        with closing(sqlite3.connect(self.database)) as con:
            rows = con.execute('SELECT id,course_id,position,content FROM modules').fetchall()
        self.assertEqual(len(rows), 451)
        self.assertEqual(len({row[1] for row in rows}), 45)
        count = 0
        for mid, cid, position, raw in rows:
            content = json.loads(raw)
            original = deepcopy(content)
            for mode in MODES:
                for level in range(1, 5):
                    prior = None
                    for number in range(1, 5):
                        data, claim = scenario(content, mode, level, number, prior)
                        self.assertNotEqual(data['source_id'], prior)
                        prior = data['source_id']
                        item = content[claim['family']][claim['index']]
                        self.assertEqual(data['criterion'], item.get('criterion') or data['criterion'])
                        if data['response_format'] == 'choice':
                            self.assertEqual(data['options'], item['options'])
                            self.assertTrue(review(content,claim,{'choice':item['answer']})['correct'])
                        else:
                            self.assertTrue(review(content,claim,{'text':'Respuesta con evidencia. ' * 10})['model_answer'])
                        profile = data['pedagogy']
                        self.assertEqual(profile['mode'], mode)
                        self.assertEqual(profile['level'], level)
                        references = ([data['comparison']] if 'comparison' in data else []) + data.get('additional_evidence', [])
                        self.assertEqual(len(references) + 1, profile['evidence_count'])
                        for reference in references:
                            self.assertNotIn('answer', reference)
                            self.assertNotIn('explanation', reference)
                        self.assertGreater(len(practice_bank(content,mode,level)),1)
                        count += 1
            self.assertEqual(content, original, f'Module {mid} mutated')
        self.assertEqual(count, 21648)

    def test_twelve_profiles_are_distinct_progressive_and_authenticated(self):
        profiles = self.client.get('/api/practice/profiles').json
        self.assertEqual(self.app.test_client().get('/api/practice/profiles').status_code, 401)
        signatures = set()
        for mode, levels in profiles.items():
            previous_count = 0
            for level, data in enumerate(levels, 1):
                names = {field['name'] for field in data['fields']}
                self.assertGreater(len(names), previous_count)
                previous_count = len(names)
                signatures.add(tuple(sorted((field['name'],field['label']) for field in data['fields'])))
                self.assertEqual(data['automatic_support'], level == 1)
                self.assertEqual(data['evidence_count'], 3 if level == 4 else 2 if level == 3 or (mode == 'investigate' and level == 2) else 1)
                self.assertIn({'explore':'prediction','challenge':'goal','investigate':'hypothesis'}[mode], names if level > 1 else names | {'prediction','goal'})
        self.assertEqual(len(signatures), 12)
        data = self.get_case('investigate', 4)
        self.assertEqual(self.submit(data, text='Texto corto pero supera veinte caracteres.').status_code, 400)
        refreshed = self.client.get('/api/modules/84/practice/scenario', query_string=dict(mode='investigate',level=4,number=data['number'],source=data['source_id'])).json
        self.assertEqual(refreshed['source_id'], data['source_id'])


if __name__ == '__main__':
    unittest.main()
