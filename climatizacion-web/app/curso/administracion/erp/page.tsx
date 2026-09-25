import type { Metadata } from "next";
import ErpLab from "@/components/curso/administracion/ErpLab";

export const metadata: Metadata = {
  title: "ERP Bazar Inteligente | Administración Aula TP",
  description:
    "Taller digital del curso Administración: opera el ERP Bazar Inteligente para ventas, inventario, caja, proveedores y contabilidad.",
};

export default function AdminErpPage() {
  return <ErpLab />;
}
