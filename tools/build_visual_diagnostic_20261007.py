"""Document observed evidence and explicit gaps without modifying the portal."""
import collections
import datetime
import hashlib
import html
import json
import sqlite3
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports' / 'auditoria-pedagogica-visual-20261007'
REFERENCE = Path('C:/Users/Martín/Downloads/Prompt_Experto_Auditoria_Pedagogica_Visual_Aula_TP_Actualizado.docx')
with zipfile.ZipFile(REFERENCE) as archive:
    tree = ET.fromstring(archive.read('word/document.xml'))
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
paragraphs = [''.join(p.itertext()) for p in tree.findall('.//w:p', ns)]
headings = []
for paragraph in paragraphs:
    start = paragraph.split('.', 1)[0]
    if start.isdigit() and 1 <= int(start) <= 21:
        headings.append((int(start), paragraph.split('.', 1)[1].strip()))
assert len(headings) == 21
base = json.loads((OUT / 'resultados.json').read_text(encoding='utf-8'))
rows = [r for r in base['matriz'] if '-S' in r['ID']]
courses = base['cursos']
observations = []
alt_details = []
with sqlite3.connect((ROOT / 'data/aulatp.sqlite3').as_uri()+'?mode=ro', uri=True) as db:
    modules = list(db.execute('SELECT id,course_id,title,content FROM modules ORDER BY course_id,position,id'))
    m1 = json.loads(next(raw for mid,cid,title,raw in modules if mid == 1))
    case = m1['cases'][1]
    assert case['title'] == 'Dos recintos, la misma etiqueta'
    assert 'oficio-plano-leyenda.png' in case['image']
    for course in courses:
        images = []
        def walk(value, location):
            if isinstance(value, dict):
                if isinstance(value.get('image'), str) and value['image']:
                    images.append((location+'.image', value['image'], bool(str(value.get('alt') or '').strip())))
                for key, child in value.items():
                    walk(child, location+'.'+key)
            elif isinstance(value, list):
                for index, child in enumerate(value):
                    walk(child, f'{location}[{index}]')
        for mid,cid,title,raw in modules:
            if cid == course['Curso_ID']:
                walk(json.loads(raw), f'module:{mid}.content')
        n = len(images)
        ok = sum(x[2] for x in images)
        for location, image, has_alt in images:
            if not has_alt:
                alt_details.append(dict(Curso_ID=course['Curso_ID'],Curso=course['Curso'],Ubicacion=location,Referencia=image,Estado='Sin alt en este objeto almacenado',Accion='Verificar si se renderiza, si hereda una descripcion y si es decorativa. No modificar automaticamente.',Autorizacion='NO AUTORIZADO'))
        rows.append(dict(ID=f'C{course["Curso_ID"]:02d}-D01', Curso_ID=course['Curso_ID'], Curso=course['Curso'], Nivel='3° y 4° medio', Criterio='Texto alternativo registrado en referencias image', Estado_actual='CAMPO PRESENTE' if ok == n and n else 'REGISTRO PARCIAL' if n else 'NO VERIFICABLE', Porcentaje_cumplimiento=round(100*ok/n,4) if n else None, Cumplen=ok, Revisados=n, Evidencia=f'{ok}/{n} referencias image tienen alt no vacio. Se cuentan usos, no archivos unicos. La pertinencia y accesibilidad real del texto no se han validado.', Hallazgo='Sin alerta de presencia' if ok==n else f'{n-ok} referencias sin alt; comprobar si son decorativas antes de recomendar cambios.', Cambio_requerido='No determinado; requiere revisar funcion de la imagen' if ok<n else 'No', Cambio_propuesto='Revisar solo el texto alternativo de las referencias sin alt; no modificar estructura ni imagen automaticamente.' if ok<n else 'Conservar; comprobar equivalencia visual antes de validar.', Justificacion='La presencia de alt es un control documental, no una prueba de comprension o conformidad de accesibilidad.', Prioridad='Media' if ok<n else 'No aplica', Autorizacion='NO AUTORIZADO / NO EJECUTADO'))
        for number, name in headings:
            rows.append(dict(ID=f'C{course["Curso_ID"]:02d}-PV{number:02d}', Curso_ID=course['Curso_ID'], Curso=course['Curso'], Nivel='3° y 4° medio', Criterio=name, Estado_actual='NO AUDITADO INTEGRALMENTE', Porcentaje_cumplimiento=None, Cumplen=None, Revisados=None, Evidencia=f'{course["Modulos"]} modulos inventariados. No se dispone de revision individual completa de todas las pantallas/actividades para este criterio; las observaciones puntuales no se generalizan al curso.', Hallazgo='Cobertura de evidencia pendiente; no significa que el curso sea incorrecto.', Cambio_requerido='No es posible determinarlo', Cambio_propuesto='Ninguna modificacion. Completar observacion de este criterio en cada pantalla, con anterior y siguiente, antes de proponer una revision localizada.', Justificacion='El documento actualizado exige evidencia pedagogica y visual, y conservar elementos sin problemas demostrados.', Prioridad='Pendiente de determinar', Autorizacion='NO AUTORIZADO / NO EJECUTADO'))

