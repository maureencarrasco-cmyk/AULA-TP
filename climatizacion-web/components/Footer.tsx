import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:justify-between">
        <div>
          <Logo variant="dark" />
          <p className="mt-3 max-w-sm text-sm text-slate-400">
            Software educativo para la formación técnico-profesional en Chile.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold text-white">Navegación</p>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#beneficios" className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400">
                  Beneficios
                </a>
              </li>
              <li>
                <a href="#productos" className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400">
                  Productos
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400">
                  Solicitar demo
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Contacto</p>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="mailto:contacto@aulatpchile.cl"
                  className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                >
                  contacto@aulatpchile.cl
                </a>
              </li>
              <li className="text-slate-400">Chile</li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="font-semibold text-white">Legal</p>
            <p className="mt-3 text-slate-400">
              Al enviar el formulario aceptas ser contactado respecto a tu
              solicitud. No compartimos tus datos con terceros.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {year} Aula TP Chile. Todos los derechos reservados.
      </div>
    </footer>
  );
}
