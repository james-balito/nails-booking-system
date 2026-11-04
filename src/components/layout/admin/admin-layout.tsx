import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import LogoutModal from "../../ui/logout-modal";

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const location = useLocation();
  const { profile } = useAuth();

  const navItems = [
    {
      name: "Overview",
      href: "/admin/dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      name: "Bookings",
      href: "/admin/bookings",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
  ];

  // 👇 Helper to generate breadcrumbs based on the current URL
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter((path) => path !== "");

    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link
          to="/admin/dashboard"
          className="hover:text-white transition-colors"
        >
          Admin
        </Link>
        {paths.slice(1).map((path) => {
          // Capitalize the first letter (e.g., "users" -> "Users")
          const label = path.charAt(0).toUpperCase() + path.slice(1);

          return (
            <div key={path} className="flex items-center gap-2">
              <span className="text-gray-600">/</span>
              <span className="text-white font-medium">{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans flex">
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Admin Sidebar (Collapsible) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#0A0A0A] transition-all duration-300 
        ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
        lg:translate-x-0 ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div
          className={`flex h-16 items-center border-b border-white/10 ${isCollapsed ? "lg:justify-center px-0" : "px-6 justify-between"}`}
        >
          <Link
            to="/"
            className={`flex items-center gap-2 ${isCollapsed ? "lg:hidden" : "block"}`}
          >
            <img
              src="/src/assets/nobglogo.png"
              alt="Glossx Claw Logo"
              className="h-15 w-18 xl:w-18 xl:h-11 object-contain hover:cursor-pointer hover:opacity-80"
            />
          </Link>

          {/* Collapsed Logo Text (Shows only on desktop when collapsed) */}
          <Link
            to="/"
            className={`hidden ${isCollapsed ? "lg:flex lg: ml-2" : "lg:hidden"} items-center justify-center font-bold text-[#FF007F] text-2xl playfair-display-header`}
          >
            <img
              src="/src/assets/nobglogo.png"
              alt="Glossx Claw Logo"
              className="xl:w-12 xl:h-7 object-contain hover:cursor-pointer hover:opacity-80"
            />
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex text-gray-400 hover:text-white"
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
              className={`transition-transform ${isCollapsed ? "rotate-180" : ""}`}
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
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
            >
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              title={isCollapsed ? item.name : ""}
              className={`flex items-center rounded-lg px-3 py-2.5 transition-all ${isCollapsed ? "lg:justify-center" : "gap-3"} ${
                location.pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
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
              >
                <path d={item.icon} />
              </svg>
              <span
                className={`text-sm font-medium ${isCollapsed ? "lg:hidden" : "block"}`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 p-3">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={`w-full flex items-center rounded-lg px-3 py-2 text-red-400 hover:bg-red-500/10 transition-colors ${isCollapsed ? "lg:justify-center" : "gap-3"}`}
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
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span
              className={`text-sm font-medium ${isCollapsed ? "lg:hidden" : "block"}`}
            >
              Log out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#111111]/80 px-4 md:px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
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
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>

            {/* 👇 Breadcrumbs (Hidden on mobile to save space, shown on md+) */}
            <div className="hidden md:block">{generateBreadcrumbs()}</div>
          </div>

          {/* Right Side User Info */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 hidden sm:block">
              Admin:
            </span>
            <span className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-none">
              {profile?.full_name}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
