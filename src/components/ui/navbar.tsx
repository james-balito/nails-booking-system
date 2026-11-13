import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import nobglogo from "../../assets/nobglogo.png";

interface NavbarProps {
  onLogoutClick: () => void;
  onBookClick: () => void;
}

export default function Navbar({ onLogoutClick, onBookClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, profile } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Split links for the bottom bar (2 left, 2 right)
  const leftLinks = [
    { name: "Gallery", href: "#gallery", icon: "M2 6h20v12H2z M2 6l10 7 10-7" },
    { name: "Reviews", href: "#testimonials", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  ];
  
  const rightLinks = [
    { name: "Services", href: "#services", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
    { name: "Contact", href: "#contact", icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" },
  ];

  const allLinks = [...leftLinks, ...rightLinks];

  const dashboardRoute = profile?.role_name === "admin" ? "/admin/dashboard" : "/dashboard";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = profile?.full_name || user?.user_metadata?.name || "User";

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
    <>
      {/* --- DESKTOP & TABLET TOP NAV --- */}
      <nav className="hidden md:flex sticky top-0 z-[9000] flex-col w-full px-6 xl:px-75 py-4 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10">
        {/* ... (Keep Desktop Navbar exactly the same as before) ... */}
        <div className="flex justify-between items-center w-full">
          <div className="text-[#F9FAFB] hover:text-[#FF007F] playfair-display-header font-bold transition-colors duration-200 z-50">
            <a href="#home">
              <img src={nobglogo} alt="Glossx Logo" className="h-11 w-18 md:h-12 md:w-14 xl:h-13 xl:w-20 hover:opacity-80" />
            </a>
          </div>

          <div className="flex space-x-6 tracking-wider text-[#F9FAFB]/50 font-semibold text-sm xl:text-base uppercase">
            {allLinks.map((link) => (
              <a key={link.name} href={link.href} className="hover:text-[#F9FAFB] transition-all duration-200">
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex space-x-6 items-center relative">
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/20 hover:border-[#FF007F] transition-colors overflow-hidden focus:outline-none">
                  {avatarUrl ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-[#FF007F] font-bold text-lg">{displayName.charAt(0).toUpperCase()}</span>}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col">
                    <div className="px-4 py-2 border-b border-white/10 mb-1">
                      <p className="text-sm text-white font-semibold truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to={dashboardRoute} onClick={() => setIsProfileOpen(false)} className="px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">Go to Dashboard</Link>
                    <button onClick={() => onLogoutClick()} className="px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 text-left transition-colors">Log Out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="cursor-pointer text-[#F9FAFB]/70 hover:text-[#F9FAFB] transition-colors font-semibold text-sm xl:text-base tracking-widest uppercase">Login</Link>
                <button type="button" onClick={onBookClick} className="uppercase tracking-wider bg-[#FF007F] text-white/90 text-sm xl:text-base font-semibold px-6 py-2.5 rounded-full hover:text-white hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,0,127,0.6)] transition-all duration-200 cursor-pointer">Book Now</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- MOBILE TOP BAR --- */}
      <nav className="md:hidden sticky top-0 z-[9000] flex justify-between items-center w-full px-6 py-4 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10">
        <a href="#home">
          <img src={nobglogo} alt="Glossx Logo" className="h-10 w-16" />
        </a>
        <div className="flex items-center gap-4">
          {user ? (
            <Link to={dashboardRoute} className="w-8 h-8 rounded-full border border-white/20 overflow-hidden flex items-center justify-center">
              {avatarUrl ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-[#FF007F] font-bold text-sm">{displayName.charAt(0).toUpperCase()}</span>}
            </Link>
          ) : (
            <Link to="/login" className="text-[#F9FAFB]/70 font-semibold text-sm uppercase">Login</Link>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
            {isOpen ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" /></svg>}
          </button>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM NAVIGATION (iPhone Style with Floating Button) --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-[9000] pb-safe">
        {/* The background bar */}
        <div className="relative w-full bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10 flex justify-between items-center px-4 py-3">
          
          {/* Left Links */}
          <div className="flex flex-1 justify-around items-center">
            {leftLinks.map((link) => (
              <a key={link.name} href={link.href} className="flex flex-col items-center gap-1 text-[#F9FAFB]/50 hover:text-[#FF007F] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={link.icon} /></svg>
                <span className="text-[10px] font-semibold uppercase tracking-wider">{link.name}</span>
              </a>
            ))}
          </div>

          {/* Middle Space (For the floating button) */}
          <div className="w-16 shrink-0" />

          {/* Right Links */}
          <div className="flex flex-1 justify-around items-center">
            {rightLinks.map((link) => (
              <a key={link.name} href={link.href} className="flex flex-col items-center gap-1 text-[#F9FAFB]/50 hover:text-[#FF007F] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={link.icon} /></svg>
                <span className="text-[10px] font-semibold uppercase tracking-wider">{link.name}</span>
              </a>
            ))}
          </div>

          {/* 👇 FLOATING BOOK BUTTON (Centered and pushed up) */}
            <button 
              onClick={onBookClick} 
              className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center gap-1 group"
            >
              <div className="w-14 h-14 bg-[#FF007F] rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(255,0,127,0.5)] border-[5px] border-[#0A0A0A] group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF007F]">Book</span>
            </button>
        </div>
      </div>

      {/* --- MOBILE SLIDE-OUT MENU --- */}
      <div
        className={`
          md:hidden fixed top-[73px] left-0 w-full bg-[#0A0A0A] border-b border-white/10 
          flex flex-col items-center gap-4 py-6 px-6 shadow-2xl transition-all duration-300 ease-in-out origin-top z-[8999]
          ${isOpen ? "opacity-100 scale-y-100 visible" : "opacity-0 scale-y-0 invisible"}
        `}
      >
        {user ? (
          <>
            <Link to={dashboardRoute} onClick={() => setIsOpen(false)} className="w-full text-center text-[#FF007F] font-bold text-sm tracking-widest uppercase py-2">
              My Dashboard
            </Link>
            <button onClick={() => { onLogoutClick(); setIsOpen(false); }} className="w-full text-center text-red-400 font-semibold text-sm tracking-widest uppercase py-2">
              Log Out
            </button>
          </>
        ) : (
          <p className="text-gray-400 text-sm text-center">Welcome to Glossx.Claw! Book your next set today.</p>
        )}
      </div>
    </>
  );
}