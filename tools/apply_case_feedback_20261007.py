"""Apply the authorized C01-S09 repair with backup and strict field isolation."""
import copy
import datetime
import hashlib
import json
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from case_feedback import complete_case_feedback

def snapshot(db):
    result = {}
    for (name,) in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name!='modules' ORDER BY name"):
        digest = hashlib.sha256()
        for row in db.execute('SELECT * FROM "' + name.replace('"', '""') + '"'):
            digest.update(repr(row).encode())
        result[name] = digest.hexdigest()
    return result

stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
backup = ROOT / 'backups' / f'before-case-feedback-{stamp}.sqlite3'
out = ROOT / 'reports' / 'auditoria-autorizacion-20261007'
db = sqlite3.connect(ROOT / 'data' / 'aulatp.sqlite3', timeout=60)
with sqlite3.connect(backup) as saved:
    db.backup(saved)
changes = []
try:
    db.execute('BEGIN IMMEDIATE')
    protected = snapshot(db)
    before = db.execute('SELECT id,course_id,title,position,published,content FROM modules ORDER BY id').fetchall()
    expected = {}
    for mid, cid, title, position, published, raw in before:
        if cid != 1:
            continue
        original = json.loads(raw)
        content = copy.deepcopy(original)
        indices = complete_case_feedback(content)
        if not indices:
            continue
        stripped = copy.deepcopy(content)
        for i in indices:
            changes.append(dict(Propuesta='C01-S09', Modulo_ID=mid, Modulo=title, Caso=i+1, Titulo=content['cases'][i]['title'], Antes=original['cases'][i].get('explanation'), Despues=content['cases'][i]['explanation'], Autorizacion='Usuario: aplica los cambios y corrige', Estado='CORREGIDO - campo explanation comprobado; no certifica auditoria disciplinar integral'))
            stripped['cases'][i].pop('explanation', None)
            if 'explanation' in original['cases'][i]:
                stripped['cases'][i]['explanation'] = original['cases'][i]['explanation']
        assert stripped == original, f'Unexpected field change: {mid}'
        raw_new = json.dumps(content, ensure_ascii=False)
        expected[mid] = raw_new
        db.execute('UPDATE modules SET content=? WHERE id=?', (raw_new, mid))
    assert len(changes) in (0,60), f'Unexpected repair count: {len(changes)}'
    after = db.execute('SELECT id,course_id,title,position,published,content FROM modules ORDER BY id').fetchall()
    for old, new in zip(before, after):
        assert new == old[:5] + (expected.get(old[0],old[5]),)
    assert len(before) == len(after) == 451
    assert snapshot(db) == protected, 'Protected tables changed'
    assert all(str(x.get('explanation') or '').strip() for (raw,) in db.execute('SELECT content FROM modules WHERE course_id=1') for x in json.loads(raw).get('cases',[]))
    db.commit()
except Exception:
    db.rollback()
    raise
finally:
    db.close()
result = dict(Backup=str(backup), Casos_corregidos=len(changes), Modulos_corregidos=len(expected), Tablas_protegidas_sin_cambios=True, Preguntas_alternativas_y_claves_sin_cambios=True, Cambios=changes)
(out / f'correcciones-aplicadas-{stamp}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='Cambios'},ensure_ascii=True))
