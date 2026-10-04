import unittest
from copy import deepcopy

from assessment_integrity import assessment_issues


class AssessmentIntegrityTests(unittest.TestCase):
    def fixture(self):
        return {'aes': [{'title': 'Aprendizaje'}], 'questions': [{
            'question': 'Compara los antecedentes', 'options': ['Primero', 'Segundo'],
            'answer': 0, 'ae': 0, 'explanation': 'Fundamento registrado'}]}

    def test_valid_zero_based_indices_and_no_mutation(self):
        content = self.fixture()
        before = deepcopy(content)
        self.assertEqual([], assessment_issues(content))
        self.assertEqual(before, content)

    def test_duplicates_ignore_case_and_spacing(self):
        content = self.fixture()
        content['questions'][0]['options'] = [' El dato ', 'el   DATO']
        self.assertIn('duplicate_options', [i['code'] for i in assessment_issues(content)])

    def test_boolean_negative_and_out_of_range_indices(self):
        for value in (True, -1, 2, '0', None):
            with self.subTest(value=value):
                content = self.fixture()
                content['questions'][0].update(answer=value, ae=value)
                codes = [i['code'] for i in assessment_issues(content)]
                self.assertIn('invalid_answer_index', codes)
                self.assertIn('invalid_ae_index', codes)

    def test_empty_and_malformed_items(self):
        content = self.fixture()
        content['questions'] = [None, {'options': ['', ''], 'ae': 0}]
        codes = [i['code'] for i in assessment_issues(content)]
        for code in ('invalid_item', 'empty_option', 'missing_prompt', 'missing_explanation'):
            self.assertIn(code, codes)

    def test_publication_rejects_duplicate_options_and_wrong_ae(self):
        from pedagogy import publication_gaps
        content = self.fixture()
        content['questions'][0].update(options=['Uno', 'Uno'], ae=7)
        gaps = publication_gaps(content)
        self.assertTrue(any('alternativas repetidas' in gap for gap in gaps))
        self.assertTrue(any('aprendizaje asociado no existe' in gap for gap in gaps))

    def test_publication_handles_malformed_items_without_crashing(self):
        from pedagogy import publication_gaps
        content = self.fixture()
        content['questions'] = [None]
        self.assertTrue(any('formato de pregunta invalido' in gap for gap in publication_gaps(content)))


if __name__ == '__main__':
    unittest.main()
