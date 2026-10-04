import unittest
from teacher_timing import timing_summary


class TeacherTimingTests(unittest.TestCase):
    def record(self, activity='a'):
        return {'activity_id': activity, 'role': 'teacher', 'status': 'measured',
                'measured_at': '2026-10-04', 'minutes': {
                    'reading': 1, 'resources': 2, 'solving': 3, 'writing': 4}}

    def test_complete_applies_factor_to_duration_not_budget(self):
        result = timing_summary(['a'], [self.record()], 100)
        self.assertEqual(10, result['teacher_minutes'])
        self.assertEqual(50, result['sensitivity']['5']['student_minutes'])
        self.assertEqual(50, result['sensitivity']['5']['occupancy_percent'])
        self.assertEqual(-50, result['sensitivity']['5']['difference_minutes'])

    def test_partial_does_not_claim_full_coverage(self):
        result = timing_summary(['a', 'b'], [self.record()], 100)
        self.assertFalse(result['complete'])
        self.assertIsNone(result['teacher_minutes'])
        self.assertIsNone(result['sensitivity']['5']['occupancy_percent'])
        self.assertEqual(['b'], result['missing_activity_ids'])

    def test_unknown_duplicate_simulated_or_incomplete_rejected(self):
        for records in ([self.record('other')], [self.record(), self.record()],
                        [{**self.record(), 'status': 'estimated'}],
                        [{**self.record(), 'role': 'assistant'}],
                        [{**self.record(), 'minutes': {'reading': 1}}]):
            with self.subTest(records=records), self.assertRaises(ValueError):
                timing_summary(['a'], records, 100)

    def test_nonfinite_and_boolean_rejected(self):
        for value in (float('nan'), float('inf'), -1, True):
            record = self.record()
            record['minutes']['solving'] = value
            with self.subTest(value=value), self.assertRaises(ValueError):
                timing_summary(['a'], [record], 100)

    def test_unknown_budget_does_not_invent_occupancy(self):
        result = timing_summary(['a'], [self.record()], None)
        self.assertEqual(50, result['sensitivity']['5']['student_minutes'])
        self.assertIsNone(result['sensitivity']['5']['occupancy_percent'])
