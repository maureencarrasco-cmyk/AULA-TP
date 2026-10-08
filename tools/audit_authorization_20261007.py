"""Read-only structural audit. Reports only; never imports the application."""
import collections
import argparse
import datetime
import hashlib
import html
import json
import sqlite3
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--output', default='auditoria-autorizacion-20261007')
OUT = ROOT / 'reports' / parser.parse_args().output
OUT.mkdir(parents=True, exist_ok=True)
DB = ROOT / 'data' / 'aulatp.sqlite3'
con = sqlite3.connect(DB.as_uri() + '?mode=ro', uri=True)
con.row_factory = sqlite3.Row
con.execute('PRAGMA query_only=ON')
con.execute('BEGIN')
courses = [dict(r) for r in con.execute('SELECT id,title,specialty,level FROM courses ORDER BY id')]
modules = [dict(r) for r in con.execute('SELECT * FROM modules ORDER BY course_id,position,id')]
assert len(courses) == 45, 'Expected exactly 45 individually identified courses'
criteria = {
 'S01': ('Publicacion', 'modulos publicados', 'Alta', 'Revisar la causa de despublicacion y proponer habilitar published solamente tras validar el modulo.'),
 'S02': ('AE presentes', 'modulos con al menos un AE', 'Alta', 'Incorporar los AE oficiales del modulo con fuente y criterio, previa validacion curricular.'),
 'S03': ('Trazabilidad declarada de AE', 'AE con official_code y criteria no vacios', 'Alta', 'Completar official_code o criteria del AE indicado usando el programa oficial, sin inventar codigos.'),
 'S04': ('Secuencia registrada de AE', 'AE con seis experiencias o seis pasos', 'Media', 'Revisar la secuencia del AE indicado y completar las etapas ausentes; no agregar actividades solo para alcanzar el conteo.'),
 'S05': ('25 preguntas finales', 'modulos con exactamente 25 preguntas', 'Alta', 'Revisar questions del modulo indicado y ajustar el banco a 25 items validados, sin eliminar preguntas automaticamente.'),
 'S06': ('15 situaciones integradoras', 'modulos con exactamente 15 casos', 'Media', 'Confirmar el diseno del modulo y completar o ajustar cases a 15 situaciones pertinentes si corresponde.'),
 'S07': ('Estructura de alternativas y clave', 'items finales/integradores con 4 alternativas distintas no vacias y clave entera 0-3', 'Alta', 'Corregir options o answer en el item localizado; la clave debe ser confirmada por especialista antes de publicarse.'),
 'S08': ('Relacion declarada con AE', 'items finales/integradores con indice ae entero valido', 'Alta', 'Asignar ae al aprendizaje realmente evaluado en el item localizado; verificar la pertinencia antes de guardar.'),
 'S09': ('Explicacion registrada', 'items finales/integradores con explanation no vacia', 'Media', 'Redactar explanation del item localizado con razon y evidencia tecnica; no revelar respuestas durante el examen.'),
 'S10': ('Desarrollo y rubrica registrados', 'modulos con development y rubric no vacios', 'Alta', 'Confirmar si corresponde desarrollo; completar la consigna o rubrica del modulo indicado si es obligatorio.'),
 'S11': ('Escena registrada', 'modulos con scene y parts no vacios', 'Media', 'Completar scene.parts del modulo indicado tras definir acciones y evidencias; no equivale a validar el funcionamiento 3D.'),
 'S12': ('Archivos locales referenciados', 'referencias /static/ o docs/ que existen y no estan vacias', 'Alta', 'Restituir el archivo indicado o corregir su ruta exacta; comprobar su contenido y visualizacion antes de aprobar.'),
}
dimensions = ['Vinculacion curricular', 'Contextualizacion', 'Aprendizajes Esperados', 'Progresion didactica', 'Actividades', 'Situacion Integradora', 'Situacion 3D', 'Evaluacion', 'Retroalimentacion', 'Agente pedagogico', 'Practica libre', 'Autonomia', 'DUA e inclusion', 'Brousseau', 'Duval', 'Tiempo pedagogico', 'Exactitud disciplinar', 'Seguridad / normativa', 'UX pedagogica']
detail, matrix, inventory = [], [], []
totals = collections.Counter()
file_checks = {}

def text(v):
    if isinstance(v, dict):
        return str(v.get('text') or v.get('label') or v.get('title') or '')
    return str(v or '')

