"""Stage source-linked TP modules without publishing template assessments."""

import json
import re
from copy import deepcopy
from pathlib import Path

from specialty_catalog import _ae, _module, _cases, _questions, _rotate


ROOT = Path(__file__).resolve().parent


def _contextual_scenario(dossier, index):
    place, resources, conflict, product = dossier
    evidence = f'En el contexto de {place.lower()}, {conflict} Fuentes disponibles: {resources}.'
    choices = [
        ('¿Qué debes comprobar primero?',
         f'Contrastar {resources} y registrar en qué consiste la diferencia.',
         'Elegir la versión que parezca más reciente sin comprobarla.',
         'Completar el dato faltante por intuición.',
         'Continuar sin dejar constancia de la discrepancia.',
         'La discrepancia se verifica con las fuentes disponibles antes de decidir.'),
        ('¿Qué debe quedar en el registro del caso?',
         f'El dato observado, su fuente y la diferencia que afecta al {product}.',
         'Solo una conclusión sin indicar de dónde salió el dato.',
         'Una versión corregida que borre la diferencia original.',
         'Una aprobación general sin identificar el antecedente revisado.',
         'El registro debe permitir reconstruir la evidencia y la decisión.'),
        (f'¿Cuándo puedes entregar el {product}?',
         'Cuando la diferencia esté resuelta con evidencia y la revisión correspondiente quede registrada.',
         'Cuando una de las fuentes parezca suficiente a primera vista.',
         'Antes de revisar la diferencia, para cumplir el plazo.',
         'Después de cambiar el registro sin comunicarlo.',
         'El producto requiere una comprobación trazable de la discrepancia.'),
        ('¿Qué corresponde si las fuentes siguen sin coincidir?',
         'Informar la diferencia y solicitar una definición a la persona responsable.',
         'Presentar una conclusión definitiva sin antecedentes.',
         'Eliminar una fuente para evitar la contradicción.',
         'Aplicar una solución física sin autorización ni revisión.',
         'Una diferencia sin resolver debe comunicarse con sus antecedentes.'),
        ('¿Cómo verificarías el cierre del caso?',
         f'Comparar nuevamente {resources} y comprobar que el {product} refleje la decisión autorizada.',
         'Dar el caso por cerrado porque ya existe un documento.',
         'Repetir la misma conclusión sin revisar las fuentes.',
         'Cambiar la fecha del registro para aparentar una revisión.',
         'El cierre exige contrastar el producto con las fuentes y la decisión documentada.'),
    ]
    return evidence, choices[index % len(choices)]


def contextualize_draft(content, dossier):
    """Replace template assessments with decisions grounded in this module's dossier."""
    place, resources, conflict, product = dossier
    for ae in content['aes']:
        criterion = ae['criteria'][0]
        activities = ae['experiences']
        activities[0]['prompt'] = (
            f'En {place.lower()}, revisa {resources}. {conflict} Abre los cuatro puntos, '
            f'identifica qué antecedente aporta cada uno y relaciónalo con «{criterion}».'
        )
        activities[1]['prompt'] = (
            f'Relaciona las fuentes del caso con el criterio «{criterion}», el resguardo '
            f'necesario y el registro que respaldará el {product}.'
        )
        activities[2]['prompt'] = (
            f'Ordena la revisión de {resources} antes de preparar el {product}. '
            f'La diferencia detectada es: {conflict}'
        )
        activities[3]['prompt'] = (
            f'{conflict} Al aplicar «{ae["criteria"][1] if len(ae["criteria"]) > 1 else criterion}», '
            '¿qué corresponde hacer si todavía falta un antecedente verificable?'
        )
        activities[4]['prompt'] = (
            f'Antes de entregar el {product}, ¿qué evidencia demuestra mejor '
            f'el criterio «{ae["criteria"][-1]}» con fuentes y verificación identificables?'
        )
        activities[5]['prompt'] = (
            f'Revisa tu decisión ante esta diferencia: {conflict} Explica cómo mejorarías '
            f'el {product} y comprobarías «{criterion}» sin exceder tu rol.'
        )
    for field in ('cases', 'questions'):
        for index, item in enumerate(content[field]):
            evidence, (question, correct, *wrong_and_explanation) = _contextual_scenario(dossier, index)
            options, answer = _rotate(correct, wrong_and_explanation[:3],
                                      index if field == 'cases' else index + 1)
            if field == 'cases':
                item['context'] = f'{evidence} Relaciona tu decisión con «{item["criterion"]}».'
                item['question'] = question
            else:
                item['stimulus'] = evidence
                item['question'] = f'Caso simulado {index + 1}: {question} Criterio: «{item["criterion"]}».'
            item['options'] = options
            item['answer'] = answer
            item['explanation'] = wrong_and_explanation[3]
    content['specialty_source']['assessment_context'] = 'module_dossier'
    media = [item for item in content['cases'] + content['questions']]
    media.extend([content['scene']])
    media.extend([row['task'] for row in content['formative_pack']])
    missing = False
    for item in media:
        value = item.get('image')
        if value and not (ROOT / value.split('?', 1)[0].lstrip('/')).is_file():
            item['image'] = None
            missing = True
    if missing:
        content['specialty_source']['media_status'] = 'pending_assets'
    return content


