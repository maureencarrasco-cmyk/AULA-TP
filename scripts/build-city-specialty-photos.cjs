const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'static/encargo-photo-catalog.js'),'utf8'),context);
const catalog=vm.runInContext('ENCARGO_PHOTOS',context);
const ids=['meeting','accounting','crops','forestry','food','cooking','construction','plumbing','assembly','welding','electrical','electronics','cooling','drawing','printing','tools','machining','aircraft','mining','geology','metallurgy','laboratory','nursing','preschool','aquaculture','port','fishing','ship','hotel','tourism','furniture','textile','network','programming','telecom'];
const output=path.join(root,'city-panel/assets/specialties');fs.mkdirSync(output,{recursive:true});
const entries=ids.map(id=>({id,...catalog[id],output:id+'.webp'}));
const python=process.env.PYTHON||(process.platform==='win32'?path.join(root,'.venv/Scripts/python.exe'):'python3');
execFileSync(python,['-c',`
import json,sys
from pathlib import Path
from PIL import Image, ImageOps
root=Path(sys.argv[1]);entries=json.load(sys.stdin)
for item in entries:
    with Image.open(root/'static/encargo-photos'/item['file']) as source:
        source=ImageOps.exif_transpose(source).convert('RGB')
        thumbnail=ImageOps.fit(source,(640,384),method=Image.Resampling.LANCZOS)
        thumbnail.save(root/'city-panel/assets/specialties'/item['output'],'WEBP',quality=82,method=6)
`,root],{input:JSON.stringify(entries)});
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const html=`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fotografías de especialidades · Aula TP Chile</title><style>body{font:16px/1.5 Arial,sans-serif;color:#173a52;max-width:980px;margin:32px auto;padding:0 20px}h1{font-size:28px}ul{list-style:none;padding:0}li{display:grid;grid-template-columns:180px 1fr;gap:20px;padding:20px 0;border-bottom:1px solid #d5e1e8}img{width:180px;height:108px;object-fit:cover;border-radius:8px}a{color:#086c91;overflow-wrap:anywhere}p{margin:5px 0}@media(max-width:500px){li{grid-template-columns:1fr}} </style><h1>Fotografías de especialidades</h1><p>Fotografías originales de Wikimedia Commons. Las miniaturas se recortaron y convirtieron a WebP para su presentación en Ciudad Laboral.</p><ul>${entries.map(item=>`<li><img src="${esc(item.output)}" alt="${esc(item.alt)}" loading="lazy" width="180" height="108"><div><strong>${esc(item.alt)}</strong><p>${esc(item.author)}</p><p><a href="${esc(item.source)}">${esc(item.title)}</a></p><a href="${esc(item.licenseUrl)}">${esc(item.license)}</a></div></li>`).join('')}</ul></html>`;
fs.writeFileSync(path.join(output,'credits.html'),html);
fs.writeFileSync(path.join(output,'catalog.json'),JSON.stringify(entries,null,2)+'\n');
console.log(JSON.stringify({photos:entries.length,bytes:entries.reduce((sum,item)=>sum+fs.statSync(path.join(output,item.output)).size,0)}));
