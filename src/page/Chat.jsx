// ./src/page/Chat.jsx

import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "../components/Experience";
import { ChatProvider } from "../hooks/useChat";
import { ChatHistory } from "../components/ChatHistory";
import { UI } from "../components/UI";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Chat() {
  const location = useLocation();
  const { patientId, user_id, session_id, userName, avatarPath: preloadedAvatarPath } = location.state || {};
  
  const [avatarPath, setAvatarPath] = useState(preloadedAvatarPath || null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(!preloadedAvatarPath);

  useEffect(() => {
    if (preloadedAvatarPath) {
      setIsLoadingAvatar(false);
      return;
    }

    if (!patientId) {
      setAvatarPath("/models/default.glb");
      setIsLoadingAvatar(false);
      return;
    }

    fetch(`http://localhost:3000/api/patients/model/${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.avatar_path) {
          const normalizedPath = data.avatar_path.startsWith('/') 
            ? data.avatar_path 
            : `/${data.avatar_path}`;
          setAvatarPath(normalizedPath);
          console.log("Loaded avatar path:", normalizedPath);
        } else {
          setAvatarPath("/models/default.glb");
        }
      })
      .catch((err) => {
        console.error("Error fetching avatar:", err);
        setAvatarPath("/models/default.glb");
      })
      .finally(() => {
        setIsLoadingAvatar(false);
      });
  }, [patientId, preloadedAvatarPath]);

  if (isLoadingAvatar) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd">
        <div className="text-white text-xl">Loading avatar...</div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <Loader />
      <Leva hidden />
      <UI />
      <ChatHistory />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience avatarPath={avatarPath} />
      </Canvas>
    </ChatProvider>
  );
}

export default Chat;