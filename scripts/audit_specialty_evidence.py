"""Report evidence gaps without treating source extraction as expert approval."""
import html
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def audit(entries):
    results = []
    for key, entry in entries.items():
        criteria = entry.get('curriculum_audit', {}).get('criteria', [])
        resources = entry.get('resources', [])
        unresolved = [c for c in criteria if c.get('source_verified') is not True]
        results.append({
            'id': key, 'specialty': entry['specialty'], 'module': entry['module_title'],
            'source': entry.get('url'), 'pdf': entry.get('pdf'),
            'objectives': entry.get('objectives', []),
            'learning_outcomes': entry.get('learning_outcomes', []),
            'criteria_verified': sum(c.get('source_verified') is True for c in criteria),
            'criteria_unresolved': unresolved,
            'resources': resources,
            'resources_without_explicit_model': [r['name'] for r in resources if not r.get('model')],
            'verdict': 'Pendiente de validacion disciplinar y prueba funcional en sala',
            'checks': {
                'source_document_present': bool(entry.get('pdf')) and (ROOT / entry['pdf']).is_file(),
                'oa_present': bool(entry.get('objectives')),
                'ae_present': bool(entry.get('learning_outcomes')),
                'criteria_documented': bool(criteria) and not unresolved,
                'visual_walkthrough_verified': False,
                'equipment_operation_verified': False,
                'disciplinary_approval': False,
            },
        })
    return results


def render(rows):
    esc = lambda value: html.escape(str(value or ''))
    sections = defaultdict(list)
    for row in rows:
        sections[row['specialty']].append(row)
    out = ['<!doctype html><html lang="es"><meta charset="utf-8">',
           '<title>Revision por especialidad - Ciudad Laboral</title>',
           '<style>body{font:16px system-ui;margin:32px auto;max-width:1200px;padding:16px;color:#182c38}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccd5db;padding:8px;text-align:left;vertical-align:top}summary{cursor:pointer;padding:12px;background:#eef5fa}h2{border-bottom:2px solid #147a89}a{color:#075a99}li{margin:8px 0}</style>',
           '<h1>Revision documental por especialidad y modulo</h1>',
           '<p>Fecha: 21-10-2026. No es una certificacion ni una validacion experta final. '
           'Se revisa el inventario curricular existente, no se afirma haber recorrido cada sala.</p>',
           '<p>Un recurso sin modelo explicito puede estar representado por otro objeto compartido; '
           'requiere inspeccion, no se clasifica automaticamente como ausente. '
           'La ausencia de nombres de EPP tampoco demuestra por si sola un incumplimiento.</p>',
           '<p>Orden de cierre: confirmar criterios pendientes en el PDF; vincular cada recurso al AE y '
           'procedimiento; revisar especificaciones, seguridad y escala; probar manipulacion, '
           'circulacion y evidencia de aprendizaje en quiz y misiones. No sustituir una practica '
           'operativa por un formulario sin declarar esa limitacion.</p>']
    for specialty, modules in sorted(sections.items()):
        pending = sum(len(r['criteria_unresolved']) for r in modules)
        out.append(f'<h2>{esc(specialty)}</h2><p>{len(modules)} modulos; {pending} criterios pendientes de confirmacion documental.</p>')
        for row in modules:
            out.append(f'<details><summary>{esc(row["module"])}</summary><p><strong>{esc(row["verdict"])}</strong></p>')
            out.append(f'<p><a href="{esc(row["source"])}">Programa de referencia</a>. Criterios coincidentes: {row["criteria_verified"]}.</p>')
            out.append('<h3>OA y aprendizajes registrados</h3><ul>')
            for oa in row['objectives']:
                out.append(f'<li>{esc(oa)}</li>')
            for ae in row['learning_outcomes']:
                out.append(f'<li>{esc(ae.get("code"))}: {esc(ae.get("title"))}</li>')
            out.append('</ul><h3>Criterios por confirmar</h3><ul>')
            for criterion in row['criteria_unresolved']:
                out.append(f'<li>AE {esc(criterion.get("ae"))}, criterio {esc(criterion.get("code"))}: cotejar texto y pertenencia al AE en el PDF.</li>')
            if not row['criteria_unresolved']:
                out.append('<li>Sin alertas del contraste textual previo. Pendiente pertinencia de las tareas.</li>')
            out.append('</ul><table><tr><th>Recurso registrado</th><th>Categoria</th><th>Pagina PDF</th><th>Criterios vinculados</th><th>Modelo declarado</th></tr>')
            for resource in row['resources']:
                pages = sorted({str(ref['pdf_page']) for ref in resource.get('references', []) if ref.get('pdf_page')})
                out.append('<tr>' + ''.join(f'<td>{esc(value)}</td>' for value in [resource['name'], resource.get('category'), ', '.join(pages), ', '.join(resource.get('criteria', [])) or 'Relacion individual pendiente', resource.get('model') or 'Verificar representacion compartida']) + '</tr>')
            out.append('</table></details>')
    out.append('</html>')
    return '\n'.join(out)


if __name__ == '__main__':
    entries = json.loads((ROOT / 'city_room_resources.json').read_text(encoding='utf-8'))
    rows = audit(entries)
    destination = ROOT / 'reports' / 'revision-especialidades-20261021'
    destination.mkdir(parents=True, exist_ok=True)
    (destination / 'informe.html').write_text(render(rows), encoding='utf-8')
    (destination / 'evidencia.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'modules': len(rows), 'specialties': len({r['specialty'] for r in rows}),
                      'verified_criteria': sum(r['criteria_verified'] for r in rows),
                      'unresolved_criteria': sum(len(r['criteria_unresolved']) for r in rows),
                      'checks': dict(Counter(k for r in rows for k, value in r['checks'].items() if value))}))
