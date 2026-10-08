"""Consolidate observed evidence without treating lexical alerts as certification."""
import collections
import csv
import hashlib
import html
import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports/auditoria-integral-20261008'

def read(name):
    return json.loads((OUT / name).read_text(encoding='utf-8'))

def lines(name):
    return [json.loads(s) for s in (OUT / name).read_text(encoding='utf-8').splitlines() if s.strip()]

manifest = read('manifest-actual.json')
dev = {r['module']: r for r in lines('desarrollos-ui.jsonl')}
tabs = {(r['module'], r['tab']): r for r in lines('pestanas-ui.jsonl')}
flags = list(csv.DictReader((OUT / 'alertas-pedagogicas.csv').open(encoding='utf-8-sig', newline='')))
manual = read('observaciones-manuales.json')
assessment = read('control-evaluaciones-actual.json')
old = json.loads((ROOT / 'reports/auditoria-pedagogica-visual-20261007/matriz-actualizada.json').read_text(encoding='utf-8'))
criteria = [r['Criterio'] for r in old['matriz'] if r['Curso_ID'] == 1 and '-PV' in r['ID'] and '-M' not in r['ID']]
courses = collections.defaultdict(list)
for m in manifest:
    courses[m['course_id']].append(m)
domain = {int(r['Modulo_ID']): r for r in flags if r['Criterio'] == 'Antecedentes del desarrollo y problema del modulo'}
confirmed = {}
for mid, flag in domain.items():
    observed = dev.get(mid, {}).get('observed', {})
    if 'UI-01, UI-02 y UE-01 aparecen en planta' in observed.get('text', ''):
        confirmed[mid] = flag

with sqlite3.connect((ROOT / 'data/aulatp.sqlite3').as_uri() + '?mode=ro', uri=True) as db:
    db.execute('PRAGMA query_only=ON')
    current_hashes = {mid: hashlib.sha256(raw.encode()).hexdigest() for mid, raw in db.execute('SELECT id,content FROM modules')}
unchanged = all(current_hashes.get(m['id']) == m['sha256'] for m in manifest)

def pct(a, b):
    return round(a * 100 / b, 2) if b else None

def row(cid, criterion, state, good=None, total=None, evidence='', finding='Sin defecto demostrado por este control.', proposal='Ninguno.', priority='No aplica', module='', activity='', required='No', authorization='SIN SOLICITUD DE CAMBIO'):
    return dict(Curso_ID=cid, Curso=courses[cid][0]['course'], Modulo=module, Actividad=activity,
                Criterio=criterion, Estado_actual=state, Porcentaje_cumplimiento=pct(good, total) if good is not None else None,
                Cumplen=good, Revisados=total, Evidencia=evidence, Hallazgo=finding, Cambio_requerido=required,
                Cambio_propuesto=proposal, Justificacion='Conclusiones limitadas al control y a la evidencia indicada.',
                Prioridad=priority, Autorizacion=authorization)

