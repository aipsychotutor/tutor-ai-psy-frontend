import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

/**
 * ============================================================================
 * HELPER UI COMPONENTS
 * ============================================================================
 * Komponen-komponen kecil yang bersifat 'stateless' atau presentational
 * untuk menjaga kode utama tetap bersih.
 */

// Button Component: Wrapper tombol standar dengan varian style
function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  ...props 
}) {
  const variants = {
    primary: 'bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2 rounded-full font-medium transition-all ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Card Component: Container dasar dengan efek glassmorphism/blur
function Card({ children, className = '' }) {
  return (
    <div className={`backdrop-blur rounded-3xl p-6 shadow-2xl bg-cardBackgroundColor dark:bg-cardBackgroundColorDark ${className}`}>
      {children}
    </div>
  );
}

// CardHeader: Judul standar untuk setiap kartu
function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ScoreCard: Menampilkan nilai metrik (Empati, Pertanyaan) dengan progress bar
function ScoreCard({ label, value, maxValue, color = "bg-teal-500" }) {
  const percentage = maxValue ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
      <h3 className="text-gray-900 dark:text-gray-100 text-center text-sm font-medium mb-2">
        {label}
      </h3>
      <div className="flex items-end justify-center gap-2 mb-3">
        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </span>
        {maxValue && (
          <span className="text-lg mb-1 text-gray-600 dark:text-gray-400">
            / {maxValue}
          </span>
        )}
      </div>
      {maxValue && (
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Modal Component: Overlay popup standar
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

// CategoryDetailModal: Menampilkan list percakapan berdasarkan filter kategori (misal: Pertanyaan Terbuka)
function CategoryDetailModal({ category, items, type }) {
  
  // Helper: Menentukan warna teks berdasarkan tipe kategori
  const getCategoryColor = (cat, itemType) => {
    if (itemType === 'question') {
      const colors = {
        'Terbuka': 'text-green-600 dark:text-green-400',
        'Sugestif': 'text-orange-600 dark:text-orange-400',
        'Tertutup': 'text-blue-600 dark:text-blue-400',
        'Reflektif': 'text-purple-600 dark:text-purple-400'
      };
      return colors[cat] || 'text-gray-600';
    } else {
      const colors = {
        'Empatik': 'text-green-600 dark:text-green-400',
        'Netral': 'text-blue-600 dark:text-blue-400',
        'Judgemental': 'text-red-600 dark:text-red-400'
      };
      return colors[cat] || 'text-gray-600';
    }
  };

  // Helper: Menentukan ikon emotikon berdasarkan tipe kategori
  const getCategoryIcon = (cat, itemType) => {
    if (itemType === 'question') {
      const icons = {
        'Terbuka': '🔓',
        'Sugestif': '💡',
        'Tertutup': '🔒',
        'Reflektif': '🪞'
      };
      return icons[cat] || '❓';
    } else {
      const icons = {
        'Empatik': '💚',
        'Netral': '💙',
        'Judgemental': '⚠️'
      };
      return icons[cat] || '💭';
    }
  };

  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {getCategoryIcon(category, type)} Menampilkan {items.length} pesan dalam kategori <span className="font-bold">{category}</span>
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Tidak ada pesan dalam kategori ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <span className="text-2xl">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-3">
                    "{item.text}"
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* Menampilkan Badge dengan confidence score */}
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs">
                      {type === 'question' ? (
                        <>
                          <span className={getCategoryColor(item.question_type.label, 'question')}>
                            ❓ {item.question_type.label}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({(item.question_type.confidence * 100).toFixed(0)}%)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={getCategoryColor(item.empathy_level.label, 'empathy')}>
                            💭 {item.empathy_level.label}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({(item.empathy_level.confidence * 100).toFixed(0)}%)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ModelAnalysisStats Component
 * Menampilkan grid statistik detail dari hasil analisis AI.
 * - Distribusi Tipe Pertanyaan
 * - Distribusi Tingkat Empati
 * - Confidence Level
 */
function ModelAnalysisStats({ detailedAnalysis, classificationResults }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ category: '', items: [], type: '' });

  if (!detailedAnalysis || !detailedAnalysis.model_statistics) return null;

  const stats = detailedAnalysis.model_statistics;
  const hasQuestions = detailedAnalysis.has_questions !== false;
  const totalQuestions = detailedAnalysis.total_questions || 0;

  // Handler saat user mengklik salah satu kotak statistik untuk melihat detail
  const openCategoryModal = (category, type) => {
    let items = [];
    if (type === 'question') {
      items = classificationResults.filter(
        item => item.question_type.label === category && item.type === 'question'
      );
    } else {
      items = classificationResults.filter(
        item => item.empathy_level.label === category
      );
    }
    setModalData({ category, items, type });
    setModalOpen(true);
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader title="📊 Detail Analisis Model AI" />
        
        {/* STATS: Distribusi Pertanyaan (Hanya muncul jika ada pertanyaan) */}
        {hasQuestions && Object.keys(stats.question_distribution).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              ❓ Distribusi Tipe Pertanyaan
              <span className="text-xs font-normal text-gray-600 dark:text-gray-400">
                (Dari {totalQuestions} pertanyaan - Klik untuk detail)
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(stats.question_distribution).map(([type, count]) => (
                <button
                  key={type}
                  onClick={() => openCategoryModal(type, 'question')}
                  className="bg-white/10 backdrop-blur rounded-xl p-3 text-center hover:bg-white/20 transition-all hover:shadow-lg cursor-pointer group"
                >
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                    {count}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 font-medium">
                    {type}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STATS: Distribusi Empati */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            💙 Distribusi Tingkat Empati
            <span className="text-xs font-normal text-gray-600 dark:text-gray-400">
              (Dari semua {detailedAnalysis.total_counselor_messages} pesan)
            </span>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(stats.empathy_distribution).map(([level, count]) => {
              // Styling dinamis berdasarkan level empati
              const colors = {
                'Empatik': 'bg-green-500/20 border-green-500/40 text-green-700 dark:text-green-300 hover:bg-green-500/30',
                'Netral': 'bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30',
                'Judgemental': 'bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-300 hover:bg-red-500/30'
              };
              return (
                <button
                  key={level}
                  onClick={() => openCategoryModal(level, 'empathy')}
                  className={`backdrop-blur rounded-xl p-4 text-center border transition-all hover:shadow-lg cursor-pointer group ${colors[level] || ''}`}
                >
                  <div className="text-3xl font-bold group-hover:scale-110 transition-transform">
                    {count}
                  </div>
                  <div className="text-sm mt-1 font-medium">
                    {level}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STATS: Confidence Score */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-purple-500/10 backdrop-blur rounded-xl p-4 border border-purple-500/20">
            <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">
              Confidence Empati
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(stats.avg_empathy_confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </Card>

      {/* Modal Detail Statistik */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Detail Kategori: ${modalData.category}`}
      >
        <CategoryDetailModal
          category={modalData.category}
          items={modalData.items}
          type={modalData.type}
        />
      </Modal>
    </>
  );
}

// ChatBubble: Menampilkan satu pesan chat (User atau AI/Patient)
function ChatBubble({ message, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-teal-500 text-white rounded-br-none'
            : 'bg-white/20 text-gray-900 dark:text-gray-100 backdrop-blur rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>
        <span className="text-xs opacity-70 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
}

// SessionCard: Item list untuk sidebar riwayat sesi
function SessionCard({ session, onClick, isSelected }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/10 backdrop-blur rounded-2xl p-3 cursor-pointer hover:bg-white/20 transition-all m-2 ${
        isSelected ? 'ring-2 ring-purple-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-gray-900 dark:text-gray-100 font-medium">
          Sesi {new Date(session.start_time).toLocaleDateString('id-ID')}
        </h4>
        <span className={`text-xs px-3 py-1 rounded-full ${
          session.status === 'completed' 
            ? 'bg-green-500/30 text-green-900 dark:text-green-100' 
            : 'bg-yellow-500/30 text-yellow-900 dark:text-yellow-100'
        }`}>
          {session.status === 'completed' ? 'Selesai' : 'Berlangsung'}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {session.start_time && new Date(session.start_time).toLocaleTimeString('id-ID')}
      </p>
    </div>
  );
}

// Loading Spinner Component
function Loading({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-12 h-12 mb-3">
        <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
    </div>
  );
}

/**
 * ============================================================================
 * MAIN PAGE COMPONENT (ReportPage)
 * ============================================================================
 * Halaman utama untuk menampilkan laporan sesi konseling.
 * Menggabungkan semua komponen di atas dan menangani state aplikasi.
 */
export default function ReportPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  // --- STATE MANAGEMENT ---
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  
  // Data utama
  const [sessions, setSessions] = useState([]); // List semua sesi pasien
  const [selectedSession, setSelectedSession] = useState(null); // Sesi yang sedang dilihat
  const [transcripts, setTranscripts] = useState([]); // Chat history
  
  // Data hasil analisis AI
  const [evaluation, setEvaluation] = useState(null); // Skor & Feedback
  const [detailedAnalysis, setDetailedAnalysis] = useState(null); // Stats mendalam
  const [classificationResults, setClassificationResults] = useState([]); // Array detail tiap pesan
  
  // Loading States
  const [loading, setLoading] = useState(true); // Loading halaman awal
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [analyzingSession, setAnalyzingSession] = useState(false); // Proses trigger analisis AI
  const [error, setError] = useState(null);

  // --- EFFECT: AUTH CHECK ---
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!storedToken || !storedUser) {
      navigate("/"); // Redirect ke login jika tidak ada token
    } else {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleAuthError = () => {
    handleLogout();
  };

  // --- API CALL: FETCH SESSIONS ---
  const fetchSessions = async () => {
    if (!patientId || !token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`http://localhost:3000/api/sessions?patient_id=${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) return handleAuthError();
      if (!res.ok) throw new Error('Gagal mengambil data sesi');
      
      const data = await res.json();
      const sessionsData = data.data || data;
      // Urutkan sesi dari yang terbaru
      const sortedSessions = sessionsData.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      setSessions(sortedSessions);
      
      // Otomatis pilih sesi 'completed' pertama jika ada
      const firstCompleted = sortedSessions.find(s => s.status === 'completed');
      if (firstCompleted) handleSessionClick(firstCompleted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- API CALL: FETCH TRANSCRIPTS ---
  const fetchTranscripts = async (session_id) => {
    setLoadingTranscripts(true);
    try {
      const res = await fetch(`http://localhost:3000/api/reports/transcripts/${session_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) return handleAuthError();
      const data = await res.json();
      const transcriptsData = Array.isArray(data) ? data : [];
      setTranscripts(transcriptsData.map(t => ({
        text: t.message_text,
        isUser: t.message_role === 'user',
        timestamp: t.created_at,
        prosody: t.prosody_data
      })));
    } catch (err) {
      setTranscripts([]);
    } finally {
      setLoadingTranscripts(false);
    }
  };

  // --- API CALL: FETCH EVALUATION ---
  // Mengambil data evaluasi yang sudah tersimpan (jika sudah pernah dianalisis)
  const fetchEvaluation = async (session_id) => {
    setLoadingEvaluation(true);
    try {
      const res = await fetch(`http://localhost:3000/api/reports/evaluation/${session_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) return handleAuthError();
      const data = await res.json();
      if (data.evaluated) {
        setEvaluation(data);
        if (data.classification_results) {
          try {
            // Parsing JSON string jika data tersimpan sebagai string di DB
            const parsed = typeof data.classification_results === 'string' 
              ? JSON.parse(data.classification_results) : data.classification_results;
            setClassificationResults(parsed);
          } catch (e) { console.error(e); }
        }
      } else {
        // Reset jika belum ada evaluasi
        setEvaluation(null);
        setDetailedAnalysis(null);
        setClassificationResults([]);
      }
    } catch (err) {
      setEvaluation(null);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  // Handler: Saat user memilih sesi dari sidebar
  const handleSessionClick = async (session) => {
    setSelectedSession(session);
    setTranscripts([]);
    setEvaluation(null);
    setDetailedAnalysis(null);
    setClassificationResults([]);
    // Fetch transkrip dan evaluasi secara paralel
    await Promise.all([
      fetchTranscripts(session.session_id),
      fetchEvaluation(session.session_id)
    ]);
  };

  // Handler: Memicu proses analisis AI baru
  const handleAnalyzeSession = async () => {
    if (!selectedSession) return;
    setAnalyzingSession(true);
    try {
      const response = await fetch(`http://localhost:3000/api/reports/${selectedSession.session_id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) return handleAuthError();
      const data = await response.json();
      if (response.ok && data.success) {
        setEvaluation(data.evaluation);
        setDetailedAnalysis(data.detailed_analysis);
        setClassificationResults(data.classification_results || []);
        alert("✅ Evaluasi berhasil dibuat!");
      } else {
        alert(`❌ ${data.message || 'Gagal'}`);
      }
    } catch (err) {
      alert("❌ Error analyzing session");
    } finally {
      setAnalyzingSession(false);
    }
  };

  // Effect Initial Load: Mengambil daftar sesi saat halaman dimuat
  useEffect(() => {
    if (patientId && token) fetchSessions();
    else if (!token) setLoading(false);
  }, [patientId, token, navigate]);

  const handleBack = () => navigate('/dashboard');

  if (loading) return <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header Area */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Laporan Sesi
              </h1>
              <p className="text-white/80 text-lg">
                Pasien: {sessions.length > 0 ? sessions[0].patient_name : '...'}
              </p>
            </div>
            <Button variant="secondary" onClick={handleBack}>
              ← Kembali
            </Button>
          </div>

          {/* Conditional Rendering Content */}
          {error ? (
            <Card className="text-center py-12">
               <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
               <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
               <Button onClick={fetchSessions}>Coba Lagi</Button>
            </Card>
          ) : sessions.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2">Belum Ada Sesi</h2>
              <p className="text-gray-500">Belum ada data sesi untuk pasien ini.</p>
            </Card>
          ) : (
            <>
              {/* SECTION 1: Score & Evaluasi */}
              <Card className="mb-6">
                <CardHeader 
                  title="Penilaian"
                  subtitle={selectedSession ? (selectedSession.status === 'completed' ? "Evaluasi tersedia" : "Sesi belum selesai") : "Pilih sesi"}
                  action={
                    selectedSession?.status === 'completed' && !evaluation && !loadingEvaluation && (
                      <Button onClick={handleAnalyzeSession} disabled={analyzingSession}>
                        {analyzingSession ? 'Menganalisis...' : '🤖 Analisis AI'}
                      </Button>
                    )
                  }
                />
                
                {loadingEvaluation ? <Loading message="Memuat evaluasi..." /> : evaluation ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <ScoreCard label="Empati" value={evaluation.empathy_score} maxValue={100} color="bg-blue-500" />
                      <ScoreCard label="Teknik Bertanya" value={evaluation.question_score} maxValue={100} color="bg-green-500" />
                      <ScoreCard label="Rata-rata" value={Math.round((evaluation.empathy_score + evaluation.question_score)/2)} maxValue={100} color="bg-teal-500" />
                    </div>
                    {evaluation.feedback_text && (
                      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-4">
                        <h3 className="text-lg font-bold mb-3">💬 Feedback AI</h3>
                        <p className="leading-relaxed whitespace-pre-wrap">{evaluation.feedback_text}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>Belum ada data evaluasi untuk sesi ini.</p>
                  </div>
                )}
              </Card>

              {/* SECTION 2: Detailed Stats (Grafik Empati & Pertanyaan) */}
              {detailedAnalysis && classificationResults.length > 0 && (
                <ModelAnalysisStats detailedAnalysis={detailedAnalysis} classificationResults={classificationResults} />
              )}

              {/* SECTION 3: Session History & Transcript Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar Kiri: Riwayat Sesi */}
                <Card>
                  <CardHeader title="Riwayat Sesi" subtitle={`${sessions.length} sesi`} />
                  <div className="mb-5 space-y-4 max-h-[600px] overflow-y-auto pr-2 p-1 pb-4">
                    {sessions.map(s => (
                      <SessionCard 
                        key={s.session_id} 
                        session={s} 
                        onClick={() => handleSessionClick(s)} 
                        isSelected={selectedSession?.session_id === s.session_id} 
                      />
                    ))}
                  </div>
                </Card>

                {/* Panel Kanan: Transkrip Chat */}
                <Card className="lg:col-span-2">
                  <CardHeader title="Transkrip Percakapan" />
                  <div className="bg-white/5 rounded-2xl p-4 h-[550px] overflow-y-auto">
                    {loadingTranscripts ? <Loading message="Memuat transkrip..." /> : transcripts.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Tidak ada transkrip.</p>
                      </div>
                    ) : (
                      transcripts.map((msg, idx) => <ChatBubble key={idx} message={msg} isUser={msg.isUser} />)
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}