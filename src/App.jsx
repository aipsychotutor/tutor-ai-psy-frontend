// ./src/App.jsx

import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { ChatHistory } from "./components/ChatHistory";
import { ChatProvider } from "./hooks/useChat";
import Chat from "./page/Chat";
import Dashboard from "./page/Dashboard";
import Home from "./page/Home";
import Profile from "./page/Profile";
import Report from "./page/Report";
import Auth from "./page/Auth";
import { Routes, Route } from "react-router-dom";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile/:patientId" element={<Profile />}  />
      <Route path="/chat/:session_id" element={<Chat />} />
      <Route path="/report/:patientId" element={<Report />} />
      <Route path="/login" element={<Auth />} />
    </Routes>
  );
}

export default App;
