from pathlib import Path
import csv, io, json, math, os, secrets, sqlite3
from contextlib import contextmanager
from functools import lru_cache, wraps
from flask import Flask, request, session, jsonify, send_from_directory, Response
from werkzeug.security import generate_password_hash, check_password_hash
from content import DEFAULT_CONTENT, STATIONS, STEPS
from catalog import upgrade_catalog, EXTENDED_MODULES
from curriculum import MODULE_TITLES
from pedagogy import enrich, strip_for_student, validate_experience, hint_for, summarize_response, exam_profile, course_planning, module_plan, publication_gaps
from encargos import encargos_for
from contextualization import context_plan, save_context_step
from learning_sequence import learning_sequence, validate_sequence, sequence_feedback
from assessment_integrity import assessment_issues
from itsdangerous import URLSafeTimedSerializer, BadSignature
from practice_scenarios import scenario as practice_scenario, review as practice_review

ROOT=Path(__file__).resolve().parent

def create_app(test_config=None):
    app=Flask(__name__,static_folder='static')
    data=Path(os.environ.get('AULATP_DATA',str(ROOT/'data')));data.mkdir(parents=True,exist_ok=True)
    secret=data/'.secret'
    if not secret.exists():
        secret.write_text(secrets.token_hex(32));secret.chmod(0o600)
    app.config.update(SECRET_KEY=secret.read_text(),DATABASE=str(data/'aulatp.sqlite3'),MAX_CONTENT_LENGTH=2*1024*1024,SESSION_COOKIE_HTTPONLY=True,SESSION_COOKIE_SAMESITE='Strict')
    if test_config:app.config.update(test_config)
    @contextmanager
    def db():
        con=sqlite3.connect(app.config['DATABASE'])
        con.row_factory=sqlite3.Row
        con.execute('PRAGMA foreign_keys=ON')
        try:
            yield con
            con.commit()
        except Exception:
            con.rollback()
            raise
        finally:
            con.close()
    with db() as con:
        con.executescript('''
        CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('student','teacher')));
        CREATE TABLE IF NOT EXISTS courses(id INTEGER PRIMARY KEY,title TEXT NOT NULL,specialty TEXT NOT NULL,level TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS modules(id INTEGER PRIMARY KEY,course_id INTEGER REFERENCES courses(id),title TEXT NOT NULL,position INTEGER NOT NULL,published INTEGER DEFAULT 0,content TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS enrollments(user_id INTEGER REFERENCES users(id),course_id INTEGER REFERENCES courses(id),PRIMARY KEY(user_id,course_id));
        CREATE TABLE IF NOT EXISTS progress(user_id INTEGER REFERENCES users(id),module_id INTEGER REFERENCES modules(id),state TEXT NOT NULL,updated TEXT DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(user_id,module_id));
        CREATE TABLE IF NOT EXISTS module_feedback(module_id INTEGER PRIMARY KEY REFERENCES modules(id) ON DELETE CASCADE,teacher_id INTEGER NOT NULL REFERENCES users(id),body TEXT NOT NULL,updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
        ''')
        if not con.execute('SELECT 1 FROM users').fetchone():
            for u,n,p,r in [('estudiante','Estudiante Demo','AulaTP2026!','student'),('docente','Docente Demo','DocenteTP2026!','teacher')]:
                con.execute('INSERT INTO users(username,name,password,role) VALUES(?,?,?,?)',(u,n,generate_password_hash(p),r))
            con.execute('INSERT INTO courses VALUES(1,?,?,?)',('Refrigeración y Climatización','Refrigeración y climatización','3° medio'))
            for n in range(1, 5):
                payload = DEFAULT_CONTENT if n == 1 else EXTENDED_MODULES[n]
                con.execute('INSERT INTO modules VALUES(?,?,?,?,?,?)',(n,1,MODULE_TITLES[n],n,1,json.dumps(payload,ensure_ascii=False)))
            con.execute('INSERT INTO enrollments VALUES(1,1)')
        upgrade_catalog(con)
    def fail(message,status=400):return jsonify(error=message),status
    def body():return request.get_json(silent=True) or {}
    def user():
        with db() as con:return con.execute('SELECT id,username,name,role FROM users WHERE id=?',(session.get('uid'),)).fetchone()
    def is_demo_student(u):
        return bool(u and u['role']=='student' and u['username']=='estudiante')
    def require(role=None):
        def deco(fn):
            @wraps(fn)
            def run(*a,**kw):
                u=user()
                if not u:return fail('Inicia sesión para continuar.',401)
                if role and u['role']!=role:return fail('Esta acción requiere el rol '+('docente' if role=='teacher' else 'estudiante')+'.',403)
                return fn(*a,**kw)
            return run
        return deco
    @app.before_request
    def csrf():
        if request.path.startswith('/api/') and request.method not in ('GET','HEAD','OPTIONS'):
            if not session.get('csrf') or not secrets.compare_digest(request.headers.get('X-CSRF-Token',''),session['csrf']):return fail('La sesión cambió. Recarga la página.',403)
    @app.after_request
    def headers(response):
        response.headers['X-Content-Type-Options']='nosniff';response.headers['X-Frame-Options']='DENY'
        response.headers['Content-Security-Policy']="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        if request.path.startswith('/api/') or request.path.startswith('/static/'):
            response.headers['Cache-Control']='no-store, max-age=0'
        return response
    def empty():return {'context':'','ae':{},'cases':{},'scene':None,'exam':None,'draft':{},'reflection':'','plan':'','closed':False,'explore':{},'ae_meta':{},'trace':[],'oficio':{},'encargos':{}}
    # The catalogue contains 451 modules; retain one enriched copy per module.
    @lru_cache(maxsize=512)
    def cached_content(raw, position):
        c=json.loads(raw or '{}')
        if c.get('aes'):c=enrich(c, position)
        return json.dumps(c,ensure_ascii=False,separators=(',',':'))
    def load_content(raw, position=1):
        if isinstance(raw,str):return json.loads(cached_content(raw,position))
        c=dict(raw or {})
        if c.get('aes'):c=enrich(c, position)
        return c
    def trace(s, kind, **extra):
        s.setdefault('trace', []).append(dict(kind=kind, estado='COMPLETADO', **extra))
        if len(s['trace'])>400:s['trace']=s['trace'][-400:]
    def getstate(con,mid):
        row=con.execute('SELECT state FROM progress WHERE user_id=? AND module_id=?',(session['uid'],mid)).fetchone()
        s=json.loads(row['state']) if row else empty()
        s.setdefault('oficio',{});s.setdefault('encargos',{})
        return s
    def putstate(con,mid,state):
        con.execute('INSERT INTO progress(user_id,module_id,state) VALUES(?,?,?) ON CONFLICT(user_id,module_id) DO UPDATE SET state=excluded.state,updated=CURRENT_TIMESTAMP',(session['uid'],mid,json.dumps(state,ensure_ascii=False)))
    def completed(s, content=None):
        ae_count=len((content or {}).get('aes') or []) if isinstance(content,dict) else 3
        expected_steps=max(1,ae_count)*6
        learned=len(s['ae'])==expected_steps and all((s.get('ae_meta') or {}).get(f'{a}-5',{}).get('sequence')!=1 or professional_complete(s,a) for a in range(ae_count))
        return [bool(s['context']),learned,len(s['cases'])==15 and bool(s['scene']),bool(s['exam']),s['closed']]
    def professional_complete(s,a):
        return bool((s.get('ae_professional') or {}).get(str(a))) or any(int(item.get('station') or 0)==2 and int(item.get('ae') or 0)==a+1 for item in (s.get('encargos') or {}).values())
    def accessible(mid):
        with db() as con:
            m=con.execute('SELECT * FROM modules WHERE id=?',(mid,)).fetchone();u=user()
            if not m:return None,fail('Módulo inexistente.',404)
            if u['role']=='student':
                if not m['published']:return None,fail('El módulo está en preparación.',403)
                if not is_demo_student(u) and not con.execute('SELECT 1 FROM enrollments WHERE user_id=? AND course_id=?',(u['id'],m['course_id'])).fetchone():return None,fail('No tienes matrícula en este curso.',403)
            return dict(m),None
    def text_valid(v,n=20):return isinstance(v,str) and n<=len(v.strip())<=10000
    def published_module_feedback(con,mid):
        row=con.execute('SELECT f.body AS text,f.updated AS updated_at,f.teacher_id,u.name AS teacher_name FROM module_feedback f JOIN users u ON u.id=f.teacher_id WHERE f.module_id=?',(mid,)).fetchone()
        if not row:return None
        result=dict(row)
        result['updated_at']=result['updated_at'].replace(' ','T')+'Z'
        return result
    @app.get('/')
    @app.get('/portal/cursos')
    @app.get('/portal/cursos/')
    def index():
        r=send_from_directory(app.static_folder,'index.html')
        r.headers['Cache-Control']='no-store'
        return r
    @app.get('/api/session')
    def me():
        # El campus público abre directamente el perfil de demostración. Las
        # cuentas institucionales siguen pudiendo reemplazar esta sesión.
        if not session.get('uid'):
            with db() as con:
                demo=con.execute("SELECT id FROM users WHERE username='estudiante' AND role='student'").fetchone()
            if demo:session['uid']=demo['id']
        session.setdefault('csrf',secrets.token_hex(24));u=user()
        return jsonify(user=dict(u) if u else None,csrf=session['csrf'])
    @app.post('/api/login')
    def login():
        b=body()
        username=str(b.get('username') or '').strip()
        password=str(b.get('password') or '').strip()
        with db() as con:u=con.execute('SELECT * FROM users WHERE username=?',(username,)).fetchone()
        if not u or not check_password_hash(u['password'],password):return fail('Usuario o contraseña incorrectos.',401)
        session.clear();session['uid']=u['id'];session['csrf']=secrets.token_hex(24)
        return me()
    @app.post('/api/logout')
    def logout():session.clear();return jsonify(ok=True)
    @app.get('/api/courses')
    @require()
    def courses():
        compact=request.args.get('compact')=='1'
        with db() as con:
            u=user();rows=con.execute('SELECT * FROM courses ORDER BY id').fetchall() if u['role']=='teacher' or is_demo_student(u) else con.execute('SELECT c.* FROM courses c JOIN enrollments e ON e.course_id=c.id WHERE e.user_id=? ORDER BY c.id',(u['id'],)).fetchall()
            course_ids=[c['id'] for c in rows]
            modules_by_course={cid:[] for cid in course_ids}
            if course_ids:
                marks=','.join('?' for _ in course_ids)
                module_rows=con.execute(f'''SELECT id,course_id,title,position,published,
                    json_extract(content,'$.specialty_source.official_hp') AS official_hp,
                    json_extract(content,'$.specialty_source.scope') AS source_scope,
                    json_extract(content,'$.specialty_source.pdf') AS source_pdf,
                    json_extract(content,'$.specialty_source.year') AS official_year,
                    json_extract(content,'$.encargos.count') AS encargos_count,
                    json_extract(content,'$.encargos.hours') AS encargos_hours,
                    json_array_length(json_extract(content,'$.aes')) AS ae_count
                    FROM modules WHERE course_id IN ({marks}) ORDER BY course_id,position,id''',course_ids).fetchall()
                states={r['module_id']:json.loads(r['state']) for r in con.execute('SELECT module_id,state FROM progress WHERE user_id=?',(u['id'],)).fetchall()}
                for m in module_rows:modules_by_course[m['course_id']].append(m)
            result=[]
            for c in rows:
                item=dict(c);item['modules']=[]
                for m in modules_by_course.get(c['id'],[]):
                    mod=dict(m);mod.pop('course_id',None);s=states.get(m['id']) or empty();s.setdefault('oficio',{});s.setdefault('encargos',{});ae_count=int(mod.pop('ae_count') or 3);expected_steps=max(1,ae_count)*6;mod['completed']=[bool(s['context']),len(s['ae'])==expected_steps,len(s['cases'])==15 and bool(s['scene']),bool(s['exam']),s['closed']];mod['percent']=round(sum(mod['completed'])*20)
                    exam=s.get('exam')
                    selection_max=(exam or {}).get('max_score') or {1:5,2:5,3:7,4:8}.get(m['position'],5)
                    mod['evaluation_scores']={
                        'selection':round(exam.get('score',0)/selection_max*25,1) if exam else None,
                        'development':(exam.get('review') or {}).get('score') if exam else None,
                        'max_each':25,
                    }
                    official_hp=mod.get('official_hp')
                    if official_hp:
                        item.setdefault('scope',mod.pop('source_scope',None))
                        item.setdefault('pdf',mod.pop('source_pdf',None))
                    else:
                        mod.pop('source_scope',None);mod.pop('source_pdf',None)
                    plan=None if official_hp else module_plan(m['position'])
                    if plan:mod.update(plan)
                    if official_hp:
                        count=mod.pop('encargos_count',None);hours=mod.pop('encargos_hours',None)
                        if count:mod['encargos_count']=count;mod['encargos_hours']=hours
                    else:
                        mod.pop('encargos_count',None);mod.pop('encargos_hours',None);pack=encargos_for(m['position'])
                        if pack.get('count'):mod['encargos_count']=pack['count'];mod['encargos_hours']=pack['hours']
                    item['modules'].append(mod)
                if compact:
                    keep={'id','title','position','published','completed','percent','evaluation_scores','official_hp','encargos_count','encargos_hours'}
                    item['modules']=[{k:v for k,v in mod.items() if k in keep} for mod in item['modules']]
                    result.append(item)
                    continue
                plan=course_planning(item)
                if plan:
                    item['planning']=plan
                    planned={p['position']:p for p in plan['modules']}
                    for mod in item['modules']:
                        if mod['position'] in planned:mod.update(planned[mod['position']])
                result.append(item)
        return jsonify(result)
    @app.get('/api/modules/<int:mid>')
    @require()
    def module(mid):
        m,err=accessible(mid)
        if err:return err
        c=load_content(m.pop('content'), m['position']);u=user()
        active_plan=None
        with db() as con:
            s=getstate(con,mid)
            m['module_feedback']=published_module_feedback(con,mid)
            course=dict(con.execute('SELECT * FROM courses WHERE id=?',(m['course_id'],)).fetchone())
            course['modules']=[]
            for row in con.execute('SELECT title,position,content FROM modules WHERE course_id=? ORDER BY position,id',(m['course_id'],)):
                raw=json.loads(row['content'] or '{}');source=raw.get('specialty_source') or {}
                base=module_plan(row['position']) or {}
                course['modules'].append({'title':row['title'],'position':row['position'],'official_hp':source.get('official_hp') or base.get('official_hp')})
                if source:
                    course.setdefault('scope',source.get('scope'));course.setdefault('pdf',source.get('pdf'))
            whole_plan=course_planning(course)
            if whole_plan:
                active_plan=next((p for p in whole_plan['modules'] if p['position']==m['position']),None)
                if active_plan:c['planning']=active_plan
        c['contextualization']=context_plan(c,course,m['title'])
        for item in c.get('aes') or []:item['learning_sequence']=learning_sequence(item)
        if u['role']=='student':c=strip_for_student(c)
        m.update(content=c,state=s,completed=completed(s,c),stations=STATIONS,steps=STEPS,planning=active_plan or c.get('planning') or module_plan(m['position']))
        return jsonify(m)
    @app.get('/api/modules/<int:mid>/practice/scenario')
    @require()
    def get_practice_scenario(mid):
        m,err=accessible(mid)
        if err:return err
        try:
            display,claim=practice_scenario(load_content(m['content'],m['position']),request.args.get('mode'),
                request.args.get('level',type=int),request.args.get('number',type=int),request.args.get('previous'))
        except ValueError as error:return fail(str(error))
        claim.update(module_id=mid,user_id=session['uid'])
        display['token']=URLSafeTimedSerializer(app.secret_key,salt='ungraded-practice-v1').dumps(claim)
        return jsonify(display)
    @app.post('/api/modules/<int:mid>/practice/review')
    @require()
    def review_practice_scenario(mid):
        m,err=accessible(mid)
        if err:return err
        b=body()
        if not isinstance(b,dict) or not isinstance(b.get('token'),str):return fail('Abre una situación de práctica válida.')
        try:
            claim=URLSafeTimedSerializer(app.secret_key,salt='ungraded-practice-v1').loads(b['token'],max_age=7*24*3600)
            if claim.get('module_id')!=mid or claim.get('user_id')!=session['uid']:return fail('Esta situación no pertenece a tu sesión.',403)
            result=practice_review(load_content(m['content'],m['position']),claim,b)
        except BadSignature:return fail('La situación caducó. Conserva tu borrador y abre una nueva situación.',400)
        except ValueError as error:return fail(str(error))
        return jsonify(result)
    @app.get('/api/modules/<int:mid>/feedback')
    @require()
    def module_feedback(mid):
        m,err=accessible(mid)
        if err:return err
        with db() as con:
            feedback=published_module_feedback(con,mid)
            # Individual review is private; the shared module comment never replaces it.
            review=(getstate(con,mid).get('exam') or {}).get('review') if user()['role']=='student' else None
        return jsonify(module_id=mid,feedback=feedback,individual_feedback=(review or {}).get('feedback'))
    @app.put('/api/teacher/modules/<int:mid>/feedback')
    @require('teacher')
    def publish_module_feedback(mid):
        b=body()
        if not isinstance(b,dict) or not text_valid(b.get('text')):return fail('Escribe una retroalimentación de entre 20 y 10.000 caracteres.')
        m,err=accessible(mid)
        if err:return err
        with db() as con:
            con.execute('INSERT INTO module_feedback(module_id,teacher_id,body) VALUES(?,?,?) ON CONFLICT(module_id) DO UPDATE SET teacher_id=excluded.teacher_id,body=excluded.body,updated=CURRENT_TIMESTAMP',(mid,session['uid'],b['text'].strip()))
            feedback=published_module_feedback(con,mid)
        return jsonify(module_id=mid,feedback=feedback)
    @app.get('/api/progress')
    @require('student')
    def student_progress():
        requested_course=request.args.get('course_id',type=int)
        with db() as con:
            query='''SELECT c.id AS course_id,c.title AS course_title,c.specialty,c.level,
                m.id,m.title,m.position,m.published,m.content,p.state,p.updated
                FROM enrollments e JOIN courses c ON c.id=e.course_id
                JOIN modules m ON m.course_id=c.id
                LEFT JOIN progress p ON p.module_id=m.id AND p.user_id=e.user_id
                WHERE e.user_id=? AND m.published=1'''
            params=[session['uid']]
            if requested_course is not None:
                query+=' AND c.id=?'
                params.append(requested_course)
            query+=' ORDER BY c.id,m.position,m.id'
            rows=con.execute(query,params).fetchall()
            result=[]
            for row in rows:
                # Progress needs curricular labels and saved state, not the fully
                # enriched simulator payload. Avoid rebuilding hundreds of modules
                # before the report can be displayed.
                c=json.loads(row['content'] or '{}')
                s=json.loads(row['state']) if row['state'] else empty()
                result.append(dict(course_id=row['course_id'],course_title=row['course_title'],specialty=row['specialty'],
                    level=row['level'],id=row['id'],title=row['title'],position=row['position'],
                    aes=[{'label':a.get('title') or a.get('name') or f'AE {i+1}','description':a.get('description') or ''} for i,a in enumerate(c.get('aes') or [])],
                    oa=(c.get('specialty_source') or {}).get('oa') or [],
                    question_count=min(len(c.get('questions') or []),int((c.get('evaluation_plan') or {}).get('question_count') or 25)),
                    state=s,completed=completed(s,c),updated=row['updated']))
        return jsonify(result)
    @app.post('/api/modules/<int:mid>/activity')
    @require('student')
    def activity(mid):
        m,err=accessible(mid)
        if err:return err
        b=body();kind=b.get('kind');c=load_content(m['content'], m['position'])
        with db() as con:
            s=getstate(con,mid)
            if s['closed']:return fail('El módulo ya está cerrado. Tus evidencias están conservadas.')
            if kind=='context-step':
                try:save_context_step(s,b.get('index'),b.get('response'))
                except ValueError as error:return fail(str(error))
                trace(s,'context-step',index=b['index'])
            elif kind=='context':
                if not text_valid(b.get('text')):return fail('Escribe una reflexión de al menos 20 caracteres.')
                s['context']=b['text'].strip()
                observed=b.get('observed')
                if isinstance(observed,list):
                    s['explore']={'observed':[x for x in observed if isinstance(x,str)][:16]}
                trace(s,'context')
            elif kind in ('ae','ae-check'):
                if not s['context']:return fail('Completa primero la contextualización.',403)
                a=b.get('ae');step=b.get('step')
                ae_count=len(c.get('aes') or [])
                if type(a)!=int or type(step)!=int or a not in range(ae_count) or step not in range(6):return fail('Etapa inválida.')
                index=a*6+step;key=f'{a}-{step}'
                if b.get('sequence')!=1 and index and f'{(index-1)//6}-{(index-1)%6}' not in s['ae']:return fail('Completa la etapa anterior.',403)
                exp=None
                if a<len(c.get('aes',[])):
                    exps=c['aes'][a].get('experiences') or []
                    if step<len(exps):exp=exps[step]
                response=b.get('response') if isinstance(b.get('response'),dict) else None
                meta=s.setdefault('ae_meta',{}).get(key) or {'attempts':0}
                sequence=b.get('sequence')==1
                if kind=='ae-check' and not sequence:return fail('Recorrido de aprendizaje inv\u00e1lido.')
                if sequence:
                    exp=learning_sequence(c['aes'][a])[step]
                    ok,message=validate_sequence(exp,response,b.get('text'))
                    feedback=sequence_feedback(exp,ok,message)
                    if not ok:
                        meta['attempts']=int(meta.get('attempts') or 0)+1
                        s['ae_meta'][key]=meta
                        putstate(con,mid,s)
                    if kind=='ae-check':return jsonify(ready=ok,feedback=feedback)
                    if not ok:return fail(message)
                elif exp and exp.get('type') not in (None,'reflect') and response:
                    ok,_=validate_experience(exp,response)
                    if not ok:
                        meta['attempts']=int(meta.get('attempts') or 0)+1
                        s['ae_meta'][key]=meta
                        putstate(con,mid,s)
                        return fail(hint_for(exp, meta['attempts']-1))
                text=b.get('text')
                if not text_valid(text):
                    if exp and response:text=summarize_response(exp,response)
                if not text_valid(text):return fail('Fundamenta tu respuesta con al menos 20 caracteres.')
                s['ae'][key]=text.strip()
                s.setdefault('ae_meta',{})[key]={'attempts':int(meta.get('attempts') or 0),'type':(exp or {}).get('type'),'skill':(exp or {}).get('skill')}
                if sequence:s['ae_meta'][key].update(response=response,feedback=feedback,sequence=1)
                trace(s,'ae',ae=a,step=step,tipo=(exp or {}).get('type'))
            elif kind=='ae-professional':
                a=b.get('ae')
                if type(a)!=int or a not in range(len(c.get('aes') or [])):return fail('Aprendizaje inv\u00e1lido.')
                if not all(f'{a}-{i}' in s['ae'] for i in range(6)):return fail('Completa las seis etapas antes del desaf\u00edo profesional.',403)
                if not text_valid(b.get('text'),80) or b.get('verified') is not True:return fail('Escribe tu evidencia con al menos 80 caracteres y verifica tu respuesta.')
                s.setdefault('ae_professional',{})[str(a)]={'text':b['text'].strip(),'verified':True}
                trace(s,'ae-professional',ae=a)
            elif kind=='case':
                expected_steps=len(c.get('aes') or [])*6
                if len(s['ae'])!=expected_steps:return fail('Completa todos los aprendizajes esperados del módulo.',403)
                if any((s.get('ae_meta') or {}).get(f'{a}-5',{}).get('sequence')==1 and not professional_complete(s,a) for a in range(len(c.get('aes') or []))):return fail('Completa los desaf\u00edos profesionales antes de la situaci\u00f3n integradora.',403)
                idx=b.get('index');choice=b.get('choice')
                if type(idx)!=int or idx not in range(min(15,len(c.get('cases') or []))) or type(choice)!=int or not text_valid(b.get('text')):return fail('Selecciona una decisión y justifícala con al menos 20 caracteres.')
                q=c['cases'][idx]
                if choice not in range(len(q.get('options') or [])):return fail('Selecciona una alternativa disponible para esta situación.')
                if idx and str(idx-1) not in s['cases']:return fail('Resuelve la situación anterior.',403)
                if choice!=q['answer']:return fail('Revisa tu decisión: identifica qué documento falta y cómo comprobarías la información antes de continuar.')
                s['cases'][str(idx)]={'choice':choice,'text':b['text'].strip()}
            elif kind=='scene':
                if len(s['cases'])!=15:return fail('Completa las 15 situaciones antes del recorrido espacial interactivo.',403)
                expected=[p['id'] for p in c['scene']['parts']] if c.get('scene') else ['control','exterior','interior']
                observed=b.get('inspected',[])
                if not isinstance(observed,list) or not all(isinstance(x,str) for x in observed) or sorted(observed)!=sorted(expected) or not text_valid(b.get('text')):return fail('Inspecciona todos los puntos del recorrido espacial de este módulo y escribe tu conclusión.')
                s['scene']={'inspected':b['inspected'],'text':b['text'].strip()}
            elif kind in ('draft','exam'):
                if not completed(s,c)[2]:return fail('Completa la estación integradora.',403)
                if s['exam']:return fail('La evaluación ya fue entregada y no puede modificarse.')
                answers=b.get('answers',{});dev=b.get('development','')
                evaluation=c.get('evaluation_plan') or {}
                question_count=max(1,min(len(c.get('questions') or []),int(evaluation.get('question_count') or 25)))
                development_required=bool(evaluation.get('development_required',True))
                exam_questions=(c.get('questions') or [])[:question_count]
                if not isinstance(answers,dict) or not isinstance(dev,str) or len(dev)>10000:return fail('Formato de evaluación inválido.')
                if any(k not in {str(i) for i in range(question_count)} or not str(k).isdigit() or type(v)!=int or v not in range(len(exam_questions[int(k)]['options'])) for k,v in answers.items()):return fail('Respuesta fuera de rango.')
                if kind=='draft':s['draft']={'answers':answers,'development':dev}
                else:
                    if len(answers)!=question_count or (development_required and not text_valid(dev,80)):
                        requirement=f' y escribe un desarrollo de al menos 80 caracteres' if development_required else ''
                        return fail(f'Responde los {question_count} ítems{requirement}.')
                    score=sum(answers[str(i)]==q['answer'] for i,q in enumerate(exam_questions))
                    s['exam']={'answers':answers,'development':dev.strip() if development_required else '',
                        'development_required':development_required,'score':score,'max_score':question_count,
                        'review':None,'profile':exam_profile(exam_questions,answers),
                        'corrections':[{'question':q['question'],'correct':answers[str(i)]==q['answer'],'explanation':q['explanation'],'option_feedback':(q.get('option_feedback') or [q['explanation']]*len(q.get('options') or []))[answers[str(i)]],'ae':q.get('ae'),'skill':q.get('skill'),'difficulty':q.get('difficulty'),'image':q.get('image'),'caption':q.get('caption'),'alt':q.get('alt')} for i,q in enumerate(exam_questions)]};s['draft']={}
                    trace(s,'exam',puntaje=score)
            elif kind=='oficio':
                item_id=str(b.get('id') or '')[:40]
                text=b.get('text')
                if not item_id or not text_valid(text):return fail('Registra un paso y un dato de al menos 20 caracteres.')
                try:station=int(b.get('station') or 0)
                except (TypeError,ValueError):station=0
                if station not in (1,3):
                    station=3 if len(s.get('ae') or {})==len(c.get('aes') or [])*6 else 1
                graded=station==3
                s.setdefault('oficio',{})[item_id]={'kind':str(b.get('activity_kind') or '')[:40],'paso':str(b.get('paso') or '')[:40],'text':text.strip(),'graded':graded,'station':station}
                trace(s,'oficio',id=item_id,graded=graded,station=station)
            elif kind=='encargo':
                item_id=str(b.get('id') or '')[:40]
                text=b.get('text')
                if not item_id or not text_valid(text,80):return fail('Entrega el producto del encargo (mínimo 80 caracteres).')
                item=next((x for x in (c.get('encargos') or {}).get('items') or [] if x.get('id')==item_id),None)
                if not item:return fail('Encargo inexistente.')
                try:station=int(item.get('station') or 0)
                except (TypeError,ValueError):station=0
                if station==2:
                    if not s.get('context'):return fail('Completa primero la contextualización.',403)
                elif station==3:
                    if len(s.get('ae') or {})!=len(c.get('aes') or [])*6:return fail('Completa todos los aprendizajes esperados del módulo.',403)
                else:return fail('Este encargo no corresponde a esta estación.')
                s.setdefault('encargos',{})[item_id]={'text':text.strip(),'station':station,'ae':item.get('ae'),'minutes':item.get('minutes'),'title':str(item.get('title') or '')[:160]}
                trace(s,'encargo',id=item_id,station=station)
            elif kind=='close':
                if not s['exam']:return fail('Entrega primero la evaluación.',403)
                if not text_valid(b.get('reflection')) or not text_valid(b.get('plan')):return fail('Completa la reflexión y el plan de mejora con al menos 20 caracteres cada uno.')
                s['reflection']=b['reflection'].strip();s['plan']=b['plan'].strip();s['closed']=True
            else:return fail('Actividad desconocida.')
            putstate(con,mid,s)
        return jsonify(state=s,completed=completed(s,c))
    @app.get('/api/teacher')
    @require('teacher')
    def teacher():
        with db() as con:
            users=[dict(r) for r in con.execute("SELECT id,username,name FROM users WHERE role='student'")]
            records=[]
            for r in con.execute('SELECT p.*,u.name,m.title,m.content AS module_content FROM progress p JOIN users u ON u.id=p.user_id JOIN modules m ON m.id=p.module_id'):
                x=dict(r);module_content=json.loads(x.pop('module_content'));x['rubric']=module_content.get('rubric',DEFAULT_CONTENT['rubric']);x['state']=json.loads(x['state']);x['percent']=sum(completed(x['state'],module_content))*20;records.append(x)
            enrollments=[dict(r) for r in con.execute('SELECT * FROM enrollments')]
        return jsonify(users=users,records=records,enrollments=enrollments)
    @app.post('/api/teacher/users')
    @require('teacher')
    def adduser():
        b=body();username=b.get('username','');name=b.get('name','');password=b.get('password','')
        if not isinstance(username,str) or not username.isalnum() or len(username)>40 or not text_valid(name,2) or not isinstance(password,str) or not 10<=len(password)<=128:return fail('Usuario alfanumérico, nombre y contraseña de 10 a 128 caracteres requeridos.')
        with db() as con:
            if con.execute('SELECT 1 FROM users WHERE username=?',(username,)).fetchone():return fail('Ese usuario ya existe.')
            cur=con.execute("INSERT INTO users(username,name,password,role) VALUES(?,?,?,'student')",(username,name,generate_password_hash(password)))
            return jsonify(id=cur.lastrowid)
    @app.post('/api/teacher/enroll')
    @require('teacher')
    def enroll():
        b=body()
        with db() as con:
            if not con.execute("SELECT 1 FROM users WHERE id=? AND role='student'",(b.get('user_id'),)).fetchone() or not con.execute('SELECT 1 FROM courses WHERE id=?',(b.get('course_id'),)).fetchone():return fail('Estudiante o curso inexistente.')
            con.execute('INSERT OR IGNORE INTO enrollments VALUES(?,?)',(b['user_id'],b['course_id']))
        return jsonify(ok=True)
    @app.post('/api/teacher/courses')
    @require('teacher')
    def addcourse():
        b=body()
        if not all(text_valid(b.get(k),2) for k in ('title','specialty','level')):return fail('Completa los datos del curso.')
        with db() as con:
            cur=con.execute('INSERT INTO courses(title,specialty,level) VALUES(?,?,?)',(b['title'],b['specialty'],b['level']))
            return jsonify(id=cur.lastrowid)
    @app.post('/api/teacher/modules')
    @require('teacher')
    def addmodule():
        b=body()
        if not text_valid(b.get('title'),3):return fail('Escribe un título para el módulo.')
        with db() as con:
            if not con.execute('SELECT 1 FROM courses WHERE id=?',(b.get('course_id'),)).fetchone():return fail('Curso inexistente.')
            pos=con.execute('SELECT COALESCE(MAX(position),0)+1 FROM modules WHERE course_id=?',(b['course_id'],)).fetchone()[0]
            cur=con.execute('INSERT INTO modules(course_id,title,position,content) VALUES(?,?,?,?)',(b['course_id'],b['title'],pos,'{}'))
            return jsonify(id=cur.lastrowid)
    def valid_enrichment(c):
        for key in ('case_title','application','reflection_prompt'):
            if key in c and not text_valid(c[key],3):return False
        for a in (c.get('aes',[]) if isinstance(c.get('aes',[]),list) else []):
            if not isinstance(a,dict):return False
            if 'lesson' in a and (not isinstance(a['lesson'],list) or not 1<=len(a['lesson'])<=8 or not all(text_valid(p,3) for p in a['lesson'])):return False
            if 'example' in a and not text_valid(a['example'],3):return False
        if 'scene' in c:
            scene=c['scene']
            if not isinstance(scene,dict) or not text_valid(scene.get('title'),3) or not text_valid(scene.get('prompt'),20):return False
            parts=scene.get('parts')
            if not isinstance(parts,list) or len(parts)<3:return False
            if any(not isinstance(p,dict) or not all(text_valid(p.get(k),1) for k in ('id','label','value','detail')) for p in parts):return False
            if len({p['id'] for p in parts})!=len(parts):return False
        if 'practice' in c:
            p=c['practice']
            if not isinstance(p,dict) or p.get('type') not in ('measurement','network','equipment','scale') or not text_valid(p.get('title'),3):return False
            if p['type']=='scale':
                pass
            if p['type'] in ('measurement','network'):
                minimum=0 if p['type']=='network' else -1000
                if not isinstance(p.get('values'),list) or len(p['values'])!=3 or any(type(v) not in (int,float) or not math.isfinite(v) or not minimum<=v<=1000 for v in p['values']):return False
            if p['type']=='measurement' and (not isinstance(p.get('reference'),list) or len(p['reference'])!=2 or any(type(v) not in (int,float) or not math.isfinite(v) or not -1000<=v<=1000 for v in p['reference']) or p['reference'][0]>p['reference'][1]):return False
            if p['type']=='network' and (type(p.get('reserve')) not in (int,float) or not math.isfinite(p['reserve']) or not 0<=p['reserve']<=100):return False
            if p['type']=='equipment' and any(type(p.get(k)) not in (int,float) or not math.isfinite(p[k]) or not 0<=p[k]<=1000 for k in ('available','required')):return False
        if 'rubric' in c:
            r=c['rubric']
            if not isinstance(r,list) or len(r)!=5 or any(not isinstance(p,dict) or not text_valid(p.get('name'),3) or p.get('max')!=5 for p in r):return False
        return True
    def valid_content(c):
        if not isinstance(c,dict) or not text_valid(c.get('context')) or not text_valid(c.get('development'),80):return False
        if not valid_enrichment(c):return False
        aes=c.get('aes',[]);cases=c.get('cases',[]);qs=c.get('questions',[])
        if not isinstance(aes,list) or not 1<=len(aes)<=8 or not isinstance(cases,list) or len(cases)!=15 or not isinstance(qs,list) or len(qs)!=25:return False
        for ae in aes:
            if not isinstance(ae,dict) or not text_valid(ae.get('title'),3) or not text_valid(ae.get('description'),3) or not isinstance(ae.get('steps'),list) or len(ae['steps'])!=6 or not all(text_valid(x,3) for x in ae['steps']):return False
        for q in cases+qs:
            if not isinstance(q,dict) or not isinstance(q.get('options'),list) or len(q.get('options') or [])!=4 or not all(text_valid(x,1) for x in q['options']) or type(q.get('answer'))!=int or q['answer'] not in range(4):return False
            unavailable=q.get('unavailable_media') or {}
            if not isinstance(unavailable,dict):return False
            missing_image=unavailable.get('image') or {}
            if not isinstance(missing_image,dict):return False
            optional_context=missing_image.get('role')=='context' and not q.get('requires_image')
            if not text_valid(str(q.get('image') or ''),3) and not optional_context:return False
        return all(text_valid(q.get('title'),3) and text_valid(q.get('context'),3) for q in cases) and all(text_valid(q.get('question'),3) and text_valid(q.get('explanation'),3) for q in qs)
    @app.put('/api/teacher/modules/<int:mid>')
    @require('teacher')
    def editmodule(mid):
        b=body();c=b.get('content');published=bool(b.get('published'))
        if not text_valid(b.get('title'),3) or not isinstance(c,dict):return fail('Título y contenido JSON requeridos.')
        if (published or c) and not valid_content(c):return fail('El contenido requiere contexto, entre 1 y 8 AE con 6 etapas cada uno, 15 casos A–D con foto real, 25 preguntas A–D con foto y desarrollo. Revisa los campos y respuestas.')
        with db() as con:
            existing=con.execute('SELECT content,position FROM modules WHERE id=?',(mid,)).fetchone()
            if not existing:return fail('Módulo inexistente.',404)
            if published:
                issues=assessment_issues(c)
                if issues:
                    return fail('Revisa las alternativas, la clave, el fundamento y el aprendizaje asociado de '+issues[0]['location']+'. No publiques el módulo con datos inválidos.')
                enrich(c, existing['position'] or 1)
                gaps=publication_gaps(c)
                if gaps:return fail(gaps[0]+' No publiques el módulo con ese hueco.')
            if con.execute('SELECT 1 FROM progress WHERE module_id=?',(mid,)).fetchone() and json.loads(existing['content'])!=c:return fail('Este módulo tiene evidencias. Crea otro módulo para una nueva versión del contenido.')
            con.execute('UPDATE modules SET title=?,content=?,published=? WHERE id=?',(b['title'],json.dumps(c,ensure_ascii=False),int(published),mid))
        return jsonify(ok=True)
    @app.get('/api/teacher/template')
    @require('teacher')
    def template():return jsonify(DEFAULT_CONTENT)
    @app.post('/api/teacher/review')
    @require('teacher')
    def review():
        b=body();points=b.get('points',[])
        if not isinstance(points,list) or len(points)!=5 or any(type(p)!=int or p not in range(6) for p in points) or not text_valid(b.get('feedback')):return fail('Asigna de 0 a 5 puntos a cada criterio y escribe retroalimentación.')
        with db() as con:
            row=con.execute('SELECT state FROM progress WHERE user_id=? AND module_id=?',(b.get('user_id'),b.get('module_id'))).fetchone()
            if not row:return fail('Entrega inexistente.',404)
            s=json.loads(row['state'])
            if not s['exam']:return fail('La evaluación no ha sido entregada.')
            s['exam']['review']={'points':points,'score':sum(points),'feedback':b['feedback'].strip(),'teacher_id':session['uid']}
            con.execute('UPDATE progress SET state=?,updated=CURRENT_TIMESTAMP WHERE user_id=? AND module_id=?',(json.dumps(s,ensure_ascii=False),b['user_id'],b['module_id']))
        return jsonify(ok=True)
    @app.get('/api/teacher/export.csv')
    @require('teacher')
    def export():
        stream=io.StringIO();w=csv.writer(stream);w.writerow(['Estudiante','Módulo','Avance %','Selección /25','Desarrollo /25','Total /50','Estado revisión'])
        with db() as con:
            for r in con.execute('SELECT u.name,m.title,m.content,p.state FROM progress p JOIN users u ON u.id=p.user_id JOIN modules m ON m.id=p.module_id'):
                s=json.loads(r['state']);content=json.loads(r['content']);ex=s['exam'];rev=ex and ex['review']
                safe=lambda v:"'"+v if v.startswith(('=','+','-','@','\t','\r')) else v
                w.writerow([safe(r['name']),safe(r['title']),sum(completed(s,content))*20,ex['score'] if ex else '',rev['score'] if rev else '',ex['score']+rev['score'] if rev else '', 'Revisado' if rev else 'Pendiente'])
        return Response('\ufeff'+stream.getvalue(),mimetype='text/csv',headers={'Content-Disposition':'attachment; filename=avance-aula-tp.csv'})
    @app.errorhandler(413)
    def too_big(e):return fail('El contenido excede el límite de 2 MB.',413)
    return app

if __name__=='__main__':
    create_app().run(host=os.environ.get('HOST','0.0.0.0'),port=int(os.environ.get('PORT','8000')),debug=False)
