"""Module-scoped room inventories with official activity provenance."""
import json
from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=1)
def inventories():
    path = Path(__file__).with_name('city_room_resources.json')
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}


def room_setup(title, specialty, content):
    entry = next((row for row in inventories().values()
                  if row['module_title'] == title and row['specialty'] == specialty), None)
    source = content.get('specialty_source') or content.get('official_source') or {}
    curriculum = content.get('curriculum') or {}
    return {'module_title': title, 'specialty': specialty,
            'status': entry['status'] if entry else 'requires_source_review',
            'resources': entry['resources'] if entry else [],
            'curriculum_audit': entry.get('curriculum_audit') if entry else None,
            'source': {'pdf': entry['pdf'] if entry else curriculum.get('pdf'),
                       'url': entry['url'] if entry else curriculum.get('url')},
            'objectives': source.get('oa') or [],
            'learning_outcomes': [{'title': ae.get('title') or ae.get('description') or '',
                                   'criteria': ae.get('criteria') or []} for ae in content.get('aes') or []]}
