"""Download the 35 MINEDUC TP programs and record their official sources."""

import json
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
INDEX = 'https://www.curriculumnacional.cl/inicio/Curriculum/Programas_de_Estudio/TP'
DEST = ROOT / 'docs' / 'fuentes' / 'tp-programas'


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            href = dict(attrs).get('href')
            if href:
                self.hrefs.append(href)


def download(url):
    request = Request(url, headers={'User-Agent': 'AulaTPChile-curriculum-verification/1.0'})
    with urlopen(request, timeout=90) as response:
        return response.read()


def links(html):
    parser = Links()
    parser.feed(html.decode('utf-8', errors='replace'))
    return parser.hrefs


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    paths = list(dict.fromkeys(path for path in links(download(INDEX)) if path.startswith('/recursos/programa-estudio-especialidad-')))
    if len(paths) != 35:
        raise RuntimeError(f'Expected 35 official programs, found {len(paths)}')
    manifest = []
    for path in paths:
        slug = path.rsplit('/', 1)[-1].removeprefix('programa-estudio-especialidad-')
        resource_url = urljoin(INDEX, path)
        pdf_links = [urljoin(resource_url, href) for href in links(download(resource_url)) if href.endswith('_programa.pdf')]
        pdf_links = list(dict.fromkeys(pdf_links))
        if len(pdf_links) != 1:
            raise RuntimeError(f'{slug}: expected one official PDF, found {len(pdf_links)}')
        target = DEST / f'{slug}.pdf'
        if not target.exists():
            pdf = download(pdf_links[0])
            if not pdf.startswith(b'%PDF-'):
                raise RuntimeError(f'{slug}: downloaded content is not a PDF')
            target.write_bytes(pdf)
        manifest.append({'slug': slug, 'resource_url': resource_url, 'pdf_url': pdf_links[0], 'pdf': str(target.relative_to(ROOT)).replace('\\', '/')})
        print(slug, target.stat().st_size, flush=True)
    (DEST / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
