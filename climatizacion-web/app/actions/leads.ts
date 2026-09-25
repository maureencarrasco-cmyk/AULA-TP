"use server";

import { promises as fs } from "fs";
import path from "path";
import type { Lead, LeadFormState } from "@/lib/types";
import { INTERESES } from "@/lib/regions";

const LEADS_PATH = path.join(process.cwd(), "data", "leads.json");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_INTERESES = new Set(INTERESES.map((i) => i.value));

function clean(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitLead(
  _prev: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const nombre = clean(formData.get("nombre"));
  const cargo = clean(formData.get("cargo"));
  const establecimiento = clean(formData.get("establecimiento"));
  const region = clean(formData.get("region"));
  const email = clean(formData.get("email")).toLowerCase();
  const telefono = clean(formData.get("telefono"));
  const interes = clean(formData.get("interes"));
  const mensaje = clean(formData.get("mensaje"));

  const errors: LeadFormState["errors"] = {};

  if (!nombre || nombre.length < 2) {
    errors.nombre = "Ingresa tu nombre completo.";
  }
  if (!establecimiento) {
    errors.establecimiento = "Indica el establecimiento o institución.";
  }
  if (!email || !EMAIL_RE.test(email)) {
    errors.email = "Ingresa un correo electrónico válido.";
  }
  if (!interes || !VALID_INTERESES.has(interes as (typeof INTERESES)[number]["value"])) {
    errors.interes = "Selecciona un interés.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Revisa los campos marcados e intenta nuevamente.",
      errors,
    };
  }

  const lead: Lead = {
    id: crypto.randomUUID(),
    nombre,
    cargo,
    establecimiento,
    region,
    email,
    telefono,
    interes,
    mensaje,
    createdAt: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(LEADS_PATH), { recursive: true });

  let leads: Lead[] = [];
  try {
    const raw = await fs.readFile(LEADS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) leads = parsed;
  } catch {
    leads = [];
  }

  leads.push(lead);
  await fs.writeFile(LEADS_PATH, JSON.stringify(leads, null, 2) + "\n", "utf-8");

  // Opcional: aquí puedes reenviar el lead a Formspree o Resend (ver README).

  return {
    ok: true,
    message: "¡Gracias! Recibimos tu solicitud. Te contactaremos pronto.",
  };
}
