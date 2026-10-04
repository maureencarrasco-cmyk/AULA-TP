"""Read-only initial diagnostic. Structural indicators are not quality grades."""
import collections
import datetime
import hashlib
import html
import json
import re
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from pedagogy import course_planning, module_plan

OUT = ROOT / 'reports' / 'diagnostico-inicial-45-20261004'
OUT.mkdir(parents=True, exist_ok=True)
DB = ROOT / 'data' / 'aulatp.sqlite3'
before = hashlib.sha256(DB.read_bytes()).hexdigest()
db = sqlite3.connect(f'file:{DB.as_posix()}?mode=ro', uri=True)
db.row_factory = sqlite3.Row
courses = [dict(r) for r in db.execute('SELECT * FROM courses ORDER BY specialty,title')]
modules = [dict(r) for r in db.execute('SELECT * FROM modules ORDER BY course_id,position')]
db.close()

DEFINITIONS = {
    'Curriculo': 'AE con titulo, criterios y OA registrados en el AE o en su fuente de modulo / total de AE. No contrasta la fidelidad con el programa oficial ni acredita vinculo individual AE-OA.',
    'Contenido tecnico': 'NO VERIFICABLE: requiere resolver y contrastar contenidos y claves con fuentes y especialistas de cada disciplina.',
    'Pedagogia': 'Actividades de AE con consigna, habilidad declarada y dificultad declarada / total de actividades de AE. No califica su calidad didactica.',
    'Secuencia': 'AE con seis consignas no vacias en steps / total de AE. Comprueba estructura, no historia cognitiva.',
    'Actividades': 'Elementos inventariados con enunciado / total de elementos. No equivale a variedad o profundidad.',
    'Preguntas': 'Preguntas de examen con enunciado, cuatro alternativas distintas y clave entera valida / total de preguntas. No verifica verdad ni plausibilidad.',
    'Evaluacion': 'AE con al menos una pregunta vinculada por indice / total de AE. No verifica cobertura de todos sus criterios.',
    'Visual': 'Referencias locales /static/ a imagen, video, audio o modelo cuyo archivo existe / total de esas referencias. Cuenta referencias, no archivos unicos ni pertinencia.',
    'Simulacion': 'Modulos con scene.prompt y scene.parts no vacios / total de modulos. No verifica interaccion, consecuencias, motor 3D ni funcion pedagogica.',
    'UX': 'NO VERIFICABLE por curso: no se ejecutaron los 45 cursos ni sus recorridos completos en esta fase.',
    'Accesibilidad': 'Objetos con image que incluyen alt no vacio / total de objetos con image. Es disponibilidad de texto alternativo, no certificacion de accesibilidad.',
    'Tiempo': 'NO VERIFICABLE: no se localizaron registros de sesiones docentes cronometradas; los minutos almacenados no se aceptan como tiempo real.',
    'Contexto profesional': 'Modulos con context, application y al menos un caso con context / total de modulos. No verifica pertinencia a la especialidad.',
    'Coherencia global': 'NO VERIFICABLE: requiere validacion conjunta curricular, tecnica, pedagogica, temporal y funcional.',
}
NUMERIC = [k for k,v in DEFINITIONS.items() if not v.startswith('NO VERIFICABLE')]
def pct(n, d):
    return round(100*n/d, 1) if d else None

def norm(s):
    return re.sub(r'\s+', ' ', str(s)).strip().casefold()

def walk(value, path='contenido'):
    if isinstance(value, dict):
        yield path, value
        for k,v in value.items():
            yield from walk(v, f'{path}.{k}')
    elif isinstance(value, list):
        for i,v in enumerate(value):
            yield from walk(v, f'{path}[{i}]')

