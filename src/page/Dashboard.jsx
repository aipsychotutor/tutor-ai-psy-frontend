import { useState } from 'react';
import { useLocation } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

// Button Component
function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) {
  const baseClass = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus-visible:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 focus-visible:ring-gray-500',
    ghost: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus-visible:ring-indigo-500',
    link: 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 focus-visible:ring-indigo-500'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs sm:text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
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
  const [patients] = useState([
    { id: 1, name: 'Pasien A', image: null },
    { id: 2, name: 'Pasien B', image: null },
    { id: 3, name: 'Pasien C', image: null },
    { id: 4, name: 'Pasien C', image: null },
    { id: 5, name: 'Pasien D', image: null },
    { id: 6, name: 'Pasien H', image: null },
    { id: 7, name: 'Pasien I', image: null },
    { id: 8, name: 'Pasien J', image: null },
    { id: 9, name: 'Pasien K', image: null },
    { id: 10, name: 'Pasien L', image: null }
  ]);

  const [chartData, setChartData] = useState([
    { name: 'Selesai', value: 45, color: '#3B82F6' },
    { name: 'Berlangsung', value: 25, color: '#F97316' },
    { name: 'Dijadwalkan', value: 20, color: '#14B8A6' },
    { name: 'Dibatalkan', value: 10, color: '#EF4444' }
  ]);

  const handleDetailClick = (patient) => {
    console.log('Detail clicked:', patient);
  };

  const handleReportClick = (patient) => {
    console.log('Report clicked:', patient);
  };

  const handleStartSession = () => {
    console.log('Start new session');
  };

  const location = useLocation();
  const {nama} = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl space-y-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          Selamat Datang, {nama}!
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-start">
          <DiagramCard chartData={chartData} setChartData={setChartData} />

          <Card span={2} className="sm:p-4 lg:p-5 min-h-[80px] flex flex-col">
            <CardHeader title="Mulai Sesi" />
            <SessionPatientList
              patients={patients}
              onStartSession={(p) => console.log('Mulai sesi dengan:', p.name)}
            />
          </Card>

          <Card span={3} className="sm:p-4 lg:p-5">
            <CardHeader title="Riwayat Sesi" />
            <PatientList
              patients={patients}
              onDetailClick={handleDetailClick}
              onReportClick={handleReportClick}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}