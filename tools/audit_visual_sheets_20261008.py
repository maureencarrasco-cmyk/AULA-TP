"""Create diagnostic contact sheets only; never edit source images."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'reports'/'microauditoria-actividades-20261008'
data = json.loads((OUT/'revision-documental.json').read_text(encoding='utf-8'))
sources = list(data['imagenes'])
(OUT/'galeria').mkdir(exist_ok=True)
inventory = []
for start in range(0, len(sources), 12):
    sheet = Image.new('RGB', (1800, 1600), 'white')
    draw = ImageDraw.Draw(sheet)
    for slot, ref in enumerate(sources[start:start+12]):
        x, y = slot%3*600, slot//3*400
        path = ROOT/ref.lstrip('/')
        with Image.open(path) as im:
            inventory.append(dict(index=start+slot+1,reference=ref,size=im.size,format=im.format,uses=len(data['imagenes'][ref]),sheet=f'galeria/lamina-{start//12+1:02d}.jpg'))
            thumb = ImageOps.contain(im.convert('RGB'), (590,340))
            sheet.paste(thumb,(x+(600-thumb.width)//2,y+(345-thumb.height)//2))
        label = f'{start+slot+1:03d} | '+ref.replace('/static/','')
        draw.text((x+8,y+350),label,fill='black')
        draw.text((x+8,y+370),str(inventory[-1]['size'])+' | usos: '+str(inventory[-1]['uses']),fill='black')
    sheet.save(OUT/'galeria'/f'lamina-{start//12+1:02d}.jpg',quality=92)
(OUT/'inventario-visual.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(dict(images=len(sources),sheets=(len(sources)+11)//12)))
