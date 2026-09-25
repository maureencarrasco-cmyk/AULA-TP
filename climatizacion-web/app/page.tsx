import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Benefits } from "@/components/Benefits";
import { Products } from "@/components/Products";
import { PortalDocenteGallery } from "@/components/PortalDocenteGallery";
import { SocialProof } from "@/components/SocialProof";
import { FAQ } from "@/components/FAQ";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <Hero />
        <Benefits />
        <Products />
        <PortalDocenteGallery />
        <SocialProof />
        <FAQ />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
