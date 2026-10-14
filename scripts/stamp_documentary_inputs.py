import argparse
import hashlib
import json
import sqlite3
from pathlib import Path


parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,required=True)
parser.add_argument('--audit',type=Path,required=True)
args=parser.parse_args()
report=json.loads(args.audit.read_text(encoding='utf-8'))
with sqlite3.connect((args.root.resolve()/'data'/'aulatp.sqlite3').as_uri()+'?mode=ro',uri=True) as con:
    rows={row[0]:row for row in con.execute('SELECT m.id,c.title,m.title,m.content FROM modules m JOIN courses c ON c.id=m.course_id')}
    for module in report['modules']:
        row=rows.get(module['module_id'])
        if not row or row[1]!=module['course'] or row[2]!=module['module']:raise ValueError('El catálogo cambió: repetir el cotejo')
        content=json.loads(row[3]);declared=[]
        for ae in content.get('aes') or []:
            if not isinstance(ae,dict):continue
            code=ae.get('official_code') or ae.get('code')
            declared.append(('AE',code,ae.get('title') or ''))
            for criterion in ae.get('criteria') or []:
                if isinstance(criterion,dict):criterion=criterion.get('text') or criterion.get('description') or criterion.get('title') or ''
                declared.append(('Criterio',code,criterion))
        compared=[(item['type'],item['ae'],item['text']) for item in module['comparisons']]
        if declared!=compared:raise ValueError('Enunciados cambiados: repetir el cotejo')
        module['content_sha256']=hashlib.sha256(row[3].encode('utf-8')).hexdigest()
args.audit.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'inputs_verified':len(report['modules'])}))
