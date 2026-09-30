"""Build an offline title-to-page index from the local official MINEDUC PDFs."""

from __future__ import annotations

import json
import re
import sqlite3
import unicodedata
from collections import defaultdict
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]


def normalize(value):
    value = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def page_text(page):
    try:
        return normalize(page.extract_text() or "")
    except Exception:
        return ""


def locate(pages, title):
    title = normalize(title)
    needles = (title, " ".join(title.split()[:12]), " ".join(title.split()[:8]))
    return next((index for index, text in enumerate(pages, 1)
                 if any(needle and len(needle) > 20 and needle in text for needle in needles)), None)


def main():
    grouped = defaultdict(list)
    with sqlite3.connect(ROOT / "data" / "aulatp.sqlite3") as con:
        con.row_factory = sqlite3.Row
        for row in con.execute("SELECT title, content FROM modules WHERE published=1"):
            content = json.loads(row["content"])
            source = content.get("specialty_source") or content.get("official_source") or {}
            grouped[source.get("pdf")].append((row["title"], content))

    index = {}
    for relative_pdf, modules in grouped.items():
        pdf = ROOT / str(relative_pdf or "")
        if not pdf.is_file():
            continue
        pages = [page_text(page) for page in PdfReader(pdf).pages]
        for module_title, content in modules:
            source = content.get("specialty_source") or content.get("official_source") or {}
            title = source.get("title") or module_title
            page = locate(pages, title)
            if page:
                index[f"{relative_pdf}|{normalize(title)}"] = page
            for ae in content.get("aes") or []:
                page = locate(pages, ae.get("title"))
                if page:
                    index[f"{relative_pdf}|{normalize(ae.get('title'))}"] = page

    output = ROOT / "curriculum_pages.json"
    output.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(index)} verified title-page references -> {output}")


if __name__ == "__main__":
    main()
