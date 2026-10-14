import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app import create_app, visual_resource_index, curriculum_references, documentary_metadata


class TeacherAuditSecurityTest(unittest.TestCase):
    def test_resource_index_preserves_context_and_rejects_unsafe_links(self):
        content={'ae':[{'image':'/static/diagram.png'},{'image':'/static/diagram.png'}], 'video':{'src':'https://example.test/video.mp4'},'asset':'javascript:alert(1)','pdf':'https://[invalid'}
        resources=visual_resource_index(content)
        self.assertEqual(len(resources),2)
        self.assertEqual(resources[0]['locations'],['ae.0.image','ae.1.image'])
        self.assertEqual(resources[1]['type'],'Video')
        extended=visual_resource_index({'video':{'url':'https://www.youtube.com/watch?v=example'},'image':'/static/photo.avif','model':{'src':'/static/equipment.stl'},'pdf':'https://user:secret@example.test/private.pdf'})
        self.assertEqual([item['type'] for item in extended],['Video externo','Imagen','Modelo 3D'])
        self.assertEqual(visual_resource_index({'illustration':'/static/diagram.svg','resource':{'path':'/static/model.glb'}})[1]['type'],'Modelo 3D')
    def test_curriculum_references_preserve_declared_pending_state(self):
        content={'traceability':[{'ae_code':'AE1','criterion':'Criterio original','source_status':'REQUIERE VALIDACION','correct':'Clave que no debe incluirse'}]}
        original=json.dumps(content)
        reference=curriculum_references(content)[0]
        self.assertEqual(reference['source_status'],'REQUIERE VALIDACION')
        self.assertNotIn('correct',reference)
        self.assertEqual(json.dumps(content),original)
    def test_documentary_status_requires_exact_content_and_source_hashes(self):
        import hashlib
        raw='{"aes":[]}'
        root=Path(self.directory.name)
        pdf=root/'source.pdf';pdf.write_bytes(b'fixture-pdf')
        report=root/'reports'/'auditoria-implementacion-20261013'/'cotejo-pdf.json'
        report.parent.mkdir(parents=True)
        report.write_text(json.dumps({'modules':[{'course':'Curso','module':'Modulo','pdf':'source.pdf',
            'content_sha256':hashlib.sha256(raw.encode()).hexdigest(),'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),
            'comparisons':[]}]}),encoding='utf-8')
        with patch('app.ROOT',root):
            self.assertIsNotNone(documentary_metadata(raw,'Curso','Modulo'))
            self.assertIsNone(documentary_metadata(raw+' ','Curso','Modulo'))
            pdf.write_bytes(b'changed-source')
            self.assertIsNone(documentary_metadata(raw,'Curso','Modulo'))
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        self.database = str(Path(self.directory.name) / 'portal.sqlite3')
        with patch('app.upgrade_catalog'):
            self.app = create_app({'TESTING': True, 'DATABASE': self.database, 'SECRET_KEY': 'test'})
        self.client = self.app.test_client()

    def tearDown(self):
        self.directory.cleanup()

    def test_demo_does_not_authorize_student_data_or_export(self):
        entered = self.client.get('/api/portal-docente/enter').get_json()
        self.assertEqual(entered['mode'], 'demo')
        with self.client.session_transaction() as session:
            self.assertNotIn('teacher_uid', session)
        for endpoint in ('/api/teacher', '/api/teacher/export.csv'):
            self.assertEqual(self.client.get(endpoint).status_code, 401)

    def test_old_demo_cookie_does_not_authorize_teacher(self):
        with self.client.session_transaction() as session:
            session['teacher_uid'] = 2
        self.assertEqual(self.client.get('/api/teacher').status_code, 401)

    def test_public_catalog_contains_no_student_state(self):
        response = self.client.get('/api/portal-docente/catalog')
        self.assertEqual(response.status_code, 200)
        text = response.get_data(as_text=True)
        for key in ('password', 'username', 'records', 'state', 'users'):
            self.assertNotIn('"' + key + '"', text)
        self.assertTrue(response.get_json()[0]['modules'])
    def test_demo_loads_details_only_for_selected_course(self):
        with sqlite3.connect(self.database) as connection:
            connection.execute("INSERT INTO courses(id,title,specialty,level) VALUES(99,'Otro curso','Otra especialidad','4 medio')")
            connection.execute("INSERT INTO modules(id,course_id,title,position,published,content) VALUES(99,99,'Otro módulo',1,1,'{}')")
        courses=self.client.get('/api/portal-docente/catalog?course=1').get_json()
        self.assertTrue(next(item for item in courses if item['id']==1)['modules'])
        self.assertEqual(next(item for item in courses if item['id']==99)['modules'],[])
        courses=self.client.get('/api/portal-docente/catalog?course=99').get_json()
        self.assertEqual(next(item for item in courses if item['id']==1)['modules'],[])
        self.assertEqual(next(item for item in courses if item['id']==99)['modules'][0]['id'],99)

    def test_authenticated_teacher_receives_explicit_station_states(self):
        original = json.dumps({'context': 'Contexto guardado', 'ae': {}, 'cases': {}, 'closed': True})
        with sqlite3.connect(self.database) as connection:
            connection.execute('INSERT INTO progress(user_id,module_id,state) VALUES(1,1,?)', (original,))
        with self.client.session_transaction() as session:
            session['uid'] = 2
        self.assertEqual(self.client.get('/api/portal-docente/enter').get_json()['mode'], 'real')
        record = self.client.get('/api/teacher').get_json()['records'][0]
        self.assertEqual(record['completed'], [True, False, False, False, True])
        with sqlite3.connect(self.database) as connection:
            self.assertEqual(connection.execute('SELECT state FROM progress').fetchone()[0], original)
        self.assertEqual(self.client.get('/api/teacher/export.csv?module=999999').status_code, 403)
        self.assertNotIn('Estudiante Demo', self.client.get('/api/teacher/export.csv?module=999999').get_data(as_text=True))
        self.assertEqual(self.client.get('/api/teacher/export.csv?module=invalid').status_code, 400)

    def teacher_session(self):
        with self.client.session_transaction() as session:
            session['uid'] = 2
            session['csrf'] = 'test-token'
        return {'X-CSRF-Token': 'test-token'}

    def test_plans_preserve_history_and_reject_stale_versions(self):
        headers = self.teacher_session()
        plan = {'module_id': 1, 'version': 0, 'sequence': 'Experiencia de taller', 'status': 'draft'}
        self.assertEqual(self.client.post('/api/teacher/plans', json=plan, headers=headers).status_code, 200)
        self.assertEqual(self.client.post('/api/teacher/plans', json=plan, headers=headers).status_code, 409)
        plan.update(version=1, sequence='Experiencia ajustada')
        self.assertEqual(self.client.post('/api/teacher/plans', json=plan, headers=headers).get_json()['version'], 2)
        plans = self.client.get('/api/teacher').get_json()['plans']
        self.assertEqual(len(plans), 2)
        self.assertEqual(plans[1]['payload']['sequence'], 'Experiencia de taller')
        plan.update(version=2, start_date='2026-10-20', end_date='2026-10-10')
        self.assertEqual(self.client.post('/api/teacher/plans', json=plan, headers=headers).status_code, 400)
        with sqlite3.connect(self.database) as connection:
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM progress').fetchone()[0], 0)

    def test_support_requires_enrollment_and_never_creates_student_answers(self):
        headers = self.teacher_session()
        support = {'module_id': 1, 'user_id': 1, 'evidence': 'Observación del taller', 'action': 'Revisar procedimiento', 'status': 'open'}
        self.assertEqual(self.client.post('/api/teacher/supports', json=support, headers=headers).status_code, 200)
        support['user_id'] = 2
        self.assertEqual(self.client.post('/api/teacher/supports', json=support, headers=headers).status_code, 403)
        self.assertEqual(len(self.client.get('/api/teacher').get_json()['supports']), 1)
        with sqlite3.connect(self.database) as connection:
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM progress').fetchone()[0], 0)

    def test_unassigned_teacher_cannot_read_or_write_another_course(self):
        headers = self.teacher_session()
        with sqlite3.connect(self.database) as connection:
            connection.execute('DELETE FROM teacher_courses WHERE teacher_id=2')
        self.assertEqual(self.client.get('/api/courses').get_json(), [])
        data = self.client.get('/api/teacher').get_json()
        for key in ('users', 'records', 'enrollments', 'plans', 'supports'):
            self.assertEqual(data[key], [])
        plan = {'module_id': 1, 'version': 0, 'sequence': 'No autorizado', 'status': 'draft'}
        self.assertEqual(self.client.post('/api/teacher/plans', json=plan, headers=headers).status_code, 403)
        support = {'module_id': 1, 'user_id': 1, 'evidence': 'No autorizado', 'action': 'No autorizado', 'status': 'open'}
        self.assertEqual(self.client.post('/api/teacher/supports', json=support, headers=headers).status_code, 403)
        self.assertEqual(self.client.put('/api/teacher/modules/1',json={'content':{},'published':False},headers=headers).status_code,403)
        self.assertEqual(self.client.get('/api/teacher/export.csv?course=1').status_code, 403)
        self.assertNotIn('Estudiante Demo', self.client.get('/api/teacher/export.csv').get_data(as_text=True))

    def test_invalid_document_payloads_and_undocumented_closure_are_rejected(self):
        headers = self.teacher_session()
        self.assertEqual(self.client.post('/api/teacher/plans', json=[], headers=headers).status_code, 400)
        self.assertEqual(self.client.post('/api/teacher/plans', json={'module_id': []}, headers=headers).status_code, 400)
        support = {'module_id': 1, 'user_id': 1, 'evidence': 'Observación', 'action': 'Apoyo', 'status': 'closed'}
        self.assertEqual(self.client.post('/api/teacher/supports', json=support, headers=headers).status_code, 400)
        support['feedback'] = 'Nueva evidencia y devolución documentadas'
        self.assertEqual(self.client.post('/api/teacher/supports', json=support, headers=headers).status_code, 200)

    def test_integrated_plan_support_and_export_preserve_original_evaluation(self):
        headers = self.teacher_session()
        original = json.dumps({'context':'Contexto original','ae':{},'cases':{},'exam':{'score':4,'max_score':5,'review':{'score':17,'feedback':'Devolución original'}},'closed':False})
        with sqlite3.connect(self.database) as connection:
            connection.execute('INSERT INTO progress(user_id,module_id,state) VALUES(1,1,?)',(original,))
            connection.execute("INSERT INTO courses(id,title,specialty,level) VALUES(99,'Curso no asignado','Otra especialidad','4 medio')")
            connection.execute("INSERT INTO modules(id,course_id,title,position,published,content) VALUES(99,99,'Módulo ajeno',1,1,'{}')")
            connection.execute('INSERT INTO enrollments VALUES(1,99)')
            connection.execute('INSERT INTO progress(user_id,module_id,state) VALUES(1,99,?)',(original,))
        plan={'module_id':1,'version':0,'sequence':'Enseñanza ajustada','status':'planned'}
        support={'module_id':1,'user_id':1,'evidence':'Observación docente','action':'Revisar el procedimiento','status':'open'}
        self.assertEqual(self.client.post('/api/teacher/plans',json=plan,headers=headers).status_code,200)
        self.assertEqual(self.client.post('/api/teacher/supports',json=support,headers=headers).status_code,200)
        overview=self.client.get('/api/teacher').get_json()
        self.assertEqual([item['module_id'] for item in overview['records']],[1])
        self.assertEqual(overview['records'][0]['state']['exam']['review']['score'],17)
        self.assertEqual(len(overview['plans']),1)
        self.assertEqual(len(overview['supports']),1)
        exported=self.client.get('/api/teacher/export.csv?course=1&module=1').get_data(as_text=True)
        self.assertIn('17',exported)
        self.assertNotIn('Módulo ajeno',exported)
        with sqlite3.connect(self.database) as connection:
            for row in connection.execute('SELECT state FROM progress'):
                self.assertEqual(row[0],original)

    def test_enrollment_in_one_course_does_not_expose_old_records_in_another(self):
        headers=self.teacher_session()
        with sqlite3.connect(self.database) as connection:
            connection.execute("INSERT INTO courses(id,title,specialty,level) VALUES(99,'Otro curso asignado','Otra especialidad','4 medio')")
            connection.execute("INSERT INTO modules(id,course_id,title,position,published,content) VALUES(99,99,'Modulo antiguo',1,1,'{}')")
            connection.execute('INSERT INTO teacher_courses VALUES(2,99)')
            connection.execute('INSERT INTO progress(user_id,module_id,state) VALUES(1,99,?)',(json.dumps({'context':'Evidencia antigua'}),))
            connection.execute("INSERT INTO content_incidents(user_id,module_id,claim,note) VALUES(1,99,'Incidente antiguo','No mostrar sin matricula')")
            connection.execute('INSERT INTO teacher_supports(teacher_id,user_id,module_id,payload) VALUES(2,1,99,?)',(json.dumps({'action':'Apoyo antiguo'}),))
        data=self.client.get('/api/teacher').get_json()
        self.assertEqual([item['id'] for item in data['users']],[1])
        for key in ('records','incidents','supports'):
            self.assertEqual(data[key],[])
        self.assertNotIn('Evidencia antigua',self.client.get('/api/teacher/export.csv?course=99').get_data(as_text=True))
        self.assertEqual(self.client.post('/api/teacher/snapshots',json={'course_id':99},headers=headers).status_code,200)
        snapshot=self.client.get('/api/teacher').get_json()['snapshots'][0]['payload']
        self.assertEqual(snapshot['population'],0)
        self.assertEqual(snapshot['records'],0)

    def test_snapshots_are_immutable_aggregate_cuts_with_course_permissions(self):
        headers=self.teacher_session()
        self.assertEqual(self.client.post('/api/teacher/snapshots',json={'course_id':99},headers=headers).status_code,403)
        self.assertEqual(self.client.post('/api/teacher/snapshots',json={'course_id':1},headers=headers).status_code,200)
        first=self.client.get('/api/teacher').get_json()['snapshots'][0]
        self.assertIsNone(first['payload']['mean_progress'])
        self.assertNotIn('name',first['payload'])
        with sqlite3.connect(self.database) as connection:
            connection.execute('INSERT INTO progress(user_id,module_id,state) VALUES(1,1,?)',(json.dumps({'context':'Actividad posterior'}),))
        self.client.post('/api/teacher/snapshots',json={'course_id':1},headers=headers)
        rows=self.client.get('/api/teacher').get_json()['snapshots']
        self.assertEqual(rows[1]['payload'],first['payload'])
        self.assertEqual(rows[0]['payload']['mean_progress'],20)


if __name__ == '__main__':
    unittest.main()
