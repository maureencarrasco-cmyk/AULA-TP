import type { InteresValue } from "./regions";

export type Lead = {
  id: string;
  nombre: string;
  cargo: string;
  establecimiento: string;
  region: string;
  email: string;
  telefono: string;
  interes: InteresValue | string;
  mensaje: string;
  createdAt: string;
};

export type LeadFormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<keyof Omit<Lead, "id" | "createdAt">, string>>;
};
