import argparse
import html
import json
from collections import defaultdict
from pathlib import Path


parser=argparse.ArgumentParser()
parser.add_argument('source',type=Path)
parser.add_argument('output',type=Path)
args=parser.parse_args()
data=json.loads(args.source.read_text(encoding='utf-8'))
escape=lambda text:html.escape(str(text or ''))
courses=defaultdict(lambda:{'modules':0,'checks':0,'matches':0,'review':0})
pending=[]
for module in data['modules']:
    totals=courses[module['course']];totals['modules']+=1
    for check in module['comparisons']:
        totals['checks']+=1
        totals['matches']+=check['status']=='coincidencia_documental'
        totals['review']+=check['status']!='coincidencia_documental'
        if check['status']!='coincidencia_documental':pending.append((module,check))
rows=''.join(f"<tr><td>{escape(course)}</td><td>{totals['modules']}</td><td>{totals['checks']}</td><td>{totals['matches']}</td><td>{totals['review']}</td><td>{100*totals['matches']/totals['checks']:.2f}%</td></tr>" for course,totals in courses.items() if totals['checks'])
cases=''.join(f"<tr><td>{escape(module['course'])}</td><td>{escape(module['module'])}</td><td>{escape(check['ae'])} · {escape(check['type'])}</td><td>{escape(check['text'])}</td><td>{escape(module['pdf'])}</td><td>{escape(check['reason'])}</td><td>Cotejar enunciado, numeración y ubicación en la fuente; registrar propuesta sin cambiar evaluaciones.</td></tr>" for module,check in pending)
summary=data['summary']
document=f'''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cotejo documental de 45 cursos</title><style>body{{font:15px/1.6 Arial,sans-serif;color:#18334a;margin:30px auto;padding:20px;max-width:1500px}}h1{{font-size:28px}}table{{border-collapse:collapse;width:100%}}th,td{{border:1px solid #cbdbe3;padding:10px;text-align:left;vertical-align:top;overflow-wrap:anywhere}}th{{background:#e5f2f6}}.scroll{{overflow:auto}}.cases{{min-width:1200px}}@media print{{body{{margin:0;padding:8px}}.cases{{min-width:0}}table{{font-size:10px}}tr{{break-inside:avoid}}}}</style><h1>Cotejo documental de los 45 cursos</h1><p>13/10/2026 · Base consultada en modo solo lectura · No se modificaron contenidos ni evaluaciones.</p><p><strong>{summary['modules']} módulos · {summary['sources']} fuentes PDF · {summary['checks']} comprobaciones · {summary['matches']} coincidencias · {summary['review']} casos por revisar.</strong></p><p>Se compararon los enunciados de AE y criterios con el texto extraído del programa declarado. Se normalizaron acentos, puntuación y saltos de línea. El porcentaje mide coincidencia textual, no cumplimiento curricular, aprendizaje ni pertinencia pedagógica. Una ausencia de coincidencia no demuestra por sí sola un error: puede responder a adaptación, abreviación o extracción del PDF.</p><h2>Resumen por curso</h2><div class="scroll"><table><thead><tr><th>Curso</th><th>Módulos</th><th>Comprobaciones</th><th>Coincidencias</th><th>Revisión</th><th>Coincidencia textual</th></tr></thead><tbody>{rows}</tbody></table></div><h2>Casos identificados</h2><div class="scroll"><table class="cases"><thead><tr><th>Curso</th><th>Módulo</th><th>AE / tipo</th><th>Texto original</th><th>Fuente declarada</th><th>Resultado</th><th>Siguiente revisión</th></tr></thead><tbody>{cases}</tbody></table></div><p>Las coincidencias quedan respaldadas por las huellas SHA-256 de las fuentes en el anexo JSON. Este cotejo no cambia los estados originales de validación ni certifica la asociación de actividades, evaluaciones o recursos con el currículo.</p></html>'''
args.output.write_text(document,encoding='utf-8')
print(json.dumps({'courses':len(courses),'cases':len(pending),'report':str(args.output)}))
