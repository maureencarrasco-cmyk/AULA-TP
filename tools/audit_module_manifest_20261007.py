"""Read-only manifest for the exhaustive browser walkthrough."""
import json
import sqlite3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
out = root / 'reports' / 'recorrido-451-modulos-20261007'
out.mkdir(parents=True, exist_ok=True)
(out / 'capturas').mkdir(exist_ok=True)
with sqlite3.connect((root/'data/aulatp.sqlite3').as_uri()+'?mode=ro', uri=True) as db:
    db.row_factory = sqlite3.Row
    rows = [dict(r) for r in db.execute('SELECT m.id,m.course_id,m.title,m.position,c.title AS course,c.specialty FROM modules m JOIN courses c ON c.id=m.course_id ORDER BY c.id,m.position,m.id')]
assert len(rows)==451 and len({r['course_id'] for r in rows})==45
(out/'manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(dict(modules=len(rows),courses=45,path=str(out/'manifest.json')),ensure_ascii=True))
