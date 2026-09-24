"""Read missing MINEDUC AE tables from rendered PDF pages, preserving provenance."""

import re

import numpy as np
import pymupdf
from rapidocr_onnxruntime import RapidOCR


CODE = re.compile(r'^(\d+)\.(\d+)$')
AE_CODE = re.compile(r'^(\d+)\.$')


def page_rows(document, page_number, engine):
    page = document[page_number - 1]
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False)
    pixels = np.frombuffer(pixmap.samples, dtype=np.uint8).reshape(
        pixmap.height, pixmap.width, pixmap.n
    )
    result, _ = engine(pixels)
    return [(round(box[0][0]), round(box[0][1]), text.strip(), score)
            for box, text, score in result or []]


def _blocks(rows, expression):
    blocks = []
    current = None
    for x, y, text, confidence in rows:
        match = expression.match(text)
        if match:
            if current:
                blocks.append(current)
            current = {'code': '.'.join(match.groups()), 'parts': [],
                       'minimum_confidence': confidence}
            suffix = text[match.end():].strip()
            if suffix:
                current['parts'].append(suffix)
        elif current:
            current['parts'].append(text)
            current['minimum_confidence'] = min(current['minimum_confidence'], confidence)
    if current:
        blocks.append(current)
    for block in blocks:
        block['title'] = re.sub(r'\s+', ' ', ' '.join(block.pop('parts'))).strip()
    return blocks


def extract_tables(pdf_path, page_numbers):
    document = pymupdf.open(pdf_path)
    engine = RapidOCR()
    aes = []
    criteria = []
    for page_number in page_numbers:
        rows = page_rows(document, page_number, engine)
        left = [(x, y, text, score) for x, y, text, score in rows
                if 90 <= x < 350 and 170 < y < 1450]
        middle = [(x, y, text, score) for x, y, text, score in rows
                  if 350 <= x < 900 and 170 < y < 1450]
        left.sort(key=lambda row: (round((row[1] - 5 if AE_CODE.match(row[2]) else row[1]) / 15),
                                   row[0], row[1]))
        middle.sort(key=lambda row: (round((row[1] - 5 if CODE.match(row[2]) else row[1]) / 15),
                                     row[0], row[1]))
        aes.extend(_blocks(left, AE_CODE))
        criteria.extend(_blocks(middle, CODE))
    return aes, criteria
