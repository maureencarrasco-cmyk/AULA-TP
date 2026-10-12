import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const scope = { document:{readyState:'loading',addEventListener(){}},addEventListener(){},
  esc:value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])) };
scope.window=scope;
vm.createContext(scope);
for (const file of ['course-artwork-catalog.js','course-artwork.js','specialty-theme.js','campus-menu-media.js']) vm.runInContext(read(`static/${file}`),scope);
const rows=Object.values(scope.AulaCourseArtworkData.courses);

test('all 45 courses and 451 modules have distinct existing licensed photographs',()=>{
  assert.equal(rows.length,45);
  assert.equal(rows.reduce((total,row)=>total+row.modules.length,0),451);
  const used=new Set(), sources=new Set();
  for(const row of rows)for(const photo of [row.cover,...row.modules.map(m=>m.photo)]){
    assert.match(photo.image,/^\/static\/(encargo|situation)-photos\/[^/]+\.jpg$/);
    const bytes=readFileSync(new URL(photo.image.slice(1),root));
    assert.equal(bytes[0],255);assert.equal(bytes[1],216);
    const hash=createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash,photo.fingerprint);
    assert.ok(!used.has(hash),`Repeated image: ${photo.image}`);
    assert.ok(!sources.has(photo.source),`Repeated source: ${photo.source}`);
    assert.ok(photo.author&&photo.license&&photo.alt);
    assert.match(photo.source,/^https:\/\/commons\.wikimedia\.org\//);
    used.add(hash);sources.add(photo.source);
  }
  assert.equal(used.size,496);
});
test('all selected files fully decode as photographs, not HTML or truncated downloads',()=>{
  const images=rows.flatMap(row=>[row.cover.image,...row.modules.map(module=>module.photo.image)]);
  const python=process.env.PYTHON||(existsSync(new URL('.venv/Scripts/python.exe',root))?fileURLToPath(new URL('.venv/Scripts/python.exe',root)):'python3');
  const result=JSON.parse(execFileSync(python,['-c',`import json,sys
from PIL import Image
failed=[]
for path in json.loads(sys.argv[1]):
    try:
        with Image.open(path.lstrip('/')) as image:
            image.load()
            if image.width<200 or image.height<100: failed.append(path)
    except Exception as error: failed.append(dict(path=path,error=str(error)))
print(json.dumps(failed))`,JSON.stringify(images)],{cwd:fileURLToPath(root),encoding:'utf8'}));
  assert.deepEqual(result,[]);
});
test('course and module selection remain correct after the legacy menu overrides load',()=>{
  for(const row of rows){
    const course={id:row.id,title:row.title,modules:row.modules};
    assert.equal(scope.specialtyCover(course),row.cover.image);
    assert.equal(scope.heroPhoto(course),row.cover.image);
    assert.equal(scope.specialtyCover({title:row.title}),row.cover.image);
    for(const [index,module] of row.modules.entries()){
      const before=JSON.stringify(course);
      assert.equal(scope.moduleStopArt(course,index),module.photo.image);
      assert.equal(scope.moduleArtworkPhoto(course,module).image,module.photo.image);
      scope.current={...module,course_id:row.id};
      const stationImages=[];
      for(let station=1;station<=5;station++){
        const photo=scope.stationArtworkPhoto(course,module,station);
        assert.equal(scope.stationHeaderArt(station,course),photo.image);
        stationImages.push(photo.image);
      }
      assert.equal(stationImages[0],module.photo.image);
      assert.equal(new Set(stationImages).size,5);
      assert.equal(JSON.stringify(course),before);
    }
  }
});
test('production IDs can differ without selecting the photograph of another specialty',()=>{
  const row=rows.find(row=>row.id===6), course={id:999,title:row.title};
  assert.equal(scope.courseArtworkPhoto(course).image,row.cover.image);
  assert.equal(scope.moduleArtworkPhoto(course,{id:999,position:2,title:row.modules[1].title}).image,row.modules[1].photo.image);
  assert.equal(scope.courseArtworkPhoto({id:6,title:'An unrelated course'}),null);
  assert.equal(scope.moduleArtworkPhoto({title:row.title},{position:99}),null);
});
test('photographer credits are escaped and never accept executable links',()=>{
  const credit=scope.courseArtworkCredit({...rows[0].cover,author:'<script>bad</script>'});
  assert.match(credit,/&lt;script&gt;/);
  assert.match(credit,/rel="noopener noreferrer"/);
  assert.equal(scope.courseArtworkCredit({source:'javascript:bad()'}),'');
});
test('the lightweight catalog loads before the application and retains lazy module images',()=>{
  const html=read('static/index.html'), app=read('static/app.js');
  assert.ok(html.indexOf('/static/course-artwork-catalog.js')<html.indexOf('/static/course-artwork.js'));
  assert.ok(html.indexOf('/static/course-artwork.js')<html.indexOf('/static/app.js'));
  assert.ok(readFileSync(new URL('static/course-artwork-catalog.js.gz',root)).length<75_000);
  assert.match(app,/loading="\$\{i<4\?'eager':'lazy'\}"/);
  assert.match(app,/courseArtworkCredit\(moduleArtworkPhoto\(c,i\)\)/);
  assert.match(read('static/student-progress.js'),/artwork\?\.image\|\|photo\(m,4\)/);
});
