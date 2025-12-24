import Chat from "./page/Chat";
import Profile from "./page/Profile";
import Report from "./page/Report";
import Auth from "./page/Auth";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./page/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/profile/:patientId" element={<Profile />} />
      <Route path="/chat/:session_id" element={<Chat />} />
      <Route path="/report/:patientId" element={<Report />} />
    </Routes>
  );
}

export default App;
