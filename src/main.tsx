import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register Service Worker for PWA (Web only)
if ("serviceWorker" in navigator && !(window as any).Capacitor) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.ts").catch((err) => {
      console.warn('PWA service worker registration failed:', err);
    });
  });
}
