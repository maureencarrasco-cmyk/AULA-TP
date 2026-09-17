"""Genera videos 60 s + VTT de procedimiento a partir del banco de oficio."""
from pathlib import Path
import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OFICIO = ROOT / 'static' / 'themes' / 'oficio'
OUT = ROOT / 'static' / 'media'
OUT.mkdir(parents=True, exist_ok=True)

FRAMES = {
    1: ['oficio-plano-leyenda.png', 'oficio-escala.png', 'oficio-cruce.png', 'oficio-drenaje.png'],
    2: ['oficio-visor-21c.png', 'oficio-visor-25.png', 'oficio-intervalo.png', 'oficio-manometro.png'],
    3: ['oficio-tramos.png', 'oficio-tuberias.png', 'oficio-cruce.png', 'oficio-acceso-cm.png'],
    4: ['oficio-equipo-ctrl.png', 'oficio-acceso-cm.png', 'oficio-drenaje.png', 'oficio-visor-4c.png'],
}
CAPTIONS = {
    1: [
        (0, 15, 'Paso 1. Lee el cajetín y la leyenda antes del color.'),
        (15, 30, 'Paso 2. Verifica la escala de la copia.'),
        (30, 45, 'Paso 3. Un cruce en planta no prueba colisión sin cota.'),
        (45, 60, 'Paso 4. El drenaje necesita origen y destino.'),
    ],
    2: [
        (0, 15, 'Paso 1. Extrae valor, unidad y punto del visor.'),
        (15, 30, 'Paso 2. 25 sin unidad no es una lectura.'),
        (30, 45, 'Paso 3. Comprueba que el intervalo cubra el valor esperado.'),
        (45, 60, 'Paso 4. La presión se lee en la escala del manómetro.'),
    ],
    3: [
        (0, 15, 'Paso 1. Identifica tramos y unifica unidades.'),
        (15, 30, 'Paso 2. Líquido y succión no se distinguen solo por el color.'),
        (30, 45, 'Paso 3. Prepara el puesto y la unión según NCh3241.'),
        (45, 60, 'Paso 4. Verifica acceso y hermeticidad antes de cerrar.'),
    ],
    4: [
        (0, 15, 'Paso 1. Contrasta equipo recibido con el dossier.'),
        (15, 30, 'Paso 2. Mide el acceso lateral contra la ficha.'),
        (30, 45, 'Paso 3. Revisa drenaje y obras previas del recinto.'),
        (45, 60, 'Paso 4. Verifica el control automático antes de firmar.'),
    ],
}


def load_frame(name, size=(960, 540), caption=''):
    src = OFICIO / name
    im = Image.open(src).convert('RGB')
    im = im.resize(size, Image.Resampling.LANCZOS)
    draw = ImageDraw.Draw(im)
    draw.rectangle((0, size[1] - 72, size[0], size[1]), fill=(11, 58, 107))
    try:
        font = ImageFont.truetype('arial.ttf', 22)
    except OSError:
        font = ImageFont.load_default()
    draw.text((24, size[1] - 52), caption, fill=(247, 241, 227), font=font)
    return np.array(im)


def write_vtt(path, cues):
    lines = ['WEBVTT', '']
    for a, b, text in cues:
        lines.append(f'00:{a:02d}.000 --> 00:{b:02d}.000')
        lines.append(text)
        lines.append('')
    path.write_text('\n'.join(lines), encoding='utf-8')


def main():
    fps = 2
    for mid, files in FRAMES.items():
        cues = CAPTIONS[mid]
        frames = []
        for i, name in enumerate(files):
            a, b, text = cues[i]
            frame = load_frame(name, caption=text)
            frames.extend([frame] * ((b - a) * fps))
        dest = OUT / f'm{mid}-secuencia.mp4'
        imageio.mimsave(dest, frames, fps=fps, codec='libx264', quality=7)
        write_vtt(OUT / f'm{mid}-secuencia.vtt', cues)
        print('wrote', dest, 'frames', len(frames))


if __name__ == '__main__':
    main()
