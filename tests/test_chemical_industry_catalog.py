import json
import sqlite3
import unittest

from chemical_industry_catalog import OFFICIAL, TRACKS, draft_modules, install_chemical_industry_courses, install_chemical_industry_drafts
from pedagogy import publication_gaps


class ChemicalIndustryCatalogTests(unittest.TestCase):
    def test_both_mentions_follow_official_plan(self):
        self.assertEqual({'laboratorio', 'planta'}, set(OFFICIAL))
        for key, rows in OFFICIAL.items():
            self.assertEqual(10 if key == 'laboratorio' else 9, len(rows))
            for grade in ('3° medio', '4° medio'):
                self.assertEqual(836, sum(row['hp'] for row in rows if row['year'] == grade))
            modules = list(draft_modules(key))
            self.assertEqual(len(rows), len(modules))
            for item, content in modules:
                self.assertEqual(item['title'], content['specialty_source']['title'])
                self.assertEqual(item['source_page'], content['specialty_source']['source_page'])
                self.assertTrue(all(ae['criteria'] for ae in content['aes']))
                self.assertNotIn('\ufffd', json.dumps(content, ensure_ascii=False))

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
            INSERT INTO courses VALUES(1,'Química Industrial','Química Industrial','3° y 4° medio');
            INSERT INTO enrollments VALUES(1,1);
        ''')
        install_chemical_industry_drafts(con)
        install_chemical_industry_drafts(con)
        titles = [row['title'] for row in con.execute('SELECT title FROM courses ORDER BY id')]
        self.assertEqual(['Química Industrial, mención Laboratorio Químico',
                          'Química Industrial, mención Planta Química'], titles)
        for course in con.execute('SELECT id,title FROM courses').fetchall():
            rows = con.execute('SELECT published FROM modules WHERE course_id=?',
                               (course['id'],)).fetchall()
            self.assertEqual(10 if 'Laboratorio' in course['title'] else 9, len(rows))
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
        install_chemical_industry_courses(con)
        install_chemical_industry_courses(con)
        for _, title, _, _ in TRACKS:
            course = con.execute('SELECT id FROM courses WHERE title=?', (title,)).fetchone()
            rows = con.execute('SELECT published,content FROM modules WHERE course_id=? ORDER BY position',
                               (course['id'],)).fetchall()
            self.assertTrue(all(row['published'] for row in rows))
            for row in rows:
                self.assertEqual([], publication_gaps(json.loads(row['content']), title))
        con.close()


if __name__ == '__main__':
    unittest.main()
