// Styles
import "./App.css";

// React Router DOM
import { Routes, Route } from "react-router-dom";

// Page Routes
import WelcomePage from "./pages/welcome-page";

// Auth Routes
import Login from "./pages/login";
import SignUp from "./pages/sign-up";

// Test Routes
import TestConnection from "./testpage/supabase-test-connection";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />

      <Route path="/test-db" element={<TestConnection />} />
    </Routes>
  );
}

export default App;
