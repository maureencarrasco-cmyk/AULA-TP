import { redirect } from "next/navigation";

/** Alias con guion bajo → ruta canónica con guion. */
export default function PortalDocenteUnderscoreRedirect() {
  redirect("/portal-docente");
}