results, module_rows, findings, coverage, time_rows = [], [], [], [], []
for course in courses:
    selected = [m for m in modules if m['course_id'] == course['id']]
    count = collections.Counter()
    difficulty = collections.Counter()
    skills, formats, repeats = collections.Counter(), collections.Counter(), collections.Counter()
    planning_modules = []
    for m in selected:
        c = json.loads(m['content'])
        src = c.get('specialty_source') or c.get('official_source') or {}
        planning_modules.append(dict(position=m['position'], title=m['title'], official_hp=src.get('official_hp') or (module_plan(m['position']) or {}).get('official_hp')))
    plan = course_planning(dict(title=course['title'], specialty=course['specialty'], modules=planning_modules)) or {}
    effective = {p['position']:p for p in plan.get('modules', [])}
    course_findings_start = len(findings)
    for m in selected:
        c = json.loads(m['content'])
        mc = collections.Counter()
        aes, qs = c.get('aes') or [], c.get('questions') or []
        source = c.get('specialty_source') or c.get('official_source') or {}
        mc['modules'] = 1
        mc['aes'] = len(aes)
        mc['questions'] = len(qs)
        items = []
        for i,ae in enumerate(aes):
            mc['curriculum'] += bool(ae.get('title') and (ae.get('oa') or source.get('oa')) and ae.get('criteria'))
            mc['individual_oa'] += bool(ae.get('oa'))
            mc['criterion_repeats_ae'] += any(norm(x)==norm(ae.get('title')) for x in ae.get('criteria') or [])
            steps = ae.get('steps') or []
            mc['sequence'] += len(steps) == 6 and all(isinstance(s,str) and s.strip() for s in steps)
            activities = ae.get('learning_sequence') or ae.get('experiences') or []
            for a in activities:
                mc['ae_activities'] += 1
                mc['pedagogy'] += bool(a.get('prompt') and a.get('skill') and a.get('difficulty'))
                skills[str(a.get('skill') or 'Sin declarar')] += 1
                formats[str(a.get('type') or 'Sin declarar')] += 1
            items.extend(activities or [{'prompt':s} for s in steps])
            linked = [q for q in qs if type(q.get('ae')) is int and q['ae'] == i]
            mc['evaluation'] += bool(linked)
            coverage.append(dict(Curso=course['title'], Modulo=m['title'], Modulo_ID=m['id'], AE=i+1,
                Titulo=ae.get('title'), OA=ae.get('oa'), Criterios=len(ae.get('criteria') or []),
                Actividades_AE=len(activities or steps), Preguntas_vinculadas=len(linked),
                Estado='VINCULO REGISTRADO; ALINEACION REQUIERE REVISION' if linked else 'SIN PREGUNTA VINCULADA',
                Fuente_pagina=ae.get('official_page')))
        items.extend(qs)
        items.extend(c.get('cases') or [])
        items.extend((c.get('encargos') or {}).get('items') or [])
        if c.get('development'):
            items.append({'prompt':c['development']})
        mc['items'] = len(items)
        mc['prompts'] = sum(bool(a.get('question') or a.get('prompt') or a.get('title') or a.get('focus')) for a in items)
        mc['context'] = bool(c.get('context') and c.get('application') and any(a.get('context') for a in c.get('cases') or []))
        scene = c.get('scene') or {}
        mc['simulation'] = bool(scene.get('prompt') and scene.get('parts'))
        source = c.get('specialty_source') or c.get('official_source') or {}
        pdf = source.get('pdf') or (c.get('curriculum') or {}).get('pdf')
        mc['pdf'] = bool(pdf and (ROOT / pdf).is_file())

        def finding(dimension, severity, station, activity, evidence, impact, correction):
            findings.append(dict(Especialidad=course['specialty'], Curso=course['title'], Modulo=m['title'], Modulo_ID=m['id'],
                Estacion=station, Actividad=activity, Dimension=dimension, Severidad=severity,
                Evidencia=evidence, Impacto=impact, Correccion=correction, Estado='VERIFICADO EN DATOS; NO PRUEBA DE EJECUCION'))
        wrong_trace = [(i,t.get('pdf')) for i,t in enumerate(c.get('traceability') or []) if t.get('pdf') and pdf and norm(t['pdf']) != norm(pdf)]
        mc['trace_source_mismatch'] = len(wrong_trace)
        if wrong_trace:
            finding('Curriculo','ALTO','Todas','Trazabilidad curricular',
                f'{len(wrong_trace)} registros apuntan a PDF distinto de la fuente de modulo. Fuente: {pdf}; primera referencia: {wrong_trace[0][1]}',
                'La evidencia puede conducir a un programa de otra especialidad y no respalda el vinculo declarado.',
                'Contrastar programa y pagina por AE/criterio; corregir la construccion transversal de la trazabilidad, no solo su etiqueta.')
        if mc['criterion_repeats_ae']:
            finding('Curriculo','MEDIO','Aprendizajes','Criterios registrados',
                f'{mc["criterion_repeats_ae"]}/{len(aes)} AE tienen al menos un criterio identico a su titulo',
                'Puede faltar la desagregacion del aprendizaje en evidencias observables; requiere contraste con el programa.',
                'Verificar los criterios oficiales y su cobertura antes de considerar completo el AE.')
        for i,q in enumerate(qs):
            opts = q.get('options') or []
            valid_key = type(q.get('answer')) is int and 0 <= q['answer'] < len(opts)
            valid = bool(q.get('question')) and len(opts)==4 and len({norm(o) for o in opts})==4 and valid_key
            mc['valid_questions'] += valid
            mc['explanations'] += bool(q.get('explanation'))
            mc['invalid_ae'] += not (type(q.get('ae')) is int and 0 <= q['ae'] < len(aes))
            repeats[norm(q.get('question',''))] += 1
            mapping = {'Inicial':'facil','Fácil':'facil','Media':'media','Intermedia':'media','Avanzada':'dificil','Difícil':'dificil'}
            difficulty[mapping.get(q.get('difficulty'), 'sin declarar')] += 1
            if not valid:
                finding('Preguntas','ALTO','Evaluacion',f'Pregunta {i+1}',f'Enunciado={bool(q.get("question"))}; opciones={len(opts)}; distintas={len({norm(o) for o in opts})}; clave_valida={valid_key}',
                    'La estructura puede impedir una respuesta o una calificacion consistente.', 'Revisar consigna, cuatro alternativas y clave; luego validar tecnicamente la respuesta.')
        missing = collections.Counter()
        for path,obj in walk(c):
            if obj.get('image'):
                mc['images'] += 1
                mc['alt'] += bool(isinstance(obj.get('alt'), str) and obj['alt'].strip())
            for key,value in obj.items():
                if not isinstance(value,str) or not value.startswith('/static/'):
                    continue
                local = value.split('?')[0].split('#')[0]
                if Path(local).suffix.lower() not in {'.png','.jpg','.jpeg','.webp','.gif','.svg','.mp4','.webm','.mp3','.wav','.glb','.gltf','.obj'}:
                    continue
                mc['media_refs'] += 1
                present = (ROOT / local.lstrip('/')).is_file()
                mc['media_ok'] += present
                if not present:
                    missing[local] += 1
        for file,n in missing.items():
            finding('Visual','ALTO','Recurso asociado','Referencia local',f'{file}: {n} referencias; archivo inexistente',
                'Si esta referencia se utiliza sin sustitucion, falta el recurso que permite resolver la actividad.',
                'Comprobar la ruta efectiva y su eventual reemplazo en pantalla; restaurar o sustituir el archivo con recurso disciplinar valido.')
        if not mc['pdf']:
            finding('Curriculo','MEDIO','Todas','Fuente curricular',f'PDF local no localizado: {pdf}',
                'No queda disponible este respaldo local para contrastar el contenido.', 'Depositar la fuente oficial y verificar OA, AE, criterios y nivel por modulo.')
        if mc['explanations'] < len(qs):
            finding('Evaluacion','MEDIO','Cierre','Explicaciones registradas',f'{len(qs)-mc["explanations"]}/{len(qs)} preguntas sin explanation en datos',
                'La retroalimentacion puede quedar incompleta; una explicacion generada en pantalla no se valida con este control.',
                'Revisar el resultado efectivo y redactar explicaciones disciplinares que expliquen acierto y distractores.')
        count.update(mc)
        module_rows.append(dict(Curso=course['title'], Curso_ID=course['id'], Modulo=m['title'], Modulo_ID=m['id'], Posicion=m['position'], Publicado=m['published'], Contadores=dict(mc)))
        ep = effective.get(m['position']) or {}
        hp = source.get('official_hp') or ep.get('official_hp') or (c.get('planning') or {}).get('official_hp')
        budget = hp * (c.get('hp_minutes') or 45) / 60 * .3 if hp else None
        time_rows.append(dict(Curso=course['title'], Modulo=m['title'], Modulo_ID=m['id'], HP_registradas=hp,
            Porcentaje=30, Horas_presupuesto=budget, Actividades_inventariadas=len(items),
            Horas_plan_efectivo=ep.get('minutes',0)/60 if ep.get('minutes') else None,
            Minutos_docente_real=None, Estudiante_x5=None, Cobertura_real=None, Brecha_real=None,
            Sensibilidad_x3=None, Sensibilidad_x4=None, Sensibilidad_x6=None,
            Estado='REQUIERE RECALIBRACION: NO HAY TIEMPO DOCENTE MEDIDO',
            Advertencia='HP registradas/planificadas, no revalidadas con programa oficial; presupuesto no se multiplica por cinco. No usar minutos almacenados como cronometraje.'))
    scores = {
        'Curriculo':pct(count['curriculum'],count['aes']), 'Contenido tecnico':None,
        'Pedagogia':pct(count['pedagogy'],count['ae_activities']), 'Secuencia':pct(count['sequence'],count['aes']),
        'Actividades':pct(count['prompts'],count['items']), 'Preguntas':pct(count['valid_questions'],count['questions']),
        'Evaluacion':pct(count['evaluation'],count['aes']), 'Visual':pct(count['media_ok'],count['media_refs']),
        'Simulacion':pct(count['simulation'],count['modules']), 'UX':None,
        'Accesibilidad':pct(count['alt'],count['images']), 'Tiempo':None,
        'Contexto profesional':pct(count['context'],count['modules']), 'Coherencia global':None,
    }
    distribution = {k:pct(difficulty[k],count['questions']) for k in ('facil','media','dificil','sin declarar')}
    # Total variation compares declared labels only, not cognitive difficulty.
    label_fit = round(100 - sum(abs((distribution[k] or 0)-v) for k,v in {'facil':10,'media':50,'dificil':40,'sin declarar':0}.items())/2, 1)
    results.append(dict(ID=course['id'], Curso=course['title'], Especialidad=course['specialty'], Nivel_registrado=course['level'],
        Indicadores=scores, Contadores=dict(count), Etiquetas_dificultad=distribution, Ajuste_etiquetas_10_50_40=label_fit,
        Habilidades_declaradas=dict(skills), Tipos_declarados=dict(formats),
        Explicaciones=pct(count['explanations'],count['questions']), PDFs_locales=pct(count['pdf'],count['modules']),
        Preguntas_repetidas_en_curso=sum(n-1 for text,n in repeats.items() if text and n>1),
        Hallazgos_registrados=len(findings)-course_findings_start,
        Fortaleza='Existe una estructura comun de actividades, evaluacion y cierre; los porcentajes describen su registro, no su calidad.',
        Mejora_obligatoria='Validar contenido y claves por especialidad; medir tiempo docente; revisar recursos faltantes y correspondencia OA/AE.',
        Revision_niveles='El nivel del curso esta registrado conjuntamente como 3 y 4 medio; no se certifica progresion entre niveles.',
        Puntaje_final=None, Estado='DIAGNOSTICO INICIAL PARCIAL; NO APROBADO NI CERTIFICADO'))

