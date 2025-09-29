import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  // Fungsi untuk memainkan audio dan mengatur subtitle
  const playAIResponse = (aiMessage) => {
    return new Promise((resolve) => {
      setSubtitle(aiMessage.text);
      setIsPlaying(true);
      const audio = new window.Audio(aiMessage.audio);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        setSubtitle("");
        resolve();
      };
    });
  };
  const chat = async (message) => {
    setLoading(true);
    const data = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    const resp = (await data.json()).messages;
    setMessages((messages) => [...messages, ...resp]);
    setHistory((prev) => [...prev, { user: message, ai: resp }]);
    setLoading(false);
    for (const aiMsg of resp) {
      await playAIResponse(aiMsg);
    }
  };
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };
  const [subtitle, setSubtitle] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
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
