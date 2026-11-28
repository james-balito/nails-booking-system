import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/authContext.tsx";
import { ReactLenis } from "./utils/lenis"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ReactLenis root>
        <App />
        </ReactLenis>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