def refs(v, path='content'):
    if isinstance(v, dict):
        for k, x in v.items():
            yield from refs(x, path + '.' + k)
    elif isinstance(v, list):
        for i, x in enumerate(v):
            yield from refs(x, f'{path}[{i}]')
    elif isinstance(v, str) and (v.startswith('/static/') or v.startswith('docs/')):
        yield path, v

for course in courses:
    ms = [m for m in modules if m['course_id'] == course['id']]
    checks = {k: [] for k in criteria}
    for m in ms:
        c = json.loads(m['content'])
        aes = c.get('aes') or []
        q = c.get('questions') or []
        cases = c.get('cases') or []
        totals.update(modulos=1, ae=len(aes), preguntas=len(q), casos=len(cases))
        inventory.append(dict(Curso_ID=course['id'], Curso=course['title'], Modulo_ID=m['id'], Modulo=m['title'], Posicion=m['position'], Publicado=m['published'], AE=len(aes), Preguntas=len(q), Situaciones=len(cases), SHA256_content=hashlib.sha256(m['content'].encode()).hexdigest()))
        def check(k, path, valid, actual):
            checks[k].append((m, path, bool(valid), actual))
        check('S01', 'published', m['published'] == 1, m['published'])
        check('S02', 'content.aes', len(aes) > 0, f'{len(aes)} AE')
        check('S05', 'content.questions', len(q) == 25, f'{len(q)} preguntas')
        check('S06', 'content.cases', len(cases) == 15, f'{len(cases)} casos')
        check('S10', 'content.development / content.rubric', bool(c.get('development')) and bool(c.get('rubric')), f'development={bool(c.get("development"))}; rubric={bool(c.get("rubric"))}')
        check('S11', 'content.scene.parts', bool((c.get('scene') or {}).get('parts')), f'{len((c.get("scene") or {}).get("parts") or [])} partes')
        for a, ae in enumerate(aes):
            path = f'content.aes[{a}]'
            check('S03', path, bool(ae.get('official_code')) and bool(ae.get('criteria')), f'codigo={ae.get("official_code")}; criterios={len(ae.get("criteria") or [])}')
            seq = ae.get('learning_sequence') or ae.get('experiences') or ae.get('steps') or []
            check('S04', path, len(seq) == 6, f'{len(seq)} etapas registradas; no se mide calidad cognitiva')
            for i, x in enumerate(seq):
                inventory.append(dict(Curso_ID=course['id'], Curso=course['title'], Modulo_ID=m['id'], Modulo=m['title'], Elemento=f'{path}.secuencia[{i}]', Enunciado=text(x.get('prompt') or x.get('title')) if isinstance(x, dict) else text(x), Revision_semantica='NO AUDITADO'))
                totals['actividades_ae'] += 1
        for kind, items in [('questions', q), ('cases', cases)]:
            for i, item in enumerate(items):
                path = f'content.{kind}[{i}]'
                opts = [text(o).strip() for o in item.get('options') or []]
                ans = item.get('answer')
                valid = len(opts) == 4 and all(opts) and len(set(o.casefold() for o in opts)) == 4 and type(ans) is int and 0 <= ans < 4
                check('S07', path, valid, f'{len(opts)} alternativas; answer={ans}; distintas={len(set(o.casefold() for o in opts))}')
                ae = item.get('ae')
                check('S08', path, type(ae) is int and 0 <= ae < len(aes), f'ae={ae}; indices permitidos 0..{len(aes)-1}')
                check('S09', path, bool(text(item.get('explanation')).strip()), f'explicacion={text(item.get("explanation"))}')
                inventory.append(dict(Curso_ID=course['id'], Curso=course['title'], Modulo_ID=m['id'], Modulo=m['title'], Elemento=path, Enunciado=text(item.get('question') or item.get('prompt')), AE=ae, Clave=ans, Revision_semantica='NO AUDITADO'))
        for path, value in refs(c):
            local = ROOT / unquote(urlsplit(value).path).lstrip('/')
            if local not in file_checks:
                file_checks[local] = local.is_file() and local.stat().st_size > 0
            check('S12', path, file_checks[local], value)
    for k, (name, unit, priority, proposal) in criteria.items():
        observations = checks[k]
        n = len(observations)
        ok = sum(x[2] for x in observations)
        failures = [x for x in observations if not x[2]]
        pct = 100 * ok / n if n else None
        identity = f'C{course["id"]:02d}-{k}'
        matrix.append(dict(ID=identity, Curso_ID=course['id'], Curso=course['title'], Nivel=course['level'], Criterio=name, Estado_actual='CUMPLE CONTROL ESTRUCTURAL' if n and not failures else 'BRECHA ESTRUCTURAL' if failures else 'NO VERIFICABLE', Porcentaje_cumplimiento=round(pct, 4) if pct is not None else None, Cumplen=ok, Revisados=n, Evidencia=f'{ok}/{n} {unit}. Detalle individual en la tabla de evidencia; fuente: modules.content/publicacion, lectura SQLite actual.', Hallazgo=f'{len(failures)} unidades no cumplen este control' if failures else 'Sin brecha en este control; no certifica pertinencia ni calidad.', Cambio_requerido='Si, sujeto a revision' if failures else 'No demostrado' if not n else 'No', Cambio_propuesto=proposal + f' Aplicar solo a las {len(failures)} ubicaciones fallidas del ID {identity}.' if failures else 'Ninguno; conservar y completar validacion especializada.', Justificacion='La ausencia o inconsistencia estructural dificulta el uso o la trazabilidad; confirmar alcance antes de intervenir.' if failures else 'No existe evidencia suficiente para recomendar modificar este elemento.', Prioridad=priority if failures else 'No aplica', Autorizacion='PENDIENTE; NO EJECUTADO' if failures else 'SIN SOLICITUD DE CAMBIO'))
        for m, path, valid, actual in observations:
            detail.append(dict(ID=identity, Curso=course['title'], Modulo_ID=m['id'], Modulo=m['title'], Ubicacion=path, Criterio=name, Resultado='Cumple control' if valid else 'No cumple control', Evidencia_actual=actual, Cambio_propuesto='Ninguno' if valid else proposal, Prioridad='No aplica' if valid else priority, Autorizacion='NO EJECUTADO'))
    for i, dimension in enumerate(dimensions, 1):
        matrix.append(dict(ID=f'C{course["id"]:02d}-NV{i:02d}', Curso_ID=course['id'], Curso=course['title'], Nivel=course['level'], Criterio=dimension + ' - validacion integral', Estado_actual='NO AUDITADO / NO VERIFICABLE', Porcentaje_cumplimiento=None, Cumplen=None, Revisados=None, Evidencia=f'{len(ms)} modulos identificados. No hay en esta revision recorrido completo, microauditoria humana y contraste externo de esta dimension en cada actividad.', Hallazgo='Brecha de evidencia de auditoria; NO demuestra un defecto del contenido.', Cambio_requerido='No determinable', Cambio_propuesto='No modificar. Completar revision de todos los modulos y actividades para esta dimension y documentar evidencia antes de proponer ajustes.', Justificacion='El documento exige validar aprendizaje, contenido y funcionamiento, no solo campos presentes.', Prioridad='Alta' if dimension in ['Exactitud disciplinar', 'Seguridad / normativa', 'Evaluacion'] else 'Media', Autorizacion='BLOQUEADA HASTA CONTAR CON EVIDENCIA'))

