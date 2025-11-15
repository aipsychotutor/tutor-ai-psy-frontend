import { useRef, useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "./ConfirmDialog";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useProsodyAnalyzer } from "../hooks/useProsodyAnalyzer";
import CameraToModelWS from "./CameraToModelWS";

export const UI = ({ hidden, session_id, ...props }) => {
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

  const {
    isRecording, // Kita bisa gunakan 'listening' atau 'isRecording'
    audioBlob,
    error: prosodyError,
    startRecording,
    stopRecording,
    getProsodyData,
    clearAudioData,
  } = useProsodyAnalyzer();

  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetPath, setTargetPath] = useState(null);
  const [showCameraWidget, setShowCameraWidget] = useState(false);

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Ambil token saat komponen dimuat
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      // Jika tidak ada token, idealnya redirect, 
      // tapi kita asumsikan Chat.jsx sudah menangani ini
      console.error("UI: Token tidak ditemukan");
    }
  }, []);

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript, setMessage]);

  const sendMessage = async () => {
    if (loading || isSending || !message) {
        console.log("Send cancelled: loading/sending/no message");
        return;
    }

    setIsSending(true); // Mulai proses pengiriman
    let prosody = null;
    let blobForAnalysis = audioBlob; // Ambil blob yang ada (jika user hanya mengetik)

    // 5. Hentikan rekaman jika masih berjalan
    if (listening) {
      console.log("Auto-stopping recordings...");
      SpeechRecognition.stopListening();
      
      // 🛑 TUNGGU (await) proses stopRecording selesai
      // Ini akan mengembalikan blob yang BARU saja direkam
      const newBlob = await stopRecording(); 
      
      if (newBlob) {
        blobForAnalysis = newBlob; // Gunakan blob baru ini untuk analisis
      }
    }

    // 🛑 PERBAIKAN DI SINI:
    // Kita cek `blobForAnalysis` (variabel lokal baru), BUKAN `audioBlob` (state lama)
    if (blobForAnalysis) {
      console.log("UI.jsx: Getting prosody data before sending...");
      
      // 🛑 DAN KITA MASUKKAN SEBAGAI ARGUMEN
      prosody = await getProsodyData(blobForAnalysis); 
      
      if (!prosody) {
        console.warn("UI.jsx: Gagal mendapatkan data prosodi, mengirim tanpa data prosodi.");
        // Anda bisa menampilkan error prosodyError di sini
      }
    } else {
      console.log("UI.jsx: Tidak ada audio blob, mengirim tanpa data prosodi (teks saja).");
    }

    try {
      // 7. Panggil fungsi 'chat' dari useChat.js
      // Kita kirim 'message' (string) dan 'prosody' (objek)
      // Ini WAJIB Anda tangani di dalam file `useChat.js`
      console.log("UI.jsx: Calling chat() with message and prosody:", message, prosody);
      await chat(message, prosody); 
      
      resetTranscript();
      setMessage("");
      clearAudioData(); // Bersihkan audio blob

    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
    } finally {
      setIsSending(false); // Selesai mengirim
    }
  };

  const handleToggleListening = () => {
    if (listening) {
      // --- STOPPING ---
      console.log("UI.jsx: Stopping all recordings");
      SpeechRecognition.stopListening(); // Stop STT
      stopRecording(); // Stop Prosody Recording (versi async baru)
    } else {
      // --- STARTING ---
      console.log("UI.jsx: Starting all recordings");
      resetTranscript();
      clearAudioData(); // Hapus audio sebelumnya
      SpeechRecognition.startListening({ continuous: true, language: "id" }); // Mulai STT
      startRecording(); // Mulai Prosody Recording
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
    setShowConfirm(false);

    // End session untuk semua navigasi (Home atau Dashboard)
    if (session_id && token) {
      try {
        await fetch(`http://localhost:3000/api/sessions/${session_id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
    navigate(targetPath, { replace: true });
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setTargetPath(null);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <nav className="flex justify-between items-center px-6 py-4 pointer-events-auto">
          <div className="flex flex-col">
            <h1 className="text-white text-4xl font-bold">CommuLab</h1>
            <p className="font-poppins text-white text-lg">
              Belajar komunikasi, siap hadapi pasien
            </p>
          </div>

          <div className="flex gap-6">
            {/* <button
              onClick={() => handleNavigate("/")}
              className="text-white hover:text-yellow-400 transition"
            >
              Home
            </button> */}

            <button
              onClick={() => handleNavigate(`/dashboard`)}
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
          {subtitle && (
            <div className="mb-2 px-4 py-2 bg-black bg-opacity-70 text-white rounded text-center max-w-xl">
              {subtitle}
            </div>
          )}
          {/* Menampilkan error dari hook prosody jika ada */}
          {prosodyError && (
            <div className="mb-2 px-4 py-2 bg-red-800 bg-opacity-70 text-white rounded text-center max-w-xl">
              Audio Error: {prosodyError}
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
                // 9. Arahkan tombol Send ke fungsi sendMessage yang baru
                disabled={loading || isSending || !message}
                onClick={sendMessage}
                className={`bg-yellow-500 hover:bg-yellow-600 text-white p-4 px-10 font-semibold uppercase rounded-full ${
                  loading || isSending || !message ? "cursor-not-allowed opacity-30" : ""
                }`}
              >
                Send
              </button>
              <button
                // 10. Arahkan tombol Mulai/Berhenti ke fungsi gabungan
                disabled={loading}
                onClick={handleToggleListening}
                className={`bg-blue-500 hover:bg-blue-600 text-white p-4 font-semibold uppercase rounded-full ${
                  loading ? "cursor-not-allowed opacity-30" : ""
                }`}
              >
                {/* 11. Gunakan 'listening' (dari STT) sebagai indikator utama */}
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
              <button
            onClick={() => setShowCameraWidget((prev) => !prev)}
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
                strokeLinejoin="round"
                d="M3.75 7.5l2.49-2.49A2.25 2.25 0 018.835 4.5h6.33a2.25 2.25 0 011.596.66l2.49 2.49M4.5 7.5h15a1.5 1.5 0 011.5 1.5v7.5A2.25 2.25 0 0119.25 19.5h-14.5A2.25 2.25 0 012.25 16.5V9A1.5 1.5 0 013.75 7.5z"
              />
            </svg>
          </button>
            </div>
          </div>
          {showCameraWidget && (
          <div className="fixed bottom-32 right-6 w-80 max-w-[90vw] rounded-xl bg-black/80 border border-white/10 shadow-2xl z-40 backdrop-blur pointer-events-auto">
            <CameraToModelWS />
          </div>
        )}
        </div>
      </div>
    </>
  );
};