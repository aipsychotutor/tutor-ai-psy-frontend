import Chat from "./page/Chat";
import ProfilePasien from "./page/ProfilePasien";
import ProfilePage from "./page/ProfilePage";
import Report from "./page/Report";
import Auth from "./page/Auth";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./page/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/profile/:patientId" element={<ProfilePasien/>} />
      <Route path="/chat/:session_id" element={<Chat />} />
      <Route path="/report/:patientId" element={<Report />} />
      <Route path="/profile-user" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
