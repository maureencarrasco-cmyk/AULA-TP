import copy
import json
import re
import unicodedata
import unittest
from pathlib import Path

from curriculum_corrections import CORRECTIONS, SOURCES, restore_original_ae
from curriculum import apply_official


class OriginalCurriculumTests(unittest.TestCase):
    def test_restored_text_matches_original_pdf_page(self):
        import pymupdf
        root = Path(__file__).resolve().parents[1]
        def normalized(text):
            text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode().lower()
            return re.sub(r'[^a-z0-9]', '', text)
        for row, (name, page) in zip(CORRECTIONS, SOURCES):
            with pymupdf.open(root / 'docs/fuentes/tp-programas' / (name + '.pdf')) as document:
                self.assertIn(normalized(row['new']), normalized(document[page - 1].get_text()), name)

    def test_exact_restorations_preserve_assessment(self):
        self.assertEqual(len(CORRECTIONS), 11)
        for row in CORRECTIONS:
            content = {'aes': [{'title': row['old'], 'description': row['old'],
                               'experiences': [{'title': row['old'], 'prompt': row['old'], 'answer': 2}]}],
                       'questions': [{'prompt': row['old'], 'answer': 1}]}
            assessment = copy.deepcopy(content['questions'])
            experience = copy.deepcopy(content['aes'][0]['experiences'][0])
            restore_original_ae(content)
            self.assertEqual(content['aes'][0]['title'], row['new'])
            self.assertEqual(content['questions'], assessment)
            self.assertEqual(content['aes'][0]['experiences'][0]['prompt'], experience['prompt'])
            self.assertEqual(content['aes'][0]['experiences'][0]['answer'], 2)
            once = copy.deepcopy(content)
            self.assertEqual(restore_original_ae(content), once)

    def test_official_catalogs_use_restored_text(self):
        root = Path(__file__).resolve().parents[1]
        text = '\n'.join((root / name).read_text(encoding='utf-8') for name in
                         ['sanitary_official.json', 'merchant_crew_official.json', 'early_childhood_official.json'])
        for row in CORRECTIONS:
            self.assertIn(row['new'], text)
            self.assertNotIn('"title": ' + json.dumps(row['old'], ensure_ascii=False), text)

    def test_restored_short_titles_preserve_whole_words_and_original_meaning(self):
        for row in CORRECTIONS:
            content = {'aes': [{'title': row['old'], 'short_title': row['old'][:84]}]}
            restore_original_ae(content)
            short = content['aes'][0]['short_title']
            self.assertTrue(row['new'].startswith(short))
            self.assertTrue(len(row['new']) == len(short) or row['new'][len(short)].isspace())
            once = copy.deepcopy(content)
            self.assertEqual(restore_original_ae(content), once)

    def test_handwritten_short_title_is_not_rewritten(self):
        content = {'aes': [{'title': CORRECTIONS[6]['old'], 'short_title': 'Observación del desarrollo'}]}
        restore_original_ae(content)
        self.assertEqual(content['aes'][0]['short_title'], 'Observación del desarrollo')

    def test_cubication_oa(self):
        content = {'aes': [{}, {}, {}]}
        apply_official(content, 1)
        self.assertTrue(content['aes'][0]['oa'].startswith('OA 1'))
        self.assertTrue(content['aes'][2]['oa'].startswith('OA 2'))


if __name__ == '__main__':
    unittest.main()
