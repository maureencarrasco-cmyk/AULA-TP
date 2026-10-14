import unittest

from scripts.audit_curriculum_pdf import normalize


class DocumentaryNormalizationTest(unittest.TestCase):
    def test_accents_line_wrap_and_criterion_prefix_are_not_false_differences(self):
        self.assertEqual(normalize('1.1 Revisión de insta-\nlaciones.'), normalize('Revision de instalaciones'))

    def test_different_technical_statements_remain_different(self):
        self.assertNotEqual(normalize('Medir presión'), normalize('Medir temperatura'))


if __name__ == '__main__':
    unittest.main()
