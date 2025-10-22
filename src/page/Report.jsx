// ./src/page/Report.jsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ==================== BUTTON COMPONENT ====================
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

// ==================== CARD COMPONENT ====================
function Card({ children, className = '' }) {
  return (
    <div className={`backdrop-blur rounded-3xl p-6 shadow-2xl bg-cardBackgroundColor dark:bg-cardBackgroundColorDark ${className}`}>
      {children}
    </div>
  );
}

// ==================== CARD HEADER COMPONENT ====================
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

// ==================== SCORE CARD COMPONENT ====================
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

// ==================== CHAT BUBBLE COMPONENT ====================
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

// ==================== SESSION CARD COMPONENT ====================
function SessionCard({ session, onClick, isSelected }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/10 backdrop-blur rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition-all ${
        isSelected ? 'ring-2 ring-teal-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-gray-900 dark:text-gray-100 font-medium">
          Sesi {new Date(session.start_time).toLocaleDateString('id-ID')}
        </h4>
        <span className={`text-xs px-3 py-1 rounded-full ${
          session.status === 'completed' 
            ? 'bg-green-500/30 text-green-900 dark:text-green-100' 
            : session.status === 'ongoing'
            ? 'bg-yellow-500/30 text-yellow-900 dark:text-yellow-100'
            : 'bg-red-500/30 text-red-900 dark:text-red-100'
        }`}>
          {session.status === 'completed' ? 'Selesai' : 
           session.status === 'ongoing' ? 'Berlangsung' : 'Dibatalkan'}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {session.start_time && new Date(session.start_time).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })}
        {session.end_time && ` - ${new Date(session.end_time).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })}`}
      </p>
      {session.duration && (
        <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
          Durasi: {session.duration} menit
        </p>
      )}
    </div>
  );
}

// ==================== LOADING COMPONENT ====================
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

