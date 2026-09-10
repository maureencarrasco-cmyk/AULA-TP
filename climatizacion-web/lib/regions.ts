export const REGIONES_CHILE = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
] as const;

export const INTERESES = [
  { value: "demo-portal", label: "Demo Portal Docente" },
  { value: "demo-simulador", label: "Demo Simulador" },
  { value: "propuesta", label: "Propuesta comercial" },
  { value: "otro", label: "Otro" },
] as const;

export type InteresValue = (typeof INTERESES)[number]["value"];
