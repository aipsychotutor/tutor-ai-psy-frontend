import React, { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// Import Icons
import { Search, Filter, Heart, HelpCircle, Layers } from "lucide-react";

// Import Custom Components
import AddScenarioModal from "../components/Dashboard/AddScenarioModal";
import EditScenarioModal from "../components/Dashboard/EditScenarioModal"; // <--- IMPORT BARU
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
 */
export default function Dashboard() {
  const navigate = useNavigate();

  // --- STATE: OTENTIKASI & USER ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // --- STATE: DATA PASIEN (SKENARIO) ---
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // State Modal Tambah
  const [showAddModal, setShowAddModal] = useState(false);

  // State Modal Edit (BARU)
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedScenarioToEdit, setSelectedScenarioToEdit] = useState(null);

  // --- STATE: RIWAYAT SESI ---
  const [sessionPatients, setSessionPatients] = useState([]);
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

  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

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

  // 1. Fetch Stats
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

  // 2. Fetch Session History
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

  // 3. Fetch Patients
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

        return {
          id: p.patient_id,
          name: p.patient_name,
          image: p.profile_image || null,
          personality_traits: p.personality_traits || [],
          // Logic data asli dari DB
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

  // Jalankan fetch saat token ready
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
   */
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

  /**
   * ==========================================================================
   * EVENT HANDLERS
   * ==========================================================================
   */

  // Navigasi
  const handleDetailClick = (patient) => {
    navigate(`/profile/${patient.id}`, { state: { patient: patient } });
  };
  const handleReportClick = (patient) => {
    navigate(`/report/${patient.id}`, { state: { patient: patient } });
  };
  const handleStartSession = (patient) => {
    navigate(`/profile/${patient.id}`, {
      state: { patientId: patient.id, patient: patient },
    });
  };

  // --- HANDLER TAMBAH SCENARIO ---
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
        fetchPatients(user);
      } else {
        throw new Error(result.message || "Gagal menyimpan pasien");
      }
    } catch (error) {
      toast.error("Gagal menyimpan skenario: " + error.message);
    }
  };

  // --- HANDLER EDIT / UPDATE SCENARIO (BARU) ---

  // 1. Trigger saat klik "Update Pasien" di PatientList
  const handleTriggerEdit = (patient) => {
    setSelectedScenarioToEdit(patient);
    setShowEditModal(true);
  };

  // 2. Trigger saat klik "Delete Skenario" di PatientList
  const handleTriggerDelete = async (patient) => {
    // Logic Delete bisa ditambahkan disini (fetch API DELETE)
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus skenario ${patient.name}?`
      )
    ) {
      console.log("Deleting:", patient.id);
      // Simulasi sukses
      toast.success("Fitur delete belum tersambung ke API (UI Only)");
    }
  };

  // 3. Callback saat form Update disubmit
  const handleSaveUpdate = async (updatedData) => {
    // Disini nanti logic fetch API PUT/PATCH ke backend
    console.log("Updated Data received in Dashboard:", updatedData);

    // Simulasi sukses
    toast.success("Berhasil memperbarui data pasien (Simulasi UI)");
    setShowEditModal(false);
    // fetchPatients(user); // Uncomment jika backend sudah siap
  };

  if (isVerifying) return null;

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
                  // --- MENGIRIM PROPS KE LIST UTAMA ---
                  onEditScenario={handleTriggerEdit}
                  onDeleteScenario={handleTriggerDelete}
                />
              )}
            </Card>

            {/* --- SECTION 3: RIWAYAT SESI --- */}
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

          {/* === MODAL AREA (DI LUAR GRID UTAMA) === */}

          {/* Modal Tambah Skenario */}
          <AddScenarioModal
            show={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveScenario}
            user={user}
          />

          {/* Modal Edit Skenario (BARU) */}
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
