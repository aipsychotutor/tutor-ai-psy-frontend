// ./src/components/CameraToModelWS.jsx
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

const CameraToModelWS = forwardRef(({}, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);

  const [streaming, setStreaming] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  };

  useImperativeHandle(ref, () => ({
    finishSession: async() => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "finish" }));
        setSending(false);
        
        return new Promise((resolve, reject) => {
          ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "summary") {
              stopCamera();
              resolve(msg.data);
            } else {
              reject(new Error("Invalid data received"));
            }
          };
        });
      } else {
        stopCamera();
        return Promise.reject(new Error("WebSocket is not open"));
      }
    },
  }));

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
        console.error("Error starting camera:", err);
      }
    };
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  // WebSocket connection
  const connectWS = () => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setSending(true);
    };

    ws.onclose = () => {
      setConnected(false);
      setSending(false);
      setTimeout(() => connectWS(), 1000);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "summary") {
        // Handle summary if needed
      }
    };
  };

  useEffect(() => {
    connectWS();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!sending || !streaming || !connected) return;

    const id = setInterval(() => {
      sendFrame();
    }, 500);

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
    const timestamp = new Date().toISOString();

    ws.send(
      JSON.stringify({
        type: "frame",
        image: dataURL,
        timestamp: timestamp,
      })
    );
  };

  return (
    <div className="p-3 text-sm text-white">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">Camera Session</span>
        <span className="text-[10px] bg-emerald-500/30 px-2 py-0.5 rounded-full">
          WS: {connected ? "ON" : "OFF"}
        </span>
      </div>

      <video ref={videoRef} className="w-full rounded-md border border-white/10 bg-black" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});

export default CameraToModelWS;