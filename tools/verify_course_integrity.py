"""Post-repair inventory and explicit remaining work, without grade inflation."""
import collections
import json
import sqlite3
import sys
from contextlib import closing
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from content_integrity import MEDIA_FIELDS, asset_exists
from pedagogy import enrich
from scripts.repair_course_integrity import protected_snapshot

OUT=ROOT/'reports'/'correcciones-integridad-20261004'
initial=json.loads((OUT/'aplicadas.json').read_text(encoding='utf-8'))
recovery_path=OUT/'recursos-recuperados.json'
recovery=json.loads(recovery_path.read_text(encoding='utf-8')) if recovery_path.exists() else {}
with closing(sqlite3.connect(f'file:{initial["backup"]}?mode=ro',uri=True)) as old:
    original={r[0]:json.loads(r[1]) for r in old.execute('SELECT id,content FROM modules')}
    protected_before=protected_snapshot(old)
with closing(sqlite3.connect(f'file:{ROOT / "data/aulatp.sqlite3"}?mode=ro',uri=True)) as db:
    db.row_factory=sqlite3.Row
    rows=db.execute('SELECT m.*,c.title course,c.specialty FROM modules m JOIN courses c ON c.id=m.course_id ORDER BY c.specialty,m.position').fetchall()
    protected_after=protected_snapshot(db)

totals=collections.Counter()
courses={}
def walk(value):
    if isinstance(value,dict):
        yield value
        for k,v in value.items():
            if k not in ('integrity_audit','unavailable_media','restored_media','replaced_media'):
                yield from walk(v)
    elif isinstance(value,list):
        for v in value:
            yield from walk(v)

for row in rows:
    c=json.loads(row['content'])
    old=original[row['id']]
    snapshot=lambda data:[(q.get('question'),q.get('options'),q.get('answer')) for q in data.get('questions') or []]
    assert snapshot(c)==snapshot(old),f'Pregunta o clave cambio: {row["id"]}'
    stats=courses.setdefault(row['course'],collections.Counter())
    stats['modules']+=1
    totals['modules']+=1
    src=c.get('specialty_source') or c.get('official_source') or {}
    assert all(not src.get('pdf') or t.get('pdf')==src['pdf'] for t in c.get('traceability') or [])
    assert c['time_audit']['occupancy_percent'] is None
    for obj in walk(c):
        for field in MEDIA_FIELDS:
            value=obj.get(field)
            if isinstance(value,str) and value.startswith('/static/'):
                assert asset_exists(value),f'Ruta activa ausente: {value}'
            if field in (obj.get('unavailable_media') or {}):
                stats['pending_media']+=1
        if isinstance(obj.get('image'),str):
            stats['images']+=1
            stats['images_with_alt']+=bool(obj.get('alt'))
        generated=obj.get('media_origin')=='ai-generated'
        stats['generated_context_references' if generated else 'recovered_references']+=len(obj.get('restored_media') or {})
        stats['contextual_replacements']+=len(obj.get('replaced_media') or {})
    runtime=enrich(c,row['position'])
    runtime_src=runtime.get('specialty_source') or runtime.get('official_source') or {}
    assert all(not runtime_src.get('pdf') or t.get('pdf')==runtime_src['pdf'] for t in runtime['traceability'])
    assert all(t['specialty']==row['specialty'] for t in runtime['traceability']),row['course']
    assert runtime['time_audit']['student_minutes'] is None
    assert runtime['question_calibration']['distribution_valid'] is None
    for obj in walk(runtime):
        for field in MEDIA_FIELDS:
            value=obj.get(field)
            if isinstance(value,str) and value.startswith('/static/'):
                assert asset_exists(value),f'Ruta efectiva ausente: {value}'
