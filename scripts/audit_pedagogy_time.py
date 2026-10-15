"""Read-only documentary audit. Never treats missing timing as measured failure."""
import argparse
import csv
import hashlib
import html
import json
import sqlite3
from collections import Counter
from pathlib import Path

STATIONS = ['Contextualizacion', 'Aprendizajes Esperados', 'Situacion Integradora',
            'Mision Laboral', 'Evaluacion Final', 'Retroalimentacion y Cierre']


def number(value):
    return float(value) if isinstance(value, (int, float)) and not isinstance(value, bool) and value >= 0 else None


def percent(changed, reviewed):
    return round(changed / reviewed * 100, 2) if reviewed else None


def units(content):
    yield 1, 'context', {'prompt': content.get('context'), 'ae': None}
    for a, ae in enumerate(content.get('aes') or []):
        for i, item in enumerate(ae.get('experiences') or []):
            yield 2, f'ae/{a}/experiences/{i}', dict(item, ae=a)
        if not ae.get('experiences'):
            for i, step in enumerate(ae.get('steps') or []):
                yield 2, f'ae/{a}/steps/{i}', {'prompt': step, 'ae': a}
    for kind, station in [('cases', 3), ('questions', 5)]:
        for i, item in enumerate(content.get(kind) or []):
            yield station, f'{kind}/{i}', item
    if content.get('scene'):
        yield 3, 'scene', content['scene']
    for i, item in enumerate(content.get('formative_pack') or []):
        old = item.get('station', 3)
        yield {4: 5, 5: 6}.get(old, old), f'formative_pack/{i}', item
    for i, item in enumerate((content.get('encargos') or {}).get('items') or []):
        old = item.get('station', 2)
        yield {4: 5, 5: 6}.get(old, old), f'encargos/items/{i}', item
    if content.get('development_pack') or content.get('development'):
        pack = content.get('development_pack') or {}
        yield 5, 'development', dict(pack, prompt=content.get('development') or pack.get('development'))
    yield 6, 'reflection_prompt', {'prompt': content.get('reflection_prompt')}


def inspect(item, station, content):
    issues = []
    prompt = next((item.get(k) for k in ['prompt', 'question', 'text', 'title', 'instruction'] if item.get(k)), None)
    if not prompt:
        issues.append(('pedagogica', 'No se encuentra consigna en los campos revisados.', 'Revisar la consigna visible y documentarla antes de aprobar la unidad.'))
    aes = content.get('aes') or []
    ref = item.get('ae')
    if isinstance(ref, int) and not 0 <= ref < len(aes):
        issues.append(('pedagogica', f'Referencia AE fuera del rango disponible: {ref}.', 'Verificar y proponer el AE correcto; no reasignar automaticamente.'))
    if 'options' in item:
        opts = item.get('options') or []
        answer = item.get('answer')
        if not opts or not isinstance(answer, int) or not 0 <= answer < len(opts):
            issues.append(('evaluativa', 'Alternativas o indice de respuesta inconsistente.', 'Validar el instrumento por separado, sin modificar respuestas.'))
        if len({str(x).strip().casefold() for x in opts}) != len(opts):
            issues.append(('evaluativa', 'Alternativas textualmente duplicadas en el mismo item.', 'Revisar discriminacion y proponer alternativas diferenciadas.'))
        if station == 3 and not item.get('explanation'):
            issues.append(('retroalimentacion', 'Caso sin explicacion registrada.', 'Verificar apoyos visibles y proponer retroalimentacion especifica.'))
    return issues


