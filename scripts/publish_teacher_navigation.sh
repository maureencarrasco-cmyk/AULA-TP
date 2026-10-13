#!/usr/bin/env bash
set -euo pipefail
stage=/tmp/teacher-navigation-20261013-v10
root=/opt/aulatp-portal-analiza-vacios
release=$(readlink -f "$root/current")
[[ "$release" == "$root/releases/20260928-032000-83183bf" ]] || exit 1
target="$release/static"
files=(portal-docente.js portal-docente-layout.js portal-docente.html)
declare -A previous=(
  [portal-docente.js]=20fcf66dd29cc3ffa8599746cd53681cd046ffa911d36fcedf9ed8e200fae519
  [portal-docente-layout.js]=b0351792e81b3a9a208f93895e7c1f0c617f0a34e4183e24fc6dd6da403975f6
  [portal-docente.html]=153c2970ab9a6dd203bf7005cf27888d275fc2187a8cbd2777cf71b3eb91f7a2
)
declare -A incoming=(
  [portal-docente.js]=fbdd17a390ecc52731ac382fd1c1426a8cad7658af95c58da8970f2afd0fee49
  [portal-docente-layout.js]=b0351792e81b3a9a208f93895e7c1f0c617f0a34e4183e24fc6dd6da403975f6
  [portal-docente.html]=306b3e820cf4dcdbff2f49a3956cfdc8032e19a360c1d281814bb237e9206631
)
for file in "${files[@]}"; do
  [[ $(sha256sum "$target/$file" | cut -d' ' -f1) == "${previous[$file]}" ]] || { echo "Existing teacher file changed: $file"; exit 1; }
  [[ $(sha256sum "$stage/$file" | cut -d' ' -f1) == "${incoming[$file]}" ]] || { echo "Invalid upload: $file"; exit 1; }
done
backup=/var/backups/aulatp-teacher-navigation/20261013-v10
mkdir -p /var/backups/aulatp-teacher-navigation
mkdir "$backup"
for file in "${files[@]}"; do cp -p "$target/$file" "$backup/$file"; done
restore() {
  local result=$?
  trap - ERR
  for file in "${files[@]}"; do cp -p "$backup/$file" "$target/$file"; done
  echo 'Previous teacher navigation restored'
  exit "$result"
}
trap restore ERR
for file in "${files[@]}"; do install -m 644 "$stage/$file" "$target/$file"; done
for route in portal-docente static/portal-docente.js static/portal-docente-layout.js; do
  curl --fail --silent --show-error --max-time 20 "https://aulatpchile.cl/$route" -o /dev/null
done
trap - ERR
echo "Teacher quick actions published. Backup: $backup"
