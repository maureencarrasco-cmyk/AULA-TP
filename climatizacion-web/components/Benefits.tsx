import Image from "next/image";

const BENEFITS = [
  {
    title: "Aprendizaje práctico y seguro",
    body: "Los simuladores permiten ensayar circuitos y fallas sin riesgo, reforzando competencias antes del taller.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
      </svg>
    ),
  },
  {
    title: "Visibilidad para la gestión",
    body: "Portal Docente centraliza actividades, avances y evidencia pedagógica útil para dirección y coordinación.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m0 14h16M8 17V9m4 8V7m4 10v-4" />
      </svg>
    ),
  },
  {
    title: "Alineado al contexto chileno",
    body: "Diseñado para liceos TP, equipos DAEM y planes de mejora, con acompañamiento en español de Chile.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Implementación ágil",
    body: "Onboarding claro para docentes y directivos: demo, capacitación inicial y soporte continuo.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Por qué equipos directivos eligen Aula TP
          </h2>
          <p className="mt-3 text-slate-600">
            Resultados pedagógicos medibles, menos fricción operativa y apoyo
            concreto a la formación técnico-profesional.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <Image
            src="/images/beneficios.png"
            alt="Colaboración, habilidades digitales y crecimiento en la formación técnico-profesional"
            width={1280}
            height={720}
            sizes="(max-width: 768px) 100vw, 768px"
            className="mx-auto h-auto w-full rounded-2xl border border-slate-200 object-cover shadow-md"
          />
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:border-brand-200 hover:bg-white hover:shadow-md"
            >
              <div className="mb-3 inline-flex rounded-lg bg-brand-100 p-2.5 text-brand-700">
                {item.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
