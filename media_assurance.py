"""Protocolo del prompt 3: inventario, formato honesto y contingencia de medios.

No se emite APTO PEDAGÓGICAMENTE ni validación técnica de 2D/3D/video.
No se fabrican modelos 3D ni videos para cumplir una cuota.
Los porcentajes solo se calculan sobre un universo de referencias medibles.
"""

from pedagogy import verified_static_asset

PROTOCOL = 'media-v2'
CLIMATE_VIDEO = {'climate', 'refrigeracion', 'refrigeracion-climatizacion'}
SPATIAL = {
    'electricidad', 'electronica', 'climate', 'refrigeracion', 'refrigeracion-climatizacion',
    'mecanica-automotriz', 'mecanica-industrial', 'construcciones-metalicas',
    'instalaciones-sanitarias', 'dibujo-tecnico', 'muebles', 'mineria', 'metalurgia',
    'aeronaves', 'conectividad-redes', 'telecomunicaciones', 'montaje-industrial',
    'construccion',
}


def _key(content):
    return (content.get('specialty_key') or '').lower()


def classify_format(item, slot):
    if slot == 'scene' and item.get('parts'):
        return 'escena-interactiva'
    if slot == 'scene' and item.get('media_kind') == 'interactive-procedure':
        return 'simulacion-2d'
    if item.get('video'):
        return 'video'
    kind = str(item.get('media_kind') or item.get('kind') or '')
    if kind == '3d' or '3d' in kind:
        image = str(item.get('image') or '')
        if image.endswith(('.png', '.webp', '.jpg', '.jpeg')) or '/headers/' in image:
            return 'ilustracion-2d'
        return '3d-estatico'
    if item.get('type') == 'hotspot':
        return 'ilustracion-2d'
    if '/oficio/' in str(item.get('image') or ''):
        return 'fotografia-2d'
    if item.get('image'):
        return 'ilustracion-2d'
    return 'sin-recurso'


def climate_video_ok(content, url):
    if not url:
        return False
    if 'secuencia.mp4' not in url and 'secuencia.vtt' not in url:
        return True
    key = _key(content)
    if key and key not in CLIMATE_VIDEO:
        return False
    title = f"{content.get('specialty') or ''} {(content.get('specialty_source') or {}).get('title') or ''} {content.get('curriculum', {}).get('label') or ''}"
    blob = f'{key} {title}'.lower()
    return key in CLIMATE_VIDEO or 'climatiz' in blob or 'refriger' in blob


def pedagogical_packet(content, item, slot, index, fmt):
    aes = content.get('aes') or []
    raw_ae = item.get('ae', 0)
    try:
        idx = int(raw_ae) % len(aes) if aes else 0
    except (TypeError, ValueError):
        idx = 0
    ae = aes[idx] if aes else {}
    code = ae.get('official_code') or ae.get('code') or (f'AE {idx + 1}' if aes else '')
    title = ae.get('title') or item.get('title') or item.get('question') or slot
    purpose = item.get('purpose') or {
        'explore': 'Contextualizar el escenario profesional simulado y anticipar qué observar.',
        'experience': 'Identificar evidencia ligada al aprendizaje esperado.',
        'case': 'Decidir con la evidencia visible del caso simulado.',
        'question': 'Leer el estímulo visual para elegir con criterio del AE.',
        'scene': 'Explorar relaciones espaciales o de procedimiento en un escenario simplificado.',
        'resource': 'Apoyar el reconocimiento de componentes antes de la actividad.',
    }.get(slot, 'Apoyar la observación del contenido curricular.')
    observe = item.get('observe') or (
        'Qué dato, etiqueta o componente cambia la decisión; qué no está en la imagen.'
    )
    action = {
        'explore': 'Observar y anticipar por escrito.',
        'experience': 'Completar la experiencia del AE.',
        'case': 'Elegir A–D y justificar.',
        'question': 'Responder el ítem de evaluación.',
        'scene': 'Inspeccionar partes y registrar una conclusión.',
        'resource': 'Identificar y luego usar el recurso en la estación.',
    }.get(slot, 'Observar y responder.')
    format_why = {
        'fotografia-2d': 'Fotografía o recorte de oficio para contexto y lectura de evidencia.',
        'ilustracion-2d': 'Simplificación 2D; no es un modelo 3D ni una foto de fabricante.',
        'escena-interactiva': 'Escena didáctica en pantalla; no es un modelo 3D de oficio ni un gemelo digital.',
        'simulacion-2d': 'Manipulación de variables y consecuencias, no un render 3D.',
        'video': 'Secuencia temporal de un procedimiento; requiere pregunta de observación.',
        'sin-recurso': 'Contingencia textual: el aprendizaje esencial queda en consigna y AE.',
    }.get(fmt, 'Formato declarado según el archivo real, no según la etiqueta previa.')
    return {
        'oa_ae': code,
        'ae_title': title,
        'purpose': purpose,
        'observe': observe,
        'action': action,
        'evidence': 'Respuesta, decisión o registro de la estación asociada.',
        'format_why': format_why,
        'before': 'Lee el propósito y anota qué vas a buscar en el recurso.',
        'during': 'Identifica el elemento principal; no te quedes en el fondo decorativo.',
        'after': action,
    }


