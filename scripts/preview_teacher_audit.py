import os
import tempfile
import argparse
import sqlite3
from pathlib import Path
from unittest.mock import patch

from app import create_app

os.environ['AULATP_DATA'] = tempfile.mkdtemp(prefix='aulatp-audit-preview-')
os.environ['AULATP_PREVIEW'] = '1'
parser=argparse.ArgumentParser()
parser.add_argument('--catalog-root',type=Path)
args=parser.parse_args()
with patch('app.upgrade_catalog'):
    app = create_app()
if args.catalog_root:
    source=(args.catalog_root.resolve()/'data'/'aulatp.sqlite3').as_uri()+'?mode=ro'
    with sqlite3.connect(source,uri=True) as incoming, sqlite3.connect(app.config['DATABASE']) as outgoing:
        outgoing.execute('PRAGMA foreign_keys=ON')
        for row in incoming.execute('SELECT id,title,specialty,level FROM courses'):
            outgoing.execute('INSERT INTO courses(id,title,specialty,level) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,specialty=excluded.specialty,level=excluded.level',row)
        for row in incoming.execute('SELECT id,course_id,title,position,published,content FROM modules'):
            outgoing.execute('INSERT INTO modules(id,course_id,title,position,published,content) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET course_id=excluded.course_id,title=excluded.title,position=excluded.position,published=excluded.published,content=excluded.content',row)
app.run(host='127.0.0.1', port=8097, debug=False)
