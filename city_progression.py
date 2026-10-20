"""Persistent assessment, recovery attempts and earned areas for Station 4."""
from copy import deepcopy
from datetime import datetime, timezone
from decimal import Decimal

PHASE_MINUTES = {'planificar': 5, 'actuar': 15, 'verificar': 5, 'justificar': 5}
QUIZ_PASS_PERCENT = 75


def now():
    return datetime.now(timezone.utc).isoformat()


def quiz_percent(experience):
    quiz = experience.get('quiz') or {}
    answers = quiz.get('answers') or {}
    correct = sum(bool(answer.get('correct') or answer.get('recovered')) for answer in answers.values())
    return Decimal(correct * 100) / max(1, len(answers))


def quiz_learning_status(experience, total=None):
    quiz = experience.get('quiz') or {}
    total = total or (4 if quiz.get('version') == 3 else 10)
    answers = quiz.get('answers') or {}
    correct = sum(bool(answer.get('correct') or answer.get('recovered')) for answer in answers.values())
    percent = Decimal(correct * 100) / max(1, total)
    complete = bool(quiz.get('completed_at') and len(answers) == total)
    return {'total': total, 'answered': len(answers), 'correct': correct, 'percent': float(percent),
            'minimum': QUIZ_PASS_PERCENT, 'complete': complete,
            'approved': complete and percent >= QUIZ_PASS_PERCENT}


def quiz_teacher_result(experience):
    quiz = experience.get('quiz') or {}
    assessment = quiz.get('teacher_review') or {}
    rows = assessment.get('items') or []
    answers = quiz.get('answers') or {}
    if quiz.get('version') != 3:
        score = quiz_percent(experience)
        return {'score': float(score), 'approved': score >= QUIZ_PASS_PERCENT, 'items': []}
    if len(rows) != 4 or len(answers) != 4 or not quiz.get('completed_at'):
        return {'score': 0.0, 'approved': False, 'items': []}
    results = []
    for index, row in enumerate(rows):
        answer = answers.get(str(index)) or {}
        choice_points = 30 if answer.get('correct') or answer.get('recovered') else 0
        score = choice_points + 8 * row['argument_quality'] + 4 * row['application'] + 2 * row['coherence']
        results.append({**row, 'choice_points': choice_points, 'score': score,
                        'approved': score >= 70 and row['technically_sufficient']})
    average = sum(item['score'] for item in results) / len(results)
    return {'score': average, 'approved': average >= 70 and all(item['approved'] for item in results),
            'items': results, 'reviewed_at': assessment.get('reviewed_at')}


def answer_feedback(question, choice):
    correct_choice = question['answer']
    option_feedback = question.get('option_feedback') or []
    return {'correct': choice == correct_choice, 'explanation': question.get('explanation') or '',
            'correct_choice': correct_choice, 'correct_answer': question['options'][correct_choice],
            'choice_feedback': option_feedback[choice] if choice < len(option_feedback) else question.get('explanation') or ''}


def phase_approved(mission, phase):
    if mission.get('recovery') and phase not in mission.get('required_phases', []):
        return phase in (mission.get('responses') or {})
    check = (mission.get('phase_checks') or {}).get(phase) or {}
    if mission.get('validation_version'):
        return bool(check.get('approved') and check.get('revision') == len((mission.get('submissions') or {}).get(phase, [])))
    return phase in (mission.get('responses') or {})


def result_for(experience, review, legacy=False):
    quiz_result = quiz_teacher_result(experience)
    quiz = Decimal(str(quiz_result['score']))
    practice = sum(sum(row) for row in review['points'])
    weighted = quiz * Decimal('0.30') + Decimal(practice) * Decimal('0.70')
    conditions = {'quiz_score': legacy or quiz_result['approved'],
                  'final_score': weighted >= 75, 'practice_score': practice >= 75,
                  'essential_competencies': bool(review.get('competencies_approved')),
                  'critical_safety': bool(review.get('safety_approved')),
                  'activities_complete': bool(experience.get('quiz', {}).get('completed_at') and
                                              experience.get('mission', {}).get('completed_at') and
                                              experience.get('mission', {}).get('attempt_id', 1) >
                                              experience.get('mission', {}).get('integral_required_after', 0))}
    return {'quiz_score': float(quiz), 'practice_score': practice, 'final_score': float(weighted),
            'conditions': conditions, 'approved': all(conditions.values())}


