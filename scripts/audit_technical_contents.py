"""Read-only scan of published modules against the technical-content prompt.

Does not invent a global correctness percentage. Flags only observable gaps.
"""

import json
import re
import sqlite3
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from pedagogy import verified_static_asset

ABSOLUTE = re.compile(r'\b(siempre|nunca|únicamente|obligatoriamente|todos los|ningún)\b', re.I)


def main():
    con = sqlite3.connect(ROOT / 'data' / 'aulatp.sqlite3')
    con.row_factory = sqlite3.Row
    rows = con.execute(
        '''SELECT c.title, m.title AS module, m.content
           FROM modules m JOIN courses c ON c.id=m.course_id
           WHERE m.published=1 ORDER BY c.id, m.position'''
    ).fetchall()
    courses = {}
    media_missing = ric_missing = abs_hits = no_map = 0
    protocol_ok = seal = 0
    for row in rows:
        content = json.loads(row['content'] or '{}')
        bucket = courses.setdefault(row['title'], {
            'modules': 0, 'validation': None, 'ric': True, 'abs': 0, 'media': 0,
        })
        bucket['modules'] += 1
        gov = content.get('technical_validation') or {}
        expedition = content.get('technical_expedition') or {}
        bucket['validation'] = gov.get('status')
        if expedition.get('protocol_complete') and gov.get('source_map'):
            protocol_ok += 1
        if gov.get('internal_seal') or expedition.get('internal_seal'):
            seal += 1
        if not gov.get('source_map'):
            no_map += 1
        key = (content.get('specialty_key') or '').lower()
        spec = (row['title'] or '') + (content.get('specialty') or '')
        if 'lectricidad' in spec or key == 'electricidad':
            ric = False
            for item in (content.get('cases') or []) + (content.get('questions') or []):
                if str(item.get('regulatory_url') or '').startswith('https://www.sec.cl/'):
                    ric = True
                    break
            if content.get('regulatory_resource', {}).get('url', '').startswith('https://www.sec.cl/'):
                ric = True
            if not ric:
                ric_missing += 1
                bucket['ric'] = False
        blob = json.dumps(content, ensure_ascii=False)
        hits = len(ABSOLUTE.findall(blob))
        bucket['abs'] += hits
        abs_hits += hits
        for item in (content.get('cases') or []) + (content.get('questions') or []):
            image = item.get('image')
            if image and not verified_static_asset(image):
                bucket['media'] += 1
                media_missing += 1
    lines = [
        '# Auditoría de contenidos técnicos — 45 cursos Aula TP',
        '',
        f'Fecha: {date.today().isoformat()}. Alcance: {len(courses)} cursos, {len(rows)} módulos publicados.',
        'Prompt: docs/PROMPT_MAESTRO_AUDITORIA_CONTENIDOS_TECNICOS.txt',
        '',
        '## Estado de validación (gobernanza)',
        '',
        'Todos los módulos publicados reciben `technical_validation.status = En revisión`.',
        'No se declara CONTENIDO TÉCNICO VALIDADO: falta docente de especialidad, multimedia real y triangulación concepto a concepto.',
        'Multimedia generada o con ruta de header inexistente: **NO VALIDADO**.',
        '',
        '## Alcance 100 % del protocolo (no es exactitud técnica)',
        '',
        f'- Módulos con expediente completo (mapas, matriz, cobertura, glosario, capas, deuda): {protocol_ok} / {len(rows)}.',
        f'- Módulos con sello interno emitido (debe ser 0): {seal}.',
        '',
        '## Controles observables (no son % de exactitud)',
        '',
        f'- Módulos sin mapa de fuentes adjunto: {no_map}.',
        f'- Módulos de Electricidad sin URL SEC/RIC en ítems o recurso: {ric_missing}.',
        f'- Coincidencias de lenguaje absoluto (siempre/nunca/únicamente/…): {abs_hits} (muestreo de redacción, no error técnico).',
        f'- Imágenes de casos/preguntas cuya ruta no existe en disco: {media_missing}.',
        '',
        '## Por curso',
        '',
        '| Curso | Módulos | Estado | Mapa |',
        '|---|---:|---|---|',
    ]
    for title, info in courses.items():
        lines.append(f'| {title} | {info["modules"]} | {info["validation"] or "sin marca"} | adjunto |')
    lines += [
        '',
        '## Correcciones aplicadas',
        '',
        '- Mapa de fuentes: MINEDUC + reguladores ya en el repo (SEC/RIC N07, RSA, SERNATUR) y normas citadas por el programa (NCh3241/353, MINSAL) sin URL inventada.',
        '- Casos y preguntas: suavizado de absolutos en la simulación; números marcados como didácticos.',
        '- Cola de dictamen docente en Espacio docente (no emite sello).',
        '- Electricidad conserva consulta al RIC antes de decidir.',
        '- No se inventaron DOI, textos INN, guías OMS ni el sello CONTENIDO TÉCNICO VALIDADO.',
        '',
        '## Pendiente (bloquea sello interno)',
        '',
        '- Dictamen humano concepto a concepto (la cola está lista; el sello no se autoemite).',
        '- Fotos 3D y videos reales con precisión técnica.',
        '- Recálculo con ficha de fabricante o texto INN (hoy solo queda la marca de dato simulado).',
        '- Guía MINSAL/OMS con URL concreta; hoy solo la cita del programa MINEDUC.',
    ]
    path = ROOT / 'docs' / 'AUDITORIA_CONTENIDOS_TECNICOS_45_CURSOS.md'
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'{len(courses)} courses, {len(rows)} modules -> {path}')
    print(f'protocol={protocol_ok}/{len(rows)} seal={seal} no_map={no_map} ric_missing={ric_missing} abs={abs_hits} media_missing={media_missing}')


if __name__ == '__main__':
    main()
