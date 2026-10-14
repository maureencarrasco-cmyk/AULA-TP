import argparse
import json
import re
from pathlib import Path

from audit_curriculum_pdf import normalize


parser=argparse.ArgumentParser()
parser.add_argument('audit',type=Path)
parser.add_argument('tables',type=Path)
args=parser.parse_args()
audit=json.loads(args.audit.read_text(encoding='utf-8'))
reviews=json.loads(args.tables.read_text(encoding='utf-8'))
lookup={(row['module_id'],row['type'],row['ae'],row['original']):row for row in reviews['cases']}
resolved=0
for module in audit['modules']:
    for check in module['comparisons']:
        row=lookup.get((module['module_id'],check['type'],check['ae'],check['text']))
        if not row or not row['candidate']:continue
        candidate=row['candidate']
        ae=re.search(r'AE\s*(\d+)',str(check['ae'] or ''),re.I)
        same_ae=ae and ae.group(1)==candidate.get('source_ae')
        source_code=re.match(r'\s*(\d+\.\d+)',candidate['text'])
        original_code=re.match(r'\s*(\d+\.\d+)',str(check['text']))
        same_code=check['type']=='AE' or (source_code and original_code and source_code.group(1)==original_code.group(1))
        if same_ae and same_code and normalize(candidate['text'])==normalize(check['text']) and check['status']!='coincidencia_documental':
            check.update(status='coincidencia_documental',reason=None,pdf_pages=[candidate['pdf_page']],method='tabla_pdf')
            resolved+=1
checks=[check for module in audit['modules'] for check in module['comparisons']]
audit['summary']['matches']=sum(check['status']=='coincidencia_documental' for check in checks)
audit['summary']['review']=len(checks)-audit['summary']['matches']
audit['summary']['resolved_by_table']=sum(check.get('method')=='tabla_pdf' for check in checks)
args.audit.write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'resolved_now':resolved,'summary':audit['summary']}))
