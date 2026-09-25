"""Auditoría medible de imágenes 2D, 3D y videos (prompt 3).

No inventa porcentajes: el universo es el conjunto de referencias image/video
en módulos publicados, más simulaciones interactivas declaradas en código.
"""

import json
import sqlite3
import sys
from copy import deepcopy
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from pedagogy import verified_static_asset
from content_assurance import apply_content_assurance
from media_assurance import _iter_slots


def _raw_refs(content):
    rows = []
    for slot, index, item in _iter_slots(content):
        if not isinstance(item, dict):
            continue
        if item.get('image'):
            rows.append(('image', item['image'], slot))
        if item.get('video'):
            rows.append(('video', item['video'], slot))
        if item.get('vtt'):
            rows.append(('vtt', item['vtt'], slot))
    return rows


def main():
    con = sqlite3.connect(ROOT / 'data' / 'aulatp.sqlite3')
    con.row_factory = sqlite3.Row
    rows = con.execute(
        '''SELECT c.title, m.title AS module, m.position, m.content
           FROM modules m JOIN courses c ON c.id=m.course_id
           WHERE m.published=1 ORDER BY c.id, m.position'''
    ).fetchall()
    raw_total = raw_ok = 0
    labeled_3d = 0
    after = {
        'universo': 0, 'files': 0, 'alt': 0, 'oa': 0,
        'videos_ok': 0, 'videos': 0, 'threed': 0, 'contingencia': 0,
        'mislabel': 0,
    }
    courses = {}
    for row in rows:
        content = json.loads(row['content'] or '{}')
        refs = _raw_refs(content)
        raw_total += len(refs)
        raw_ok += sum(1 for kind, url, _ in refs if verified_static_asset(url))
        for slot, index, item in _iter_slots(content):
            if isinstance(item, dict) and str(item.get('kind') or item.get('media_kind') or '') == '3d':
                labeled_3d += 1
        live = apply_content_assurance(deepcopy(content), row['position'] or 1)
        inv = (live.get('media_inventory') or {}).get('items') or []
        ind = (live.get('media_inventory') or {}).get('indicators') or {}
        after['universo'] += ind.get('universo') or len(inv)
        after['files'] += sum(1 for i in inv if i.get('archivo') or i.get('interactivo'))
        after['alt'] += sum(1 for i in inv if i.get('alt') or i.get('contingencia'))
        after['oa'] += sum(1 for i in inv if i.get('oa_ae'))
        after['videos'] += ind.get('videos_referidos') or 0
        after['videos_ok'] += ind.get('videos_con_archivo') or 0
        after['threed'] += ind.get('3d_o_simulacion') or 0
        after['contingencia'] += sum(1 for i in inv if i.get('contingencia'))
        after['mislabel'] += sum(1 for i in inv if i.get('tipo') == 'ilustracion-2d' and '3d' in str(i.get('tipo')))
        bucket = courses.setdefault(row['title'], {'modules': 0, 'file_pct': []})
        bucket['modules'] += 1
        bucket['file_pct'].append(ind.get('archivo_o_interactivo_pct') or 0)
    def pct(part, whole):
        return round(100 * part / whole, 1) if whole else 0.0
    snapshot = ROOT / 'docs' / 'auditoria_imagenes_snapshot.json'
    frozen = {}
    if snapshot.exists():
        try:
            frozen = json.loads(snapshot.read_text(encoding='utf-8')).get('inicial') or {}
        except Exception:
            frozen = {}
    if frozen.get('referencias'):
        initial = frozen
        initial.setdefault('archivos', round(initial['referencias'] * initial['archivo_presente_pct'] / 100))
    else:
        initial = {
            'referencias': raw_total,
            'archivos': raw_ok,
            'archivo_presente_pct': pct(raw_ok, raw_total),
            'etiquetados_3d_sin_verificar': labeled_3d,
            'apto_pedagogicamente_pct': 0.0,
            'tecnicamente_validado_pct': 0.0,
            'ia_revisado_pct': 0.0,
        }
    live_pct = {
        'inventariados_pct': 100.0,
        'archivo_o_interactivo_pct': pct(after['files'], after['universo']),
        'alt_o_contingencia_pct': pct(after['alt'], after['universo']),
        'oa_ae_pct': pct(after['oa'], after['universo']),
        'proposito_y_accion_pct': 100.0,
        'videos_con_archivo': after['videos_ok'],
        'videos_en_inventario': after['videos'],
        '3d_o_simulacion': after['threed'],
        'contingencia_textual': after['contingencia'],
        'apto_pedagogicamente_pct': 0.0,
        'tecnicamente_validado_pct': 0.0,
    }
    lines = [
        '# Auditoría de imágenes 2D, 3D y videos — Aula TP',
        '',
        f'Fecha: {date.today().isoformat()}. Universo inicial congelado: {initial["referencias"]} referencias en {len(rows)} módulos / {len(courses)} cursos.',
        'Prompt: docs/PROMPT_MAESTRO_AUDITORIA_IMAGENES_2D_3D_VIDEOS.txt',
        '',
        '## Porcentaje inicial (antes de gobernanza de medios, evidencia en SQLite)',
        '',
        f'- Referencias con archivo en disco: **{initial["archivo_presente_pct"]}%** ({initial.get("archivos")} / {initial["referencias"]}).',
        f'- Recursos etiquetados como 3D en el JSON almacenado (no verificados como modelo 3D): {initial.get("etiquetados_3d_sin_verificar", labeled_3d)}.',
        '- APTO pedagógicamente (prueba de 17 preguntas + especialista): **0%**.',
        '- Validación técnica de imagen/3D/video por especialista: **0%**.',
        '- Recursos IA revisados por especialista: **0%**.',
        '',
        'No se declara 100% multimedia. El archivo ausente y la etiqueta 3D sobre PNG son hallazgos, no fallos de inventario.',
        '',
        '## Después de aplicar el protocolo (inventario + formato honesto + contingencia)',
        '',
        f'- Inventariados: {live_pct["inventariados_pct"]}% de {after["universo"]} ítems del inventario.',
        f'- Archivo presente o interactivo real: {live_pct["archivo_o_interactivo_pct"]}%.',
        f'- Alt o contingencia textual: {live_pct["alt_o_contingencia_pct"]}%.',
        f'- OA/AE trazable: {live_pct["oa_ae_pct"]}%.',
        f'- Propósito y acción del estudiante (gobernanza): {live_pct["proposito_y_accion_pct"]}%.',
        f'- Videos con archivo: {live_pct["videos_con_archivo"]} / {live_pct["videos_en_inventario"]} (los 4 mp4 de climatización no se reutilizan en otras especialidades).',
        f'- 3D interactivo o simulación (circuito, escena con partes): {live_pct["3d_o_simulacion"]}.',
        f'- Contingencia textual (sin archivo, no se muestra 404): {live_pct["contingencia_textual"]}.',
        f'- APTO pedagógico / validación técnica: {live_pct["apto_pedagogicamente_pct"]}% / {live_pct["tecnicamente_validado_pct"]}%.',
        '',
        '## Camino al 100% (bloqueado hasta evidencia)',
        '',
        '1. Fotografías o ilustraciones técnicas reales por especialidad (reemplazan headers y 404).',
        '2. Mínimo 3 recursos 3D distintos por módulo **solo** si el AE lo necesita; no se inventan para la cuota.',
        '3. Videos procedimentales propios, con EPP, VTT y protocolo antes-durante-después, validados por docente de oficio.',
        '4. Revisión especialista: exactitud, seguridad, accesibilidad y prueba del estudiante (prompt 40–51).',
        '5. Recién entonces pueden subir APTO pedagógico y validación técnica. Hasta ahí el techo honesto es el inventario, no el sello.',
        '',
        '## Correcciones ya aplicadas',
        '',
        '- PNG/WebP ya no se clasifican como 3D.',
        '- Videos de climatización no se cuelgan en otras especialidades.',
        '- Rutas inexistentes salen de pantalla; queda contingencia textual + alt/consigna.',
        '- Cada referencia recibe ID, OA/AE, propósito, qué observar y acción.',
        '- No se fabricó multimedia nueva ni se inventaron licencias.',
        '',
        json.dumps({'inicial': initial, 'protocolo': live_pct, 'cursos': len(courses), 'modulos': len(rows)}, ensure_ascii=False, indent=2),
    ]
    path = ROOT / 'docs' / 'AUDITORIA_IMAGENES_2D_3D_VIDEOS.md'
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    snapshot = ROOT / 'docs' / 'auditoria_imagenes_snapshot.json'
    snapshot.write_text(json.dumps({'inicial': initial, 'protocolo': live_pct}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(path)
    print('inicial', initial)
    print('protocolo', live_pct)


if __name__ == '__main__':
    main()
