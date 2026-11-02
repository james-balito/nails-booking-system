import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import WelcomePage from "./pages/welcome-page";
import Login from "./pages/login";
import SignUp from "./pages/sign-up";
import UserDashboard from "./pages/user-dashboard";
import AdminDashboard from "./pages/admin-dashboard";
import UsersIndex from "./pages/users/index";

// Layouts & Guards
import AdminLayout from "./components/layout/dashboard-layout"; // 👈 Import the layout
import ProtectedRoute from "./components/protected-route";
import AdminRoute from "./components/admin-route";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />

      {/* --- USER ROUTE --- */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />

      {/* --- ADMIN ROUTES (Nested inside AdminLayout) --- */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminLayout /> {/* 👈 The Sidebar is inside this layout */}
          </AdminRoute>
        } 
      >
        {/* When you go to /admin, it shows AdminDashboard inside the Outlet */}
        <Route index element={<AdminDashboard />} />
        
        {/* When you go to /admin/users, it shows UsersIndex inside the Outlet */}
        <Route path="users" element={<UsersIndex />} />
        
        {/* You can add more admin pages here easily later! */}
        {/* <Route path="bookings" element={<BookingsIndex />} /> */}
        {/* <Route path="services" element={<ServicesIndex />} /> */}
      </Route>

      {/* Fallback for any unknown URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;