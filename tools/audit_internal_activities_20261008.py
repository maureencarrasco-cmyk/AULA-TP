"""Read-only per-activity checks; never imports or starts the application."""
import collections
import csv
import hashlib
import json
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from pedagogy import enrich
from learning_sequence import learning_sequence

OUT = ROOT / 'reports' / 'microauditoria-actividades-20261008'
OUT.mkdir(parents=True, exist_ok=True)
with sqlite3.connect((ROOT / 'data/aulatp.sqlite3').as_uri() + '?mode=ro', uri=True) as db:
    db.execute('PRAGMA query_only=ON')
    modules = [dict(zip(['id', 'course_id', 'title', 'position', 'course', 'specialty', 'raw'], r)) for r in db.execute('SELECT m.id,m.course_id,m.title,m.position,c.title,c.specialty,m.content FROM modules m JOIN courses c ON c.id=m.course_id ORDER BY c.id,m.position,m.id')]
assert len(modules) == 451 and len({m['course_id'] for m in modules}) == 45
activities, checks, alerts, manifest, images = [], [], [], [], collections.defaultdict(list)
def plain(value):
    if isinstance(value, dict):
        return str(value.get('text') or value.get('label') or value.get('title') or '')
    return str(value or '')
def normalized(value):
    return ' '.join(plain(value).casefold().split())
def check(identity, criterion, valid, evidence):
    checks.append(dict(**identity, Criterio=criterion, Cumple=bool(valid), Evidencia=evidence))
def alert(identity, criterion, evidence, proposal, priority='Media', confirmed=True):
    alerts.append(dict(**identity, Criterio=criterion, Estado_actual='Inconsistencia documental comprobada' if confirmed else 'Requiere contraste especializado', Porcentaje_cumplimiento=None, Evidencia=evidence, Hallazgo=evidence, Cambio_requerido='Si, sujeto a aprobacion' if confirmed else 'Por determinar', Cambio_propuesto=proposal, Justificacion='La propuesta se limita al elemento identificado; no autoriza cambios globales.', Prioridad=priority, Autorizacion='PENDIENTE / NO EJECUTADO'))
def inspect(m, path, item, kind, ae_index=None):
    identity = dict(Curso_ID=m['course_id'], Curso=m['course'], Modulo_ID=m['id'], Modulo=m['title'], Actividad=path, Tipo=kind)
    prompt = plain(item.get('question') or item.get('case_prompt') or item.get('prompt') or item.get('context') or item.get('detail') or item.get('title') or item.get('label'))
    row = dict(**identity, AE=ae_index, Enunciado=prompt, Contexto=plain(item.get('context')), Criterio_declarado=plain(item.get('criterion')), Imagen=item.get('image'), Alternativas=[plain(o) for o in item.get('options', [])], Clave=item.get('answer'), Fuente='Contenido enriquecido en memoria con las funciones locales; no lectura directa del navegador', Auditoria_semantica='NV: requiere contraste especializado', Auditoria_visual='NV: requiere inspeccion de la actividad renderizada')
    activities.append(row)
    check(identity, 'Consigna registrada', bool(prompt.strip()), repr(prompt))
    if item.get('type') == 'choice' or kind in ('Pregunta final', 'Caso integrador'):
        options = row['Alternativas']
        key = item.get('answer')
        options_ok = len(options) >= 2 and all(o.strip() for o in options) and len(set(normalized(o) for o in options)) == len(options)
        check(identity, 'Alternativas distintas y no vacias', options_ok, f'{len(options)} alternativas; {len(set(normalized(o) for o in options))} distintas')
        valid = type(key) is int and 0 <= key < len(options)
        check(identity, 'Clave dentro de alternativas', valid, f'Clave={key}; indices=0..{len(options)-1}; no certifica correccion disciplinar')
        if not options_ok or not valid:
            alert(identity, 'Alternativas y clave', f'Clave={key}; alternativas={options}', f'Revisar {path}.options / answer; validar la clave con especialista.', 'Alta')
        if valid:
            answer = normalized(options[key])
            for field in ('alt', 'caption', 'stimulus'):
                text = normalized(item.get(field))
                if len(answer) >= 25 and answer in text:
                    alert(identity, 'Posible anticipacion de respuesta', f'{path}.{field} contiene literalmente la alternativa correcta: {options[key]!r}', f'Revisar si {path}.{field} entrega la solucion antes de responder; ajustar solo si se confirma fuga.', confirmed=False)
    if kind in ('Pregunta final', 'Caso integrador'):
        explanation = plain(item.get('explanation'))
        check(identity, 'Explicacion registrada', bool(explanation.strip()), repr(explanation))
        index = item.get('ae')
        check(identity, 'Indice AE valido', type(index) is int and 0 <= index < len(m['aes']), f'ae={index}; {len(m["aes"])} aprendizajes')
        criterion = plain(item.get('criterion'))
        official = m['aes'][index].get('criteria', []) if type(index) is int and 0 <= index < len(m['aes']) else []
        belongs = bool(criterion.strip()) and normalized(criterion) in {normalized(x) for x in official}
        check(identity, 'Criterio pertenece al AE declarado', belongs, f'Criterio={criterion!r}; AE={index}; contraste textual, no equivalencia semantica')
        if not belongs:
            alert(identity, 'Trazabilidad textual de criterio', f'Criterio {criterion!r} no coincide literalmente con criterios del AE {index}.', f'Contrastar {path}.criterion y {path}.ae con el programa y la tarea; conservar si hay equivalencia justificada.', confirmed=False)
    if kind == 'Paso de AE':
        check(identity, 'Producto de respuesta indicado', bool(plain(item.get('evidence_prompt')).strip()), plain(item.get('evidence_prompt')))
        check(identity, 'Orientacion progresiva disponible', bool(item.get('guidance')), json.dumps(item.get('guidance'), ensure_ascii=False))
    if item.get('image'):
        ref = str(item['image'])
        local = ROOT / unquote(urlsplit(ref).path).lstrip('/')
        exists = ref.startswith('/static/') and local.is_file() and local.stat().st_size > 0
        check(identity, 'Archivo de imagen existente', exists, ref)
        images[ref.split('?')[0]].append(identity)
        if not exists:
            alert(identity, 'Archivo visual ausente', ref, f'Revisar la ruta {path}.image y restituir el recurso exacto si es necesario.', 'Alta')
    return row

