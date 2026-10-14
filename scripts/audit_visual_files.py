import argparse
import hashlib
import json
import sqlite3
import struct
import subprocess
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlsplit

import cv2
from PIL import Image

from app import visual_resource_index


def inspect(root,url,kind):
    parsed=urlsplit(url)
    if not url.startswith('/static/'):
        return {'status':'externo_sin_comprobar','limit':'No se descargó ni se comprobó reproducción externa.'}
    path=(root/unquote(parsed.path.lstrip('/'))).resolve()
    if not path.is_relative_to((root/'static').resolve()) or not path.is_file():
        return {'status':'archivo_local_no_disponible'}
    result={'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    try:
        if kind=='Imagen':
            with Image.open(path) as picture:
                result.update(width=picture.width,height=picture.height)
                picture.verify()
            result['status']='lectura_basica_correcta'
            if max(result['width'],result['height'])<640:result['observation']='Revisar tamaño de presentación; dimensiones reducidas no demuestran pixelación.'
        elif kind=='Video':
            capture=cv2.VideoCapture(str(path))
            try:
                opened=capture.isOpened();first_ok,first=capture.read()
                frames=int(capture.get(cv2.CAP_PROP_FRAME_COUNT));fps=capture.get(cv2.CAP_PROP_FPS)
                last_ok=False
                if frames>1:
                    capture.set(cv2.CAP_PROP_POS_FRAMES,frames-1);last_ok,last=capture.read()
                result.update(frames=frames,fps=fps,first_frame=bool(first_ok),last_frame=bool(last_ok))
                if first_ok:result.update(width=first.shape[1],height=first.shape[0])
                result['status']='decodificacion_extremos_correcta' if opened and first_ok and last_ok else 'revision_decodificacion'
                result['limit']='Extremos de video, no reproducción completa ni claridad del audio.'
            finally:capture.release()
            import imageio_ffmpeg
            decoded=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-nostdin','-i',str(path),'-f','null','-'],capture_output=True,timeout=120)
            result['full_decode_exit']=decoded.returncode
            result['status']='decodificacion_completa_correcta' if decoded.returncode==0 else 'revision_decodificacion'
            result['limit']='Decodificación técnica; no valida claridad del audio, contenido ni pertinencia pedagógica.'
        elif path.suffix.lower()=='.glb':
            with path.open('rb') as stream:
                header=stream.read(12)
                magic,version,total=struct.unpack('<4sII',header)
                length,chunk=struct.unpack('<II',stream.read(8))
                if magic!=b'glTF' or version!=2 or total!=result['bytes'] or chunk!=0x4E4F534A:raise ValueError('GLB inválido')
                data=json.loads(stream.read(length))
            result.update(nodes=len(data.get('nodes',[])),meshes=len(data.get('meshes',[])),status='estructura_glb_legible',limit='No valida proporciones, componentes ni representación del oficio.')
        elif path.suffix.lower()=='.gltf':
            data=json.loads(path.read_text(encoding='utf-8'))
            result.update(nodes=len(data.get('nodes',[])),meshes=len(data.get('meshes',[])),status='estructura_gltf_legible',limit='No valida buffers externos ni corrección técnico-profesional.')
        else:result.update(status='existencia_comprobada_formato_no_decodificado')
    except Exception as error:result.update(status='revision_lectura',error=type(error).__name__)
    return result


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--root',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args();root=args.root.resolve();files={};modules=[]
    with sqlite3.connect((root/'data'/'aulatp.sqlite3').as_uri()+'?mode=ro',uri=True) as con:
        for course,mid,title,raw in con.execute('SELECT c.title,m.id,m.title,m.content FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.published=1 ORDER BY c.id,m.position'):
            resources=visual_resource_index(json.loads(raw))
            for item in resources:
                if item['url'] not in files:files[item['url']]=dict(type=item['type'],**inspect(root,item['url'],item['type']))
            modules.append({'course':course,'module_id':mid,'module':title,'resources':resources})
    summary={'courses':len({item['course'] for item in modules}),'modules':len(modules),'unique_resources':len(files),'statuses':dict(Counter(item['status'] for item in files.values()))}
    args.output.write_text(json.dumps({'summary':summary,'files':files,'modules':modules,'limit':'Índice de campos reconocidos, no inventario exhaustivo ni validación pedagógica.'},ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(summary))
