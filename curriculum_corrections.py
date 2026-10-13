"""Exact restorations verified against original MINEDUC PDF tables."""
import json
from pathlib import Path

CORRECTIONS = json.loads(Path(__file__).with_suffix('.json').read_text(encoding='utf-8'))
TITLES = {row['old']: row['new'] for row in CORRECTIONS}
SOURCES = [
    ('instalaciones-sanitarias', 49), ('instalaciones-sanitarias', 80),
    ('tripulacion-naves-mercantes-especiales', 95),
    ('atencion-parvulos', 58), ('atencion-parvulos', 59),
    ('atencion-parvulos', 69), ('atencion-parvulos', 117),
    ('atencion-parvulos', 119), ('atencion-parvulos', 121),
    ('atencion-parvulos', 141), ('atencion-parvulos', 142),
]


def restore_original_ae(content):
    for ae in content.get('aes', []):
        row = next((item for item in CORRECTIONS if ae.get('title') in (item['old'], item['new'])), None)
        short = ae.get('short_title')
        if row and isinstance(short, str) and short.strip() and row['old'].startswith(short.rstrip()):
            limit = min(84, len(short.rstrip()))
            prefix = row['new'][:limit]
            if len(row['new']) > limit and row['new'][limit].isalnum() and prefix[-1].isalnum():
                prefix = prefix.rsplit(' ', 1)[0]
            ae['short_title'] = prefix.strip()
        for field in ('title', 'description'):
            value = ae.get(field)
            if isinstance(value, str) and value in TITLES:
                ae[field] = TITLES[value]
        for experience in ae.get('experiences', []) + ae.get('learning_sequence', []):
            value = experience.get('title')
            if isinstance(value, str) and value in TITLES:
                experience['title'] = TITLES[value]
    return content