for m in modules:
    raw = m.pop('raw')
    c = enrich(json.loads(raw), m['position'])
    m['aes'] = c.get('aes', [])
    ui = dict((k, m[k]) for k in ('id','course_id','title','position','course','specialty'))
    ui.update(aeCount=len(m['aes']), caseCount=len(c.get('cases', [])), questionCount=len(c.get('questions', [])), sha256=hashlib.sha256(raw.encode()).hexdigest())
    manifest.append(ui)
    for a, ae in enumerate(m['aes']):
        for s, item in enumerate(learning_sequence(ae)):
            inspect(m, f'aes[{a}].learning_sequence[{s}]', item, 'Paso de AE', a)
    for kind, label in [('cases', 'Caso integrador'), ('questions', 'Pregunta final')]:
        signatures = collections.defaultdict(list)
        for index, item in enumerate(c.get(kind, [])):
            row = inspect(m, f'{kind}[{index}]', item, label, item.get('ae'))
            signature = json.dumps([normalized(row['Enunciado']), normalized(row['Contexto']), row['Alternativas'], item.get('image'), item.get('table'), item.get('stimulus')], ensure_ascii=False, sort_keys=True)
            signatures[signature].append(index)
        for indices in signatures.values():
            if len(indices) > 1:
                item = c[kind][indices[0]]
                identity = dict(Curso_ID=m['course_id'],Curso=m['course'],Modulo_ID=m['id'],Modulo=m['title'],Actividad=f'{kind}: indices {indices}',Tipo=label)
                alert(identity, 'Duplicacion exacta de tarea y evidencia', f'Mismos enunciado, contexto, alternativas, imagen, tabla y estimulo en indices {indices}.', f'Confirmar si la repeticion es intencional; si no, diferenciar las tareas {kind} {indices} sin cambiar automaticamente sus claves.', confirmed=False)
    inspect(m, 'development_pack', c.get('development_pack') or {'prompt':c.get('development')}, 'Desarrollo final')
    inspect(m, 'explore', c.get('explore') or {'prompt':c.get('context')}, 'Contextualizacion')
    scene = c.get('scene') or {}
    inspect(m, 'scene', scene, 'Escenario explorable')
    for index, part in enumerate(scene.get('parts') or []):
        inspect(m, f'scene.parts[{index}]', part, 'Punto de inspeccion')
    for index, item in enumerate((c.get('encargos') or {}).get('items') or []):
        inspect(m, f'encargos.items[{index}]', item, 'Encargo de oficio', item.get('ae'))
    for index, item in enumerate(c.get('formative_pack') or []):
        inspect(m, f'formative_pack[{index}]', item, 'Actividad formativa')
        if isinstance(item.get('task'), dict):
            task = dict(item['task'], prompt=item.get('prompt'))
            inspect(m, f'formative_pack[{index}].task', task, 'Recurso de actividad formativa')
    if isinstance(c.get('practice'), dict):
        inspect(m, 'practice', c['practice'], 'Configuracion de practica libre')

result = dict(fecha=datetime.now(timezone.utc).isoformat(), alcance='Controles documentales exhaustivos por actividad; no certificacion pedagogica/visual', manifest=manifest, actividades=activities, comprobaciones=checks, hallazgos=alerts, imagenes=dict(images))
(OUT/'revision-documental.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
for name, items in [('actividades', activities), ('hallazgos-documentales',alerts)]:
    if not items:
        continue
    with (OUT/f'{name}.csv').open('w',encoding='utf-8-sig',newline='') as file:
        keys=list(dict.fromkeys(k for row in items for k in row))
        writer=csv.DictWriter(file,fieldnames=keys)
        writer.writeheader()
        writer.writerows(items)
print(json.dumps(dict(cursos=45,modulos=451,actividades=len(activities),controles=len(checks),alertas=len(alerts),tipos=dict(collections.Counter(a['Tipo'] for a in activities)),criterios=dict(collections.Counter(a['Criterio'] for a in alerts)),imagenes_unicas=len(images)),ensure_ascii=True))
