import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
function container() {
  return {
    children: [],
    get firstChild() { return this.children[0]; },
    appendChild(child) {
      if (child.parentElement) child.parentElement.children.splice(child.parentElement.children.indexOf(child), 1);
      this.children.push(child);
      child.parentElement = this;
    },
    insertBefore(child, before) {
      if (child === before) return;
      if (child.parentElement) child.parentElement.children.splice(child.parentElement.children.indexOf(child), 1);
      const index = before ? this.children.indexOf(before) : this.children.length;
      this.children.splice(index, 0, child);
      child.parentElement = this;
    },
  };
}

for (const directory of ['landing', 'static']) {
  for (const legacySlot of [false, true]) {
  test(`${directory}: groups the original buttons without changing navigation (legacy slot: ${legacySlot})`, () => {
    const mission = { href: '/mision_laboral/', onClick: () => 'mission' };
    const courses = { href: '/portal/cursos/', onClick: () => 'courses' };
    const demo = { href: '#lead-form', onClick: () => 'demo', querySelector: () => ({}) };
    const handlers = [mission.onClick, courses.onClick, demo.onClick];
    const actions = container();
    const missionActions = container();
    const copy = container();
    [mission, courses, demo].forEach(link => actions.appendChild(link));
    if (legacySlot) missionActions.appendChild(mission);
    const removed = Array.from({ length: 4 }, () => ({ removed: false, remove() { this.removed = true; } }));
    const capabilities = { removed: false, remove() { this.removed = true; } };
    const elements = new Map([
      ['.hero-actions', actions], ['.hero-copy', copy], ['.campus-link', courses], ['.hero-actions .button-outline', demo],
      ['.mission-promo-enter', mission], ['.tp-home-mission-actions', missionActions],
    ]);
    const hero = { querySelector: selector => selector === '.tp-home-student' ? copy.children.find(child => child.className === 'tp-home-student') : elements.get(selector) ?? null, querySelectorAll: () => removed.filter(element => !element.removed) };
    const document = {
      readyState: 'complete', querySelectorAll: () => [],
      querySelector: selector => selector === 'body.landing-refresh #inicio.hero' ? hero : selector === 'body.landing-refresh #inicio.hero + .capabilities' && !capabilities.removed ? capabilities : null,
      createElement: () => ({ ...container(), setAttribute() {} }),
    };
    const context = { document };
    const script = read(`${directory}/aula-tp-coherence.js`);
    vm.runInNewContext(script, context);
    vm.runInNewContext(script, context);
    assert.deepEqual(actions.children, [courses, mission, demo]);
    assert.deepEqual(missionActions.children, []);
    assert.equal(mission.href, '/mision_laboral/');
    assert.equal(courses.href, '/portal/cursos/');
    assert.equal(demo.href, '#lead-form');
    assert.deepEqual([mission.onClick, courses.onClick, demo.onClick], handlers);
    assert.ok(removed.every(element => element.removed));
    assert.equal(capabilities.removed, true);
    assert.equal(copy.children.length, 1);
    assert.equal(copy.children[0].className, 'tp-home-student');
    assert.equal(copy.children[0].children[0].src, '/landing/hero-estudiante-recorte.png');
    assert.match(copy.children[0].children[0].alt, /Estudiante/);
  });
  }
}

test('desktop groups the videos in the right column and mobile retains a clear reading order', () => {
  const css = read('landing/landing-home-videos.css');
  assert.match(css, /\.hero-media\.tp-home-videos\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*1/s);
  assert.match(css, /@media \(max-width: 950px\)[\s\S]*\.hero-media\.tp-home-videos\s*\{\s*grid-column:\s*1;\s*grid-row:\s*2;/);
  assert.match(css, /\.hero-actions\s*\{[^}]*flex-direction:\s*column/s);
  for (const path of ['landing/portada-video.html', 'static/landing-home-preview.html']) {
    assert.doesNotMatch(read(path), /class="tp-home-mission-actions"/);
  }
  assert.match(read('static/landing-home-preview.html'), /class="tp-home-student"/);
  assert.match(read('landing/aula-tp-coherence.js'), /\/landing\/hero-estudiante-recorte\.png/);
});
