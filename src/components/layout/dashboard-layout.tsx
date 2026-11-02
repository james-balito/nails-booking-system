import { Outlet } from "react-router-dom";
import Sidebar from "../ui/sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Sidebar />
      <main className="md:pl-64 transition-all duration-300 ease-in-out pt-20 md:pt-0">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}