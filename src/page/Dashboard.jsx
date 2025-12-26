import React, { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// Import Icons
import { Search, Filter, Heart, HelpCircle, Layers, Plus, Sparkles, Activity } from "lucide-react";

// Import Custom Components
import AddScenarioModal from "../components/Dashboard/AddScenarioModal";
import EditScenarioModal from "../components/Dashboard/EditScenarioModal"; 
import Navbar from "../components/Navbar";
import PatientList, { SessionPatientList } from "../components/Dashboard/PatientList";

/**
 * ============================================================================
 * HELPER COMPONENTS (AESTHETIC UPGRADE)
 * ============================================================================
 */

// 1. Shimmer / Skeleton Loader
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200/50 dark:bg-gray-700/50 rounded-xl ${className}`} />
);

// 2. Modern Card (Glassmorphism)
const GlassCard = ({ children, className = "", noPadding = false }) => (
  <div className={`backdrop-blur-md bg-white/90 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/50 shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:bg-white/95 dark:hover:bg-gray-900/90 ${className}`}>
    <div className={noPadding ? "" : "p-6 sm:p-8"}>
      {children}
    </div>
  </div>
);

// 3. Stat Card yang lebih "Splendid"
const AestheticStatCard = ({ title, value, icon: Icon, color, loading }) => {
  const theme = {
    purple: "from-purple-500 to-indigo-600 shadow-purple-500/20 text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    green: "from-emerald-500 to-teal-600 shadow-emerald-500/20 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    blue: "from-blue-500 to-cyan-600 shadow-blue-500/20 text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  }[color] || "from-gray-500 to-gray-600";

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="relative z-10">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          {loading ? (
            <Skeleton className="h-10 w-24 mt-2" />
          ) : (
            <h3 className={`text-4xl font-extrabold bg-gradient-to-r ${theme.split(" ")[0]} ${theme.split(" ")[1]} bg-clip-text text-transparent`}>
              {value}
            </h3>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${theme.split(" ").slice(2).join(" ")} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className={theme.split(" ")[2]} />
        </div>
      </div>
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 bg-gradient-to-r ${theme.split(" ")[0]} ${theme.split(" ")[1]}`} />
    </div>
  );
};

