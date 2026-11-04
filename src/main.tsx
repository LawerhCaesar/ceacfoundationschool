import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { registerServiceWorker, setupNetworkListeners } from "@/lib/service-worker";

// Register service worker for offline capability
registerServiceWorker();

// Setup network status listeners
setupNetworkListeners(
  () => {
    console.log('✅ Back online!');
    // You can show a toast notification here
  },
  () => {
    console.log('⚠️ You are offline. Some features may be limited.');
    // You can show a toast notification here
  }
);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="foundation-portal-theme">
    <App />
  </ThemeProvider>
);