def sync_draft_context(con, module_id, raw_content, desired):
    current = json.loads(raw_content or '{}')
    if not str(current.get('version', '')).endswith('-mineduc-draft-v1'):
        return
    if current.get('cases') == desired.get('cases') and current.get('questions') == desired.get('questions'):
        return
    source = current.get('specialty_source') or {}
    old_module = {'title': source.get('title'), 'aes': current.get('aes'),
                  'specialty_key': current.get('specialty_key')}
    key = current.get('specialty_key')
    old_cases = _cases(old_module, f'/static/headers/{key}/e3.png?v=3')
    old_questions = _questions(old_module, f'/static/headers/{key}/e4.png?v=3')
    if current.get('cases') != old_cases or current.get('questions') != old_questions:
        return
    current['cases'] = desired['cases']
    current['questions'] = desired['questions']
    current['specialty_source'].update({
        name: desired['specialty_source'][name]
        for name in ('assessment_context', 'media_status')
        if name in desired['specialty_source']
    })
    for name in ('scene', 'formative_pack'):
        old = current.get(name)
        new = desired.get(name)
        if old and new:
            if name == 'scene' and old.get('image') == f'/static/headers/{key}/e3.png?v=3':
                old['image'] = new.get('image')
            if name == 'formative_pack':
                for old_row, new_row in zip(old, new):
                    if old_row.get('task', {}).get('image') == f'/static/headers/{key}/e3.png?v=3':
                        old_row['task']['image'] = new_row['task'].get('image')
    con.execute('UPDATE modules SET content=? WHERE id=?',
                (json.dumps(current, ensure_ascii=False), module_id))


def sync_draft_activities(con, module_id, raw_content, desired):
    """Contextualize only untouched generated AE activities in unpublished drafts."""
    current = json.loads(raw_content or '{}')
    if not str(current.get('version', '')).endswith('-mineduc-draft-v1'):
        return
    changed = False
    for old_ae, new_ae in zip(current.get('aes', []), desired['aes']):
        if old_ae.get('official_code') != new_ae['official_code']:
            continue
        template = _ae(old_ae['official_code'], old_ae['title'], old_ae['criteria'])['experiences']
        for old_activity, template_activity, new_activity in zip(
                old_ae.get('experiences', []), template, new_ae['experiences']):
            if old_activity == template_activity:
                old_activity.update(new_activity)
                changed = True
    if changed:
        con.execute('UPDATE modules SET content=? WHERE id=?',
                    (json.dumps(current, ensure_ascii=False), module_id))


def sync_official_oa(con, module_id, raw_content, official_oa):
    """Repair only the earlier extractor's merged OA text in unpublished drafts."""
    content = json.loads(raw_content or '{}')
    if not str(content.get('version', '')).endswith('-mineduc-draft-v1'):
        return
    source = content.get('specialty_source') or {}
    current = source.get('oa') or []
    by_code = {row.get('code'): row for row in current}
    merged = []
    for row in official_oa:
        old = by_code.get(row['code'])
        if old and not re.search(r'\bOA\s+\d+\.', old.get('title', '')):
            merged.append(old)
        else:
            merged.append(row)
    merged.extend(row for row in current if row.get('code') not in {item['code'] for item in official_oa})
    if merged != current:
        source['oa'] = merged
        con.execute('UPDATE modules SET content=? WHERE id=?',
                    (json.dumps(content, ensure_ascii=False), module_id))


