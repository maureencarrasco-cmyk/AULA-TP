import Image from "next/image";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-brand-50"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(11,95,255,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(245,197,24,0.18), transparent 35%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-800">
            Software educativo para TP en Chile
          </p>
          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Digitaliza la formación técnico-profesional de tu establecimiento
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            Aula TP Chile entrega herramientas listas para el aula: Portal Docente
            y simuladores de Electricidad para potenciar aprendizajes, seguimiento
            pedagógico y prácticas seguras en liceos y centros TP.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Solicitar demo
            </a>
            <a
              href="#productos"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Ver productos
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Orientado a directores, coordinadores académicos y DAEM.
          </p>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-brand-600/10">
            <Image
              src="/images/hero.png"
              alt="Software educativo Aula TP para formación técnico-profesional"
              width={1280}
              height={720}
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              className="h-auto w-full object-cover"
            />
          </div>
          <p className="mt-3 text-center text-sm text-slate-500">
            Portal Docente y simuladores listos para el aula TP
          </p>
        </div>
      </div>
    </section>
  );
}