after = hashlib.sha256(DB.read_bytes()).hexdigest()
assert before == after, 'La base cambio durante el inventario; revisar antes de publicar.'
assert len(results)==45 and len({r['ID'] for r in results})==45
for r in results:
    assert all(v is None or 0 <= v <= 100 for v in r['Indicadores'].values())
    assert abs(sum(v or 0 for v in r['Etiquetas_dificultad'].values())-100) <= .3
total = collections.Counter()
for r in results:
    total.update(r['Contadores'])
payload = dict(Fecha=datetime.date.today().isoformat(), Alcance='45 cursos; inventario estructural de todos los modulos. No se realizaron cursos completos ni cronometraje docente.',
    Definiciones=DEFINITIONS, Cursos=results, Modulos=module_rows, Hallazgos=findings, Cobertura_AE=coverage,
    Tiempos=time_rows, Totales=dict(total), SHA256_base_antes=before, SHA256_base_despues=after,
    Estado_calidad='NO VERIFICABLE. Los indicadores no son notas de calidad ni un puntaje global.',
    Limitaciones=['No contraste integral con PDFs oficiales.', 'No resolucion disciplinar de todas las preguntas.',
        'No prueba visual/teclado/lector de pantalla de los 45 recorridos.', 'No tiempos reales medidos.',
        'No certificacion de dificultad cognitiva, plausibilidad de distractores ni progresion 3 a 4 medio.',
        'Inventario excluye actividades producidas exclusivamente por plantillas de interfaz; incluye elementos de datos, no necesariamente todos ejecutados.'])
