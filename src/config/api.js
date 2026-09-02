const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export const API_BASE_URL = isLocalhost
  ? "http://localhost:3000"
  : (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export const WS_BASE_URL = isLocalhost
  ? "ws://localhost:8000/ws"
  : (import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws");
