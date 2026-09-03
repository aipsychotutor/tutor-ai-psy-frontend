const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "::1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("10.") ||
    window.location.hostname.startsWith("172."));

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (isLocalhost ? "http://localhost:3000" : "http://localhost:3000")
).replace(/\/$/, "");

export const WS_BASE_URL =
  import.meta.env.VITE_WS_URL ||
  (isLocalhost ? "ws://localhost:8000/ws" : "ws://localhost:8000/ws");
