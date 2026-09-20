#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
if [ ! -x .venv/bin/python ]; then
  aula_python="$(command -v python3 || true)"
  aula_bundled="/home/xamorro/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
  if [ -x "$aula_bundled" ]; then aula_python="$aula_bundled"; fi
  if [ -z "$aula_python" ]; then
    echo 'Instala Python 3.10 o posterior con soporte venv para iniciar el campus.' >&2
    exit 1
  fi
  "$aula_python" -m venv .venv
fi
if ! .venv/bin/python -c 'import flask' >/dev/null 2>&1; then
  .venv/bin/python -m pip install --no-index --find-links=wheelhouse -r requirements.txt
fi
exec .venv/bin/python app.py
