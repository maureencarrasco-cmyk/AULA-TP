import json
import re
import tempfile
import unittest
from pathlib import Path

from app import create_app
from hospitality_catalog import OFFICIAL, courses


class HospitalityCurriculumTests(unittest.TestCase):
    def test_official_module_structure_and_traceability(self):
        plans = courses()
        self.assertEqual([(course['title'], len(course['modules'])) for course in plans], [
            ('Gastronomía, mención Cocina', 11),
            ('Gastronomía, mención Pastelería y Repostería', 11),
            ('Servicios de Hotelería', 10),
        ])
        for course in plans:
            self.assertEqual(sum(module['content']['specialty_source']['official_hp']
                                 for module in course['modules']), 1672)
            for module in course['modules']:
                content = module['content']
                self.assertEqual(len(content['cases']), 15)
                self.assertEqual(len(content['questions']), 25)
                self.assertTrue(content['specialty_source']['oa'] or module['title'] == 'Emprendimiento y empleabilidad')
                for ae in content['aes']:
                    self.assertTrue(ae['official_code'])
                    self.assertTrue(ae['criteria'])
                    self.assertTrue(all(re.match(r'^\d+\.\d+ ', criterion) for criterion in ae['criteria']))
                self.assertTrue(all(case['criterion'] in content['aes'][case['ae']]['criteria']
                                    for case in content['cases']))
                self.assertTrue(all(question['criterion'] in content['aes'][question['ae']]['criteria']
                                    for question in content['questions']))
                self.assertTrue((Path(__file__).resolve().parents[1] /
                                 content['scene']['image'].lstrip('/')).is_file())
        self.assertEqual(sum(row['hp'] for row in OFFICIAL['hoteleria'][:5]), 836)
        self.assertEqual(sum(row['hp'] for row in OFFICIAL['gastronomia'][:6]), 836)

    def test_student_can_open_published_modules_and_progress(self):
        with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as directory:
            app = create_app({'TESTING': True, 'SECRET_KEY': 'test-only',
                              'DATABASE': str(Path(directory) / 'test.sqlite3')})
            client = app.test_client()
            csrf = client.get('/api/session').json['csrf']
            response = client.post('/api/login', json={'username': 'estudiante', 'password': 'AulaTP2026!'},
                                   headers={'X-CSRF-Token': csrf})
            self.assertEqual(response.status_code, 200)
            course_rows = client.get('/api/courses').json
            names = {course['title'] for course in course_rows}
            for title in ('Gastronomía, mención Cocina',
                          'Gastronomía, mención Pastelería y Repostería',
                          'Servicios de Hotelería'):
                self.assertIn(title, names)
                course = next(row for row in course_rows if row['title'] == title)
                self.assertTrue(all(module['published'] for module in course['modules']))
                module = client.get(f"/api/modules/{course['modules'][0]['id']}")
                self.assertEqual(module.status_code, 200)
                self.assertTrue(module.json['content']['aes'])
            progress = client.get('/api/progress')
            self.assertEqual(progress.status_code, 200)
            self.assertTrue(any(row['course_title'] == 'Servicios de Hotelería' for row in progress.json))


if __name__ == '__main__':
    unittest.main()
