import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

function element(text = '') {
  const classes = new Set();
  const attributes = new Map();
  return {
    textContent: text, children: [], attributes,
    classList: { contains: name => classes.has(name), add: (...names) => names.forEach(name => classes.add(name)) },
    setAttribute(name, value) { attributes.set(name, value); },
    appendChild(child) { this.children.push(child); },
    replaceChildren(...children) { this.children = children; },
  };
}

for (const directory of ['landing', 'static']) {
  test(`${directory}: the city badge keeps its original text and remains non-interactive after repeated initialization`, () => {
    const badge = element(' Ciudad Laboral \u00b7 Aula TP Chile ');
    const document = {
      readyState: 'complete', querySelectorAll: () => [],
      querySelector: selector => selector === 'body.landing-refresh #ciudad-laboral .city-promo-badge' ? badge : null,
      createElement: () => element(),
    };
    const script = read(`${directory}/aula-tp-coherence.js`);
    vm.runInNewContext(script, { document });
    const children = badge.children;
    vm.runInNewContext(script, { document });
    assert.equal(badge.children, children);
    assert.equal(badge.children[1].textContent, 'Ciudad Laboral \u00b7 Aula TP Chile');
    assert.equal(badge.children[0].children[0].attributes.get('data-lucide'), 'building-2');
    assert.equal(badge.children[2].children[0].attributes.get('data-lucide'), 'chevron-right');
    assert.equal(badge.attributes.has('href'), false);
    assert.equal(badge.attributes.has('role'), false);
    assert.equal(badge.attributes.has('tabindex'), false);
    assert.equal(badge.children[0].attributes.get('aria-hidden'), 'true');
    assert.equal(badge.children[2].attributes.get('aria-hidden'), 'true');
  });
  test(`${directory}: styles only the three homepage entry links without changing navigation`, () => {
    const selectors = ['#inicio .mission-promo-enter', '#inicio .campus-link', '#ciudad-laboral .city-promo-enter'];
    const labels = ['Entrar a Mision Laboral', 'Entrar a cursos', 'Entrar a Ciudad Laboral'];
    const destinations = ['/mision_laboral/', '/portal/cursos/', '/ciudad_laboral_aulatp/'];
    const links = selectors.map((_, index) => {
      const link = element(`${labels[index]} \u2192`);
      link.setAttribute('href', destinations[index]);
      link.clickHandler = () => destinations[index];
      return link;
    });
    const handlers = links.map(link => link.clickHandler);
    const document = {
      readyState: 'complete',
      querySelectorAll: selector => selectors.includes(selector) ? [links[selectors.indexOf(selector)]] : [],
      querySelector: () => null,
      createElement: () => element(),
    };
    const context = { document, window: { lucide: { createIcons() {} } } };
    const script = read(`${directory}/aula-tp-coherence.js`);
    vm.runInNewContext(script, context);
    const firstChildren = links.map(link => link.children);
    vm.runInNewContext(script, context);
    links.forEach((link, index) => {
      assert.equal(link.attributes.get('href'), destinations[index]);
      assert.equal(link.clickHandler, handlers[index]);
      assert.equal(link.children, firstChildren[index]);
      assert.equal(link.children.length, 3);
      assert.equal(link.children[1].textContent, labels[index]);
      assert.equal(link.children[0].attributes.get('aria-hidden'), 'true');
      assert.equal(link.children[2].attributes.get('aria-hidden'), 'true');
      assert.ok(link.classList.contains('tp-primary-action'));
    });
  });
}

test('published and preview button styles match and respect reduced motion', () => {
  const css = read('static/landing-home-actions.css');
  assert.equal(css, read('landing/landing-home-actions.css'));
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /focus-visible/);
});
