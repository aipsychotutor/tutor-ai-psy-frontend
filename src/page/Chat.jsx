import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "../components/Simulation/Experience";
import { ChatProvider } from "../hooks/useChat";
import { ChatHistory } from "../components/Simulation/ChatHistory";
import { UI } from "./UI";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

/**
 * ============================================================================
 * CHAT PAGE COMPONENT
 * ============================================================================
 * Halaman utama di mana simulasi percakapan terjadi.
 * Menggabungkan elemen 3D (Canvas/Experience) dengan UI Overlay (HTML).
 * Menangani logika loading avatar 3D secara dinamis berdasarkan sesi pasien.
 */
function Chat() {
  const navigate = useNavigate();
  const { session_id } = useParams(); // Ambil session_id dari URL
  const location = useLocation();
  
  // Mengambil avatarPath yang dikirim via state navigasi (jika dari halaman Profile)
  // Ini untuk optimasi agar tidak perlu fetch ulang jika data sudah ada.
  const { avatarPath: preloadedAvatarPath } = location.state || {};

  const [token, setToken] = useState(null);
  const [avatarPath, setAvatarPath] = useState(preloadedAvatarPath || null);
  
  // Jika ada preloaded path, tidak perlu loading. Jika tidak (refresh page), set loading true.
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(!preloadedAvatarPath);

  // --- EFFECT 1: AUTH CHECK ---
  // Memastikan user memiliki token valid saat mengakses halaman ini
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/", { replace: true });
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  // Helper: Handle jika token expired/invalid saat fetch API
  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  // --- EFFECT 2: AVATAR FETCHING LOGIC ---
  // Menangani logika pengambilan model 3D (Avatar)
  useEffect(() => {
    // KASUS 1: Data avatar sudah ada dari navigasi sebelumnya (Ideal)
    if (preloadedAvatarPath) {
      setIsLoadingAvatar(false);
      return;
    }

    // Tunggu sampai token & session_id tersedia
    if (!token || !session_id) {
      return;
    }

    // KASUS 2: Halaman di-refresh (Data state hilang, perlu fetch ulang ke API)
    const fetchAvatarOnRefresh = async () => {
      try {
        // 1. Ambil detail sesi untuk mendapatkan patient_id
        const sessionRes = await fetch(
          `http://localhost:3000/api/sessions/${session_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (sessionRes.status === 401 || sessionRes.status === 403)
          return handleAuthError();
        const sessionData = await sessionRes.json();

        if (!sessionData.success || !sessionData.data.patient_id) {
          throw new Error(
            "Gagal memuat data sesi atau patient_id tidak ditemukan"
          );
        }

        const patientId = sessionData.data.patient_id;

        // 2. Ambil data pasien untuk mendapatkan avatar_path
        const avatarRes = await fetch(
          `http://localhost:3000/api/patients/model/${patientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (avatarRes.status === 401 || avatarRes.status === 403)
          return handleAuthError();
        const avatarData = await avatarRes.json();

        // 3. Set path avatar (dengan normalisasi slash)
        if (avatarData?.avatar_path) {
          const normalizedPath = avatarData.avatar_path.startsWith("/")
            ? avatarData.avatar_path
            : `/${avatarData.avatar_path}`;
          setAvatarPath(normalizedPath);
        } else {
          setAvatarPath("/models/default.glb"); // Fallback ke default
        }
      } catch (err) {
        setAvatarPath("/models/default.glb"); // Fallback jika error
      } finally {
        setIsLoadingAvatar(false);
      }
    };
    fetchAvatarOnRefresh();
  }, [session_id, token, preloadedAvatarPath]);

  // --- RENDER: LOADING STATE ---
  if (isLoadingAvatar) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd">
        <div className="text-white text-xl">Loading avatar...</div>
      </div>
    );
  }

  // --- RENDER: MAIN CHAT INTERFACE ---
  return (
    // ChatProvider: Menyediakan context untuk manajemen pesan & audio ke seluruh komponen anak
    <ChatProvider session_id={session_id}>
      
      {/* Loader: Progress bar bawaan Drei untuk aset 3D */}
      <Loader />
      
      {/* Leva: Panel debug GUI (disembunyikan di production) */}
      <Leva hidden />
      
      {/* UI: Layer HTML di atas Canvas (Tombol, Input Chat, dll) */}
      <UI session_id={session_id} />
      
      {/* ChatHistory: Komponen logic untuk memproses riwayat chat/audio (mungkin invisible) */}
      <ChatHistory />
      
      {/* Canvas: Area Render 3D (React Three Fiber) */}
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        {/* Experience: Scene 3D utama (Lighting, Environment, Avatar Model) */}
        <Experience avatarPath={avatarPath} />
      </Canvas>

    </ChatProvider>
  );
}

export default Chat;