import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { COURSE_HUBS } from "@/lib/course-hubs";
import { CAMPUS_HREF, DEMO_HREF } from "@/lib/course-portal";

export const metadata = {
  title: "Cursos vivos | Aula TP Chile",
  description:
    "Especialidades TP con simulador activo y rutas en preparación. Catálogo público, sin login.",
};

export default function CursoIndexPage() {
  const live = COURSE_HUBS.filter((hub) => hub.live);
  const soon = COURSE_HUBS.filter((hub) => !hub.live);

  return (
    <>
      <Header />
      <main id="contenido" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Catálogo público
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Cursos vivos y rutas en preparación
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Entra a la especialidad publicada. El campus institucional
          ({CAMPUS_HREF}) pide cuenta; este listado no.
        </p>

        <h2 className="mt-10 text-lg font-semibold text-slate-900">Publicadas</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((hub) => (
            <li key={hub.slug}>
              <Link
                href={`/curso/${hub.slug}`}
                className="block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Disponible
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{hub.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {hub.sector} · {hub.level}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{hub.description}</p>
                <p className="mt-4 text-sm font-semibold text-brand-700">Abrir ruta →</p>
              </Link>
            </li>
          ))}
        </ul>

        {soon.length ? (
          <>
            <h2 className="mt-12 text-lg font-semibold text-slate-900">En preparación</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {soon.map((hub) => (
                <li
                  key={hub.slug}
                  className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5"
                >
                  <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    Próximamente
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{hub.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {hub.sector} · {hub.level}
                  </p>
                  <a href={DEMO_HREF} className="mt-4 inline-block text-sm font-semibold text-brand-700">
                    Solicitar esta ruta →
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <p className="mt-12 text-sm text-slate-500">
          ¿Ya tienes cuenta institucional?{" "}
          <a href={CAMPUS_HREF} className="font-semibold text-brand-700">
            Entrar al campus
          </a>
        </p>
      </main>
      <Footer />
    </>
  );
}
