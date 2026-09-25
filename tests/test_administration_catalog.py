import json
import sqlite3
import unittest

from administration_catalog import OFFICIAL, draft_modules, install_administration_catalog, install_administration_drafts
from pedagogy import publication_gaps


class AdministrationCatalogTests(unittest.TestCase):
    def test_both_mentions_follow_official_plan(self):
        self.assertEqual({'logistica', 'recursos_humanos'}, set(OFFICIAL))
        for key, rows in OFFICIAL.items():
            self.assertEqual(11, len(rows))
            for grade in ('3° medio', '4° medio'):
                self.assertEqual(836, sum(row['hp'] for row in rows if row['year'] == grade))
            modules = list(draft_modules(key))
            self.assertEqual(11, len(modules))
            for item, content in modules:
                self.assertEqual(item['title'], content['specialty_source']['title'])
                self.assertEqual(item['source_page'], content['specialty_source']['source_page'])
                self.assertTrue(all(ae['criteria'] for ae in content['aes']))
                self.assertNotIn('\ufffd', json.dumps(content, ensure_ascii=False))
        self.assertEqual(114, OFFICIAL['logistica'][5]['hp'])
        self.assertTrue(OFFICIAL['logistica'][5]['source_warnings'])

    def test_install_reuses_empty_generic_without_duplicates(self):
        con = sqlite3.connect(':memory:')
        con.row_factory = sqlite3.Row
        con.executescript('''
            CREATE TABLE users(id INTEGER PRIMARY KEY,role TEXT);
            CREATE TABLE courses(id INTEGER PRIMARY KEY,title TEXT,specialty TEXT,level TEXT);
            CREATE TABLE enrollments(user_id INTEGER,course_id INTEGER,UNIQUE(user_id,course_id));
            CREATE TABLE modules(id INTEGER PRIMARY KEY,course_id INTEGER,title TEXT,
                position INTEGER,published INTEGER,content TEXT);
            INSERT INTO users VALUES(1,'student');
            INSERT INTO courses VALUES(1,'Administración','Administración','3° y 4° medio');
            INSERT INTO enrollments VALUES(1,1);
        ''')
        install_administration_drafts(con)
        install_administration_drafts(con)
        titles = [row['title'] for row in con.execute('SELECT title FROM courses ORDER BY id')]
        self.assertEqual(['Administración, mención Logística',
                          'Administración, mención Recursos Humanos'], titles)
        for course in con.execute('SELECT id FROM courses').fetchall():
            rows = con.execute('SELECT published,content FROM modules WHERE course_id=?',
                               (course['id'],)).fetchall()
            self.assertEqual(11, len(rows))
            self.assertTrue(all(not row['published'] for row in rows))
        self.assertEqual(2, con.execute('SELECT COUNT(*) FROM enrollments').fetchone()[0])
        con.close()

    def test_both_mentions_are_publishable_and_idempotent(self):
        con = sqlite3.connect(':memory:')
        con.row_factory = sqlite3.Row
        con.executescript('''
            CREATE TABLE users(id INTEGER PRIMARY KEY,role TEXT);
            CREATE TABLE courses(id INTEGER PRIMARY KEY,title TEXT,specialty TEXT,level TEXT);
            CREATE TABLE enrollments(user_id INTEGER,course_id INTEGER,UNIQUE(user_id,course_id));
            CREATE TABLE modules(id INTEGER PRIMARY KEY,course_id INTEGER,title TEXT,
                position INTEGER,published INTEGER,content TEXT);
            INSERT INTO users VALUES(1,'student');
        ''')
        install_administration_catalog(con)
        install_administration_catalog(con)
        for title in ('Administración, mención Logística',
                      'Administración, mención Recursos Humanos'):
            course = con.execute('SELECT id FROM courses WHERE title=?', (title,)).fetchone()
            rows = con.execute('SELECT published,content FROM modules WHERE course_id=? ORDER BY position',
                               (course['id'],)).fetchall()
            self.assertEqual(11, len(rows))
            self.assertTrue(all(row['published'] for row in rows))
            for row in rows:
                self.assertEqual([], publication_gaps(json.loads(row['content']), title))
        con.close()


if __name__ == '__main__':
    unittest.main()
