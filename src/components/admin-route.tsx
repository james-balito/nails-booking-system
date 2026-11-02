import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  // If the AuthContext is still fetching the profile, wait!
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        Checking permissions...
      </div>
    );
  }

  // If the user is NOT an admin, send them to the user dashboard
  if (profile?.role_name !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // If they ARE an admin, let them in
  return <>{children}</>;
}