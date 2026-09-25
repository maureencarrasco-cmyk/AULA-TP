import json
import sqlite3
import unittest

from programming_catalog import OFFICIAL, draft_modules, install_programming_course, install_programming_draft
from pedagogy import publication_gaps


class ProgrammingCatalogTests(unittest.TestCase):
    def test_official_plan_and_trace(self):
        self.assertEqual(9, len(OFFICIAL))
        for grade in ('3° medio', '4° medio'):
            self.assertEqual(836, sum(row['hp'] for row in OFFICIAL if row['year'] == grade))
        for item, content in draft_modules():
            self.assertEqual(item['title'], content['specialty_source']['title'])
            self.assertEqual(item['source_page'], content['specialty_source']['source_page'])
            self.assertEqual(len(item['aes']), len(content['aes']))
            self.assertTrue(all(ae['criteria'] for ae in content['aes']))
            self.assertNotIn('\ufffd', json.dumps(content, ensure_ascii=False))

    def test_draft_install_is_unpublished_and_idempotent(self):
        con = sqlite3.connect(':memory:')
        con.row_factory = sqlite3.Row
        con.executescript('''
            CREATE TABLE courses(id INTEGER PRIMARY KEY, title TEXT);
            CREATE TABLE modules(id INTEGER PRIMARY KEY, course_id INTEGER, title TEXT,
                position INTEGER, published INTEGER, content TEXT);
            INSERT INTO courses(id,title) VALUES(1,'Programación');
        ''')
        install_programming_draft(con)
        install_programming_draft(con)
        rows = con.execute('SELECT published,content FROM modules ORDER BY position').fetchall()
        self.assertEqual(9, len(rows))
        self.assertTrue(all(not row['published'] for row in rows))
        self.assertEqual(1672, sum(json.loads(row['content'])['specialty_source']['official_hp'] for row in rows))
        con.close()

    def test_complete_course_is_publishable_and_idempotent(self):
        con = sqlite3.connect(':memory:')
        con.row_factory = sqlite3.Row
        con.executescript('''
            CREATE TABLE courses(id INTEGER PRIMARY KEY, title TEXT);
            CREATE TABLE modules(id INTEGER PRIMARY KEY, course_id INTEGER, title TEXT,
                position INTEGER, published INTEGER, content TEXT);
            INSERT INTO courses(id,title) VALUES(1,'Programación');
        ''')
        install_programming_course(con)
        install_programming_course(con)
        rows = con.execute('SELECT published,content FROM modules ORDER BY position').fetchall()
        self.assertEqual(9, len(rows))
        self.assertTrue(all(row['published'] for row in rows))
        for row in rows:
            content = json.loads(row['content'])
            self.assertEqual('programacion-mineduc-v1', content['version'])
            self.assertEqual([], publication_gaps(content, 'Programación'))
        con.close()


if __name__ == '__main__':
    unittest.main()
