const QUOTES = [
  {
    quote:
      "[Placeholder] Gracias a Portal Docente mejoramos el seguimiento de nuestras especialidades TP.",
    role: "Directora — Liceo TP (placeholder)",
  },
  {
    quote:
      "[Placeholder] El Simulador de Electricidad permitió más práctica segura antes del taller.",
    role: "Jefe de especialidad — región Metropolitana (placeholder)",
  },
  {
    quote:
      "[Placeholder] La demo fue clara y el acompañamiento facilitó la adopción en la comuna.",
    role: "Coordinación académica / DAEM (placeholder)",
  },
];

export function SocialProof() {
  return (
    <section id="testimonios" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Experiencias en establecimientos chilenos
          </h2>
          <p className="mt-3 text-slate-600">
            Citas y logos editables: reemplázalos con testimonios y alianzas reales.
          </p>
        </div>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {QUOTES.map((item) => (
            <li
              key={item.role}
              className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6"
            >
              <p className="text-sm leading-relaxed text-slate-700">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {item.role}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {["Logo colegio A", "Logo DAEM B", "Logo liceo C", "Alianza D"].map(
            (label) => (
              <div
                key={label}
                className="flex h-14 min-w-[140px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 text-xs font-medium text-slate-400"
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
