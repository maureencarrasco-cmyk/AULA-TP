"""Expediente y matrices del prompt maestro de contenidos técnicos.

El sello interno CONTENIDO TÉCNICO VALIDADO no se emite: faltan docente de
especialidad, multimedia real revisada y triangulación con fuentes académicas
nombradas. El 100 % que sí se declara es de alcance: todos los módulos publicados
reciben el mismo expediente reproducible, sin inventar autores ni normas.
"""

from datetime import date, timedelta
from pathlib import Path

from pedagogy import verified_static_asset
from technical_sources import governance, second_source_label, norma_label, regulators_for

REVIEW_DAYS = 180
HEADER_ROOT = Path(__file__).resolve().parent / 'static' / 'headers'
ABS_FIELDS = ('context', 'question', 'explanation', 'title', 'lead', 'stimulus', 'prompt')
ABS_REPL = (
    (' siempre ', ' en este caso '),
    (' Siempre ', ' En este caso '),
    (' nunca ', ' en esta simulación no '),
    (' Nunca ', ' En esta simulación no '),
    (' únicamente ', ' en esta simulación '),
    (' obligatoriamente ', ' según el criterio del AE en esta simulación '),
    ('Todos los ', 'Los '),
    (' todos los ', ' los '),
    ('Ningún ', 'No hay un '),
    (' ningún ', ' no hay un '),
)


def resolve_header_url(key, station):
    if not key:
        return None
    folder = HEADER_ROOT / key
    if not folder.is_dir():
        return None
    tried = []
    for n in (station, 5, 3, 1, 2, 4):
        if n in tried:
            continue
        tried.append(n)
        for ext in ('webp', 'png', 'jpg'):
            name = f'e{n}.{ext}'
            if (folder / name).is_file():
                return f'/static/headers/{key}/{name}'
    return None


def soften_simulated_prose(content):
    import re
    for item in list(content.get('cases') or []) + list(content.get('questions') or []):
        if not isinstance(item, dict):
            continue
        for field in ABS_FIELDS:
            value = item.get(field)
            if not isinstance(value, str):
                continue
            for old, new in ABS_REPL:
                value = value.replace(old, new)
            item[field] = value
        blob = ' '.join(str(item.get(key) or '') for key in ABS_FIELDS)
        if re.search(r'\d', blob):
            item['numeric_status'] = (
                'Dato numérico didáctico. No está recalculado con ficha de fabricante ni con el texto INN.'
            )
    return content


def _coverage_row(name, taught, practiced, evaluated, transferred, gap):
    return {
        'contenido_esperado': name,
        'presente': True,
        'explicado': taught,
        'practicado': practiced,
        'evaluado': evaluated,
        'transferido': transferred,
        'brecha': gap,
    }


def _mark_media(items):
    present = 0
    total = 0
    for item in items:
        if not isinstance(item, dict):
            continue
        image = item.get('image')
        if not image:
            continue
        total += 1
        item.setdefault('claim_kind', 'simulacion')
        if verified_static_asset(image):
            present += 1
            item['media_validation'] = 'archivo presente; precisión técnica NO VALIDADA'
        else:
            item['media_validation'] = 'NO VALIDADO — ruta inexistente'
    return present, total


