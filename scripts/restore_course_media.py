"""Recover missing original specialty assets without overwriting working files."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'a13a081'


def restore():
    names = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', SOURCE,
                                     '--', 'static/headers'], cwd=ROOT, text=True).splitlines()
    recovered = []
    for name in names:
        target = (ROOT / name).resolve()
        if not target.is_relative_to((ROOT / 'static/headers').resolve()):
            raise ValueError(name)
        if target.exists() or target.suffix not in ('.webp', '.json'):
            continue
        data = subprocess.check_output(['git', 'show', f'{SOURCE}:{name}'], cwd=ROOT)
        if target.suffix == '.webp' and not (data[:4] == b'RIFF' and data[8:12] == b'WEBP'):
            raise ValueError(f'Invalid WebP: {name}')
        if target.suffix == '.json':
            json.loads(data)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        recovered.append({'path': name, 'sha256': hashlib.sha256(data).hexdigest(),
                          'bytes': len(data)})
    out = ROOT / 'reports/correcciones-integridad-20261004/recursos-recuperados.json'
    previous = json.loads(out.read_text(encoding='utf-8')) if out.exists() else {'files': []}
    known = {f['path']: f for f in previous['files']}
    known.update({f['path']: f for f in recovered})
    result = {'source_commit': SOURCE, 'files': list(known.values()),
              'restored_images': sum(f['path'].endswith('.webp') for f in known.values()),
              'disciplinary_validation': 'PENDIENTE; recuperacion de originales, no certificacion tecnica'}
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'new_files': len(recovered), 'restored_images': result['restored_images']}))


if __name__ == '__main__':
    restore()
