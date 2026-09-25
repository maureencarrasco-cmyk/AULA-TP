import copy, tempfile, unittest
from pathlib import Path
from app import create_app
from content import DEFAULT_CONTENT

TEXT='Revisaría las etiquetas, la leyenda y la versión de los documentos antes de formular una consulta fundamentada.'
class LMSFlow(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory(ignore_cleanup_errors=True);self.app=create_app({'TESTING':True,'DATABASE':str(Path(self.tmp.name)/'test.sqlite3'),'SECRET_KEY':'test-only'})
  self.s=self.app.test_client();self.t=self.app.test_client();self.st=self.login(self.s,'estudiante','AulaTP2026!');self.tt=self.login(self.t,'docente','DocenteTP2026!')
 def tearDown(self):self.tmp.cleanup()
 def login(self,client,user,pwd):
  token=client.get('/api/session').json['csrf'];r=client.post('/api/login',json={'username':user,'password':pwd},headers={'X-CSRF-Token':token});self.assertEqual(r.status_code,200);return r.json['csrf']
 def req(self,path,data,teacher=False,method='POST'):
  return (self.t if teacher else self.s).open('/api'+path,method=method,json=data,headers={'X-CSRF-Token':self.tt if teacher else self.st})
 def activity(self,**kw):return self.req('/modules/1/activity',kw)
 def through_integration(self):
  self.assertEqual(self.activity(kind='context',text=TEXT).status_code,200)
  for a in range(3):
   for step in range(6):self.assertEqual(self.activity(kind='ae',ae=a,step=step,text=TEXT).status_code,200)
  self.assertEqual(self.activity(kind='oficio',id='video',activity_kind='video',paso='trazado',text=TEXT).status_code,200)
  for i,q in enumerate(DEFAULT_CONTENT['cases']):self.assertEqual(self.activity(kind='case',index=i,choice=q['answer'],text=TEXT).status_code,200)
  ids=[p['id'] for p in DEFAULT_CONTENT['scene']['parts']]
  self.assertEqual(self.activity(kind='scene',inspected=ids,text=TEXT).status_code,200)
 def test_security_and_gates(self):
  self.assertEqual(self.app.test_client().get('/api/courses').status_code,401)
  self.assertEqual(self.s.get('/api/teacher').status_code,403)
  self.assertEqual(self.s.get('/api/teacher/template').status_code,403)
  self.assertEqual(self.s.post('/api/logout',json={}).status_code,403)
  mid=self.req('/teacher/modules',{'course_id':1,'title':'Borrador no publicado'},teacher=True).json['id']
  self.assertEqual(self.s.get('/api/modules/'+str(mid)).status_code,403)
  self.assertEqual(self.activity(kind='exam',answers={},development=TEXT).status_code,403)
  self.assertEqual(self.activity(kind='ae',ae=0,step=0,text=TEXT).status_code,403)
  self.assertEqual(self.activity(kind='context',text='no').status_code,400)
  self.assertEqual(self.activity(kind='context',text=TEXT).status_code,200)
  self.assertEqual(self.activity(kind='ae',ae=1,step=0,text=TEXT).status_code,403)
  content=self.s.get('/api/modules/1').json['content']
  self.assertTrue(all('answer' not in q and 'explanation' not in q for q in content['questions']))
  self.assertTrue(all('answer' not in q for q in content['cases']))
  payload={'note':'El valor del caso no coincide con el programa MINEDUC citado.','claim':'dato-simulado','station':3}
  self.assertEqual(self.req('/modules/1/content-report',payload).status_code,200)
  teacher=self.t.get('/api/teacher').json
  self.assertTrue(teacher['content_health'])
  self.assertEqual(1,len(teacher['incidents']))
 def test_student_progress_is_private_and_uses_saved_evidence(self):
  self.assertEqual(self.app.test_client().get('/api/progress').status_code,401)
  self.assertEqual(self.t.get('/api/progress').status_code,403)
  report=self.s.get('/api/progress')
  self.assertEqual(report.status_code,200)
  first=next(m for m in report.json if m['id']==1)
  self.assertFalse(any(first['completed']))
  self.assertEqual(first['state']['context'],'')
  self.assertTrue(first['aes'])
  self.assertEqual(self.activity(kind='context',text=TEXT).status_code,200)
  updated=next(m for m in self.s.get('/api/progress').json if m['id']==1)
  self.assertTrue(updated['completed'][0])
  self.assertEqual(updated['state']['context'],TEXT)
  uid=self.req('/teacher/users',{'username':'alumnoprogreso','name':'Otra estudiante','password':'ClaveDePrueba2026'},teacher=True).json['id']
  self.assertEqual(self.req('/teacher/enroll',{'user_id':uid,'course_id':1},teacher=True).status_code,200)
  other=self.app.test_client();self.login(other,'alumnoprogreso','ClaveDePrueba2026')
  private=next(m for m in other.get('/api/progress').json if m['id']==1)
  self.assertEqual(private['state']['context'],'')
 def test_full_learning_grading_and_persistence(self):
  self.through_integration();count=DEFAULT_CONTENT['evaluation_plan']['question_count'];answers={str(i):q['answer'] for i,q in enumerate(DEFAULT_CONTENT['questions'][:count])};answers['0']=(answers['0']+1)%4
  self.assertEqual(self.activity(kind='draft',answers={'0':answers['0']},development=TEXT).status_code,200)
  # Session replacement and a fresh app instance must retain the draft.
  fresh=create_app({'TESTING':True,'DATABASE':self.app.config['DATABASE'],'SECRET_KEY':'test-only'}).test_client();self.login(fresh,'estudiante','AulaTP2026!')
  self.assertEqual(fresh.get('/api/modules/1').json['state']['draft']['answers'],{'0':answers['0']})
  self.assertEqual(self.activity(kind='exam',answers={'0':0},development=TEXT).status_code,400)
  self.assertEqual(self.activity(kind='exam',answers=answers,development=TEXT).status_code,200)
  s=self.s.get('/api/modules/1').json['state'];self.assertEqual(s['exam']['score'],count-1);self.assertEqual(s['exam']['max_score'],count);self.assertFalse(s['exam']['development_required'])
  self.assertEqual(self.activity(kind='exam',answers=answers,development=TEXT).status_code,400)
  self.assertEqual(self.activity(kind='close',reflection=TEXT,plan=TEXT).status_code,200)
  self.assertEqual(self.s.get('/api/modules/1').json['completed'],[True]*5)
  self.assertEqual(self.activity(kind='context',text=TEXT).status_code,400)
  report=self.t.get('/api/teacher/export.csv');self.assertEqual(report.status_code,200);self.assertIn('avance-aula-tp.csv',report.headers['Content-Disposition'])
 def test_authoring_enrollment_isolation(self):
  uid=self.req('/teacher/users',{'username':'alumno2','name':'Estudiante de prueba','password':'ClaveDePrueba2026'},teacher=True).json['id']
  second=self.app.test_client();self.login(second,'alumno2','ClaveDePrueba2026');self.assertEqual(second.get('/api/courses').json,[])
  self.assertEqual(second.get('/api/modules/1').status_code,403)
  self.assertEqual(self.req('/teacher/enroll',{'user_id':uid,'course_id':1},teacher=True).status_code,200)
  self.activity(kind='context',text=TEXT)
  self.assertEqual(second.get('/api/modules/1').json['state']['context'],'')
  cid=self.req('/teacher/courses',{'title':'Curso de prueba','specialty':'Especialidad','level':'3° medio'},teacher=True).json['id']
  mid=self.req('/teacher/modules',{'course_id':cid,'title':'Nuevo módulo'},teacher=True).json['id']
  self.assertEqual(self.req('/teacher/modules/'+str(mid),{'title':'Nuevo módulo','published':True,'content':{}},teacher=True,method='PUT').status_code,400)
  self.assertEqual(self.req('/teacher/modules/'+str(mid),{'title':'Nuevo módulo','published':True,'content':DEFAULT_CONTENT},teacher=True,method='PUT').status_code,200)
  c=copy.deepcopy(DEFAULT_CONTENT);c['context']='Este contexto modificado tiene una extensión suficiente.'
  self.assertEqual(self.req('/teacher/modules/1',{'title':'Módulo 1','published':True,'content':c},teacher=True,method='PUT').status_code,400)
 def test_invalid_answers_and_rubric(self):
  self.through_integration()
  self.assertEqual(self.activity(kind='draft',answers={'-1':1},development='').status_code,400)
  self.assertEqual(self.activity(kind='draft',answers={'0':True},development='').status_code,400)
  self.assertEqual(self.req('/teacher/review',{'user_id':1,'module_id':1,'points':[6]*5,'feedback':TEXT},teacher=True).status_code,400)
 def test_extended_modules_complete_and_scene_specific(self):
  from catalog import EXTENDED_MODULES
  for mid,c in EXTENDED_MODULES.items():
   with self.subTest(module=mid):
    m=self.s.get('/api/modules/'+str(mid));self.assertEqual(m.status_code,200)
    self.assertEqual(len(m.json['content']['questions']),25)
    self.assertTrue(all('answer' not in q for q in m.json['content']['questions']))
    self.assertEqual(len(m.json['content']['rubric']),5)
    self.assertTrue(all(a['lesson'] and a['example'] for a in m.json['content']['aes']))
    call=lambda **d:self.req('/modules/'+str(mid)+'/activity',d)
    self.assertEqual(call(kind='context',text=TEXT).status_code,200)
    for a in range(3):
     for step in range(6):self.assertEqual(call(kind='ae',ae=a,step=step,text=TEXT).status_code,200)
    for i,q in enumerate(c['cases']):self.assertEqual(call(kind='case',index=i,choice=q['answer'],text=TEXT).status_code,200)
    self.assertEqual(call(kind='scene',inspected=['exterior','interior','control'],text=TEXT).status_code,400)
    self.assertEqual(call(kind='scene',inspected=[{},None,1],text=TEXT).status_code,400)
    self.assertEqual(call(kind='scene',inspected=[p['id'] for p in c['scene']['parts']],text=TEXT).status_code,200)
    count=c['evaluation_plan']['question_count']
    answers={str(i):q['answer'] for i,q in enumerate(c['questions'][:count])}
    delivered=call(kind='exam',answers=answers,development=TEXT)
    self.assertEqual(delivered.status_code,200)
    self.assertEqual(delivered.json['state']['exam']['score'],count)
    self.assertEqual(delivered.json['state']['exam']['max_score'],count)
    self.assertEqual(call(kind='close',reflection=TEXT,plan=TEXT).json['completed'],[True]*5)
 def test_upgrade_preserves_progress_and_teacher_content(self):
  import sqlite3,json
  from catalog import upgrade_catalog
  self.activity(kind='context',text=TEXT)
  with sqlite3.connect(self.app.config['DATABASE']) as con:
   con.row_factory=sqlite3.Row
   before=con.execute('SELECT state FROM progress WHERE module_id=1').fetchone()[0]
   con.execute('DELETE FROM content_updates')
   con.execute("UPDATE modules SET title='Instrumentos de medición',content=?,published=0 WHERE id=2",(json.dumps({'teacher_note':'Contenido editado por docente'}),))
   con.execute("UPDATE modules SET title='Montaje de redes',content='{}',published=0 WHERE id=3")
   upgrade_catalog(con)
   self.assertEqual(con.execute('SELECT state FROM progress WHERE module_id=1').fetchone()[0],before)
   self.assertIn('teacher_note',con.execute('SELECT content FROM modules WHERE id=2').fetchone()[0])
   self.assertEqual(con.execute('SELECT published FROM modules WHERE id=3').fetchone()[0],1)
   # Once imported, later unpublished modules remain unpublished after restart.
   con.execute('UPDATE modules SET published=0 WHERE id=3');upgrade_catalog(con)
   self.assertEqual(con.execute('SELECT published FROM modules WHERE id=3').fetchone()[0],0)
 def test_extended_metadata_validation(self):
  from catalog import EXTENDED_MODULES
  c=copy.deepcopy(EXTENDED_MODULES[2]);c['scene']['parts'][1]['id']=c['scene']['parts'][0]['id']
  self.assertEqual(self.req('/teacher/modules/2',{'title':'Instrumentos','published':True,'content':c},teacher=True,method='PUT').status_code,400)
  c=copy.deepcopy(EXTENDED_MODULES[2]);c['practice']['reference']=[22,18]
  self.assertEqual(self.req('/teacher/modules/2',{'title':'Instrumentos','published':True,'content':c},teacher=True,method='PUT').status_code,400)
  c=copy.deepcopy(EXTENDED_MODULES[2]);c['aes'][0]['lesson']=['Lección editada por el docente.']
  self.assertEqual(self.req('/teacher/modules/2',{'title':'Instrumentos','published':True,'content':c},teacher=True,method='PUT').status_code,200)
 def test_pedagogy_engine_and_hours(self):
  from pedagogy import MODULE_HP, COURSE_HP, HP_MINUTES, TIME_FACTOR, validate_experience
  self.assertEqual(sum(MODULE_HP.values()), COURSE_HP)
  self.assertEqual(HP_MINUTES, 45)
  self.assertEqual(TIME_FACTOR, 5)
  self.assertEqual(MODULE_HP[1], 190)
  courses=self.s.get('/api/courses').json
  self.assertEqual(courses[0]['planning']['course_hp'], 1672)
  self.assertEqual(courses[0]['modules'][0]['hp'], 190)
  self.assertEqual(courses[0]['planning']['time_factor'], 5)
  self.assertAlmostEqual(sum(m['exam_hp'] for m in courses[0]['modules']), 2)
  self.assertEqual(courses[0]['planning']['course_aula_hp'], 501.6)
  self.assertAlmostEqual(sum(m['formative_hp'] for m in courses[0]['modules']), 499.6)
  m=self.s.get('/api/modules/1').json
  self.assertEqual(len(m['content']['questions'][0]['options']), 4)
  self.assertTrue(all(q.get('image') for q in m['content']['questions']))
  self.assertTrue(all(len(q.get('options') or [])==4 and q.get('image') for q in m['content']['cases']))
  self.assertTrue(all('answer' not in q for q in m['content']['questions']))
  self.assertEqual(len(m['content']['aes'][0]['experiences']), 6)
  self.assertTrue(all('answer' not in exp for exp in m['content']['aes'][0]['experiences']))
  types=[exp['type'] for exp in m['content']['aes'][0]['experiences']]
  self.assertIn('hotspot', types)
  self.assertIn('match', types)
  self.assertIn('reflect', types)
  t2=[exp['type'] for exp in m['content']['aes'][1]['experiences']]
  self.assertNotEqual(types, t2)
  self.assertIn('explore', m['content'])
  pack=m['content'].get('formative_pack') or []
  self.assertGreaterEqual(len(pack), 12)
  self.assertTrue(all(a.get('task') and a['task'].get('video') for a in pack))
  self.assertTrue(next(a for a in pack if a['kind']=='observe')['task']['spots'])
  self.assertTrue(all(a.get('station')==3 for a in pack))
  r=self.activity(kind='oficio',id='video',activity_kind='video',paso='trazado',text=TEXT)
  self.assertEqual(r.status_code,200)
  self.assertFalse(r.json['state']['oficio']['video']['graded'])
  self.assertEqual(r.json['state']['oficio']['video']['station'],1)
  self.assertEqual(self.activity(kind='context', text=TEXT).status_code, 200)
  exp=DEFAULT_CONTENT['aes'][0]['experiences'][0]
  self.assertEqual(self.activity(kind='ae', ae=0, step=0, text=TEXT, response={'ids':['x']}).status_code, 400)
  ok, _=validate_experience(exp, {'ids': exp['answer']})
  self.assertTrue(ok)
  self.assertEqual(self.activity(kind='ae', ae=0, step=0, text=TEXT).status_code, 200)
 def test_official_specialty_courses_and_thirty_percent_planning(self):
  from pedagogy import publication_gaps
  courses=self.s.get('/api/courses').json
  expected={
   'Electricidad':(1672,501.6,[152,228,228,228,228,228,152,152,76],[2,3,3,2,4,3,2,2,4]),
   'Atención de Enfermería, mención Adulto Mayor':(1672,501.6,[228,152,190,190,76,228,76,76,114,76,114,76,76],[3,3,3,2,3,3,2,2,4,2,2,2,4]),
   'Atención de Enfermería, mención Enfermería':(1672,501.6,[228,152,190,190,76,228,228,228,76,76],[3,3,3,2,3,3,4,3,2,4]),
  }
  by_title={course['title']:course for course in courses}
  for title,(official,aula,module_hours,ae_counts) in expected.items():
   with self.subTest(course=title):
    course=by_title[title]
    self.assertEqual(len(course['modules']),len(module_hours))
    self.assertEqual(course['planning']['course_hp'],official)
    self.assertEqual(course['planning']['course_aula_hp'],aula)
    self.assertEqual([m['official_hp'] for m in course['modules']],module_hours)
    self.assertAlmostEqual(sum(m['exam_hp'] for m in course['modules']),2)
    for module,ae_count in zip(course['modules'],ae_counts):
     content=self.s.get('/api/modules/'+str(module['id'])).json['content']
     self.assertFalse(publication_gaps(content,course['specialty']))
     self.assertEqual(len(content['aes']),ae_count)
     self.assertEqual(len(content['cases']),15)
     self.assertEqual(len(content['questions']),25)
     self.assertTrue(content.get('specialty_source'))
     self.assertEqual(content['specialty_source']['official_ae_count'],ae_count)
     self.assertFalse(any('Integra los aprendizajes esperados' in ae['title'] for ae in content['aes']))
     if title=='Electricidad':
      self.assertTrue(any('Consulta el RIC antes de tomar una decisión' in case['context'] for case in content['cases']))
  source=(Path(__file__).resolve().parents[1]/'static'/'app.js').read_text(encoding='utf-8')
  self.assertIn('SEC · Pliegos RIC',source)
  self.assertIn("specialtyKey(course)!=='electricidad'",source)
 def test_refrigeration_fourth_middle_complete(self):
  from pedagogy import publication_gaps
  course=self.s.get('/api/courses').json[0]
  expected=[
   ('Puesta en marcha de equipos de refrigeración y climatización',228),
   ('Diagnóstico en sistemas de refrigeración y climatización',190),
   ('Mantención de sistemas de refrigeración y climatización',190),
   ('Reciclaje y almacenamiento de refrigerantes',152),
   ('Emprendimiento y empleabilidad',76),
  ]
  self.assertEqual(course['level'],'3° y 4° medio')
  self.assertEqual(len(course['modules']),9)
  self.assertEqual([(m['title'],m['official_hp']) for m in course['modules'][4:]],expected)
  self.assertEqual(course['planning']['course_hp'],1672)
  self.assertEqual(course['planning']['course_aula_hp'],501.6)
  self.assertAlmostEqual(sum(m['exam_hp'] for m in course['modules']),2)
  ae_counts=[3,3,2,3,4]
  explore_labels=[
   ['Área de trabajo','Placa del equipo','Carga de fluido','EPP'],
   ['Síntoma','Medición','Manual','Registro'],
   ['Historial','Inspección','Procedimiento','Cierre'],
   ['Etiqueta','Cilindro','Registro','Almacenamiento'],
   ['Oportunidad','Presupuesto','Contrato','Formación'],
  ]
  scenario_signals=['área está despejada','baja capacidad','plan indica una tarea','cilindro de recuperación','presupuesto']
  for module,ae_count,labels,signal in zip(course['modules'][4:],ae_counts,explore_labels,scenario_signals):
   with self.subTest(module=module['position']):
    payload=self.s.get('/api/modules/'+str(module['id'])).json
    content=payload['content']
    self.assertEqual(len(content['aes']),ae_count)
    self.assertEqual(len(content['cases']),15)
    self.assertEqual(len(content['questions']),25)
    self.assertEqual(content['specialty_source']['course_hp'],1672)
    self.assertFalse(publication_gaps(content,course['specialty']))
    self.assertNotIn('Leer la leyenda',content['aes'][0]['experiences'][2].get('items') or [])
    self.assertEqual([spot['label'] for spot in content['explore']['spots']],labels)
    self.assertTrue(content['explore'].get('guidance'))
    case_text=' '.join(case['context'] for case in content['cases']).lower()
    self.assertIn(signal,case_text)
    self.assertNotIn('el plano identifica equipo eq-02',case_text)
    self.assertNotIn('dos trazados se cruzan en planta',case_text)
    self.assertFalse(any(spot.get('label') in ('UE-01','UI-01','Leyenda','Drenaje') for case in content['cases'] for spot in case.get('spots',[])))
    self.assertNotIn('UI-01',' '.join(content['development_pack'].get('evidence',[])))
    self.assertEqual(payload['planning']['official_hp'],module['official_hp'])
 def test_mcq_publication_requires_photo_and_four_options(self):
  from pedagogy import publication_gaps
  from catalog import EXTENDED_MODULES
  self.assertFalse(publication_gaps(DEFAULT_CONTENT))
  self.assertTrue(all(q.get('form') in range(1,10) for q in DEFAULT_CONTENT['questions']))
  self.assertTrue(all('/oficio/' in (q.get('image') or '') for q in DEFAULT_CONTENT['questions']))
  self.assertTrue(all('/oficio/' in (c.get('image') or '') for c in DEFAULT_CONTENT['cases']))
  self.assertIn('oficio-escala', DEFAULT_CONTENT['questions'][15]['image'])
  self.assertEqual((DEFAULT_CONTENT.get('scene') or {}).get('media_kind'), '3d-procedure')
  self.assertTrue((DEFAULT_CONTENT.get('aes') or [{}])[0].get('official_code'))
  self.assertEqual(DEFAULT_CONTENT['planning']['time_factor'], 5)
  self.assertEqual([DEFAULT_CONTENT['evaluation_plan']['question_count']]+[EXTENDED_MODULES[i]['evaluation_plan']['question_count'] for i in (2,3,4)],[5,5,7,8])
  from instructional_quality import contract_is_complete
  self.assertTrue(contract_is_complete(DEFAULT_CONTENT['context_instruction']))
  self.assertTrue(all(contract_is_complete(e['instruction']) for a in DEFAULT_CONTENT['aes'] for e in a['experiences']))
  didactic_fields={'prior_knowledge','new_knowledge','cognitive_action','expected_difficulty','scaffolding','evidence','feedback','transfer','initial_register','final_register','transformation','brousseau_cycle'}
  from catalog import EXTENDED_MODULES
  for mid,content in {1:DEFAULT_CONTENT,**EXTENDED_MODULES}.items():
   with self.subTest(didactic_module=mid):
    self.assertTrue(didactic_fields.issubset(content['context_didactic']))
    self.assertTrue(didactic_fields.issubset(content['scene']['didactic']))
    self.assertTrue(didactic_fields.issubset(content['practice']['didactic']))
    self.assertTrue(didactic_fields.issubset(content['feedback_didactic']))
    self.assertTrue(all(didactic_fields.issubset(i['didactic']) for i in content['encargos']['items']))
    if content['evaluation_plan']['development_required']:
     self.assertTrue(didactic_fields.issubset(content['development_pack']['didactic']))
  c=copy.deepcopy(DEFAULT_CONTENT);c['questions'][0]['image']=''
  mid=self.req('/teacher/modules',{'course_id':1,'title':'Hueco A-D'},teacher=True).json['id']
  self.assertEqual(self.req('/teacher/modules/'+str(mid),{'title':'Hueco A-D','published':True,'content':c},teacher=True,method='PUT').status_code,400)
 def test_audit_ui_uses_module_plan_and_actor_evidence_matrix(self):
  source=(Path(__file__).resolve().parents[1]/'static'/'app.js').read_text(encoding='utf-8')
  portal=(Path(__file__).resolve().parents[1]/'static'/'teacher-portal.js').read_text(encoding='utf-8')
  self.assertIn('function evaluationPlan()',source)
  self.assertIn('PREGUNTA ${questionIndex+1} DE ${plan.count}',source)
  self.assertNotIn('Escenario 3D:',source)
  self.assertIn('<th>Necesidad</th><th>Indicador</th><th>Evidencia</th><th>Acción posible</th>',portal)
  self.assertNotIn('250,8',portal)
  self.assertIn('Curso y planificación',portal)
  self.assertIn('AE y OA',portal)
  self.assertIn('curriculumSourcePanel()',source)
 def test_teacher_portal_traceability(self):
  teacher=self.t.get('/api/teacher').json
  self.assertIn('formula',teacher['kpi']['avance_porcentaje'])
  self.assertIn('completed()',teacher['kpi']['avance_porcentaje']['fuente'])
  courses=self.t.get('/api/courses').json
  self.assertTrue(courses[0]['modules'][0].get('aes') is not None)
  self.assertEqual(self.s.get('/api/courses').json[0]['modules'][0].get('aes'),None)
  csv=self.t.get('/api/teacher/export.csv').get_data(as_text=True)
  self.assertIn('Estaciones completadas / 5',csv)
  self.assertIn('Curso',csv)
 def test_encargos_cover_hours_without_gating_exam(self):
  expected={1:32,2:36,3:38,4:36}
  hours={1:32.2,2:32.2,3:40.8,4:40.8}
  for mid,n in expected.items():
   with self.subTest(module=mid):
    pack=self.s.get('/api/modules/'+str(mid)).json['content']['encargos']
    self.assertEqual(pack['count'], n)
    self.assertGreaterEqual(pack['hours'], hours[mid])
    self.assertTrue(all(i['station'] in (2,3) for i in pack['items']))
    self.assertTrue(all(i['ae'] in (1,2,3) for i in pack['items']))
    self.assertTrue(all(i['minutes']>=30 for i in pack['items']))
  self.assertEqual(self.activity(kind='encargo',id='1.01',text=TEXT).status_code,403)
  self.assertEqual(self.activity(kind='context',text=TEXT).status_code,200)
  self.assertEqual(self.activity(kind='encargo',id='1.03',text='corto').status_code,400)
  self.assertEqual(self.activity(kind='encargo',id='no-existe',text=TEXT).status_code,400)
  r=self.activity(kind='encargo',id='1.03',text=TEXT)
  self.assertEqual(r.status_code,200)
  self.assertIn('1.03', r.json['state']['encargos'])
  self.assertEqual(r.json['completed'],[True,False,False,False,False])
  self.assertEqual(self.activity(kind='encargo',id='1.01',text=TEXT).status_code,403)
  counts=[m['encargos_count'] for m in self.s.get('/api/courses').json[0]['modules']]
  self.assertEqual(counts,[32,36,38,36,38,32,32,25,13])
  for mid,eid in ((2,'2.01'),(3,'3.05'),(4,'4.03')):
   with self.subTest(save=mid):
    call=lambda **d:self.req('/modules/'+str(mid)+'/activity',d)
    self.assertEqual(call(kind='context',text=TEXT).status_code,200)
    self.assertEqual(call(kind='encargo',id=eid,text=TEXT).status_code,200)
 def test_oficio_media_follows_module_not_stock_cases(self):
  from pedagogy import OFICIO_CAPTION, oficio_src
  self.assertIn('220 V', OFICIO_CAPTION['equipo'])
  self.assertIn('50 Hz', OFICIO_CAPTION['equipo'])
  self.assertIn('planta', OFICIO_CAPTION['cruce'].lower())
  self.assertIn('español', OFICIO_CAPTION['plano'].lower())
  self.assertIn('?v=3', oficio_src('plano'))
  for mid in (1,2,3,4):
   with self.subTest(module=mid):
    c=self.s.get('/api/modules/'+str(mid)).json['content']
    self.assertTrue(all('/oficio/' in (x.get('image') or '') for x in c['cases']))
    self.assertTrue(all('themes/cases/' not in (x.get('image') or '') for x in c['cases']))
    self.assertIn('/oficio/', c['explore']['image'])
    self.assertNotIn('themes/cases/', c['explore']['image'])
if __name__=='__main__':unittest.main(verbosity=2)