matrix, course_summary, coverage = [], [], []
keys = ('analiza', 'comprende', 'conecta', 'transfiere', 'proyecta')
for cid, modules in courses.items():
    ids = {m['id'] for m in modules}
    available = [dev[mid] for mid in ids if dev.get(mid, {}).get('observed')]
    views = [r for (mid, _), r in tabs.items() if mid in ids]
    proper = sum(any(a.get('tab') == r['tab'] and 'is-active' in a.get('class', '') and a.get('ariaCurrent') == 'step' for a in r['observed']['active']) for r in views)
    loaded = [(im.get('complete') and im.get('naturalWidth', 0) > 0) for r in views for im in r['observed']['images'] if im.get('width', 0) > 0 and im.get('height', 0) > 0]
    no_overflow = sum(not r['observed']['overflow'] for r in views)
    flagged = ids & domain.keys()
    verified = ids & confirmed.keys()
    assessment_rows = [r for r in assessment if r['Modulo_ID'] in ids]
    matrix.extend([
        row(cid, 'Cobertura de módulos en inventario y relaciones documentales', 'REVISADO EN CONTENIDO', len(ids), len(ids), f'{len(ids)}/{len(ids)} módulos inventariados; manifest-actual.json y relaciones-por-actividad.json. Es cobertura, no calidad.'),
        row(cid, 'Antecedentes sin activar regla de reutilización HVAC', 'CONTROL TEXTUAL ACTIVADO; PERTINENCIA POR CONTRASTAR' if flagged else 'SIN DISCREPANCIA EN ESTE CONTROL', len(ids) - len(flagged), len(ids), f'{len(flagged)}/{len(ids)} módulos contienen el bloque UI-01/UI-02/UE-01 sin conexión explícita en la consigna; presencia de {len(verified)} confirmada en pantalla.', finding='Ver filas individuales de desarrollo; no atribuir incompatibilidad técnica a partir de una regla lexical.' if flagged else 'No se activa la regla textual; no equivale a pertinencia integral.'),
        row(cid, 'Acceso de inspección al desarrollo', 'COBERTURA DE OBSERVACIÓN', len(available), len(ids), f'{len(available)}/{len(ids)} desarrollos observados; los entregados no se reabren. No es porcentaje de cumplimiento del curso.'),
        row(cid, 'Selección visual y programática de pestaña después de pulsar', 'CUMPLE EN VISTAS OBSERVADAS' if proper == len(views) and views else 'PENDIENTE O INCIDENCIA', proper, len(views), f'{proper}/{len(views)} vistas con is-active y aria-current=step. Cobertura esperada: {len(ids)*5} vistas. No certifica contraste, relieve ni toda la accesibilidad.'),
        row(cid, 'Carga de imágenes visibles en pestañas', 'CUMPLE CONTROL DE CARGA' if all(loaded) and loaded else 'PENDIENTE O INCIDENCIA', sum(loaded), len(loaded), f'{sum(loaded)}/{len(loaded)} usos visibles con complete y naturalWidth>0. No mide nitidez ni fidelidad.'),
        row(cid, 'Ausencia de desbordamiento horizontal en main', 'CUMPLE EN VISTAS OBSERVADAS' if no_overflow == len(views) and views else 'PENDIENTE O INCIDENCIA', no_overflow, len(views), f'{no_overflow}/{len(views)} vistas sin scrollWidth>clientWidth+2, en el tamaño del navegador usado. No es validación móvil.'),
        row(cid, 'Bancos sin preguntas exactamente duplicadas', 'CONTROL EXACTO, NO SEMÁNTICO', sum(r['Duplicados_exactos'] == 0 for r in assessment_rows), len(ids), f'{sum(r["Duplicados_exactos"] == 0 for r in assessment_rows)}/{len(ids)} bancos sin repetición exacta de pregunta, contexto, alternativas, imagen, tabla y estímulo. No mide similitud conceptual.'),
        row(cid, 'Integridad estructural de evaluación final', 'CONTROL ESTRUCTURAL', sum(not r['Incidencias_estructura'] for r in assessment_rows), len(ids), f'{sum(not r["Incidencias_estructura"] for r in assessment_rows)}/{len(ids)} bancos sin incidencias en assessment_issues. No verifica corrección técnico-profesional de la clave.'),
    ])
    for criterion in criteria:
        matrix.append(row(cid, criterion, 'NO CERTIFICADO INTEGRALMENTE', evidence='Componentes y relaciones revisados documentalmente; hallazgos localizados en filas individuales. No se ha aplicado una prueba especializada exhaustiva a todas las actividades bajo este criterio.', finding='No convertir ausencia de alerta en cumplimiento ni valoración cualitativa en porcentaje.', required='Validación especializada antes de certificación', proposal='Completar el contraste por actividad; no modificar sin hallazgo y autorización.'))
    course_summary.append(dict(Curso_ID=cid, Curso=modules[0]['course'], Modulos=len(ids), Desarrollos_observados=len(available), Pestañas_observadas=len(views), Pestañas_esperadas=len(ids)*5, Bloques_HVAC_señalados=len(flagged), Presencia_bloque_HVAC_UI=len(verified), Cumplimiento_control_textual=pct(len(ids)-len(flagged), len(ids)), Cumplimiento_integral=None))
    for m in modules:
        coverage.append(dict(Curso_ID=cid, Curso=m['course'], Modulo_ID=m['id'], Modulo=m['title'], Desarrollo='OBSERVADO' if dev.get(m['id'], {}).get('observed') else dev.get(m['id'], {}).get('state', 'NO OBSERVADO'), Pestañas_observadas=sum((m['id'], k) in tabs for k in keys), Regla_reutilizacion_HVAC='PRESENCIA CONFIRMADA EN UI; CONTRASTAR PERTINENCIA' if m['id'] in confirmed else 'DOCUMENTAL; UI NO CONFIRMADA' if m['id'] in domain else 'NO ACTIVA CONTROL TEXTUAL'))

