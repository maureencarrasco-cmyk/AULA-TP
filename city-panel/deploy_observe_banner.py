"""Deploy the supplied Observe-stage artwork into every rendered 3D specialty."""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from deploy_native_route import WORLD_HOOK

LIVE=Path('/var/www/ciudad-laboral-aulatp')
RELEASES=Path('/opt/ciudad-laboral-releases')
WORLD_CHUNK='259'
WORLD_SHA='ed41456418404143f4e7a7a1792b88834a036adeae6177f218dc285d6bbdfb87'
WORLD_HOOK_WITH_STATIONS=WORLD_HOOK.replace('three:o}', 'three:o,phaseStations:i6}')


def patch_world(source):
    if hashlib.sha256(source).hexdigest()!=WORLD_SHA or source.count(WORLD_HOOK.encode())!=1:
        raise ValueError('The deployed 3D build differs from the verified quiz-route release.')
    return add_phase_station_context(source)


def add_phase_station_context(source):
    if source.count(WORLD_HOOK.encode())!=1:
        raise ValueError('The expected native-route hook is missing or ambiguous.')
    return source.replace(WORLD_HOOK.encode(),WORLD_HOOK_WITH_STATIONS.encode())


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--expected-base',required=True)
    parser.add_argument('--release',required=True)
    parser.add_argument('--skin-version',required=True)
    parser.add_argument('--activate',action='store_true')
    args=parser.parse_args()
    base=Path(args.expected_base)
    package=Path(__file__).resolve().parent
    artwork=package/'assets/quiz-observe-stage.png'
    if not artwork.is_file():raise SystemExit('The supplied Observe-stage artwork is missing.')
    subprocess.run([sys.executable,str(package/'deploy.py'),'--expected-base',str(base),
                    '--release',args.release,'--skin-version',args.skin_version],check=True)
    target=RELEASES/args.release
    html_file=target/'index.html'
    html=html_file.read_bytes()
    runtime_matches=set(re.findall(rb'/_next/static/chunks/(webpack-[\w-]+\.js)',html))
    if len(runtime_matches)!=1:raise SystemExit('Ambiguous webpack runtime in the entry page.')
    old_runtime=runtime_matches.pop().decode()
    runtime_path=target/'_next/static/chunks'/old_runtime
    runtime=runtime_path.read_bytes()
    mapping=re.compile(rb'259:"([a-f0-9]{16})"')
    matches=list(mapping.finditer(runtime))
    if len(matches)!=1:raise SystemExit('The world renderer mapping changed.')
    old_hash=matches[0].group(1).decode()
    if old_hash!=WORLD_SHA[:16]:raise SystemExit('The world renderer is not the verified release.')
    source_path=target/'_next/static/chunks'/f'{WORLD_CHUNK}.{old_hash}.js'
    updated_world=patch_world(source_path.read_bytes())
    new_hash=hashlib.sha256(updated_world).hexdigest()[:16]
    new_world=f'{WORLD_CHUNK}.{new_hash}.js'
    (source_path.parent/new_world).write_bytes(updated_world)
    new_runtime=runtime.replace(matches[0].group(0),f'259:"{new_hash}"'.encode())
    runtime_name='webpack-'+hashlib.sha256(new_runtime).hexdigest()[:16]+'.js'
    (runtime_path.parent/runtime_name).write_bytes(new_runtime)
    for relative in ('index.html','ciudad/index.html'):
        entry=target/relative
        if not entry.is_file():continue
        data=entry.read_bytes().replace(old_runtime.encode(),runtime_name.encode())
        temporary=entry.with_name(entry.name+'.observe-new')
        temporary.write_bytes(data);os.chmod(temporary,0o644);os.replace(temporary,entry)
    panel_manifest=target/'panel-ui-release.json'
    if panel_manifest.exists():
        panel_state=json.loads(panel_manifest.read_text())
        panel_state['original_game_chunks_unchanged']=False
        panel_state['quiz_logic_modified']=False
        panel_state['world_renderer_visual_hook']=new_hash
        temporary_manifest=target/'panel-ui-release.new.json'
        temporary_manifest.write_text(json.dumps(panel_state,indent=2)+'\n')
        os.replace(temporary_manifest,panel_manifest)
    manifest={'base':str(base),'release':str(target),'skin_version':args.skin_version,
              'world_chunk':{'from':old_hash,'to':new_hash},
              'phase_stations_exposed':True,'supplied_artwork':'assets/quiz-observe-stage.png',
              'quiz_interaction_preserved':True,'other_quiz_chunks_preserved':True,
              'activated':False}
    metadata=target/'observe-stage-banner-release.json'
    metadata.write_text(json.dumps(manifest,indent=2)+'\n')
    if args.activate:
        if not LIVE.is_symlink() or LIVE.resolve()!=base:raise SystemExit('Live release changed; refusing activation.')
        temporary=LIVE.with_name(LIVE.name+'.observe-next')
        os.symlink(target,temporary);os.replace(temporary,LIVE)
        manifest['activated']=True
        temporary_metadata=target/'observe-stage-banner-release.new.json'
        temporary_metadata.write_text(json.dumps(manifest,indent=2)+'\n')
        os.replace(temporary_metadata,metadata)
    print(json.dumps(manifest,indent=2))


if __name__=='__main__':main()
