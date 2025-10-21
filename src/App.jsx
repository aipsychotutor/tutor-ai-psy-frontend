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
import { Routes, Route } from "react-router-dom";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />}  />
      <Route path="/chat" element={<Chat />} />
      <Route path="/report" element={<Report />} />
    </Routes>
  );
}

export default App;
