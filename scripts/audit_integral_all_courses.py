"""Extract the master audit prompt and inventory every Aula TP course."""

import json
import sqlite3
import sys
import zipfile
from collections import defaultdict
from datetime import date
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / 'scripts'))

from instructional_quality import contract_is_complete
from pedagogy import enrich, publication_gaps
from audit_all_courses import activities, bank_has_variety, source_is_traceable
from audit_draft_readiness import inspect_module

PROMPT_DOCX = Path(r'C:\Users\Martín\Downloads\1_Prompt_Maestro_Auditoria_Integral_Aula_TP.docx')
W_NS = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'


def extract_docx(path):
    with zipfile.ZipFile(path) as archive:
        xml = archive.read('word/document.xml')
    root = ET.fromstring(xml)
    paragraphs = []
    for paragraph in root.iter(f'{W_NS}p'):
        text = ''.join(node.text or '' for node in paragraph.iter(f'{W_NS}t'))
        paragraphs.append(text)
    return '\n'.join(paragraphs).strip() + '\n'


def pct(passed, total):
    return round(100 * passed / total, 1) if total else None


def audit_published_module(row):
    content = enrich(json.loads(row['content']), row['position'])
    p1 = p1t = p2 = p2t = p4 = p4t = p5 = p5t = p6 = p6t = p7 = p7t = 0
    for _key, _station, contract, didactic in activities(content):
        complete = contract_is_complete(contract)
        mapped = bool(contract and contract.get('ae') and contract.get('criterion'))
        p1 += int(complete and mapped)
        p1t += 1
    for kind in ('cases', 'questions'):
        p2 += int(bank_has_variety(content.get(kind)))
        p2t += 1
    expected_url = (content.get('curriculum') or {}).get('url')
    source = content.get('specialty_source') or content.get('official_source') or {}
    p4 += int(bool(source))
    p4t += 1
    for kind in ('cases', 'questions'):
        for item in content.get(kind) or []:
            p4 += int(source_is_traceable(item, row['specialty'], expected_url))
            p4t += 1
            if item.get('image'):
                p7 += int(bool(str(item.get('alt') or '').strip()))
                p7t += 1
    for medium in content.get('media_audit') or []:
        p5 += int(all(medium.get(field) for field in ('medio', 'tipo', 'lugar', 'criterio', 'sentido')))
        p5t += 1
    architecture = [
        len(content.get('aes') or []) >= 2,
        len(content.get('cases') or []) == 15,
        bool(content.get('agent_hints')),
        bool(content.get('practice')),
        bool(content.get('feedback_instruction')),
    ]
    p6 += sum(architecture)
    p6t += len(architecture)
    gaps = publication_gaps(content, row['specialty'])
    return {
        'p1': pct(p1, p1t), 'p2': pct(p2, p2t), 'p4': pct(p4, p4t),
        'p5': pct(p5, p5t) if p5t else None, 'p6': pct(p6, p6t),
        'p7': pct(p7, p7t) if p7t else None,
        'p8_ok': not gaps,
        'gaps': len(gaps),
    }


def main():
    prompt = extract_docx(PROMPT_DOCX)
    prompt_path = ROOT / 'docs' / 'PROMPT_MAESTRO_AUDITORIA_INTEGRAL.txt'
    prompt_path.write_text(prompt, encoding='utf-8')

    with sqlite3.connect(ROOT / 'data' / 'aulatp.sqlite3') as con:
        con.row_factory = sqlite3.Row
        courses = list(con.execute('SELECT id,title,specialty,level FROM courses ORDER BY id'))
        snapshot = []
        for course in courses:
            modules = list(con.execute(
                'SELECT id,title,position,published,content FROM modules WHERE course_id=? ORDER BY position,id',
                (course['id'],),
            ))
            pub = sum(1 for row in modules if row['published'])
            draft_checks = []
            published_checks = []
            oa = ae_ok = unique_min = unique_max = 0
            unique_values = []
            for module in modules:
                content = json.loads(module['content'] or '{}')
                if module['published']:
                    published_checks.append(audit_published_module({
                        'content': module['content'],
                        'position': module['position'],
                        'specialty': course['specialty'],
                    }))
                else:
                    info = inspect_module(content)
                    draft_checks.append(info)
                    oa += int(info['oa'])
                    ae_ok += int(info['ae'])
                    unique_values.append(info['unique_exam_stimuli'])
            status = 'publicado' if modules and pub == len(modules) else (
                'parcial' if pub else 'borrador'
            )
            snapshot.append({
                'id': course['id'],
                'title': course['title'],
                'specialty': course['specialty'],
                'level': course['level'],
                'modules': len(modules),
                'published_modules': pub,
                'status': status,
                'oa': oa,
                'ae_ok': ae_ok,
                'unique_stimuli_min': min(unique_values) if unique_values else None,
                'unique_stimuli_max': max(unique_values) if unique_values else None,
                'published_p1': pct(
                    sum(1 for row in published_checks if row['p1'] == 100),
                    len(published_checks),
                ) if published_checks else None,
                'published_p8_ok': all(row['p8_ok'] for row in published_checks) if published_checks else None,
                'draft_source': sum(row['source'] for row in draft_checks) if draft_checks else None,
                'draft_visuals_3d': sum(row['visuals_3d'] for row in draft_checks) if draft_checks else None,
                'draft_assessment_images': sum(row['assessment_images'] for row in draft_checks) if draft_checks else None,
                'draft_assessment_total': sum(row['assessment_total'] for row in draft_checks) if draft_checks else None,
            })

    counts = defaultdict(int)
    for row in snapshot:
        counts[row['status']] += 1
        counts['modules'] += row['modules']
        counts['published_modules'] += row['published_modules']
    payload = {
        'date': date.today().isoformat(),
        'prompt_file': str(prompt_path),
        'prompt_chars': len(prompt),
        'prompt_head': prompt[:4000],
        'courses': snapshot,
        'totals': dict(counts),
        'course_count': len(snapshot),
    }
    out = ROOT / 'docs' / 'auditoria_integral_snapshot.json'
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'prompt {len(prompt)} chars -> {prompt_path}')
    print(f'{len(snapshot)} courses -> {out}')
    print('status', dict(counts))


if __name__ == '__main__':
    main()