proposals = []
for mid, flag in domain.items():
    proposal = dict(flag)
    proposal['Curso_ID'] = int(flag['Curso_ID'])
    proposal['Modulo_ID'] = mid
    proposal['Porcentaje_cumplimiento'] = None
    proposal['Estado_actual'] = 'REUTILIZACIÓN DEL BLOQUE HVAC CONFIRMADA EN PANTALLA; PERTINENCIA POR CONTRASTAR' if mid in confirmed else 'REUTILIZACIÓN DOCUMENTAL; EVALUACIÓN ENTREGADA'
    proposal['Cambio_requerido'] = 'Revisión localizada necesaria. Modificar solo si no se demuestra la relación del bloque con la tarea y el criterio; confirmar primero su pertinencia técnico-profesional.' if mid in confirmed else 'Confirmar la versión visible y su pertinencia antes de autorizar el cambio'
    proposal['Autorizacion'] = 'PENDIENTE / NO EJECUTADO EN ESTA AUDITORÍA'
    proposal['Evidencia'] += ' Registro: desarrollos-ui.jsonl, módulo ' + str(mid) + '.'
    if mid == 72:
        proposal['Estado_actual'] = 'DISCREPANCIA CONTRASTADA: TAREA HOTELERA EN INGLÉS Y ANTECEDENTES HVAC'
        proposal['Cambio_requerido'] = 'Sí, corregir el bloque de antecedentes de este desarrollo tras autorización'
        proposal['Hallazgo'] = 'La respuesta al huésped basada en reserva y folleto bilingüe no puede fundamentarse en una planta con UI-01/UI-02 y un drenaje sin destino.'
        proposal['Evidencia_archivo'] = 'evidencias/modulo-72-desarrollo.png'
    proposals.append(proposal)
proposals.extend(manual)
for index, proposal in enumerate(proposals, 1):
    proposal['ID'] = f'CAM-{index:04d}'
    proposal['Cumplen'] = None
    proposal['Revisados'] = None
    matrix.append(proposal)

priorities = collections.Counter(p['Prioridad'] for p in proposals)
summary = dict(Cursos=45, Modulos=len(manifest), Componentes_documentales=read('resumen-relaciones.json')['actividades_con_relaciones'], Desarrollos_recorridos=len(dev), Desarrollos_observados=sum(bool(r.get('observed')) for r in dev.values()), Desarrollos_entregados_no_reabiertos=sum(not r.get('observed') for r in dev.values()), Pestañas_observadas=len(tabs), Pestañas_esperadas=2255, Bloques_HVAC_señalados_documentalmente=len(domain), Presencia_bloque_HVAC_confirmada_UI=len(confirmed), Porcentaje_sin_activar_regla_HVAC=pct(len(manifest)-len(domain), len(manifest)), Promedio_cumplimiento_integral=None, Cursos_cumplen_completamente=None, Cursos_cumplen_parcialmente=None, Cursos_con_brechas_relevantes_integrales=None, Cursos_con_hallazgos_o_alertas=len({int(p['Curso_ID']) for p in proposals}), Cursos_con_brecha_localizada_contrastada=len({int(p['Curso_ID']) for p in manual} | {7}), Propuestas=len(proposals), Propuestas_de_contraste_con_presencia_UI=len(confirmed), Propuestas_documentales_sin_UI=len(domain)-len(confirmed), Prioridades=dict(priorities), Alertas_no_propuestas=len(flags)-len(domain), Cambios_ejecutados_esta_auditoria=0, Contenidos_sin_cambios_durante_auditoria=unchanged)
summary['Cursos_revision_prioritaria'] = [r['Curso_ID'] for r in course_summary if r['Bloques_HVAC_señalados'] or r['Curso_ID'] == 1]
summary['Cursos_con_intervencion_localizada_recomendada'] = [1, 7]

