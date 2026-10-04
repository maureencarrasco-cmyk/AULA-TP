"""Backed-up, transactional repairs of content metadata; no student mutations."""
import argparse
import datetime
import hashlib
import json
import sqlite3
import shutil
import sys
from contextlib import closing
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from content_integrity import asset_exists, repair_content_integrity
from pedagogy import MINEDUC_PAGE_INDEX, _source_key


def protected_snapshot(con):
    rows = []
    for (table,) in con.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"):
        if table != 'modules':
            data = [list(r) for r in con.execute(f'SELECT * FROM "{table}"')]
            rows.append((table, sorted(data, key=lambda r: json.dumps(r, sort_keys=True))))
    return hashlib.sha256(json.dumps(rows, sort_keys=True, default=str).encode()).hexdigest()


def repair_database(database, apply=False):
    asset_exists.cache_clear()
    con = sqlite3.connect(database)
    con.row_factory = sqlite3.Row
    changes, totals = [], {'source_references':0, 'missing_media':0, 'alternative_labels':0}
    backup_path = None
    try:
        if apply:
            required_space = Path(database).stat().st_size * 3
            if shutil.disk_usage(Path(database).resolve().parent).free < required_space:
                raise RuntimeError('Espacio insuficiente para respaldo y transaccion; libera espacio antes de aplicar cambios.')
            backup_dir = ROOT / 'backups'
            backup_dir.mkdir(exist_ok=True)
            stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f')
            backup_path = backup_dir / f'integridad-cursos-{stamp}.sqlite3'
            with closing(sqlite3.connect(backup_path)) as backup:
                con.backup(backup)
        con.execute('PRAGMA temp_store=MEMORY')
        con.execute('BEGIN IMMEDIATE' if apply else 'BEGIN')
        protected = protected_snapshot(con)
        for row in con.execute('SELECT m.id,m.content,c.specialty FROM modules m JOIN courses c ON c.id=m.course_id ORDER BY m.course_id,m.position').fetchall():
            c = json.loads(row['content'])
            c['specialty'] = row['specialty']
            # Only metadata/media/derived timing fields may change.
            keys = [(q.get('question'), q.get('options'), q.get('answer')) for q in c.get('questions') or []]
            repair_content_integrity(c, lambda pdf,title:MINEDUC_PAGE_INDEX.get(_source_key(pdf,title)))
            assert keys == [(q.get('question'), q.get('options'), q.get('answer')) for q in c.get('questions') or []]
            audit = c['integrity_audit']
            totals['source_references'] += audit['source_references_repaired']
            totals['missing_media'] += audit['missing_media_count']
            totals['alternative_labels'] += audit['alternative_labels_added']
            encoded = json.dumps(c, ensure_ascii=False)
            if encoded != row['content']:
                changes.append(row['id'])
                if apply:
                    con.execute('UPDATE modules SET content=? WHERE id=?', (encoded,row['id']))
        assert protected_snapshot(con)==protected, 'Una tabla protegida cambio.'
        if apply:
            con.commit()
        else:
            con.rollback()
        return {'applied':apply, 'changed_modules':changes, 'totals':totals,
                'backup':str(backup_path) if backup_path else None, 'protected_tables_unchanged':True}
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--database', default=str(ROOT / 'data' / 'aulatp.sqlite3'))
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    result = repair_database(args.database,args.apply)
    directory = ROOT / 'reports' / 'correcciones-integridad-20261004'
    directory.mkdir(parents=True,exist_ok=True)
    target = directory / ('aplicadas.json' if args.apply else 'preview.json')
    if args.apply and target.exists():
        target = directory / f'aplicadas-{datetime.datetime.now().strftime("%Y%m%d-%H%M%S")}.json'
    target.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=True))