visual = dict(ID='C01-PV05-M01-C02', Curso_ID=1, Curso=courses[0]['Curso'], Nivel='3° y 4° medio', Criterio='Relacion texto-imagen y momento de la actividad', Estado_actual='RELACION DEBIL PARA COMPROBAR LA DUPLICACION', Porcentaje_cumplimiento=None, Cumplen=None, Revisados=1, Evidencia='Modulo ID 1, cases[1], caso 2: el contexto describe dos boxes etiquetados UI-01. El archivo oficio-plano-leyenda.png observado muestra una sola etiqueta UI-01 en SALA 01, y SALA 02 sin segunda unidad etiquetada. Inspeccion del archivo original; no se midio legibilidad en todos los tamanos de interfaz.', Hallazgo='La imagen no permite comprobar visualmente la duplicacion descrita. El contexto escrito si entrega el dato; no se demuestra que la consigna completa sea irresoluble.', Cambio_requerido='Revision localizada necesaria; modificacion posterior no definida', Cambio_propuesto='Revisar la asociacion content.cases[1].image y su caption/alt en el modulo 1. Determinar si funciona como contexto complementario o evidencia del caso antes de aprobar cualquier ajuste. No cambiar consigna, alternativas, clave, secuencia ni distribucion.', Justificacion='Evitar que el estudiante busque en el recurso visual una segunda etiqueta que no aparece. La revision se fundamenta en coherencia comunicacional, no en gusto estetico.', Prioridad='Media', Autorizacion='PENDIENTE DE REVISION Y AUTORIZACION; NO EJECUTADO')
rows.append(visual)
observations.append(dict(ID=visual['ID'], Curso=visual['Curso'], Modulo_ID=1, Actividad='Situacion integradora 2', Objetivo='Detectar la duplicacion y contrastar el listado de equipos', Coherencia_pedagogica='No se califica el conjunto sin microauditoria', Cumplimiento='NO ES POSIBLE DETERMINARLO integralmente', Texto_imagen='DEBIL para comprobar duplicacion; complementaria para contexto HVAC', Comprension='El texto explicita la discrepancia; comprension en interfaz no comprobada', Nitidez='NV en tamaño real de visualizacion', Tres_D='No se clasifica exactitud 3D por apariencia', Exactitud_TP='NV; no se infiere seguridad de la imagen', Impacto='MEDIO: posible busqueda infructuosa de evidencia visual', Observacion=visual['Hallazgo']))
observations.append(dict(ID='C01-OBS-M01-C01', Curso=courses[0]['Curso'], Modulo_ID=1, Actividad='Situacion integradora 1', Objetivo='Consultar leyenda ante trazo sin identificacion', Coherencia_pedagogica='NV integral', Cumplimiento='NO ES POSIBLE DETERMINARLO', Texto_imagen='COMPLEMENTARIA: cassette y drenaje; no contiene plano ni leyenda', Comprension='No evaluada en interfaz ni con estudiantes', Nitidez='NV en tamaño real', Tres_D='NV', Exactitud_TP='NV', Impacto='No asignado: no se ha demostrado un defecto', Observacion='Archivo oficio-drenaje.png inspeccionado. No se propone cambiarlo solo por no mostrar una leyenda: puede cumplir una funcion contextual. Debe observarse el conjunto de recursos antes de juzgarlo.'))

