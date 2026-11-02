import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import supabase from "../../config/supabaseClient";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay (Closes sidebar when clicking outside) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#1A1A1A] border-r border-white/10 z-50 flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header / Toggle */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 h-[88px]">
          <Link to="/" className={`playfair-display-header font-bold text-[#FF007F] text-xl transition-opacity ${!isOpen && "md:opacity-0"}`}>
            Glossx.claw
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-white transition-colors hidden md:block"
          >
            {isOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto">
          
          {/* Conditional Links based on Role */}
          {profile?.role_name === "admin" ? (
            <>
              <SidebarLink to="/admin" icon="📊" text="Overview" isOpen={isOpen} isActive={isActive("/admin")} />
              <SidebarLink to="/admin/bookings" icon="📅" text="Bookings" isOpen={isOpen} isActive={isActive("/admin/bookings")} />
              <SidebarLink to="/admin/users" icon="👥" text="Users" isOpen={isOpen} isActive={isActive("/admin/users")} />
              <SidebarLink to="/admin/services" icon="💅" text="Services" isOpen={isOpen} isActive={isActive("/admin/services")} />
            </>
          ) : (
            <>
              <SidebarLink to="/dashboard" icon="🏠" text="My Dashboard" isOpen={isOpen} isActive={isActive("/dashboard")} />
              <SidebarLink to="/book" icon="📅" text="Book a Set" isOpen={isOpen} isActive={isActive("/book")} />
              <SidebarLink to="/history" icon="🕒" text="Booking History" isOpen={isOpen} isActive={isActive("/history")} />
            </>
          )}
          
          <div className="my-4 border-t border-white/10 mx-4"></div>

          <SidebarLink to="/settings" icon="⚙️" text="Settings" isOpen={isOpen} isActive={isActive("/settings")} />
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <span className="text-xl">🚪</span>
            {isOpen && <span className="font-semibold whitespace-nowrap">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header (For small screens) */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between px-6 z-30">
        <span className="playfair-display-header font-bold text-[#FF007F] text-xl">Glossx.claw</span>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white text-2xl">☰</button>
      </div>
    </>
  );
}

// Reusable Sub-component for the Links
function SidebarLink({ to, icon, text, isOpen, isActive }: { to: string; icon: string; text: string; isOpen: boolean; isActive: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 mx-3 p-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? "bg-[#FF007F]/10 text-[#FF007F] border border-[#FF007F]/20" 
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="text-xl shrink-0">{icon}</span>
      <span className={`font-semibold whitespace-nowrap transition-opacity duration-200 ${!isOpen && "md:opacity-0 md:w-0 hidden"}`}>
        {text}
      </span>
    </Link>
  );
}