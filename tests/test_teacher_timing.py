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

    def test_invalid_measurement_dates_rejected(self):
        for date in ('ayer', '2026-02-30', '2026-13-01', 20261004):
            with self.subTest(date=date), self.assertRaises(ValueError):
                timing_summary(['a'], [{**self.record(), 'measured_at': date}], 100)
        record = {**self.record(), 'measured_at': '2026-10-04T10:30:00-03:00'}
        self.assertTrue(timing_summary(['a'], [record], 100)['complete'])

    def test_invalid_required_inventory_rejected(self):
        for activities in (['a', 'a'], [''], ['   '], [None], [1]):
            with self.subTest(activities=activities), self.assertRaises(ValueError):
                timing_summary(activities, [], 100)

    def test_overflow_cannot_produce_coverage(self):
        record = self.record()
        record['minutes'] = dict.fromkeys(record['minutes'], 1e308)
        with self.assertRaises(ValueError):
            timing_summary(['a'], [record], 100)
        record['minutes'] = dict.fromkeys(record['minutes'], 4e307)
        with self.assertRaises(ValueError):
            timing_summary(['a'], [record], 100)
