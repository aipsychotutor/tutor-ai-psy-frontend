import { useRef, useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmModal from "./ConfirmDialog";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export const UI = ({ hidden, onExitChat, ...props }) => {
  const { subtitle } = useChat();
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message, setMessage } =
    useChat();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const navigate = useNavigate();
  const location = useLocation();
  const { session_id, user_id, userName } = location.state || {};

  const [showConfirm, setShowConfirm] = useState(false);
  const [targetPath, setTargetPath] = useState(null);

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript, setMessage]);

  const sendMessage = () => {
    if (!loading && message) {
      chat(message);
      resetTranscript();
      setMessage("");
    }
  };

  const handleToggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "id" });
    }
  };

  if (hidden) {
    return null;
  }

  const handleNavigate = (path) => {
    setTargetPath(path);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    console.log("🧩 session_id:", session_id, "targetPath:", targetPath);
    setShowConfirm(false);

    // End session untuk semua navigasi (Home atau Dashboard)
    if (session_id) {
      try {
        await fetch(`http://localhost:3000/api/sessions/${session_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'completed', 
            end_time: new Date().toISOString() 
          })
        });
        console.log('✅ Session berhasil diakhiri:', session_id);
      } catch (err) {
        console.error('❌ Error mengakhiri sesi:', err);
      }
    }

    // Navigate setelah session di-end
    if (targetPath === "/dashboard") {
      navigate(targetPath, { 
        state: { nama: userName, user_id, session_id } 
      });
    } else {
      navigate(targetPath);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setTargetPath(null);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <nav className="flex justify-between items-center px-6 py-4 pointer-events-auto">
          {/* Kiri: Logo & teks */}
          <div className="flex flex-col">
            <h1 className="text-white text-4xl font-bold">CommuLab</h1>
            <p className="font-poppins text-white text-lg">
              Belajar komunikasi, siap hadapi pasien
            </p>
          </div>

          <div className="flex gap-6">
            <button
              onClick={() => handleNavigate("/")}
              className="text-white hover:text-yellow-400 transition"
            >
              Home
            </button>

            <button
              onClick={() => handleNavigate("/dashboard")}
              className="text-white hover:text-yellow-400 transition"
            >
              Dashboard
            </button>
          </div>

          <ConfirmModal
            show={showConfirm}
            title="Yakin mengakhiri sesi?"
            message="Apakah kamu ingin berpindah halaman?"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </nav>

        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-8 left-0 w-full flex flex-col items-center">
          {/* Subtitle */}
          {subtitle && (
            <div className="mb-2 px-4 py-2 bg-black bg-opacity-70 text-white rounded text-center max-w-xl">
              {subtitle}
            </div>
          )}
          <div className="flex w-full max-w-2xl gap-2">
            <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
              <input
                className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-full bg-opacity-50 bg-white backdrop-blur-md"
                placeholder="Ketik pesan atau mulai bicara..."
                ref={input}
                value={typeof message === "string" ? message : ""}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
              <button
                disabled={loading || !message}
                onClick={sendMessage}
                className={`bg-yellow-500 hover:bg-yellow-600 text-white p-4 px-10 font-semibold uppercase rounded-full ${
                  loading || !message ? "cursor-not-allowed opacity-30" : ""
                }`}
              >
                Send
              </button>
              <button
                disabled={loading}
                onClick={handleToggleListening}
                className={`bg-blue-500 hover:bg-blue-600 text-white p-4 font-semibold uppercase rounded-full ${
                  loading ? "cursor-not-allowed opacity-30" : ""
                }`}
              >
                {listening ? "Berhenti" : "Mulai"}
              </button>

              <button
                disabled={loading || !message}
                onClick={resetTranscript}
                className={`bg-gray-500 hover:bg-gray-600 text-white p-4 font-semibold uppercase rounded-full ${
                  loading || !message ? "cursor-not-allowed opacity-30" : ""
                }`}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};