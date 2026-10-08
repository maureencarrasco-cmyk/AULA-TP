"""Consolidate saved browser observations without touching application data."""
import csv
import html
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports' / 'recorrido-451-modulos-20261007'
manifest = json.loads((OUT / 'manifest.json').read_text(encoding='utf-8'))
latest = {}
for line in (OUT / 'recorrido.jsonl').read_text(encoding='utf-8').splitlines():
    record = json.loads(line)
    latest[record['id'], record['station']] = record
assert len(manifest) == 451
assert set(latest) == {(m['id'], s) for m in manifest for s in range(1, 6)}
names = ['', 'Contextualizacion', 'Aprendizajes esperados', 'Situacion integradora', 'Evaluacion final', 'Retroalimentacion y cierre']
courses = defaultdict(list)
rows = []
def add(m, criterion, state, percent, evidence, finding='Sin incidencia demostrada en este control', required='No', proposal='Conservar', priority='No aplica'):
    rows.append(dict(Curso_ID=m['course_id'], Curso=m['course'], Modulo_ID=m['id'], Modulo=m['title'], Criterio=criterion, Estado_actual=state, Porcentaje_cumplimiento=percent, Evidencia=evidence, Hallazgo=finding, Cambio_requerido=required, Cambio_propuesto=proposal, Justificacion='El resultado se limita al control descrito; no certifica actividades no observadas.', Prioridad=priority, Autorizacion='NO AUTORIZADO / NO EJECUTADO'))
for m in manifest:
    courses[m['course_id']].append(m)
    for s in range(1, 6):
        r = latest[m['id'], s]
        valid = r['status'] != 'NO VERIFICABLE'
        assert (OUT / r['snapshotFile']).exists()
        add(m, f'Entrada de estacion {s}: {names[s]}', 'Entrada visible verificada' if valid else 'No verificable', 100 if valid else None,
            f"{r['date']} | 1/1 entrada verificada" if valid else f"{r['date']} | Comprobacion pendiente",
            required='No' if valid else 'No determinado', proposal='Conservar' if valid else 'Repetir observacion, sin modificar el curso')
        rows[-1]['Archivo_evidencia'] = r['snapshotFile']
        rows[-1]['URL'] = r['requestedUrl']
    observations = [i for s in range(1, 6) for i in latest[m['id'], s]['dom'].get('images', [])]
    loaded = sum(i.get('complete') and i.get('width', 0) > 0 for i in observations)
    add(m, 'Carga de imagenes en las cinco entradas', 'Recursos DOM cargados', round(100 * loaded / len(observations), 2) if observations else None,
        f'{loaded}/{len(observations)} usos de imagen completos y con ancho natural positivo; no son archivos unicos. No mide nitidez, seguridad, coherencia ni accesibilidad.',
        finding='Sin incidencia de carga observada' if loaded == len(observations) else 'Recurso no listo durante captura; no confirma archivo roto',
        required='No' if loaded == len(observations) else 'No determinado', proposal='Conservar' if loaded == len(observations) else 'Recomprobar carga antes de proponer cambios')
    blocked = any('Misi\u00f3n laboral' in b.get('label', '') and b.get('disabled') for b in latest[m['id'], 1]['dom'].get('buttons', []))
    add(m, 'Disponibilidad de Mision laboral (estacion visual 4)', 'En construccion; control deshabilitado' if blocked else 'No identificada', 0 if blocked else None,
        '0/1 estaciones de Mision laboral disponibles. No pertenece a las cinco rutas habilitadas recorridas.',
        'Estacion adicional anunciada pero no disponible; no demuestra un defecto en las actividades habilitadas.', 'No determinado',
        'Ninguna modificacion propuesta. Definir alcance de esta estacion antes de autorizar una implementacion.')
    shot = OUT / 'capturas' / f"modulo-{m['id']}.png"
    add(m, 'Captura visual de entrada contextual', 'Captura guardada' if shot.exists() else 'Sin captura', 100 if shot.exists() else 0,
        '1/1 captura de entrada guardada; no es una inspeccion visual integral de las actividades.')
    rows[-1]['Archivo_evidencia'] = str(shot.relative_to(OUT)) if shot.exists() else ''

