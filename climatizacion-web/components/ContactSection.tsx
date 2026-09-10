import { LeadForm } from "./LeadForm";

export function ContactSection() {
  return (
    <section id="contacto" className="bg-gradient-to-b from-white to-brand-50 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Agenda una demo con tu equipo
          </h2>
          <p className="mt-3 text-slate-600">
            Cuéntanos sobre tu establecimiento. Te mostramos Portal Docente y los
            simuladores TP, y conversamos una propuesta acorde a tu realidad.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="mt-0.5 font-bold text-brand-600" aria-hidden="true">
                1
              </span>
              Completa el formulario con tus datos de contacto.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-bold text-brand-600" aria-hidden="true">
                2
              </span>
              Coordinamos una demo online o presencial según disponibilidad.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-bold text-brand-600" aria-hidden="true">
                3
              </span>
              Recibes una propuesta comercial clara y sin compromiso.
            </li>
          </ul>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
