import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
function node(text = '') {
  const classes = new Set();
  return {
    textContent: text, children: [],
    classList: { contains: name => classes.has(name), add: name => classes.add(name) },
    setAttribute() {},
    appendChild(child) { this.children.push(child); child.parentElement = this; },
    insertBefore(child) { this.children.unshift(child); child.parentElement = this; },
    replaceChildren(...children) { this.children = children; },
  };
}

for (const directory of ['landing', 'static']) {
  test(`${directory}: demo styling preserves controls, values, options and submit handler`, () => {
    const form = node();
    const heading = node('Solicitar una demo');
    const submit = node('Enviar solicitud');
    const handler = () => 'existing submission';
    submit.submitHandler = handler;
    const controls = ['establecimiento', 'cargo', 'especialidad'].map((name, index) => {
      const control = node();
      Object.assign(control, { name, tagName: index ? 'SELECT' : 'INPUT', value: `value-${index}`, required: true, options: ['existing option'] });
      node().appendChild(control);
      return control;
    });
    form.querySelector = selector => selector === 'h3' ? heading : selector === 'button[type="submit"]' ? submit : controls.find(control => selector === `[name="${control.name}"]`) || null;
    const document = {
      readyState: 'complete', createElement: () => node(), querySelectorAll: () => [],
      querySelector: selector => selector === 'body.landing-refresh #lead-form' ? form : null,
    };
    const context = { document, window: { lucide: { createIcons() {} } } };
    const script = read(`${directory}/aula-tp-coherence.js`);
    vm.runInNewContext(script, context);
    const wrappers = controls.map(control => control.parentElement);
    vm.runInNewContext(script, context);
    controls.forEach((control, index) => {
      assert.equal(control.value, `value-${index}`);
      assert.equal(control.required, true);
      assert.deepEqual(control.options, ['existing option']);
      assert.equal(control.parentElement, wrappers[index]);
      assert.ok(control.parentElement.children.includes(control));
    });
    assert.equal(submit.submitHandler, handler);
    assert.equal(submit.children[1].textContent, 'Enviar solicitud');
    assert.equal(heading.children.length, 1);
    assert.ok(form.classList.contains('tp-demo-form'));
  });
}

test('demo appearance stays synchronized and fields remain native', () => {
  assert.equal(read('landing/landing-home-demo.css'), read('static/landing-home-demo.css'));
  const html = read('static/landing-home-preview.html');
  assert.match(html, /<form[^>]*id="lead-form"[^>]*action="mailto:contacto@aulatpchile\.cl"/);
  assert.match(html, /<input name="establecimiento"/);
  assert.match(html, /<select name="cargo"/);
  assert.match(html, /<select name="especialidad"/);
  assert.match(html, /type="submit">Enviar solicitud/);
});