def save_csv(name, rows):
    fields = list(dict.fromkeys(key for r in rows for key in r))
    with (OUT / name).open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

save_csv('tabla-consolidada.csv', matrix)
save_csv('propuestas-localizadas.csv', proposals)
save_csv('resumen-45-cursos.csv', course_summary)
save_csv('cobertura-451-modulos.csv', coverage)
(OUT / 'consolidado.json').write_text(json.dumps(dict(resumen=summary, cursos=course_summary, matriz=matrix, cobertura=coverage), ensure_ascii=False, indent=2), encoding='utf-8')

def esc(v):
    return html.escape(str(v if v is not None else 'No verificado'))

def table(rows, fields, labels=None):
    head = ''.join(f'<th>{esc((labels or {}).get(k,k.replace("_", " ")))}</th>' for k in fields)
    body = []
    for r in rows:
        cells = ''.join('<td>' + esc(r.get(k)) + ('%' if k == 'Porcentaje_cumplimiento' and r.get(k) is not None else '') + '</td>' for k in fields)
        body.append(f'<tr data-course="{esc(r.get("Curso_ID", ""))}">{cells}</tr>')
    return '<div class="scroll"><table><thead><tr>' + head + '</tr></thead><tbody>' + ''.join(body) + '</tbody></table></div>'

