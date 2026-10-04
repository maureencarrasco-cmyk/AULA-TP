"""Read-only inventory and screening; never changes curricular content."""
import collections
import html
import json
import re
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from pedagogy import course_planning, module_plan
OUT = ROOT / 'reports' / 'audit-20261004'
OUT.mkdir(parents=True, exist_ok=True)
db = sqlite3.connect(f'file:{ROOT / "data/aulatp.sqlite3"}?mode=ro', uri=True)
db.row_factory = sqlite3.Row
modules = list(db.execute('SELECT m.*,c.title course,c.specialty,c.level FROM modules m JOIN courses c ON c.id=m.course_id ORDER BY c.id,m.position'))
activities, summaries, times, scenarios = [], [], [], []
global_counts = collections.Counter()
question_texts = collections.Counter()
effective_plans = {}
for course_id in {m['course_id'] for m in modules}:
    selected = [m for m in modules if m['course_id'] == course_id]
    supplied = []
    for m in selected:
        raw = json.loads(m['content'])
        source = raw.get('specialty_source') or {}
        supplied.append(dict(position=m['position'], title=m['title'], official_hp=source.get('official_hp') or (module_plan(m['position']) or {}).get('official_hp')))
    course = dict(title=selected[0]['course'], specialty=selected[0]['specialty'], modules=supplied)
    plan = course_planning(course)
    if plan:
        for item in plan['modules']:
            effective_plans[(course_id, item['position'])] = item

def normalized(text):
    return re.sub(r'\s+', ' ', str(text)).strip().lower()

def text_value(value):
    if isinstance(value, dict):
        return str(value.get('text') or value.get('label') or value.get('title') or value)
    return str(value)

