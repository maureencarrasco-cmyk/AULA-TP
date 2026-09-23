"""Record the official study-plan excerpts for curricular review.

The output is evidence, not generated lessons: PDF text extraction is imperfect
and module titles, mentions, OA and AE require verification before publication.
"""

import json
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'docs/fuentes/tp-programas'


def plan_excerpt(reader):
    plans = []
    for number, page in enumerate(reader.pages[:45], 1):
        text = page.extract_text() or ''
        normalized = re.sub(r'[^A-Z]', '', text.upper())
        if 'PLANDEEST' not in normalized:
            continue
        if 'NOMBREDELM' not in normalized or 'TOTAL' not in normalized:
            continue
        lines = text.splitlines()
        start = next((i for i, line in enumerate(lines) if 'PLAN DE EST' in line.upper()), 0)
        end = next((i for i in range(start, len(lines)) if re.search(r'\bTotal\b', lines[i], re.I)), len(lines) - 1)
        plans.append({'pdf_page': number, 'text': '\n'.join(lines[start:end + 1])})
    return plans


def main():
    manifest = json.loads((DEST / 'manifest.json').read_text(encoding='utf-8'))
    result = []
    for item in manifest:
        reader = PdfReader(ROOT / item['pdf'], strict=False)
        plans = plan_excerpt(reader)
        result.append({
            'slug': item['slug'],
            'source_url': item['pdf_url'],
            'pdf_pages': len(reader.pages),
            'plans': plans,
            'review_status': 'Pendiente de cotejo humano de menciones, OA, AE y criterios',
        })
        print(item['slug'], len(reader.pages), len(plans), flush=True)
    (DEST / 'study-plans.json').write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
    )


if __name__ == '__main__':
    main()
