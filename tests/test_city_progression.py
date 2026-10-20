import copy
import unittest

from city_progression import (PHASE_MINUTES, apply_review, evaluate_city, migrate_awards,
                              quiz_teacher_result, recovery_plan, recovery_question, start_recovery)


PLAN = {'module': {'title': 'Diagnóstico profesional'}, 'quiz': [{'image': '/static/reference.png'}],
        'mission': {'scenario': 'Orden de diagnóstico de un equipo.',
                    'tasks': [{'title': 'Comprobar el equipo', 'ae_title': 'Verifica el funcionamiento',
                               'prompt': 'Contrasta lecturas y documenta una decisión.', 'product': 'Informe técnico',
                               'criterion': 'Compara las mediciones con la referencia.'}]}}


def experience(correct=10):
    return {'quiz': {'completed_at': 'quiz', 'answers': {str(i): {'correct': i < correct} for i in range(10)}},
            'mission': {'attempt_id': 1, 'completed_at': 'mission', 'active_seconds': 1800,
                        'responses': {phase: f'Evidencia original de {phase}' for phase in PHASE_MINUTES}}}


def review(points=None, competencies=True, safety=True, critical_phases=None):
    return {'points': points or [[5]*5 for _ in range(4)], 'competencies_approved': competencies,
            'safety_approved': safety, 'feedback': 'Retroalimentación profesional con evidencias y próximos pasos.',
            'critical_phases': critical_phases or ['actuar', 'verificar']}


