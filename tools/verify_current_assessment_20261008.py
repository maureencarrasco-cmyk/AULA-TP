"""Read-only current assessment checks, not a semantic quality score."""
import collections
import json
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from assessment_integrity import assessment_issues
from hospitality_question_repair import signature
from pedagogy import enrich

rows = []
with sqlite3.connect((ROOT / 'data/aulatp.sqlite3').as_uri() + '?mode=ro', uri=True) as db:
    db.execute('PRAGMA query_only=ON')
    for mid, cid, position, raw in db.execute('SELECT id,course_id,position,content FROM modules ORDER BY id'):
        content = enrich(json.loads(raw), position)
        signatures = collections.Counter(signature(q) for q in content.get('questions', []))
        rows.append(dict(Modulo_ID=mid, Curso_ID=cid, Preguntas=len(content.get('questions', [])),
                         Duplicados_exactos=sum(n - 1 for n in signatures.values() if n > 1),
                         Incidencias_estructura=assessment_issues(content)))
out = ROOT / 'reports/auditoria-integral-20261008/control-evaluaciones-actual.json'
out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(dict(modulos=len(rows), preguntas=sum(r['Preguntas'] for r in rows),
                      duplicados=sum(r['Duplicados_exactos'] for r in rows),
                      incidencias=sum(len(r['Incidencias_estructura']) for r in rows)), ensure_ascii=False))
