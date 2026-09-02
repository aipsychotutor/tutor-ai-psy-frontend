// Centralized API and WebSocket Configuration with Smart Auto-Detection

// Cek apakah aplikasi sedang dibuka di browser laptop sendiri (localhost / 127.0.0.1)
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// 1. Jika dibuka di laptop sendiri (http://localhost:5173):
//    -> Otomatis langsung pakai http://localhost:3000 (Cepat, hemat kuota, bisa offline).
// 2. Jika dibuka lewat Cloudflare / HP / device lain (https://xxx.trycloudflare.com):
//    -> Otomatis pakai URL Cloudflare dari file .env (VITE_API_URL).
export const API_BASE_URL = isLocalhost
  ? "http://localhost:3000"
  : (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

// Hal yang sama untuk WebSocket AI Model Server (Python)
export const WS_BASE_URL = isLocalhost
  ? "ws://localhost:8000/ws"
  : (import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws");
