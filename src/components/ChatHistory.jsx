import { useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";

export const ChatHistory = () => {
  const { history } = useChat();
  const [open, setOpen] = useState(true);
  const [typingIndex, setTypingIndex] = useState(null);
  const [displayedTexts, setDisplayedTexts] = useState([]);

  useEffect(() => {
    if (!open || history.length === 0) return;

    const lastIdx = history.length - 1;
    const aiMessages = history[lastIdx]?.ai?.map((msg) => msg.text) || [];

    setTypingIndex(lastIdx);
    setDisplayedTexts(Array(aiMessages.length).fill(""));

    if (aiMessages.length > 0) {
      let msgIdx = 0;
      let charIdx = 0;
      const tempTexts = Array(aiMessages.length).fill("");
      let interval = setInterval(() => {
        tempTexts[msgIdx] = aiMessages[msgIdx].slice(0, charIdx + 1);
        setDisplayedTexts([...tempTexts]);
        charIdx++;
        if (charIdx >= aiMessages[msgIdx].length) {
          msgIdx++;
          charIdx = 0;
        }
        if (msgIdx >= aiMessages.length) clearInterval(interval);
      }, 25);
      return () => clearInterval(interval);
    }
  }, [history, open]);

  return (
    <div className="my-5 mx-4 fixed top-24 left-4 max-w-xs z-50">
      <button
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-1 px-3 rounded-t-lg shadow w-full flex justify-between items-center"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>Riwayat Interaksi</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="bg-white bg-opacity-80 rounded-b-lg p-4 max-h-[60vh] overflow-y-auto shadow transition-all duration-300">
          {history.length === 0 && (
            <div className="text-gray-500">Belum ada interaksi.</div>
          )}
          {history.map((item, idx) => (
            <div key={idx} className="mb-3">
              <div className="text-right text-blue-700 font-semibold">
                Anda: {item.user}
              </div>
              {item.ai.map((msg, i) => (
                <div key={i} className="text-left text-gray-800">
                  AI: {idx === typingIndex ? displayedTexts[i] || "" : msg.text}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
