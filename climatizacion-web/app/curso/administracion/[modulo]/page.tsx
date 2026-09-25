import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminModuleShell from "@/components/curso/administracion/AdminModuleShell";
import { ADMIN_MODULES, getAdminModule } from "@/lib/administracion-course";

type PageProps = {
  params: Promise<{ modulo: string }>;
  searchParams: Promise<{ estacion?: string }>;
};

export function generateStaticParams() {
  return ADMIN_MODULES.map((m) => ({ modulo: m.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { modulo } = await params;
  const mod = getAdminModule(modulo);
  if (!mod) return { title: "Administración | Aula TP" };
  return {
    title: `Módulo ${mod.numero} — ${mod.title} | Administración`,
    description: mod.blurb,
  };
}

export default async function AdminModuloPage({ params, searchParams }: PageProps) {
  const { modulo } = await params;
  const sp = await searchParams;
  const mod = getAdminModule(modulo);
  if (!mod) notFound();
  return <AdminModuleShell module={mod} initialStation={sp.estacion} />;
}
