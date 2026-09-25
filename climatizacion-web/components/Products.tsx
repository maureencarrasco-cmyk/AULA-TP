import Image from "next/image";
import Link from "next/link";

const PRODUCTS = [
  {
    name: "Portal Docente",
    tag: "Gestión pedagógica",
    image: "/images/portal-docente/hero.png",
    description:
      "Organiza clases, recursos y seguimiento de estudiantes en especialidades TP. Facilita la coordinación entre docentes y la evidencia para supervisión.",
    points: [
      "Planificación y recursos centralizados",
      "Seguimiento de avances por curso",
      "Reportes útiles para dirección y DAEM",
    ],
  },
  {
    name: "Simulador de Electricidad",
    tag: "Práctica TP",
    image: "/images/simulador-electricidad.png",
    description:
      "Entorno interactivo para ensayar circuitos, mediciones y diagnóstico de fallas. Ideal para fortalecer competencias antes del taller real.",
    points: [
      "Escenarios alineados a especialidades eléctricas",
      "Práctica segura y repetible",
      "Complemento al laboratorio y talleres",
    ],
  },
];

export function Products() {
  return (
    <section id="productos" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Productos para tu comunidad educativa
          </h2>
          <p className="mt-3 text-slate-600">
            Soluciones complementarias: gestión docente y simuladores
            técnico-profesionales.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {PRODUCTS.map((product) => (
            <article
              key={product.name}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-video w-full bg-slate-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={1280}
                  height={720}
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {product.tag}
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {product.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {product.description}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  {product.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-1 text-brand-600" aria-hidden="true">
                        ✓
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  {product.name === "Portal Docente" ? (
                    <Link
                      href="/portal-docente"
                      className="inline-flex w-fit items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                    >
                      Probar vista docente
                    </Link>
                  ) : null}
                  <a
                    href="#contacto"
                    className={`inline-flex w-fit items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                      product.name === "Portal Docente"
                        ? "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                        : "bg-brand-600 text-white hover:bg-brand-700"
                    }`}
                  >
                    Solicitar demo de {product.name}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
