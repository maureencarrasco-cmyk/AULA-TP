import unittest
from copy import deepcopy

from content import DEFAULT_CONTENT
from media_assurance import apply_media_assurance, climate_video_ok
from pedagogy import enrich, strip_for_student


class MediaAssuranceTests(unittest.TestCase):
    def test_inventory_without_pedagogical_seal(self):
        result = enrich(deepcopy(DEFAULT_CONTENT), 1)
        inventory = result['media_inventory']
        self.assertEqual('media-v2', inventory['protocol_version'])
        self.assertEqual(0, inventory['apto_pedagogicamente'])
        self.assertEqual(0, inventory['tecnicamente_validado'])
        self.assertTrue(inventory['items'])
        self.assertEqual(100.0, inventory['indicators']['inventariados_pct'])
        self.assertEqual(0.0, inventory['indicators']['apto_pedagogicamente_pct'])
        kinds = {row.get('kind') for row in result.get('media_resources') or []}
        self.assertNotIn('3d', kinds)
        student = strip_for_student(result)
        self.assertNotIn('items', student.get('media_inventory') or {})
        self.assertIn('indicators', student['media_inventory'])

    def test_climate_sequence_video_not_reused_on_other_specialty(self):
        url = '/static/media/m1-secuencia.mp4'
        self.assertTrue(climate_video_ok({'specialty_key': 'climate'}, url))
        self.assertFalse(climate_video_ok({'specialty_key': 'electricidad'}, url))
        payload = deepcopy(DEFAULT_CONTENT)
        payload['specialty_key'] = 'electricidad'
        payload['video'] = url
        payload['explore'] = {'video': url, 'image': '/static/headers/electricidad/e1.webp'}
        apply_media_assurance(payload, 1)
        self.assertIsNone(payload['explore'].get('video'))


if __name__ == '__main__':
    unittest.main()
