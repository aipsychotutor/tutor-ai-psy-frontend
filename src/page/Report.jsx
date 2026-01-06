import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
import { toZonedTime  } from "date-fns-tz";
import { id as localeID } from "date-fns/locale";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
} from "chart.js";
import 'chartjs-adapter-date-fns';

import { 
  Heart, 
  MessageCircleQuestion, 
  Activity, 
  Sparkles, 
  Quote, 
  Calendar, 
  Clock,
  Search,
  Mic,
  Zap,
  PauseCircle,
  TrendingUp,
  Lightbulb,
  Smile
} from "lucide-react";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
);

/**
 * ============================================================================
 * GLOBAL HELPERS
 * ============================================================================
 */
const formatSmartTime = (dateStr, type = "time") => {
  if (!dateStr) return "-";
  try {
    // Tambahkan 'Z' jika string dari database tidak punya info timezone agar dianggap UTC
    let sanitizedDateStr = dateStr;
    if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
      sanitizedDateStr = `${dateStr}Z`;
    }

    const date = new Date(sanitizedDateStr);
    if (isNaN(date.getTime())) return "-";

    // 1. Jika hanya butuh TANGGAL
    if (type === "date") {
      return format(date, "d MMMM yyyy", { locale: localeID });
    }

    // 2. Jika butuh WAKTU (dengan konversi GMT ke WIB/WITA/WIT)
    const timeStr = format(date, "HH:mm", { locale: localeID });
    
    const timezoneOffset = new Intl.DateTimeFormat('id-ID', {
      timeZoneName: 'short'
    }).formatToParts(date).find(part => part.type === 'timeZoneName').value;

    // Mapping manual dari GMT ke istilah Indonesia
    const tzMapping = {
      'GMT+7': 'WIB',
      'GMT+8': 'WITA',
      'GMT+9': 'WIT',
      'UTC+7': 'WIB',
      'UTC+8': 'WITA',
      'UTC+9': 'WIT'
    };

    const finalTz = tzMapping[timezoneOffset] || timezoneOffset;

    return `${timeStr} ${finalTz}`;
  } catch (error) {
    return "-";
  }
};

/**
 * ============================================================================
 * HELPER UI COMPONENTS
 * ============================================================================
 */

function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      "bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20",
    secondary:
      "bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200",
    danger:
      "bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost:
      "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2.5 rounded-full font-medium transition-all active:scale-95 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`backdrop-blur-md rounded-3xl p-6 shadow-xl bg-white/90 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/50 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

const getProsodyTheme = (type, status) => {
  const s = status?.toLowerCase() || "";

  if (type === "intonation") {
    if (s.includes("monoton") || s.includes("datar")) return "warning";
    if (s.includes("ekspresif") || s.includes("dinamis")) return "neutral";
    return "success";
  }
  if (type === "speed") {
    if (s.includes("tergesa")) return "danger";
    if (s.includes("lambat")) return "warning";
    return "success";
  }
  if (type === "confidence") {
    if (s.includes("ragu") || s.includes("jeda")) return "danger";
    return "success";
  }
  return "neutral";
};

