# Sistema de diseño — Aula TP Electricidad 3° medio

Referencia visual y de presentación para reutilizar el lenguaje del portal al crear pantallas, materiales, feedback o componentes alineados al curso.

**Fuente:** variables CSS y UI observadas en  
https://aulatpchile.cl/portal/simuladores/electricidad_3_medio/

---

## 1. Personalidad de marca

- **Técnica y clara:** lenguaje de oficio, no infantil.  
- **Segura y normativa:** seguridad y evidencia siempre visibles.  
- **Orientada a la acción:** verbos concretos (analizar, verificar, decidir).  
- **Cálida pero profesional:** acompañamiento del Tutor sin tono “juguete”.  
- **Ordenada:** jerarquía fuerte (OA → módulo → etapa → estación).

---

## 2. Paleta de color

### Tokens principales

| Token | Hex | Uso |
|-------|-----|-----|
| `blue.primary` | `#0870EF` | Acciones primarias, enlaces, foco activo, acentos |
| `blue.navy` | `#062F91` | Headers, gradientes, títulos fuertes |
| `teal` | `#008B98` | Estados secundarios, etapas, acentos de apoyo |
| `magenta` | `#F51670` | Destacados, alertas suaves, énfasis de etapa |
| `text.primary` | `#082B80` | Títulos y cuerpo principal |
| `text.secondary` | `#31538F` | Subtítulos, metadatos, ayuda |
| `line` | `#D9E5F6` | Bordes, divisores, tracks de progreso |
| `bg.pale` | `#F7FBFF` | Fondo de página / secciones |
| `bg.white` | `#FFFFFF` | Tarjetas, paneles, inputs |

### Uso recomendado

- **Primario / CTA:** `#0870EF` sobre blanco.  
- **Header hero:** gradiente `navy → primary` (`#062F91` → `#0870EF`).  
- **Fondo app:** `#F7FBFF`; contenido en tarjetas `#FFFFFF`.  
- **Texto:** nunca gris neutro genérico; preferir azules de la paleta.  
- **Éxito / feedback positivo:** verde de sistema + texto justificativo (no solo color).  
- **Etapas:** diferenciar con acentos (azul, rosa/magenta, morado, naranja, turquesa, ámbar) manteniendo texto legible.

### Contraste y accesibilidad

- Preferir texto `#082B80` o `#FFFFFF` sobre fondos saturados.  
- Respetar modo **alto contraste** y **modo visual simple**.  
- No comunicar estado solo con color: sumar ícono + etiqueta.

---

## 3. Tipografía

**Familia computada en el portal:**

```text
"Segoe UI Variable Text", Aptos, "Segoe UI", Arial, sans-serif
```

### Escala sugerida

| Rol | Tamaño aprox. | Peso | Color |
|-----|---------------|------|-------|
| Hero / título de módulo | 28–36 px | Semibold–Bold | Blanco sobre gradiente, o `#082B80` |
| Título de sección | 20–24 px | Semibold | `#082B80` |
| Subtítulo / OA | 14–16 px | Medium | `#31538F` o badge |
| Cuerpo | 15–16 px | Regular | `#082B80` |
| Meta / ayuda | 12–13 px | Regular | `#31538F` |
| Botón | 14–15 px | Semibold | Según variante |

### Reglas

- Una idea por párrafo corto.  
- Etiquetas de OA y estado en **mayúsculas suaves o badges**, no gritos tipográficos.  
- En accesibilidad: soportar Normal / Grande / Muy grande.

---

## 4. Layout y superficie

### Estructura típica

1. **Header** con gradiente azul, título del curso/módulo, badges de estado.  
2. **Contenido** en grilla de **tarjetas blancas**.  
3. **Progreso** visible (barra + porcentaje o estaciones).  
4. **Acciones flotantes:** Tutor Aula TP; acceso a accesibilidad / práctica libre.

### Tarjetas

- Fondo `#FFFFFF`  
- Borde suave `#D9E5F6`  
- Esquinas redondeadas (radio generoso)  
- Sombra discreta (elevación baja)  
- Padding amplio; aire entre bloques  

### Componentes recurrentes

- **Badges de OA** (ej. “OA 4”)  
- **Badges de estado** (bloqueado / en curso / completado)  
- **Numeración circular** en estaciones/etapas  
- **Iconografía lineal** (stroke, no filled pesado)  
- **Barras de progreso** con track `#D9E5F6` y fill `#0870EF`  
- **Pestañas / radios / casillas** semánticas  

---

## 5. Botones y controles

| Variante | Fondo | Texto | Cuándo |
|----------|-------|-------|--------|
| Primario | `#0870EF` | Blanco | Continuar, Ingresar, Abrir práctica |
| Secundario | Blanco + borde `#D9E5F6` | `#082B80` | Alternativas, cancelar suave |
| Énfasis / acento | `#008B98` o `#F51670` | Blanco | Destacar una ruta (usar con mesura) |
| Fantasma | Transparente | `#0870EF` | Enlaces de ayuda, “Tutor” |

### Interacción

