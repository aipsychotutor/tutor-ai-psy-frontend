import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// 1. IMPORT NAVBAR YANG SUDAH DIBUAT
import Navbar from "../components/Navbar"; 

/**
 * ============================================================================
 * HELPER COMPONENTS
 * ============================================================================
 */

// Button Component
function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  const variants = {
    danger:
      "bg-white text-red-500 hover:bg-red-50 border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed",
    success:
      "bg-teal-500 text-white hover:bg-teal-600 border-2 border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-2 rounded-full font-medium transition-all ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Avatar Component
function Avatar({ src, alt = "" }) {
  return (
    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white p-2 shadow-xl">
      <img
        src={src || "/images/default.png"}
        alt={alt}
        className="w-full h-full rounded-full object-cover"
        onError={(e) => {
          e.target.src = "/images/default.png"; 
        }}
      />
    </div>
  );
}

// InfoRow Component
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-white/90 text-sm">{label}</span>
      <span className="text-white/90 text-sm">:</span>
      <span className="text-white font-medium text-sm flex-1">{value}</span>
    </div>
  );
}

/**
 * ============================================================================
 * MAIN PAGE COMPONENT (ProfilePage)
 * ============================================================================
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  // State Auth
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // State Data Pasien
  const [profileData, setProfileData] = useState(null);
  
  // State Loading & Session
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 

  // --- EFFECT: AUTH CHECK ---
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

  // --- HANDLERS ---
  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true }); 
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true }); 
  };

  const handleBack = () => {
    navigate(`/dashboard`);
  };

  // --- LOGIC: MEMULAI SESI ---
  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      // Step 1: Set Persona
      const personaResponse = await fetch(
        "http://localhost:3000/api/chat/set-persona-from-patient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patient_id: patientId,
          }),
        }
      );

      const personaResult = await personaResponse.json();

      if (!personaResponse.ok) {
        throw new Error(personaResult.message || "Gagal set persona");
      }

      // Step 2: Create Session
      const response = await fetch("http://localhost:3000/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_id: patientId,
        }),
      });

      const newSession = await response.json();

      if (response.ok && newSession.data) {
        // Step 3: Navigate ke Chat Page
        navigate(`/chat/${newSession.data.session_id}`, {
          state: {
            patient: profileData,
            avatarPath: profileData.avatarPath,
          },
        });
      } else {
        alert("Gagal memulai sesi: " + (newSession.message || "Respons tidak valid"));
      }
    } catch (error) {
      alert("Gagal memulai sesi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- EFFECT: FETCH DATA PASIEN ---
  useEffect(() => {
    if (!token || !patientId) return;
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/api/patients/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 401 || response.status === 403)
          return handleAuthError();
        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }

        const data = await response.json();

        setProfileData({
          biodata: {
            nama: data.patient_name,
            usia: data.age ? `${data.age} tahun` : "-",
            jenisKelamin: data.gender || "-",
            pekerjaan: data.occupation || "-",
            status: data.marital_status || "-",
          },
          latarBelakang: {
            cerita: data.background_story || "Tidak ada informasi latar belakang",
          },
          kepribadian: Array.isArray(data.personality_traits)
            ? data.personality_traits
            : [],
          profileImage: data.profile_image,
          avatarPath: data.avatar_path,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, token, navigate]);


  // --- CONDITIONAL RENDERING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-8 px-4 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Memuat data pasien...</div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-8 px-4 flex flex-col items-center justify-center gap-4">
        <div className="text-white text-center text-xl">Gagal memuat data pasien</div>
        <Button variant="danger" onClick={handleBack}>
            Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  // --- RENDER UTAMA ---
  return (
    // Hapus pt-20 di sini agar Navbar menempel di atas
    <div className="h-full w-full overflow-y-auto bg-transparent flex flex-col">
      
      {/* 2. PASANG NAVBAR DISINI */}
      {/* onEndSession diarahkan ke handleBack karena belum masuk sesi chat */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onEndSession={handleBack} 
      />
      
      {/* Tambahkan pt-10 atau pt-20 di container konten agar tidak tertutup Navbar */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 mt-8">
          Profil Pasien
        </h1>
        
        {/* Container Kartu Profil */}
        <div className="relative mt-16"> {/* mt-16 memberi ruang untuk avatar floating */}
          
          {/* Avatar Floating */}
          <div className="absolute -top-16 right-4 sm:right-8 z-10">
            <Avatar
              src={profileData.profileImage}
              alt={profileData.biodata.nama}
            />
          </div>

          {/* Konten Detail Profil */}
          <div className="backdrop-blur bg-white/10 border border-white/20 rounded-[3rem] p-6 sm:p-8 shadow-2xl pt-20 sm:pt-8">
            
            {/* Bagian Biodata */}
            <section className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Biodata
              </h2>
              <div className="space-y-1">
                <InfoRow label="Nama" value={profileData.biodata.nama} />
                <InfoRow label="Usia" value={profileData.biodata.usia} />
                <InfoRow label="Jenis Kelamin" value={profileData.biodata.jenisKelamin} />
                <InfoRow label="Pekerjaan" value={profileData.biodata.pekerjaan} />
                <InfoRow label="Status" value={profileData.biodata.status} />
              </div>
            </section>

            <hr className="border-t border-white/30 my-6" />

            {/* Bagian Latar Belakang */}
            <section className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Latar Belakang Cerita
              </h2>
              <div className="space-y-3">
                <p className="text-white/90 text-sm leading-relaxed">
                  {profileData.latarBelakang.cerita}
                </p>
              </div>
            </section>

            <hr className="border-t border-white/30 my-6" />

            {/* Bagian Kepribadian */}
            <section className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Kepribadian
              </h2>
              {profileData.kepribadian.length > 0 ? (
                <ul className="space-y-2">
                  {profileData.kepribadian.map((trait, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-white/90 text-sm"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/90 flex-shrink-0" />
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/70 text-sm italic">
                  Tidak ada informasi kepribadian
                </p>
              )}
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8 pt-4">
              <Button
                variant="danger"
                onClick={handleBack}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                Kembali
              </Button>
              <Button
                variant="success"
                onClick={handleStartSession}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memulai...
                  </span>
                ) : (
                  "Mulai"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}