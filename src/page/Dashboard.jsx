// ./src/page/Dashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import AddScenarioModal from "../components/AddScenarioModal";
import Button from '../components/Button';

// Card Container Component
function Card({ children, className = '', span = 1 }) {
  const spanClass = span === 2 ? 'lg:col-span-2' : span === 3 ? 'lg:col-span-3' : '';
  return (
    <div className={`rounded-[2.5rem] bg-cardBackgroundColor p-4 dark:bg-cardBackgroundColorDark backdrop-blur shadow-lg ${spanClass} ${className}`}>
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
function Avatar({ src, alt = '', size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  return (
    <img
      src={src || '/images/default.png'}
      alt={alt}
      className={`${sizes[size]} rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 ${className}`}
      onError={(e) => {
        e.target.src = '/images/default.png';
      }}
    />
  );
}

// Input Component
function Input({ 
  id, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  min,
  className = '',
  ...props 
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={id}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        className={`block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${className}`}
        {...props}
      />
    </div>
  );
}

// Chart Legend Button Component
function ChartLegendButton({ item, percentage, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      style={{ opacity: isActive ? 1 : 0.5 }}
    >
      <span 
        className="w-3 h-3 rounded-full flex-shrink-0" 
        style={{ backgroundColor: item.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
          {item.name}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {item.value} ({percentage}%)
        </p>
      </div>
    </button>
  );
}

// Chart Edit Form Component
function ChartEditForm({ data, onChange, onSave, onCancel }) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <Input
          key={item.name}
          id={`data-${index}`}
          type="number"
          min="0"
          value={item.value}
          onChange={(e) => onChange(index, e.target.value)}
          label={
            <>
              <span 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </>
          }
        />
      ))}
      <div className="flex gap-2 pt-2">
        <Button onClick={onSave} variant="primary" className="flex-1">
          Simpan
        </Button>
        <Button onClick={onCancel} variant="secondary" className="flex-1">
          Batal
        </Button>
      </div>
    </div>
  );
}

// Interactive Pie Chart Component
function InteractivePieChart({ data, activeIndex, onPieClick, totalValue }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const chartData = payload[0];
      const percentage = ((chartData.value / totalValue) * 100).toFixed(1);
      return (
        <div className="rounded-lg bg-white dark:bg-gray-800 p-3 shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{chartData.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {chartData.value} sesi ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius="100%"  
            paddingAngle={2}
            dataKey="value"
            onClick={onPieClick}
            className="cursor-pointer focus:outline-none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                className="transition-opacity duration-200"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item, index) => {
          const percentage = ((item.value / totalValue) * 100).toFixed(1);
          return (
            <ChartLegendButton
              key={item.name}
              item={item}
              percentage={percentage}
              isActive={activeIndex === null || activeIndex === index}
              onClick={() => onPieClick(item, index)}
            />
          );
        })}
      </div>
    </>
  );
}

