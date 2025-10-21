import React, { useState, useEffect } from "react";
import {useNavigate, useLocation} from "react-router-dom";

function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  ...props 
}) {
  const variants = {
    danger: 'bg-white text-red-500 hover:bg-red-50 border-2 border-white',
    success: 'bg-teal-500 text-white hover:bg-teal-600 border-2 border-teal-500'
  };

  return (
    <button
      onClick={onClick}
      className={`px-8 py-2 rounded-full font-medium transition-all ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Avatar({ src, alt = '' }) {
  return (
    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white p-2 shadow-xl">
      <img
        src={src || '/images/default.png'}
        alt={alt}
        className="w-full h-full rounded-full object-cover"
        onError={(e) => {
          e.target.src = '/images/default.png';
        }}
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-white/90 text-sm">{label}</span>
      <span className="text-white/90 text-sm">:</span>
      <span className="text-white font-medium text-sm flex-1">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { patient, user_id, session_id, userName, avatarPath } = location.state || {};
  const patientId = patient?.id;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!patientId || !user_id) return;

    const checkOngoingSession = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/sessions?user_id=${user_id}&patient_id=${patientId}&status=ongoing`
        );
        const sessions = await res.json();
        
        if (sessions && sessions.length > 0) {
          // Ada ongoing session
          setIsSessionStarted(true);
          setCurrentSessionId(sessions[0].session_id);
        }
      } catch (err) {
        console.error('Error checking ongoing session:', err);
      }
    };
    checkOngoingSession();
  }, [patientId, user_id]);

  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      // 🆕 LANGKAH 1: Set persona berdasarkan patient yang dipilih
      console.log('🎭 Setting persona for patient:', patientId);
      const personaResponse = await fetch('http://localhost:3000/set-persona-from-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_id: patientId
        })
      });

      const personaResult = await personaResponse.json();

      if (!personaResponse.ok) {
        throw new Error(personaResult.message || 'Gagal set persona');
      }

      console.log('✅ Persona set successfully:', personaResult.activePersona.nama_pasien);

      const response = await fetch('http://localhost:3000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user_id,
          patient_id: patientId,
          scenario_id: null // Opsional, bisa diisi kalau ada scenario
        })
      });
      console.log('🔍 Creating session with:', { user_id, patient_id: patientId }); // debug log
      const newSession = await response.json();

      if (response.ok) {
        setIsSessionStarted(true);
        setCurrentSessionId(newSession.session_id);
        console.log('Session started:', newSession);

        // Navigate ke Chat page dengan session info
        navigate(`/chat/${user_id}/${patientId}`, {
          state: {
            patientId: patientId,
            patient: patient,
            user_id: user_id,
            session_id: newSession.session_id, // Session ID yang baru dibuat
            userName: userName,
            avatarPath: avatarPath
          }
        });
      } else {
        alert('Gagal memulai sesi: ' + newSession.message);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Gagal memulai sesi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Redirect jika tidak ada data pasien
    if (!patient || !patient.id) {
      console.error('No patient data found, redirecting...');
      navigate(`/dashboard/${user_id}`, {
        state: { nama: userName, user_id, session_id }
      });
      return;
    }

    // Fetch patient details dari API
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/patients/${patient.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch patient data');
        }

        const data = await response.json();

        // Transform data dari database ke format yang dibutuhkan UI
        setProfileData({
          biodata: {
            nama: data.patient_name,
            usia: data.age ? `${data.age} tahun` : '-',
            jenisKelamin: data.gender || '-',
            pekerjaan: data.occupation || '-',
            status: data.marital_status || '-'
          },
          latarBelakang: {
            cerita: data.background_story || 'Tidak ada informasi latar belakang'
          },
          kepribadian: Array.isArray(data.personality_traits) 
            ? data.personality_traits 
            : [],
          profileImage: data.profile_image
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patient, navigate, userName, user_id, session_id]);

  const handleBack = () => {
    console.log('kembali ke dashboard...');
    navigate(`/dashboard/${user_id}`, {
      state: { nama: userName, user_id, session_id }
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-8 px-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Error state
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Profil Pasien
        </h1>
        <div className="relative">
          <div className="absolute -top-16 right-4 sm:right-8 z-10">
            <Avatar 
              src={null} 
              alt={profileData.biodata.nama}
            />
          </div>

          <div className="backdrop-blur rounded-[3rem] p-6 sm:p-8 shadow-2xl pt-20 sm:pt-8">
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

            <section className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Latar Belakang Cerita
              </h2>
              <div className="space-y-3">
                <p className="text-white/90 text-sm leading-relaxed">
                  {profileData.latarBelakang.cerita}
                </p>
                <p className="text-white/90 text-sm leading-relaxed">
                  {profileData.latarBelakang.emosi}
                </p>
              </div>
            </section>

            <hr className="border-t border-white/30 my-6" />

            <section className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Kepribadian
              </h2>
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
            </section>

            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8 pt-4">
              <Button 
                variant="danger" 
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                Kembali
              </Button>
              <Button 
                variant="success" 
                onClick={handleStartSession}
                className="w-full sm:w-auto"
              >
                Mulai
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}