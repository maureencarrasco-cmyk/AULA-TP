"""Read-only documentary comparison; matches are not pedagogical certification."""
import argparse
import hashlib
import json
import re
import sqlite3
import unicodedata
from pathlib import Path

def normalize(text):
    text = re.sub(r'^\s*\d+(?:\.\d+)*\s*[.:-]?\s*', '', str(text or ''))
    text = unicodedata.normalize('NFKD', text).casefold()
    return ''.join(ch for ch in text if ch.isalnum())


def audit(root, previous=None):
    from pypdf import PdfReader
    root = root.resolve()
    database = root / 'data' / 'aulatp.sqlite3'
    cache = {}
    prior={item['module_id']:item for item in (previous or {}).get('modules',[])}
    fingerprints={}
    result = []
    with sqlite3.connect(database.as_uri() + '?mode=ro', uri=True) as connection:
        rows = connection.execute('SELECT c.title,m.id,m.title,m.content FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.published=1 ORDER BY c.id,m.position')
        for course, mid, title, raw in rows:
            content = json.loads(raw)
            content_hash=hashlib.sha256(raw.encode('utf-8')).hexdigest()
            source = content.get('official_source') or {}
            if not isinstance(source, dict): source = {}
            pdf = str(source.get('pdf') or (content.get('curriculum') or {}).get('pdf') or '')
            path = (root / pdf).resolve()
            if pdf and path.is_relative_to(root) and path.is_file():
                if pdf not in fingerprints:fingerprints[pdf]=hashlib.sha256(path.read_bytes()).hexdigest()
                saved=prior.get(mid)
                if saved and saved.get('content_sha256')==content_hash and saved.get('sha256')==fingerprints[pdf] and all(item.get('reason') not in ('PdfReadError','ValueError','TypeError') for item in saved['comparisons']):
                    result.append(saved)
                    continue
            error = None
            if not pdf or not path.is_relative_to(root) or not path.is_file():
                error = 'Fuente local no disponible dentro del proyecto'
            elif pdf not in cache:
                try:
                    try:
                        pages = [normalize(page.extract_text() or '') for page in PdfReader(path).pages]
                    except Exception:
                        import pdfplumber
                        with pdfplumber.open(path) as document:
                            pages=[normalize(page.extract_text() or '') for page in document.pages]
                    cache[pdf] = {'pages': pages, 'combined': ''.join(pages), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
                except Exception as exc:
                    cache[pdf] = {'error': type(exc).__name__}
            document = cache.get(pdf, {})
            error = error or document.get('error')
            comparisons = []
            for ae in content.get('aes') or []:
                if not isinstance(ae, dict): continue
                items = [('AE', ae.get('title') or '')]
                for criterion in ae.get('criteria') or []:
                    if isinstance(criterion, dict): criterion = criterion.get('text') or criterion.get('description') or criterion.get('title') or ''
                    items.append(('Criterio', criterion))
                for kind, text in items:
                    needle = normalize(text)
                    pages = [] if error or len(needle) < 20 else [i + 1 for i, page in enumerate(document['pages']) if needle in page]
                    matched = bool(pages) or (not error and len(needle) >= 20 and needle in document['combined'])
                    comparisons.append({'type': kind, 'ae': ae.get('official_code') or ae.get('code'), 'text': text,
                        'status': 'coincidencia_documental' if matched else 'requiere_revision', 'pdf_pages': pages,
                        'reason': error or (None if matched else 'Sin coincidencia exacta en texto extraido; puede ser adaptacion o problema de extraccion')})
            result.append({'course': course, 'module_id': mid, 'module': title, 'pdf': pdf, 'sha256': document.get('sha256'), 'content_sha256':content_hash,'comparisons': comparisons})
    checks = [item for module in result for item in module['comparisons']]
    return {'scope': 'Comparacion textual, no validacion curricular ni pedagogica. Base leida sin escrituras.',
        'summary': {'courses': len({row['course'] for row in result}), 'modules': len(result), 'sources': len({row['pdf'] for row in result if row['pdf']}),
                    'checks': len(checks), 'matches': sum(row['status'] == 'coincidencia_documental' for row in checks),
                    'review': sum(row['status'] != 'coincidencia_documental' for row in checks)}, 'modules': result}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    previous=json.loads(args.output.read_text(encoding='utf-8')) if args.output.exists() else None
    report = audit(args.root,previous)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report['summary']))
