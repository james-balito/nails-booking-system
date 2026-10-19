// Ui's
import Navbar from "../components/ui/navbar";

// Sections
import Home from "../components/ui/sections/home";
import Gallery from "../components/ui/sections/gallery";

export default function WelcomePage() {
  
  return (
    <div className={`bg-[#0A0A0A]`}>
      {/* Navigation Bar & Links */}
      <section id="nav" className ="sticky top-0 z-50">
        <Navbar />
      </section>

      {/* Home Section */}
      <section
        id="home"
      >
      <Home />
      </section>

      {/* Gallery Section */}
      <section
        id="gallery"
        className="min-h-screen flex justify-center items-start"
      >
        <Gallery/>
      </section>

      <section id="services" className="min-h-screen">
        <div>Services</div>
      </section>
    </div>
  );
}
