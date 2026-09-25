import Image from "next/image";
import Link from "next/link";
import { existsSync } from "fs";
import path from "path";

const SCREENSHOTS = [
  {
    src: "/images/portal-docente/planificacion.png",
    alt: "Planificación de clases en Portal Docente",
    caption: "Planificación y recursos centralizados",
  },
  {
    src: "/images/portal-docente/reportes.png",
    alt: "Reportes y seguimiento en Portal Docente",
    caption: "Reportes para dirección y DAEM",
  },
  {
    src: "/images/portal-docente/hero.png",
    alt: "Vista general de Portal Docente",
    caption: "Vista general del Portal Docente",
  },
];

export function PortalDocenteGallery() {
  const videoPath = path.join(
    process.cwd(),
    "public/images/portal-docente/demo.mp4",
  );
  const gifPath = path.join(
    process.cwd(),
    "public/images/portal-docente/demo.gif",
  );
  const hasVideo = existsSync(videoPath);
  const hasGif = existsSync(gifPath);

  return (
    <section id="portal-docente" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            Gestión pedagógica
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Conoce Portal Docente en acción
          </h2>
          <p className="mt-3 text-slate-600">
            Organiza clases, recursos y seguimiento de estudiantes en
            especialidades TP. Mira cómo se ve la plataforma en el día a día
            del aula y de la coordinación pedagógica.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg shadow-brand-600/10">
            {hasVideo ? (
              <video
                src="/images/portal-docente/demo.mp4"
                autoPlay
                muted
                loop
                playsInline
                poster="/images/portal-docente/hero.png"
                className="aspect-video h-auto w-full object-cover"
                aria-label="Demostración en video de Portal Docente"
              >
                {hasGif ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/images/portal-docente/demo.gif"
                    alt="Demostración animada de Portal Docente"
                    className="h-auto w-full object-cover"
                  />
                ) : null}
              </video>
            ) : hasGif ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/portal-docente/demo.gif"
                alt="Demostración animada de Portal Docente"
                className="aspect-video h-auto w-full object-cover"
              />
            ) : (
              <Image
                src="/images/portal-docente/hero.png"
                alt="Portal Docente"
                width={1280}
                height={720}
                className="h-auto w-full object-cover"
              />
            )}
          </div>
          <p className="mt-3 text-center text-sm text-slate-500">
            {hasVideo
              ? "Demo en video (reproducción automática, sin sonido). Si el video no carga, se muestra la animación o la imagen de portada."
              : hasGif
                ? "Demo animada de Portal Docente."
                : "Vista de Portal Docente."}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SCREENSHOTS.map((shot) => (
            <figure
              key={shot.src}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-video w-full bg-slate-100">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={1280}
                  height={720}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="px-4 py-3 text-sm font-medium text-slate-700">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/portal-docente"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Probar vista docente
          </Link>
          <a
            href="#contacto"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Solicitar demo de Portal Docente
          </a>
        </div>
      </div>
    </section>
  );
}