function VocalAnalysisCard({
  label,
  status,
  insight,
  average,
  unit,
  icon: Icon,
  colorTheme,
}) {
  const themes = {
    success: {
      bgIcon:
        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      textStatus: "text-green-700 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
      gradient:
        "from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10",
    },
    warning: {
      bgIcon:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
      textStatus: "text-yellow-700 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-800",
      gradient:
        "from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10",
    },
    danger: {
      bgIcon: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      textStatus: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      gradient:
        "from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10",
    },
    neutral: {
      bgIcon:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      textStatus: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      gradient:
        "from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10",
    },
  };

  const theme = themes[colorTheme] || themes.neutral;

  return (
    <div
      className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all group ${theme.border}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-50`}
      ></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2.5 rounded-xl ${theme.bgIcon}`}>
            {Icon && <Icon size={20} />}
          </div>
          {/* Menampilkan Rata-rata di pojok kanan atas */}
          {average && (
            <div className="text-right">
              <span className="block text-lg font-bold text-gray-700 dark:text-gray-200 font-mono tracking-tight">
                {average}
              </span>
              <span className="text-[10px] text-gray-400 uppercase font-bold">
                {unit}
              </span>
            </div>
          )}
        </div>

        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">
          {label}
        </h3>

        <div className={`text-lg font-bold mb-3 ${theme.textStatus}`}>
          {status}
        </div>

        <div className="bg-white/60 dark:bg-gray-900/40 p-3 rounded-xl border border-white/50 dark:border-gray-700/50 backdrop-blur-sm">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  maxValue,
  icon: Icon,
  colorClass,
  gradient,
}) {
  const safeValue = Number(value) || 0;
  const safeMax = Number(maxValue) || 100;
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${colorClass} group-hover:scale-110 transition-transform duration-500`}
      ></div>

      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10 text-white`}
        >
          {Icon && (
            <Icon size={20} className={colorClass.replace("bg-", "text-")} />
          )}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Skor
        </span>
      </div>

      <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">
        {label}
      </h3>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {safeValue}
        </span>
        <span className="text-sm text-gray-400">/ {safeMax}</span>
      </div>

      <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${gradient} shadow-[0_0_10px_rgba(0,0,0,0.1)] transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function AnalysisPointCard({ type, items }) {
  const isStrength = type === "strength";
  const title = isStrength ? "Kekuatan Teridentifikasi" : "Area Pengembangan";
  const Icon = isStrength ? TrendingUp : Lightbulb;

  const styles = isStrength
    ? {
        bg: "bg-emerald-50 dark:bg-emerald-900/10",
        border: "border-emerald-100 dark:border-emerald-800",
        iconBg:
          "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        title: "text-emerald-800 dark:text-emerald-200",
        bullet: "bg-emerald-500",
      }
    : {
        bg: "bg-amber-50 dark:bg-amber-900/10",
        border: "border-amber-100 dark:border-amber-800",
        iconBg:
          "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        title: "text-amber-800 dark:text-amber-200",
        bullet: "bg-amber-500",
      };

  const listItems = Array.isArray(items) ? items : [];

  if (listItems.length === 0) return null;

  return (
    <div
      className={`rounded-2xl p-6 border ${styles.bg} ${styles.border} h-full transition-all hover:shadow-md`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2.5 rounded-xl shadow-sm ${styles.iconBg}`}>
          <Icon size={20} />
        </div>
        <h3 className={`font-bold text-lg tracking-tight ${styles.title}`}>
          {title}
        </h3>
      </div>

      <ul className="space-y-3">
        {listItems.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span
              className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.bullet}`}
            />
            <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function CategoryDetailModal({ category, items, type }) {
  const getCategoryColor = (cat, itemType) => {
    if (itemType === "question") {
      const colors = {
        Terbuka: "text-green-600",
        Sugestif: "text-orange-600",
        Tertutup: "text-blue-600",
        Reflektif: "text-purple-600",
      };
      return colors[cat] || "text-gray-600";
    } else {
      const colors = {
        Empatik: "text-green-600",
        Netral: "text-blue-600",
        Judgemental: "text-red-600",
      };
      return colors[cat] || "text-gray-600";
    }
  };

  return (
    <div>
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
        <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg text-blue-600 dark:text-blue-200">
          <Search size={20} />
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Menampilkan {items.length} pesan dalam kategori{" "}
          <span className="font-bold">"{category}"</span>
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
              className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md mt-1 min-w-[2rem] text-center">
                  #{idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-200 mb-2 italic leading-relaxed">
                    "{item.text}"
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${getCategoryColor(
                        type === "question"
                          ? item.question_type?.label
                          : item.empathy_level?.label,
                        type
                      )}`}
                    >
                      {type === "question"
                        ? item.question_type?.label
                        : item.empathy_level?.label || "-"}
                    </span>
                    <span className="text-xs text-gray-400">
                      Confidence:{" "}
                      {(
                        (type === "question"
                          ? item.question_type?.confidence
                          : item.empathy_level?.confidence) * 100
                      ).toFixed(0)}
                      %
                    </span>
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

function ModelAnalysisStats({ detailedAnalysis, classificationResults }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    category: "",
    items: [],
    type: "",
  });

  if (!detailedAnalysis || !detailedAnalysis.model_statistics) return null;

  const stats = detailedAnalysis.model_statistics;
  const hasQuestions = detailedAnalysis.has_questions !== false;

  const openCategoryModal = (category, type) => {
    let items = [];
    if (type === "question") {
      items = classificationResults.filter(
        (item) =>
          item.question_type?.label === category && item.type === "question"
      );
    } else {
      items = classificationResults.filter(
        (item) => item.empathy_level?.label === category
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
          subtitle="Statistik mendalam dari performa sesi ini"
        />

        {/* Distribusi Pertanyaan */}
        {hasQuestions && stats.question_distribution && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 ml-1">
              Distribusi Pertanyaan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(stats.question_distribution).map(
                ([type, count]) => (
                  <button
                    key={type}
                    onClick={() => openCategoryModal(type, "question")}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="text-3xl font-extrabold text-gray-800 dark:text-white mb-1 group-hover:text-teal-500 transition-colors">
                      {count}
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {type}
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Distribusi Empati */}
        {stats.empathy_distribution && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 ml-1">
              Tingkat Empati
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.empathy_distribution).map(
                ([level, count]) => {
                  const colors = {
                    Empatik:
                      "hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20",
                    Netral:
                      "hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                    Judgemental:
                      "hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
                  };
                  return (
                    <button
                      key={level}
                      onClick={() => openCategoryModal(level, "empathy")}
                      className={`bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group ${colors[level]}`}
                    >
                      <div className="text-3xl font-extrabold text-gray-800 dark:text-white mb-1">
                        {count}
                      </div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {level}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Detail: ${modalData.category}`}
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

function ExpressionLineChart({ data }) {
  const expressionMap = {
    neutral: 0,
    happy: 1,
    angry: 2,
    sad: 3,
    surprise: 4,
    fear: 5,
    disgust: 6
  };

  const expressionColors = {
    neutral: '#94a3b8',
    happy: '#22c55e',
    angry: '#ef4444',
    sad: '#3b82f6',
    surprise: '#f59e0b',
    fear: '#8b5cf6',
    disgust: '#06b6d4'
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3 inline-block">
          <Smile size={32} className="text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">
          Tidak ada data ekspresi wajah yang tersedia untuk sesi ini.
        </p>
      </div>
    );
  }

  const timestamps = data.map(item => new Date(item.timestamp));
  const expressions = data.map(item => expressionMap[item.expression?.toLowerCase()] ?? 0);

  const chartData = {
    labels: timestamps,
    datasets: [
      {
        label: "Ekspresi Wajah Pasien",
        data: expressions,
        fill: false,
        borderColor: "rgba(20,184,166,1)",
        backgroundColor: "rgba(20,184,166,0.1)",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: data.map(item => 
          expressionColors[item.expression?.toLowerCase()] || '#94a3b8'
        ),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const minWidth = Math.max(800, data.length * 50);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            const timestamp = tooltipItems[0].parsed.x;
            const date = new Date(timestamp);

            if (isNaN(date.getTime())) {
              return 'Waktu tidak tersedia';
            }
            
            return date.toLocaleString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            });
          },
          label: (tooltipItem) => {
            const value = tooltipItem.raw;
            const expression = Object.keys(expressionMap).find(key => expressionMap[key] === value);
            const expressionLabels = {
              neutral: 'Netral',
              happy: 'Bahagia',
              angry: 'Marah',
              sad: 'Sedih',
              surprise: 'Terkejut',
              fear: 'Takut',
              disgust: 'Jijik'
            };
            return `Ekspresi: ${expressionLabels[expression] || expression}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'second',
          displayFormats: {
            second: 'HH:mm:ss'
          }
        },
        title: {
          display: true,
          text: 'Waktu',
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#64748b'
        },
        ticks: {
          color: '#94a3b8',
          maxRotation: 0,
          minRotation: 0,   
          autoSkip: true,     
          maxTicksLimit: 20   
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      y: {
        beginAtZero: true,
        max: 6,
        title: {
          display: true,
          text: 'Jenis Ekspresi',
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#64748b'
        },
        ticks: {
          stepSize: 1,
          color: '#94a3b8',
          callback: (value) => {
            const labels = ['Netral', 'Bahagia', 'Marah', 'Sedih', 'Terkejut', 'Takut', 'Jijik'];
            return labels[value] || '';
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <>
      <div className="overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
        <div className="h-[400px]" style={{ minWidth: `${minWidth}px` }}>
          <Line data={chartData} options={options} />
        </div>
      </div>
    </>
  );
}

function ChatBubble({ message, isUser }) {
  const fmt = (val) => {
    const num = Number(val);
    return !isNaN(num) ? num.toFixed(2) : "-";
  };

  const fmtPercent = (val) => {
    const num = Number(val);
    return !isNaN(num) ? (num * 100).toFixed(1) : "-";
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 group`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm transition-all hover:shadow-md ${
          isUser
            ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-none"
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>

        {message.prosody && isUser && (
          <div
            className={`mt-3 pt-2 border-t flex flex-wrap gap-4 ${
              isUser
                ? "border-white/20"
                : "border-gray-100 dark:border-gray-700"
            }`}
          >
            {/* 1. Kecepatan Bicara (speaking_rate) */}
            <div className="flex items-center gap-1.5" title="Kecepatan Bicara">
              <Zap
                size={13}
                className={isUser ? "text-teal-100" : "text-gray-400"}
              />
              <div className="flex flex-col leading-none">
                <span
                  className={`text-[10px] font-bold ${
                    isUser ? "text-teal-50" : "text-gray-600"
                  }`}
                >
                  {fmt(message.prosody.speaking_rate)}
                </span>
                <span
                  className={`text-[8px] uppercase ${
                    isUser ? "text-teal-200" : "text-gray-400"
                  }`}
                >
                  Kecepatan Bicara
                </span>
              </div>
            </div>

            {/* 2. Intonasi (energy_std) */}
            <div
              className="flex items-center gap-1.5"
              title="Variasi Intonasi (Energy Std)"
            >
              <Mic
                size={13}
                className={isUser ? "text-teal-100" : "text-gray-400"}
              />
              <div className="flex flex-col leading-none">
                <span
                  className={`text-[10px] font-bold ${
                    isUser ? "text-teal-50" : "text-gray-600"
                  }`}
                >
                  {fmt(message.prosody.energy_std)}
                </span>
                <span
                  className={`text-[8px] uppercase ${
                    isUser ? "text-teal-200" : "text-gray-400"
                  }`}
                >
                  Intonasi
                </span>
              </div>
            </div>

            {/* 3. Jeda/Hening (silence_ratio) */}
            <div
              className="flex items-center gap-1.5"
              title={`Hening: ${fmtPercent(message.prosody.silence_ratio)}% (${
                message.prosody.num_pauses
              } jeda)`}
            >
              <PauseCircle
                size={13}
                className={isUser ? "text-teal-100" : "text-gray-400"}
              />
              <div className="flex flex-col leading-none">
                <span
                  className={`text-[10px] font-bold ${
                    isUser ? "text-teal-50" : "text-gray-600"
                  }`}
                >
                  {fmtPercent(message.prosody.silence_ratio)}%
                </span>
                <span
                  className={`text-[8px] uppercase ${
                    isUser ? "text-teal-200" : "text-gray-400"
                  }`}
                >
                  Hening
                </span>
              </div>
            </div>
          </div>
        )}

        <span className={`text-[10px] mt-2 block text-right opacity-70`}>
          {formatSmartTime(message.timestamp, "time")}
        </span>
      </div>
    </div>
  );
}

function SessionCard({ session, onClick, isSelected }) {
  const dateValue = session.start_time || session.session_date || session.created_at;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-200 mb-3 border ${
        isSelected
          ? "bg-teal-50/80 dark:bg-teal-900/20 border-teal-500 border-2 shadow-sm"
          : "bg-white/40 dark:bg-gray-800/40 border-transparent hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm border-2"
      }`}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-500"></div>
      )}

      <div className="flex items-center justify-between mb-2 pl-2">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <h4 className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
            {formatSmartTime(dateValue, "date")}
          </h4>
        </div>
        <span
          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
            session.status === "completed"
              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
          }`}
        >
          {session.status === "completed" ? "Selesai" : "Aktif"}
        </span>
      </div>
      <div className="flex items-center gap-2 pl-2 text-gray-500 dark:text-gray-400 text-xs">
        <Clock size={12} />
        <span>{formatSmartTime(dateValue, "HH:mm")}</span>
      </div>
    </div>
  );
}

function Loading({ message = "Memuat data..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] w-full animate-in fade-in duration-300">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
        {message}
      </p>
    </div>
  );
}

/**
 * ============================================================================
 * MAIN PAGE COMPONENT (ReportPage)
 * ============================================================================
 */
export default function ReportPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState(null);
  const [classificationResults, setClassificationResults] = useState([]);
  const [prosodyData, setProsodyData] = useState(null);
  const [expressionData, setExpressionData] = useState([]); 
  const [loading, setLoading] = useState(true);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const prosodyAverages = React.useMemo(() => {
    const userMessages = transcripts.filter((t) => t.isUser && t.prosody);

    if (userMessages.length === 0) return null;

    const total = userMessages.reduce(
      (acc, curr) => ({
        speaking_rate:
          acc.speaking_rate + Number(curr.prosody.speaking_rate || 0),
        energy_std: acc.energy_std + Number(curr.prosody.energy_std || 0),
        silence_ratio:
          acc.silence_ratio + Number(curr.prosody.silence_ratio || 0),
      }),
      { speaking_rate: 0, energy_std: 0, silence_ratio: 0 }
    );

    return {
      avg_rate: (total.speaking_rate / userMessages.length).toFixed(1),
      avg_energy: (total.energy_std / userMessages.length).toFixed(3),
      avg_silence: ((total.silence_ratio / userMessages.length) * 100).toFixed(
        1
      ),
    };
  }, [transcripts]);

  const safeJsonParse = (data) => {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return data;
  };

  const fetchSessions = async () => {
    if (!patientId || !token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `http://localhost:3000/api/sessions?patient_id=${patientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 401) return handleLogout();

      const data = await res.json();
      const sessionsData = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      const sortedSessions = sessionsData.sort((a, b) => {
        const dateA = new Date(a.start_time || a.created_at || 0);
        const dateB = new Date(b.start_time || b.created_at || 0);
        return dateB - dateA;
      });

      setSessions(sortedSessions);
      if (sortedSessions.length > 0) {
        const firstCompleted = sortedSessions.find(
          (s) => s.status === "completed"
        );
        handleSessionClick(firstCompleted || sortedSessions[0]);
      }
    } catch (err) {
      setError(err.message);
      toast.error("Gagal mengambil data sesi");
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      const transcriptsData = Array.isArray(data) ? data : [];

      setTranscripts(
        transcriptsData.map((t) => ({
          text: t.message_text,
          isUser: t.message_role === "user",
          timestamp: t.created_at,
          prosody:
            typeof t.prosody_data === "string"
              ? safeJsonParse(t.prosody_data)
              : t.prosody_data,
        }))
      );
    } catch (err) {
      setTranscripts([]);
      toast.error("Gagal memuat transkrip");
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle jika backend return 404 (belum ada evaluasi)
      if (!res.ok) {
         setEvaluation(null);
         setDetailedAnalysis(null);
         setClassificationResults([]);
         setExpressionData([]);
         setLoadingEvaluation(false);
         return;
      }

      const data = await res.json();
      const parsedStats = safeJsonParse(data.model_statistics);

      if (data && parsedStats) {
        setEvaluation(data);

        const parsedClassification = safeJsonParse(data.classification_results);
        const formattedAnalysis = { model_statistics: parsedStats };
        setClassificationResults(
          Array.isArray(parsedClassification) ? parsedClassification : []
        );
        setDetailedAnalysis(formattedAnalysis);
        const parsedProsody = safeJsonParse(data.prosody_summary);
        setProsodyData(parsedProsody);
        const parsedExpression = safeJsonParse(data.expression_data);
        setExpressionData(Array.isArray(parsedExpression) ? parsedExpression : []);
        const evaluationData = {
          ...data,
          strengths:
            typeof data.strengths === "string"
              ? safeJsonParse(data.strengths)
              : data.strengths,
          improvements:
            typeof data.improvements === "string"
              ? safeJsonParse(data.improvements)
              : data.improvements,
        };
        setEvaluation(evaluationData);
      } else {
        setEvaluation(null);
        setDetailedAnalysis(null);
        setClassificationResults([]);
        setProsodyData(null);
        setExpressionData([]);
      }
    } catch (err) {
      setEvaluation(null); 
      setExpressionData([]);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  const handleSessionClick = async (session) => {
    if (!session) return;
    setSelectedSession(session);
    setTranscripts([]);
    setEvaluation(null);
    setDetailedAnalysis(null);
    setClassificationResults([]);
    setExpressionData([]);
    await Promise.all([
      fetchTranscripts(session.session_id),
      fetchEvaluation(session.session_id),
    ]);
  };

  const handleAnalyzeSession = async () => {
    if (!selectedSession) return;
    setAnalyzingSession(true);

    const loadingToast = toast.loading("Sedang menganalisis sesi dengan AI...");

    try {
      const response = await fetch(
        `http://localhost:3000/api/reports/${selectedSession.session_id}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      toast.dismiss(loadingToast);

      if (response.ok && data.success) {
        const evaluationData = {
          ...data.evaluation,
          strengths:
            typeof data.evaluation.strengths === "string"
              ? safeJsonParse(data.evaluation.strengths)
              : data.evaluation.strengths,
          improvements:
            typeof data.evaluation.improvements === "string"
              ? safeJsonParse(data.evaluation.improvements)
              : data.evaluation.improvements,
        };
        setEvaluation(data.evaluation);
        setDetailedAnalysis(data.detailed_analysis);
        setClassificationResults(data.classification_results || []);
        const parsedProsody = safeJsonParse(data.evaluation.prosody_summary);
        setProsodyData(parsedProsody);
        const parsedExpression = safeJsonParse(data.evaluation.expression_data);
        setExpressionData(Array.isArray(parsedExpression) ? parsedExpression : []);
        toast.success("Analisis AI Berhasil Selesai!", { duration: 4000 });
      } else {
        toast.error(
          `Analisis Gagal: ${data.message || "Error tidak diketahui"}`
        );
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan jaringan saat analisis");
    } finally {
      setAnalyzingSession(false);
    }
  };

  useEffect(() => {
    if (patientId && token) fetchSessions();
  }, [patientId, token]);

  const handleBack = () => navigate("/dashboard");

  if (loading)
    return (
      <div className="h-full w-full bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd flex items-center justify-center">
        <Loading message="Menyiapkan Laporan..." />
      </div>
    );

  // ========== SYMPTOM INTENSITY CATEGORIZATION ==========
  const symptomIntensity = parseInt(sessions[0].symptom_intensity) || 0;

  let symptom_intensity_tag = "";
  let symptom_intensity_tag_color = "";

  if (symptomIntensity <= 3) {
    symptom_intensity_tag = "Mild";
    symptom_intensity_tag_color = "bg-green-100 text-green-800";
  } else if (symptomIntensity <= 6) {
    symptom_intensity_tag = "Moderate";
    symptom_intensity_tag_color = "bg-yellow-100 text-yellow-800";
  } else if (symptomIntensity <= 8) {
    symptom_intensity_tag = "Mod-Severe";
    symptom_intensity_tag_color = "bg-orange-100 text-orange-800";
  } else {
    symptom_intensity_tag = "Severe";
    symptom_intensity_tag_color = "bg-red-100 text-red-800";
  }

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto bg-gradient-to-b from-dashboardStart via-dashboardMid to-dashboardEnd">
      <Toaster position="top-center" reverseOrder={false} />

      <Navbar user={user} onLogout={handleLogout} isSimulation={false} />

      <div className="flex-grow pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                Laporan Sesi
              </h1>
              <span className="text-white/80 text-lg flex items-center justify-center gap-2">
                Pasien:{" "}
                <span className="font-semibold text-white">
                  {sessions.length > 0 ? sessions[0].patient_name : "..."}
                </span>
                <span
                  className={`inline-block ${symptom_intensity_tag_color} text-xs font-semibold px-2.5 py-0.5 rounded-full`}
                >
                  {sessions.length > 0 ? symptom_intensity_tag : ""}
                </span>
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={handleBack}
              className="shadow-lg border-none"
            >
              ← Kembali
            </Button>
          </div>

          {error ? (
            <Card className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-500 mb-2">
                Gagal Memuat Data
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={fetchSessions}>Coba Lagi</Button>
            </Card>
          ) : sessions.length === 0 ? (
            <Card className="text-center py-16">
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                Belum Ada Sesi
              </h2>
              <p className="text-gray-500">
                Anda belum melakukan sesi konseling dengan pasien ini.
              </p>
            </Card>
          ) : (
            <>
              {/* SECTION 1: SCORE EMPATI & TEKNIK BERTANYA*/}
              <Card className="mb-8 min-h-[300px] flex flex-col justify-center">
                <CardHeader
                  title="Penilaian & Evaluasi"
                  subtitle={
                    selectedSession
                      ? selectedSession.status === "completed"
                        ? "Hasil analisis untuk sesi ini"
                        : "Sesi belum selesai"
                      : "Pilih sesi"
                  }
                  action={
                    selectedSession?.status === "completed" &&
                    !evaluation &&
                    !loadingEvaluation && (
                      <Button
                        onClick={handleAnalyzeSession}
                        disabled={analyzingSession}
                      >
                        {analyzingSession ? (
                          <span className="flex items-center gap-2">
                            <Sparkles className="animate-spin" size={16} />{" "}
                            Menganalisis...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Sparkles size={16} /> Jalankan Analisis AI
                          </span>
                        )}
                      </Button>
                    )
                  }
                />

                {loadingEvaluation ? (
                  <div className="flex-grow flex items-center justify-center">
                    <Loading message="Sedang memuat hasil evaluasi..." />
                  </div>
                ) : evaluation ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                      <ScoreCard
                        label="Empati"
                        value={evaluation.empathy_score}
                        maxValue={100}
                        icon={Heart}
                        colorClass="bg-pink-500 text-pink-500"
                        gradient="bg-gradient-to-r from-pink-400 to-rose-500"
                      />
                      <ScoreCard
                        label="Teknik Bertanya"
                        value={evaluation.question_score}
                        maxValue={100}
                        icon={MessageCircleQuestion}
                        colorClass="bg-blue-500 text-blue-500"
                        gradient="bg-gradient-to-r from-blue-400 to-indigo-500"
                      />
                      <ScoreCard
                        label="Skor Keseluruhan"
                        value={Math.round(
                          (evaluation.empathy_score +
                            evaluation.question_score) /
                            2
                        )}
                        maxValue={100}
                        icon={Activity}
                        colorClass="bg-teal-500 text-teal-500"
                        gradient="bg-gradient-to-r from-teal-400 to-emerald-500"
                      />
                    </div>

                    {/* SECTION 2: ANALISIS VOKAL */}
                    {prosodyData && prosodyData.has_data && (
                      <div className="mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-6 w-1 bg-teal-500 rounded-full"></div>
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Analisis Suara
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {/* 1. Intonasi */}
                          <VocalAnalysisCard
                            label="Gaya Intonasi"
                            status={prosodyData.details.intonation}
                            average={prosodyAverages?.avg_energy}
                            unit="Variasi"
                            insight={
                              prosodyData.details.intonation.includes("Datar")
                                ? "Variasi nada rendah, berisiko terdengar seperti robot."
                                : prosodyData.details.intonation.includes(
                                    "Dinamis"
                                  )
                                ? "Variasi nada tinggi, menunjukkan emosi aktif."
                                : "Variasi nada cukup baik dan terkontrol."
                            }
                            icon={Mic}
                            colorTheme={getProsodyTheme(
                              "intonation",
                              prosodyData.details.intonation
                            )}
                          />

                          {/* 2. Kecepatan */}
                          <VocalAnalysisCard
                            label="Kecepatan Bicara"
                            status={prosodyData.details.speed}
                            // TAMBAHAN: AVERAGE
                            average={prosodyAverages?.avg_rate}
                            unit="Kata/Detik"
                            insight={
                              prosodyData.details.speed.includes("Tergesa")
                                ? "Kecepatan tinggi, pasien mungkin merasa diburu-buru."
                                : prosodyData.details.speed.includes("Lambat")
                                ? "Tempo sangat lambat, mungkin terlalu hati-hati."
                                : "Tempo bicara pas dan tenang."
                            }
                            icon={Zap}
                            colorTheme={getProsodyTheme(
                              "speed",
                              prosodyData.details.speed
                            )}
                          />

                          {/* 3. Keyakinan */}
                          <VocalAnalysisCard
                            label="Kelancaran & Keyakinan"
                            status={prosodyData.details.confidence}
                            // TAMBAHAN: AVERAGE
                            average={prosodyAverages?.avg_silence}
                            unit="% Hening"
                            insight={
                              prosodyData.details.confidence.includes("Ragu")
                                ? "Terdeteksi banyak jeda hening (silence) yang lama."
                                : "Alur bicara lancar dengan jeda yang wajar."
                            }
                            icon={PauseCircle}
                            colorTheme={getProsodyTheme(
                              "confidence",
                              prosodyData.details.confidence
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION 3: FEEDBACK GEMINI */}
                    {evaluation.feedback_text && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50 shadow-inner mt-5">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <Quote size={20} className="fill-current" /> Umpan
                          Balik AI
                        </h3>
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
                          {evaluation.feedback_text}
                        </div>
                      </div>
                    )}

                    {evaluation &&
                      (evaluation.strengths || evaluation.improvements) && (
                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                          <AnalysisPointCard
                            type="strength"
                            items={evaluation.strengths}
                          />
                          <AnalysisPointCard
                            type="improvement"
                            items={evaluation.improvements}
                          />
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex-grow flex flex-col justify-center items-center">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3">
                      <Sparkles size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      {selectedSession?.status === "completed"
                        ? "Analisis AI belum dijalankan untuk sesi ini."
                        : "Sesi ini belum selesai, analisis tidak tersedia."}
                    </p>
                  </div>
                )}
              </Card>

              {/* SECTION 4: HASIL KLASIFIKASI */}
              {detailedAnalysis && classificationResults.length > 0 && (
                <ModelAnalysisStats
                  detailedAnalysis={detailedAnalysis}
                  classificationResults={classificationResults}
                />
              )}

              {expressionData && expressionData.length > 0 && (
              <Card className="mb-6">
                <CardHeader 
                  title={
                    <span className="flex items-center gap-2">
                      <Smile size={24} className="text-teal-500" />
                      Perubahan Ekspresi Wajah Psikolog Sepanjang Waktu
                    </span>
                  }
                  subtitle="Grafik menunjukkan perubahan emosi psikolog berdasarkan deteksi ekspresi wajah"
                />
                <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                  {expressionData.length > 15 && (
                    <div className="mb-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      <span className="font-medium">Scroll horizontal untuk melihat seluruh data</span>
                    </div>
                  )}
                  <ExpressionLineChart data={expressionData} />
                </div>
                
                {/* Legend Ekspresi */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { name: 'Netral', color: '#94a3b8' },
                    { name: 'Bahagia', color: '#22c55e' },
                    { name: 'Marah', color: '#ef4444' },
                    { name: 'Sedih', color: '#3b82f6' },
                    { name: 'Terkejut', color: '#f59e0b' },
                    { name: 'Takut', color: '#8b5cf6' },
                    { name: 'Jijik', color: '#06b6d4' }
                  ].map((exp) => (
                    <div key={exp.name} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/30 px-3 py-2 rounded-lg">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: exp.color }}
                      />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {exp.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

              {/* SECTION 5: HISTORY & CHAT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
                <div className="lg:col-span-4">
                  <Card className="h-full max-h-[700px] flex flex-col">
                    <CardHeader
                      title="Riwayat Sesi"
                      subtitle={`${sessions.length} sesi tercatat`}
                    />
                    <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                      {sessions.map((s) => (
                        <SessionCard
                          key={s.session_id || s.id}
                          session={s}
                          onClick={() => handleSessionClick(s)}
                          isSelected={
                            selectedSession?.session_id === s.session_id
                          }
                        />
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-8">
                  <Card className="h-full min-h-[600px] flex flex-col">
                    <CardHeader
                      title="Transkrip Percakapan"
                      subtitle={
                        selectedSession
                        ? `Sesi ${formatSmartTime(selectedSession.start_time || selectedSession.created_at, "date")}`
                        : ""
                      }
                    />
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 overflow-y-auto border border-gray-100 dark:border-gray-700/50 custom-scrollbar max-h-[550px]">
                      {loadingTranscripts ? (
                        <Loading message="Mengambil transkrip..." />
                      ) : transcripts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <p>Tidak ada transkrip.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {transcripts.map((msg, idx) => (
                            <ChatBubble
                              key={idx}
                              message={msg}
                              isUser={msg.isUser}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
