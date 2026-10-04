"""Structural assessment checks; not a substitute for disciplinary review."""


def assessment_issues(content):
    issues = []
    aes = content.get('aes') or []
    for section in ('questions', 'cases'):
        for index, item in enumerate(content.get(section) or []):
            location = f'{section}[{index}]'
            def record(code):
                issues.append({'location': location, 'code': code})
            if not isinstance(item, dict):
                record('invalid_item')
                continue
            options = item.get('options')
            if not isinstance(options, list) or len(options) < 2:
                record('missing_options')
                options = []
            if any(not isinstance(option, str) or not option.strip() for option in options):
                record('empty_option')
            normalized = [' '.join(option.split()).casefold() for option in options if isinstance(option, str)]
            if len(normalized) != len(set(normalized)):
                record('duplicate_options')
            answer = item.get('answer')
            if type(answer) is not int or answer not in range(len(options)):
                record('invalid_answer_index')
            ae = item.get('ae')
            if type(ae) is not int or ae not in range(len(aes)):
                record('invalid_ae_index')
            prompt = item.get('question') if section == 'questions' else item.get('situation') or item.get('question') or item.get('title')
            if not isinstance(prompt, str) or not prompt.strip():
                record('missing_prompt')
            if section == 'questions' and not str(item.get('explanation') or '').strip():
                record('missing_explanation')
    return issues


def learning_coverage_issues(content):
    issues = []
    for index, ae in enumerate(content.get('aes') or []):
        location = f'aes[{index}]'
        if not ae.get('criteria'):
            issues.append({'location': location, 'code': 'missing_criteria'})
        formative = any(item.get('ae') == index for item in content.get('cases') or [])
        formative = formative or any(item.get('type') == 'choice' for item in ae.get('experiences') or [])
        if not formative:
            issues.append({'location': location, 'code': 'missing_formative_assessment'})
        if not any(item.get('ae') == index for item in content.get('questions') or []):
            issues.append({'location': location, 'code': 'missing_final_assessment'})
    return issues