def build_expedition(content):
    source = content.get('specialty_source') or {}
    aes = content.get('aes') or []
    cases = content.get('cases') or []
    questions = content.get('questions') or []
    oa = source.get('oa') or content.get('official_source', {}).get('oa') or []
    key = content.get('specialty_key') or ''
    url = (
        (content.get('curriculum') or {}).get('url')
        or source.get('url')
        or source.get('source_page')
        or ''
    )
    stamp = governance(key, url, source.get('pdf') or '')
    concepts = []
    glossary = []
    practiced = bool(cases) or any(ae.get('experiences') for ae in aes)
    evaluated = bool(questions)
    transferred = bool(content.get('development'))
    for ae in aes:
        code = ae.get('official_code') or ae.get('code') or ''
        title = ae.get('title') or ''
        taught = bool(ae.get('experiences'))
        concepts.append({
            'concepto': title,
            'codigo': code,
            'definicion_aula_tp': title,
            'fuente_1': 'Programa MINEDUC (AE transcrito)',
            'fuente_2': (
                second_source_label(key)
                if regulators_for(key) else
                (
                    'Criterios de evaluación del mismo AE'
                    if ae.get('criteria') else
                    'FUENTE NO VERIFICADA — no se inventa segunda fuente académica'
                )
            ),
            'normativa': norma_label(key),
            'estado': 'Correcto con observaciones' if ae.get('criteria') else 'Evidencia insuficiente',
            'confianza': 'ALTA' if ae.get('criteria') else 'BAJA',
            'correccion': 'El AE se enseña como simulación documental; no se afirma ejecución real.',
            'categoria': 'principio curricular',
            'enseñado': taught,
            'practicado': practiced,
            'evaluado': evaluated,
        })
        glossary.append({
            'termino': code or title[:80],
            'definicion_tecnica': title,
            'explicacion_estudiante': (
                'En este módulo decides con evidencia del caso simulado. '
                'Si falta un dato, lo declaras.'
            ),
            'fuente': url or 'Programa MINEDUC local',
        })
        for criterion in ae.get('criteria') or []:
            concepts.append({
                'concepto': criterion,
                'codigo': code,
                'definicion_aula_tp': criterion,
                'fuente_1': 'Criterio de evaluación MINEDUC',
                'fuente_2': second_source_label(key) if regulators_for(key) else 'FUENTE NO VERIFICADA — no se usa un manual inventado',
                'normativa': norma_label(key),
                'estado': 'Correcto con observaciones',
                'confianza': 'MEDIA',
                'correccion': 'Criterio curricular; la práctica del campus es simulada.',
                'categoria': 'criterio curricular',
            })
    for item in oa:
        if isinstance(item, str):
            item = {'title': item, 'code': ''}
        if not isinstance(item, dict):
            continue
        concepts.append({
            'concepto': item.get('title') or item.get('code') or 'OA',
            'codigo': item.get('code') or '',
            'definicion_aula_tp': item.get('title') or '',
            'fuente_1': 'OA del Programa MINEDUC',
            'fuente_2': second_source_label(key) if regulators_for(key) else 'FUENTE NO VERIFICADA — no se añade texto académico no citado',
            'normativa': norma_label(key),
            'estado': 'Correcto con observaciones',
            'confianza': 'ALTA',
            'correccion': 'OA oficial; Aula TP no sustituye el taller presencial.',
            'categoria': 'objetivo curricular',
        })
    taught = bool(aes)
    coverage = [
        _coverage_row(
            'AE y criterios MINEDUC', taught, practiced, evaluated, transferred,
            '' if taught and evaluated else 'Falta práctica o ítem de evaluación',
        ),
        _coverage_row(
            'Casos profesionales simulados', bool(cases), bool(cases), bool(questions), transferred,
            'Datos ficticios: no son valores de fabricante',
        ),
        _coverage_row(
            'Multimedia de oficio', False, False, False, False,
            '3D/video con precisión técnica: NO VALIDADO',
        ),
    ]
    media_ok, media_total = _mark_media(list(cases) + list(questions))
    layers = {
        'curricular': 'Cumple parcialmente: OA/AE/criterios del programa cuando están transcritos.',
        'tecnico_cientifica': 'No evidenciado a nivel de manual o paper; se evita inventar consenso.',
        'profesional': 'Pertinente como pre-taller documental; no como práctica habilitante.',
        'pedagogica': 'Explicado como simulación para 3° y 4° medio TP.',
        'gobernanza': 'Expediente generado; sello interno no emitido.',
    }
    debt = [
        'Dictamen de docente o profesional de la especialidad (cola en Espacio docente; no emite sello interno).',
        'Multimedia 3D/video con precisión técnica revisada.',
    ]
    if not regulators_for(key):
        debt.append('Sin mapa regulatorio de nivel 2 en el repositorio para esta especialidad.')
    if key == 'electricidad':
        debt.append('Contrastar cada decisión de instalación con el pliego RIC aplicable y su versión.')
    if key in ('enfermeria', 'atencion-enfermeria'):
        debt.append('MINSAL está citado por el programa; falta la guía o URL específica para triangulación clínica.')
    today = date.today().isoformat()
    return {
        'id': f'{key or "curso"}-expediente',
        'version': 'tecnico-protocolo-v2',
        'fecha': today,
        'proxima_revision': (date.today() + timedelta(days=REVIEW_DAYS)).isoformat(),
        'status': 'En revisión',
        'internal_seal': None,
        'protocol_complete': True,
        'protocol_scope': (
            'El 100% de los módulos publicados recibe este expediente: mapas de fuentes del repositorio, '
            'matriz de AE/OA, cobertura enseñado-practicado-evaluado, glosario curricular, capas 1–5, '
            'deuda y reporte. No se declara 100% de exactitud técnico-científica.'
        ),
        'layers': layers,
        'concepts': concepts,
        'coverage': coverage,
        'glossary': glossary[:40],
        'source_map': stamp['source_map'],
        'media': {'archivos_presentes': media_ok, 'archivos_referidos': media_total},
        'debt': debt,
        'specialist_queue': {
            'status': 'Pendiente',
            'instruction': (
                'Un docente de la especialidad registra dictamen por módulo. '
                'Ese registro no equivale al sello CONTENIDO TÉCNICO VALIDADO.'
            ),
        },
        'change_log': [{
            'fecha': today,
            'contenido': 'Expediente técnico',
            'cambio': 'Protocolo del prompt 2 aplicado a todos los módulos publicados',
            'motivo': 'Gobernanza y trazabilidad afirmación → fuente curricular',
            'fuente': url or 'MINEDUC local',
            'responsable': 'Aula TP · motor de aseguramiento',
            'validacion': 'Protocolo; no sello de especialista',
        }],
        'technical_validation': stamp,
    }


def apply_header_files(content):
    key = content.get('specialty_key') or ''
    if not key:
        return content
    mapping = {
        1: [content.get('explore') or {}],
        2: [exp for ae in content.get('aes') or [] for exp in ae.get('experiences') or []],
        3: list(content.get('cases') or []) + [content.get('scene') or {}],
        4: list(content.get('questions') or []),
        5: list(content.get('media_resources') or []),
    }
    for station, items in mapping.items():
        resolved = resolve_header_url(key, station if station != 5 else 5)
        if not resolved:
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            current = str(item.get('image') or '')
            if (not current) or '/static/headers/' in current:
                item['image'] = resolved
    return content


def apply_content_assurance(content, module_id=1):
    if not isinstance(content, dict) or not content.get('aes'):
        return content
    content['_module_id'] = int(module_id or 1)
    from media_assurance import apply_media_assurance
    soften_simulated_prose(content)
    apply_header_files(content)
    expedition = build_expedition(content)
    content['technical_expedition'] = expedition
    content['technical_validation'] = expedition['technical_validation']
    content['technical_validation']['status'] = 'En revisión'
    content['technical_validation']['protocol_complete'] = True
    content['technical_validation']['internal_seal'] = None
    apply_media_assurance(content, content.get('_module_id') or 1)
    content.pop('_module_id', None)
    return content
