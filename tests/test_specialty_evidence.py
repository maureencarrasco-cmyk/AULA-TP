import unittest

from scripts.audit_specialty_evidence import audit, render


class SpecialtyEvidenceTests(unittest.TestCase):
    def test_missing_verification_never_counts_as_approval(self):
        rows = audit({'1': {'specialty': 'Test', 'module_title': 'Module',
                           'curriculum_audit': {'criteria': [
                               {'code': '1.1', 'source_verified': True},
                               {'code': '1.2', 'source_verified': False},
                               {'code': '1.3'}]}}})
        self.assertEqual(rows[0]['criteria_verified'], 1)
        self.assertEqual(len(rows[0]['criteria_unresolved']), 2)
        self.assertFalse(rows[0]['checks']['disciplinary_approval'])
        self.assertFalse(rows[0]['checks']['criteria_documented'])

    def test_report_escapes_source_content(self):
        rows = audit({'1': {'specialty': '<script>bad()</script>', 'module_title': 'Test'}})
        self.assertNotIn('<script>', render(rows))
        self.assertIn('&lt;script&gt;', render(rows))


if __name__ == '__main__':
    unittest.main()