def build_draft(rows, dossiers, specialty, key, source):
    if not rows or len(rows) != len(dossiers):
        raise ValueError(f'Incomplete {specialty} plan or contextual dossiers')
    total_hours = sum(item['hp'] for item in rows)
    scope = (f'Plan de {specialty} de 3° y 4° medio: '
             f'{len(rows)} módulos y {total_hours} horas pedagógicas oficiales.')
    for position, (item, dossier) in enumerate(zip(rows, dossiers), 1):
        if item['position'] != position or not item['aes'] or not item['source_page']:
            raise ValueError(f'Incomplete official data for {specialty} module {position}')
        place, resources, conflict, product = dossier
        aes = []
        for row in item['aes']:
            if not row['criteria']:
                raise ValueError(f'Missing official criteria for {specialty} {row["code"]}')
            ae = _ae(row['code'], row['title'], row['criteria'])
            ae['official_title'] = row['title']
            ae['criteria_origin'] = f'Currículum Nacional MINEDUC, módulo de {specialty}.'
            ae['lesson'] = [
                row['title'],
                f'En {place.lower()}, analiza {resources}. {conflict}',
                f'Relaciona el {product} con un criterio de evaluación oficial.',
            ]
            ae['example'] = f'{conflict} Revisa {resources} y entrega un {product}.'
            aes.append(ae)
        content = _module(position, item['title'], item['hp'], aes, key,
                          source, item['source_pdf'], scope, oa=item['oa'],
                          year=item['year'], plan_section='Plan de Estudio MINEDUC')
        content['specialty'] = specialty
        content['context'] = f'{place}. {conflict} Dispones de {resources}. Producto: {product}.'
        content['application'] = f'Caso simulado de {place.lower()}; contrasta {resources} antes de entregar el {product}.'
        content['development'] = (
            f'{conflict} Usa {resources}, identifica el AE y criterio oficial '
            f'correspondiente y prepara el {product} con evidencia de verificación.'
        )
        content['reflection_prompt'] = f'¿Qué evidencia en {resources} respalda el {product} y qué falta comprobar?'
        content['curriculum']['url'] = item['source_page']
        content['specialty_source']['source_page'] = item['source_page']
        content['specialty_source']['official_criteria_count'] = sum(len(ae['criteria']) for ae in item['aes'])
        contextualize_draft(content, dossier)
        content['bibliography'] = [{
            'author': 'Ministerio de Educación de Chile',
            'work': f'Programa de Estudio de la especialidad {specialty}',
            'year': 2015,
            'concept': 'Módulo, horas, OA, AE y criterios de evaluación',
            'application': item['title'],
            'url': item['source_page'],
        }]
        content['version'] = f'{key}-mineduc-draft-v1'
        yield item, content


def install_draft(con, title, modules):
    course = con.execute('SELECT id FROM courses WHERE title=?', (title,)).fetchone()
    if not course:
        return
    for item, content in modules:
        existing = con.execute('SELECT id,published,content FROM modules WHERE course_id=? AND position=?',
                               (course['id'], item['position'])).fetchone()
        if existing:
            if not existing['published']:
                sync_official_oa(con, existing['id'], existing['content'], item['oa'])
                refreshed = con.execute('SELECT content FROM modules WHERE id=?', (existing['id'],)).fetchone()
                sync_draft_context(con, existing['id'], refreshed['content'], content)
                refreshed = con.execute('SELECT content FROM modules WHERE id=?', (existing['id'],)).fetchone()
                sync_draft_activities(con, existing['id'], refreshed['content'], content)
            continue
        con.execute('INSERT INTO modules(course_id,title,position,published,content) VALUES(?,?,?,?,?)',
                    (course['id'], item['title'], item['position'], 0,
                     json.dumps(content, ensure_ascii=False)))


def install_course(con, title, modules, draft_version, published_version):
    """Publish a source-linked draft only after every module passes quality checks."""
    from pedagogy import enrich, publication_gaps

    course = con.execute('SELECT id FROM courses WHERE title=?', (title,)).fetchone()
    if not course:
        return
    for item, source_content in modules:
        content = deepcopy(source_content)
        content['version'] = published_version
        enrich(content, item['position'])
        gaps = publication_gaps(content, title)
        if gaps:
            raise ValueError(f'{title} módulo {item["position"]} no publicable: {gaps[:3]}')
        existing = con.execute(
            'SELECT id,content FROM modules WHERE course_id=? AND position=?',
            (course['id'], item['position']),
        ).fetchone()
        serialized = json.dumps(content, ensure_ascii=False)
        if existing:
            previous = json.loads(existing['content'] or '{}')
            if previous.get('version') not in (draft_version, published_version):
                continue
            con.execute(
                'UPDATE modules SET title=?,published=1,content=? WHERE id=?',
                (item['title'], serialized, existing['id']),
            )
        else:
            con.execute(
                'INSERT INTO modules(course_id,title,position,published,content) VALUES(?,?,?,?,?)',
                (course['id'], item['title'], item['position'], 1, serialized),
            )
