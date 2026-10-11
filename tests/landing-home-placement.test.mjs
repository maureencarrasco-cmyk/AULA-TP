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
  test(`${directory}: removes only the specified hero blocks and moves the original buttons without changing navigation`, () => {
    const mission = { href: '/mision_laboral/', onClick: () => 'mission' };
    const courses = { href: '/portal/cursos/', onClick: () => 'courses' };
    const demo = { href: '#lead-form', onClick: () => 'demo' };
    const handlers = [mission.onClick, courses.onClick, demo.onClick];
    const actions = container();
    const missionActions = container();
    [mission, courses, demo].forEach(link => actions.appendChild(link));
    const removed = Array.from({ length: 4 }, () => ({ removed: false, remove() { this.removed = true; } }));
    const capabilities = { removed: false, remove() { this.removed = true; } };
    const elements = new Map([
      ['.hero-actions', actions], ['.hero-actions .campus-link', courses],
      ['.mission-promo-enter', mission], ['.tp-home-mission-actions', missionActions],
    ]);
    const hero = { querySelector: selector => elements.get(selector) ?? null, querySelectorAll: () => removed.filter(element => !element.removed) };
    const document = {
      readyState: 'complete', querySelectorAll: () => [],
      querySelector: selector => selector === 'body.landing-refresh #inicio.hero' ? hero : selector === 'body.landing-refresh #inicio.hero + .capabilities' && !capabilities.removed ? capabilities : null,
    };
    const context = { document };
    const script = read(`${directory}/aula-tp-coherence.js`);
    vm.runInNewContext(script, context);
    vm.runInNewContext(script, context);
    assert.deepEqual(actions.children, [courses, demo]);
    assert.deepEqual(missionActions.children, [mission]);
    assert.equal(mission.href, '/mision_laboral/');
    assert.equal(courses.href, '/portal/cursos/');
    assert.equal(demo.href, '#lead-form');
    assert.deepEqual([mission.onClick, courses.onClick, demo.onClick], handlers);
    assert.ok(removed.every(element => element.removed));
    assert.equal(capabilities.removed, true);
  });
}

test('desktop aligns the mission action with the second video and mobile retains a clear reading order', () => {
  const css = read('landing/landing-home-videos.css');
  assert.match(css, /\.tp-home-mission-actions\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*2/s);
  assert.match(css, /\.tp-home-video:last-child\s*\{\s*grid-row:\s*2;/);
  assert.match(css, /@media \(max-width: 950px\)[\s\S]*\.tp-home-mission-actions\s*\{\s*grid-row:\s*3;/);
  assert.match(css, /@media \(max-width: 950px\)[\s\S]*\.tp-home-video:last-child\s*\{\s*grid-row:\s*4;/);
  for (const path of ['landing/portada-video.html', 'static/landing-home-preview.html']) {
    assert.match(read(path), /class="tp-home-mission-actions"/);
  }
});
