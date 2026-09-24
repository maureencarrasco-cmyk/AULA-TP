import json
import sqlite3
import unittest
from copy import deepcopy

from pedagogy import enrich, verified_static_asset
from programming_catalog import draft_modules, install_programming_draft
from specialty_catalog import _ae, _cases, _questions


class DraftContextMigrationTests(unittest.TestCase):
    def test_replaces_only_untouched_template_questions(self):
        item, desired = next(draft_modules())
        original = json.loads(json.dumps(desired, ensure_ascii=False))
        key = original['specialty_key']
        module = {'title': item['title'], 'aes': original['aes'], 'specialty_key': key}
        original['cases'] = _cases(module, f'/static/headers/{key}/e3.png?v=3')
        original['questions'] = _questions(module, f'/static/headers/{key}/e4.png?v=3')
        original['specialty_source'].pop('assessment_context', None)
        original['specialty_source'].pop('media_status', None)
        original['teacher_note'] = 'Conservar esta observación.'
        for ae in original['aes']:
            ae['experiences'] = _ae(ae['official_code'], ae['title'], ae['criteria'])['experiences']
        original['aes'][0]['experiences'][0]['prompt'] = 'Actividad docente personalizada'

        con = sqlite3.connect(':memory:')
        con.row_factory = sqlite3.Row
        con.executescript('''
            CREATE TABLE courses(id INTEGER PRIMARY KEY,title TEXT);
            CREATE TABLE modules(id INTEGER PRIMARY KEY,course_id INTEGER,title TEXT,
                position INTEGER,published INTEGER,content TEXT);
            INSERT INTO courses VALUES(1,'Programación');
        ''')
        con.execute('INSERT INTO modules(course_id,title,position,published,content) VALUES(?,?,?,?,?)',
                    (1, item['title'], 1, 0, json.dumps(original, ensure_ascii=False)))
        install_programming_draft(con)
        updated = json.loads(con.execute('SELECT content FROM modules WHERE position=1').fetchone()[0])
        self.assertIn('pedido está vacío', updated['cases'][0]['context'])
        self.assertNotIn('EQ-02', updated['cases'][0]['context'])
        self.assertEqual('Conservar esta observación.', updated['teacher_note'])
        self.assertIsNone(updated['cases'][0]['image'])
        self.assertEqual('Actividad docente personalizada', updated['aes'][0]['experiences'][0]['prompt'])
        self.assertIn('pedido está vacío', updated['aes'][0]['experiences'][2]['prompt'])
        self.assertIn('algoritmo y prueba', updated['aes'][0]['experiences'][4]['prompt'])

        updated['cases'][0]['question'] = 'Pregunta docente personalizada'
        con.execute('UPDATE modules SET content=? WHERE position=1',
                    (json.dumps(updated, ensure_ascii=False),))
        install_programming_draft(con)
        preserved = json.loads(con.execute('SELECT content FROM modules WHERE position=1').fetchone()[0])
        self.assertEqual('Pregunta docente personalizada', preserved['cases'][0]['question'])
        self.assertEqual('Actividad docente personalizada', preserved['aes'][0]['experiences'][0]['prompt'])
        con.close()

    def test_new_draft_activities_use_module_case_and_official_criterion(self):
        _, content = next(draft_modules())
        ae = content['aes'][0]
        self.assertIn('pedido está vacío', ae['experiences'][0]['prompt'])
        self.assertIn(ae['criteria'][0], ae['experiences'][0]['prompt'])
        self.assertIn('algoritmo y prueba', ae['experiences'][4]['prompt'])

    def test_draft_preview_does_not_advertise_missing_media(self):
        _, content = next(draft_modules())
        preview = enrich(deepcopy(content), 1)
        self.assertEqual([], preview['media_resources'])
        self.assertEqual([], preview['media_audit'])
        self.assertIsNone(preview['explore']['image'])
        self.assertIsNone(preview['cases'][0]['image'])
        self.assertIsNone(preview['questions'][0]['image'])
        self.assertIsNone(preview['aes'][0]['experiences'][0]['image'])
        self.assertFalse(verified_static_asset('/static/../app.py'))


if __name__ == '__main__':
    unittest.main()
