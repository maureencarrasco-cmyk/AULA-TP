"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ADMIN_MODULES, ERP_BASE, erpUrl } from "@/lib/administracion-course";
import { ErpVistaIcon, IconExpand } from "@/components/curso/administracion/AdminIcons";
import { COURSE_CATALOG_HREF } from "@/lib/course-portal";
import "@/app/curso/climatizacion/hub.css";
import "@/app/curso/administracion/admin.css";

export default function ErpLab() {
  const [vista, setVista] = useState("dashboard");
  const src = useMemo(() => erpUrl(vista), [vista]);
  const current = ADMIN_MODULES.find((m) => m.erpVista === vista);

  return (
    <div className="aula-font admin-shell admin-shell--erp" data-specialty="administracion">
      <header className="admin-erp-hero">
        <nav className="admin-erp-hero-nav">
          <Link href="/curso/administracion">Volver al curso</Link>
          <Link href={COURSE_CATALOG_HREF}>Catálogo</Link>
        </nav>
        <div className="admin-erp-hero-copy">
          <span className="admin-erp-badge">Taller digital · Bazar Aula TP Chile</span>
          <h1>ERP Bazar Inteligente</h1>
          <p>
            Opera el bazar de práctica: ventas, inventario, caja, proveedores y contabilidad.
            Entra con la cuenta que te entregó tu docente.
          </p>
        </div>
      </header>

      <main className="admin-erp-main">
        <div className="admin-erp-toolbar" role="tablist" aria-label="Módulos del ERP">
          {ADMIN_MODULES.map((m) => {
            const on = vista === m.erpVista;
            return (
              <button
                key={m.slug}
                type="button"
                role="tab"
                aria-selected={on}
                className={`admin-chip${on ? " is-on" : ""}`}
                onClick={() => setVista(m.erpVista)}
              >
                <span className="admin-chip-ico">
                  <ErpVistaIcon vista={m.erpVista} />
                </span>
                <span>
                  <small>M{m.numero}</small>
                  {m.erpLabel}
                </span>
              </button>
            );
          })}
          <a className="admin-chip admin-chip--go" href={src} target="_blank" rel="noreferrer">
            <span className="admin-chip-ico">
              <IconExpand />
            </span>
            Pantalla completa
          </a>
        </div>

        <section className="admin-erp-stage">
          <header className="admin-erp-stage-bar">
            <ErpVistaIcon vista={vista} />
            <strong>{current?.erpLabel || "Inicio"}</strong>
            <span>Bazar de práctica</span>
          </header>
          <iframe className="admin-erp-frame admin-erp-frame--lab" title="ERP Bazar Inteligente" src={src} />
        </section>
        <p className="admin-erp-foot">
          Sistema completo:{" "}
          <a href={ERP_BASE} target="_blank" rel="noreferrer">
            {ERP_BASE}
          </a>
        </p>
      </main>
    </div>
  );
}
