import { useState } from "react";
import Navbar from "../components/ui/navbar";
import Footer from "../components/ui/footer";
import LogoutModal from "../components/ui/logout-modal";

import Home from "./sections/home";
import Gallery from "./sections/gallery";
import Services from "./sections/services";
import Contact from "./sections/contact";
import Testimonials from "./sections/testimonials";

import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function WelcomePage() {
  useScrollAnimation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="bg-[#0A0A0A]">
      <section id="nav" className="sticky top-0 z-50">
        <Navbar onLogoutClick={() => setIsLogoutModalOpen(true)} />
      </section>

      <section id="home">
        <Home />
      </section>

      <section
        id="gallery"
        className="min-h-screen flex justify-center items-start"
      >
        <Gallery />
      </section>

      <section
        id="testimonials"
        className="min-h-screen flex justify-center items-start"
      >
        <Testimonials />
      </section>

      <section id="services">
        <Services />
      </section>
      
      <section id="contact">
        <Contact />
      </section>

      <Footer />

      {/* Rendered at page root — escapes the sticky <section> stacking context */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
