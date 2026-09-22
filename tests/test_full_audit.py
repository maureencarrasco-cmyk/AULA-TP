import unittest
import json
import sqlite3
import tempfile
from copy import deepcopy
from pathlib import Path

from content import DEFAULT_CONTENT
from instructional_quality import contract_is_complete
from pedagogy import enrich
from scripts.audit_all_courses import activities, bank_has_variety, source_is_traceable
from specialty_catalog import SPECIALTY_COURSES, _scenario


class FullAuditTests(unittest.TestCase):
    def test_instruction_and_time_follow_real_ae_count(self):
        for count in (2, 4):
            with self.subTest(aes=count):
                content = deepcopy(DEFAULT_CONTENT)
                content['aes'] = [deepcopy(DEFAULT_CONTENT['aes'][i % len(DEFAULT_CONTENT['aes'])])
                                  for i in range(count)]
                for i, ae in enumerate(content['aes']):
                    ae['official_code'] = f'AE-{i + 1}'
                result = enrich(content, 1)
                self.assertEqual(result['planning']['station_minutes']['2_etapa'],
                                 round(result['planning']['station_minutes']['2'] / (count * 6)))
                self.assertIn(f'{count} AE', result['context_instruction']['purpose'])
                self.assertIn(f'{count} AE', result['scene']['instruction']['purpose'])
                self.assertIn(f'{count} AE', result['development_pack']['instruction']['purpose'])
                codes = ' + '.join(ae['official_code'] for ae in result['aes'])
                self.assertEqual(result['feedback_instruction']['ae'], codes)
                self.assertTrue(all(contract_is_complete(instruction)
                                    for _, _, instruction, _ in activities(result)))

    def test_bank_variety_does_not_count_rotated_options(self):
        same = [{'options': ['A', 'B', 'C', 'D'], 'answer': 0, 'context': 'Mismo dato'},
                {'options': ['C', 'D', 'A', 'B'], 'answer': 2, 'context': 'Mismo dato'}]
        varied = [{'options': [str(i), 'B', 'C', 'D'], 'answer': 0, 'context': f'Dato {i}'}
                  for i in range(5)]
        self.assertFalse(bank_has_variety(same))
        self.assertTrue(bank_has_variety(varied))

    def test_specialty_banks_use_distinct_evidence_and_sourced_criteria(self):
        for course in SPECIALTY_COURSES:
            for module in course['modules']:
                with self.subTest(course=course['title'], module=module['title']):
                    content = enrich(deepcopy(module['content']), module['position'])
                    self.assertTrue(bank_has_variety(content['cases']))
                    self.assertTrue(bank_has_variety(content['questions']))
                    for item in content['cases'] + content['questions']:
                        self.assertTrue(source_is_traceable(item, course['specialty'], content['curriculum']['url']))
                        self.assertIn(item['options'][item['answer']], item['options'])

    def test_employment_and_climate_scenarios_are_not_clinical(self):
        for key, title in [('climate', 'Montaje de equipos'), ('enfermeria', 'Emprendimiento y empleabilidad')]:
            module = {'title': title, 'specialty_key': key}
            descriptions = [_scenario(module, i)[0] for i in range(5)]
            self.assertEqual(len(set(descriptions)), 5)
            if 'Emprendimiento' in title:
                self.assertTrue(any('presupuesto' in text.lower() for text in descriptions))

    def test_generated_content_migration_preserves_progress(self):
        from app import create_app
        from refrigeration_fourth import install_refrigeration_fourth
        from specialty_catalog import install_specialty_courses

        with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as directory:
            database = str(Path(directory) / 'audit.sqlite3')
            create_app({'TESTING': True, 'DATABASE': database, 'SECRET_KEY': 'test-only'})
            with sqlite3.connect(database) as con:
                con.row_factory = sqlite3.Row
                protected = con.execute('SELECT id,content FROM modules WHERE course_id=2 AND position=1').fetchone()
                candidate = con.execute('SELECT id,content FROM modules WHERE course_id=2 AND position=2').fetchone()
                climate = con.execute('SELECT id,content FROM modules WHERE course_id=1 AND position=5').fetchone()
                con.execute('INSERT INTO progress(user_id,module_id,state) VALUES(1,?,?)',
                            (protected['id'], json.dumps({'context': 'Evidencia del estudiante'})))
                old = json.loads(candidate['content'])
                old['version'] = 'especialidades-mineduc-v2'
                old['cases'][0]['options'] = ['banco anterior']
                con.execute('UPDATE modules SET content=? WHERE id=?', (json.dumps(old), candidate['id']))
                old_climate = json.loads(climate['content'])
                old_climate['version'] = 'refrigeracion-cuarto-medio-v5'
                old_climate['cases'][0]['options'] = ['banco anterior']
                con.execute('UPDATE modules SET content=? WHERE id=?', (json.dumps(old_climate), climate['id']))
                con.execute("DELETE FROM content_updates WHERE version IN ('especialidades-electricidad-enfermeria-v3', 'refrigeracion-cuarto-medio-v6')")
                install_specialty_courses(con)
                install_refrigeration_fourth(con)
                self.assertEqual(con.execute('SELECT content FROM modules WHERE id=?', (protected['id'],)).fetchone()[0],
                                 protected['content'])
                self.assertEqual(con.execute('SELECT state FROM progress WHERE module_id=?', (protected['id'],)).fetchone()[0],
                                 json.dumps({'context': 'Evidencia del estudiante'}))
                updated = json.loads(con.execute('SELECT content FROM modules WHERE id=?', (candidate['id'],)).fetchone()[0])
                updated_climate = json.loads(con.execute('SELECT content FROM modules WHERE id=?', (climate['id'],)).fetchone()[0])
                self.assertTrue(bank_has_variety(updated['cases']))
                self.assertTrue(bank_has_variety(updated_climate['cases']))


if __name__ == '__main__':
    unittest.main()