summary_courses = []
for course in courses:
    rows = [r for r in matrix if r['Curso_ID'] == course['id'] and r['Revisados'] is not None and r['Revisados'] > 0]
    score = sum(100*r['Cumplen']/r['Revisados'] for r in rows)/len(rows)
    issues = [r for r in rows if r['Cambio_requerido'].startswith('Si')]
    state = 'Cumple controles estructurales' if not issues else 'Brechas estructurales relevantes' if any(r['Prioridad']=='Alta' for r in issues) else 'Cumplimiento estructural parcial'
    summary_courses.append(dict(Curso_ID=course['id'], Curso=course['title'], Modulos=sum(m['course_id']==course['id'] for m in modules), Promedio_controles_estructurales=round(score,4), Estado_estructural=state, Validacion_integral='NO VERIFICABLE', Propuestas_criterio_curso=len(issues), Alta=sum(r['Prioridad']=='Alta' for r in issues), Media=sum(r['Prioridad']=='Media' for r in issues), Baja=sum(r['Prioridad']=='Baja' for r in issues)))
summary_criteria = []
for k, (name, unit, _, _) in criteria.items():
    rs = [r for r in matrix if r['ID'].endswith('-'+k)]
    n, ok = sum(r['Revisados'] for r in rs), sum(r['Cumplen'] for r in rs)
    summary_criteria.append(dict(Criterio=name, Cumplen=ok, Revisados=n, Porcentaje=round(100*ok/n,4) if n else None, Unidad=unit))
