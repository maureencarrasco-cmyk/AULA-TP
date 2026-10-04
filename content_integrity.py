"""Conservative content repairs; never invent curricular or measured evidence."""
from pathlib import Path
from functools import lru_cache

ROOT = Path(__file__).resolve().parent
MEDIA_FIELDS = ('image', 'imageB', 'video', 'vtt', 'audio', 'model')
GENERATED_CONTEXT_ASSETS = {
    '/static/headers/agropecuaria-agricultura/e2.png': {
        'alt': 'Dos estudiantes y una docente observan plantulas y hojas en un invernadero.',
        'caption': 'Ilustracion generada de aprendizaje en agricultura. Contexto simulado; no acredita parametros ni prescribe tratamientos o procedimientos agricolas.',
    },
    '/static/headers/agropecuaria-vitivinicola/e2.png': {
        'alt': 'Dos estudiantes y una docente observan racimos y hojas de vid junto a una bandeja de muestras.',
        'caption': 'Ilustracion generada de aprendizaje en vitivinicultura. Contexto simulado; no acredita parametros ni prescribe tratamientos o procedimientos productivos.',
    },
    '/static/headers/acuicultura/e2.png': {
        'alt': 'Estudiante y docente observan una muestra de agua junto a un microscopio y estanques de cultivo.',
        'caption': 'Ilustracion generada de un entorno de aprendizaje acuicola. Recurso contextual simulado; no acredita parametros ni procedimientos tecnicos.',
    },
    '/static/headers/electronica/e2.png': {
        'alt': 'Dos estudiantes y un docente observan una placa electronica desconectada con una lupa en una mesa de laboratorio.',
        'caption': 'Ilustracion generada de aprendizaje supervisado en electronica. Contexto simulado; no acredita conexiones, lecturas ni procedimientos tecnicos.',
    },
    '/static/headers/muebles-terminaciones-madera/e2.png': {
        'alt': 'Dos estudiantes y un docente observan un mueble terminado y tres muestras de acabado sobre un banco de taller.',
        'caption': 'Ilustracion generada de aprendizaje en muebles y terminaciones en madera. Contexto simulado; no acredita medidas, materiales ni procedimientos tecnicos.',
    },
    '/static/headers/programacion/e2.png': {
        'alt': 'Dos estudiantes y un docente comparan un boceto de interfaz con un diseno en la pantalla de un computador.',
        'caption': 'Ilustracion generada de aprendizaje colaborativo en programacion. Contexto simulado; no contiene codigo ni respuestas de evaluacion.',
    },
    '/static/headers/agropecuaria-pecuaria/e2.png': {
        'alt': 'Dos estudiantes y un docente observan bovinos desde el exterior de un recinto cercado, junto a un bebedero.',
        'caption': 'Ilustracion generada de aprendizaje en produccion pecuaria. Contexto simulado; no acredita condiciones sanitarias ni prescribe manejo animal.',
    },
    '/static/headers/vestuario-confeccion-textil/e2.png': {
        'alt': 'Dos estudiantes y una docente observan una prenda terminada en un maniqui y comparan muestras textiles.',
        'caption': 'Ilustracion generada de aprendizaje en vestuario y confeccion textil. Contexto simulado; no acredita medidas, patrones ni procedimientos de confeccion.',
    },
}


@lru_cache(maxsize=8192)
def asset_exists(value):
    if not isinstance(value, str) or not value.startswith('/static/'):
        return False
    root = (ROOT / 'static').resolve()
    path = (ROOT / value.split('?', 1)[0].split('#', 1)[0].lstrip('/')).resolve()
    return path.is_relative_to(root) and path.is_file()


