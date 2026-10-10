import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {test} from 'node:test';

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const source = read('static/access.js');
const profileIds = ['read', 'calm', 'guide', 'audio', 'keyboard', 'hivis'];
const toggleIds = ['contrast', 'simple', 'motion', 'speech', 'captions', 'noMouse', 'readingFocus', 'highlightInstructions', 'stepInstructions', 'spacing', 'leading', 'hideTimer'];

function node(dataset = {}) {
  const classes = new Set();
  const attributes = {};
  const selected = {hidden: true};
  return {
    dataset, attributes, selected, innerHTML: '', style: {setProperty() {}},
    classList: {
      add: name => classes.add(name), remove: name => classes.delete(name),
      contains: name => classes.has(name),
      toggle(name, on) { if (on) classes.add(name); else classes.delete(name); }
    },
    setAttribute: (name, value) => { attributes[name] = value; },
    querySelector: selector => selector === '.ax-selected' ? selected : null,
    querySelectorAll: () => [], addEventListener() {}
  };
}

function setup(storage = new Map()) {
  const profiles = profileIds.map(axProfile => node({axProfile}));
  const sizes = ['normal', 'large', 'xlarge'].map(axText => node({axText}));
  const toggles = toggleIds.map(axToggle => node({axToggle}));
  const rates = ['0.75', '1', '1.25', '1.5'].map(axRate => node({axRate}));
  const times = ['1', '1.25', '1.5'].map(axTime => node({axTime}));
  const panel = node();
  panel.querySelectorAll = selector => ({
    '[data-ax-profile]': profiles, '[data-ax-text]': sizes, '[data-ax-toggle]': toggles,
    '[data-ax-rate], [data-ax-time]': [...rates, ...times]
  }[selector] || []);
  const body = node();
  const dialog = node();
  dialog.closed = 0;
  dialog.close = () => { dialog.closed++; };
  const elements = new Map([['tool', dialog]]);
  body.appendChild = el => { elements.set(el.id, el); };
  const document = {
    body, addEventListener() {}, querySelectorAll: () => [],
    querySelector: selector => selector === '.ax-panel' ? panel : null,
    getElementById: id => elements.get(id) || null,
    createElement() {
      const el = node();
      const rate = {value: ''};
      el.querySelector = selector => selector === '#ax-rate' ? rate : null;
      return el;
    }
  };
  const scope = vm.createContext({
    window: {}, document,
    localStorage: {getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value)},
    workIco: name => `<span class="work-ico" data-icon="${name}" aria-hidden="true"></span>`
  });
  vm.runInContext(source, scope);
  const access = scope.window.AulaAccess;
  const click = dataset => panel.onclick({target: {closest: () => ({dataset})}});
  return {access, panel, profiles, sizes, toggles, rates, times, body, dialog, storage, click};
}

test('the reference panel is shared across all 45 courses and station contexts', () => {
  const modules = JSON.parse(execFileSync('.venv/Scripts/python.exe', ['-c', "import sqlite3,json; c=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True); print(json.dumps([dict(id=m,course_id=c) for m,c in c.execute('select id,course_id from modules')]))"], {encoding: 'utf8'}));
  assert.equal(new Set(modules.map(module => module.course_id)).size, 45);
  const app = setup();
  for (const module of modules) {
    for (const station of [1, 2, 3, 4, 5]) {
      app.body.dataset.station = String(station);
      app.access.renderPanel(app.panel);
      assert.equal((app.panel.innerHTML.match(/data-ax-profile=/g) || []).length, 6);
      assert.equal((app.panel.innerHTML.match(/role="switch"/g) || []).length, 12);
      assert.match(app.panel.innerHTML, /id="ax-title">Accesibilidad/);
      assert.match(app.panel.innerHTML, /Guardado automáticamente/);
      assert.match(app.panel.innerHTML, /class="ax-preview-btn" data-ax="close"/);
      assert.ok(!app.panel.innerHTML.includes(`course_id="${module.course_id}"`));
    }
  }
});

