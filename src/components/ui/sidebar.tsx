import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  setIsLogoutModalOpen: (val: boolean) => void;
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  setIsLogoutModalOpen,
}: SidebarProps) {
  const location = useLocation();
  const { profile } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const navItems =
    profile?.role_name === "admin"
      ? [
          { name: "Overview", href: "/admin/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
          { name: "Users", href: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
          { name: "Bookings", href: "/admin/bookings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
        ]
      : [
          { name: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
          { name: "My Bookings", href: "/my-bookings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
          { name: "Settings", href: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
        ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#0A0A0A] transition-all duration-300 ease-in-out
          
          /* Mobile behavior */
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
          
          /* Desktop behavior */
          lg:translate-x-0 ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        {/* Brand / Header */}
        <div
          className={`flex h-16 items-center border-b border-white/10 transition-all duration-300 ${isCollapsed ? "lg:justify-center px-6 lg:px-0" : "px-6 justify-between"}`}
        >
          {/* 👇 LOGO IMAGE FIXED */}
          <Link
            to="/"
            onClick={handleLinkClick}
            className={`flex items-center gap-2 ${isCollapsed ? "lg:hidden" : "block"}`}
          >
            <img 
              src="/Glossx.claw logo.png" 
              alt="Glossx Claw Logo" 
              className="h-8 md:h-10 w-auto object-contain" 
            />
          </Link>

          {/* Collapsed Text Logo */}
          <Link
            to="/"
            onClick={handleLinkClick}
            className={`hidden ${isCollapsed ? "lg:flex" : "lg:hidden"} items-center justify-center font-bold text-[#FF007F] text-2xl playfair-display-header`}
          >
            GC
          </Link>

          {/* 👇 ROTATE ARROW FIXED */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              // 👇 Added transition-transform and duration for the smooth 180 rotation
              className={`shrink-0 transition-transform duration-300 ease-in-out ${isCollapsed ? "rotate-180" : ""}`}
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          <nav className="flex flex-col px-3 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleLinkClick}
                title={isCollapsed ? item.name : ""}
                className={`flex items-center rounded-lg px-3 py-2.5 transition-all ${
                  isCollapsed ? "lg:justify-center" : "gap-3"
                } ${
                  isActive(item.href)
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d={item.icon} />
                </svg>
                <span className={`text-sm font-medium whitespace-nowrap ${isCollapsed ? "lg:hidden" : "block"}`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer & User */}
        <div className="mt-auto border-t border-white/10 p-3 flex flex-col gap-2">
          <div className={`flex items-center gap-3 rounded-lg p-2 hover:bg-white/5 transition-colors cursor-pointer mt-1 ${isCollapsed ? "lg:justify-center" : ""}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF007F]/20 text-[#FF007F] font-bold shrink-0">
              {profile?.full_name?.charAt(0) || "U"}
            </div>
            <div className={`flex flex-col overflow-hidden ${isCollapsed ? "lg:hidden" : "block"}`}>
              <span className="text-sm font-medium text-white truncate">{profile?.full_name || "User"}</span>
              <span className="text-xs text-gray-500 capitalize truncate">{profile?.role_name}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsLogoutModalOpen(true);
              handleLinkClick();
            }}
            title={isCollapsed ? "Log out" : ""}
            className={`flex items-center rounded-lg px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${isCollapsed ? "lg:justify-center" : "gap-3"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span className={`text-sm font-medium ${isCollapsed ? "lg:hidden" : "block"}`}>
              Log out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}