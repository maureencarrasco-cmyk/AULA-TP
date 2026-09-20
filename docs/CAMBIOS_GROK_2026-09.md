# Trabajo reciente Grok · Aula TP Chile
Fecha: 19 septiembre 2026

## Ya en GitHub
- `static/specialty-theme.js`: estación 5 usa `/static/themes/estacion5-hero.png` (commit ceb7a2ce).
- `docs/MEJORAS_AULA_TP.md`: menús, cadena del curso, alcance 3° medio.
- Alcance: solo Refrigeración y Climatización 3° medio (4 módulos).

## Hecho en el droplet (puede no estar en este repo)
Servidor: `/opt/aula-tp-chile` · IP 157.230.86.26 · preview `/curso/climatizacion-preview`
El droplet estuvo sin SSH/80/443 desde el 18-09. Si no se hizo `git push` desde allí, falta:
- E5: gráfico de avance con datos reales (sin % de adorno).
- E5: “qué significan mis resultados” en texto de oficio, no lámina con nota falsa.
- E5: retro atada a ítems de la evaluación; campana docente; un solo menú.
- E3: laboratorio NCh353 (metro, no doble conteo, vanos aparte).
- Header: cobertura **30 % simulador / 70 % aula-taller**.
- CSS grid header E5 (foto a la derecha, sin recorte).

## Archivo que falta en `static/themes/`
`estacion5-hero.png` (estudiante, pulgar arriba). Sin ese PNG el header sigue mostrando `workshop.png`.
Ruta local: `C:\Users\Martín\aula-tp-chile\static\themes\estacion5-hero.png`

## Cómo completar el respaldo
```powershell
cd C:\Users\Martín\aula-tp-chile
git add static/themes/estacion5-hero.png static docs
git commit -m "Respaldo trabajo Grok estación 5"
git pull origin main --rebase
git push origin main
```
Cuando el droplet encienda: `cd /opt/aula-tp-chile && git pull && git add -A && git commit && git push`.
