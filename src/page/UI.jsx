import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

// Hooks
import { useChat } from "../hooks/useChat";
import { useProsodyAnalyzer } from "../hooks/useProsodyAnalyzer";

// Sub-components
import Navbar from "../components/Simulation/Navbar"; 
import ConfirmModal from "../components/Simulation/ConfirmModal";
import ToolsPanel from "../components/Simulation/ToolsPanel";
import ChatBar from "../components/Simulation/ChatBar";

/**
 * UI Component
 *
 * The main layout container for the simulation interface.
 * It integrates the 3D model interaction (via useChat), voice recognition,
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
  
  // Custom Hook: Chat Logic (Conversation with AI)
  const { subtitle } = useChat();
  const { chat, loading, cameraZoomed, setCameraZoomed, message, setMessage } = useChat();

  // Library Hook: Speech Recognition (Voice to Text)
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  // Custom Hook: Prosody Analysis (Audio features extraction)
  const {
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
  const [showCameraWidget, setShowCameraWidget] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  // 2. Sync Speech Transcript with Message State
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript, setMessage]);

  // --- Handlers ---

  /**
   * Sends the current message to the AI.
   * Handles stopping audio recording, analyzing prosody, and calling the chat API.
   */
  const sendMessage = async () => {
    if (loading || isSending || !message) return;

    setIsSending(true);
    let prosody = null;
    let blobForAnalysis = audioBlob;

    // If currently listening, stop and get the final audio blob
    if (listening) {
      SpeechRecognition.stopListening();
      const newBlob = await stopRecording();
      if (newBlob) blobForAnalysis = newBlob;
    }

    // Analyze audio if available
    if (blobForAnalysis) {
      prosody = await getProsodyData(blobForAnalysis);
    }

    try {
      await chat(message, prosody);
      resetTranscript();
      setMessage("");
      clearAudioData();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Toggles microphone status (Start/Stop listening & recording).
   */
  const handleToggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      stopRecording();
    } else {
      resetTranscript();
      clearAudioData();
      SpeechRecognition.startListening({ continuous: true, language: "id" });
      startRecording();
    }
  };

  /**
   * Logs out the user and redirects to login page.
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /**
   * Completes the session via API and redirects to dashboard.
   */
  const handleConfirmEndSession = async () => {
    setShowConfirm(false);
    if (session_id && token) {
      try {
        await fetch(`http://localhost:3000/api/sessions/${session_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "completed",
            end_time: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("Error ending session:", err);
      }
    }
    navigate("/dashboard", { replace: true });
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
        />

        {/* Right Side Tools (Zoom, Green Screen, etc.) */}
        <ToolsPanel
          cameraZoomed={cameraZoomed}
          setCameraZoomed={setCameraZoomed}
          showCameraWidget={showCameraWidget}
          setShowCameraWidget={setShowCameraWidget}
        />

        {/* Bottom Chat Interface */}
        <ChatBar
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          loading={loading}
          isSending={isSending}
          listening={listening}
          handleToggleListening={handleToggleListening}
          resetTranscript={resetTranscript}
          subtitle={subtitle}
          prosodyError={prosodyError}
          inputRef={inputRef}
        />
      </div>
    </>
  );
};