// ==================== MAIN REPORT PAGE COMPONENT ====================
export default function ReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, user_id, userName } = location.state || {};

  // State management
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [analyzingSession, setAnalyzingSession] = useState(false);
  const [error, setError] = useState(null);

  // ==================== FETCH SESSIONS ====================
  const fetchSessions = async () => {
    if (!patient || !patient.id) {
      setError("Data pasien tidak valid");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://localhost:3000/api/sessions?user_id=${user_id}&patient_id=${patient.id}`
      );
      
      if (!res.ok) {
        throw new Error('Gagal mengambil data sesi');
      }
      
      const data = await res.json();
      
      // Handle both response formats
      const sessionsData = data.data || data;

      // Sort by date descending and calculate duration
      const sortedSessions = sessionsData
        .map(s => ({
          ...s,
          duration: s.end_time && s.start_time 
            ? Math.round((new Date(s.end_time) - new Date(s.start_time)) / 1000 / 60)
            : null
        }))
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      
      setSessions(sortedSessions);
      
      // Auto-select first completed session
      const firstCompleted = sortedSessions.find(s => s.status === 'completed');
      if (firstCompleted) {
        handleSessionClick(firstCompleted);
      }

    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FETCH TRANSCRIPTS ====================
  const fetchTranscripts = async (session_id) => {
    setLoadingTranscripts(true);
    
    try {
      const res = await fetch(
        `http://localhost:3000/api/sessions/${session_id}/transcripts`
      );
      
      if (!res.ok) {
        throw new Error('Gagal mengambil transkrip');
      }
      
      const data = await res.json();
      const transcriptsData = data.data || data;
      
      // Transform data untuk chat bubbles
      const formattedTranscripts = transcriptsData.map(t => ({
        text: t.message_text,
        isUser: t.message_role === 'user',
        timestamp: t.created_at
      }));
      
      setTranscripts(formattedTranscripts);
    } catch (err) {
      console.error("Error fetching transcripts:", err);
      setTranscripts([]);
    } finally {
      setLoadingTranscripts(false);
    }
  };

  // ==================== FETCH EVALUATION ====================
  const fetchEvaluation = async (session_id) => {
    setLoadingEvaluation(true);
    
    try {
      const res = await fetch(
        `http://localhost:3000/api/sessions/${session_id}/evaluation`
      );
      
      if (!res.ok) {
        throw new Error('Gagal mengambil evaluasi');
      }
      
      const data = await res.json();
      
      if (data.success && data.evaluated) {
        setEvaluation(data.evaluation);
      } else {
        setEvaluation(null);
      }
    } catch (err) {
      console.error("Error fetching evaluation:", err);
      setEvaluation(null);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  // ==================== HANDLE SESSION CLICK ====================
  const handleSessionClick = async (session) => {
    setSelectedSession(session);
    setTranscripts([]);
    setEvaluation(null);

    // Fetch both transcripts and evaluation
    await Promise.all([
      fetchTranscripts(session.session_id),
      fetchEvaluation(session.session_id)
    ]);
  };

  // ==================== HANDLE ANALYZE SESSION ====================
  const handleAnalyzeSession = async () => {
    if (!selectedSession) return;

    setAnalyzingSession(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/sessions/${selectedSession.session_id}/analyze`,
        { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setEvaluation(data.evaluation);
        alert("✅ Evaluasi berhasil dibuat!");
      } else {
        alert(`❌ ${data.message || 'Gagal membuat evaluasi'}`);
      }
    } catch (err) {
      console.error("Error analyzing:", err);
      alert("❌ Gagal menganalisis session. Silakan coba lagi.");
    } finally {
      setAnalyzingSession(false);
    }
  };

  // ==================== HANDLE BACK ====================
  const handleBack = () => {
    navigate(`/dashboard/${user_id}`, {
      state: { nama: userName, user_id }
    });
  };

  // ==================== INITIAL LOAD ====================
  useEffect(() => {
    // Redirect if no patient data
    if (!patient || !patient.id || !user_id) {
      console.error('Missing patient or user data');
      navigate(`/dashboard/${user_id || ''}`, {
        state: { nama: userName, user_id }
      });
      return;
    }

    fetchSessions();
  }, [patient, user_id]);

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd flex items-center justify-center">
        <Loading message="Memuat data sesi..." />
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={handleBack}>
              Kembali
            </Button>
            <Button variant="primary" onClick={fetchSessions}>
              Coba Lagi
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ==================== NO SESSIONS STATE ====================
  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Laporan Sesi
            </h1>
            <Button variant="secondary" onClick={handleBack}>
              Kembali
            </Button>
          </div>
          
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Belum Ada Sesi
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Belum ada sesi konseling yang tercatat untuk pasien ini
            </p>
            <Button variant="primary" onClick={handleBack}>
              Kembali ke Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ==================== HEADER ==================== */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Laporan Sesi
            </h1>
            <p className="text-white/80 text-lg">
              Pasien: {patient?.name || 'Unknown'}
            </p>
            <p className="text-white/60 text-sm">
              Total {sessions.length} sesi
            </p>
          </div>
          <Button variant="secondary" onClick={handleBack}>
            ← Kembali
          </Button>
        </div>

        {/* ==================== SCORING SECTION ==================== */}
        <Card className="mb-6">
          <CardHeader 
            title="Penilaian"
            subtitle={
              loadingEvaluation 
                ? "Memuat evaluasi..." 
                : !evaluation 
                  ? selectedSession 
                    ? "Belum ada evaluasi untuk sesi ini"
                    : "Pilih sesi untuk melihat evaluasi"
                  : "Hasil evaluasi otomatis dari AI"
            }
            action={
              selectedSession && 
              selectedSession.status === 'completed' && 
              !evaluation && 
              !loadingEvaluation && (
                <Button 
                  variant="primary" 
                  onClick={handleAnalyzeSession}
                  disabled={analyzingSession}
                >
                  {analyzingSession ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menganalisis...
                    </span>
                  ) : (
                    '🔍 Analisis Sekarang'
                  )}
                </Button>
              )
            }
          />
          
          {loadingEvaluation ? (
            <Loading message="Memuat evaluasi..." />
          ) : evaluation ? (
            <>
              {/* Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <ScoreCard 
                  label="Empati" 
                  value={evaluation.empathy_score} 
                  maxValue={100}
                  color="bg-blue-500"
                />
                <ScoreCard 
                  label="Teknik Bertanya" 
                  value={evaluation.question_score} 
                  maxValue={100}
                  color="bg-green-500"
                />
                <ScoreCard 
                  label="Etika" 
                  value={evaluation.ethics_score} 
                  maxValue={100}
                  color="bg-purple-500"
                />
                <ScoreCard 
                  label="Rata-rata" 
                  value={Math.round((
                    evaluation.empathy_score + 
                    evaluation.question_score + 
                    evaluation.ethics_score
                  ) / 3)} 
                  maxValue={100}
                  color="bg-teal-500"
                />
              </div>

              {/* Feedback Text */}
              {evaluation.feedback_text && (
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    💬 Feedback
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                    {evaluation.feedback_text}
                  </p>
                </div>
              )}

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluation.strengths && evaluation.strengths.length > 0 && (
                  <div className="bg-green-500/10 backdrop-blur rounded-2xl p-4 border border-green-500/20">
                    <h4 className="font-bold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                      💪 Kekuatan
                    </h4>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-900 dark:text-gray-100 flex gap-2">
                          <span className="text-green-600 dark:text-green-400">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluation.improvements && evaluation.improvements.length > 0 && (
                  <div className="bg-orange-500/10 backdrop-blur rounded-2xl p-4 border border-orange-500/20">
                    <h4 className="font-bold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
                      🎯 Area Perbaikan
                    </h4>
                    <ul className="space-y-2">
                      {evaluation.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-sm text-gray-900 dark:text-gray-100 flex gap-2">
                          <span className="text-orange-600 dark:text-orange-400">→</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-3">📈</div>
              <p className="text-sm">
                {selectedSession 
                  ? selectedSession.status === 'completed'
                    ? "Klik 'Analisis Sekarang' untuk mendapatkan evaluasi otomatis dari AI"
                    : "Sesi ini belum selesai, evaluasi hanya tersedia untuk sesi yang sudah selesai"
                  : "Pilih sesi untuk melihat evaluasi"
                }
              </p>
            </div>
          )}
        </Card>

        {/* ==================== CHAT HISTORY SECTION ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session List */}
          <Card>
            <CardHeader 
              title="Riwayat Sesi" 
              subtitle={`${sessions.length} sesi tersedia`}
            />
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {sessions.map((session) => (
                <SessionCard
                  key={session.session_id}
                  session={session}
                  onClick={() => handleSessionClick(session)}
                  isSelected={selectedSession?.session_id === session.session_id}
                />
              ))}
            </div>
          </Card>

          {/* Chat Transcript */}
          <Card className="lg:col-span-2">
            <CardHeader 
              title="Transkrip Percakapan"
              subtitle={
                selectedSession 
                  ? `${new Date(selectedSession.start_time).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}`
                  : "Pilih sesi untuk melihat transkrip"
              }
            />
            
            <div className="bg-white/5 rounded-2xl p-4 h-[550px] overflow-y-auto custom-scrollbar">
              {loadingTranscripts ? (
                <Loading message="Memuat transkrip..." />
              ) : transcripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-center">
                    {selectedSession 
                      ? 'Tidak ada percakapan dalam sesi ini' 
                      : 'Pilih sesi untuk melihat transkrip percakapan'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      📝 Total {transcripts.length} pesan dalam sesi ini
                    </p>
                  </div>
                  {transcripts.map((msg, idx) => (
                    <ChatBubble
                      key={idx}
                      message={msg}
                      isUser={msg.isUser}
                    />
                  ))}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ==================== CUSTOM SCROLLBAR STYLES ==================== */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}