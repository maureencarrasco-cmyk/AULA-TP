# Hooks de Git — Aula TP

Los hooks viven en `.githooks/` (versionados). Git no los usa hasta apuntar `core.hooksPath`.

## Activar en el PC

```powershell
cd C:\Users\Martín\aula-tp-chile
git pull origin main
.\scripts\install-hooks.cmd
```

Comprueba:

```powershell
git config --get core.hooksPath
```

Debe decir `.githooks`.

En Git Bash / macOS / Linux:

```bash
chmod +x .githooks/* scripts/install-hooks.sh
./scripts/install-hooks.sh
```

## Qué hacen

| Hook | Momento | Bloquea |
|---|---|---|
| `pre-commit` | `git commit` | `wheelhouse/`, `*.whl`, `.venv`, `__pycache__`, `*.pyc`, posibles secretos; `py_compile` de `.py` staged |
| `commit-msg` | `git commit` | mensaje vacío o menor a 8 caracteres |
| `pre-push` | `git push` | `py_compile` de todo el árbol; `pytest tests/test_lms.py` si hay pytest |

Saltar un hook (solo si hace falta): `git commit --no-verify` / `git push --no-verify`.

## Nota Windows

Git for Windows ejecuta estos scripts con `sh`. No hace falta WSL.
