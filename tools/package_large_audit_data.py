"""Lossless publication of large audit data, preserving local originals."""
import argparse
import gzip
import hashlib
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = (
    'reports/auditoria-integral-20261008/relaciones-por-actividad.json',
    'reports/microauditoria-actividades-20261008/revision-documental.json',
)

def digest(path):
    with path.open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--unpack', action='store_true')
    args = parser.parse_args()
    for relative in FILES:
        raw = ROOT / relative
        archive = Path(str(raw) + '.gz')
        if args.unpack:
            if raw.exists():
                print(f'Preserved existing original: {relative}')
                continue
            with gzip.open(archive, 'rb') as source, raw.open('xb') as target:
                shutil.copyfileobj(source, target)
            print(f'Restored: {relative}')
        else:
            with raw.open('rb') as source, archive.open('wb') as target:
                with gzip.GzipFile(filename='', fileobj=target, mode='wb', mtime=0) as zipped:
                    shutil.copyfileobj(source, zipped)
            with gzip.open(archive, 'rb') as restored:
                restored_hash = hashlib.file_digest(restored, 'sha256').hexdigest()
            assert restored_hash == digest(raw), f'Archive mismatch: {relative}'
            print(f'Verified complete archive: {relative}.gz ({archive.stat().st_size} bytes)')

if __name__ == '__main__':
    main()