for module in modules:
    c = json.loads(module['content'])
    aes = c.get('aes') or []
    rows = []
    for index, item in enumerate(c.get('questions') or []):
        rows.append(('Evaluacion final', f'Pregunta {index+1}', item))
        question_texts[normalized(item.get('question', ''))] += 1
    for index, item in enumerate(c.get('cases') or []):
        rows.append(('Situacion integradora', f'Situacion {index+1}', item))
    for ai, ae in enumerate(aes):
        for index, item in enumerate(ae.get('learning_sequence') or ae.get('experiences') or []):
            rows.append(('Aprendizajes esperados', f'AE {ai+1} actividad {index+1}', item))
        if not (ae.get('learning_sequence') or ae.get('experiences')):
            for index, prompt in enumerate(ae.get('steps') or []):
                rows.append(('Aprendizajes esperados', f'AE {ai+1} actividad {index+1}', {'prompt': prompt, 'ae': ai}))
    for index, item in enumerate((c.get('encargos') or {}).get('items') or []):
        rows.append(('Encargos de oficio', f'Encargo {index+1}', item))
    if c.get('development'):
        rows.append(('Evaluacion final', 'Actividad de desarrollo', {'prompt': c['development'], 'type': 'desarrollo', 'criterion': c.get('rubric')}))
    counters = collections.Counter()
    types, difficulties, skills = collections.Counter(), collections.Counter(), collections.Counter()
    for station, identity, item in rows:
        original = text_value(item.get('question') or item.get('prompt') or item.get('title') or item.get('focus') or '')
        options = item.get('options') or []
        answer = item.get('answer')
        observations = []
        if not original.strip(): observations.append('Enunciado vacio')
        if options and len(options) != 4: observations.append(f'{len(options)} alternativas; revisar cantidad y pertinencia')
        if options and (not isinstance(answer, int) or not 0 <= answer < len(options)): observations.append('Clave ausente o fuera de rango')
        if len({normalized(text_value(o)) for o in options}) != len(options): observations.append('Alternativas duplicadas')
        if options and not item.get('explanation'): observations.append('Sin explicacion registrada')
        if any(re.search(r'\b(sin revisar|sin verificar|sin registrar|por su color|al azar|ignorar|inventar)\b', normalized(text_value(o))) for o in options):
            observations.append('Posible distractor demasiado evidente; requiere revision humana')
        ae_index = item.get('ae')
        if station != 'Encargos de oficio' and isinstance(ae_index, int) and not 0 <= ae_index < len(aes): observations.append('AE fuera de rango')
        if item.get('image'):
            local = str(item['image']).split('?')[0]
            if local.startswith('/static/') and not (ROOT / local.lstrip('/')).exists(): observations.append('Recurso visual local ausente')
        actions = re.findall(r'\b(observa|identifica|reconoce|compara|relaciona|interpreta|calcula|decide|selecciona|explica|justifica|verifica|modela|argumenta|comprueba|analiza)\b', normalized(original))
        steps = max(1, len(set(actions)))
        estimate = 'facil' if steps == 1 else 'media' if steps < 4 else 'dificil'
        declared = str(item.get('difficulty') or '')
        skill = str(item.get('skill') or item.get('ability') or 'Sin habilidad explicita')
        kind = str(item.get('type') or ('seleccion multiple' if options else 'respuesta abierta'))
        form = str(item.get('format') or item.get('representation') or ('imagen y texto' if item.get('image') else 'texto'))
        criterion = text_value(item.get('criterion') or item.get('product') or 'Criterio especifico no registrado en este elemento')
        correct = text_value(options[answer]) if options and isinstance(answer, int) and 0 <= answer < len(options) else criterion
        adjusted = 'Pendiente de revision docente; conservar el enunciado hasta contrastar su recurso y criterio.'
        if observations:
            adjusted = original + ' [PROPUESTA: precisar el dato o recurso que debe consultarse, contrastar alternativas plausibles y explicar la evidencia que respalda la decision; validar clave y criterio antes de publicar.]'
        row = dict(Curso=module['course'], Modulo=module['title'], Modulo_ID=module['id'], Estacion=station, Actividad=identity,
                   Original=original, Ajustada_propuesta=adjusted, Tipo=kind, Formato=form, Dificultad_estimada=estimate,
                   Dificultad_declarada=declared, Pasos_estimados=steps,
                   Justificacion='Tamiz lexical: verbos de accion distintos; NO valida procesos implicitos ni dificultad real.',
                   Habilidad=skill, Contenido=criterion, Respuesta_o_criterio=correct,
                   Distractores='Requiere validacion disciplinar' if options else 'No aplica', Observaciones='; '.join(observations) or 'Sin alerta estructural; no equivale a aprobacion pedagogica')
        activities.append(row)
        for obs in observations: counters[obs] += 1
        counters['revisar'] += bool(observations)
        types[kind] += 1; difficulties[declared or 'No declarada'] += 1; skills[skill] += 1
    diffmap = {'Fácil':'facil','Inicial':'facil','Media':'media','Intermedia':'media','Difícil':'dificil','Avanzada':'dificil'}
    examdiff = collections.Counter(diffmap.get(q.get('difficulty'), 'sin declarar') for q in c.get('questions') or [])
    examtotal = sum(examdiff.values())
    distribution = {key: round(examdiff[key]/examtotal*100, 2) if examtotal else None for key in ('facil','media','dificil')}
    summaries.append(dict(Curso=module['course'], Especialidad=module['specialty'], Nivel=module['level'], Modulo=module['title'], ID=module['id'], Publicado=module['published'], Actividades=len(rows), Elementos_con_alerta=counters['revisar'], Tipos=dict(types), Dificultades_declaradas=dict(difficulties), Porcentaje_etiquetas_evaluacion=distribution, Habilidades=dict(skills), Alertas=dict(counters)))
    global_counts.update(counters)
    plan = effective_plans.get((module['course_id'], module['position'])) or c.get('planning') or {}
    hp_minutes = c.get('hp_minutes') or 45
    source = c.get('specialty_source') or {}
    official_hp = source.get('official_hp') or plan.get('official_hp') or plan.get('hp')
    available = (official_hp * hp_minutes / 60) if official_hp else None
    simulator_budget = available * .30 if available is not None else None
    simulated_minutes = plan.get('minutes')
    teacher_proxy = simulated_minutes / 5 if simulated_minutes else None
    times.append(dict(Especialidad=module['specialty'], Curso=module['course'], Nivel=module['level'], Modulo=module['title'], ID=module['id'], HP_oficiales=official_hp, Minutos_por_HP=hp_minutes, Horas_oficiales_cronologicas=available, Porcentaje_asignado_simulador=30, Horas_disponibles_simulador=simulator_budget, Actividades_inventariadas=len(rows), Minutos_docente_por_actividad=None, Factor=5, Minutos_estudiante_observados=None, Horas_planificadas=(simulated_minutes / 60 if simulated_minutes else None), Ocupacion_presupuesto_simulador=(simulated_minutes / 60 / simulator_budget * 100 if simulator_budget and simulated_minutes else None), Horas_restantes_simulador=(simulator_budget-simulated_minutes/60 if simulator_budget is not None and simulated_minutes is not None else None), Metodo='Plan efectivo del curso: presupuesto = horas oficiales x 30 %. Tiempo docente real NO disponible. Encargos optativos no se suman como obligatorios.'))
    for factor in (3, 4, 5, 6):
        required = teacher_proxy * factor / 60 if teacher_proxy else None
        scenarios.append(dict(Curso=module['course'], Modulo=module['title'], ID=module['id'], Factor=factor, Horas_disponibles_simulador=simulator_budget, Horas_requeridas=required, Ocupacion_presupuesto_simulador=(required/simulator_budget*100 if simulator_budget and required is not None else None), Horas_restantes_simulador=(simulator_budget-required if simulator_budget is not None and required is not None else None), Estado='Sensibilidad algebraica sobre el 30 % oficial; NO estimacion empirica'))

