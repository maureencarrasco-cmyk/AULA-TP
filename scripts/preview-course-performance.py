"""Preview against a consistent copy, never changing the running campus database."""
import json
import sqlite3
import sys
import tempfile
import time
from contextlib import closing
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from app import create_app

with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as directory:
    database = str(Path(directory) / 'preview.sqlite3')
    with closing(sqlite3.connect((ROOT / 'data/aulatp.sqlite3').as_uri() + '?mode=ro', uri=True)) as original, closing(sqlite3.connect(database)) as copied:
        original.backup(copied)
    with patch('app.upgrade_catalog'):
        app = create_app({'DATABASE': database, 'SECRET_KEY': 'isolated-performance-preview'})
    client = app.test_client()
    client.get('/api/session')
    runs = []
    for _ in range(3):
        start = time.perf_counter()
        response = client.get('/api/courses?compact=1')
        assert response.status_code == 200
        runs.append(round(time.perf_counter() - start, 4))
    report = {'compact_catalog_seconds': runs, 'courses': len(response.json), 'modules': sum(len(course['modules']) for course in response.json), 'response_bytes': len(response.data)}
    output = ROOT / 'reports/courses-performance-20261011'
    output.mkdir(parents=True, exist_ok=True)
    (output / 'measurements.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report), flush=True)
    if '--serve' in sys.argv:
        app.run(host='127.0.0.1', port=8102, debug=False)
