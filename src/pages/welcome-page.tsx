// Ui's
import Navbar from "../components/ui/navbar";
// import Footer from "../components/ui/footer";

// Sections
import Home from "../components/ui/sections/home";
import Gallery from "../components/ui/sections/gallery";
import Services from "../components/ui/sections/services";
import Contact from "../components/ui/sections/contact";

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

      <section id="services">
        <Services/>
      </section>

      <section id="contact">
        <Contact/>
      </section>

      {/* <Footer/> */}
    </div>
  );
}
