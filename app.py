from pathlib import Path
import csv, io, json, math, os, random, secrets, sqlite3, unicodedata
from datetime import datetime, timezone
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
from practice_pedagogy import profile as practice_profile
from course_catalog import ensure_course_catalog
from city_room_setup import room_setup
from city_progression import evaluate_city, apply_review, sync_awards, start_recovery, migrate_awards, recovery_question, PHASE_MINUTES, quiz_learning_status, quiz_teacher_result, answer_feedback, phase_approved

ROOT=Path(__file__).resolve().parent

CITY_DISTRICTS=('Administración','Agropecuaria y Forestal','Alimentación','Construcción','Electricidad y sistemas','Metalmecánica','Minería y procesos','Salud y atención','Marítimo','Turismo','Madera y vestuario','Tecnologías digitales')

def city_district_for_course(title):
    value=''.join(char for char in unicodedata.normalize('NFD',str(title or '').casefold()) if unicodedata.category(char)!='Mn')
    if 'instalaciones sanitarias' in value:return 'Construcción'
    if 'construcciones metalicas' in value:return 'Metalmecánica'
    if any(term in value for term in ('construccion','dibujo tecnico')):return 'Construcción'
    if any(term in value for term in ('agropecuaria','forestal')):return 'Agropecuaria y Forestal'
    if any(term in value for term in ('gastronomia','alimentos')):return 'Alimentación'
    if any(term in value for term in ('enfermeria','parvulos')):return 'Salud y atención'
    if any(term in value for term in ('acuicultura','portuarias','pesqueria','naves')):return 'Marítimo'
    if any(term in value for term in ('hoteleria','turismo')):return 'Turismo'
    if any(term in value for term in ('vestuario','madera')):return 'Madera y vestuario'
    if any(term in value for term in ('administracion','contabilidad')):return 'Administración'
    if any(term in value for term in ('geologia','minera','metalurgia','quimica industrial')):return 'Minería y procesos'
    if any(term in value for term in ('programacion','conectividad','grafica')):return 'Tecnologías digitales'
    if any(term in value for term in ('electricidad','electronica','telecomunicaciones')):return 'Electricidad y sistemas'
    return 'Metalmecánica'

