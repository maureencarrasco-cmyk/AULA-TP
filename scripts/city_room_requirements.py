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
