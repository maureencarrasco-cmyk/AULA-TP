import { redirect } from "next/navigation";

/**
 * Permanent redirect: /portal-docente/especialidades/climatizacion → /curso/climatizacion
 * El curso estudiante no vive en Portal Docente.
 */
export default function ClimatizacionPortalRedirectPage() {
  redirect("/curso/climatizacion");
}
