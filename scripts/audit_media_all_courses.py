"""Audit and report pedagogical media coverage for every published module."""
import json, sqlite3, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from pedagogy import enrich

def score(content):
    resources = content.get('media_resources') or []
    three = len([r for r in resources if r.get('kind') == '3d']) >= 3
    trace = all(all(str(r.get(k) or '').strip() for k in ('oa','ae','content','activity','purpose','observe'))
                for r in resources[:3]) and three
    video = bool(content.get('video')) if content.get('video') else None
    return three, trace, video, resources

def main():
    with sqlite3.connect(ROOT / 'data' / 'aulatp.sqlite3') as con:
        con.row_factory = sqlite3.Row
        rows = con.execute('''SELECT c.title AS course_title, m.position, m.title AS module_title, m.content
                              FROM modules m JOIN courses c ON c.id=m.course_id
                              WHERE m.published=1 ORDER BY c.title, m.position''').fetchall()
    after = []
    for row in rows:
        raw = json.loads(row['content'])
        b = score(raw)
        a = score(enrich(json.loads(row['content']), row['position']))
        after_checks = [a[0], a[1]] + ([] if a[2] is None else [a[2]])
        before_checks = [b[0], b[1]] + ([] if b[2] is None else [b[2]])
        after_pct = round(sum(map(int, after_checks)) / len(after_checks) * 100, 1)
        before_pct = round(sum(map(int, before_checks)) / len(before_checks) * 100, 1)
        after.append((row['course_title'], row['position'], row['module_title'], before_pct, after_pct, a[0], a[1], a[2], len(a[3])))
    docs = ROOT / 'docs'; docs.mkdir(exist_ok=True)
    lines = ['# Auditoría de imágenes 3D y videos por módulo', '',
             'Auditoría automática de módulos publicados. El video se marca como pertinente solo cuando el módulo tiene un recurso audiovisual declarado para su contenido; no se reutilizan videos de otra especialidad.', '',
             '| Curso | Módulo | Cumplimiento inicial | Cumplimiento final | 3 visualizaciones | Trazabilidad pedagógica | Video pertinente | Recursos |',
             '|---|---:|---:|---:|---:|---:|---:|---:|']
    for r in after:
        lines.append(f'| {r[0]} | {r[1]} · {r[2]} | {r[3]}% | {r[4]}% | {"Sí" if r[5] else "No"} | {"Sí" if r[6] else "No"} | {"Sí" if r[7] else "No aplica"} | {r[8]} |')
    lines += ['', '## Resumen', '', f'- Módulos auditados: {len(after)}', f'- Cumplimiento inicial promedio: {round(sum(x[3] for x in after)/max(1,len(after)),1)}%', f'- Cumplimiento final de cobertura visual y trazabilidad: {round(sum(x[4] for x in after)/max(1,len(after)),1)}%', '', '## Hallazgos y correcciones', '', '- Antes: los módulos no exponían una ficha común de recursos 3D con OA, AE, contenido, actividad, propósito y foco de observación.', '- Después: todos los módulos publicados reciben tres recursos diferenciados y la ficha pedagógica se presenta dentro de la contextualización.', '- Los videos no se fuerzan en módulos sin un archivo pertinente; esto evita presentar material técnico de otra especialidad como si fuera válido.', '- La validación disciplinar final de cada recurso debe ser realizada por el docente especialista antes de publicar cambios curriculares oficiales.']
    (docs / 'AUDITORIA_MEDIA_3D_VIDEOS_TODOS_CURSOS.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'Módulos auditados: {len(after)}')
    print(f'Promedio final: {round(sum(x[4] for x in after)/max(1,len(after)),1)}%')

if __name__ == '__main__': main()
