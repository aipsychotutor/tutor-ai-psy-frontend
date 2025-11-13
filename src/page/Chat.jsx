// ./src/page/Chat.jsx

import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "../components/Experience";
import { ChatProvider } from "../hooks/useChat";
import { ChatHistory } from "../components/ChatHistory";
import { UI } from "../components/UI";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function Chat() {
  const navigate = useNavigate();
  const { session_id } = useParams();
  const location = useLocation();
  const { avatarPath: preloadedAvatarPath } = location.state || {};
  
  const [token, setToken] = useState(null);
  const [avatarPath, setAvatarPath] = useState(preloadedAvatarPath || null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(!preloadedAvatarPath);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      console.log("Tidak ada token, redirect ke halaman utama...");
      navigate("/", { replace: true }); 
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  const handleAuthError = () => {
    console.log("Token tidak valid atau expired. Logout...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true }); // Redirect ke login
  };

  useEffect(() => {
    if (preloadedAvatarPath) {
      setIsLoadingAvatar(false);
      return;
    }

  if (!token || !session_id) {
    return;
  }
  
  const fetchAvatarOnRefresh = async () => {
      try {
        // 1. Ambil data sesi untuk mencari tahu patient_id
        console.log("Refreshing chat, fetching session data...");
        const sessionRes = await fetch(`http://localhost:3000/api/sessions/${session_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (sessionRes.status === 401 || sessionRes.status === 403) return handleAuthError();
        const sessionData = await sessionRes.json();
        
        if (!sessionData.success || !sessionData.data.patient_id) {
          throw new Error("Gagal memuat data sesi atau patient_id tidak ditemukan");
        }
        
        const patientId = sessionData.data.patient_id;

        // 2. Sekarang ambil model avatar menggunakan patient_id
        console.log(`Fetching avatar for patient ${patientId}...`);
        const avatarRes = await fetch(`http://localhost:3000/api/patients/model/${patientId}`, {
          headers: { 'Authorization': `Bearer ${token}` } // <-- Tambahkan token
        });

        if (avatarRes.status === 401 || avatarRes.status === 403) return handleAuthError();
        const avatarData = await avatarRes.json();
        
        if (avatarData?.avatar_path) {
          const normalizedPath = avatarData.avatar_path.startsWith('/') 
            ? avatarData.avatar_path 
            : `/${avatarData.avatar_path}`;
          setAvatarPath(normalizedPath);
          console.log("Loaded avatar path on refresh:", normalizedPath);
        } else {
          setAvatarPath("/models/default.glb");
        }
      } catch (err) {
        console.error("Error fetching avatar on refresh:", err);
        setAvatarPath("/models/default.glb");
      } finally {
        setIsLoadingAvatar(false);
      }
    };
    fetchAvatarOnRefresh();
  }, [session_id, token, preloadedAvatarPath]);

  if (isLoadingAvatar) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd">
        <div className="text-white text-xl">Loading avatar...</div>
      </div>
    );
  }

  return (
    <ChatProvider session_id={session_id}>
      <Loader />
      <Leva hidden />
      <UI session_id={session_id} />
      <ChatHistory />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience avatarPath={avatarPath} />
      </Canvas>
    </ChatProvider>
  );
}

export default Chat;