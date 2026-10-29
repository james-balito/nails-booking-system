import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/welcome-page";
import Login from "./pages/login";
import SignUp from "./pages/sign-up";

// Styles
import "./App.css";

// Dashboards
import UserDashboard from "./pages/user-dashboard";
import AdminDashboard from "./pages/admin-dashboard";

// Route Guards
import ProtectedRoute from "./components/protected-route";
import AdminRoute from "./components/admin-route";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />

      {/* Protected Routes (Any logged-in user) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Admin Only Routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
    </Routes>
  );
}

export default App;