assert len(courses)==45 and totals['modules']==451
assert protected_before==protected_after,'Cambio en tabla protegida: revisar.'
result={'courses':45,'modules':451,'protected_tables_unchanged':True,
        'question_text_options_keys_unchanged':True,'source_references_repaired':initial['totals']['source_references'],
        'alternative_labels_added':initial['totals']['alternative_labels'],
        'pending_media_references':sum(v['pending_media'] for v in courses.values()),
        'active_missing_media_paths':0,'restored_media_files':recovery.get('restored_images',0),
        'recovered_media_references':sum(v['recovered_references'] for v in courses.values()),
        'generated_context_references':sum(v['generated_context_references'] for v in courses.values()),
        'contextual_replacements':sum(v['contextual_replacements'] for v in courses.values()),
        'runtime_checked_modules':451,'course_rows':{k:dict(v) for k,v in courses.items()},
        'complete_pedagogical_audit':False,'measured_teacher_times_available':False}
(OUT/'verificacion.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
lines=['# Correcciones aplicadas y pendientes', '',
    'Alcance: 45 cursos y 451 modulos. No se certifica 100% de calidad.', '',
    '## Aplicado y comprobado',
    f'- {result["source_references_repaired"]} referencias curriculares corregidas al PDF registrado de su propio modulo.',
    f'- {result["alternative_labels_added"]} etiquetas alternativas incorporadas desde textos existentes; requieren revision visual.',
    '- Sin rutas multimedia locales inexistentes activas en los datos ni en el contenido enriquecido de los 451 modulos.',
    f'- {result["restored_media_files"]} imagenes originales recuperadas del historial; {result["recovered_media_references"]} referencias reactivadas en su misma especialidad. No es una certificacion disciplinar.',
    f'- {result["generated_context_references"]} referencias completadas con contexto generado, identificado como simulado y separado de la evidencia tecnica.',
    f'- {result["pending_media_references"]} referencias siguen pendientes; no se sustituyen por material de otro oficio.',
    f'- {result["contextual_replacements"]} introducciones completadas con una imagen contextual de su propia especialidad. No son evidencias de parametros ni recursos tecnicos interactivos.',
    '- Tiempo docente real, cobertura y brecha permanecen sin valor hasta disponer de cronometraje; ya no se presenta cumplimiento artificial de 100%.',
    '- Calibracion de dificultad marcada como propuesta pendiente, no validacion cognitiva.',
    '- Preguntas, alternativas, claves y tablas de estudiantes conservadas frente al respaldo previo.',
    '- Borradores de encargos separados por usuario, curso y modulo; pruebas de medios y aislamiento aprobadas.',
    '- Ajustes compartidos de numeracion, texto alternativo especifico, foco de teclado y movimiento reducido.', '',
    '## Pendiente para alcanzar cumplimiento real',
    '- Restaurar o sustituir los recursos por evidencia valida para cada especialidad y comprobarla en pantalla.',
    '- Contrastar programas, OA, AE, criterios, nivel y seguridad tecnica; completar vinculos individuales solo con respaldo.',
    '- Resolver cada actividad y revisar preguntas, distractores, respuestas y rubricas con criterio disciplinar.',
    '- Validar progresion cognitiva, diversidad y transferencia por modulo; no basta con etiquetas presentes.',
    '- Cronometrar docentes, aplicar x5, contrastar con el 30% y analizar sensibilidad x3/x4/x6.',
    '- Probar recorridos completos con teclado, lector de pantalla, contraste, dispositivos y estudiantes.',
    '- Validar funcion pedagogica de medios y simulaciones; las escenas actuales no se certifican como motor 3D.', '',
    '## Recursos pendientes por curso', '',
    '| Curso | Modulos | Referencias recuperadas | Referencias pendientes de restaurar |', '| --- | ---: | ---: | ---: |']
for name,counts in courses.items():
    lines.append(f'| {name} | {counts["modules"]} | {counts["recovered_references"]} | {counts["pending_media"]} |')
lines.extend(['', 'Los numeros cuentan referencias repetidas, no archivos unicos. No se usan para otorgar aprobacion pedagogica.', '',
    '## Verificacion',
    '- 451 modulos comprobados en datos guardados y mediante el enriquecimiento utilizado por la API.',
    '- Pruebas focalizadas de integridad, recuperacion de originales y comprobaciones JavaScript; consultar resultados de ejecucion.',
    '- Revision visual por muestra del cierre y de una especialidad con recursos pendientes; no equivale a 45 cursos ejecutados completos.'])
(OUT/'informe.md').write_text('\n'.join(lines),encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='course_rows'},ensure_ascii=True))
