import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

// ==================== MODAL COMPONENT ====================
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

// ==================== CATEGORY DETAIL MODAL CONTENT ====================
function CategoryDetailModal({ category, items, type }) {
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
                    {type === 'question' ? (
                      <>
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs">
                          <span className={getCategoryColor(item.question_type.label, 'question')}>
                            ❓ {item.question_type.label}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({(item.question_type.confidence * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs">
                          <span className={getCategoryColor(item.empathy_level.label, 'empathy')}>
                            💭 {item.empathy_level.label}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({(item.empathy_level.confidence * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs">
                          <span className={getCategoryColor(item.question_type.label, 'question')}>
                            ❓ {item.question_type.label}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({(item.question_type.confidence * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs">
                          <span className={getCategoryColor(item.empathy_level.label, 'empathy')}>
                            💭 {item.empathy_level.label}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({(item.empathy_level.confidence * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </>
                    )}
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

// ==================== MODEL ANALYSIS STATS COMPONENT ====================
function ModelAnalysisStats({ detailedAnalysis, classificationResults }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ category: '', items: [], type: '' });

  if (!detailedAnalysis || !detailedAnalysis.model_statistics) return null;

  const stats = detailedAnalysis.model_statistics;
  const hasQuestions = detailedAnalysis.has_questions !== false;
  const totalQuestions = detailedAnalysis.total_questions || 0;
  const totalStatements = detailedAnalysis.total_statements || 0;

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
        <CardHeader 
          title="📊 Detail Analisis Model AI" 
        />

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
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    ({stats.question_percentages[type]}%)
                  </div>
                  <div className="text-xs text-teal-600 dark:text-teal-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Klik untuk detail →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!hasQuestions && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ℹ️ Tidak ada pertanyaan (kalimat dengan tanda tanya) dalam sesi ini. 
              Analisis teknik bertanya tidak tersedia, hanya analisis empati yang ditampilkan.
            </p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            💙 Distribusi Tingkat Empati
            <span className="text-xs font-normal text-gray-600 dark:text-gray-400">
              (Dari semua {detailedAnalysis.total_counselor_messages} pesan - Klik untuk detail)
            </span>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(stats.empathy_distribution).map(([level, count]) => {
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
                  <div className="text-xs opacity-75 mt-1">
                    ({stats.empathy_percentages[level]}%)
                  </div>
                  <div className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Klik untuk detail →
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {stats.patterns && stats.patterns.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              🔍 Pola Terdeteksi
            </h3>
            <div className="space-y-2">
              {stats.patterns.map((pattern, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/10 backdrop-blur rounded-lg p-3 flex items-start gap-3"
                >
                  <span className="text-2xl">
                    {pattern.type === 'most_common' ? '🎯' : 
                     pattern.type === 'empathy_trend' ? '📈' : 
                     pattern.type === 'question_diversity' ? '🎨' : '•'}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {pattern.type === 'most_common' && (
                        <>Kombinasi Paling Sering: <span className="text-teal-600 dark:text-teal-400">{pattern.pattern}</span> ({pattern.count}x, {pattern.percentage}%)</>
                      )}
                      {pattern.type === 'empathy_trend' && (
                        <>Tren Empati: <span className={
                          pattern.direction === 'improving' ? 'text-green-600 dark:text-green-400' :
                          pattern.direction === 'declining' ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }>{
                          pattern.direction === 'improving' ? 'Meningkat 📈' :
                          pattern.direction === 'declining' ? 'Menurun 📉' :
                          'Konsisten ➡️'
                        }</span></>
                      )}
                      {pattern.type === 'question_diversity' && (
                        <>Variasi Pertanyaan: {pattern.unique_types} dari {pattern.total_types} tipe digunakan</>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hasQuestions && (
            <div className="bg-blue-500/10 backdrop-blur rounded-xl p-4 border border-blue-500/20">
              <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                Confidence Pertanyaan
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(stats.avg_question_confidence * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Tingkat keyakinan model dalam klasifikasi
              </div>
            </div>
          )}
          <div className="bg-purple-500/10 backdrop-blur rounded-xl p-4 border border-purple-500/20">
            <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">
              Confidence Empati
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(stats.avg_empathy_confidence * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Tingkat keyakinan model dalam klasifikasi
            </div>
          </div>
        </div>
      </Card>

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
         {isUser && message.prosody && (
          <div className="mt-2 pt-2 border-t border-white/20 opacity-80 text-xs">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <span>Durasi:</span>
              <span className="font-medium">{message.prosody.duration} dtk</span>
              
              <span>Energi (Std):</span>
              <span className="font-medium">{message.prosody.energy_std}</span>
              
              <span>Rasio Diam:</span>
              <span className="font-medium">{(message.prosody.silence_ratio * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
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
  const { patientId } = useParams();

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState(null);
  const [classificationResults, setClassificationResults] = useState([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [analyzingSession, setAnalyzingSession] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!storedToken || !storedUser) {
      navigate("/"); 
    } else {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleAuthError = () => {
    console.log("Token tidak valid atau expired. Logout...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const fetchSessions = async () => {
    if (!patientId || !token) { 
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://localhost:3000/api/sessions?patient_id=${patientId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (res.status === 401 || res.status === 403) return handleAuthError();
      if (!res.ok) {
        throw new Error('Gagal mengambil data sesi');
      }
      
      const data = await res.json();
      const sessionsData = data.data || data;

      const sortedSessions = sessionsData
        .map(s => ({
          ...s,
          duration: s.end_time && s.start_time 
            ? Math.round((new Date(s.end_time) - new Date(s.start_time)) / 1000 / 60)
            : null
        }))
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      
      setSessions(sortedSessions);
      
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

  const fetchTranscripts = async (session_id) => {
    setLoadingTranscripts(true);
    
    try {
      const res = await fetch(
        `http://localhost:3000/api/reports/transcripts/${session_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (res.status === 401 || res.status === 403) return handleAuthError();
      if (!res.ok) {
        throw new Error('Gagal mengambil transkrip');
      }
      
      const data = await res.json();
      const transcriptsData = Array.isArray(data) ? data : [];
      
      const formattedTranscripts = transcriptsData.map(t => ({
        text: t.message_text,
        isUser: t.message_role === 'user',
        timestamp: t.created_at,
        prosody: t.prosody_data
      }));
      
      setTranscripts(formattedTranscripts);
    } catch (err) {
      console.error("Error fetching transcripts:", err);
      setTranscripts([]);
    } finally {
      setLoadingTranscripts(false);
    }
  };

  const fetchEvaluation = async (session_id) => {
    setLoadingEvaluation(true);
    
    try {
      const res = await fetch(
        `http://localhost:3000/api/reports/evaluation/${session_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.status === 401 || res.status === 403) return handleAuthError();
      if (!res.ok) {
        throw new Error('Gagal mengambil evaluasi');
      }
      
      const data = await res.json();
      
      if (data.evaluated) { 
        setEvaluation(data);
        
        if (data.classification_results) {
          try {
            const parsedResults = typeof data.classification_results === 'string'
              ? JSON.parse(data.classification_results)
              : data.classification_results;
            setClassificationResults(parsedResults);
          } catch (e) {
            console.error('Error parsing model_statistics:', e);
            setDetailedAnalysis(null);
          }
        }
      } else {
        setEvaluation(null);
        setDetailedAnalysis(null);
        setClassificationResults([]);
      }
    } catch (err) {
      console.error("Error fetching evaluation:", err);
      setEvaluation(null);
      setDetailedAnalysis(null);
      setClassificationResults([]);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  const handleSessionClick = async (session) => {
    setSelectedSession(session);
    setTranscripts([]);
    setEvaluation(null);
    setDetailedAnalysis(null);
    setClassificationResults([]);

    await Promise.all([
      fetchTranscripts(session.session_id),
      fetchEvaluation(session.session_id)
    ]);
  };

  const handleAnalyzeSession = async () => {
    if (!selectedSession) return;

    setAnalyzingSession(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/sessions/${selectedSession.session_id}/analyze`,
        { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 401 || response.status === 403) return handleAuthError();

      const data = await response.json();

      if (response.ok && data.success) {
        setEvaluation(data.evaluation);
        setDetailedAnalysis(data.detailed_analysis);
        setClassificationResults(data.classification_results || data.detailed_analysis?.results || []);
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

  const handleBack = () => {
    navigate(`/dashboard`);
  };

  useEffect(() => {
    if (patientId && token) {
      fetchSessions();
    } else if (!token) {
      setLoading(false);
    } else if (!patientId) {
      setError("Patient ID tidak ditemukan di URL.");
      setLoading(false);
    }
  }, [patientId, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd flex items-center justify-center">
        <Loading message="Memuat data sesi..." />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Laporan Sesi
            </h1>
            <p className="text-white/80 text-lg">
              Pasien: {sessions.length > 0 ? sessions[0].patient_name : 'Memuat...'}
            </p>
            <p className="text-white/60 text-sm">
              Total {sessions.length} sesi
            </p>
          </div>
          <Button variant="secondary" onClick={handleBack}>
            ← Kembali
          </Button>
        </div>

        {/* SCORING SECTION */}
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
                  : "Hasil evaluasi otomatis dari Model AI + Gemini"
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
                    '🤖 Analisis dengan AI'
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                  label="Rata-rata" 
                  value={Math.round((
                    evaluation.empathy_score + 
                    evaluation.question_score 
                  ) / 2)} 
                  maxValue={100}
                  color="bg-teal-500"
                />
              </div>

              {/* Feedback Text */}
              {evaluation.feedback_text && (
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    💬 Analisis Intonasi dari Gemini AI
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
              <div className="text-5xl mb-3">🤖</div>
              <p className="text-sm">
                {selectedSession 
                  ? selectedSession.status === 'completed'
                    ? "Klik 'Analisis dengan AI' untuk mendapatkan evaluasi otomatis menggunakan Dual Model AI + Gemini"
                    : "Sesi ini belum selesai, evaluasi hanya tersedia untuk sesi yang sudah selesai"
                  : "Pilih sesi untuk melihat evaluasi"
                }
              </p>
            </div>
          )}
        </Card>

        {/* DETAILED MODEL ANALYSIS */}
        {detailedAnalysis && classificationResults.length > 0 && (
          <ModelAnalysisStats 
            detailedAnalysis={detailedAnalysis} 
            classificationResults={classificationResults}
          />
        )}

        {/* CHAT HISTORY SECTION */}
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

      {/* CUSTOM SCROLLBAR STYLES */}
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