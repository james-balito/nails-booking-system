import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

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

// Admin Pages
const GalleryAdmin = lazy(() => import("./pages/admin/gallery-admin"));

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
      <Route path="/test" element={<TestConnection />} />

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

      {/* ── ADMIN PORTAL ──────────────────────────────────── */}
      {/* One parent. AdminLayout wraps every admin page via <Outlet />. */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout /> {/* ← layout only, no <Route> inside */}
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route
          path="gallery"
          element={
            <Suspense
              fallback={
                <div className="p-8 text-center text-gray-500">Loading…</div>
              }
            >
              <GalleryAdmin /> {/* ← page component, no <Route> inside */}
            </Suspense>
          }
        />
        <Route path="users" element={<UsersIndex />} />
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
