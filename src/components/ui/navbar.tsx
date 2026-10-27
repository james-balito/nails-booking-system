import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Navigation Links Array to keep code clean
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Gallery", href: "#gallery" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    // 👇 Applied px-[95px] as requested
    <nav className="sticky top-0 z-[9000] flex flex-col w-full px-75 py-4 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10">
      
      {/* --- TOP ROW (Always Visible) --- */}
      <div className="flex justify-between items-center w-full">
        
        {/* Logo */}
        <div className="text-[#F9FAFB] hover:text-[#FF007F] playfair-display-header font-bold text-2xl md:text-3xl transition-colors duration-200 z-50">
          <a href="#nav" onClick={() => setIsOpen(false)}>
            Glossx.claw
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex space-x-6 tracking-wider text-[#F9FAFB]/50 font-semibold text-sm xl:text-base uppercase">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-[#F9FAFB] transition-all duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop CTA Buttons */}
        <div className="hidden lg:flex space-x-6 items-center">
          <button
            type="button"
            className="text-[#F9FAFB]/70 hover:text-[#F9FAFB] transition-colors font-semibold text-sm xl:text-base tracking-widest uppercase"
          >
            Login
          </button>
          <button
            type="button"
            className="uppercase tracking-wider bg-[#FF007F] text-white/90 text-sm xl:text-base font-semibold px-6 py-2.5 rounded-full hover:text-white hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,0,127,0.6)] transition-all duration-200 cursor-pointer"
          >
            Book Now
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="lg:hidden text-white p-2 z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x preview-icon"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="lucide lucide-menu preview-icon"
            >
              <path d="M4 5h16"/>
              <path d="M4 12h16"/>
              <path d="M4 19h16"/>
            </svg>
          )}
        </button>
      </div>

      {/* --- MOBILE MENU (Dropdown) --- */}
      <div
        className={`
          lg:hidden xl:hidden absolute top-full left-0 w-full bg-[#0A0A0A] border-b border-white/10 
          flex flex-col items-center gap-6 py-8 px-6 shadow-2xl transition-all duration-300 ease-in-out origin-top
          ${isOpen ? "opacity-100 scale-y-100 visible" : "opacity-0 scale-y-0 invisible"}
        `}
      >
        {/* Mobile Links */}
        <div className="flex flex-col items-center gap-6 tracking-wider text-[#F9FAFB]/70 font-semibold text-base uppercase w-full">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)} // Close menu on click
              className="hover:text-[#FF007F] transition-all duration-200 w-full text-center py-2 border-b border-white/5"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile CTA Buttons */}
        <div className="flex flex-col w-full gap-4 mt-2">
          <button
            type="button"
            className="w-full text-[#F9FAFB]/70 hover:text-[#F9FAFB] transition-colors font-semibold text-sm tracking-widest uppercase py-2"
          >
            Login
          </button>
          <button
            type="button"
            className="w-full uppercase tracking-wider bg-[#FF007F] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#FF007F]/80 transition-all duration-200"
          >
            Book Now
          </button>
        </div>
      </div>
    </nav>
  );
}