"""Publish measured documentary results without implying semantic certification."""
import collections
import csv
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports/microauditoria-actividades-20261008'
data = json.loads((OUT / 'revision-documental.json').read_text(encoding='utf-8'))
courses = {m['course_id']: m['course'] for m in data['manifest']}
groups = collections.defaultdict(list)
for check in data['comprobaciones']:
    groups[check['Curso_ID'], check['Criterio']].append(check)
rows = []
for (cid, criterion), checks in sorted(groups.items()):
    passed = sum(c['Cumple'] for c in checks)
    rows.append(dict(Curso_ID=cid, Curso=courses[cid], Modulo='Todos los modulos aplicables', Actividad='Consultar actividades.csv y revision-documental.json', Criterio=criterion, Estado_actual='Control documental, no validacion disciplinar', Porcentaje_cumplimiento=round(100*passed/len(checks), 4), Evidencia=f'{passed}/{len(checks)} comprobaciones satisfactorias. Detalle individual en revision-documental.json.', Hallazgo='Sin incumplimientos en este control' if passed == len(checks) else 'Incumplimiento documental', Cambio_requerido='No detectado en este control', Cambio_propuesto='Ninguno', Justificacion='La presencia y estructura no certifican calidad pedagogica.', Prioridad='No aplica', Autorizacion='NO EJECUTADO'))
for cid, course in sorted(courses.items()):
    rows.append(dict(Curso_ID=cid, Curso=course, Modulo='Todos', Actividad='Todas', Criterio='Validacion pedagogica, disciplinar y visual integral', Estado_actual='Pendiente: no revisada integralmente actividad por actividad', Porcentaje_cumplimiento='NV', Evidencia='El recorrido de estaciones y los controles de estructura no permiten calcular este porcentaje.', Hallazgo='Falta contraste especializado de las tareas y sus respuestas y revision visual completa de los estados interactivos.', Cambio_requerido='Por determinar', Cambio_propuesto='Completar revision antes de autorizar cambios de contenido', Justificacion='Evitar porcentajes estimados y modificaciones sin evidencia.', Prioridad='Por determinar', Autorizacion='PENDIENTE / NO EJECUTADO'))
verified = [json.loads(line) for line in (OUT/'duplicados-ui.jsonl').read_text(encoding='utf-8').splitlines() if line.strip()]
assert len(verified) == len(data['hallazgos']) == 29
for alert in data['hallazgos']:
    row = dict(alert)
    row.update(Estado_actual='Repeticion exacta documental; alternativas contrastadas en navegador', Evidencia=alert['Evidencia']+' Contraste registrado en duplicados-ui.jsonl.', Cambio_requerido='Revisar intencionalidad antes de intervenir', Cambio_propuesto=alert['Cambio_propuesto'], Porcentaje_cumplimiento='No aplica: hallazgo individual', Autorizacion='PENDIENTE / NO EJECUTADO')
    rows.append(row)
fields = ['Curso_ID','Curso','Modulo','Actividad','Criterio','Estado_actual','Porcentaje_cumplimiento','Evidencia','Hallazgo','Cambio_requerido','Cambio_propuesto','Justificacion','Prioridad','Autorizacion']
with (OUT/'tabla-consolidada.csv').open('w', encoding='utf-8-sig', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
    writer.writeheader()
    writer.writerows(rows)
summary = dict(cursos=45, modulos=451, componentes_documentados=len(data['actividades']), controles_documentales=len(data['comprobaciones']), controles_satisfactorios=sum(c['Cumple'] for c in data['comprobaciones']), promedio_integral='NV', cursos_cumplimiento_integral='NV', cursos_cumplimiento_parcial_integral='NV', cursos_brechas_relevantes_integral='NV', parejas_repetidas=29, modulos_con_repeticiones=len({h['Modulo_ID'] for h in data['hallazgos']}), cursos_con_repeticiones=sorted({h['Curso_ID'] for h in data['hallazgos']}), propuestas_condicionadas=29, prioridades={'Alta':0,'Media':29,'Baja':0}, cambios_ejecutados=0)
(OUT/'resumen.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
esc = lambda value: html.escape(str(value))
body = ''.join('<tr>'+''.join('<td>'+esc(r.get(k,''))+'</td>' for k in fields)+'</tr>' for r in rows)
page = '''<!doctype html><html lang="es"><meta charset="utf-8"><title>Auditoria documental de 45 cursos</title><style>body{font:15px system-ui;margin:24px;color:#163047}h1{font-size:26px}p{max-width:1000px;line-height:1.6}.notice{padding:16px;background:#fff4da;border-left:4px solid #c48800}.scroll{overflow:auto;max-height:75vh}table{border-collapse:collapse;font-size:13px}th,td{padding:10px;border:1px solid #ccd8e0;min-width:150px;vertical-align:top}th{position:sticky;top:0;background:#e9f3fa}input{padding:10px;margin:16px 0;width:340px;max-width:90%}</style><h1>Auditoria documental: 45 cursos y 451 modulos</h1><p class="notice">La auditoria pedagogica y visual integral sigue pendiente. No se modificaron cursos. NV significa no verificado; no equivale a cero ni a cumplimiento.</p><p>55.938 componentes documentados; 190.555 controles documentales satisfactorios (100% de estos controles). Se identificaron 29 parejas repetidas en 16 modulos de 3 cursos y se contrastaron sus alternativas en el navegador. Este resultado no certifica la correccion de las respuestas ni la calidad pedagogica.</p><h2>Resumen consolidado</h2><p>Promedio general integral: NV. Cursos con cumplimiento completo, parcial y brechas relevantes: NV; no hay una clasificacion integral comprobada. Todos los controles documentales aplicados alcanzan 100%; no existe un criterio documental de menor cumplimiento. La validez disciplinar, pertinencia de imagenes y experiencia visual requieren mas revision. Propuestas condicionadas: 29 (alta: 0; media: 29; baja: 0). Cursos a revisar por repeticion: Gastronomia mencion Cocina; Gastronomia mencion Pasteleria y Reposteria; Servicios de Hoteleria. Esto no establece prioridad alta ni autoriza reemplazos.</p><p><a href="tabla-consolidada.csv">Tabla consolidada CSV</a> · <a href="actividades.csv">Inventario individual</a> · <a href="revision-documental.json">Evidencias por componente</a> · <a href="duplicados-ui.jsonl">Contrastes del navegador</a> · <a href="inventario-visual.json">Inventario visual de 127 archivos</a></p><label>Filtrar curso o criterio <input id="filter" placeholder="Buscar"></label><div class="scroll"><table><thead><tr>'''+''.join('<th>'+esc(k.replace('_',' '))+'</th>' for k in fields)+'''</tr></thead><tbody>'''+body+'''</tbody></table></div><script>document.getElementById('filter').addEventListener('input',e=>{const q=e.target.value.toLocaleLowerCase();document.querySelectorAll('tbody tr').forEach(r=>r.hidden=!r.textContent.toLocaleLowerCase().includes(q));});</script></html>'''
(OUT/'informe.html').write_text(page, encoding='utf-8')
assert {r['Curso_ID'] for r in rows} == set(courses)
assert summary['controles_documentales'] == 190555
assert summary['componentes_documentados'] == 55938
print(json.dumps(summary, ensure_ascii=True))