options = ''.join(f'<option value="{cid}">{cid:02d} · {esc(ms[0]["course"])}</option>' for cid,ms in courses.items())
document = '''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Diagnóstico consolidado · Aula TP Chile</title><style>
*{box-sizing:border-box}body{margin:0;color:#172c3b;background:#f7f9fb;font:15px/1.5 Arial,sans-serif}header{background:white;border-bottom:1px solid #cbd5df;padding:26px 32px}h1{font-size:27px;margin:0 0 8px}h2{font-size:21px;margin:28px 0 12px}p{max-width:1050px}.notice{border-left:4px solid #b65d00;background:#fff5e7;padding:12px 18px}main{padding:0 32px 40px}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;padding:20px 0;border-bottom:1px solid #cbd5df}.metrics strong{font-size:26px;display:block}.metrics span{color:#506578}.filters{position:sticky;top:0;background:#f7f9fb;padding:12px 0;display:flex;gap:12px;z-index:2}select,input{font:inherit;padding:10px;border:1px solid #a4b7c9;border-radius:4px;max-width:100%}.scroll{overflow:auto;background:white;border:1px solid #cbd5df}table{border-collapse:collapse;width:100%;font-size:13px}th{background:#e8f0f7;text-align:left;white-space:nowrap}th,td{padding:10px;border-bottom:1px solid #dde5eb;vertical-align:top}td{min-width:110px;max-width:430px;overflow-wrap:anywhere}tr:hover{background:#f1f7fc}a{color:#065eac}details{margin:20px 0}summary{cursor:pointer;font-weight:bold}.muted{color:#576c7b}footer{padding:20px 0} [hidden]{display:none!important}@media(max-width:700px){header,main{padding-left:14px;padding-right:14px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.filters{flex-direction:column}h1{font-size:23px}}
</style><header><h1>Diagnóstico consolidado de los 45 cursos</h1><p>Revisión documental y recorrido de módulos · 8 de octubre de 2026. Resultados para decidir qué revisar y autorizar, no una certificación integral de calidad.</p><div class="notice"><strong>No se han modificado cursos en esta auditoría.</strong> Las propuestas están pendientes de autorización. Los porcentajes se calculan solo sobre controles definidos; “No verificado” no significa 0%.</div></header><main>'''
document += f'<div class="metrics"><div><strong>45 / 45</strong><span>Cursos identificados</span></div><div><strong>451 / 451</strong><span>Módulos recorridos</span></div><div><strong>{summary["Desarrollos_observados"]} / 451</strong><span>Desarrollos visibles; cuatro entregados</span></div><div><strong>{len(tabs)} / 2255</strong><span>Pestañas observadas en este recorrido</span></div></div>'
document += '<h2>Resultados y límites</h2><p><strong>Promedio de cumplimiento general: no verificado.</strong> No se asigna un porcentaje ficticio a la nitidez, seguridad técnica, prueba de cinco segundos o calidad integral. Tampoco se utilizan notas de estudiantes simulados como resultados de la auditoría.</p>'
document += f'<p>El control documental acotado de antecedentes arroja <strong>{summary["Porcentaje_sin_activar_regla_HVAC"]}%</strong> sin activar la regla de reutilización HVAC ({len(manifest)-len(domain)}/451). Hay {len(domain)} módulos señalados: la presencia del bloque está confirmada en pantalla en {len(confirmed)} y en contenido en {len(domain)-len(confirmed)} con evaluación entregada. Esto no demuestra por sí solo una incompatibilidad técnica en todos ellos: antes de sustituir el bloque debe contrastarse su relación con cada tarea y criterio. Los módulos no señalados tampoco quedan certificados.</p>'
document += f'<p>Propuestas localizadas: <strong>{len(proposals)}</strong> ({priorities["Alta"]} altas, {priorities["Media"]} medias, {priorities["Baja"]} bajas). Incluyen propuestas de contraste; no todas autorizan una sustitución inmediata. Las otras {summary["Alertas_no_propuestas"]} señales automáticas no se contabilizan como cambios necesarios.</p>'
document += '<p>Cantidad y porcentaje de cursos que cumplen completamente, parcialmente o presentan brechas <em>integrales</em>: no determinados. Hay propuestas de revisión en 45/45 cursos. Las observaciones manuales y el desarrollo hotelero contrastado documentan brechas localizadas en ' + str(summary['Cursos_con_brecha_localizada_contrastada']) + '/45 (' + str(pct(summary['Cursos_con_brecha_localizada_contrastada'],45)) + '%); es un mínimo observado, no la prevalencia integral. No se clasifica el resto del curso. Los 45 requieren completar validación especializada antes de certificarlos.</p>'
document += '<p>Controles mejor resueltos: 451/451 bancos sin duplicados exactos y sin incidencias estructurales, con 11.275 preguntas revisadas; carga de imágenes, selección programática de pestaña y ausencia de desbordamiento en las vistas observadas, según numeradores de la matriz. Principal control con alerta: reutilización de antecedentes del desarrollo. No es posible ordenar los 21 criterios expertos por cumplimiento sin completar su medición.</p>'
document += '<h2>Descargas</h2><p><a href="tabla-consolidada.csv">Tabla completa por curso y criterio</a> · <a href="propuestas-localizadas.csv">Propuestas individuales</a> · <a href="resumen-45-cursos.csv">Resumen de 45 cursos</a> · <a href="cobertura-451-modulos.csv">Cobertura de 451 módulos</a> · <a href="alertas-pedagogicas.csv">Alertas para contraste, no cambios aprobados</a></p>'
document += '<div class="filters"><select id="course" aria-label="Filtrar curso"><option value="">Todos los cursos</option>' + options + '</select><input id="search" type="search" aria-label="Buscar criterio o hallazgo" placeholder="Buscar criterio, módulo o hallazgo"></div>'
document += '<h2>Comparación por curso</h2>' + table(course_summary, ['Curso_ID','Curso','Modulos','Desarrollos_observados','Pestañas_observadas','Pestañas_esperadas','Bloques_HVAC_señalados','Presencia_bloque_HVAC_UI','Cumplimiento_control_textual','Cumplimiento_integral'])
document += '<h2>Propuestas pendientes de autorización</h2><p>Intervención localizada recomendada de prioridad alta: Refrigeración y Climatización (curso 1, respaldo curricular y atribución de evidencia del módulo 1) y Servicios de Hotelería (curso 7, antecedentes del módulo 72). En los demás, priorizar el contraste del bloque HVAC antes de decidir una sustitución. Cada fila indica el elemento exacto, la evidencia y el motivo. Las observaciones de recursos gráficos son localizadas: no justifican reemplazar todas las imágenes.</p>' + table(proposals, ['ID','Curso','Modulo_ID','Modulo','Actividad','Criterio','Estado_actual','Evidencia','Hallazgo','Cambio_requerido','Cambio_propuesto','Justificacion','Prioridad','Autorizacion'])
document += '<details><summary>Matriz de criterios y porcentajes de controles</summary>' + table([r for r in matrix if not r.get('ID')], ['Curso','Criterio','Estado_actual','Porcentaje_cumplimiento','Cumplen','Revisados','Evidencia','Hallazgo','Cambio_requerido','Cambio_propuesto','Justificacion','Prioridad','Autorizacion']) + '</details>'
document += '<details><summary>Cobertura módulo por módulo</summary>' + table(coverage, ['Curso_ID','Curso','Modulo_ID','Modulo','Desarrollo','Pestañas_observadas','Regla_reutilizacion_HVAC']) + '</details>'
document += '<h2>Evidencia y método</h2><p>Lectura de la base en modo solo lectura y del contenido enriquecido que usa la aplicación, 55.938 componentes inventariados, navegación sin responder ni entregar evaluaciones, comparación con el programa MINEDUC donde se indica expresamente. Los contenidos ' + ('mantienen las mismas huellas durante el recorrido.' if unchanged else 'cambiaron durante el recorrido: revisar vigencia del diagnóstico antes de autorizar.') + '</p><p>Separación de integridades: <strong>estructural</strong> (campos y carga), <strong>pedagógica</strong> (relación entre tarea y evidencia), <strong>visual</strong> (representación observada). Un resultado favorable en una no acredita las otras.</p>'
document += '<p>La prueba de cinco segundos no se ha simulado mediante lectura del DOM. Las miniaturas de la galería no acreditan nitidez en pantalla. Las alertas por longitud de alternativa solo indican asimetría medida, no que el alumno pueda resolver por una pista. Los cuatro desarrollos cerrados son una limitación de acceso, no un defecto.</p>'
document += '<p><a href="evidencias/modulo-72-desarrollo.png">Captura del desarrollo del módulo 72</a> · <a href="evidencias/modulo-72-desarrollo.txt">Texto observado del módulo 72</a> · <a href="evidencias/mineduc-refrigeracion-p37.png">Página oficial de AE3 y AE4</a> · <a href="desarrollos-ui.jsonl">Registros de desarrollos</a> · <a href="pestanas-ui.jsonl">Registros de pestañas</a> · <a href="relaciones-por-actividad.json">Relaciones por actividad</a></p><p class="muted">El recorrido de entrada anterior está en ../recorrido-451-modulos-20261007/informe-recorrido.html; las 29 preguntas duplicadas ya corregidas no se presentan como problemas pendientes de este diagnóstico.</p>'
document += '''<footer>Diagnóstico para revisión humana. Autorización individual pendiente. Ninguna recomendación modifica respuestas, notas o progresión.</footer></main><script>
const course=document.getElementById('course'),search=document.getElementById('search');
function filter(){const q=search.value.toLocaleLowerCase('es');for(const r of document.querySelectorAll('tbody tr'))r.hidden=!!((course.value&&r.dataset.course!==course.value)||(q&&!r.textContent.toLocaleLowerCase('es').includes(q)));}
course.addEventListener('change',filter);search.addEventListener('input',filter);
</script></html>'''
(OUT / 'informe.html').write_text(document, encoding='utf-8')
print(json.dumps(summary, ensure_ascii=False, indent=2))
