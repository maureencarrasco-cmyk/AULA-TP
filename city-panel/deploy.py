"""Create a reversible static release; never modify the game's compiled files."""
import argparse
import hashlib
import json
import os
import shutil
from pathlib import Path

LIVE=Path('/var/www/ciudad-laboral-aulatp')
RELEASES=Path('/opt/ciudad-laboral-releases')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--expected-base',required=True)
    parser.add_argument('--release',required=True)
    parser.add_argument('--activate',action='store_true')
    args=parser.parse_args()
    base=LIVE.resolve(strict=True)
    if not LIVE.is_symlink() or str(base)!=args.expected_base:
        raise SystemExit('Live release changed; inspect before proceeding.')
    target=RELEASES/args.release
    if target.parent!=RELEASES or target.name!=args.release or target.exists():
        raise SystemExit('Destination must be a new, directly contained release directory.')
    package=Path(__file__).resolve().parent
    # Hard links keep large models untouched. Replaced HTML gets a new inode below.
    shutil.copytree(base,target,copy_function=os.link,symlinks=True)
    destination=target/'panel-ui-v1'
    destination.mkdir()
    for name in ('city-panel.css','city-panel.js'):
        shutil.copy2(package/name,destination/name)
    shutil.copytree(package/'assets',destination/'assets')
    modified=[]
    for relative in (Path('index.html'),Path('ciudad/index.html')):
        file=target/relative
        if not file.is_file():continue
        original=file.read_bytes()
        if b'city-walk-inspector' not in original:continue
        if b'panel-ui-v1/city-panel.css' in original:
            raise SystemExit('A panel skin already exists; inspect before layering another.')
        replacement=original.replace(b'</head>',b'<link rel="stylesheet" href="/ciudad_laboral_aulatp/panel-ui-v1/city-panel.css"></head>')
        replacement=replacement.replace(b'</body>',b'<script defer src="/ciudad_laboral_aulatp/panel-ui-v1/city-panel.js"></script></body>')
        temporary=file.with_name(file.name+'.panel-new')
        temporary.write_bytes(replacement)
        os.chmod(temporary,0o644)
        os.replace(temporary,file)
        modified.append(str(relative))
    if 'index.html' not in modified:raise SystemExit('Expected city entry point was not found.')
    chunks=list((base/'_next/static/chunks').rglob('*.js'))
    if not chunks:raise SystemExit('Game chunks not found.')
    for chunk in chunks:
        if digest(chunk)!=digest(target/chunk.relative_to(base)):
            raise SystemExit('Game code differs; deployment refused.')
    manifest={'base':str(base),'release':str(target),'html_modified':modified,
              'original_game_chunks_unchanged':len(chunks),'business_logic_modified':False,
              'panel_css_sha256':digest(destination/'city-panel.css'),
              'panel_js_sha256':digest(destination/'city-panel.js')}
    (target/'panel-ui-release.json').write_text(json.dumps(manifest,indent=2)+'\n')
    if args.activate:
        if LIVE.resolve()!=base:raise SystemExit('Live release changed before activation.')
        temporary=LIVE.with_name(LIVE.name+'.panel-next')
        os.symlink(target,temporary)
        os.replace(temporary,LIVE)
    manifest['activated']=args.activate
    print(json.dumps(manifest,indent=2))


if __name__=='__main__':main()
