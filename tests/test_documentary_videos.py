import importlib.util
import unittest
from pathlib import Path

import imageio.v2 as imageio
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('documentary_builder', ROOT / 'scripts/build_oficio_videos.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class DocumentaryVideoTests(unittest.TestCase):
    def test_tables_match_original_module(self):
        for mid in (2, 3, 4):
            self.assertEqual(builder.verified_table(mid), builder.TABLES[mid])

    def test_no_ambiguous_gauge_or_conflicting_access_frame(self):
        self.assertNotIn('oficio-manometro.png', builder.FRAMES[2])
        self.assertNotIn('oficio-acceso-cm.png', builder.FRAMES[4])
        self.assertIn('cruce en planta', builder.CAPTIONS[3][2][2])
        self.assertNotIn('hermeticidad', builder.CAPTIONS[3][3][2])

    def test_all_frames_and_captions_fit(self):
        for mid, files in builder.FRAMES.items():
            for name, (_, _, text) in zip(files, builder.CAPTIONS[mid]):
                frame = builder.load_frame(name, caption=text)
                self.assertEqual(frame.shape, (864, 1280, 3))
        with Image.open(builder.OFICIO / 'oficio-drenaje.png') as source:
            fitted = builder.ImageOps.contain(source, (1280, 720))
            self.assertAlmostEqual(fitted.width / fitted.height, source.width / source.height, places=2)

    def test_generated_files_fully_decode_with_preserved_duration(self):
        for mid in builder.FRAMES:
            with imageio.get_reader(ROOT / 'static/media' / f'm{mid}-secuencia.mp4') as reader:
                metadata = reader.get_meta_data()
                self.assertEqual(metadata['size'], (1280, 864))
                self.assertAlmostEqual(metadata['duration'], 60, places=1)
                self.assertEqual(sum(1 for _ in reader), 120)


if __name__ == '__main__':
    unittest.main()
