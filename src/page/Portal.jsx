import React, { useState, useEffect, useMemo, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AddScenarioModal from "../components/AddScenarioModal";
import Button from "../components/Button";
import {
  Search,
  Filter,
  Heart,
  HelpCircle,
  Layers,
  ChevronDown,
  LogOut,
  Shield,
  User as UserIcon,
} from "lucide-react";

function Card({ children, className = "", span = 1 }) {
  const spanClass =
    span === 2 ? "lg:col-span-2" : span === 3 ? "lg:col-span-3" : "";
  return (
    <div
      className={`rounded-[2.5rem] bg-cardBackgroundColor p-4 dark:bg-cardBackgroundColorDark backdrop-blur shadow-lg ${spanClass} ${className}`}
    >
      {children}
    </div>
  );
}

// Card Header Component
function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {action}
    </div>
  );
}

// Avatar Component
function Avatar({ src, alt = "", size = "md", className = "" }) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <img
      src={src || "/images/default.png"}
      alt={alt}
      className={`${sizes[size]} rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 ${className}`}
      onError={(e) => {
        e.target.src = "/images/default.png";
      }}
    />
  );
}

// Patient List Item Component
function SessionPatientListItem({ patient, onDetailClick, onReportClick }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-950 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar src={patient.image} alt="" />
        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
          {patient.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onDetailClick(patient)}
          aria-label={`Lihat detail ${patient.name}`}
        >
          Detail
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onReportClick(patient)}
          aria-label={`Lihat laporan ${patient.name}`}
        >
          Laporan
        </Button>
      </div>
    </div>
  );
}

// Patient List Component
function SessionPatientList({ patients, onDetailClick, onReportClick }) {
  // ... (Tidak ada perubahan)
  return (
    <div className="space-y-px overflow-y-auto max-h-[300px] rounded-lg">
      {patients.map((patient) => (
        <SessionPatientListItem
          key={patient.id}
          patient={patient}
          onDetailClick={onDetailClick}
          onReportClick={onReportClick}
        />
      ))}
    </div>
  );
}

const formatTraits = (traits) => {
  if (!traits || traits.length === 0) {
    return "Tidak ada deskripsi traits.";
  }
  return traits
    .slice(0, 2)
    .map((trait) => trait.charAt(0).toUpperCase() + trait.slice(1))
    .join(", ");
};

