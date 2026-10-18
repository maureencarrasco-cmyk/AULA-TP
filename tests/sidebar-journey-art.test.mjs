import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const app = read('static/app.js');
const courses = app.slice(app.indexOf('function courseList('), app.indexOf('function dashboardSideNav('));

test('courses replace the old illustration and duplicate caption with the supplied artwork', () => {
  assert.match(courses, /class="dash-sidebar-journey"/);
  assert.match(courses, /sidebar-learning-journey\.webp\?v=20261011/);
  assert.match(courses, /alt="Aprender tambi.n es un viaje\. Chile se construye con m.s oportunidades\."/);
  assert.doesNotMatch(courses, /andes-route\.png|dash-sidebar-map|<strong>Chile se construye/);
});
test('artwork retains navigation, real progress and course controls', () => {
  assert.match(courses, /dashboardSideNav\('',progress\)/);
  assert.match(courses, /navigateHash\(card\.dataset\.courseHref\)/);
  assert.match(courses, /href="#progress"/);
  assert.match(courses, /bindHomeLogin\(\)/);
  assert.match(courses, /scrollCourses\(1\)/);
});
test('the illuminated artwork is lightweight, stable and responsive', () => {
  const css = read('static/sidebar-journey-art.css');
  assert.match(css, /\.dashboard-reference \.dash-sidebar-journey/);
  assert.match(css, /box-shadow:/);
  assert.match(css, /overflow-y:auto/);
  assert.match(css, /@media\(max-width:760px\)/);
  assert.doesNotMatch(css, /animation:|position:absolute/);
  assert.match(courses, /width="580" height="974" loading="lazy" decoding="async"/);
  const asset = readFileSync(new URL('../static/sidebar-learning-journey.webp', import.meta.url));
  assert.equal(asset.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(asset.byteLength < 100_000);
  const html = read('static/index.html');
  assert.match(html, /sidebar-journey-art\.css\?v=20261011-glowing-journey/);
  assert.match(html, /app\.js\?v=20261018-city-rewards-v1/);
});
