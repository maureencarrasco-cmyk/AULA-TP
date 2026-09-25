import unittest

from technical_sources import SEC_RIC, governance, source_map


class TechnicalSourcesTests(unittest.TestCase):
    def test_electricity_map_includes_sec_and_mineduc(self):
        rows = source_map('electricidad', 'https://www.curriculumnacional.cl/614/articles-34320_programa.pdf')
        urls = {row.get('url') for row in rows}
        self.assertIn(SEC_RIC, urls)
        self.assertTrue(any(row['level'] == 1 for row in rows))

    def test_governance_does_not_claim_validation(self):
        stamp = governance('enfermeria', 'https://www.curriculumnacional.cl/x')
        self.assertEqual('En revisión', stamp['status'])
        self.assertIsNone(stamp['internal_seal'])
        self.assertEqual('NO VALIDADO', stamp['ia_generated_media'])


if __name__ == '__main__':
    unittest.main()
