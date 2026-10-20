"""Extract activity resources only when the official module or AE matches."""
import json
import re
import sqlite3
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def normalize(value):
    return re.sub(r'\s+', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(value)).lower()
                                     if unicodedata.category(c) != 'Mn')).strip()


def activity_resources(text):
    match = re.search(r'(?im)^\s*recursos\s*:', text)
    if not match:
        return []
    tail = text[match.end():]
    tail = re.split(r'(?im)^\s*(?:ejecuci[oó]n|cierre|evaluaci[oó]n|\d+\.?\s*$|plan y programa|especialidad)\b', tail)[0]
    return [re.sub(r'\s+', ' ', item).strip().rstrip('.') for bullet in re.split(r'›+|>>|•', tail)[1:] for item in bullet.split(';')
            if item.strip()]


def category(name):
    value = normalize(name)
    for kind, pattern in [('protection', r'proteccion personal|epp|guantes|antiparras|casco|seguridad personal'),
                          ('documents', r'manual|diccionario|guia|pauta|libro|norma|texto|plano|document|ficha|registro'),
                          ('digital', r'computador|software|internet|proyector|video|multimedia|impresora'),
                          ('tools', r'herramient|lupa|instrument|medicion|calibr|espejo|regla|taladro|destornill|llave'),
                          ('materials', r'material|pano|limpieza|desecho|insumo|papel|lapiz|cartulina|tinta')]:
        if re.search(pattern, value):
            return kind
    return 'equipment'


def build():
    import pymupdf
    connection = sqlite3.connect(ROOT / 'data/aulatp.sqlite3')
    rows = connection.execute('SELECT m.id,m.title,m.content,c.title FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.published=1').fetchall()
    documents = {}
    result = {}
    for mid, title, raw, specialty in rows:
        content = json.loads(raw)
        source = content.get('specialty_source') or content.get('official_source') or {}
        curriculum = content.get('curriculum') or {}
        pdf = source.get('pdf') or curriculum.get('pdf')
        if pdf not in documents:
            pages = []
            if pdf and (ROOT / pdf).is_file():
                with pymupdf.open(ROOT / pdf) as document:
                    previous = ''
                    for index, page in enumerate(document):
                        text = page.get_text()
                        resources = activity_resources(text)
                        if resources:
                            context = text
                            if 'nombre del modulo' not in normalize(text) and 'nombre de la actividad de aprendizaje' in normalize(previous):
                                context = previous + '\n' + text
                            pages.append((index + 1, context, normalize(context), resources))
                        previous = text
            documents[pdf] = pages
        aes = [normalize(ae.get('title') or ae.get('description') or '') for ae in content.get('aes', [])]
        title_key = normalize(title)
        resources = {}
        for page, text, normalized, items in documents[pdf]:
            title_match = title_key in normalized
            ae_match = any(len(ae) >= 65 and ae[:100] in normalized for ae in aes)
            if not (title_match or ae_match):
                continue
            activity = re.search(r'NOMBRE DE LA ACTIVIDAD DE APRENDIZAJE\s*(.*?)\s*DURACI', text, re.S | re.I)
            for name in items:
                key = normalize(name)
                if key not in resources:
                    resources[key] = {'name': name, 'category': category(name), 'references': []}
                resources[key]['references'].append({'pdf_page': page, 'activity': re.sub(r'\s+', ' ', activity.group(1)).strip() if activity else '',
                                                     'matched_by': 'module_title' if title_match else 'learning_outcome'})
        result[str(mid)] = {'module_title': title, 'specialty': specialty, 'pdf': pdf,
                            'url': source.get('url') or curriculum.get('url'),
                            'status': 'activity_resources_extracted' if resources else 'requires_source_review',
                            'resources': list(resources.values())}
        # This module specifies its resources in execution paragraphs, without a Recursos list.
        if normalize(title) == 'recuperacion y respaldo de informacion en redes de area local':
            with pymupdf.open(ROOT / pdf) as document:
                for page, name in [(128, 'Active Directory Microsoft Windows'), (128, 'red de área local básica'),
                                   (130, 'herramientas de compresión'), (130, 'programador de tareas'),
                                   (130, 'recursos de almacenamiento compartidos'), (130, 'manual instructivo')]:
                    if normalize(name) not in normalize(document[page - 1].get_text()):
                        raise ValueError(f'Official source changed: {title}: {name}')
                    result[str(mid)]['resources'].append({'name': name, 'category': 'documents' if 'manual' in name else 'digital',
                                                        'references': [{'pdf_page': page, 'activity': 'Gestión de usuarios y respaldo de archivos', 'matched_by': 'verified_execution_paragraph'}]})
            result[str(mid)]['status'] = 'activity_resources_extracted'
    output = ROOT / 'city_room_resources.json'
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    missing = [(mid, row['module_title']) for mid, row in result.items() if not row['resources']]
    print(json.dumps({'modules': len(result), 'courses': len({row['specialty'] for row in result.values()}), 'resources': sum(len(row['resources']) for row in result.values()), 'missing': missing}, ensure_ascii=False))


if __name__ == '__main__':
    build()
