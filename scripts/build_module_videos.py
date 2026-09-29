"""Secuencia animada 2D + VTT por módulo publicado con specialty_source.

Cada video se arma solo con datos del módulo: AE oficiales, su primer criterio,
los puntos de inspección de la escena y la consigna. Declara en pantalla que es
una animación didáctica y no una grabación de oficio.
"""
import json
import re
import sqlite3
import sys
from multiprocessing import Pool
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'data' / 'aulatp.sqlite3'
HEADERS = ROOT / 'static' / 'headers'
OUT = ROOT / 'static' / 'media' / 'procedimientos'
W, H, FPS = 960, 540, 4
PANEL_H = 178
NAVY = (10, 34, 64)
GOLD = (240, 196, 90)
INK = (232, 238, 246)
DISCLOSURE = 'Animación didáctica 2D · no es grabación de oficio'

def font(size, bold=False):
    try:
        return ImageFont.truetype('arialbd.ttf' if bold else 'arial.ttf', size)
    except OSError:
        return ImageFont.load_default()


def trim(text, limit):
    text = re.sub(r'\s+', ' ', str(text or '')).strip()
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(' ', 1)[0].rstrip(',;:')
    return cut + '…'


def criterion_text(ae):
    crits = ae.get('criteria') or []
    return re.sub(r'^\d+(\.\d+)*\s*', '', str(crits[0])) if crits else ''


def wrap(draw, text, fnt, width, max_lines):
    words, lines, line = text.split(), [], ''
    for word in words:
        probe = f'{line} {word}'.strip()
        if draw.textlength(probe, font=fnt) <= width:
            line = probe
            continue
        lines.append(line)
        line = word
        if len(lines) == max_lines:
            break
    if line and len(lines) < max_lines:
        lines.append(line)
    if len(lines) == max_lines and ' '.join(lines) != text:
        lines[-1] = lines[-1].rstrip('.,;:') + '…'
    return lines


def backgrounds(key):
    folder = HEADERS / key
    files = []
    for n in (3, 4, 1, 2, 5):
        for ext in ('webp', 'png', 'jpg'):
            path = folder / f'e{n}.{ext}'
            if path.is_file():
                files.append(path)
                break
    return files or [HEADERS / 'general' / 'e3.png']


def slides_for(content, course_title, module_title, position):
    aes = content.get('aes') or []
    slides = [{
        'header': f'Módulo {position} · {course_title}',
        'title': trim(module_title, 90),
        'body': 'Antes de ver: anota qué verifica cada aprendizaje esperado y qué dato quedaría pendiente de confirmar.',
        'seconds': 7,
    }]
    for i, ae in enumerate(aes, 1):
        code = ae.get('official_code') or f'AE {i}'
        body = f'Criterio que se observa: {criterion_text(ae)}'
        slides.append({
            'header': f'{code} · Aprendizaje esperado {i} de {len(aes)}',
            'title': trim(ae.get('short_title') or ae.get('title'), 90),
            'body': trim(body, 190),
            'full': f"{ae.get('short_title') or ae.get('title')}. {body}",
            'pause': True,
            'seconds': 9,
        })
    parts = [p.get('label') for p in (content.get('scene') or {}).get('parts') or [] if p.get('label')]
    if parts:
        slides.append({
            'header': 'Estación 3 · Recorrido del escenario',
            'title': 'Puntos de inspección',
            'body': ' → '.join(parts) + '. Abre cada punto y relaciónalo con un aprendizaje esperado.',
            'seconds': 6,
        })
    prompt = (content.get('scene') or {}).get('prompt') or 'Distingue lo verificado de lo pendiente.'
    slides.append({
        'header': 'Después de ver',
        'title': 'Registra tu conclusión con evidencia',
        'body': trim(prompt, 190),
        'full': f'Registra tu conclusión con evidencia. {prompt}',
        'seconds': 7,
    })
    return slides


def cover(path, index):
    im = Image.open(path).convert('RGB')
    scale = max(W * 1.18 / im.width, H * 1.18 / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.Resampling.LANCZOS)
    spare_x, spare_y = im.width - W, im.height - H
    fx, fy = ((0.5, 0.5), (0.0, 0.2), (1.0, 0.2), (0.0, 1.0), (1.0, 1.0), (0.5, 0.0))[index % 6]
    left, top = round(spare_x * fx), round(spare_y * fy)
    return im.crop((left, top, left + W, top + H))


PAUSE = 'Pausa y anota: ¿qué evidencia demostraría este criterio?'