def repair_content_integrity(content, page_lookup=None):
    """Repair in place, preserving questions, keys, criteria and saved grades."""
    source = content.get('specialty_source') or content.get('official_source') or {}
    pdf = source.get('pdf')
    aes = content.get('aes') or []
    source_changes = 0
    for row in content.get('traceability') or []:
        if content.get('specialty'):
            row['specialty'] = content['specialty']
        if pdf and row.get('pdf') != pdf:
            row['pdf'] = pdf
            source_changes += 1
        ae = next((a for a in aes if a.get('official_code') == row.get('ae_code')), None)
        page = ae.get('official_page') if ae else None
        if not page and ae and page_lookup:
            page = page_lookup(pdf, ae.get('title'))
            if page:
                ae['official_page'] = page
        if pdf:
            code = row.get('ae_code') or 'AE pendiente de identificar'
            row['page'] = f'PDF p. {page} · {code}' if page else f'Pagina pendiente de verificar · {code}'
        row['source_status'] = 'REFERENCIA REGISTRADA; CONTENIDO REQUIERE VALIDACION'

    missing, alternative_labels = [], 0
    def walk(value, path='contenido'):
        nonlocal alternative_labels
        if isinstance(value, list):
            for index,item in enumerate(value):
                walk(item, f'{path}[{index}]')
        elif isinstance(value, dict):
            unavailable = value.setdefault('unavailable_media', {}) if any(
                isinstance(value.get(k), str) and value[k].startswith('/static/') and (not asset_exists(value[k]) or (value.get('requires_image') and value[k].split('?', 1)[0] in GENERATED_CONTEXT_ASSETS))
                for k in MEDIA_FIELDS) else value.get('unavailable_media') or {}
            for field in MEDIA_FIELDS:
                src = value.get(field)
                if isinstance(src, str) and src.startswith('/static/') and (not asset_exists(src) or (value.get('requires_image') and src.split('?', 1)[0] in GENERATED_CONTEXT_ASSETS)):
                    unavailable[field] = {'path': src.lstrip('/'), 'status': 'PENDIENTE DE RESTAURAR',
                        'role':'context' if '/static/headers/' in src else 'evidence'}
                    value['unavailable_media'] = unavailable
                    value[field] = None
                prior = unavailable.get(field)
                if prior and not value.get(field):
                    original = '/' + prior.get('path', '').lstrip('/')
                    base, separator, query = original.partition('?')
                    candidate = str(Path(base).with_suffix('.webp')).replace('\\', '/') if base.endswith('.png') else base
                    candidate += separator + query
                    if asset_exists(original):
                        candidate = original
                    generated = GENERATED_CONTEXT_ASSETS.get(candidate.split('?', 1)[0])
                    if generated and value.get('requires_image'):
                        candidate = None
                    if candidate and base.startswith('/static/headers/') and asset_exists(candidate):
                        value[field] = candidate
                        value.setdefault('restored_media', {})[field] = {
                            'original_path': prior['path'], 'path': candidate,
                            'status': 'CONTEXTO GENERADO; NO EVIDENCIA TECNICA' if generated else 'ORIGINAL RECUPERADO; REVISION DISCIPLINAR PENDIENTE'}
                        unavailable.pop(field)
                    elif (field == 'image' and path == 'contenido.explore'
                          and base.startswith('/static/headers/') and base.endswith('/e1.png')
                          and not value.get('requires_image')):
                        contextual = str(Path(base).with_name('e3.webp')).replace('\\', '/')
                        if asset_exists(contextual):
                            value[field] = contextual
                            value.setdefault('replaced_media', {})[field] = {
                                'original_path': prior['path'], 'path': contextual,
                                'role': 'context', 'status': 'IMAGEN CONTEXTUAL DE LA MISMA ESPECIALIDAD; NO EVIDENCIA TECNICA'}
                            unavailable.pop(field)
                if field in unavailable:
                    unavailable[field].setdefault('role', 'context' if unavailable[field].get('path','').startswith('static/headers/') else 'evidence')
                    missing.append({'location':path, 'field':field, **unavailable[field]})
            generated = GENERATED_CONTEXT_ASSETS.get(str(value.get('image') or '').split('?', 1)[0])
            if generated:
                value.update(generated)
                value['media_role'] = 'context'
                value['media_origin'] = 'ai-generated'
            if value.get('image') and not str(value.get('alt') or '').strip():
                label = value.get('caption') or value.get('title')
                if isinstance(label, str) and label.strip():
                    value['alt'] = label.strip()
                    value['alt_status'] = 'DESDE TEXTO EXISTENTE; DESCRIPCION VISUAL REQUIERE REVISION'
                    alternative_labels += 1
            for key,item in list(value.items()):
                if key not in ('unavailable_media', 'integrity_audit', 'time_audit', 'restored_media', 'replaced_media'):
                    walk(item, f'{path}.{key}')
    walk(content)
    content['integrity_audit'] = {
        'status':'REQUIERE REVISION DISCIPLINAR', 'source_references_repaired':source_changes,
        'missing_media':missing, 'missing_media_count':len(missing),
        'alternative_labels_added':alternative_labels,
        'curriculum_validated':False, 'technical_content_validated':False,
        'accessibility_certified':False,
    }
    calibration = content.get('question_calibration')
    if isinstance(calibration, dict):
        calibration.setdefault('declared_distribution_matches_target', calibration.get('distribution_valid'))
        calibration['distribution_valid'] = None
        calibration['cognitive_difficulty_validated'] = False
        calibration['status'] = 'ETIQUETAS DECLARADAS; CALIBRACION REAL PENDIENTE'
    design = content.get('mcq_design_audit')
    if isinstance(design, dict):
        for field in ('single_best_answer', 'plausible_professional_errors'):
            design[field] = None
        design['disciplinary_validation_pending'] = True
    replace_time_audit(content)
    return content


