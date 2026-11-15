import { useState, useRef, useCallback } from "react";
import Navbar from "../components/ui/navbar";
import Footer from "../components/ui/footer";
import LogoutModal from "../components/ui/logout-modal";

import Home from "./sections/home";
import Gallery, { type BookingIntent } from "./sections/gallery";
import Services from "./sections/services";
import Contact from "./sections/contact";
import Testimonials from "./sections/testimonials";

import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function WelcomePage() {
  useScrollAnimation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Single source of truth for "what should Gallery open, and when"
  const [bookingIntent, setBookingIntent] = useState<BookingIntent | null>(null);
  const galleryRef = useRef<HTMLElement>(null);

  const openBooking = useCallback(
    (target: BookingIntent["target"], serviceName?: string) => {
      // Nonce guarantees effect re-fires even for repeated same-target clicks
      setBookingIntent({ target, serviceName, nonce: Date.now() });
    },
    []
  );

  const onScrollToGallery = useCallback(() => {
    if (galleryRef.current) galleryRef.current.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleServiceBookClick = useCallback(
    (serviceName: string) => {
      if (serviceName === "Nail Art Designs") {
        openBooking("BespokeSelection", serviceName);
      } else if (serviceName === "Nail Removal") {
        // Open slide-over directly on the Removal screen, carrying the service name
        openBooking("Removal", serviceName);
      }
    },
    [openBooking]
  );

  return (
    <div className="bg-[#0A0A0A] pb-20 xl:pb-0">
      <section id="nav" className="sticky top-0 z-50">
        <Navbar
          onLogoutClick={() => setIsLogoutModalOpen(true)}
          onBookClick={() => openBooking("Selection")}
        />
      </section>

      <section id="home">
        <Home onBookClick={() => openBooking("Selection")} />
      </section>

      <section
        id="gallery"
        ref={galleryRef}
        className="min-h-screen flex justify-center items-start"
      >
        <Gallery
          bookingIntent={bookingIntent}
          onIntentHandled={() => setBookingIntent(null)}
          onScrollToGallery={onScrollToGallery}
        />
      </section>

      <section
        id="testimonials"
        className="min-h-screen flex justify-center items-start"
      >
        <Testimonials onBookClick={() => openBooking("BespokeSelection")} />
      </section>

      <section id="services">
        <Services onBookClick={handleServiceBookClick} />
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