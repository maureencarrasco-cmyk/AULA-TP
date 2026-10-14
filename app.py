from pathlib import Path
import csv, io, json, os, secrets, sqlite3, hashlib
from functools import wraps, lru_cache
from flask import Flask, request, session, jsonify, send_from_directory, Response
from werkzeug.security import generate_password_hash, check_password_hash
from content import DEFAULT_CONTENT, STATIONS, STEPS
from catalog import upgrade_catalog, EXTENDED_MODULES
from curriculum import MODULE_TITLES, OFFICIAL
from pedagogy import enrich, strip_for_student, validate_experience, hint_for, summarize_response, exam_profile, course_planning, module_plan, publication_gaps
from level_audit import collect_oa, module_year
from encargos import encargos_for

ROOT=Path(__file__).resolve().parent

def visual_resource_index(content):
    from urllib.parse import urlsplit, parse_qs
    found={}
    types={'.png':'Imagen','.jpg':'Imagen','.jpeg':'Imagen','.webp':'Imagen','.avif':'Imagen','.gif':'Imagen','.svg':'Ilustración','.mp4':'Video','.webm':'Video','.glb':'Modelo 3D','.gltf':'Modelo 3D','.obj':'Modelo 3D','.stl':'Modelo 3D','.pdf':'Documento'}
    def walk(value,path='',depth=0):
        if depth>20:return
        if isinstance(value,dict):
            for key,item in value.items():
                location=path+'.'+str(key) if path else str(key)
                if isinstance(item,str) and str(key).lower() in ('src','url','image','photo','video','model','pdf','asset','file','illustration','path','poster','thumbnail'):
                    try:parsed=urlsplit(item)
                    except ValueError:continue
                    kind=types.get(Path(parsed.path).suffix.lower())
                    if parsed.hostname in ('youtube.com','www.youtube.com','youtu.be') and (parsed.path.startswith('/embed/') or (parsed.path=='/watch' and parse_qs(parsed.query).get('v')) or (parsed.hostname=='youtu.be' and len(parsed.path)>1)):kind='Video externo'
                    safe=not any(ch.isspace() for ch in item) and not parsed.username and not parsed.password
                    if kind and safe and (item.startswith('/static/') or (parsed.scheme=='https' and parsed.hostname)):
                        found.setdefault(item,{'url':item,'type':kind,'locations':[]})['locations'].append(location)
                walk(item,location,depth+1)
        elif isinstance(value,list):
            for index,item in enumerate(value):walk(item,path+'.'+str(index),depth+1)
    walk(content)
    return list(found.values())

def curriculum_references(content):
    fields=('ae_code','criterion','activity','practiced_in','exam_item','page','pdf','source_status')
    entries=content.get('traceability') or []
    if not isinstance(entries,list):entries=[]
    return [{key:item.get(key) for key in fields if key in item} for item in entries if isinstance(item,dict)]

@lru_cache(maxsize=1)
def documentary_index(path,modified):
    try:
        report=json.loads(Path(path).read_text(encoding='utf-8'))
        return {(item['course'],item['module']):item for item in report['modules']}
    except (OSError,ValueError,KeyError,TypeError):return {}

@lru_cache(maxsize=64)
def documentary_file_hash(path,modified):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

@lru_cache(maxsize=1)
def documentary_table_index(path,modified):
    try:
        report=json.loads(Path(path).read_text(encoding='utf-8'))
        index={}
        for item in report['cases']:index.setdefault((item['course'],item['module']),[]).append(item)
        return index
    except (OSError,ValueError,KeyError,TypeError):return {}

def documentary_metadata(raw,course,title):
    path=ROOT/'reports'/'auditoria-implementacion-20261013'/'cotejo-pdf.json'
    if not path.is_file():return None
    item=documentary_index(str(path),path.stat().st_mtime_ns).get((course,title))
    if not item or item.get('content_sha256')!=hashlib.sha256(raw.encode('utf-8')).hexdigest():return None
    source=(ROOT/str(item.get('pdf') or '')).resolve()
    if not source.is_relative_to(ROOT.resolve()) or not source.is_file():return None
    if documentary_file_hash(str(source),source.stat().st_mtime_ns)!=item.get('sha256'):return None
    table_path=path.parent/'revision-tablas-pdf.json'
    references=documentary_table_index(str(table_path),table_path.stat().st_mtime_ns).get((course,title),[]) if table_path.is_file() else []
    return {'source':item['pdf'],'source_sha256':item['sha256'],
            'checks':[{key:check.get(key) for key in ('type','ae','text','status','pdf_pages')} for check in item['comparisons']],
            'references':references,
            'limit':'Coincidencia textual en fuente local cotejada; no certificación curricular ni pedagógica.'}

def ensure_module_catalog_table(con):
    con.execute('''CREATE TABLE IF NOT EXISTS module_catalog(
        module_id INTEGER PRIMARY KEY,
        content_len INTEGER NOT NULL,
        ae_count INTEGER NOT NULL,
        ae_json TEXT NOT NULL,
        oa_json TEXT NOT NULL,
        encargos_count INTEGER NOT NULL,
        encargos_hours REAL NOT NULL,
        official_hp INTEGER,
        scope TEXT,
        pdf TEXT,
        question_count INTEGER NOT NULL,
        year TEXT,
        draft INTEGER NOT NULL DEFAULT 0
    )''')
    cols={row[1] for row in con.execute('PRAGMA table_info(module_catalog)')}
    if 'year' not in cols:
        con.execute('ALTER TABLE module_catalog ADD COLUMN year TEXT')
    if 'draft' not in cols:
        con.execute('ALTER TABLE module_catalog ADD COLUMN draft INTEGER NOT NULL DEFAULT 0')