def replace_time_audit(content):
    """Budget is available capacity, never evidence of activity completion time."""
    plan = content.get('planning') or {}
    source = content.get('specialty_source') or content.get('official_source') or {}
    hp = source.get('official_hp') or plan.get('official_hp') or plan.get('hp')
    hp_minutes = content.get('hp_minutes') or 45
    available = float(hp) * float(hp_minutes) * .30 if hp else None
    count = 5 + sum(len(a.get('steps') or []) + 1 for a in content.get('aes') or [])
    count += len(content.get('cases') or []) + len(content.get('questions') or [])
    count += bool(content.get('development')) + 5
    count += bool(content.get('scene'))
    # Count the guided contextualization and closure parts, not one per station.
    content['time_audit'] = {
        'status':'REQUIERE RECALIBRACION',
        'method':'Presupuesto 30% de HP oficiales registradas; tiempo real docente pendiente de medicion.',
        'course_level':source.get('year') or 'Nivel pendiente de verificar',
        'activity_count':count, 'activity_count_scope':'Consignas principales; no incluye practicas optativas ni interacciones internas.',
        'question_count':len(content.get('questions') or []),
        'factor':5, 'assigned_percent':30, 'official_hp':hp, 'hp_minutes':hp_minutes,
        'available_minutes':available, 'available_hours':round(available/60, 2) if available is not None else None,
        'planned_minutes':plan.get('minutes'), 'teacher_total_minutes':None,
        'teacher_minutes_per_activity':None, 'expert_minutes':None,
        'student_minutes_per_activity':None, 'student_minutes':None,
        'required_minutes':None, 'required_hours':None,
        'occupancy_percent':None, 'remaining_hours':None, 'difference_minutes':None,
        'load_status':'NO VERIFICABLE SIN CRONOMETRAJE DOCENTE',
        'sensitivity':{str(n):{'factor':n, 'required_minutes':None, 'required_hours':None,
            'occupancy_percent':None, 'remaining_hours':None} for n in (3,4,5,6)},
        'measurement_status':'NO VERIFICABLE',
        'factor_hypothesis':'El factor x5 se aplica al tiempo real docente, no al presupuesto ni al numero de preguntas.',
        'validation_data_needed':['Cronometraje docente por actividad: lectura, recursos, resolucion y escritura.',
            'Identificacion de actividades obligatorias y optativas.', 'Contraste de HP y nivel con programa oficial.',
            'Pilotaje con estudiantes; sensibilidad x3/x4/x5/x6.'],
    }
