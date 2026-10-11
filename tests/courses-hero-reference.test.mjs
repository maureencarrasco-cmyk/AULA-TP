import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const app = read('static/app.js');
const hero = app.slice(app.indexOf('function dashboardCourseHero('), app.indexOf('function dashboardExitButton('));
const context = vm.createContext({
  icon: name => `<svg data-icon="${name}"></svg>`,
  esc: value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])),
});
vm.runInContext(hero, context);

test('the header retains the live account name, avatar and account action', () => {
  const html = context.dashboardCourseHero({ name: 'Carolina Soto' }, '#course/2');
  assert.match(html, /aria-label="Cuenta de Carolina Soto"/);
  assert.match(html, /data-dashboard-message="Sesi.n activa: Carolina Soto\."/);
  assert.match(html, /<span>C<\/span><b>Carolina Soto<\/b>/);
  assert.doesNotMatch(html, /Estudiante Demo/);
});
test('the reference contains real headings and links to the existing course routes', () => {
  const html = context.dashboardCourseHero({ name: 'Demo' }, '#course/24');
  assert.match(html, /<h1><span>Aprender<\/span><em>haciendo<\/em><\/h1>/);
  assert.match(html, /class="dash-hero-home" href="#courses"/);
  assert.match(html, /class="dash-next" href="#course\/24"/);
  assert.match(html, /Tu pr.ximo <br><b>desaf.o comienza<\/b> <br>aqu./);
  assert.match(html, /III medio/);
  assert.match(html, /MINEDUC/);
  assert.match(context.dashboardCourseHero(null), /Cuenta de Usuario/);
});
test('account and link values are escaped without changing course progress logic', () => {
  const html = context.dashboardCourseHero({ name: '<script>alert(1)</script>' }, '#course/2" onclick="bad');
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /#course\/2&quot; onclick=&quot;bad/);
  const courses = app.slice(app.indexOf('function courseList('), app.indexOf('function dashboardSideNav('));
  assert.match(courses, /item\.href&&item\.pct<100/);
  assert.match(courses, /dashboardSideNav\('',progress\)/);
  assert.match(courses, /button\.onclick=\(\)=>toast\(button\.dataset\.dashboardMessage\)/);
});
test('the photo is optimized and the responsive styles are scoped to the new header', () => {
  const asset = readFileSync(new URL('../static/themes/courses-hero-reference.webp', import.meta.url));
  assert.equal(asset.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(asset.byteLength < 100_000);
  assert.match(hero, /width="1800" height="600" decoding="async" fetchpriority="high"/);
  assert.doesNotMatch(hero, /loading="lazy"/);
  const css = read('static/courses-hero-reference.css');
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /@media\(max-width:380px\)/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /font-size:[^;]*vw|animation:/);
  assert.match(read('static/index.html'), /courses-hero-reference\.css\?v=20261011/);
  assert.match(read('static/index.html'), /app\.js\?v=20261011-courses-hero-v2/);
});