proposals = [r for r in matrix if r['Cambio_requerido'].startswith('Si')]
states = collections.Counter(r['Estado_estructural'] for r in summary_courses)
summary = dict(Fecha=datetime.datetime.now().astimezone().isoformat(), Alcance='Inventario y controles estructurales exhaustivos de datos almacenados. NO auditoria integral terminada.', Cursos=len(courses), Conteos=dict(totals), Filas_matriz=len(matrix), Promedio_general_integral=None, Promedio_estructural=sum(r['Promedio_controles_estructurales'] for r in summary_courses)/45, Clasificacion_estructural={k:dict(cantidad=v,porcentaje=100*v/45) for k,v in states.items()}, Cursos_integralmente_validados=0, Cursos_integrales_no_verificables=45, Cambios_propuestos=len(proposals), Unidad_cambio='Una propuesta por curso y criterio; puede afectar multiples ubicaciones. No se cuentan las tareas NV como modificaciones.', Prioridades=dict(collections.Counter(r['Prioridad'] for r in proposals)), Ubicaciones_con_brecha=sum(r['Resultado']=='No cumple control' for r in detail), Cambios_ejecutados=0)
payload = dict(resumen=summary, cursos=summary_courses, criterios=summary_criteria, matriz=matrix, evidencia=detail, inventario=inventory)
(OUT/'resultados.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')

def table(rows):
    cols=list(dict.fromkeys(k for r in rows for k in r))
    return '<div class="scroll"><table><thead><tr>'+''.join('<th>'+html.escape(k.replace('_',' '))+'</th>' for k in cols)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+html.escape('NV' if r.get(k) is None else str(r.get(k)))+'</td>' for k in cols)+'</tr>' for r in rows)+'</tbody></table></div>'

