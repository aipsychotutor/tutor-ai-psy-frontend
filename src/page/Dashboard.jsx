import React, { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// Import Icons
import {
  Search,
  Filter,
  Heart,
  HelpCircle,
  Layers,
} from "lucide-react";

// Import Custom Components
import AddScenarioModal from "../components/Dashboard/AddScenarioModal";
import Button from "../components/Dashboard/ButtonDashboard";
import { Card, CardHeader } from "../components/Dashboard/Card"; 
import Navbar from "../components/Dashboard/Navbar"; 
import StatCard from "../components/Dashboard/StatCard";
import PatientList, { SessionPatientList } from "../components/Dashboard/PatientList";

/**
 * ============================================================================
 * DASHBOARD COMPONENT
 * ============================================================================
 * Halaman utama aplikasi (Home).
 * Menampilkan statistik pengguna, daftar skenario (pasien) yang tersedia,
 * dan riwayat sesi latihan yang pernah dilakukan.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- STATE: OTENTIKASI & USER ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true); // Loading state saat cek login

  // --- STATE: DATA PASIEN (SKENARIO) ---
  const [patients, setPatients] = useState([]); // Daftar semua skenario
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false); // Modal tambah skenario
  
  // --- STATE: RIWAYAT SESI ---
  const [sessionPatients, setSessionPatients] = useState([]); // Daftar pasien yang pernah diajak chat
  const [loadingSessions, setLoadingSessions] = useState(true);

  // --- STATE: STATISTIK ---
  const [totalSessions, setTotalSessions] = useState(0);
  const [avgEmpathyScore, setAvgEmpathyScore] = useState(0);
  const [avgQuestionScore, setAvgQuestionScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // --- STATE: FILTER & PENCARIAN ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("Semua");

  /**
   * ==========================================================================
   * AUTHENTICATION LOGIC
   * ==========================================================================
   * Memeriksa keberadaan token dan user di localStorage saat halaman dimuat.
   * Menggunakan event 'pageshow' untuk menangani kasus navigasi Back/Forward cache.
   */
  useEffect(() => {
    let verificationTimer = null;
    const checkAuth = (event) => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        navigate("/", { replace: true });
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Memberi jeda sedikit agar transisi UI lebih halus
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

  // Handler jika token expired atau invalid saat request API
  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  // Handler Logout manual
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    navigate("/", { replace: true });
  };

  /**
   * ==========================================================================
   * DATA FETCHING FUNCTIONS
   * ==========================================================================
   */

  // 1. Fetch Statistics: Mengambil skor rata-rata empati & pertanyaan
  const fetchStats = async () => {
    if (!token) {
      setLoadingStats(false);
      return;
    }

    setLoadingStats(true);
    try {
      const res = await fetch(`http://localhost:3000/api/reports/stats`, {
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
      toast.error("Gagal memuat data statistik: " + err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  // 2. Fetch Session History: Mengambil riwayat sesi untuk list di sidebar kanan/bawah
  const fetchSessionHistory = async () => {
    if (!token) {
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

      // Filter unik: Hanya ambil satu entry per pasien (sesi terakhir)
      // Menggunakan Map untuk deduping berdasarkan patient_id
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
      toast.error("Gagal memuat riwayat sesi: " + err.message);
    } finally {
      setLoadingSessions(false);
    }
  };

  // 3. Fetch Patients (Scenarios): Mengambil daftar semua skenario yang tersedia
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

      // Mapping data untuk menambahkan Tagging (Global vs Buatan Sendiri)
      const mappedPatients = data.map((p) => {
        const isGlobal = p.is_global || p.user_id === null;
        const isCurrentUser = p.user_id === user?.user_id;

        return {
          id: p.patient_id,
          name: p.patient_name,
          image: p.profile_image || null,
          personality_traits: p.personality_traits || [],
          // Logic penentuan Label Tag
          patient_tag:
            isCurrentUser && user?.is_admin && isGlobal
              ? "Global"
              : isCurrentUser
              ? "Buatan Sendiri"
              : isGlobal
              ? "Global"
              : p.users?.username,
          // Logic penentuan Warna Tag
          patient_tag_color: isGlobal
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      });
      setPatients(mappedPatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Effect: Jalankan semua fetch saat token tersedia
  useEffect(() => {
    if (token) {
      fetchSessionHistory();
      fetchPatients(user);
      fetchStats();
    }
  }, [token, user]);

  /**
   * ==========================================================================
   * FILTERING LOGIC
   * ==========================================================================
   * Menggunakan useMemo agar filtering tidak dijalankan ulang jika
   * data patients, searchTerm, atau selectedTag tidak berubah.
   */
  const filteredPatients = useMemo(() => {
    return patients
      .filter((patient) => {
        // Filter by Tag
        if (selectedTag === "Semua") return true;
        return patient.patient_tag === selectedTag;
      })
      .filter((patient) => {
        // Filter by Search Name
        return patient.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [patients, searchTerm, selectedTag]);

  /**
   * ==========================================================================
   * EVENT HANDLERS
   * ==========================================================================
   */

  // Navigasi ke Halaman Profil (Detail Pasien) dari History
  const handleDetailClick = (patient) => {
    navigate(`/profile/${patient.id}`, {
      state: {
        patient: patient,
      },
    });
  };

  // Navigasi ke Halaman Report
  const handleReportClick = (patient) => {
    navigate(`/report/${patient.id}`, {
      state: {
        patient: patient,
      },
    });
  };

  // Navigasi Mulai Sesi (dari Pustaka Skenario)
  const handleStartSession = (patient) => {
    navigate(`/profile/${patient.id}`, {
      state: {
        patientId: patient.id,
        patient: patient,
      },
    });
  };

  // Simpan Skenario Baru (Callback dari AddScenarioModal)
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
        toast.success("Skenario berhasil disimpan!");
        setShowAddModal(false);
        fetchPatients(user); // Refresh list setelah simpan
      } else {
        throw new Error(result.message || "Gagal menyimpan pasien");
      }
    } catch (error) {
      toast.error("Gagal menyimpan skenario: " + error.message);
      throw error;
    }
  };

  // Tampilkan null saat masih proses verifikasi token (mencegah kedip)
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
            
            {/* Header Title */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Selamat Datang, {user?.username}!
              </h1>
              <h2 className="text-white text-xl">
                Berikut adalah ringkasan aktivitas sesi latihan Anda hari ini
              </h2>
            </div>

            {/* --- SECTION 1: STAT CARD GRID --- */}
            {/* Menampilkan ringkasan metrik utama */}
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

            {/* --- SECTION 2: PUSTAKA SKENARIO --- */}
            {/* Daftar skenario/pasien yang bisa dipilih untuk latihan */}
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

              {/* Search & Filter Controls */}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    <option value="Global">Global</option>
                    <option value="Buatan Sendiri">Buatan Sendiri</option>
                  </select>
                  <Filter
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* List Pasien */}
              {loadingPatients ? (
                 <div className="text-center py-4 text-gray-700 dark:text-gray-300">
                    Memuat daftar skenario...
                </div>
              ) : (
                <PatientList
                    patients={filteredPatients}
                    onStartSession={handleStartSession}
                />
              )}
            </Card>

            {/* --- SECTION 3: RIWAYAT SESI --- */}
            {/* List sesi yang pernah dilakukan sebelumnya */}
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

          {/* Modal Tambah Skenario */}
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