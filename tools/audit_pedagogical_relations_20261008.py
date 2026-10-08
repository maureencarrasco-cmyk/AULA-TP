"""Read-only relationships audit with explicit limits on semantic conclusions."""
import collections
import csv
import hashlib
import json
import re
import sqlite3
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from pedagogy import enrich
from learning_sequence import learning_sequence

OUT = ROOT/'reports/auditoria-integral-20261008'
OUT.mkdir(parents=True, exist_ok=True)
def norm(value):
    return ' '.join(unicodedata.normalize('NFKD',str(value or '')).encode('ascii','ignore').decode().lower().split())
def text(item):
    return str(item.get('question') or item.get('prompt') or item.get('case_prompt') or item.get('development') or item.get('title') or item.get('detail') or item.get('label') or item.get('context') or '')
records, flags, modules = [], [], []
def inspect(m, path, item, kind, ae=None):
    prompt = (str(item.get('prompt') or item.get('case_prompt') or item.get('question') or '')
              if kind == 'Paso de AE' else text(item))
    contract = item.get('instruction') or {}
    row = dict(Curso_ID=m['course_id'],Curso=m['course'],Modulo_ID=m['id'],Modulo=m['title'],Actividad=path,Tipo=kind,
               Objetivo=contract.get('purpose') or item.get('criterion') or (ae or {}).get('title'),
               Consigna=prompt,Contexto=item.get('context') or item.get('stimulus') or '',
               Criterio=item.get('criterion') or contract.get('criterion'),Imagen=item.get('image'),
               Formula=item.get('formula'),Tabla=item.get('table'),Grafico=item.get('chart'),
               Alternativas=item.get('options'),Clave=item.get('answer'),Explicacion=item.get('explanation'),
               Evidencia_solicitada=item.get('evidence_prompt') or contract.get('response'),
               Contrato=contract,Revision_semantica='No certificada; inspeccion de relaciones y alertas documentales',
               Revision_visual='Consultar evidencias de navegador; no inferir nitidez de la ruta')
    records.append(row)
    def flag(criterion,evidence,proposal,priority='Media',state='ALERTA PARA CONTRASTE'):
        flags.append(dict(Curso_ID=m['course_id'],Curso=m['course'],Modulo_ID=m['id'],Modulo=m['title'],Actividad=path,
                          Criterio=criterion,Estado_actual=state,Porcentaje_cumplimiento=None,Evidencia=evidence,
                          Hallazgo=evidence,Cambio_requerido='Revision localizada; confirmar antes de modificar',
                          Cambio_propuesto=proposal,Justificacion='La observacion se relaciona con la comprension y la evidencia, no con preferencias esteticas.',
                          Prioridad=priority,Autorizacion='NO EJECUTADO; pendiente de autorizacion para este hallazgo'))
    if kind == 'Desarrollo final':
        development = norm(item.get('development'))
        background = str(item.get('background') or '')
        if 'UI-01, UI-02 y UE-01 aparecen en planta' in background and not any(w in development for w in ('climatiz','refriger','unidad interior','ui-01','ue-01','drenaje')):
            flag('Antecedentes del desarrollo y problema del modulo',
                 f'Contexto del bloque: {item.get("context")!r}; antecedentes: {background!r}; desarrollo solicitado: {item.get("development")!r}.',
                 'Revisar exclusivamente development_pack.context, role, objective, problem, background, evidence y constraints: vincularlos con el caso real del modulo, conservando el AE, la actividad y la rubrica. Confirmar primero su presentacion visible.',
                 priority='Alta',state='BLOQUE DE CLIMATIZACION AJENO AL DESARROLLO SOLICITADO; verificar presentacion')
        if 'resuelve los calculos' in norm(contract.get('action')) and not any(w in development for w in ('calcul','cubica','cantidad','superficie','volumen','costo','medid','dimension','escala')):
            flag('Accion del desarrollo y datos disponibles',
                 f'Instruccion: {contract.get("action")!r}; tarea: {item.get("development")!r}. No se identifica un calculo solicitado en el texto del desarrollo.',
                 'Contrastar development_pack.instruction.action y start con la consigna. No exigir calculos sin datos ni confundir un modelo conceptual con un calculo numerico.')
    obj = contract.get('object')
    valid_objects = {norm(prompt), norm(item.get('context')), norm(item.get('stimulus'))}
    if kind in ('Pregunta final','Caso integrador') and obj and norm(obj) not in valid_objects:
        flag('Consigna y objeto de la instruccion',f'Consigna: {prompt!r}; objeto: {obj!r}',f'Contrastar {path}.instruction.object con la pregunta visible; corregir solo la discrepancia comprobada.')
    formula = norm(item.get('formula'))
    context = norm(m['title']+' '+ ' '.join(str(item.get(k) or '') for k in ('question','prompt','case_prompt','context','stimulus','criterion')))
    if kind in ('Pregunta final','Caso integrador') and 'medida en el plano' in formula and not any(w in context for w in ('plano','escala','cubic','medida','dimension','longitud')):
        flag('Recurso de calculo y accion solicitada',f'Formula: {item["formula"]!r}. Pregunta: {prompt!r}. El texto de la tarea no menciona plano, escala, medidas, dimensiones, longitud ni cubicacion.',f'Revisar {path}.formula; determinar si tiene un uso explicito en esta tarea antes de retirarla.',state='DESCONEXION TEXTUAL COMPROBADA; funcion pedagogica por contrastar')
    chart = norm(item.get('chart'))
    if kind in ('Pregunta final','Caso integrador') and 'croquis: eje horizontal' in chart and not any(w in context for w in ('croquis','cota','grafico','tramo','plano','medida','lectura')):
        flag('Grafico y accion solicitada',f'Grafico: {item["chart"]!r}. Consigna sin referencia a croquis, cotas, graficos, tramos, planos, medidas o lecturas: {prompt!r}',f'Revisar {path}.chart y confirmar si aporta evidencia a la pregunta.')
    options = item.get('options') or []
    answer = item.get('answer')
    if isinstance(answer,int) and not isinstance(answer,bool) and 0 <= answer < len(options) and len(options)>2:
        lengths = [len(str(x.get('text') or x.get('label') or '') if isinstance(x,dict) else str(x)) for x in options]
        if lengths[answer] > 2*max(lengths[:answer]+lengths[answer+1:]) and lengths[answer]>100:
            flag('Pista formal por longitud de alternativa',f'Longitudes por alternativa: {lengths}; clave {answer}. La correcta supera dos veces la longitud de cada distractor.',f'Contrastar el riesgo de resolver {path} por forma y no por conocimiento; equilibrar alternativas solo si se confirma una pista.',state='ASIMETRIA MEDIDA; no demuestra resolucion por pista')
    if kind == 'Paso de AE' and item.get('type')=='hotspot':
        spots=item.get('spots') or []
        generic=[s for s in spots if norm(s.get('detail')) in ('revisar','identifica el dato observable y conserva su fuente.')]
        if spots and len(generic)==len(spots):
            flag('Datos de puntos interactivos',f'{len(spots)}/{len(spots)} puntos solo presentan un detalle generico; contrastar con el recurso mostrado.',f'Revisar los datos observables de {path}.spots sin cambiar la secuencia.')