global_indicators = ['Coherencia pedagogica', 'Cumplimiento del objetivo', 'Relacion correcta texto-imagen', 'Imagenes comprensibles', 'Imagenes con nitidez adecuada', 'Imagenes 3D tecnicamente correctas', 'Exactitud tecnico-profesional', 'Consistencia visual', 'Prueba de comprension rapida aprobada']
indicators = [dict(Indicador=x, Porcentaje=None, Evidencia='No se reviso el universo completo con este criterio. No convertir presencia de datos o inspeccion de dos archivos en porcentaje de calidad.') for x in global_indicators]
review = dict(Fecha=datetime.datetime.now().astimezone().isoformat(), Documento=str(REFERENCE), SHA256_documento=hashlib.sha256(REFERENCE.read_bytes()).hexdigest(), Cobertura_cursos_inventario=45, Modulos_inventariados=451, Archivos_visuales_inspeccionados=2, Pantallas_revisadas_integralmente=0, Promedio_cumplimiento_integral=None, Promedio_controles_estructurales=base['resumen']['Promedio_estructural'], Cursos_completamente_validados=0, Porcentaje_completamente_validados=0, Cursos_parcialmente_cumplidores_integrales=None, Cursos_con_brechas_relevantes_integrales=None, Cursos_pendientes_validacion_integral=45, Cambios_de_contenido_propuestos=0, Revisiones_localizadas_propuestas=1, Prioridad_alta=0, Prioridad_media=1, Prioridad_baja=0, Cambios_ejecutados=0, Limitacion='Auditoria pedagogica y visual integral NO completada. Matriz diagnostica de resultados disponibles, no aprobacion de cursos.')
(OUT/'matriz-actualizada.json').write_text(json.dumps(dict(resumen=review,matriz=rows,observaciones_visuales=observations,indicadores=indicators,referencias_sin_alt=alt_details),ensure_ascii=False,indent=2),encoding='utf-8')

def table(data):
    fields=list(dict.fromkeys(k for row in data for k in row))
    return '<div class="scroll"><table><thead><tr>'+''.join('<th>'+html.escape(x.replace('_',' '))+'</th>' for x in fields)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+html.escape('NV' if row.get(x) is None else str(row.get(x)))+'</td>' for x in fields)+'</tr>' for row in data)+'</tbody></table></div>'

summary = []
for course in courses:
    summary.append(dict(Curso_ID=course['Curso_ID'],Curso=course['Curso'],Modulos=course['Modulos'],Cumplimiento_estructural=course['Promedio_controles_estructurales'],Cumplimiento_pedagogico_visual=None,Estado_integral='NO VERIFICABLE',Revision_localizada='C01-PV05-M01-C02: verificar imagen del caso 2' if course['Curso_ID']==1 else 'Ninguna identificada; no significa ausencia de problemas',Autorizacion='NO AUTORIZADO'))
