// ./src/hooks/useChat.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

const backendUrl = API_BASE_URL;

const ChatContext = createContext();

export const ChatProvider = ({ children, session_id }) => {
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [subtitle, setSubtitle] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  // Improved audio playback dengan error handling
  const playAIResponse = (aiMessage) => {
    return new Promise((resolve, reject) => {
      setSubtitle(aiMessage.text);
      setIsPlaying(true);

      // Check if audio exists
      if (!aiMessage.audio) {
        console.warn("⚠️ No audio data, using text only");
        // Simulate delay for text reading
        setTimeout(() => {
          setIsPlaying(false);
          setSubtitle("");
          resolve();
        }, aiMessage.text.length * 50); // Rough reading time
        return;
      }

      try {
        const audio = new window.Audio(`data:audio/mp3;base64,${aiMessage.audio}`);
        
        audio.onended = () => {
          setIsPlaying(false);
          setSubtitle("");
          resolve();
        };

        audio.onerror = (err) => {
          console.error("❌ Audio playback error:", err);
          setIsPlaying(false);
          setSubtitle("");
          reject(err);
        };

        audio.play().catch(err => {
          console.error("❌ Audio play failed:", err);
          reject(err);
        });

      } catch (err) {
        console.error("❌ Audio creation error:", err);
        setIsPlaying(false);
        setSubtitle("");
        reject(err);
      }
    });
  };

  const chat = async (message,prosody_data) => {
    if (!session_id) {
      console.error("❌ No session_id available");
      setError("Session tidak valid");
      return;
    }

    setLoading(true);
    setError(null);
    const clientStartTime = performance.now();
    console.log(`\n🚀 [Simulation Chat] Mengirim pesan: "${message}"`);

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message,
          session_id, // ✅ Kirim session_id
          prosody_data: prosody_data || null // 👈 TAMBAHKAN INI
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Unknown error");
      }

      const resp = data.messages;
      const clientTotalTime = Math.round(performance.now() - clientStartTime);
      console.log(`⚡ [Simulation Chat] Respons diterima dalam ${clientTotalTime} ms (${(clientTotalTime / 1000).toFixed(2)} detik) -> Avatar mulai bicara!`);

      setMessages((messages) => [...messages, ...resp]);
      setHistory((prev) => [...prev, { user: message, ai: resp }]);

    } catch (err) {
      console.error("❌ Chat error:", err);
      setError(err.message);
      
      // Show error message to user
      setMessages((messages) => [...messages, {
        text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        facialExpression: "sad",
        animation: "Idle",
        audio: null
      }]);
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
      setSubtitle(messages[0].text || "");
    } else {
      setMessage(null);
      setSubtitle("");
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        setMessage,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        history,
        subtitle,
        isPlaying,
        playAIResponse,
        error
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};