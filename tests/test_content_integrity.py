import json
import sqlite3
import tempfile
import unittest
from copy import deepcopy
from contextlib import closing
from pathlib import Path

from content_integrity import asset_exists, repair_content_integrity
from scripts.repair_course_integrity import repair_database
from pedagogy import build_traceability, enrich, publication_gaps


class ContentIntegrityTests(unittest.TestCase):
    def fixture(self):
        return {'specialty_source':{'pdf':'docs/fuentes/MINEDUC_Electricidad_programa.pdf','official_hp':100},
            'planning':{'minutes':22500}, 'hp_minutes':45,
            'aes':[{'title':'Instala motores','official_code':'M1-AE1','criteria':['Verifica conexion'],'steps':['Lee']*6}],
            'questions':[{'question':'Decide','options':['a','b','c','d'],'answer':2,
                'image':'/static/headers/ausente/e4.png'}],
            'traceability':[{'pdf':'otro.pdf','ae_code':'M1-AE1','page':'PDF p. None'}]}

    def test_source_is_own_specialty_and_unknown_page_not_invented(self):
        c = self.fixture()
        repair_content_integrity(c)
        self.assertEqual(c['specialty_source']['pdf'],c['traceability'][0]['pdf'])
        self.assertNotIn('None',c['traceability'][0]['page'])
        self.assertIn('pendiente',c['traceability'][0]['page'].lower())
        c['cases']=[{'ae':0,'title':'Caso'}]
        rows = build_traceability(c,'Electricidad')
        self.assertTrue(all(r['pdf']==c['specialty_source']['pdf'] for r in rows))

    def test_missing_resource_quarantined_without_changing_key(self):
        c = self.fixture()
        original = deepcopy(c['questions'][0])
        repair_content_integrity(c)
        q = c['questions'][0]
        self.assertIsNone(q['image'])
        self.assertIn('image',q['unavailable_media'])
        self.assertEqual(original['options'],q['options'])
        self.assertEqual(original['answer'],q['answer'])
        self.assertEqual(1,c['integrity_audit']['missing_media_count'])
        repair_content_integrity(c)
        self.assertEqual(1,c['integrity_audit']['missing_media_count'])

    def test_valid_asset_preserved_and_alt_uses_existing_caption(self):
        c = self.fixture()
        q = c['questions'][0]
        q['image']='/static/open-book-icon.png'
        q['caption']='Libro abierto de estudio'
        repair_content_integrity(c)
        self.assertTrue(asset_exists(q['image']))
        self.assertEqual(q['caption'],q['alt'])
        self.assertFalse(asset_exists('/static/../app.py'))
        self.assertFalse(asset_exists('/static/no-existe.png'))

    def test_recovered_original_uses_same_specialty_and_preserves_question(self):
        c = self.fixture()
        q = c['questions'][0]
        q['image'] = None
        q['unavailable_media'] = {'image': {'path': 'static/headers/gastronomia/e2.png?v=3'}}
        repair_content_integrity(c)
        self.assertEqual('/static/headers/gastronomia/e2.webp?v=3', q['image'])
        fresh = self.fixture()
        fresh['questions'][0]['image'] = '/static/headers/gastronomia/e2.png?v=3'
        repair_content_integrity(fresh)
        self.assertEqual('/static/headers/gastronomia/e2.webp?v=3', fresh['questions'][0]['image'])
        self.assertNotIn('image', q['unavailable_media'])
        self.assertEqual(2, q['answer'])
        self.assertEqual(0, c['integrity_audit']['missing_media_count'])
        repair_content_integrity(c)
        self.assertEqual('/static/headers/gastronomia/e2.webp?v=3', q['image'])

    def test_budget_not_multiplied_or_used_as_measured_time(self):
        c = self.fixture()
        repair_content_integrity(c)
        audit=c['time_audit']
        self.assertEqual(1350,audit['available_minutes'])
        self.assertEqual(22500,audit['planned_minutes'])
        for field in ('teacher_total_minutes','student_minutes','occupancy_percent','difference_minutes'):
            self.assertIsNone(audit[field])
        self.assertEqual({'3','4','5','6'},set(audit['sensitivity']))
        self.assertTrue(all(x['required_minutes'] is None for x in audit['sensitivity'].values()))
        self.assertNotIn('simulated_validation',audit)

    def test_generated_context_restores_png_without_claiming_technical_evidence(self):
        c = self.fixture()
        q = c['questions'][0]
        q.update(image=None, unavailable_media={'image': {'path': 'static/headers/acuicultura/e2.png'}})
        repair_content_integrity(c)
        self.assertEqual('/static/headers/acuicultura/e2.png', q['image'])
        self.assertEqual('context', q['media_role'])
        self.assertEqual('ai-generated', q['media_origin'])
        self.assertIn('simulado', q['caption'])
        self.assertEqual(2, q['answer'])

    def test_generated_context_cannot_restore_required_technical_image(self):
        c = self.fixture()
        q = c['questions'][0]
        q.update(image=None, requires_image=True,
                 unavailable_media={'image': {'path': 'static/headers/acuicultura/e2.png'}})
        repair_content_integrity(c)
        self.assertIsNone(q['image'])
        self.assertEqual(1, c['integrity_audit']['missing_media_count'])

    def test_context_replacement_does_not_replace_technical_activity(self):
        c = self.fixture()
        c['explore'] = {'image': '/static/headers/acuicultura/e1.png?v=3'}
        c['questions'][0]['image'] = '/static/headers/acuicultura/e2.png?v=3'
        c['questions'][0]['requires_image'] = True
        repair_content_integrity(c)
        self.assertEqual('/static/headers/acuicultura/e3.webp', c['explore']['image'])
        self.assertEqual('context', c['explore']['replaced_media']['image']['role'])
        self.assertIsNone(c['questions'][0]['image'])

    def test_progress_counts_references_not_repair_metadata(self):
        from collections import Counter
        from tools.course_progress import inventory
        counts, pending = Counter(), set()
        inventory({'image': '/static/open-book-icon.png',
                   'restored_media': {'image': {'image': '/static/open-book-icon.png'}},
                   'items': [{'image': None, 'unavailable_media': {
                       'image': {'path': 'static/nonexistent-progress.png'}}}]}, counts, pending)
        self.assertEqual(1, counts['available'])
        self.assertEqual(1, counts['pending'])
        self.assertEqual({'/static/nonexistent-progress.png'}, pending)

    def test_enrichment_preserves_declared_metadata(self):
        from content import DEFAULT_CONTENT
        c=deepcopy(DEFAULT_CONTENT)
        c['questions'][0]['difficulty']='Inicial'
        c['questions'][0]['skill']='Interpretar informacion'
        c['questions'][0]['criterion']='Criterio existente'
        result=enrich(c,1)
        self.assertEqual('Inicial',result['questions'][0]['difficulty'])
        self.assertEqual('Interpretar informacion',result['questions'][0]['skill'])
        self.assertEqual('Criterio existente',result['questions'][0]['criterion'])
        self.assertIsNone(result['question_calibration']['distribution_valid'])

    def test_optional_context_photo_not_mandatory_evidence(self):
        c=self.fixture()
        c['questions'][0]['form']=1
        repair_content_integrity(c)
        self.assertFalse(any('falta la foto real' in gap for gap in publication_gaps(c)))
        c['questions'][0]['requires_image']=True
        self.assertTrue(any('falta la foto real' in gap for gap in publication_gaps(c)))

    def test_transaction_preserves_student_tables_and_module_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            db=Path(directory)/'test.sqlite3'
            with closing(sqlite3.connect(db)) as con:
                con.execute('CREATE TABLE modules(id INTEGER PRIMARY KEY,course_id INTEGER,position INTEGER,title TEXT,content TEXT)')
                con.execute('CREATE TABLE progress(user_id INTEGER,module_id INTEGER,state TEXT)')
                con.execute('CREATE TABLE courses(id INTEGER PRIMARY KEY,specialty TEXT)')
                con.execute('INSERT INTO courses VALUES(2,?)',('Electricidad',))
                con.execute('INSERT INTO modules VALUES(1,2,1,?,?)',('Mi modulo',json.dumps(self.fixture())))
                con.execute('INSERT INTO progress VALUES(7,1,?)',('Evidencia conservada',))
                con.commit()
            preview=repair_database(str(db))
            self.assertFalse(preview['applied'])
            with closing(sqlite3.connect(db)) as con:
                self.assertEqual('otro.pdf',json.loads(con.execute('SELECT content FROM modules').fetchone()[0])['traceability'][0]['pdf'])
            result=repair_database(str(db),apply=True)
            self.assertTrue(result['protected_tables_unchanged'])
            self.assertTrue(Path(result['backup']).is_file())
            with closing(sqlite3.connect(db)) as con:
                self.assertEqual(('Mi modulo',),con.execute('SELECT title FROM modules').fetchone())
                self.assertEqual('Electricidad',json.loads(con.execute('SELECT content FROM modules').fetchone()[0])['specialty'])
                self.assertEqual(('Evidencia conservada',),con.execute('SELECT state FROM progress').fetchone())


if __name__=='__main__':
    unittest.main()
