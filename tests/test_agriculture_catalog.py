import json
import sqlite3
import unittest

from agriculture_catalog import OFFICIAL, draft_modules, install_agriculture_drafts


class AgricultureCatalogTests(unittest.TestCase):
    def test_three_mentions_follow_official_plan(self):
        self.assertEqual({'agricultura', 'pecuaria', 'vitivinicola'}, set(OFFICIAL))
        for key, rows in OFFICIAL.items():
            self.assertEqual(10 if key == 'agricultura' else 11, len(rows))
            for grade in ('3° medio', '4° medio'):
                self.assertEqual(836, sum(row['hp'] for row in rows if row['year'] == grade))
            modules = list(draft_modules(key))
            self.assertEqual(len(rows), len(modules))
            for item, content in modules:
                self.assertEqual(item['title'], content['specialty_source']['title'])
                self.assertEqual(item['source_page'], content['specialty_source']['source_page'])
                self.assertTrue(all(ae['criteria'] for ae in content['aes']))
                self.assertNotIn('\ufffd', json.dumps(content, ensure_ascii=False))
            self.assertTrue(rows[-1]['source_warnings'])

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
            INSERT INTO courses VALUES(1,'Agropecuaria','Agropecuaria','3° y 4° medio');
            INSERT INTO enrollments VALUES(1,1);
        ''')
        install_agriculture_drafts(con)
        install_agriculture_drafts(con)
        titles = [row['title'] for row in con.execute('SELECT title FROM courses ORDER BY id')]
        self.assertEqual(['Agropecuaria, mención Agricultura',
                          'Agropecuaria, mención Pecuaria',
                          'Agropecuaria, mención Vitivinícola'], titles)
        for course in con.execute('SELECT id,title FROM courses').fetchall():
            rows = con.execute('SELECT published,content FROM modules WHERE course_id=?',
                               (course['id'],)).fetchall()
            self.assertEqual(10 if 'Agricultura' in course['title'] else 11, len(rows))
            self.assertTrue(all(not row['published'] for row in rows))
        self.assertEqual(3, con.execute('SELECT COUNT(*) FROM enrollments').fetchone()[0])
        con.close()


if __name__ == '__main__':
    unittest.main()