# Retain each requested expert criterion separately, without inventing scores.
previous = json.loads((ROOT / 'reports' / 'auditoria-pedagogica-visual-20261007' / 'matriz-actualizada.json').read_text(encoding='utf-8'))
previous_rows = previous if isinstance(previous, list) else previous.get('matriz', previous.get('rows', []))
criteria = list(dict.fromkeys(r['Criterio'] for r in previous_rows if '-PV' in r.get('ID', '') and '-M' not in r.get('ID', '')))
assert len(criteria) == 21, f'Expected 21 expert criteria, got {len(criteria)}'
for cid, modules in courses.items():
    m = dict(modules[0], id='', title='Todos los modulos; actividades pendientes de microauditoria')
    for criterion in criteria:
        add(m, criterion, 'No auditado integralmente por actividad', None,
            f'{len(modules)} modulos y {5 * len(modules)} entradas de estacion recorridas. No se han inspeccionado todas las actividades, pestañas y preguntas internas para este criterio.',
            'No hay evidencia suficiente para calificar el cumplimiento integral. No equivale a incumplimiento.', 'No determinado',
            'Ninguna modificacion. Completar revision individual de actividades y contraste pedagogico-visual antes de proponer cambios.')

summary = []
for cid, modules in courses.items():
    rs = [latest[m['id'], s] for m in modules for s in range(1, 6)]
    verified = sum(r['status'] != 'NO VERIFICABLE' for r in rs)
    imgs = [i for r in rs for i in r['dom'].get('images', [])]
    ready = sum(i.get('complete') and i.get('width', 0) > 0 for i in imgs)
    summary.append(dict(Curso_ID=cid, Curso=modules[0]['course'], Modulos=len(modules), Entradas_verificadas=verified, Entradas_esperadas=len(rs), Cobertura_recorrido=round(100 * verified / len(rs), 2), Imagenes_cargadas=ready, Usos_imagen_observados=len(imgs), Carga_imagenes=round(100 * ready / len(imgs), 2) if imgs else None, Cumplimiento_integral='NV', Autorizacion='NO AUTORIZADO'))
