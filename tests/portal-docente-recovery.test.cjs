const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const script = fs.readFileSync('scripts/recover_teacher_frontend.sh','utf8');
test('recovery is restricted to six static teacher files and validates its target',()=>{
  assert.match(script,/files=\(portal-docente\.css portal-docente-design\.css portal-docente-layout\.js portal-docente-cohort\.js portal-docente\.js portal-docente\.html\)/);
  assert.match(script,/Unexpected teacher release path/);
  assert.match(script,/Nginx site changed; inspect before retrying/);
  assert.doesNotMatch(script,/restart|sqlite|\.venv|git reset|chattr/);
});
test('recovery keeps backups, validates nginx and tolerates a reload transition',()=>{
  assert.match(script,/trap rollback ERR/);
  assert.match(script,/cp -a "\$site" "\$backup\/aulatp-landing\.conf"/);
  assert.ok(script.indexOf('nginx -t\nsystemctl reload nginx')>0);
  assert.match(script,/--retry 3 --retry-all-errors/);
});
