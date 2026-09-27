import { Logo } from "./Logo";

const LINKS = [
  { href: "/curso", label: "Cursos vivos" },
  { href: "/portal/cursos/", label: "Campus" },
  { href: "/#especialidades", label: "Especialidades" },
  { href: "/#producto", label: "Simulador" },
  { href: "/#como", label: "Cómo funciona" },
  { href: "/portal-docente", label: "Portal docente" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Principal">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <details className="relative lg:hidden">
          <summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
            Menú
          </summary>
          <nav className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg" aria-label="Móvil">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </details>
        <a
          href="/#preguntas"
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Solicitar demo
        </a>
      </div>
    </header>
  );
}