function PatientList({ patients, onStartSession }) {
  console.log("Rendering PatientList with patients:", patients);
  if (!patients || patients.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Tidak ada skenario yang cocok. <br />
        Coba ubah filter atau kata kunci pencarian Anda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2 max-h-[300px] overflow-y-auto pr-1">
      {patients.map((pasien) => (
        <div
          key={pasien.id}
          className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02]"
        >
          <div className="p-4 flex-grow">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={pasien.image} alt={pasien.name} size="md" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {pasien.name}
              </h3>
            </div>

            <div className="mb-2">
              <span
                className={`inline-block ${pasien.patient_tag_color} text-xs font-semibold px-2.5 py-0.5 rounded-full`}
              >
                {pasien.patient_tag}
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 h-10 line-clamp-2">
              {formatTraits(pasien.personality_traits)}
            </p>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStartSession?.(pasien)}
              className="w-full"
            >
              Mulai Sesi
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- KOMPONEN STAT CARD ---
function StatCard({ title, value, icon, bgColor, iconColor, loading }) {
  const formattedValue =
    typeof value === "number" && value % 1 !== 0
      ? value.toFixed(1)
      : typeof value === "number"
      ? value
      : 0;

  return (
    <Card className="p-4 sm:p-5">
      {loading ? (
        <div className="h-[52px] animate-pulse">
          <div className="w-2/4 h-4 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
          <div className="w-1/3 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex-shrink-0 rounded-lg p-3 ${bgColor} ${iconColor}`}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formattedValue}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// --- KOMPONEN NAVBAR BARU ---
function Navbar({ user, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Hook untuk menutup dropdown saat klik di luar area
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

  if (!user) {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-md w-full sticky top-0 z-50">
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
    <nav className="bg-white dark:bg-gray-900 shadow-md w-full sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold dark:text-blue-400">
              CommuLab
            </span>
          </div>

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

            {isDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p
                      className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate"
                      title={user.username}
                    >
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [patients, setPatients] = useState([]);
  const [isVerifying, setIsVerifying] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sessionPatients, setSessionPatients] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [totalSessions, setTotalSessions] = useState(0);
  const [avgEmpathyScore, setAvgEmpathyScore] = useState(0);
  const [avgQuestionScore, setAvgQuestionScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("Semua");

  useEffect(() => {
    let verificationTimer = null;
    const checkAuth = (event) => {
      if (event && event.persisted) {
        console.log("Halaman dimuat dari bfcache, cek ulang otentikasi...");
      }

      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        console.log("Otentikasi gagal, redirect ke login...");
        navigate("/", { replace: true });
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser)); // <-- Data user diambil di sini

        verificationTimer = setTimeout(() => {
          setIsVerifying(false);
        }, 500);
      }
    };

    checkAuth();
    window.addEventListener("pageshow", checkAuth);

    return () => {
      window.removeEventListener("pageshow", checkAuth);
      if (verificationTimer) {
        clearTimeout(verificationTimer);
      }
    };
  }, [navigate]);

  const handleAuthError = () => {
    console.log("Token tidak valid atau expired. Logout...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    navigate("/", { replace: true });
  };

  const fetchStats = async () => {
    if (!token) {
      setLoadingStats(false);
      return;
    }

    setLoadingStats(true);
    try {
      const res = await fetch(`http://localhost:3000/api/evaluations/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        return handleAuthError();
      }

      if (!res.ok) {
        throw new Error("Gagal mengambil data statistik");
      }

      const data = await res.json();

      if (data.data) {
        setAvgEmpathyScore(data.data.avg_empathy_score || 0);
        setAvgQuestionScore(data.data.avg_question_score || 0);
      }
    } catch (err) {
      console.error("❌ Error fetching stats:", err);
      toast.error("Gagal memuat data statistik: " + err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchSessionHistory = async () => {
    if (!token) {
      console.log("❌ Belum ada token, skip fetch");
      setLoadingSessions(false);
      return;
    }
    setLoadingSessions(true);
    try {
      const res = await fetch(`http://localhost:3000/api/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        return handleAuthError();
      }

      if (!res.ok) {
        throw new Error("Gagal mengambil riwayat sesi");
      }

      const data = await res.json();
      const sessions = data?.data || [];

      setTotalSessions(sessions.length);

      const uniquePatients = Array.from(
        new Map(
          sessions.map((s) => [
            s.patient_id,
            {
              id: s.patient_id,
              name: s.patient_name,
              image: s.patient_image,
              lastSession: s.session_date || s.start_time,
              status: s.status,
            },
          ])
        ).values()
      );

      setSessionPatients(uniquePatients);
    } catch (err) {
      console.error("❌ Error fetching sessions:", err);
      toast.error("Gagal memuat riwayat sesi: " + err.message);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchPatients = async (user) => {
    setLoadingPatients(true);
    try {
      const res = await fetch("http://localhost:3000/api/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401 || res.status === 403) return handleAuthError();

      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();

      const mappedPatients = data.map((p) => {
        const isGlobal = p.is_global || p.user_id === null;
        const isCurrentUser = p.user_id === user?.user_id;

        return {
          id: p.patient_id,
          name: p.patient_name,
          image: p.profile_image || null,
          personality_traits: p.personality_traits || [],
          patient_tag:
            isCurrentUser && user?.is_admin && isGlobal
              ? "Global"
              : isCurrentUser
              ? "Buatan Sendiri"
              : isGlobal
              ? "Global"
              : p.users?.username,
          patient_tag_color: isGlobal
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      });
      console.log("Fetched patients:", mappedPatients);
      setPatients(mappedPatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSessionHistory();
      fetchPatients(user);
      fetchStats();
    }
  }, [token]);

  const filteredPatients = useMemo(() => {
    return patients
      .filter((patient) => {
        if (selectedTag === "Semua") return true;
        return patient.patient_tag === selectedTag;
      })
      .filter((patient) => {
        return patient.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [patients, searchTerm, selectedTag]);

  const handleDetailClick = (patient) => {
    console.log("Detail clicked:", patient);
    navigate(`/profile/${patient.id}`, {
      state: {
        patient: patient,
      },
    });
  };

  const handleReportClick = (patient) => {
    console.log("Report clicked:", patient);
    navigate(`/report/${patient.id}`, {
      state: {
        patient: patient,
      },
    });
  };

  const handleStartSession = (patient) => {
    console.log("Mulai sesi dengan:", patient.name);
    navigate(`/profile/${patient.id}`, {
      state: {
        patientId: patient.id,
        patient: patient,
      },
    });
  };

  const handleSaveScenario = async (patientData) => {
    try {
      const response = await fetch("http://localhost:3000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      });

      const result = await response.json();
      if (response.status === 401 || response.status === 403)
        return handleAuthError();

      if (response.ok) {
        fetchPatients(user);
      } else {
        throw new Error(result.message || "Gagal menyimpan pasien");
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  if (isVerifying) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
      <Toaster position="top-center" reverseOrder={false} />

      <Navbar user={user} onLogout={handleLogout} />
      <main className="flex-grow">
        <div className="bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-10 px-4 sm:px-6 lg:px-8 h-full">
          <div className="mx-auto max-w-screen-2xl space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Selamat Datang, {user?.username}!
              </h1>
              <h2 className="text-white text-xl">
                Berikut adalah ringkasan aktivitas sesi latihan Anda hari ini
              </h2>
            </div>

            {/* --- STAT CARD GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-start">
              <StatCard
                title="Total Sesi"
                value={totalSessions}
                loading={loadingSessions}
                icon={<Layers size={20} />}
                bgColor="bg-purple-100 dark:bg-purple-900"
                iconColor="text-purple-600 dark:text-purple-300"
              />
              <StatCard
                title="Rata-rata Empati"
                value={avgEmpathyScore}
                loading={loadingStats}
                icon={<Heart size={20} />}
                bgColor="bg-green-100 dark:bg-green-900"
                iconColor="text-green-600 dark:text-green-300"
              />
              <StatCard
                title="Rata-rata Pertanyaan"
                value={avgQuestionScore}
                loading={loadingStats}
                icon={<HelpCircle size={20} />}
                bgColor="bg-blue-100 dark:bg-blue-900"
                iconColor="text-blue-600 dark:text-blue-300"
              />
            </div>

            <Card span={3} className="sm:p-4 lg:p-5 min-h-[80px] h-[500px]">
              <CardHeader
                title="Pustaka Skenario"
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                  >
                    + Tambah Skenario
                  </Button>
                }
              />
              <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">
                Pilih skenario untuk memulai latihan
              </p>

              <div className="flex flex-col sm:flex-row gap-3 my-4">
                <div className="relative flex-grow">
                  <label htmlFor="search-scenario" className="sr-only">
                    Cari Skenario
                  </label>
                  <input
                    type="text"
                    id="search-scenario"
                    placeholder="Cari berdasarkan nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.g.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>

                <div className="relative sm:min-w-[180px]">
                  <label htmlFor="filter-tag" className="sr-only">
                    Filter berdasarkan Tag
                  </label>
                  <select
                    id="filter-tag"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="Semua">Semua Tag</option>
                    <option value="Default">Default</option>
                    <option value="Buatan Sendiri">Buatan Sendiri</option>
                  </select>
                  <Filter
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              <PatientList
                patients={filteredPatients}
                onStartSession={handleStartSession}
              />
            </Card>

            <Card span={3} className="sm:p-4 lg:p-5">
              <CardHeader title="Riwayat Sesi" />
              {loadingSessions ? (
                <div className="text-center py-4 text-gray-700 dark:text-gray-300">
                  Memuat riwayat sesi...
                </div>
              ) : sessionPatients.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Belum ada riwayat sesi. <br />
                  Mulai sebuah sesi dan laporannya akan muncul di sini.
                </div>
              ) : (
                <SessionPatientList
                  patients={sessionPatients}
                  onDetailClick={handleDetailClick}
                  onReportClick={handleReportClick}
                />
              )}
            </Card>
          </div>

          <AddScenarioModal
            show={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveScenario}
            user={user}
          />
        </div>
      </main>
    </div>
  );
}
