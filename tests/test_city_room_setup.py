import json
import unittest
from pathlib import Path

from city_room_setup import room_setup
from scripts.build_city_room_resources import activity_resources, category


class RoomInventoryTests(unittest.TestCase):
    def test_regulations_are_documents_not_rulers(self):
        self.assertEqual(category('Reglamento Sanitario de los Alimentos'), 'documents')
        self.assertEqual(category('Regla graduada'), 'tools')
    def test_criterion_review_is_explicit_and_sourced(self):
        data = json.loads((Path(__file__).resolve().parents[1] / 'city_room_resources.json').read_text(encoding='utf-8'))
        reviewed = data['441']
        self.assertEqual(len(reviewed['curriculum_audit']['criteria']), 9)
        self.assertEqual(len(reviewed['learning_outcomes']), 3)
        self.assertEqual(reviewed['objectives'][0]['code'], 'OA 3')
        for criterion in reviewed['curriculum_audit']['criteria']:
            self.assertTrue(criterion['resources'])
            for name in criterion['resources']:
                item = next(item for item in reviewed['resources'] if item['name'] == name)
                self.assertIn(criterion['code'], item['criteria'])
                self.assertTrue(item['model'])
                self.assertIn(item['references'][0]['pdf_page'], [45, 46])
        for mid, row in data.items():
            if mid != '441':
                self.assertEqual(row['curriculum_audit']['status'], 'source_screened_requires_disciplinary_review')

    def test_every_published_module_has_sourced_resources(self):
        data = json.loads((Path(__file__).resolve().parents[1] / 'city_room_resources.json').read_text(encoding='utf-8'))
        self.assertEqual(len(data), 451)
        self.assertEqual(len({row['specialty'] for row in data.values()}), 45)
        for row in data.values():
            self.assertTrue(row['resources'], row['module_title'])
            self.assertTrue(row['url'].startswith('https://www.curriculumnacional.cl/'))
            for item in row['resources']:
                self.assertTrue(item['name'])
                self.assertTrue(all(ref['pdf_page'] > 0 for ref in item['references']))

    def test_public_workshop_fallback_matches_the_authoritative_inventory(self):
        root = Path(__file__).resolve().parents[1]
        source = json.loads((root / 'city_room_resources.json').read_text(encoding='utf-8'))
        fallback = json.loads((root / 'city-panel' / 'assets' / 'module-room-resources.json').read_text(encoding='utf-8'))
        self.assertEqual(fallback, source)

    def test_activity_parser_stops_before_execution_and_handles_single_bullets(self):
        self.assertEqual(activity_resources('Recursos:\n› Manual; reglas.\n› Guantes.\nEJECUCIÓN\nDocente:\n› Otra instrucción.'),
                         ['Manual', 'reglas', 'Guantes'])

    def test_module_lookup_does_not_reuse_another_specialty_or_module(self):
        setup = room_setup('Reparación y remplazo de elementos estructurales de la aeronave',
                           'Mecánica de Mantenimiento de Aeronaves', {'aes': [{'title': 'Inspecciona', 'criteria': ['Inspección visual']} ]})
        self.assertTrue(any('protección personal' in item['name'].lower() for item in setup['resources']))
        self.assertEqual(setup['learning_outcomes'][0]['criteria'], ['Inspección visual'])
        self.assertEqual(room_setup('Otro módulo', setup['specialty'], {})['status'], 'requires_source_review')
        self.assertEqual(room_setup(setup['module_title'], 'Otra especialidad', {})['resources'], [])
