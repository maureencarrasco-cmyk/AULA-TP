"""Stage source-linked TP modules without publishing template assessments."""

import json
import re

from specialty_catalog import _ae, _module


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
            continue
        con.execute('INSERT INTO modules(course_id,title,position,published,content) VALUES(?,?,?,?,?)',
                    (course['id'], item['title'], item['position'], 0,
                     json.dumps(content, ensure_ascii=False)))
