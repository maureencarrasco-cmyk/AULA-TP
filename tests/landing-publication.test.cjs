const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const html = fs.readFileSync(path.join(__dirname, '../landing/portada-publica.html'), 'utf8');

test('published homepage loads the approved badge and hero assets without preview routes', () => {
  for (const file of ['aula-tp-coherence.js', 'landing-home-actions.css', 'landing-home-demo.css', 'landing-home-videos.css', 'landing-home-width.css']) {
    assert.ok(html.includes('/home-assets/20261013-646f89d/' + file));
  }
  assert.ok(html.includes('/home-assets/20261013-646f89d/hero-estudiante-recorte.png'));
  assert.doesNotMatch(html, /landing-preview-assets|landing-home-preview\.js|landing-hero\.css|\/landing\/aula-tp-coherence\.(js|css)/);
});
test('published homepage preserves both original videos with native sound and controls', () => {
  assert.equal((html.match(/<video\b/g) || []).length, 2);
  for (const tag of html.match(/<video\b[^>]*>/g) || []) {
    assert.match(tag, /\bcontrols(?:="")?\s/);
    assert.match(tag, /\bplaysinline(?:="")?\s/);
  }
  assert.doesNotMatch(html, /<video[^>]*\bmuted\b/);
  for (const file of ['aula-tp-presentacion.mp4', 'aula-tp-invitacion.mp4']) assert.ok(html.includes(file));
});
test('only previously approved promotional removals are applied; navigation and forms remain', () => {
  assert.doesNotMatch(html, /id="(?:mision-laboral|producto|como)"|class="(?:capabilities|visual-footer)"/);
  for (const marker of ['id="nav"', 'data-menu', 'class="curriculum-foundation"', 'id="ciudad-laboral"', 'id="comunidad"', 'id="especialidades"', 'id="lead-form"', 'data-specialty-dialog', '/portal-docente', '/mision_laboral/', '/portal/cursos/', 'mailto:contacto@aulatpchile.cl', '/landing/portal-reference.js']) {
    assert.ok(html.includes(marker), marker);
  }
});
test('publication manifest lists every input and verifies original binary media', () => {
  const manifest = fs.readFileSync(path.join(__dirname, '../landing/portada-publica.sha256'), 'utf8');
  const rows = manifest.trim().split(/\r?\n/);
  assert.equal(rows.length, 12);
  for (const row of rows) {
    const [hash, file] = row.split('  ');
    assert.match(hash, /^[0-9a-f]{64}$/);
    const bytes = fs.readFileSync(path.join(__dirname, '../landing', file));
    // Text hashes record the uploaded bytes, whose line endings can differ on
    // checkout; the deployment verifies them before publication.
    if (/\.(png|jpg|mp4)$/.test(file)) assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), hash, file);
  }
});
test('deployment retains protected files, checks routing and includes a rollback', () => {
  const script = fs.readFileSync(path.join(__dirname, '../scripts/publish_approved_home.sh'), 'utf8');
  assert.match(script, /flock -w 30/);
  assert.match(script, /sha256sum --check portada-publica\.sha256/);
  assert.match(script, /nginx -t/);
  assert.match(script, /trap restore ERR/);
  assert.match(script, /cp -p "\$backup\/nginx\.conf" "\$config"/);
  assert.doesNotMatch(script, /chattr|reset --hard|rm -|restart|sqlite|install[^\n]+"\$root\/index\.html"/);
});
