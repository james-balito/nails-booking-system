export default function Navbar() {
  return (
    <nav
      // Added backdrop-blur and semi-transparent background for a premium scroll effect
      className="flex justify-evenly items-center px-8 py-4 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10"
    >
      {/* Logo */}
      <div className="text-[#F9FAFB] hover:text-[#FF007F] playfair-display-header font-bold text-2xl md:text-3xl lg:text-3xl transition-colors duration-200">
        <a href="#nav">Glossx.claw</a>
      </div>

      {/* Navigation Links */}
      <div className="space-x-6 tracking-wider text-[#F9FAFB]/50 font-semibold text-sm lg:text-base xl:text-sm uppercase">
        <a href="#home" className="hover:text-[#F9FAFB] transition-all duration-200">
          Home
        </a>
        <a href="#gallery" className="hover:text-[#F9FAFB] transition-all duration-200">
          Gallery
        </a>
        <a href="#services" className="hover:text-[#F9FAFB] transition-all duration-200">
          Services
        </a>
        <a href="#contact" className="hover:text-[#F9FAFB] transition-all duration-200">
          Contact
        </a>
      </div>

      {/* CTA Buttons */}
      <div className="space-x-6 flex items-center">
        <button 
          type="button"
          className="text-[#F9FAFB]/70 hover:text-[#F9FAFB] transition-colors font-semibold text-sm lg:text-base xl:text-sm tracking-widest uppercase"
        >
          Login
        </button>
        <button
          type="button"
          className="uppercase tracking-wider bg-[#FF007F] text-white/90 text-sm lg:text-base xl:text-sm font-semibold px-6 py-2.5 rounded-full hover:text-white hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,0,127,0.6)] transition-all duration-200 cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </nav>
  );
}