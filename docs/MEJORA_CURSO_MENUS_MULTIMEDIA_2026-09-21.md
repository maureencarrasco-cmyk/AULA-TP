# Mejora Aula TP Chile · 21 septiembre 2026

Alcance: campus local (`xamoxor5775/aula-tp-chile`) y portal `aulatpchile.cl`.
Criterio de verdad curricular: Programa MINEDUC Refrigeración y Climatización, Decreto Exento N° 0954/2015, solo 3° medio (módulos 1–4).

## 1. Qué estaba roto

### 1.1 Coherencia del curso
- La landing pública decía «cuatro especialidades listas» (Refrigeración, Electricidad, Enfermería, Administración). En el campus solo hay banco pedagógico propio de Refrigeración y Climatización 3° medio.
- El documento maestro hablaba de 8 módulos y ~478 h Aula TP. El código vigente (`curriculum.py`) declara 4 módulos de 3° medio. Mezclar ambos números en menús y tutor genera expectativa falsa.
- El tutor saludaba «Electricidad, Enfermería u otra ruta» aunque esas rutas no tienen AE, situaciones ni evaluación propias.
- El demo minero (`/simulador/mineria`) aparece como experiencia suelta, fuera de la cadena de cinco estaciones y sin matrícula.
- Cadena oficial del módulo: Contextualización → AE (3 × 6 = 18 etapas) → Situación integradora (15 casos + escena) → Evaluación final → Cierre. Práctica Libre es paralela y no altera nota.

### 1.2 Lógica de menús
- Un solo chrome mezclaba herramientas de administrador con la vista del estudiante.
- Práctica Libre y Tutor seguían visibles en Evaluación Final.
- Navegación docente no estaba marcada de forma estable para ocultarla por rol.
- Filtro de catálogo por sector mezclaba especialidad y sector.

### 1.3 Multimedia faltante
Hero landing, `estacion5-hero.png`, VTT cortos, fallback 3D, plano M1 y display M2.

## 2. Menús canónicos
Público / Estudiante / Docente. Ver archivo completo en el repo.

## 3. Implementado
`static/menu-logic.js`, `static/menu-logic.css`, inclusión en `static/index.html`.
