import json
import sqlite3
import unittest

from mechanical_industry_catalog import OFFICIAL, draft_modules, install_mechanical_industry_drafts


class MechanicalIndustryCatalogTests(unittest.TestCase):
    def test_verified_mentions_and_pending_track(self):
        self.assertEqual({'mantenimiento_electromecanico', 'maquinas_herramientas',
                          'matriceria'}, set(OFFICIAL))
        self.assertEqual([6, 7, 8, 9], [row['position'] for row in
                         OFFICIAL['mantenimiento_electromecanico']
                         if row['extraction_status'] == 'pdf_ocr_review'])
        for key in ('mantenimiento_electromecanico', 'maquinas_herramientas', 'matriceria'):
            rows = OFFICIAL[key]
            self.assertEqual(10, len(rows))
            for grade in ('3° medio', '4° medio'):
                self.assertEqual(836, sum(row['hp'] for row in rows if row['year'] == grade))
            modules = list(draft_modules(key))
            self.assertEqual(10, len(modules))
            for item, content in modules:
                self.assertEqual(item['title'], content['specialty_source']['title'])
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
            INSERT INTO courses VALUES(1,'Mecánica Industrial','Mecánica Industrial','3° y 4° medio');
            INSERT INTO enrollments VALUES(1,1);
        ''')
        install_mechanical_industry_drafts(con)
        install_mechanical_industry_drafts(con)
        titles = [row['title'] for row in con.execute('SELECT title FROM courses ORDER BY id')]
        self.assertEqual(['Mecánica Industrial, mención Máquinas-Herramientas',
                          'Mecánica Industrial, mención Matricería',
                          'Mecánica Industrial, mención Mantenimiento Electromecánico'], titles)
        for course in con.execute('SELECT id FROM courses').fetchall():
            rows = con.execute('SELECT published FROM modules WHERE course_id=?',
                               (course['id'],)).fetchall()
            self.assertEqual(10, len(rows))
            self.assertTrue(all(not row['published'] for row in rows))
        self.assertEqual(3, con.execute('SELECT COUNT(*) FROM enrollments').fetchone()[0])
        con.close()


if __name__ == '__main__':
    unittest.main()