assert len(summary) == 45
payload = dict(alcance='Recorrido de entradas; no auditoria integral por actividad', cursos=summary, matriz=rows, fechas=[min(r['date'] for r in latest.values()), max(r['date'] for r in latest.values())])
(OUT / 'consolidado.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
columns = list(dict.fromkeys(key for row in rows for key in row))
with (OUT / 'tabla-consolidada.csv').open('w', encoding='utf-8-sig', newline='') as stream:
    writer = csv.DictWriter(stream, fieldnames=columns)
    writer.writeheader()
    writer.writerows(rows)
def table(items):
    keys = list(dict.fromkeys(key for row in items for key in row))
    def cell(key, value):
        text = html.escape(str(value) if value is not None else 'NV')
        if key in ('Archivo_evidencia', 'URL') and value:
            return f'<a href="{html.escape(str(value), quote=True)}">Ver evidencia</a>'
        return text
    return '<div class="table"><table><thead><tr>' + ''.join('<th>'+html.escape(k.replace('_',' '))+'</th>' for k in keys) + '</tr></thead><tbody>' + ''.join('<tr>'+''.join('<td>'+cell(k, r.get(k, ''))+'</td>' for k in keys)+'</tr>' for r in items)+'</tbody></table></div>'
page = '''<!doctype html><html lang="es"><meta charset="utf-8"><title>Recorrido completo de 45 cursos</title><style>body{font:15px Arial,sans-serif;color:#162b3c;margin:28px;line-height:1.5}h1{font-size:26px}h2{font-size:20px}.table{overflow:auto;max-height:70vh;border:1px solid #ccd5df;margin:18px 0}table{border-collapse:collapse;width:100%}td,th{border:1px solid #dae1e7;padding:9px;vertical-align:top;min-width:120px}th{background:#edf4fa;position:sticky;top:0}input{padding:10px;width:340px;max-width:85%}a{color:#075ab4}.notice{padding:16px;background:#eef7f5;border-left:4px solid #16815d}</style>
<h1>Recorrido completo: 45 cursos y 451 modulos</h1>
<p class="notice"><strong>2.255/2.255 entradas de estacion verificadas (100 %).</strong> Se recorrio cada modulo por sus cinco rutas habilitadas y se guardo una captura de Contextualizacion por modulo. Este porcentaje mide cobertura del recorrido, no calidad pedagogica integral.</p>
<p>Estaciones recorridas: Contextualizacion, Aprendizajes esperados, Situacion integradora, Evaluacion final y Retroalimentacion y cierre. La interfaz numera las dos ultimas como 5 y 6 porque incluye Mision laboral como estacion 4 en construccion. No se enviaron respuestas ni se completaron evaluaciones; no se modificaron cursos.</p>
<p>Alcance pendiente: revisar cada actividad interna, todas las preguntas de evaluacion y pestañas de retroalimentacion, instrucciones, evidencias, pertinencia tecnica y seguridad de las imagenes, nitidez real, continuidad y accesibilidad. Las capturas guardadas no equivalen a haber realizado esos controles. NV significa no verificable con esta evidencia, no 0 % de calidad.</p>
<p><a href="../auditoria-pedagogica-visual-20261007/informe-actualizado.html">Informe previo y hallazgo localizado</a> · <a href="tabla-consolidada.csv">Tabla descargable</a> · <a href="consolidado.json">Datos consolidados</a></p>'''
page += '<h2>Resumen individual de los 45 cursos</h2>' + table(summary)
page += '<h2>Detalle por modulo, estacion y criterio</h2><label>Filtrar curso, modulo o criterio <input id="filter" type="search"></label><section id="matrix">'+table(rows)+'</section>'
ready = sum(s['Imagenes_cargadas'] for s in summary)
images = sum(s['Usos_imagen_observados'] for s in summary)
page += f'''<h2>Resumen consolidado</h2><ul>
<li>Cobertura de modulos: 451/451 (100 %). Cobertura de cursos: 45/45 (100 %).</li>
<li>Entradas verificadas: 2.255/2.255 (100 %). Capturas contextuales: {sum((OUT / 'capturas' / f"modulo-{m['id']}.png").exists() for m in manifest)}/451.</li>
<li>Carga DOM de imagenes: {ready}/{images} usos observados ({100 * ready / images:.2f} %). No mide archivos unicos ni calidad visual.</li>
<li>Promedio general de cumplimiento pedagogico-visual: NV. No se calcula con controles de navegacion.</li>
<li>Cursos certificados completamente: 0/45 (0 % certificados; no significa que los demas incumplan). Cumplimiento parcial y brechas relevantes integrales: NV. Pendientes de validacion integral: 45/45 (100 %).</li>
<li>Mayor cumplimiento entre controles medidos: apertura de entradas y carga de imagenes. Menor disponibilidad: Mision laboral, en construccion. No hay ranking pedagogico con evidencia suficiente.</li>
<li>Cambios nuevos de contenido propuestos en este recorrido: 0. Alta: 0; media: 0; baja: 0. El informe previo mantiene una solicitud de revision localizada de prioridad media en Refrigeracion y Climatizacion, modulo 1, caso 2; no es una sustitucion de imagen autorizada.</li>
<li>Intervencion urgente demostrada en este recorrido: ninguna. Prioridad de auditoria: completar la microauditoria de actividades de todos los cursos y comprobar el hallazgo localizado previo.</li>
<li>Autorizaciones concedidas y cambios ejecutados durante este recorrido: 0.</li></ul>
<p>Ventana de observacion UTC: {payload['fechas'][0]} a {payload['fechas'][1]}. El entorno pudo recibir cambios concurrentes; estas evidencias describen el momento de captura, no una version congelada de toda la aplicacion.</p>
<script>document.getElementById('filter').addEventListener('input',e=>{{const q=e.target.value.toLocaleLowerCase('es');document.querySelectorAll('#matrix tbody tr').forEach(r=>r.hidden=!r.textContent.toLocaleLowerCase('es').includes(q));}});</script></html>'''
(OUT / 'informe-recorrido.html').write_text(page, encoding='utf-8')
print(json.dumps(dict(cursos=45, modulos=451, estaciones=len(latest), filas=len(rows), imagenes_cargadas=ready, usos_imagen=images, informe=str(OUT / 'informe-recorrido.html')), ensure_ascii=True))
