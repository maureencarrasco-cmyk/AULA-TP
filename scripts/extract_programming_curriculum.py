"""Extract Programming OA, AE and criteria from MINEDUC module pages."""

import json
import re
from pathlib import Path
from urllib.request import Request, urlopen

from lxml import html


ROOT = Path(__file__).resolve().parents[1]
PDF = 'docs/fuentes/tp-programas/programacion.pdf'
PDF_URL = 'https://www.curriculumnacional.cl/614/articles-34336_programa.pdf'
MODULES = [
    (1, 82128, 'Programación y bases de datos', 228, 3),
    (2, 82129, 'Instalación y configuración de equipos informáticos', 190, 3),
    (3, 82130, 'Soporte a usuarios y productividad', 228, 3),
    (4, 82131, 'Sistemas operativos', 190, 3),
    (5, 82132, 'Diseño de bases de datos relacionales', 152, 4),
    (6, 82133, 'Programación orientada a objetos', 228, 4),
    (7, 82134, 'Administración de bases de datos', 152, 4),
    (8, 82135, 'Desarrollo de aplicaciones web', 228, 4),
    (9, 82127, 'Emprendimiento y empleabilidad', 76, 4),
]


def clean(value):
    return re.sub(r'\s+', ' ', value).strip()


def oa_from_document(document):
    oa = []
    for node in document.xpath('//h1|//h2|//h3|//h4'):
        value = clean(node.text_content())
        matches = list(re.finditer(r'\bOA\s+(\d+|[A-Z])\.\s*', value, re.I))
        for index, match in enumerate(matches):
            end = matches[index + 1].start() if index + 1 < len(matches) else len(value)
            objective_title = value[match.end():end].strip()
            if objective_title:
                oa.append({'code': f'OA {match.group(1)}', 'title': objective_title})
    return oa


def oa_from_page(article):
    url = f'https://www.curriculumnacional.cl/614/w3-article-{article}.html'
    request = Request(url, headers={'User-Agent': 'AulaTPChile-curriculum-verification/1.0'})
    with urlopen(request, timeout=45) as response:
        document = html.fromstring(response.read().decode('utf-8'))
    return oa_from_document(document)


def module(position, article, title, hours, grade):
    url = f'https://www.curriculumnacional.cl/614/w3-article-{article}.html'
    request = Request(url, headers={'User-Agent': 'AulaTPChile-curriculum-verification/1.0'})
    with urlopen(request, timeout=45) as response:
        document = html.fromstring(response.read().decode('utf-8'))
    heading = document.xpath('//h2[contains(translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "aprendizajes esperados e indicadores")]')
    if len(heading) != 1:
        raise ValueError(f'{title}: missing official AE heading')
    section = heading[0].getnext()
    while section is not None and section.tag != 'div':
        section = section.getnext()
    if section is None:
        raise ValueError(f'{title}: missing official AE list')
    aes = []
    warnings = []
    for node in section.xpath('./ul/li'):
        primary = clean(node.xpath('string(text()[1])'))
        match = re.match(r'AE\.\s*(\d+)\.\s*(.*)', primary, re.S)
        if not match:
            continue
        criteria_list = node.xpath('./ul/li')
        if not criteria_list and node.getnext() is not None and node.getnext().tag == 'ul':
            criteria_list = node.getnext().xpath('./li')
        raw_criteria = [clean(li.text_content()) for li in criteria_list]
        if any(re.match(r'^\d+\.\s+\d+\s', value) for value in raw_criteria):
            warnings.append('El sitio MINEDUC separa los dígitos del código de un criterio; se normalizó solo el código.')
            raw_criteria = [re.sub(r'^(\d+)\.\s+(\d+)\s', r'\1.\2 ', value)
                            for value in raw_criteria]
        incomplete_codes = [criterion for criterion in raw_criteria
                            if re.match(r'^\d+\.\s', criterion)]
        if incomplete_codes:
            warnings.append('El sitio MINEDUC presenta un criterio sin subnúmero; se conserva el texto original.')
        invalid = [criterion for criterion in raw_criteria
                   if not re.match(r'\d+\.(?:\d+\.?)?\s', criterion)]
        if invalid and invalid == ['PROBLEMA DE CORRELACIÓN NUMÉRICA O FALTA UN CRITERIO DE EVALUACIÓN']:
            warnings.append('El sitio MINEDUC marca un posible criterio faltante en este AE; el PDF oficial omite 4.4.')
            invalid = []
        criteria = [criterion for criterion in raw_criteria
                    if re.match(r'\d+\.(?:\d+\.?)?\s', criterion)]
        if not criteria or invalid:
            raise ValueError(f'{title}: invalid criteria for AE {match.group(1)}')
        aes.append({'code': f'M{position}-AE{match.group(1)}', 'title': match.group(2), 'criteria': criteria})
    if not aes:
        raise ValueError(f'{title}: no official AE')
    oa = oa_from_document(document)
    return {'position': position, 'title': title, 'hp': hours, 'year': f'{grade}° medio',
            'oa': oa, 'aes': aes, 'source_page': url, 'source_pdf': PDF_URL,
            'source_warnings': warnings}


def main():
    rows = [module(*item) for item in MODULES]
    if len(rows) != 9 or sum(row['hp'] for row in rows if row['year'] == '3° medio') != 836 or sum(row['hp'] for row in rows if row['year'] == '4° medio') != 836:
        raise ValueError('Programming study plan hours differ from the official PDF')
    target = ROOT / 'programming_official.json'
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for row in rows:
        print(row['position'], len(row['oa']), len(row['aes']), row['title'])


if __name__ == '__main__':
    main()
