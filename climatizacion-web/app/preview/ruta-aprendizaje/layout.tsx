import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vista local · Modelos de ruta de aprendizaje",
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