def base_frame(slide, bg_path, index, total, visible, pause):
    im = cover(bg_path, index).convert('RGBA')
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.rectangle((0, 0, W, PANEL_H), fill=NAVY + (236,))
    small, head, title, body = font(14), font(17, True), font(26, True), font(19)
    chip_w = draw.textlength(DISCLOSURE, font=small) + 20
    draw.rounded_rectangle((W - chip_w - 16, 14, W - 16, 38), radius=10, fill=(255, 255, 255, 38))
    draw.text((W - chip_w - 6, 18), DISCLOSURE, font=small, fill=INK)
    step = f'Paso {index + 1} de {total}'
    draw.text((24, 16), step, font=small, fill=GOLD)
    draw.text((24, 40), trim(slide['header'], 80), font=head, fill=GOLD)
    y = 66
    for line in wrap(draw, slide['title'], title, W - 48, 1):
        draw.text((24, y), line, font=title, fill=(255, 255, 255))
        y += 32
    for line in wrap(draw, slide['body'], body, W - 48, 3)[:visible]:
        draw.text((24, y), line, font=body, fill=INK)
        y += 25
    if pause:
        bold = font(19, True)
        box_w = draw.textlength(PAUSE, font=bold) + 36
        draw.rounded_rectangle((24, H - 64, 24 + box_w, H - 22), radius=12, fill=GOLD + (245,))
        draw.text((42, H - 54), PAUSE, font=bold, fill=NAVY)
    return Image.alpha_composite(im, layer)


def line_count(slide):
    probe = ImageDraw.Draw(Image.new('RGB', (W, 10)))
    return len(wrap(probe, slide['body'], font(19), W - 48, 3))


def render(job):
    out_mp4 = OUT / job['name']
    bgs = [Path(p) for p in job['backgrounds']]
    slides = job['slides']
    total_frames = sum(s['seconds'] for s in slides) * FPS
    writer = imageio.get_writer(
        out_mp4, fps=FPS, codec='libx264', quality=None, macro_block_size=4, pixelformat='yuv420p',
        ffmpeg_log_level='error', ffmpeg_params=['-crf', '30', '-tune', 'stillimage', '-movflags', '+faststart'],
    )
    done = 0
    for i, slide in enumerate(slides):
        lines = line_count(slide)
        cache = {}
        for f in range(slide['seconds'] * FPS):
            t = f / FPS
            visible = min(lines, int(t) + 1)
            pause = bool(slide.get('pause')) and t >= slide['seconds'] - 3
            if (visible, pause) not in cache:
                cache[(visible, pause)] = base_frame(slide, bgs[i % len(bgs)], i, len(slides), visible, pause)
            frame = cache[(visible, pause)].copy()
            draw = ImageDraw.Draw(frame)
            done += 1
            draw.rectangle((0, H - 6, W, H), fill=(0, 0, 0, 160))
            draw.rectangle((0, H - 6, round(W * done / total_frames), H), fill=GOLD + (255,))
            writer.append_data(np.asarray(frame.convert('RGB')))
    writer.close()
    cues, t = ['WEBVTT', ''], 0
    for slide in slides:
        a, b = t, t + slide['seconds']
        cues.append(f'00:{a // 60:02d}:{a % 60:02d}.000 --> 00:{b // 60:02d}:{b % 60:02d}.000')
        text = slide.get('full') or f"{slide['title']}. {slide['body']}"
        if slide.get('pause'):
            text += f' {PAUSE}'
        cues.append(text)
        cues.append('')
        t = b
    (OUT / job['name'].replace('.mp4', '.vtt')).write_text('\n'.join(cues), encoding='utf-8')
    return job['module_id'], job['name'], t


def jobs(only_course=None):
    con = sqlite3.connect(DB)
    rows = con.execute(
        '''SELECT m.id, m.course_id, m.position, m.title, m.content, c.title FROM modules m
           JOIN courses c ON c.id=m.course_id WHERE m.published=1 ORDER BY m.course_id, m.position'''
    ).fetchall()
    con.close()
    out = []
    for mid, cid, pos, mtitle, raw, ctitle in rows:
        if only_course and cid != only_course:
            continue
        content = json.loads(raw or '{}')
        if not content.get('aes') or not isinstance(content.get('specialty_source'), dict):
            continue
        key = content.get('specialty_key') or 'general'
        out.append({
            'module_id': mid,
            'name': f'{key}-c{cid}-m{pos}.mp4',
            'backgrounds': [str(p) for p in backgrounds(key)],
            'slides': slides_for(content, ctitle, mtitle, pos),
        })
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    args = [a for a in sys.argv[1:] if a != '--force']
    only = int(args[0]) if args else None
    todo = jobs(only)
    if '--force' not in sys.argv:
        todo = [j for j in todo if not (OUT / j['name'].replace('.mp4', '.vtt')).is_file()]
    with Pool(6) as pool:
        for n, (mid, name, seconds) in enumerate(pool.imap_unordered(render, todo), 1):
            print(f'{n}/{len(todo)} módulo {mid} {name} {seconds}s', flush=True)


if __name__ == '__main__':
    main()