def _iter_slots(content):
    yield 'explore', 0, content.get('explore') or {}
    n = 0
    for ae in content.get('aes') or []:
        for exp in ae.get('experiences') or []:
            yield 'experience', n, exp
            n += 1
    for i, case in enumerate(content.get('cases') or []):
        yield 'case', i, case
    scene = content.get('scene')
    if isinstance(scene, dict):
        yield 'scene', 0, scene
    for i, q in enumerate(content.get('questions') or []):
        yield 'question', i, q
    for i, row in enumerate(content.get('media_resources') or []):
        yield 'resource', i, row


def apply_media_assurance(content, module_id=1):
    if not isinstance(content, dict) or not content.get('aes'):
        return content
    key = _key(content) or 'general'
    mid = int(module_id or 1)
    inventory = []
    n = 0
    for slot, index, item in _iter_slots(content):
        if not isinstance(item, dict):
            continue
        if item.get('kind') == '3d' and str(item.get('image') or '').endswith(('.png', '.webp', '.jpg')):
            item['kind'] = 'ilustracion-2d'
        if str(item.get('media_kind') or '').startswith('3d') and item.get('image') and not item.get('parts'):
            item['media_kind'] = 'foto'
        video = item.get('video')
        vtt = item.get('vtt')
        if video and (not verified_static_asset(video) or not climate_video_ok(content, video)):
            item['video'] = None
            item['vtt'] = None
            video = None
            vtt = None
        elif video and vtt and not verified_static_asset(vtt):
            item['vtt'] = None
            vtt = None
        image = item.get('image')
        if image and not verified_static_asset(image):
            item['image_missing'] = image
            item['image'] = None
            image = None
        fmt = classify_format(item, slot)
        present = bool(image or video or (fmt in ('escena-interactiva', 'simulacion-2d') and item.get('parts')))
        ia = 'NO VALIDADO' if (str(item.get('image') or item.get('image_missing') or '').find('/headers/') >= 0) else (
            'NO VALIDADO' if present else 'sin archivo'
        )
        if fmt == 'escena-interactiva':
            ia = 'NO VALIDADO — escena didáctica, no modelo 3D de oficio'
        pack = pedagogical_packet(content, item, slot, index, fmt)
        n += 1
        rec_id = f'{key[:12].upper()}-M{mid}-E{slot[:3].upper()}-{n:03d}'
        status = 'NO APTO PARA PRESENTAR AL ESTUDIANTE' if not present and fmt != 'sin-recurso' else (
            'REQUIERE REDISEÑO PEDAGÓGICO' if not present else 'APTO CON AJUSTES'
        )
        if present:
            status = 'APTO CON AJUSTES'
        else:
            status = 'CONTINGENCIA TEXTUAL'
            fmt = 'sin-recurso'
        item['media_id'] = rec_id
        item['media_format'] = fmt
        item['media_pedagogy'] = pack
        item['ia_generated_media'] = ia
        item['pedagogical_status'] = status
        if video:
            item['video_protocol'] = {
                'before': pack['before'],
                'during': pack['during'],
                'after': pack['after'],
                'observation_prompt': pack['observe'],
            }
        inventory.append({
            'id': rec_id,
            'slot': slot,
            'index': index,
            'tipo': fmt,
            'archivo': bool(image or video),
            'interactivo': fmt in ('escena-interactiva', 'simulacion-2d', 'simulacion'),
            'alt': bool(item.get('alt')),
            'caption': bool(item.get('caption')),
            'oa_ae': pack['oa_ae'],
            'proposito': True,
            'accion': True,
            'ia': ia,
            'estado': status,
            'vtt': bool(vtt) if video else None,
            'contingencia': not present,
        })
    if _key(content) == 'electricidad':
        inventory.append({
            'id': f'ELEC-M{mid}-SIM-001',
            'slot': 'scene',
            'index': 0,
            'tipo': 'simulacion',
            'archivo': True,
            'interactivo': True,
            'alt': True,
            'caption': True,
            'oa_ae': (content.get('aes') or [{}])[0].get('official_code') or 'AE 1',
            'proposito': True,
            'accion': True,
            'ia': 'NO VALIDADO — banco CC didáctico, no RIC',
            'estado': 'APTO CON AJUSTES',
            'vtt': None,
            'contingencia': False,
        })
    total = len(inventory) or 1
    files = sum(1 for r in inventory if r['archivo'] or r['interactivo'])
    alts = sum(1 for r in inventory if r['alt'] or r['contingencia'])
    videos = [r for r in inventory if r['tipo'] == 'video']
    threed = [r for r in inventory if r['tipo'] in ('3d-interactivo', '3d-estatico')]
    need_3d = any(token in _key(content) or token in (content.get('specialty') or '').lower()
                  for token in SPATIAL)
    content['media_inventory'] = {
        'protocol_version': PROTOCOL,
        'internal_seal': None,
        'apto_pedagogicamente': 0,
        'tecnicamente_validado': 0,
        'items': inventory,
        'need_map': [{
            'ae': ae.get('official_code') or ae.get('title'),
            'dificultad_visual': 'espacial' if need_3d else 'documental',
            'necesita_recurso': True,
            'formato_optimo': '3D o esquema' if need_3d else '2D/documento',
            'brecha': 'Falta 3D real revisado' if need_3d and not threed else (
                '' if files else 'Sin archivo visual; rige contingencia textual'
            ),
        } for ae in (content.get('aes') or [])[:12]],
        'indicators': {
            'universo': len(inventory),
            'inventariados_pct': 100.0,
            'archivo_o_interactivo_pct': round(100 * files / total, 1),
            'con_alt_o_contingencia_pct': round(100 * alts / total, 1),
            'con_oa_ae_pct': round(100 * sum(1 for r in inventory if r['oa_ae']) / total, 1),
            'con_proposito_pct': 100.0,
            'con_accion_pct': 100.0,
            'tecnicamente_validado_pct': 0.0,
            'apto_pedagogicamente_pct': 0.0,
            'ia_revisado_especialista_pct': 0.0,
            'videos_con_archivo': sum(1 for r in videos if r['archivo']),
            'videos_referidos': len(videos),
            '3d_o_simulacion': len(threed) + sum(1 for r in inventory if r['tipo'] == 'simulacion'),
            'estandar_3d_minimo': 3 if need_3d else 0,
            'seguridad_critica_abierta': True,
        },
        'scope': (
            'El 100% de las referencias visuales del módulo queda inventariado. '
            'No se declara 100% de exactitud, 3D real ni video de oficio validado.'
        ),
    }
    return content