def write_csv(path, rows):
    if not rows:
        return
    with path.open('w', encoding='utf-8-sig', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--database', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    before = hashlib.sha256(args.database.read_bytes()).hexdigest()
    con = sqlite3.connect(args.database.resolve().as_uri() + '?mode=ro', uri=True)
    con.row_factory = sqlite3.Row
    courses = list(con.execute('SELECT id,title,level FROM courses ORDER BY id'))
    details, module_rows, summaries, station_rows = [], [], [], []
    for course in courses:
        counters = {s: Counter() for s in range(1, 7)}
        modules = list(con.execute('SELECT id,title,position,published,content FROM modules WHERE course_id=? ORDER BY position', (course['id'],)))
        budget_total, budget_known, expert_sum, expert_known, total = 0, 0, 0, 0, 0
        for module in modules:
            content = json.loads(module['content'])
            plan = content.get('planning') or {}
            hp = number(plan.get('official_hp'))
            available = hp * .30 * 45 if hp is not None else None
            if available is not None:
                budget_total += available
                budget_known += 1
            allocated = number(plan.get('minutes'))
            module_issues = []
            if allocated is not None and available is not None and abs(allocated - available) > 1:
                module_issues.append('Presupuesto persistido distinto de 30% de HP x 45; contrastar con plan calculado en ejecucion.')
            exam_minutes = number(plan.get('exam_minutes'))
            if exam_minutes not in (None, 90, 120):
                module_issues.append('Duracion evaluativa persistida distinta de 2 HP (90 min) y 2 horas cronologicas (120 min).')
            if len(content.get('questions') or []) != 25:
                module_issues.append('Banco distinto de 25 preguntas; verificar seleccion efectiva en interfaz.')
            module_issues.append('Aclarar si las 2 horas institucionales son pedagogicas o cronologicas; no cambiar duracion.')
            module_issues.append('Mision Laboral sin unidades auditables integradas en este catalogo; reserva temporal pendiente.')
            module_rows.append({'curso_id': course['id'], 'curso': course['title'], 'modulo_id': module['id'], 'modulo': module['title'], 'publicado': module['published'], 'hp_oficiales_registradas': hp, 'presupuesto_30_minutos': available, 'minutos_plan_persistido': allocated, 'minutos_evaluacion_persistidos': exam_minutes, 'preguntas_banco': len(content.get('questions') or []), 'observaciones': ' | '.join(module_issues)})
            for station, key, item in units(content):
                if station not in counters:
                    raise ValueError(f'Unsupported station {station}: {key}')
                total += 1
                bucket = counters[station]
                bucket['revisadas'] += 1
                issues = inspect(item, station, content)
                bucket['cambios'] += bool(issues)
                expert = number(item.get('expert_minutes'))
                # Only explicitly recorded expert timing can generate a x5 estimate.
                estimated = expert * 5 if expert is not None else None
                if expert is not None:
                    expert_sum += expert
                    expert_known += 1
                else:
                    bucket['tiempo_pendiente'] += 1
                bucket['pedagogicas'] += any(x[0] == 'pedagogica' for x in issues)
                bucket['evaluativas'] += any(x[0] == 'evaluativa' for x in issues)
                bucket['retroalimentacion'] += any(x[0] == 'retroalimentacion' for x in issues)
                details.append({'curso_id': course['id'], 'curso': course['title'], 'modulo_id': module['id'], 'modulo': module['title'], 'estacion': station, 'actividad': key, 'evidencia': f'modules.id={module["id"]}; content/{key}', 'requiere_cambio_documental': bool(issues), 'clasificacion': ' | '.join(sorted({x[0] for x in issues})), 'problema': ' | '.join(x[1] for x in issues), 'recomendacion': ' | '.join(x[2] for x in issues), 'tiempo_docente_min': expert, 'tiempo_estudiante_x5_min': estimated, 'verificacion_temporal': 'Estimacion; no observacion estudiantil' if expert is not None else 'Pendiente: cronometraje docente y pilotaje', 'revision_semantica': 'Pendiente: pertinencia tecnica, progresion, transferencia y suficiencia temporal conjuntas'})
        changed = sum(x['cambios'] for x in counters.values())
        for station, bucket in counters.items():
            station_rows.append({'curso_id': course['id'], 'curso': course['title'], 'nivel': course['level'], 'estacion': station, 'nombre': STATIONS[station-1], 'actividades_revisadas': bucket['revisadas'], 'actividades_requieren_cambios_documentales': bucket['cambios'], 'porcentaje_cambios_documentales': percent(bucket['cambios'], bucket['revisadas']), 'porcentaje_pedagogico_documental': percent(bucket['pedagogicas'], bucket['revisadas']), 'porcentaje_problemas_tiempo_confirmados': None, 'tiempos_pendientes': bucket['tiempo_pendiente'], 'estado': 'Revision documental; validacion pedagogica integral pendiente' if bucket['revisadas'] else 'Sin unidades integradas; no equivale a 0% de problemas'})
        estimate = expert_sum * 5 if expert_known == total and total else None
        summaries.append({'curso_id': course['id'], 'curso': course['title'], 'nivel_registrado': course['level'], 'nivel_3_o_4': 'Pendiente: catalogo agrupa ambos niveles', 'modulos': len(modules), 'actividades_revisadas': total, 'actividades_cambio_documental': changed, **{f'estacion_{s}_cambios_pct': percent(counters[s]['cambios'], counters[s]['revisadas']) for s in counters}, 'total_cambios_documentales_pct': percent(changed, total), 'tiempo_pedagogico_x5_min': estimate, 'tiempo_disponible_30_min': budget_total if budget_known == len(modules) else None, 'diferencia_min': estimate - budget_total if estimate is not None and budget_known == len(modules) else None, 'tiempos_docentes_verificados': expert_known, 'prioridad': 'Alta: calibracion temporal, nivel y Mision Laboral; revisar hallazgos documentales'})
    con.close()
    after = hashlib.sha256(args.database.read_bytes()).hexdigest()
    if before != after:
        raise RuntimeError('Source changed during audit; report snapshot not stable')
    for name, rows in [('actividades', details), ('estaciones', station_rows), ('consolidado', summaries), ('modulos_tiempos', module_rows)]:
        write_csv(output / (name + '.csv'), rows)
    payload = {'alcance': 'Auditoria documental automatizada; no certificacion pedagogica integral', 'database_sha256_antes': before, 'database_sha256_despues': after, 'cursos': len(courses), 'modulos': len(module_rows), 'actividades_revisadas': len(details), 'actividades_con_hallazgos_documentales': sum(r['requiere_cambio_documental'] for r in details), 'porcentaje_global_ponderado': percent(sum(r['requiere_cambio_documental'] for r in details), len(details)), 'cursos_resultados': summaries, 'estaciones': station_rows, 'limitaciones': ['Sin cronometrajes: no calcular tiempos ni suficiencia temporal.', 'Sin revision semantica experta no certificar alineamiento ni porcentaje pedagogico integral.', 'Se audita JSON persistido, no simulaciones ejecutadas ni contenidos enriquecidos en memoria.', 'El nivel esta agrupado en 3 y 4 medio; no inventar asignacion por modulo.', 'Dos horas de evaluacion pendientes de unidad: 90 o 120 minutos.', '30% registrado a nivel modulo no verifica por si solo reparto por AE.', 'Practica optativa transversal excluida de denominadores por estacion; requiere inventario separado.', 'Una unidad es una consigna, item, encargo o escena; subinteracciones no se duplican.', 'No se revisan registros personales de estudiantes.']}
    (output / 'resultados.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    def table(rows, fields):
        def cell(value):
            return html.escape('Pendiente / N/D' if value is None else str(value))
        return '<div class="table"><table><thead><tr>' + ''.join('<th>'+cell(k)+'</th>' for k in fields) + '</tr></thead><tbody>' + ''.join('<tr>'+''.join('<td>'+cell(row.get(k))+'</td>' for k in fields)+'</tr>' for row in rows) + '</tbody></table></div>'
    body = '<h1>Auditoria pedagogica y temporal: 45 cursos, seis estaciones</h1><p>Diagnostico documental reproducible. No se modificaron contenidos, interfaz, evaluaciones ni tiempos.</p>'
    body += '<h2>Alcance y limites</h2><ul>'+''.join('<li>'+html.escape(x)+'</li>' for x in payload['limitaciones'])+'</ul>'
    body += f'<p>{len(courses)} cursos; {len(module_rows)} modulos; {len(details)} unidades revisadas. Hallazgos documentales: {payload["porcentaje_global_ponderado"]}% (totales ponderados, no promedio de cursos). No equivale a porcentaje de incumplimiento pedagogico.</p>'
    grouped = []
    for s in range(1, 7):
        rows = [x for x in station_rows if x['estacion'] == s]
        n = sum(x['actividades_revisadas'] for x in rows)
        k = sum(x['actividades_requieren_cambios_documentales'] for x in rows)
        grouped.append({'estacion': STATIONS[s-1], 'revisadas': n, 'con_hallazgos': k, 'porcentaje_documental': percent(k, n), 'tiempo_pendiente': sum(x['tiempos_pendientes'] for x in rows)})
    body += '<h2>Concentracion de hallazgos</h2>'+table(grouped, list(grouped[0]))
    body += '<p>Brechas transversales: medicion experta x5 y pilotaje pendientes; nivel no desagregado; reserva de Mision Laboral ausente; planes persistidos requieren contraste con calculo en ejecucion. La ausencia de hallazgos automaticos no demuestra pertinencia ni suficiencia temporal.</p>'
    body += '<h2>Consolidado por curso</h2>'+table(summaries, list(summaries[0]))
    for course in courses:
        body += '<h2>'+html.escape(course['title'])+'</h2>'
        rows = [r for r in station_rows if r['curso_id'] == course['id']]
        body += table(rows, ['estacion','nombre','actividades_revisadas','actividades_requieren_cambios_documentales','porcentaje_cambios_documentales','porcentaje_pedagogico_documental','porcentaje_problemas_tiempo_confirmados','tiempos_pendientes'])
        summary = next(r for r in summaries if r['curso_id'] == course['id'])
        body += f'<p>Total del curso: {summary["actividades_revisadas"]} revisadas; {summary["actividades_cambio_documental"]} con hallazgos; {summary["total_cambios_documentales_pct"]}%. Mision Laboral: sin unidades; no evaluable. Revision experta y temporal pendientes.</p>'
    body += '<h2>Plan propuesto, sujeto a aprobacion</h2><ol><li>Verificar nivel, HP por AE, obligatoriedad y unidad de las dos horas evaluativas.</li><li>Cronometrar cada consigna experta incluyendo lectura, recursos, decisiones, ejecucion y escritura; aplicar x5 una sola vez, sin volver a sumar procesos incluidos.</li><li>Contrastar pertinencia y tiempo juntos mediante pilotaje de estudiantes: lectura, conocimientos previos, analisis, errores, orientacion, reintento y reflexion.</li><li>Ejecutar escenas 3D y Mision Laboral; evaluar autenticidad y transferencia sin inferirlas desde metadatos.</li><li>Verificar 25 preguntas y desarrollo en las dos horas autorizadas, dentro del 30%, reservando Mision Laboral sin agregar horas.</li><li>Validar hallazgos con especialistas y emitir porcentajes pedagogicos integrales por las seis estaciones, deduplicando actividades.</li></ol>'
    body += '<h2>Evidencias</h2><p>actividades.csv: estacion, actividad, problema, evidencia y recomendacion. modulos_tiempos.csv: presupuesto y discrepancias. estaciones.csv y consolidado.csv: denominadores. resultados.json: huella y limites.</p>'
    document = '<!doctype html><html lang="es"><meta charset="utf-8"><title>Auditoria pedagogica y temporal</title><style>body{font:16px/1.5 Arial,sans-serif;color:#18344a;margin:32px;max-width:1500px}h1{font-size:28px}h2{font-size:22px;margin-top:32px}.table{overflow:auto}table{border-collapse:collapse;font-size:13px;width:100%}th,td{padding:9px;border:1px solid #d4e1ec;text-align:left;vertical-align:top}th{background:#edf5fc}tr:nth-child(even){background:#f7fafc}</style>'+body+'</html>'
    (output / 'informe.html').write_text(document, encoding='utf-8')
    print(json.dumps({k:v for k,v in payload.items() if k not in ['cursos_resultados','estaciones']}, ensure_ascii=True, indent=2))


if __name__ == '__main__':
    main()
