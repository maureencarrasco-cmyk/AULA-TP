"""Publish the immersive station quiz and four-choice curriculum updates."""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

LIVE=Path('/var/www/ciudad-laboral-aulatp')
RELEASES=Path('/opt/ciudad-laboral-releases')
STATION_CHUNK=288
PILOT_CHUNK=335
STATION_SHA='c0566d284a160952a94a28b8623c87094cf2bc5e068fcbe182c7879551e1619a'
PILOT_SHA='78b7b17bc8f75201d36280b168bb4bb3439c6901a5e34b42ce8201542bef71de'
STATION_OPTIONS=(
    'f=b.filter(x=>x.id!==c.id).map(x=>x.aes[0].title).filter(x=>x!==a.title).slice(0,2),'
    't=[a.title,...f].map(x=>M(x,160)),r='
)
STATION_OPTIONS_NEW=(
    'f=[...new Set(b.filter(x=>x.id!==c.id).flatMap(x=>x.aes??[]).map(x=>x.title)'
    '.filter(x=>x!==a.title).map(x=>M(x,160)))].slice(0,3),'
    't=[...new Set([a.title,...f,"Ninguna de las alternativas corresponde al aprendizaje esperado del módulo",'
    '"Un objetivo general sin un aprendizaje esperado específico","Una tarea sin relación con el programa del módulo"].map(x=>M(x,160)))].slice(0,4),r='
)
PILOT_OPTIONS=(
    r's([e,...i,"Actuar sin consultar antecedentes","Eliminar el registro que contradice la conclusi\xf3n",'
    r'"Dar por finalizado el trabajo sin evidencia"]).slice(0,3)'
)
PILOT_OPTIONS_NEW=(
    r's([e,...i,"Actuar sin consultar antecedentes","Eliminar el registro que contradice la conclusi\xf3n",'
    r'"Dar por finalizado el trabajo sin evidencia","Seleccionar sin comprobar el criterio ni la evidencia"]).slice(0,4)'
)

def replace_once(source, old, new, name):
    count=source.count(old)
    if count!=1:
        raise ValueError(f'{name}: expected one known source anchor, found {count}.')
    return source.replace(old,new,1)

def mapped_chunk(runtime, chunk_id, directory):
    matches=re.findall(rb'(?<!\d)'+str(chunk_id).encode()+rb':"([a-f0-9]{16})"',runtime)
    if len(matches)!=1:
        raise ValueError(f'Webpack mapping for {chunk_id} is ambiguous.')
    return directory/f'{chunk_id}.{matches[0].decode()}.js'

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--expected-base',required=True)
    parser.add_argument('--release',required=True)
    parser.add_argument('--skin-version',required=True)
    args=parser.parse_args()
    package=Path(__file__).resolve().parent
    base=Path(args.expected_base)
    base_chunks=base/'_next/static/chunks'
    html=(base/'index.html').read_bytes()
    runtime_names=set(re.findall(rb'/_next/static/chunks/(webpack-[\w-]+\.js)',html))
    if len(runtime_names)!=1:
        raise ValueError('Expected one active webpack runtime.')
    runtime_name=runtime_names.pop().decode()
    runtime=(base_chunks/runtime_name).read_bytes()
    station_path=mapped_chunk(runtime,STATION_CHUNK,base_chunks)
    pilot_path=mapped_chunk(runtime,PILOT_CHUNK,base_chunks)
    station=station_path.read_bytes()
    pilot=pilot_path.read_bytes()
    if hashlib.sha256(station).hexdigest()!=STATION_SHA:
        raise ValueError('Station curriculum build changed; refusing to patch it.')
    if hashlib.sha256(pilot).hexdigest()!=PILOT_SHA:
        raise ValueError('Professional quiz build changed; refusing to patch it.')
    station_old=''.join(STATION_OPTIONS).encode()
    station_new=''.join(STATION_OPTIONS_NEW).encode()
    pilot_old=''.join(PILOT_OPTIONS).encode()
    pilot_new=''.join(PILOT_OPTIONS_NEW).encode()
    station=replace_once(station,station_old,station_new,'Station options')
    pilot=replace_once(pilot,pilot_old,pilot_new,'Professional quiz options')

    subprocess.run([sys.executable,str(package/'deploy.py'),'--expected-base',args.expected_base,
                    '--release',args.release,'--skin-version',args.skin_version],check=True)
    target=RELEASES/args.release
    chunks=target/'_next/static/chunks'
    replacements={}
    for chunk_id,data in ((STATION_CHUNK,station),(PILOT_CHUNK,pilot)):
        old_hash=re.search(rb'(?<!\d)'+str(chunk_id).encode()+rb':"([a-f0-9]{16})"',runtime).group(1).decode()
        new_hash=hashlib.sha256(data).hexdigest()[:16]
        (chunks/f'{chunk_id}.{new_hash}.js').write_bytes(data)
        runtime=replace_once(runtime,f'{chunk_id}:"{old_hash}"'.encode(),
                             f'{chunk_id}:"{new_hash}"'.encode(),f'Chunk {chunk_id} mapping')
        replacements[str(chunk_id)]={'from':old_hash,'to':new_hash}
    new_runtime='webpack-'+hashlib.sha256(runtime).hexdigest()[:16]+'.js'
    (chunks/new_runtime).write_bytes(runtime)
    for entry in ('index.html','ciudad/index.html'):
        file=target/entry
        if file.exists():
            data=file.read_bytes().replace(runtime_name.encode(),new_runtime.encode())
            temp=file.with_name(file.name+'.quiz-new')
            temp.write_bytes(data);os.chmod(temp,0o644);os.replace(temp,file)
    manifest={'base':str(base),'release':str(target),'skin_version':args.skin_version,
              'quiz_chunks':replacements,'runtime':new_runtime,'station_options':4,
              'professional_quiz_options':4,'original_content_preserved':True,'activated':False}
    (target/'quiz-ui-release.json').write_text(json.dumps(manifest,indent=2)+'\n')
    if LIVE.resolve(strict=True)!=base:
        raise ValueError('Live release changed during deployment.')
    temporary=LIVE.with_name(LIVE.name+'.quiz-next')
    os.symlink(target,temporary);os.replace(temporary,LIVE)
    manifest['activated']=True
    metadata=target/'quiz-ui-release.new.json'
    metadata.write_text(json.dumps(manifest,indent=2)+'\n');os.replace(metadata,target/'quiz-ui-release.json')
    print(json.dumps(manifest,indent=2))

if __name__=='__main__':
    main()