def city_locations_for_courses(course_rows):
    counts={}
    locations={}
    for course in course_rows:
        course_id=int(course['id'])
        title=course['title']
        district=city_district_for_course(title)
        floor=counts.get(district,0)+1
        counts[district]=floor
        locations[course_id]={'district':district,'building':f'Pabellón {district}',
                              'floor':'Planta baja' if floor==1 else f'Piso {floor}',
                              'space':f'Taller {title}'}
    return locations

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
        ensure_course_catalog(con)
    def fail(message,status=400):return jsonify(error=message),status
    def body():return request.get_json(silent=True) or {}
    def has_four_options(question):
        options=question.get('options')
        return (isinstance(options,list) and len(options)==4 and
                all(isinstance(option,str) and option.strip() for option in options) and
                len({option.strip() for option in options})==4)
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
        if request.path.startswith('/api/'):
            response.headers['Cache-Control']='no-store, max-age=0'
        elif request.path.startswith('/static/') and response.status_code in (200,304) and response.mimetype!='text/html':
            response.headers['Cache-Control']='public, max-age=31536000, immutable' if request.args.get('v') else 'public, max-age=0, must-revalidate'
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
            m=con.execute('SELECT m.*,c.title AS course_title,c.level AS course_level FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.id=?',(mid,)).fetchone();u=user()
            if not m:return None,fail('Módulo inexistente.',404)
            if u['role']=='student':
                if not m['published']:return None,fail('El módulo está en preparación.',403)
                if not is_demo_student(u) and not con.execute('SELECT 1 FROM enrollments WHERE user_id=? AND course_id=?',(u['id'],m['course_id'])).fetchone():return None,fail('No tienes matrícula en este curso.',403)
            return dict(m),None
    def city_experience_content(content, mid, uid, attempt_id=1, question_order=None):
        questions=[question for question in content.get('questions') or [] if has_four_options(question)]
        rng=random.Random(f'city-45-v1:{uid}:{mid}')
        difficulty_aliases={'Fácil':'Inicial','Facil':'Inicial','Media':'Intermedia','Difícil':'Avanzada','Dificil':'Avanzada'}
        cognitive_aliases={'modelar':'Modelar','resolver':'Modelar','aplicar':'Modelar','relacionar':'Modelar',
                           'argumentar':'Argumentar','verificar':'Argumentar','justificar':'Argumentar','fundamentar':'Argumentar',
                           'representar':'Representar','interpretar':'Representar','leer planos':'Representar'}
        def normalized_text(value):
            decomposed=unicodedata.normalize('NFKD',str(value or '').casefold())
            return ''.join(char for char in decomposed if not unicodedata.combining(char))
        def cognitive_skill(question):
            source=normalized_text(question.get('skill')).strip()
            for alias,category in cognitive_aliases.items():
                if source==alias or source.startswith(alias+' ') or source.startswith(alias+'-'):
                    return category
            evidence=normalized_text(' '.join(str(question.get(key) or '') for key in ('question','stimulus','criterion','explanation','caption')))
            cues={
                'Representar':('plano','esquema','grafico','diagrama','croquis','simbologia','representacion','interpretar','lectura de','tabla','modelo visual'),
                'Argumentar':('justific','fundament','evidencia','verific','criterio','decidir','decision','riesgo','alternativa','validar','inconsistencia','por que'),
                'Modelar':('model','calcular','estimar','resolver','aplicar','dimension','proponer','disenar','planificar','procedimiento','preparar','montar','ejecutar','construir')}
            ranked=sorted(((sum(evidence.count(cue) for cue in terms),category) for category,terms in cues.items()),reverse=True)
            if ranked[0][0]:return ranked[0][1]
            for prefix,category in (('analiz','Argumentar'),('comprend','Representar'),('identific','Representar'),('describ','Argumentar'),('seleccion','Argumentar'),('calific','Modelar')):
                if source.startswith(prefix):return category
            return 'Modelar'
        def normalized_difficulty(question):
            level=question.get('difficulty')
            return difficulty_aliases.get(level,level)
        target_quizzes=(
            {'skill':'Resolver problemas','difficulty':'Intermedia','category':'Modelar',
             'prompt':'¿Por qué elegiste esta solución? Explica cómo aplicarías lo aprendido en el módulo para resolver el problema.'},
            {'skill':'Argumentar','difficulty':'Intermedia','category':'Argumentar',
             'prompt':'Fundamenta tu decisión técnica con evidencias del caso y criterios del módulo.'},
            {'skill':'Representar','difficulty':'Inicial','category':'Representar',
             'prompt':'Explica qué información de la representación utilizaste y cómo orienta el procedimiento.'},
            {'skill':'Modelar','difficulty':'Avanzada','category':'Modelar',
             'prompt':'Justifica cómo aplicarías el modelo o procedimiento del módulo y qué verificarías antes de cerrar.'},
            {'skill':'Resolver problemas','difficulty':'Inicial','category':'Modelar',
             'prompt':'Representa el problema, explica los pasos de tu solución y señala qué evidencia confirmarías.'}
        )
        def problem_evidence(question):
            source=normalized_text(' '.join(str(question.get(key) or '') for key in ('skill','question','stimulus','criterion')))
            return sum(source.count(cue) for cue in ('resolver','diagnost','falla','averia','problema','repar','causa'))
        selected=[]
        level_distance={'Inicial':0,'Intermedia':1,'Avanzada':2}
        for target in target_quizzes:
            used_questions={str(item[0].get('question') or '').strip() for item in selected}
            available=[q for q in questions if str(q.get('question') or '').strip() not in used_questions]
            if not available:break
            def match_rank(question):
                category=cognitive_skill(question)
                skill_match=(problem_evidence(question)>0 if target['skill']=='Resolver problemas'
                             else category==target['category'] and not (target['skill']=='Modelar' and problem_evidence(question)>0))
                difficulty=normalized_difficulty(question)
                return (not skill_match,
                        abs(level_distance.get(difficulty,1)-level_distance[target['difficulty']]),
                        question.get('ae') in {item[0].get('ae') for item in selected},
                        rng.random())
            chosen=min(available,key=match_rank)
            selected.append((chosen,normalized_difficulty(chosen) or target['difficulty'],target))
        if question_order:
            bank={question['question']:question for question in questions}
            if len(question_order)==5 and all(item.get('question') in bank for item in question_order):
                selected=[(bank[item['question']],item.get('difficulty') or normalized_difficulty(bank[item['question']]),
                           target_quizzes[index]) for index,item in enumerate(question_order)]
        quiz=[]
        for index,(question,difficulty,target) in enumerate(selected):
            ae_index=question.get('ae');ae=(content.get('aes') or [])[ae_index] if type(ae_index) is int and 0<=ae_index<len(content.get('aes') or []) else {}
            quiz.append({**{key:question.get(key) for key in ('question','options','explanation','stimulus','image','caption','alt','ae','skill','criterion') if key in question},
                         'difficulty':difficulty,'target_difficulty':target['difficulty'],'cognitive_skill':target['skill'],
                         'argument_prompt':target['prompt'],'traceability':{'module':content.get('title') or '',
                         'specialty':content.get('specialty') or '', 'education_level':content.get('education_level') or '',
                         'oa':ae.get('oa') or ae.get('objective') or '',
                         'ae_title':ae.get('title') or ae.get('name') or '',
                         'criterion':question.get('criterion') or '',
                         'content':question.get('stimulus') or question.get('caption') or question.get('question') or '',
                         'prior_activity':ae.get('activity') or ae.get('lesson') or (ae.get('steps') or [''])[0],
                         'work_situation':question.get('question') or '', 'competence':question.get('skill') or target['skill'],
                         'image':question.get('image') or ''}})
        aes=[{'title':a.get('title') or a.get('name') or f'Aprendizaje esperado {i+1}',
              'description':a.get('description') or ''} for i,a in enumerate(content.get('aes') or [])]
        candidates=[item for item in (content.get('encargos') or {}).get('items') or [] if item.get('station') in (2,3)]
        tasks=[]
        for item in candidates:
            if not any(existing.get('ae')==item.get('ae') for existing in tasks):tasks.append(item)
            if len(tasks)>=4:break
        if len(tasks)<4:
            for item in candidates:
                if item not in tasks:tasks.append(item)
                if len(tasks)>=4:break
        phase_specs=(
            {'id':'planificar','number':1,'title':'Planificar','minutes':5,'skill':'Representar y planificar',
             'product':'Plan de trabajo con datos representados, recursos requeridos, riesgos y verificaciones previas.',
             'prompt':'Representa el encargo con los datos disponibles. Separa hechos, supuestos y pendientes; vincula la evidencia con el criterio indicado y planifica recursos, secuencia, controles preventivos y puntos de verificación antes de intervenir.'},
            {'id':'actuar','number':2,'title':'Actuar','minutes':15,'skill':'Modelar y resolver',
             'product':'Procedimiento secuenciado con decisiones, recursos utilizados y controles de seguridad aplicables.',
             'prompt':'Modela y desarrolla la solución del encargo paso a paso según el criterio del AE. Explica qué recursos o herramientas seleccionarías, qué decisión tomarías ante los datos del caso y qué medidas de seguridad, bioseguridad o resguardo corresponden al módulo.'},
            {'id':'verificar','number':3,'title':'Verificar','minutes':5,'skill':'Resolver y verificar',
             'product':'Registro de comprobación con resultado, evidencia, desviaciones y corrección necesaria.',
             'prompt':'Comprueba el resultado frente al criterio del AE. Describe la prueba o control que realizarías, qué evidencia registrarías, cómo reconocerías una desviación y qué condición obliga a corregir o detener el trabajo.'},
            {'id':'justificar','number':4,'title':'Justificar y cerrar','minutes':5,'skill':'Argumentar y comunicar',
             'product':'Informe de cierre con fundamento técnico, estado del trabajo, pendientes y traspaso responsable.',
             'prompt':'Argumenta la decisión final con datos del caso y el criterio del AE. Emite el producto solicitado, declara el estado del trabajo, los límites de la evidencia y los pendientes; explica qué comunicarías y a quién antes de darlo por cerrado.'},
        )
        mission_tasks=[]
        for index,spec in enumerate(phase_specs):
            item=tasks[index] if index<len(tasks) else {}
            ae_number=item.get('ae') if type(item.get('ae')) is int else min(index+1,len(aes))
            ae_index=ae_number-1 if type(ae_number) is int and 1<=ae_number<=len(aes) else min(index,len(aes)-1)
            ae_data=(content.get('aes') or [{}])[ae_index] if aes else {}
            criteria=ae_data.get('criteria') or []
            instruction=item.get('instruction') or {}
            criterion=instruction.get('criterion') or (criteria[index%len(criteria)] if criteria else '')
            mission_tasks.append({'id':item.get('id') or f'mission-{spec["number"]}',
                'title':f'{spec["title"]} · {ae_data.get("short_title") or ae_data.get("title") or "aprendizaje del módulo"}',
                'source_title':item.get('title') or content.get('title') or '',
                'source_product':item.get('product') or '',
                'product':spec['product'],'prompt':item.get('prompt') or spec['prompt'],
                'ae':ae_number if type(ae_number) is int else ae_index+1,
                'ae_code':ae_data.get('official_code') or f'AE {ae_index+1}',
                'ae_title':ae_data.get('title') or ae_data.get('name') or '',
                'skill':spec['skill'],'criterion':criterion,
                'resource':instruction.get('resource') or 'Recursos, documentos y evidencias disponibles para el encargo; registra como pendiente lo que no esté disponible.'})
        cases=content.get('cases') or [{}]
        case=cases[(attempt_id-1)%len(cases)]
        return {
            'version':3,
            'module':{'id':mid,'title':content.get('title') or '', 'case_title':case.get('title') if attempt_id>1 else content.get('case_title') or case.get('title') or 'Situación laboral integrada'},
            'attempt_id':attempt_id,
            'timing':{'total':50,'quiz':20,'mission':30,'quiz_per_question':4,'phases':[5,15,5,5]},
            'quiz':quiz,
            'mission':{
                'scenario':case.get('context') or content.get('context') or content.get('application') or '',
                'question':case.get('question') or '',
                'aes':aes,
                'tasks':mission_tasks,
                'rubric':[{'name':x.get('name') or '', 'max':x.get('max')} for x in content.get('rubric') or []],
                'phases':[{key:value for key,value in spec.items() if key!='product'} for spec in phase_specs]
            }
        }
    def city_reward(experience, plan=None):
        return evaluate_city(experience, plan)
    def ensure_city_quiz_version(experience, plan):
        quiz=experience.setdefault('quiz',{'answers':{},'attempts':{}})
        order=quiz.get('question_order') or experience.get('quiz',{}).get('question_order')
        if quiz.get('version')!=4 or not isinstance(order,list) or len(order)!=5:
            if order or quiz.get('answers') or quiz.get('attempts'):
                experience.setdefault('legacy_quiz_attempts',[]).append({key:quiz.get(key) for key in ('version','question_order','answers','attempts','score','completed_at','active_seconds','reinforcements','recovery_answers') if key in quiz})
            quiz={'version':4,'answers':{},'attempts':{},'active_seconds':0}
            experience['quiz']=quiz
        quiz.setdefault('version',4)
        if not quiz.get('question_order') or len(quiz.get('question_order') or [])!=5:
            quiz['question_order']=[{'question':item['question'],'difficulty':item['difficulty']} for item in plan['quiz']]
        return quiz
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
            city_locations=city_locations_for_courses(con.execute('SELECT id,title FROM courses ORDER BY id').fetchall())
            course_ids=[c['id'] for c in rows]
            modules_by_course={cid:[] for cid in course_ids}
            if course_ids:
                marks=','.join('?' for _ in course_ids)
                module_rows=con.execute(f'''SELECT m.id,m.course_id,m.title,m.position,m.published,
                    c.official_hp,c.source_scope,c.source_pdf,c.official_year,c.encargos_count,c.encargos_hours,c.ae_count
                    FROM modules m JOIN course_catalog c ON c.module_id=m.id
                    WHERE m.course_id IN ({marks}) ORDER BY m.course_id,m.position,m.id''',course_ids).fetchall()
                states={r['module_id']:json.loads(r['state']) for r in con.execute('SELECT module_id,state FROM progress WHERE user_id=?',(u['id'],)).fetchall()}
                for m in module_rows:modules_by_course[m['course_id']].append(m)
            result=[]
            for c in rows:
                item=dict(c);item['modules']=[];item['city_location']=city_locations.get(item['id'])
                for m in modules_by_course.get(c['id'],[]):
                    mod=dict(m);mod.pop('course_id',None);s=states.get(m['id']) or empty();s.setdefault('oficio',{});s.setdefault('encargos',{});ae_count=int(mod.pop('ae_count') or 3);expected_steps=max(1,ae_count)*6;mod['completed']=[bool(s['context']),len(s['ae'])==expected_steps,len(s['cases'])==15 and bool(s['scene']),bool(s['exam']),s['closed']]
                    city_completed=city_reward(s.get('city_experience') or {})['approved']
                    mod['city_completed']=city_completed
                    mod['percent']=round((sum(mod['completed'])+int(city_completed))*100/6)
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
                    keep={'id','title','position','published','completed','city_completed','percent','evaluation_scores','official_hp','official_year','encargos_count','encargos_hours'}
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
        m.update(content=c,state=s,completed=completed(s,c),city_completed=city_reward(s.get('city_experience') or {})['approved'],stations=STATIONS,steps=STEPS,planning=active_plan or c.get('planning') or module_plan(m['position']))
        return jsonify(m)
    @app.get('/api/city-experience')
    def city_experience_page():
        response=send_from_directory(app.static_folder,'city-experience.html')
        response.headers['Cache-Control']='no-store'
        return response
    @app.get('/api/city-experience.css')
    def city_experience_styles():
        response=send_from_directory(app.static_folder,'city-experience.css')
        response.headers['Cache-Control']='no-store'
        return response
    @app.get('/api/city-experience.js')
    def city_experience_script():
        response=send_from_directory(app.static_folder,'city-experience.js')
        response.headers['Cache-Control']='no-store'
        return response
    @app.get('/api/modules/<int:mid>/city-experience')
    @require('student')
    def get_city_experience(mid):
        m,err=accessible(mid)
        if err:return err
        preview_mode=is_demo_student(user())
        content=load_content(m['content'],m['position']);content['title']=m['title'];content['specialty']=m.get('course_title') or '';content['education_level']=m.get('course_level') or ''
        with db() as con:
            con.execute('BEGIN IMMEDIATE')
            state=getstate(con,mid)
            experience=state.get('city_experience') or {}
            if not experience.get('started_at'):
                now=datetime.now(timezone.utc).isoformat()
                experience={'version':3,'started_at':now,'active_seconds':0,'quiz':{'version':3,'answers':{},'attempts':{},'active_seconds':0},
                            'mission':{'responses':{},'drafts':{},'active_seconds':0,'validation_version':1}}
                state['city_experience']=experience
                trace(state,'city-experience-started',version=2)
                putstate(con,mid,state)
            experience.setdefault('quiz',{}).setdefault('active_seconds',0)
            experience.setdefault('mission',{}).setdefault('active_seconds',0)
            city_courses=con.execute('SELECT id,title FROM courses ORDER BY id').fetchall()
            location=city_locations_for_courses(city_courses).get(m['course_id'])
            course=con.execute('SELECT title FROM courses WHERE id=?',(m['course_id'],)).fetchone()
            plan=city_experience_content(content,mid,session['uid'],experience.get('mission',{}).get('attempt_id',1),experience['quiz'].get('question_order'))
            quiz_state=ensure_city_quiz_version(experience,plan)
            experience['quiz']['question_order']=quiz_state['question_order']
            putstate(con,mid,state)
            for question in plan['quiz']:question.pop('explanation',None)
            if 'earned_areas' not in experience:
                migrate_awards(experience,plan,mid)
                putstate(con,mid,state)
            module_rows=con.execute('SELECT p.state FROM progress p JOIN modules m ON m.id=p.module_id WHERE p.user_id=? AND m.course_id=? AND m.published=1',(session['uid'],m['course_id'])).fetchall()
            total_modules=con.execute('SELECT COUNT(*) FROM modules WHERE course_id=? AND published=1',(m['course_id'],)).fetchone()[0]
        reviewed=[]
        for row in module_rows:
            module_state=json.loads(row['state']);module_experience=module_state.get('city_experience') or {}
            if module_experience.get('started_at'):
                reviewed.append(city_reward(module_experience))
        specialty_progress={'reviewed_modules':sum(item['status']=='reviewed' for item in reviewed),'total_modules':total_modules,
                            'approved_modules':sum(item['approved'] for item in reviewed),
                            'best_level':max((area['level'] for item in reviewed for area in item['areas']),default=0),
                            'unlocked_areas':sum(len(item['areas']) for item in reviewed),
                            'recognized':bool(total_modules and len(reviewed)>=total_modules and all(item['approved'] for item in reviewed))}
        recoveries=[]
        for index,question in enumerate(plan['quiz']):
            answer=(experience.get('quiz',{}).get('answers') or {}).get(str(index)) or {}
            if answer and not answer.get('correct') and not answer.get('recovered'):
                variant=recovery_question(content,plan,experience,index)
                ae_index=question.get('ae');ae=(content.get('aes') or [])[ae_index] if type(ae_index) is int and 0<=ae_index<len(content.get('aes') or []) else {}
                latest=(experience.get('quiz',{}).get('recovery_answers',{}).get(str(index)) or [answer])[-1]
                recoveries.append({'index':index,'question':question.get('question',''),'ae':question.get('ae'),
                                   'skill':question.get('skill',''),'explanation':answer.get('explanation',''),
                                   'correct_answer':latest.get('correct_answer') or answer.get('correct_answer') or '',
                                   'latest_feedback':latest.get('choice_feedback') or latest.get('explanation') or answer.get('explanation',''),
                                   'reinforcement':{'ae_title':ae.get('title') or '', 'criterion':question.get('criterion') or '',
                                                    'lesson':ae.get('lesson') or [ae.get('description') or ''],
                                                    'example':ae.get('example') or (ae.get('steps') or [''])[0]},
                                   'reinforcement_attempts':experience.get('quiz',{}).get('reinforcements',{}).get(str(index),[]),
                                   'reassessment':{k:v for k,v in variant.items() if k not in ('answer','explanation','option_feedback')} if variant else None,
                                   'reassessment_attempts':experience.get('quiz',{}).get('recovery_answers',{}).get(str(index),[]),
                                   'attempts':(experience.get('mission',{}).get('recovery_missions') or {}).get(str(index),[])})
        station_groups=state.get('city_station_quizzes') or {}
        station_progress=[{'station':number,'passed':bool((station_groups.get(str(number)) or {}).get('passed'))}
                          for number in range(1,5)]
        return jsonify(course_id=m['course_id'],module_id=mid,course_title=course['title'],location=location,plan=plan,state=experience,
                       quiz_learning=quiz_learning_status(experience,len(plan['quiz'])),station_progress=station_progress,
                       stage2_unlocked=preview_mode or bool((experience.get('native_progress') or {}).get('portal_interacted_at')),
                       preview_mode=preview_mode,
                       reward=city_reward(experience,plan),specialty_progress=specialty_progress,recoveries=recoveries)
    @app.get('/api/modules/<int:mid>/city-room-setup')
    @require('student')
    def city_room_inventory(mid):
        m,err=accessible(mid)
        if err:return err
        return jsonify(room_setup(m['title'],m.get('course_title') or '',load_content(m['content'],m['position'])))
    @app.route('/api/modules/<int:mid>/city-station-quiz',methods=['GET','POST'])
    @require('student')
    def city_station_quiz(mid):
        m,err=accessible(mid)
        if err:return err
        station=request.args.get('station',type=int) if request.method=='GET' else body().get('station')
        if type(station) is not int or station not in range(1,5):return fail('Estación de quiz inválida.')
        content=load_content(m['content'],m['position'])
        questions=[q for q in content.get('questions') or [] if q.get('id') is not None and has_four_options(q)]
        skills=('Representar','Resolver problemas','Modelar','Argumentar')
        def canonical_skill(question):
            value=''.join(char for char in unicodedata.normalize('NFD',str(question.get('skill') or '').casefold()) if unicodedata.category(char)!='Mn')
            evidence=''.join(char for char in unicodedata.normalize('NFD',' '.join(str(question.get(key) or '') for key in ('question','stimulus','criterion','explanation')).casefold()) if unicodedata.category(char)!='Mn')
            if any(term in value for term in ('represent','interpret','lectura','diagrama')):return 'Representar'
            if any(term in value for term in ('resolver','relacionar','problema','diagnost')):return 'Resolver problemas'
            if any(term in value for term in ('model','aplicar','calcular','ejecutar','proponer')):return 'Modelar'
            if any(term in value for term in ('argument','verificar','justificar','fundament','evaluar')):return 'Argumentar'
            cues={'Representar':('plano','diagrama','esquema','tabla','simbolo','leyenda','representacion','interpretar'),
                  'Resolver problemas':('problema','falla','diagnost','resolver','inconsistencia','conflicto','cruza','no coincide','discrepancia'),
                  'Modelar':('calcular','dimensionar','procedimiento','proponer','aplicar','secuencia','escala','medida','mm','cm','proporcion','cubicacion'),
                  'Argumentar':('justificar','evidencia','criterio','verificar','decidir','fundamentar','conformidad','firmar','riesgo')}
            return max(skills,key=lambda skill:sum(evidence.count(cue) for cue in cues[skill]))
        def topic_tokens(value):
            text=''.join(char if char.isalnum() else ' ' for char in unicodedata.normalize('NFD',str(value or '').casefold()) if unicodedata.category(char)!='Mn')
            return {word for word in text.split() if len(word)>3 and word not in {'quiz','estacion','aplicacion','practica','banco','mantenimiento','modulo','herramientas','equipo','aula','tp'}}
        def topic_score(question,topic):
            evidence=' '.join(str(question.get(key) or '') for key in ('question','stimulus','criterion','skill','caption'))
            return len(topic_tokens(topic)&topic_tokens(evidence))
        def source_difficulty(question):
            value=''.join(char for char in unicodedata.normalize('NFD',str(question.get('difficulty') or '').casefold()) if unicodedata.category(char)!='Mn')
            if value in {'facil','inicial','easy','basico'}:return 'easy'
            if value in {'media','intermedia','medium'}:return 'medium'
            if value in {'dificil','avanzada','hard'}:return 'hard'
            return ''
        def complexity_rank(question):
            evidence=' '.join(str(question.get(key) or '') for key in ('question','stimulus','criterion')).casefold()
            cues=('diagnost','calcula','fundament','compara','integra','planifica','evalua','verifica','prioriza','secuencia','dimensiona','justifica')
            return (sum(evidence.count(cue) for cue in cues),len(evidence.split()),evidence)
        payload=body() if request.method=='POST' else {}
        try:topics=json.loads(request.args.get('topics','[]')) if request.method=='GET' else payload.get('topics',[])
        except (TypeError,ValueError):topics=[]
        topics=[str(value or '')[:180] for value in topics] if isinstance(topics,list) else []
        topics=(topics+['']*4)[:4]
        pools={skill:[q for q in questions if canonical_skill(q)==skill] for skill in skills}
        level_names={'easy':'Fácil','medium':'Media','hard':'Difícil'}
        with db() as con:
            con.execute('BEGIN IMMEDIATE')
            state=getstate(con,mid)
            stations=state.setdefault('city_station_quizzes',{})
            valid_station_bank=(stations.get('version')==5 and all(
                isinstance(stations.get(str(number)),dict)
                and len(stations[str(number)].get('question_ids') or [])==5
                and len(stations[str(number)].get('skills') or [])==5
                and len(stations[str(number)].get('difficulty_levels') or [])==5
                for number in range(1,5)))
            if not valid_station_bank:
                previous={key:value for key,value in stations.items() if key!='version'}
                if previous:state.setdefault('city_station_quiz_history',[]).append({'version':stations.get('version',1),'stations':previous,'archived_at':datetime.now(timezone.utc).isoformat()})
                assigned=set();skill_totals={skill:0 for skill in skills}
                groups={str(number):{'topic':topics[number-1],'question_ids':[],'skills':[],'difficulty_levels':[]} for number in range(1,5)}
                def fill_station(number,slot=0):
                    group=groups[str(number)]
                    if slot==5:return all(skill in group['skills'] for skill in skills)
                    remaining=range(slot+1,5)
                    missing=[skill for skill in skills if skill not in group['skills']]
                    candidates=[q for q in questions if q.get('id') not in assigned]
                    candidates.sort(key=lambda q:(canonical_skill(q) not in missing,skill_totals[canonical_skill(q)],
                                                  -topic_score(q,group['topic']),
                                                  q.get('ae') in {item.get('ae') for item in questions if item.get('id') in group['question_ids']},
                                                  -int(q.get('id') or 0)))
                    for question in candidates:
                        skill=canonical_skill(question)
                        if skill not in skills:continue
                        left_missing=[item for item in skills if item not in group['skills'] and item!=skill]
                        if len(left_missing)>len(remaining):continue
                        if any(not any(canonical_skill(candidate)==item and candidate.get('id') not in assigned and candidate.get('id')!=question.get('id') for candidate in questions) for item in left_missing):continue
                        assigned.add(question['id']);group['question_ids'].append(question['id']);group['skills'].append(skill)
                        skill_totals[skill]+=1
                        if fill_station(number,slot+1):return True
                        skill_totals[skill]-=1;group['skills'].pop();group['question_ids'].pop();assigned.remove(question['id'])
                    return False
                if not all(fill_station(number) for number in range(1,5)):
                    return fail('No se pudieron distribuir veinte preguntas únicas con las cuatro habilidades del módulo.',409)
                selected=[q for q in questions if q.get('id') in assigned]
                selected.sort(key=lambda q:({'easy':0,'medium':1,'hard':2}.get(source_difficulty(q),1),complexity_rank(q),str(q.get('id'))))
                calibrated_level={q['id']:('easy' if index<10 else 'medium' if index<18 else 'hard') for index,q in enumerate(selected)}
                for group in groups.values():group['difficulty_levels']=[level_names[calibrated_level[question_id]] for question_id in group['question_ids']]
                for group in groups.values():group.update(slot_index=0,current_id=group['question_ids'][0],attempts=[],passed=False)
                stations={'version':5,'used_question_ids':[groups[str(number)]['current_id'] for number in range(1,5)],**groups}
                state['city_station_quizzes']=stations
                putstate(con,mid,state)
            item=stations.get(str(station))
            if not item:return fail('No se encontró el quiz de esta estación.',409)
            slot=min(int(item.get('slot_index') or 0),4)
            question=next((q for q in questions if q.get('id')==item.get('current_id')),None)
            if request.method=='POST':
                question=next((q for q in questions if q.get('id')==payload.get('question_id') and q.get('id')==item.get('current_id')),None)
                choice=payload.get('choice');argument=payload.get('argument')
                if item.get('passed'):return jsonify(passed=True,feedback='Este quiz ya está aprobado.')
                if not question:return fail('La pregunta cambió. Actualiza el quiz antes de responder.',409)
                if not has_four_options(question):return fail('La pregunta no cumple el formato de cuatro alternativas. Actualiza el quiz.',409)
                if type(choice) is not int or choice not in range(4):return fail('Selecciona una alternativa disponible.')
                if not text_valid(argument,20):return fail('Fundamenta tu respuesta con al menos 20 caracteres.')
                feedback=answer_feedback(question,choice)
                item.setdefault('attempts',[]).append({'slot':slot,'skill':item['skills'][slot],'question_id':question.get('id'),'choice':choice,'argument':argument.strip(),'correct':feedback['correct'],'at':datetime.now(timezone.utc).isoformat()})
                response={'correct':feedback['correct'],'passed':False,'question_number':slot+1,'total_questions':5,'skill':item['skills'][slot],
                          'feedback':feedback['choice_feedback'],'explanation':feedback['explanation'],'correct_answer':feedback['correct_answer'] if feedback['correct'] else None,
                          'attempts':len(item['attempts']),'correct_in_quiz':slot if not feedback['correct'] else slot+1}
                if feedback['correct']:
                    item['slot_index']=slot+1
                    if item['slot_index']==5:
                        item['passed']=True;response['passed']=True
                    else:
                        item['current_id']=item['question_ids'][item['slot_index']]
                        stations['used_question_ids'].append(item['current_id'])
                        next_question=next(q for q in questions if q.get('id')==item['current_id'])
                        next_question={**next_question,'difficulty':item['difficulty_levels'][item['slot_index']]}
                        next_slot=item['slot_index']
                        response.update(question_number=next_slot+1,next_skill=item['skills'][next_slot],
                                        next_question={key:next_question.get(key) for key in ('id','question','options','criterion','ae','difficulty','image','stimulus') if key in next_question})
                        ae_index=next_question.get('ae');aes=content.get('aes') or []
                        response['ae_title']=aes[ae_index].get('title') or aes[ae_index].get('name') or '' if type(ae_index) is int and 0<=ae_index<len(aes) else ''
                else:
                    skill=item['skills'][slot];used=set(stations.get('used_question_ids') or [])
                    reserved={question_id for key,group in stations.items() if key in {'1','2','3','4'} and key!=str(station) for question_id in group.get('question_ids',[])}
                    reserved.update(item['question_ids'][slot+1:])
                    target_level={'Fácil':'easy','Media':'medium','Difícil':'hard'}.get(item['difficulty_levels'][slot])
                    candidates=[q for q in pools[skill] if source_difficulty(q)==target_level and q.get('id')!=question.get('id') and q.get('id') not in reserved and q.get('id') not in used]
                    if not candidates:candidates=[q for q in pools[skill] if q.get('id')!=question.get('id') and q.get('id') not in reserved and q.get('id') not in used]
                    if not candidates:candidates=[q for q in pools[skill] if q.get('id')!=question.get('id') and q.get('id') not in reserved]
                    candidates.sort(key=lambda q:(q.get('ae')!=question.get('ae'),-topic_score(q,item.get('topic')),-int(q.get('id') or 0)))
                    if candidates:
                        next_question=candidates[0];item['question_ids'][slot]=next_question.get('id');item['current_id']=next_question.get('id');stations['used_question_ids'].append(next_question.get('id'))
                        next_question={**next_question,'difficulty':item['difficulty_levels'][slot]}
                        response.update(next_skill=skill,next_question={key:next_question.get(key) for key in ('id','question','options','criterion','ae','difficulty','image','stimulus') if key in next_question})
                        ae_index=next_question.get('ae');aes=content.get('aes') or []
                        response['ae_title']=aes[ae_index].get('title') or aes[ae_index].get('name') or '' if type(ae_index) is int and 0<=ae_index<len(aes) else ''
                    else:response['bank_exhausted']=True
                trace(state,'city-station-quiz-answer',station=station,correct=feedback['correct'],attempt=response['attempts'])
                putstate(con,mid,state)
                return jsonify(response)
            if item.get('passed'):
                putstate(con,mid,state)
                return jsonify(station=station,passed=True,attempts=len(item.get('attempts') or []),correct_in_quiz=5,total_questions=5)
            if not question:return fail('No hay preguntas disponibles para esta estación.',409)
            ae_index=question.get('ae');aes=content.get('aes') or []
            ae_title=aes[ae_index].get('title') or aes[ae_index].get('name') or '' if type(ae_index) is int and 0<=ae_index<len(aes) else ''
            putstate(con,mid,state)
            question={**question,'difficulty':item['difficulty_levels'][slot]}
            return jsonify(station=station,passed=False,attempts=len(item.get('attempts') or []),question_number=slot+1,total_questions=5,skill=item['skills'][slot],topic=item.get('topic'),ae=ae_index,ae_title=ae_title,
                           question={key:question.get(key) for key in ('id','question','options','criterion','ae','difficulty','image','stimulus') if key in question})
    @app.post('/api/modules/<int:mid>/city-experience')
    @require('student')
    def save_city_experience(mid):
        m,err=accessible(mid)
        if err:return err
        payload=body();operation=payload.get('operation')
        content=load_content(m['content'],m['position']);content['title']=m['title'];content['specialty']=m.get('course_title') or '';content['education_level']=m.get('course_level') or ''
        with db() as con:
            con.execute('BEGIN IMMEDIATE')
            state=getstate(con,mid)
            experience=state.get('city_experience')
            if not experience:return fail('Inicia la experiencia antes de guardar avances.',409)
            plan=city_experience_content(content,mid,session['uid'],experience.get('mission',{}).get('attempt_id',1),experience.get('quiz',{}).get('question_order'))
            quiz_state=ensure_city_quiz_version(experience,plan)
            migrate_awards(experience,plan,mid)
            quiz=experience.setdefault('quiz',{'answers':{},'attempts':{}})
            mission=experience.setdefault('mission',{'responses':{},'drafts':{}})
            mission.setdefault('case_title',plan['module']['case_title'])
            mission.setdefault('scenario',plan['mission']['scenario'])
            if operation=='flag-interact':
                station_groups=state.get('city_station_quizzes') or {}
                if not all((station_groups.get(str(number)) or {}).get('passed') for number in range(1,5)):
                    return fail('Completa y aprueba los cuatro quiz del módulo antes de activar la bandera.',403)
                required_seconds=int(plan['timing']['quiz'])*60
                if int(quiz.get('active_seconds') or 0)<required_seconds:
                    return fail('Los cuatro quiz están aprobados. Completa el tiempo activo del desafío antes de abrir la Etapa 2.',403)
                if len(plan['quiz'])!=5:return fail('Este módulo requiere revisión de configuración antes de abrir sus prácticas.',409)
                for index,question in enumerate(plan['quiz']):
                    quiz.setdefault('answers',{})[str(index)]={
                        'question':question['question'],'choice':None,'argument':'Aprobé las cinco preguntas del quiz de esta estación.',
                        'correct':True,'recovered':False,'explanation':'Cinco respuestas correctas verificadas en la estación 3D.',
                        'ae':question.get('ae'),'ae_title':(question.get('traceability') or {}).get('ae_title',''),
                        'criterion':question.get('criterion'),'traceability':question.get('traceability') or {},
                        'verified_by':'city_station_quiz','station':index%4+1,'at':datetime.now(timezone.utc).isoformat()}
                quiz['score']=sum(bool(answer.get('correct') or answer.get('recovered')) for answer in quiz['answers'].values())
                quiz['completed_at']=quiz.get('completed_at') or datetime.now(timezone.utc).isoformat()
                experience.setdefault('native_progress',{})['portal_interacted_at']=datetime.now(timezone.utc).isoformat()
                sync_awards(experience,plan,mid)
                trace(state,'city-stage2-portal-opened',module_id=mid)
            elif operation=='heartbeat':
                seconds=payload.get('seconds')
                stage=payload.get('stage')
                if type(seconds)!=int or not 1<=seconds<=60 or stage not in ('quiz','mission'):return fail('Intervalo de actividad inválido.')
                if stage=='mission' and len(quiz.get('answers',{}))!=len(plan['quiz']):return fail('Completa primero todos los desafíos del quiz.',403)
                if stage=='mission' and not quiz_learning_status(experience,len(plan['quiz']))['approved']:return fail('Aprueba el quiz con al menos 75% antes de iniciar las misiones laborales.',403)
                if stage=='mission' and int(quiz.get('active_seconds') or 0)<plan['timing']['quiz']*60:return fail('Completa los 20 minutos activos del quiz antes de iniciar la práctica profesional.',403)
                experience['active_seconds']=int(experience.get('active_seconds') or 0)+seconds
                experience.setdefault(stage,{})['active_seconds']=int(experience[stage].get('active_seconds') or 0)+seconds
            elif operation=='recovery-start':
                if mission.get('attempt_id',1)>=len(content.get('cases') or []):
                    return fail('No quedan situaciones equivalentes inéditas. El docente debe ampliar el banco en una nueva versión de práctica.',409)
                try:recovery=start_recovery(experience,payload.get('reinforcement'))
                except ValueError as error:return fail(str(error),409)
                retry_plan=city_experience_content(content,mid,session['uid'],mission['attempt_id'],quiz.get('question_order'))
                mission['case_title']=retry_plan['module']['case_title'];mission['scenario']=retry_plan['mission']['scenario']
                trace(state,'city-recovery-started',attempt_id=mission['attempt_id'],phases=recovery['phases'])
            elif operation=='quiz-reinforcement':
                index=payload.get('index');answer=(quiz.get('answers') or {}).get(str(index)) or {}
                if type(index) is not int or not 0<=index<len(plan['quiz']) or not quiz.get('completed_at') or not answer or answer.get('correct') or answer.get('recovered'):
                    return fail('Selecciona un aprendizaje pendiente después de completar el quiz.',403)
                if not text_valid(payload.get('text'),20):return fail('Explica qué aprendiste y cómo corregirías el procedimiento (mínimo 20 caracteres).')
                quiz.setdefault('reinforcements',{}).setdefault(str(index),[]).append({'text':payload['text'].strip(),'at':datetime.now(timezone.utc).isoformat()})
                trace(state,'city-quiz-reinforcement',index=index,ae=plan['quiz'][index].get('ae'))
            elif operation=='quiz-retry-answer':
                index=payload.get('index');choice=payload.get('choice');argument=payload.get('argument')
                answers=quiz.get('answers') or {}
                current_result=city_reward(experience)
                before_practice=bool(quiz.get('completed_at') and not quiz_learning_status(experience,len(plan['quiz']))['approved'])
                if not before_practice and (not mission.get('review') or current_result['approved']):
                    return fail('Este quiz ya habilita el avance o no tiene una recuperación pendiente.',403)
                if (current_result.get('recovery') or {}).get('type')=='practica_integral':
                    mission.setdefault('integral_required_after',mission.get('attempt_id',1))
                if type(index) is not int or not 0<=index<len(plan['quiz']) or str(index) not in answers or answers[str(index)].get('correct') or answers[str(index)].get('recovered'):
                    return fail('Selecciona un desafío pendiente de recuperación.',403)
                reinforcements=(quiz.get('reinforcements') or {}).get(str(index)) or []
                retries=(quiz.get('recovery_answers') or {}).get(str(index)) or []
                if before_practice and len(reinforcements)<((retries[-1].get('reinforcement_count',0) if retries else 0)+1):
                    return fail('Revisa la explicación y registra un nuevo refuerzo antes de reintentar.',409)
                if not before_practice and not (mission.get('recovery_missions') or {}).get(str(index)):
                    return fail('Registra primero el refuerzo y la reflexión de este desafío.',409)
                variant=recovery_question(content,plan,experience,index)
                if not variant or payload.get('question')!=variant['question']:
                    return fail('Abre el desafío equivalente actualizado antes de responder.',409)
                if not has_four_options(variant):return fail('La pregunta de recuperación no cumple el formato de cuatro alternativas.',409)
                if type(choice) is not int or choice not in range(4):
                    return fail('Selecciona una alternativa disponible.')
                if not text_valid(argument,20):return fail('Fundamenta tu nueva respuesta con al menos 20 caracteres.')
                feedback=answer_feedback(variant,choice);correct=feedback['correct']
                quiz.setdefault('recovery_answers',{}).setdefault(str(index),[]).append({'question':variant['question'],'choice':choice,'argument':argument.strip(),**feedback,'reinforcement_count':len(reinforcements),'at':datetime.now(timezone.utc).isoformat()})
                if correct:answers[str(index)]['recovered']=True
                quiz['score']=sum(bool(answer.get('correct') or answer.get('recovered')) for answer in answers.values())
                sync_awards(experience,plan,mid)
                trace(state,'city-quiz-reassessed',index=index,correct=correct)
            elif operation=='quiz-argument-retry':
                index=payload.get('index');teacher_review=quiz.get('teacher_review') or {};items=teacher_review.get('items') or []
                if type(index) is not int or not 0<=index<len(plan['quiz']) or index>=len(items) or items[index].get('approved'):
                    return fail('Solo puedes reformular una fundamentación observada por tu docente.',403)
                argument=payload.get('argument')
                if not text_valid(argument,20):return fail('Escribe una nueva fundamentación de al menos 20 caracteres.')
                answer=quiz.get('answers',{}).get(str(index))
                if not answer:return fail('No existe una respuesta guardada para ese quiz.',404)
                quiz.setdefault('argument_revisions',{}).setdefault(str(index),[]).append({'argument':answer.get('argument',''),'at':datetime.now(timezone.utc).isoformat()})
                answer['argument']=argument.strip();answer['argument_updated_at']=datetime.now(timezone.utc).isoformat()
                quiz.setdefault('pending_feedback',{}).pop(str(index),None)
                quiz.setdefault('teacher_review_history',[]).append(teacher_review)
                quiz.pop('teacher_review',None)
                trace(state,'city-quiz-argument-revised',index=index)
            elif operation=='area-evidence':
                area=next((area for area in experience.get('earned_areas',[]) if area['id']==payload.get('area_id')),None)
                if not area:return fail('Esta área no figura entre tus premios obtenidos.',403)
                if not text_valid(payload.get('text'),20):return fail('Registra decisiones, evidencias y verificaciones del desafío complementario.')
                mission.setdefault('area_evidence',{}).setdefault(area['id'],[]).append({'text':payload['text'].strip(),'at':datetime.now(timezone.utc).isoformat()})
                trace(state,'city-area-evidence',area_id=area['id'])
            elif operation=='area-visit':
                level=payload.get('level');reward=city_reward(experience,plan)
                if type(level) is not int or not any(area['level']==level for area in reward['areas']):
                    return fail('Esta área todavía no está desbloqueada.',403)
                mission.setdefault('explored_areas',{})[str(level)]={'visited_at':datetime.now(timezone.utc).isoformat(),'source':'student_declaration'}
                trace(state,'city-reward-area-visited',level=level,module_id=mid)
            elif operation=='recovery-submit':
                index=payload.get('index');answers=quiz.get('answers') or {}
                if type(index) is not int or not 0<=index<len(plan['quiz']) or str(index) not in answers or answers[str(index)].get('correct') or answers[str(index)].get('recovered'):
                    return fail('Esta misión de recuperación no corresponde a una respuesta pendiente.',403)
                if len(mission.get('responses') or {})!=len(plan['mission']['phases']):
                    return fail('Completa primero la práctica profesional del módulo.',403)
                text=payload.get('text')
                if not text_valid(text,20):return fail('Escribe al menos 20 caracteres para guardar la recuperación.')
                attempts=mission.setdefault('recovery_missions',{}).setdefault(str(index),[])
                attempts.append({'text':text.strip(),'at':datetime.now(timezone.utc).isoformat()})
                mission['recovery_missions'][str(index)]=attempts[-20:]
                trace(state,'city-recovery-submitted',index=index,ae=plan['quiz'][index].get('ae'),attempt=len(attempts))
            elif operation=='quiz-answer':
                index=payload.get('index');choice=payload.get('choice');argument=payload.get('argument');answers=quiz.setdefault('answers',{})
                if type(index)!=int or not 0<=index<len(plan['quiz']) or not has_four_options(plan['quiz'][index]) or type(choice)!=int or choice not in range(4):
                    return fail('Selecciona una respuesta disponible.')
                if not text_valid(argument,20):return fail('Fundamenta tu respuesta utilizando los conocimientos y procedimientos aprendidos en este módulo (mínimo 20 caracteres).')
                if str(index) in answers:return fail('Esta respuesta ya quedó registrada.')
                if index!=len(answers):return fail('Responde los desafíos en orden.')
                question=plan['quiz'][index]
                original=next((q for q in content.get('questions') or [] if q.get('question')==question['question']),None)
                correct=bool(original and choice==original.get('answer'))
                answers[str(index)]={'question':question['question'],'choice':choice,'argument':argument.strip(),
                                     'primary_skill':question.get('cognitive_skill'),'difficulty':question.get('difficulty'),
                                     'ae':question.get('ae'),'ae_title':(question.get('traceability') or {}).get('ae_title',''),
                                     'criterion':question.get('criterion'),'traceability':question.get('traceability') or {},
                                     **answer_feedback(original,choice),
                                     'at':datetime.now(timezone.utc).isoformat()}
                quiz.setdefault('attempts',{})[str(index)]=int(quiz.get('attempts',{}).get(str(index),0))+1
                if len(answers)==len(plan['quiz']):
                    quiz['completed_at']=datetime.now(timezone.utc).isoformat()
                    quiz['score']=sum(bool(answer.get('correct')) for answer in answers.values())
                trace(state,'city-quiz-answer',index=index,correct=correct,difficulty=question.get('difficulty'),skill=question.get('cognitive_skill'),argument_saved=True)
            elif operation in ('mission-draft','mission-submit'):
                phase=payload.get('phase');phases=plan['mission']['phases']
                if mission.get('review'):return fail('Este intento ya está revisado. Inicia una recuperación para registrar nuevas evidencias.',409)
                phase_index=next((i for i,item in enumerate(phases) if item['id']==phase),-1)
                if len(quiz.get('answers',{}))!=len(plan['quiz']):return fail('Completa primero todos los desafíos del quiz.',403)
                if not quiz_learning_status(experience,len(plan['quiz']))['approved']:return fail('Necesitas al menos 75% en el quiz para realizar la práctica profesional.',403)
                if phase_index<0:return fail('Fase de misión inválida.')
                if int(quiz.get('active_seconds') or 0)<plan['timing']['quiz']*60:return fail('Completa primero los 20 minutos del quiz.',403)
                responses=mission.setdefault('responses',{});drafts=mission.setdefault('drafts',{})
                if any(not phase_approved(mission,item['id']) for item in phases[:phase_index]):return fail('La misión anterior debe estar validada antes de continuar.',403)
                if mission.get('recovery') and phase not in mission.get('required_phases',[]):return fail('Esta fase ya está lograda y se conserva en la recuperación.',403)
                text=payload.get('text')
                if not isinstance(text,str) or len(text)>10000:return fail('Respuesta inválida.')
                if operation=='mission-draft':
                    drafts[phase]=text
                else:
                    if mission.get('validation_version') and phase_approved(mission,phase):return fail('Esta misión ya está validada. Su evidencia se conserva.',409)
                    if mission.get('validation_version') and phase in responses and phase not in mission.get('phase_checks',{}):return fail('Tu entrega está pendiente de validación docente.',409)
                    if not text_valid(text,20):return fail('Escribe al menos 20 caracteres para guardar esta fase.')
                    required_seconds=mission.get('required_seconds',plan['timing']['mission']*60)
                    if len(set(responses)|{phase})==len(phases) and int(mission.get('active_seconds') or 0)<required_seconds:
                        return fail(f'Completa los {required_seconds//60} minutos de práctica de este intento antes de cerrarlo.',403)
                    responses[phase]=text.strip();drafts.pop(phase,None)
                    mission.setdefault('submissions',{}).setdefault(phase,[]).append({'text':text.strip(),'at':datetime.now(timezone.utc).isoformat(),'attempt_id':mission.get('attempt_id',1)})
                    mission.setdefault('phase_checks',{}).pop(phase,None)
                    mission.setdefault('completed_at_by_phase',{})[phase]=datetime.now(timezone.utc).isoformat()
                    if mission.pop('review',None):trace(state,'city-review-invalidated',phase=phase)
                    if len(responses)==len(phases) and not mission.get('validation_version'):mission['completed_at']=datetime.now(timezone.utc).isoformat()
                    trace(state,'city-mission-phase',phase=phase,index=phase_index,
                          aes=list(range(1,len(plan['mission']['aes'])+1)),
                          tasks=[item.get('id') for item in plan['mission']['tasks']])
            else:return fail('Acción de aprendizaje desconocida.')
            putstate(con,mid,state)
        return jsonify(state=experience)
    @app.get('/api/practice/profiles')
    @require()
    def get_practice_profiles():
        return jsonify({mode: [practice_profile(mode, level) for level in range(1, 5)]
                        for mode in ('explore', 'challenge', 'investigate')})
    @app.get('/api/modules/<int:mid>/practice/scenario')
    @require()
    def get_practice_scenario(mid):
        m,err=accessible(mid)
        if err:return err
        try:
            display,claim=practice_scenario(load_content(m['content'],m['position']),request.args.get('mode'),
                request.args.get('level',type=int),request.args.get('number',type=int),request.args.get('previous'),request.args.get('source'))
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
                    state=s,completed=completed(s,c),city_completed=city_reward(s.get('city_experience') or {})['approved'],updated=row['updated']))
        return jsonify(result)
    @app.post('/api/modules/<int:mid>/activity')
    @require('student')
    def activity(mid):
        m,err=accessible(mid)
        if err:return err
        b=body();kind=b.get('kind');c=load_content(m['content'], m['position'])
        with db() as con:
            con.execute('BEGIN IMMEDIATE')
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
                x=dict(r);module_content=json.loads(x.pop('module_content'));x['rubric']=module_content.get('rubric',DEFAULT_CONTENT['rubric']);x['state']=json.loads(x['state']);x['percent']=sum(completed(x['state'],module_content))*20
                x['city_reward']=city_reward(x['state'].get('city_experience') or {})
                records.append(x)
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
            con.execute('BEGIN IMMEDIATE')
            row=con.execute('SELECT state FROM progress WHERE user_id=? AND module_id=?',(b.get('user_id'),b.get('module_id'))).fetchone()
            if not row:return fail('Entrega inexistente.',404)
            s=json.loads(row['state'])
            if not s['exam']:return fail('La evaluación no ha sido entregada.')
            s['exam']['review']={'points':points,'score':sum(points),'feedback':b['feedback'].strip(),'teacher_id':session['uid']}
            con.execute('UPDATE progress SET state=?,updated=CURRENT_TIMESTAMP WHERE user_id=? AND module_id=?',(json.dumps(s,ensure_ascii=False),b['user_id'],b['module_id']))
        return jsonify(ok=True)
    @app.post('/api/teacher/city-phase-review')
    @require('teacher')
    def review_city_phase():
        b=body();phase=b.get('phase');points=b.get('points')
        if (not isinstance(phase,str) or phase not in PHASE_MINUTES or not isinstance(points,list) or len(points)!=5 or
                any(type(point) is not int or point not in range(6) for point in points) or
                type(b.get('competencies_approved')) is not bool or type(b.get('safety_approved')) is not bool or not text_valid(b.get('feedback'),20)):
            return fail('Evalúa los cinco criterios de 0 a 5, confirma competencias y seguridad y escribe la orientación.')
        with db() as con:
            con.execute('BEGIN IMMEDIATE')
            row=con.execute("SELECT p.state FROM progress p JOIN users u ON u.id=p.user_id WHERE p.user_id=? AND p.module_id=? AND u.role='student'",(b.get('user_id'),b.get('module_id'))).fetchone()
            if not row:return fail('Progreso inexistente.',404)
            state=json.loads(row['state']);experience=state.get('city_experience') or {};mission=experience.get('mission') or {}
            submissions=mission.get('submissions',{}).get(phase) or []
            if (not mission.get('validation_version') or not submissions or phase not in mission.get('responses',{}) or mission.get('review')):
                return fail('Esta misión no tiene una entrega pendiente de validación.',409)
            if b.get('attempt_id')!=mission.get('attempt_id',1) or b.get('revision')!=len(submissions):
                return fail('La entrega cambió. Abre de nuevo la evidencia antes de evaluar.',409)
            check={'phase':phase,'points':points,'competencies_approved':b['competencies_approved'],
                   'safety_approved':b['safety_approved'],'feedback':b['feedback'].strip(),
                   'attempt_id':mission.get('attempt_id',1),'revision':len(submissions),
                   'teacher_id':session['uid'],'at':datetime.now(timezone.utc).isoformat(),
                   'approved':sum(points)*4>=75 and b['competencies_approved'] and b['safety_approved']}
            if phase_approved(mission,phase):return fail('Esta entrega ya está validada.',409)
            mission.setdefault('phase_checks',{})[phase]=check
            mission.setdefault('phase_check_history',[]).append(check)
            if all(phase_approved(mission,key) for key in PHASE_MINUTES):mission['completed_at']=datetime.now(timezone.utc).isoformat()
            trace(state,'city-mission-validated',phase=phase,approved=check['approved'],revision=check['revision'])
            con.execute('UPDATE progress SET state=?,updated=CURRENT_TIMESTAMP WHERE user_id=? AND module_id=?',(json.dumps(state,ensure_ascii=False),b['user_id'],b['module_id']))
        return jsonify(ok=True,check=check)
    @app.post('/api/teacher/city-review')
    @require('teacher')
    def review_city_experience():
        b=body();points=b.get('points');feedback=b.get('feedback');safety_approved=b.get('safety_approved');competencies_approved=b.get('competencies_approved')
        quiz_assessment=b.get('quiz_assessment')
        critical_phases=b.get('critical_phases') or ['actuar','verificar']
        if (not isinstance(points,list) or len(points)!=4 or any(not isinstance(row,list) or len(row)!=5 or
                any(type(point) is not int or point not in range(6) for point in row) for row in points) or
                not isinstance(safety_approved,bool) or not isinstance(competencies_approved,bool) or not text_valid(feedback,20)):
            return fail('Revisa los 20 criterios (0 a 5), las competencias esenciales, la seguridad crítica y la retroalimentación.')
        if not isinstance(critical_phases,list) or not critical_phases or any(not isinstance(phase,str) or phase not in PHASE_MINUTES for phase in critical_phases):return fail('Selecciona las fases que deben demostrar las competencias críticas.')
        with db() as con:
            con.execute('BEGIN IMMEDIATE')
            row=con.execute('SELECT p.state,m.content,m.title,m.position,m.course_id FROM progress p JOIN modules m ON m.id=p.module_id JOIN users u ON u.id=p.user_id WHERE p.user_id=? AND p.module_id=? AND u.role=\'student\'',(b.get('user_id'),b.get('module_id'))).fetchone()
            if not row:return fail('No existe el progreso de ese estudiante y módulo.',404)
            state=json.loads(row['state']);experience=state.get('city_experience') or {};mission=experience.get('mission') or {}
            if not experience.get('quiz',{}).get('completed_at') or not mission.get('completed_at'):
                return fail('El estudiante debe completar las dos etapas antes de revisar.',409)
            if experience.get('quiz',{}).get('version') in (3,4):
                quiz_count=5 if experience['quiz'].get('version')==4 else 4
                valid_assessment=(isinstance(quiz_assessment,list) and len(quiz_assessment)==quiz_count and all(
                    isinstance(item,dict) and all(type(item.get(key)) is int and item[key] in range(6)
                    for key in ('argument_quality','application','coherence')) and
                    type(item.get('technically_sufficient')) is bool and text_valid(item.get('feedback'),20)
                    for item in quiz_assessment))
                if not valid_assessment:return fail('Evalúa cada quiz con la pauta 40/20/10, confirma suficiencia técnica y deja retroalimentación (mínimo 20 caracteres).')
                experience['quiz']['teacher_review']={'items':[{**item,'feedback':item['feedback'].strip()} for item in quiz_assessment],
                    'teacher_id':session['uid'],'reviewed_at':datetime.now(timezone.utc).isoformat()}
                assessment_result=quiz_teacher_result(experience)
                experience['quiz']['teacher_review'].update(score=assessment_result['score'],approved=assessment_result['approved'],items=assessment_result['items'])
                experience['quiz']['pending_feedback']={str(index):item['feedback'] for index,item in enumerate(assessment_result['items']) if not item['approved']}
            if not quiz_learning_status(experience)['approved']:return fail('El quiz debe estar aprobado con al menos 75% antes de cerrar la práctica.',409)
            if b.get('attempt_id',mission.get('attempt_id',1))!=mission.get('attempt_id',1):return fail('El intento cambió. Vuelve a abrir las evidencias antes de evaluar.',409)
            if mission.get('recovery'):
                previous=mission['attempt_history'][-1]['review']
                for phase,values in zip(PHASE_MINUTES,points):
                    if phase not in mission['required_phases'] and values!=previous['points'][list(PHASE_MINUTES).index(phase)]:
                        return fail('Conserva la calificación de las fases ya logradas; evalúa solo las fases de recuperación.',409)
            content=load_content(row['content'],row['position']);content['title']=row['title']
            plan=city_experience_content(content,b['module_id'],b['user_id'],mission.get('attempt_id',1),experience.get('quiz',{}).get('question_order'))
            migrate_awards(experience,plan,b['module_id'])
            result=apply_review(experience,{'points':points,'safety_approved':safety_approved,'competencies_approved':competencies_approved,
                                          'critical_phases':critical_phases,'feedback':feedback.strip(),'teacher_id':session['uid']},plan,b['module_id'])
            state['city_experience']=experience
            con.execute('UPDATE progress SET state=?,updated=CURRENT_TIMESTAMP WHERE user_id=? AND module_id=?',
                        (json.dumps(state,ensure_ascii=False),b['user_id'],b['module_id']))
        return jsonify(ok=True,reward=result)
    @app.post('/api/teacher/city-alert')
    @require('teacher')
    def acknowledge_city_alert():
        b=body()
        if not text_valid(b.get('intervention'),20):return fail('Registra la intervención pedagógica y el seguimiento acordado (mínimo 20 caracteres).')
        with db() as con:
            con.execute('BEGIN IMMEDIATE')
            row=con.execute('SELECT state FROM progress WHERE user_id=? AND module_id=?',(b.get('user_id'),b.get('module_id'))).fetchone()
            if not row:return fail('Progreso inexistente.',404)
            state=json.loads(row['state']);alert=(state.get('city_experience') or {}).get('teacher_alert')
            if not alert or alert.get('id')!=b.get('alert_id') or alert.get('status')!='open':return fail('La alerta ya cambió. Actualiza el seguimiento.',409)
            alert.update(status='acknowledged',intervention=b['intervention'].strip(),teacher_id=session['uid'],acknowledged_at=datetime.now(timezone.utc).isoformat())
            con.execute('UPDATE progress SET state=?,updated=CURRENT_TIMESTAMP WHERE user_id=? AND module_id=?',(json.dumps(state,ensure_ascii=False),b['user_id'],b['module_id']))
        return jsonify(ok=True,alert=alert)
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
