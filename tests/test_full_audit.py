import unittest
from copy import deepcopy

from content import DEFAULT_CONTENT
from instructional_quality import contract_is_complete
from pedagogy import enrich
from scripts.audit_all_courses import activities, bank_has_variety


class FullAuditTests(unittest.TestCase):
    def test_instruction_and_time_follow_real_ae_count(self):
        for count in (2, 4):
            with self.subTest(aes=count):
                content = deepcopy(DEFAULT_CONTENT)
                content['aes'] = [deepcopy(DEFAULT_CONTENT['aes'][i % len(DEFAULT_CONTENT['aes'])])
                                  for i in range(count)]
                for i, ae in enumerate(content['aes']):
                    ae['official_code'] = f'AE-{i + 1}'
                result = enrich(content, 1)
                self.assertEqual(result['planning']['station_minutes']['2_etapa'],
                                 round(result['planning']['station_minutes']['2'] / (count * 6)))
                self.assertIn(f'{count} AE', result['context_instruction']['purpose'])
                self.assertIn(f'{count} AE', result['scene']['instruction']['purpose'])
                self.assertIn(f'{count} AE', result['development_pack']['instruction']['purpose'])
                codes = ' + '.join(ae['official_code'] for ae in result['aes'])
                self.assertEqual(result['feedback_instruction']['ae'], codes)
                self.assertTrue(all(contract_is_complete(instruction)
                                    for _, _, instruction, _ in activities(result)))

    def test_bank_variety_does_not_count_rotated_options(self):
        same = [{'options': ['A', 'B', 'C', 'D']},
                {'options': ['C', 'D', 'A', 'B']}]
        varied = [{'options': [str(i), 'B', 'C', 'D']} for i in range(5)]
        self.assertFalse(bank_has_variety(same))
        self.assertTrue(bank_has_variety(varied))


if __name__ == '__main__':
    unittest.main()
