import copy
import unittest

from hospitality_question_repair import repair_repeated_questions, signature


class QuestionRepairTests(unittest.TestCase):
    def content(self, answer):
        q = dict(id=0, question='Original', stimulus='Original', options=['a','b','c','d'],
                 answer=answer, criterion='Criterio oficial', ae=0, image='context.png',
                 instruction=dict(object='Original', original='Original'))
        return dict(title='Modulo', questions=[q, dict(copy.deepcopy(q), id=1)])

    def test_preserves_every_correct_position_and_curricular_mapping(self):
        for answer in range(4):
            with self.subTest(answer=answer):
                c = self.content(answer)
                first = copy.deepcopy(c['questions'][0])
                self.assertEqual(repair_repeated_questions(c), [1])
                q = c['questions'][1]
                self.assertEqual(c['questions'][0], first)
                self.assertEqual((q['answer'],q['ae'],q['criterion'],q['id']),
                                 (answer,0,'Criterio oficial',1))
                self.assertEqual(len(set(q['options'])),4)
                self.assertEqual(q['option_feedback'][answer],q['explanation'])
                self.assertEqual(q['instruction']['object'],q['question'])
                self.assertNotEqual(signature(first),signature(q))

    def test_idempotent(self):
        c = self.content(2)
        repair_repeated_questions(c)
        once = copy.deepcopy(c)
        self.assertEqual(repair_repeated_questions(c), [])
        self.assertEqual(c, once)

    def test_distinct_questions_untouched(self):
        c = self.content(0)
        c['questions'][1]['question'] = 'Otra tarea'
        before = copy.deepcopy(c)
        self.assertEqual(repair_repeated_questions(c), [])
        self.assertEqual(c, before)


if __name__ == '__main__':
    unittest.main()
