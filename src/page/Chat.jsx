import React from "react";
import { ChatProvider } from "../hooks/useChat";
import { ChatHistory } from "../components/ChatHistory";
import { UI } from "../components/UI";
import { useLocation } from "react-router-dom";

function Chat() {
  const location = useLocation();
  const initialState = location.state || {};

  return (
    <ChatProvider initialState={initialState}>
      <div className="h-screen flex flex-col">
        <ChatHistory />
        <UI />
      </div>
    </ChatProvider>
  );
}

export default Chat;
