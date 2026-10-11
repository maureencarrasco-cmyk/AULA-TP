import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const source = read('static/app.js');
const snippet = source.slice(source.indexOf('function dashboardSideNav('), source.indexOf('function dashboardExitButton('));
const context = vm.createContext({ icon: name => `<svg data-icon="${name}"></svg>` });
vm.runInContext(snippet, context);

test('the new entry retains the portal destination and the real progress', () => {
  for (const progress of [0, 37, 100]) {
    const html = context.dashboardSideNav('', progress);
    assert.match(html, /href="#progress"/);
    assert.ok(html.includes(`aria-label="Abrir Portal estudiante, ${progress}% de avance"`));
    assert.ok(html.includes(`class="dash-portal-percent">${progress}%`));
    assert.ok(html.includes(`style="width:${progress}%"`));
    assert.match(html, /dash-portal-arrow/);
  }
});
test('the entry clamps invalid percentages and exposes the current page', () => {
  assert.match(context.dashboardSideNav('progress', 180), /aria-current="page"/);
  assert.match(context.dashboardSideNav('', -5), /dash-portal-percent">0%/);
  assert.match(context.dashboardSideNav('', NaN), /dash-portal-percent">0%/);
});
test('the illuminated appearance stays scoped and keeps keyboard and mobile support', () => {
  const css = read('static/student-portal-entry.css');
  assert.match(css, /\.dash-sidebar nav \.dash-progress-link/);
  assert.match(css, /box-shadow:/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\(max-width:760px\)/);
  assert.doesNotMatch(css, /animation:/);
  assert.match(read('static/index.html'), /student-portal-entry\.css\?v=20261011/);
});
test('the entry uses the amber reference while retaining the green progress badge', () => {
  const css = read('static/student-portal-entry.css');
  assert.match(css, /border:2px solid #ffb74a/);
  assert.match(css, /color:#ff8510/);
  assert.match(css, /color:#ff790a/);
  assert.match(css, /background:#e0f6e7/);
  assert.match(css, /pointer-events:none/);
  assert.match(read('static/index.html'), /student-portal-entry\.css\?v=20261011-amber-entry/);
});
