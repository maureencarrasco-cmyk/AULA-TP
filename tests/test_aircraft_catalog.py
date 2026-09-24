import json
import sqlite3
import unittest

from aircraft_catalog import OFFICIAL, draft_modules, install_aircraft_draft


class AircraftCatalogTests(unittest.TestCase):
    def test_pdf_based_draft_is_complete_and_unpublished(self):
        self.assertEqual(11, len(OFFICIAL))
        modules = list(draft_modules())
        self.assertEqual(11, len(modules))
        for item, content in modules:
            self.assertEqual(item['title'], content['specialty_source']['title'])
            self.assertEqual('pdf_ocr_review', content['specialty_source']['extraction_status'])
            self.assertTrue(all(ae['criteria'] for ae in content['aes']))
            self.assertNotIn('\ufffd', json.dumps(content, ensure_ascii=False))

    def test_install_does_not_duplicate_or_publish(self):
        con = sqlite3.connect(':memory:')
        con.row_factory = sqlite3.Row
        con.executescript('''
            CREATE TABLE users(id INTEGER PRIMARY KEY,role TEXT);
            CREATE TABLE courses(id INTEGER PRIMARY KEY,title TEXT,specialty TEXT,level TEXT);
            CREATE TABLE enrollments(user_id INTEGER,course_id INTEGER,UNIQUE(user_id,course_id));
            CREATE TABLE modules(id INTEGER PRIMARY KEY,course_id INTEGER,title TEXT,
                position INTEGER,published INTEGER,content TEXT);
            INSERT INTO users VALUES(1,'student');
            INSERT INTO courses VALUES(1,'Mecánica de Mantenimiento de Aeronaves',
                'Mecánica de Mantenimiento de Aeronaves','3° y 4° medio');
        ''')
        install_aircraft_draft(con)
        install_aircraft_draft(con)
        rows = con.execute('SELECT published,content FROM modules ORDER BY position').fetchall()
        self.assertEqual(11, len(rows))
        self.assertTrue(all(not row['published'] for row in rows))
        self.assertEqual(1, con.execute('SELECT COUNT(*) FROM courses').fetchone()[0])
        self.assertEqual(1, con.execute('SELECT COUNT(*) FROM enrollments').fetchone()[0])
        con.close()


if __name__ == '__main__':
    unittest.main()