class CityProgression(unittest.TestCase):
    def test_teacher_quiz_rubric_uses_weighted_score_and_technical_sufficiency_gate(self):
        state = {'quiz': {'version': 3, 'completed_at': 'quiz', 'answers': {
            str(i): {'correct': i > 0} for i in range(4)}}}
        items = [{'argument_quality': 5, 'application': 5, 'coherence': 5,
                  'technically_sufficient': True, 'feedback': 'Fundamentación revisada y vinculada con el criterio técnico.'}
                 for _ in range(4)]
        state['quiz']['teacher_review'] = {'items': items}
        result = quiz_teacher_result(state)
        self.assertEqual(result['items'][0]['score'], 70)
        self.assertEqual(result['score'], 92.5)
        self.assertTrue(result['approved'])
        items[0]['technically_sufficient'] = False
        self.assertFalse(quiz_teacher_result(state)['approved'])

    def test_independent_gates_and_no_rounding_up_to_pass(self):
        state = experience()
        result = apply_review(state, review([[4]*5, [4]*5, [4]*5, [1]*5]), PLAN, 1)
        self.assertEqual(result['practice_score'], 65)
        self.assertEqual(result['final_score'], 75.5)
        self.assertFalse(result['approved'])
        self.assertEqual(result['areas'], [])
        result = apply_review(experience(5), review([[5]*5]*3+[[2,2,2,2,2]]), PLAN, 1)
        self.assertEqual(result['final_score'], 74.5)
        self.assertFalse(result['conditions']['final_score'])
        for competency, safety in ((False, True), (True, False)):
            self.assertFalse(apply_review(experience(), review(competencies=competency, safety=safety), PLAN, 1)['approved'])

    def test_one_area_for_pass_and_three_at_90_accumulate_without_duplicates(self):
        state = experience(8)
        result = apply_review(state, review([[4]*5]*4), PLAN, 8)
        self.assertEqual(result['final_score'], 80)
        self.assertEqual(len(result['areas']), 1)
        state['quiz']['answers'] = experience()['quiz']['answers']
        result = apply_review(state, review(), PLAN, 8)
        self.assertEqual(len(result['areas']), 3)
        self.assertEqual(len(apply_review(state, review(), PLAN, 8)['areas']), 3)
        result = apply_review(state, review(safety=False), PLAN, 8)
        self.assertFalse(result['approved'])
        self.assertEqual(len(result['areas']), 3)
        self.assertTrue(all(area['module_id'] == 8 and area['objective'] and area['product'] for area in result['areas']))

    def test_full_recovery_archives_all_evidence_and_resets_30_minutes(self):
        state = experience()
        apply_review(state, review([[0]*5 for _ in range(4)], False, False), PLAN, 1)
        before = copy.deepcopy(state['mission']['responses'])
        plan = start_recovery(state, 'Realicé el refuerzo y organizaré las verificaciones antes de actuar.')
        self.assertEqual(plan['type'], 'practica_integral')
        self.assertEqual(state['mission']['required_seconds'], 1800)
        self.assertEqual(state['mission']['active_seconds'], 0)
        self.assertEqual(state['mission']['responses'], {})
        self.assertEqual(state['mission']['attempt_history'][0]['responses'], before)
        self.assertNotIn('completed_at', state['mission'])

    def test_selective_recovery_preserves_mastered_phases_and_critical_work(self):
        state = experience()
        apply_review(state, review([[5]*5, [3]*5, [5]*5, [5]*5], False, True, ['actuar']), PLAN, 1)
        self.assertEqual(recovery_plan(state)['phases'], ['actuar'])
        start_recovery(state, 'Practiqué el procedimiento pendiente y revisaré mis mediciones.')
        self.assertEqual(state['mission']['required_seconds'], 900)
        self.assertEqual(set(state['mission']['responses']), {'planificar', 'verificar', 'justificar'})
        self.assertEqual(evaluate_city(state)['status'], 'in_progress')

    def test_alert_requires_two_distinct_failed_attempts_not_two_revisions(self):
        state = experience()
        for _ in range(2):
            result = apply_review(state, review(safety=False), PLAN, 1)
        self.assertEqual(result['failed_attempts'], 1)
        self.assertFalse(result['teacher_alert'])
        start_recovery(state, 'Repasé seguridad y repetiré las comprobaciones críticas con supervisión.')
        state['mission']['responses'] = experience()['mission']['responses']
        state['mission']['completed_at'] = 'second'
        result = apply_review(state, review(safety=False), PLAN, 1)
        self.assertTrue(result['teacher_alert'])
        self.assertEqual(result['alert']['failed_attempt_ids'], [1, 2])
        result = apply_review(state, review(), PLAN, 1)
        self.assertTrue(result['approved'])
        self.assertEqual(result['alert']['status'], 'resolved')

    def test_legacy_rewards_are_recovered_and_revisions_are_one_attempt(self):
        state = experience()
        state['mission']['reviews'] = [review(), review(safety=False)]
        state['mission']['review'] = state['mission']['reviews'][-1]
        migrate_awards(state, PLAN, 1)
        self.assertEqual(len(state['earned_areas']), 3)
        self.assertEqual(evaluate_city(state)['attempts'], 1)
        self.assertFalse(evaluate_city(state)['approved'])
        legacy = experience(4)
        legacy['mission']['review'] = review([[5]*5]*3+[[3]*5])
        migrate_awards(legacy, PLAN, 2)
        self.assertEqual(len(legacy['earned_areas']), 2, 'Se conservan ambas áreas concedidas por la regla histórica')

    def test_quiz_recovery_uses_unused_equivalent_question_from_same_ae(self):
        plan = {'quiz': [{'question': 'Original', 'ae': 1, 'skill': 'Medir'}]}
        bank = {'questions': [{'question': 'Otro AE', 'ae': 2}, {'question': 'Equivalente', 'ae': 1, 'skill': 'Medir'}]}
        state = experience(0)
        self.assertEqual(recovery_question(bank, plan, state, 0)['question'], 'Equivalente')
        state['quiz']['recovery_answers'] = {'0': [{'question': 'Equivalente'}]}
        self.assertIsNone(recovery_question(bank, plan, state, 0))

    def test_quiz_improvement_does_not_skip_integral_recovery_required_below_60(self):
        state = experience(0)
        apply_review(state, review([[4]*5 for _ in range(4)]), PLAN, 1)
        state['quiz']['answers'] = experience()['quiz']['answers']
        self.assertEqual(evaluate_city(state)['final_score'], 86)
        self.assertFalse(evaluate_city(state)['approved'])
        self.assertEqual(recovery_plan(state)['minutes'], 30)
        start_recovery(state, 'Mejoré los aprendizajes y repetiré la práctica integral correspondiente.')
        state['mission']['responses'] = experience()['mission']['responses']
        state['mission']['completed_at'] = 'retry'
        self.assertTrue(apply_review(state, review(), PLAN, 1)['approved'])


if __name__ == '__main__':
    unittest.main()
