import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class AircraftSourceInventoryTests(unittest.TestCase):
    def test_official_plan_and_pdf_transcription_are_explicit(self):
        rows = json.loads((ROOT / 'aircraft_official.json').read_text(encoding='utf-8'))
        self.assertEqual(11, len(rows))
        self.assertEqual(list(range(1, 12)), [row['position'] for row in rows])
        for grade in ('3° medio', '4° medio'):
            self.assertEqual(836, sum(row['hp'] for row in rows if row['year'] == grade))
        self.assertTrue(all(row['extraction_status'] == 'pdf_ocr_review' for row in rows))
        self.assertEqual(40, sum(len(row['aes']) for row in rows))
        self.assertEqual(145, sum(len(ae['criteria']) for row in rows for ae in row['aes']))
        self.assertTrue(all(row['source_warnings'] and row['source_pdf_pages'] for row in rows))
        self.assertNotIn('\ufffd', json.dumps(rows, ensure_ascii=False))


if __name__ == '__main__':
    unittest.main()
