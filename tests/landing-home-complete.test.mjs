import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../static/landing-home-preview.html', import.meta.url), 'utf8');

test('preserves the complete homepage after capabilities through the footer', () => {
  const markers = ['class="capabilities"', 'id="ciudad-laboral"', 'id="mision-laboral"', 'id="producto"', 'class="curriculum-foundation"', 'id="comunidad"', 'id="como"', 'id="especialidades"', 'id="preguntas"', 'class="contact-strip"', 'class="visual-footer"'];
  let previous = -1;
  for (const marker of markers) {
    const index = html.indexOf(marker);
    assert.ok(index > previous, `${marker} must exist in original order`);
    previous = index;
  }
  assert.match(html, /id="additional-specialties"/);
  assert.match(html, /id="lead-form"/);
  assert.match(html, /<details>/);
});

test('retains native video and original local images', () => {
  assert.match(html, /<video controls/);
  for (const file of ['ciudad-laboral-real.webp', 'simulador-circuitos-electricos.png', 'base-curricular-banner.png']) {
    assert.ok(html.includes(`/static/landing-preview-assets/${file}`));
  }
});
