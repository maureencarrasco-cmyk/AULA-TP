import unittest
from copy import deepcopy

from content import DEFAULT_CONTENT
from pedagogy import enrich


class PracticeIntegrityTests(unittest.TestCase):
    def test_numeric_renderer_preserved_and_legacy_recovered(self):
        practices = [
            {'type': 'scale', 'title': 'Explorador de escalas'},
            {'type': 'measurement', 'title': 'Lecturas', 'values': [19, 20, 21], 'reference': [18, 22]},
            {'type': 'network', 'title': 'Red', 'values': [2, 3, 4], 'reserve': 10},
            {'type': 'equipment', 'title': 'Espacio', 'available': 24, 'required': 30},
        ]
        for practice in practices:
            for legacy in (False, True):
                with self.subTest(kind=practice['type'], legacy=legacy):
                    content = deepcopy(DEFAULT_CONTENT)
                    content['practice'] = deepcopy(practice)
                    if legacy:
                        content['practice']['type'] = 'professional_decision_simulation'
                    result = enrich(content, 1)['practice']
                    for key, value in practice.items():
                        self.assertEqual(value, result[key])
                    self.assertEqual('professional_decision_simulation', result['simulation_kind'])
                    self.assertEqual(practice['type'], enrich(content, 1)['practice']['type'])