def catalog_payload(content, position):
    if isinstance(content, str):
        content=json.loads(content or '{}')
    content=content or {}
    source=content.get('specialty_source') or content.get('official_source') or {}
    aes_raw=content.get('aes') if isinstance(content.get('aes'), list) else []
    aes=[]
    for item in aes_raw[:8]:
        if not isinstance(item, dict):
            continue
        criteria=[]
        for raw in (item.get('criteria') or [])[:6]:
            text=raw if isinstance(raw, str) else (raw.get('text') or raw.get('title') or '') if isinstance(raw, dict) else ''
            text=str(text).strip()
            if text:
                criteria.append(text[:240])
        aes.append({
            'title':str(item.get('title') or '')[:240],
            'code':str(item.get('official_code') or item.get('code') or ''),
            'criteria':criteria,
            'description':str(item.get('description') or '').strip()[:280],
        })
    oa=collect_oa(content)
    pack=content.get('encargos') if isinstance(content.get('encargos'), dict) else {}
    if not source and not pack.get('count'):
        pack=encargos_for(position) or {}
    questions=content.get('questions') if isinstance(content.get('questions'), list) else []
    question_count=len(questions)
    plan=content.get('evaluation_plan') if isinstance(content.get('evaluation_plan'), dict) else {}
    if plan.get('question_count'):
        question_count=min(question_count, int(plan['question_count']))
    hp=source.get('official_hp')
    return {
        'ae_count':len(aes_raw),
        'ae_json':json.dumps(aes, ensure_ascii=False),
        'oa_json':json.dumps(oa, ensure_ascii=False),
        'encargos_count':int(pack.get('count') or 0),
        'encargos_hours':float(pack.get('hours') or 0),
        'official_hp':int(hp) if isinstance(hp, (int, float)) else None,
        'scope':str(source.get('scope') or ''),
        'pdf':str(source.get('pdf') or ''),
        'question_count':question_count,
        'year':module_year(content, position) or str(content.get('route_year') or ''),
        'draft':1 if content.get('route_draft') else 0,
    }

def upsert_module_catalog(con, module_id, position, content, content_len=None):
    ensure_module_catalog_table(con)
    raw=content if isinstance(content, str) else json.dumps(content or {}, ensure_ascii=False)
    fields=catalog_payload(raw, position)
    con.execute('''INSERT INTO module_catalog(module_id,content_len,ae_count,ae_json,oa_json,encargos_count,encargos_hours,official_hp,scope,pdf,question_count,year,draft)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(module_id) DO UPDATE SET content_len=excluded.content_len,ae_count=excluded.ae_count,ae_json=excluded.ae_json,oa_json=excluded.oa_json,
        encargos_count=excluded.encargos_count,encargos_hours=excluded.encargos_hours,official_hp=excluded.official_hp,scope=excluded.scope,pdf=excluded.pdf,question_count=excluded.question_count,
        year=excluded.year,draft=excluded.draft''',
        (module_id, content_len if content_len is not None else len(raw), fields['ae_count'], fields['ae_json'], fields['oa_json'], fields['encargos_count'], fields['encargos_hours'], fields['official_hp'], fields['scope'], fields['pdf'], fields['question_count'], fields['year'], fields['draft']))

