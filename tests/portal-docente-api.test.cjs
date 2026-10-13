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

test('timeouts carry a distinct code rather than hiding authentication failures', async () => {
  const api = context('www.aulatpchile.cl', async () => { throw { name:'AbortError' }; });
  await assert.rejects(api.requestJSON('/api/courses', {}), error => error.code === 'NETWORK_TIMEOUT');
});

function errorView({ loaded = true } = {}) {
  const main = { innerHTML:'existing navigation', insertAdjacentHTML(position,html) { this.notice=html; } };
  const retry = {};
  const sandbox = { state:{user:loaded?{role:'teacher'}:null,cohort:loaded}, fiveModules:()=>loaded?[{}]:[],nav:()=>{},draw:()=>{sandbox.redrawn=true;},esc:String,boot:()=>Promise.resolve(),document:{getElementById:id=>id==='pd-main'?main:retry} };
  vm.createContext(sandbox);
  vm.runInContext(source.slice(source.indexOf('function showLoadError('),source.indexOf("\ndocument.querySelector('.pd-foot')")),sandbox);
  return {sandbox,main,retry};
}

test('a slow refresh retains the loaded demonstration and its navigation with an explicit notice', () => {
  const {sandbox,main,retry}=errorView();
  sandbox.showLoadError({code:'NETWORK_TIMEOUT',message:'Slow refresh'});
  assert.ok(sandbox.redrawn);
  assert.equal(main.innerHTML,'existing navigation');
  assert.match(main.notice,/Se mantiene la demostración ya cargada/);
  assert.equal(typeof retry.onclick,'function');
});

test('access errors and timeouts without authorized loaded data keep the blocking error state', () => {
  for(const [loaded,error] of [[true,{message:'Access denied'}],[false,{code:'NETWORK_TIMEOUT',message:'Slow refresh'}]]) {
    const {sandbox,main}=errorView({loaded});
    sandbox.showLoadError(error);
    assert.match(main.innerHTML,/No se pudo cargar el portal/);
    assert.equal(main.notice,undefined);
    assert.equal(sandbox.redrawn,undefined);
  }
});
