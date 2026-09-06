import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Hooks
import { useChat } from "../hooks/useChat";
import { useProsodyAnalyzer } from "../hooks/useProsodyAnalyzer";

// Sub-components
import Navbar from "../components/Navbar"; 
import ConfirmModal from "../components/Simulation/ConfirmModal";
import ToolsPanel from "../components/Simulation/ToolsPanel";
import ChatBar from "../components/Simulation/ChatBar";
import { API_BASE_URL } from "../config/api";

/**
 * UI Component
 *
 * The main layout container for the simulation interface.
 * It integrates the 3D model interaction (via useChat), voice recognition (Groq Whisper),
 * prosody analysis, and the UI sub-components (Navbar, Tools, ChatBar).
 *
 * @component
 * @param {object} props - Component props.
 * @param {boolean} props.hidden - If true, returns null to hide the UI.
 * @param {string} props.session_id - The ID of the current simulation session.
 */
export const UI = ({ hidden, session_id, ...props }) => {
  // --- Hooks & State Initialization ---
  const navigate = useNavigate();
  const inputRef = useRef();
  const cameraToModelWSRef = useRef();
  
  // Custom Hook: Chat Logic (Conversation with AI)
  const { subtitle } = useChat();
  const { chat, loading, cameraZoomed, setCameraZoomed, message, setMessage } = useChat();

  // Custom Hook: Prosody Analysis (Audio features extraction) & MediaRecorder
  const {
    isRecording,
    audioBlob,
    error: prosodyError,
    startRecording,
    stopRecording,
    getProsodyData,
    clearAudioData,
  } = useProsodyAnalyzer();

  // Local State
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // --- Effects ---

  // 1. Load User & Token from LocalStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) setToken(storedToken);

    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        setUserData({ username: "Guest", is_admin: false });
      }
    } else {
      setUserData({ username: "Guest", is_admin: false });
    }
  }, []);

  useEffect(() => {
    if (!session_id) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    const handlePageHide = () => {
      const storedToken = localStorage.getItem("token") || token;
      if (storedToken && session_id) {
        try {
          fetch(`${API_BASE_URL}/api/sessions/${session_id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${storedToken}`,
            },
            body: JSON.stringify({
              status: "completed",
              end_time: new Date().toISOString(),
            }),
            keepalive: true,
          }).catch(() => {});
        } catch (e) {}
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [session_id, token]);

  // --- Handlers ---

  /**
   * Mengirim audioBlob ke backend untuk ditranskripsi oleh Groq Whisper.
   */
  const transcribeAudioBlob = async (blob) => {
    if (!blob || blob.size === 0) return "";
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");

    const res = await fetch(`${API_BASE_URL}/api/chat/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Gagal mentranskripsi audio.");
    }

    const data = await res.json();
    return data.text || "";
  };

  /**
   * Sends the current message to the AI.
   * Handles stopping audio recording, analyzing prosody, and calling the chat API.
   */
  const sendMessage = async () => {
    if (loading || isSending || isTranscribing) return;

    let textToSend = message;
    let blobForAnalysis = audioBlob;

    if (isRecording) {
      const toastId = toast.loading("Memproses suara dengan Groq Whisper...");
      setIsTranscribing(true);
      try {
        const newBlob = await stopRecording();
        if (newBlob && newBlob.size > 0) {
          blobForAnalysis = newBlob;
          const transcribedText = await transcribeAudioBlob(newBlob);
          if (transcribedText) {
            textToSend = transcribedText;
            setMessage(transcribedText);
            toast.success("Suara berhasil ditranskrip!", { id: toastId });
          } else {
            toast.error("Tidak ada suara yang terdeteksi.", { id: toastId });
          }
        }
      } catch (err) {
        console.error("Transcribe error:", err);
        toast.error(`Gagal transkrip: ${err.message}`, { id: toastId });
      } finally {
        setIsTranscribing(false);
      }
    }

    if (!textToSend || !textToSend.trim()) return;

    setIsSending(true);
    let prosody = null;

    if (blobForAnalysis) {
      try {
        prosody = await getProsodyData(blobForAnalysis);
      } catch (e) {
        console.warn("Prosody extraction warning:", e);
      }
    }

    try {
      await chat(textToSend, prosody);
      setMessage("");
      clearAudioData();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Toggles microphone status (Start/Stop listening & recording via Groq STT).
   */
  const handleToggleListening = async () => {
    if (isRecording) {
      const toastId = toast.loading("Mentranskripsi suara (Groq Whisper)...");
      setIsTranscribing(true);
      try {
        const blob = await stopRecording();
        if (blob && blob.size > 0) {
          const transcribedText = await transcribeAudioBlob(blob);
          if (transcribedText) {
            setMessage(transcribedText);
            toast.success("Suara berhasil ditranskrip!", { id: toastId });
          } else {
            toast.error("Tidak ada suara yang terdeteksi.", { id: toastId });
          }
        } else {
          toast.dismiss(toastId);
        }
      } catch (err) {
        console.error("Transcribe error:", err);
        toast.error(`Gagal transkrip: ${err.message}`, { id: toastId });
      } finally {
        setIsTranscribing(false);
      }
    } else {
      clearAudioData();
      setMessage("");
      await startRecording();
    }
  };

  const handleResetTranscript = () => {
    setMessage("");
    clearAudioData();
  };

  /**
   * Logs out the user and redirects to login page.
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleConfirmEndSession = async () => {
    if (!session_id || !token) {
      return;
    }
    const loadingToast = toast.loading("Mengakhiri sesi... Harap tunggu!");

    try {
      // Bersihkan data timestamp timer sesi
      try {
        localStorage.removeItem(`simulation_start_${session_id}`);
        localStorage.removeItem("simulation_start_current");
      } catch (e) {}

      let expressionData = [];
      try {
        if (cameraToModelWSRef.current?.finishSession) {
          expressionData = (await cameraToModelWSRef.current.finishSession()) || [];
        }
      } catch (wsErr) {
        console.warn("Could not retrieve expression data from WS:", wsErr);
      }

      await fetch(`${API_BASE_URL}/api/sessions/${session_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "completed",
          end_time: new Date().toISOString(),
          expression_data: expressionData,
        }),
      });
      toast.success("Sesi selesai dengan sukses!", { id: loadingToast });

    } catch (err) {
      console.error("Error ending session:", err);
      toast.error("Gagal mengakhiri sesi. Silakan coba lagi.", { id: loadingToast });

    } finally {
      toast.dismiss();
      setShowConfirm(false);
      navigate("/dashboard", { replace: true });
    }
  };


  if (hidden) return null;

  return (
    <>
      {/* Layer 1: Confirmation Modal 
        Placed outside the main wrapper to ensure it's on top and clickable.
      */}
      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={handleConfirmEndSession}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Layer 2: Main UI Wrapper
        pointer-events-none allows clicks to pass through to the 3D Canvas behind it,
        except for children with pointer-events-auto.
      */}
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between flex-col pointer-events-none transition-all duration-300 ${
          showConfirm ? "blur-sm grayscale-[50%]" : ""
        }`}
      >
        {/* Top Navigation */}
        <Navbar
          user={userData}
          onLogout={handleLogout}
          onEndSession={() => setShowConfirm(true)}
          isSimulation={true}
          sessionId={session_id}
        />

        {/* Right Side Tools (Zoom, Green Screen, etc.) */}
        <ToolsPanel
          ref={cameraToModelWSRef}
          cameraZoomed={cameraZoomed}
          setCameraZoomed={setCameraZoomed}
        />

        {/* Bottom Chat Interface */}
        <ChatBar
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          loading={loading}
          isSending={isSending}
          listening={isRecording}
          isTranscribing={isTranscribing}
          handleToggleListening={handleToggleListening}
          resetTranscript={handleResetTranscript}
          subtitle={subtitle}
          prosodyError={prosodyError}
          inputRef={inputRef}
        />
      </div>
    </>
  );
};