const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
test('shared banner retains live login, logout and filter controls', () => {
  const script = fs.readFileSync(path.join(root, 'static/portal-docente.js'), 'utf8');
  assert.ok(script.includes('banner.append(access)'));
  assert.ok(script.includes("heading.classList.add('pd-unified-filters')"));
  assert.ok(script.includes('login.onsubmit=async'));
  assert.ok(script.includes('logout.onclick=async'));
  assert.ok(fs.existsSync(path.join(root, 'static/portal-docente/panel-docente-banner.png')));
});
test('continuous workspace remains responsive and preserves readable headings', () => {
  const css = fs.readFileSync(path.join(root, 'static/portal-docente-unified.css'), 'utf8');
  assert.ok(css.includes('@media (max-width:640px)'));
  assert.ok(css.includes('max-width:100%'));
  assert.ok(css.includes('box-shadow:none'));
  assert.ok(css.includes('.pd-app .pd-banner-title h1'));
});
test('password toggle does not submit and pending state targets only login submission', () => {
  const script = fs.readFileSync(path.join(root, 'static/portal-docente.js'), 'utf8');
  assert.ok(script.includes('type="button" id="pd-password-toggle"'));
  assert.ok(script.includes("input.type=show?'text':'password'"));
  assert.ok(script.includes("login.querySelector('button[type=\"submit\"]')"));
  assert.ok(script.includes('autocomplete="current-password"'));
});