// 4. Button Dashboard Modern
const ActionButton = ({ onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
  >
    {Icon && <Icon size={18} strokeWidth={2.5} />}
    {children}
  </button>
);

// 5. Aesthetic Delete Modal (BARU & GANTENG)
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 dark:border-gray-800 transform transition-all animate-in zoom-in-95 duration-200 scale-100">
        
        {/* Icon Warning Besar */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
          <svg className="h-8 w-8 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Hapus Skenario?
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Anda yakin ingin menghapus skenario <span className="font-bold text-gray-800 dark:text-gray-200">"{itemName}"</span>? 
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="py-2.5 px-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * DASHBOARD COMPONENT (FULL FIXED & AESTHETIC)
 * ============================================================================
 */
export default function Dashboard() {
  const navigate = useNavigate();

  // --- STATE ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Data State
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [sessionPatients, setSessionPatients] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  
  // Stats State
  const [totalSessions, setTotalSessions] = useState(0);
  const [avgEmpathyScore, setAvgEmpathyScore] = useState(0);
  const [avgQuestionScore, setAvgQuestionScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedScenarioToEdit, setSelectedScenarioToEdit] = useState(null);
  
  // STATE BARU: Untuk Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("Semua");

  // --- AUTH CHECK ---
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
        verificationTimer = setTimeout(() => setIsVerifying(false), 500);
      }
    };
    checkAuth();
    return () => clearTimeout(verificationTimer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const handleAuthError = () => {
    handleLogout();
  };

  // --- FETCHING LOGIC ---
  const fetchStats = async () => {
    if (!token) return setLoadingStats(false);
    setLoadingStats(true);
    try {
      const res = await fetch(`http://localhost:3000/api/reports/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) return handleAuthError();
      const data = await res.json();
      if (data.data) {
        setAvgEmpathyScore(data.data.avg_empathy_score || 0);
        setAvgQuestionScore(data.data.avg_question_score || 0);
      }
    } catch (err) { toast.error("Gagal memuat statistik"); } 
    finally { setLoadingStats(false); }
  };

  const fetchSessionHistory = async () => {
    if (!token) return setLoadingSessions(false);
    setLoadingSessions(true);
    try {
      const res = await fetch(`http://localhost:3000/api/sessions`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) return handleAuthError();
      const data = await res.json();
      const sessions = data?.data || [];
      setTotalSessions(sessions.length);
      const uniquePatients = Array.from(new Map(sessions.map((s) => [s.patient_id, {
        id: s.patient_id, name: s.patient_name, image: s.patient_image, lastSession: s.session_date || s.start_time, status: s.status,
      }])).values());
      setSessionPatients(uniquePatients);
    } catch (err) { toast.error("Gagal memuat riwayat sesi"); } 
    finally { setLoadingSessions(false); }
  };

  const fetchPatients = async (currentUser) => {
    setLoadingPatients(true);
    try {
      const res = await fetch("http://localhost:3000/api/patients", { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) return handleAuthError();
      const data = await res.json();
      const mappedPatients = data.map((p) => {
        const isGlobal = p.is_global || p.user_id === null;
        const isCurrentUser = p.user_id === currentUser?.user_id;
        return {
          id: p.patient_id, name: p.patient_name, image: p.profile_image || null, personality_traits: p.personality_traits || [],
          background_story: p.background_story, personality_type: p.personality_type, symptom_intensity: p.symptom_intensity,
          age: p.age, gender: p.gender, occupation: p.occupation, marital_status: p.marital_status,
          patient_tag: isCurrentUser && currentUser?.is_admin && isGlobal ? "Global" : isCurrentUser ? "Buatan Sendiri" : isGlobal ? "Global" : p.users?.username,
          patient_tag_color: isGlobal ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800",
        };
      });
      setPatients(mappedPatients);
    } catch (err) { console.error(err); } 
    finally { setLoadingPatients(false); }
  };

  useEffect(() => {
    if (token) {
      fetchSessionHistory();
      fetchPatients(user);
      fetchStats();
    }
  }, [token, user]);

  // --- FILTERING ---
  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => selectedTag === "Semua" ? true : p.patient_tag === selectedTag)
      .filter((p) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [patients, searchTerm, selectedTag]);

  // --- HANDLERS ---
  const handleDetailClick = (p) => navigate(`/profile/${p.id}`, { state: { patient: p } });
  const handleReportClick = (p) => navigate(`/report/${p.id}`, { state: { patient: p } });
  const handleStartSession = (p) => navigate(`/profile/${p.id}`, { state: { patientId: p.id, patient: p }, });

  const handleSaveScenario = async (patientData) => {
    try {
      const response = await fetch("http://localhost:3000/api/patients", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(patientData),
      });
      if (response.ok) {
        toast.success("Skenario berhasil dibuat!");
        setShowAddModal(false);
        fetchPatients(user);
      } else { throw new Error("Gagal menyimpan"); }
    } catch (error) { toast.error("Gagal menyimpan skenario"); }
  };

  const handleTriggerEdit = (p) => { setSelectedScenarioToEdit(p); setShowEditModal(true); };
  
  const handleSaveUpdate = async () => { 
    toast.success("Data berhasil diperbarui (Simulasi UI)"); setShowEditModal(false); 
  };

  // --- DELETE HANDLER BARU (PAKAI MODAL) ---
  const handleTriggerDelete = (patient) => { 
    setDeleteTarget(patient); // Buka modal konfirmasi
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    // TODO: Tambahkan Logic Fetch API Delete disini
    // const res = await fetch(..., { method: 'DELETE' });
    
    // Simulasi Sukses
    toast.success(`Skenario "${deleteTarget.name}" berhasil dihapus!`);
    
    setDeleteTarget(null); // Tutup modal
    // fetchPatients(user); // Uncomment ini kalau udah connect API
  };

  if (isVerifying) return null;

  // ==========================================================================
  // RENDER UI GANTENG
  // ==========================================================================
  return (
    <div className="h-full w-full flex flex-col overflow-y-auto"> 
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ className: 'font-medium', style: { borderRadius: '10px', background: '#333', color: '#fff' } }}/>

      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-grow w-full bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd">
        <div className="w-full h-full py-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-2xl space-y-8">
            
            {/* 1. Header with Gradient Text */}
            <div className="space-y-1 animate-in slide-in-from-top-5 duration-500">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-sm">
                Halo, <span>{user?.username}!</span>
              </h1>
              <p className="text-white/80 text-lg sm:text-xl font-medium max-w-2xl">
                Siap meningkatkan kemampuan komunikasimu hari ini? Berikut ringkasan progresmu.
              </p>
            </div>

            {/* 2. Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5 duration-700 delay-100">
              <AestheticStatCard
                title="Total Sesi"
                value={totalSessions}
                loading={loadingSessions}
                icon={Layers}
                color="purple"
              />
              <AestheticStatCard
                title="Rata-rata Empati"
                value={avgEmpathyScore}
                loading={loadingStats}
                icon={Heart}
                color="green"
              />
              <AestheticStatCard
                title="Skor Pertanyaan"
                value={avgQuestionScore}
                loading={loadingStats}
                icon={HelpCircle}
                color="blue"
              />
            </div>

            {/* 3. Pustaka Skenario (Glassmorphism) */}
            <GlassCard className="min-h-[500px] animate-in slide-in-from-bottom-5 duration-700 delay-200">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-yellow-500" size={24} fill="currentColor" /> Pustaka Skenario
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Pilih karakter simulasi untuk memulai latihan.</p>
                </div>
                <ActionButton onClick={() => setShowAddModal(true)} icon={Plus}>
                  Skenario Baru
                </ActionButton>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-grow group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-3 border-2 border-gray-100 dark:border-gray-700 rounded-2xl leading-5 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                    placeholder="Cari nama pasien atau topik..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative md:w-64 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <select
                    className="block w-full pl-11 pr-10 py-3 border-2 border-gray-100 dark:border-gray-700 rounded-2xl leading-5 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer transition-all duration-300"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="Global">Global (Umum)</option>
                    <option value="Buatan Sendiri">Buatan Saya</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Patient List with Shimmer Loading */}
              {loadingPatients ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="w-32 h-4" />
                          <Skeleton className="w-20 h-3" />
                        </div>
                      </div>
                      <Skeleton className="w-full h-8 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <PatientList
                  patients={filteredPatients}
                  onStartSession={handleStartSession}
                  onEditScenario={handleTriggerEdit}
                  onDeleteScenario={handleTriggerDelete} // Ini sekarang buka Modal Baru
                />
              )}
            </GlassCard>

            {/* 4. Riwayat Sesi */}
            <GlassCard className="mb-10 animate-in slide-in-from-bottom-5 duration-700 delay-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Activity size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Sesi Terakhir</h2>
              </div>

              {loadingSessions ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : sessionPatients.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Layers className="text-gray-400" size={32} />
                  </div>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Belum ada riwayat sesi</p>
                  <p className="text-sm text-gray-500">Mulai latihan pertamamu sekarang!</p>
                </div>
              ) : (
                <SessionPatientList
                  patients={sessionPatients}
                  onDetailClick={handleDetailClick}
                  onReportClick={handleReportClick}
                />
              )}
            </GlassCard>

          </div>

          {/* MODALS */}
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
          
          {/* === NEW AESTHETIC DELETE MODAL === */}
          <DeleteConfirmationModal
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={executeDelete}
            itemName={deleteTarget?.name}
          />

        </div>
      </main>
    </div>
  );
}