duplicates = {text: count for text, count in question_texts.items() if text and count > 1}
inventory = dict(courses=len({m['course_id'] for m in modules}), modules=len(modules), activities=len(activities), alerts=dict(global_counts), repeated_question_texts=len(duplicates), repeated_question_instances=sum(duplicates.values()))
payload = dict(inventory=inventory, modules=summaries, activities=activities, time=times, sensitivity=scenarios, duplicated_questions=duplicates)
(OUT/'audit-data.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')

def table(rows):
    if not rows: return '<p>Sin datos.</p>'
    fields = list(rows[0])
    header = ''.join(f'<th>{html.escape(k)}</th>' for k in fields)
    body = ''.join('<tr>'+''.join('<td>'+html.escape(json.dumps(r[k], ensure_ascii=False) if isinstance(r[k], dict) else str(r[k] if r[k] is not None else 'NO DISPONIBLE'))+'</td>' for k in fields)+'</tr>' for r in rows)
    return f'<div class="table-scroll"><table><thead><tr>{header}</tr></thead><tbody>{body}</tbody></table></div>'

report = f'''<!doctype html><html lang="es"><meta charset="utf-8"><title>Auditoria Aula TP Chile</title><style>body{{font:16px Arial,sans-serif;color:#17384b;margin:30px}}h1{{font-size:26px}}h2{{margin-top:30px}}p{{max-width:1000px;line-height:1.6}}.table-scroll{{overflow:auto;max-height:650px;border:1px solid #b9ccda}}table{{border-collapse:collapse;font-size:13px}}td,th{{padding:10px;border:1px solid #d3e0e8;min-width:160px;max-width:450px;vertical-align:top}}th{{position:sticky;top:0;background:#e8f4f3}}.warning{{padding:16px;background:#fff3d8;border-left:4px solid #a87814}}input{{padding:12px;width:400px;max-width:90%}}</style>
<h1>Auditoria de los 45 cursos · 4 de octubre de 2026</h1><p>{inventory['courses']} cursos, {inventory['modules']} modulos, {inventory['activities']} elementos inventariados en la base de datos. Inventario exhaustivo de estructura; revision semantica y visual por muestra. No se modificaron cursos, claves ni respuestas guardadas.</p>
<p class="warning">No se certifica alta calidad ni cumplimiento 10/50/40. El conteo de verbos NO equivale a pasos cognitivos reales. Las propuestas no son preguntas ajustadas aprobadas. La tabla no incluye actividades generadas exclusivamente en las plantillas de contextualizacion y cierre como si fueran datos individuales de cada curso.</p>
<h2>Hallazgos prioritarios</h2><ol><li>Tiempo circular: pedagogy.py fija required_minutes = available_minutes y teacher_total = required_minutes / TIME_FACTOR. Los escenarios 60/80/100/120 % son algebraicos; no validan x5.</li><li>Desfase del conteo de actividades: el calculo temporal cuenta una contextualizacion y un cierre, pero la interfaz contiene cinco actividades de contextualizacion y cinco pestanas de cierre, ademas de desafios y encargos. No comparar estos totales como si midieran lo mismo.</li><li>La plantilla de Transfiere reutiliza una modificacion generica del caso, no una nueva situacion disciplinar completamente personalizada. La variedad real requiere revisar cada modulo.</li><li>Las comprobaciones de respuestas abiertas dependen de caracteres y listas marcadas: verifican completitud, no correccion tecnica. Los mensajes no deben sugerir validacion disciplinar automatica.</li><li>Numeracion: se muestran seis estaciones, pero backend y progreso mantienen cinco estaciones habilitadas. La nueva Mision laboral es una tarjeta bloqueada, no una actividad funcional independiente.</li><li>{inventory['repeated_question_texts']} enunciados de evaluacion aparecen mas de una vez ({inventory['repeated_question_instances']} apariciones). Esto indica repeticion exacta; no demuestra por si solo falta de pertinencia.</li></ol>
<h2>Procedimiento de revision</h2><ol><li>Inventario de todos los cursos y modulos, sin escritura en la base.</li><li>Control de claves, alternativas, AE y recursos locales.</li><li>Tamiz provisional de habilidades, formatos y dificultad.</li><li>Contraste de tiempos almacenados y sensibilidad x3/x4/x5/x6.</li><li>Inspeccion visual de las estaciones del modulo 1; no equivale a probar todos los cursos.</li></ol>
<h2>Filtro de las tablas</h2><input id="filter" placeholder="Curso, modulo o palabra"><p>Filtra las tablas por texto. Los resultados son evidencias y propuestas, no cambios publicados.</p>
<h2>Resumen por curso y modulo</h2>{table(summaries)}<h2>Calibracion por pregunta o actividad — provisional</h2>{table(activities)}<h2>Plan temporal almacenado</h2>{table(times)}<h2>Sensibilidad x3, x4, x5 y x6 — no empirica</h2>{table(scenarios)}
<h2>Datos necesarios para cerrar la auditoria</h2><p>Tiempos medidos de docentes y estudiantes por actividad, incluyendo lectura, recursos, justificacion y reintentos; horas oficiales y porcentaje real asignado al simulador; identificacion de actividades obligatorias frente a optativas; validacion de claves y distractores por docente de especialidad; rubricas de logro y pilotaje con estudiantes. Mantener 10/50/40 como objetivo, no como resultado alcanzado. En 25 preguntas, acordar redondeo (por ejemplo 3/12/10) y medir dificultad por operaciones reales.</p>
<script>document.getElementById('filter').addEventListener('input',e=>{{const q=e.target.value.toLocaleLowerCase('es');document.querySelectorAll('tbody tr').forEach(r=>r.hidden=!r.textContent.toLocaleLowerCase('es').includes(q));}});</script></html>'''
evidence = '<h2>Evidencia visual por muestra</h2><p>Nubi aparece superpuesto al titulo en la captura de Aprendizajes esperados; su posicion arrastrable puede ocultar contenido. Las capturas no prueban el funcionamiento de todos los controles.</p>' + ''.join(f'<figure><img src="auditoria-estacion{n}.png" alt="Captura de la estacion {n}" style="width:100%;max-width:900px"><figcaption>Estacion {n} · modulo 1</figcaption></figure>' for n in (1,2,3,5,6))
report = report.replace('<h2>Datos necesarios para cerrar la auditoria</h2>', evidence + '<h2>Datos necesarios para cerrar la auditoria</h2>')
(OUT/'informe.html').write_text(report, encoding='utf-8')
print(json.dumps(inventory, ensure_ascii=True))
