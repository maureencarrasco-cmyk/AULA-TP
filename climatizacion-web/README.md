# Aula TP Chile

Landing ES-CL. Ver componentes en components/ y Server Action en app/actions/leads.ts.

Local: instalar deps, run dev, abrir :3000.
Producción: run build + start.

Leads: data/leads.json. Formspree/Resend opcionales via .env.example.

## Stack
Next.js App Router, TypeScript, Tailwind CSS.

## Cómo ejecutar
1. cd aula-tp-landing
2. Instalar dependencias del proyecto
3. Ejecutar el script de desarrollo
4. Abrir http://localhost:3000

Scripts: run dev, run build, start, run lint.

## Estructura
- app/layout.tsx (SEO, lang es-CL)
- app/page.tsx (landing única)
- app/globals.css
- app/actions/leads.ts
- components: Logo, Header, Hero, Benefits, Products, SocialProof, FAQ, ContactSection, LeadForm, Footer
- lib/regions.ts, lib/types.ts
- data/leads.json

## Formulario
Campos: Nombre*, Cargo, Establecimiento*, Región, Email*, Teléfono, Interés*, Mensaje.
submitLead valida y añade a data/leads.json. UI de agradecimiento.

## Integraciones
Formspree: FORMSPREE_ENDPOINT en .env.local + POST tras guardar.
Resend: variables propias en .env.local (sin valores ficticios).
Ver .env.example. NEXT_PUBLIC_SITE_URL para Open Graph.

## Despliegue
Vercel o VPS. En serverless usar Formspree/Resend; data/ es efímero.

## A11y y SEO
lang es-CL, title, description, Open Graph, labels, foco, contraste.

## Design tokens (canonical)

Canonical CSS: `https://aulatpchile.cl/shared/aula-tp-design-tokens.css`  
Disk: `/opt/aulatp/landing/shared/aula-tp-design-tokens.css` (also `/opt/aulatp/shared/`).

On deploy of climatizacion-app, sync that file into both:
- `public/aula-tp-design-tokens.css` (served / bundled public copy)
- `app/aula-tp-design-tokens.css` (imported first by `app/globals.css`)

SHA of both copies must match the shared file. Root layout also links `/shared/aula-tp-design-tokens.css` for same-origin browser load.

