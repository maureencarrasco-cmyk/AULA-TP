"""Apply the authorized, audited repairs with a recoverable SQLite backup."""
import copy
import datetime
import hashlib
import json
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from hospitality_question_repair import repair_repeated_questions, signature
from pedagogy import enrich

OUT = ROOT / 'reports/microauditoria-actividades-20261008'
alerts = list(__import__('csv').DictReader((OUT/'hallazgos-documentales.csv').open(encoding='utf-8-sig')))
targets = {int(h['Modulo_ID']) for h in alerts}
expected = {mid: {i for h in alerts if int(h['Modulo_ID']) == mid
                  for i in json.loads(h['Actividad'].split('indices ')[1])[1:]} for mid in targets}

def protected(db):
    result = {}
    for (name,) in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name!='modules' ORDER BY name"):
        rows = db.execute('SELECT * FROM "'+name.replace('"','""')+'"').fetchall()
        result[name] = hashlib.sha256(repr(rows).encode()).hexdigest()
    return result

stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
backup = ROOT/'backups'/f'before-duplicate-question-repair-{stamp}.sqlite3'
db = sqlite3.connect(ROOT/'data/aulatp.sqlite3', timeout=60)
with sqlite3.connect(backup) as saved:
    db.backup(saved)
changes = []
try:
    db.execute('BEGIN IMMEDIATE')
    safe = protected(db)
    before = db.execute('SELECT id,course_id,title,position,published,content FROM modules ORDER BY id').fetchall()
    replacements = {}
    for mid, cid, title, position, published, raw in before:
        if mid not in targets:
            continue
        original = json.loads(raw)
        content = copy.deepcopy(original)
        indices = repair_repeated_questions(content)
        if not indices:
            indices = sorted(expected[mid])
            for i in indices:
                assert content['questions'][i]['question'].startswith(('El registro cita', 'Dos versiones del registro', 'El registro marca'))
                content['questions'][i]['table'] = []
                content['questions'][i]['formula'] = ''
        assert set(indices) == expected[mid], (mid, indices, expected[mid])
        for i in indices:
            old, new = original['questions'][i], content['questions'][i]
            for field in ('id','answer','ae','criterion','source_url','image'):
                assert new.get(field) == old.get(field), (mid, i, field)
            changes.append(dict(Modulo_ID=mid, Modulo=title, Pregunta=i+1, Antes=old, Despues=new))
        stripped = copy.deepcopy(content)
        for i in indices:
            stripped['questions'][i] = original['questions'][i]
        assert stripped == original
        rendered = enrich(copy.deepcopy(content), position)
        qs = rendered['questions']
        assert len(qs) == len(original['questions']) == 25
        assert len({signature(q) for q in qs}) == len(qs)
        for i in indices:
            assert qs[i]['question'] == content['questions'][i]['question']
            assert qs[i]['answer'] == original['questions'][i]['answer']
        replacements[mid] = json.dumps(content, ensure_ascii=False)
        db.execute('UPDATE modules SET content=? WHERE id=?', (replacements[mid], mid))
    assert len(changes) == 29 and len(replacements) == 16
    after = db.execute('SELECT id,course_id,title,position,published,content FROM modules ORDER BY id').fetchall()
    assert len(before) == len(after) == 451
    for old, new in zip(before, after):
        assert new == old[:5]+(replacements.get(old[0], old[5]),)
    assert protected(db) == safe
    db.commit()
except Exception:
    db.rollback()
    raise
finally:
    db.close()
result = dict(Backup=str(backup), Preguntas_corregidas=len(changes), Modulos_corregidos=len(replacements),
              Autorizacion='Usuario: corrige ahora', Tablas_protegidas_sin_cambios=True, Cambios=changes)
(OUT/f'correcciones-aplicadas-{stamp}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='Cambios'},ensure_ascii=True))
