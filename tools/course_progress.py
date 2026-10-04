"""Measured local media availability, separate from pedagogical certification."""
import collections
import datetime
import json
import sqlite3
import sys
from contextlib import closing
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from content_integrity import MEDIA_FIELDS, asset_exists


def inventory(value, counts, pending):
    if isinstance(value, list):
        for item in value:
            inventory(item, counts, pending)
    elif isinstance(value, dict):
        missing = value.get('unavailable_media') or {}
        for field in MEDIA_FIELDS:
            src = value.get(field)
            if isinstance(src, str) and src.startswith('/static/'):
                counts['available' if asset_exists(src) else 'pending'] += 1
                if not asset_exists(src):
                    pending.add(src.split('?')[0])
            elif field in missing:
                counts['pending'] += 1
                pending.add('/' + missing[field]['path'].split('?')[0].lstrip('/'))
        for key, item in value.items():
            if key not in ('integrity_audit', 'unavailable_media', 'restored_media', 'replaced_media', 'time_audit'):
                inventory(item, counts, pending)


def main():
    courses = {}
    with closing(sqlite3.connect(f'file:{ROOT / "data/aulatp.sqlite3"}?mode=ro', uri=True)) as db:
        for title, raw in db.execute('SELECT c.title,m.content FROM courses c JOIN modules m ON m.course_id=c.id ORDER BY c.title,m.position'):
            entry = courses.setdefault(title, {'counts': collections.Counter(), 'paths': set()})
            entry['counts']['modules'] += 1
            inventory(json.loads(raw), entry['counts'], entry['paths'])
    rows = []
    for title, entry in courses.items():
        counts = entry['counts']
        total = counts['available'] + counts['pending']
        rows.append({'course': title, **dict(counts), 'registered_references': total,
                     'media_percent': round(100 * counts['available'] / total, 1) if total else None,
                     'missing_files': sorted(entry['paths']), 'overall_quality_percent': None})
    available = sum(r.get('available', 0) for r in rows)
    total = sum(r['registered_references'] for r in rows)
    report = {'checked_at': datetime.datetime.now().isoformat(timespec='seconds'),
              'metric': 'Disponibilidad de recursos locales: referencias disponibles / referencias registradas.',
              'overall_pedagogical_certification': False,
              'overall_media_percent': round(100 * available / total, 1), 'courses': rows}
    out = ROOT / 'reports/correcciones-integridad-20261004'
    (out / 'porcentajes.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    lines = ['# Avance verificable por curso', '', report['metric'], '',
             'El porcentaje NO certifica calidad pedagogica, exactitud tecnica ni funcionamiento completo.',
             'El cumplimiento integral sigue pendiente de revision disciplinar, recursos y cronometraje.', '',
             '| Curso | Recursos disponibles | Pendientes | Disponibilidad |', '| --- | ---: | ---: | ---: |']
    for row in rows:
        lines.append(f'| {row["course"]} | {row.get("available",0)} | {row.get("pending",0)} | {row["media_percent"]}% |')
    lines += ['', f'Disponibilidad global: {report["overall_media_percent"]}%.', '',
              'Las referencias repetidas cuentan por su uso en las actividades; no son archivos unicos.']
    (out / 'porcentajes.md').write_text('\n'.join(lines), encoding='utf-8')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()
