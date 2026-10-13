#!/usr/bin/env bash
set -euo pipefail
stage=/tmp/teacher-resource-verification-20261013
root=/opt/aulatp-portal-analiza-vacios
release=$(readlink -f "$root/current")
[[ "$release" == "$root/releases/20260928-032000-83183bf" ]] || exit 1
target="$release/static"
[[ ! -L "$target/portal-docente" ]] || exit 1
[[ $(sha256sum "$target/portal-docente.html" | cut -d' ' -f1) == 17cfd6c2bb006f69553db76591b821cfe3647f99b7039ecf1218914ec3e74934 ]] || { echo 'Teacher HTML changed'; exit 1; }
[[ $(sha256sum "$stage/portal-docente.html" | cut -d' ' -f1) == ba76f70533a29598c152d84b2ea09d308150dd0fa2a19611aca910e0c8549556 ]] || exit 1
[[ $(sha256sum "$stage/sidebar-foot.jpg" | cut -d' ' -f1) == 37752b061a4c692a3928ce2cbaa4762fc401382b566df06c2b0c959622699bd1 ]] || exit 1
backup=/var/backups/aulatp-teacher-resources/20261013
mkdir -p /var/backups/aulatp-teacher-resources
mkdir "$backup"
cp -p "$target/portal-docente.html" "$backup/portal-docente.html"
mkdir -p "$target/portal-docente"
if [[ -e "$target/portal-docente/sidebar-foot.jpg" ]]; then
  [[ $(sha256sum "$target/portal-docente/sidebar-foot.jpg" | cut -d' ' -f1) == 37752b061a4c692a3928ce2cbaa4762fc401382b566df06c2b0c959622699bd1 ]] || exit 1
else
  install -m 644 "$stage/sidebar-foot.jpg" "$target/portal-docente/sidebar-foot.jpg"
fi
restore() {
  local result=$?
  trap - ERR
  cp -p "$backup/portal-docente.html" "$target/portal-docente.html"
  exit "$result"
}
trap restore ERR
install -m 644 "$stage/portal-docente.html" "$target/portal-docente.html"
curl --fail --silent --show-error --max-time 20 https://aulatpchile.cl/static/portal-docente/sidebar-foot.jpg -o "$stage/published.jpg"
[[ $(sha256sum "$stage/published.jpg" | cut -d' ' -f1) == 37752b061a4c692a3928ce2cbaa4762fc401382b566df06c2b0c959622699bd1 ]]
curl --fail --silent --show-error --max-time 20 https://aulatpchile.cl/portal-docente -o /dev/null
trap - ERR
echo "Teacher original image restored. Backup: $backup"
