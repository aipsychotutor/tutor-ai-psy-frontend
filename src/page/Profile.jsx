import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Import Icons
import {
  ChevronDown,
  Shield,
  User as UserIcon,
  LogOut,
} from "lucide-react";

/**
 * ============================================================================
 * HELPER COMPONENTS
 * ============================================================================
 */

// Button Component: Wrapper tombol dengan varian 'danger' (merah) dan 'success' (teal)
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

// Navbar Component: Navigasi atas dengan posisi FIXED (mengambang saat scroll)
function Navbar({ user, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Hook: Menutup dropdown jika user klik di luar area menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  // Render Skeleton Loading jika user belum terload
  if (!user) {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-md w-full fixed top-0 left-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              AppSkenario
            </span>
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  const userRole = user.is_admin === true ? "Admin" : "User";

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md w-full fixed top-0 left-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold dark:text-blue-400">
              CommuLab
            </span>
          </div>

          {/* User Menu & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg focus:outline-none"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <div className="h-8 w-8 rounded-full bg-ungu text-white flex items-center justify-center font-semibold">
                {user.username ? user.username.charAt(0).toUpperCase() : "?"}
              </div>
              <span className="hidden sm:inline-block font-medium">
                {user.username}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Content */}
            {isDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1" role="menu">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={user.username}>
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                      {userRole === "Admin" ? (
                        <Shield size={14} className="text-green-500" />
                      ) : (
                        <UserIcon size={14} className="text-gray-500" />
                      )}
                      {userRole}
                    </p>
                  </div>

                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Avatar Component: Menampilkan foto profil bulat dengan shadow
function Avatar({ src, alt = "" }) {
  return (
    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white p-2 shadow-xl">
      <img
        src={src || "/images/default.png"}
        alt={alt}
        className="w-full h-full rounded-full object-cover"
        onError={(e) => {
          e.target.src = "/images/default.png"; // Fallback jika gambar error
        }}
      />
    </div>
  );
}

// InfoRow Component: Menampilkan baris data label: value
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
 * Halaman detail profil pasien sebelum memulai sesi chat.
 * Menampilkan Biodata, Latar Belakang, dan Kepribadian.
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { patientId } = useParams(); // Mengambil ID pasien dari URL

  // State Auth
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // State Data Pasien
  const [profileData, setProfileData] = useState(null);
  
  // State Loading & Session
  const [loading, setLoading] = useState(true); // Loading awal fetch data
  const [error, setError] = useState(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading saat tombol 'Mulai' ditekan

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

  // --- HANDLERS: LOGOUT & ERROR ---
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

  // --- LOGIC: MEMULAI SESI (PENTING) ---
  // 1. Set Persona AI berdasarkan ID Pasien
  // 2. Buat Sesi Baru di Database
  // 3. Redirect ke Halaman Chat
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
        setIsSessionStarted(true);
        setCurrentSessionId(newSession.data.session_id);

        // Step 3: Navigate ke Chat Page dengan membawa state awal
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

        // Formatting data untuk ditampilkan di UI
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

  const handleBack = () => {
    navigate(`/dashboard`);
  };

  // --- CONDITIONAL RENDERING: LOADING & ERROR ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-8 px-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-8 px-4 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Gagal memuat data pasien</p>
          <Button variant="danger" onClick={handleBack}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // --- RENDER UTAMA ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Profil Pasien
        </h1>
        
        {/* Container Kartu Profil */}
        <div className="relative">
          {/* Avatar Floating di kanan atas */}
          <div className="absolute -top-16 right-4 sm:right-8 z-10">
            <Avatar
              src={profileData.profileImage}
              alt={profileData.biodata.nama}
            />
          </div>

          {/* Konten Detail Profil */}
          <div className="backdrop-blur rounded-[3rem] p-6 sm:p-8 shadow-2xl pt-20 sm:pt-8">
            
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

            {/* Bagian Latar Belakang Cerita */}
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

            {/* Bagian Kepribadian (List Point) */}
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

            {/* Action Buttons (Kembali & Mulai Sesi) */}
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