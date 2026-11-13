import { Routes, Route } from "react-router-dom";

// Styles
import "./App.css";

// Pages
import WelcomePage from "./pages/welcome-page";
import Login from "./pages/auth/login";
import SignUp from "./pages/auth/sign-up";
import UserDashboard from "./pages/user-dashboard";
import AdminDashboard from "./pages/admin/admin-dashboard";
import UsersIndex from "./pages/users/index";

// Layouts & Guards
import UserLayout from "./components/layout/user/user-layout";
import AdminLayout from "./components/layout/admin/admin-layout";
import ProtectedRoute from "./route/protected-route";
import AdminRoute from "./route/admin-route";

// Error Pages
import NotFound from "./components/error/not-found";

// Test Pages
import TestConnection from "./testpage/supabase-test-connection";

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />

{/* Test Connection */}
<Route path = "/test" element={<TestConnection />}/>

      {/* USER PORTAL */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        {/* Other user routes go here */}
      </Route>

      {/* ADMIN PORTAL */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />

        {/* 👇 404 inside the Admin Layout */}
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="users" element={<UsersIndex />} />

        {/* 👇 404 inside the Admin Layout */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 👇 GLOBAL 404 (For logged-in Users) */}
      {/* Wrapped in UserLayout so they keep the user sidebar if they get lost */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <UserLayout>
              <NotFound />
            </UserLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