// Patient List Item Component
function PatientListItem({ patient, onDetailClick, onReportClick }) {
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
function PatientList({ patients, onDetailClick, onReportClick }) {
  return (
    <div className="space-y-px overflow-y-auto max-h-[300px] rounded-lg">
      {patients.map((patient) => (
        <PatientListItem
          key={patient.id}
          patient={patient}
          onDetailClick={onDetailClick}
          onReportClick={onReportClick}
        />
      ))}
    </div>
  );
}

function SessionPatientList({ patients, onStartSession }) {
  return (
    <div className="grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] gap-2 py-2 max-h-[250px] overflow-y-auto pr-1 text-sm">
      {patients.map((pasien) => (
        <div
          key={pasien.id}
          className="flex flex-col items-center bg-white dark:bg-gray-950 rounded-2xl p-2 shadow-md"
        >
          <Avatar src={pasien.image} alt={pasien.name} size="sm" className="h-8 w-8"/>
          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100 text-center text-xs">
            {pasien.name}
          </p>

          <Button
            variant="primary"
            size="xs"
            onClick={() => onStartSession?.(pasien)}
            className="mt-3 w-full text-xs py-1"
          >
            Mulai Sesi
          </Button>
        </div>
      ))}
    </div>
  );
}

// Diagram Card Component
function DiagramCard({ chartData, setChartData }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(chartData);

  const handlePieClick = (data, index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const handleInputChange = (index, value) => {
    const newData = [...editData];
    newData[index].value = parseInt(value) || 0;
    setEditData(newData);
  };

  const handleSaveData = () => {
    setChartData(editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData(chartData);
    setIsEditing(false);
  };

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader
        title="Diagram"
        action={
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Batal' : 'Edit Data'}
          </Button>
        }
      />
        {isEditing ? (
          <ChartEditForm
            data={editData}
            onChange={handleInputChange}
            onSave={handleSaveData}
            onCancel={handleCancelEdit}
          />
        ) : (
          <InteractivePieChart
            data={chartData}
            activeIndex={activeIndex}
            onPieClick={handlePieClick}
            totalValue={totalValue}
          />
        )}
    </Card>
  );
}

// Main Dashboard Component
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
  // const [patients] = useState([
  //   { id: '75ce3b71-cce4-4233-acbd-3441daab2ddb', name: 'Pasien A', image: null },
  //   { id: 2, name: 'Pasien B', image: null },
  //   { id: 3, name: 'Pasien C', image: null },
  //   { id: 4, name: 'Pasien C', image: null },
  //   { id: 5, name: 'Pasien D', image: null },
  //   { id: 6, name: 'Pasien H', image: null },
  //   { id: 7, name: 'Pasien I', image: null },
  //   { id: 8, name: 'Pasien J', image: null },
  //   { id: 9, name: 'Pasien K', image: null },
  //   { id: 10, name: 'Pasien L', image: null }
  // ]);
  useEffect(() => {
    let verificationTimer = null;
    const checkAuth = (event) => {
      // 'event.persisted' akan bernilai true jika halaman dimuat dari bfcache
      if (event && event.persisted) {
        console.log("Halaman dimuat dari bfcache, cek ulang otentikasi...");
      }

      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        console.log("Otentikasi gagal, redirect ke login...");
        navigate("/", { replace: true });
      } else {
        // Hanya set token jika valid, untuk memicu fetch data
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        verificationTimer = setTimeout(() => {
          setIsVerifying(false); // <-- Baru set 'false' setelah 2 detik
        }, 500);
      }
    };

    checkAuth();
    window.addEventListener('pageshow', checkAuth);

    return () => {
      window.removeEventListener('pageshow', checkAuth);
    };

  }, [navigate]);

  const [chartData, setChartData] = useState([
    { name: 'Selesai', value: 45, color: '#3B82F6' },
    { name: 'Berlangsung', value: 25, color: '#F97316' },
    { name: 'Dijadwalkan', value: 20, color: '#14B8A6' },
    { name: 'Dibatalkan', value: 10, color: '#EF4444' }
  ]);

  const handleAuthError = () => {
    console.log("Token tidak valid atau expired. Logout...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true }); // Redirect ke login
  };

  const fetchSessionHistory = async () => {
    if (!token) {
      console.log('❌ Belum ada token, skip fetch');
      setLoadingSessions(false); // PENTING: Set false agar tidak loading forever
      return;
    }

    try {
      console.log('🔍 Fetching sessions with token:', token.substring(0, 20) + '...');
      const res = await fetch(`http://localhost:3000/api/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', res.status);
      
      if (res.status === 401 || res.status === 403) {
        return handleAuthError();
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Response error:', errorData);
        throw new Error(errorData.message || 'Gagal mengambil riwayat sesi');
      }

      const data = await res.json();
      console.log('📋 Session History Response:', data);

      // Backend return: { success: true, data: [...] }
      const sessions = data?.data || [];
      console.log('📋 Sessions array:', sessions);

      // mapping ke pasien unik
      const uniquePatients = Array.from(new Map(
        sessions.map(s => [s.patient_id, {
          id: s.patient_id,
          name: s.patient_name,
          image: s.patient_image,
          lastSession: s.session_date || s.start_time,
          status: s.status
        }])
      ).values());

      console.log('👥 Unique Patients:', uniquePatients);
      setSessionPatients(uniquePatients);
    } catch (err) {
      console.error('❌ Error fetching sessions:', err);
      alert('Gagal memuat riwayat sesi: ' + err.message);
    } finally {
      setLoadingSessions(false); // PENTING: Selalu set false
    }
  };

// Panggil fetch session history pas component mount atau user_id berubah

  const fetchPatients = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/patients', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.status === 401 || res.status === 403) return handleAuthError();

        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        const mappedPatients = data.map(p => ({
          id: p.patient_id,   // sesuaikan dengan nama kolom di backend
          name: p.patient_name,       // sesuaikan dengan nama kolom di backend
          image: p.profile_image || null
        }));
        setPatients(mappedPatients);
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setLoadingPatients(false);
      }
    };

  useEffect(() => {
    if (token) {
      fetchSessionHistory();
      fetchPatients();
    }
  }, [token]);

  const handleDetailClick = (patient) => {
    console.log('Detail clicked:', patient);
    navigate(`/profile/${patient.id}`, {
      state: {
        patient: patient,
      }
    });
  };

  const handleReportClick = (patient) => {
    console.log('Report clicked:', patient);
    navigate(`/report/${patient.id}`, {
      state: {
        patient: patient,
      }
    });
  };

  const handleStartSession = (patient) => {
    console.log('Mulai sesi dengan:', patient.name);
    navigate(`/profile/${patient.id}`, {
      state: {
        patientId: patient.id,
        patient: patient,
      }
    });
  };

  const handleSaveScenario = async (patientData) => {
  try {
    const response = await fetch('http://localhost:3000/api/patients', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(patientData)
    });

    const result = await response.json();
    if (response.status === 401 || response.status === 403) return handleAuthError();

    if (response.ok) {
      alert('Pasien berhasil ditambahkan!');
      fetchPatients();
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal menambahkan pasien');
  }
};

  if (isVerifying) {
    return;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl space-y-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          Selamat Datang, {user?.username}!
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-start">
          <DiagramCard chartData={chartData} setChartData={setChartData} />

          <Card span={2} className="sm:p-4 lg:p-5 min-h-[80px] flex flex-col">
            <CardHeader 
              title="Mulai Sesi" 
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
            <SessionPatientList
              patients={patients}
              onStartSession={handleStartSession}
            />
          </Card>

          <Card span={3} className="sm:p-4 lg:p-5">
            <CardHeader title="Riwayat Sesi" />
            {loadingSessions ? (
              <div className="text-white text-center py-4">Loading...</div>
            ) : (
              <PatientList
                patients={sessionPatients}
                onDetailClick={handleDetailClick}
                onReportClick={handleReportClick}
              />
            )}
          </Card>
        </div>
      </div>
      <AddScenarioModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveScenario}
      />
    </div>
  );
}