ranking=sorted((r for r in summary_criteria if r['Porcentaje'] is not None),key=lambda r:r['Porcentaje'])
priority_courses=[r for r in summary_courses if r['Alta']]
page='''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Auditoria previa a autorizacion - Aula TP Chile</title><style>body{font:16px Arial,sans-serif;margin:24px;color:#163347;background:#fff}h1{font-size:26px}h2{font-size:21px;margin-top:30px}p{max-width:1100px;line-height:1.5}.notice{border-left:5px solid #db8b00;padding:16px;background:#fff5de}.scroll{overflow:auto;max-height:650px;border:1px solid #c5d4df}table{border-collapse:collapse;font-size:13px}th,td{padding:9px;border:1px solid #dce5eb;min-width:120px;max-width:400px;vertical-align:top;overflow-wrap:anywhere}th{position:sticky;top:0;background:#e7f2f5}input{padding:12px;max-width:90%;width:450px}a{color:#005fc2}nav{display:flex;gap:16px;flex-wrap:wrap}</style>
<h1>Aula TP Chile: matriz previa a autorizacion</h1><p>7 de octubre de 2026. Diagnostico de los 45 cursos identificados individualmente.</p>
<p class="notice"><strong>AUDITORIA INTEGRAL PENDIENTE.</strong> No se modificaron cursos. Los porcentajes son mediciones estructurales reales, no estimaciones ni certificaciones de calidad pedagogica. El porcentaje general integral y la clasificacion completa/parcial/brechas integral son NO VERIFICABLES. Los 45 cursos permanecen sin validacion integral. No equivale a que los 45 cursos esten incorrectos.</p>
<nav><a href="#resumen">Resumen</a><a href="#cursos">45 cursos</a><a href="#criterios">Criterios</a><a href="#matriz">Matriz de autorizacion</a><a href="#evidencia">Evidencia individual</a><a href="resultados.json">Datos completos</a></nav>
<h2>Metodo y limites</h2><p>Fuente actual: data/aulatp.sqlite3, transaccion de lectura consistente con mode=ro y query_only. Se comprobaron todos los modulos y los elementos almacenados, sin importar ni inicializar la aplicacion. Cada porcentaje = unidades que cumplen / unidades revisadas x 100. Un campo vacio o referencia ausente no se convierte en porcentaje de calidad. Los controles se identifican S01-S12; las 19 dimensiones del documento tienen filas NV separadas por curso.</p>
<p>Promedio estructural por curso: media simple de los porcentajes de S01-S12 con denominador positivo. Promedio de 45 cursos: media simple de esos promedios. No se pondera por numero de preguntas ni se asigna 0 a NV. Clasificacion estructural: completa = todos los controles medibles cumplen; parcial = fallos sin prioridad alta; brechas relevantes = al menos un control fallido de prioridad alta. Esta clasificacion no sustituye el semaforo integral del documento.</p>
<p>La presencia de codigo, criterio o explicacion no demuestra alineacion, exactitud de clave, calidad de distractores, vigencia normativa ni eficacia del feedback. No se hicieron pruebas completas de navegacion, persistencia, respuestas, Nubi, accesibilidad, pantallas moviles ni simulaciones 3D por cada curso. Tampoco se contrasto cada afirmacion con expertos y fuentes externas. Actividades generadas solo en la interfaz y contenido de contextualizacion/cierre requieren inventario y microauditoria adicional; no se incluyen falsamente como revisados.</p>
<p>El adjunto es referencia de criterios. Sus instrucciones de corregir y reauditar NO se ejecutan: prevalece la solicitud actual de diagnosticar y esperar autorizacion. No se utilizo la escala subjetiva 0-4 para inventar puntuaciones. Las mediciones actuales sustituyen resultados antiguos solo en estos controles.</p>
<h2 id="resumen">Resumen consolidado</h2>'''
page+=f'<p>45 cursos; {totals["modulos"]} modulos; {totals["ae"]} AE; {totals["actividades_ae"]} entradas de secuencia; {totals["preguntas"]} preguntas finales; {totals["casos"]} situaciones. Cobertura del inventario de modulos: 451/451 (100 %). Cobertura de validacion integral: no completada.</p>'
page+=f'<p><strong>Promedio general integral: NV.</strong> Promedio de controles estructurales: {summary["Promedio_estructural"]:.2f} %. Cursos certificados completamente: 0/45 (0 %); clasificacion integral parcial o con brechas: NV; pendientes de validacion integral: 45/45 (100 %).</p>'
page+=table([dict(Clasificacion_estructural=k,Cantidad=v,Porcentaje=round(100*v/45,2)) for k,v in states.items()])
page+=f'<p>Cambios propuestos: {len(proposals)} (unidad: curso-criterio). Alta: {summary["Prioridades"].get("Alta",0)}; media: {summary["Prioridades"].get("Media",0)}; baja: {summary["Prioridades"].get("Baja",0)}. Ubicaciones estructurales fallidas: {summary["Ubicaciones_con_brecha"]}. Cambios ejecutados: 0. Las {45*19} filas NV son tareas de auditoria, no cambios de contenido.</p>'
page+='<p>Mayor cumplimiento estructural: '+html.escape('; '.join(f'{r["Criterio"]}: {r["Porcentaje"]:.2f} %' for r in ranking if r['Porcentaje']==ranking[-1]['Porcentaje']))+'. Menor: '+html.escape('; '.join(f'{r["Criterio"]}: {r["Porcentaje"]:.2f} %' for r in ranking if r['Porcentaje']==ranking[0]['Porcentaje']))+'.</p>'
page+='<p>Prioridad de revision por brechas estructurales de alta prioridad: '+html.escape('; '.join(r['Curso'] for r in priority_courses) or 'Ninguno identificado por estos controles')+'. No es una orden de intervencion: se requiere confirmar cada propuesta. Todos necesitan completar revision de seguridad, exactitud y evaluacion antes de validar.</p>'
page+='<h2 id="cursos">Resumen individual de 45 cursos</h2>'+table(summary_courses)
page+='<h2 id="criterios">Resultados por criterio medible</h2>'+table(summary_criteria)
page+='<h2>Consulta</h2><label for="search">Filtrar por curso, criterio, ID o modulo</label><br><input id="search" type="search"><p>El filtro afecta las tablas de detalle; el resumen consolidado no cambia.</p>'
page+='<section id="filtered"><h2 id="matriz">Matriz curso por criterio y autorizacion</h2>'+table(matrix)
page+='<h2 id="evidencia">Evidencia individual de las brechas</h2><p>Esta tabla localiza todas las unidades fallidas. El archivo resultados.json conserva el registro completo de todas las unidades comprobadas, incluidas las que cumplen, y el inventario de preguntas y actividades. Los indices [0] corresponden al primer elemento visible, [1] al segundo, etc.</p>'+table([r for r in detail if r['Resultado']=='No cumple control'])
page+='</section><h2>Condicion de autorizacion</h2><p>Para aprobar o rechazar, identificar ID de propuesta y ubicacion. No hay autorizaciones concedidas. Si falta evidencia especializada, no se propone reemplazo tecnico concreto: primero debe completarse la auditoria correspondiente. No se declara terminado el encargo de validacion integral.</p><script>document.getElementById("search").addEventListener("input",e=>{const s=e.target.value.toLocaleLowerCase("es");document.querySelectorAll("#filtered tbody tr").forEach(r=>r.hidden=!r.textContent.toLocaleLowerCase("es").includes(s));});</script></html>'
(OUT/'informe.html').write_text(page,encoding='utf-8')
con.rollback()
con.close()
print(json.dumps(summary,ensure_ascii=True,indent=2))
