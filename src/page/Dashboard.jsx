import React, { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// Import Icons
import { Search, Filter, Heart, HelpCircle, Layers } from "lucide-react";

// Import Custom Components
import AddScenarioModal from "../components/Dashboard/AddScenarioModal";
import EditScenarioModal from "../components/Dashboard/EditScenarioModal"; 
import Button from "../components/Dashboard/ButtonDashboard";
import { Card, CardHeader } from "../components/Dashboard/Card";
import Navbar from "../components/Navbar";
import StatCard from "../components/Dashboard/StatCard";
import PatientList, {
  SessionPatientList,
} from "../components/Dashboard/PatientList";

/**
 * ============================================================================
 * DASHBOARD COMPONENT
 * ============================================================================
 * * Halaman utama aplikasi yang berfungsi sebagai pusat kontrol pengguna.
 * * Fitur Utama:
 * 1. Otentikasi: Memeriksa token & user session saat halaman dimuat.
 * 2. Statistik: Menampilkan ringkasan performa (Total Sesi, Skor Empati, dll).
 * 3. Manajemen Skenario: Melihat, Mencari, Memfilter, Menambah, Mengedit, dan Menghapus skenario.
 * 4. Riwayat Sesi: Menampilkan daftar sesi latihan yang telah diselesaikan.
 * * Layout Note:
 * Menggunakan struktur flexbox dengan `flex-grow` dan `overflow-y-auto` internal
 * untuk mengatasi masalah background gradient yang terpotong pada konten panjang/pendek.
 * * @component
 */
export default function Dashboard() {
  const navigate = useNavigate();

  // ==========================================================================
  // 1. STATE MANAGEMENT
  // ==========================================================================

  // --- Auth State ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true); // Loading state saat cek localStorage

  // --- Data Skenario State ---
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // --- Modal Visibility State ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedScenarioToEdit, setSelectedScenarioToEdit] = useState(null); // Data sementara untuk diedit

  // --- Data Riwayat Sesi State ---
  const [sessionPatients, setSessionPatients] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // --- Statistik State ---
  const [totalSessions, setTotalSessions] = useState(0);
  const [avgEmpathyScore, setAvgEmpathyScore] = useState(0);
  const [avgQuestionScore, setAvgQuestionScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // --- Filter & Search State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("Semua"); // Opsi: "Semua", "Global", "Buatan Sendiri"

  // ==========================================================================
  // 2. AUTHENTICATION & INITIALIZATION
  // ==========================================================================

  /**
   * Mengecek keberadaan token dan user data di localStorage saat komponen dimount.
   * Jika tidak ada, redirect ke halaman Login.
   */
  useEffect(() => {
    let verificationTimer = null;
    const checkAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        navigate("/", { replace: true });
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Memberi sedikit delay agar transisi tidak flicker
        verificationTimer = setTimeout(() => {
          setIsVerifying(false);
        }, 500);
      }
    };

    checkAuth();
    window.addEventListener("pageshow", checkAuth);

    return () => {
      window.removeEventListener("pageshow", checkAuth);
      if (verificationTimer) clearTimeout(verificationTimer);
    };
  }, [navigate]);

  /**
   * Menghapus sesi lokal dan mengarahkan kembali ke login jika token expired/invalid.
   */
  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  /**
   * Handler logout manual oleh user.
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    navigate("/", { replace: true });
  };

  // ==========================================================================
  // 3. DATA FETCHING (API CALLS)
  // ==========================================================================

  /**
   * Mengambil data statistik ringkasan user (Skor rata-rata).
   */
  const fetchStats = async () => {
    if (!token) {
      setLoadingStats(false);
      return;
    }
    setLoadingStats(true);
    try {
      const res = await fetch(`http://localhost:3000/api/reports/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) return handleAuthError();
      if (!res.ok) throw new Error("Gagal mengambil data statistik");

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

  /**
   * Mengambil riwayat sesi latihan user.
   * Melakukan deduplikasi data pasien berdasarkan patient_id agar list terlihat rapi.
   */
  const fetchSessionHistory = async () => {
    if (!token) {
      setLoadingSessions(false);
      return;
    }
    setLoadingSessions(true);
    try {
      const res = await fetch(`http://localhost:3000/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) return handleAuthError();
      if (!res.ok) throw new Error("Gagal mengambil riwayat sesi");

      const data = await res.json();
      const sessions = data?.data || [];
      setTotalSessions(sessions.length);

      // Map untuk mengambil data pasien unik dari sesi-sesi yang ada
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

  /**
   * Mengambil daftar seluruh pasien (Global & Buatan User).
   * Melakukan mapping data untuk menentukan Tag (Label) dan Warna Tag.
   */
  const fetchPatients = async (currentUser) => {
    setLoadingPatients(true);
    try {
      const res = await fetch("http://localhost:3000/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) return handleAuthError();
      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();

      const mappedPatients = data.map((p) => {
        const isGlobal = p.is_global || p.user_id === null;
        const isCurrentUser = p.user_id === currentUser?.user_id;

        // Logika penentuan Tag (Global vs Buatan Sendiri)
        return {
          id: p.patient_id,
          name: p.patient_name,
          image: p.profile_image || null,
          personality_traits: p.personality_traits || [],
          background_story: p.background_story,
          personality_type: p.personality_type,
          symptom_intensity: p.symptom_intensity,
          age: p.age,
          gender: p.gender,
          occupation: p.occupation,
          marital_status: p.marital_status,

          patient_tag:
            isCurrentUser && currentUser?.is_admin && isGlobal
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
      setPatients(mappedPatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Memicu fetch data ketika token atau user tersedia
  useEffect(() => {
    if (token) {
      fetchSessionHistory();
      fetchPatients(user);
      fetchStats();
    }
  }, [token, user]);

  // ==========================================================================
  // 4. COMPUTED LOGIC (FILTERING)
  // ==========================================================================

  /**
   * useMemo untuk memfilter daftar pasien secara real-time.
   * Filter berdasarkan:
   * 1. Dropdown Tag (Semua / Global / Buatan Sendiri)
   * 2. Input Pencarian (Nama pasien)
   */
  const filteredPatients = useMemo(() => {
    return patients
      .filter((patient) => {
        if (selectedTag === "Semua") return true;
        return patient.patient_tag === selectedTag;
      })
      .filter((patient) => {
        return patient.name?.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [patients, searchTerm, selectedTag]);

  // ==========================================================================
  // 5. EVENT HANDLERS (NAVIGATION & MODALS)
  // ==========================================================================

  const handleDetailClick = (patient) => navigate(`/profile/${patient.id}`, { state: { patient: patient } });
  const handleReportClick = (patient) => navigate(`/report/${patient.id}`, { state: { patient: patient } });
  const handleStartSession = (patient) => navigate(`/profile/${patient.id}`, { state: { patientId: patient.id, patient: patient }, });

  /**
   * Menyimpan Skenario Baru ke Database.
   */
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
        fetchPatients(user); // Refresh data
      } else {
        throw new Error(result.message || "Gagal menyimpan pasien");
      }
    } catch (error) {
      toast.error("Gagal menyimpan skenario: " + error.message);
    }
  };

  /**
   * Memicu modal edit dengan data pasien yang dipilih.
   */
  const handleTriggerEdit = (patient) => { setSelectedScenarioToEdit(patient); setShowEditModal(true); };
  
  /**
   * Menghapus skenario (Saat ini masih simulasi UI).
   */
  const handleTriggerDelete = async (patient) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus skenario ${patient.name}?`)) {
        // TODO: Sambungkan ke endpoint DELETE API
        toast.success("Fitur delete belum tersambung ke API (UI Only)");
    }
  };

  /**
   * Menyimpan perubahan edit skenario (Saat ini masih simulasi UI).
   */
  const handleSaveUpdate = async (updatedData) => {
    // TODO: Sambungkan ke endpoint PUT/PATCH API
    toast.success("Berhasil memperbarui data pasien (Simulasi UI)");
    setShowEditModal(false);
  };

  if (isVerifying) return null;

  // ==========================================================================
  // 6. RENDER UI
  // ==========================================================================
  return (
    <div className="h-full w-full flex flex-col overflow-y-auto"> 
      <Toaster position="top-center" reverseOrder={false} />

      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Content: flex-grow mengisi sisa layar, bg-gradient memberikan visual */}
      <main className="flex-grow w-full bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd">
        
        {/* Container: min-h-full memastikan gradient merentang ke bawah jika konten sedikit */}
        <div className="w-full h-full py-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-2xl space-y-6">
            
            {/* Header Title */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Selamat Datang, {user?.username}!
              </h1>
              <h2 className="text-white text-xl opacity-90">
                Berikut adalah ringkasan aktivitas sesi latihan Anda hari ini
              </h2>
            </div>

            {/* --- SECTION 1: STAT CARD GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch">
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
            <Card span={3} className="sm:p-4 lg:p-5 min-h-[400px]">
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
              <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
                Pilih skenario untuk memulai latihan
              </p>

              {/* Controls: Search Bar & Filter Dropdown */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-grow">
                  <label htmlFor="search-scenario" className="sr-only">Cari Skenario</label>
                  <input
                    type="text"
                    id="search-scenario"
                    placeholder="Cari berdasarkan nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="relative sm:min-w-[180px]">
                  <label htmlFor="filter-tag" className="sr-only">Filter Tag</label>
                  <select
                    id="filter-tag"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="Semua">Semua Tag</option>
                    <option value="Global">Global</option>
                    <option value="Buatan Sendiri">Buatan Sendiri</option>
                  </select>
                  <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* List Component */}
              {loadingPatients ? (
                <div className="text-center py-10 text-gray-500">Memuat daftar skenario...</div>
              ) : (
                <PatientList
                  patients={filteredPatients}
                  onStartSession={handleStartSession}
                  onEditScenario={handleTriggerEdit}
                  onDeleteScenario={handleTriggerDelete}
                />
              )}
            </Card>

            {/* --- SECTION 3: RIWAYAT SESI --- */}
            <Card span={3} className="sm:p-4 lg:p-5 mb-10">
              <CardHeader title="Riwayat Sesi" />
              {loadingSessions ? (
                <div className="text-center py-4 text-gray-500">Memuat riwayat sesi...</div>
              ) : sessionPatients.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 dark:bg-gray-900/50 rounded-lg mt-2 border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="font-medium">Belum ada riwayat sesi.</p>
                  <p className="text-sm mt-1">Mulai sebuah sesi dan laporannya akan muncul di sini.</p>
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

          {/* === MODAL AREA === */}
          <AddScenarioModal
            show={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveScenario}
            user={user}
          />
          <EditScenarioModal
            show={showEditModal}
            initialData={selectedScenarioToEdit}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveUpdate}
            user={user}
          />
        </div>
      </main>
    </div>
  );
}