def create_app(test_config=None):
    app=Flask(__name__,static_folder='static')
    data=Path(os.environ.get('AULATP_DATA',str(ROOT/'data')));data.mkdir(parents=True,exist_ok=True)
    secret=data/'.secret'
    if not secret.exists():
        secret.write_text(secrets.token_hex(32));secret.chmod(0o600)
    app.config.update(SECRET_KEY=secret.read_text(),DATABASE=str(data/'aulatp.sqlite3'),MAX_CONTENT_LENGTH=2*1024*1024,SESSION_COOKIE_HTTPONLY=True,SESSION_COOKIE_SAMESITE='Strict')
    if test_config:app.config.update(test_config)
    def db():
        con=sqlite3.connect(app.config['DATABASE']);con.row_factory=sqlite3.Row;con.execute('PRAGMA foreign_keys=ON');return con
    with db() as con:
        con.executescript('''
        CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('student','teacher')));
        CREATE TABLE IF NOT EXISTS courses(id INTEGER PRIMARY KEY,title TEXT NOT NULL,specialty TEXT NOT NULL,level TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS modules(id INTEGER PRIMARY KEY,course_id INTEGER REFERENCES courses(id),title TEXT NOT NULL,position INTEGER NOT NULL,published INTEGER DEFAULT 0,content TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS enrollments(user_id INTEGER REFERENCES users(id),course_id INTEGER REFERENCES courses(id),PRIMARY KEY(user_id,course_id));
        CREATE TABLE IF NOT EXISTS progress(user_id INTEGER REFERENCES users(id),module_id INTEGER REFERENCES modules(id),state TEXT NOT NULL,updated TEXT DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(user_id,module_id));
        CREATE TABLE IF NOT EXISTS content_incidents(id INTEGER PRIMARY KEY,user_id INTEGER REFERENCES users(id),module_id INTEGER REFERENCES modules(id),station INTEGER,claim TEXT NOT NULL,note TEXT NOT NULL,created TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS specialist_reviews(id INTEGER PRIMARY KEY,module_id INTEGER REFERENCES modules(id),teacher_id INTEGER REFERENCES users(id),verdict TEXT NOT NULL,note TEXT NOT NULL,created TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS teacher_plans(id INTEGER PRIMARY KEY,teacher_id INTEGER REFERENCES users(id),module_id INTEGER REFERENCES modules(id),version INTEGER NOT NULL,payload TEXT NOT NULL,created TEXT DEFAULT CURRENT_TIMESTAMP,UNIQUE(teacher_id,module_id,version));
        CREATE TABLE IF NOT EXISTS teacher_supports(id INTEGER PRIMARY KEY,teacher_id INTEGER REFERENCES users(id),user_id INTEGER REFERENCES users(id),module_id INTEGER REFERENCES modules(id),payload TEXT NOT NULL,created TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS teacher_courses(teacher_id INTEGER REFERENCES users(id),course_id INTEGER REFERENCES courses(id),PRIMARY KEY(teacher_id,course_id));
        CREATE TABLE IF NOT EXISTS teacher_snapshots(id INTEGER PRIMARY KEY,teacher_id INTEGER REFERENCES users(id),course_id INTEGER REFERENCES courses(id),payload TEXT NOT NULL,created TEXT DEFAULT CURRENT_TIMESTAMP);
        ''')
        if not con.execute('SELECT 1 FROM users').fetchone():
            for u,n,p,r in [('estudiante','Estudiante Demo','AulaTP2026!','student'),('docente','Docente Demo','DocenteTP2026!','teacher')]:
                con.execute('INSERT INTO users(username,name,password,role) VALUES(?,?,?,?)',(u,n,generate_password_hash(p),r))
            con.execute('INSERT INTO courses VALUES(1,?,?,?)',('Refrigeración y Climatización','Refrigeración y climatización','3° medio'))
            for n in range(1, 5):
                payload = DEFAULT_CONTENT if n == 1 else EXTENDED_MODULES[n]
                con.execute('INSERT INTO modules VALUES(?,?,?,?,?,?)',(n,1,MODULE_TITLES[n],n,1,json.dumps(payload,ensure_ascii=False)))
            con.execute('INSERT INTO enrollments VALUES(1,1)')
            con.execute('INSERT INTO teacher_courses VALUES(2,1)')
        upgrade_catalog(con)
    def fail(message,status=400):return jsonify(error=message),status
    def body():return request.get_json(silent=True) or {}
    def user():
        with db() as con:return con.execute('SELECT id,username,name,role FROM users WHERE id=?',(session.get('uid'),)).fetchone()
    def portal_teacher():
        u=user()
        return u if u and u['role']=='teacher' else None
    def actor():
        # El portal docente no comparte la sesión del campus de cursos.
        if request.headers.get('X-Aula-Portal')=='docente' or request.path.startswith('/api/teacher'):
            teacher=portal_teacher()
            if teacher:return teacher
        return user()
    def subject_id():
        u=actor()
        return u['id'] if u else session.get('uid')
    def teacher_course_ids():
        u=actor()
        if not u or u['role']!='teacher':return set()
        with db() as con:
            return {row[0] for row in con.execute('SELECT course_id FROM teacher_courses WHERE teacher_id=?',(u['id'],))}
    def teacher_module_allowed(mid):
        with db() as con:
            row=con.execute('SELECT course_id FROM modules WHERE id=?',(mid,)).fetchone()
        return bool(row and row[0] in teacher_course_ids())
    def require(role=None):
        def deco(fn):
            @wraps(fn)
            def run(*a,**kw):
                u=actor()
                if not u:return fail('Inicia sesión para continuar.',401)
                if role and u['role']!=role:return fail('Esta acción requiere el rol '+('docente' if role=='teacher' else 'estudiante')+'.',403)
                if role=='teacher' and 'mid' in kw and not teacher_module_allowed(kw['mid']):return fail('No tienes asignado este curso.',403)
                if role=='teacher' and request.method not in ('GET','HEAD','OPTIONS'):
                    b=body()
                    if any(key in b and type(b[key])!=int for key in ('module_id','course_id')):return fail('Identificador de curso o módulo inválido.',400)
                    if 'module_id' in b and not teacher_module_allowed(b['module_id']):return fail('No tienes asignado este curso.',403)
                    if 'course_id' in b and b['course_id'] not in teacher_course_ids():return fail('No tienes asignado este curso.',403)
                return fn(*a,**kw)
            return run
        return deco
    @app.before_request
    def csrf():
        if request.path.startswith('/api/') and request.method not in ('GET','HEAD','OPTIONS'):
            if request.is_json and not isinstance(request.get_json(silent=True),dict):return fail('Envía un objeto de datos válido.',400)
            if not session.get('csrf') or not secrets.compare_digest(request.headers.get('X-CSRF-Token',''),session['csrf']):return fail('La sesión cambió. Recarga la página.',403)
    @app.after_request
    def headers(response):
        response.headers['X-Content-Type-Options']='nosniff';response.headers['X-Frame-Options']='DENY'
        response.headers['Content-Security-Policy']="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        if request.path.startswith('/api/'):response.headers['Cache-Control']='no-store'
        return response
    def empty():return {'context':'','ae':{},'cases':{},'scene':None,'exam':None,'draft':{},'reflection':'','plan':'','closed':False,'explore':{},'ae_meta':{},'trace':[],'oficio':{},'encargos':{}}
    def load_content(raw, position=1):
        c=json.loads(raw) if isinstance(raw,str) else dict(raw or {})
        if c.get('aes'):c=enrich(c, position)
        return c
    def trace(s, kind, **extra):
        s.setdefault('trace', []).append(dict(kind=kind, estado='COMPLETADO', **extra))
        if len(s['trace'])>400:s['trace']=s['trace'][-400:]
    def getstate(con,mid):
        row=con.execute('SELECT state FROM progress WHERE user_id=? AND module_id=?',(subject_id(),mid)).fetchone()
        s=json.loads(row['state']) if row else empty()
        s.setdefault('oficio',{});s.setdefault('encargos',{})
        return s
    def putstate(con,mid,state):
        con.execute('INSERT INTO progress(user_id,module_id,state) VALUES(?,?,?) ON CONFLICT(user_id,module_id) DO UPDATE SET state=excluded.state,updated=CURRENT_TIMESTAMP',(subject_id(),mid,json.dumps(state,ensure_ascii=False)))
    def completed(s, content=None):
        ae_count=len((content or {}).get('aes') or []) if isinstance(content,dict) else 3
        expected_steps=max(1,ae_count)*6
        s=s if isinstance(s,dict) else {}
        ae=s.get('ae') or {}
        cases=s.get('cases') or {}
        return [bool(s.get('context')),isinstance(ae,(dict,list)) and len(ae)==expected_steps,isinstance(cases,(dict,list)) and len(cases)==15 and bool(s.get('scene')),bool(s.get('exam')),bool(s.get('closed'))]
    def accessible(mid):
        with db() as con:
            m=con.execute('SELECT * FROM modules WHERE id=?',(mid,)).fetchone();u=actor()
            if not m:return None,fail('Módulo inexistente.',404)
            if u['role']=='teacher' and not teacher_module_allowed(mid):return None,fail('No tienes asignado este curso.',403)
            if u['role']=='student':
                if not m['published']:return None,fail('El módulo está en preparación.',403)
                if not con.execute('SELECT 1 FROM enrollments WHERE user_id=? AND course_id=?',(u['id'],m['course_id'])).fetchone():return None,fail('No tienes matrícula en este curso.',403)
            return dict(m),None
    def text_valid(v,n=20):return isinstance(v,str) and n<=len(v.strip())<=10000
    def public_ae(a):
        a=a or {}
        criteria=[]
        for item in (a.get('criteria') or [])[:8]:
            if isinstance(item,str) and item.strip():criteria.append(item.strip())
            elif isinstance(item,dict):
                text=item.get('text') or item.get('title') or ''
                if text.strip():criteria.append(text.strip())
        return {'title':a.get('title') or '','code':a.get('official_code') or a.get('code') or '','criteria':criteria}
    def public_oa(raw):
        if isinstance(raw,str):return [raw.strip()] if raw.strip() else []
        out=[]
        for item in raw or []:
            if isinstance(item,str) and item.strip():out.append(item.strip())
            elif isinstance(item,dict):
                code=(item.get('code') or '').strip()
                text=(item.get('text') or item.get('title') or '').strip()
                line=f'{code}. {text}' if code and text else (text or code)
                if line:out.append(line)
            if len(out)>=8:break
        return out
    def send_index():
        r=send_from_directory(app.static_folder,'index.html')
        r.headers['Cache-Control']='no-store'
        return r
    @app.get('/')
    def index():
        return send_index()
    @app.get('/portal-docente')
    @app.get('/portal-docente/')
    @app.get('/portal-docente/<section>')
    def portal_docente_page(section=None):
        r=send_from_directory(app.static_folder,'portal-docente.html')
        r.headers['Cache-Control']='no-store'
        return r
    @app.get('/api/session')
    def me():
        session.setdefault('csrf',secrets.token_hex(24));u=user()
        return jsonify(user=dict(u) if u else None,csrf=session['csrf'])
    @app.get('/api/portal-docente/enter')
    def portal_docente_enter():
        session.pop('teacher_uid',None)
        u=user()
        session.setdefault('csrf',secrets.token_hex(24))
        if u and u['role']=='teacher':
            return jsonify(user=dict(u),csrf=session['csrf'],portal='docente',mode='real',environment='preview' if os.environ.get('AULATP_PREVIEW')=='1' else 'production')
        return jsonify(user={'name':'Demostración','role':'demo'},csrf=session['csrf'],portal='docente',mode='demo',environment='preview' if os.environ.get('AULATP_PREVIEW')=='1' else 'production')
    @app.get('/api/portal-docente/catalog')
    def portal_docente_catalog():
        # Public curriculum metadata only; never include users or progress.
        with db() as con:
            courses=[]
            ensure_module_catalog_table(con)
            catalog_courses=con.execute('SELECT id,title FROM courses ORDER BY title').fetchall()
            raw_id=request.args.get('course','')
            selected_id=int(raw_id) if raw_id.isdigit() else None
            if not any(course['id']==selected_id for course in catalog_courses):selected_id=catalog_courses[0]['id'] if catalog_courses else None
            for course in catalog_courses:
                item=dict(course);item['modules']=[]
                if course['id']!=selected_id:
                    courses.append(item)
                    continue
                for module in con.execute('SELECT id,title,position,content FROM modules WHERE course_id=? AND published=1 ORDER BY position,id',(course['id'],)):
                    content=json.loads(module['content'] or '{}')
                    source=content.get('official_source') or {}
                    if not isinstance(source,dict):source={}
                    catalog=con.execute('SELECT * FROM module_catalog WHERE module_id=?',(module['id'],)).fetchone()
                    official=OFFICIAL.get(module['position'],{}) if course['title']=='Refrigeración y Climatización' else {}
                    aes=json.loads(catalog['ae_json'] or '[]') if catalog else content.get('aes',[])
                    oa=json.loads(catalog['oa_json'] or '[]') if catalog else public_oa(content.get('oa',[]))
                    item['modules'].append({'id':module['id'],'title':module['title'],'position':module['position'],
                        'aes':[public_ae(a) for a in aes],
                        'oa':oa or public_oa(source.get('oa',[])) or public_oa(official.get('oa',[])),
                        'official_hp':catalog['official_hp'] if catalog else source.get('official_hp',content.get('official_hp')), 'year':catalog['year'] if catalog else content.get('year'),
                        'pdf':catalog['pdf'] if catalog else content.get('pdf'), 'resources':visual_resource_index(content),
                        'curricular_references':curriculum_references(content),
                        'source_url':(content.get('curriculum') or {}).get('url') if isinstance(content.get('curriculum'),dict) else None,
                        'documentary':documentary_metadata(module['content'],course['title'],module['title'])})
                courses.append(item)
        return jsonify(courses)
    @app.post('/api/login')
    def login():
        b=body()
        with db() as con:u=con.execute('SELECT * FROM users WHERE username=?',(str(b.get('username','')),)).fetchone()
        if not u or not check_password_hash(u['password'],str(b.get('password',''))):return fail('Usuario o contraseña incorrectos.',401)
        session.clear();session['uid']=u['id'];session['csrf']=secrets.token_hex(24)
        return me()
    @app.post('/api/logout')
    def logout():session.clear();return jsonify(ok=True)
    @app.get('/api/courses')
    @require()
    def courses():
        with db() as con:
            ensure_module_catalog_table(con)
            u=actor();rows=con.execute('SELECT * FROM courses ORDER BY id').fetchall() if u['role']=='teacher' else con.execute('SELECT c.* FROM courses c JOIN enrollments e ON e.course_id=c.id WHERE e.user_id=? ORDER BY c.id',(u['id'],)).fetchall()
            if u['role']=='teacher':rows=[row for row in rows if row['id'] in teacher_course_ids()]
            result=[]
            for c in rows:
                item=dict(c);item['modules']=[]
                modules=con.execute('''SELECT m.id,m.title,m.position,m.published,cat.ae_count,cat.ae_json,cat.oa_json,cat.encargos_count,cat.encargos_hours,cat.official_hp,cat.scope,cat.pdf,cat.year,cat.draft,p.state
                    FROM modules m LEFT JOIN module_catalog cat ON cat.module_id=m.id
                    LEFT JOIN progress p ON p.module_id=m.id AND p.user_id=?
                    WHERE m.course_id=? ORDER BY m.position,m.id''',(subject_id(),c['id'])).fetchall()
                for m in modules:
                    if m['ae_count'] is None:
                        raw=con.execute('SELECT content FROM modules WHERE id=?',(m['id'],)).fetchone()
                        upsert_module_catalog(con,m['id'],m['position'],(raw['content'] if raw else '{}'))
                        m=con.execute('''SELECT m.id,m.title,m.position,m.published,cat.ae_count,cat.ae_json,cat.oa_json,cat.encargos_count,cat.encargos_hours,cat.official_hp,cat.scope,cat.pdf,cat.year,cat.draft,p.state
                            FROM modules m LEFT JOIN module_catalog cat ON cat.module_id=m.id
                            LEFT JOIN progress p ON p.module_id=m.id AND p.user_id=?
                            WHERE m.id=?''',(subject_id(),m['id'])).fetchone()
                    state=json.loads(m['state']) if m['state'] else empty()
                    done=completed(state,{'aes':[None]*(m['ae_count'] or 0)})
                    mod={'id':m['id'],'title':m['title'],'position':m['position'],'published':m['published'],'completed':done,'percent':round(sum(done)*20),'year':m['year'] or '','draft':bool(m['draft'])}
                    exam=state.get('exam')
                    selection_max=(exam or {}).get('max_score') or {1:5,2:5,3:7,4:8}.get(m['position'],5)
                    mod['evaluation_scores']={
                        'selection':round(exam.get('score',0)/selection_max*25,1) if exam else None,
                        'development':(exam.get('review') or {}).get('score') if exam else None,
                        'max_each':25,
                    }
                    if m['official_hp']:
                        mod['official_hp']=m['official_hp']
                    if m['scope']:
                        item.setdefault('scope',m['scope'])
                    if m['pdf']:
                        item.setdefault('pdf',m['pdf'])
                    if u['role']=='teacher':
                        raw=con.execute('SELECT content FROM modules WHERE id=?',(m['id'],)).fetchone()
                        raw_content=json.loads(raw['content'] or '{}')
                        mod['resources']=visual_resource_index(raw_content)
                        mod['curricular_references']=curriculum_references(raw_content)
                        mod['source_url']=(raw_content.get('curriculum') or {}).get('url') if isinstance(raw_content.get('curriculum'),dict) else None
                        mod['documentary']=documentary_metadata(raw['content'],item['title'],m['title'])
                        aes=json.loads(m['ae_json'] or '[]')
                        mod['aes']=[{'title':a.get('title') or '','code':a.get('code') or '','criteria':a.get('criteria') or []} for a in aes]
                        oa=json.loads(m['oa_json'] or '[]')
                        if not oa and not m['scope'] and item['title']=='Refrigeración y Climatización':
                            oa=public_oa((OFFICIAL.get(m['position']) or {}).get('oa'))
                        mod['oa']=oa
                    source=bool(m['scope'] or m['official_hp'])
                    plan=None if source else module_plan(m['position'])
                    if plan:mod.update(plan)
                    if m['encargos_count']:
                        mod['encargos_count']=m['encargos_count']
                        mod['encargos_hours']=m['encargos_hours']
                    item['modules'].append(mod)
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
        c=load_content(m.pop('content'), m['position']);u=actor()
        active_plan=None
        with db() as con:
            s=getstate(con,mid)
            course=dict(con.execute('SELECT * FROM courses WHERE id=?',(m['course_id'],)).fetchone())
            course['modules']=[]
            ensure_module_catalog_table(con)
            for row in con.execute('''SELECT m.title,m.position,cat.official_hp,cat.scope,cat.pdf
                FROM modules m LEFT JOIN module_catalog cat ON cat.module_id=m.id
                WHERE m.course_id=? ORDER BY m.position,m.id''',(m['course_id'],)):
                base=module_plan(row['position']) or {}
                course['modules'].append({'title':row['title'],'position':row['position'],'official_hp':row['official_hp'] or base.get('official_hp')})
                if row['scope']:
                    course.setdefault('scope',row['scope'])
                if row['pdf']:
                    course.setdefault('pdf',row['pdf'])
            seal=con.execute(
                '''SELECT u.name,s.created,s.note FROM specialist_reviews s
                   JOIN users u ON u.id=s.teacher_id
                   WHERE s.module_id=? AND s.verdict=? ORDER BY s.id DESC LIMIT 1''',
                (mid,'Sello del docente de la especialidad'),
            ).fetchone()
            whole_plan=course_planning(course)
            if whole_plan:
                active_plan=next((p for p in whole_plan['modules'] if p['position']==m['position']),None)
                if active_plan:c['planning']=active_plan
        if u['role']=='student':c=strip_for_student(c)
        m.update(content=c,state=s,completed=completed(s,c),stations=STATIONS,steps=STEPS,planning=active_plan or c.get('planning') or module_plan(m['position']))
        if seal:m['teacher_seal']={'name':seal['name'],'created':seal['created'],'note':seal['note']}
        return jsonify(m)
    @app.post('/api/modules/<int:mid>/content-report')
    @require()
    def content_report(mid):
        m,err=accessible(mid)
        if err:return err
        b=body();note=b.get('note');claim=str(b.get('claim') or 'afirmacion')[:200]
        if not text_valid(note,20):return fail('Describe el error con al menos 20 caracteres.')
        try:station=int(b.get('station') or 0)
        except (TypeError,ValueError):station=0
        with db() as con:
            con.execute(
                'INSERT INTO content_incidents(user_id,module_id,station,claim,note) VALUES(?,?,?,?,?)',
                (subject_id(),mid,station,claim,note.strip()[:2000]),
            )
        return jsonify(ok=True)
    @app.get('/api/progress')
    @require()
    def student_progress():
        with db() as con:
            ensure_module_catalog_table(con)
            u=actor();uid=u['id']
            if u['role']!='student':
                student=con.execute("SELECT id FROM users WHERE role='student' ORDER BY id LIMIT 1").fetchone()
                if not student:return jsonify([])
                uid=student['id']
            for m in con.execute('''SELECT m.id,m.position,m.content FROM modules m
                LEFT JOIN module_catalog cat ON cat.module_id=m.id WHERE cat.module_id IS NULL''').fetchall():
                upsert_module_catalog(con,m['id'],m['position'],m['content'] or '{}')
            rows=con.execute('''SELECT c.id AS course_id,c.title AS course_title,c.specialty,c.level,
                m.id,m.title,m.position,cat.ae_count,cat.ae_json,cat.oa_json,cat.question_count,cat.year,cat.draft,p.state,p.updated
                FROM enrollments e JOIN courses c ON c.id=e.course_id
                JOIN modules m ON m.course_id=c.id
                LEFT JOIN module_catalog cat ON cat.module_id=m.id
                LEFT JOIN progress p ON p.module_id=m.id AND p.user_id=e.user_id
                WHERE e.user_id=? ORDER BY c.id,m.position,m.id''',(uid,)).fetchall()
            result=[]
            for row in rows:
                aes=json.loads(row['ae_json'] or '[]')
                s=json.loads(row['state']) if row['state'] else empty()
                result.append(dict(course_id=row['course_id'],course_title=row['course_title'],specialty=row['specialty'],
                    level=row['level'],id=row['id'],title=row['title'],position=row['position'],
                    aes=[{'label':a.get('title') or f'AE {i+1}','description':a.get('description') or ''} for i,a in enumerate(aes)],
                    oa=json.loads(row['oa_json'] or '[]'),
                    year=row['year'] or '',draft=bool(row['draft']),
                    question_count=row['question_count'] or 0,
                    state=s,completed=completed(s,{'aes':[None]*(row['ae_count'] or 0)}),updated=row['updated']))
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
            if kind=='context':
                if not text_valid(b.get('text')):return fail('Escribe una reflexión de al menos 20 caracteres.')
                s['context']=b['text'].strip()
                observed=b.get('observed')
                if isinstance(observed,list):
                    s['explore']={'observed':[x for x in observed if isinstance(x,str)][:16]}
                trace(s,'context')
            elif kind=='ae':
                if not s['context']:return fail('Completa primero la contextualización.',403)
                a=b.get('ae');step=b.get('step')
                ae_count=len(c.get('aes') or [])
                if type(a)!=int or type(step)!=int or a not in range(ae_count) or step not in range(6):return fail('Etapa inválida.')
                index=a*6+step;key=f'{a}-{step}'
                if index and f'{(index-1)//6}-{(index-1)%6}' not in s['ae']:return fail('Completa la etapa anterior.',403)
                exp=None
                if a<len(c.get('aes',[])):
                    exps=c['aes'][a].get('experiences') or []
                    if step<len(exps):exp=exps[step]
                response=b.get('response') if isinstance(b.get('response'),dict) else None
                meta=s.setdefault('ae_meta',{}).get(key) or {'attempts':0}
                if exp and exp.get('type') not in (None,'reflect') and response:
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
                trace(s,'ae',ae=a,step=step,tipo=(exp or {}).get('type'))
            elif kind=='case':
                expected_steps=len(c.get('aes') or [])*6
                if len(s['ae'])!=expected_steps:return fail('Completa todos los aprendizajes esperados del módulo.',403)
                idx=b.get('index');choice=b.get('choice')
                if type(idx)!=int or idx not in range(15) or type(choice)!=int or choice not in range(2) or not text_valid(b.get('text')):return fail('Selecciona una decisión y justifícala con al menos 20 caracteres.')
                if idx and str(idx-1) not in s['cases']:return fail('Resuelve la situación anterior.',403)
                q=c['cases'][idx]
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
                        'corrections':[{'question':q['question'],'correct':answers[str(i)]==q['answer'],'explanation':q['explanation'],'ae':q.get('ae'),'skill':q.get('skill'),'difficulty':q.get('difficulty'),'image':q.get('image'),'caption':q.get('caption'),'alt':q.get('alt')} for i,q in enumerate(exam_questions)]};s['draft']={}
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
            for r in con.execute('SELECT p.*,u.name,m.title,m.course_id,m.position,c.title AS course_title,m.content AS module_content FROM progress p JOIN users u ON u.id=p.user_id JOIN modules m ON m.id=p.module_id JOIN courses c ON c.id=m.course_id JOIN enrollments e ON e.user_id=p.user_id AND e.course_id=m.course_id'):
                x=dict(r);module_content=json.loads(x.pop('module_content'));x['rubric']=module_content.get('rubric',DEFAULT_CONTENT['rubric']);x['state']=json.loads(x['state']);x['completed']=completed(x['state'],module_content);x['percent']=sum(x['completed'])*20;records.append(x)
            enrollments=[dict(r) for r in con.execute('SELECT * FROM enrollments')]
            incidents=[dict(r) for r in con.execute(
                'SELECT i.id,i.module_id,i.station,i.claim,i.note,i.created,u.name,m.title FROM content_incidents i JOIN users u ON u.id=i.user_id JOIN modules m ON m.id=i.module_id JOIN enrollments e ON e.user_id=i.user_id AND e.course_id=m.course_id ORDER BY i.id DESC LIMIT 200'
            )]
            reviews=[dict(r) for r in con.execute(
                '''SELECT s.id,s.module_id,s.verdict,s.note,s.created,u.name,m.title,c.title AS course
                   FROM specialist_reviews s JOIN users u ON u.id=s.teacher_id
                   JOIN modules m ON m.id=s.module_id JOIN courses c ON c.id=m.course_id
                   ORDER BY s.id DESC LIMIT 2000'''
            )]
            health=[]
            for r in con.execute('SELECT c.title AS course, m.id, m.title, m.content FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.published=1 ORDER BY c.id,m.position,m.id'):
                try:content=json.loads(r['content'] or '{}')
                except Exception:content={}
                exp=content.get('technical_expedition') or {}
                gov=content.get('technical_validation') or {}
                health.append({
                    'module_id':r['id'],'course':r['course'],'title':r['title'],
                    'status':gov.get('status') or 'sin marca',
                    'protocol_complete':bool(exp.get('protocol_complete')),
                    'seal':gov.get('internal_seal'),
                    'media':exp.get('media') or {},
                    'debt':(exp.get('debt') or [])[:3],
                })
        kpi={
            'avance_porcentaje':{
                'pregunta':'¿Cuál es el avance de cada estudiante en el módulo?',
                'formula':'estaciones_completadas / 5 × 100',
                'fuente':'progress.state y la misma función completed() del portal estudiante',
                'periodo':'estado actual; no hay serie histórica comparable',
                'poblacion':'estudiantes con al menos un registro de progreso',
            }
        }
        allowed=teacher_course_ids()
        with db() as con:
            plans=[dict(row) for row in con.execute('SELECT * FROM teacher_plans WHERE teacher_id=? ORDER BY id DESC',(actor()['id'],))]
            supports=[dict(row) for row in con.execute('SELECT * FROM teacher_supports WHERE teacher_id=? ORDER BY id DESC',(actor()['id'],))]
            snapshots=[dict(row) for row in con.execute('SELECT * FROM teacher_snapshots WHERE teacher_id=? ORDER BY id DESC',(actor()['id'],))]
        for row in plans+supports:row['payload']=json.loads(row['payload'])
        with db() as con:
            module_courses={row['id']:row['course_id'] for row in con.execute('SELECT id,course_id FROM modules') if row['course_id'] in allowed}
            module_ids=set(module_courses)
        enrollments=[row for row in enrollments if row['course_id'] in allowed]
        enrolled_pairs={(row['user_id'],row['course_id']) for row in enrollments}
        student_ids={row['user_id'] for row in enrollments}
        users=[row for row in users if row['id'] in student_ids]
        records=[row for row in records if row['course_id'] in allowed and row['user_id'] in student_ids]
        incidents=[row for row in incidents if row['module_id'] in module_ids]
        reviews=[row for row in reviews if row['module_id'] in module_ids]
        health=[row for row in health if row['module_id'] in module_ids]
        plans=[row for row in plans if row['module_id'] in module_ids]
        supports=[row for row in supports if (row['user_id'],module_courses.get(row['module_id'])) in enrolled_pairs]
        snapshots=[row for row in snapshots if row['course_id'] in allowed]
        for row in snapshots:row['payload']=json.loads(row['payload'])
        return jsonify(users=users,records=records,enrollments=enrollments,incidents=incidents,specialist_reviews=reviews,content_health=health,kpi=kpi,plans=plans,supports=supports,snapshots=snapshots)
    @app.post('/api/teacher/snapshots')
    @require('teacher')
    def save_teacher_snapshot():
        cid=body().get('course_id')
        if type(cid)!=int or cid not in teacher_course_ids():return fail('Curso no asignado.',403)
        data=teacher().get_json()
        records=[row for row in data['records'] if row['course_id']==cid]
        population={row['user_id'] for row in data['enrollments'] if row['course_id']==cid}
        payload={'definition':'record-weighted-digital-progress-v1','population':len(population),'records':len(records),
                 'mean_progress':sum(row['percent'] for row in records)/len(records) if records else None,
                 'modules':sorted({row['module_id'] for row in records})}
        with db() as con:
            cursor=con.execute('INSERT INTO teacher_snapshots(teacher_id,course_id,payload) VALUES(?,?,?)',(actor()['id'],cid,json.dumps(payload)))
        return jsonify(ok=True,id=cursor.lastrowid)
    def teacher_document(fields):
        from datetime import date
        b=body();payload={}
        for field in fields:
            value=b.get(field,'')
            if not isinstance(value,str) or len(value)>5000:return None,fail('Campo inválido: '+field,400)
            payload[field]=value.strip()
        for field in ('start_date','end_date','review_date'):
            if payload.get(field):
                try:date.fromisoformat(payload[field])
                except ValueError:return None,fail('Fecha inválida.',400)
        if payload.get('start_date') and payload.get('end_date') and payload['start_date']>payload['end_date']:
            return None,fail('El término no puede preceder al inicio.',400)
        return payload,None
    @app.post('/api/teacher/plans')
    @require('teacher')
    def save_teacher_plan():
        b=body();mid=b.get('module_id');expected=b.get('version')
        if type(mid)!=int or type(expected)!=int or expected<0:return fail('Módulo y versión requeridos.',400)
        payload,error=teacher_document(('objective','sequence','instrument','resources','adaptations','start_date','end_date','status'))
        if error:return error
        if not payload['sequence']:return fail('Indica la secuencia de enseñanza.',400)
        if payload['status'] not in ('draft','planned','executed'):return fail('Estado de planificación inválido.',400)
        with db() as con:
            if not con.execute('SELECT 1 FROM modules WHERE id=?',(mid,)).fetchone():return fail('Módulo inexistente.',404)
            con.execute('BEGIN IMMEDIATE')
            current=con.execute('SELECT COALESCE(MAX(version),0) FROM teacher_plans WHERE teacher_id=? AND module_id=?',(actor()['id'],mid)).fetchone()[0]
            if current!=expected:return fail('La planificación cambió. Recarga antes de guardar.',409)
            cursor=con.execute('INSERT INTO teacher_plans(teacher_id,module_id,version,payload) VALUES(?,?,?,?)',(actor()['id'],mid,current+1,json.dumps(payload,ensure_ascii=False)))
            return jsonify(ok=True,id=cursor.lastrowid,version=current+1)
    @app.post('/api/teacher/supports')
    @require('teacher')
    def save_teacher_support():
        b=body();mid=b.get('module_id');uid=b.get('user_id')
        if type(mid)!=int or type(uid)!=int:return fail('Estudiante y módulo requeridos.',400)
        payload,error=teacher_document(('criterion','evidence','action','feedback','review_date','status'))
        if error:return error
        if not payload['action'] or not payload['evidence']:return fail('Indica evidencia y acción de apoyo.',400)
        if payload['status'] not in ('open','followup','closed'):return fail('Estado de apoyo inválido.',400)
        if payload['status']=='closed' and not payload['feedback']:return fail('Documenta la retroalimentación o nueva evidencia para cerrar el apoyo.',400)
        with db() as con:
            enrolled=con.execute("SELECT 1 FROM enrollments e JOIN modules m ON m.course_id=e.course_id JOIN users u ON u.id=e.user_id WHERE e.user_id=? AND m.id=? AND u.role='student'",(uid,mid)).fetchone()
            if not enrolled:return fail('El estudiante no está matriculado en este curso.',403)
            cursor=con.execute('INSERT INTO teacher_supports(teacher_id,user_id,module_id,payload) VALUES(?,?,?,?)',(actor()['id'],uid,mid,json.dumps(payload,ensure_ascii=False)))
            return jsonify(ok=True,id=cursor.lastrowid)
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
            con.execute('INSERT INTO teacher_courses(teacher_id,course_id) VALUES(?,?)',(actor()['id'],cur.lastrowid))
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
                if not isinstance(p.get('values'),list) or len(p['values'])!=3 or any(type(v) not in (int,float) or not -1000<=v<=1000 for v in p['values']):return False
            if p['type']=='measurement' and (not isinstance(p.get('reference'),list) or len(p['reference'])!=2 or any(type(v) not in (int,float) or not -1000<=v<=1000 for v in p['reference']) or p['reference'][0]>p['reference'][1]):return False
            if p['type']=='network' and (type(p.get('reserve')) not in (int,float) or not 0<=p['reserve']<=100):return False
            if p['type']=='equipment' and any(type(p.get(k)) not in (int,float) or not 0<=p[k]<=1000 for k in ('available','required')):return False
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
            if not text_valid(str(q.get('image') or ''),3):return False
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
                enrich(c, existing['position'] or 1)
                gaps=publication_gaps(c)
                if gaps:return fail(gaps[0]+' No publiques el módulo con ese hueco.')
            if con.execute('SELECT 1 FROM progress WHERE module_id=?',(mid,)).fetchone() and json.loads(existing['content'])!=c:return fail('Este módulo tiene evidencias. Crea otro módulo para una nueva versión del contenido.')
            stored=json.dumps(c,ensure_ascii=False)
            con.execute('UPDATE modules SET title=?,content=?,published=? WHERE id=?',(b['title'],stored,int(published),mid))
            upsert_module_catalog(con,mid,existing['position'] or 1,stored,len(stored))
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
            if not con.execute('SELECT 1 FROM enrollments e JOIN modules m ON m.course_id=e.course_id WHERE e.user_id=? AND m.id=?',(b.get('user_id'),b.get('module_id'))).fetchone():return fail('El estudiante no está matriculado en este curso.',403)
            row=con.execute('SELECT state FROM progress WHERE user_id=? AND module_id=?',(b.get('user_id'),b.get('module_id'))).fetchone()
            if not row:return fail('Entrega inexistente.',404)
            s=json.loads(row['state'])
            if not s['exam']:return fail('La evaluación no ha sido entregada.')
            s['exam']['review']={'points':points,'score':sum(points),'feedback':b['feedback'].strip(),'teacher_id':actor()['id']}
            con.execute('UPDATE progress SET state=?,updated=CURRENT_TIMESTAMP WHERE user_id=? AND module_id=?',(json.dumps(s,ensure_ascii=False),b['user_id'],b['module_id']))
        return jsonify(ok=True)
    @app.post('/api/teacher/specialist-review')
    @require('teacher')
    def specialist_review():
        b=body();note=b.get('note');verdict=str(b.get('verdict') or '')
        allowed={'Correcto con observaciones','Requiere corrección','Evidencia insuficiente','Sello del docente de la especialidad'}
        if verdict not in allowed or not text_valid(note,20):return fail('Elige un dictamen y escribe al menos 20 caracteres.')
        if verdict=='Sello del docente de la especialidad' and b.get('confirm') is not True:return fail('Confirma que revisaste el ítem, la norma y el procedimiento de este módulo.')
        mid=b.get('module_id')
        with db() as con:
            if not con.execute('SELECT 1 FROM modules WHERE id=?',(mid,)).fetchone():return fail('Módulo inexistente.',404)
            con.execute(
                'INSERT INTO specialist_reviews(module_id,teacher_id,verdict,note) VALUES(?,?,?,?)',
                (mid,actor()['id'],verdict,note.strip()[:2000]),
            )
        return jsonify(ok=True,internal_seal=None)
    @app.get('/api/teacher/export.csv')
    @require('teacher')
    def export():
        from datetime import date as date_cls
        filters={}
        allowed=teacher_course_ids()
        for key in ('course','module'):
            raw=request.args.get(key)
            if raw is not None:
                if not raw.isdigit():return fail('Filtro inválido.',400)
                filters[key]=int(raw)
        if 'course' in filters and filters['course'] not in allowed:return fail('No tienes asignado este curso.',403)
        if 'module' in filters and not teacher_module_allowed(filters['module']):return fail('No tienes asignado este curso.',403)
        stream=io.StringIO();w=csv.writer(stream)
        w.writerow(['Aula TP Chile · exportación docente'])
        w.writerow(['Fecha',date_cls.today().isoformat()])
        w.writerow(['Fórmula de avance %','Estaciones completadas / 5 × 100 (misma definición que el portal estudiante)'])
        w.writerow(['Población','Estudiantes con al menos un registro de progreso; no equivale a matrícula total'])
        w.writerow(['Filtros',json.dumps(filters,ensure_ascii=False)])
        w.writerow([])
        w.writerow(['Estudiante','Curso','Módulo','Avance %','Selección','Desarrollo /25','Estado revisión'])
        with db() as con:
            sql='SELECT u.name,c.title AS course,m.title,m.content,p.state FROM progress p JOIN users u ON u.id=p.user_id JOIN modules m ON m.id=p.module_id JOIN courses c ON c.id=m.course_id JOIN enrollments e ON e.user_id=p.user_id AND e.course_id=c.id'
            clauses=['c.id IN ('+','.join('?' for _ in allowed)+')'];values=list(allowed)
            for key,column in (('course','c.id'),('module','m.id')):
                if key in filters:clauses.append(column+'=?');values.append(filters[key])
            if clauses:sql+=' WHERE '+' AND '.join(clauses)
            sql+=' ORDER BY c.id,m.position,u.name'
            for r in con.execute(sql,values):
                s=json.loads(r['state']);content=json.loads(r['content']);ex=s.get('exam');rev=ex and ex.get('review')
                safe=lambda v:"'"+v if isinstance(v,str) and v.startswith(('=','+','-','@','\t','\r')) else v
                w.writerow([safe(r['name']),safe(r['course']),safe(r['title']),sum(completed(s,content))*20,ex['score'] if ex else '',rev['score'] if rev else '', 'Revisado' if rev else ('Evaluación pendiente de revisión' if ex else 'Sin evaluación')])
        return Response('\ufeff'+stream.getvalue(),mimetype='text/csv',headers={'Content-Disposition':'attachment; filename=avance-aula-tp.csv'})
    @app.errorhandler(413)
    def too_big(e):return fail('El contenido excede el límite de 2 MB.',413)
    return app

if __name__=='__main__':
    create_app().run(host=os.environ.get('HOST','0.0.0.0'),port=int(os.environ.get('PORT','8000')),debug=False)
