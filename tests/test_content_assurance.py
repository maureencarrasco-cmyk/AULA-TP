import unittest
from copy import deepcopy

from content import DEFAULT_CONTENT
from content_assurance import apply_content_assurance, resolve_header_url
from pedagogy import enrich, strip_for_student


class ContentAssuranceTests(unittest.TestCase):
    def test_expedition_covers_protocol_without_internal_seal(self):
        content = apply_content_assurance(deepcopy(DEFAULT_CONTENT))
        expedition = content['technical_expedition']
        self.assertTrue(expedition['protocol_complete'])
        self.assertIsNone(expedition['internal_seal'])
        self.assertEqual('En revisión', expedition['status'])
        self.assertTrue(expedition['concepts'])
        self.assertTrue(expedition['coverage'])
        self.assertTrue(expedition['glossary'])
        self.assertEqual(5, len(expedition['layers']))
        self.assertTrue(expedition['debt'])
        self.assertTrue(expedition['change_log'])
        self.assertTrue(expedition['proxima_revision'])
        self.assertIsNone(content['technical_validation']['internal_seal'])
        self.assertEqual('En revisión', content['technical_validation']['status'])

    def test_enrich_attaches_expedition_and_students_keep_scope(self):
        result = enrich(deepcopy(DEFAULT_CONTENT), 1)
        self.assertTrue(result['technical_expedition']['protocol_complete'])
        student = strip_for_student(result)
        self.assertNotIn('answer', student['questions'][0])
        self.assertEqual('En revisión', student['technical_expedition']['status'])
        self.assertIn('concepts', result['technical_expedition'])
        self.assertNotIn('concepts', student['technical_expedition'])

    def test_electricidad_headers_resolve_to_existing_webp(self):
        url = resolve_header_url('electricidad', 3)
        self.assertEqual('/static/headers/electricidad/e3.webp', url)
        climate = resolve_header_url('climate', 1)
        self.assertTrue(climate.startswith('/static/headers/climate/'))
        from pedagogy import verified_static_asset
        self.assertTrue(verified_static_asset(climate))


if __name__ == '__main__':
    unittest.main()
