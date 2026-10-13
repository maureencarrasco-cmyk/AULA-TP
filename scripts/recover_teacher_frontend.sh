#!/usr/bin/env bash
set -euo pipefail

# Deploy only teacher static files; keep the application, service and database intact.
stage=${1:?Provide a staging directory}
expected_nginx_sha=${2:?Provide the SHA-256 of the current nginx site}
root=/opt/aulatp-portal-analiza-vacios
site=/etc/nginx/sites-enabled/aulatp-landing
target=$(readlink -f "$root/current")
case "$target" in "$root"/releases/*) ;; *) echo 'Unexpected teacher release path'; exit 1 ;; esac
[[ -d "$target/static" ]] || exit 1
[[ $(sha256sum "$site" | cut -d' ' -f1) == "$expected_nginx_sha" ]] || { echo 'Nginx site changed; inspect before retrying'; exit 1; }
files=(portal-docente.css portal-docente-design.css portal-docente-layout.js portal-docente-cohort.js portal-docente.js portal-docente.html)
for file in "${files[@]}"; do [[ -f "$stage/$file" ]] || { echo "Missing staged $file"; exit 1; }; done
[[ -f "$stage/aulatp-landing.conf" ]] || exit 1
backup="/var/backups/aulatp-docente-recovery/$(date -u +%Y%m%d-%H%M%S)"
mkdir -p "$backup/static"
cp -a "$site" "$backup/aulatp-landing.conf"
for file in "${files[@]}"; do
  if [[ -f "$target/static/$file" ]]; then cp -a "$target/static/$file" "$backup/static/$file"; fi
done
rollback() {
  local status=$?
  trap - ERR
  for file in "${files[@]}"; do
    if [[ -f "$backup/static/$file" ]]; then
      cp -a "$backup/static/$file" "$target/static/$file"
    else
      rm -f -- "$target/static/$file"
    fi
  done
  cp -a "$backup/aulatp-landing.conf" "$site"
  nginx -t && systemctl reload nginx
  echo "Teacher frontend rolled back; backup: $backup"
  exit "$status"
}
trap rollback ERR
for file in "${files[@]}"; do install -m 644 "$stage/$file" "$target/static/$file"; done
for file in portal-docente-design.css portal-docente-layout.js; do
  echo "Checking teacher upstream: $file"
  curl --fail --silent --show-error --max-time 15 "http://127.0.0.1:8011/static/$file" -o /dev/null
done
install -m 644 "$stage/aulatp-landing.conf" "$site"
nginx -t
systemctl reload nginx
for path in portal-docente static/portal-docente.js static/portal-docente-design.css static/portal-docente-layout.js; do
  echo "Checking public teacher resource: $path"
  curl --fail --silent --show-error --retry 3 --retry-all-errors --max-time 15 "https://aulatpchile.cl/$path" -o /dev/null
done
trap - ERR
echo "Teacher frontend updated; backup: $backup"