test('all profiles retain their behavior, selected check and accessible state', () => {
  const app = setup();
  app.access.renderPanel(app.panel);
  for (const profile of app.profiles) {
    app.click({ax: 'reset'});
    app.click(profile.dataset);
    assert.equal(profile.attributes['aria-pressed'], 'true');
    assert.equal(profile.selected.hidden, false);
    assert.ok(profile.classList.contains('is-on'));
    assert.equal(app.access.prefs.profile, profile.dataset.axProfile);
    app.click(profile.dataset);
    assert.equal(profile.attributes['aria-pressed'], 'false');
    assert.equal(profile.selected.hidden, true);
  }
});

test('switches, sizes and advanced options persist and reset without touching drafts', () => {
  const storage = new Map([['aula-practice-84', '{"text":"Keep this draft"}']]);
  const app = setup(storage);
  app.access.renderPanel(app.panel);
  for (const toggle of app.toggles) {
    app.click(toggle.dataset);
    assert.equal(toggle.attributes['aria-checked'], 'true');
    assert.equal(app.access.prefs[toggle.dataset.axToggle], true);
  }
  for (const size of app.sizes) {
    app.click(size.dataset);
    assert.equal(size.attributes['aria-pressed'], 'true');
    assert.equal(app.sizes.filter(item => item.attributes['aria-pressed'] === 'true').length, 1);
    assert.equal(app.body.dataset.accessText, size.dataset.axText);
  }
  app.click({axRate: '1.25'});
  app.click({axTime: '1.5'});
  const reopened = setup(storage);
  reopened.access.renderPanel(reopened.panel);
  assert.equal(JSON.stringify(reopened.access.prefs), JSON.stringify(app.access.prefs));
  assert.equal(reopened.rates.find(item => item.dataset.axRate === '1.25').attributes['aria-pressed'], 'true');
  assert.equal(reopened.times.find(item => item.dataset.axTime === '1.5').attributes['aria-pressed'], 'true');
  app.click({ax: 'reset'});
  assert.equal(app.access.prefs.text, 'normal');
  assert.equal(app.access.prefs.speechRate, 1);
  assert.equal(app.access.prefs.timeScale, 1);
  assert.ok(app.toggles.every(item => item.attributes['aria-checked'] === 'false'));
  assert.equal(storage.get('aula-practice-84'), '{"text":"Keep this draft"}');
});

test('existing preferences are retained, and Continue closes only the support dialog', () => {
  const storage = new Map([['aula-tp-access', JSON.stringify({text: 'large', motion: true, captions: true})]]);
  const app = setup(storage);
  app.access.renderPanel(app.panel);
  assert.equal(app.sizes[1].attributes['aria-pressed'], 'true');
  assert.equal(app.toggles.find(item => item.dataset.axToggle === 'motion').attributes['aria-checked'], 'true');
  const before = JSON.stringify(app.access.prefs);
  app.click({ax: 'close'});
  assert.equal(app.dialog.closed, 1);
  assert.equal(app.dialog.classList.contains('is-access'), false);
  assert.equal(JSON.stringify(app.access.prefs), before);
});

test('responsive reference styles cover large text, keyboard focus and high contrast', () => {
  const css = read('static/access.css');
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:540px\)/);
  assert.match(css, /#tool \.ax-profiles\{grid-template-columns:1fr/);
  assert.match(css, /body\[data-access-text="xlarge"\] #tool \.ax-panel/);
  assert.match(css, /body.high-contrast #tool/);
  assert.match(css, /focus-visible/);
  assert.match(css, /overscroll-behavior:contain/);
  assert.match(read('static/index.html'), /access\.css\?v=20261010-access-reference/);
  assert.match(read('static/index.html'), /access\.js\?v=20261010-access-reference/);
});
