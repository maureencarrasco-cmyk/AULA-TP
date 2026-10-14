const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

test('sidebar uses the reference waves and the original illustration keeps its true JPEG format', () => {
  const html = fs.readFileSync(path.join(root, 'static/portal-docente.html'), 'utf8');
  assert.match(html, /navigation-waves\.svg/);
  assert.ok(fs.existsSync(path.join(root,'static/portal-docente/navigation-waves.svg')));
  assert.match(fs.readFileSync(path.join(root,'static/portal-docente.js'),'utf8'), /sidebar-foot\.jpg\?v=20261013-verified/);
  const bytes = fs.readFileSync(path.join(root, 'static/portal-docente/sidebar-foot.jpg'));
  assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff');
  assert.equal(bytes.subarray(-2).toString('hex'), 'ffd9');
  assert.ok(bytes.equals(fs.readFileSync(path.join(root, 'static/portal-docente/sidebar-foot.png'))));
});

test('every original teacher photo and logo resolves to a nonempty local asset', () => {
  const source = fs.readFileSync(path.join(root, 'static/portal-docente.js'), 'utf8').split('const state =')[0];
  const resources = JSON.parse(vm.runInNewContext(source + '\nJSON.stringify([...Object.values(PHOTOS),...Object.values(HEAD)].map(photo=>photo[0]))'));
  resources.push('/static/logo-aula-tp-oficial.png');
  for (const resource of new Set(resources)) {
    const file = path.join(root, resource.slice(1));
    assert.ok(fs.statSync(file).size > 1024, resource);
  }
});
