"""Add a fingerprinted, fail-closed navigation hook to the existing renderer."""
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

WORLD='259.0a20356fd918231b.js'
WORLD_SHA='0a20356fd918231b5675ae540e2cf826b01a02e195c53f0a4838906912a585b3'
LEARNING='335.b6fefe7eb2bf326e.js'
LEARNING_SHA='2c2a44eca2d7f0f7820bc5cccbb527487e423b2241228fbb7dfc5b577d51ace5'
WORLD_ANCHOR='ac.render(as,af),r9()'
WORLD_HOOK='globalThis.AulaTPNativeRoute?.frame({scene:as,player:iE,indoors:iC,map:ij,specialty:iT,district:iF,room:i4,stations:i7?.stations??i6,colliders:i3,floorY:(i4?.position.y??0)+.12,three:o}),ac.render(as,af),r9()'
LEARNING_ANCHOR='localStorage.setItem((0,f.Ai)(w),JSON.stringify({...N,updatedAt:new Date().toISOString()}))'
LEARNING_HOOK=LEARNING_ANCHOR+",window.dispatchEvent(new CustomEvent('aulatp:quiz-progress',{detail:{specialty:w.specialty,moduleId:w.moduleId,ae:w.ae,questions:w.questions.map(q=>({id:q.id,object:q.object})),answers:N.answers}}))"

def patch(source,expected,anchor,replacement):
    if hashlib.sha256(source).hexdigest()!=expected or source.count(anchor.encode())!=1:
        raise ValueError('Engine fingerprint changed; refusing to patch an unknown build.')
    return source.replace(anchor.encode(),replacement.encode())

def remap_runtime(runtime,chunk,new_digest,available_digests):
    pattern=rb'(?<![0-9])'+chunk.encode()+rb':"([a-f0-9]+)"'
    matches=list(re.finditer(pattern,runtime))
    if len(matches)!=1:raise ValueError(f'Expected one active {chunk} runtime mapping.')
    old_digest=matches[0].group(1).decode()
    if old_digest not in available_digests:raise ValueError(f'Active {chunk} chunk is missing.')
    return runtime[:matches[0].start(1)]+new_digest.encode()+runtime[matches[0].end(1):]

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--expected-base',required=True)
    parser.add_argument('--release',required=True)
    parser.add_argument('--skin-version',required=True)
    parser.add_argument('--activate',action='store_true')
    args=parser.parse_args()
    package=Path(__file__).resolve().parent
    base=Path(args.expected_base)
    chunks=base/'_next/static/chunks'
    # Validate the exact deployed programs before creating or activating a release.
    world=patch((chunks/WORLD).read_bytes(),WORLD_SHA,WORLD_ANCHOR,WORLD_HOOK)
    learning=patch((chunks/LEARNING).read_bytes(),LEARNING_SHA,LEARNING_ANCHOR,LEARNING_HOOK)
    subprocess.run([sys.executable,str(package/'deploy.py'),'--expected-base',args.expected_base,
                    '--release',args.release,'--skin-version',args.skin_version],check=True)
    target=Path('/opt/ciudad-laboral-releases')/args.release
    new_chunks=target/'_next/static/chunks'
    replacements={}
    for name,data,chunk in [(WORLD,world,'259'),(LEARNING,learning,'335')]:
        digest=hashlib.sha256(data).hexdigest()[:16]
        new_name=f'{chunk}.{digest}.js'
        (new_chunks/new_name).write_bytes(data)
        replacements[chunk]=(name.split('.')[1],digest)
    html=(target/'index.html').read_bytes()
    matches=set(re.findall(rb'/_next/static/chunks/(webpack-[\w-]+\.js)',html))
    if len(matches)!=1:raise ValueError('Ambiguous webpack runtime.')
    old_runtime=matches.pop().decode()
    runtime=(new_chunks/old_runtime).read_bytes()
    for chunk,(old,new) in replacements.items():
        available={path.stem.split('.',1)[1] for path in new_chunks.glob(f'{chunk}.*.js')}
        runtime=remap_runtime(runtime,chunk,new,available)
    new_runtime='webpack-'+hashlib.sha256(runtime).hexdigest()[:16]+'.js'
    (new_chunks/new_runtime).write_bytes(runtime)
    destination=target/args.skin_version
    shutil.copy2(package/'native-route.js',destination/'native-route.js')
    scripts=(f'<script defer src="/ciudad_laboral_aulatp/{args.skin_version}/engine/vendor/astar.js"></script>'
             f'<script defer src="/ciudad_laboral_aulatp/{args.skin_version}/native-route.js"></script>').encode()
    for entry in ('index.html','ciudad/index.html'):
        file=target/entry
        if not file.exists():continue
        data=file.read_bytes().replace(old_runtime.encode(),new_runtime.encode()).replace(b'</body>',scripts+b'</body>')
        temporary=file.with_name(file.name+'.native-new');temporary.write_bytes(data);os.replace(temporary,file)
    manifest={'base':str(base),'release':str(target),'native_world_hook':replacements['259'],
              'native_quiz_progress_hook':replacements['335'],'runtime':new_runtime,
              'grading_modified':False,'original_chunks_preserved':True,'activated':False}
    (target/'native-route-release.json').write_text(json.dumps(manifest,indent=2)+'\n')
    if args.activate:
        live=Path('/var/www/ciudad-laboral-aulatp')
        if live.resolve()!=base:raise ValueError('Live release changed.')
        temporary=live.with_name(live.name+'.native-next');os.symlink(target,temporary);os.replace(temporary,live)
        manifest['activated']=True
        metadata=target/'native-route-release.new.json'
        metadata.write_text(json.dumps(manifest,indent=2)+'\n')
        os.replace(metadata,target/'native-route-release.json')
    print(json.dumps(manifest,indent=2))

if __name__=='__main__':main()
