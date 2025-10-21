import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  ...props 
}) {
  const variants = {
    primary: 'bg-teal-500 text-gray-900 hover:bg-gray-100 hover:bg-teal-600',
    secondary: 'bg-white text-gray-900 hover:bg-gray-100',
    danger: 'bg-red-500 text-gray-900 hover:bg-gray-100 hover:bg-red-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2 rounded-full font-medium transition-all ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`backdrop-blur rounded-3xl p-6 shadow-2xl bg-cardBackgroundColor p-4 dark:bg-cardBackgroundColorDark ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-700 dark:text-gray-300">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function ScoreCard({ label, value, maxValue, color = "bg-teal-500" }) {
  const percentage = maxValue ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
      <h3 className="text-gray-900 dark:text-gray-100 text-center py-8 text-sm font-medium mb-2">{label}</h3>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
        {maxValue && <span className=" text-lg mb-1 text-gray-900 dark:text-gray-100">/ {maxValue}</span>}
      </div>
      {maxValue && (
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ChatBubble({ message, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-teal-500 text-gray-900 hover:bg-gray-100 rounded-br-none'
            : 'bg-white/20 text-gray-900 hover:bg-gray-100 backdrop-blur rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
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

function SessionCard({ session, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white/10 backdrop-blur rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-gray-900 hover:bg-gray-100  font-medium">
          Sesi {new Date(session.start_time).toLocaleDateString('id-ID')}
        </h4>
        <span className={`text-xs px-3 py-1 rounded-full ${
          session.status === 'finished' 
            ? 'bg-green-500/30 text-gray-900 hover:bg-gray-100' 
            : 'bg-yellow-500/30 text-gray-900 hover:bg-gray-100'
        }`}>
          {session.status === 'finished' ? 'Selesai' : 'Berlangsung'}
        </span>
      </div>
      <p className="text-gray-900 hover:bg-gray-100 /70 text-sm">
        {session.start_time && new Date(session.start_time).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })}
        {session.end_time && ` - ${new Date(session.end_time).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })}`}
      </p>
      {session.messageCount && (
        <p className="text-gray-900 hover:bg-gray-100 /60 text-xs mt-2">
          {session.messageCount} pesan
        </p>
      )}
    </div>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, user_id, userName } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);

  // Mock scoring data - bisa diganti dengan data real dari backend
  const [scores, setScores] = useState({
    empathy: 85,
    communication: 78,
    rapport: 90,
    technique: 82,
    overall: 84
  });

  useEffect(() => {
    if (!patient || !patient.id) {
      navigate(`/dashboard/${user_id}`, {
        state: { nama: userName, user_id }
      });
      return;
    }

    fetchSessions();
  }, [patient, user_id]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3000/api/sessions?user_id=${user_id}&patient_id=${patient.id}`
      );
      
      if (!res.ok) throw new Error('Failed to fetch sessions');
      
      const data = await res.json();
      
      // Sort by date descending
      const sortedSessions = data.sort((a, b) => 
        new Date(b.start_time) - new Date(a.start_time)
      );
      
      setSessions(sortedSessions);
      
      // Auto-select first session
      if (sortedSessions.length > 0) {
        handleSessionClick(sortedSessions[0]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = async (session) => {
    setSelectedSession(session);
    setLoadingTranscripts(true);
    
    try {
      const res = await fetch(
        `http://localhost:3000/api/sessions/${session.session_id}/transcripts`
      );
      
      if (!res.ok) throw new Error('Failed to fetch transcripts');
      
      const data = await res.json();
      
      // Transform data untuk chat bubbles
      const formattedTranscripts = data.map(t => ({
        text: t.message_text,
        isUser: t.message_role === 'user',
        timestamp: t.created_at
      }));
      
      setTranscripts(formattedTranscripts);
    } catch (err) {
      console.error('Error fetching transcripts:', err);
      setTranscripts([]);
    } finally {
      setLoadingTranscripts(false);
    }
  };

  const handleBack = () => {
    navigate(`/dashboard/${user_id}`, {
      state: { nama: userName, user_id }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Laporan Sesi
            </h1>
            <p className="text-white/80 text-lg ">
              Pasien: {patient?.name || 'Unknown'}
            </p>
          </div>
          <Button variant="secondary" onClick={handleBack}>
            Kembali
          </Button>
        </div>

        {/* Scoring Section */}
        <Card className="mb-6">
          <CardHeader 
            title="Penilaian"
            subtitle="Hasil skor terbaru pasien"
            action={<Button variant="secondary">Lihat Detail</Button>}
            />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <ScoreCard 
              label="Empati" 
              value={scores.empathy} 
              maxValue={100}
              color="bg-blue-500"
            />
            <ScoreCard 
              label="Komunikasi" 
              value={scores.communication} 
              maxValue={100}
              color="bg-green-500"
            />
            <ScoreCard 
              label="Rapport" 
              value={scores.rapport} 
              maxValue={100}
              color="bg-purple-500"
            />
            <ScoreCard 
              label="Teknik" 
              value={scores.technique} 
              maxValue={100}
              color="bg-orange-500"
            />
            <ScoreCard 
              label="Keseluruhan" 
              value={scores.overall} 
              maxValue={100}
              color="bg-teal-500"
            />
          </div>
        </Card>

        {/* Chat History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session List */}
          <Card>
            <CardHeader title="Sesi" />
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {sessions.length === 0 ? (
                <p className="flex items-center justify-center h-full text-gray-900 dark:text-gray-100 text-center py-8">
                  Belum ada sesi
                </p>
              ) : (
                sessions.map((session) => (
                  <SessionCard
                    key={session.session_id}
                    session={session}
                    onClick={() => handleSessionClick(session)}
                  />
                ))
              )}
            </div>
          </Card>

          {/* Chat Transcript */}
          <Card className="lg:col-span-2">
            <CardHeader 
                title="Transkrip Percakapan"
                action={selectedSession && (
                    <span className="text-sm font-normal text-gray-900 dark:text-gray-100">
                    ({new Date(selectedSession.start_time).toLocaleDateString('id-ID')})
                    </span>
                )}
            />
            
            <div className="bg-white/5 rounded-2xl p-4 h-[550px] overflow-y-auto">
              {loadingTranscripts ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-900 dark:text-gray-100">Loading transcripts...</p>
                </div>
              ) : transcripts.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedSession 
                      ? 'Tidak ada percakapan dalam sesi ini' 
                      : 'Pilih sesi untuk melihat transkrip'}
                  </p>
                </div>
              ) : (
                transcripts.map((msg, idx) => (
                  <ChatBubble
                    key={idx}
                    message={msg}
                    isUser={msg.isUser}
                  />
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}