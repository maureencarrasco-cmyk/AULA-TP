"""Encode generated context assets without changing their composition."""
import argparse
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('folder')
parser.add_argument('source', type=Path)
args = parser.parse_args()
catalog = json.loads((ROOT / 'static/headers/generated-context-catalog.json').read_text(encoding='utf-8'))
assert any(row['folder'] == args.folder for row in catalog['assets']), 'Unknown specialty'
target = ROOT / 'static/headers' / args.folder / 'e2.webp'
assert not target.exists(), 'Do not overwrite an existing asset'
target.parent.mkdir(parents=True, exist_ok=True)
with Image.open(args.source) as image:
    image.load()
    assert image.width >= 1024 and image.height >= 640
    image.convert('RGB').save(target, 'WEBP', quality=92, method=6)
    print(json.dumps({'path': str(target), 'width': image.width, 'height': image.height, 'bytes': target.stat().st_size}))