- Hover: oscurecer ligeramente el primario o reforzar borde.  
- Foco: anillo visible (modo **resaltar foco activo**).  
- Disabled: opacidad baja + no depender solo del gris.

---

## 6. Jerarquía de contenido (cómo presentar)

Orden visual recomendado en cualquier pantalla de actividad:

1. **Contexto** — caso / estación / tiempo estimado  
2. **Objetivo** — OA / AE en badge  
3. **Estímulo** — situación, plano, dato técnico  
4. **Acción** — pregunta o decisión  
5. **Apoyo** — Tutor, biblioteca, accesibilidad  
6. **Feedback** — resultado + justificación técnica  

### Tono de copy

- Directo, técnico, en español claro.  
- Enfocarse en **seguridad, normativa, evidencias, toma de decisiones**.  
- Evitar adornos vacíos (“¡Genial!”) sin contenido técnico.  

**Ejemplos de microcopy al estilo del curso:**

- “Comprendo la situación”  
- “Tomo decisiones”  
- “Abrir práctica libre del módulo actual”  
- “Dame una pista gradual”  
- “¿Qué evidencia reviso?”  

---

## 7. Etapas y color (mapa semántico sugerido)

Mantener consistencia entre módulos:

| Etapa | Acento sugerido |
|-------|-----------------|
| Analizar | Azul `#0870EF` |
| Comprender | Turquesa `#008B98` |
| Reconocer y relacionar | Morado / índigo |
| Aplicar y decidir | Naranja / ámbar |
| Verificar | Teal profundo |
| Retroalimentar | Magenta `#F51670` o verde de éxito + texto |

Numeración circular + etiqueta de etapa + color de acento.

---

## 8. Feedback visual

### Éxito

- Contenedor claro (borde/fondo verde suave)  
- Título breve + **justificación técnica**  
- Progreso actualizado / siguiente estación desbloqueada  

### Error / reintento (sobre todo en práctica libre)

- Sin dramatismo  
- Explicar el fallo en una frase  
- Invitar a corregir (sin penalización en práctica libre)  

### Tutor

- Panel lateral o flotante  
- Botones de acción rápida + campo de duda  
- Aviso de límite: no reemplaza normas ni docente  

---

## 9. Accesibilidad en UI

Todo componente nuevo debe convivir con:

- Perfiles: Lectura cómoda / Baja estimulación / Apoyo guiado  
- Texto escalable  
- Alto contraste y modo visual simple  
- Reducir movimiento  
- Guía de lectura / narración  
- Más tiempo, más ayuda  

### Checklist UI

- [ ] Contraste AA+ en texto principal  
- [ ] Estados no solo por color  
- [ ] Foco visible  
- [ ] Targets clicables amplios  
- [ ] Textos narrables (sin info solo en imagen)  
- [ ] Respeta `prefers-reduced-motion` / toggle del panel  

---

## 10. Tokens CSS de referencia

```css
:root {
  --aula-blue: #0870EF;
  --aula-navy: #062F91;
  --aula-teal: #008B98;
  --aula-magenta: #F51670;
  --aula-text: #082B80;
  --aula-text-muted: #31538F;
  --aula-line: #D9E5F6;
  --aula-bg: #F7FBFF;
  --aula-surface: #FFFFFF;
  --aula-font: "Segoe UI Variable Text", Aptos, "Segoe UI", Arial, sans-serif;
  --aula-radius: 16px;
  --aula-shadow: 0 8px 24px rgba(6, 47, 145, 0.08);
}

body {
  font-family: var(--aula-font);
  color: var(--aula-text);
  background: var(--aula-bg);
}

.card {
  background: var(--aula-surface);
  border: 1px solid var(--aula-line);
  border-radius: var(--aula-radius);
  box-shadow: var(--aula-shadow);
}

.header-hero {
  background: linear-gradient(135deg, var(--aula-navy), var(--aula-blue));
  color: #fff;
}

.btn-primary {
  background: var(--aula-blue);
  color: #fff;
  border-radius: 999px;
  font-weight: 600;
}
```

---

## 11. Do / Don’t

### Do

- Headers con gradiente navy→blue  
- Tarjetas blancas sobre fondo `#F7FBFF`  
- Badges de OA y progreso siempre visibles  
- Copy corto y técnico  
- Espaciado generoso  

### Don’t

- Introducir verdes/naranjas de marca ajenos como color primario  
- Tipografías display o comic  
- Párrafos largos en una sola tarjeta  
- Feedback solo con color  
- Sobrecargar magenta (es acento, no base)  

---

## 12. Piezas mínimas de un kit reutilizable

1. Header hero  
2. Card de módulo  
3. Badge OA / estado  
4. Estación numerada  
5. Barra de progreso  
6. Botón primario / secundario  
7. Panel Tutor  
8. Panel Accesibilidad  
9. Banner de feedback  
10. Card de práctica libre (nivel Explorar→Transferir)  

---

*Sistema de diseño documentado a partir de la UI real del portal Aula TP Electricidad 3° medio para reutilización pedagógica y de producto.*
