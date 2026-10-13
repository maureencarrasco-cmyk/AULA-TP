"""Build documentary sequences without changing the original activities."""
import argparse
import json
from pathlib import Path
import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OFICIO = ROOT / 'static' / 'themes' / 'oficio'
OUT = ROOT / 'static' / 'media'
OUT.mkdir(parents=True, exist_ok=True)
HEADERS = ROOT / 'static' / 'headers'

FRAMES = {
    1: ['oficio-plano-leyenda.png', 'oficio-escala.png', 'oficio-cruce.png', 'oficio-drenaje.png'],
    2: ['oficio-visor-21c.png', 'oficio-visor-25.png', 'oficio-intervalo.png', 'table-2'],
    3: ['oficio-tramos.png', 'oficio-tuberias.png', 'oficio-cruce.png', 'table-3'],
    4: ['oficio-equipo-ctrl.png', 'table-4', 'oficio-drenaje.png', 'oficio-visor-4c.png'],
}
TABLES = {
    2: [['Punto', 'Valor', 'Unidad'], ['A', '20,0', '°C'], ['B', '25', '—']],
    3: [['Tramo', 'Longitud', 'Unidad'], ['A', '2,5', 'm'], ['B', '150', 'cm'], ['C', '3', 'm']],
    4: [['Ítem', 'Dossier', 'Recibido'], ['Equipo', 'EQ-02', 'EQ-02'], ['Control', 'CTRL-01', 'CTRL-02'], ['Acceso', '30 cm', '24 cm']],
}


def verified_table(mid):
    records = json.loads((ROOT / 'static/original-table-catalog.json').read_text(encoding='utf-8'))['records']
    table = TABLES[mid]
    if not any(row['table'] == table and row['course'] == 'Refrigeración y Climatización'
               and any(location['moduleId'] == mid for location in row['locations']) for row in records):
        raise ValueError(f'Table {mid} does not match the original module')
    return table
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
        (45, 60, 'Paso 4. Contrasta valor, punto y unidad con el registro original.'),
    ],
    3: [
        (0, 15, 'Paso 1. Identifica tramos y unifica unidades.'),
        (15, 30, 'Paso 2. Líquido y succión no se distinguen solo por el color.'),
        (30, 45, 'Paso 3. Un cruce en planta no prueba colisión sin cota.'),
        (45, 60, 'Paso 4. Registra los tramos y sus unidades antes de calcular.'),
    ],
    4: [
        (0, 15, 'Paso 1. Contrasta equipo recibido con el dossier.'),
        (15, 30, 'Paso 2. Contrasta acceso y control con el dossier original.'),
        (30, 45, 'Paso 3. Observa el recinto; el drenaje requiere documentación.'),
        (45, 60, 'Paso 4. Una lectura aislada no confirma funcionamiento estable.'),
    ],
}


def load_frame(name, size=(1280, 864), caption=''):
    im = Image.new('RGB', size, '#edf5fa')
    draw = ImageDraw.Draw(im)
    try:
        font = ImageFont.truetype('arial.ttf', 26)
    except OSError:
        font = ImageFont.load_default()
    image_height = size[1] - 144
    if name.startswith('table-'):
        table = verified_table(int(name.split('-')[1]))
        draw.text((48, 40), 'Registro original del ejercicio · sin datos añadidos', font=font, fill='#123957')
        col_width = (size[0] - 96) // len(table[0])
        for i, row in enumerate(table):
            for j, cell in enumerate(row):
                x, y = 48 + j * col_width, 120 + i * 90
                draw.rectangle((x, y, x + col_width, y + 90), fill='#dceef7' if i == 0 else '#ffffff', outline='#83bdce', width=2)
                draw.text((x + 20, y + 30), str(cell), font=font, fill='#123957')
    else:
        with Image.open(OFICIO / name) as source:
            fitted = ImageOps.contain(source.convert('RGB'), (size[0], image_height), Image.Resampling.LANCZOS)
        im.paste(fitted, ((size[0] - fitted.width) // 2, (image_height - fitted.height) // 2))
    draw.rectangle((0, image_height, size[0], size[1]), fill=(11, 58, 107))
    draw.text((24, image_height + 18), 'REVISIÓN DOCUMENTAL · No demuestra una ejecución técnica', fill='white', font=font)
    words, lines, line = caption.split(), [], ''
    for word in words:
        candidate = (line + ' ' + word).strip()
        if draw.textlength(candidate, font=font) > size[0] - 48:
            lines.append(line)
            line = word
        else:
            line = candidate
    lines.append(line)
    if len(lines) > 2:
        raise ValueError('Caption exceeds the reserved area')
    draw.multiline_text((24, image_height + 62), '\n'.join(lines), fill='white', font=font, spacing=5)
    return np.array(im)


def write_vtt(path, cues):
    def timestamp(seconds):
        minutes, seconds = divmod(seconds, 60)
        hours, minutes = divmod(minutes, 60)
        return f'{hours:02d}:{minutes:02d}:{seconds:02d}.000'

    lines = ['WEBVTT', '']
    for a, b, text in cues:
        lines.append(f'{timestamp(a)} --> {timestamp(b)}')
        lines.append(text)
        lines.append('')
    path.write_text('\n'.join(lines), encoding='utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--modules', nargs='+', type=int, choices=FRAMES, default=list(FRAMES))
    parser.add_argument('--include-context', action='store_true')
    args = parser.parse_args()
    fps = 2
    for mid in args.modules:
        files = FRAMES[mid]
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
    if not args.include_context:
        return
    generic_cues = [
        (0, 5, 'Paso 1. Observa la evidencia antes de decidir.'),
        (5, 10, 'Paso 2. Relaciona el dato con el criterio del aprendizaje.'),
        (10, 15, 'Paso 3. Verifica el resultado y registra lo pendiente.'),
    ]
    for family in ('general', 'electricidad', 'enfermeria', 'climate'):
        frames = []
        for index, (_, _, caption) in enumerate(generic_cues, 2):
            image_path = HEADERS / family / f'e{index}.png'
            image = Image.open(image_path).convert('RGB').resize((960, 540), Image.Resampling.LANCZOS)
            draw = ImageDraw.Draw(image)
            draw.rectangle((0, 468, 960, 540), fill=(11, 58, 107))
            try:
                font = ImageFont.truetype('arial.ttf', 22)
            except OSError:
                font = ImageFont.load_default()
            draw.text((24, 488), caption, fill=(247, 241, 227), font=font)
            frames.extend([np.array(image)] * (5 * fps))
        dest = OUT / f'{family}-secuencia.mp4'
        imageio.mimsave(dest, frames, fps=fps, codec='libx264', quality=7)
        write_vtt(OUT / f'{family}-secuencia.vtt', generic_cues)
        print('wrote', dest, 'frames', len(frames))


if __name__ == '__main__':
    main()