def failed_attempts(experience):
    latest = {}
    for review in experience.get('mission', {}).get('reviews') or []:
        # Historical revisions without an attempt id belong to the original attempt.
        latest[review.get('attempt_id', 1)] = review
    return [key for key, review in latest.items() if not review.get('approved', result_for(experience, review)['approved'])]


def recovery_plan(experience):
    mission = experience.get('mission') or {}
    review = mission.get('review')
    if not review:
        return None
    result = result_for(experience, review)
    if result['approved']:
        return None
    full = (result['final_score'] < 60 or mission.get('attempt_id', 1) <= mission.get('integral_required_after', 0))
    pending = list(PHASE_MINUTES) if full else [phase for phase, row in zip(PHASE_MINUTES, review['points'])
                                               if sum(row) * 4 < 75]
    if not full and (not result['conditions']['essential_competencies'] or not result['conditions']['critical_safety']):
        pending.extend(review.get('critical_phases') or ['actuar', 'verificar'])
    pending = [phase for phase in PHASE_MINUTES if phase in pending]
    return {'type': 'practica_integral' if full else 'refuerzo_especifico', 'phases': pending,
            'minutes': 30 if full else sum(PHASE_MINUTES[phase] for phase in pending),
            'quiz_pending': [int(index) for index, answer in (experience.get('quiz', {}).get('answers') or {}).items()
                             if not answer.get('correct') and not answer.get('recovered')],
            'conditions': result['conditions'], 'feedback': review.get('feedback', '')}


def evaluate_city(experience, plan=None):
    mission = experience.get('mission') or {}
    review = mission.get('review')
    base = {'status': 'in_progress', 'approved': False, 'quiz_score': None, 'practice_score': None,
            'final_score': None, 'level': 0, 'areas': deepcopy(experience.get('earned_areas') or []),
            'conditions': dict.fromkeys(('quiz_score', 'final_score', 'practice_score', 'essential_competencies',
                                        'critical_safety', 'activities_complete'), False),
            'attempts': len({item.get('attempt_id', 1) for item in mission.get('reviews') or []}),
            'attempt_id': mission.get('attempt_id', 1), 'failed_attempts': len(failed_attempts(experience)),
            'teacher_alert': bool(experience.get('teacher_alert', {}).get('status') == 'open'),
            'alert': deepcopy(experience.get('teacher_alert')),
            'recovery': recovery_plan(experience) if review else None}
    if experience.get('quiz', {}).get('completed_at'):
        quiz = experience.get('quiz') or {}
        if quiz.get('version') == 3 and quiz.get('teacher_review'):
            base['quiz_score'] = quiz_teacher_result(experience)['score']
        elif quiz.get('version') != 3:
            base['quiz_score'] = float(quiz_percent(experience))
    if not experience.get('quiz', {}).get('completed_at') or not mission.get('completed_at'):
        return base
    if not review:
        return {**base, 'status': 'pending_review',
                'conditions': {**base['conditions'], 'activities_complete': True},
                'message': 'La práctica quedó registrada y está pendiente de revisión docente.'}
    result = result_for(experience, review)
    level = 4 if result['approved'] and result['final_score'] >= 90 else 3 if result['approved'] else 2 if result['final_score'] >= 60 else 1
    return {**base, **result, 'status': 'reviewed', 'level': level,
            'level_name': {1: 'Aprendiz en desarrollo', 2: 'Explorador profesional', 3: 'Técnico avanzado', 4: 'Experto de misión'}[level],
            'safety_approved': review.get('safety_approved', False),
            'competencies_approved': review.get('competencies_approved', False),
            'recovery_type': (base['recovery'] or {}).get('type'), 'feedback': review.get('feedback', ''),
            'reviewed_at': review.get('at')}


def sync_awards(experience, plan, module_id, legacy=False):
    result = evaluate_city(experience, plan)
    if legacy and experience.get('mission', {}).get('review'):
        result.update(result_for(experience, experience['mission']['review'], legacy=True))
    if not result['approved']:
        return
    if not legacy and experience.get('teacher_alert'):
        experience['teacher_alert'].update(status='resolved', resolved_at=now())
    ledger = experience.setdefault('earned_areas', [])
    tasks = plan.get('mission', {}).get('tasks') or []
    levels = (2, 3, 4) if result['final_score'] >= 90 else (2, 3) if legacy else (2,)
    for index, level in enumerate(levels):
        area_id = f'module-{module_id}-area-{level}'
        if any(area.get('id') == area_id for area in ledger):
            continue
        task = tasks[index % len(tasks)] if tasks else {}
        ledger.append({'id': area_id, 'module_id': module_id, 'level': level,
                       'name': task.get('title') or 'Área profesional complementaria',
                       'ae_title': task.get('ae_title') or plan.get('module', {}).get('title', ''),
                       'objective': task.get('prompt') or plan['mission']['scenario'],
                       'product': task.get('product') or 'Registro de decisiones y verificaciones',
                       'criterion': task.get('criterion') or '', 'earned_at': now(),
                       'score': result['final_score'], 'attempt_id': result['attempt_id'], 'legacy_award': legacy,
                       'preview': next((q.get('image') for q in plan.get('quiz', []) if q.get('image')), None)})


