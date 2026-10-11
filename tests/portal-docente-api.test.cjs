const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const source = fs.readFileSync('static/portal-docente.js', 'utf8');
function context(hostname, fetch) {
  const sandbox = { location: { hostname }, fetch, AbortController, setTimeout, clearTimeout };
  vm.createContext(sandbox);
  vm.runInContext(source.slice(source.indexOf('function portalURL('), source.indexOf('async function boot(')), sandbox);
  return sandbox;
}
test('production uses dedicated API; local development keeps Flask API', () => {
  assert.equal(context('www.aulatpchile.cl').portalURL('/api/courses'), '/portal-docente-api/courses');
  assert.equal(context('127.0.0.1').portalURL('/api/courses'), '/api/courses');
});
test('HTML server error is explained without a JSON parser crash', async () => {
  const api = context('www.aulatpchile.cl', async () => ({ headers: { get: () => 'text/html' }, status: 500 }));
  await assert.rejects(api.requestJSON('/api/courses', {}), /servicio del portal/);
});
test('successful JSON request preserves authentication headers and cookies', async () => {
  const api = context('www.aulatpchile.cl', async (url, options) => {
    assert.equal(url, '/portal-docente-api/teacher');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.headers['X-Aula-Portal'], 'docente');
    return { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ records: [] }) };
  });
  assert.deepEqual(await api.requestJSON('/api/teacher', { headers: { 'X-Aula-Portal': 'docente' } }), { records: [] });
});