page='''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Auditoria pedagogica visual de 45 cursos Aula TP Chile</title><style>body{font:16px Arial,sans-serif;color:#163449;margin:24px;background:white}h1{font-size:26px}h2{font-size:21px;margin-top:30px}p{line-height:1.55;max-width:1100px}.notice{background:#fff4dc;border-left:5px solid #c88b12;padding:16px}.scroll{overflow:auto;max-height:650px;border:1px solid #c5d4df}table{border-collapse:collapse;font-size:13px}th,td{padding:10px;border:1px solid #d8e3ea;min-width:130px;max-width:440px;vertical-align:top;overflow-wrap:anywhere}th{position:sticky;top:0;background:#e7f2f5}input{padding:12px;width:420px;max-width:90%}a{color:#0063b2}img{max-width:100%;width:760px;height:auto}nav{display:flex;gap:16px;flex-wrap:wrap}</style>
<h1>Auditoria pedagogica y visual de los 45 cursos</h1><p>Estado actual previo a autorizacion · 7 de octubre de 2026</p>
<p class="notice"><strong>DIAGNOSTICO PARCIAL, NO CERTIFICACION INTEGRAL.</strong> Los 45 cursos y sus 451 modulos fueron inventariados y controlados estructuralmente. La revision pedagogica y visual exhaustiva de todas las pantallas no se ha completado. El 100 % estructural NO significa 100 % de coherencia, nitidez, seguridad o aprendizaje. No se realizaron modificaciones.</p>
<nav><a href="#cursos">45 cursos</a><a href="#matriz">Matriz por criterio</a><a href="#visuales">Evidencia visual</a><a href="#resumen">Resumen final</a><a href="matriz-actualizada.json">Matriz en datos</a><a href="resultados.json">Inventario y controles completos</a></nav>
<h2>Alcance y metodo</h2><p>El documento actualizado aporta 21 apartados de criterios diagnosticos, que aparecen en filas separadas para cada curso. Se conserva su enfoque: analizar, no redisenar; no modificar contenidos, estructura, navegacion o metodologia. No se aplica ninguna instruccion del adjunto que contradiga la solicitud de esperar autorizacion.</p>
<p>Controles S01-S12: unidades que cumplen / unidades revisadas x 100, en datos almacenados. D01: presencia de alt en usos de image, no evaluacion de su calidad. PV01-PV21: revision pedagogica y visual pendiente; porcentaje NV y no 0 %. Las clasificaciones cualitativas del documento no se convierten arbitrariamente en 25, 50 o 75 %. Una observacion de un archivo no valida su legibilidad real en todas las pantallas donde aparece.</p>
<p>El promedio estructural mantiene la misma formula de la auditoria anterior: media simple por curso de S01-S12; luego media simple de los 45 cursos. D01 no se suma a ese promedio. La matriz conserva fortalezas documentales y separa las brechas de auditoria de los defectos demostrados. No se extrapola una observacion de Refrigeracion a otras especialidades.</p>
<h2 id="cursos">Resultados individuales de los 45 cursos</h2>'''+table(summary)
page+='<h2>Filtro de la matriz</h2><label for="filter">Curso, criterio, modulo o ID</label><br><input id="filter" type="search"><h2 id="matriz">Estado actual y autorizacion por curso y criterio</h2><section id="filtered">'+table(rows)+'</section>'
page+='<h2>Ubicaciones documentales sin alt</h2><p>Listado completo de objetos almacenados sin ese campo. Puede incluir referencias archivadas o no renderizadas, y no mide las imagenes finales de la interfaz. No se consideran automaticamente errores ni propuestas de modificacion; verificar funcion, herencia de descripcion y uso real antes de intervenir.</p>'+table(alt_details)
page+='<h2 id="visuales">Observaciones visuales localizadas</h2>'+table(observations)
page+='<h3>C01-PV05-M01-C02: comparacion del caso 2</h3><p><strong>Contexto registrado:</strong> '+html.escape(case['context'])+'</p><p><strong>Clave conservada:</strong> '+html.escape(case['options'][case['answer']])+'</p><figure><img src="../../static/themes/oficio/oficio-plano-leyenda.png" alt="Recurso original con una etiqueta UI-01 en sala 01 y sala 02 sin segunda etiqueta"><figcaption>Archivo original observado. La duplicacion de UI-01 descrita por el caso no aparece en este recurso. Revisar su funcion antes de autorizar ajustes.</figcaption></figure>'
page+='<h3>Caso 1: imagen complementaria, sin cambio recomendado</h3><figure><img src="../../static/themes/oficio/oficio-drenaje.png" alt="Cassette y tubo de drenaje en un espacio con campana de cocina"><figcaption>Archivo original observado. Su falta de leyenda no demuestra por si sola que sea inadecuado: puede aportar contexto. No se propone reemplazarlo automaticamente.</figcaption></figure>'
page+='<h2 id="resumen">Resumen consolidado de los 45 cursos</h2><p><strong>Porcentaje promedio de cumplimiento general integral: NV.</strong> No existe evidencia completa para calcularlo. Promedio estructural comprobado: 100 %. Los 45 cursos cumplen los controles S01-S12 (45/45, 100 %); ninguno presenta brechas en esos controles.</p><p><strong>Clasificacion integral:</strong> cursos completamente validados: 0/45 (0 %). Cantidad y porcentaje que cumplen parcialmente: NV. Cantidad y porcentaje con brechas relevantes: NV. Pendientes de validacion integral: 45/45 (100 %). No se clasifica como incumplidor a un curso solo porque no ha sido auditado.</p>'
page+='<p><strong>Criterios con mayor y menor cumplimiento:</strong> en S01-S12 todos alcanzan 100 %; hay empate. En criterios pedagogicos y visuales no se puede construir un ranking real. Consultar D01 por curso para presencia documental de alt, sin confundirla con nitidez o accesibilidad.</p><p><strong>Propuestas:</strong> 1 revision localizada de prioridad media; alta: 0; baja: 0. Modificaciones concretas de contenido autorizables con evidencia suficiente: 0. Cambios ejecutados: 0. La revision corresponde a Refrigeracion y Climatizacion, modulo 1, situacion integradora 2. Las filas NV no se cuentan como cambios propuestos.</p><p><strong>Intervencion prioritaria:</strong> no se ha demostrado necesidad de una modificacion urgente. Prioridad de revision localizada: Refrigeracion y Climatizacion por la relacion entre imagen y duplicacion descrita. Todos los cursos requieren completar la auditoria antes de certificar su estado integral.</p>'
alt_rows=[r for r in rows if r['ID'].endswith('-D01')]
alt_ok=sum(r['Cumplen'] for r in alt_rows)
alt_n=sum(r['Revisados'] for r in alt_rows)
page+=f'<p><strong>Indicador documental D01:</strong> {alt_ok}/{alt_n} usos almacenados de image tienen alt no vacio ({100*alt_ok/alt_n:.2f} %). {len(alt_details)} usos carecen de ese campo en ocho cursos. Es cobertura de campos, NO cumplimiento de accesibilidad. El menor porcentaje documental D01 es {min(r["Porcentaje_cumplimiento"] for r in alt_rows):.2f} %; 37 cursos tienen 100 % de presencia. Los numeros y denominadores individuales figuran en la matriz.</p>'
page+='<h2>Indicadores globales del documento actualizado</h2>'+table(indicators)
page+='<p>Pantallas revisadas integralmente: 0. Archivos visuales inspeccionados: 2, del mismo modulo; NO cobertura exhaustiva visual. Pantallas sin observaciones, problemas de nitidez, errores 3D/IA y seguridad: NV. Observacion localizada de impacto medio: 1. No se certifica ausencia de hallazgos altos o bajos en el universo no revisado.</p><h2>Tres niveles de integridad y conclusion</h2><p>Integridad pedagogica: NV. Integridad visual: NV. Integridad pedagogico-visual: NV integralmente, con una relacion localizada que requiere revision. La evidencia disponible no permite afirmar que todas las imagenes ayuden a aprender, sean nitidas a tamaño real, representen acciones seguras o mantengan continuidad entre pantallas. Tampoco permite afirmar lo contrario. Conservar los elementos no objetados y completar la observacion individual antes de decidir.</p><h2>Autorizacion</h2><p>Ninguna autorizacion concedida. La propuesta C01-PV05-M01-C02 solicita revisar la funcion del recurso existente, no sustituirlo, redisenar la pantalla ni cambiar la actividad. Cualquier modificacion posterior debe tener evidencia, alcance exacto y aprobacion del usuario. El informe anterior y los cursos se conservan.</p><script>document.getElementById("filter").addEventListener("input",e=>{const q=e.target.value.toLocaleLowerCase("es");document.querySelectorAll("#filtered tbody tr").forEach(r=>r.hidden=!r.textContent.toLocaleLowerCase("es").includes(q));});</script></html>'
(OUT/'informe-actualizado.html').write_text(page,encoding='utf-8')
assert len(summary)==45 and len(rows)==45*(12+1+21)+1
assert all(r['Autorizacion'].find('EJECUTADO')>=0 or r['Cambio_requerido']=='No' for r in rows if '-PV' in r['ID'])
print(json.dumps(dict(resumen=review,Filas=len(rows),Presencia_alt=[(r['Curso_ID'],r['Porcentaje_cumplimiento']) for r in rows if r['ID'].endswith('-D01')]),ensure_ascii=True,indent=2))