def apply_review(experience, review, plan, module_id):
    mission = experience['mission']
    attempt = mission.setdefault('attempt_id', 1)
    review = {**deepcopy(review), 'attempt_id': attempt, 'at': now()}
    review.update(result_for(experience, review))
    if review['final_score'] < 60:
        mission['integral_required_after'] = attempt
        review.update(result_for(experience, review))
    mission.setdefault('reviews', []).append(review)
    mission['review'] = review
    failures = failed_attempts(experience)
    alert = experience.get('teacher_alert')
    if len(failures) >= 2 and not review['approved']:
        if not alert or alert.get('status') == 'resolved':
            if alert:
                experience.setdefault('alert_history', []).append(deepcopy(alert))
            alert = {'id': f'city-{module_id}-attempt-{attempt}', 'status': 'open', 'created_at': now()}
            experience['teacher_alert'] = alert
        alert.update(failed_attempt_ids=failures, conditions=review['conditions'], updated_at=now())
    elif review['approved'] and alert:
        alert.update(status='resolved', resolved_at=now())
    sync_awards(experience, plan, module_id)
    return evaluate_city(experience, plan)


def start_recovery(experience, reinforcement):
    recovery = recovery_plan(experience)
    if not recovery:
        raise ValueError('La práctica debe tener una revisión insuficiente para abrir una recuperación.')
    if not isinstance(reinforcement, str) or len(reinforcement.strip()) < 20 or len(reinforcement) > 10000:
        raise ValueError('Registra el refuerzo realizado y tu plan de mejora (al menos 20 caracteres).')
    if not recovery['phases']:
        raise ValueError('La práctica ya está lograda. Recupera los desafíos del quiz que mantienen el puntaje final bajo 75%.')
    mission = experience['mission']
    for review in mission.get('reviews') or []:
        if 'approved' not in review:
            review.update(result_for(experience, review))
    mission.setdefault('attempt_history', []).append(deepcopy({key: value for key, value in mission.items()
                                                              if key not in ('attempt_history', 'reviews', 'recovery_missions', 'explored_areas')}))
    mission['attempt_id'] = mission.get('attempt_id', 1) + 1
    mission['recovery'] = {**recovery, 'reinforcement': reinforcement.strip(), 'started_at': now()}
    mission['required_phases'] = recovery['phases']
    mission['required_seconds'] = recovery['minutes'] * 60
    mission['active_seconds'] = 0
    for phase in recovery['phases']:
        for key in ('responses', 'drafts', 'completed_at_by_phase', 'phase_checks'):
            mission.setdefault(key, {}).pop(phase, None)
    mission.pop('review', None)
    mission.pop('completed_at', None)
    return recovery


def recovery_question(content, plan, experience, index):
    original = plan['quiz'][index]
    attempts = experience.get('quiz', {}).get('recovery_answers', {})
    used = {question['question'] for question in plan['quiz']}
    used.update(item['question'] for items in attempts.values() for item in items)
    candidates = [question for question in content.get('questions', [])
                  if question.get('ae') == original.get('ae') and question.get('question') not in used]
    candidates.sort(key=lambda question: (question.get('skill') != original.get('skill'),
                                         question.get('difficulty') != original.get('difficulty'),
                                         question['question']))
    return candidates[0] if candidates else None


def migrate_awards(experience, plan, module_id):
    if 'earned_areas' in experience:
        return
    experience['earned_areas'] = []
    mission = experience.get('mission') or {}
    current = mission.get('review')
    for review in mission.get('reviews') or ([current] if current else []):
        mission['review'] = review
        sync_awards(experience, plan, module_id, legacy='attempt_id' not in review)
    if current:
        mission['review'] = current
    else:
        mission.pop('review', None)