with sqlite3.connect((ROOT/'data/aulatp.sqlite3').as_uri()+'?mode=ro',uri=True) as db:
    db.execute('PRAGMA query_only=ON')
    source=[dict(zip(('id','course_id','title','position','course','raw'),r)) for r in db.execute('SELECT m.id,m.course_id,m.title,m.position,c.title,m.content FROM modules m JOIN courses c ON c.id=m.course_id ORDER BY c.id,m.position')]
for m in source:
    c=enrich(json.loads(m['raw']),m['position'])
    modules.append({k:m[k] for k in ('id','course_id','title','position','course')} | dict(sha256=hashlib.sha256(m['raw'].encode()).hexdigest(),AE=len(c.get('aes') or [])))
    for a,ae in enumerate(c.get('aes') or []):
        for s,item in enumerate(learning_sequence(ae)):
            inspect(m,f'aes[{a}].learning_sequence[{s}]',item,'Paso de AE',ae)
    for key,kind in (('cases','Caso integrador'),('questions','Pregunta final')):
        for i,item in enumerate(c.get(key) or []):
            inspect(m,f'{key}[{i}]',item,kind)
    for key,kind in (('development_pack','Desarrollo final'),('scene','Escenario explorable')):
        inspect(m,key,c.get(key) or {'prompt':c.get('development')},kind)
    inspect(m,'explore',c.get('explore') or {'prompt':c.get('context')},'Contextualizacion')
    for i,item in enumerate((c.get('scene') or {}).get('parts') or []):
        inspect(m,f'scene.parts[{i}]',item,'Punto de inspeccion')
    for i,item in enumerate(c.get('formative_pack') or []):
        inspect(m,f'formative_pack[{i}]',item,'Actividad formativa')
        if isinstance(item.get('task'),dict):
            inspect(m,f'formative_pack[{i}].task',dict(item['task'],prompt=item.get('prompt')),'Recurso de actividad formativa')
    for i,item in enumerate((c.get('encargos') or {}).get('items') or []):
        inspect(m,f'encargos.items[{i}]',item,'Encargo de oficio')
    if isinstance(c.get('practice'),dict):
        inspect(m,'practice',c['practice'],'Configuracion de practica libre')
(OUT/'relaciones-por-actividad.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'manifest-actual.json').write_text(json.dumps(modules,ensure_ascii=False,indent=2),encoding='utf-8')
for name,items in [('alertas-pedagogicas',flags)]:
    with (OUT/f'{name}.csv').open('w',encoding='utf-8-sig',newline='') as file:
        fields=list(items[0]) if items else ['Curso_ID','Curso','Modulo_ID','Actividad','Criterio']
        w=csv.DictWriter(file,fieldnames=fields);w.writeheader();w.writerows(items)
summary=dict(cursos=len({m['course_id'] for m in modules}),modulos=len(modules),actividades_con_relaciones=len(records),
             alertas=len(flags),criterios=dict(collections.Counter(f['Criterio'] for f in flags)),
             alcance='Revision documental de relaciones; las alertas no equivalen a defectos pedagogicos confirmados',
             cumplimiento_integral=None,cambios_ejecutados=0)
(OUT/'resumen-relaciones.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(summary,ensure_ascii=True))