(OUT/'datos.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')

def esc(x):
    return html.escape(str(x))

def cell(value):
    if value is None:
        return '<td class="nv">NV</td>'
    band = 'low' if value < 60 else 'mid' if value < 85 else 'high'
    return f'<td class="{band}">{value:g}%</td>'

head = ''.join(f'<th title="{esc(DEFINITIONS[k])}">{esc(k)}</th>' for k in DEFINITIONS)
body = ''.join('<tr><th><a href="#curso-'+str(r['ID'])+'">'+esc(r['Curso'])+'</a></th><td>'+str(r['Contadores']['modules'])+'</td>'+''.join(cell(r['Indicadores'][k]) for k in DEFINITIONS)+'</tr>' for r in results)
priority = sorted(results,key=lambda r:(r['Indicadores']['Visual'] if r['Indicadores']['Visual'] is not None else 101, r['Indicadores']['Preguntas'] or 0))
priorities = ''.join(f'<li>{esc(r["Curso"])}: archivos disponibles {r["Indicadores"]["Visual"]}% ({r["Contadores"]["media_refs"]-r["Contadores"]["media_ok"]} referencias ausentes).</li>' for r in priority[:10])
details = ''
for r in results:
    own = [f for f in findings if f['Curso']==r['Curso']]
    table = ''.join('<tr>'+''.join('<td>'+esc(f[k])+'</td>' for k in ('Modulo','Estacion','Actividad','Dimension','Severidad','Evidencia','Impacto','Correccion'))+'</tr>' for f in own)
    details += f'<details id="curso-{r["ID"]}"><summary>{esc(r["Curso"])} · {r["Contadores"]["modules"]} modulos · {r["Hallazgos_registrados"]} hallazgos de datos</summary>'
    details += '<p><b>Fortaleza:</b> '+esc(r['Fortaleza'])+'</p><p><b>Mejora obligatoria:</b> '+esc(r['Mejora_obligatoria'])+'</p>'
    details += f'<p>Etiquetas declaradas: facil {r["Etiquetas_dificultad"]["facil"]}% · media {r["Etiquetas_dificultad"]["media"]}% · dificil {r["Etiquetas_dificultad"]["dificil"]}%. Ajuste matematico a 10/50/40: {r["Ajuste_etiquetas_10_50_40"]}%; no valida dificultad real.</p>'
    details += f'<p>Explicaciones registradas: {r["Explicaciones"]}%. Fuentes PDF locales: {r["PDFs_locales"]}%. Repeticiones exactas adicionales en el curso: {r["Preguntas_repetidas_en_curso"]}.</p>'
    details += '<p>Habilidades declaradas: '+esc(json.dumps(r['Habilidades_declaradas'],ensure_ascii=False))+'. Tipos: '+esc(json.dumps(r['Tipos_declarados'],ensure_ascii=False))+'.</p>'
    details += '<p>'+esc(r['Revision_niveles'])+'</p><div class="scroll"><table><thead><tr>'+''.join('<th>'+k+'</th>' for k in ('Modulo','Estacion','Actividad','Dimension','Severidad','Evidencia','Impacto','Correccion'))+'</tr></thead><tbody>'+table+'</tbody></table></div></details>'
