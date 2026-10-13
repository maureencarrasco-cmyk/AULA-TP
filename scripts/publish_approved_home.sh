#!/usr/bin/env bash
set -euo pipefail
stage=/tmp/approved-home-20261013-646f89d
root=/var/www/aulatp-landing
config=$(readlink -f /etc/nginx/sites-enabled/aulatp-landing)
[[ "$config" == /etc/nginx/sites-available/aulatp-landing || "$config" == /etc/nginx/sites-enabled/aulatp-landing ]] || exit 1
[[ $(readlink -f "$root") == "$root" ]] || exit 1
exec 9>/opt/aula-tp-portal-sync/.sync.lock
flock -w 30 9
[[ $(sha256sum "$config" | cut -d' ' -f1) == f01f0909f94c9b5a6e83b57c4239bac4e3c853c4cf04d13827adee1d1813f02e ]] || { echo 'Live routing changed'; exit 1; }
[[ $(sha256sum "$root/index.html" | cut -d' ' -f1) == d329541cf27d3419e00572f65dcab55ff2c824c0c1c9d74f40d256cd54e3cd23 ]] || { echo 'Live homepage changed'; exit 1; }
[[ $(sha256sum "$stage/nginx-portada.conf" | cut -d' ' -f1) == 61614fdfae674f3b653125d9d526df605774aa35cd12bd2c4cc27a37dea4aaa6 ]] || { echo 'Invalid homepage route upload'; exit 1; }
files=(portada-publica.html aula-tp-coherence.js aula-tp-coherence.css landing-home-actions.css landing-home-width.css landing-home-videos.css landing-home-demo.css hero-estudiante-recorte.png aula-tp-presentacion.mp4 aula-tp-presentacion-poster.jpg aula-tp-invitacion.mp4 aula-tp-invitacion-poster.jpg)
expected_home=$(awk '$2 == "portada-publica.html" { print $1 }' "$stage/portada-publica.sha256")
[[ "$expected_home" =~ ^[0-9a-f]{64}$ ]] || exit 1
(
  cd "$stage"
  sha256sum --check portada-publica.sha256
)
backup=/var/backups/aulatp-home-publication/20261013-646f89d-$(date -u +%H%M%S)
mkdir -p /var/backups/aulatp-home-publication
mkdir "$backup"
cp -p "$config" "$backup/nginx.conf"
cp -a "$root/index.html" "$backup/index-anterior.html"
# Publish a separate release; never unlock or overwrite the protected homepage.
dest="$root/home-assets/20261013-646f89d"
mkdir -p "$root/home-assets"
if [[ -d "$dest" && ! -L "$dest" ]]; then
  (cd "$dest"; sha256sum --check "$stage/portada-publica.sha256")
else
  [[ ! -e "$dest" ]] || exit 1
  mkdir "$dest"
  for file in "${files[@]}"; do install -m 644 "$stage/$file" "$dest/$file"; done
fi
restore() {
  local result=$?
  trap - ERR
  cp -p "$backup/nginx.conf" "$config"
  nginx -t && systemctl reload nginx
  echo 'Previous homepage routing restored; protected files unchanged'
  exit "$result"
}
trap restore ERR
install -m 644 "$stage/nginx-portada.conf" "$config"
nginx -t
systemctl reload nginx
# Old nginx workers may answer the first request while the reload completes.
for attempt in 1 2 3 4 5; do
  curl --fail --silent --show-error --retry 3 --retry-delay 1 --max-time 20 https://aulatpchile.cl/ -o "$stage/published.html"
  if [[ $(sha256sum "$stage/published.html" | cut -d' ' -f1) == "$expected_home" ]]; then break; fi
  sleep 1
done
[[ $(sha256sum "$stage/published.html" | cut -d' ' -f1) == "$expected_home" ]]
for file in aula-tp-coherence.js landing-home-actions.css hero-estudiante-recorte.png aula-tp-presentacion.mp4 aula-tp-invitacion.mp4; do
  curl --fail --silent --show-error --retry 2 --max-time 20 "https://aulatpchile.cl/home-assets/20261013-646f89d/$file" -o /dev/null
done
trap - ERR
echo "Approved homepage published. Backup: $backup"
