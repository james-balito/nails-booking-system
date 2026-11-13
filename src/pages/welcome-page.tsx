import { useState, useRef } from "react";
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

  // 👇 Trigger state for the Gallery's slide-over
  const [triggerOpenBooking, setTriggerOpenBooking] = useState(false);
  const [triggerId, setTriggerId] = useState(0);

  const galleryRef = useRef<HTMLElement>(null);

  const handleBookClick = () => {
    setTriggerOpenBooking(true);
    setTriggerId((prev) => prev + 1); // Forces a fresh trigger
  };

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#0A0A0A] pb-20 xl:pb-0">
      <section id="nav" className="sticky top-0 z-50">
        <Navbar
          onLogoutClick={() => setIsLogoutModalOpen(true)}
          onBookClick={handleBookClick}
        />
      </section>

      <section id="home">
        <Home />
      </section>

      <section
        id="gallery"
        ref={galleryRef}
        className="min-h-screen flex justify-center items-start"
      >
        {/* 👇 Pass triggerOpenBooking */}
        <Gallery key={triggerId} triggerOpenBooking={triggerOpenBooking} onScrollToGallery={scrollToGallery} />
      </section>

      <section
        id="testimonials"
        className="min-h-screen flex justify-center items-start"
      >
        <Testimonials  onBookClick = {handleBookClick}/>
      </section>
      <section id="services">
        <Services />
      </section>
      <section id="contact">
        <Contact />
      </section>

      <Footer />
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
