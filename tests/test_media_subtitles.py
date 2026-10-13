import ast
import re
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STAMP = re.compile(r'(?:(\d{2,}):)?([0-5]\d):([0-5]\d)\.(\d{3})$')


def seconds(value):
    match = STAMP.fullmatch(value)
    if not match:
        raise ValueError(value)
    hours, minutes, secs, millis = match.groups()
    return int(hours or 0) * 3600 + int(minutes) * 60 + int(secs) + int(millis) / 1000


class MediaSubtitleTests(unittest.TestCase):
    def test_all_eight_tracks_have_ordered_valid_cues(self):
        tracks = list((ROOT / 'static/media').glob('*-secuencia.vtt'))
        self.assertEqual(len(tracks), 8)
        for track in tracks:
            with self.subTest(track=track.name):
                text = track.read_text(encoding='utf-8')
                self.assertTrue(text.startswith('WEBVTT'))
                previous = 0
                cues = 0
                for line in text.splitlines():
                    if ' --> ' not in line:
                        continue
                    start, end = map(seconds, line.split(' --> '))
                    self.assertGreaterEqual(start, previous)
                    self.assertGreater(end, start)
                    previous = end
                    cues += 1
                technical = track.name.startswith(('m1-', 'm2-', 'm3-', 'm4-'))
                self.assertEqual(cues, 4 if technical else 3)
                self.assertEqual(previous, 60 if technical else 15)

    def test_generator_handles_minute_and_hour_boundaries(self):
        tree = ast.parse((ROOT / 'scripts/build_oficio_videos.py').read_text(encoding='utf-8'))
        function = next(node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == 'write_vtt')
        namespace = {}
        exec(compile(ast.Module(body=[function], type_ignores=[]), '<write_vtt>', 'exec'), namespace)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'test.vtt'
            namespace['write_vtt'](path, [(45, 60, 'Original caption'), (3599, 3600, 'Next caption')])
            text = path.read_text(encoding='utf-8')
            self.assertIn('00:00:45.000 --> 00:01:00.000', text)
            self.assertIn('00:59:59.000 --> 01:00:00.000', text)
            self.assertIn('Original caption', text)


if __name__ == '__main__':
    unittest.main()
