import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Import Navbar
import Navbar from "../components/Navbar"; 
// Import Icons
import { User, Briefcase, Heart, Activity, FileText, ArrowLeft, Play, Sparkles } from "lucide-react";

/**
 * ============================================================================
 * HELPER COMPONENTS (CLEAN & SOLID STYLE)
 * ============================================================================
 */

const ActionButton = ({ onClick, children, variant = 'primary', icon: Icon, className = '', disabled }) => {
  const variants = {
    primary: "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-900/20 border border-transparent",
    danger: "bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20",
    secondary: "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={20} strokeWidth={2.5} />}
      {children}
    </button>
  );
};

// Avatar Bersih (Tanpa Glow Warna-Warni)
const AestheticAvatar = ({ src, alt }) => (
  <div className="relative group">
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-white/10 backdrop-blur-sm shadow-2xl border border-white/10">
      <img
        src={src || "/images/default.png"}
        alt={alt}
        className="w-full h-full rounded-full object-cover bg-gray-800"
        onError={(e) => { e.target.src = "/images/default.png"; }}
      />
    </div>
   
    <div className="absolute bottom-2 right-2 p-2 bg-indigo-600 rounded-full border-4 border-[#1a1a2e] text-white shadow-md">
      <User size={18} />
    </div>
  </div>
);

// Info Item (Minimalis)
const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
    <div className="p-3 rounded-xl bg-white/5 text-gray-300">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      <p className="text-lg font-medium text-white">{value}</p>
    </div>
  </div>
);

// Trait Chip (Satu Warna Kalem)
const TraitChip = ({ label }) => (
  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-200 border border-indigo-500/20 text-sm font-medium">
    <Sparkles size={14} className="text-indigo-400" />
    {label}
  </span>
);

/**
 * ============================================================================
 * MAIN PAGE COMPONENT
 * ============================================================================
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  // State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Auth Check
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || !storedUser) {
      navigate("/", { replace: true });
    } else {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const handleBack = () => navigate('/dashboard');

  // Start Session Logic
  const handleStartSession = async () => {
    setIsStartingSession(true);
    try {
      // 1. Set Persona
      const personaRes = await fetch("http://localhost:3000/api/chat/set-persona-from-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patient_id: patientId }),
      });
      if (!personaRes.ok) throw new Error("Gagal set persona");

      // 2. Create Session
      const sessionRes = await fetch("http://localhost:3000/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patient_id: patientId }),
      });
      const sessionData = await sessionRes.json();

      if (sessionRes.ok && sessionData.data) {
        navigate(`/chat/${sessionData.data.session_id}`, {
          state: { patient: profileData, avatarPath: profileData.avatarPath },
        });
      } else {
        throw new Error(sessionData.message || "Gagal membuat sesi");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsStartingSession(false);
    }
  };

  // Fetch Data
  useEffect(() => {
    if (!token || !patientId) return;
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) return handleLogout();
        if (!response.ok) throw new Error("Gagal mengambil data");

        const data = await response.json();
        setProfileData({
          biodata: {
            nama: data.patient_name,
            usia: data.age ? `${data.age} Tahun` : "-",
            jenisKelamin: data.gender || "-",
            pekerjaan: data.occupation || "-",
            status: data.marital_status || "-",
          },
          latarBelakang: {
            cerita: data.background_story || "Tidak ada informasi.",
          },
          kepribadian: Array.isArray(data.personality_traits) ? data.personality_traits : [],
          profileImage: data.profile_image,
          avatarPath: data.avatar_path,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId, token]);

  // Render Loading / Error
  if (loading) return (
    <div className="h-full w-full bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
        <p className="text-white/60 font-medium">Memuat data...</p>
      </div>
    </div>
  );

  if (error || !profileData) return (
    <div className="h-full w-full bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd flex flex-col items-center justify-center gap-6 px-4">
      <div className="p-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <Activity size={48} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Gagal Memuat Data</h2>
        <p className="text-white/50">{error || "Data pasien tidak ditemukan."}</p>
      </div>
      <ActionButton onClick={handleBack} variant="danger" icon={ArrowLeft}>Kembali ke Dashboard</ActionButton>
    </div>
  );

  // Main Render
  return (
    <div className="h-full w-full flex flex-col overflow-y-auto bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd">
      
      <Navbar user={user} onLogout={handleLogout} isSimulation={false} />

      <div className="flex-grow pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12 animate-in slide-in-from-top-5 duration-500">
            <div className="relative z-10 -mb-16 md:mb-0 md:-mr-12">
              <AestheticAvatar src={profileData.profileImage} alt={profileData.biodata.nama} />
            </div>
            
            <div className="flex-1 text-center md:text-left pt-16 md:pt-0 md:pl-8">
              {/* NAMA SOLID PUTIH, GAK ADA GRADASI */}
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
                {profileData.biodata.nama}
              </h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 rounded-md bg-white/10 text-gray-200 text-sm font-medium border border-white/10">
                  {profileData.biodata.usia}
                </span>
                <span className="px-3 py-1 rounded-md bg-white/10 text-gray-200 text-sm font-medium border border-white/10">
                  {profileData.biodata.jenisKelamin}
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <ActionButton onClick={handleBack} variant="danger" icon={ArrowLeft} className="flex-1 md:flex-none">
                Kembali
              </ActionButton>
              <ActionButton 
                onClick={handleStartSession} 
                variant="primary" 
                icon={isStartingSession ? Activity : Play} 
                className="flex-1 md:flex-none"
                disabled={isStartingSession}
              >
                {isStartingSession ? "Memulai..." : "Mulai Sesi"}
              </ActionButton>
            </div>
          </div>

          {/* Main Card Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5 duration-500 delay-100">
            
            {/* Left Column: Biodata Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoItem label="Pekerjaan" value={profileData.biodata.pekerjaan} icon={Briefcase} />
              <InfoItem label="Status" value={profileData.biodata.status} icon={Heart} />
              <InfoItem label="Usia" value={profileData.biodata.usia} icon={User} />
            </div>

            {/* Bottom Row: Story & Traits */}
            <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="text-indigo-400" /> Latar Belakang Cerita
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg">
                  {profileData.latarBelakang.cerita}
                </p>
              </div>
            </div>

            <div className="lg:col-span-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="text-indigo-400" /> Kepribadian
              </h2>
              
              {profileData.kepribadian.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.kepribadian.map((trait, idx) => (
                    <TraitChip key={idx} label={trait} />
                  ))}
                </div>
              ) : (
                <p className="text-white/40 italic">Tidak ada data kepribadian.</p>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}