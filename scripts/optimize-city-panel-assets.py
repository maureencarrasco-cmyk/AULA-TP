"""Encode the original panel artwork for delivery without changing its dimensions."""
import json
from pathlib import Path
from PIL import Image

assets = Path(__file__).resolve().parents[1] / 'city-panel' / 'assets'
report = []
for name in ('city-header-reference', 'panel-reference'):
    source, target = assets / (name + '.png'), assets / (name + '.webp')
    with Image.open(source) as artwork:
        artwork.save(target, format='WEBP', quality=90, method=6)
        dimensions = artwork.size
    report.append({'asset': target.name, 'dimensions': dimensions,
                   'before_bytes': source.stat().st_size, 'after_bytes': target.stat().st_size})
print(json.dumps(report, indent=2))
