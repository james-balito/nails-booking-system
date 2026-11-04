import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Unauthorized from "../components/error/unauthorized";
import UserLayout from "../components/layout/user/user-layout";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white"></div>
    );
  }

  // 1. If they aren't logged in, send them to the login page
  if (profile?.role_name !== "admin") {
    return (
      <UserLayout >
        <Unauthorized />
      </UserLayout>
    );
  }

  // 2. If they aren't an admin, send them to their user dashboard
  if (profile?.role_name !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
