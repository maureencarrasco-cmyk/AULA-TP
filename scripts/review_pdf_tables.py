"""Extract source-table candidates for documentary exceptions, without editing courses."""
import argparse
import difflib
import json
import re
import sqlite3
from pathlib import Path

import pdfplumber

from audit_curriculum_pdf import normalize


parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,required=True)
parser.add_argument('--audit',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
root=args.root.resolve()
audit=json.loads(args.audit.read_text(encoding='utf-8'))
documents={}
tables={}
review=[]
try:
    for module in audit['modules']:
        pending=[check for check in module['comparisons'] if check['status']=='requiere_revision']
        if not pending:continue
        pdf=module['pdf'];path=(root/pdf).resolve()
        if not path.is_relative_to(root) or not path.is_file():continue
        if pdf not in documents:documents[pdf]=pdfplumber.open(path)
        document=documents[pdf]
        pages={number for check in module['comparisons'] if check['type']=='AE' for number in check['pdf_pages']}
        if not pages:
            needle=normalize(module['module'])
            for index,page in enumerate(document.pages):
                if needle in normalize(page.extract_text() or ''):
                    pages.update(range(index+1,min(index+9,len(document.pages))+1))
        candidates=[]
        for number in sorted(pages):
            key=(pdf,number)
            if key not in tables:
                extracted=[]
                for table in document.pages[number-1].extract_tables():
                    if not table:continue
                    header=normalize(' '.join(str(cell or '') for cell in table[0]))
                    if 'aprendizajesesperados' not in header or 'criteriosdeevaluacion' not in header:continue
                    ae_code=None;ae_title=None
                    for row in table[1:]:
                        if len(row)<3:continue
                        if row[0] and re.fullmatch(r'\s*\d+\.\s*',str(row[0])):
                            ae_code=str(row[0]).strip().rstrip('.')
                            ae_title=row[1]
                            if ae_title:extracted.append({'type':'AE','source_ae':ae_code,'text':ae_title,'pdf_page':number})
                        if row[2]:extracted.append({'type':'Criterio','source_ae':ae_code,'text':row[2],'pdf_page':number})
                tables[key]=extracted
            candidates.extend(tables[key])
        for check in pending:
            declared_ae=next((entry for entry in module['comparisons'] if entry['type']=='AE' and entry['ae']==check['ae']),None)
            canonical=[]
            basis=None;ae_candidate=None
            if declared_ae and check['type']=='Criterio' and normalize(check['text'])==normalize(declared_ae['text']):
                number=re.search(r'AE\s*(\d+)',str(check['ae'] or ''),re.I)
                ae_candidates=[item for item in candidates if item['type']=='AE' and normalize(item['text'])==normalize(declared_ae['text']) and number and item['source_ae']==number.group(1)]
                if ae_candidates:basis='ae_texto_exacto'
                elif number:
                    possible=[(difflib.SequenceMatcher(None,normalize(declared_ae['text']),normalize(item['text']),autojunk=False).ratio(),item) for item in candidates if item['type']=='AE' and item['source_ae']==number.group(1)]
                    possible.sort(key=lambda item:item[0],reverse=True)
                    if possible and possible[0][0]>=0.9:
                        ae_candidate=possible[0][1];ae_candidates=[ae_candidate];basis='asociacion_ae_candidata'
                for source_ae in ae_candidates:
                    canonical.extend(item for item in candidates if item['type']=='Criterio' and item['source_ae']==source_ae['source_ae'] and item['pdf_page']==source_ae['pdf_page'])
            options=[candidate for candidate in candidates if candidate['type']==check['type']]
            scored=[(difflib.SequenceMatcher(None,normalize(check['text']),normalize(candidate['text']),autojunk=False).ratio(),candidate) for candidate in options]
            scored.sort(key=lambda item:item[0],reverse=True)
            score,candidate=scored[0] if scored else (0,None)
            review.append({'course':module['course'],'module_id':module['module_id'],'module':module['module'],
                'ae':check['ae'],'type':check['type'],'original':check['text'],'pdf':pdf,
                'candidate':candidate if score>=0.65 else None,'similarity':round(score,4),
                'source_criteria_for_repeated_ae':canonical,
                'source_criteria_basis':basis,'source_ae_candidate':ae_candidate,
                'status':'candidato_documental_por_verificar' if score>=0.65 else 'sin_candidato_suficiente',
                'limit':'La similitud no valida asociaciones, vigencia normativa ni pertinencia pedagógica. No se modificó el curso.'})
finally:
    for document in documents.values():document.close()
report={'summary':{'cases':len(review),'with_candidate':sum(item['candidate'] is not None for item in review)},'cases':review}
args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report['summary']))
