import json
import sqlite3
import unittest

from networks_catalog import OFFICIAL, draft_modules, install_networks_course, install_networks_draft
from pedagogy import publication_gaps
from tp_draft_builder import sync_official_oa


class NetworksCatalogTests(unittest.TestCase):
    def test_official_plan_and_trace(self):
        self.assertEqual(9, len(OFFICIAL))
        self.assertEqual(3, len(OFFICIAL[0]['oa']))
        self.assertEqual(2, len(OFFICIAL[1]['oa']))
        for grade in ('3° medio', '4° medio'):
            self.assertEqual(836, sum(row['hp'] for row in OFFICIAL if row['year'] == grade))
        for item, content in draft_modules():
            self.assertEqual(item['title'], content['specialty_source']['title'])
            self.assertEqual(item['source_page'], content['specialty_source']['source_page'])
            self.assertEqual(len(item['aes']), len(content['aes']))
            self.assertTrue(all(ae['criteria'] for ae in content['aes']))
            self.assertNotIn('\ufffd', json.dumps(content, ensure_ascii=False))

    def test_unpublished_install_is_idempotent(self):
        con = sqlite3.connect(':memory:')
        con.row_factory = sqlite3.Row
        con.executescript('''
            CREATE TABLE courses(id INTEGER PRIMARY KEY, title TEXT);
            CREATE TABLE modules(id INTEGER PRIMARY KEY, course_id INTEGER, title TEXT,
                position INTEGER, published INTEGER, content TEXT);
            INSERT INTO courses(id,title) VALUES(1,'Conectividad y Redes');
        ''')
        install_networks_draft(con)
        install_networks_draft(con)
        rows = con.execute('SELECT published,content FROM modules ORDER BY position').fetchall()
        self.assertEqual(9, len(rows))
        self.assertTrue(all(not row['published'] for row in rows))
        self.assertEqual(1672, sum(json.loads(row['content'])['specialty_source']['official_hp'] for row in rows))
        con.close()

    def test_merged_oa_is_repaired_without_changing_other_content(self):
        con = sqlite3.connect(':memory:')
        con.row_factory = sqlite3.Row
        con.execute('CREATE TABLE modules(id INTEGER PRIMARY KEY, content TEXT)')
        old = {'version': 'redes-mineduc-draft-v1', 'teacher_note': 'Conservar',
               'specialty_source': {'oa': [{'code': 'OA 1', 'title': 'Primero. OA 3. Segundo.'}]}}
        con.execute('INSERT INTO modules(id,content) VALUES(1,?)', (json.dumps(old),))
        official = [{'code': 'OA 1', 'title': 'Primero.'}, {'code': 'OA 3', 'title': 'Segundo.'}]
        sync_official_oa(con, 1, json.dumps(old), official)
        updated = json.loads(con.execute('SELECT content FROM modules WHERE id=1').fetchone()[0])
        self.assertEqual(official, updated['specialty_source']['oa'])
        self.assertEqual('Conservar', updated['teacher_note'])
        con.close()

    def test_complete_course_is_publishable_and_idempotent(self):
        con = sqlite3.connect(':memory:')
        con.row_factory = sqlite3.Row
        con.executescript('''
            CREATE TABLE courses(id INTEGER PRIMARY KEY, title TEXT);
            CREATE TABLE modules(id INTEGER PRIMARY KEY, course_id INTEGER, title TEXT,
                position INTEGER, published INTEGER, content TEXT);
            INSERT INTO courses(id,title) VALUES(1,'Conectividad y Redes');
        ''')
        install_networks_course(con)
        install_networks_course(con)
        rows = con.execute('SELECT published,content FROM modules ORDER BY position').fetchall()
        self.assertEqual(9, len(rows))
        self.assertTrue(all(row['published'] for row in rows))
        for row in rows:
            content = json.loads(row['content'])
            self.assertEqual('redes-mineduc-v1', content['version'])
            self.assertEqual([], publication_gaps(content, 'Conectividad y Redes'))
        con.close()


if __name__ == '__main__':
    unittest.main()
