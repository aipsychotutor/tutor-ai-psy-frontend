// ./src/components/CameraToModelWS.jsx
import React, { useEffect, useRef, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

function CameraToModelWS() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);

  const [streaming, setStreaming] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [summary, setSummary] = useState(null);

  // Nyalakan kamera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreaming(true);
        }
      } catch (err) {
        console.error("Error camera:", err);
      }
    };
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Connect WebSocket
  const connectWS = () => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setSummary(null);
      console.log("Connected to model server");
    };

    ws.onclose = () => {
      setConnected(false);
      setSending(false);
      console.log("WS closed");
    };

    ws.onerror = (err) => console.error("WS error", err);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "summary") {
        setSummary(msg.data);
      }
    };
  };

  // Kirim frame berkala
  useEffect(() => {
    if (!sending || !streaming || !connected) return;

    const id = setInterval(() => {
      sendFrame();
    }, 500); // 2 FPS

    return () => clearInterval(id);
  }, [sending, streaming, connected]);

  const sendFrame = () => {
    const ws = wsRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (!video || !canvas || video.videoWidth === 0) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/jpeg", 0.7);

    ws.send(
      JSON.stringify({
        type: "frame",
        image: dataURL,
      })
    );
  };

  const startSession = () => {
    if (!connected) connectWS();
    setSending(true);
  };

  const finishSession = () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "finish" }));
    }
    setSending(false);
  };

  return (
    <div className="p-3 text-sm text-white">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">Camera Session</span>
        <span className="text-[10px] bg-emerald-500/30 px-2 py-0.5 rounded-full">
          WS: {connected ? "ON" : "OFF"}
        </span>
      </div>

      <video
        ref={videoRef}
        className="w-full rounded-md border border-white/10 bg-black"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-2 mt-2">
        <button
          onClick={startSession}
          disabled={!streaming || sending}
          className="flex-1 px-2 py-1 rounded-md text-xs bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600"
        >
          Start
        </button>
        <button
          onClick={finishSession}
          disabled={!sending}
          className="flex-1 px-2 py-1 rounded-md text-xs bg-rose-500 hover:bg-rose-600 disabled:bg-gray-600"
        >
          Finish
        </button>
      </div>

      {summary && (
        <div className="mt-2 max-h-24 overflow-auto text-[11px]">
          <p className="font-semibold">
            Total frames: {summary.total_frames}
          </p>
          <ul className="list-disc list-inside">
            {summary.labels.map((item) => (
              <li key={item.label}>
                {item.label}: {item.count}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CameraToModelWS;
