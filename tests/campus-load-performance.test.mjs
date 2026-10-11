import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = name => readFileSync(new URL(`../static/${name}`, import.meta.url), 'utf8');

test('session and catalog begin early, in order, without duplicate requests', async () => {
  const calls = [];
  const context = vm.createContext({ window: {}, AbortController, setTimeout, clearTimeout,
    fetch: async (url, options) => {
      calls.push(url);
      assert.equal(options.cache, 'no-store');
      assert.equal(options.credentials, 'same-origin');
      return { ok: true, headers: { get: () => 'application/json' }, json: async () => url.endsWith('/session') ? { user: { id: 1 }, csrf: 'test' } : [{ id: 1 }] };
    },
  });
  vm.runInContext(read('campus-bootstrap.js'), context);
  const app = read('app.js');
  vm.runInContext("let auth={};" + app.slice(app.indexOf('async function api('), app.indexOf('async function cachedApi(')), context);
  assert.equal((await context.api('/session')).user.id, 1);
  assert.equal((await context.api('/courses?compact=1'))[0].id, 1);
  assert.deepEqual(calls, ['/api/session', '/api/courses?compact=1']);
});

test('an anonymous session does not request protected catalog data', async () => {
  const calls = [];
  const context = vm.createContext({ window: {}, AbortController, setTimeout, clearTimeout,
    fetch: async url => { calls.push(url); return { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ user: null }) }; },
  });
  vm.runInContext(read('campus-bootstrap.js'), context);
  assert.equal(await context.window.AulaCampusBoot.courses, null);
  assert.deepEqual(calls, ['/api/session']);
});

test('HTML errors are reported without a raw JSON parser error', async () => {
  const context = vm.createContext({ window: {}, AbortController, setTimeout, clearTimeout,
    fetch: async () => ({ ok: false, headers: { get: () => 'text/html' } }),
  });
  vm.runInContext(read('campus-bootstrap.js'), context);
  await assert.rejects(context.window.AulaCampusBoot.session, /servicio/);
});

test('module photo catalog is loaded once and can retry after a failed download', async () => {
  const scripts = [];
  const document = { createElement: () => ({ remove() {} }), head: { appendChild: script => scripts.push(script) } };
  const app = read('app.js');
  const context = vm.createContext({ document });
  vm.runInContext('let situationCatalogPromise;\n' + app.slice(app.indexOf('function ensureSituationCatalog('), app.indexOf('function toast(')), context);
  const first = context.ensureSituationCatalog();
  assert.equal(context.ensureSituationCatalog(), first);
  assert.equal(scripts.length, 1);
  scripts[0].onerror();
  await assert.rejects(first, /im.genes/);
  const retry = context.ensureSituationCatalog();
  assert.equal(scripts.length, 2);
  scripts[1].onload();
  await retry;
});

test('courses do not download the large photo catalog before it is needed', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /<script src="\/static\/situation-photo-catalog\.js/);
  assert.ok(html.indexOf('campus-bootstrap.js') < html.indexOf('app.js?v='));
  assert.match(read('app.js'), /await ensureSituationCatalog\(\);if\(seq!==routeSeq\)return;renderModule\(n\)/);
});
