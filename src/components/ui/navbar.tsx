import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext"; // 👈 Import Auth Context
import supabase from "../../config/supabaseClient";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Gallery", href: "#gallery" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ];

  // Determine the dashboard route based on role
  const dashboardRoute = profile?.role_name === "admin" ? "/admin" : "/dashboard";

  // Get Avatar or Initials
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = profile?.full_name || user?.user_metadata?.name || "User";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
    navigate("/");
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-[9000] flex flex-col w-full px-6 xl:px-75 py-4 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10">
      
      {/* --- TOP ROW --- */}
      <div className="flex justify-between items-center w-full">
        
        {/* Logo */}
        <div className="text-[#F9FAFB] hover:text-[#FF007F] playfair-display-header font-bold text-2xl md:text-3xl transition-colors duration-200 z-50">
          <a href="#home" onClick={() => setIsOpen(false)}>
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

        {/* Desktop CTA / Profile */}
        <div className="hidden lg:flex space-x-6 items-center relative">
          {user ? (
            // 👇 LOGGED IN: Show Profile Avatar & Dropdown
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/20 hover:border-[#FF007F] transition-colors overflow-hidden focus:outline-none"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#FF007F] font-bold text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col">
                  <div className="px-4 py-2 border-b border-white/10 mb-1">
                    <p className="text-sm text-white font-semibold truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to={dashboardRoute}
                    onClick={() => setIsProfileOpen(false)}
                    className="px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 text-left transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 👇 LOGGED OUT: Show Login & Book Now
            <>
              <Link
                to="/login"
                className="cursor-pointer text-[#F9FAFB]/70 hover:text-[#F9FAFB] transition-colors font-semibold text-sm xl:text-base tracking-widest uppercase"
              >
                Login
              </Link>
              <button
                type="button"
                className="uppercase tracking-wider bg-[#FF007F] text-white/90 text-sm xl:text-base font-semibold px-6 py-2.5 rounded-full hover:text-white hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,0,127,0.6)] transition-all duration-200 cursor-pointer"
              >
                Book Now
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-4 lg:hidden z-50">
          {/* Mobile Profile Avatar (Small) */}
          {user && (
            <Link to={dashboardRoute} className="w-8 h-8 rounded-full border border-white/20 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#FF007F] font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </Link>
          )}
          
          <button
            className="text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M4 19h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU (Dropdown) --- */}
      <div
        className={`
          lg:hidden absolute top-full left-0 w-full bg-[#0A0A0A] border-b border-white/10 
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
              onClick={() => setIsOpen(false)}
              className="hover:text-[#FF007F] transition-all duration-200 w-full text-center py-2 border-b border-white/5"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile CTA Buttons */}
        <div className="flex flex-col w-full gap-4 mt-2">
          {user ? (
            <>
              <Link
                to={dashboardRoute}
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-[#FF007F] font-bold text-sm tracking-widest uppercase py-2"
              >
                My Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-center text-red-400 font-semibold text-sm tracking-widest uppercase py-2"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-[#F9FAFB]/70 hover:text-[#F9FAFB] transition-colors font-semibold text-sm tracking-widest uppercase py-2"
              >
                Login
              </Link>
              <button
                type="button"
                className="w-full uppercase tracking-wider bg-[#FF007F] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#FF007F]/80 transition-all duration-200"
              >
                Book Now
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}