methods = ''.join('<dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd>' for k,v in DEFINITIONS.items())
report = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Diagnostico inicial · 45 cursos</title>
<style>body{{font:16px Arial,sans-serif;color:#20364c;background:white;margin:24px;line-height:1.5}}h1{{font-size:27px}}h2{{font-size:21px;color:#146d75}}p{{max-width:1100px}}.warning{{background:#fff6dc;padding:16px;border-left:5px solid #be8a15}}.scroll{{overflow:auto;max-height:680px;border:1px solid #cedce5}}table{{border-collapse:collapse;font-size:13px}}th,td{{padding:10px;border:1px solid #d7e2e9;vertical-align:top}}thead th{{position:sticky;top:0;background:#e9f3fa;min-width:110px}}tbody th{{min-width:240px;text-align:left;background:#f5f9fc}}td{{min-width:85px}}.high{{background:#e9f6ee}}.mid{{background:#fff7df}}.low{{background:#faeaea}}.nv{{background:#f0f0f4;color:#5d6070}}details{{margin:16px 0;border-top:1px solid #d7e2e9;padding-top:12px}}summary{{cursor:pointer;font-weight:bold}}dt{{font-weight:bold;margin-top:12px}}dd{{margin-left:0}}input{{padding:10px;width:360px;max-width:90%}}a{{color:#1466a5}}@media print{{.scroll{{max-height:none}}}}</style></head><body>
<h1>Diagnostico inicial de los 45 cursos</h1><p>4 de octubre de 2026 · {len(modules)} modulos · {total['aes']} AE · {total['questions']} preguntas de examen · {total['items']} elementos inventariados.</p>
<p class="warning"><b>Esta es una linea base estructural, no una auditoria pedagogica completa.</b> Los porcentajes miden presencia y consistencia de datos con denominadores explicitos. Un 100% no significa curso correcto. NV = no verificable en esta fase, nunca 0%. No existe evidencia suficiente para asignar puntaje final ni semaforo de calidad del prompt.</p>
<p>No se modificaron cursos, preguntas ni respuestas de estudiantes. Base de datos leida en modo de solo lectura y huella SHA-256 sin cambios. No se realizaron ni cronometraron los cursos completos; no se certifica correccion tecnica, accesibilidad, interaccion 3D ni progresion entre niveles.</p>
<h2>Tabla inicial por curso</h2><label for="buscar">Buscar curso</label><br><input id="buscar" type="search"><p>Colores orientativos del indicador: rojo &lt;60%; amarillo 60–84,9%; verde ≥85%. No son el semaforo de aprobacion del prompt. Consulte las formulas antes de interpretar.</p>
<div class="scroll"><table id="matriz"><thead><tr><th>Curso</th><th>Modulos</th>{head}</tr></thead><tbody>{body}</tbody></table></div>
<h2>Lo mas importante</h2><ul><li>{total['trace_source_mismatch']} registros de trazabilidad apuntan a un PDF distinto del registrado como fuente del modulo. Se debe revisar la construccion transversal de estas referencias.</li><li>{total['media_refs']-total['media_ok']} de {total['media_refs']} referencias multimedia locales no encuentran archivo ({pct(total['media_ok'],total['media_refs'])}% disponibles). Puede existir un reemplazo en interfaz: debe comprobarse antes de afirmar que todas fallan en pantalla.</li><li>{total['questions']-total['valid_questions']} preguntas presentan una alerta estructural; {total['questions']-total['explanations']} no tienen explicacion registrada. Esto no valida correccion tecnica.</li><li>{total['individual_oa']}/{total['aes']} AE incluyen OA individual; los demas pueden tener OA en la fuente del modulo. {total['criterion_repeats_ae']} AE tienen un criterio identico a su titulo.</li><li>{total['evaluation']}/{total['aes']} AE tienen alguna pregunta de examen vinculada. Esto no acredita cobertura curricular completa.</li><li>Tiempo docente real: NV para los 45 cursos. No es valido inferirlo dividiendo el presupuesto por cinco.</li><li>Las cinco estaciones activas comparten plantillas. La Mision laboral adicional en construccion no se cuenta como estacion activa.</li></ul>
<h2>Prioridad preliminar: revisar recursos</h2><p>Ordenado por disponibilidad de referencias, no por calidad final. El numero de referencias puede incluir repeticiones del mismo archivo.</p><ol>{priorities}</ol>
<h2>Como se calcularon los porcentajes</h2><dl>{methods}</dl>
<h2>Regla de tiempo</h2><p>Presupuesto = HP registradas × minutos por HP ÷60 ×30%. El ×5 se aplica exclusivamente al tiempo real docente. Cobertura = suma(tiempo docente ×5) ÷ presupuesto. Sin cronometraje, cobertura, brecha y sensibilidad ×3/×4/×6 permanecen NV. Las horas registradas tambien requieren contraste oficial.</p>
<h2>Hallazgos y evidencia por curso</h2><p>Los controles recorrieron todos los modulos por curso. Cada hallazgo indica evidencia, impacto y correccion propuesta; no son correcciones ya realizadas. No se proponen actividades para rellenar horas sin conocer la brecha real.</p>{details}
<h2>Para completar la auditoria del prompt</h2><ol><li>Contrastar programa, OA, AE, criterios y nivel con fuentes oficiales por especialidad.</li><li>Resolver todas las actividades y revisar claves, distractores, secuencia y pasos cognitivos reales.</li><li>Probar las cinco estaciones de cada modulo, medios efectivos, teclado, lector de pantalla, contraste y dispositivos.</li><li>Cronometrar docentes especialistas por actividad y registrar lectura, recursos, resolucion y escritura.</li><li>Aplicar ×5; contrastar con presupuesto del 30%; analizar ×3/×4/×6 sin cambiar el presupuesto.</li><li>Presentar propuestas, esperar autorizacion y solo entonces corregir y volver a auditar.</li></ol>
<p><a href="datos.json">Datos completos, denominadores, matriz AE y tiempos por modulo</a></p>
<script>document.getElementById('buscar').addEventListener('input',e=>{{let q=e.target.value.toLocaleLowerCase('es');document.querySelectorAll('#matriz tbody tr').forEach(r=>r.hidden=!r.querySelector('th').textContent.toLocaleLowerCase('es').includes(q))}});document.querySelectorAll('#matriz a').forEach(a=>a.addEventListener('click',()=>{{document.getElementById(a.hash.slice(1)).open=true}}));</script></body></html>'''
(OUT/'informe.html').write_text(report,encoding='utf-8')
headers = ['Curso','Modulos']+list(DEFINITIONS)
lines = ['# Tabla inicial de los 45 cursos', '', 'Porcentajes de indicadores estructurales; NO notas de calidad. NV = no verificable. Formulas y evidencia en informe.html.', '', '| '+' | '.join(headers)+' |', '| '+' | '.join(['---']*len(headers))+' |']
for r in results:
    values = [r['Curso'],str(r['Contadores']['modules'])]+['NV' if r['Indicadores'][k] is None else str(r['Indicadores'][k])+'%' for k in DEFINITIONS]
    lines.append('| '+' | '.join(values)+' |')
(OUT/'tabla.md').write_text('\n'.join(lines),encoding='utf-8')
print(json.dumps(dict(courses=len(results),modules=len(modules),totals=dict(total),findings=len(findings),database_unchanged=before==after,report=str(OUT/'informe.html')),ensure_ascii=True))
