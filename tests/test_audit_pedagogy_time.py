import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('audit_pedagogy_time', Path(__file__).resolve().parents[1] / 'scripts/audit_pedagogy_time.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class AuditTests(unittest.TestCase):
    def test_empty_denominator_is_unknown(self):
        self.assertIsNone(audit.percent(0, 0))
        self.assertEqual(audit.percent(2, 8), 25)

    def test_six_station_mapping_preserves_legacy_evaluation(self):
        content = {'context': 'Context', 'aes': [{'steps': ['Read']}], 'cases': [],
                   'questions': [{'question': 'Question'}], 'development': 'Explain',
                   'reflection_prompt': 'Reflect'}
        result = list(audit.units(content))
        self.assertEqual([s for s, _, _ in result], [1, 2, 5, 5, 6])
        self.assertEqual(len({key for _, key, _ in result}), len(result))
        self.assertFalse(any(s == 4 for s, _, _ in result))

    def test_multiple_issues_remain_one_activity(self):
        issues = audit.inspect({'options': ['same', 'same'], 'answer': 9}, 5, {})
        self.assertEqual(len(issues), 3)
        self.assertEqual(int(bool(issues)), 1)

    def test_unknown_timing_is_not_zero(self):
        self.assertIsNone(audit.number(None))
        self.assertIsNone(audit.number(True))
        self.assertEqual(audit.number(0), 0)


if __name__ == '__main__':
    unittest.main()
