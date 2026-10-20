"""Reviewed room requirements, separate from illustrative activity resource lists."""
import re
import unicodedata


def normalized(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value.lower())
                   if unicodedata.category(c) != 'Mn')


def enrich_requirements(inventories, root):
    import pymupdf
    entry = inventories['441']
    # Full program PDF pages 45-46, corresponding to module PDF pages 2-3.
    rows = [
        ('Fuselaje, alas, empenaje e interior: conjunto estructural de montaje', 'equipment', 45,
         ['1.1'], 'structural-assembly', ['fuselaje', 'alas', 'empenaje']),
        ('Tren de aterrizaje sobre soporte de montaje', 'equipment', 45,
         ['1.2'], 'landing-gear', ['tren de aterrizaje']),
        ('Espejo de inspeccion', 'tools', 46, ['2.1'], 'inspection-mirror', ['espejos', 'lupas']),
        ('Equipo de demostracion de particulas magneticas', 'equipment', 46,
         ['2.2'], 'magnetic-inspection', ['particulas', 'magneticas']),
        ('Registro e informe de inspeccion', 'documents', 46,
         ['2.3'], 'inspection-record', ['resultados de inspeccion']),
        ('Preparacion del puesto: acceso, higiene, seguridad y factores humanos', 'documents', 46,
         ['3.1'], 'workplace-checklist', ['prepara el lugar de trabajo']),
        ('Manual y plan de reparacion y reemplazo estructural', 'documents', 46,
         ['3.2', '3.3'], 'repair-plan', ['repara los elementos', 'remplaza los elementos']),
        ('Formulario de mantenimiento efectuado', 'documents', 46,
         ['3.4'], 'maintenance-record', ['formularios correspondientes']),
    ]
    with pymupdf.open(root / entry['pdf']) as document:
        for name, category, page, criteria, model, anchors in rows:
            text = re.sub(r'\s+', ' ', normalized(document[page - 1].get_text()))
            if not all(normalized(anchor) in text for anchor in anchors):
                raise ValueError(f'Curriculum requirement no longer matches official PDF: {name}')
            entry['resources'].append({'name': name, 'category': category, 'model': model,
                'criteria': criteria, 'objective': 'OA 3',
                'references': [{'pdf_page': page, 'criteria': criteria,
                                'matched_by': 'reviewed_oa_ae_criterion'}]})
    entry['curriculum_audit'] = {
        'status': 'reviewed_virtual_representation', 'scope': 'OA 3; AE 1, 2, 3',
        'source_url': 'https://www.curriculumnacional.cl/614/articles-82003_recurso_pdf.pdf',
        'source_pages': [45, 46],
        'criteria': [{'code': code, 'resources': [name for name, _, _, codes, _, _ in rows if code in codes]}
                     for code in ['1.1', '1.2', '2.1', '2.2', '2.3', '3.1', '3.2', '3.3', '3.4']],
        'limitations': 'Representacion virtual didactica. No certifica un taller real ni sustituye manuales del fabricante, supervision o procedimientos autorizados.'}
    # Additional concrete components checked in the other aircraft module criteria.
    additions = [
        ('446', 'Sistema de deteccion y extincion de incendios', 97, '1.4', 'catalog-fire-system', 'sistema de deteccion y extincion de incendios'),
        ('447', 'Radiador de aceite', 106, '1.2', 'catalog-radiator', 'radiador de aceite'),
        ('447', 'Magneto', 106, '1.2', 'catalog-motor', 'magnetos'),
        ('447', 'Bomba de combustible', 106, '1.2', 'catalog-pump', 'bomba de combustible'),
        ('447', 'Caja de accesorios', 106, '1.2', 'catalog-motor', 'caja de accesorios'),
        ('448', 'Bomba de aceite', 117, '1.2', 'catalog-pump', 'bomba de aceite'),
        ('448', 'Bomba de combustible', 117, '1.2', 'catalog-pump', 'bomba de combustible'),
        ('448', 'Generador de aeronave', 117, '1.2', 'catalog-motor', 'generador para analizar su estructura'),
    ]
    with pymupdf.open(root / entry['pdf']) as document:
        for mid, name, page, criterion, model, anchor in additions:
            text = re.sub(r'\s+', ' ', normalized(document[page - 1].get_text()))
            if anchor not in text:
                raise ValueError(f'Unverified aircraft component: {mid}: {name}')
            inventories[mid]['resources'].append({'name': name, 'category': 'equipment',
                'model': model, 'criteria': [criterion],
                'references': [{'pdf_page': page, 'criteria': [criterion],
                    'matched_by': 'reviewed_criterion_resource', 'source_phrase': anchor}]})
