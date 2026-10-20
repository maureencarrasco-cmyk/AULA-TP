import json
import unittest
from pathlib import Path
from scripts.city_room_criterion_scan import compact, contextual_model, criterion_pages, rules


class CriterionScreenTests(unittest.TestCase):
    def test_source_matching_requires_both_criterion_anchors(self):
        text = '1.1 Configura un router utilizando los comandos basicos y verifica el funcionamiento de la red local.'
        self.assertEqual(criterion_pages(text, [compact(text)]), [1])
        self.assertEqual(criterion_pages(text, [compact('Configura un router utilizando los comandos basicos')]), [])
        self.assertEqual(criterion_pages(text, [compact('Otra actividad sobre un router.')]), [])

    def test_nouns_are_not_substrings_or_generic_safety_inferences(self):
        lookup = {name: pattern for name, _, _, pattern in rules()}
        self.assertFalse(lookup['Torno'].search('entorno laboral'))
        self.assertFalse(lookup['Guantes'].search('cumple las normas de seguridad'))
        self.assertTrue(lookup['Multimetro'].search('utiliza multimetros para medir'))
        self.assertFalse(lookup['Valvula'].search('evaluacion'))
        self.assertEqual(contextual_model('Compas', 'catalog-caliper', 'Pesqueria'), 'catalog-gauge')
        self.assertEqual(contextual_model('Bateria', 'catalog-battery', 'Programacion'), 'catalog-cell')

    def test_all_modules_have_an_explicit_audit_and_no_unverified_noun_additions(self):
        root = Path(__file__).resolve().parents[1]
        data = json.loads((root / 'city_room_resources.json').read_text(encoding='utf8'))
        for mid, row in data.items():
            audit = row['curriculum_audit']
            self.assertIn(audit['status'], ['reviewed_virtual_representation', 'source_screened_requires_disciplinary_review'])
            names = {item['name'] for item in row['resources']}
            for criterion in audit['criteria']:
                self.assertTrue(set(criterion['resources']) <= names)
                if criterion.get('status') == 'explicit_resources_linked':
                    self.assertTrue(criterion['source_verified'])
                    self.assertTrue(criterion['pdf_pages'])
            for item in row['resources']:
                if item.get('model', '').startswith('catalog-'):
                    self.assertTrue(any(ref.get('source_phrase') for ref in item['references']), (mid, item['name']))

