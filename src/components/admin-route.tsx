import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Wait for profile to fetch

  if (profile?.roles?.name !== "admin")
    return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
