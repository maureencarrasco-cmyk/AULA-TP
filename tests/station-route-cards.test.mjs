import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const html=read('static/index.html');
const app=read('static/app.js');
const css=read('static/station-route-cards.css');

test('station cards use the supplied visual direction with real, responsive cards',()=>{
  assert.match(html,/station-route-cards\.css\?v=20261018-course-aware-v1/);
  assert.match(html,/app\.js\?v=20261018-course-aware-stations-v1/);
  assert.match(css,/lr-track:has\(\.mission-laboral-stop\)/);
  assert.match(css,/lr-card-photo img[\s\S]*?object-fit:cover/);
  assert.match(css,/lr-stop\.s1\{--lr:#1676ed/);
  assert.match(css,/lr-stop\.s2\{--lr:#f36e16/);
  assert.match(css,/lr-stop\.s3\{--lr:#7547e8/);
  assert.match(css,/lr-stop\.s4\{--lr:#ef315f/);
  assert.match(css,/lr-stop\.s5\{--lr:#149b65/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(app,/data-action="station" data-n="\$\{m\.stationNumber\}"/);
  assert.match(app,/href="\/api\/city-experience\?course=\$\{encodeURIComponent\(cityCourseId\)\}&module=\$\{encodeURIComponent\(mid\)\}"/);
});

test('station artwork follows the active module and falls back to specialty art',()=>{
  const start=app.indexOf('function routeStationImage(');
  const end=app.indexOf('\nfunction stationModel',start);
  assert.ok(start>=0&&end>start,'routeStationImage helper should exist');
  const source=app.slice(start,end);
  const course={id:45};
  const module={course_id:45,position:7};
  let selected;
  const context={course,module,result:null,
    stationArtworkPhoto:(c,m,n)=>{selected={course:c,module:m,station:n};return {image:'/course/45/module/7/station/4.webp'}},
    stationRouteArt:()=>'/specialty/fallback.webp'};
  vm.runInNewContext(`${source}\nresult=routeStationImage(4,course,module);`,context);
  assert.equal(context.result,'/course/45/module/7/station/4.webp');
  assert.deepEqual(selected,{course,module,station:4});

  const fallback={course,module:null,result:null,stationArtworkPhoto:()=>null,stationRouteArt:(n)=>`/specialty/${n}.webp`};
  vm.runInNewContext(`${source}\nresult=routeStationImage(3,course,module);`,fallback);
  assert.equal(fallback.result,'/specialty/3.webp');
});
