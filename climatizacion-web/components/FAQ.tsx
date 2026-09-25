const ITEMS = [
  {
    q: "¿Para quién está pensada la solución?",
    a: "Para liceos técnico-profesionales, equipos de dirección, coordinaciones académicas y DAEM que buscan fortalecer la formación TP con herramientas digitales.",
  },
  {
    q: "¿Qué incluye una demo?",
    a: "Una sesión guiada de Portal Docente y/o Simulador de Electricidad, según tu interés, con espacio para preguntas de implementación y propuesta comercial.",
  },
  {
    q: "¿Necesitamos infraestructura especial?",
    a: "En general basta con computadores o laboratorios con acceso a internet. En la demo revisamos juntos los requisitos de tu establecimiento.",
  },
  {
    q: "¿Ofrecen capacitación a docentes?",
    a: "Sí. Incluimos acompañamiento inicial y material de apoyo para que el equipo docente adopte la plataforma con confianza.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Preguntas frecuentes
        </h2>
        <div className="mt-10 space-y-3">
          {ITEMS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-slate-200 bg-white open:shadow-sm"
            >
              <summary className="cursor-pointer list-none px-5 py-4 text-left text-sm font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <span
                    className="text-brand-600 transition group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
